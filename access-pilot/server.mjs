import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
const here=dirname(fileURLToPath(import.meta.url));
const port=Number(process.env.PORT||3000);
const host='0.0.0.0';
const pages=new Map([['/','index.html'],['/push-worker.js','push-worker-demo.js'],['/client.js','client.js']]);
const security={ 'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','X-Frame-Options':'DENY','Cache-Control':'no-store','Content-Security-Policy':"default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; worker-src 'self'; manifest-src 'self'; base-uri 'none'; form-action 'none'"};
http.createServer(async(req,res)=>{
  const path=new URL(req.url,'http://localhost').pathname;
  if(req.method!=='GET'){res.writeHead(405,security);res.end('Method Not Allowed');return;}
  if(path==='/healthz'){res.writeHead(200,{...security,'Content-Type':'application/json'});res.end(JSON.stringify({ok:true,mode:'isolated-push-permission-demo',accessControlActive:false,pushDeliveryActive:false,emailActive:false}));return;}
  if(!pages.has(path)){res.writeHead(404,security);res.end('Not Found');return;}
  try{const file=await readFile(join(here,pages.get(path)));res.writeHead(200,{...security,'Content-Type':path==='/push-worker.js'||path==='/client.js'?'text/javascript; charset=utf-8':'text/html; charset=utf-8'});res.end(file)}catch{res.writeHead(500,security);res.end('Unavailable')}
}).listen(port,host,()=>console.log('AREG isolated push permission demo listening'));
