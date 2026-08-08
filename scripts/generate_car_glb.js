const fs = require('fs');
const path = require('path');

const out = path.join(process.cwd(), 'public', 'models', 'car.glb');
const positions = [0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0];
const indices = [0, 1, 2];
const posBuffer = Buffer.from(new Float32Array(positions).buffer);
const idxBuffer = Buffer.from(new Uint16Array(indices).buffer);
const binBuffer = Buffer.concat([posBuffer, idxBuffer]);
const binPad = (4 - (binBuffer.length % 4)) % 4;
const paddedBin = Buffer.concat([binBuffer, Buffer.alloc(binPad)]);

const gltf = {
  asset: { version: '2.0', generator: 'node-glb-generator' },
  scene: 0,
  scenes: [{ nodes: [0] }],
  nodes: [{ mesh: 0 }],
  meshes: [{ primitives: [{ attributes: { POSITION: 0 }, indices: 1 }] }],
  buffers: [{ byteLength: paddedBin.length }],
  bufferViews: [
    { buffer: 0, byteOffset: 0, byteLength: posBuffer.length, target: 34962 },
    { buffer: 0, byteOffset: posBuffer.length, byteLength: idxBuffer.length, target: 34963 },
  ],
  accessors: [
    { bufferView: 0, componentType: 5126, count: 3, type: 'VEC3', max: [1.0, 1.0, 0.0], min: [0.0, 0.0, 0.0] },
    { bufferView: 1, componentType: 5123, count: 3, type: 'SCALAR' },
  ],
};

let json = JSON.stringify(gltf);
const jsonBuffer = Buffer.from(json, 'utf8');
const jsonPad = (4 - (jsonBuffer.length % 4)) % 4;
const paddedJson = Buffer.concat([jsonBuffer, Buffer.alloc(jsonPad, 0x20)]);

const header = Buffer.alloc(12);
header.write('glTF', 0, 'ascii');
header.writeUInt32LE(2, 4);
const totalLength = 12 + 8 + paddedJson.length + 8 + paddedBin.length;
header.writeUInt32LE(totalLength, 8);

const jsonChunkHeader = Buffer.alloc(8);
jsonChunkHeader.writeUInt32LE(paddedJson.length, 0);
jsonChunkHeader.write('JSON', 4, 'ascii');

const binChunkHeader = Buffer.alloc(8);
binChunkHeader.writeUInt32LE(paddedBin.length, 0);
binChunkHeader.write('BIN\x00', 4, 'ascii');

fs.writeFileSync(out, Buffer.concat([header, jsonChunkHeader, paddedJson, binChunkHeader, paddedBin]));
console.log('Wrote GLB:', out, 'size=', fs.statSync(out).size);
