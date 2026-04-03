import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { listMedicationsService } from '../../services/medicationService';
import Card from '../../components/Card';
import { COLORS, SPACING } from '../../constants';

export default function MedicationsScreen({ navigation }) {
    const [meds, setMeds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchMeds = async () => {
        try {
            setLoading(true);
            const res = await listMedicationsService();
            if (res.success) setMeds(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchMeds();
    }, []);

    return (
        <View style={styles.flex}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.title}>Medicine Cabinet</Text>
                <TouchableOpacity onPress={() => {}}>
                    <Ionicons name="add-circle" size={32} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView 
                style={styles.scroll} 
                contentContainerStyle={styles.container}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchMeds(); }} tintColor={COLORS.primary} />}
            >
                {loading && !refreshing ? (
                    <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
                ) : meds.length === 0 ? (
                    <Card style={styles.emptyCard}>
                        <Ionicons name="trash-outline" size={48} color="#27272A" />
                        <Text style={styles.emptyText}>Your cabinet is empty.</Text>
                    </Card>
                ) : meds.map(med => (
                    <Card key={med.id} style={styles.medCard}>
                        <View style={styles.medHeader}>
                            <View style={styles.medIcon}>
                                <Ionicons name="medical" size={24} color={COLORS.primary} />
                            </View>
                            <View style={styles.medInfo}>
                                <Text style={styles.medName}>{med.name}</Text>
                                <Text style={styles.medDosage}>{med.dosage}</Text>
                            </View>
                        </View>
                        <View style={styles.medDetails}>
                            <View style={styles.detailItem}>
                                <Ionicons name="repeat" size={14} color="#52525B" />
                                <Text style={styles.detailText}>{med.frequency}</Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Ionicons name="time-outline" size={14} color="#52525B" />
                                <Text style={styles.detailText}>{med.times?.join(', ')}</Text>
                            </View>
                        </View>
                    </Card>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1, backgroundColor: '#000000' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: '#0A0A0A',
    },
    title: { fontSize: 20, fontWeight: '800', color: 'white' },
    scroll: { flex: 1 },
    container: { padding: SPACING.lg },
    medCard: { marginBottom: 16, padding: 16, backgroundColor: '#0A0A0A' },
    medHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    medIcon: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: '#1E293B',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    medInfo: { flex: 1 },
    medName: { fontSize: 18, fontWeight: '700', color: 'white' },
    medDosage: { fontSize: 14, color: '#A1A1AA', marginTop: 2 },
    medDetails: {
        flexDirection: 'row',
        gap: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#1F1F23',
    },
    detailItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    detailText: { fontSize: 12, color: '#52525B', fontWeight: '600' },
    emptyCard: { padding: 60, alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed', borderWidth: 2, borderColor: '#1F1F23', backgroundColor: 'transparent' },
    emptyText: { color: '#52525B', fontWeight: '600', marginTop: 12 },
});
