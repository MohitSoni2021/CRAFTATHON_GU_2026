import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { getTodayDosesService, markDoseAsTakenService } from '../../services/medicationService';
import { getAdherenceScoreService } from '../../services/adherenceService';
import { useAuthStore } from '../../store/authStore';
import { Alert } from 'react-native';

export default function TodayMedsScreen({ navigation }) {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [todayDoses, setTodayDoses] = useState([]);
  const [scoreData, setScoreData] = useState({ score: 0 });
  const [takingId, setTakingId] = useState(null);

  const fetchData = async () => {
    try {
      if (!refreshing) setLoading(true);
      const [dosesRes, scoreRes] = await Promise.all([
        getTodayDosesService(),
        getAdherenceScoreService(),
      ]);

      if (dosesRes.success) setTodayDoses(dosesRes.data);
      if (scoreRes.success) setScoreData(scoreRes.data);
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

  const handleMarkTaken = async (log) => {
    const uid = `${log.medicationId}_${log.scheduledTime}`;
    setTakingId(uid);

    // Optimistic update
    setTodayDoses((prev) =>
      prev.map((d) =>
        d.medicationId === log.medicationId && d.scheduledTime === log.scheduledTime
          ? { ...d, status: 'taken', takenAt: new Date().toISOString() }
          : d
      )
    );

    try {
      const res = await markDoseAsTakenService({
        medicationId: log.medicationId,
        scheduledAt: log.scheduledTime,
      });
      if (res.success) {
        // Refresh score
        const sRes = await getAdherenceScoreService();
        if (sRes.success) setScoreData(sRes.data);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to update dose status');
      fetchData(); // Reset on error
    } finally {
      setTakingId(null);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  const takenCount = todayDoses.filter(d => d.status === 'taken').length;
  const pendingCount = todayDoses.filter(d => d.status === 'pending').length;
  const missedCount = todayDoses.filter(d => d.status === 'missed').length;
  const totalCount = todayDoses.length;

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
        {/* Header Section */}
        <View className="flex-row justify-between items-start mb-8">
          <View>
            <Text className="text-3xl font-extrabold text-slate-800">Today's Meds</Text>
            <Text className="text-slate-400 text-lg font-medium">{format(new Date(), 'EEEE, MMMM d')}</Text>
          </View>
          <View className="flex-row items-center gap-3">
            <View className="flex-row items-center bg-yellow-50 px-3 py-2 rounded-full border border-yellow-100">
              <Ionicons name="flame" size={18} color="#f59e0b" />
              <Text className="text-amber-600 font-bold ml-1">5d streak</Text>
            </View>
            <View className="w-2.5 h-2.5 bg-emerald-400 rounded-full" />
            <TouchableOpacity onPress={onRefresh}>
               <Ionicons name="refresh" size={24} color="#94a3b8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress Card */}
        <View className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 mb-8">
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-2">Today's Progress</Text>
              <View className="flex-row items-baseline">
                <Text className="text-4xl font-black text-slate-800">{takenCount}</Text>
                <Text className="text-xl font-bold text-slate-300 ml-1">/ {totalCount} doses</Text>
              </View>
            </View>
            <View className="w-20 h-20 rounded-full border-8 border-zinc-50 items-center justify-center">
               <View className="absolute w-20 h-20 rounded-full border-8 border-amber-400" 
                     style={{ borderTopColor: 'transparent', borderLeftColor: 'transparent', borderRightColor: 'transparent', transform: [{ rotate: '45deg' }] }} />
               <Text className="text-slate-800 font-extrabold text-lg">{scoreData.score}%</Text>
            </View>
          </View>

          <View className="h-[1px] bg-slate-50 w-full mb-6" />

          <View className="flex-row gap-3">
            <View className="flex-1 bg-emerald-50 rounded-2xl p-4 items-center border border-emerald-100">
               <Text className="text-emerald-700 font-black text-2xl">{takenCount}</Text>
               <Text className="text-emerald-600 font-bold text-[10px] tracking-wider uppercase">Taken</Text>
            </View>
            <View className="flex-1 bg-cyan-50 rounded-2xl p-4 items-center border border-cyan-100">
               <Text className="text-cyan-700 font-black text-2xl">{pendingCount}</Text>
               <Text className="text-cyan-600 font-bold text-[10px] tracking-wider uppercase">Pending</Text>
            </View>
            <View className="flex-1 bg-rose-50 rounded-2xl p-4 items-center border border-rose-100">
               <Text className="text-rose-700 font-black text-2xl">{missedCount}</Text>
               <Text className="text-rose-600 font-bold text-[10px] tracking-wider uppercase">Missed</Text>
            </View>
          </View>
        </View>

        {/* List Section / Empty State */}
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
          <View className="gap-4">
             {todayDoses.map((dose) => {
               const uid = `${dose.medicationId}_${dose.scheduledTime}`;
               const isTaken = dose.status === 'taken';
               const isTaking = takingId === uid;
               
               return (
                 <TouchableOpacity 
                   key={uid} 
                   onPress={() => !isTaken && handleMarkTaken(dose)}
                   disabled={isTaken || isTaking}
                   className={`bg-white rounded-3xl p-5 flex-row items-center border border-slate-50 shadow-sm ${isTaken ? 'opacity-60' : ''}`}
                 >
                   <View className={`w-14 h-14 rounded-2xl items-center justify-center mr-4 ${isTaken ? 'bg-emerald-50' : 'bg-slate-50'}`}>
                      {isTaking ? (
                        <ActivityIndicator size="small" color="#fbbf24" />
                      ) : (
                        <Ionicons 
                          name={isTaken ? 'checkmark-circle' : 'time'} 
                          size={28} 
                          color={isTaken ? '#10b981' : '#94a3b8'} 
                        />
                      )}
                   </View>
                   <View className="flex-1">
                     <Text className={`text-slate-800 font-bold text-lg ${isTaken ? 'line-through decoration-slate-400' : ''}`}>{dose.medicationName || 'Medication'}</Text>
                     <Text className="text-slate-400 font-semibold">{dose.dosage} • {format(new Date(dose.scheduledTime), 'h:mm a')}</Text>
                   </View>
                   {!isTaken && !isTaking && (
                     <View className="bg-amber-100 px-4 py-2 rounded-xl">
                        <Text className="text-amber-700 font-bold text-xs">TAKE</Text>
                     </View>
                   )}
                   {isTaken && <Ionicons name="checkmark" size={20} color="#10b981" />}
                 </TouchableOpacity>
               );
             })}
          </View>
        )}
        
        <View className="h-20" />
      </ScrollView>

      {/* Floating Action / Bottom Nav Simulation */}
      <View className="absolute bottom-8 left-6 right-6">
         <TouchableOpacity 
           onPress={() => navigation.navigate('Medications')}
           className="bg-slate-800 rounded-3xl p-6 flex-row items-center justify-between shadow-2xl"
         >
            <View className="flex-row items-center">
              <View className="bg-slate-700 p-2 rounded-xl mr-3">
                 <Ionicons name="flask" size={20} color="white" />
              </View>
              <Text className="text-white font-bold text-lg">Medicine Cabinet</Text>
            </View>
            <Ionicons name="add" size={24} color="white" />
         </TouchableOpacity>
      </View>
    </View>
  );
}
