// path: src/lib/api.js

// --- Configure your edge server base URL here ---
let SERVER = "http://192.168.1.50:8000"; // <-- change to your server

export const getServer = () => SERVER;
export const setServer = (url) => { SERVER = url?.replace(/\/+$/, "") || SERVER; };

// --- tiny fetch wrapper ---
async function req(path, opts = {}) {
  const res = await fetch(`${SERVER}${path}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText} :: ${body}`);
  }
  // some control endpoints may return empty body; handle gracefully
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

// --- Single-camera controls ---
export const startCamera  = (id) => req(`/api/cameras/${id}/start`,  { method: "POST" });
export const stopCamera   = (id) => req(`/api/cameras/${id}/stop`,   { method: "POST" });
export const recordCamera = (id, enable) => req(`/api/cameras/${id}/record`, {
  method: "POST",
  body: JSON.stringify({ enable: !!enable }),
});

// --- Batch controls ---
export const startAll  = () => req(`/api/cameras/actions/start-all`,  { method: "POST" });
export const stopAll   = () => req(`/api/cameras/actions/stop-all`,   { method: "POST" });
export const recordAll = (enable) => req(`/api/cameras/actions/record-all`, {
  method: "POST",
  body: JSON.stringify({ enable: !!enable }),
});

// --- Status ---
export const listCameras = () => req(`/api/cameras`);
