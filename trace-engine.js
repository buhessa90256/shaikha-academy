/* Sequential path follower; no handwriting score is inferred from free drawing. */
(function(root){
  class TraceFollower {
    constructor(points,{tolerance=32,startTolerance=44}={}){
      this.points=points;this.tolerance=tolerance;this.startTolerance=startTolerance;
      this.lengths=[0];for(let i=1;i<points.length;i++)this.lengths.push(this.lengths[i-1]+Math.hypot(points[i].x-points[i-1].x,points[i].y-points[i-1].y));
      this.total=this.lengths.at(-1);this.reset();
    }
    reset(){this.index=0;this.previous=null;this.active=false;this.finished=false;this.reason='';}
    start(p){this.reset();if(Math.hypot(p.x-this.points[0].x,p.y-this.points[0].y)>this.startTolerance){this.reason='start';return false;}this.active=true;this.previous=p;return true;}
    move(p){if(!this.active)return false;const a=this.previous;const distance=Math.hypot(p.x-a.x,p.y-a.y);const parts=Math.max(1,Math.ceil(distance/7));
      for(let k=1;k<=parts;k++){const q={x:a.x+(p.x-a.x)*k/parts,y:a.y+(p.y-a.y)*k/parts};if(!this.follow(q)){this.active=false;return false;}}
      this.previous=p;return true;
    }
    follow(p){
      // Search locally in arc length, preventing jumps across loops and intersections.
      let best=this.index,dist=Infinity;
      const behind=Math.max(0,this.index-5),limit=this.lengths[this.index]+80;
      for(let i=behind;i<this.points.length&&this.lengths[i]<=limit;i++){
        const d=Math.hypot(p.x-this.points[i].x,p.y-this.points[i].y);
        if(d<dist){dist=d;best=i;}
      }
      if(dist>this.tolerance){this.reason='path';return false;}
      if(this.lengths[best]<this.lengths[this.index]-25){this.reason='direction';return false;}
      this.index=Math.max(this.index,best);return true;
    }
    end(){if(!this.active)return false;this.active=false;this.finished=this.lengths[this.index]>=this.total*.965;this.reason=this.finished?'':'finish';return this.finished;}
    get fraction(){return this.total?this.lengths[this.index]/this.total:0;}
  }
  root.TraceFollower=TraceFollower;
})(typeof module!=='undefined'?module.exports:window);
