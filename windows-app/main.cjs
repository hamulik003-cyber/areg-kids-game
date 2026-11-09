'use strict';
const {app,BrowserWindow,shell}=require('electron');
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const {randomBytes}=require('node:crypto');
const gameRoot=app.isPackaged?path.join(process.resourcesPath,'game'):path.resolve(__dirname,'..');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.webmanifest':'application/manifest+json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.mp3':'audio/mpeg','.wav':'audio/wav','.ogg':'audio/ogg','.woff':'font/woff','.woff2':'font/woff2','.ico':'image/x-icon'};
let server;
async function start(){
 const token=randomBytes(24).toString('hex');
 server=http.createServer((req,res)=>{
  try{
   const url=new URL(req.url,'http://localhost');
   const parts=decodeURIComponent(url.pathname).split('/');
   if(parts[1]!==token){res.writeHead(403).end();return;}
   const rel=parts.slice(2).join('/')||'index.html';
   const file=path.resolve(gameRoot,rel);
   if(!file.startsWith(gameRoot+path.sep)||rel.includes('\\')){res.writeHead(403).end();return;}
   fs.stat(file,(err,stat)=>{
    if(err||!stat.isFile()){res.writeHead(404).end();return;}
    res.setHeader('Content-Type',mime[path.extname(file).toLowerCase()]||'application/octet-stream');
    res.setHeader('Cache-Control','no-store');
    fs.createReadStream(file).on('error',()=>res.destroy()).pipe(res);
   });
  }catch{res.writeHead(400).end();}
 });
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
 const win=new BrowserWindow({width:1366,height:768,minWidth:900,minHeight:600,autoHideMenuBar:true,backgroundColor:'#f4d6a8',webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true}});
 win.webContents.setWindowOpenHandler(({url})=>{if(/^https:\/\//.test(url))shell.openExternal(url);return {action:'deny'};});
 await win.loadURL('http://127.0.0.1:'+server.address().port+'/'+token+'/index.html?areg_trial=1');
}
app.whenReady().then(start).catch(e=>{console.error(e);app.quit();});
app.on('window-all-closed',()=>app.quit());
app.on('before-quit',()=>server?.close());
