// path: src/screens/DashboardScreen.js
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  Switch,
  Modal,
  Pressable,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { CAMS } from '../constants/cams'; // { id, name, url, snapshot/thumb }
import {
  startCamera,
  stopCamera,
  recordCamera,
  startAll,
  stopAll,
  recordAll,
} from '../lib/api';

export default function DashboardScreen() {
  // ----- state -----
  const [running, setRunning] = useState(false);    // pipeline on/off
  const [recording, setRecording] = useState(false); // saving video on/off
  const [personOn, setPersonOn] = useState(true);
  const [objectOn, setObjectOn] = useState(true);
  const [zonesOn, setZonesOn] = useState(true);

  // camera selector
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeCam, setActiveCam] =
    useState(CAMS?.[0] || { id: 'cam1', name: 'Camera 1 - Front Door' });

  const isAll = activeCam?.id === 'all';
  const statusLabel = recording ? 'Recording' : running ? 'Live' : 'Idle';

  // derive a display image (snapshot/thumb -> fallback) for single-camera preview
  const previewSrc = useMemo(() => {
    return (
      activeCam?.snapshot ||
      activeCam?.thumb ||
      'https://images.unsplash.com/photo-1556229162-5c63ed9c3c56?q=80&w=1600'
    );
  }, [activeCam]);

  const cams = [
    { name: 'Camera 1', sub: '', status: 'Online • Recording', color: '#10b981' },
    { name: 'Camera 2', sub: '', status: 'Online • Standby',   color: '#22d3ee' },
    { name: 'Camera 3', sub: '',    status: 'Offline • Motion',    color: '#60a5fa' },
    { name: 'Camera 4', sub: '',  status: 'Offline • No Signal',color: '#ef4444' },
  ];

  const alerts = [
    { icon: 'alert-triangle', color: '#f43f5e', title: 'Motion Detected', meta: 'Cam 1 - unusual activity', ago: '2m' },
    { icon: 'user',           color: '#f59e0b', title: 'Person Detected', meta: 'Cam 2 - approaching person', ago: '5m' },
    
  ];

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 28 }}>
      {/* Header */}
      <View style={s.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={s.dotLive} />
          <Text style={s.appTitle}>Distro Track</Text>
        </View>
        <View style={s.pillLive}>
          <View style={s.pillDot} />
          <Text style={s.pillText}>Live</Text>
        </View>
      </View>

      {/* Active camera selector */}
      <View style={s.rowBetween}>
        <Text style={s.sectionLabel}>Active Camera:</Text>
        <TouchableOpacity style={s.selector} onPress={() => setMenuOpen(true)}>
          <View style={s.selectorDot} />
          <Text style={s.selectorText}>{activeCam?.name || 'Select camera'}</Text>
          <Feather name="chevron-down" size={18} color="#cbd5e1" />
        </TouchableOpacity>
      </View>

      {/* Dropdown modal (includes “All Cameras”) */}
      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={s.backdrop} onPress={() => setMenuOpen(false)}>
          <View style={s.menu}>
            {[{ id: 'all', name: 'All Cameras' }, ...(CAMS?.length ? CAMS : [{ id: 'cam1', name: 'Camera 1 - Front Door' }])].map((cam) => (
              <Pressable
                key={cam.id}
                style={s.menuItem}
                onPress={() => {
                  setActiveCam(cam);
                  setMenuOpen(false);
                }}
              >
                <Text style={s.menuText}>{cam.name}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Preview card */}
      <View style={s.previewCard}>
        {isAll ? (
          // ---- 2x2 grid when “All Cameras” selected ----
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {(CAMS || []).slice(0, 4).map((cam) => (
              <View key={cam.id} style={s.gridTile}>
                <ImageBackground
                  source={{
                    uri:
                      cam.snapshot ||
                      cam.thumb ||
                      'https://images.unsplash.com/photo-1556229162-5c63ed9c3c56?q=80&w=1600',
                  }}
                  style={s.gridTileImg}
                  resizeMode="cover"
                >
                  <View style={s.gridTileLabel}>
                    <Text style={{ color: '#e2e8f0', fontWeight: '700', fontSize: 12 }}>
                      {cam.name}
                    </Text>
                  </View>
                </ImageBackground>
              </View>
            ))}
          </View>
        ) : (
          // ---- single camera preview ----
          <ImageBackground source={{ uri: previewSrc }} style={s.previewImage} resizeMode="cover">
            <View style={s.previewOverlay}>
              <Text style={s.badge}>1920x1080 • 30 FPS</Text>
              <View style={s.recBadge}>
                <View style={[s.recDot, { backgroundColor: recording ? '#ef4444' : '#64748b' }]} />
                <Text style={s.recText}>{recording ? 'REC' : running ? 'LIVE' : 'IDLE'}</Text>
              </View>

              {/* Example detection tag */}
              <View style={[s.tag, { left: 12, top: 50, backgroundColor: '#064e3b' }]}>
                <View style={[s.tagDot, { backgroundColor: '#10b981' }]} />
                <Text style={s.tagText}>Person #1</Text>
              </View>

              {/* Zoom buttons (no-op now) */}
              <View style={s.zoomCol}>
                <TouchableOpacity style={s.zoomBtn}>
                  <Feather name="plus" size={18} color="#e2e8f0" />
                </TouchableOpacity>
                <TouchableOpacity style={s.zoomBtn}>
                  <Feather name="minus" size={18} color="#e2e8f0" />
                </TouchableOpacity>
              </View>
            </View>
          </ImageBackground>
        )}
      </View>

      {/* Live Controls */}
      <Card title="Live Controls" rightLabel={statusLabel}>
        <View style={s.controlsRow}>
          <ActionButton
            icon="play"
            label="Start"
            onPress={async () => {
              try {
                if (isAll) await startAll();
                else await startCamera(activeCam.id);
                setRunning(true);
              } catch (e) {
                console.warn(e);
              }
            }}
          />
          <ActionButton
            icon="square"
            label="Stop"
            onPress={async () => {
              try {
                if (isAll) await stopAll();
                else await stopCamera(activeCam.id);
                setRunning(false);
                setRecording(false);
              } catch (e) {
                console.warn(e);
              }
            }}
          />
          <ActionButton
            icon="circle"
            label="Record"
            onPress={async () => {
              try {
                if (isAll) await recordAll(true);
                else await recordCamera(activeCam.id, true);
                setRunning(true);   // recording implies running
                setRecording(true);
              } catch (e) {
                console.warn(e);
              }
            }}
          />
        </View>
      </Card>

      {/* Detection Settings (Vehicle Detection removed) */}
      <Card title="Detection Settings">
        <ToggleRow label="Person Detection" value={personOn} onValueChange={setPersonOn} />
        <ToggleRow label="Object Tracking" value={objectOn} onValueChange={setObjectOn} />
        <ToggleRow label="Motion Zones" value={zonesOn} onValueChange={setZonesOn} />
      </Card>

      {/* Camera Status */}
      <Card title="Camera Status">
        <View style={s.grid}>
          {cams.map((c, i) => (
            <View key={i} style={s.camCard}>
              <View style={s.rowBetween}>
                <Text style={s.camTitle}>{c.name}</Text>
                <View style={[s.statusDot, { backgroundColor: c.color }]} />
              </View>
              <Text style={s.camSub}>{c.sub}</Text>
              <Text style={s.camStatus}>{c.status}</Text>
            </View>
          ))}
        </View>
      </Card>

      {/* Recent Alerts */}
      <Card title="Recent Alerts" linkText="View All">
        {alerts.map((a, i) => (
          <View key={i} style={s.alertRow}>
            <View style={[s.alertIcon, { backgroundColor: a.color + '33' }]}>
              <Feather name={a.icon} size={16} color={a.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.alertTitle}>{a.title}</Text>
              <Text style={s.alertMeta}>{a.meta}</Text>
            </View>
            <Text style={s.alertAgo}>{a.ago} ago</Text>
          </View>
        ))}
      </Card>

      {/* Quick Actions */}
      {/* 
      <Card title="Quick Actions">
        <View style={s.actionsGrid}>
          <SquareAction icon="download" label="Export Video" />
          <SquareAction icon="share-2" label="Share Feed" />
          <SquareAction icon="bell" label="Alert Settings" />
          <SquareAction icon="cloud" label="Cloud Sync" />
        </View>
      </Card>
      */}
    </ScrollView>
  );
}

/* small building blocks */
function Card({ title, rightLabel, linkText, children }) {
  return (
    <View style={s.card}>
      <View style={s.cardHead}>
        <Text style={s.cardTitle}>{title}</Text>
        {rightLabel ? <Text style={s.cardBadge}>{rightLabel}</Text> : null}
        {linkText ? <Text style={s.linkText}>{linkText}</Text> : null}
      </View>
      {children}
    </View>
  );
}
function ActionButton({ icon, label, onPress }) {
  return (
    <TouchableOpacity style={s.actionBtn} onPress={onPress}>
      <Feather name={icon} size={18} color="#0f172a" />
      <Text style={s.actionText}>{label}</Text>
    </TouchableOpacity>
  );
}
function ToggleRow({ label, value, onValueChange }) {
  return (
    <View style={s.toggleRow}>
      <Text style={s.toggleLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        thumbColor={value ? '#22d3ee' : '#334155'}
      />
    </View>
  );
}
function SquareAction({ icon, label }) {
  return (
    <TouchableOpacity style={s.squareAction}>
      <Feather name={icon} size={18} color="#e2e8f0" />
      <Text style={s.squareActionText}>{label}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1220', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  dotLive: { width: 10, height: 10, borderRadius: 999, backgroundColor: '#22c55e' },
  appTitle: { color: '#e2e8f0', fontSize: 18, fontWeight: '700' },
  pillLive: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f172a', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: '#1f2937', gap: 6 },
  pillDot: { width: 8, height: 8, borderRadius: 999, backgroundColor: '#22c55e' },
  pillText: { color: '#94a3b8', fontWeight: '600' },

  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 8 },
  sectionLabel: { color: '#94a3b8', fontSize: 12 },
  selector: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#0f172a', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: '#1e293b' },
  selectorDot: { width: 8, height: 8, borderRadius: 999, backgroundColor: '#22d3ee' },
  selectorText: { color: '#cbd5e1', fontWeight: '600' },

  // dropdown menu
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'flex-start', paddingTop: 80 },
  menu: { marginHorizontal: 16, backgroundColor: '#0f172a', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#334155' },
  menuItem: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  menuText: { color: '#e2e8f0', fontSize: 14 },

  // preview
  previewCard: { borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#1e293b', marginTop: 8, marginBottom: 14 },
  previewImage: { width: '100%', height: 180 },
  previewOverlay: { flex: 1, padding: 10 },
  badge: { alignSelf: 'flex-start', backgroundColor: '#0f172a', color: '#cbd5e1', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: '#1e293b', fontSize: 12, fontWeight: '600' },
  recBadge: { position: 'absolute', right: 10, top: 10, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#0f172a', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#1e293b' },
  recDot: { width: 8, height: 8, borderRadius: 999 },
  recText: { color: '#e2e8f0', fontWeight: '700', letterSpacing: 1 },

  // single-cam overlay bits
  tag: { position: 'absolute', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: '#1e293b' },
  tagDot: { width: 8, height: 8, borderRadius: 999 },

  // all-cams grid
  gridTile: { width: '50%', aspectRatio: 16 / 9, borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#1e293b' },
  gridTileImg: { flex: 1 },
  gridTileLabel: { position: 'absolute', left: 6, bottom: 6, backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },

  // common overlay controls
  zoomCol: { position: 'absolute', right: 10, bottom: 10, gap: 8 },
  zoomBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', alignItems: 'center', justifyContent: 'center' },

  // cards
  card: { backgroundColor: '#0F172A', borderRadius: 16, padding: 14, marginTop: 12, borderWidth: 1, borderColor: '#1E293B' },
  cardHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  cardTitle: { color: '#e2e8f0', fontWeight: '700', fontSize: 16, flex: 1 },
  cardBadge: { color: '#22d3ee', fontWeight: '700' },
  linkText: { color: '#60a5fa', fontWeight: '600' },

  controlsRow: { flexDirection: 'row', gap: 10 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#22d3ee', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12 },
  actionText: { color: '#0f172a', fontWeight: '800' },

  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  toggleLabel: { color: '#cbd5e1', fontWeight: '600' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  camCard: { width: '48%', backgroundColor: '#0b1220', borderWidth: 1, borderColor: '#1e293b', borderRadius: 12, padding: 10 },
  camTitle: { color: '#e2e8f0', fontWeight: '700' },
  camSub: { color: '#94a3b8', marginTop: 2, fontSize: 12 },
  camStatus: { color: '#a3e635', marginTop: 4, fontSize: 12 },
  statusDot: { width: 8, height: 8, borderRadius: 999 },

  alertRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  alertIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  alertTitle: { color: '#e2e8f0', fontWeight: '700' },
  alertMeta: { color: '#94a3b8', fontSize: 12 },
  alertAgo: { color: '#64748b', fontSize: 12 },

  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  squareAction: { width: '48%', backgroundColor: '#0b1220', borderWidth: 1, borderColor: '#1e293b', borderRadius: 12, padding: 12, alignItems: 'center', gap: 8 },
  squareActionText: { color: '#cbd5e1', fontWeight: '700', textAlign: 'center' },
});
