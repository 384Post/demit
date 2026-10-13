// Builds the giant AR models (assets/models/giant/<id>.glb) from the life-size ones,
// at the height set by each spot's `giantFeet` in data/config.js.
//
// Setup once (needs Node.js), in the project folder:
//   npm install @gltf-transform/core@4 @gltf-transform/extensions@4 @gltf-transform/functions@4
// Usage, from the project folder (after changing any giantFeet, or replacing a life-size model):
//   node tools/make_giants.mjs
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { getBounds } from '@gltf-transform/functions';
import fs from 'fs';
import path from 'path';

const root = process.argv[2] || '.';
const config = fs.readFileSync(path.join(root, 'data/config.js'), 'utf8');
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
fs.mkdirSync(path.join(root, 'assets/models/giant'), { recursive: true });

// each character block: id: "sol", ... giantFeet: 20
const re = /id: "(\w+)",[\s\S]*?giantFeet: (\d+(?:\.\d+)?)/g;
let m;
while ((m = re.exec(config))) {
  const [, id, ft] = m;
  const doc = await io.read(path.join(root, `assets/models/${id}.glb`));
  const scene = doc.getRoot().listScenes()[0];
  const b = getBounds(scene);
  const factor = (parseFloat(ft) * 0.3048) / (b.max[1] - b.min[1]);
  // the converter wraps every model in one node named "character"; scaling it scales everything
  const wrap = doc.getRoot().listNodes().find(n => n.getName() === 'character') || scene.listChildren()[0];
  wrap.setScale(wrap.getScale().map(v => v * factor));
  wrap.setTranslation(wrap.getTranslation().map(v => v * factor));
  await io.write(path.join(root, `assets/models/giant/${id}.glb`), doc);
  const b2 = getBounds(scene);
  console.log(`${id.padEnd(8)} giant ${((b2.max[1] - b2.min[1]) / 0.3048).toFixed(1)} ft`);
}
