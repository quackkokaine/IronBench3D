// IronBench compositor patch 6 — run after ib2d.js + compose5.js are injected.
// Adds: hole classification by position (not size), real-photo trigger pinned by its trigger/hammer pin holes,
// streamed mag-release button, right-side selector end, closed dust cover + forward-assist knob, no see-through on the lower.
(function(){
IB.CHECK.tailLeft=(c,m)=>{const W=c.width;const ch=a=>m.top[a]<0?0:m.bot[a]-m.top[a];let l=0,r=0;for(let a=0;a<W*.12;a++)l+=ch(a|0);for(let a=W*.88|0;a<W;a++)r+=ch(a);return l<r;}; // thin trigger tail points to the stock
Object.assign(IB.META,{
 trigger:{slug:'psa-custom-ar-3-5-lbs-match-grade-drop-in-trigger-flat-116055',img:0,orient:'tailLeft',black:true},
 magrel:{slug:'lead-star-arms-ravage-magazine-release-button-black',img:0,black:true},
});
IB.META.lower.noSeeThrough=true;IB.META.lower.order=-1;
// upper feature map (fractions of the upper photo) — measured on the YHM flat-top side shot
IB.META.upper.feat={port:[.47,.785,.33,.63],fa:[.39,.53]};
// trigger pin + hammer pin positions in the trigger photo (fractions, after the tailLeft flip) — used to pin it into the lower
IB.META.trigger.pins={trig:[.52,.46],ham:[.89,.34]};
// paint every enclosed hole in the stripped-lower photo as a dark recess (after the hole map has been measured)
IB.fillHoles=(p,lumT=88)=>{const c=p.c,W=c.width,H=c.height,x=c.getContext('2d',{willReadFrequently:true}),im=x.getImageData(0,0,W,H),d=im.data;const lab=new Uint8Array(W*H);let n=0;
 const isH=q=>d[q*4+3]<140||(d[q*4]+d[q*4+1]+d[q*4+2])/3>lumT;
 for(let p0=0;p0<W*H;p0++){if(lab[p0]||!isH(p0))continue;const st=[p0],blob=[];lab[p0]=1;let e=false;
  while(st.length){const q=st.pop();blob.push(q);const qx=q%W,qy=q/W|0;if(!qx||!qy||qx==W-1||qy==H-1)e=true;for(const r of [qx>0?q-1:-1,qx<W-1?q+1:-1,qy>0?q-W:-1,qy<H-1?q+W:-1])if(r>=0&&!lab[r]&&isH(r)){lab[r]=1;st.push(r);}}
  if(!e&&blob.length<3000){n++;for(const q of blob){d[q*4]=17;d[q*4+1]=18;d[q*4+2]=20;d[q*4+3]=255;}}}
 x.putImageData(im,0,0);return n;};
// prepare the lower: measure holes + pin pair from the photo FIRST, then fill the holes
IB.prepLower=P=>{const Lw=P.lower;P.__holes=IB.holes(Lw,88,13);const LW=Lw.c.width,bodyTop=IB.mode(Lw.m.top,LW*.45,LW*.8);const hs=P.__holes.filter(h=>Math.abs(h.cy-bodyTop)<LW*.06);let best=null;
 for(const a of hs)for(const b of hs){if(b.cx<=a.cx||Math.abs(a.cy-b.cy)>LW*.012)continue;const d=b.cx-a.cx;if(!best||d>best.d)best={rear:a,front:b,d};}
 const orig=IB.lowerPins;IB.lowerPins=L=>L===Lw?best:orig(L);IB.fillHoles(Lw);return best;};

let s=window.__compose5.toString();
const rep=(re,to,label)=>{const before=s;s=s.replace(re,to);if(s===before)throw new Error('patch6: no match for '+label);};
// 1) drop old size-based hole classification (it put the selector by the forward assist)
rep(/const sorted=\[\.\.\.HL\][\s\S]*?const fcp=[^\n]*\n( const trigPin=[^\n]*\n)?/,'','classify');
// 2) classify by POSITION, then pin the trigger photo — before the lower is drawn (lower hides the housing)
rep(" draw(Lw,dL,lX,lY);",
` const near=(h,p)=>p&&Math.hypot(h.x-p.x,h.y-p.y)<IN(.15);
 const rearPin=HL.find(h=>near(h,lRear)),frontPin=HL.find(h=>near(h,lFront));
 const rest=HL.filter(h=>h!==rearPin&&h!==frontPin&&h.y>lowerTopY+IN(.12));
 const catchH=rest.filter(h=>Math.abs(h.x-magRear)<IN(.7)).sort((a,b)=>b.r-a.r)[0];
 const sel=rest.filter(h=>h!==catchH&&h.x<magRear-IN(1)).sort((a,b)=>b.r-a.r)[0];
 const fcp=rest.filter(h=>h!==sel&&h!==catchH&&sel&&h.x>sel.x+IN(.2)&&h.x<magRear-IN(.1));
 const tPin=[...fcp].sort((a,b)=>a.x-b.x)[0],hPin=[...fcp].sort((a,b)=>b.x-a.x)[0];
 let trigInfo='none';
 if(P.trigger&&tPin&&hPin&&tPin!==hPin){const T=P.trigger,th=IB.holes(T,120,4).sort((a,b)=>b.n-a.n).slice(0,2).sort((a,b)=>a.cx-b.cx);
  if(th.length==2){const sc=Math.hypot(hPin.x-tPin.x,hPin.y-tPin.y)/Math.hypot(th[1].cx-th[0].cx,th[1].cy-th[0].cy);
   const ang=Math.atan2(hPin.y-tPin.y,hPin.x-tPin.x)-Math.atan2(th[1].cy-th[0].cy,th[1].cx-th[0].cx);
   if(Math.abs(ang)<.5&&sc*T.w/S>.8&&sc*T.w/S<3){L.save();L.translate(tPin.x,tPin.y);L.rotate(ang);L.scale(sc,sc);L.drawImage(T.c,-th[0].cx,-th[0].cy);L.restore();trigInfo='pinned '+(sc*T.w/S).toFixed(2)+'in '+(ang*57.3).toFixed(1)+'deg';}}}
 window.__dbg6={sel:sel&&[sel.x|0,sel.y|0],catchH:catchH&&[catchH.x|0,catchH.y|0],tPin:tPin&&[tPin.x|0,tPin.y|0],hPin:hPin&&[hPin.x|0,hPin.y|0],fcp:fcp.length,trigInfo};
 draw(Lw,dL,lX,lY);`,'lower draw');
// 3) drawn trigger only as a fallback
rep("{const tx=earRX+(earFX-earRX)*(o.trigPos??.42)","if(trigInfo==='none'){const tx=earRX+(earFX-earRX)*(o.trigPos??.42)",'trigger fallback');
// 4) selector = right-side shaft end with detent mark (no lever on this side)
rep(/ if\(sel\)\{[\s\S]*? if\(catchH\)/,
` if(sel){const r=IN(.19);pin(sel.x,sel.y,r,'#1b1c1f');L.strokeStyle='rgba(255,255,255,.38)';L.lineWidth=1.6;L.beginPath();L.moveTo(sel.x,sel.y-r*.72);L.lineTo(sel.x,sel.y-r*.2);L.stroke();}
 if(catchH)`,'selector');
// 5) mag release = streamed button photo seated in the catch hole
rep(/ if\(catchH\)\{[\s\S]*?\n HL\.filter\(h=>!\[/,
` if(catchH){const MR=P.magrel,D=IN(o.magrelDia??.5);if(MR){const w=D*MR.w/MR.h;L.save();L.shadowColor='rgba(0,0,0,.6)';L.shadowBlur=3;L.drawImage(MR.c,catchH.x-w/2,catchH.y-D/2,w,D);L.restore();}
   else{pin(catchH.x,catchH.y,D/2,'#202124');}}
 HL.filter(h=>![`,'mag release');
// 6) leftover holes are filled flush (no fake pins)
rep("forEach(h=>pin(h.x,h.y,Math.max(h.r,IN(.05)),'#1a1b1d'))","forEach(h=>{L.fillStyle='#141517';L.beginPath();L.arc(h.x,h.y,h.r+1,0,7);L.fill();})",'leftover holes');
// 7) dust cover (closed) + forward-assist knob on the upper
rep(" draw(U,dU,uX,uY);",
` draw(U,dU,uX,uY);
 {const F=o.upperFeat||(IB.META.upper.feat);const ux=f=>uX+f*dU.w,uy=f=>uY+f*dU.h;
  const x1=ux(F.port[0])-IN(.05),x2=ux(F.port[1])+IN(.05),y1=uy(F.port[2])-IN(.04),y2=uy(F.port[3])+IN(.04);
  const g=L.createLinearGradient(0,y1,0,y2);g.addColorStop(0,'#3a3c40');g.addColorStop(.12,'#232427');g.addColorStop(.85,'#151618');g.addColorStop(1,'#0b0c0d');
  L.fillStyle=g;L.beginPath();L.roundRect(x1,y1,x2-x1,y2-y1,IN(.06));L.fill();L.strokeStyle='rgba(0,0,0,.85)';L.lineWidth=1.2;L.stroke();
  L.strokeStyle='rgba(255,255,255,.13)';L.beginPath();L.moveTo(x1+IN(.08),y1+IN(.06));L.lineTo(x2-IN(.08),y1+IN(.06));L.stroke();
  L.fillStyle='#0c0d0e';L.fillRect(x1-IN(.08),y2-IN(.06),x2-x1+IN(.16),IN(.07));
  L.fillStyle='#1a1b1d';L.beginPath();L.roundRect(x2-IN(.42),y1+IN(.1),IN(.28),IN(.16),IN(.04));L.fill();L.strokeStyle='rgba(255,255,255,.1)';L.stroke();
  const fx=ux(F.fa[0]),fy=uy(F.fa[1]),fr=IN(.27);const g2=L.createRadialGradient(fx-fr*.3,fy-fr*.3,fr*.1,fx,fy,fr);g2.addColorStop(0,'#4d5055');g2.addColorStop(.6,'#1e1f22');g2.addColorStop(1,'#0a0b0c');
  L.fillStyle=g2;L.beginPath();L.arc(fx,fy,fr,0,7);L.fill();L.strokeStyle='rgba(255,255,255,.12)';L.lineWidth=1;for(let i=-3;i<=3;i++){L.beginPath();L.moveTo(fx+i*fr*.22,fy-fr*.78);L.lineTo(fx+i*fr*.22,fy+fr*.78);L.stroke();}}`,'upper features');
rep("th=IB.holes(T,120,4).sort((a,b)=>b.n-a.n).slice(0,2).sort((a,b)=>a.cx-b.cx);","TPm=IB.META.trigger&&IB.META.trigger.pins,th=TPm?[{cx:TPm.trig[0]*T.w,cy:TPm.trig[1]*T.h},{cx:TPm.ham[0]*T.w,cy:TPm.ham[1]*T.h}]:IB.holes(T,120,4).sort((a,b)=>b.n-a.n).slice(0,2).sort((a,b)=>a.cx-b.cx);",'trigger pins');
rep("HL.filter(h=>![sel,rearPin,frontPin,catchH,...fcp].includes(h)).forEach(","HL.filter(h=>![sel,rearPin,frontPin,catchH,...fcp].includes(h)&&h.r<IN(.22)&&h.y>lowerTopY+IN(.1)).forEach(",'leftover filter');
rep("if(MR){const w=D*MR.w/MR.h;L.save();L.shadowColor='rgba(0,0,0,.6)';L.shadowBlur=3;L.drawImage(MR.c,catchH.x-w/2,catchH.y-D/2,w,D);L.restore();}",
 "if(MR){const w=D*MR.w/MR.h;L.save();L.shadowColor='rgba(0,0,0,.7)';L.shadowBlur=4;L.fillStyle='#1c1d20';L.beginPath();L.ellipse(catchH.x,catchH.y,w/2,D/2,0,0,7);L.fill();L.restore();L.save();L.beginPath();L.ellipse(catchH.x,catchH.y,w/2,D/2,0,0,7);L.clip();L.globalCompositeOperation='multiply';L.drawImage(MR.c,catchH.x-w/2,catchH.y-D/2,w,D);L.globalCompositeOperation='source-over';L.strokeStyle='rgba(255,255,255,.22)';L.lineWidth=1.4;L.beginPath();L.ellipse(catchH.x,catchH.y,w/2-1,D/2-1,0,3.6,5.8);L.stroke();L.restore();}",'magrel multiply');
window.__compose6=new Function("R","holes","mode","valid","return ("+s+")")({mode:IB.mode,mask:IB.mask},p=>IB.holes(p,88,13),(a,b,c)=>IB.mode(a,b,c),v=>v>=0&&v<1e5);
// one-call pipeline: IB.build() loads every part, orients, solves the pins, renders
IB.build=async()=>{await IB.loadAll();IB.prepLower(IB.P);IB.sol=IB.solve(IB.P);return IB.render({});};
IB.render=(opts={})=>{IB.sol=IB.sol||IB.solve(IB.P);return window.__compose6(IB.P,{...IB.cap,lowerLen:IB.sol.lowerLen,...opts});};
})();
