#!/usr/bin/env python3
"""Build alpha PNG originals and small alpha WebP runtime constellation images.

Uses the CURRENT approved root JPG sources in GitHub (not old ZIP versions).
Keep the original 38 JPGs untouched. No heavyweight background image downloads.
"""
import json
import re
from pathlib import Path
import numpy as np
import cv2
from PIL import Image, ImageFilter

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"assets"/"constellations-transparent"
OUT.mkdir(parents=True,exist_ok=True)
# The repository also has numbered planet JPEGs; only use the canonical
# constellation manifest, never a broad numbered-file glob.
manifest_source=json.loads((ROOT/"constellations-manifest.json").read_text(encoding="utf-8"))
SOURCES=[ROOT/item["file"] for item in manifest_source]
if len(SOURCES)!=38 or len(set(SOURCES))!=38 or any(not p.is_file() for p in SOURCES):
    raise RuntimeError("Canonical constellation manifest must list 38 unique existing JPGs")

def extract(source):
    im=Image.open(source).convert("RGB")
    im.thumbnail((900,1050),Image.Resampling.LANCZOS)
    rgb=np.asarray(im,dtype=np.float32)
    local=np.asarray(im.filter(ImageFilter.GaussianBlur(11)),dtype=np.float32)
    red,green,blue=rgb[:,:,0],rgb[:,:,1],rgb[:,:,2]
    value=np.max(rgb,axis=2)
    light=np.clip((value-np.max(local,axis=2)-4)/36,0,1)
    blue_detail=np.clip((blue-local[:,:,2]-2)/23,0,1)
    chroma=np.clip((blue-red-10)/70,0,1)*np.clip((blue-green-3)/40,0,1)
    lum=np.clip((value-35)/100,0,1)
    alpha=np.clip(.78*np.maximum(light,blue_detail)+.30*chroma*lum,0,1)
    alpha_img=Image.fromarray(np.uint8(alpha*255),"L")
    alpha=np.asarray(alpha_img.filter(ImageFilter.GaussianBlur(.55)),dtype=np.float32)/255
    alpha=np.clip((alpha-.06)/.94,0,1)
    h,w=alpha.shape
    yy,xx=np.ogrid[:h,:w]
    edge=np.minimum.reduce(np.broadcast_arrays(xx,yy,w-1-xx,h-1-yy))
    alpha*=np.clip(edge/9.0,0,1)
    # Keep the luminous constellation body, not the disconnected nebula
    # patches/stars from the old JPEG background. Two similarly large
    # separate components are intentionally retained (e.g. BOTH Pisces).
    seed=(alpha>.55).astype("uint8")
    seed=cv2.dilate(seed,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(15,15)))
    count,labels,stats,_=cv2.connectedComponentsWithStats(seed,8)
    if count>1:
        sizes=stats[1:,cv2.CC_STAT_AREA]
        max_size=int(sizes.max())
        chosen=[i+1 for i,area in enumerate(sizes) if area>=.45*max_size]
        support=np.isin(labels,chosen).astype("uint8")
        support=cv2.dilate(support,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(29,29)))
        support=cv2.GaussianBlur(support.astype("float32"),(0,0),4)
        alpha*=support
    rgba=np.empty((h,w,4),dtype=np.uint8)
    rgba[:,:,:3]=np.uint8(np.clip(rgb*1.48,0,255))
    rgba[:,:,3]=np.uint8(np.where(alpha<.085,0,alpha*255))
    rgba[rgba[:,:,3]==0,:3]=0
    return Image.fromarray(rgba,"RGBA")

manifest=[]
for source in SOURCES:
    art=extract(source)
    png=OUT/(source.stem+".png")
    webp=OUT/(source.stem+".webp")
    art.save(png,format="PNG",optimize=False,compress_level=6)
    # Keep full-resolution PNG archival source; size only the game-time copy.
    runtime=art.copy()
    runtime.thumbnail((560,760),Image.Resampling.LANCZOS)
    runtime.save(webp,format="WEBP",quality=80,method=3)
    coverage=np.asarray(art.getchannel("A"))
    if coverage.max()<150 or np.count_nonzero(coverage>30)<200:
        raise RuntimeError("Unexpected empty mask: "+source.name)
    manifest.append({"source":source.name,"png":png.relative_to(ROOT).as_posix(),
                     "webp":webp.relative_to(ROOT).as_posix(),"size":list(art.size),
                     "png_bytes":png.stat().st_size,"webp_bytes":webp.stat().st_size})
(OUT/"manifest.json").write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print("DONE: 38 approved constellation PNG + alpha WebP pairs")
print("Runtime WebP bytes:",sum(m["webp_bytes"] for m in manifest))
print("Source PNG bytes:",sum(m["png_bytes"] for m in manifest))
