#!/usr/bin/env python3
"""V286 safe packaging of genuinely REDRAWN, manually approved artwork.

NO compositing of constellation lines on an old image is permitted.
Run with --verify (default) for checks; --publish requires an explicit
approved full RGBA redraw PNG in artwork-redraws/sources/.
This script NEVER pushes to main and NEVER alters game logic.
"""
from __future__ import annotations
import argparse
import json
from pathlib import Path
from PIL import Image, ImageOps, ImageStat

ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'artwork-redraws'/'sources'
TARGET=ROOT/'assets'/'constellations-transparent'
STEMS=('10-lyra','16-hayk-belt','22-pisces','30-canis-minor')

def validate(stem, source: Path):
    with Image.open(source) as raw:
        if raw.mode != 'RGBA':
            raise ValueError(f'{stem}: requires finished, manually matted RGBA PNG (not JPEG or overlay)')
        im=ImageOps.exif_transpose(raw).copy()
    w,h=im.size
    if w<480 or h<550 or h<=w:
        raise ValueError(f'{stem}: portrait art must be >=480x550 with height > width')
    a=im.getchannel('A')
    extrema=a.getextrema()
    coverage=a.histogram()
    if extrema[0]!=0 or extrema[1]<248 or sum(coverage[240:])<w*h*.025:
        raise ValueError(f'{stem}: alpha must contain both transparent background and opaque luminous figure')
    if sum(coverage[:15])<w*h*.12:
        raise ValueError(f'{stem}: need substantial clear area, no full-frame rectangular nebula')
    # Check visible luminance without pretending to verify astronomical nodes.
    rgba=im.getdata()
    visible=0;blue=0;bright=0
    for r,g,b,a in rgba:
        if a<130:continue
        visible+=1
        if b>=r and b>=g*.85:blue+=1
        if min(r,g,b)>225:bright+=1
    if not visible or blue/max(visible,1)<.42 or bright<8:
        raise ValueError(f'{stem}: missing blue/violet art or luminous full-white star centres')
    return im,{"dimensions":[w,h],"opaque_pixels":sum(coverage[248:]),
               "clear_pixels":sum(coverage[:15]),"bright_stars":bright}

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--publish',action='store_true',help='Write ONLY approved 4 PNG/WebP pairs to current checkout')
    parser.add_argument('--only',choices=STEMS,nargs='*',help='Optional subset of four affected illustrations')
    args=parser.parse_args()
    names=args.only or STEMS
    pending=[x for x in names if not (SOURCE/(x+'.png')).is_file()]
    if pending:
        print('NO ASSETS MODIFIED. Awaiting manually approved full redraw sources:',', '.join(pending))
        if args.publish:raise SystemExit('Cannot publish until approved source PNGs exist')
        return
    checked={}
    for stem in names:
        im,metrics=validate(stem,SOURCE/(stem+'.png'))
        checked[stem]=(im,metrics)
        print('VALIDATED FULL REDRAW',stem,json.dumps(metrics))
    if not args.publish:
        print('VERIFY ONLY. Nothing overwritten; still needs visual + astronomical expert review.')
        return
    manifest_path=TARGET/'manifest.json'
    manifest=json.loads(manifest_path.read_text(encoding='utf8'))
    assert len(manifest)==38 and len({x['source'] for x in manifest})==38
    for stem,(im,metrics) in checked.items():
        path=TARGET/(stem+'.png')
        im.save(path,'PNG',compress_level=6)
        preview=im.copy()
        preview.thumbnail((560,760),Image.Resampling.LANCZOS)
        webp=TARGET/(stem+'.webp')
        preview.save(webp,'WEBP',quality=88,method=4)
        for row in manifest:
            if row['source']==stem+'.jpg':
                row['size']=list(im.size)
                row['png_bytes']=path.stat().st_size
                row['webp_bytes']=webp.stat().st_size
                break
        else:raise ValueError('Not in immutable manifest: '+stem)
    manifest_path.write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n',encoding='utf8')
    print('STAGED ONLY THESE FILES:',len(names),'PNG pairs + manifest; NOT DEPLOYED')
    print('Recheck original file names, star layout, game-size fit and user approval before merge.')

if __name__=='__main__':main()
