import React, { useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, GOOGLE_CLIENT_ID } from '../../constants';
import { loginService, googleLoginService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { Ionicons } from '@expo/vector-icons';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { TouchableOpacity } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const loginAction = useAuthStore((state) => state.login);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_CLIENT_ID,
    androidClientId: GOOGLE_CLIENT_ID,
    iosClientId: GOOGLE_CLIENT_ID,
  });

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      const data = await loginService(email, password);
      loginAction(data.user, data.token);
    } catch (e) {
      Alert.alert('Login Failed', e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const result = await promptAsync();
    if (result.type === 'success') {
      setLoading(true);
      try {
        const data = await googleLoginService(result.authentication.accessToken);
        loginAction(data.user, data.token);
      } catch (e) {
        Alert.alert('Google Login Failed', e.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <ScrollView className="flex-1 bg-black p-6 pt-20">
      <View className="mb-12">
        <View className="w-16 h-16 bg-yellow-400 rounded-3xl items-center justify-center mb-6">
            <Ionicons name="activity" size={32} color="black" />
        </View>
        <Text className="text-4xl font-extrabold text-white tracking-tight text-left">Welcome back</Text>
        <Text className="text-zinc-500 text-lg mt-2 font-medium">Log in to track your progress</Text>
      </View>

      <View className="space-y-6">
        <Input 
          label="Email address"
          placeholder="john@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Input 
          label="Password"
          placeholder="••••••••"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Button 
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            style={{ marginTop: 16 }}
        />

        <View className="flex-row items-center my-8">
            <View className="flex-1 h-[1px] bg-zinc-800" />
            <Text className="text-zinc-600 px-4 font-bold text-xs uppercase tracking-widest">Or access with</Text>
            <View className="flex-1 h-[1px] bg-zinc-800" />
        </View>

        <Button 
            title="Google Account"
            variant="outline"
            onPress={handleGoogleLogin}
            disabled={!request || loading}
            leftIcon={<Ionicons name="logo-google" size={20} color={COLORS.primary} />}
        />

        <View className="flex-row justify-center mt-12 pb-10">
          <Text className="text-zinc-500 font-medium tracking-tight">Need a profile? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text className="text-white font-bold underline">Create an account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
