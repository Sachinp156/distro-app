// src/components/CamWsPlayerIOS.js
import React, { useEffect, useRef, useState } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';
import { SERVER } from '../constants/server';

// Keep last N points per track
const MAX_POINTS = 80;

export default function CamWsPlayerIOS({ camId, style }) {
  const [frameUri, setFrameUri] = useState(null); // data:image/jpeg;base64,....
  const [frameSize, setFrameSize] = useState({ w: 0, h: 0 });
  const [viewSize, setViewSize] = useState({ w: 0, h: 0 });

  // { gid: [{u,v}, ...] }
  const pathsRef = useRef({});

  // limit repaint rate
  const lastTsRef = useRef(0);

  useEffect(() => {
    if (!camId) return;

    const wsUrl = SERVER.replace(/^http/i, 'ws') + `/ws/${camId}`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        // throttle UI updates ~20fps
        const now = msg.timestamp || Date.now() / 1000;
        if (now - lastTsRef.current < 0.05 && frameUri) {
          // still update paths but skip re-render frame
          updatePaths(pathsRef, msg);
          return;
        }
        lastTsRef.current = now;

        if (msg.frame_w && msg.frame_h) {
          setFrameSize({ w: msg.frame_w, h: msg.frame_h });
        }
        if (msg.jpg) {
          setFrameUri(`data:image/jpeg;base64,${msg.jpg}`);
        }
        updatePaths(pathsRef, msg);
      } catch (_err) {
        // ignore parse errors
      }
    };

    return () => ws.close();
  }, [camId]);

  // scale (u,v) -> view pixels
  const scalePoint = (u, v) => {
    const { w: fw, h: fh } = frameSize;
    const { w: vw, h: vh } = viewSize;
    if (!fw || !fh || !vw || !vh) return null;
    const sx = vw / fw;
    const sy = vh / fh;
    return { x: u * sx, y: v * sy };
  };

  // build polylines
  const gidKeys = Object.keys(pathsRef.current);
  const polylines = gidKeys.map((gid) => {
    const pts = (pathsRef.current[gid] || [])
      .map(({ u, v }) => scalePoint(u, v))
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
  });

  return (
    <View
      style={[styles.wrap, style]}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setViewSize({ w: width, h: height });
      }}
    >
      {frameUri ? (
        <>
          <Image source={{ uri: frameUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          <Svg width="100%" height="100%" pointerEvents="none">
            {polylines}
          </Svg>
        </>
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Connecting {camId}…</Text>
        </View>
      )}
    </View>
  );
}

function updatePaths(ref, msg) {
  const paths = { ...ref.current };
  (msg.tracks || []).forEach((t) => {
    const gid = t.global_id ?? t.track_id;
    const [x, y, w, h] = t.bbox || [0, 0, 0, 0];
    const u = x + w / 2;
    const v = y + h; // foot point
    const arr = paths[gid] ? [...paths[gid], { u, v }] : [{ u, v }];
    paths[gid] = arr.slice(-MAX_POINTS);
  });
  ref.current = paths;
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: '#000' },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: { color: '#94a3b8' },
});
