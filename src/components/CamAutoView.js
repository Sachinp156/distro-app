// src/components/CamAutoView.js
import React from 'react';
import { Platform } from 'react-native';
import CamWsPlayerIOS from './CamWsPlayerIOS';
import CamMjpegView from './CamMjpegView';

export default function CamAutoView({ camId, src, label, style }) {
  if (Platform.OS === 'ios') {
    // iOS: use WebSocket JPEG frames + overlay
    return <CamWsPlayerIOS camId={camId} style={style} />;
  }
  // Android/Web: use MJPEG stream
  return <CamMjpegView src={src} label={label} style={style} />;
}
