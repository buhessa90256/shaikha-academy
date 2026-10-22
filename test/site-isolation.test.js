const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
test('Shaikha progress and preferences use separate browser storage keys',()=>{
 const app=fs.readFileSync('app.js','utf8');
 const keys=[...app.matchAll(/(?:read|write|getItem|setItem)\('([^']+)'/g)].map(x=>x[1]);
 assert.ok(keys.length>=8);assert.ok(keys.every(key=>key.startsWith('shaikha-')));
 const worker=fs.readFileSync('sw.js','utf8');
 assert.ok(worker.includes("k.startsWith('shaikha-academy-')"));
 assert.equal(/hessa-academy/.test(worker),false);
});
test('personal name models cover شيخة and Shaikha completely',()=>{
 const {ShaikhaStrokes:models}=require('../strokes.js');
 for(const letter of 'شيخة')assert.ok(models.ar[letter],letter);
 for(const letter of 'Shaikha')assert.ok(models.en[letter],letter);
 const app=fs.readFileSync('app.js','utf8');
 assert.ok(app.includes("?'شيخة':'Shaikha'"));
});
