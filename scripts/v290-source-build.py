#!/usr/bin/env python3
"""V290 experiment: build two transparent recognition-game images from user ZIP RGB sources.

DO NOT run on main. The original ZIP is NOT uploaded wholesale: only its
verified Sagittarius and Wolf RGB pictures, resized to 1080 px and archived
as source WebPs in qa/v290-source-original/. Other 36/37 game assets untouched.

The original transparent PNG of each figure defines the ALPHA SUPPORT exactly.
The original high-res RGB source defines the colors/details. Gallery JPG is
used ONLY to register position and size. Never reconstruct a figure or star.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import numpy as np
import cv2
import json

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / 'assets' / 'constellations-transparent'
QA = ROOT / 'qa' / 'v290-source-original'
BG = (8,14,43,255)
TARGET = (720,861)  # 1.5x native 480x574 - safe for iPhone 2x2 choices.
SOURCE = {
 '31-sagittarius': QA/'31-sagittarius-original-source-1080.webp',
 '37-lupus': QA/'37-lupus-original-source-1080.webp',
}

def register_source(image, small_jpg):
    """Find original image framing in existing 480x574 gallery JPG.
    Match only source RGB. Fails rather than inventing a crop if score is bad.
    """
    target = cv2.cvtColor(np.asarray(small_jpg.convert('RGB')), cv2.COLOR_RGB2GRAY)
    source = cv2.cvtColor(np.asarray(image.convert('RGB')), cv2.COLOR_RGB2GRAY)
    h,w = source.shape
    fit = min(target.shape[1]/w, target.shape[0]/h)
    best = (-1.0, None)
    for fraction in np.linspace(.75,1.0,84):
        nw,nh = round(w*fit*fraction),round(h*fit*fraction)
        if nw<50 or nh<50 or nw>target.shape[1] or nh>target.shape[0]: continue
        sample = cv2.resize(source,(nw,nh),interpolation=cv2.INTER_AREA)
        score = cv2.matchTemplate(target, sample, cv2.TM_CCOEFF_NORMED)
        _, value, _, (x,y) = cv2.minMaxLoc(score)
        if value > best[0]: best=(value,(x,y,nw,nh))
    similarity,rect=best
    if rect is None or similarity<.84:
        raise RuntimeError(f'Unsafe source alignment: similarity={similarity:.4f},rect={rect}')
    return similarity,rect


def build_one(stem,path):
    small_jpg=Image.open(ROOT/(stem+'.jpg')).convert('RGB')
    old=Image.open(ART/(stem+'.png')).convert('RGBA')
    assert old.size==small_jpg.size==(480,574)
    source=Image.open(path).convert('RGB')
    score,(x,y,nw,nh)=register_source(source,small_jpg)
    # Restore the original RGB at native source resolution, fitting to the
    # exact gallery geometry; all candidate cards then use the existing alpha.
    art=source.resize((round(nw*1.5),round(nh*1.5)), Image.Resampling.LANCZOS)
    canvas=Image.new('RGB', TARGET, (3,7,20))
    canvas.paste(art,(round(x*1.5),round(y*1.5)))
    raw_rgb=np.asarray(canvas, dtype=np.float32)/255.
    old_alpha=old.getchannel('A')
    mask=np.asarray(old_alpha.resize(TARGET, Image.Resampling.LANCZOS),dtype=np.float32)/255.
    support=np.asarray(old_alpha.resize(TARGET, Image.Resampling.NEAREST))>0
    a=np.power(np.clip(mask,0,1),.35)
    a[~support]=0
    rgb=np.power(raw_rgb,.68)
    rgba=np.uint8(np.clip(np.dstack((rgb,a))*255+0.5,0,255))
    rgba[a<=0,:3]=0
    new=Image.fromarray(rgba,'RGBA')
    png=ART/(stem+'.png');webp=ART/(stem+'.webp')
    new.save(webp,'WEBP',quality=80,method=4,exact=True)
    # The PNG fallback is decoded from the exact browser WebP image, for the
    # same user-visible color/alpha if WebP is unsupported.
    with Image.open(webp) as decoded:
        decoded.convert('RGBA').save(png,'PNG',optimize=True,compress_level=9)
    with Image.open(webp) as decoded:
        decoded=decoded.convert('RGBA')
        assert decoded.size==TARGET
        assert np.count_nonzero(np.asarray(decoded.getchannel('A')))>3000
        assert np.array_equal(np.asarray(decoded.getchannel('A'))>0,np.asarray(new.getchannel('A'))>0)

    def panel(image,label):
        img=Image.new('RGBA',image.size,BG);img.alpha_composite(image.convert('RGBA'))
        # IDENTICAL display geometry, never rescale subjects differently.
        scaled=img.resize((450,538),Image.Resampling.LANCZOS).convert('RGB')
        out=Image.new('RGB',(500,620),BG[:3]);out.paste(scaled,(25,70))
        d=ImageDraw.Draw(out);d.rectangle((0,0,500,58),fill=(27,36,70))
        d.text((16,20),label,fill=(245,247,255))
        return out
    old_webp=ART/(stem+'.webp')
    # old jpg can show full-source details for independent reference.
    check=Image.new('RGB',(1500,620),BG[:3])
    for i,(im,label) in enumerate([(old,'V287 before'),(new,'V290 ZIP source, alpha'),(small_jpg,'Gallery JPG')]):
        check.paste(panel(im,label),(i*500,0))
    check.save(QA/(stem+'-comparison.jpg'),'JPEG',quality=93,subsampling=0)
    return {'stem':stem,'registration_score':round(float(score),5),'geometry_480x574':[x,y,nw,nh],
      'output':[720,861],'png_bytes':png.stat().st_size,'webp_bytes':webp.stat().st_size}

def main():
    if not (ROOT/'.git').exists():
        raise RuntimeError('This script must run from a checked-out feature branch')
    QA.mkdir(parents=True,exist_ok=True)
    results=[]
    for stem,path in SOURCE.items():
        if not path.exists():raise FileNotFoundError(path)
        results.append(build_one(stem,path))
    # Previously made Lyra experiment is already in the same pilot branch.
    manifest_path=ART/'manifest.json'
    manifest=json.loads(manifest_path.read_text())
    for item in manifest:
        stem=Path(item['source']).stem
        if stem not in {'10-lyra','31-sagittarius','37-lupus'}:continue
        with Image.open(ART/(stem+'.webp')) as image:
            item['size']=[image.width,image.height]
        item['png_bytes']=(ART/(stem+'.png')).stat().st_size
        item['webp_bytes']=(ART/(stem+'.webp')).stat().st_size
    manifest_path.write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
    result={'source':'ZIP images 39 and 29 (1-based), excluding ZIP extra 36','pilot_assets':results,
       'protected':'16-hayk-belt PNG and WebP never edited',
       'main':'NO changes to main; branch only'}
    (QA/'registration-report.json').write_text(json.dumps(result,indent=2)+'\n')
    print('V290 source match:',json.dumps(result,indent=2))
if __name__=='__main__':main()