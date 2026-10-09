#!/usr/bin/env python3
"""Extract star centers from the FINAL alpha constellation art, not approximations.

All positions are NORMALIZED COORDINATES IN THE WEBP'S OWN IMAGE PIXELS.
Browser draws both puzzle stars and the finished art in this same image rect.
Preview sheets are diagnostic only and never loaded by the PWA.
"""
from pathlib import Path
import json
import math
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT=Path(__file__).resolve().parents[1]
ART=ROOT/"assets"/"constellations-transparent"
DEBUG=ROOT/"qa"/"constellation-calibration"
DEBUG.mkdir(parents=True,exist_ok=True)
manifest=json.loads((ART/"manifest.json").read_text(encoding="utf-8"))
assert len(manifest)==38
entries={}

def segment_score(gray,a,b):
    # White line support between star cores; skip endpoint glows.
    vec=b-a
    length=np.linalg.norm(vec)
    if length<18: return 0.
    samples=max(12,int(length/2))
    t=np.linspace(.08,.92,samples)
    xy=np.rint(a[None,:]+t[:,None]*vec[None,:]).astype(int)
    xy[:,0]=np.clip(xy[:,0],0,gray.shape[1]-1)
    xy[:,1]=np.clip(xy[:,1],0,gray.shape[0]-1)
    vals=gray[xy[:,1],xy[:,0]]
    bright=float((vals>85).mean())
    # Perfectly straight genuine starlines stay bright between both ends.
    return .62*bright + .38*float(np.percentile(vals,30)/200.)

