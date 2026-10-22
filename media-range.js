/* Safari can request part of an MP3 even when it is already cached offline. */
(function(root){
 function mediaRange(buffer,header,type='audio/mpeg'){
  const match=/^bytes=(\d*)-(\d*)$/.exec(header||'');
  if(!match||(!match[1]&&!match[2]))return null;
  const size=buffer.byteLength;
  const start=match[1]?Number(match[1]):Math.max(0,size-Number(match[2]));
  const end=match[1]?(match[2]?Math.min(Number(match[2]),size-1):size-1):size-1;
  if(start>=size||start>end)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${size}`}});
  return new Response(buffer.slice(start,end+1),{status:206,headers:{'Content-Type':type,'Content-Range':`bytes ${start}-${end}/${size}`,'Content-Length':String(end-start+1),'Accept-Ranges':'bytes'}});
 }
 if(typeof module!=='undefined')module.exports={mediaRange};else root.ShaikhaMediaRange=mediaRange;
})(typeof self!=='undefined'?self:globalThis);
