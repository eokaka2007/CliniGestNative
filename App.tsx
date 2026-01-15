import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Platform, FlatList } from 'react-native';
import { ShieldCheck, Activity, FileText, Plus, ArrowLeft, Calendar } from 'lucide-react-native';
import { EquipamentosMock } from './src/database';

export default function App() {
  const [screen, setScreen] = useState('dashboard');

  // TELA DE LISTAGEM DE EQUIPAMENTOS (Baseada no 2.sql)
  if (screen === 'equipamentos') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setScreen('dashboard')} style={styles.backBtn}>
            <ArrowLeft color="#1E293B" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Equipamentos</Text>
        </View>

        <FlatList
          data={EquipamentosMock}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item }) => (
            <View style={styles.equipmentCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.equipmentName}>{item.name}</Text>
                <View style={[styles.badge, { backgroundColor: item.status === 'Regular' ? '#D1FAE5' : '#FEE2E2' }]}>
                  <Text style={{ fontSize: 10, color: item.status === 'Regular' ? '#059669' : '#DC2626' }}>{item.status}</Text>
                </View>
              </View>
              <Text style={styles.equipmentDetail}>{item.manufacturer} - {item.model}</Text>
              <View style={styles.dateRow}>
                <Calendar size={14} color="#64748B" />
                <Text style={styles.dateText}>Calibração: {item.calibration_due_date}</Text>
              </View>
            </View>
          )}
        />
        <TouchableOpacity style={styles.fab} onPress={() => alert('Novo Equipamento (Campos do 2.sql)')}>
          <Plus color="white" size={30} />
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // TELA DASHBOARD
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>CliniGest</Text>
          <Text style={styles.headerSubtitle}>Gestão Sanitária</Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1, padding: 20 }}>
        <View style={styles.summaryCard}>
          <ShieldCheck color="white" size={32} />
          <Text style={styles.summaryText}>Clínica Regularizada</Text>
          <Text style={styles.summarySub}>Tudo certo com a Vigilância Sanitária.</Text>
        </View>

        <Text style={styles.sectionTitle}>Módulos Ativos</Text>

        <TouchableOpacity style={styles.moduleRow} onPress={() => setScreen('equipamentos')}>
          <View style={[styles.iconBox, { backgroundColor: '#DBEAFE' }]}>
            <Activity color="#2563EB" size={24} />
          </View>
          <View>
            <Text style={styles.moduleTitle}>Equipamentos</Text>
            <Text style={styles.moduleDesc}>Gerenciar Manutenções</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.moduleRow} onPress={() => alert('Módulo Documentos (7.sql)')}>
          <View style={[styles.iconBox, { backgroundColor: '#D1FAE5' }]}>
            <FileText color="#059669" size={24} />
          </View>
          <View>
            <Text style={styles.moduleTitle}>Documentos</Text>
            <Text style={styles.moduleDesc}>Alvarás e Laudos</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', flexDirection: 'row', alignItems: 'center' },
  backBtn: { marginRight: 15 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1E293B' },
  headerSubtitle: { fontSize: 10, color: '#64748B', letterSpacing: 1 },
  summaryCard: { backgroundColor: '#2563EB', padding: 20, borderRadius: 20, marginBottom: 25 },
  summaryText: { color: 'white', fontSize: 18, fontWeight: 'bold', marginTop: 10 },
  summarySub: { color: '#BFDBFE', fontSize: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#475569', marginBottom: 15 },
  moduleRow: { flexDirection: 'row', backgroundColor: 'white', padding: 15, borderRadius: 15, marginBottom: 12, alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  iconBox: { padding: 12, borderRadius: 12, marginRight: 15 },
  moduleTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  moduleDesc: { fontSize: 12, color: '#94A3B8' },
  equipmentCard: { backgroundColor: 'white', padding: 15, borderRadius: 15, marginBottom: 15, borderWidth: 1, borderColor: '#E2E8F0' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  equipmentName: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  equipmentDetail: { fontSize: 13, color: '#64748B', marginTop: 2 },
  dateRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  dateText: { fontSize: 12, color: '#64748B', marginLeft: 5 },
  fab: { position: 'absolute', bottom: 30, right: 30, backgroundColor: '#1E293B', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5 }
});