def calibrate(path):
    rgba=np.array(Image.open(path).convert("RGBA"))
    h,w=rgba.shape[:2]
    rgb=rgba[:,:,:3].astype(np.float32)
    alpha=rgba[:,:,3].astype(np.float32)/255.
    core=np.min(rgb,axis=2)*alpha
    # Find localized, fairly white peaks on the approved finished illustration.
    sm=cv2.GaussianBlur(core,(0,0),1.8)
    distant=cv2.GaussianBlur(core,(0,0),15)
    peak=np.clip(sm-distant*.45,0,255)
    maxima=cv2.dilate(peak,np.ones((23,23),np.uint8))
    binary=np.uint8((peak>=maxima-.18)&(sm>92)&(alpha>.35))
    count,labels,stats,centroids=cv2.connectedComponentsWithStats(binary,8)
    rough=[]
    for i in range(1,count):
        if stats[i,cv2.CC_STAT_AREA]>160:continue
        x,y=map(float,centroids[i])
        if x<.035*w or x>.965*w or y<.035*h or y>.965*h:continue
        xi,yi=int(round(x)),int(round(y))
        lo=cv2.getRectSubPix(core.astype(np.float32),(15,15),(x,y))
        mid=float(np.mean(lo))
        val=float(peak[yi,xi])
        strength=val + .45*mid
        if strength<115:continue
        rough.append((strength,np.array([x,y])))
    rough.sort(key=lambda k:k[0],reverse=True)
    # A star is a touch target: reject smaller superposed glint spots within
    # 25-35 native pixels, including specks along already detected bright beams.
    pts=[]
    separation=max(19.,min(w,h)*.046)
    for strength,pos in rough:
        if any(float(np.linalg.norm(pos-p))<separation for p in pts):continue
        pts.append(pos)
        if len(pts)>=24:break
    # Do not invent vertices. If the artwork has weak dots, a hand-checked
    # override should be added instead of fabricating fallback x/y coordinates.
    if len(pts)<3:
        raise RuntimeError(f"{path}: only {len(pts)} luminous peaks; needs review")
    pts=np.array(pts,dtype=np.float32)
    # Deterministic toddler-friendly traversal, starting near top and then
    # nearest unused point. The LINKS are independently checked against the art.
    unused=set(range(len(pts)))
    first=int(np.argmin(pts[:,1]+pts[:,0]*.03))
    order=[first];unused.remove(first)
    while unused:
        last=pts[order[-1]]
        next_i=min(unused,key=lambda i:np.linalg.norm(pts[i]-last))
        order.append(next_i);unused.remove(next_i)
    reordered=pts[order]
    # Prefer the visual existing lines; don't draw an invented diagonal through
    # an unconnected body part merely because two stars were activated in order.
    edges=[]
    for i in range(len(pts)):
        ranked=[]
        for j in range(i+1,len(pts)):
            a,b=pts[i],pts[j]
            dist=float(np.linalg.norm(a-b))
            if dist>max(w,h)*.54:continue
            crossing=any(
                np.linalg.norm(pts[k]-(a+np.clip(np.dot(pts[k]-a,b-a)/max(1.,np.dot(b-a,b-a)),0,1)*(b-a)))<separation*.48
                for k in range(len(pts)) if k!=i and k!=j
            )
            if crossing:continue
            score=segment_score(core,a,b)
            if score>.48:ranked.append((score,dist,j))
        ranked.sort(key=lambda t:(-t[0],t[1]))
        for score,dist,j in ranked[:3]:
            if (i,j) not in edges: edges.append((i,j))
    reverse={k:i for i,k in enumerate(order)}
    edges=sorted([sorted([reverse[i],reverse[j]]) for i,j in edges])
    # Only actual illustrated light-line vertices belong to the game. The
    # unconstrained brightest-24 candidate list contains disconnected galactic
    # dust stars; discard nodes that do not join any line from the art.
    degree=[0]*len(reordered)
    neighbors=[set() for _ in reordered]
    for i,j in edges:
        degree[i]+=1;degree[j]+=1
        neighbors[i].add(j);neighbors[j].add(i)
    # Tiny isolated doublets typically come from the nebula background,
    # not the illustrated animal/human star diagram. Keep the true connected
    # body components; specifically preserve both real Pisces figures.
    visited=set()
    components=[]
    for i in range(len(reordered)):
        if i in visited or degree[i]==0:continue
        stack=[i];visited.add(i);component=[]
        while stack:
            node=stack.pop();component.append(node)
            for nxt in neighbors[node]:
                if nxt not in visited:
                    visited.add(nxt);stack.append(nxt)
        components.append(component)
    chosen=sorted(i for component in components if len(component)>=3 for i in component)
    if len(chosen)<3:
        raise RuntimeError(f"{path}: only {len(chosen)} line-supported points")
    # Avoid overwhelming young children with 24 touches while retaining the
    # line-supported structure in the original design. Degree >1 gets priority.
    if len(chosen)>16:
        chosen=sorted(sorted(chosen,key=lambda i:(-degree[i],i))[:16])
    chosen_set=set(chosen)
    old_to_new={old:index for index,old in enumerate(chosen)}
    edges=[[old_to_new[a],old_to_new[b]] for a,b in edges
           if a in chosen_set and b in chosen_set]
    reordered=reordered[chosen]
    points=np.round(reordered/np.array([w,h]),5).tolist()
    return points,edges,(w,h),core,rgba

for item in manifest:
    path=ROOT/item["webp"]
    points,edges,(w,h),core,rgba=calibrate(path)
    name=Path(item["source"]).stem
    diag=Image.fromarray(rgba,"RGBA")
    bg=Image.new("RGB",(w,h),(15,21,63))
    bg.paste(diag,mask=diag.getchannel("A"))
    d=ImageDraw.Draw(bg)
    for i,j in edges:
        u,v=points[i],points[j]
        d.line((u[0]*w,u[1]*h,v[0]*w,v[1]*h),fill=(255,200,65),width=2)
    for i,(x,y) in enumerate(points):
        x*=w;y*=h
        d.ellipse((x-7,y-7,x+7,y+7),outline=(255,80,75),width=3)
        d.text((x+8,y-12),str(i+1),fill=(255,255,200))
    bg.thumbnail((500,700),Image.Resampling.LANCZOS)
    bg.save(DEBUG/(name+".jpg"),quality=79)
    id=name.split("-",1)[1]
    entries[id]={"points":points,"edges":edges,"image":item["webp"]}
    print(f"{id:19s} stars={len(points):2d} links={len(edges):2d} size={w}x{h}")
assert len(entries)==38
target=ROOT/"constellation-star-layouts.json"
target.write_text(json.dumps(entries,ensure_ascii=False,separators=(",",":"))+"\n",encoding="utf-8")
print("DONE layouts:",target,"38 images",sum(len(i["points"]) for i in entries.values()),"anchors")
