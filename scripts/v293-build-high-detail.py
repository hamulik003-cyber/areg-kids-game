#!/usr/bin/env python3
"""AREG V293 - high-quality non-generative constellation assets, FEATURE BRANCH ONLY.

Inputs are 39 user-original high-res images encoded to WebP q89 in six binary
archive parts. Matches source art to all 38 V287 gallery JPGs automatically,
rejects incorrect/missing matches, and leaves 16-hayk-belt PNG/WebP byte-exact.
Rebuilds 37 approved artwork pairs from the actual artwork detail, preserving
V287 low-frequency color palette and transparent silhouette support.
"""
from pathlib import Path
from io import BytesIO
from zipfile import ZipFile
from PIL import Image
import subprocess,json,math
import numpy as np
import cv2
from scipy.optimize import linear_sum_assignment

ROOT=Path(__file__).resolve().parents[1]
ART=ROOT/'assets'/'constellations-transparent'
BASE='34548b66aeb1cadde0fb1e643830de091d2172a6'
PARTS=ROOT/'qa'/'v293-source-bundle'
QA=ROOT/'qa'/'v293-quality-report'
EXTRA=36
MAX_CACHE_WEBP_BYTES=300_000


def original_at_main(name):
    content=subprocess.check_output(['git','show',BASE+':'+name],cwd=ROOT)
    return Image.open(BytesIO(content)).convert('RGBA')


def source_zip():
    paths=[PARTS/f'source-{i:02}.part' for i in range(1,7)]
    assert all(x.exists() for x in paths),'Input original RGB source bundle not committed'
    parts=b''.join(p.read_bytes() for p in paths)
    with ZipFile(BytesIO(parts)) as z:
        assert len(z.namelist())==39,z.namelist()
        imgs={int(Path(n).stem):Image.open(BytesIO(z.read(n))).convert('RGB') for n in z.namelist()}
    assert sorted(imgs)==list(range(1,40))
    return imgs


def gray_thumb(im,w=160,h=191):
    return cv2.cvtColor(np.asarray(im.convert('RGB').resize((w,h),Image.Resampling.BILINEAR)),cv2.COLOR_RGB2GRAY)


def coarse_score(orig,target):
    """Multi-scale template similarity. Alignment must come from original pixels."""
    height,width=target.shape
    h,w=orig.shape
    fit=min(width/w,height/h)
    score=-1.0
    for scale in np.linspace(.74,1.0,25):
        nw,nh=round(w*fit*scale),round(h*fit*scale)
        if nw>width or nh>height or nw<35 or nh<35:continue
        sample=cv2.resize(orig,(nw,nh),interpolation=cv2.INTER_AREA)
        _,m,_,_=cv2.minMaxLoc(cv2.matchTemplate(target,sample,cv2.TM_CCOEFF_NORMED))
        if m>score:score=m
    return float(score)


def best_rectangle(original, gallery):
    src=cv2.cvtColor(np.asarray(original),cv2.COLOR_RGB2GRAY)
    target=cv2.cvtColor(np.asarray(gallery),cv2.COLOR_RGB2GRAY)
    h,w=src.shape;th,tw=target.shape
    fit=min(tw/w,th/h)
    best=(-1.0,None)
    for scale in np.linspace(.74,1.0,80):
        nw,nh=round(w*fit*scale),round(h*fit*scale)
        if nw>tw or nh>th or nw<50 or nh<50:continue
        sm=cv2.resize(src,(nw,nh),interpolation=cv2.INTER_AREA)
        _,score,_,(x,y)=cv2.minMaxLoc(cv2.matchTemplate(target,sm,cv2.TM_CCOEFF_NORMED))
        if score>best[0]:best=(float(score),(x,y,nw,nh))
    return best


