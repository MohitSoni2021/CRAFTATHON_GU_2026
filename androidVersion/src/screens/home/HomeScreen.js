import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { COLORS, SPACING } from '../../constants';
import { getTodayDosesService, markDoseAsTakenService } from '../../services/medicationService';
import { getAdherenceScoreService, getRiskLevelService } from '../../services/adherenceService';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { format } from 'date-fns';

const HomeScreen = ({ navigation }) => {
  const { user, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [todayDoses, setTodayDoses] = useState([]);
  const [score, setScore] = useState(null);
  const [risk, setRisk] = useState(null);
  const [takingId, setTakingId] = useState(null);

  const fetchData = async () => {
    try {
      if (!refreshing) setLoading(true);
      const [dosesRes, scoreRes, riskRes] = await Promise.all([
        getTodayDosesService(),
        getAdherenceScoreService(),
        getRiskLevelService(),
      ]);

      if (dosesRes.success) setTodayDoses(dosesRes.data);
      if (scoreRes.success) setScore(scoreRes.data);
      if (riskRes.success) setRisk(riskRes.data);
    } catch (err) {
      console.error('Screen fetch error:', err);
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
        if (sRes.success) setScore(sRes.data);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to update dose status');
      fetchData(); // Reset on error
    } finally {
      setTakingId(null);
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Keep your health streak going. Are you sure?', [
      { text: 'Stay', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.flex, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const pendingCount = todayDoses.filter((d) => d.status === 'pending').length;

  return (
    <View style={styles.flex}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        contentContainerStyle={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
            <View>
                <Text style={styles.greeting}>Good morning,</Text>
                <Text style={styles.userName}>{user?.name?.split(' ')[0] || 'User'}!</Text>
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.profileBtn}>
                <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
            </TouchableOpacity>
        </View>

        {/* Welcome Banner */}
        <View style={styles.banner}>
            <View style={styles.bannerContent}>
                <Text style={styles.bannerTitle}>
                    {pendingCount > 0 ? `Take ${pendingCount} doses` : 'Healthy Streak!'}
                </Text>
                <Text style={styles.bannerSubtitle}>
                    {pendingCount > 0 ? 'Maintain your adherence score' : "You've taken all doses today!"}
                </Text>
            </View>
            <TouchableOpacity 
                style={styles.bannerBtn}
                onPress={() => navigation.navigate('Medications')}
            >
                <Ionicons name="medical" size={24} color="black" />
            </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsGrid}>
            <Card style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: '#1E293B' }]}>
                    <Ionicons name="analytics" size={20} color="#FACC15" />
                </View>
                <Text style={styles.statLabel}>Adherence</Text>
                <Text style={styles.statValue}>{score?.score ?? '--'}%</Text>
            </Card>

            <Card style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: '#1E293B' }]}>
                    <Ionicons name="shield-checkmark" size={20} color="#10B981" />
                </View>
                <Text style={styles.statLabel}>Risk Level</Text>
                <Text style={[styles.statValue, { color: (risk?.riskLevel === 'high' ? COLORS.error : '#10B981') }]}>
                    {(risk?.riskLevel || '...').toUpperCase()}
                </Text>
            </Card>
        </View>

        {/* Schedule Section */}
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Schedule</Text>
            <TouchableOpacity><Text style={styles.seeAll}>History</Text></TouchableOpacity>
        </View>

        {todayDoses.length === 0 ? (
            <Card style={styles.emptyCard}>
                <Ionicons name="checkmark-circle-outline" size={48} color="#27272A" />
                <Text style={styles.emptyText}>No medications scheduled today.</Text>
            </Card>
        ) : (
            todayDoses.map((log) => {
                const uid = `${log.medicationId}_${log.scheduledTime}`;
                const isTaken = log.status === 'taken' || log.status === 'delayed';
                const isMissed = log.status === 'missed';
                const isTaking = takingId === uid;

                return (
                    <Card key={uid} style={[styles.doseItem, isTaken && styles.doseTaken]}>
                        <View style={styles.doseLeft}>
                            <TouchableOpacity 
                                disabled={isTaken || isMissed || isTaking}
                                onPress={() => handleMarkTaken(log)}
                                style={[
                                    styles.checkbox, 
                                    isTaken && styles.checkboxTaken,
                                    isMissed && styles.checkboxMissed
                                ]}
                            >
                                {isTaking ? (
                                    <ActivityIndicator size="small" color={COLORS.primary} />
                                ) : isTaken ? (
                                    <Ionicons name="checkmark" size={16} color="black" />
                                ) : isMissed ? (
                                    <Ionicons name="close" size={16} color="white" />
                                ) : null}
                            </TouchableOpacity>
                            <View style={styles.doseInfo}>
                                <Text style={[styles.medName, isTaken && styles.textStrikethrough]}>
                                    {log.medicationName}
                                </Text>
                                <View style={styles.doseTimeRow}>
                                    <Ionicons name="time-outline" size={12} color="#52525B" />
                                    <Text style={styles.doseTime}>
                                        {format(new Date(log.scheduledTime), 'h:mm a')} • {log.dosage}
                                    </Text>
                                </View>
                            </View>
                        </View>
                        
                        {!isTaken && !isMissed && (
                            <TouchableOpacity 
                                disabled={isTaking}
                                onPress={() => handleMarkTaken(log)}
                                style={styles.takeBtn}
                            >
                                <Text style={styles.takeBtnText}>{isTaking ? '...' : 'Take'}</Text>
                            </TouchableOpacity>
                        )}

                        {isTaken && (
                            <View style={styles.statusBadge}>
                                <Text style={styles.statusText}>TAKEN</Text>
                            </View>
                        )}
                    </Card>
                );
            })
        )}

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#000000' },
  center: { alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 },
  container: { padding: SPACING.lg, paddingBottom: 100 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  greeting: { fontSize: 16, color: '#A1A1AA', fontWeight: '500' },
  userName: { fontSize: 32, color: 'white', fontWeight: '800', tracking: -1 },
  profileBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#1F1F23',
    alignItems: 'center',
    justifyContent: 'center',
  },
  banner: {
    backgroundColor: '#FACC15',
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  bannerContent: { flex: 1 },
  bannerTitle: { fontSize: 22, fontWeight: '900', color: 'black' },
  bannerSubtitle: { fontSize: 14, fontWeight: '600', color: 'rgba(0,0,0,0.6)', marginTop: 4 },
  bannerBtn: {
    width: 54,
    height: 54,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 24,
    backgroundColor: '#0A0A0A',
    alignItems: 'flex-start',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statLabel: { fontSize: 12, color: '#52525B', fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  statValue: { fontSize: 24, fontWeight: '800', color: 'white' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: 'white' },
  seeAll: { fontSize: 14, fontWeight: '700', color: '#FACC15' },
  doseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#0A0A0A',
  },
  doseTaken: {
    opacity: 0.6,
    borderColor: '#10B98133',
  },
  doseLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#27272A',
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxTaken: {
    backgroundColor: '#FACC15',
    borderColor: '#FACC15',
  },
  checkboxMissed: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  doseInfo: { flex: 1 },
  medName: { fontSize: 16, fontWeight: '700', color: 'white' },
  textStrikethrough: { textDecorationLine: 'line-through' },
  doseTimeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
  doseTime: { fontSize: 13, color: '#52525B', fontWeight: '500' },
  takeBtn: {
    backgroundColor: '#FACC15',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  takeBtnText: { color: 'black', fontWeight: '800', fontSize: 12 },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#10B98122',
  },
  statusText: { color: '#10B981', fontSize: 10, fontWeight: '900' },
  emptyCard: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#1F1F23',
    backgroundColor: 'transparent',
  },
  emptyText: { color: '#52525B', fontWeight: '600', marginTop: 12, textAlign: 'center' },
});

export default HomeScreen;
