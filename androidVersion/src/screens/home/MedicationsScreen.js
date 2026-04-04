import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Modal,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { listMedicationsService, createMedicationService } from '../../services/medicationService';
import { getNotificationPermissionStatus, initializeNotificationChannel, requestNotificationPermission, scheduleMedicationReminder } from '../../services/localNotificationService';

const FREQUENCIES = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'As Needed', value: 'custom' },
];

export default function MedicationsScreen({ navigation }) {
  const [meds, setMeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState('loading');

  // Form State
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [unit, setUnit] = useState('pill');
  const [frequency, setFrequency] = useState('daily');
  const [showFrequencyPicker, setShowFrequencyPicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date(new Date().setHours(9, 0, 0, 0)));
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const fetchMeds = async () => {
    try {
      if (!refreshing) setLoading(true);
      const res = await listMedicationsService();
      if (res?.success) {
        setMeds(res.data ?? []);
      } else {
        setMeds([]);
      }
    } catch (e) {
      console.error('Failed to load medications', e);
      setMeds([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMeds();
    const fetchNotificationStatus = async () => {
      const status = await getNotificationPermissionStatus();
      setNotificationStatus(status ?? 'undetermined');
    };

    fetchNotificationStatus();
  }, []);

  const handleNotificationPermission = async () => {
    const granted = await requestNotificationPermission();
    setNotificationStatus(granted ? 'granted' : 'denied');
    if (granted) {
      await initializeNotificationChannel();
    }
  };

  const scheduleReminderForMedication = async (med) => {
    if (!med) return null;

    const now = new Date();
    const scheduleDate = new Date(selectedTime ?? new Date());
    scheduleDate.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());
    if (scheduleDate <= now) {
      scheduleDate.setDate(scheduleDate.getDate() + 1);
    }

    return scheduleMedicationReminder({
      medicationId: med.id || med._id || `med-${Date.now()}`,
      medicationName: med.name ?? 'Medication',
      dosage: `${med.dosage ?? ''} ${med.unit ?? unit}`.trim(),
      scheduledTime: scheduleDate.toISOString(),
      status: 'pending',
    });
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMeds();
  }, []);

  const handleAddMed = async () => {
    if (!name || !dosage) {
      Alert.alert('Error', 'Please fill in name and dosage');
      return;
    }

    setIsAdding(true);
    try {
      const timeStr = format(selectedTime, 'HH:mm');
      const payload = {
        name,
        dosage,
        unit: unit || 'pill',
        frequency,
        scheduleTimes: [timeStr],
        startDate: new Date().toISOString(),
      };

      const res = await createMedicationService(payload);
      if (res?.success) {
        if (notificationStatus === 'granted') {
          await scheduleReminderForMedication({
            id: res?.data?.id || res?.data?._id,
            name,
            dosage,
            unit,
          });
        }

        Alert.alert('Success', 'Medication added successfully');
        setShowAddModal(false);
        setName('');
        setDosage('');
        setUnit('pill');
        setFrequency('daily');
        setSelectedTime(new Date(new Date().setHours(9, 0, 0, 0)));
        fetchMeds();
      } else {
        throw new Error(res.message || 'Failed to add medication');
      }
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || e.message || 'Failed to add medication');
    } finally {
      setIsAdding(false);
    }
  };

  const onTimeChange = (event, date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedTime(date);
    }
  };

  return (
    <View className="flex-1 bg-zinc-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-12 pb-6 bg-white border-b border-slate-100 shadow-sm">
        <View className="flex-row items-center">
          <View className="w-10 h-10 bg-amber-100 rounded-xl items-center justify-center mr-3">
            <Ionicons name="flask" size={20} color="#f59e0b" />
          </View>
          <Text className="text-xl font-extrabold text-slate-800">Medicine Cabinet</Text>
        </View>
        <TouchableOpacity 
          onPress={() => setShowAddModal(true)}
          className="bg-slate-800 w-10 h-10 rounded-xl items-center justify-center shadow-sm"
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {notificationStatus !== 'granted' && notificationStatus !== 'loading' && (
        <View className="mx-6 mt-4 rounded-3xl border border-amber-100 bg-amber-50 px-4 py-4 flex-row items-center justify-between">
          <View className="flex-1 pr-3">
            <Text className="text-amber-900 font-semibold">Enable medication reminders</Text>
            <Text className="text-amber-700 text-sm">
              Turn on notifications so your medication reminders arrive at the right time.
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleNotificationPermission}
            className="bg-amber-400 rounded-2xl px-4 py-3"
          >
            <Text className="text-black font-bold">Enable</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        className="flex-1 px-6 pt-6"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color="#fbbf24" className="mt-10" />
        ) : meds.length === 0 ? (
          <View className="border-2 border-dashed border-slate-200 rounded-[32px] p-12 items-center justify-center mt-4">
            <View className="w-20 h-20 bg-white items-center justify-center rounded-3xl mb-6 shadow-sm border border-slate-50">
              <Ionicons name="flask-outline" size={40} color="#cbd5e1" />
            </View>
            <Text className="text-slate-800 font-bold text-xl mb-2">Your cabinet is empty</Text>
            <Text className="text-slate-400 text-center font-medium">Add your first medication to start tracking.</Text>
            <TouchableOpacity 
              onPress={() => setShowAddModal(true)}
              className="mt-6 bg-slate-800 px-6 py-3 rounded-2xl"
            >
              <Text className="text-white font-bold">Add Medication</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="gap-4 pb-32">
            {meds.map((med, index) => (
              <View key={med.id || med._id || `med_${index}`} className="bg-white rounded-[28px] p-6 border border-slate-100 shadow-sm">
                <View className="flex-row items-center mb-4">
                  <View className="w-14 h-14 bg-amber-50 rounded-2xl items-center justify-center mr-4 border border-amber-100">
                    <Ionicons name="medical" size={28} color="#f59e0b" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-slate-800 font-black text-xl">{med.name}</Text>
                    <Text className="text-slate-400 font-bold text-sm tracking-wide">{med.dosage}</Text>
                  </View>
                  <TouchableOpacity className="p-2 bg-slate-50 rounded-full">
                     <Ionicons name="ellipsis-horizontal" size={20} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
                
                <View className="flex-row gap-4 pt-4 border-t border-slate-50">
                  <View className="flex-row items-center bg-zinc-50 px-3 py-2 rounded-xl">
                    <Ionicons name="repeat" size={14} color="#94a3b8" className="mr-2" />
                    <Text className="text-slate-600 font-bold text-xs uppercase tracking-wider ml-1">{med.frequency}</Text>
                  </View>
                  <View className="flex-row items-center bg-zinc-50 px-3 py-2 rounded-xl">
                    <Ionicons name="time-outline" size={14} color="#94a3b8" className="mr-2" />
                    <Text className="text-slate-600 font-bold text-xs ml-1">{(med.times || []).join(', ')}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add Medication Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-[40px] p-8 pb-12 shadow-2xl">
            <View className="flex-row justify-between items-center mb-8">
              <Text className="text-2xl font-black text-slate-800">New Medication</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)} className="bg-slate-100 p-2 rounded-full">
                <Ionicons name="close" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View className="space-y-6">
              <View>
                <Text className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-2 ml-1">Name</Text>
                <TextInput
                  placeholder="e.g. Paracetamol"
                  className="bg-slate-50 p-5 rounded-2xl text-slate-800 font-bold border border-slate-100"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View>
                <Text className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-2 ml-1">Dosage</Text>
                <TextInput
                  placeholder="e.g. 500"
                  className="bg-slate-50 p-5 rounded-2xl text-slate-800 font-bold border border-slate-100"
                  value={dosage}
                  onChangeText={setDosage}
                />
              </View>

              <View>
                <Text className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-2 ml-1">Unit</Text>
                <TextInput
                  placeholder="e.g. mg, pill"
                  className="bg-slate-50 p-5 rounded-2xl text-slate-800 font-bold border border-slate-100"
                  value={unit}
                  onChangeText={setUnit}
                />
              </View>

              <View>
                <Text className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-2 ml-1">Frequency</Text>
                <TouchableOpacity
                  onPress={() => setShowFrequencyPicker(true)}
                  className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex-row justify-between items-center"
                >
                  <Text className="text-slate-800 font-bold text-base">{FREQUENCIES.find((f) => f.value === frequency)?.label || 'Select frequency'}</Text>
                  <Ionicons name="chevron-down" size={20} color="#64748b" />
                </TouchableOpacity>

                <Modal
                  visible={showFrequencyPicker}
                  animationType="fade"
                  transparent={true}
                  onRequestClose={() => setShowFrequencyPicker(false)}
                >
                  <TouchableOpacity
                    style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' }}
                    activeOpacity={1}
                    onPressOut={() => setShowFrequencyPicker(false)}
                  >
                    <View style={{ backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 }}>
                      <Text style={{ fontWeight: 'bold', marginBottom: 12, color: '#475569' }}>Select Frequency</Text>
                      {FREQUENCIES.map((f) => (
                        <TouchableOpacity
                          key={f.value}
                          style={{ paddingVertical: 12 }}
                          onPress={() => {
                            setFrequency(f.value);
                            setShowFrequencyPicker(false);
                          }}
                        >
                          <Text style={{ fontSize: 16, color: frequency === f.value ? '#b45309' : '#0f172a', fontWeight: frequency === f.value ? '700' : '500' }}>
                            {f.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                      <TouchableOpacity
                        onPress={() => setShowFrequencyPicker(false)}
                        style={{ marginTop: 10, alignItems: 'center' }}
                      >
                        <Text style={{ color: '#64748b' }}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                </Modal>
              </View>

              <View>
                <Text className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-2 ml-1">Reminder Time</Text>
                <TouchableOpacity 
                   onPress={() => setShowTimePicker(true)}
                   className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex-row justify-between items-center"
                >
                  <Text className="text-slate-800 font-bold text-lg">{format(selectedTime, 'hh:mm a')}</Text>
                  <View className="bg-amber-100 p-2 rounded-xl">
                    <Ionicons name="time" size={20} color="#f59e0b" />
                  </View>
                </TouchableOpacity>

                {showTimePicker && (
                  <DateTimePicker
                    value={selectedTime}
                    mode="time"
                    is24Hour={false}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, date) => {
                      if (Platform.OS !== 'ios') {
                        setShowTimePicker(false);
                      }
                      if (date) {
                        setSelectedTime(date);
                      }
                    }}
                  />
                )}
              </View>

              <TouchableOpacity 
                disabled={isAdding}
                onPress={handleAddMed}
                className={`bg-amber-400 p-6 rounded-[24px] items-center shadow-lg mt-4 ${isAdding ? 'opacity-50' : ''}`}
              >
                {isAdding ? (
                  <ActivityIndicator color="black" />
                ) : (
                  <Text className="text-black font-black text-lg">Create Medication</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