def render(stem,image,jpg,match_idx):
    old=original_at_main('assets/constellations-transparent/'+stem+'.png')
    # Orion's approved transparent canvas is 787x1050 while its gallery
    # JPG is 1086x1448; scale registration into the game canvas precisely.
    fw,fh=old.size
    factor=min(2.0,1200/fh,1100/fw)
    W,H=round(fw*factor),round(fh*factor)
    score,rect=best_rectangle(image,jpg)
    assert score>=0.83,(stem,'Unsafe geometry',score,rect)
    x0,y0,nw0,nh0=rect
    x,y=x0*fw/jpg.width,y0*fh/jpg.height
    nw,nh=nw0*fw/jpg.width,nh0*fh/jpg.height
    # Source-resolution reconstruction; never interpolate old JPG pixels.
    scaled=image.resize((round(nw*factor),round(nh*factor)),Image.Resampling.LANCZOS)
    raw=Image.new('RGB',(W,H),(3,7,20));raw.paste(scaled,(round(x*factor),round(y*factor)))
    rgb=np.asarray(raw,dtype=np.float32)
    new_base=np.power(np.clip(rgb/255,0,1),.68)*255
    old_data=np.asarray(old.resize((W,H),Image.Resampling.LANCZOS),dtype=np.float32)
    raw_alpha=np.asarray(old.getchannel('A').resize((W,H),Image.Resampling.LANCZOS),dtype=np.float32)/255
    support=np.asarray(old.getchannel('A').resize((W,H),Image.Resampling.NEAREST))>0
    alpha=np.power(np.clip(raw_alpha,0,1),.36)
    alpha[~support]=0
    # V292 success: transfer only smooth old palette, not JPG edge artifacts.
    old_low=cv2.GaussianBlur(old_data[:,:,:3],(0,0),3.3)
    new_low=cv2.GaussianBlur(new_base,(0,0),3.3)
    reliable=(np.clip((old_data[:,:,3]/255-.055)/.22,0,1)*np.clip((alpha-.09)/.21,0,1))
    reliable=cv2.GaussianBlur(reliable.astype('float32'),(0,0),2.8)
    color_delta=np.clip(old_low-new_low,-64,90)*.94*reliable[:,:,None]
    color=np.clip(new_base+color_delta,0,255)
    packed=np.uint8(np.clip(np.dstack((color,alpha*255))+0.5,0,255))
    packed[packed[:,:,3]==0,:3]=0
    result=Image.fromarray(packed,'RGBA')
    # Prefer original detail at 2x. Compress carefully, no network-size explosion.
    webp=ART/(stem+'.webp');png=ART/(stem+'.png')
    q=88
    while True:
        result.save(webp,'WEBP',quality=q,method=5,exact=True)
        if webp.stat().st_size<=MAX_CACHE_WEBP_BYTES or q<=76:break
        q-=3
    if webp.stat().st_size>MAX_CACHE_WEBP_BYTES:
        # Preserve detail but never exceed 300 KB: recheck after EVERY resize.
        for attempt in range(8):
            size=webp.stat().st_size
            if size<=MAX_CACHE_WEBP_BYTES:break
            s=max(.84,min(.96,math.sqrt(MAX_CACHE_WEBP_BYTES/size)*.96))
            nw2,nh2=round(result.width*s),round(result.height*s)
            if min(nw2,nh2)<720:
                raise RuntimeError(f'Artwork too heavy: {stem} {size}')
            result=result.resize((nw2,nh2),Image.Resampling.LANCZOS)
            q=max(72,min(82,q-2))
            result.save(webp,'WEBP',quality=q,method=5,exact=True)
    assert webp.stat().st_size<=MAX_CACHE_WEBP_BYTES,(stem,webp.stat().st_size)
    with Image.open(webp) as img:
        exported=img.convert('RGBA')
        assert exported.getextrema()[3][1]>0
        exported.save(png,'PNG',optimize=True,compress_level=8)
    return {'stem':stem,'original_source_zip_index':match_idx,'gallery_px':[fw,fh],
            'game_px':list(exported.size),'match_score':round(score,5),'webp_quality':q,
            'webp_bytes':webp.stat().st_size,'png_bytes':png.stat().st_size,
            'registration':[x,y,nw,nh]}


