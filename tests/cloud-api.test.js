import {test} from 'node:test';import assert from 'node:assert/strict';import {createClient} from '@libsql/client';import {readFile} from 'node:fs/promises';
import {createCloudHandler} from '../server/cloud-api.js';import {Town} from '../src/simulation.js';
const origin='https://bianshui-town.pages.dev',env={GOOGLE_CLIENT_ID:'test-google-client',TURSO_DATABASE_URL:'libsql://unused',TURSO_AUTH_TOKEN:'test',SESSION_SECRET:'unit-test-secret-of-at-least-32-characters'};
const req=(path,{cookie='',data,from=origin}={})=>new Request(origin+'/api'+path,{method:data===undefined?'GET':'POST',headers:{Cookie:cookie,...(data===undefined?{}:{Origin:from,'Content-Type':'application/json'})},...(data===undefined?{}:{body:JSON.stringify(data)})});
test('Cloudflare + SQLite: Google nonce, owner-isolated saves, revision conflicts, malformed input and logout',async()=>{
 const db=createClient({url:'file::memory:'});await db.executeMultiple(await readFile('migrations/001_cloud_saves.sql','utf8'));
 const api=createCloudHandler({database:()=>db,googleVerify:async credential=>JSON.parse(credential)});
 try{
  assert.equal((await api(req('/config'),{})).status,200);assert.deepEqual(await (await api(req('/config'),{})).json(),{configured:false});
  async function login(uid){const config=await api(req('/config'),env),nonce=(await config.json()).nonce,cookie=config.headers.get('set-cookie').split(';')[0];const response=await api(req('/auth/google',{cookie,data:{credential:JSON.stringify({sub:uid,name:uid,nonce})}}),env);assert.equal(response.status,200);assert.match(response.headers.get('set-cookie'),/HttpOnly; Secure; SameSite=Strict/);return response.headers.get('set-cookie').split(';')[0];}
  const alice=await login('alice'),bob=await login('bob'),data=new Town().toJSON();
  assert.equal((await api(req('/save?user=alice'),env)).status,401);
  let result=await api(req('/save',{cookie:alice,data:{userId:'alice',revision:0,data}}),env);assert.equal(result.status,200);assert.equal((await result.json()).revision,1);
  assert.equal((await api(req('/save?user=alice',{cookie:bob}),env)).status,409);assert.deepEqual(await (await api(req('/save?user=bob',{cookie:bob}),env)).json(),{revision:0,data:null});
  assert.equal((await api(req('/save',{cookie:alice,data:{userId:'bob',revision:0,data}}),env)).status,409);
  assert.equal((await api(req('/save',{cookie:alice,data:{userId:'alice',revision:0,data}}),env)).status,409);
  assert.equal((await api(req('/save',{cookie:alice,data:{userId:'alice',revision:1,data:{bad:true}}}),env)).status,400);
  assert.equal((await api(req('/save',{cookie:alice,from:'https://evil.example',data:{userId:'alice',revision:1,data}}),env)).status,403);
  assert.equal((await api(req('/save',{cookie:alice,data:{userId:'alice',revision:1,data}}),env)).status,200);
  assert.equal((await (await api(req('/save?user=alice',{cookie:alice}),env)).json()).revision,2);
  assert.equal((await api(req('/auth/google',{data:{credential:JSON.stringify({sub:'evil',nonce:'wrong'})}}),env)).status,401);
  assert.match((await api(req('/auth/logout',{cookie:alice,data:{}}),env)).headers.get('set-cookie'),/Max-Age=0/);
  const nonceResponse=await api(req('/config'),env),nonceCookie=nonceResponse.headers.get('set-cookie').split(';')[0];const real=createCloudHandler({database:()=>db});assert.equal((await real(req('/auth/google',{cookie:nonceCookie,data:{credential:'forged'}}),env)).status,401);
 }finally{db.close();}
});
