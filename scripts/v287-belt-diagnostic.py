#!/usr/bin/env python3
"""V287 diagnostics: sample 3 belt star cores in source JPG vs approved PNG.

NEVER MODIFIES ART. Source-of-truth image inspection only.
"""
from pathlib import Path
from PIL import Image,ImageFilter
import json
ROOT=Path(__file__).resolve().parents[1]
j=Image.open(ROOT/'16-hayk-belt.jpg').convert('RGB')
p=Image.open(ROOT/'assets/constellations-transparent/16-hayk-belt.png').convert('RGBA')
w=Image.open(ROOT/'assets/constellations-transparent/16-hayk-belt.webp').convert('RGBA')
print('SOURCE',j.size,'PNG',p.size,'WEBP',w.size)
targets=[(.442,.462),(.557,.485),(.654,.497)]
for i,(x,y) in enumerate(targets):
 def inspect(image,scale):
  cx,cy=round(x*image.width),round(y*image.height)
  x0=max(0,cx-round(image.width*.035));x1=min(image.width,cx+round(image.width*.035))
  y0=max(0,cy-round(image.height*.035));y1=min(image.height,cy+round(image.height*.035))
  vals=[]
  for py in range(y0,y1):
   for px in range(x0,x1):
    pixel=image.getpixel((px,py))
    whiteness=min(pixel[:3])
    if whiteness>225 and (len(pixel)<4 or pixel[3]>100):
     vals.append((whiteness-abs(px-cx)*.12-abs(py-cy)*.12,px,py,pixel))
  vals.sort(reverse=True)
  brightest=vals[0] if vals else None
  c=image.getpixel((cx,cy))
  return {'nominal':[cx,cy],'sample':c,'brightest':brightest,'nearby_white_count':len(vals)}
 print('STAR',i+1,'source',inspect(j,1),'png',inspect(p,1),'webp',inspect(w,1))
manifest=json.loads((ROOT/'assets/constellations-transparent/manifest.json').read_text())
print('COUNT',len(manifest),'png_kib',sum(x['png_bytes'] for x in manifest)//1024,
 'webp_kib',sum(x['webp_bytes'] for x in manifest)//1024)
