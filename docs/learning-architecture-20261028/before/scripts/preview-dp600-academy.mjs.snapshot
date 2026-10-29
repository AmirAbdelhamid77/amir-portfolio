import {existsSync} from 'node:fs';
import {spawn} from 'node:child_process';
import path from 'node:path';
const root=process.cwd(),preview=path.join(root,'build/dp600-academy-preview');
if(!existsSync(path.join(preview,'out/learn/dp-600/ingestion/index.html')))throw Error('Run node scripts/build-academy-preview.mjs first.');
const server=spawn(process.execPath,[path.join(root,'scripts/serve-out.mjs'),process.env.PORT??'4186'],{cwd:preview,stdio:'inherit'});
server.on('exit',code=>{process.exitCode=code??0;});
process.on('SIGINT',()=>server.kill());
