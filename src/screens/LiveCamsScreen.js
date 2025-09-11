import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { CAMS } from '../constants/cams';
import { useAlertStore } from '../state/useAlertStore';

export default function LiveCamsScreen() {
  const [fullscreen, setFullscreen] = useState(null);
  const pushAlert = useAlertStore((s) => s.push);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Live Cameras</Text>
        <TouchableOpacity
          style={styles.testBtn}
          onPress={() => pushAlert({ severity: 'high', title: 'Zone Breach', message: 'P-024 entered Z-3' })}
        >
          <Text style={styles.testBtnText}>Test Alert</Text>
        </TouchableOpacity>
      </View>
    
    
      <FlatList
        data={CAMS}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <TouchableOpacity activeOpacity={0.9} onPress={() => setFullscreen(item)} style={styles.tileWrap}>
            <CamPlayer url={item.url} autoPlay muted />
            <View style={styles.labelWrap}><Text style={styles.label}>{item.name}</Text></View>
          </TouchableOpacity>
        )}
      />

      <Modal visible={!!fullscreen} animationType="slide" onRequestClose={() => setFullscreen(null)}>
        <View style={styles.modal}>
          {fullscreen && <CamPlayer url={fullscreen.url} autoPlay muted={false} />}
          <Text style={styles.modalLabel}>{fullscreen?.name}</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={() => setFullscreen(null)}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

function CamPlayer({ url, autoPlay, muted }) {
  const ref = useRef(null);
  return (
    <Video
      ref={ref}
      source={{ uri: url }}
      useNativeControls={false}
      resizeMode={ResizeMode.COVER}
      shouldPlay={!!autoPlay}
      isMuted={!!muted}
      isLooping
      style={styles.video}
    />
  );
}

const GAP = 8;
const { width } = Dimensions.get('window');
const TILE_W = (width - GAP * 3) / 2;
const TILE_H = Math.round((TILE_W * 9) / 16);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1220', paddingTop: 8 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, marginBottom: 8 },
  title: { fontSize: 18, fontWeight: '800', color: '#E2E8F0' },
  testBtn: { backgroundColor: '#1a73e8', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  testBtnText: { color: '#fff', fontWeight: '700' },

  grid: { paddingHorizontal: GAP, paddingBottom: GAP },
  row: { justifyContent: 'space-between', marginBottom: GAP },

  tileWrap: { width: TILE_W, height: TILE_H, borderRadius: 10, overflow: 'hidden', backgroundColor: '#000' },
  video: { width: '100%', height: '100%' },

  labelWrap: { position: 'absolute', left: 6, bottom: 6, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  label: { color: '#fff', fontWeight: '600' },

  modal: { flex: 1, backgroundColor: '#000', justifyContent: 'flex-end' },
  modalLabel: { position: 'absolute', top: 12, left: 12, color: '#fff', fontSize: 16, fontWeight: '700', backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  closeBtn: { alignSelf: 'center', marginBottom: 28, backgroundColor: '#333', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
});
