import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  FlatList,
  Dimensions,
} from 'react-native';
import Svg, { Polyline } from 'react-native-svg';

import CamAutoView from '../components/CamAutoView';   // iOS=WebSocket frames, others=MJPEG
import { SERVER } from '../constants/server';
import { CAMS } from '../constants/cams';

const streamUrl = (id) => `${SERVER}/stream/${id}`;

const GAP = 12;
const W = Dimensions.get('window').width;
const TILE_W = (W - GAP * 3) / 2;
const TILE_H = Math.round((TILE_W * 9) / 16);

// How many points to keep for each path on iOS overlay
const MAX_POINTS = 80;
// How many movement lines to remember in the panel
const MAX_HISTORY_ROWS = 120;

/* -------------------------------------------------------------
 * Movement aggregator (subscribes to WS for all cams)
 * -----------------------------------------------------------*/
function useMovementHistory(camIds) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const sockets = [];
    camIds.forEach((camId) => {
      const url = SERVER.replace(/^http/i, 'ws') + `/ws/${camId}`;
      const ws = new WebSocket(url);
      sockets.push(ws);

      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          const ts = msg.timestamp ?? Date.now() / 1000;
          // msg.tracks: [{track_id, bbox:[x,y,w,h], global_id?, world_xy?}, ...]
          (msg.tracks || []).forEach((t) => {
            const [x, y, w, h] = t.bbox || [0, 0, 0, 0];
            const u = Math.round(x + w / 2);
            const v = Math.round(y + h);
            const gid = t.global_id ?? t.track_id;
            setRows((prev) => {
              const next = [
                {
                  id: `${camId}-${gid}-${ts}-${u}-${v}`,
                  camId,
                  gid,
                  uv: [u, v],
                  world: t.world_xy || null,
                  ts,
                },
                ...prev,
              ].slice(0, MAX_HISTORY_ROWS);
              return next;
            });
          });
        } catch {
          /* ignore */
        }
      };
    });

    return () => sockets.forEach((s) => s && s.close());
  }, [camIds.join('|')]);

  return rows;
}

/* -------------------------------------------------------------
 * iOS-only overlay that draws blue trajectories from WS tracks
 * -----------------------------------------------------------*/
function TrackOverlayIOS({ camId, containerSize }) {
  // Keep per-track polyline points in image pixel space (u,v)
  const [paths, setPaths] = useState({}); // { gid: [{u,v}, ...] }
  const frameSizeRef = useRef({ w: 0, h: 0 });

  useEffect(() => {
    if (Platform.OS !== 'ios') return;

    const wsUrl = SERVER.replace(/^http/i, 'ws') + `/ws/${camId}`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        const fw = msg.frame_w || frameSizeRef.current.w || 0;
        const fh = msg.frame_h || frameSizeRef.current.h || 0;
        if (fw && fh) frameSizeRef.current = { w: fw, h: fh };

        const next = { ...paths };
        (msg.tracks || []).forEach((t) => {
          const gid = t.global_id ?? t.track_id;
          const [x, y, w, h] = t.bbox || [0, 0, 0, 0];
          const u = x + w / 2;
          const v = y + h;
          const arr = next[gid] ? [...next[gid], { u, v }] : [{ u, v }];
          next[gid] = arr.slice(-MAX_POINTS);
        });
        setPaths(next);
      } catch {
        /* ignore */
      }
    };

    return () => ws.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camId, Platform.OS]);

  // scale points from frame pixels -> container pixels
  const scalePoint = (p) => {
    const { w: fw, h: fh } = frameSizeRef.current;
    const { width: cw, height: ch } = containerSize || {};
    if (!fw || !fh || !cw || !ch) return null;
    const sx = cw / fw;
    const sy = ch / fh;
    return { x: p.u * sx, y: p.v * sy };
  };

  const gidList = Object.keys(paths);

  if (Platform.OS !== 'ios' || gidList.length === 0) {
    return null;
  }

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%">
        {gidList.map((gid) => {
          const pts = paths[gid]
            .map(scalePoint)
            .filter(Boolean)
            .map((p) => `${p.x},${p.y}`)
            .join(' ');
          if (!pts) return null;
          return (
            <Polyline
              key={gid}
              points={pts}
              stroke="#3b82f6"
              strokeWidth={3}
              fill="none"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          );
        })}
      </Svg>
    </View>
  );
}

