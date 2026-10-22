"""Build-time narration only. No speech service or account is used by the website.
Run node scripts/audio-catalog.cjs first; requires the edge-tts Python package.
"""
import asyncio, hashlib, json
from pathlib import Path
import edge_tts

ROOT=Path(__file__).resolve().parents[1]
VOICES={'ar':'ar-AE-FatimaNeural','en':'en-GB-SoniaNeural'}

async def main():
    entries=json.loads((ROOT/'test-results/audio-catalog.json').read_text(encoding='utf-8'))
    target=ROOT/'assets/audio'; target.mkdir(parents=True,exist_ok=True)
    semaphore=asyncio.Semaphore(4)
    manifest={'ar':{},'en':{}}
    async def build(entry):
        locale,text=entry['locale'],entry['text']
        name=locale+'-'+hashlib.sha256(text.encode()).hexdigest()[:16]+'.mp3'
        destination=target/name
        manifest[locale][text]='./assets/audio/'+name
        if destination.exists() and destination.stat().st_size>1000:return
        async with semaphore:
            for attempt in range(3):
                try:
                    await edge_tts.Communicate(text,VOICES[locale],rate='-15%').save(str(destination))
                    if destination.stat().st_size<1000:raise ValueError('Empty narration')
                    print(locale,name,flush=True);return
                except Exception:
                    if attempt==2:raise
                    await asyncio.sleep(2+attempt*2)
    await asyncio.gather(*(build(entry) for entry in entries))
    (ROOT/'voice-clips.js').write_text('/* Bundled synthetic lesson narration. */\nglobalThis.ShaikhaVoiceClips='+json.dumps(manifest,ensure_ascii=False,sort_keys=True)+';\n',encoding='utf-8')
    print('Ready:',len(entries),'clips;',sum(p.stat().st_size for p in target.glob('*.mp3')),'bytes')

if __name__=='__main__':asyncio.run(main())
