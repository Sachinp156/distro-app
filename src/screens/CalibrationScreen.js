import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { SERVER } from "../constants/server";

export default function CalibrationScreen() {
  const [cam, setCam] = useState("cam1");
  const [img, setImg] = useState([{x:"",y:""},{x:"",y:""},{x:"",y:""},{x:"",y:""}]);
  const [wrd, setWrd] = useState([{x:"",y:""},{x:"",y:""},{x:"",y:""},{x:"",y:""}]);

  const send = async () => {
    const image_xy = img.map(p => [Number(p.x), Number(p.y)]);
    const world_xy = wrd.map(p => [Number(p.x), Number(p.y)]);
    if (image_xy.some(([x,y]) => !isFinite(x)||!isFinite(y)) || world_xy.some(([x,y]) => !isFinite(x)||!isFinite(y))) {
      Alert.alert("Invalid", "Please fill all coordinates (numbers)."); return;
    }
    const body = { camera_id: cam, image_xy, world_xy };
    const res = await fetch(`${SERVER}/api/homography`, { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(body) }).then(r=>r.json());
    if (res.ok) Alert.alert("Success", "Homography saved"); else Alert.alert("Error", res.error || "Failed");
  };

  return (
    <View style={s.container}>
      <Text style={s.title}>Camera Calibration</Text>
      <Text style={s.label}>Camera ID</Text>
      <TextInput value={cam} onChangeText={setCam} style={s.input} />
      <Text style={s.sub}>Image (pixels)</Text>
      {img.map((p, i)=>(
        <View key={i} style={s.row}>
          <TextInput placeholder={`X${i+1}`} keyboardType="numeric" value={p.x} onChangeText={(v)=>{ const a=[...img]; a[i]={...a[i],x:v}; setImg(a);} } style={s.inputHalf}/>
          <TextInput placeholder={`Y${i+1}`} keyboardType="numeric" value={p.y} onChangeText={(v)=>{ const a=[...img]; a[i]={...a[i],y:v}; setImg(a);} } style={s.inputHalf}/>
        </View>
      ))}
      <Text style={s.sub}>World (meters)</Text>
      {wrd.map((p, i)=>(
        <View key={i} style={s.row}>
          <TextInput placeholder={`X${i+1}`} keyboardType="numeric" value={p.x} onChangeText={(v)=>{ const a=[...wrd]; a[i]={...a[i],x:v}; setWrd(a);} } style={s.inputHalf}/>
          <TextInput placeholder={`Y${i+1}`} keyboardType="numeric" value={p.y} onChangeText={(v)=>{ const a=[...wrd]; a[i]={...a[i],y:v}; setWrd(a);} } style={s.inputHalf}/>
        </View>
      ))}
      <TouchableOpacity style={s.btn} onPress={send}><Text style={s.btnText}>Calculate Homography</Text></TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container:{ flex:1, backgroundColor:"#0B1220", padding:16 },
  title:{ color:"#E2E8F0", fontWeight:"800", fontSize:20, marginBottom:10 },
  label:{ color:"#94A3B8", marginTop:6 },
  sub:{ color:"#93C5FD", marginTop:10, marginBottom:6, fontWeight:"800" },
  input:{ backgroundColor:"#0F172A", borderColor:"#1E293B", borderWidth:1, borderRadius:8, color:"#E2E8F0", paddingHorizontal:10, height:42 },
  row:{ flexDirection:"row", gap:8, marginBottom:6 },
  inputHalf:{ flex:1, backgroundColor:"#0F172A", borderColor:"#1E293B", borderWidth:1, borderRadius:8, color:"#E2E8F0", paddingHorizontal:10, height:42 },
  btn:{ marginTop:12, backgroundColor:"#22d3ee", paddingVertical:12, borderRadius:10, alignItems:"center" },
  btnText:{ color:"#0B1220", fontWeight:"800" }
});
