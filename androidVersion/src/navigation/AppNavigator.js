import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { useAuthStore } from '../store/authStore';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import MedicationsScreen from '../screens/home/MedicationsScreen';
import TodayMedsScreen from '../screens/home/TodayMedsScreen';
import ProfileScreen from '../screens/home/ProfileScreen';
import InsightsScreen from '../screens/home/InsightsScreen';
import CaregiverScreen from '../screens/home/CaregiverScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Signup" component={SignupScreen} />
  </Stack.Navigator>
);

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarShowLabel: true,
      tabBarActiveTintColor: '#f59e0b',
      tabBarInactiveTintColor: '#94a3b8',
      tabBarStyle: {
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        height: 65,
        paddingBottom: 10,
        paddingTop: 10,
        elevation: 0,
        shadowOpacity: 0,
      },
      tabBarLabelStyle: {
        fontWeight: 'bold',
        fontSize: 10,
        marginBottom: 4,
      },
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        if (route.name === 'Today') iconName = focused ? 'today' : 'today-outline';
        else if (route.name === 'Cabinet') iconName = focused ? 'flask' : 'flask-outline';
        else if (route.name === 'Insights') iconName = focused ? 'analytics' : 'analytics-outline';
        else if (route.name === 'Care') iconName = focused ? 'people' : 'people-outline';
        else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
        return <Ionicons name={iconName} size={22} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Today" component={TodayMedsScreen} />
    <Tab.Screen name="Cabinet" component={MedicationsScreen} />
    <Tab.Screen name="Insights" component={InsightsScreen} />
    <Tab.Screen name="Care" component={CaregiverScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Tabs" component={TabNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
  );
};

export default AppNavigator;
