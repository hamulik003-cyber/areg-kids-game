import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
import {randomBytes,createHash,timingSafeEqual} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const here=dirname(fileURLToPath(import.meta.url));
// Isolated pilot service has a fixed Render build command; install dependency at boot until build configuration is migrated.
try { await import('web-push'); } catch { execFileSync('npm',['install','--omit=dev','--no-audit','--no-fund','--prefix',here],{stdio:'inherit',timeout:120000}); }
const {default:webpush}=await import('web-push');
const port=Number(process.env.PORT||3000);
const publicKey=process.env.VAPID_PUBLIC_KEY;
const privateKey=process.env.VAPID_PRIVATE_KEY;
const configured=!!(publicKey&&privateKey);
if(configured)webpush.setVapidDetails('https://areg-access-push-pilot.onrender.com',publicKey,privateKey);
const pages=new Map([['/','index.html'],['/push-worker.js','push-worker-demo.js'],['/client.js','client.js'],['/manifest.webmanifest','manifest.webmanifest'],['/icon.svg','icon.svg']]);
const security={'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','X-Frame-Options':'DENY','Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow','Content-Security-Policy':"default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; worker-src 'self'; manifest-src 'self'; base-uri 'none'; form-action 'none'"};
const registrations=new Map();
function reply(res,status,body){res.writeHead(status,{...security,'Content-Type':'application/json'});res.end(JSON.stringify(body));}
function originValid(req){const origin=req.headers.origin;const expected='https://'+req.headers.host;return origin===expected;}
async function bodyJson(req){let data='';for await(const chunk of req){data+=chunk;if(data.length>4096)throw Error('too-large');}return JSON.parse(data);}
function validSub(sub){try{const url=new URL(sub.endpoint);return url.protocol==='https:'&&url.hostname&&typeof sub.keys?.p256dh==='string'&&typeof sub.keys?.auth==='string'&&sub.keys.p256dh.length<256&&sub.keys.auth.length<128;}catch{return false;}}
http.createServer(async(req,res)=>{
  const path=new URL(req.url,'http://localhost').pathname;
  if(path==='/healthz'&&req.method==='GET')return reply(res,200,{ok:true,mode:'isolated-push-demo',pushConfigured:configured,accessControlActive:false,emailActive:false});
  if(path==='/api/public-key'&&req.method==='GET')return reply(res,configured?200:503,{publicKey:configured?publicKey:null});
  if(path==='/api/register'&&req.method==='POST'){
    if(!configured)return reply(res,503,{error:'not-configured'});
    if(!originValid(req))return reply(res,403,{error:'origin'});
    try{const data=await bodyJson(req);if(!validSub(data.subscription))return reply(res,400,{error:'subscription'});
      const id=randomBytes(24).toString('base64url');registrations.set(id,{subscription:data.subscription,created:Date.now(),lastSent:0,count:0});
      if(registrations.size>100){const first=registrations.keys().next().value;registrations.delete(first);}
      return reply(res,200,{testToken:id});
    }catch{return reply(res,400,{error:'invalid-json'});}
  }
  if(path==='/api/test'&&req.method==='POST'){
    if(!configured)return reply(res,503,{error:'not-configured'});
    if(!originValid(req))return reply(res,403,{error:'origin'});
    try{const data=await bodyJson(req);if(typeof data.testToken!=='string'||data.testToken.length>128)return reply(res,400,{error:'token'});
      const tokenHash=createHash('sha256').update(data.testToken).digest();let entry;
      for(const [id,value] of registrations){const hash=createHash('sha256').update(id).digest();if(timingSafeEqual(hash,tokenHash)){entry=value;break;}}
      if(!entry||Date.now()-entry.created>3600_000)return reply(res,403,{error:'expired-or-invalid'});
      if(entry.count>=3||Date.now()-entry.lastSent<30_000)return reply(res,429,{error:'test-limit'});
      entry.count++;entry.lastSent=Date.now();
      try{await webpush.sendNotification(entry.subscription,JSON.stringify({type:'pilot-test'}),{TTL:60});return reply(res,200,{sent:true});}
      catch(error){console.error('Push provider failed',{statusCode:Number(error?.statusCode)||null,code:typeof error?.code==='string'?error.code:null});return reply(res,502,{sent:false,error:'push-provider-failed'});}
    }catch{return reply(res,400,{error:'invalid-json'});}
  }
  if(req.method!=='GET')return reply(res,405,{error:'method'});
  if(!pages.has(path))return reply(res,404,{error:'not-found'});
  try{const file=await readFile(join(here,pages.get(path)));const type=path==='/manifest.webmanifest'?'application/manifest+json':path==='/icon.svg'?'image/svg+xml':path==='/push-worker.js'||path==='/client.js'?'text/javascript; charset=utf-8':'text/html; charset=utf-8';res.writeHead(200,{...security,'Content-Type':type});res.end(file)}catch{return reply(res,500,{error:'unavailable'});}
}).listen(port,'0.0.0.0',()=>console.log('AREG isolated push demo listening'));
