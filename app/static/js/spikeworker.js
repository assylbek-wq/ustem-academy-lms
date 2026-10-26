var Y={white:[246,246,240],black:[28,28,30],red:[214,40,40],blue:[37,99,235],green:[22,160,74],yellow:[250,204,21],homeL:[255,237,213],homeR:[219,234,254],orange:[234,88,12],gray:[203,213,225],zone:[226,232,240]},R={BLACK:0,MAGENTA:1,PURPLE:2,BLUE:3,AZURE:4,TURQUOISE:5,GREEN:6,YELLOW:7,ORANGE:8,RED:9,WHITE:10,UNKNOWN:-1};function Z(n,t,e,i,o=40){let r=[];for(let l=0;l<=o;l++){let d=l/o,s=1-d;r.push([s*s*s*n[0]+3*s*s*d*t[0]+3*s*d*d*e[0]+d*d*d*i[0],s*s*s*n[1]+3*s*s*d*t[1]+3*s*d*d*e[1]+d*d*d*i[1]])}return r}var Q=[...Z([450,640],[700,640],[800,900],[1050,900]),...Z([1050,900],[1300,900],[1350,640],[1600,640]).slice(1),...Z([1600,640],[1800,640],[1850,820],[1900,860]).slice(1)],vt=[{t:"rect",x0:0,y0:0,x1:380,y1:320,c:"homeL",label:"\u0414\u041E\u041C: \u041B\u0415\u0412\u0410\u042F"},{t:"rect",x0:1982,y0:0,x1:2362,y1:320,c:"homeR",label:"\u0414\u041E\u041C: \u041F\u0420\u0410\u0412\u0410\u042F"},{t:"frame",x0:0,y0:0,x1:380,y1:320,w:10,c:"orange"},{t:"frame",x0:1982,y0:0,x1:2362,y1:320,w:10,c:"blue"},{t:"seg",a:[450,60],b:[450,300],w:8,c:"black"},...Array.from({length:11},(n,t)=>({t:"seg",a:[550+t*100,60],b:[550+t*100,t%5===4?140:100],w:4,c:"black"})),{t:"seg",a:[450,60],b:[1550,60],w:4,c:"black"},{t:"seg",a:[450,430],b:[2e3,430],w:20,c:"black"},{t:"poly",pts:Q,w:20,c:"black"},{t:"rect",x0:1880,y0:820,x1:1990,y1:930,c:"green"},{t:"rect",x0:450,y0:960,x1:600,y1:1110,c:"red"},{t:"rect",x0:700,y0:960,x1:850,y1:1110,c:"blue"},{t:"rect",x0:950,y0:960,x1:1100,y1:1110,c:"yellow"},{t:"rect",x0:1200,y0:960,x1:1350,y1:1110,c:"green"},{t:"rect",x0:1600,y0:120,x1:1850,y1:320,c:"zone"},{t:"frame",x0:1600,y0:120,x1:1850,y1:320,w:6,c:"gray"}];var lt=(n,t,e,i)=>{let o=i[0]-e[0],r=i[1]-e[1],l=o*o+r*r,d=l?Math.max(0,Math.min(1,((n-e[0])*o+(t-e[1])*r)/l)):0;return Math.hypot(n-(e[0]+o*d),t-(e[1]+r*d))};function V(n,t,e){let i=1/0;for(let o=1;o<e.length;o++)i=Math.min(i,lt(n,t,e[o-1],e[o]));return i}function kt(n,t,e){return n.t==="rect"?t>=n.x0&&t<=n.x1&&e>=n.y0&&e<=n.y1:n.t==="frame"?t>=n.x0&&t<=n.x1&&e>=n.y0&&e<=n.y1?t-n.x0<n.w||n.x1-t<n.w||e-n.y0<n.w||n.y1-e<n.w:!1:n.t==="seg"?lt(t,e,n.a,n.b)<=n.w/2:n.t==="poly"?V(t,e,n.pts)<=n.w/2:!1}function xt(n,t){if(n<0||t<0||n>2362||t>1143)return Y.gray;let e=Y.white;for(let i of vt)kt(i,n,t)&&(e=Y[i.c]);return e}var at=Array.from({length:64},(n,t)=>{let e=7*Math.sqrt((t+.5)/64),i=t*2.399963;return[e*Math.cos(i),e*Math.sin(i)]});function ft(n,t){let e=0,i=0,o=0;for(let[l,d]of at){let s=xt(n+l,t+d);e+=s[0],i+=s[1],o+=s[2]}let r=at.length;return[e/r,i/r,o/r]}function tt(n){let t=(.3*n[0]+.59*n[1]+.11*n[2])/255;return Math.max(0,Math.min(100,Math.round(t*97+1)))}function et(n){let[t,e,i]=n,o=Math.max(t,e,i),r=Math.min(t,e,i),l=o/255,d=o?(o-r)/o:0;if(l<.25)return R.BLACK;if(d<.25)return l>.7?R.WHITE:R.UNKNOWN;let s;return o===t?s=(60*((e-i)/(o-r))+360)%360:o===e?s=60*((i-t)/(o-r))+120:s=60*((t-e)/(o-r))+240,s<15||s>=340?R.RED:s<40?R.ORANGE:s<70?R.YELLOW:s<160?R.GREEN:s<200?R.AZURE:s<260?R.BLUE:R.MAGENTA}var K={mine:{ru:"\u0428\u0430\u0445\u0442\u0430",x:1889,y:1043,w:124,h:124,a:-40,dir:50},city:{ru:"\u0413\u043E\u0440\u043E\u0434",x:1283,y:96,w:92,h:135,a:0,dir:270},farm:{ru:"\u0424\u0435\u0440\u043C\u0430",x:1002,y:630,w:90,h:132,a:0,dir:90}},Mt={mine:15,city:14,farm:13},ot={mine:"canopy",city:"skylight",farm:"hatch"},L=n=>n*Math.PI/180,k=(n,t,e,i,o=0)=>({k:"box",x:n+181,y:t,w:e,h:i,a:o}),B=(n,t,e)=>({k:"circle",x:n+181,y:t,r:e}),H=(n,t,e,i,o)=>({k:"box",x:n+181,y:t,w:o,h:i,a:e-90,dir:e});function q(n,t,e){let i=t-n.x,o=e-n.y,r=Math.cos(L(-(n.a||0))),l=Math.sin(L(-(n.a||0)));return[i*r-o*l,i*l+o*r]}function O(n,t,e,i=0){if(n.k==="circle")return Math.hypot(t-n.x,e-n.y)<=n.r+i;let[o,r]=q(n,t,e);return Math.abs(o)<=n.w/2+i&&Math.abs(r)<=n.h/2+i}function dt(n,t,e){if(n.k==="circle"){let c=t-n.x,_=e-n.y,y=Math.hypot(c,_);return y>=n.r?null:y<1e-6?{nx:1,ny:0,d:n.r}:{nx:c/y,ny:_/y,d:n.r-y}}let[i,o]=q(n,t,e),r=n.w/2-Math.abs(i),l=n.h/2-Math.abs(o);if(r<=0||l<=0)return null;let d=0,s=0,p;r<l?(d=Math.sign(i)||1,p=r):(s=Math.sign(o)||1,p=l);let f=Math.cos(L(n.a||0)),u=Math.sin(L(n.a||0));return{nx:d*f-s*u,ny:d*u+s*f,d:p}}function wt(n,t,e){let[i,o]=q(n,t,e);return Math.abs(i)>n.w/2||Math.abs(o)>n.h/2?-1:o+n.h/2}function ct(n,t,e,i,o){if(n.k==="circle"){let _=t-n.x,y=e-n.y,x=_*i+y*o,b=_*_+y*y-n.r*n.r,v=x*x-b;if(v<0)return 1/0;let m=-x-Math.sqrt(v);return m>0?m:1/0}let[r,l]=q(n,t,e),d=Math.cos(L(-(n.a||0))),s=Math.sin(L(-(n.a||0))),p=i*d-o*s,f=i*s+o*d,u=-1/0,c=1/0;for(let[_,y,x]of[[r,p,n.w/2],[l,f,n.h/2]]){if(Math.abs(y)<1e-9){if(Math.abs(_)>x)return 1/0;continue}let b=(-x-_)/y,v=(x-_)/y;b>v&&([b,v]=[v,b]),u=Math.max(u,b),c=Math.min(c,v)}return u<=c&&u>0?u:1/0}var J=(n,t=0)=>{let e=K[n];return k(e.x,e.y,e.w+t,e.h+t,e.a)};function it(n,t=0,e=0){let i=K[n],o=L(i.dir+180),r=L(i.dir+90),l=i.dir%180===90?i.h/2:i.w/2;return[181+i.x+Math.cos(o)*(l+e)+Math.cos(r)*t,i.y+Math.sin(o)*(l+e)+Math.sin(r)*t]}var X=class{constructor(t={}){this.docks={...Mt,...t.docks||{}},this.s={droneUp:!1,mapFlipped:!1,seedsOut:!1,flagDown:!1,rockFlipped:!1,rockBack:!1,leaf1:!1,leaf2:!1,katydidMoved:!1,katydidOut:!1,root:0,myc:0,vine:!1,platform:!1,camera:!1,treeSeed:!1,spiderMoved:!1,snailMoved:!1,cover:!1,cane:!1,tie:"tree",trees:!1,canopy:!1,skylight:0,hatch:!1,fragments:3,antHome:!1},this.objs=[{id:"scan",kind:"scan",x:1334,y:165,r:16},{id:"keystone",kind:"keystone",x:t.keystone?t.keystone.x:520,y:t.keystone?t.keystone.y:300,r:40}],this.tools={C:{down:!1,tip:null},D:{down:!1,tip:null}},this.carry=null,this.events=[],this.pixels=null,this.build();for(let[e,i]of Object.entries(t.fieldState||{}))this.s[e]=i}build(){let t=this.docks,e=r=>Object.keys(t).find(l=>t[l]===r);this.dockOf=e,this.solids=[B(1153,61,34),k(639,543,52,52,45),k(80,661,120,56),k(135,1030,110,100),k(406,1112,40,52),B(578,1075,58),k(1520,1078,100,110),k(1662,1102,50,60),k(1409,596,78,78,45),B(1940,757,32),k(1941,546,30,60)];let i=e(15);i&&this.solids.push(J(i)),this.fragile=[{key:"spiderMoved",s:B(752,1050,22)},{key:"snailMoved",s:B(1044,723,26)}];let o=[];o.push({m:1,kind:"push",z:H(1098,61,0,40,90),need:12,act:()=>{this.s.droneUp||(this.s.droneUp=!0,this.ev("\u0414\u0440\u043E\u043D \u0432\u0437\u043B\u0435\u0442\u0435\u043B"))}}),o.push({m:1,kind:"down",z:k(1153,128,70,50),act:()=>{this.s.droneUp&&!this.s.mapFlipped&&(this.s.mapFlipped=!0,this.ev("\u041A\u0430\u0440\u0442\u0430 LiDAR \u043F\u0435\u0440\u0435\u0432\u0435\u0440\u043D\u0443\u0442\u0430"))}}),o.push({m:2,kind:"touch",z:B(639,543,62),act:()=>this.releaseSeeds()}),o.push({m:3,kind:"push",z:H(158,661,180,36,56),need:10,act:()=>{this.s.flagDown||(this.s.flagDown=!0,this.s.rockFlipped=!0,this.ev("\u0424\u043B\u0430\u0436\u043E\u043A \u043E\u043F\u0443\u0449\u0435\u043D"))}}),o.push({m:3,kind:"down",z:k(80,661,90,60),act:()=>{this.s.rockFlipped&&!this.s.rockBack&&(this.s.rockBack=!0,this.ev("\u041A\u0430\u043C\u0435\u043D\u044C \u043D\u0430 \u043C\u0435\u0441\u0442\u0435"))}}),o.push({m:4,kind:"up",z:k(100,965,30,30),act:()=>{this.s.leaf1||(this.s.leaf1=!0,this.ev("\u041B\u0438\u0441\u0442 \u0441\u043D\u044F\u0442"))}}),o.push({m:4,kind:"up",z:k(170,965,30,30),act:()=>{this.s.leaf2||(this.s.leaf2=!0,this.ev("\u041B\u0438\u0441\u0442 \u0441\u043D\u044F\u0442"))}}),o.push({m:4,kind:"updown",z:k(135,965,22,30),act:()=>{this.s.katydidMoved=!0}}),o.push({m:5,kind:"push",z:H(406,1061,90,50,50),need:15,depth:r=>{this.s.root=Math.max(this.s.root,r>=38?2:1)}}),o.push({m:6,kind:"down",z:k(1606,1048,60,64),act:()=>{this.s.antHome||(this.s.antHome=!0,Math.abs(this.robotSpeed)>330?(this.s.fragments=0,this.ev("\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u0431\u044B\u0441\u0442\u0440\u043E: \u043B\u0438\u0441\u0442\u044C\u044F \u0440\u0430\u0441\u0441\u044B\u043F\u0430\u043B\u0438\u0441\u044C")):this.ev("\u041C\u0443\u0440\u0430\u0432\u0435\u0439 \u0432 \u0433\u043D\u0435\u0437\u0434\u0435"))}}),o.push({m:7,kind:"push",z:H(1662,1052,90,40,50),need:25,act:()=>{this.s.myc||(this.s.myc=1,this.ev("\u041C\u0438\u0446\u0435\u043B\u0438\u0439 \u0432\u044B\u0442\u044F\u043D\u0443\u0442"))}}),o.push({m:8,kind:"down",z:k(578,1e3,50,30),act:()=>{this.s.vine||(this.s.vine=!0,this.ev("\u041B\u0438\u0430\u043D\u0430 \u043D\u0430 \u043C\u0430\u0442\u0435"))}}),o.push({m:9,kind:"up",z:k(505,1062,30,60),act:()=>{this.s.platform||(this.s.platform=!0,this.ev("\u041F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0430 \u043F\u043E\u0434\u043D\u044F\u0442\u0430"))}}),o.push({m:9,kind:"down",z:k(652,1062,34,50),act:()=>{this.s.camera||(this.s.camera=!0,this.ev("\u0424\u043E\u0442\u043E\u043B\u043E\u0432\u0443\u0448\u043A\u0430 \u0443\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u0430"))}}),o.push({m:9,kind:"down",z:k(622,1012,30,30),act:()=>this.dropTreeSeed()}),o.push({m:11,kind:"down",z:k(1368,556,34,40,45),act:()=>{this.s.cover||(this.s.cover=!0,this.ev("\u041E\u043A\u043D\u043E \u043E\u0442\u043A\u0440\u044B\u0442\u043E"))}}),o.push({m:12,kind:"up",z:k(1896,757,30,50),act:()=>{this.s.cane||(this.s.cane=!0,this.ev("\u041F\u043E\u0434\u043F\u043E\u0440\u043A\u0430 \u043F\u043E\u0434\u043D\u044F\u0442\u0430"))}}),o.push({m:12,kind:"up",z:k(1940,712,40,26),act:()=>{this.s.tie==="tree"&&(this.s.tie="robot",this.ev("\u0421\u0442\u044F\u0436\u043A\u0430 \u043D\u0430 \u043D\u0430\u0432\u0435\u0441\u043D\u043E\u043C"))}}),o.push({m:12,kind:"down",z:k(1941,546,50,80),act:()=>{this.s.tie==="robot"&&(this.s.tie="post",this.ev("\u0421\u0442\u044F\u0436\u043A\u0430 \u043D\u0430 \u0441\u0442\u043E\u043B\u0431\u0438\u043A\u0435"))}});for(let[r,l]of Object.entries(t)){let d=K[r];if(l===13&&o.push({m:13,kind:"up",z:J(r,30),act:()=>{this.s.trees||(this.s.trees=!0,this.ev("\u041C\u043E\u043B\u043E\u0434\u044B\u0435 \u0434\u0435\u0440\u0435\u0432\u044C\u044F \u043F\u043E\u0434\u043D\u044F\u0442\u044B"))}}),l===15){let[s,p]=it(r,-32,14),[f,u]=it(r,0,18),[c,_]=it(r,32,14);o.push({m:15,kind:"up",z:{k:"box",x:s,y:p,w:30,h:28,a:d.a},act:()=>{this.s.canopy||(this.s.canopy=!0,this.ev("\u041D\u0430\u0432\u0435\u0441 \u0434\u043B\u044F \u0433\u043D\u0435\u0437\u0434 \u043F\u043E\u0434\u043D\u044F\u0442"))}}),o.push({m:15,kind:"push",z:{k:"box",x:f,y:u,w:30,h:36,a:d.dir-90,dir:d.dir},need:14,act:()=>{this.s.skylight||(this.s.skylight=1,this.ev("\u041E\u043A\u043D\u043E \u0441\u0430\u0434\u0430 \u0437\u0430\u0434\u0432\u0438\u043D\u0443\u0442\u043E"))}}),o.push({m:15,kind:"down",z:{k:"box",x:c,y:_,w:30,h:28,a:d.a},act:()=>{this.s.hatch||(this.s.hatch=!0,this.ev("\u041A\u043E\u043C\u043F\u043E\u0441\u0442\u043D\u044B\u0439 \u043B\u044E\u043A \u043E\u0442\u043A\u0440\u044B\u0442"))}})}}this.triggers=o.map(r=>({...r,t:0}))}ev(t){this.events.push(t)}releaseSeeds(){if(!this.s.seedsOut){this.s.seedsOut=!0;for(let[t,[e,i]]of[[-96,30],[86,72],[12,-102]].entries())this.objs.push({id:"seed"+t,kind:"seed",x:820+e,y:543+i,r:18});this.ev("\u0421\u0435\u043C\u0435\u043D\u0430 \u0432\u044B\u0431\u0440\u043E\u0448\u0435\u043D\u044B")}}dropTreeSeed(){this.s.treeSeed||(this.s.treeSeed=!0,this.objs.push({id:"seed3",kind:"seed",x:803,y:968,r:18}),this.ev("\u0421\u0435\u043C\u0435\u0447\u043A\u043E \u0443\u043F\u0430\u043B\u043E \u0441 \u0434\u0435\u0440\u0435\u0432\u0430"))}async load(t){if(!(!t||this.pixels||typeof fetch>"u"||typeof createImageBitmap>"u"))try{let e=await(await fetch(t)).blob(),i=await createImageBitmap(e),o=typeof OffscreenCanvas<"u"?new OffscreenCanvas(i.width,i.height):null;if(!o)return;let r=o.getContext("2d");r.drawImage(i,0,0),this.pixels={w:i.width,h:i.height,data:r.getImageData(0,0,i.width,i.height).data}}catch{this.pixels=null}}colorAt(t,e){if(t<0||e<0||t>2362||e>1143)return[90,90,90];let i=t-181;if(i<0||i>2e3)return[60,60,62];let o=this.pixels;if(!o)return[235,235,230];let r=Math.min(o.w-1,Math.max(0,Math.floor(i/2e3*o.w))),d=(Math.min(o.h-1,Math.max(0,Math.floor((1-e/1143)*o.h)))*o.w+r)*4;return[o.data[d],o.data[d+1],o.data[d+2]]}bodyPoints(t,e){let i=[];for(let o=-e.half;o<=e.half;o+=20)i.push(t.local2world(e.front,o)),i.push(t.local2world(-e.back,o));for(let o=-e.back+20;o<e.front;o+=25)i.push(t.local2world(o,-e.half)),i.push(t.local2world(o,e.half));return i}collide(t,e){for(let i=0;i<3;i++){let o=0,r=0;for(let l of this.bodyPoints(t,e))for(let d of this.solids){let s=dt(d,l.x,l.y);if(s&&s.d>0){let p=s.nx*s.d,f=s.ny*s.d;Math.abs(p)>Math.abs(o)&&(o=p),Math.abs(f)>Math.abs(r)&&(r=f)}}if(!o&&!r)break;t.pose.x+=o,t.pose.y+=r}}toolTip(t,e,i,o){let r=t.model&&t.model.tools[i]||{off:i==="D"?40:0,reach:110},l=r.reach*Math.sin(Math.max(0,Math.min(180,o))*Math.PI/180);return t.local2world(e.front+Math.max(10,l),r.off)}update(t,e,i){var p;let o=this.s,r=this.bodyPoints(t,e);this.robotSpeed=t.speedMm||0;let l=[];for(let f=-e.half+10;f<=e.half-10;f+=15)l.push(t.local2world(e.front,f));let d=[];for(let f of Object.keys(t.model&&t.model.tools||{C:1,D:1})){let u=t.motors[f];if(!u||!String(t.ports[f]).startsWith("motor"))continue;let c=(p=this.tools)[f]||(p[f]={down:!1,tip:null}),_=u.pos,y=this.toolTip(t,e,f,_),x=Math.sin(Math.max(0,Math.min(180,_))*Math.PI/180);!c.down&&_>=60?(c.down=!0,c.downTip=y,c.deep=x,c.lastDownTip=y,d.push({kind:"down",tip:y})):c.down&&_<=30&&(c.down=!1,d.push({kind:"up",tip:c.lastDownTip||y})),c.down&&x>=c.deep&&(c.deep=x,c.lastDownTip=y),c.tip=y}for(let f of this.triggers)if(f.kind==="push"){let c=((t.pose.h*180/Math.PI+90-f.z.dir)%360+540)%360-180;if(Math.abs(c)>30||(t.speedMm||0)<15)continue;let _=-1;for(let y of l)_=Math.max(_,wt(f.z,y.x,y.y));f.depth&&_>=f.need&&f.depth(_),!f.depth&&_>=f.need&&f.act()}else if(f.kind==="touch"){let u=l.some(c=>O(f.z,c.x,c.y))||Object.values(this.tools).some(c=>c.tip&&O(f.z,c.tip.x,c.tip.y));f.t=u?f.t+i:0,f.t>.12&&f.act()}else for(let u of d)(f.kind===u.kind||f.kind==="updown")&&O(f.z,u.tip.x,u.tip.y,f.kind==="updown"?0:12)&&f.act();let s=B(135,966,16);r.some(f=>O(s,f.x,f.y))&&(o.katydidMoved=!0,l.some(f=>O(s,f.x,f.y,-6))&&(o.katydidOut=!0));for(let f of this.fragile){if(o[f.key])continue;(Object.values(this.tools).some(c=>c.tip&&O(f.s,c.tip.x,c.tip.y,4))||r.some(c=>O(f.s,c.x,c.y,4)))&&(o[f.key]=!0,this.ev("\u041C\u0438\u043A\u0440\u043E\u044D\u043A\u043E\u0441\u0438\u0441\u0442\u0435\u043C\u0430 \u0441\u0434\u0432\u0438\u043D\u0443\u0442\u0430!"))}for(let f of this.objs){t.pushCircle(f);for(let u of this.solids){let c=dt(u,f.x,f.y);c&&(f.x+=c.nx*(c.d+f.r*.2),f.y+=c.ny*(c.d+f.r*.2))}f.x=Math.max(f.r,Math.min(2362-f.r,f.x)),f.y=Math.max(f.r,Math.min(1143-f.r,f.y))}}raycast(t,e,i,o){let r=1/0;for(let l of this.solids)r=Math.min(r,ct(l,t,e,i,o));for(let l of this.objs)r=Math.min(r,ct({k:"circle",x:l.x,y:l.y,r:l.r},t,e,i,o));return r}score(){let t=this.s,e=[],i=this.docks,o=(w,T,$,C)=>e.push({m:w,pts:T,max:$,parts:C}),r=w=>this.objs.find(T=>T.id===w),l=r("scan"),d=k(1052,231,76,76,30),s=l&&O(d,l.x,l.y,l.r*.6);o(1,(t.droneUp?20:0)+(t.droneUp&&t.mapFlipped&&s?10:0),30,[["\u0414\u0440\u043E\u043D \u043D\u0435 \u043A\u0430\u0441\u0430\u0435\u0442\u0441\u044F \u043C\u0430\u0442\u0430",t.droneUp,20],["\u0411\u043E\u043D\u0443\u0441: \u043A\u0430\u0440\u0442\u0430 \u043F\u0435\u0440\u0435\u0432\u0435\u0440\u043D\u0443\u0442\u0430, \u043C\u0435\u0442\u043A\u0430 \u0432 \u0437\u043E\u043D\u0435",t.droneUp&&t.mapFlipped&&s,10]]);let p=this.objs.filter(w=>/^seed[012]$/.test(w.id)&&Math.hypot(w.x-181-639,w.y-543)>48).length;o(2,p*10,30,[["\u0421\u0435\u043C\u0435\u043D\u0430 \u043D\u0435 \u043A\u0430\u0441\u0430\u044E\u0442\u0441\u044F \u0441\u0442\u0435\u0431\u043B\u044F: "+p+" \u0438\u0437 3",p>0,p*10]]),o(3,(t.flagDown?20:0)+(t.flagDown&&t.rockBack?10:0),30,[["\u0424\u043B\u0430\u0436\u043E\u043A \u043E\u043F\u0443\u0449\u0435\u043D",t.flagDown,20],["\u0411\u043E\u043D\u0443\u0441: \u043A\u0430\u043C\u0435\u043D\u044C \u0432\u0435\u0440\u043D\u0443\u043B\u0441\u044F \u043D\u0430 \u043C\u0435\u0441\u0442\u043E",t.flagDown&&t.rockBack,10]]);let f=(t.leaf1?1:0)+(t.leaf2?1:0),u=t.katydidOut?0:(f>=1?10:0)+(f===2&&!t.katydidMoved?20:0);o(4,u,30,[["\u041E\u0434\u0438\u043D \u043B\u0438\u0441\u0442 \u0441\u043D\u044F\u0442",f>=1&&!t.katydidOut,10],["\u0411\u043E\u043D\u0443\u0441: \u0432\u0442\u043E\u0440\u043E\u0439 \u043B\u0438\u0441\u0442, \u043A\u0443\u0437\u043D\u0435\u0447\u0438\u043A \u043D\u0430 \u043C\u0435\u0441\u0442\u0435",f===2&&!t.katydidMoved&&!t.katydidOut,20],...t.katydidOut?[["\u041A\u0443\u0437\u043D\u0435\u0447\u0438\u043A \u0432\u043D\u0435 \u0437\u043E\u043D\u044B: 0 \u043E\u0447\u043A\u043E\u0432 \u0437\u0430 \u043C\u0438\u0441\u0441\u0438\u044E",!1,0]]:[]]),o(5,t.root===2?20:t.root===1?10:0,20,[["\u041A\u043E\u0440\u0435\u043D\u044C \u0432\u044B\u0442\u044F\u043D\u0443\u0442 \u0447\u0430\u0441\u0442\u0438\u0447\u043D\u043E (10) \u0438\u043B\u0438 \u043F\u043E\u043B\u043D\u043E\u0441\u0442\u044C\u044E (20)",t.root>0,t.root===2?20:t.root*10]]);let c=t.antHome?t.fragments*10:0;o(6,c,30,[["\u041C\u0443\u0440\u0430\u0432\u0435\u0439 \u0443 \u0433\u043D\u0435\u0437\u0434\u0430, \u043B\u0438\u0441\u0442\u044C\u044F \u0432 \u0433\u043D\u0435\u0437\u0434\u0435: "+(t.antHome?t.fragments:0)+" \u0438\u0437 3",c>0,c]]),o(7,t.myc?20:0,30,[["\u041C\u0438\u0446\u0435\u043B\u0438\u0439 \u043F\u043E\u043B\u043D\u043E\u0441\u0442\u044C\u044E \u0432\u044B\u0442\u044F\u043D\u0443\u0442",!!t.myc,20],["\u0411\u043E\u043D\u0443\u0441 \u0441 \u0441\u043E\u0441\u0435\u0434\u043D\u0438\u043C \u0441\u0442\u043E\u043B\u043E\u043C (\u0432 \u0441\u0438\u043C\u0443\u043B\u044F\u0442\u043E\u0440\u0435 \u043D\u0435\u0442 \u0441\u043E\u043F\u0435\u0440\u043D\u0438\u043A\u0430)",!1,0]]),o(8,t.vine?30:0,30,[["\u041B\u0438\u0430\u043D\u0430 \u043A\u0430\u0441\u0430\u0435\u0442\u0441\u044F \u043C\u0430\u0442\u0430",t.vine,30]]);let _=r("seed3"),y=!!_&&Math.hypot(_.x-181-578,_.y-1075)>64;o(9,(t.platform?10:0)+(t.camera?10:0)+(y?10:0),30,[["\u041F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0430 \u043F\u043E\u0434\u043D\u044F\u0442\u0430",t.platform,10],["\u0424\u043E\u0442\u043E\u043B\u043E\u0432\u0443\u0448\u043A\u0430 \u0443\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u0430",t.camera,10],["\u0421\u0435\u043C\u0435\u0447\u043A\u043E \u043D\u0435 \u043A\u0430\u0441\u0430\u0435\u0442\u0441\u044F \u0434\u0435\u0440\u0435\u0432\u0430",y,10]]),o(10,(t.spiderMoved?0:10)+(t.snailMoved?0:10),20,[["\u0414\u043E\u043C \u043F\u0430\u0443\u043A\u0430 \u043D\u0430 \u043C\u0435\u0441\u0442\u0435",!t.spiderMoved,10],["\u0414\u043E\u043C \u0443\u043B\u0438\u0442\u043A\u0438 \u043D\u0430 \u043C\u0435\u0441\u0442\u0435",!t.snailMoved,10]]),o(11,t.cover?20:0,20,[["\u041A\u0440\u044B\u0448\u043A\u0430 \u043A\u043E\u0440\u043D\u0435\u0439 \u043E\u043F\u0443\u0449\u0435\u043D\u0430 \u0434\u043E \u043C\u0430\u0442\u0430",t.cover,20]]),o(12,(t.cane?20:0)+(t.tie==="post"?10:0),30,[["\u041F\u043E\u0434\u043F\u043E\u0440\u043A\u0430 \u043F\u043E\u0434\u043D\u044F\u0442\u0430 \u0438 \u043A\u0430\u0441\u0430\u0435\u0442\u0441\u044F \u0434\u0435\u0440\u0435\u0432\u0430",t.cane,20],["\u0421\u0442\u044F\u0436\u043A\u0430 \u0432\u043E\u043A\u0440\u0443\u0433 \u0441\u0442\u043E\u043B\u0431\u0438\u043A\u0430",t.tie==="post",10]]);let x=this.dockOf(13),b=this.dockOf(14),v=this.dockOf(15),m=r("keystone"),P=!!(x&&m&&O(J(x,10),m.x,m.y));o(13,P&&t.trees?30:0,30,[["\u041A\u043B\u044E\u0447\u0435\u0432\u043E\u0439 \u0432\u0438\u0434 \u043D\u0430 \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0435",P,0],["\u0438 \u043C\u043E\u043B\u043E\u0434\u044B\u0435 \u0434\u0435\u0440\u0435\u0432\u044C\u044F \u043F\u043E\u0434\u043D\u044F\u0442\u044B",P&&t.trees,30]]);let D=b?this.objs.filter(w=>w.kind==="seed"&&O(J(b,4),w.x,w.y)).length:0;o(14,D*10,40,[["\u0421\u0435\u043C\u0435\u043D\u0430 \u0432 \u0441\u0442\u0430\u043D\u0446\u0438\u0438: "+D+" (5 + 5 \u0431\u043E\u043D\u0443\u0441 \u0437\u0430 \u043A\u0430\u0436\u0434\u043E\u0435)",D>0,D*10]]);let I=v&&(ot[v]==="canopy"&&t.canopy||ot[v]==="skylight"&&t.skylight||ot[v]==="hatch"&&t.hatch);o(15,(t.canopy?10:0)+(t.skylight?10:0)+(t.hatch?10:0)+(I?10:0),40,[["\u041D\u0430\u0432\u0435\u0441 \u0434\u043B\u044F \u0433\u043D\u0435\u0437\u0434 \u043F\u043E\u0434\u043D\u044F\u0442",t.canopy,10],["\u041E\u043A\u043D\u043E \u0441\u0430\u0434\u0430 \u043F\u043E\u043B\u043D\u043E\u0441\u0442\u044C\u044E \u0437\u0430\u0434\u0432\u0438\u043D\u0443\u0442\u043E",!!t.skylight,10],["\u041A\u043E\u043C\u043F\u043E\u0441\u0442\u043D\u044B\u0439 \u043B\u044E\u043A \u043E\u0442\u043A\u0440\u044B\u0442",t.hatch,10],["\u042D\u043A\u043E\u0431\u043E\u043D\u0443\u0441 \u0434\u043E\u043A\u0430 \xAB"+(v?K[v].ru:"-")+"\xBB",!!I,10]]);let W=e.reduce((w,T)=>w+T.pts,0)+50+20;return{rows:e,tokens:50,inspection:20,total:W}}snapshot(){return{s:{...this.s},docks:this.docks,objs:this.objs.map(t=>({id:t.id,kind:t.kind,x:Math.round(t.x),y:Math.round(t.y),r:t.r})),score:this.score()}}};var st={course:{title:"\u0420\u043E\u0431\u043E\u0442 \u043A\u0443\u0440\u0441\u0430",ports:{A:"motor:large",B:"motor:large",C:"motor:medium",D:"motor:medium",E:"color",F:"color"},drive:["A","B"],wheel:56,track:112,body:{front:105,back:75,half:80},sensors:{E:[95,-28],F:[95,28]},tools:{C:{off:0,reach:110,kind:"arm"},D:{off:40,reach:110,kind:"arm"}},hub:{f:-5,r:0,along:!0},roles:{A:"\u043B\u0435\u0432\u043E\u0435 \u043A\u043E\u043B\u0435\u0441\u043E",B:"\u043F\u0440\u0430\u0432\u043E\u0435 \u043A\u043E\u043B\u0435\u0441\u043E",C:"\u043D\u0430\u0432\u0435\u0441\u043D\u043E\u0435 (\u0440\u0443\u043A\u0430)",D:"\u043D\u0430\u0432\u0435\u0441\u043D\u043E\u0435 2",E:"\u043B\u0435\u0432\u044B\u0439 \u0434\u0430\u0442\u0447\u0438\u043A",F:"\u043F\u0440\u0430\u0432\u044B\u0439 \u0434\u0430\u0442\u0447\u0438\u043A"}},"driving-base":{title:"\u041F\u0440\u0438\u0432\u043E\u0434\u043D\u0430\u044F \u0431\u0430\u0437\u0430",ports:{C:"motor:medium",D:"motor:medium",E:"motor:medium",F:"distance",B:"color",A:""},drive:["C","D"],wheel:56,track:113,body:{front:78,back:92,half:64},sensors:{B:[70,0],F:[78,0]},tools:{E:{off:0,reach:95,kind:"arm"}},hub:{f:-10,r:0,along:!0},roles:{C:"\u043B\u0435\u0432\u043E\u0435 \u043A\u043E\u043B\u0435\u0441\u043E",D:"\u043F\u0440\u0430\u0432\u043E\u0435 \u043A\u043E\u043B\u0435\u0441\u043E",E:"\u0440\u0443\u043A\u0430",F:"\u0434\u0430\u0442\u0447\u0438\u043A \u0440\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u044F",B:"\u0434\u0430\u0442\u0447\u0438\u043A \u0446\u0432\u0435\u0442\u0430",A:""}},advanced:{title:"\u041F\u0440\u043E\u0434\u0432\u0438\u043D\u0443\u0442\u0430\u044F \u043F\u0440\u0438\u0432\u043E\u0434\u043D\u0430\u044F \u0431\u0430\u0437\u0430",ports:{A:"motor:large",E:"motor:large",C:"motor:medium",D:"motor:medium",B:"color",F:"color"},drive:["A","E"],wheel:88,track:145,body:{front:112,back:82,half:92},sensors:{B:[92,-34],F:[92,34]},tools:{C:{off:0,reach:70,kind:"dozer"},D:{off:0,reach:120,kind:"lift"}},hub:{f:-12,r:0,along:!1},roles:{A:"\u043B\u0435\u0432\u043E\u0435 \u043A\u043E\u043B\u0435\u0441\u043E",E:"\u043F\u0440\u0430\u0432\u043E\u0435 \u043A\u043E\u043B\u0435\u0441\u043E",C:"\u043E\u0442\u0432\u0430\u043B (\u0431\u0443\u043B\u044C\u0434\u043E\u0437\u0435\u0440)",D:"\u043F\u043E\u0434\u044A\u0435\u043C\u043D\u0430\u044F \u0440\u0443\u043A\u0430",B:"\u043B\u0435\u0432\u044B\u0439 \u0434\u0430\u0442\u0447\u0438\u043A \u0446\u0432\u0435\u0442\u0430",F:"\u043F\u0440\u0430\u0432\u044B\u0439 \u0434\u0430\u0442\u0447\u0438\u043A \u0446\u0432\u0435\u0442\u0430"}}};function ht(n={}){let t=n.robot,e=typeof t=="string"?t:n.robotModel||"course",i=st[e]||st.course,o=JSON.parse(JSON.stringify(i));return o.name=st[e]?e:"course",t&&typeof t=="object"&&Object.assign(o.ports,t),n.sensorPos&&Object.assign(o.sensors,n.sensorPos),o}var Et=Array.from({length:16},(n,t)=>{let e=7*Math.sqrt((t+.5)/16),i=t*2.399963;return[e*Math.cos(i),e*Math.sin(i)]}),At=56,Nt=Math.PI*At/360;var St={large:1050,medium:1110,small:660},z=["A","B","C","D","E","F"],U=.005;var nt=class{constructor(t){this.kind=t,this.pos=0,this.vel=0,this.cmd=0,this.accel=1e3,this.decel=1e3,this.job=null,this.offset=0}get max(){return St[this.kind]||1050}},E=(n,t,e)=>Math.max(t,Math.min(e,n)),Tt={marker:24,cube:24,crate:30,baton:10},rt=(n,t,e,i,o)=>{let r=Math.abs(t)>Math.abs(n)&&Math.sign(t||1)===Math.sign(n||t||1)?e:i,l=t-n,d=r*o;return Math.abs(l)<=d?t:n+Math.sign(l)*d},pt=(n,t,e)=>Math.sign(n)*Math.min(t,Math.sqrt(2*e*Math.abs(n))),G=class{constructor(t={}){this.preset=t,this.model=ht(t),this.ports=this.model.ports,this.body=this.model.body,this.mmPerDeg=Math.PI*this.model.wheel/360;let e=t.start||{x:190,y:150,h:-90};this.pose={x:e.x,y:e.y,h:(e.h||0)*Math.PI/180},this.drift=t.drift||0,this.motors={};for(let i of z)String(this.ports[i]).startsWith("motor")&&(this.motors[i]=new nt(this.ports[i].split(":")[1]||"medium"));this.pairs={},this.pairJob=null,this.t=0,this.yawOffset=this.pose.h,this.matrix={text:"",image:null,pixels:null},this.prints=[],this.beeps=[],this.buttons={left:!1,right:!1},this.box=t.box?{...t.box,r:55}:null,this.lever=t.lever?{...t.lever,up:!0,flips:0}:null,this.trail=[[this.pose.x,this.pose.y]],this.trailT=0,this.maxLineDist=0,this.events=[],this.field=t.field==="bioglow"?new X(t):null,this.speedMm=0,this.objects=(t.objects||[]).map((i,o)=>({id:i.id||i.kind+o,kind:i.kind,x:i.x,y:i.y,r:i.r||Tt[i.kind]||25,fixed:i.kind==="marker"||!!i.fixed,touched:!1,carried:null,lifted:!1})),this.toolState={}}spot(t,e){if(!this.field)return ft(t,e);let i=0,o=0,r=0;for(let[l,d]of Et){let s=this.field.colorAt(t+l,e+d);i+=s[0],o+=s[1],r+=s[2]}return[i/16,o/16,r/16]}device(t){return this.ports[t]}motor(t){let e=this.motors[t];if(!e)throw new Error(`\u041D\u0430 \u043F\u043E\u0440\u0442\u0443 ${t} \u043D\u0435\u0442 \u043C\u043E\u0442\u043E\u0440\u0430 (\u0442\u0430\u043C: ${this.ports[t]||"\u043F\u0443\u0441\u0442\u043E"})`);return e}motorRun(t,e,i=1e3){let o=this.motor(t);this.releasePair(t),this.cancelJob(o),o.cmd=E(e,-o.max,o.max),o.accel=i,o.decel=i}motorStop(t,e="brake"){let i=this.motor(t);this.releasePair(t),this.cancelJob(i),i.cmd=0,i.decel=e==="coast"?1500:12e3}motorForDegrees(t,e,i,o=1e3,r=1e3){let l=this.motor(t);this.releasePair(t),this.cancelJob(l);let d=Math.sign(e||1)*Math.sign(i||1);return new Promise(s=>{l.job={target:l.pos+Math.abs(e)*d,vmax:Math.min(Math.abs(i),l.max),accel:o,decel:r,resolve:s}})}motorToRelative(t,e,i){let o=this.motor(t);return this.releasePair(t),this.cancelJob(o),new Promise(r=>{o.job={target:e+o.offset,vmax:Math.min(Math.abs(i),o.max),accel:1e3,decel:1e3,resolve:r}})}cancelJob(t){if(t.job){let e=t.job.resolve;t.job=null,e(3)}}releasePair(t){if(this.pairJob&&this.pairJob.ports.includes(t)){let e=this.pairJob.resolve;this.pairJob=null,e&&e(3)}}pairPorts(t){let e=this.pairs[t];if(!e)throw new Error("\u041F\u0430\u0440\u0430 \u043C\u043E\u0442\u043E\u0440\u043E\u0432 \u043D\u0435 \u043D\u0430\u0441\u0442\u0440\u043E\u0435\u043D\u0430: \u0441\u043D\u0430\u0447\u0430\u043B\u0430 motor_pair.pair(motor_pair.PAIR_1, port.A, port.B)");return e}static steer(t){return t=E(t,-100,100),t>=0?[1,1-t/50]:[1+t/50,1]}pairMove(t,e,i,o=1e3){let[r,l]=this.pairPorts(t);if(this.pairJob){let p=this.pairJob.resolve;this.pairJob=null,p&&p(3)}let d=this.motor(r),s=this.motor(l);this.cancelJob(d),this.cancelJob(s),d.cmd=E(-e,-d.max,d.max),s.cmd=E(i,-s.max,s.max),d.accel=s.accel=o,d.decel=s.decel=o}pairStop(t,e="brake"){let[i,o]=this.pairPorts(t);if(this.pairJob){let r=this.pairJob.resolve;this.pairJob=null,r&&r(3)}for(let r of[i,o]){let l=this.motor(r);this.cancelJob(l),l.cmd=0,l.decel=e==="coast"?1500:12e3}}pairForDegrees(t,e,i,o,r,l=1e3,d=1e3){let[s,p]=this.pairPorts(t);if(this.pairJob){let y=this.pairJob.resolve;this.pairJob=null,y&&y(3)}let f=this.motor(s),u=this.motor(p);this.cancelJob(f),this.cancelJob(u);let c=Math.max(Math.abs(i),Math.abs(o))||1,_=Math.sign(e||1)*Math.sign(r||1);return new Promise(y=>{this.pairJob={ports:[s,p],A:s,B:p,l:i/c*_,r:o/c*_,total:Math.abs(e),done:0,vp:0,vmax:Math.min(Math.abs(r),f.max),accel:l,decel:d,resolve:y}})}local2world(t,e){let i=this.pose;return{x:i.x-Math.sin(i.h)*t+Math.cos(i.h)*e,y:i.y+Math.cos(i.h)*t+Math.sin(i.h)*e}}sensorPoint(t){let e=this.model.sensors[t]||[this.body.front-10,0];return this.local2world(e[0],e[1])}needDevice(t,e){if(!String(this.ports[t]||"").startsWith(e))throw new Error(`\u041D\u0430 \u043F\u043E\u0440\u0442\u0443 ${t} \u043D\u0435\u0442 \u0443\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432\u0430 \xAB${e}\xBB (\u0442\u0430\u043C: ${this.ports[t]||"\u043F\u0443\u0441\u0442\u043E"})`)}reflection(t){this.needDevice(t,"color");let e=this.sensorPoint(t);return tt(this.spot(e.x,e.y))}color(t){this.needDevice(t,"color");let e=this.sensorPoint(t);return et(this.spot(e.x,e.y))}rgbi(t){this.needDevice(t,"color");let e=this.sensorPoint(t),i=this.spot(e.x,e.y);return[...i.map(o=>Math.round(o*4)),Math.round((i[0]+i[1]+i[2])*4/3)]}distance(t){this.needDevice(t,"distance");let e=this.local2world(this.body.front,0),i=-Math.sin(this.pose.h),o=Math.cos(this.pose.h),r=1/0;i>1e-6&&(r=Math.min(r,(2362-e.x)/i)),i<-1e-6&&(r=Math.min(r,-e.x/i)),o>1e-6&&(r=Math.min(r,(1143-e.y)/o)),o<-1e-6&&(r=Math.min(r,-e.y/o));for(let l of[this.box,this.lever&&{x:this.lever.x,y:this.lever.y,r:40},...this.objects.filter(d=>!d.carried)]){if(!l)continue;let d=e.x-l.x,s=e.y-l.y,p=d*i+s*o,f=d*d+s*s-l.r*l.r,u=p*p-f;if(u>=0){let c=-p-Math.sqrt(u);c>0&&(r=Math.min(r,c))}}return this.field&&(r=Math.min(r,this.field.raycast(e.x,e.y,i,o))),r>2e3?-1:Math.round(r)}forcePressed(t){return this.needDevice(t,"force"),this.frontContact()<3}force(t){return this.needDevice(t,"force"),this.frontContact()<3?60:0}frontContact(){let t=1/0;for(let e of[-this.body.half+10,0,this.body.half-10]){let i=this.local2world(this.body.front,e);t=Math.min(t,i.x,i.y,2362-i.x,1143-i.y),this.box&&(t=Math.min(t,Math.hypot(i.x-this.box.x,i.y-this.box.y)-this.box.r));for(let o of this.objects)o.carried||(t=Math.min(t,Math.hypot(i.x-o.x,i.y-o.y)-o.r));this.field&&(t=Math.min(t,this.field.raycast(this.local2world(this.body.front-5,e).x,this.local2world(this.body.front-5,e).y,-Math.sin(this.pose.h),Math.cos(this.pose.h))-5))}return t}yawDeci(){let t=(this.pose.h-this.yawOffset)*180/Math.PI;return t=((t+180)%360+360)%360-180,Math.round(t*10)}resetYaw(t){this.yawOffset=this.pose.h-t/10*Math.PI/180}step(t=U){if(this.t+=t,this.field&&!this.matchOver&&this.t>=(this.preset.matchTime||150)){this.matchOver=!0;for(let i of Object.values(this.motors))this.cancelJob(i),i.cmd=0,i.decel=12e3;if(this.pairJob){let i=this.pairJob.resolve;this.pairJob=null,i&&i(3)}this.events.push({toast:"\u0412\u0440\u0435\u043C\u044F \u043C\u0430\u0442\u0447\u0430 \u0432\u044B\u0448\u043B\u043E"})}let e=this.pairJob;if(e){let i=e.total-e.done,o=pt(i,e.vmax,e.decel);e.vp=rt(e.vp,o,e.accel,e.decel,t),e.done+=e.vp*t;let r=this.motors[e.A],l=this.motors[e.B];r.vel=-e.vp*e.l,l.vel=e.vp*e.r,r.cmd=r.vel,l.cmd=l.vel,r.pos+=r.vel*t,l.pos+=l.vel*t,e.total-e.done<.5&&Math.abs(e.vp)<60&&(r.vel=l.vel=r.cmd=l.cmd=0,this.pairJob=null,e.resolve(0))}for(let[i,o]of Object.entries(this.motors))if(!(e&&e.ports.includes(i))){if(o.job){let r=o.job,l=r.target-o.pos;o.vel=rt(o.vel,pt(l,r.vmax,r.decel),r.accel,r.decel,t),Math.abs(l)<.5&&Math.abs(o.vel)<60&&(o.pos=r.target,o.vel=0,o.cmd=0,o.job=null,r.resolve(0))}else o.vel=rt(o.vel,o.cmd,o.accel,o.decel,t);o.pos+=o.vel*t}if(this.kinematics(t),this.trailT+=t,this.trailT>.05&&(this.trailT=0,this.trail.push([Math.round(this.pose.x),Math.round(this.pose.y)]),this.trail.length>3e3&&this.trail.shift()),this.preset.trackLine){let i=this.sensorPoint(this.preset.trackLine),o=V(i.x,i.y,Q);this.t>.3&&(this.maxLineDist=Math.max(this.maxLineDist,o))}}kinematics(t){let e=this.pose,i=0,o=0,[r,l]=this.model.drive,d=this.motors[r],s=this.motors[l];d&&(i=-d.vel*this.mmPerDeg*(1-this.drift/2)),s&&(o=s.vel*this.mmPerDeg*(1+this.drift/2));let p=(i+o)/2,f=(o-i)/this.model.track;this.speedMm=p;let u={...e};e.h+=f*t,e.x+=-Math.sin(e.h)*p*t,e.y+=Math.cos(e.h)*p*t;let c=[[this.body.front,-this.body.half],[this.body.front,this.body.half],[-this.body.back,-this.body.half],[-this.body.back,this.body.half]].map(([b,v])=>this.local2world(b,v)),_=0,y=0;for(let b of c)b.x<0&&(_=Math.max(_,-b.x)),b.x>2362&&(_=Math.min(_,2362-b.x)),b.y<0&&(y=Math.max(y,-b.y)),b.y>1143&&(y=Math.min(y,1143-b.y));if(_||y){e.x+=_,e.y+=y;let b=-Math.sin(e.h),v=Math.cos(e.h),m=Math.abs(y)>=Math.abs(_)?[0,Math.sign(y)]:[Math.sign(_),0],P=b*m[0]+v*m[1];if(Math.abs(p)>1&&Math.abs(P)>.6){let I=Math.atan2(m[0]*Math.sign(p),-m[1]*Math.sign(p))-e.h;for(;I>Math.PI;)I-=2*Math.PI;for(;I<-Math.PI;)I+=2*Math.PI;e.h+=E(I,-1,1)*Math.min(1,t*15)}}if(this.field){this.field.collide(this,this.body),this.field.update(this,this.body,t);for(let b of this.field.events.splice(0))this.events.push({toast:b})}this.box&&this.pushBox(u),this.objects.length&&this.updateObjects();let x=Object.keys(this.model.tools)[0];if(this.lever&&x&&this.motors[x]){let b=this.motors[x].pos,v=110*Math.sin(E(b,0,180)*Math.PI/180),m=this.local2world(this.body.front+v,0),P=Math.hypot(m.x-this.lever.x,m.y-this.lever.y);this.lever.up&&P<70&&b>60&&(this.lever.up=!1,this.lever.flips++,this.events.push("lever"))}}readings(){let t={};for(let e of z){let i=String(this.ports[e]||"");try{if(i==="color"){let o=this.sensorPoint(e),r=this.spot(o.x,o.y);t[e]={color:et(r),refl:tt(r)}}else i==="distance"?t[e]={dist:this.distance(e)}:i==="force"?t[e]={force:this.force(e)}:this.motors[e]&&(t[e]={pos:Math.round(this.motors[e].pos),vel:Math.round(this.motors[e].vel)})}catch{}}return t}toolTip(t){let e=this.model.tools[t],i=this.motors[t],o=E(i?i.pos:0,0,180),r=e.reach*Math.sin(o*Math.PI/180);return{...this.local2world(this.body.front+Math.max(8,r),e.off),a:o}}updateObjects(){var t;for(let e of this.objects)if(!e.carried)if(e.fixed){let i={x:this.pose.x,y:this.pose.y},o={x:e.x,y:e.y,r:e.r};this.pushCircle(o)&&(this.pose.x-=o.x-e.x,this.pose.y-=o.y-e.y,e.touched||(e.touched=!0,this.events.push({toast:"\u0420\u043E\u0431\u043E\u0442 \u0437\u0430\u0434\u0435\u043B \u043C\u0435\u0442\u043A\u0443!"})))}else this.pushCircle(e)&&(e.moved=!0);for(let[e,i]of Object.entries(this.model.tools)){if(!this.motors[e])continue;let r=(t=this.toolState)[e]||(t[e]={down:!1}),l=this.toolTip(e);if(i.kind==="dozer"){if(l.a<60)continue;for(let s of this.objects){if(s.fixed||s.carried)continue;let p=s.x-this.pose.x,f=s.y-this.pose.y,u=p*-Math.sin(this.pose.h)+f*Math.cos(this.pose.h),c=p*Math.cos(this.pose.h)+f*Math.sin(this.pose.h),_=this.body.front+i.reach;if(u>this.body.front-5&&u<_+s.r&&Math.abs(c)<this.body.half){let y=this.local2world(_+s.r,c);s.x=y.x,s.y=y.y,s.moved=!0}}continue}if(!r.down&&l.a>=60){r.down=!0;let s=this.objects.find(p=>p.carried===e);if(s)s.carried=null,s.lifted=!1,s.x=l.x,s.y=l.y,this.events.push({toast:"\u041F\u0440\u0435\u0434\u043C\u0435\u0442 \u043E\u0442\u043F\u0443\u0449\u0435\u043D"});else{let p=this.objects.filter(f=>!f.fixed&&!f.carried).sort((f,u)=>Math.hypot(f.x-l.x,f.y-l.y)-Math.hypot(u.x-l.x,u.y-l.y))[0];p&&Math.hypot(p.x-l.x,p.y-l.y)<p.r+30&&(p.carried=e,this.events.push({toast:"\u041F\u0440\u0435\u0434\u043C\u0435\u0442 \u0437\u0430\u0445\u0432\u0430\u0447\u0435\u043D"}))}}else if(r.down&&l.a<=30){r.down=!1;let s=this.objects.find(p=>p.carried===e);s&&(s.lifted=!0)}let d=this.objects.find(s=>s.carried===e);if(d){let s=this.local2world(this.body.front+d.r+4,i.off);d.x=s.x,d.y=s.y}}for(let e of this.objects)e.x=E(e.x,e.r,2362-e.r),e.y=E(e.y,e.r,1143-e.r)}pushCircle(t){let e=this.pose,i=t.x-e.x,o=t.y-e.y,r=i*-Math.sin(e.h)+o*Math.cos(e.h),l=i*Math.cos(e.h)+o*Math.sin(e.h),d=E(r,-this.body.back,this.body.front),s=E(l,-this.body.half,this.body.half),p=r-d,f=l-s,u=Math.hypot(p,f);if(u>=t.r)return!1;let c,_;u<1e-6?(c=r>=0?this.body.front+t.r:-this.body.back-t.r,_=l):(c=d+p/u*t.r,_=s+f/u*t.r);let y=this.local2world(c,_);return t.x=y.x,t.y=y.y,!0}pushBox(){let t=this.box,e=this.pose,i=t.x-e.x,o=t.y-e.y,r=i*-Math.sin(e.h)+o*Math.cos(e.h),l=i*Math.cos(e.h)+o*Math.sin(e.h),d=E(r,-this.body.back,this.body.front),s=E(l,-this.body.half,this.body.half),p=r-d,f=l-s,u=Math.hypot(p,f);if(u>=t.r)return;let c,_;u<1e-6?(c=r>=0?this.body.front+t.r:-this.body.back-t.r,_=l):(c=d+p/u*t.r,_=s+f/u*t.r);let y=this.local2world(c,_);t.x=E(y.x,t.r,2362-t.r),t.y=E(y.y,t.r,1143-t.r)}boxInZone(t){return!!this.box&&this.box.x>=t.x0&&this.box.x<=t.x1&&this.box.y>=t.y0&&this.box.y<=t.y1}get heading(){return this.yawDeciWorld()/10}yawDeciWorld(){let t=this.pose.h*180/Math.PI;return Math.round((((t+180)%360+360)%360-180)*10)}snapshot(){let t={};for(let[e,i]of Object.entries(this.motors))t[e]=Math.round(i.pos);return{t:this.t,pose:{x:this.pose.x,y:this.pose.y,h:this.pose.h},motors:t,matrix:this.matrix,box:this.box&&{x:this.box.x,y:this.box.y},lever:this.lever&&{up:this.lever.up,flips:this.lever.flips},sensors:Object.fromEntries(z.filter(e=>String(this.ports[e])==="color").map(e=>[e,this.sensorPoint(e)])),maxLineDist:this.maxLineDist,yaw:this.yawDeci(),field:this.field?this.field.snapshot():null,objects:this.objects.map(e=>({id:e.id,kind:e.kind,x:e.x,y:e.y,r:e.r,touched:e.touched,carried:e.carried,lifted:e.lifted})),model:this.model.name,front:this.local2world(this.body.front,0),readings:this.readings()}}};var mt=`
import _sim
import asyncio
import io
import math
import random
import sys
import runloop
import motor
import motor_pair
import color_sensor
import distance_sensor
import force_sensor
import color
from hub import port, motion_sensor, light_matrix, sound, button, light

PAIR = motor_pair.PAIR_1
move_speed = 50
cm_per_rotation = 17.5
_pair_ports = (port.A, port.B)
_paired = False
_move_stop = motor.BRAKE
_move_accel = None
_motor_speed = {}
_motor_stop = {}
_motor_accel = {}
_UNIT_CM = {"cm": 1.0, "in": 2.54}
_ACCEL = {"slow": 1000, "medium": 3000, "fast": 10000}
_STOP = {"brake": motor.BRAKE, "hold": motor.HOLD, "coast": motor.COAST}


class StopStack(Exception):
    pass


def _ports(p):
    if isinstance(p, (tuple, list)):
        return tuple(p)
    return (p,)


def _clamp(v, lo, hi):
    return lo if v < lo else hi if v > hi else v


def max_speed(p):
    return motor.info(p)[1]


def _velocity(pct, ports):
    mx = min(max_speed(p) for p in ports)
    return int(_clamp(float(pct), -100, 100) * mx / 100)


def _kw(stop, accel):
    kw = {"stop": stop}
    if accel:
        kw["acceleration"] = accel
        kw["deceleration"] = accel
    return kw


# ---------- Movement ----------

def _ensure_pair():
    global _paired
    if not _paired:
        motor_pair.pair(PAIR, _pair_ports[0], _pair_ports[1])
        _paired = True


def set_move_motors(left, right):
    global _pair_ports, _paired
    _pair_ports = (left, right)
    if _paired:
        motor_pair.unpair(PAIR)
    _paired = False
    _ensure_pair()


def set_move_speed(pct):
    global move_speed
    move_speed = _clamp(float(pct), -100, 100)


def set_rotation_distance(value, unit="cm"):
    global cm_per_rotation
    cm_per_rotation = float(value) * _UNIT_CM.get(unit, 1.0)


def set_move_stop(mode):
    global _move_stop
    _move_stop = _STOP.get(mode, motor.BRAKE)


def set_move_acceleration(mode):
    global _move_accel
    _move_accel = _ACCEL.get(mode, 3000)


def to_degrees(value, unit):
    value = float(value)
    if unit == "rotations":
        return value * 360
    if unit in _UNIT_CM:
        return value * _UNIT_CM[unit] / cm_per_rotation * 360
    return value


async def steer(steering, value, unit="cm", direction=1):
    _ensure_pair()
    steering = int(_clamp(float(steering), -100, 100))
    v = _velocity(move_speed, _pair_ports)
    value = float(value)
    if unit == "seconds":
        if value <= 0:
            return
        await motor_pair.move_for_time(PAIR, int(value * 1000), steering, velocity=v * direction, **_kw(_move_stop, _move_accel))
    else:
        deg = int(to_degrees(value, unit)) * direction
        if deg == 0:
            return
        await motor_pair.move_for_degrees(PAIR, deg, steering, velocity=v, **_kw(_move_stop, _move_accel))


async def move(direction, value, unit="cm"):
    await steer(0, value, unit, -1 if direction == "back" else 1)


def start_steer(steering):
    _ensure_pair()
    kw = {"acceleration": _move_accel} if _move_accel else {}
    motor_pair.move(PAIR, int(_clamp(float(steering), -100, 100)), velocity=_velocity(move_speed, _pair_ports), **kw)


def start_move(direction):
    _ensure_pair()
    v = _velocity(move_speed, _pair_ports)
    kw = {"acceleration": _move_accel} if _move_accel else {}
    motor_pair.move(PAIR, 0, velocity=-v if direction == "back" else v, **kw)


def start_tank(left, right):
    _ensure_pair()
    kw = {"acceleration": _move_accel} if _move_accel else {}
    motor_pair.move_tank(PAIR, _velocity(left, _pair_ports), _velocity(right, _pair_ports), **kw)


def stop_move():
    _ensure_pair()
    motor_pair.stop(PAIR, stop=_move_stop)


async def turn_gyro(angle, max_speed=400):
    _ensure_pair()
    angle = float(angle)
    motion_sensor.reset_yaw(0)
    await runloop.sleep_ms(50)
    while abs(angle - yaw()) > 1:
        error = angle - yaw()
        sp = int(min(max_speed, max(80, abs(error) * 6)))
        if error > 0:
            motor_pair.move_tank(PAIR, sp, -sp)
        else:
            motor_pair.move_tank(PAIR, -sp, sp)
        await runloop.sleep_ms(10)
    motor_pair.stop(PAIR)


# ---------- Motors ----------

def _mvel(p, pct=None):
    return _velocity(_motor_speed.get(p, 75) if pct is None else pct, (p,))


def _mkw(p):
    return _kw(_motor_stop.get(p, motor.BRAKE), _motor_accel.get(p))


async def _all(tasks):
    for t in tasks:
        await t


async def motor_run_for(ports, direction, value, unit="rotations", speed=None):
    value = float(value)
    sign = -1 if direction == "counterclockwise" else 1
    if value < 0:
        sign, value = -sign, -value
    tasks = []
    for p in _ports(ports):
        v = _mvel(p, speed) * sign
        if unit == "seconds":
            tasks.append(motor.run_for_time(p, int(value * 1000), v, **_mkw(p)))
        else:
            tasks.append(motor.run_for_degrees(p, int(to_degrees(value, unit)), v, **_mkw(p)))
    await _all(tasks)


async def motor_go_to(ports, direction, position):
    position = int(float(position)) % 360
    tasks = []
    for p in _ports(ports):
        v = _mvel(p)
        if direction == "shortest":
            tasks.append(motor.run_to_absolute_position(p, position, v, **_mkw(p)))
        else:
            cur = motor.absolute_position(p) % 360
            d = (position - cur) % 360 if direction == "clockwise" else -((cur - position) % 360)
            if d:
                tasks.append(motor.run_for_degrees(p, d, v, **_mkw(p)))
    await _all(tasks)


def motor_start(ports, direction="clockwise", speed=None):
    for p in _ports(ports):
        v = _mvel(p, speed)
        motor.run(p, -v if direction == "counterclockwise" else v)


def motor_stop(ports):
    for p in _ports(ports):
        motor.stop(p, stop=_motor_stop.get(p, motor.BRAKE))


def motor_set_speed(ports, pct):
    for p in _ports(ports):
        _motor_speed[p] = _clamp(float(pct), -100, 100)


def motor_position(p):
    a = motor.absolute_position(p)
    return a + 360 if a < 0 else a


def motor_speed(p):
    return int(motor.velocity(p) * 100 / max_speed(p))


def motor_start_power(ports, pct):
    for p in _ports(ports):
        motor.set_duty_cycle(p, int(_clamp(float(pct), -100, 100) * 100))


def motor_power(p):
    return int(motor.get_duty_cycle(p) / 100)


def motor_set_stop(ports, mode):
    for p in _ports(ports):
        _motor_stop[p] = _STOP.get(mode, motor.BRAKE)


def motor_set_acceleration(ports, mode):
    for p in _ports(ports):
        _motor_accel[p] = _ACCEL.get(mode, 3000)


def motor_set_relative(ports, value):
    for p in _ports(ports):
        motor.reset_relative_position(p, int(float(value)))


async def motor_go_relative(ports, position, speed=75):
    await _all([motor.run_to_relative_position(p, int(float(position)), _mvel(p, speed), **_mkw(p)) for p in _ports(ports)])


# ---------- Light ----------

_img = [0] * 25
_bright = 100
_orient = 0


def _rot(px, k):
    for _ in range(k % 4):
        px = [px[(4 - c) * 5 + r] for r in range(5) for c in range(5)]
    return px


def _draw():
    light_matrix.show([int(v * _bright / 100) for v in _rot(_img, _orient)])


def show_image(pattern):
    global _img
    s = str(pattern)
    _img = [int(s[i]) * 100 // 9 if i < len(s) and s[i].isdigit() else 0 for i in range(25)]
    _draw()


async def show_image_for(pattern, seconds):
    show_image(pattern)
    await runloop.sleep_ms(int(float(seconds) * 1000))
    clear()


async def write(text):
    global _img
    _img = [0] * 25
    await light_matrix.write(str(text), _bright)


def clear():
    global _img
    _img = [0] * 25
    light_matrix.clear()


def set_brightness(pct):
    global _bright
    _bright = int(_clamp(float(pct), 0, 100))
    if any(_img):
        _draw()


def set_pixel(x, y, pct):
    x, y = int(float(x)) - 1, int(float(y)) - 1
    if 0 <= x < 5 and 0 <= y < 5:
        _img[y * 5 + x] = int(_clamp(float(pct), 0, 100))
        _draw()


def rotate(direction):
    global _orient
    _orient = (_orient + (1 if direction == "clockwise" else -1)) % 4
    _draw()


def set_orientation(o):
    global _orient
    _orient = {"upright": 0, "right": 1, "upside_down": 2, "left": 3}.get(o, 0)
    _draw()


def power_light(c):
    light.color(light.POWER, c)


def distance_light(p, values):
    v = [int(_clamp(float(x), 0, 100)) for x in str(values).split()][:4]
    distance_sensor.show(p, v + [0] * (4 - len(v)))


# ---------- Sound ----------

volume = 100
_SOUNDS = {
    "Cat Meow 1": ((76, 120), (72, 220)), "Bonk": ((45, 80),), "Doorbell 1": ((76, 300), (72, 450)),
    "Hello": ((67, 150), (72, 250)), "Robot 1": ((60, 90), (64, 90), (67, 90), (72, 200)),
    "Triumph": ((60, 150), (64, 150), (67, 150), (72, 400)),
}


def _freq(note):
    return int(440 * 2 ** ((float(note) - 69) / 12))


async def beep_for(note, seconds):
    await sound.beep(_freq(note), int(float(seconds) * 1000), volume)


def start_beep(note):
    sound.beep(_freq(note), 1000, volume)


def stop_sound():
    sound.stop()


async def play_sound(name):
    for n, ms in _SOUNDS.get(name, ((60, 200),)):
        await sound.beep(_freq(n), ms, volume)


def start_sound(name):
    asyncio.create_task(play_sound(name))


def set_volume(v):
    global volume
    volume = int(_clamp(float(v), 0, 100))
    sound.volume(volume)


def change_volume(d):
    set_volume(volume + float(d))


# ---------- Sensors ----------

_t0 = _sim.now()


def timer():
    return (_sim.now() - _t0) / 1000


def reset_timer():
    global _t0
    _t0 = _sim.now()


def yaw():
    return -motion_sensor.tilt_angles()[0] / 10


def angle(axis):
    t = motion_sensor.tilt_angles()
    if axis == "yaw":
        return -t[0] / 10
    return t[1 if axis == "pitch" else 2] / 10


def reset_yaw():
    motion_sensor.reset_yaw(0)


def distance(p, unit="cm"):
    mm = distance_sensor.distance(p)
    if mm < 0:
        mm = 2000
    if unit == "%":
        return int(mm / 20)
    if unit == "in":
        return round(mm / 25.4, 1)
    return round(mm / 10, 1)


def is_distance(p, comparator, value, unit="cm"):
    mm = distance_sensor.distance(p)
    if mm < 0:
        return comparator == "farther"
    d = distance(p, unit)
    value = float(value)
    if comparator == "closer":
        return d < value
    if comparator == "farther":
        return d > value
    return abs(d - value) < (1 if unit == "%" else 0.5)


def force(p, unit="%"):
    f = force_sensor.force(p)
    return f / 10 if unit == "N" else f


def is_force(p, option):
    f = force_sensor.force(p)
    if option == "hard_pressed":
        return f > 50
    if option == "released":
        return f == 0
    return force_sensor.pressed(p)


def is_reflection(p, comparator, value):
    r = color_sensor.reflection(p)
    value = float(value)
    return r < value if comparator == "<" else r > value if comparator == ">" else r == value


def raw_color(p, channel):
    return color_sensor.rgbi(p)[{"red": 0, "green": 1, "blue": 2}.get(channel, 0)]


def button_pressed(b):
    return button.pressed(b) > 0


_FACES = {"top": 0, "front": 1, "right": 2, "bottom": 3, "back": 4, "left": 5}


def is_up(face):
    return motion_sensor.up_face() == _FACES.get(face, 0)


def orientation():
    f = motion_sensor.up_face()
    for k in _FACES:
        if _FACES[k] == f:
            return k
    return ""


def is_tilted(direction):
    t = motion_sensor.tilt_angles()
    pitch, roll = t[1] / 10, t[2] / 10
    if direction == "forward":
        return pitch < -15
    if direction == "backward":
        return pitch > 15
    if direction == "left":
        return roll < -15
    if direction == "right":
        return roll > 15
    return abs(pitch) > 15 or abs(roll) > 15


_GESTURES = {"tapped": 0, "double_tapped": 1, "shaken": 2, "falling": 3}


def is_gesture(g):
    return motion_sensor.gesture() == _GESTURES.get(g, -9)


def gesture():
    g = motion_sensor.gesture()
    for k in _GESTURES:
        if _GESTURES[k] == g:
            return k
    return ""


def acceleration(axis):
    return motion_sensor.acceleration()["xyz".find(axis)]


def angular_velocity(axis):
    return motion_sensor.angular_velocity()["xyz".find(axis)]


def set_yaw_face(face):
    f = getattr(motion_sensor, "set_yaw_face", None)
    if f:
        f(_FACES.get(face, 0))


# ---------- Operators and lists ----------

def num(v):
    if isinstance(v, (int, float)):
        return v
    try:
        f = float(v)
        return int(f) if f == int(f) and "." not in str(v) else f
    except Exception:
        return 0


def pick_random(a, b):
    a, b = num(a), num(b)
    if a > b:
        a, b = b, a
    if isinstance(a, float) or isinstance(b, float):
        return a + random.random() * (b - a)
    return random.randint(a, b)


def mathop(op, x):
    x = num(x)
    if op == "abs":
        return abs(x)
    if op == "floor":
        return math.floor(x)
    if op == "ceiling":
        return math.ceil(x)
    if op == "sqrt":
        return math.sqrt(x)
    if op in ("sin", "cos", "tan"):
        return round(getattr(math, op)(math.radians(x)), 10)
    if op in ("asin", "acos", "atan"):
        return math.degrees(getattr(math, op)(x))
    if op == "ln":
        return math.log(x)
    if op == "log":
        return math.log(x) / math.log(10)
    if op == "e ^":
        return math.exp(x)
    if op == "10 ^":
        return 10 ** x
    return x


def div(a, b):
    a, b = num(a), num(b)
    if b == 0:
        return math.inf if a > 0 else -math.inf if a < 0 else math.nan
    return a / b


def mod(a, b):
    a, b = num(a), num(b)
    return a % b if b else math.nan


def equals(a, b):
    try:
        return float(a) == float(b)
    except Exception:
        return str(a).lower() == str(b).lower()


def letter(i, s):
    s, i = str(s), int(num(i))
    return s[i - 1] if 1 <= i <= len(s) else ""


def contains(s, part):
    return str(part).lower() in str(s).lower()


def item(lst, i):
    i = int(num(i))
    return lst[i - 1] if 1 <= i <= len(lst) else ""


def delete_item(lst, i):
    i = int(num(i))
    if 1 <= i <= len(lst):
        lst.pop(i - 1)


def insert_item(lst, i, v):
    i = int(num(i))
    if 1 <= i <= len(lst) + 1:
        lst.insert(i - 1, v)


def replace_item(lst, i, v):
    i = int(num(i))
    if 1 <= i <= len(lst):
        lst[i - 1] = v


def index_of(lst, v):
    for i, x in enumerate(lst):
        if equals(x, v):
            return i + 1
    return 0


def list_contains(lst, v):
    return index_of(lst, v) > 0


# ---------- Stacks and events ----------

_hats = []
_tasks = []
_pollers = []
_running = {}
_state = {"exit": False, "error": None}


def when_program_starts(fn):
    _hats.append(("start", None, fn))
    return fn


def when(condition, initial=False):
    def deco(fn):
        _hats.append(("edge", (condition, initial), fn))
        return fn
    return deco


def when_button(b, event="pressed"):
    if event == "released":
        return when(lambda: button.pressed(b) == 0, True)
    return when(lambda: button.pressed(b) > 0)


def when_force(p, option="pressed"):
    if option == "changed":
        last = [None]

        def changed():
            f = force_sensor.force(p)
            ch = last[0] is not None and f != last[0]
            last[0] = f
            return ch
        return when(changed)
    return when(lambda: is_force(p, option), option == "released")


def when_receive(message):
    def deco(fn):
        _hats.append(("msg", str(message), fn))
        return fn
    return deco


def _shutdown(cur=None):
    _state["exit"] = True
    for t in _tasks + _pollers:
        if t is not cur and not t.done():
            t.cancel()


async def _guard(fn):
    try:
        await fn()
    except StopStack:
        pass
    except SystemExit:
        _shutdown(asyncio.current_task())
    except asyncio.CancelledError:
        pass
    except Exception as e:
        buf = io.StringIO()
        sys.print_exception(e, buf)
        if _state["error"] is None:
            _state["error"] = buf.getvalue()
        _shutdown(asyncio.current_task())


def _spawn(fn):
    t = asyncio.create_task(_guard(fn))
    _tasks.append(t)
    _running[fn] = t
    return t


async def _poll(condition, initial, fn):
    prev = initial
    while not _state["exit"]:
        try:
            v = bool(condition())
        except Exception as e:
            buf = io.StringIO()
            sys.print_exception(e, buf)
            if _state["error"] is None:
                _state["error"] = buf.getvalue()
            _shutdown(asyncio.current_task())
            return
        if v and not prev:
            t = _running.get(fn)
            if t is None or t.done():
                _spawn(fn)
        prev = v
        await runloop.sleep_ms(10)


def _start_receivers(message):
    started = []
    for kind, arg, fn in _hats:
        if kind == "msg" and arg == str(message):
            t = _running.get(fn)
            if t is not None and not t.done():
                t.cancel()
            started.append(_spawn(fn))
    return started


def broadcast(message):
    _start_receivers(message)


async def broadcast_wait(message):
    started = _start_receivers(message)
    while not _state["exit"] and any(not t.done() for t in started):
        await runloop.sleep_ms(10)


def stop_other_stacks():
    cur = asyncio.current_task()
    for t in _tasks:
        if t is not cur and not t.done():
            t.cancel()


async def main():
    for kind, arg, fn in _hats:
        if kind == "start":
            _spawn(fn)
        elif kind == "edge":
            _pollers.append(asyncio.create_task(_poll(arg[0], arg[1], fn)))
    while not _state["exit"]:
        if not _pollers and all(t.done() for t in _tasks):
            break
        await runloop.sleep_ms(20)
    _shutdown()
    if _state["error"]:
        _sim.fail(_state["error"])
`;var ut={"wb.py":mt,"hub.py":`
import _sim

class _Port:
    A = 0
    B = 1
    C = 2
    D = 3
    E = 4
    F = 5

port = _Port()


class _Motion:
    TOP = 0
    FRONT = 1
    RIGHT = 2
    BOTTOM = 3
    BACK = 4
    LEFT = 5
    TAPPED = 0
    DOUBLE_TAPPED = 1
    SHAKEN = 2
    FALLING = 3
    UNKNOWN = -1

    def tilt_angles(self):
        t = _sim.tilt()
        return (int(t[0]), int(t[1]), int(t[2]))

    def reset_yaw(self, angle):
        _sim.reset_yaw(int(angle))

    def angular_velocity(self, raw=False):
        t = _sim.gyro()
        return (int(t[0]), int(t[1]), int(t[2]))

    def acceleration(self, raw=False):
        return (0, 0, 1000)

    def up_face(self):
        return 0

    def stable(self):
        return True

    def gesture(self):
        return -1

    def tap_count(self):
        return 0


motion_sensor = _Motion()


class _Matrix:
    IMAGE_HEART = 1
    IMAGE_HEART_SMALL = 2
    IMAGE_HAPPY = 3
    IMAGE_SMILE = 4
    IMAGE_SAD = 5
    IMAGE_CONFUSED = 6
    IMAGE_ANGRY = 7
    IMAGE_ASLEEP = 8
    IMAGE_SURPRISED = 9
    IMAGE_SILLY = 10
    IMAGE_FABULOUS = 11
    IMAGE_MEH = 12
    IMAGE_YES = 13
    IMAGE_NO = 14
    IMAGE_ARROW_N = 29
    IMAGE_ARROW_E = 31
    IMAGE_ARROW_S = 33
    IMAGE_ARROW_W = 35
    IMAGE_SQUARE = 43
    IMAGE_TARGET = 46

    def write(self, text, intensity=100, time_per_character=500):
        return _sim.matrix_write(str(text), int(intensity), int(time_per_character))

    def show_image(self, image):
        _sim.matrix_image(int(image))

    def clear(self):
        _sim.matrix_clear()

    def set_pixel(self, x, y, intensity=100):
        _sim.matrix_pixel(int(x), int(y), int(intensity))

    def get_pixel(self, x, y):
        return int(_sim.matrix_get(int(x), int(y)))

    def show(self, pixels):
        _sim.matrix_show([int(p) for p in pixels])

    def set_orientation(self, top):
        return 0

    def get_orientation(self):
        return 0


light_matrix = _Matrix()


class _Button:
    LEFT = 1
    RIGHT = 2

    def pressed(self, button):
        return int(_sim.button(int(button)))


button = _Button()


class _Sound:
    ANY = -2
    DEFAULT = -1
    WAVEFORM_SINE = 1

    def beep(self, freq=440, duration=500, volume=100, **kwargs):
        return _sim.beep(int(freq), int(duration), int(volume))

    def stop(self):
        pass

    def volume(self, volume):
        pass


sound = _Sound()


class _Light:
    POWER = 0
    CONNECT = 1

    def color(self, light, color):
        pass


light = _Light()


def temperature():
    return 250


def device_uuid():
    return "USTEM-SIM"


def hardware_id():
    return "SIM"


def power_off():
    pass
`,"motor.py":`
import _sim

READY = 0
RUNNING = 1
STALLED = 2
CANCELLED = 3
ERROR = 4
DISCONNECTED = 5
COAST = 0
BRAKE = 1
HOLD = 2
CONTINUE = 3
SMART_COAST = 4
SMART_BRAKE = 5
CLOCKWISE = 0
COUNTERCLOCKWISE = 1
SHORTEST_PATH = 2
LONGEST_PATH = 3


def run(port, velocity, *, acceleration=1000):
    _sim.m_run(port, velocity, acceleration)


def stop(port, *, stop=BRAKE):
    _sim.m_stop(port, stop)


def run_for_degrees(port, degrees, velocity, *, stop=BRAKE, acceleration=1000, deceleration=1000):
    return _sim.m_deg(port, degrees, velocity, acceleration, deceleration)


def run_for_time(port, duration, velocity, *, stop=BRAKE, acceleration=1000, deceleration=1000):
    return _sim.m_time(port, duration, velocity, acceleration)


def run_to_relative_position(port, position, velocity, *, stop=BRAKE, acceleration=1000, deceleration=1000):
    return _sim.m_rel(port, position, velocity)


def run_to_absolute_position(port, position, velocity, *, direction=SHORTEST_PATH, stop=BRAKE, acceleration=1000, deceleration=1000):
    return _sim.m_abs(port, position, velocity)


def relative_position(port):
    return int(_sim.m_relpos(port))


def reset_relative_position(port, position):
    _sim.m_reset(port, position)


def absolute_position(port):
    return int(_sim.m_abspos(port))


def velocity(port):
    return int(_sim.m_vel(port))


def set_duty_cycle(port, pwm):
    _sim.m_run(port, int(pwm * 1050 / 10000), 10000)


def get_duty_cycle(port):
    return 0


def info(port):
    return tuple(_sim.m_info(port))
`,"motor_pair.py":`
import _sim

PAIR_1 = 0
PAIR_2 = 1
PAIR_3 = 2


def pair(pair, left_motor, right_motor):
    _sim.p_pair(pair, left_motor, right_motor)


def unpair(pair):
    _sim.p_unpair(pair)


def move(pair, steering, *, velocity=360, acceleration=1000):
    _sim.p_move(pair, steering, velocity, acceleration)


def move_tank(pair, left_velocity, right_velocity, *, acceleration=1000):
    _sim.p_tank(pair, left_velocity, right_velocity, acceleration)


def stop(pair, *, stop=1):
    _sim.p_stop(pair, stop)


def move_for_degrees(pair, degrees, steering, *, velocity=360, stop=1, acceleration=1000, deceleration=1000):
    return _sim.p_deg(pair, degrees, steering, velocity, acceleration, deceleration)


def move_tank_for_degrees(pair, degrees, left_velocity, right_velocity, *, stop=1, acceleration=1000, deceleration=1000):
    return _sim.p_tank_deg(pair, degrees, left_velocity, right_velocity, acceleration, deceleration)


def move_for_time(pair, duration, steering, *, velocity=360, stop=1, acceleration=1000, deceleration=1000):
    return _sim.p_time(pair, duration, steering, velocity, acceleration)


def move_tank_for_time(pair, left_velocity, right_velocity, duration, *, stop=1, acceleration=1000, deceleration=1000):
    return _sim.p_tank_time(pair, duration, left_velocity, right_velocity, acceleration)
`,"color_sensor.py":`
import _sim


def reflection(port):
    return int(_sim.reflection(port))


def color(port):
    return int(_sim.color(port))


def rgbi(port):
    t = _sim.rgbi(port)
    return (int(t[0]), int(t[1]), int(t[2]), int(t[3]))
`,"distance_sensor.py":`
import _sim


def distance(port):
    return int(_sim.distance(port))


def show(port, pixels):
    pass


def clear(port):
    pass


def get_pixel(port, x, y):
    return 0


def set_pixel(port, x, y, intensity):
    pass
`,"force_sensor.py":`
import _sim


def force(port):
    return int(_sim.force(port))


def pressed(port):
    return bool(_sim.pressed(port))


def raw(port):
    return int(_sim.force(port)) * 10
`,"color.py":`
BLACK = 0
MAGENTA = 1
PURPLE = 2
BLUE = 3
AZURE = 4
TURQUOISE = 5
GREEN = 6
YELLOW = 7
ORANGE = 8
RED = 9
WHITE = 10
UNKNOWN = -1
`,"runloop.py":`
import _sim

_tasks = []


def run(*functions):
    for f in functions:
        _tasks.append(f)


def sleep_ms(duration):
    return _sim.sleep(int(duration))


async def until(function, timeout=0):
    t0 = _sim.now()
    while not function():
        if timeout and _sim.now() - t0 >= timeout:
            return False
        await _sim.tick()
    return True
`};var Pt=["A","B","C","D","E","F"],_t={1:"0101011111111110111000100",2:"0000001010011100010000000",3:"0000001010000001000101110",4:"0000001010000000111000000",5:"0000001010000000111010001",13:"0000000001000101010001000",14:"1000101010001000101010001",43:"1111110001100011000111111"};async function yt({code:n,preset:t,speed:e=1,loadMicroPython:i,wasmUrl:o,post:r,onSim:l,now:d=()=>performance.now()}){let s=new G(t);s.field&&await s.field.load(t.matUrl||String(o||"").replace(/micropython\.wasm$/,"bioglow/mat.jpg")),l&&l(s);let p=!1,f=d(),u=[],c=0,_=()=>(d()-f)/1e3*e,y=(a={})=>r({type:"state",state:s.snapshot(),...a});function x(){if(p)return;let a=_(),h=0;for(;s.t+U<=a&&h<6e3;){s.step(U),h++;for(let g=u.length-1;g>=0;g--)u[g].t<=s.t&&u.splice(g,1)[0].resolve(0)}h>=6e3&&(f=d()-s.t*1e3/e),d()-c>33&&(c=d(),y());for(let g of s.events.splice(0))r({type:"event",event:g})}let b=a=>{let h=Pt[a];if(h===void 0)throw new Error("\u041D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043D\u044B\u0439 \u043F\u043E\u0440\u0442: "+a);return h},v=a=>new Promise(h=>u.push({t:s.t+Math.max(0,a)/1e3,resolve:h})),m=a=>(...h)=>{if(x(),s.matchOver)throw new Error("SystemExit: \u0432\u0440\u0435\u043C\u044F \u043C\u0430\u0442\u0447\u0430 2:30 \u0432\u044B\u0448\u043B\u043E");return a(...h)},P=a=>a===0||a===4?"coast":"brake",D=a=>G.steer(a),I={now:()=>(x(),Math.round(s.t*1e3)),sleep:m(a=>v(a)),tick:m(()=>v(U*1e3)),m_run:m((a,h,g)=>s.motorRun(b(a),h,g)),m_stop:m((a,h)=>s.motorStop(b(a),P(h))),m_deg:m((a,h,g,M,A)=>s.motorForDegrees(b(a),h,g,M,A)),m_time:m((a,h,g,M)=>(s.motorRun(b(a),g,M),v(h).then(()=>(s.motorStop(b(a)),0)))),m_rel:m((a,h,g)=>s.motorToRelative(b(a),h,g)),m_abs:m((a,h,g)=>{let A=(s.motor(b(a)).pos%360+360)%360,S=h-A;return S>180&&(S-=360),S<-180&&(S+=360),s.motorForDegrees(b(a),S,Math.abs(g))}),m_relpos:m(a=>Math.round(s.motor(b(a)).pos-s.motor(b(a)).offset)),m_reset:m((a,h)=>{let g=s.motor(b(a));g.offset=g.pos-h}),m_abspos:m(a=>(Math.round(s.motor(b(a)).pos)%360+540)%360-180),m_vel:m(a=>Math.round(s.motor(b(a)).vel)),m_info:m(a=>{let h=s.motor(b(a));return[{large:49,medium:48,small:65}[h.kind]||49,h.max]}),p_pair:m((a,h,g)=>{s.pairs[a]=[b(h),b(g)],s.motor(b(h)),s.motor(b(g))}),p_unpair:m(a=>{delete s.pairs[a]}),p_move:m((a,h,g,M)=>{let[A,S]=D(h);s.pairMove(a,g*A,g*S,M)}),p_tank:m((a,h,g,M)=>s.pairMove(a,h,g,M)),p_stop:m((a,h)=>s.pairStop(a,P(h))),p_deg:m((a,h,g,M,A,S)=>{let[N,gt]=D(g);return s.pairForDegrees(a,h,N,gt,M,A,S)}),p_tank_deg:m((a,h,g,M,A,S)=>{let N=Math.max(Math.abs(g),Math.abs(M))||1;return s.pairForDegrees(a,h,g/N,M/N,N,A,S)}),p_time:m((a,h,g,M,A)=>{let[S,N]=D(g);return s.pairMove(a,M*S,M*N,A),v(h).then(()=>(s.pairStop(a),0))}),p_tank_time:m((a,h,g,M,A)=>(s.pairMove(a,g,M,A),v(h).then(()=>(s.pairStop(a),0)))),reflection:m(a=>s.reflection(b(a))),color:m(a=>s.color(b(a))),rgbi:m(a=>s.rgbi(b(a))),distance:m(a=>s.distance(b(a))),force:m(a=>s.force(b(a))),pressed:m(a=>s.forcePressed(b(a))),tilt:m(()=>[s.yawDeci(),0,0]),gyro:m(()=>[0,0,0]),reset_yaw:m(a=>s.resetYaw(a)),button:m(a=>a===1?s.buttons.left?100:0:a===2&&s.buttons.right?100:0),matrix_write:m((a,h,g)=>(s.matrix={text:a,image:null,pixels:null},y(),v(Math.max(1,a.length)*g))),matrix_image:m(a=>{s.matrix={text:"",image:a,pixels:_t[a]?[..._t[a]].map(h=>h==="1"?100:0):null}}),matrix_clear:m(()=>{s.matrix={text:"",image:null,pixels:null}}),matrix_pixel:m((a,h,g)=>{let M=s.matrix.pixels?[...s.matrix.pixels]:new Array(25).fill(0);a>=0&&a<5&&h>=0&&h<5&&(M[h*5+a]=g),s.matrix={text:"",image:null,pixels:M}}),matrix_get:m((a,h)=>s.matrix.pixels&&s.matrix.pixels[h*5+a]||0),matrix_show:m(a=>{s.matrix={text:"",image:null,pixels:Array.from(a).slice(0,25)}}),fail:a=>{w=String(a)},beep:m((a,h,g)=>(s.beeps.push(a),r({type:"beep",freq:a,ms:h/e,vol:g}),v(h)))},W=[],w=null,T=await i({url:o,heapsize:4*1024*1024,pystack:4096,stdout:a=>{s.prints.push(a),r({type:"print",line:a})},stderr:a=>W.push(a),linebuffer:!0});try{T.FS.mkdir("/lib")}catch{}for(let[a,h]of Object.entries(ut))T.FS.writeFile("/lib/"+a,h);T.registerJsModule("_sim",I);let $=setInterval(x,4);f=d();let C=null;try{await T.runPythonAsync(n),await T.runPythonAsync(`import runloop as _rl
import asyncio as _aio
if _rl._tasks:
    await _aio.gather(*_rl._tasks)
`)}catch(a){C=String(a&&a.message||a)+(W.length?`
`+W.join(`
`):"")}!C&&w&&(C=w),x();for(let a of z)s.motors[a]&&(s.cancelJob(s.motors[a]),s.motors[a].cmd=0,s.motors[a].decel=12e3);if(s.pairJob){let a=s.pairJob.resolve;s.pairJob=null,a(3)}let bt=s.t+.4;for(;s.t<bt;)s.step(U);return clearInterval($),p=!0,r({type:"state",state:s.snapshot()}),r({type:"done",error:C,prints:s.prints.length,beeps:s.beeps.length}),{sim:s,error:C}}self.onmessage=async n=>{let t=n.data;if(t.type==="start")try{let e=await import(t.mjsUrl),i=await yt({code:t.code,preset:t.preset,speed:t.speed||1,wasmUrl:t.wasmUrl,loadMicroPython:e.loadMicroPython,post:o=>self.postMessage(o),onSim:o=>{self.__sim=o}})}catch(e){self.postMessage({type:"done",error:String(e&&e.message||e)})}else t.type==="button"&&self.__sim&&(self.__sim.buttons[t.which]=t.down)};
