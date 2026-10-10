#!/usr/bin/env python3
"""AREG V287: PRESERVE exact 38 constellation illustrations and improve fidelity.

Only 3 small belt star alpha cores are repaired; RGB source pixels unchanged.
All runtime WebPs are loss-minimized renders of the SAME approved source PNGs.
No reinterpretation, geometry, style, names, color correction or new stars.
DO NOT run the old build-constellation-alpha.py: it would recreate older masks.
"""
from pathlib import Path
from PIL import Image
import json, hashlib, math

ROOT=Path(__file__).resolve().parents[1]
DIR=ROOT/'assets'/'constellations-transparent'
MANIFEST=DIR/'manifest.json'
STEM='16-hayk-belt'
PIXELS=((.441,.460),(.549,.481),(.644,.499)) # measured genuine luminous original centers
items=json.loads(MANIFEST.read_text(encoding='utf8'))
assert len(items)==38 and len(set(x['source'] for x in items))==38
before={x['source']:hashlib.sha256((DIR/(Path(x['source']).stem+'.png')).read_bytes()).hexdigest() for x in items}
belt_path=DIR/(STEM+'.png')
original=Image.open(belt_path).convert('RGBA')
w,h=original.size
result=original.copy()
p=result.load()
counter=0
centers=[]
for nx,ny in PIXELS:
    cx,cy=round(nx*w),round(ny*h)
    assert 0<=cx<w and 0<=cy<h
    # White centres are already present in original art RGB, but previous
    # automatic background removal wrongly made their alpha 100-125.
    # Recover alpha of THOSE EXISTING pixels only, never draw new geometry.
    center_rgb=original.getpixel((cx,cy))
    assert min(center_rgb[:3])>220,(cx,cy,center_rgb)
    old_alpha=center_rgb[3]
    changed=0
    for y in range(max(0,cy-19),min(h,cy+20)):
        for x in range(max(0,cx-19),min(w,cx+20)):
            r,g,b,a=p[x,y]
            dist=math.hypot(x-cx,y-cy)
            if dist>18 or min(r,g,b)<205:continue
            whiteness=min(1.,max(0.,(min(r,g,b)-195)/40))
            boost=255*math.exp(-((dist/11.)**2))*whiteness
            if min(r,g,b)>=245 and dist<=6:boost=255
            new=max(a,int(round(boost)))
            if new>a:
                p[x,y]=(r,g,b,new)
                changed+=1
                counter+=1
    new_alpha=p[cx,cy][3]
    assert new_alpha>=245,(cx,cy,old_alpha,new_alpha)
    centers.append({'pixel':[cx,cy],'before_alpha':old_alpha,'after_alpha':new_alpha,'changed_alpha_pixels':changed})
assert 3<=counter<=4000,counter
# Only belt ALPHA, not a SINGLE RGB source pixel may change.
orig_rgba=original.tobytes()
new_rgba=result.tobytes()
assert orig_rgba[::4]==new_rgba[::4] and orig_rgba[1::4]==new_rgba[1::4] and orig_rgba[2::4]==new_rgba[2::4]
assert all(x>=y for x,y in zip(new_rgba[3::4],orig_rgba[3::4]))
result.save(belt_path,format='PNG',compress_level=6)
print('V287 ORION BELT restored 3 ACTUAL stars ONLY:',centers)

stats=[]
for item in items:
    stem=Path(item['source']).stem
    path=DIR/(stem+'.png')
    source=result if stem==STEM else Image.open(path).convert('RGBA')
    copy=source.copy()
    copy.thumbnail((720,960),Image.Resampling.LANCZOS)
    if min(copy.size)<250:
        raise RuntimeError('unexpectedly small illustration '+stem)
    target=DIR/(stem+'.webp')
    # Native source is untouched. Save a less downscaled, higher-quality
    # WebP to avoid soft/blurry 560px q80 images when enlarged on iPhone.
    copy.save(target,format='WEBP',quality=93,method=6,exact=True)
    decoded=Image.open(target).convert('RGBA')
    assert decoded.size==copy.size and decoded.getchannel('A').getextrema()[0]==0
    item['webp_bytes']=target.stat().st_size
    if stem==STEM:item['png_bytes']=belt_path.stat().st_size
    stats.append((stem,copy.size,item['webp_bytes']))
# 37 PNGs, all root JPGs, all filenames, IDs and star maps remain unchanged.
for item in items:
    stem=Path(item['source']).stem
    if stem!=STEM:
        assert before[item['source']]==hashlib.sha256((DIR/(stem+'.png')).read_bytes()).hexdigest()
MANIFEST.write_text(json.dumps(items,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print('V287 38 SAME original compositions compressed at better fidelity:',stats)
print('V287 WebP total bytes:',sum(v[2] for v in stats))
print('SAFETY: all 37 other PNG source files unchanged; original source JPGs and constellation-star-layouts.json untouched.')
