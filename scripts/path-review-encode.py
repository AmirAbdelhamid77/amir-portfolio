import pathlib,json,subprocess,imageio_ffmpeg
r=pathlib.Path(__file__).resolve().parents[1];out=r/'docs/learning-path-review-20261028/evidence/video';out.mkdir(parents=True,exist_ok=True)
for width in [1440,390]:
 d=r/'.scratch/path-review-video'/str(width);frames=sorted(json.loads((d/'frames.json').read_text()),key=lambda f:f['timestamp']);lines=[]
 for i,f in enumerate(frames):
  duration=frames[i+1]['timestamp']-f['timestamp']if i+1<len(frames)else 1;lines.extend([f"file '{f['file']}'",'option framerate 1000',f'duration {max(.001,duration):.6f}'])
 lines.extend([f"file '{frames[-1]['file']}'",'option framerate 1000']);(d/'sequence.txt').write_text('\n'.join(lines));p=subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(),'-y','-hide_banner','-loglevel','error','-f','concat','-safe','0','-i',str(d/'sequence.txt'),'-vf','pad=ceil(iw/2)*2:ceil(ih/2)*2','-fps_mode','vfr','-video_track_timescale','1000','-c:v','libx264','-crf','23','-pix_fmt','yuv420p','-movflags','+faststart',str(out/f'path-{width}.mp4')],capture_output=True,text=True);assert p.returncode==0,p.stderr;print(width,len(frames),'frames encoded')
