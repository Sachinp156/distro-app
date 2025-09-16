// src/screens/WelcomeScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function WelcomeScreen() {
  const navigation = useNavigation();

  const openDashboard = () => navigation.navigate('Main');
  const openCameras = () => navigation.navigate('Main', { screen: 'Cameras' });
  const openAlerts = () => navigation.navigate('Main', { screen: 'Alerts' });

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Feather name="camera" size={28} color="#22d3ee" />
        <Text style={s.title}>DistroTrack</Text>
        <Text style={s.subtitle}>Multi-camera live monitoring</Text>
      </View>

      <View style={s.btnCol}>
        <TouchableOpacity style={[s.btn, s.btnPrimary]} onPress={openDashboard} activeOpacity={0.9}>
          <Feather name="monitor" size={18} color="#0B1220" />
          <Text style={s.btnPrimaryText}>Start Monitoring</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[s.btn, s.btnOutline]} onPress={openCameras} activeOpacity={0.9}>
          <Feather name="camera" size={18} color="#1a73e8" />
          <Text style={s.btnOutlineText}>Go to Cameras</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[s.linkBtn]} onPress={openAlerts} activeOpacity={0.8}>
          <Feather name="bell" size={16} color="#60a5fa" />
          <Text style={s.linkText}>View Alerts</Text>
        </TouchableOpacity>
      </View>

      <Text style={s.tip}>Tip: Tap a camera tile to view fullscreen.</Text>
      <Text style={s.footer}>v0.1 • Expo • React Native</Text>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1220', padding: 24, alignItems: 'center', justifyContent: 'center' },
  header: { alignItems: 'center', gap: 8, marginBottom: 28 },
  title: { fontSize: 28, fontWeight: '800', color: '#E2E8F0' },
  subtitle: { fontSize: 14, color: '#94A3B8', textAlign: 'center' },

  btnCol: { width: '100%', maxWidth: 420, gap: 12 },
  btn: { height: 48, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  btnPrimary: { backgroundColor: '#22d3ee' },
  btnPrimaryText: { color: '#0B1220', fontWeight: '800', fontSize: 16 },

  btnOutline: { borderWidth: 1, borderColor: '#1a73e8', backgroundColor: 'transparent' },
  btnOutlineText: { color: '#1a73e8', fontWeight: '700', fontSize: 16 },

  linkBtn: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6 },
  linkText: { color: '#60a5fa', fontWeight: '700' },

  tip: { color: '#94A3B8', fontSize: 12, marginTop: 18 },
  footer: { color: '#475569', fontSize: 11, marginTop: 6 },
});
