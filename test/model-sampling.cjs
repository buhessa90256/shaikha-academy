// Test-side Bézier sampling, independent of the browser's native SVG sampler.
module.exports=function sample(path){
 const tokens=path.match(/[MLQC]|-?\d*\.?\d+/g);let i=0,command,point={x:0,y:0};const out=[];
 while(i<tokens.length){if(/[MLQC]/.test(tokens[i]))command=tokens[i++];const n={M:2,L:2,Q:4,C:6}[command];if(!n)throw new Error('Unsupported path command');const a=tokens.slice(i,i+n).map(Number);i+=n;const start={...point};
  if(command==='M'){point={x:a[0],y:a[1]};out.push(point);continue;}
  for(let step=1;step<=100;step++){const t=step/100,u=1-t;let p;
   if(command==='L')p={x:u*start.x+t*a[0],y:u*start.y+t*a[1]};
   if(command==='Q')p={x:u*u*start.x+2*u*t*a[0]+t*t*a[2],y:u*u*start.y+2*u*t*a[1]+t*t*a[3]};
   if(command==='C')p={x:u*u*u*start.x+3*u*u*t*a[0]+3*u*t*t*a[2]+t*t*t*a[4],y:u*u*u*start.y+3*u*u*t*a[1]+3*u*t*t*a[3]+t*t*t*a[5]};
   out.push(p);
  }point=out.at(-1);
 }return out;
};
