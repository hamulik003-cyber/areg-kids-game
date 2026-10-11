import { chromium, webkit } from 'playwright';

// Temporary, nonblocking PR QA only. Do not alter 3D rendering or artwork.
// The GitHack HTML origin redirects PNG/JPG assets to raw.githubusercontent.com.
// A 2D <img> loading successfully isn't sufficient: the image must be
// origin-clean to upload to a WebGLTexture on mobile Safari.
const sha=process.env.AREG_PREVIEW_HEAD;
if(!sha){console.log('3D CDN CORS preview check skipped outside pull request');process.exit(0)}
const isWebKit=process.env.AREG_BROWSER==='webkit';
const engine=isWebKit?webkit:chromium;
const browser=await engine.launch(isWebKit?{headless:true}:{channel:'chrome',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
try{
  const page=await browser.newPage();
  await page.goto('about:blank');
  const items=[
    {name:'04-earth.png',path:'assets/space3d/user-final/04-earth.png?v=final27repo4'},
    {name:'08-saturn.png',path:'assets/space3d/user-final/08-saturn.png?v=final27repo4'},
    {name:'09-uranus.png',path:'assets/space3d/user-final/09-uranus.png?v=final27repo4'},
    {name:'black-hole-reference-v216.webp',path:'assets/space3d/black-hole-reference-v216.webp?v=232'}
  ];
  for(const item of items){
    const src='https://rawcdn.githack.com/hamulik003-cyber/areg-kids-game/'+sha+'/'+item.path;
    const outcome=await page.evaluate(async url=>{
      const img=new Image();
      img.crossOrigin='anonymous';
      img.decoding='async';
      const loaded=new Promise((resolve,reject)=>{
        img.onload=resolve;img.onerror=()=>reject(new Error('Cross-origin image load failed'));
      });
      img.src=url;
      await loaded;
      const check=document.createElement('canvas');
      check.width=8;check.height=8;
      const ctx=check.getContext('2d');
      ctx.drawImage(img,0,0,8,8);
      const pixel=[...ctx.getImageData(4,4,1,1).data];
      const canvas=document.createElement('canvas');
      const gl=canvas.getContext('webgl',{preserveDrawingBuffer:true});
      if(!gl)throw new Error('WebGL context unavailable');
      const tex=gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D,tex);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);
      const error=gl.getError();
      gl.deleteTexture(tex);
      if(error!==gl.NO_ERROR)throw new Error('WebGL texImage2D error '+error);
      return {source:url,size:img.width+'x'+img.height,centerPixel:pixel,webgl:'uploaded'};
    },src);
    console.log('CORS WEBGL UV PASS',isWebKit?'WebKit':'Chromium',item.name,JSON.stringify(outcome));
  }
}catch(e){
  console.error('CORS WEBGL UV FAIL',isWebKit?'WebKit':'Chromium',e.stack||String(e));
  process.exitCode=1;
}finally{
  await browser.close();
}
