// src/screens/LiveCamsScreen.js
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SERVER } from '../constants/server';
import { CAMS } from '../constants/cams';
import CamMjpegView from '../components/CamMjpegView';

const streamUrl = (id) => `${SERVER}/stream/${id}`;

export default function LiveCamsScreen() {
  const cams = useMemo(
    () => (CAMS || []).map((c) => ({ ...c, stream: streamUrl(c.id) })),
    []
  );

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 12 }}>
      <Text style={s.h1}>Live Cameras</Text>

      <View style={s.grid}>
        {cams.map((c) => (
          <View key={c.id} style={s.tile}>
            {/* grid uses player without overlay to save CPU; pass camId if you want overlay here too */}
            <CamMjpegView src={c.stream} label={c.name} />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1220' },
  h1: { color: '#e2e8f0', fontSize: 20, fontWeight: '800', marginBottom: 10, paddingHorizontal: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: {
    width: '48%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
});
