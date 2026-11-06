// IronBench 2D compositor v5 (pins-based upper; orientation done in IB.prep) — anchor-based assembly (right-side view, muzzle right)
(function(){
const R={mode:IB.mode,mask:IB.mask};
const flipC=p=>{const c=document.createElement('canvas');c.width=p.c.width;c.height=p.c.height;const x=c.getContext('2d');x.translate(c.width,0);x.scale(-1,1);x.drawImage(p.c,0,0);return {...p,c,m:R.mask(c)};};
const tame=(p,knee=110,k=.35)=>{const c=p.c,x=c.getContext('2d',{willReadFrequently:true});const im=x.getImageData(0,0,c.width,c.height),d=im.data;for(let i=0;i<d.length;i+=4){for(let j=0;j<3;j++){const v=d[i+j];if(v>knee)d[i+j]=knee+(v-knee)*k;}}x.putImageData(im,0,0);return p;};
const holes=p=>{const c=p.c,W=c.width,H=c.height,d=c.getContext('2d',{willReadFrequently:true}).getImageData(0,0,W,H).data;const lab=new Int8Array(W*H);const out=[];
 const isH=q=>{const a=d[q*4+3],l=(d[q*4]+d[q*4+1]+d[q*4+2])/3;return a<140||l>88;};
 for(let p0=0;p0<W*H;p0++){if(lab[p0]||!isH(p0))continue;const st=[p0];lab[p0]=1;let n=0,sx=0,sy=0,e=false,x1=W,x2=0,y1=H,y2=0;
  while(st.length){const q=st.pop();n++;const qx=q%W,qy=q/W|0;sx+=qx;sy+=qy;if(qx<x1)x1=qx;if(qx>x2)x2=qx;if(qy<y1)y1=qy;if(qy>y2)y2=qy;if(!qx||!qy||qx==W-1||qy==H-1)e=true;
   for(const r of [qx>0?q-1:-1,qx<W-1?q+1:-1,qy>0?q-W:-1,qy<H-1?q+W:-1])if(r>=0&&!lab[r]&&isH(r)){lab[r]=1;st.push(r);}}
  const w=x2-x1+1,h=y2-y1+1;if(!e&&n>12&&n<3000&&w/h<1.8&&h/w<1.8)out.push({cx:sx/n,cy:sy/n,r:Math.max(w,h)/2,w,h});}
 return out;};
const mode=(a,s,e)=>R.mode(a,s,e);
const valid=v=>v>=0&&v<1e5;

window.__compose5=(P,o={})=>{
 const S=o.S||38,CW=1600,CH=600,IN=v=>v*S;
 const Lc=document.createElement('canvas');Lc.width=CW;Lc.height=CH;const L=Lc.getContext('2d');
 const fit=(p,len,hgt)=>{const sc=(len?len/p.w:hgt/p.h)*S;return {sc,w:p.w*sc,h:p.h*sc};};
 const draw=(p,d,X,Y)=>L.drawImage(p.c,X,Y,d.w,d.h);
 const blk=(y,r)=>{const g=L.createLinearGradient(0,y-r,0,y+r);g.addColorStop(0,'#4a4c50');g.addColorStop(.3,'#232427');g.addColorStop(.7,'#141517');g.addColorStop(1,'#08090a');return g;};
 const dbg=[];
 const U=P.upper,Lw=P.lower,H=P.handguard,Bz=P.barrel,M=P.muzzle,St=P.stock,Gp=P.grip,Mg=P.mag,O=P.optic;

 // ---------- LOWER (the datum) ----------
 const dL=fit(Lw,o.lowerLen||8.3),sL=dL.sc,LW=Lw.c.width;
 const lTop=Lw.m.top,lBot=Lw.m.bot;
 const bodyTop=mode(lTop,LW*.45,LW*.8);
 const lX=o.lX??430,lowerTopY=o.lowerTopY??258,lY=lowerTopY-bodyTop*sL;
 const lpx=a=>lX+a*sL,lpy=v=>lY+v*sL,lcol=X=>Math.round((X-lX)/sL);
 // rear tower front face: first column from the left where the top drops to body level
 let tf=Math.round(LW*.04);while(tf<LW*.5&&!(valid(lTop[tf])&&lTop[tf]>=bodyTop-.3*S/sL))tf++;
 const towerFrontX=lpx(tf);
 // magwell
 let maxBot=-1;for(let a=LW*.55|0;a<LW;a++)if(valid(lBot[a]))maxBot=Math.max(maxBot,lBot[a]);
 const thr=bodyTop+(maxBot-bodyTop)*.72;let mwF=LW-1;while(mwF>0&&!(lBot[mwF]>=thr))mwF--;let mwR=mwF;while(mwR>LW*.4&&lBot[mwR]>=thr)mwR--;
 const magFront=lpx(mwF),magRear=lpx(mwR);
 // trigger-guard ears: U-opening (highest bottom) behind the magwell, ears either side
 const c0=Math.max(0,mwR-Math.round(2.4*S/sL));let uC=c0;for(let a=c0;a<mwR;a++)if(valid(lBot[a])&&lBot[a]<lBot[uC])uC=a;
 let eF=uC;for(let a=uC;a<=Math.min(LW-1,mwR+4);a++)if(lBot[a]>lBot[eF])eF=a;
 let eR=uC;for(let a=Math.max(0,uC-Math.round(1.7*S/sL));a<uC;a++)if(valid(lBot[a])&&lBot[a]>lBot[eR])eR=a;
 const earFX=lpx(eF),earRX=lpx(eR),earFY=lpy(lBot[eF]),earRY=lpy(lBot[eR]),slotY=lpy(lBot[uC]);
 const gripLevel=lpy(mode(lBot,LW*.12,LW*.28));
 const HL=(P.__holes||(P.__holes=holes(Lw))).map(h=>({x:lpx(h.cx),y:lpy(h.cy),r:h.r*sL,cx:h.cx,cy:h.cy}));

 // ---------- UPPER: mates on the lower's top, rear face at the tower ----------
 // UPPER — pinned: its rear/front lug pin centres land on the lower's takedown / pivot pin holes
 const UW=U.c.width,UL=IB.upperLugs(U),uMateRow=UL.mate,uRailRow=mode(U.m.top,UW*.3,UW*.7);
 const LPP=IB.lowerPins(Lw);const lowPins=LPP?[LPP.rear,LPP.front].map(h=>({x:lpx(h.cx),y:lpy(h.cy)})):[];
 const lRear=lowPins[0],lFront=lowPins[1];
 let sU,uX,uY,pinMode='pins';
 if(UL.rear&&UL.front&&lRear&&lFront&&lFront!==lRear){sU=(lFront.x-lRear.x)/(UL.front.x-UL.rear.x);
   const lenIn=UW*sU/S;if(lenIn<6.6||lenIn>7.8){pinMode='pins-rejected('+lenIn.toFixed(2)+'in)';sU=null;}}
 else pinMode='no-pins';
 if(sU){uX=lRear.x-UL.rear.x*sU;uY=lRear.y-UL.rear.y*sU;}
 else{sU=(o.upperLen||7.2)/UW*S;uX=(lRear?lRear.x:towerFrontX)-(UL.rear?UL.rear.x:UW*.08)*sU;uY=lowerTopY-uMateRow*sU;}
 const dU={sc:sU,w:UW*sU,h:U.c.height*sU};
 const upx=a=>uX+a*sU,upy=v=>uY+v*sU;
 const railTopY=upy(uRailRow),bodyH=uMateRow-uRailRow,mateResid=upy(uMateRow)-lowerTopY;
 let fc=UW-1;while(fc>UW*.7&&!(U.m.bot[fc]-U.m.top[fc]>bodyH*.72))fc--;
 const faceX=upx(fc);
 let tc=[];for(let a=fc+2;a<UW;a++)if(valid(U.m.top[a]))tc.push((U.m.top[a]+U.m.bot[a])/2);
 const boreY=tc.length?upy(tc.sort((a,b)=>a-b)[tc.length>>1]):upy(uRailRow+bodyH*.42);
 const tubeR=IN(.575),tubeFront=towerFrontX-IN(.3),tubeBack=tubeFront-IN(7.6);
 L.fillStyle=blk(boreY,tubeR);L.beginPath();L.roundRect(tubeBack,boreY-tubeR,tubeFront-tubeBack,tubeR*2,4);L.fill();
 // leftmost lower pixel at the bore row = where the tube enters the tower
 const rowL=Math.round((boreY-lY)/sL);let towerRear=lX;{const cx=Lw.c.getContext('2d',{willReadFrequently:true}).getImageData(0,Math.max(0,Math.min(Lw.c.height-1,rowL)),LW,1).data;for(let a=0;a<LW;a++)if(cx[a*4+3]>100){towerRear=lpx(a);break;}}
 const dSt=fit(St,o.stockLen||7.0);draw(St,dSt,towerRear-IN(o.stockGap??1.25)-dSt.w,boreY-tubeR-IN(.08));
 L.fillStyle=blk(boreY,IN(.7));L.fillRect(towerRear-IN(.12),boreY-IN(.68),IN(.16),IN(1.36));L.fillRect(towerRear-IN(.55),boreY-IN(.62),IN(.42),IN(1.24));
 L.fillStyle='rgba(255,255,255,.08)';for(let i=0;i<4;i++)L.fillRect(towerRear-IN(.53)+i*IN(.1),boreY-IN(.62),IN(.03),IN(1.24));

 // ---------- MAGAZINE (behind lower): top-front corner seated at the magwell front ----------
 const dMg=fit(Mg,0,o.magHgt||7.4),MW=Mg.c.width,MH=Mg.c.height;
 let mtf=0;{const d=Mg.c.getContext('2d',{willReadFrequently:true}).getImageData(0,0,MW,Math.round(MH*.1)).data;for(let y=0;y<MH*.1|0;y++)for(let a=MW-1;a>mtf;a--)if(d[(y*MW+a)*4+3]>120){mtf=a;break;}}
 draw(Mg,dMg,magFront-IN(o.magInset??.07)-mtf*dMg.sc,lowerTopY+IN(o.magTop??.42));

 // ---------- GRIP (behind lower), front-top tucked under the rear guard ear ----------
 const dG=fit(Gp,0,o.gripHgt||4.4);const gRight=earRX+IN(o.gripFwd??.15);draw(Gp,dG,gRight-dG.w,gripLevel-IN(.32));

 // ---------- BARREL + MUZZLE on the bore line ----------
 const muzzleX=faceX+IN((o.barrelLen||16)-(o.barrelInside??.55));
 const dB=fit(Bz,o.barrelLen||16);draw(Bz,dB,muzzleX-dB.w,boreY-dB.h/2);
 const dM=fit(M,o.muzLen||2.15);draw(M,dM,muzzleX-IN(o.threadLen??.45),boreY-dM.h/2);

 // ---------- UPPER (drawn under the lower so its lugs nest inside) ----------
 draw(U,dU,uX,uY);
 // charging handle
 L.fillStyle=blk(upy(uRailRow+bodyH*.32),IN(.2));L.beginPath();L.roundRect(uX-IN(.36),upy(uRailRow+bodyH*.2),IN(.5),IN(.27),3);L.fill();
 L.beginPath();L.roundRect(uX-IN(.44),upy(uRailRow+bodyH*.12),IN(.16),IN(.4),3);L.fill();

 // ---------- HANDGUARD: butts the upper face, rail tops flush ----------
 const dH=fit(H,o.hgLen||15),hTopRow=mode(H.m.top,H.c.width*.25,H.c.width*.85);
 const hX=faceX-IN(o.hgOverlap??.04),hY=railTopY-hTopRow*dH.sc;{L.fillStyle='#17181a';const HW=H.c.width;L.beginPath();let st=false;for(let a=0;a<HW;a++){if(H.m.top[a]<0)continue;const X=hX+a*dH.sc,Y=hY+(H.m.top[a]+3)*dH.sc;st?L.lineTo(X,Y):(L.moveTo(X,Y),st=true);}for(let a=HW-1;a>=0;a--){if(H.m.bot[a]<0)continue;L.lineTo(hX+a*dH.sc,hY+(H.m.bot[a]-3)*dH.sc);}L.closePath();L.fill();}draw(H,dH,hX,hY);

 // ---------- OPTIC: clamp base gripping the rail ----------
 const dO=fit(O,o.opticLen||5.6);const oX=uX+IN(o.opticRear??1.25),oBot=railTopY+IN(o.opticSink??.24);draw(O,dO,oX,oBot-dO.h);

 // ---------- LOWER over the upper's lugs ----------
 draw(Lw,dL,lX,lY);

 // ---------- TRIGGER GUARD: flat bar pinned into both ears ----------
 const gBarTop=Math.max(earFY,earRY)-IN(.16),gBarH=IN(.19);
 const gFx=earFX+IN(.1),gRx=earRX-IN(.1);
 {const g=L.createLinearGradient(0,gBarTop,0,gBarTop+gBarH);g.addColorStop(0,'#3a3c40');g.addColorStop(.45,'#18191b');g.addColorStop(1,'#0b0c0d');L.fillStyle=g;
  L.beginPath();L.moveTo(gRx,gBarTop-IN(.05));L.lineTo(gFx,gBarTop-IN(.05));L.quadraticCurveTo(gFx+IN(.06),gBarTop+gBarH*.5,gFx-IN(.04),gBarTop+gBarH);L.lineTo(gRx+IN(.12),gBarTop+gBarH+IN(.03));L.quadraticCurveTo(gRx-IN(.06),gBarTop+gBarH,gRx,gBarTop-IN(.05));L.fill();}
 const pin=(X,Y,r,fill='#2c2e32',ring='rgba(255,255,255,.42)')=>{L.fillStyle='#050506';L.beginPath();L.arc(X,Y,r+1.2,0,7);L.fill();const g=L.createRadialGradient(X-r*.35,Y-r*.35,r*.1,X,Y,r);g.addColorStop(0,'#5a5d62');g.addColorStop(.55,fill);g.addColorStop(1,'#101113');L.fillStyle=g;L.beginPath();L.arc(X,Y,r,0,7);L.fill();L.strokeStyle=ring;L.lineWidth=Math.max(1,r*.16);L.beginPath();L.arc(X,Y,r*.8,3.5,5.6);L.stroke();};
 pin(earFX,(earFY+gBarTop)/2,IN(.07),'#2a2b2e');pin(earRX,(earRY+gBarTop)/2,IN(.07),'#2a2b2e');

 // ---------- HOLES -> fire-control pins, selector, mag release, takedown pins ----------
 const sorted=[...HL].sort((a,b)=>a.cx-b.cx);
 const big=[...HL].sort((a,b)=>b.r-a.r);
 const sel=big[0];                                     // largest hole = selector bore
 const rearPin=sorted.find(h=>h!==sel&&h.x<sel.x);    // behind selector = rear takedown pin
 const frontPin=sorted[sorted.length-1];               // front-most = pivot pin
 const catchH=HL.filter(h=>h!==frontPin&&h.x<magFront&&h.x>magRear-IN(.4)).sort((a,b)=>b.r-a.r)[0]; // mag catch
 const fcp=HL.filter(h=>h!==sel&&h!==rearPin&&h!==frontPin&&h!==catchH&&h.x>sel.x&&h.x<magRear);  // hammer / trigger pins
 const trigPin=fcp.sort((a,b)=>b.x-a.x)[0];
 // trigger: blade hangs from the slot, finger face toward the muzzle
 {const tx=earRX+(earFX-earRX)*(o.trigPos??.42),tt=slotY-IN(.12),tb=gBarTop-IN(.18);L.fillStyle='#111214';L.beginPath();
  L.moveTo(tx-IN(.1),tt);L.lineTo(tx+IN(.08),tt);L.bezierCurveTo(tx+IN(.02),tt+(tb-tt)*.45,tx+IN(.1),tb-IN(.12),tx+IN(.27),tb);
  L.lineTo(tx+IN(.2),tb+IN(.06));L.bezierCurveTo(tx-IN(.04),tb-IN(.08),tx-IN(.13),tt+(tb-tt)*.45,tx-IN(.1),tt);L.fill();
  L.strokeStyle='rgba(255,255,255,.12)';L.lineWidth=1.2;L.beginPath();L.moveTo(tx+IN(.07),tt+IN(.05));L.bezierCurveTo(tx+IN(.01),tt+(tb-tt)*.45,tx+IN(.09),tb-IN(.14),tx+IN(.24),tb-IN(.02));L.stroke();}
 if(rearPin)pin(rearPin.x,rearPin.y,IN(.15));
 if(frontPin)pin(frontPin.x,frontPin.y,IN(.15));
 fcp.forEach(h=>pin(h.x,h.y,IN(.085),'#2b2c2f','rgba(255,255,255,.3)'));
 if(sel){const r=IN(.2);pin(sel.x,sel.y,r,'#18191b');L.fillStyle='#d8d8d4';L.beginPath();L.moveTo(sel.x+r*.15,sel.y-r*.7);L.lineTo(sel.x-r*.15,sel.y-r*.7);L.lineTo(sel.x,sel.y-r*.35);L.fill();
   // short safety lever pointing to SAFE (forward)
   {const g=L.createLinearGradient(0,sel.y-IN(.08),0,sel.y+IN(.08));g.addColorStop(0,'#55585d');g.addColorStop(.5,'#26282b');g.addColorStop(1,'#0d0e0f');L.fillStyle=g;L.beginPath();L.roundRect(sel.x-IN(.04),sel.y-IN(.075),IN(.52),IN(.15),IN(.06));L.fill();L.strokeStyle='#050506';L.lineWidth=1;L.stroke();}pin(sel.x,sel.y,r*.6,'#1e1f22');}
 if(catchH){const r=IN(.24);const g=L.createRadialGradient(catchH.x-r*.3,catchH.y-r*.3,r*.1,catchH.x,catchH.y,r);g.addColorStop(0,'#55575c');g.addColorStop(.6,'#1f2023');g.addColorStop(1,'#0b0c0d');L.fillStyle=g;L.beginPath();L.arc(catchH.x,catchH.y,r,0,7);L.fill();
   L.strokeStyle='rgba(255,255,255,.1)';L.lineWidth=1;for(let i=-2;i<=2;i++){L.beginPath();L.moveTo(catchH.x-r*.6,catchH.y+i*r*.28);L.lineTo(catchH.x+r*.6,catchH.y+i*r*.28);L.stroke();}}
 HL.filter(h=>![sel,rearPin,frontPin,catchH,...fcp].includes(h)).forEach(h=>pin(h.x,h.y,Math.max(h.r,IN(.05)),'#1a1b1d'));

 // ---------- output ----------
 let cv=document.getElementById('__comp');if(!cv){cv=document.createElement('canvas');cv.id='__comp';document.body.append(cv);}
 cv.width=CW;cv.height=CH;cv.style.cssText=`position:fixed;left:${o.left||0}px;top:0;z-index:2147483647;width:${o.half?800:CW}px;height:${o.half?300:CH}px;display:block`;
 const x=cv.getContext('2d');const bg=x.createLinearGradient(0,0,0,CH);bg.addColorStop(0,'#f6f6f4');bg.addColorStop(.75,'#e2e2de');bg.addColorStop(1,'#d3d3ce');x.fillStyle=bg;x.fillRect(0,0,CW,CH);
 x.save();x.translate(CW/2+30,CH-30);x.scale(1,.07);const sg=x.createRadialGradient(0,0,10,0,0,640);sg.addColorStop(0,'rgba(0,0,0,.30)');sg.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=sg;x.beginPath();x.arc(0,0,640,0,7);x.fill();x.restore();
 x.save();x.shadowColor='rgba(0,0,0,.28)';x.shadowBlur=18;x.shadowOffsetY=10;x.drawImage(Lc,0,0);x.restore();
 if(o.debug){x.font='11px monospace';const mk=(X,Y,t,c='#e00')=>{x.fillStyle=c;x.fillRect(X-3,Y-3,6,6);x.fillText(t,X+5,Y-4);};
  mk(towerFrontX,lowerTopY,'tower');mk(faceX,boreY,'face/bore');mk(magFront,lowerTopY,'mwF');mk(magRear,lowerTopY,'mwR');mk(earFX,earFY,'earF');mk(earRX,earRY,'earR');mk(lpx(uC),slotY,'slot');
  HL.forEach((h,i)=>mk(h.x,h.y,'h'+i,'#06c'));mk(muzzleX,boreY,'muzzle');}
 x.fillStyle='#1b1c1e';x.font='600 22px Arial';x.fillText('IRONBENCH 3D  ·  BUILD PREVIEW',34,44);x.fillStyle='#f15a0a';x.fillRect(34,55,66,4);
 x.fillStyle='#55585c';x.font='14px Arial';x.fillText(o.cap1||'',34,82);x.fillText(o.cap2||'',34,102);
 return {pinMode,mateResid:+mateResid.toFixed(1),upperLenIn:+(dU.w/S).toFixed(2),lowPins:lowPins.length,upLugs:UL.runs.length,upPinSrc:[UL.rear&&UL.rear.src,UL.front&&UL.front.src],towerFrontX:Math.round(towerFrontX),uX:Math.round(uX),faceX:Math.round(faceX),boreY:Math.round(boreY),railTopY:Math.round(railTopY),muzzleX:Math.round(muzzleX),stockBack:Math.round(towerRear-IN(1.25)-dSt.w),holes:HL.length,earF:[Math.round(earFX),Math.round(earFY)],earR:[Math.round(earRX),Math.round(earRY)]};
};
})();
