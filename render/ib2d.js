// IronBench 2D compositor — self-contained (inject into a palmettostatearmory.com tab).
// Right-side view, muzzle RIGHT. 38 px per inch.
(function(){
const IB=window.IB={};
const BASE='https://palmettostatearmory.com/';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

// ---------- per-part metadata (the "notes") ----------
IB.META={
 upper:    {slug:'yankee-hill-machine-223-rem-5-56-flat-top-stripped-upper-receiver-hardcoat-anodized-matte-black-110',img:1,black:true,orient:'threadsRight'},
 lower:    {slug:'ruger-ar-556-stripped-lower-receiver-black',img:1,black:true,tol:14,orient:'towerLeft'},
 barrel:   {slug:'faxon-firearms-duty-hbar-button-rifled-barrel-5-56x45mm-16-black',img:0,align:true,black:30,orient:'thickLeft'},
 handguard:{slug:'sabre-15-15-qdsm-rail-black',img:0,align:true,black:true,darkSlots:true},
 muzzle:   {slug:'kak-industry-flash-hider-1-2-28-black',img:0,align:true,black:true,orient:'shoulderLeft'},
 stock:    {slug:'psa-classic-m4-stock-odg',img:0,orient:'buttLeft',seeThrough:true},
 grip:     {slug:'luth-ar-a2-pistol-grip-black',img:0,black:true,orient:'gripRakesBack'},
 mag:      {slug:'img-ar-15-30rd-magazine-223-5-56-ar-0009',img:3,black:true,tame:true,orient:'magCurvesForward'},
 optic:    {slug:'eotech-512-a65-black-holographic-weapon-sight',img:4,black:true,orient:'hoodLeft'},
};

// ---------- fetching ----------
IB.gallery=async slug=>{const r=await fetch(BASE+slug+'.html',{credentials:'include'});if(r.status==429)throw new Error('429 rate limited');const h=await r.text();
 const s=new Set(),out=[];for(const m of h.matchAll(/"img":"([^"]+)"/g)){const u=m[1].replace(/\\\//g,'/');if(!s.has(u)){s.add(u);out.push(u);}}return out;};
IB.bitmap=async u=>{const r=await fetch(u);const b=await r.blob();return createImageBitmap(b);};

// ---------- pixel helpers ----------
const ctx=c=>c.getContext('2d',{willReadFrequently:true});
const newC=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
const lumOf=(d,i)=>(d[i]+d[i+1]+d[i+2])/3, satOf=(d,i)=>Math.max(d[i],d[i+1],d[i+2])-Math.min(d[i],d[i+1],d[i+2]);

IB.cut=(bm,tol=10,maxSide=760)=>{const k=Math.min(1,maxSide/Math.max(bm.width,bm.height));const W=Math.round(bm.width*k),H=Math.round(bm.height*k);const c=newC(W,H),x=ctx(c);x.fillStyle='#fff';x.fillRect(0,0,W,H);x.drawImage(bm,0,0,W,H);
 const im=x.getImageData(0,0,W,H),d=im.data;const bg=new Uint8Array(W*H);const st=[];
 const ok=p=>{const i=p*4;return lumOf(d,i)>105&&satOf(d,i)<40;};
 for(let a=0;a<W;a++)for(const y of [0,H-1]){const p=y*W+a;if(!bg[p]&&ok(p)&&lumOf(d,p*4)>110){bg[p]=1;st.push(p);}}
 for(let y=0;y<H;y++)for(const a of [0,W-1]){const p=y*W+a;if(!bg[p]&&ok(p)&&lumOf(d,p*4)>110){bg[p]=1;st.push(p);}}
 while(st.length){const q=st.pop(),qx=q%W,qy=q/W|0,lq=lumOf(d,q*4);
  for(const r of [qx>0?q-1:-1,qx<W-1?q+1:-1,qy>0?q-W:-1,qy<H-1?q+W:-1])if(r>=0&&!bg[r]&&ok(r)&&Math.abs(lumOf(d,r*4)-lq)<tol){bg[r]=1;st.push(r);}}
 for(let p=0;p<W*H;p++){const i=p*4;if(bg[p]){d[i+3]=0;continue;}
  const px=p%W,py=p/W|0;let edge=false;for(const r of [px>0?p-1:-1,px<W-1?p+1:-1,py>0?p-W:-1,py<H-1?p+W:-1])if(r>=0&&bg[r])edge=true;
  if(edge)d[i+3]=Math.min(255,Math.max(0,(255-lumOf(d,i))*2.4));}
 // clear a 3px frame
 for(let y=0;y<H;y++)for(let a=0;a<W;a++)if(a<3||y<3||a>=W-3||y>=H-3)d[(y*W+a)*4+3]=0;
 x.putImageData(im,0,0);return c;};

IB.keepMain=c=>{const x=ctx(c),W=c.width,H=c.height,im=x.getImageData(0,0,W,H),d=im.data;const lab=new Int32Array(W*H).fill(-1);const sz=[];let id=0;
 for(let p=0;p<W*H;p++){if(lab[p]>=0||d[p*4+3]<100)continue;let n=0;const st=[p];lab[p]=id;while(st.length){const q=st.pop();n++;const qx=q%W,qy=q/W|0;
  for(const r of [qx>0?q-1:-1,qx<W-1?q+1:-1,qy>0?q-W:-1,qy<H-1?q+W:-1])if(r>=0&&lab[r]<0&&d[r*4+3]>=100){lab[r]=id;st.push(r);}}sz.push(n);id++;}
 if(!sz.length)return c;const big=Math.max(...sz);
 for(let p=0;p<W*H;p++){if(!d[p*4+3])continue;const l=lab[p];if(l>=0){if(sz[l]<big*.04)d[p*4+3]=0;}else{const px=p%W,py=p/W|0;let k=false;
  for(const r of [px>0?p-1:-1,px<W-1?p+1:-1,py>0?p-W:-1,py<H-1?p+W:-1])if(r>=0&&lab[r]>=0&&sz[lab[r]]>=big*.04)k=true;if(!k)d[p*4+3]=0;}}
 x.putImageData(im,0,0);return c;};

IB.trim=(c,th=60)=>{const x=ctx(c),W=c.width,H=c.height,im=x.getImageData(0,0,W,H),d=im.data;
 for(let y=0;y<H;y++){let n=0;for(let a=0;a<W;a++)if(d[(y*W+a)*4+3]>170)n++;if(n>W*.93&&d[(y*W+4)*4+3]>170&&d[(y*W+W-5)*4+3]>170)for(let a=0;a<W;a++)d[(y*W+a)*4+3]=0;}
 for(let i=3;i<d.length;i+=4)if(d[i]<th)d[i]=0;
 const rc=new Array(H).fill(0),cc=new Array(W).fill(0);for(let y=0;y<H;y++)for(let a=0;a<W;a++)if(d[(y*W+a)*4+3]){rc[y]++;cc[a]++;}
 let y1=0,y2=H-1,x1=0,x2=W-1;while(y1<H-1&&rc[y1]<W*.015)y1++;while(y2>y1&&rc[y2]<W*.015)y2--;while(x1<W-1&&cc[x1]<H*.015)x1++;while(x2>x1&&cc[x2]<H*.015)x2--;
 x.putImageData(im,0,0);const n=newC(x2-x1+1,y2-y1+1);n.getContext('2d').drawImage(c,x1,y1,n.width,n.height,0,0,n.width,n.height);return n;};

IB.mask=c=>{const W=c.width,H=c.height,d=ctx(c).getImageData(0,0,W,H).data;const top=new Array(W).fill(-1),bot=new Array(W).fill(-1);
 for(let a=0;a<W;a++){for(let y=0;y<H;y++)if(d[(y*W+a)*4+3]>100){top[a]=y;break;}for(let y=H-1;y>=0;y--)if(d[(y*W+a)*4+3]>100){bot[a]=y;break;}}return {top,bot};};
IB.mode=(arr,s,e)=>{const h=new Map();for(let a=Math.max(0,s|0);a<Math.min(arr.length,e|0);a++){const v=arr[a];if(v<0)continue;h.set(v,(h.get(v)||0)+1);}let best=-1,bn=-1;for(const [v,n] of h)if(n>bn){bn=n;best=v;}return best;};

IB.toneBlack=(c,target=34)=>{const x=ctx(c),im=x.getImageData(0,0,c.width,c.height),d=im.data;const L=[];for(let i=0;i<d.length;i+=16)if(d[i+3]>200)L.push(lumOf(d,i));if(!L.length)return c;L.sort((a,b)=>a-b);
 const p=Math.max(2,L[Math.floor(L.length*.4)]);if(p<=target)return c;const g=Math.log(target/255)/Math.log(p/255);
 for(let i=0;i<d.length;i+=4)for(let j=0;j<3;j++)d[i+j]=255*Math.pow(d[i+j]/255,g);x.putImageData(im,0,0);return c;};
IB.tame=(c,knee=70,k=.3)=>{const x=ctx(c),im=x.getImageData(0,0,c.width,c.height),d=im.data;for(let i=0;i<d.length;i+=4)for(let j=0;j<3;j++){const v=d[i+j];if(v>knee)d[i+j]=knee+(v-knee)*k;}x.putImageData(im,0,0);return c;};
IB.seeThrough=c=>{const x=ctx(c),im=x.getImageData(0,0,c.width,c.height),d=im.data;for(let i=0;i<d.length;i+=4){const l=lumOf(d,i);if(l>185&&satOf(d,i)<28)d[i+3]=l>215?0:Math.min(d[i+3],(230-l)*6);}x.putImageData(im,0,0);return c;};

IB.rotate=(c,ang)=>{const W=c.width,H=c.height,ca=Math.abs(Math.cos(ang)),sa=Math.abs(Math.sin(ang));const n=newC(Math.ceil(W*ca+H*sa)+4,Math.ceil(W*sa+H*ca)+4);const x=n.getContext('2d');x.translate(n.width/2,n.height/2);x.rotate(ang);x.drawImage(c,-W/2,-H/2);return n;};
IB.pcaAngle=c=>{const W=c.width,H=c.height,d=ctx(c).getImageData(0,0,W,H).data;let n=0,sx=0,sy=0,sxx=0,syy=0,sxy=0;for(let y=0;y<H;y+=2)for(let a=0;a<W;a+=2)if(d[(y*W+a)*4+3]>150){n++;sx+=a;sy+=y;sxx+=a*a;syy+=y*y;sxy+=a*y;}
 const mx=sx/n,my=sy/n,cxx=sxx/n-mx*mx,cyy=syy/n-my*my,cxy=sxy/n-mx*my;return .5*Math.atan2(2*cxy,cxx-cyy);};
IB.flipH=c=>{const n=newC(c.width,c.height),x=n.getContext('2d');x.translate(c.width,0);x.scale(-1,1);x.drawImage(c,0,0);return n;};

// ---------- orientation checks (measured, not assumed) ----------
const colH=(m,a)=>m.top[a]<0?0:m.bot[a]-m.top[a];
const avg=(f,s,e)=>{let t=0,n=0;for(let a=s|0;a<e;a++){t+=f(a);n++;}return n?t/n:0;};
const rowCentroid=(c,y1,y2)=>{const W=c.width,d=ctx(c).getImageData(0,y1,W,y2-y1).data;let t=0,n=0;for(let i=0;i<d.length/4;i++)if(d[i*4+3]>120){t+=i%W;n++;}return n?t/n:W/2;};
IB.CHECK={
 threadsRight:(c,m)=>{const W=c.width;return avg(a=>colH(m,a),W*.94,W) < avg(a=>colH(m,a),W*.02,W*.08);}, // short thread stub on the right
 towerLeft:(c,m)=>{const W=c.width;const mn=(s,e)=>{let v=1e9;for(let a=s|0;a<e;a++)if(m.top[a]>=0)v=Math.min(v,m.top[a]);return v;};return mn(0,W*.2)<mn(W*.8,W);},
 thickLeft:(c,m)=>{const W=c.width;return avg(a=>colH(m,a),0,W*.15)>=avg(a=>colH(m,a),W*.85,W);},
 shoulderLeft:(c,m)=>{ // slotted/prong end toward the muzzle: the prong end has the most see-through gaps
   const W=c.width,H=c.height,d=ctx(c).getImageData(0,0,W,H).data;let L=0,Rr=0;for(let a=0;a<W;a++){if(m.top[a]<0)continue;for(let y=m.top[a];y<=m.bot[a];y++){const i=(y*W+a)*4;if(d[i+3]<120||lumOf(d,i)>120){if(a<W/2)L++;else Rr++;}}}return Rr>=L;},
 buttLeft:(c,m)=>{const W=c.width;return Math.max(...m.top.slice(0,W*.25|0).map((t,a)=>colH(m,a)))>=Math.max(...m.top.slice(W*.75|0).map((t,i)=>colH(m,(W*.75|0)+i)));},
 gripRakesBack:c=>{const H=c.height;return rowCentroid(c,H*.85|0,H) < rowCentroid(c,0,H*.15|0);},   // bottom sits behind the top
 magCurvesForward:c=>{const H=c.height;return rowCentroid(c,H*.88|0,H) > rowCentroid(c,0,H*.12|0);}, // bottom sits ahead (toward muzzle)
 hoodLeft:(c,m)=>{const W=c.width;return avg(a=>colH(m,a),0,W*.3)>avg(a=>colH(m,a),W*.7,W);},
};

IB.prep=async(key,url,meta)=>{if(meta.orient==='magCurvesForward'){const bm=await IB.bitmap(url);let c=IB.trim(IB.keepMain(IB.cut(bm,meta.tol||10)));const k=IB.orientMag(c);c=k.c;IB.toneBlack(c);IB.desat(c);IB.seeThrough(c);IB.tame(c);return {key,c,w:c.width,h:c.height,m:IB.mask(c),url,flipped:k.mir};}
const bm=await IB.bitmap(url);let c=IB.cut(bm,meta.tol||10);c=IB.keepMain(c);c=IB.trim(c);
 if(meta.align){for(let i=0;i<2;i++){const a=IB.pcaAngle(c);if(Math.abs(a)>.01&&Math.abs(a)<1.2)c=IB.trim(IB.rotate(c,-a));}}
 let flipped=false;if(meta.orient){const chk=IB.CHECK[meta.orient];if(!chk(c,IB.mask(c))){c=IB.flipH(c);flipped=true;}
   if(!chk(c,IB.mask(c)))throw new Error(key+': orientation check '+meta.orient+' fails both ways');}
 if(meta.black)IB.toneBlack(c,typeof meta.black==='number'?meta.black:34);
 if(meta.black){IB.desat(c);if(!meta.noSeeThrough)IB.seeThrough(c);}if(meta.tame)IB.tame(c);if(meta.seeThrough)IB.seeThrough(c);if(meta.darkSlots)IB.darkSlots(c);
 return {key,c,w:c.width,h:c.height,m:IB.mask(c),url,flipped};};

IB.loadAll=async(keys=Object.keys(IB.META))=>{IB.G=IB.G||{};IB.P=IB.P||{};const log=[];
 for(const k of keys){const M=IB.META[k];if(!IB.G[k]){IB.G[k]=await IB.gallery(M.slug);await sleep(1800);}
  const url=IB.G[k][M.img];if(!url)throw new Error(k+': gallery has '+IB.G[k].length+' images, wanted #'+M.img);
  IB.P[k]=await IB.prep(k,url,M);log.push(k+' '+IB.P[k].w+'x'+IB.P[k].h+(IB.P[k].flipped?' (flipped by check)':''));}
 return log;};

// ---------- holes (pin bores in a stripped lower / upper lugs) ----------
IB.holes=(p,lumT=88,minN=6)=>{const c=p.c,W=c.width,H=c.height,d=ctx(c).getImageData(0,0,W,H).data;const lab=new Uint8Array(W*H);const out=[];
 const isH=q=>{const a=d[q*4+3];return a<140||lumOf(d,q*4)>lumT;};
 for(let p0=0;p0<W*H;p0++){if(lab[p0]||!isH(p0))continue;const st=[p0];lab[p0]=1;let n=0,sx=0,sy=0,e=false,x1=W,x2=0,y1=H,y2=0;
  while(st.length){const q=st.pop();n++;const qx=q%W,qy=q/W|0;sx+=qx;sy+=qy;if(qx<x1)x1=qx;if(qx>x2)x2=qx;if(qy<y1)y1=qy;if(qy>y2)y2=qy;if(!qx||!qy||qx==W-1||qy==H-1)e=true;
   for(const r of [qx>0?q-1:-1,qx<W-1?q+1:-1,qy>0?q-W:-1,qy<H-1?q+W:-1])if(r>=0&&!lab[r]&&isH(r)){lab[r]=1;st.push(r);}}
  const w=x2-x1+1,h=y2-y1+1;if(!e&&n>=minN&&n<3000&&w/h<1.9&&h/w<1.9)out.push({cx:sx/n,cy:sy/n,r:Math.max(w,h)/2,w,h,n});}
 return out;};
// upper lugs: columns that hang below the mating line; take the rear-most and front-most runs
IB.upperLugs=U=>{const W=U.c.width,mate=IB.mode(U.m.bot,W*.3,W*.7),runs=[];let s=-1;
 for(let a=0;a<=W;a++){const hang=a<W&&U.m.bot[a]>mate+2;if(hang&&s<0)s=a;if(!hang&&s>=0){if(a-s>=3)runs.push([s,a-1]);s=-1;}}
 const hs=IB.holes(U,88,3).filter(h=>h.cy>mate);
 const pick=run=>{const inRun=hs.filter(h=>h.cx>=run[0]-2&&h.cx<=run[1]+2);if(inRun.length)return {x:inRun[0].cx,y:inRun[0].cy,src:'hole'};
   let lb=0;for(let a=run[0];a<=run[1];a++)lb=Math.max(lb,U.m.bot[a]);return {x:(run[0]+run[1])/2,y:mate+(lb-mate)*.5,src:'lug'};};
 return {mate,runs,rear:runs.length?pick(runs[0]):null,front:runs.length>1?pick(runs[runs.length-1]):null};};


// MAG RULE (learned from user's reference photo): the section inside the magwell (top 8-35%) must be VERTICAL,
// and the curve must grow toward the bottom, bending FORWARD (toward the muzzle). A bottom-ahead-of-top centroid test is NOT enough.
IB.cline=(c,f1,f2)=>{const W=c.width,H=c.height,d=ctx(c).getImageData(0,0,W,H).data;const pts=[];
 for(let y=Math.round(H*f1);y<Math.round(H*f2);y++){let l=-1,r=-1;for(let a=0;a<W;a++)if(d[(y*W+a)*4+3]>120){if(l<0)l=a;r=a;}if(l>=0)pts.push([y,(l+r)/2]);}
 const n=pts.length,my=pts.reduce((s,p)=>s+p[0],0)/n,mx=pts.reduce((s,p)=>s+p[1],0)/n;let num=0,den=0;for(const [y,x] of pts){num+=(y-my)*(x-mx);den+=(y-my)**2;}return num/den;};
IB.orientMag=c0=>{const cands=[];for(const mir of [false,true]){let c=mir?IB.flipH(c0):c0;
  for(let i=0;i<3;i++){const m=IB.cline(c,.08,.35);if(Math.abs(m)<.005)break;c=IB.trim(IB.rotate(c,Math.atan(m)));}
  cands.push({c,mir,top:IB.cline(c,.08,.35),bot:IB.cline(c,.6,.95)});}
 const good=cands.filter(k=>Math.abs(k.top)<.04&&k.bot>0).sort((a,b)=>b.bot-a.bot);if(!good.length)throw new Error('mag: no orientation gives a vertical top and forward-curving bottom');return good[0];};
IB.desat=(c,keep=.25)=>{const x=ctx(c),im=x.getImageData(0,0,c.width,c.height),d=im.data;for(let i=0;i<d.length;i+=4){const g=(d[i]+d[i+1]+d[i+2])/3;for(let j=0;j<3;j++)d[i+j]=g+(d[i+j]-g)*keep;}x.putImageData(im,0,0);return c;};
IB.darkSlots=c=>{const x=ctx(c),im=x.getImageData(0,0,c.width,c.height),d=im.data;for(let i=0;i<d.length;i+=4){const l=lumOf(d,i);if(l>95){d[i+3]=Math.min(d[i+3],Math.max(0,(170-l)*3.4));const t=Math.min(1,(l-95)/60);for(let j=0;j<3;j++)d[i+j]=d[i+j]*(1-t)+30*t;}}x.putImageData(im,0,0);return c;};
// lower pin pair = two holes at the same height near the body top, farthest apart (takedown + pivot)
IB.lowerPins=Lw=>{const LW=Lw.c.width,bodyTop=IB.mode(Lw.m.top,LW*.45,LW*.8);const hs=IB.holes(Lw,88,6).filter(h=>Math.abs(h.cy-bodyTop)<LW*.06);let best=null;
 for(const a of hs)for(const b of hs){if(b.cx<=a.cx||Math.abs(a.cy-b.cy)>LW*.012)continue;const d=b.cx-a.cx;if(!best||d>best.d)best={rear:a,front:b,d};}return best;};
IB.upperFace=U=>{const UW=U.c.width,mate=IB.mode(U.m.bot,UW*.3,UW*.7),rail=IB.mode(U.m.top,UW*.3,UW*.7),bodyH=mate-rail;let fc=UW-1;while(fc>UW*.7&&!(U.m.bot[fc]-U.m.top[fc]>bodyH*.72))fc--;return fc;};
// absolute scale comes from the upper body (7.05in rear->front face); the lower is sized so its pin holes match the upper lugs
IB.solve=(P,upperBody=7.05)=>{const U=P.upper,Lw=P.lower,UL=IB.upperLugs(U),LP=IB.lowerPins(Lw),fc=IB.upperFace(U);
 const k=upperBody/fc,sp=(UL.front.x-UL.rear.x)*k;return {upperTotalIn:+(U.c.width*k).toFixed(2),pinSpacingIn:+sp.toFixed(2),lowerLen:+(Lw.c.width*sp/LP.d).toFixed(2)};};
IB.render=(opts={})=>{IB.sol=IB.sol||IB.solve(IB.P);return window.__compose5(IB.P,{...IB.cap,lowerLen:IB.sol.lowerLen,...opts});};
IB.cap={cap1:'AR-15 · 5.56 NATO · 16" barrel · 15" M-LOK rail · EOTech 512',cap2:'Composited from Palmetto State Armory product photos'};
})();

// ---- v9 handguard fixes (see docs/composite-spec.md section 12) ----
(function(){
const IB=window.IB;
// strict background cut: only near-white, low-colour pixels count as background, so light / coloured finishes
// (blue titanium, champagne, FDE) are not eaten by the flood fill
IB.cutStrict=(bm,minLum=200,maxSide=1100,tol=8)=>{const k=Math.min(1,maxSide/Math.max(bm.width,bm.height));const W=Math.round(bm.width*k),H=Math.round(bm.height*k);const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d',{willReadFrequently:true});x.fillStyle='#fff';x.fillRect(0,0,W,H);x.drawImage(bm,0,0,W,H);
 const im=x.getImageData(0,0,W,H),d=im.data,bg=new Uint8Array(W*H),st=[];const lum=i=>(d[i]+d[i+1]+d[i+2])/3,sat=i=>Math.max(d[i],d[i+1],d[i+2])-Math.min(d[i],d[i+1],d[i+2]);
 const ok=p=>lum(p*4)>minLum&&sat(p*4)<30;
 for(let a=0;a<W;a++)for(const y of [0,H-1]){const p=y*W+a;if(ok(p)&&!bg[p]){bg[p]=1;st.push(p);}}for(let y=0;y<H;y++)for(const a of [0,W-1]){const p=y*W+a;if(ok(p)&&!bg[p]){bg[p]=1;st.push(p);}}
 while(st.length){const q=st.pop(),qx=q%W,qy=q/W|0,lq=lum(q*4);for(const r of [qx>0?q-1:-1,qx<W-1?q+1:-1,qy>0?q-W:-1,qy<H-1?q+W:-1])if(r>=0&&!bg[r]&&ok(r)&&Math.abs(lum(r*4)-lq)<tol){bg[r]=1;st.push(r);}}
 for(let p=0;p<W*H;p++){const i=p*4;if(bg[p]){d[i+3]=0;continue;}const px=p%W,py=p/W|0;let e=false;for(const r of [px>0?p-1:-1,px<W-1?p+1:-1,py>0?p-W:-1,py<H-1?p+W:-1])if(r>=0&&bg[r])e=true;if(e)d[i+3]=Math.min(255,Math.max(0,(255-lum(i))*3));}
 for(let y=0;y<H;y++)for(let a=0;a<W;a++)if(a<3||y<3||a>=W-3||y>=H-3)d[(y*W+a)*4+3]=0;x.putImageData(im,0,0);return c;};
// bbox trim; a "border line" row is removed only when it is isolated (near-empty rows above AND below).
// The old rule (any edge-to-edge solid row) deleted the middle band of long parts like handguards.
IB.trimSafe=(c,th=60)=>{const x=c.getContext('2d',{willReadFrequently:true}),W=c.width,H=c.height,im=x.getImageData(0,0,W,H),d=im.data;
 const rc=new Array(H).fill(0);for(let y=0;y<H;y++)for(let a=0;a<W;a++)if(d[(y*W+a)*4+3]>170)rc[y]++;
 for(let y=1;y<H-1;y++)if(rc[y]>W*.93&&rc[y-1]<W*.05&&rc[y+1]<W*.05)for(let a=0;a<W;a++)d[(y*W+a)*4+3]=0;
 for(let i=3;i<d.length;i+=4)if(d[i]<th)d[i]=0;
 const r2=new Array(H).fill(0),cc=new Array(W).fill(0);for(let y=0;y<H;y++)for(let a=0;a<W;a++)if(d[(y*W+a)*4+3]){r2[y]++;cc[a]++;}
 let y1=0,y2=H-1,x1=0,x2=W-1;while(y1<H-1&&r2[y1]<W*.015)y1++;while(y2>y1&&r2[y2]<W*.015)y2--;while(x1<W-1&&cc[x1]<H*.015)x1++;while(x2>x1&&cc[x2]<H*.015)x2--;
 x.putImageData(im,0,0);const n=document.createElement('canvas');n.width=x2-x1+1;n.height=y2-y1+1;n.getContext('2d').drawImage(c,x1,y1,n.width,n.height,0,0,n.width,n.height);return n;};
// enclosed see-through openings (M-LOK slots, lightening cuts) become real transparency with soft rims
IB.openSlots=(c,lumT=150)=>{const x=c.getContext('2d',{willReadFrequently:true}),W=c.width,H=c.height,im=x.getImageData(0,0,W,H),d=im.data;const lab=new Uint8Array(W*H);let n=0;
 const L=q=>(d[q*4]+d[q*4+1]+d[q*4+2])/3;const isL=q=>d[q*4+3]>0&&L(q)>lumT;
 for(let p0=0;p0<W*H;p0++){if(lab[p0]||!isL(p0))continue;const st=[p0],blob=[];lab[p0]=1;
  while(st.length){const q=st.pop();blob.push(q);const qx=q%W,qy=q/W|0;for(const r of [qx>0?q-1:-1,qx<W-1?q+1:-1,qy>0?q-W:-1,qy<H-1?q+W:-1])if(r>=0&&!lab[r]&&isL(r)){lab[r]=1;st.push(r);}}
  if(blob.length>=6){n++;for(const q of blob)d[q*4+3]=0;
   for(const q of blob){const qx=q%W,qy=q/W|0;for(const r of [qx>0?q-1:-1,qx<W-1?q+1:-1,qy>0?q-W:-1,qy<H-1?q+W:-1]){if(r<0||d[r*4+3]===0)continue;const l=L(r);if(l>70)d[r*4+3]=Math.min(d[r*4+3],Math.max(0,(lumT+40-l)*3));}}}}
 x.putImageData(im,0,0);return n;};
// only black-anodized parts get the black-tone + desaturate pass; coloured finishes keep their colour
IB.isBlack=c=>{const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;const L=[];for(let i=0;i<d.length;i+=16)if(d[i+3]>200)L.push((d[i]+d[i+1]+d[i+2])/3);L.sort((a,b)=>a-b);return L[L.length>>1]<75;};
IB.orig=u=>u.replace(/\/cache\/[0-9a-f]+\//,'/');   // PSA full-size original (1920px) instead of the 546px cache copy
IB.prepHandguard=async u=>{const bm=await IB.bitmap(IB.orig(u));let c=IB.cutStrict(bm);c=IB.keepMain(c);c=IB.trimSafe(c);
 for(let i=0;i<2;i++){const a=IB.pcaAngle(c);if(Math.abs(a)>.01&&Math.abs(a)<1.2)c=IB.trimSafe(IB.rotate(c,-a));}
 const black=IB.isBlack(c);if(black){IB.toneBlack(c,34);IB.desat(c);}IB.openSlots(c,black?150:185);return {c,w:c.width,h:c.height,m:IB.mask(c),black,url:IB.orig(u)};};
})();
