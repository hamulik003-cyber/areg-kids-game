#!/usr/bin/env python3
"""V294 immutable-baseline image-coordinate audit. No production file changes."""
from io import BytesIO
from pathlib import Path
import subprocess,json,math
import numpy as np
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
ART=ROOT/'assets/constellations-transparent'
BASE='34548b66aeb1cadde0fb1e643830de091d2172a6'
OUT=ROOT/'qa/v294-geometry'
OUT.mkdir(exist_ok=True,parents=True)
def oldimg(stem,ext):
    raw=subprocess.check_output(['git','show',f'{BASE}:assets/constellations-transparent/{stem}.{ext}'])
    return Image.open(BytesIO(raw)).convert('RGBA')
def js_alpha_bounds(img):
    n=128
    a=np.asarray(img.resize((n,n),Image.Resampling.BILINEAR).getchannel('A'),np.uint8)
    hits=a>=95
    weights=np.where(hits,a/255.0,0.0)
    hx=weights.sum(axis=0);hy=weights.sum(axis=1);total=hx.sum()
    if total<35:return dict(x=.5,y=.5,w=.85,h=.85,total=float(total),fallback=True)
    def percentile(hist,p):
        i=np.searchsorted(np.cumsum(hist),total*p)
        return min(n-1,int(i))/n
    left,right=percentile(hx,.018),percentile(hx,.982)
    top,bottom=percentile(hy,.018),percentile(hy,.982)
    return dict(x=(left+right)/2,y=(top+bottom)/2,w=np.clip(right-left+.045,.12,1).item(),h=np.clip(bottom-top+.045,.12,1).item(),total=float(total),fallback=False)
def geometry(img,b,box=(175,230)):
    W,H=img.size; cw,ch=box
    shownW,shownH=(W*min(cw/W,ch/H),H*min(cw/W,ch/H))
    figW,figH=(b['w']*shownW,b['h']*shownH)
    zoom=np.clip(min(cw*.84/max(figW,1),ch*.84/max(figH,1)),.88,2.02)
    dx=-zoom*(b['x']-.5)*shownW
    dy=-zoom*(b['y']-.5)*shownH
    return dict(figW=figW*zoom,figH=figH*zoom,zoom=float(zoom),dx=float(dx),dy=float(dy))
def measure(stem):
    old=oldimg(stem,'webp')
    new=Image.open(ART/f'{stem}.webp').convert('RGBA')
    o=js_alpha_bounds(old);n=js_alpha_bounds(new)
    og=geometry(old,o);ng=geometry(new,n)
    ao=np.asarray(old.getchannel('A'));an=np.asarray(new.getchannel('A'))
    def avg(im,alpha):
        rgb=np.asarray(im.convert('RGB'),dtype=np.float32)
        valid=alpha>=95
        lum=np.max(rgb,axis=2)
        v=lum[valid]
        return dict(alphaAbove95=float(valid.mean()),rgbMaxMean=float(v.mean()) if v.size else 0.0,brightPct=float((v>180).mean()) if v.size else 0)
    v1=avg(old,ao);v2=avg(new,an)
    return dict(stem=stem,oldSize=list(old.size),newSize=list(new.size),
        originalBounds={k:round(float(v),5) for k,v in o.items()},
        newBounds={k:round(float(v),5) for k,v in n.items()},
        baselineGeometry={k:round(v,4) for k,v in og.items()},
        newGeometry={k:round(v,4) for k,v in ng.items()},
        widthRatio=round(ng['figW']/og['figW'],4),heightRatio=round(ng['figH']/og['figH'],4),
        shiftDifference=[round(ng['dx']-og['dx'],3),round(ng['dy']-og['dy'],3)],
        oldOpacity=v1,newOpacity=v2,
        differenceInOpacityPct=round((v2['alphaAbove95']/max(v1['alphaAbove95'],1e-9)-1)*100,1))
def main():
    manifest=json.loads((ART/'manifest.json').read_text())
    rows=[measure(Path(x['source']).stem) for x in manifest]
    flags=[dict(stem=r['stem'],widthRatio=r['widthRatio'],heightRatio=r['heightRatio'],shiftDifference=r['shiftDifference'],differenceInOpacityPct=r['differenceInOpacityPct']) for r in rows
        if abs(r['widthRatio']-1)>.04 or abs(r['heightRatio']-1)>.04 or max(map(abs,r['shiftDifference']))>5 or abs(r['differenceInOpacityPct'])>25]
    report={'baseline':BASE,'compared':len(rows),'flagged':len(flags),'flags':flags,'results':rows}
    (OUT/'audit.json').write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n')
    print('V294_GEOMETRY_AUDIT',json.dumps({'count':len(rows),'flagged':len(flags),'flags':flags},ensure_ascii=False))
    assert len(rows)==38
if __name__=='__main__':main()
