import {createClient} from '@libsql/client/web';
import {createRemoteJWKSet,jwtVerify,SignJWT} from 'jose';
import {validateSave,MAX_SAVE_BYTES} from '../src/save-schema.js';
import {readSave,writeSave} from './turso-store.js';
const keys=createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));
const SESSION='__Host-bianshui-session',LOGIN='__Host-bianshui-login';
const cookie=(name,value,age)=>`${name}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${age}`;
const cookies=request=>Object.fromEntries((request.headers.get('Cookie')||'').split(';').map(x=>x.trim().split('=')));
const secret=env=>new TextEncoder().encode(env.SESSION_SECRET);
const ready=env=>!!(env.GOOGLE_CLIENT_ID&&env.TURSO_DATABASE_URL&&env.TURSO_AUTH_TOKEN&&env.SESSION_SECRET?.length>=32);
const json=(data,status=200,extra={})=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...extra}});
async function sign(env,payload,audience,expires){return new SignJWT(payload).setProtectedHeader({alg:'HS256'}).setIssuedAt().setIssuer('bianshui-town').setAudience(audience).setExpirationTime(expires).sign(secret(env));}
async function verify(env,token,audience){return (await jwtVerify(token,secret(env),{algorithms:['HS256'],issuer:'bianshui-town',audience})).payload;}
async function body(request,limit){const reader=request.body?.getReader();if(!reader)throw Error('body');let size=0,chunks=[];for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>limit){await reader.cancel();throw Error('large');}chunks.push(value);}const all=new Uint8Array(size);let at=0;for(const x of chunks){all.set(x,at);at+=x.length;}return JSON.parse(new TextDecoder().decode(all));}
export function createCloudHandler({database=env=>createClient({url:env.TURSO_DATABASE_URL,authToken:env.TURSO_AUTH_TOKEN}),googleVerify=async(token,env)=>(await jwtVerify(token,keys,{algorithms:['RS256'],audience:env.GOOGLE_CLIENT_ID,issuer:['https://accounts.google.com','accounts.google.com']})).payload}={}){
 return async function handle(request,env){
  const path=new URL(request.url).pathname.replace(/\/$/,''),method=request.method;
  if(path==='/api/config'&&method==='GET'){
   if(!ready(env))return json({configured:false});const nonce=crypto.randomUUID(),token=await sign(env,{nonce},'login','10m');return json({configured:true,googleClientId:env.GOOGLE_CLIENT_ID,nonce},200,{'Set-Cookie':cookie(LOGIN,token,600)});
  }
  if(!ready(env))return json({error:'雲端服務尚待設定。'},503);
  if(!['GET','POST'].includes(method))return json({error:'不支援此操作。'},405);
  if(method==='POST'){
   const allowed=(env.ALLOWED_ORIGINS||'https://bianshui-town.pages.dev,https://bianshui-town.netlify.app').split(',').map(x=>x.trim());
   if(!allowed.includes(request.headers.get('Origin'))||!request.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'請由正式遊戲頁面操作。'},403);
  }
  try{
   if(path==='/api/auth/google'&&method==='POST'){
    let identity;try{const input=await body(request,16000),nonce=await verify(env,cookies(request)[LOGIN],'login');identity=await googleVerify(input.credential,env);if(!identity.sub||identity.nonce!==nonce.nonce)throw Error('nonce');}catch{return json({error:'Google 登入驗證未通過，請重新開啟登入視窗。'},401);}
    const user={uid:identity.sub,displayName:String(identity.name||'Google 使用者').slice(0,80)},token=await sign(env,{sub:user.uid,name:user.displayName},'session','7d');return json({user},200,{'Set-Cookie':cookie(SESSION,token,604800)});
   }
   if(path==='/api/auth/logout'&&method==='POST')return json({ok:true},200,{'Set-Cookie':cookie(SESSION,'',0)});
   let session;try{session=await verify(env,cookies(request)[SESSION],'session');if(typeof session.sub!=='string'||!session.sub)throw Error('uid');}catch{return json({error:'請先登入 Google。'},401);}
   if(path==='/api/auth/session'&&method==='GET')return json({user:{uid:session.sub,displayName:session.name}});
   if(path==='/api/save'&&method==='GET'){if(new URL(request.url).searchParams.get('user')!==session.sub)return json({error:'登入帳號已變更，請重新開啟雲端存檔。'},409);const save=await readSave(database(env),session.sub);if(save.data)validateSave(save.data);return json(save);}
   if(path==='/api/save'&&method==='POST'){
    let input,payload;try{input=await body(request,MAX_SAVE_BYTES+1024);if(input.userId!==session.sub)return json({error:'登入帳號已變更，請重新開啟雲端存檔。'},409);if(!Number.isSafeInteger(input.revision)||input.revision<0)throw Error('revision');validateSave(input.data);payload=JSON.stringify(input.data);if(new TextEncoder().encode(payload).length>MAX_SAVE_BYTES)throw Error('large');}catch{return json({error:'城市檔案無效或超過 2 MB；本機進度仍保留。'},400);}
    const result=await writeSave(database(env),session.sub,payload,input.revision);return result?json(result):json({error:'另一個裝置已有較新存檔。請重新讀取雲端版本後再決定；本機進度沒有被覆蓋。'},409);
   }
   return json({error:'找不到此功能。'},404);
  }catch{return json({error:'雲端暫時無法連線，本機進度仍保留。'},503);}
 };
}
export const handleCloudRequest=createCloudHandler();
