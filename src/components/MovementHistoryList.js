// src/components/MovementHistoryList.js
import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

export default function MovementHistoryList({ tracks }) {
  // tracks: array from useCamTracks().activeTracks
  if (!tracks?.length) {
    return (
      <View style={s.empty}>
        <Text style={s.emptyTxt}>No active tracks</Text>
      </View>
    );
  }

  return (
    <View style={s.wrap}>
      <Text style={s.title}>Recent Movement History</Text>
      {tracks.map((t) => (
        <View key={`g-${t.globalId}`} style={s.card}>
          <View style={s.rowHeader}>
            <Text style={s.gid}>Global ID: {t.globalId}</Text>
            {typeof t.confidence === 'number' && (
              <Text style={s.conf}>
                {(t.confidence * 100).toFixed(1)}%
              </Text>
            )}
          </View>

          <View style={s.grid}>
            <KV label="Local ID" value={String(t.localId ?? '-')} />
            <KV
              label={t.world ? 'World Coords (x,y)' : 'Image Coords (u,v)'}
              value={
                t.last
                  ? `${t.last.x.toFixed(1)}, ${t.last.y.toFixed(1)}`
                  : '-'
              }
            />
            <KV label="Points" value={String(t.history.length)} />
            <KV
              label="Last update"
              value={
                t.last ? new Date(t.last.t * 1000).toLocaleTimeString() : '-'
              }
            />
          </View>

          {/* Tiny timeline of last few points (text-based) */}
          <FlatList
            data={[...t.history].slice(-8).reverse()}
            keyExtractor={(p, idx) => `${t.globalId}-${idx}`}
            renderItem={({ item }) => (
              <Text style={s.histLine}>
                {new Date(item.t * 1000).toLocaleTimeString()} → (
                {item.x.toFixed(1)}, {item.y.toFixed(1)}) {item.space}
              </Text>
            )}
          />
        </View>
      ))}
    </View>
  );
}

function KV({ label, value }) {
  return (
    <View style={s.kv}>
      <Text style={s.kLabel}>{label}</Text>
      <Text style={s.kVal}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: 12 },
  title: { color: '#e2e8f0', fontWeight: '800', marginBottom: 8, fontSize: 16 },
  empty: {
    marginTop: 12, padding: 12,
    borderRadius: 10, borderWidth: 1, borderColor: '#1e293b',
    backgroundColor: '#0f172a',
  },
  emptyTxt: { color: '#94a3b8' },

  card: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  gid: { color: '#93c5fd', fontWeight: '800' },
  conf: { color: '#22c55e', fontWeight: '800' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  kv: {
    paddingVertical: 6, paddingHorizontal: 8,
    backgroundColor: '#0b1220',
    borderWidth: 1, borderColor: '#1e293b',
    borderRadius: 8,
  },
  kLabel: { color: '#94a3b8', fontSize: 12 },
  kVal: { color: '#e2e8f0', fontWeight: '700' },

  histLine: { color: '#94a3b8', fontFamily: 'System', fontSize: 12 },
});
