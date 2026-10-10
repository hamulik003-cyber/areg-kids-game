#!/usr/bin/env python3
"""V286: update ONLY four proven constellation recognition problems.
The IAU standardizes constellation BOUNDARIES, not a unique stick diagram.
This script preserves the approved transparent artwork, and replaces its
conflicting glowing star connections with a more recognizable teaching figure.
Do not call the figure a mathematically exact projection of star coordinates.
"""
import json
from pathlib import Path
import numpy as np
import cv2
from PIL import Image,ImageDraw,ImageFilter

ROOT=Path(__file__).resolve().parents[1]
DIR=ROOT/'assets/constellations-transparent'
LAYOUT=json.loads((ROOT/'constellation-star-layouts.json').read_text())
# Screen-local normalized placements; free rotation/mirroring of astronomical
# stick patterns is conventional. Only basic widely-recognized features used.
FIGURES={
'10-lyra': ([(.34,.29),(.47,.41),(.66,.46),(.60,.68),(.42,.64)],
            [(0,1),(1,2),(2,3),(3,4),(4,1)],'Vega + Lyra parallelogram'),
'16-hayk-belt': ([(.424,.448),(.535,.472),(.636,.492)],
            [(0,1),(1,2)],'Orion Belt: 3 nearly collinear stars'),
'22-pisces': ([(.29,.32),(.34,.26),(.44,.28),(.48,.37),(.40,.44),(.48,.54),
               (.55,.71),(.68,.73),(.77,.66),(.78,.78),(.67,.84)],
            [(0,1),(1,2),(2,3),(3,4),(4,0),(4,5),(5,6),(6,7),
             (7,8),(8,9),(9,10),(10,7)],'2 separate Pisces groups joined by cord'),
'30-canis-minor': ([(.35,.57),(.67,.40)],[(0,1)],
            'Canis Minor: Procyon-Gomeisa 2-star figure'),
}
def correct(image,old,vertices,edges):
    rgba=np.array(image.convert('RGBA'))
    h,w=rgba.shape[:2]
    mask=np.zeros((h,w),dtype=np.uint8)
    old_points=old.get('points',[])
    # Small localized old luminous lines/peaks, NOT entire mythological figures.
    for x,y in old_points:
        cv2.circle(mask,(round(x*w),round(y*h)),max(5,int(w*.013)),255,-1)
    for i,j in old.get('edges',[]):
        if i>=len(old_points) or j>=len(old_points): continue
        x0,y0=old_points[i];x1,y1=old_points[j]
        cv2.line(mask,(round(x0*w),round(y0*h)),
                 (round(x1*w),round(y1*h)),255,max(2,int(w*.006)))
    assert np.count_nonzero(mask)<w*h*.1
    if np.any(mask):
        rgb=cv2.inpaint(rgba[:,:,:3],mask,3,cv2.INPAINT_TELEA)
        alpha=cv2.inpaint(rgba[:,:,3],mask,3,cv2.INPAINT_TELEA)
        rgba=np.dstack((rgb,alpha))
    out=Image.fromarray(rgba,'RGBA')
    pts=[(round(x*w),round(y*h)) for x,y in vertices]
    # Narrow, softly luminous blue-white paths: maintain existing premium style.
    under=Image.new('RGBA',(w,h)); d=ImageDraw.Draw(under,'RGBA')
    for i,j in edges:d.line([pts[i],pts[j]],fill=(53,122,255,150),width=max(3,w//95))
    out=Image.alpha_composite(out,under.filter(ImageFilter.GaussianBlur(max(2,w*.014))))
    strokes=Image.new('RGBA',(w,h));d=ImageDraw.Draw(strokes,'RGBA')
    for i,j in edges:
        d.line([pts[i],pts[j]],fill=(105,184,255,170),width=max(2,w//230))
        d.line([pts[i],pts[j]],fill=(230,245,255,230),width=max(1,w//430))
    out=Image.alpha_composite(out,strokes)
    haze=Image.new('RGBA',(w,h));d=ImageDraw.Draw(haze,'RGBA')
    for x,y in pts:
        r=max(6,round(w*.017));d.ellipse((x-r,y-r,x+r,y+r),fill=(78,153,255,190))
    out=Image.alpha_composite(out,haze.filter(ImageFilter.GaussianBlur(max(3,w*.025))))
    pin=Image.new('RGBA',(w,h));d=ImageDraw.Draw(pin,'RGBA')
    for x,y in pts:
        r=max(2,int(w*.005));span=max(5,round(w*.018))
        d.line((x-span,y,x+span,y),fill=(190,225,255,150),width=1)
        d.line((x,y-span,x,y+span),fill=(190,225,255,150),width=1)
        d.ellipse((x-r,y-r,x+r,y+r),fill=(255,255,255,255))
    out=Image.alpha_composite(out,pin)
    # Every vertex centre must be OPAQUE and BRIGHT, particularly Orion Belt.
    for x,y in pts:
        p=out.getpixel((x,y))
        assert p[0]>=248 and p[1]>=248 and p[2]>=248 and p[3]==255,(x,y,p)
    return out

manifest_path=DIR/'manifest.json'
manifest=json.loads(manifest_path.read_text(encoding='utf8'))
assert len(manifest)==38
for stem,(points,edges,reason) in FIGURES.items():
    src=DIR/(stem+'.png')
    assert src.is_file(),src
    im=Image.open(src).convert('RGBA')
    fixed=correct(im,LAYOUT[stem.split('-',1)[1]],points,edges)
    assert fixed.size==im.size and fixed.getchannel('A').getextrema()[0]==0
    fixed.save(src,format='PNG',compress_level=6)
    runtime=fixed.copy();runtime.thumbnail((560,760),Image.Resampling.LANCZOS)
    webp=DIR/(stem+'.webp')
    runtime.save(webp,format='WEBP',quality=82,method=4)
    assert Image.open(webp).convert('RGBA').size==runtime.size
    for row in manifest:
        if row['source']==stem+'.jpg':
            row['png_bytes']=src.stat().st_size
            row['webp_bytes']=webp.stat().st_size
            break
    else: raise RuntimeError('Missing manifest entry '+stem)
    print('V286 repaired',stem,reason,fixed.size,webp.stat().st_size)
manifest_path.write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n',encoding='utf8')
print('V286: EXACTLY 4 PNG/WebP pairs generated; 34 other artworks untouched.')
