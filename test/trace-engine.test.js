const {test}=require('node:test');
const assert=require('node:assert/strict');
const {TraceFollower}=require('../trace-engine.js');
const {ShaikhaStrokes}=require('../strokes.js');
const sample=require('./model-sampling.cjs');
const line=Array.from({length:81},(_,i)=>({x:i*5,y:0}));
test('a full correctly directed stroke is accepted, including fast input',()=>{const t=new TraceFollower(line);assert.equal(t.start({x:0,y:0}),true);assert.equal(t.move({x:400,y:0}),true);assert.equal(t.end(),true);});
test('starting at the finish is rejected',()=>{const t=new TraceFollower(line);assert.equal(t.start({x:400,y:0}),false);assert.equal(t.reason,'start');});
test('a partial stroke cannot earn completion',()=>{const t=new TraceFollower(line);t.start(line[0]);t.move({x:180,y:0});assert.equal(t.end(),false);});
test('a tap at the start cannot complete a line',()=>{const t=new TraceFollower(line);t.start(line[0]);assert.equal(t.end(),false);});
test('backward tracing after forward progress is rejected',()=>{const t=new TraceFollower(line);t.start(line[0]);t.move({x:200,y:0});assert.equal(t.move({x:100,y:0}),false);});
test('leaving the permitted corridor is rejected',()=>{const t=new TraceFollower(line);t.start(line[0]);assert.equal(t.move({x:80,y:100}),false);});
test('small natural hand jitter is accepted',()=>{const t=new TraceFollower(line);t.start({x:0,y:3});for(let i=1;i<=80;i++)assert.equal(t.move({x:i*5,y:i%2?4:-4}),true);assert.equal(t.end(),true);});
test('a corner shortcut is rejected',()=>{const corner=[...Array.from({length:31},(_,i)=>({x:i*5,y:0})),...Array.from({length:30},(_,i)=>({x:150,y:(i+1)*5}))];const t=new TraceFollower(corner);t.start(corner[0]);assert.equal(t.move({x:150,y:150}),false);});
test('closed loops cannot be completed by tapping their shared endpoint',()=>{const loop=Array.from({length:127},(_,i)=>({x:200+100*Math.cos(i/126*Math.PI*2),y:200+100*Math.sin(i/126*Math.PI*2)}));const t=new TraceFollower(loop);t.start(loop[0]);t.move(loop.at(-1));assert.equal(t.end(),false);});
test('closed loops reject reverse direction',()=>{const loop=Array.from({length:127},(_,i)=>({x:200+100*Math.cos(i/126*Math.PI*2),y:200+100*Math.sin(i/126*Math.PI*2)}));const t=new TraceFollower(loop);t.start(loop[0]);let rejected=false;for(const p of [...loop].reverse().slice(1)){if(!t.move(p)){rejected=true;break;}}assert.equal(rejected,true);});
test('reset clears a failed attempt so the child can try again',()=>{const t=new TraceFollower(line);t.start(line[0]);t.move({x:100,y:150});assert.equal(t.start(line[0]),true);t.move(line.at(-1));assert.equal(t.end(),true);});
test('complete isolated Arabic alphabet and English upper/lowercase have models',()=>{assert.equal(ShaikhaStrokes.arabic.length,28);assert.equal(ShaikhaStrokes.english.length,26);assert.equal(ShaikhaStrokes.lowercase.length,26);for(const item of [...ShaikhaStrokes.arabic,...ShaikhaStrokes.english,...ShaikhaStrokes.lowercase]){assert.ok(item.paths.length>0);for(const p of item.paths)assert.ok(typeof p==='string'?p.startsWith('M'):p.dot.length===2);}});
test('Arabic bowls begin on the right; alif begins at the top',()=>{assert.match(ShaikhaStrokes.ar['ب'][0],/^M740/);assert.equal(ShaikhaStrokes.ar['ا'][0],'M565 135 L540 440');assert.deepEqual(ShaikhaStrokes.ar['ت'].slice(1),[{dot:[550,210]},{dot:[455,210]}]);});
test('all actual letter paths stay inside the board, accept correct traversal, and reject reversal',()=>{
 for(const item of [...ShaikhaStrokes.arabic,...ShaikhaStrokes.english,...ShaikhaStrokes.lowercase,...ShaikhaStrokes.warmup])for(const [index,path]of item.paths.entries()){
  if(path.dot)continue;const points=sample(path),label=`${item.symbol} stroke ${index+1}`;
  for(const p of points)assert.ok(p.x>=0&&p.x<=1000&&p.y>=0&&p.y<=600,label+' stays inside board');
  const t=new TraceFollower(points);assert.equal(t.start(points[0]),true,label+' starts');for(const p of points.slice(1))assert.equal(t.move(p),true,label+' follows');assert.equal(t.end(),true,label+' completes');
  const reverse=new TraceFollower(points);if(reverse.start(points.at(-1))){let rejected=false;for(const p of [...points].reverse().slice(1)){if(!reverse.move(p)){rejected=true;break;}}assert.ok(rejected||!reverse.end(),label+' must reject reversal');}
 }
});
