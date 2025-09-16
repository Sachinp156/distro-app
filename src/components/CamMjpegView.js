// src/components/CamMjpegView.js
import React, { useEffect, useRef } from 'react';
import { View, Text, Platform, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

/**
 * Renders an MJPEG stream in a tiny HTML wrapper.
 * Works on Web/Android. iOS uses CamWsPlayerIOS instead.
 */
export default function CamMjpegView({ src, label, style }) {
  const ref = useRef(null);

  useEffect(() => {
    // nothing here; keep ref in case you want to reload
  }, [src]);

  if (Platform.OS === 'ios') {
    // Should not be used on iOS
    return (
      <View style={[styles.wrap, style]}>
        <Text style={styles.warning}>iOS uses WebSocket frames instead of MJPEG.</Text>
      </View>
    );
  }

  if (!src) {
    return (
      <View style={[styles.wrap, style]}>
        <Text style={styles.warning}>No stream URL</Text>
      </View>
    );
  }

  const html = `
    <html><head><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0"/></head>
    <body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;">
      <img src="${src}" style="width:100%;height:100%;object-fit:cover;" />
    </body></html>
  `;

  return (
    <View style={[styles.wrap, style]}>
      <WebView
        ref={ref}
        originWhitelist={['*']}
        source={{ html }}
        javaScriptEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        allowsFullscreenVideo
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: '#000', overflow: 'hidden' },
  warning: { color: '#94a3b8', textAlign: 'center', marginTop: 10 },
});
