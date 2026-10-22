const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const {Player}=require('../sound.js');
function setup({voices=[],reject}={}){
 const states=[],errors=[],spoken=[];
 const media={pause(){this.paused=true;},play(){this.paused=false;if(reject)return Promise.reject(reject);this.onplaying?.();return Promise.resolve();}};
 const synth={getVoices:()=>voices,addEventListener(type,callback){this.refresh=callback;},cancel(){this.canceled=true;},resume(){this.resumed=true;},speak(u){spoken.push(u);u.onstart();}};
 const player=new Player({clips:{ar:{'ألف':'./alif.mp3'},en:{cat:'./cat.mp3'}},media,synth,Utterance:class{constructor(text){this.text=text;}},onState:s=>states.push(s),onError:()=>errors.push(true)});
 return {player,media,synth,states,errors,spoken};
}
test('bundled narration plays with no installed device voices',()=>{
 const x=setup();x.player.play('ألف','ar');
 assert.equal(x.media.src,'./alif.mp3');assert.equal(x.media.muted,false);assert.equal(x.media.volume,1);
 assert.equal(x.states.at(-1),'playing');assert.equal(x.spoken.length,0);
});
test('stop pauses narration and clears callbacks for the muted state',()=>{
 const x=setup();x.player.play('cat','en');x.player.stop();assert.equal(x.media.paused,true);assert.equal(x.media.onplaying,null);assert.equal(x.states.at(-1),'idle');
});
test('a prior playback callback cannot overwrite a newer playback',()=>{
 const x=setup();x.player.play('cat','en');const stale=x.media.onended;x.player.play('ألف','ar');stale();assert.equal(x.states.at(-1),'playing');
});
test('blocked playback reports an error instead of pretending to speak',async()=>{
 const x=setup({reject:{name:'NotAllowedError'}});x.player.play('cat','en');await Promise.resolve();assert.equal(x.states.at(-1),'error');assert.equal(x.errors.length,1);assert.equal(x.spoken.length,0);
});
test('a failed clip can use a matching device voice',()=>{
 const x=setup({voices:[{lang:'en-GB'},{lang:'ar-AE'}]});x.player.play('ألف','ar');x.media.onerror();assert.equal(x.spoken[0].voice.lang,'ar-AE');assert.equal(x.synth.resumed,true);assert.equal(x.player.utterance,x.spoken[0]);
});
test('fallback never reads Arabic with an unrelated English voice',()=>{
 const x=setup({voices:[{lang:'en-GB'}]});x.player.play('new Arabic content','ar');assert.equal(x.spoken.length,0);assert.equal(x.states.at(-1),'error');
});
test('media error and promise rejection cannot start fallback twice',async()=>{
 const x=setup({reject:{name:'NetworkError'},voices:[{lang:'en-GB'}]});x.player.play('cat','en');x.media.onerror();await Promise.resolve();assert.equal(x.spoken.length,1);
});
test('a delayed rejection after stop does not start fallback narration',async()=>{
 const x=setup({reject:{name:'NetworkError'},voices:[{lang:'en-GB'}]});x.player.play('cat','en');x.player.stop();await Promise.resolve();assert.equal(x.spoken.length,0);assert.equal(x.states.at(-1),'idle');
});
test('every spoken lesson has a bundled MP3, including all letter and name models',()=>{
 const context={};vm.runInNewContext(fs.readFileSync('voice-clips.js','utf8'),context);
 const clips=context.ShaikhaVoiceClips,entries=require('../scripts/audio-catalog.cjs').collect();
 assert.ok(entries.length>180);
 for(const {text,locale}of entries){
  const file=clips[locale]?.[text];assert.ok(file,`Missing ${locale}: ${text}`);
  const audio=fs.readFileSync(file);assert.ok(audio.length>1000,file);
  assert.ok(audio.toString('ascii',0,3)==='ID3'||(audio.readUInt16BE(0)&0xffe0)===0xffe0,`Invalid MP3: ${file}`);
 }
});
