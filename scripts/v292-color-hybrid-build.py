#!/usr/bin/env python3
"""V292: source-high-frequency + V287 low-frequency color, two strengths, for QA only.

This script writes into qa/v292-color-hybrid only. It never modifies any runtime
assets, game logic, Orion Belt artwork or main. No generative re-drawing.
"""
from pathlib import Path
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont
import subprocess
import json
import numpy as np
import cv2

ROOT=Path(__file__).resolve().parents[1]
TARGET=ROOT/'qa'/'v292-color-hybrid'
TARGET.mkdir(parents=True,exist_ok=True)
BASE='34548b66aeb1cadde0fb1e643830de091d2172a6'
BG=(8,14,43)
NAMES={'10-lyra':'Քնար','31-sagittarius':'Աղեղնավոր'}
LEVELS={'balanced':0.65,'vivid':0.95}


def from_main(stem):
    name=f'assets/constellations-transparent/{stem}.png'
    data=subprocess.check_output(['git','show',BASE+':'+name], cwd=ROOT)
    img=Image.open(BytesIO(data)).convert('RGBA')
    assert img.size==(480,574),('Unexpected original artwork geometry',stem,img.size)
    return img


def make(stem):
    old=from_main(stem)
    fn=ROOT/'assets'/'constellations-transparent'/f'{stem}.webp'
    new=Image.open(fn).convert('RGBA')
    assert new.size==(720,861),(stem,new.size)
    old_scaled=np.asarray(old.resize(new.size,Image.Resampling.LANCZOS),dtype=np.float32)
    n=np.asarray(new,dtype=np.float32)
    old_a=old_scaled[:,:,3]/255
    new_a=n[:,:,3]/255
    guard=np.clip((old_a-.06)/.18,0,1)*np.clip((new_a-.08)/.18,0,1)
    # Refer only to the old low-frequency color field, not its blurred details.
    reliability=cv2.GaussianBlur(guard,(0,0),2.8)
    old_low=cv2.GaussianBlur(old_scaled[:,:,:3],(0,0),3)
    new_low=cv2.GaussianBlur(n[:,:,:3],(0,0),3)
    correction=np.clip(old_low-new_low,-55,80)
    out={}
    for label,strength in LEVELS.items():
        col=np.clip(n[:,:,:3]+strength*correction*reliability[:,:,None],0,255)
        rgba=np.uint8(np.clip(np.dstack((col,n[:,:,3])),0,255)+0.5)
        rgba[rgba[:,:,3]==0,:3]=0
        img=Image.fromarray(rgba,'RGBA')
        path=TARGET/f'{stem}-hybrid-{label}.webp'
        img.save(path,'WEBP',quality=85,method=5,exact=True)
        # Keep pixel-perfect transparency support; do not draw new stars or lines.
        assert np.array_equal(np.asarray(img.getchannel('A')),np.asarray(new.getchannel('A')))
        assert img.size==new.size
        out[label]=path.stat().st_size
    # Render preview on exactly the same dark backdrop, same displayed size.
    images=[('Հին • V287',old),('Նոր մանրամասներ • V290',new)]
    images += [('Համադրված • '+p,Image.open(TARGET/f'{stem}-hybrid-{p}.webp')) for p in LEVELS]
    cardw,cardh=480,642
    sheet=Image.new('RGB',(cardw*4,cardh), (16,24,48))
    draw=ImageDraw.Draw(sheet)
    for k,(title,art) in enumerate(images):
        sample=Image.new('RGBA',art.size,(*BG,255))
        sample.alpha_composite(art.convert('RGBA'))
        sample=sample.convert('RGB').resize((440,526),Image.Resampling.LANCZOS)
        sheet.paste(sample,(cardw*k+20,54))
        draw.text((cardw*k+14,21),title,fill='white')
    sheet.save(TARGET/f'{stem}-comparison.jpg',quality=92,subsampling=0)
    return dict(stem=stem,original_size=list(old.size),new_size=list(new.size),
                old_bytes=len(subprocess.check_output(['git','show',BASE+f':assets/constellations-transparent/{stem}.webp'],cwd=ROOT)),
                new_bytes=fn.stat().st_size,hybrid_webp_bytes=out,
                alpha_matches_V290=True)


def main():
    result=[make(stem) for stem in NAMES]
    (TARGET/'report.json').write_text(json.dumps(dict(status='QA_ONLY',method='Old low-frequency RGB palette guided recolor of new high-resolution RGB; unchanged V290 alpha and detail',pictures=result,protected='16-hayk-belt 100% untouched',main='untouched'),ensure_ascii=False,indent=2)+'\n')
    print(json.dumps(result,ensure_ascii=False,indent=2))

if __name__=='__main__':main()