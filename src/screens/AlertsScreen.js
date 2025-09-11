import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AlertsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Alerts</Text>
      <Text style={styles.subtitle}>No alerts yet</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1220', justifyContent: 'center', alignItems: 'center', padding: 16 },
  title: { fontSize: 20, fontWeight: '800', color: '#E2E8F0', marginBottom: 8 },
  subtitle: { color: '#94A3B8' },
});
