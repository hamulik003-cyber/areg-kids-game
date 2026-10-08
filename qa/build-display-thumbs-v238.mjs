#!/usr/bin/env node
// V238 display-only thumbnails. Source images are NEVER edited or replaced.
// Source asset stays available for original-resolution zoom.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
const root=path.resolve(import.meta.dirname,'..');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const sections=[
  ['ANIMALS','BIRDS',30],
  ['BIRDS','SEA_CREATURES',30],
  ['SEA_CREATURES','INSECTS',33],
  ['INSECTS','PLANETS',30],
  ['PLANETS','CONSTELLATION_TONES',30],
  ['CONSTELLATIONS','SECTIONS',38]
];
const originals=[];
for(const [name,next,count] of sections){
  const begin=app.indexOf('const '+name),end=app.indexOf('const '+next,begin);
  if(begin<0||end<0)throw Error('Cannot parse image list '+name);
  const files=[...app.slice(begin,end).matchAll(/(?:image|img)\s*:\s*['"]([^'"]+\.(?:jpe?g|png|webp))['"]/gi)].map(m=>m[1]);
  if(files.length!==count)throw Error(name+': expected '+count+', got '+files.length);
  originals.push(...files);
}
const unique=[...new Set(originals)];
if(unique.length!==191)throw Error('Expected 191 unique card artworks, got '+unique.length);
const target=path.join(root,'assets','thumbs');
fs.mkdirSync(target,{recursive:true});
let totalInput=0,totalOutput=0,improved=0;
for(const [idx,relative] of unique.entries()){
  const source=path.join(root,relative);
  if(!fs.existsSync(source))throw Error('Missing source '+relative);
  const dest=path.join(target,path.basename(relative).replace(/\.[^.]+$/,'.webp'));
  const inputBytes=fs.statSync(source).size;
  // Rendering area is < 210 CSS px on phones. 768 real pixels supports 3x
  // display density without blurry card art. Sharp lossless encoding retains
  // each resulting pixel exactly. Originals remain untouched for zoom.
  await sharp(source,{failOn:'error',limitInputPixels:100_000_000})
    .rotate()
    .resize({width:768,height:768,fit:'inside',withoutEnlargement:true,kernel:'lanczos3'})
    .webp({lossless:true,effort:4})
    .toFile(dest);
  const outputBytes=fs.statSync(dest).size;
  const meta=await sharp(dest).metadata();
  if(meta.width>768||meta.height>768||meta.format!=='webp')
    throw Error('Invalid thumbnail '+relative);
  totalInput+=inputBytes;totalOutput+=outputBytes;
  if(outputBytes<inputBytes)improved++;
  if((idx+1)%30===0||idx===unique.length-1)
    console.log('THUMBS_PROGRESS '+(idx+1)+' / '+unique.length);
}
console.log('THUMBS_READY '+JSON.stringify({
  count:unique.length,sourceMiB:+(totalInput/1048576).toFixed(2),
  displayMiB:+(totalOutput/1048576).toFixed(2),
  savedPct:+((1-totalOutput/totalInput)*100).toFixed(1),smallerCount:improved
}));
fs.writeFileSync(path.join(target,'report-v238.json'),JSON.stringify({
  generation:'Sharp 768px maximum-edge thumbnail, lossless WebP, source untouched',
  count:unique.length,sourceBytes:totalInput,displayBytes:totalOutput,
  files:unique.map(n=>({original:n,thumbnail:'assets/thumbs/'+path.basename(n).replace(/\.[^.]+$/,'.webp')}))
},null,2)+'\n');
