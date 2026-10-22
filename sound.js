/* Bundled MP3 playback first; browser speech is a fallback for future content. */
(function(root,factory){
 const api=factory();if(typeof module!=='undefined')module.exports=api;else root.ShaikhaSound=api;
})(typeof window!=='undefined'?window:globalThis,function(){
 class Player{
  constructor({clips={},media,synth,Utterance,onState=()=>{},onError=()=>{}}){
   this.clips=clips;this.media=media;this.synth=synth;this.Utterance=Utterance;this.onState=onState;this.onError=onError;this.serial=0;this.utterance=null;
   this.voices=[];this.loadVoices=()=>{this.voices=synth?.getVoices()||[];};
   this.loadVoices();synth?.addEventListener?.('voiceschanged',this.loadVoices);
  }
  stop(){
   this.serial++;this.media.onplaying=this.media.onended=this.media.onerror=null;
   this.media.pause();this.synth?.cancel();this.utterance=null;this.onState('idle');
  }
  play(text,locale){
   this.stop();const serial=this.serial;let fallbackUsed=false;
   const current=()=>serial===this.serial;
   const fail=()=>{if(current()){this.onState('error');this.onError();}};
   const fallback=()=>{
    if(!current()||fallbackUsed)return;fallbackUsed=true;
    if(!this.synth||!this.Utterance)return fail();
    this.loadVoices();
    const voice=this.voices.find(v=>v.lang.toLowerCase().startsWith(locale));
    if(!voice)return fail();
    const utterance=new this.Utterance(text);this.utterance=utterance;
    utterance.lang=voice.lang;utterance.voice=voice;utterance.rate=.85;
    utterance.onstart=()=>{if(current())this.onState('playing');};
    utterance.onend=()=>{if(current()){this.utterance=null;this.onState('idle');}};
    utterance.onerror=e=>{if(!['canceled','interrupted'].includes(e.error))fail();};
    this.synth.resume();this.synth.speak(utterance);
   };
   const src=this.clips[locale]?.[text];this.onState('loading');
   if(!src){fallback();return;}
   this.media.src=src;this.media.volume=1;this.media.muted=false;
   this.media.onplaying=()=>{if(current())this.onState('playing');};
   this.media.onended=()=>{if(current())this.onState('idle');};
   this.media.onerror=fallback;
   try{const started=this.media.play();started?.catch(error=>{if(!current())return;if(error.name==='NotAllowedError')fail();else fallback();});}catch{fallback();}
  }
 }
 return {Player};
});
