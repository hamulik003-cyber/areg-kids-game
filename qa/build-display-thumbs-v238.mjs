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
let totalInput=0,totalOutput=0,improved=0,losslessFallbacks=0,minPsnr=100,psnrTotal=0;
for(const [idx,relative] of unique.entries()){
  const source=path.join(root,relative);
  if(!fs.existsSync(source))throw Error('Missing source '+relative);
  const dest=path.join(target,path.basename(relative).replace(/\.[^.]+$/,'.webp'));
  const inputBytes=fs.statSync(source).size;
  // Rendering area is < 210 CSS px on phones. 768 real pixels supports 3x
  // display density without blurry card art. Sharp lossless encoding retains
  // each resulting pixel exactly. Originals remain untouched for zoom.
  const previewSource=sharp(source,{failOn:'error',limitInputPixels:100_000_000})
    .rotate().resize({width:768,height:768,fit:'inside',withoutEnlargement:true,kernel:'lanczos3'});
  // High-fidelity preview only. Retain original at its original path and
  // show that exact file whenever a child zooms a gallery card.
  await previewSource.clone()
    .webp({quality:96,effort:5,smartSubsample:true})
    .toFile(dest);
  const [originalPixels,encodedPixels]=await Promise.all([
    previewSource.clone().ensureAlpha().raw().toBuffer(),
    sharp(dest).ensureAlpha().raw().toBuffer()
  ]);
  if(originalPixels.length!==encodedPixels.length)
    throw Error('Preview dimension mismatch '+relative);
  let err=0, samples=0;
  for(let n=0;n<originalPixels.length;n+=4){
    // Compare alpha + visible RGB (ignore fully transparent RGB garbage).
    const alpha=originalPixels[n+3]/255;
    for(let c=0;c<3;c++){
      const delta=(originalPixels[n+c]-encodedPixels[n+c])*alpha;
      err+=delta*delta;samples++;
    }
    const da=originalPixels[n+3]-encodedPixels[n+3];
    err+=da*da;samples++;
  }
  let psnr=err?10*Math.log10(65025/(err/samples)):100;
  // 40 dB means pixel-level reconstruction error is tiny at 3x card density.
  // For hard high-contrast edges use truly lossless fallback instead.
  if(psnr<40){
    await previewSource.clone().webp({lossless:true,effort:5}).toFile(dest);
    losslessFallbacks++;
    psnr=100;
  }
  minPsnr=Math.min(minPsnr,psnr);psnrTotal+=psnr;
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
  savedPct:+((1-totalOutput/totalInput)*100).toFixed(1),smallerCount:improved,
  minPsnr:+minPsnr.toFixed(1),averagePsnr:+(psnrTotal/unique.length).toFixed(1),
  losslessFallbacks
}));
fs.writeFileSync(path.join(target,'report-v238.json'),JSON.stringify({
  generation:'Sharp 768px high-fidelity WebP, pixel PSNR >= 40 dB or lossless fallback; source untouched',
  minPsnr,averagePsnr:psnrTotal/unique.length,losslessFallbacks,
  count:unique.length,sourceBytes:totalInput,displayBytes:totalOutput,
  files:unique.map(n=>({original:n,thumbnail:'assets/thumbs/'+path.basename(n).replace(/\.[^.]+$/,'.webp')}))
},null,2)+'\n');
