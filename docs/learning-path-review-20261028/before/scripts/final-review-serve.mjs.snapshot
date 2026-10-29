import {createServer} from 'node:http';
import {createReadStream,statSync,existsSync} from 'node:fs';
import {resolve,extname,sep} from 'node:path';
const root=resolve(process.argv[2]??'out'),port=Number(process.argv[3]??4320);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.txt':'text/plain; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2','.woff':'font/woff','.xml':'application/xml'};
Object.assign(mime,{'.mp4':'video/mp4','.md':'text/plain; charset=utf-8','.patch':'text/plain; charset=utf-8','.zip':'application/zip'});
createServer((req,res)=>{
 try{
  const u=new URL(req.url??'/','http://127.0.0.1'),raw=decodeURIComponent(u.pathname);
  let file=resolve(root,'.'+raw);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403).end();return;}
  if(existsSync(file)&&statSync(file).isDirectory()){
   if(!raw.endsWith('/')){res.writeHead(301,{location:raw+'/'+u.search}).end();return;}
   file=resolve(file,'index.html');
  }
  if(!existsSync(file)||!statSync(file).isFile()){
   res.writeHead(404,{'content-type':'text/html; charset=utf-8'});
   const fallback=resolve(root,'404.html');
   if(req.method==='HEAD')res.end();
   else if(existsSync(fallback))createReadStream(fallback).on('error',()=>res.end()).pipe(res);
   else res.end('Not found');
   return;
  }
  res.writeHead(200,{'content-type':mime[extname(file)]??'application/octet-stream','content-length':statSync(file).size,'cache-control':'no-cache','x-robots-tag':'noindex, nofollow'});
  if(req.method==='HEAD'){res.end();return;}
  createReadStream(file).on('error',()=>res.destroy()).pipe(res);
 }catch{res.writeHead(400).end();}
}).listen(port,'127.0.0.1',()=>console.log(`Local-only preview: http://127.0.0.1:${port}/ ; ${root}`));
