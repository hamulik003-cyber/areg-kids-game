#!/usr/bin/env python3
"""AREG V288 FREE NON-GENERATIVE photo restoration PILOT. NO generative models.

Reads EXACT live V287 RGBA source and current WebP; outputs THREE
comparisons without changing any game asset or production source.
No trained weights, GAN, AI inference, remasking, new shapes or colors.
"""
from pathlib import Path
import json, numpy as np, cv2
from PIL import Image,ImageOps,ImageDraw,ImageFont

ROOT=Path(__file__).resolve().parents[1]
ART=ROOT/'assets/constellations-transparent'
OUT=ROOT/'qa/v288-previews'
OUT.mkdir(parents=True,exist_ok=True)
PILOTS=('02-ursa-major','10-lyra','22-pisces')
GOAL_W=768

def cleaned(src:Image.Image,lift:bool):
    """Premultiplied-alpha upscale and restrained non-AI color-preserving sharpening."""
    v=np.asarray(src.convert('RGBA')).astype(np.float32)
    rgb=v[:,:,:3]
    alpha=v[:,:,3]/255.
    height,width=alpha.shape
    target=(round(GOAL_W),round(height*GOAL_W/width))
    a=cv2.resize(alpha,target,interpolation=cv2.INTER_LANCZOS4).clip(0,1)
    premul=cv2.resize(rgb*alpha[:,:,None],target,interpolation=cv2.INTER_LANCZOS4).clip(0,255)
    decoded=premul/np.maximum(a[:,:,None],0.025)
    decoded=decoded.clip(0,255)
    # Mild spatial noise reduction, mixed at 24% strength only. 
    # Preserve all existing star lines, edges, pose and palette.
    base=np.uint8(np.rint(decoded))
    filtered=cv2.bilateralFilter(base,d=5,sigmaColor=9,sigmaSpace=1.6).astype(np.float32)
    smooth=.76*decoded+.24*filtered
    # Anti-halo unsharp: compare only premultiplied neighbors instead of
    # allowing transparent black pixels to contaminate blue-white outlines.
    smoothPre=smooth*a[:,:,None]
    blurredPre=cv2.GaussianBlur(smoothPre,(0,0),.85)
    blurredA=cv2.GaussianBlur(a,(0,0),.85)
    local=blurredPre/np.maximum(blurredA[:,:,None],0.025)
    micro=np.clip(.72*(smooth-local),-12,12)
    output=(smooth+micro*np.minimum(1,a[:,:,None]*2.5)).clip(0,255)
    outA=a.copy()
    if lift:
        # Opacity-only recovery of REAL existing blue/white source pixels.
        # Every fully transparent pixel stays fully transparent; no new shape,
        # star, line, geometry, alpha island or background is introduced.
        strength=np.clip((output.max(2)-35)/115,0,1)
        delta=.51*(1-a)*a*strength
        outA=np.where(a>.015,np.minimum(1,a+delta),a)
    out=np.dstack((output,np.round(outA*255))).astype(np.uint8)
    out[a<=.003]=0
    assert np.count_nonzero((a<.003)&(out[:,:,3]>0))==0
    return Image.fromarray(out,'RGBA')

def preview_panel(img,title):
    bg=Image.new('RGB',(810,1060),(9,16,44))
    layer=img.convert('RGBA').copy()
    layer=layer.resize((768,round(layer.height*768/layer.width)),Image.Resampling.LANCZOS)
    if layer.height>925:
        layer.thumbnail((768,925),Image.Resampling.LANCZOS)
    x=(810-layer.width)//2
    y=74+(925-layer.height)//2
    bg.paste(layer,(x,y),layer)
    draw=ImageDraw.Draw(bg)
    draw.text((26,20),title,fill=(240,246,255),font=ImageFont.load_default())
    return bg

manifest=json.loads((ART/'manifest.json').read_text(encoding='utf8'))
assert len(manifest)==38
totals=[]
for stem in PILOTS:
    png=ART/(stem+'.png')
    originalWebp=ART/(stem+'.webp')
    src=Image.open(png).convert('RGBA')
    old=Image.open(originalWebp).convert('RGBA')
    if src.width<470 or src.height<550:raise RuntimeError('low-res missing source '+stem)
    a=cleaned(src,lift=False)
    b=cleaned(src,lift=True)
    assert a.size==b.size
    assert np.array_equal(np.asarray(a.getchannel('A')),np.asarray(b.getchannel('A')))==False
    # 3 variants are confined to QA; production images NEVER overwritten.
    sample=[]
    for label,im in [('clean',a),('clean-light',b)]:
        path=OUT/f'{stem}-{label}.webp'
        im.save(path,format='WEBP',quality=94,method=5,exact=True)
        sample.append((label,path.stat().st_size))
    panels=[preview_panel(old,stem+' | ORIGINAL V287 WebP'),
            preview_panel(a,'CLEAN ONLY: no alpha change'),
            preview_panel(b,'CLEAN + EXISTING LIGHT OPACITY')]
    sheet=Image.new('RGB',(810*3,1060),(0,0,0))
    for k,panel in enumerate(panels):sheet.paste(panel,(k*810,0))
    sheet.save(OUT/f'{stem}-comparison.jpg',quality=93,subsampling=0)
    totals.append({'stem':stem,'pngDims':src.size,'originalWebP':old.size,
                   'enhanced':a.size,'bytes':sample,'compare':f'{stem}-comparison.jpg'})
(OUT/'report.json').write_text(json.dumps({'method':'PIL+OpenCV deterministic only; no new generation','variants':totals},
   ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps(totals,ensure_ascii=False))
print('PASS: 3 compare sheets, 6 QA-only WebPs; ZERO changes to live constellation assets')
