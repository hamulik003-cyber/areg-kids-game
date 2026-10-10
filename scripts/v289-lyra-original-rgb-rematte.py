#!/usr/bin/env python3
"""V289 - source-JPG Lyra transparency rebuild. PIL/NumPy only, NEVER new art.

Uses original ROOT/10-lyra.jpg RGB for every visible pixel; uses approved
game PNG only as geometric alpha support. No generative models, no sharpening,
no background guesses, no color gains, no line/pose/star changes.
Only produces QA previews; original game assets are NEVER rewritten.
"""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import numpy as np,json,hashlib

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'qa/v289-lyra-restore'
OUT.mkdir(parents=True,exist_ok=True)
STEM='10-lyra'
img=Image.open(ROOT/(STEM+'.jpg')).convert('RGB')
live_png=Image.open(ROOT/'assets/constellations-transparent'/(STEM+'.png')).convert('RGBA')
live_webp=Image.open(ROOT/'assets/constellations-transparent'/(STEM+'.webp')).convert('RGBA')
assert img.size==live_png.size==live_webp.size,(img.size,live_png.size,live_webp.size)
rgb=np.array(img,np.uint8)
alpha=np.asarray(live_png.getchannel('A'),dtype=np.uint8)
mask_support=alpha>0
assert np.count_nonzero(mask_support)>12000
modes=[('gentle',.57),('vivid',.33),('full',.20)]
preview={}

for name,pow_ in modes:
    lift=np.round(255*np.power(alpha.astype(np.float32)/255.,pow_)).clip(0,255).astype(np.uint8)
    assert np.array_equal(lift>0,mask_support),'MASK SHAPE CHANGED'
    assert np.all(lift>=alpha),'NOT AN OPACITY RECOVERY'
    out=np.dstack((rgb,lift)).copy()
    # Even invisible RGB can carry junk; transparent pixels are zeroed.
    out[~mask_support]=0
    restored=Image.fromarray(out,'RGBA')
    pngpath=OUT/(STEM+'-from-original-'+name+'.png')
    webppath=OUT/(STEM+'-from-original-'+name+'.webp')
    restored.save(pngpath,'PNG',compress_level=9,optimize=True)
    restored.save(webppath,'WEBP',quality=88,method=5,exact=True)
    decoded=Image.open(webppath).convert('RGBA')
    assert decoded.size==img.size
    preview[name]=restored
    print('V289',name,'alphaExponent',pow_,'PNG',pngpath.stat().st_size,'WebP',webppath.stat().st_size)

# Fair comparative images against ACTUAL approved game navy background,
# identical artwork bounding box and no subjective scaling.
BG=(8,14,43,255)
CARDW,CARDH=600,820
def panel(im,title,opaque=False):
    layer=im.convert('RGBA')
    bg=Image.new('RGBA',im.size,BG)
    bg.alpha_composite(layer)
    card=Image.new('RGB',(CARDW,CARDH),BG[:3])
    r=bg.convert('RGB').resize((548,round(bg.height*548/bg.width)),Image.Resampling.LANCZOS)
    y=78+(CARDH-112-r.height)//2
    card.paste(r,((CARDW-r.width)//2,y))
    d=ImageDraw.Draw(card)
    d.rectangle((0,0,CARDW,67),fill=(25,35,68))
    d.text((26,23),title,fill=(248,250,255))
    return card

labels=[
 ('ORIGINAL JPG (with source background)',img.convert('RGBA')),
 ('IN GAME: V287 transparent WebP',live_webp),
 ('REBUILD A: source RGB gentle matte',preview['gentle']),
 ('REBUILD B: source RGB vivid matte',preview['vivid'])
]
sheet=Image.new('RGB',(CARDW*len(labels),CARDH),BG[:3])
for idx,(name,im) in enumerate(labels):
    sheet.paste(panel(im,name),(idx*CARDW,0))
sheet.save(OUT/'10-lyra-original-vs-game-vs-rebuilt.jpg',quality=94,subsampling=0)
# Two cards zoom same image coordinates; clean subject with no overlay labels.
mini=Image.new('RGB',(CARDW*2,CARDH),BG[:3])
for k,pair in enumerate([labels[1],labels[3]]):mini.paste(panel(pair[1],pair[0]),(k*CARDW,0))
mini.save(OUT/'10-lyra-game-vs-rebuilt-vivid.jpg',quality=95,subsampling=0)

def digest(path):return hashlib.sha256(path.read_bytes()).hexdigest()
report={
  'source':STEM+'.jpg','dimensions':img.size,
  'original_jpg_bytes':(ROOT/(STEM+'.jpg')).stat().st_size,
  'live_png_bytes':(ROOT/'assets/constellations-transparent'/(STEM+'.png')).stat().st_size,
  'live_webp_bytes':(ROOT/'assets/constellations-transparent'/(STEM+'.webp')).stat().st_size,
  'support_exactly_identical':True,'pixel_data_from_original_jpg_RGB':True,
  'no_generation':True,'no_sharpening_or_color_shift':True,
  'trials':[
   {'id':n,'opacity_exponent':e,'png_bytes':(OUT/(STEM+'-from-original-'+n+'.png')).stat().st_size,
    'webp_bytes':(OUT/(STEM+'-from-original-'+n+'.webp')).stat().st_size}
   for n,e in modes],
  'live_file_hashes_unchanged':{
    'jpg':digest(ROOT/(STEM+'.jpg')),
    'png':digest(ROOT/'assets/constellations-transparent'/(STEM+'.png')),
    'webp':digest(ROOT/'assets/constellations-transparent'/(STEM+'.webp'))}
}
(OUT/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print('SUCCESS: original JPEG RGB preserved, 3 original-size PNG/WebP pilot pairs, 2 comparisons, NO LIVE ASSETS MODIFIED.')
