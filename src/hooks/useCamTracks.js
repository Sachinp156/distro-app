// src/hooks/useCamTracks.js
import { useEffect, useMemo, useRef, useState } from 'react';
import { SERVER } from '../constants/server';

// Keep up to this many history points per person
const MAX_POINTS = 50;

export function useCamTracks(camId) {
  const [status, setStatus] = useState('connecting');
  const [frameInfo, setFrameInfo] = useState({ w: 0, h: 0, ts: 0 });
  // id -> { globalId, localId, last, confidence, world, history: [{t,x,y,space}] }
  const tracksRef = useRef(new Map());

  useEffect(() => {
    if (!camId) return;
    const wsUrl = SERVER.replace(/^http/i, 'ws') + `/ws/${camId}`;
    let ws;
    let alive = true;

    function connect() {
      setStatus('connecting');
      ws = new WebSocket(wsUrl);

      ws.onopen = () => setStatus('connected');

      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data); // {jpg?, frame_w, frame_h, timestamp, tracks: [...]}
          if (!alive) return;

          setFrameInfo({ w: msg.frame_w, h: msg.frame_h, ts: msg.timestamp });

          const now = msg.timestamp || Date.now() / 1000;
          const m = tracksRef.current;

          (msg.tracks || []).forEach((t) => {
            const gid = t.global_id ?? t.track_id; // fallback if no global
            const lid = t.track_id;
            const conf = t.confidence ?? null;
            const [x, y, w, h] = t.bbox || [0, 0, 0, 0];

            // foot point in image space
            const cx = x + w / 2.0;
            const cy = y + h;

            // prefer world coords if available
            const hasWorld = Array.isArray(t.world_xy) && t.world_xy.length >= 2;
            const px = hasWorld ? Number(t.world_xy[0]) : cx;
            const py = hasWorld ? Number(t.world_xy[1]) : cy;
            const space = hasWorld ? 'world' : 'image';

            const prev = m.get(gid) || {
              globalId: gid,
              localId: lid,
              confidence: conf,
              world: hasWorld,
              history: [],
            };
            const history = prev.history.slice();
            history.push({ t: now, x: px, y: py, space });
            if (history.length > MAX_POINTS) history.splice(0, history.length - MAX_POINTS);

            m.set(gid, {
              globalId: gid,
              localId: lid,
              confidence: conf,
              world: hasWorld,
              last: { t: now, x: px, y: py, space },
              history,
            });
          });

          // also prune very old tracks if nothing is received for a while (optional)
          const CUT_SECONDS = 30;
          for (const [gid, rec] of m.entries()) {
            const lastT = rec.last?.t ?? 0;
            if (now - lastT > CUT_SECONDS) m.delete(gid);
          }
        } catch {}
      };

      ws.onerror = () => setStatus('error');

      ws.onclose = () => {
        setStatus('closed');
        if (alive) setTimeout(connect, 1200); // auto-retry
      };
    }

    connect();

    return () => {
      alive = false;
      try { ws && ws.close(); } catch {}
      tracksRef.current = new Map();
      setFrameInfo({ w: 0, h: 0, ts: 0 });
    };
  }, [camId]);

  const activeTracks = useMemo(() => {
    // convert Map -> sorted array by globalId for rendering
    return Array.from(tracksRef.current.values())
      .sort((a, b) => (a.globalId ?? 0) - (b.globalId ?? 0));
  }, [frameInfo.ts]); // recompute on new frame

  return { status, frameInfo, activeTracks };
}
