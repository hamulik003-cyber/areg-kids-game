#!/usr/bin/env node
// On code/assets/config changes, require both GitHub handoff journals to change too.
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

export const HANDOFF_FILES=['CURRENT_STATUS.md','PROJECT_HANDOFF.md'];
export function isDocumentationOnly(file){
  return /(^|\/)[^/]+\.md$/i.test(file) ||
    file.startsWith('docs/') || file==='LICENSE' || file==='LICENSE.txt';
}
export function evaluateHandoff(changed,beforeDocs,afterDocs){
  const functional=changed.filter(p=>!isDocumentationOnly(p));
  if(!functional.length)return {ok:true,reason:'Documentation-only change',functional:[],missing:[]};
  const missing=HANDOFF_FILES.filter(p=>
    !changed.includes(p) ||
    typeof beforeDocs[p]!=='string' || typeof afterDocs[p]!=='string' ||
    beforeDocs[p].replace(/\s+/g,'')===afterDocs[p].replace(/\s+/g,'')
  );
  return {ok:missing.length===0,
    reason:missing.length?'Both project journals must be updated along with functional changes':
      'Both handoff journals changed with the functional files',
    functional,missing};
}
function git(...args){
  return execFileSync('git',args,{encoding:'utf8',maxBuffer:16*1024*1024,stdio:['ignore','pipe','pipe']});
}
function tryShow(rev,file){
  try{return git('show',rev+':'+file)}catch{return null}
}
function run(){
  const event=process.env.AREG_EVENT_NAME || process.env.GITHUB_EVENT_NAME || '';
  if(event==='workflow_dispatch'){
    console.log('HANDOFF GUARD PASS: manual audit without a change-range');
    return;
  }
  const head=process.env.AREG_PR_HEAD || process.env.GITHUB_SHA || git('rev-parse','HEAD').trim();
  let base;
  if(event==='pull_request'){
    const target=process.env.AREG_PR_BASE;
    if(!target||!process.env.AREG_PR_HEAD)throw Error('Missing PR refs; cannot verify handoff');
    base=git('merge-base',target,head).trim();
  }else if(event==='push'){
    base=process.env.AREG_PUSH_BEFORE;
    if(!base||/^0{40}$/.test(base))base=git('rev-parse',head+'^').trim();
  }else{
    throw Error('Unsupported event '+JSON.stringify(event)+'; refusing to skip documentation verification');
  }
  const changed=git('diff','--name-only','-z','--no-ext-diff',base,head)
    .split('\0').filter(Boolean);
  const beforeDocs={},afterDocs={};
  for(const p of HANDOFF_FILES){
    beforeDocs[p]=tryShow(base,p);
    afterDocs[p]=tryShow(head,p);
  }
  const result=evaluateHandoff(changed,beforeDocs,afterDocs);
  console.log('HANDOFF GUARD '+base.slice(0,8)+'..'+head.slice(0,8)+
    ': '+changed.length+' changed files, '+result.functional.length+' functional');
  if(!result.ok){
    console.error('::error title=Project handoff missing::'+result.reason+
      '. Unchanged or missing: '+result.missing.join(', ')+
      '. Add factual dated status and project-history updates in the SAME push or PR.');
    console.error('Functional files: '+result.functional.slice(0,30).join(', '));
    process.exitCode=1;
    return;
  }
  console.log('HANDOFF GUARD PASS: '+result.reason);
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{run()}catch(err){
    console.error('::error title=Project handoff guard error::'+String(err.stack||err));
    process.exitCode=1;
  }
}
