// src/constants/cams.js
import { SERVER } from './server';

export const streamUrl = (id) => `${SERVER}/stream/${id}`;

export const CAMS = [
  { id: 'cam1', name: 'cam1', stream: streamUrl('cam1') },
  { id: 'cam2', name: 'cam2', stream: streamUrl('cam2') },
  { id: 'cam3', name: 'cam3', stream: streamUrl('cam3') },
  { id: 'cam4', name: 'cam4', stream: streamUrl('cam4') },
];
