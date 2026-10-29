import pathlib,json,subprocess,imageio_ffmpeg,sys
root=pathlib.Path(__file__).resolve().parents[1]
raw=pathlib.Path(sys.argv[1]) if len(sys.argv)>1 else root/'.scratch/final-review-video'
out=root/'docs/final-review-20261028/evidence/video'
out.mkdir(parents=True,exist_ok=True)
for width in [1440,390]:
    d=raw/str(width)
    # CDP can deliver encoded frames out of timestamp order. Restore capture
    # chronology rather than stretching backward timestamps into extra holds.
    frames=sorted(json.loads((d/'frames.json').read_text()),key=lambda frame:frame['timestamp'])
    lines=[]
    for i,f in enumerate(frames):
        duration=(frames[i+1]['timestamp']-f['timestamp']) if i+1<len(frames) else 1
        lines.extend([f"file '{f['file']}'",'option framerate 1000',f'duration {max(.001,duration):.6f}'])
    lines.append(f"file '{frames[-1]['file']}'")
    lines.append('option framerate 1000')
    (d/'sequence.txt').write_text('\n'.join(lines))
    p=subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(),'-y','-hide_banner','-loglevel','error','-f','concat','-safe','0','-i',str(d/'sequence.txt'),'-vf','pad=ceil(iw/2)*2:ceil(ih/2)*2','-fps_mode','vfr','-video_track_timescale','1000','-c:v','libx264','-preset','fast','-crf','23','-pix_fmt','yuv420p','-movflags','+faststart',str(out/f'observatory-{width}.mp4')],capture_output=True,text=True)
    if p.returncode: raise RuntimeError(p.stderr)
    print(width,len(frames),'frames encoded with actual compositor timestamps',round(frames[-1]['timestamp']-frames[0]['timestamp'],1),'seconds')
