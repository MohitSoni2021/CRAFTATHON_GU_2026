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
import { getAdherenceScoreService, getAdherenceRiskService, getAdherenceWeeklyService, getAdherencePatternsService } from '../../services/adherenceService';

export default function InsightsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [score, setScore] = useState(0);
  const [risk, setRisk] = useState({ level: 'LOW', score: 0 });
  const [weekly, setWeekly] = useState([]);
  const [patterns, setPatterns] = useState([]);

  const fetchData = async () => {
    try {
      if (!refreshing) setLoading(true);
      const [s, r, w, p] = await Promise.all([
        getAdherenceScoreService(),
        getAdherenceRiskService(),
        getAdherenceWeeklyService(),
        getAdherencePatternsService(),
      ]);
      
      if (s.success) setScore(s.data.score);
      if (r.success) setRisk(r.data);
      if (w.success) setWeekly(w.data);
      if (p.success) {
        if (Array.isArray(p.data)) {
          setPatterns(p.data);
        } else if (p.data?.patterns && Array.isArray(p.data.patterns)) {
          setPatterns(p.data.patterns);
        } else {
          setPatterns([]);
        }
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

  if (loading && !refreshing) {
    return (
      <View className="flex-1 items-center justify-center bg-zinc-50">
        <ActivityIndicator size="large" color="#fbbf24" />
      </View>
    );
  }

  const getRiskColor = (level) => {
    switch (level) {
      case 'HIGH': return 'text-rose-500';
      case 'MODERATE': return 'text-amber-500';
      default: return 'text-emerald-500';
    }
  };

  return (
    <View className="flex-1 bg-zinc-50">
      <StatusBar barStyle="dark-content" />
      <ScrollView 
        className="flex-1 px-6 pt-16"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text className="text-3xl font-black text-slate-800 mb-8">Insights</Text>

        {/* Risk Card */}
        <View className="bg-slate-800 rounded-[32px] p-8 shadow-xl mb-6 flex-row items-center justify-between">
           <View className="flex-1">
             <Text className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-2">Current Risk Level</Text>
             <Text className={`text-4xl font-black ${getRiskColor(risk.level)}`}>{risk.level}</Text>
             <Text className="text-slate-300 text-xs mt-2 font-medium">Based on your last 7 days of adherence</Text>
           </View>
           <View className="w-16 h-16 bg-slate-700 rounded-2xl items-center justify-center">
              <Ionicons name={risk.level === 'HIGH' ? 'warning' : 'shield-checkmark'} size={32} color={risk.level === 'HIGH' ? '#f43f5e' : '#10b981'} />
           </View>
        </View>

        {/* Stats Grid */}
        <View className="flex-row gap-4 mb-6">
           <View className="flex-1 bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm">
              <Text className="text-slate-400 font-bold text-[10px] uppercase mb-1">Adherence</Text>
              <Text className="text-3xl font-black text-slate-800">{score}%</Text>
              <View className="h-1 bg-amber-100 w-full mt-3 rounded-full overflow-hidden">
                 <View className="h-full bg-amber-400" style={{ width: `${score}%` }} />
              </View>
           </View>
           <View className="flex-1 bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm">
              <Text className="text-slate-400 font-bold text-[10px] uppercase mb-1">Weekly Goal</Text>
              <Text className="text-3xl font-black text-slate-800">85%</Text>
              <Text className="text-emerald-500 font-bold text-[10px] mt-2 uppercase">On Track</Text>
           </View>
        </View>

        {/* Weekly Trend (Placeholder Chart logic) */}
        <View className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm mb-6">
           <Text className="text-slate-800 font-black text-lg mb-6">Weekly Trend</Text>
           <View className="flex-row items-end justify-between h-32 px-2">
              {[60, 80, 45, 90, 75, 100, 85].map((val, i) => (
                <View key={i} className="items-center">
                   <View className="w-4 bg-amber-400/20 rounded-full h-full absolute" />
                   <View className="w-4 bg-amber-400 rounded-full" style={{ height: `${val}%` }} />
                   <Text className="text-slate-400 font-bold text-[10px] mt-2">{['M','T','W','T','F','S','S'][i]}</Text>
                </View>
              ))}
           </View>
        </View>

        {/* Patterns / Suggestions */}
        <View className="mb-20">
           <Text className="text-xl font-black text-slate-800 mb-6 px-1">Patterns & Insights</Text>
           {patterns.length === 0 ? (
             <View className="bg-indigo-50 border border-indigo-100 p-6 rounded-3xl flex-row items-center">
                <View className="w-12 h-12 bg-white rounded-2xl items-center justify-center mr-4">
                   <Ionicons name="sparkles" size={24} color="#6366f1" />
                </View>
                <View className="flex-1">
                   <Text className="text-indigo-800 font-black text-sm">Everything looks great!</Text>
                   <Text className="text-indigo-600 text-xs mt-1">Keep following your schedule to maintain low risk.</Text>
                </View>
             </View>
           ) : (
             patterns.map((p, i) => (
               <View key={i} className="bg-white border border-slate-100 p-6 rounded-3xl mb-4 flex-row items-center shadow-sm">
                  <View className="w-12 h-12 bg-zinc-50 rounded-2xl items-center justify-center mr-4">
                     <Ionicons name="pulse" size={24} color="#94a3b8" />
                  </View>
                  <View className="flex-1">
                     <Text className="text-slate-800 font-bold">{p.insight}</Text>
                     <Text className="text-slate-400 text-xs mt-1">{p.suggestion}</Text>
                  </View>
               </View>
             ))
           )}
        </View>
      </ScrollView>
    </View>
  );
}
