import test from 'node:test';
import assert from 'node:assert/strict';
import {createOwnerLogin} from './owner-login.mjs';
const secret='owner-login-test-secret-longer-than-32-bytes';
function setup(){let now=1000;const m=new Map();const sent=[];const login=createOwnerLogin({ownerEmail:'owner@example.test',secret,store:{get:async k=>m.get(k),set:async(k,v)=>m.set(k,v)},sendEmail:async msg=>{sent.push(msg)},clock:()=>now});return {login,sent,setNow:v=>now=v};}
test('unknown email receives generic response, no code',async()=>{const s=setup();assert.deepEqual(await s.login.requestCode('stranger@example.test'),{accepted:true});assert.equal(s.sent.length,0)});
test('valid owner receives a code, can verify once',async()=>{const s=setup();await s.login.requestCode('OWNER@example.test');assert.equal(s.sent.length,1);const code=s.sent[0].text.match(/[0-9]{6}/)[0];assert.equal(await s.login.verifyCode({email:'owner@example.test',code}),true);assert.equal(await s.login.verifyCode({email:'owner@example.test',code}),false)});
test('resend cooldown blocks rapid repeat email',async()=>{const s=setup();await s.login.requestCode('owner@example.test');await s.login.requestCode('owner@example.test');assert.equal(s.sent.length,1)});
test('expired code rejected',async()=>{const s=setup();await s.login.requestCode('owner@example.test');const code=s.sent[0].text.match(/[0-9]{6}/)[0];s.setNow(301001);assert.equal(await s.login.verifyCode({email:'owner@example.test',code}),false)});
test('no email provider configured fails closed',()=>assert.throws(()=>createOwnerLogin({ownerEmail:'owner@example.test',secret,store:{get:async()=>null,set:async()=>{}}}),/provider/));
