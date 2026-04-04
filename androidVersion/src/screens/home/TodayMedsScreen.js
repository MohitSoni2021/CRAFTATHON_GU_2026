import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Alert,
  Modal,
  TextInput,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { getTodayDosesService, markDoseAsTakenService } from '../../services/medicationService';
import { getAdherenceScoreService } from '../../services/adherenceService';
import { useAuthStore } from '../../store/authStore';
import { cancelAllMedicationNotifications, scheduleMedicationReminder } from '../../services/localNotificationService';

const TIME_RANGES = [
  { key: 'Morning', start: 5, end: 12 },
  { key: 'Afternoon', start: 12, end: 17 },
  { key: 'Evening', start: 17, end: 22 },
];

function getPeriod(date) {
  const hour = date.getHours();
  const found = TIME_RANGES.find((range) => hour >= range.start && hour < range.end);
  return found ? found.key : 'Other';
}

function formatCountdown(targetTime) {
  const diff = targetTime - Date.now();
  if (diff <= 0) return '00m 00s';
  const totalSeconds = Math.floor(diff / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
}

const DoseCard = ({ dose, isNext, onMarkTaken, onLongPress, isTaking }) => {
  const scheduledTime = typeof dose.scheduledTime === 'string' ? parseISO(dose.scheduledTime) : new Date(dose.scheduledTime);

  return (
    <View className={`mb-3 rounded-3xl border p-5 shadow-sm ${dose.status === 'taken' ? 'border-emerald-200 bg-emerald-50' : 'border-slate-100 bg-white'}`}>
      <Pressable
        onPress={() => !isTaking && dose.status !== 'taken' && onMarkTaken(dose)}
        onLongPress={() => onLongPress(dose)}
        delayLongPress={500}
        android_ripple={{ color: '#e5e7eb' }}
        className="flex-row items-center"
      >
        <View className="mr-4">
          <View className={`w-14 h-14 rounded-full border-2 items-center justify-center ${dose.status === 'taken' ? 'border-emerald-500 bg-emerald-100' : 'border-slate-200 bg-white'}`}>
            {isTaking ? (
              <ActivityIndicator size="small" color="#f59e0b" />
            ) : (
              <Ionicons
                name={dose.status === 'taken' ? 'checkmark-circle' : 'ellipse-outline'}
                size={28}
                color={dose.status === 'taken' ? '#059669' : '#64748b'}
              />
            )}
          </View>
        </View>

        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <Text className={`text-lg font-bold ${dose.status === 'taken' ? 'text-slate-500 line-through decoration-slate-400' : 'text-slate-800'}`}>
              {dose.medicationName || 'Medication'}
            </Text>
            {isNext && (
              <View className="bg-amber-100 px-3 py-1 rounded-full">
                <Text className="text-amber-800 font-bold text-xs">Next Dose</Text>
              </View>
            )}
          </View>

          <Text className={`text-sm ${dose.status === 'taken' ? 'text-slate-500 line-through' : 'text-slate-400'}`}>
            {dose.dosage} • {format(scheduledTime, 'h:mm a')}
          </Text>
          {dose.note ? (
            <Text className="text-xs text-slate-400 mt-1">Note: {dose.note}</Text>
          ) : null}
        </View>

        {isNext && (
          <View className="items-end">
            <Text className="text-xs font-semibold text-cyan-700">{dose.status === 'pending' ? 'Upcoming' : 'Next'}</Text>
          </View>
        )}
      </Pressable>
    </View>
  );
};

export default function TodayMedsScreen({ navigation }) {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [todayDoses, setTodayDoses] = useState([]);
  const [scoreData, setScoreData] = useState({ score: 0, currentStreak: 0 });
  const [takingId, setTakingId] = useState(null);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [activeDose, setActiveDose] = useState(null);
  const [countdownText, setCountdownText] = useState('');

  const fetchData = async () => {
    try {
      if (!refreshing) setLoading(true);
      const [dosesRes, scoreRes] = await Promise.all([
        getTodayDosesService(),
        getAdherenceScoreService(),
      ]);

      if (dosesRes.success) setTodayDoses(dosesRes.data || []);
      if (scoreRes.success) setScoreData(scoreRes.data || { score: 0, currentStreak: 0 });
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const scheduleTodayDoseNotifications = useCallback(async (doses) => {
    await cancelAllMedicationNotifications();
    const now = new Date();

    await Promise.all(
      doses
        .filter((dose) => dose.status !== 'taken')
        .map((dose) => {
          const scheduledDate = new Date(dose.scheduledTime);
          return scheduledDate > now ? scheduleMedicationReminder(dose) : null;
        })
    );
  }, []);

  useEffect(() => {
    if (!loading && todayDoses.length > 0) {
      scheduleTodayDoseNotifications(todayDoses);
    }
  }, [loading, todayDoses, scheduleTodayDoseNotifications]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  const handleMarkTaken = async (dose) => {
    const uid = `${dose.medicationId}_${dose.scheduledTime}`;
    if (dose.status === 'taken') return;
    setTakingId(uid);

    setTodayDoses((prev) =>
      prev.map((d) =>
        d.medicationId === dose.medicationId && d.scheduledTime === dose.scheduledTime
          ? { ...d, status: 'taken', takenAt: new Date().toISOString() }
          : d
      )
    );

    try {
      const res = await markDoseAsTakenService({ medicationId: dose.medicationId, scheduledAt: dose.scheduledTime });
      if (res.success) {
        const sRes = await getAdherenceScoreService();
        if (sRes.success) setScoreData(sRes.data || scoreData);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to update dose status');
      fetchData();
    } finally {
      setTakingId(null);
    }
  };

  const openNoteModal = (dose) => {
    setActiveDose(dose);
    setNoteText(dose.note || '');
    setNoteModalVisible(true);
  };

  const saveNote = () => {
    if (!activeDose) return;
    setTodayDoses((prev) =>
      prev.map((d) =>
        d.medicationId === activeDose.medicationId && d.scheduledTime === activeDose.scheduledTime
          ? { ...d, note: noteText }
          : d
      )
    );
    setNoteModalVisible(false);
    setActiveDose(null);
    setNoteText('');
  };

  const totalCount = todayDoses.length;
  const takenCount = todayDoses.filter((d) => d.status === 'taken').length;
  const pendingCount = todayDoses.filter((d) => d.status === 'pending').length;
  const missedCount = todayDoses.filter((d) => d.status === 'missed').length;
  const allDone = totalCount > 0 && takenCount === totalCount;

  const progress = totalCount > 0 ? (takenCount / totalCount) * 100 : 0;

  const nextDose = useMemo(() => {
    const now = Date.now();
    const candidates = todayDoses
      .filter((d) => d.status !== 'taken')
      .map((d) => ({
        ...d,
        timestamp: new Date(d.scheduledTime).getTime(),
      }))
      .filter((d) => d.timestamp >= now)
      .sort((a, b) => a.timestamp - b.timestamp);
    return candidates[0] || null;
  }, [todayDoses]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!nextDose) {
        setCountdownText('No upcoming doses');
        return;
      }
      setCountdownText(formatCountdown(new Date(nextDose.scheduledTime).getTime()));
    }, 1000);
    return () => clearInterval(interval);
  }, [nextDose]);

  const groupedDoses = useMemo(() => {
    const groups = {
      Morning: [],
      Afternoon: [],
      Evening: [],
      Other: [],
    };
    [...todayDoses]
      .sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime))
      .forEach((dose) => {
        const date = new Date(dose.scheduledTime);
        const period = getPeriod(date);
        groups[period].push(dose);
      });

    return Object.entries(groups).filter(([, list]) => list.length > 0);
  }, [todayDoses]);


  if (loading && !refreshing) {
    return (
      <View className="flex-1 items-center justify-center bg-zinc-50">
        <ActivityIndicator size="large" color="#fbbf24" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-zinc-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <ScrollView
        className="flex-1 px-6 pt-12"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View className="flex-row justify-between items-start mb-6">
          <View>
            <Text className="text-3xl font-extrabold text-slate-800">Today's Meds</Text>
            <Text className="text-slate-400 text-lg font-medium">{format(new Date(), 'EEEE, MMMM d')}</Text>
          </View>
          <View className="flex-row items-center gap-3">
            <View className="flex-row items-center bg-yellow-50 px-3 py-2 rounded-full border border-yellow-100">
              <Ionicons name="flame" size={18} color="#f59e0b" />
              <Text className="text-amber-600 font-bold ml-1">{Math.max(0, scoreData.currentStreak)}d streak</Text>
            </View>
            <TouchableOpacity onPress={onRefresh}>
              <Ionicons name="refresh" size={24} color="#94a3b8" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <View>
              <Text className="text-xs font-bold text-slate-400 tracking-widest uppercase">Today's Progress</Text>
              <Text className="text-2xl font-black text-slate-800">{takenCount} / {totalCount} doses</Text>
            </View>
            <View className="items-end">
              <Text className="text-sm font-semibold text-slate-500">Score</Text>
              <Text className="text-3xl font-black text-slate-800">{scoreData.score}%</Text>
            </View>
          </View>
          <View className="h-3 w-full bg-slate-100 rounded-full overflow-hidden mb-3">
            <View className="h-full bg-emerald-400 rounded-full" style={{ width: `${progress}%` }} />
          </View>
          <View className="flex-row justify-between">
            <Text className="text-xs text-emerald-600">Taken: {takenCount}</Text>
            <Text className="text-xs text-cyan-600">Pending: {pendingCount}</Text>
            <Text className="text-xs text-rose-600">Missed: {missedCount}</Text>
          </View>
        </View>

        {nextDose ? (
          <View className="bg-cyan-50 rounded-2xl p-4 mb-6 border border-cyan-100">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-sm font-bold text-cyan-800">Next Dose</Text>
              <Text className="text-xs font-bold text-cyan-600">{countdownText}</Text>
            </View>
            <Text className="text-lg font-bold text-cyan-700">{nextDose.medicationName || 'Medication'} @ {format(new Date(nextDose.scheduledTime), 'h:mm a')}</Text>
          </View>
        ) : (
          <View className="bg-slate-100 rounded-2xl p-4 mb-6 border border-slate-200">
            <Text className="text-sm text-slate-500">No upcoming doses for now.</Text>
          </View>
        )}

        {allDone && (
          <View className="bg-emerald-100 rounded-2xl p-4 mb-4 border border-emerald-200">
            <Text className="text-lg text-emerald-700 font-bold">All doses completed 🎉</Text>
            <Text className="text-slate-600">Great job! Keep that momentum for your streak.</Text>
          </View>
        )}

        {todayDoses.length === 0 ? (
          <View className="border-2 border-dashed border-slate-200 rounded-[40px] p-12 items-center justify-center">
            <View className="w-24 h-24 bg-white items-center justify-center rounded-3xl mb-6 shadow-sm">
              <Ionicons name="medical" size={48} color="#fbbf24" />
            </View>
            <Text className="text-slate-800 font-black text-2xl mb-2">No doses scheduled</Text>
            <Text className="text-slate-400 text-center font-semibold leading-6">
              Add medications from the Medicine Cabinet to start tracking.
            </Text>
          </View>
        ) : (
          <View className="gap-6">
            {groupedDoses.map(([period, doses]) => (
              <View key={period}>
                <Text className="text-xl font-bold text-slate-700 mb-3">{period}</Text>
                {doses.map((dose) => {
                  const uid = `${dose.medicationId}_${dose.scheduledTime}`;
                  const isTaken = dose.status === 'taken';
                  const isTaking = takingId === uid;
                  const isNext = nextDose && nextDose.medicationId === dose.medicationId && new Date(nextDose.scheduledTime).getTime() === new Date(dose.scheduledTime).getTime();
                  return (
                    <DoseCard
                      key={uid}
                      dose={dose}
                      isNext={isNext}
                      onMarkTaken={handleMarkTaken}
                      onLongPress={openNoteModal}
                      isTaking={isTaking}
                    />
                  );
                })}
              </View>
            ))}
          </View>
        )}

        <View className="h-20" />
      </ScrollView>

      <Modal visible={noteModalVisible} animationType="slide" transparent>
        <View className="flex-1 bg-black/40 justify-end">
          <View className="bg-white p-5 rounded-t-3xl border border-slate-200">
            <Text className="text-lg font-bold mb-3">Add note</Text>
            <TextInput
              value={noteText}
              onChangeText={setNoteText}
              placeholder="Write a note about this dose"
              multiline
              className="h-28 border border-slate-300 rounded-xl p-3 text-slate-700"
            />
            <View className="flex-row justify-end gap-3 mt-4">
              <Pressable onPress={() => setNoteModalVisible(false)} className="px-4 py-2 rounded-lg bg-slate-200">
                <Text className="text-slate-700">Cancel</Text>
              </Pressable>
              <Pressable onPress={saveNote} className="px-4 py-2 rounded-lg bg-emerald-500">
                <Text className="text-white font-bold">Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
