const {test}=require('node:test');
const assert=require('node:assert/strict');
const {mediaRange}=require('../media-range.js');
const bytes=Uint8Array.from([0,1,2,3,4,5,6,7,8,9]).buffer;
test('cached audio supplies a correct partial response for Safari',async()=>{
 const r=mediaRange(bytes,'bytes=2-5');assert.equal(r.status,206);assert.equal(r.headers.get('Content-Range'),'bytes 2-5/10');assert.equal(r.headers.get('Content-Length'),'4');assert.deepEqual([...new Uint8Array(await r.arrayBuffer())],[2,3,4,5]);
});
test('open-ended and suffix audio ranges are supported',async()=>{
 const r=mediaRange(bytes,'bytes=8-');assert.deepEqual([...new Uint8Array(await r.arrayBuffer())],[8,9]);
 const suffix=mediaRange(bytes,'bytes=-3');assert.equal(suffix.headers.get('Content-Range'),'bytes 7-9/10');
});
test('an impossible range receives 416 rather than corrupt media',()=>{
 assert.equal(mediaRange(bytes,'bytes=12-20').status,416);assert.equal(mediaRange(bytes,'bytes=5-2').status,416);
});
test('unsupported multi-range requests fall through to the network',()=>{
 assert.equal(mediaRange(bytes,'bytes=0-1,4-5'),null);assert.equal(mediaRange(bytes,'bytes=-'),null);
});
