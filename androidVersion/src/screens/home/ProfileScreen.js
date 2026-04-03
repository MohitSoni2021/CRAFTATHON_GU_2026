import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { getMeService, updateProfileService } from '../../services/authService';

export default function ProfileScreen() {
  const { user, login } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await getMeService();
      // backend returns { success: true, data: {...} }
      const fetchedUser = data?.data || data?.user || data;
      if (fetchedUser) {
        const normalizedUser = fetchedUser.user || fetchedUser;
        setFormData({
          name: normalizedUser.name || '',
          email: normalizedUser.email || '',
          phone: normalizedUser.phone || '',
        });
        // Keep global auth store in sync with backend profile
        if (normalizedUser.id || normalizedUser._id) {
          login(normalizedUser, null);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    if (!formData.name) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    setUpdating(true);
    try {
      const res = await updateProfileService({
        name: formData.name,
        phone: formData.phone,
      });

      const updatedUser = res?.data || res?.user || res;

      if (res?.success && updatedUser) {
        Alert.alert('Success', 'Profile updated successfully');
        setFormData((prev) => ({
          ...prev,
          name: updatedUser.name || prev.name,
          phone: updatedUser.phone || prev.phone,
        }));
        login(updatedUser, null);
      } else if (res?.success === false) {
        throw new Error(res?.message || 'Update failed');
      }
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || e.message || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to exit?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => useAuthStore.getState().logout() }
      ]
    );
  };

  return (
    <View className="flex-1 bg-zinc-50">
      <StatusBar barStyle="dark-content" />
      
      <ScrollView className="flex-1 px-6 pt-16">
        <View className="mb-10 items-center">
          <View className="relative">
            <View className="w-32 h-32 bg-amber-100 rounded-full items-center justify-center border-4 border-white shadow-sm overflow-hidden">
                 <Ionicons name="person" size={60} color="#f59e0b" />
            </View>
            <TouchableOpacity className="absolute bottom-1 right-1 bg-slate-800 w-10 h-10 rounded-full items-center justify-center border-2 border-white">
              <Ionicons name="camera" size={18} color="white" />
            </TouchableOpacity>
          </View>
          <Text className="text-2xl font-black text-slate-800 mt-6">{formData.name || user?.name || 'User Profile'}</Text>
          <Text className="text-slate-400 font-bold tracking-tight uppercase text-xs mt-1">{user?.role || 'Patient'}</Text>
        </View>

        <View className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 space-y-8">
           <View>
              <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-2 ml-1">Full Name</Text>
              <View className="bg-slate-50 flex-row items-center p-4 rounded-2xl border border-slate-100">
                <Ionicons name="person-outline" size={20} color="#94a3b8" className="mr-3" />
                <TextInput 
                  value={formData.name}
                  onChangeText={(t) => setFormData(p => ({...p, name: t}))}
                  placeholder="Your Name"
                  className="flex-1 font-bold text-slate-800 ml-1"
                />
              </View>
           </View>

           <View>
              <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-2 ml-1">Email Address</Text>
              <View className="bg-slate-200/30 flex-row items-center p-4 rounded-2xl border border-slate-100">
                <Ionicons name="mail-outline" size={20} color="#94a3b8" className="mr-3" />
                <TextInput 
                  value={formData.email}
                  editable={false}
                  className="flex-1 font-bold text-slate-400 ml-1"
                />
              </View>
              <Text className="text-[10px] text-slate-300 mt-2 ml-1">* Email cannot be changed</Text>
           </View>

           <View>
              <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-2 ml-1">Phone Number</Text>
              <View className="bg-slate-50 flex-row items-center p-4 rounded-2xl border border-slate-100">
                <Ionicons name="call-outline" size={20} color="#94a3b8" className="mr-3" />
                <TextInput 
                  value={formData.phone}
                  onChangeText={(t) => setFormData(p => ({...p, phone: t}))}
                  placeholder="+1 234 567 890"
                  className="flex-1 font-bold text-slate-800 ml-1"
                />
              </View>
           </View>

           <TouchableOpacity 
             onPress={handleUpdate}
             disabled={updating}
             className="bg-slate-800 p-5 rounded-2xl items-center shadow-lg mt-4"
           >
             {updating ? (
               <ActivityIndicator color="white" />
             ) : (
               <Text className="text-white font-black text-lg">Save Changes</Text>
             )}
           </TouchableOpacity>
        </View>

        <View className="mt-8 mb-20">
           <TouchableOpacity 
             onPress={handleLogout}
             className="bg-rose-50 p-5 rounded-2xl flex-row items-center justify-center border border-rose-100"
           >
              <Ionicons name="log-out-outline" size={22} color="#f43f5e" className="mr-2" />
              <Text className="text-rose-500 font-black text-lg ml-2">Sign Out</Text>
           </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
