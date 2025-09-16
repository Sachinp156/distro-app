// src/screens/DashboardScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import CamPlayer from '../components/CamAutoView';
import { CAMS } from '../constants/cams';
import { useAlertStore } from '../state/useAlertStore';

export default function DashboardScreen() {
  const [selectedCam, setSelectedCam] = useState(null);
  const pushAlert = useAlertStore((s) => s.push);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Live Feed</Text>
        <TouchableOpacity
          style={styles.alertBtn}
          onPress={() => pushAlert({ message: '⚠️ Test alert from Dashboard' })}
        >
          <Text style={styles.alertText}>Trigger Alert</Text>
        </TouchableOpacity>
      </View>

      {/* Default: show first camera */}
      <View style={styles.preview}>
        <CamPlayer camId={CAMS[0].id} />
      </View>

      {/* Optional: allow fullscreen when tapped */}
      <TouchableOpacity
        onPress={() => setSelectedCam(CAMS[0].id)}
        style={styles.fullBtn}
      >
        <Text style={styles.fullText}>View Fullscreen</Text>
      </TouchableOpacity>

      <Modal visible={!!selectedCam} animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'black' }}>
          <CamPlayer camId={selectedCam} />
          <TouchableOpacity
            onPress={() => setSelectedCam(null)}
            style={styles.closeBtn}
          >
            <Text style={{ color: 'white' }}>✕ Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1220', padding: 10 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: { fontSize: 18, color: 'white', fontWeight: 'bold' },
  alertBtn: {
    backgroundColor: '#f43f5e',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  alertText: { color: 'white', fontWeight: 'bold' },
  preview: { flex: 1, borderRadius: 8, overflow: 'hidden' },
  fullBtn: {
    backgroundColor: '#22d3ee',
    padding: 10,
    alignItems: 'center',
    marginTop: 10,
    borderRadius: 6,
  },
  fullText: { color: '#0B1220', fontWeight: 'bold' },
  closeBtn: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
    borderRadius: 6,
  },
});
