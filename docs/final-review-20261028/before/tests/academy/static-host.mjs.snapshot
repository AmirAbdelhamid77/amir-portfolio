import {readFileSync,existsSync,statSync,mkdirSync} from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright-core';
export const ROOT=process.cwd();
export const PREVIEW=process.env.ACADEMY_PREVIEW_DIR??path.join(ROOT,'build/dp600-academy-preview');
export const BASE=(process.env.ACADEMY_LIVE_BASE??'http://localhost:4186').replace(/\/+$/,'');
const OUT=path.join(PREVIEW,'out');
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.txt':'text/plain; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.woff2':'font/woff2','.ico':'image/x-icon','.xml':'application/xml'};
export function staticResponse(href){
 const url=new URL(href,BASE);let file=path.resolve(OUT,'.'+decodeURIComponent(url.pathname));
 if(!file.startsWith(OUT+path.sep)&&file!==OUT)return {status:403,body:Buffer.from('Forbidden')};
 if(existsSync(file)&&statSync(file).isDirectory())file=path.join(file,'index.html');
 if(!existsSync(file)&&existsSync(file+'.html'))file+='.html';
 const found=existsSync(file)&&statSync(file).isFile();
 return {status:found?200:404,contentType:found?(MIME[path.extname(file)]??'application/octet-stream'):'text/html',body:readFileSync(found?file:path.join(OUT,'404.html'))};
}
export async function attachStaticHost(context){if(process.env.ACADEMY_LIVE_BASE)return;await context.route('**/*',async route=>{if(new URL(route.request().url()).origin!==BASE)return route.abort();await route.fulfill(staticResponse(route.request().url()));});}
export async function launchBrowser(){
 mkdirSync(path.join(ROOT,'build/browser-temp'),{recursive:true});mkdirSync(path.join(ROOT,'build/browser-downloads'),{recursive:true});
 const executablePath=process.env.BROWSER_PATH??(existsSync('C:/Program Files/Google/Chrome/Application/chrome.exe')?'C:/Program Files/Google/Chrome/Application/chrome.exe':'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe');
 return chromium.launch({executablePath,headless:true,downloadsPath:path.join(ROOT,'build/browser-downloads'),timeout:20000,env:{...process.env,TEMP:path.join(ROOT,'build/browser-temp'),TMP:path.join(ROOT,'build/browser-temp')}});
}
