// IronBench compositor patch 7 — procedural barrel (length-true), thread rendering, muzzle device seated on the
// thread shoulder, and a charging handle drawn to match the user's reference side profile.
// Run after ib2d.js, compose5.js, patch6.js.
(function(){
// ---- barrel profiles: diameter (in) of the section visible in front of the handguard ----
IB.BARREL_PROFILE={pencil:.625,lightweight:.625,government:.75,"gov't":.75,hbar:.75,heavy:.75,socom:.75,gunner:.70,"medium taper":.70,taper:.70,tapered:.70,bull:.936,fluted:.75,dmr:.80,default:.75};
IB.META.muzzle.len=2.05;IB.META.muzzle.dia=.85;
IB.THREAD={"1/2x28":{dia:.5,len:.6},"5/8x24":{dia:.625,len:.6},"1/2x36":{dia:.5,len:.6},"5/8x32":{dia:.625,len:.6},"3/4x24":{dia:.75,len:.65}};
// spec from catalog kv + thread table (psa_barrel_threads.txt): {len, gas, profile, threaded, pitch}
IB.barrelSpec=(row,scan={})=>{const kv=Object.fromEntries((row.kv||'').split(';').filter(Boolean).map(s=>s.split('=')));const name=(row.name||'').toLowerCase();
 let prof=(scan.prof||'').toLowerCase()||Object.keys(IB.BARREL_PROFILE).find(k=>name.includes(k))||(kv.heavy?'heavy':'default');
 let pitch=(scan.pitch||'').replace(/\s/g,'').replace(/[-×X]/,'x').replace(/"|in/g,'').replace(/tpi/i,'')||null;
 if(!pitch&&scan.threaded!==false)pitch=kv.cal==='300'?'5/8x24':'1/2x28';   // AR default when the page says threaded but not the pitch
 return {len:+kv.len||16,gas:+kv.gas||9,profile:prof,dia:IB.BARREL_PROFILE[prof]||.75,threaded:scan.threaded!==false&&!!pitch,pitch,cal:kv.cal};};

// ---- drawing ----
IB.drawBarrel=(L,g)=>{const {IN,faceX,boreY,spec,hgEndX}=g;const muzzleX=faceX+IN(spec.len-.55);const T=IB.THREAD[spec.pitch]||IB.THREAD['1/2x28'];
 const r=IN(spec.dia/2),tl=spec.threaded?IN(T.len):0,shoulderX=muzzleX-tl,rt=IN(T.dia/2);
 const cyl=(x1,x2,rad,hi=.55)=>{const gr=L.createLinearGradient(0,boreY-rad,0,boreY+rad);gr.addColorStop(0,'#2a2b2e');gr.addColorStop(.28,'#5d6066');gr.addColorStop(.42,'#2b2c30');gr.addColorStop(.8,'#121315');gr.addColorStop(1,'#060607');L.fillStyle=gr;L.fillRect(x1,boreY-rad,x2-x1,rad*2);};
 // barrel body from the receiver face to the thread shoulder
 cyl(faceX-IN(.1),shoulderX,r);
 // gas block (low-profile), only matters if the handguard ends behind it
 const gbX=faceX+IN(spec.gas-.25);if(!hgEndX||gbX+IN(.45)>hgEndX){const h=IN(.5);const gr=L.createLinearGradient(0,boreY-h,0,boreY+h);gr.addColorStop(0,'#3d3f43');gr.addColorStop(.35,'#1f2023');gr.addColorStop(1,'#0a0a0b');L.fillStyle=gr;L.beginPath();L.roundRect(gbX-IN(.4),boreY-IN(.45),IN(.8),IN(.95),IN(.06));L.fill();}
 if(spec.threaded){ // shoulder face + threads
  L.fillStyle='#0d0e0f';L.fillRect(shoulderX-1,boreY-r,2,r*2);
  cyl(shoulderX,muzzleX,rt);
  if(!g.hasMuzzle){const step=Math.max(2,IN(1/28)*1.6);L.strokeStyle='rgba(255,255,255,.22)';L.lineWidth=1;for(let x=shoulderX+step*.6;x<muzzleX-1;x+=step){L.beginPath();L.moveTo(x,boreY-rt+1);L.lineTo(x+step*.35,boreY+rt-1);L.stroke();}
   L.strokeStyle='rgba(0,0,0,.55)';for(let x=shoulderX+step*1.1;x<muzzleX-1;x+=step){L.beginPath();L.moveTo(x,boreY-rt+1);L.lineTo(x+step*.35,boreY+rt-1);L.stroke();}
   L.fillStyle='#0b0b0c';L.fillRect(muzzleX-2,boreY-rt*.55,2,rt*1.1);} // crown
 } else {L.fillStyle='#0b0b0c';L.fillRect(muzzleX-2,boreY-r*.4,2,r*.8);}
 return {muzzleX,shoulderX,threadLen:tl};};

// charging handle — side profile matched to the user's reference rifle: a flat bar level with the rail top,
// protruding ~0.72" behind the upper with a slightly taller, rounded rear handle block.
IB.drawCH=(L,g)=>{const {IN,uX,railTopY}=g;const top=railTopY+IN(.02),bot=railTopY+IN(.52),rx=uX-IN(.62),fx=uX+IN(1.4);
 // solid handle block level with the rail top, 0.62" behind the upper, 0.5" tall; shaft runs forward under the upper (fills the CH channel)
 const gr=L.createLinearGradient(0,top,0,bot);gr.addColorStop(0,'#5a5d62');gr.addColorStop(.1,'#2c2d30');gr.addColorStop(.6,'#151618');gr.addColorStop(1,'#08090a');L.fillStyle=gr;
 L.beginPath();L.moveTo(fx,top);L.lineTo(rx+IN(.12),top);L.quadraticCurveTo(rx,top,rx,top+IN(.12));L.lineTo(rx,bot-IN(.1));L.quadraticCurveTo(rx,bot,rx+IN(.1),bot);L.lineTo(fx,bot);L.closePath();L.fill();
 L.strokeStyle='rgba(0,0,0,.85)';L.lineWidth=1;L.stroke();
 L.strokeStyle='rgba(255,255,255,.18)';L.beginPath();L.moveTo(rx+IN(.12),top+IN(.015));L.lineTo(uX-IN(.02),top+IN(.015));L.stroke();
 L.strokeStyle='rgba(255,255,255,.1)';L.beginPath();L.moveTo(rx+IN(.03),top+IN(.12));L.lineTo(rx+IN(.03),bot-IN(.1));L.stroke();
 L.fillStyle='rgba(0,0,0,.45)';L.beginPath();L.roundRect(rx+IN(.14),top+IN(.17),IN(.32),IN(.16),IN(.05));L.fill();
 L.strokeStyle='rgba(255,255,255,.08)';L.beginPath();L.moveTo(rx+IN(.15),top+IN(.33));L.lineTo(rx+IN(.45),top+IN(.33));L.stroke();};

// ---- patch the compositor ----
let s=window.__compose6.toString();
const rep=(re,to,label)=>{const b=s;s=s.replace(re,to);if(s===b)throw new Error('patch7: no match for '+label);};
rep(" const muzzleX=faceX+IN((o.barrelLen||16)-(o.barrelInside??.55));"," const BS=o.barrel||IB.BARREL||IB.barrelSpec({name:'',kv:'len=16;gas=9;heavy=1'});const muzzleX=faceX+IN(BS.len-.55);",'muzzleX');
rep(/ const dB=fit\(Bz,o\.barrelLen\|\|16\);draw\(Bz,dB,muzzleX-dB\.w,boreY-dB\.h\/2\);\n const dM=fit\(M,o\.muzLen\|\|2\.15\);draw\(M,dM,muzzleX-IN\(o\.threadLen\?\?\.45\),boreY-dM\.h\/2\);/,
` const hgEnd=faceX-IN(o.hgOverlap??.04)+IN(o.hgLen||15);const BR=IB.drawBarrel(L,{IN,faceX,boreY,spec:BS,hgEndX:hgEnd,hasMuzzle:!!(M&&!o.noMuzzle)});
 if(M&&!o.noMuzzle){const dM={w:IN(o.muzLen||(IB.META.muzzle.len||2.05)),h:IN(o.muzDia||(IB.META.muzzle.dia||.85))};draw(M,dM,BR.shoulderX-IN(.02),boreY-dM.h/2);}  // A2-class: 2.05" visible x 0.85" dia (measured on PSA Guardsman photos)  // device face seats on the thread shoulder`,'barrel+muzzle');
rep(/ L\.fillStyle=blk\(upy\(uRailRow\+bodyH\*\.32\),IN\(\.2\)\);L\.beginPath\(\);L\.roundRect\(uX-IN\(\.36\)[\s\S]*?L\.fill\(\);\n L\.beginPath\(\);L\.roundRect\(uX-IN\(\.44\)[^\n]*\n/,'','old CH');
rep(" draw(U,dU,uX,uY);"," IB.drawCH(L,{IN,uX,railTopY});\n draw(U,dU,uX,uY);",'CH before upper');
rep("return {pinMode,","return {hX,hY,railTopY:Math.round(railTopY),boreY:Math.round(boreY),hgEnd:Math.round(hgEnd),muzzleX:Math.round(muzzleX),pinMode,",'return geometry');
window.__compose7=new Function("R","holes","mode","valid","return ("+s+")")({mode:IB.mode,mask:IB.mask},p=>IB.holes(p,88,13),(a,b,c)=>IB.mode(a,b,c),v=>v>=0&&v<1e5);
IB.render=(opts={})=>{IB.sol=IB.sol||IB.solve(IB.P);return window.__compose7(IB.P,{...IB.cap,lowerLen:IB.sol.lowerLen,...opts});};
})();
