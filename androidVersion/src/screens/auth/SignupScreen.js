import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { COLORS, SPACING } from '../../constants';
import { signupService } from '../../services/authService';
import { Ionicons } from '@expo/vector-icons';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('patient');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password) return;
    setLoading(true);
    try {
      await signupService({ name, email, password, role });
      Alert.alert('Success', 'Account created! Please log in.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (e) {
      Alert.alert('Signup Failed', e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  const ROLE_OPTIONS = [
    { id: 'patient', label: 'Patient', icon: 'heart' },
    { id: 'caregiver', label: 'Caregiver', icon: 'people' },
    { id: 'doctor', label: 'Doctor', icon: 'medical' }
  ];

  return (
    <ScrollView className="flex-1 bg-black p-6 pt-20">
      <View className="mb-10">
        <View className="w-16 h-16 bg-yellow-400 rounded-3xl items-center justify-center mb-6">
            <Ionicons name="sparkles" size={32} color="black" />
        </View>
        <Text className="text-4xl font-extrabold text-white tracking-tight">Create profile</Text>
        <Text className="text-zinc-500 text-lg mt-1 font-medium tracking-tight">Access the health monitoring network</Text>
      </View>

      <View className="space-y-6">
        <View className="space-y-3">
            <Text className="text-zinc-400 font-medium ml-1">Select Identity</Text>
            <View className="flex-row gap-3">
              {ROLE_OPTIONS.map((r) => (
                <TouchableOpacity 
                    key={r.id}
                    onPress={() => setRole(r.id)}
                    className={`flex-1 p-4 rounded-2xl items-center ${role === r.id ? 'bg-yellow-400/10 border-2 border-yellow-400' : 'bg-zinc-900 border-2 border-zinc-900'}`}
                >
                  <Ionicons name={r.icon} size={24} color={role === r.id ? '#FACC15' : '#52525B'} />
                  <Text className={`text-[10px] font-bold uppercase mt-2 tracking-wider ${role === r.id ? 'text-yellow-400' : 'text-zinc-600'}`}>{r.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
        </View>

        <Input 
          label="Full name"
          placeholder="John Doe"
          value={name}
          onChangeText={setName}
        />

        <Input 
          label="Email address"
          placeholder="john@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Input 
          label="Secret Key"
          placeholder="Min. 6 characters"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Button 
            title="Create Free Account"
            onPress={handleSignup}
            loading={loading}
            style={{ marginTop: 16 }}
        />

        <View className="flex-row justify-center mt-12 pb-20">
          <Text className="text-zinc-500 font-medium">Already have one? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text className="text-white font-bold underline">Login now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
