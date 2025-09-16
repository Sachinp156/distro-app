import React, { useEffect, useRef, useState } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { SERVER } from '../constants/server';

export default function CamWsView({ camId, label, style }) {
  const [src, setSrc] = useState(null);
  const [status, setStatus] = useState('connecting…');
  const lastTsRef = useRef(0);

  useEffect(() => {
    if (!camId) return;
    const wsUrl = SERVER.replace(/^http/i, 'ws') + `/ws/${camId}`;
    let ws;
    try {
      ws = new WebSocket(wsUrl);
    } catch (e) {
      setStatus('error');
      return;
    }

    ws.onopen = () => setStatus('connected');

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        // throttle a bit (~10 fps)
        const now = Date.now();
        if (now - lastTsRef.current < 90) return;
        lastTsRef.current = now;

        if (msg.jpg) {
          setSrc(`data:image/jpeg;base64,${msg.jpg}`);
        }
      } catch {
        /* ignore bad frames */
      }
    };

    ws.onerror = () => setStatus('error');
    ws.onclose = () => setStatus('closed');

    return () => ws && ws.close();
  }, [camId]);

  return (
    <View style={[styles.wrap, style]}>
      {src ? (
        <Image source={{ uri: src }} style={styles.img} resizeMode="cover" />
      ) : (
        <Text style={styles.placeholder}>
          {label ? `${label} • ` : ''}{status}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: '#000', overflow: 'hidden', width: '100%', height: '100%' },
  img: { width: '100%', height: '100%' },
  placeholder: { color: '#94a3b8', padding: 8 }
});
