import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { linkCaregiverService, getPatientsService, getPatientAdherenceService, getMyCaregiversService, unlinkCaregiverService } from '../../services/caregiverService';
import { useAuthStore } from '../../store/authStore';

export default function CaregiverScreen() {
  const { user } = useAuthStore();
  const isCaregiver = user?.role === 'CAREGIVER';
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [patients, setPatients] = useState([]);
  const [caregivers, setCaregivers] = useState([]);
  const [emailToLink, setEmailToLink] = useState('');
  const [isLinking, setIsLinking] = useState(false);

  const fetchData = async () => {
    try {
      if (!refreshing) setLoading(true);

      if (isCaregiver) {
        const res = await getPatientsService();
        if (res.success) setPatients(res.data);
      } else {
        const res = await getMyCaregiversService();
        if (res.success) setCaregivers(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  const handleLink = async () => {
    if (!emailToLink) return;
    setIsLinking(true);
    try {
      const res = await linkCaregiverService(emailToLink);
      if (res.success) {
        Alert.alert('Success', 'Link request sent successfully');
        setEmailToLink('');
        fetchData();
      }
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Link failed');
    } finally {
      setIsLinking(false);
    }
  };

  const handleUnlink = async (id) => {
    Alert.alert('Unlink', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Unlink', style: 'destructive', onPress: async () => {
        try {
          const res = await unlinkCaregiverService(id);
          if (res.success) fetchData();
        } catch (e) {
          Alert.alert('Error', 'Failed to unlink');
        }
      }}
    ]);
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 items-center justify-center bg-zinc-50">
        <ActivityIndicator size="large" color="#fbbf24" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-zinc-50">
      <StatusBar barStyle="dark-content" />
      <ScrollView 
        className="flex-1 px-6 pt-16 pb-20"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text className="text-3xl font-black text-slate-800 mb-8">{isCaregiver ? 'Patients' : 'Caregivers'}</Text>

        {!isCaregiver ? (
          <>
            <View className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm mb-6 items-center">
              <View className="w-20 h-20 bg-amber-100 rounded-3xl items-center justify-center mb-6">
                <Ionicons name="people" size={40} color="#f59e0b" />
              </View>
              <Text className="text-slate-800 font-black text-xl mb-2">Connect a Caregiver</Text>
              <Text className="text-slate-400 text-center font-medium leading-6 mb-8 px-4">
                Link your profile with a family member or doctor for remote adherence tracking.
              </Text>
              <TextInput 
                placeholder="Caregiver's Email"
                className="w-full bg-slate-50 p-5 rounded-2xl border border-slate-100 font-bold mb-4"
                value={emailToLink}
                onChangeText={setEmailToLink}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <TouchableOpacity 
                onPress={handleLink}
                disabled={isLinking}
                className="bg-amber-400 w-full p-6 rounded-2xl items-center shadow-lg"
              >
                <Text className="text-black font-black text-lg">{isLinking ? 'Sending...' : 'Send Invitation'}</Text>
              </TouchableOpacity>
            </View>

            <View className="bg-white rounded-[40px] p-6 border border-slate-100 shadow-sm">
              <Text className="text-slate-900 font-black text-xl mb-4">Connected Caregivers</Text>
              {caregivers.length === 0 ? (
                <View className="items-center justify-center py-10 px-4 border-2 border-dashed border-slate-200 rounded-[30px]">
                  <Ionicons name="people" size={46} color="#94a3b8" style={{ marginBottom: 12 }} />
                  <Text className="text-slate-400 font-black text-center leading-6">No caregivers connected yet. Send an invitation, and they will appear here once accepted.</Text>
                </View>
              ) : (
                caregivers.map((cg) => (
                  <View key={cg._id} className="bg-slate-50 p-4 rounded-3xl mb-3 border border-slate-100">
                    <View className="flex-row items-center justify-between">
                      <View>
                        <Text className="text-slate-800 font-black text-base">{cg.caregiverId?.name || cg.caregiverEmail}</Text>
                        <Text className="text-slate-500 text-sm">{cg.caregiverId?.email || cg.caregiverEmail}</Text>
                      </View>
                      <Text className="text-xs font-bold uppercase tracking-widest text-amber-600">{cg.status || 'PENDING'}</Text>
                    </View>
                    <View className="flex-row items-center justify-between mt-3">
                      <Text className="text-slate-500 text-xs">Relationship: {cg.relationship || 'N/A'}</Text>
                      <TouchableOpacity onPress={() => handleUnlink(cg._id)} className="px-3 py-1 rounded-full border border-red-200">
                        <Text className="text-red-500 font-bold text-xs">Unlink</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          </>
        ) : (
          <View className="gap-4 mb-20">
             {patients.length === 0 ? (
               <View className="items-center justify-center py-20 px-8 border-2 border-dashed border-slate-200 rounded-[40px]">
                  <Ionicons name="people-outline" size={48} color="#cbd5e1" className="mb-4" />
                  <Text className="text-slate-400 font-black text-center leading-6">You don't have any patients linked yet.</Text>
               </View>
             ) : (
               patients.map((p) => (
                 <View key={p.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                    <View className="flex-row items-center mb-4">
                       <View className="w-12 h-12 bg-slate-100 rounded-full items-center justify-center mr-4">
                          <Ionicons name="person" size={24} color="#94a3b8" />
                       </View>
                       <View className="flex-1">
                          <Text className="text-slate-800 font-black text-lg">{p.name || 'Anonymous'}</Text>
                          <Text className="text-slate-400 font-bold text-xs uppercase tracking-tight">{p.status || 'Active'}</Text>
                       </View>
                       <TouchableOpacity onPress={() => handleUnlink(p.id)} className="p-2">
                          <Ionicons name="trash-outline" size={20} color="#f43f5e" />
                       </TouchableOpacity>
                    </View>
                    <View className="bg-zinc-50 p-4 rounded-2xl flex-row justify-between items-center">
                       <View>
                          <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1">Weekly Score</Text>
                          <Text className="text-slate-800 font-black text-xl">{p.score || 0}%</Text>
                       </View>
                       <TouchableOpacity onPress={() => Alert.alert('Report', 'Downloading Patient PDF...')} className="bg-white p-3 rounded-xl border border-slate-100">
                          <Ionicons name="download" size={20} color="#64748b" />
                       </TouchableOpacity>
                    </View>
                 </View>
               ))
             )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
