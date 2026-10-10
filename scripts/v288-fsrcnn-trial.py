#!/usr/bin/env python3
"""V288 FSRCNN x2 free pretrained super-resolution PILOT: no text-to-image.

Read original source JPEG+RGBA source PNG. Never generate new compositions,
positions, labels, lines or characters. Only QA-side outputs, not game assets.
FSRCNN weights from Saafke/FSRCNN_Tensorflow (Apache-2.0 license).
"""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import cv2,numpy as np,json,sys

ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'assets/constellations-transparent'
OUT=ROOT/'qa/v288-previews'
MODEL=Path(sys.argv[1]) if len(sys.argv)>1 else Path('/tmp/FSRCNN_x2.pb')
assert MODEL.exists() and 25000<MODEL.stat().st_size<100000,MODEL
out=OUT
out.mkdir(parents=True,exist_ok=True)
sr=cv2.dnn_superres.DnnSuperResImpl_create()
sr.readModel(str(MODEL))
sr.setModel('fsrcnn',2)
names=['02-ursa-major','10-lyra','22-pisces']
info=[]

def plate(im,title):
    b=Image.new('RGB',(810,1060),(9,16,44))
    layer=im.convert('RGBA')
    layer=layer.resize((768,round(layer.height*768/layer.width)),Image.Resampling.LANCZOS)
    if layer.height>925:layer.thumbnail((768,925),Image.Resampling.LANCZOS)
    b.paste(layer,((810-layer.width)//2,74+(925-layer.height)//2),layer)
    ImageDraw.Draw(b).text((24,21),title,fill=(240,246,255))
    return b

for stem in names:
    existing=Image.open(SRC/(stem+'.webp')).convert('RGBA')
    png=Image.open(SRC/(stem+'.png')).convert('RGBA')
    jpg=Image.open(ROOT/(stem+'.jpg')).convert('RGB')
    assert png.size==jpg.size,(stem,png.size,jpg.size)
    rgba=np.asarray(png,dtype=np.float32)
    originalRGB=np.asarray(jpg,dtype=np.float32)
    a=rgba[:,:,3:]/255.
    # Only fill partially transparent RGB from original SAME illustration.
    # Critical: prevents opaque black RGB from bleeding into glowing edges.
    cleanRGB=(rgba[:,:,:3]*a+originalRGB*(1-a)).clip(0,255).astype(np.uint8)
    src_bgr=cv2.cvtColor(cleanRGB,cv2.COLOR_RGB2BGR)
    scaled_bgr=sr.upsample(src_bgr)
    assert scaled_bgr.shape[:2]==(png.height*2,png.width*2)
    rgb=cv2.cvtColor(scaled_bgr,cv2.COLOR_BGR2RGB)
    a2=np.asarray(png.getchannel('A').resize((png.width*2,png.height*2),
                   Image.Resampling.LANCZOS),dtype=np.uint8)
    result=Image.fromarray(np.dstack([rgb,a2]),mode='RGBA')
    webp=OUT/(stem+'-fsrcnn2x.webp')
    result.save(webp,'WEBP',quality=94,method=4,exact=True)
    # All panels at SAME physical display scale/position, exactly as prior pilots.
    prior=Image.open(OUT/(stem+'-clean-light.webp')).convert('RGBA')
    sheet=Image.new('RGB',(810*3,1060),(9,16,44))
    for i,im in enumerate((existing,prior,result)):
        sheet.paste(plate(im,('Original game WebP','Free classic PIL/OpenCV','Free FSRCNN x2: same art')[i]),(810*i,0))
    sheet.save(OUT/(stem+'-compare-with-fsrcnn.jpg'),quality=94,subsampling=0)
    info.append({'stem':stem,'source':png.size,'fsrcnnOut':result.size,
                 'candidateWebPBytes':webp.stat().st_size})
(OUT/'fsrcnn-report.json').write_text(json.dumps({
    'method':'OpenCV FSRCNN x2 pretrained SR (NOT text-to-image)',
    'model':'Saafke/FSRCNN_Tensorflow Apache-2.0',
    'userApprovalRequired':True,'candidates':info},indent=2)+'\n')
print('V288 free FSRCNN done; 3 QA-only x2 samples and 3 equal-size comparisons:',info)
