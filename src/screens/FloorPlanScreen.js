import React from "react";
import { View, Text, StyleSheet } from "react-native";
import CamMjpegView from "../components/CamMjpegView";
import { streamUrl } from "../constants/cams";

// Point to any stream that already has the path overlay you want:
const FLOORPLAN_STREAM = streamUrl("cam1"); // or `${SERVER}/stream/floorplan` if you add a composite

export default function FloorPlanScreen() {
  return (
    <View style={s.container}>
      <Text style={s.title}>Floor Plan View</Text>
      <View style={{ flex: 1, margin: 12 }}>
        <CamMjpegView url={FLOORPLAN_STREAM} style={{ flex: 1 }} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B1220" },
  title: { color: "#E2E8F0", fontSize: 18, fontWeight: "800", paddingHorizontal: 12, paddingTop: 12 }
});
