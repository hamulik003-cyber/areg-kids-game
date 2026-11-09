import test from 'node:test';
import assert from 'node:assert/strict';
import {createApprovalCoordinator} from './approval-coordinator.mjs';
function setup({pushFails=false}={}){
  const sent=[];
  const coordinator=createApprovalCoordinator({
    verifyVisitor:async token=>token==='visitor-token'?'visitor-1':null,
    verifyOwner:async token=>token==='owner-token',
    getOwnerSubscription:async()=>({endpoint:'https://push.example.test/id'}),
    sendPush:async(_,payload)=>{sent.push(payload);if(pushFails)throw Error('offline');return {ok:true}},
    clock:()=>1000
  });return {coordinator,sent};
}
test('visitor request triggers push without granting access',async()=>{const {coordinator,sent}=setup();const r=await coordinator.submit({visitorCredential:'visitor-token'});assert.equal(r.status,'pending');assert.equal(r.notificationSent,true);assert.equal(sent.length,1);assert.equal(await coordinator.mayPlay({visitorCredential:'visitor-token',requestId:r.requestId}),false)});
test('unverified visitor cannot request',async()=>{const {coordinator}=setup();await assert.rejects(()=>coordinator.submit({visitorCredential:'fake'}),/Verified visitor/)});
test('unauthenticated owner cannot approve or list',async()=>{const {coordinator}=setup();const r=await coordinator.submit({visitorCredential:'visitor-token'});await assert.rejects(()=>coordinator.list({ownerCredential:'fake'}));await assert.rejects(()=>coordinator.decide({ownerCredential:'fake',requestId:r.requestId,action:'approve'}));});
test('owner approval and revocation enforced',async()=>{const {coordinator}=setup();const r=await coordinator.submit({visitorCredential:'visitor-token'});await coordinator.decide({ownerCredential:'owner-token',requestId:r.requestId,action:'approve'});assert.equal(await coordinator.mayPlay({visitorCredential:'visitor-token',requestId:r.requestId}),true);await coordinator.revoke({ownerCredential:'owner-token',requestId:r.requestId});assert.equal(await coordinator.mayPlay({visitorCredential:'visitor-token',requestId:r.requestId}),false)});
test('push failure leaves request pending and denied',async()=>{const {coordinator}=setup({pushFails:true});const r=await coordinator.submit({visitorCredential:'visitor-token'});assert.equal(r.notificationSent,false);assert.equal(await coordinator.mayPlay({visitorCredential:'visitor-token',requestId:r.requestId}),false)});
test('rejected request cannot play',async()=>{const {coordinator}=setup();const r=await coordinator.submit({visitorCredential:'visitor-token'});await coordinator.decide({ownerCredential:'owner-token',requestId:r.requestId,action:'reject'});assert.equal(await coordinator.mayPlay({visitorCredential:'visitor-token',requestId:r.requestId}),false)});
