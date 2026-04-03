import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { COLORS, SPACING } from '../../constants';

const HomeScreen = () => {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const getInitials = (name = '') =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const infoItems = [
    { icon: 'mail-outline', label: 'Email', value: user?.email || '—' },
    { icon: 'person-outline', label: 'Name', value: user?.name || '—' },
    { icon: 'shield-checkmark-outline', label: 'Role', value: user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Patient' },
    { icon: 'globe-outline', label: 'Timezone', value: user?.timezone || 'Asia/Kolkata' },
  ];

  return (
    <View style={styles.flex}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.userName}>{user?.name || 'User'} 👋</Text>
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
              <Ionicons name="log-out-outline" size={22} color={COLORS.error} />
            </TouchableOpacity>
          </View>

          {/* Avatar */}
          <View style={styles.avatarSection}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitials}>{getInitials(user?.name)}</Text>
              </View>
            )}
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <View style={styles.badgeDot} />
                <Text style={styles.badgeText}>Active</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Profile Card */}
        <View style={styles.content}>
          <Card title="Profile Information" subtitle="Your account details">
            {infoItems.map((item, index) => (
              <View key={index} style={[styles.infoRow, index < infoItems.length - 1 && styles.infoRowBorder]}>
                <View style={styles.infoIconWrap}>
                  <Ionicons name={item.icon} size={16} color={COLORS.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>{item.label}</Text>
                  <Text style={styles.infoValue}>{item.value}</Text>
                </View>
              </View>
            ))}
          </Card>

          {/* Stats Card */}
          <Card style={styles.statsCard}>
            <View style={styles.statsRow}>
              {[
                { label: 'Status', value: 'Active', color: COLORS.success },
                { label: 'Provider', value: user?.authProvider === 'google' ? 'Google' : 'Email', color: COLORS.primary },
                { label: 'Account', value: 'Free', color: COLORS.warning },
              ].map((stat, i) => (
                <View key={i} style={styles.statItem}>
                  <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </Card>

          {/* Logout Button */}
          <Button
            title="Sign Out"
            variant="danger"
            onPress={handleLogout}
            leftIcon={<Ionicons name="log-out-outline" size={18} color={COLORS.white} />}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  header: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl + 16,
    paddingBottom: SPACING.xl,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  greeting: { fontSize: 14, color: COLORS.textMuted },
  userName: { fontSize: 24, fontWeight: '800', color: COLORS.text, marginTop: 2 },
  logoutBtn: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatarSection: { alignItems: 'center' },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  avatarFallback: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.primaryLight,
  },
  avatarInitials: {
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.white,
  },
  badgeRow: { marginTop: 12 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.success}22`,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    gap: 6,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
  },
  badgeText: { fontSize: 12, color: COLORS.success, fontWeight: '700' },
  content: { padding: SPACING.lg, gap: SPACING.md },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoIconWrap: {
    width: 36,
    height: 36,
    backgroundColor: `${COLORS.primary}22`,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 11, color: COLORS.textDim, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 14, color: COLORS.text, fontWeight: '500', marginTop: 2 },
  statsCard: { paddingVertical: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center', gap: 4 },
  statValue: { fontSize: 15, fontWeight: '800' },
  statLabel: { fontSize: 11, color: COLORS.textDim, fontWeight: '600', textTransform: 'uppercase' },
});

export default HomeScreen;
