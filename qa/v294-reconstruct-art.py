#!/usr/bin/env python3
"""Keep 36 V294 original-detail pictures, restore V287 alpha layout and palette.
No new picture generation, no content redrawing, no alternate game design.
"""
from pathlib import Path
from io import BytesIO
import subprocess,json,math
import numpy as np
from PIL import Image,ImageFilter

ROOT=Path(__file__).resolve().parents[1]
ART=ROOT/'assets'/'constellations-transparent'
BASE='34548b66aeb1cadde0fb1e643830de091d2172a6'
REPORT=ROOT/'qa/v294-geometry'
REPORT.mkdir(exist_ok=True,parents=True)
PROTECTED={'01-hayk-orion','16-hayk-belt'}
MAX_BYTES=345000

def v287(stem):
    b=subprocess.check_output(['git','show',f'{BASE}:assets/constellations-transparent/{stem}.png'],cwd=ROOT)
    return Image.open(BytesIO(b)).convert('RGBA')

def image_stats(old,im):
    target=np.asarray(old.convert('RGB'),np.float32)
    a=np.asarray(old.getchannel('A'),np.uint8)>=95
    inp=np.asarray(im.convert('RGB'),np.float32)
    out=np.asarray(im.getchannel('A'),np.uint8)>=95
    return dict(oldMean=float(np.max(target,axis=2)[a].mean()),
        newMean=float(np.max(inp,axis=2)[out].mean()),
        oldCoverage=float(a.mean()),newCoverage=float(out.mean()))

def main():
    manifest=json.loads((ART/'manifest.json').read_text())
    assert len(manifest)==38
    out=[]
    for record in manifest:
        stem=Path(record['source']).stem
        if stem in PROTECTED:
            continue
        old=v287(stem)
        path=ART/(stem+'.webp')
        new=Image.open(path).convert('RGBA')
        # Preserve V294 resolution, image position and detailed source RGB.
        # Restore V287 exact opacity/outline scaled with a quality resampler.
        up=old.resize(new.size,Image.Resampling.LANCZOS)
        old_rgb=np.asarray(up.convert('RGB'),np.float32)
        new_rgb=np.asarray(new.convert('RGB'),np.float32)
        # V287 palette and brightness at low spatial frequencies,
        # V294 source-resolution strokes and stars at high frequencies.
        sigma=2.0
        oldlow=np.asarray(up.convert('RGB').filter(ImageFilter.GaussianBlur(sigma)),np.float32)
        newlow=np.asarray(new.convert('RGB').filter(ImageFilter.GaussianBlur(sigma)),np.float32)
        color=np.clip(oldlow+(new_rgb-newlow)*1.08,0,255)
        alpha=np.asarray(up.getchannel('A'),np.uint8)
        rgba=np.empty((*alpha.shape,4),np.uint8)
        rgba[:,:,:3]=np.uint8(color+.5)
        rgba[:,:,3]=alpha
        rgba[alpha==0,:3]=0
        corrected=Image.fromarray(rgba,'RGBA')
        # If image is too large, lower WebP RGB quality, never crop or move art.
        selected=None
        for quality in [85,82,79,76,73,70,67,64,60,56,52]:
            corrected.save(path,'WEBP',quality=quality,method=4,exact=True)
            if path.stat().st_size<=MAX_BYTES:
                selected=quality
                break
        assert selected is not None,('Cannot keep WebP safely <=345 KB',stem,path.stat().st_size)
        with Image.open(path) as im:
            decoded=im.convert('RGBA')
        decoded.save(ART/(stem+'.png'),'PNG',compress_level=9,optimize=True)
        report=image_stats(up,decoded)
        assert abs(report['newCoverage']/report['oldCoverage']-1)<.11,(stem,'alpha mismatch',report)
        assert abs(report['newMean']-report['oldMean'])<15,(stem,'brightness mismatch',report)
        for key in ('png','webp'):
            record[key]=f'assets/constellations-transparent/{stem}.{key}'
        record['size']=[decoded.width,decoded.height]
        record['webp_bytes']=path.stat().st_size
        record['png_bytes']=(ART/(stem+'.png')).stat().st_size
        out.append(dict(stem=stem,pixels=record['size'],webpBytes=path.stat().st_size,quality=selected,**report))
        print('V294_FIX',stem,'old/new brightness',round(report['oldMean'],1),round(report['newMean'],1),'alpha coverage',round(report['oldCoverage'],3),round(report['newCoverage'],3),'KB',round(path.stat().st_size/1024),flush=True)
    (ART/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
    (REPORT/'reconstruction.json').write_text(json.dumps({'count':len(out),'assets':out,'protected':sorted(PROTECTED)},indent=2,ensure_ascii=False)+'\n')
    print('V294_FIXED_COUNT',len(out),flush=True)
if __name__=='__main__':main()