/* -------------------------------------------------------------
 * Camera tile with video + iOS overlay
 * -----------------------------------------------------------*/
function CamTile({ cam }) {
  const [size, setSize] = useState({ width: TILE_W, height: TILE_H });

  return (
    <View style={styles.tile}>
      <View
        style={styles.playerTile}
        onLayout={(e) => setSize(e.nativeEvent.layout)}
      >
        <CamAutoView
          camId={cam.id}
          src={cam.stream}
          label={cam.name}
          style={{ width: '100%', height: '100%' }}
        />
        {/* iOS-only overlay to show the blue trajectory */}
        <TrackOverlayIOS camId={cam.id} containerSize={size} />
      </View>
      <Text style={styles.srcText}>{cam.name}</Text>
    </View>
  );
}

/* -------------------------------------------------------------
 * Movement history panel
 * -----------------------------------------------------------*/
function MovementHistoryPanel({ cams }) {
  const rows = useMovementHistory(cams.map((c) => c.id));

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <Text style={styles.rowText}>
        <Text style={styles.rowDim}>{new Date(item.ts * 1000).toLocaleTimeString()}</Text>
        {'  •  '}
        <Text style={styles.rowCam}>{item.camId}</Text>
        {'  •  '}
        <Text style={styles.rowText}>G{item.gid}</Text>
        {'  •  '}
        <Text style={styles.rowDim}>
          {item.world
            ? `world(${item.world[0].toFixed(1)}, ${item.world[1].toFixed(1)})`
            : `uv(${item.uv[0]}, ${item.uv[1]})`}
        </Text>
      </Text>
    </View>
  );

  return (
    <View style={styles.historyWrap}>
      <Text style={styles.sectionTitle}>Movement History</Text>
      <FlatList
        data={rows}
        keyExtractor={(it) => it.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: 4 }}
      />
    </View>
  );
}

/* -------------------------------------------------------------
 * Main screen
 * -----------------------------------------------------------*/
export default function DashboardScreen() {
  // prepare camera list with stream URLs
  const cams = useMemo(
    () => (CAMS || []).map((c) => ({ ...c, stream: streamUrl(c.id) })),
    []
  );

  return (
    <FlatList
      // One big FlatList page (avoids nested-ScrollView warnings)
      ListHeaderComponent={
        <>
          <Text style={styles.h1}>Live Cameras</Text>
          {/* 2×2 grid */}
          <View style={styles.gridWrap}>
            {cams.map((c) => (
              <CamTile key={c.id} cam={c} />
            ))}
          </View>

          {/* Movement history from all cameras */}
          <MovementHistoryPanel cams={cams} />
        </>
      }
      data={[]} // nothing; we only use header
      renderItem={null}
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 24 }}
    />
  );
}

/* -------------------------------------------------------------
 * Styles
 * -----------------------------------------------------------*/
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1220', padding: 12 },

  h1: {
    color: '#e2e8f0',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 10,
  },

  gridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
    marginBottom: 16,
  },

  tile: { width: TILE_W },
  playerTile: {
    width: '100%',
    height: TILE_H,
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  srcText: { color: '#94a3b8', marginTop: 6, fontSize: 12 },

  /* Movement history */
  historyWrap: {
    marginTop: 8,
    backgroundColor: '#0F172A',
    borderColor: '#1E293B',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  sectionTitle: { color: '#e2e8f0', fontWeight: '800', marginBottom: 8 },
  row: {
    paddingVertical: 6,
    borderBottomColor: '#1E293B',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowText: { color: '#cbd5e1' },
  rowDim: { color: '#7c91b2' },
  rowCam: { color: '#60a5fa', fontWeight: '700' },
});