def main():
    assert (ROOT/'.git').exists(),'Run via GitHub Actions checkout, feature only'
    archive=source_zip()
    source_indices=[i for i in sorted(archive) if i!=EXTRA]
    manifest=json.loads((ART/'manifest.json').read_text())
    assert len(manifest)==38
    target={Path(item['source']).stem:Image.open(ROOT/item['source']).convert('RGB') for item in manifest}
    assert len(target)==38
    # Use every user-original source exactly once, except the known unapproved #36.
    stems=list(target)
    thumbnails={index:gray_thumb(archive[index],160,191) for index in source_indices}
    target_gray={stem:gray_thumb(target[stem]) for stem in stems}
    scores=np.array([[coarse_score(img,target_gray[stem]) for img in thumbnails.values()] for stem in stems])
    rr,cc=linear_sum_assignment(-scores)
    assignment={stems[r]:source_indices[c] for r,c in zip(rr,cc)}
    matches=[{'stem':stem,'source_index':assignment[stem],
              'score':round(float(scores[i,source_indices.index(assignment[stem])]),5),
              'next_best_score':round(float(sorted(scores[i],reverse=True)[1]),5)} for i,stem in enumerate(stems)]
    QA.mkdir(parents=True,exist_ok=True)
    (QA/'source-matches.json').write_text(json.dumps(matches,indent=2,ensure_ascii=False)+'\n')
    # Prevent the earlier Phoenix-for-Wolf mistake and any other incorrect swap.
    assert assignment['10-lyra']==18 and assignment['31-sagittarius']==39 and assignment['37-lupus']==29,assignment
    # Coarse thumbnails distort tall originals; a confident UNIQUE winner
    # can score 0.61-0.78 despite later full-resolution registration >0.97.
    # Require both an absolute threshold and clear separation from runner-up.
    weak=[v for v in matches if v['score']<.60
          or v['score']-v['next_best_score']<.105]
    assert not weak,('Untrusted source match or ambiguous runner-up.',weak)
    assert len(set(assignment.values()))==38
    generated=[]
    belt_sha={ext:subprocess.check_output(['git','rev-parse',BASE+f':assets/constellations-transparent/16-hayk-belt.{ext}'],cwd=ROOT).decode().strip() for ext in ('png','webp')}
    for stem in stems:
        if stem=='16-hayk-belt':continue  # V287-approved three star centers immutable.
        result=render(stem,archive[assignment[stem]],target[stem],assignment[stem])
        generated.append(result)
        print('V293_ART',stem,'match',result['match_score'],'bytes',result['webp_bytes'],'pixels',result['game_px'],flush=True)
    for item in manifest:
        stem=Path(item['source']).stem
        if stem=='16-hayk-belt':continue
        webp=ART/(stem+'.webp');png=ART/(stem+'.png')
        with Image.open(webp) as i:item['size']=[i.width,i.height]
        item['webp_bytes']=webp.stat().st_size
        item['png_bytes']=png.stat().st_size
    (ART/'manifest.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n')
    # Strict guard: immutable approved Orion Belt payloads.
    for ext,sha in belt_sha.items():
        path=f'assets/constellations-transparent/16-hayk-belt.{ext}'
        current=subprocess.check_output(['git','hash-object',path],cwd=ROOT).decode().strip()
        assert current==sha,('BELT CHANGED',ext,current,sha)
    report={'status':'FEATURE_ONLY_NOT_APPROVED','name':'V293','total_sources':39,
      'pictures_in_game':38,'generated':len(generated),'protected':['16-hayk-belt'],
      'max_webp_bytes':MAX_CACHE_WEBP_BYTES,'bytes_total':sum(x['webp_bytes'] for x in generated),
      'assets':generated,'source_mapping':matches}
    (QA/'report.json').write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n')
    print('V293_DONE',len(generated),sum(x['webp_bytes'] for x in generated),flush=True)

if __name__=='__main__':main()