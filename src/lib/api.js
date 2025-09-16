// src/lib/api.js (append these)
import { SERVER } from '../constants/server';
import EventSource from 'react-native-event-source';

const JSON_HEADERS = { 'Content-Type': 'application/json' };

async function req(path, opts = {}) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(`${SERVER}${path}`, { signal: controller.signal, ...opts });
    const text = await res.text();
    if (!res.ok) throw new Error(`${res.status} ${res.statusText} :: ${text}`);
    const ct = res.headers.get('content-type') || '';
    return ct.includes('application/json') ? (text ? JSON.parse(text) : {}) : text;
  } finally {
    clearTimeout(t);
  }
}

// Simple health (hits "/")
export const healthPing = async () => { await req(`/`, { method:'GET' }); return { ok:true }; };

// Alerts
export const listAlerts = () => req(`/api/alerts`, { method:'GET' });

// Zones
export const listZones  = () => req(`/api/zones`,  { method:'GET' });
export const addZone    = (z) => req(`/api/zones`, { method:'POST', headers: JSON_HEADERS, body: JSON.stringify(z) });
export const deleteZone = (name) => req(`/api/zones/${encodeURIComponent(name)}`, { method:'DELETE' });

// Homography
export const setHomography = (payload) =>
  req(`/api/homography`, { method:'POST', headers: JSON_HEADERS, body: JSON.stringify(payload) });

// Server-Sent Events: /events
export function openEvents({ onMessage }) {
  const es = new EventSource(`${SERVER}/events`);
  es.onmessage = (e) => { try { onMessage?.({ snapshot: JSON.parse(e.data) }); } catch {} };
  es.onerror   = () => { /* SSE auto-retries */ };
  return () => es.close();
}