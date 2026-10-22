// Collect the app's spoken lesson text without running a browser or sending child data.
const fs=require('node:fs'),vm=require('node:vm');
const entries=new Map();
const noop=()=>{};
const context2d=new Proxy({},{get:()=>noop,set:()=>true});
const nodes=new Map();
const node=id=>{if(!nodes.has(id))nodes.set(id,{innerHTML:'',textContent:'',style:{},dataset:{},classList:{toggle:noop,add:noop},querySelector:node,querySelectorAll:()=>[],addEventListener:noop,getContext:()=>context2d,getBoundingClientRect:()=>({width:800,height:400}),setAttribute:noop});return nodes.get(id);};
const ctx={console,Map,Set,Math,Date,JSON,Array,Object,String,Number,Blob,URL,setTimeout:noop,clearTimeout:noop,cancelAnimationFrame:noop,devicePixelRatio:1,localStorage:{getItem:()=>null,setItem:noop},location:{hash:'#home'},navigator:{},document:{querySelector:node,querySelectorAll:()=>[],documentElement:{},createElement:()=>node('new')},ResizeObserver:class{observe(){}disconnect(){}},add:(text,locale)=>{if(typeof text!=='string')throw Error('Non-string narration');entries.set(locale+':'+text,{locale,text});}};
ctx.window={addEventListener:noop};vm.createContext(ctx);
ctx.ShaikhaSound={Player:class{stop(){}play(){}}};
vm.runInContext(fs.readFileSync('strokes.js','utf8'),ctx);ctx.ShaikhaStrokes=ctx.window.ShaikhaStrokes;
vm.runInContext(fs.readFileSync('app.js','utf8'),ctx);
vm.runInContext(`
 speak=(text,locale=lang)=>add(text,locale);
 chime=()=>{};
 quiz=(host,questions)=>questions.forEach(q=>add(q.say||q.prompt,q.locale||lang));
 tabs=(labels,fn)=>labels.forEach((_,i)=>fn(i));
 mountTrace=(host,items,{script='ar'}={})=>items.forEach(item=>add(traceVoice(item,script),script));
 const click=id=>{const b=document.querySelector(id);if(b.onclick)b.onclick();};
 for(const locale of ['ar','en']){
  lang=locale;
  add(tr('هيا نلعب ونتعلّم!','Sound is on. Let’s play and learn!'),locale);
  sounds();
  // Blend narration and all subsequent blend rounds.
  for(let i=0;i<5;i++){click('#blendVoice');click('#blendNext');}
  words();for(let i=0;i<3;i++){click('#storyVoice');click('#storyNext');}
  listen();for(let i=0;i<3;i++){click('#hearSteps');click('#stepsNext');}
  create();for(let i=0;i<5;i++){click('#hearIdea');click('#otherIdea');}
  values();click('#mannersGame');for(let i=0;i<3;i++){click('#factVoice');click('#factNext');}
  letters();
  ShaikhaStrokes.lowercase.forEach(item=>add(item.name,'en'));
  ShaikhaStrokes.warmup.forEach(item=>add(item.name[locale==='ar'?0:1],locale));
 }
`,ctx);
const output=[...entries.values()].sort((a,b)=>(a.locale+':'+a.text).localeCompare(b.locale+':'+b.text));
if(require.main===module){fs.mkdirSync('test-results',{recursive:true});fs.writeFileSync('test-results/audio-catalog.json',JSON.stringify(output,null,2));console.log('Spoken lesson clips:',output.length);}
module.exports={collect:()=>output};
