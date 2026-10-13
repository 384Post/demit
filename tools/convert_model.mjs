// Converts a Spline .gltf/.glb export into an AR-ready model for the site:
// removes Spline's built-in lights/cameras, drops unused data, gently simplifies curves
// (invisible at phone size), scales it, and stands it centered on the ground.
//
// Setup once (needs Node.js), in this folder:
//   npm install @gltf-transform/core@4 @gltf-transform/extensions@4 @gltf-transform/functions@4 meshoptimizer@0.22
// Usage:
//   node tools/convert_model.mjs rebel.glb assets/models/rebel.glb 0.373 0.001        (life-size, ~6 ft)
//   then: node tools/make_giants.mjs   (builds the giant version at the spot's giantFeet)
//
// 0.373 = the shared life-size scale for all 13 characters, so they keep the relative sizes they
// have in Spline. Exceptions: Flora uses 0.328 (a little less towering) and Flow uses 0.414
// (so he matches Sequoia).
// 0.001 = simplification amount (0 = none).
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, prune, weld, simplify, getBounds } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';
const [inp, out, sArg, eArg] = process.argv.slice(2);
const S = parseFloat(sArg), ERR = parseFloat(eArg || '0');
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(inp); const root = doc.getRoot();
for (const ext of root.listExtensionsUsed()) if (ext.extensionName === 'KHR_lights_punctual') ext.dispose();
for (const n of root.listNodes()) if (n.getCamera()) n.setCamera(null);
// no textures in these models → texture coordinates are dead weight
for (const m of root.listMeshes()) for (const p of m.listPrimitives()) {
  const mat = p.getMaterial(); const hasTex = mat && (mat.getBaseColorTexture() || mat.getNormalTexture() || mat.getMetallicRoughnessTexture() || mat.getEmissiveTexture() || mat.getOcclusionTexture());
  if (!hasTex) for (const sem of p.listSemantics()) if (sem.startsWith('TEXCOORD')) p.setAttribute(sem, null);
}
const steps = [dedup(), weld()];
if (ERR > 0) { await MeshoptSimplifier.ready; steps.push(simplify({ simplifier: MeshoptSimplifier, ratio: 0, error: ERR, lockBorder: true })); }
steps.push(prune());
await doc.transform(...steps);
const scene = root.listScenes()[0]; const b = getBounds(scene);
const size = b.max.map((v, i) => v - b.min[i]);
const wrap = doc.createNode('character');
for (const c of scene.listChildren()) { scene.removeChild(c); wrap.addChild(c); }
wrap.setScale([S, S, S]);
wrap.setTranslation([-(b.min[0] + size[0] / 2) * S, -b.min[1] * S, -(b.min[2] + size[2] / 2) * S]);
scene.addChild(wrap);
await io.write(out, doc);
let verts = 0; for (const m of root.listMeshes()) for (const p of m.listPrimitives()) verts += p.getAttribute('POSITION').getCount();
const b2 = getBounds(scene);
console.log(out.split('/').pop().padEnd(12), 'h', (b2.max[1]-b2.min[1]).toFixed(2)+'m', 'w', (b2.max[0]-b2.min[0]).toFixed(2)+'m', 'verts', verts);
