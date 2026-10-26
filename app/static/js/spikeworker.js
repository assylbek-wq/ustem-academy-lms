var Q={white:[246,246,240],black:[28,28,30],red:[214,40,40],blue:[37,99,235],green:[22,160,74],yellow:[250,204,21],homeL:[255,237,213],homeR:[219,234,254],orange:[234,88,12],gray:[203,213,225],zone:[226,232,240]},P={BLACK:0,MAGENTA:1,PURPLE:2,BLUE:3,AZURE:4,TURQUOISE:5,GREEN:6,YELLOW:7,ORANGE:8,RED:9,WHITE:10,UNKNOWN:-1};function V(n,t,e,i,s=40){let r=[];for(let l=0;l<=s;l++){let f=l/s,o=1-f;r.push([o*o*o*n[0]+3*o*o*f*t[0]+3*o*f*f*e[0]+f*f*f*i[0],o*o*o*n[1]+3*o*o*f*t[1]+3*o*f*f*e[1]+f*f*f*i[1]])}return r}var Y=[...V([450,640],[700,640],[800,900],[1050,900]),...V([1050,900],[1300,900],[1350,640],[1600,640]).slice(1),...V([1600,640],[1800,640],[1850,820],[1900,860]).slice(1)],Mt=[{t:"rect",x0:0,y0:0,x1:380,y1:320,c:"homeL",label:"\u0414\u041E\u041C: \u041B\u0415\u0412\u0410\u042F"},{t:"rect",x0:1982,y0:0,x1:2362,y1:320,c:"homeR",label:"\u0414\u041E\u041C: \u041F\u0420\u0410\u0412\u0410\u042F"},{t:"frame",x0:0,y0:0,x1:380,y1:320,w:10,c:"orange"},{t:"frame",x0:1982,y0:0,x1:2362,y1:320,w:10,c:"blue"},{t:"seg",a:[450,60],b:[450,300],w:8,c:"black"},...Array.from({length:11},(n,t)=>({t:"seg",a:[550+t*100,60],b:[550+t*100,t%5===4?140:100],w:4,c:"black"})),{t:"seg",a:[450,60],b:[1550,60],w:4,c:"black"},{t:"seg",a:[450,430],b:[2e3,430],w:20,c:"black"},{t:"poly",pts:Y,w:20,c:"black"},{t:"rect",x0:1880,y0:820,x1:1990,y1:930,c:"green"},{t:"rect",x0:450,y0:960,x1:600,y1:1110,c:"red"},{t:"rect",x0:700,y0:960,x1:850,y1:1110,c:"blue"},{t:"rect",x0:950,y0:960,x1:1100,y1:1110,c:"yellow"},{t:"rect",x0:1200,y0:960,x1:1350,y1:1110,c:"green"},{t:"rect",x0:1600,y0:120,x1:1850,y1:320,c:"zone"},{t:"frame",x0:1600,y0:120,x1:1850,y1:320,w:6,c:"gray"}];var nt=(n,t,e,i)=>{let s=i[0]-e[0],r=i[1]-e[1],l=s*s+r*r,f=l?Math.max(0,Math.min(1,((n-e[0])*s+(t-e[1])*r)/l)):0;return Math.hypot(n-(e[0]+s*f),t-(e[1]+r*f))};function tt(n,t,e){let i=1/0;for(let s=1;s<e.length;s++)i=Math.min(i,nt(n,t,e[s-1],e[s]));return i}function bt(n,t,e){return n.t==="rect"?t>=n.x0&&t<=n.x1&&e>=n.y0&&e<=n.y1:n.t==="frame"?t>=n.x0&&t<=n.x1&&e>=n.y0&&e<=n.y1?t-n.x0<n.w||n.x1-t<n.w||e-n.y0<n.w||n.y1-e<n.w:!1:n.t==="seg"?nt(t,e,n.a,n.b)<=n.w/2:n.t==="poly"?tt(t,e,n.pts)<=n.w/2:!1}function kt(n,t){if(n<0||t<0||n>2362||t>1143)return Q.gray;let e=Q.white;for(let i of Mt)bt(i,n,t)&&(e=Q[i.c]);return e}var rt=Array.from({length:64},(n,t)=>{let e=7*Math.sqrt((t+.5)/64),i=t*2.399963;return[e*Math.cos(i),e*Math.sin(i)]});function at(n,t){let e=0,i=0,s=0;for(let[l,f]of rt){let o=kt(n+l,t+f);e+=o[0],i+=o[1],s+=o[2]}let r=rt.length;return[e/r,i/r,s/r]}function lt(n){let t=(.3*n[0]+.59*n[1]+.11*n[2])/255;return Math.max(0,Math.min(100,Math.round(t*97+1)))}function ht(n){let[t,e,i]=n,s=Math.max(t,e,i),r=Math.min(t,e,i),l=s/255,f=s?(s-r)/s:0;if(l<.25)return P.BLACK;if(f<.25)return l>.7?P.WHITE:P.UNKNOWN;let o;return s===t?o=(60*((e-i)/(s-r))+360)%360:s===e?o=60*((i-t)/(s-r))+120:o=60*((t-e)/(s-r))+240,o<15||o>=340?P.RED:o<40?P.ORANGE:o<70?P.YELLOW:o<160?P.GREEN:o<200?P.AZURE:o<260?P.BLUE:P.MAGENTA}var K={mine:{ru:"\u0428\u0430\u0445\u0442\u0430",x:1889,y:1043,w:124,h:124,a:-40,dir:50},city:{ru:"\u0413\u043E\u0440\u043E\u0434",x:1283,y:96,w:92,h:135,a:0,dir:270},farm:{ru:"\u0424\u0435\u0440\u043C\u0430",x:1002,y:630,w:90,h:132,a:0,dir:90}},gt={mine:15,city:14,farm:13},et={mine:"canopy",city:"skylight",farm:"hatch"},O=n=>n*Math.PI/180,g=(n,t,e,i,s=0)=>({k:"box",x:n+181,y:t,w:e,h:i,a:s}),W=(n,t,e)=>({k:"circle",x:n+181,y:t,r:e}),G=(n,t,e,i,s)=>({k:"box",x:n+181,y:t,w:s,h:i,a:e-90,dir:e});function $(n,t,e){let i=t-n.x,s=e-n.y,r=Math.cos(O(-(n.a||0))),l=Math.sin(O(-(n.a||0)));return[i*r-s*l,i*l+s*r]}function I(n,t,e,i=0){if(n.k==="circle")return Math.hypot(t-n.x,e-n.y)<=n.r+i;let[s,r]=$(n,t,e);return Math.abs(s)<=n.w/2+i&&Math.abs(r)<=n.h/2+i}function ft(n,t,e){if(n.k==="circle"){let u=t-n.x,p=e-n.y,M=Math.hypot(u,p);return M>=n.r?null:M<1e-6?{nx:1,ny:0,d:n.r}:{nx:u/M,ny:p/M,d:n.r-M}}let[i,s]=$(n,t,e),r=n.w/2-Math.abs(i),l=n.h/2-Math.abs(s);if(r<=0||l<=0)return null;let f=0,o=0,h;r<l?(f=Math.sign(i)||1,h=r):(o=Math.sign(s)||1,h=l);let y=Math.cos(O(n.a||0)),c=Math.sin(O(n.a||0));return{nx:f*y-o*c,ny:f*c+o*y,d:h}}function vt(n,t,e){let[i,s]=$(n,t,e);return Math.abs(i)>n.w/2||Math.abs(s)>n.h/2?-1:s+n.h/2}function ct(n,t,e,i,s){if(n.k==="circle"){let p=t-n.x,M=e-n.y,v=p*i+M*s,b=p*p+M*M-n.r*n.r,x=v*v-b;if(x<0)return 1/0;let m=-v-Math.sqrt(x);return m>0?m:1/0}let[r,l]=$(n,t,e),f=Math.cos(O(-(n.a||0))),o=Math.sin(O(-(n.a||0))),h=i*f-s*o,y=i*o+s*f,c=-1/0,u=1/0;for(let[p,M,v]of[[r,h,n.w/2],[l,y,n.h/2]]){if(Math.abs(M)<1e-9){if(Math.abs(p)>v)return 1/0;continue}let b=(-v-p)/M,x=(v-p)/M;b>x&&([b,x]=[x,b]),c=Math.max(c,b),u=Math.min(u,x)}return c<=u&&c>0?c:1/0}var J=(n,t=0)=>{let e=K[n];return g(e.x,e.y,e.w+t,e.h+t,e.a)};function st(n,t=0,e=0){let i=K[n],s=O(i.dir+180),r=O(i.dir+90),l=i.dir%180===90?i.h/2:i.w/2;return[181+i.x+Math.cos(s)*(l+e)+Math.cos(r)*t,i.y+Math.sin(s)*(l+e)+Math.sin(r)*t]}var X=class{constructor(t={}){this.docks={...gt,...t.docks||{}},this.s={droneUp:!1,mapFlipped:!1,seedsOut:!1,flagDown:!1,rockFlipped:!1,rockBack:!1,leaf1:!1,leaf2:!1,katydidMoved:!1,katydidOut:!1,root:0,myc:0,vine:!1,platform:!1,camera:!1,treeSeed:!1,spiderMoved:!1,snailMoved:!1,cover:!1,cane:!1,tie:"tree",trees:!1,canopy:!1,skylight:0,hatch:!1,fragments:3,antHome:!1},this.objs=[{id:"scan",kind:"scan",x:1334,y:165,r:16},{id:"keystone",kind:"keystone",x:t.keystone?t.keystone.x:520,y:t.keystone?t.keystone.y:300,r:40}],this.tools={C:{down:!1,tip:null},D:{down:!1,tip:null}},this.carry=null,this.events=[],this.pixels=null,this.build();for(let[e,i]of Object.entries(t.fieldState||{}))this.s[e]=i}build(){let t=this.docks,e=r=>Object.keys(t).find(l=>t[l]===r);this.dockOf=e,this.solids=[W(1153,61,34),g(639,543,52,52,45),g(80,661,120,56),g(135,1030,110,100),g(406,1112,40,52),W(578,1075,58),g(1520,1078,100,110),g(1662,1102,50,60),g(1409,596,78,78,45),W(1940,757,32),g(1941,546,30,60)];let i=e(15);i&&this.solids.push(J(i)),this.fragile=[{key:"spiderMoved",s:W(752,1050,22)},{key:"snailMoved",s:W(1044,723,26)}];let s=[];s.push({m:1,kind:"push",z:G(1098,61,0,40,90),need:12,act:()=>{this.s.droneUp||(this.s.droneUp=!0,this.ev("\u0414\u0440\u043E\u043D \u0432\u0437\u043B\u0435\u0442\u0435\u043B"))}}),s.push({m:1,kind:"down",z:g(1153,128,70,50),act:()=>{this.s.droneUp&&!this.s.mapFlipped&&(this.s.mapFlipped=!0,this.ev("\u041A\u0430\u0440\u0442\u0430 LiDAR \u043F\u0435\u0440\u0435\u0432\u0435\u0440\u043D\u0443\u0442\u0430"))}}),s.push({m:2,kind:"touch",z:W(639,543,62),act:()=>this.releaseSeeds()}),s.push({m:3,kind:"push",z:G(158,661,180,36,56),need:10,act:()=>{this.s.flagDown||(this.s.flagDown=!0,this.s.rockFlipped=!0,this.ev("\u0424\u043B\u0430\u0436\u043E\u043A \u043E\u043F\u0443\u0449\u0435\u043D"))}}),s.push({m:3,kind:"down",z:g(80,661,90,60),act:()=>{this.s.rockFlipped&&!this.s.rockBack&&(this.s.rockBack=!0,this.ev("\u041A\u0430\u043C\u0435\u043D\u044C \u043D\u0430 \u043C\u0435\u0441\u0442\u0435"))}}),s.push({m:4,kind:"up",z:g(100,965,30,30),act:()=>{this.s.leaf1||(this.s.leaf1=!0,this.ev("\u041B\u0438\u0441\u0442 \u0441\u043D\u044F\u0442"))}}),s.push({m:4,kind:"up",z:g(170,965,30,30),act:()=>{this.s.leaf2||(this.s.leaf2=!0,this.ev("\u041B\u0438\u0441\u0442 \u0441\u043D\u044F\u0442"))}}),s.push({m:4,kind:"updown",z:g(135,965,22,30),act:()=>{this.s.katydidMoved=!0}}),s.push({m:5,kind:"push",z:G(406,1061,90,50,50),need:15,depth:r=>{this.s.root=Math.max(this.s.root,r>=38?2:1)}}),s.push({m:6,kind:"down",z:g(1606,1048,60,64),act:()=>{this.s.antHome||(this.s.antHome=!0,Math.abs(this.robotSpeed)>330?(this.s.fragments=0,this.ev("\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u0431\u044B\u0441\u0442\u0440\u043E: \u043B\u0438\u0441\u0442\u044C\u044F \u0440\u0430\u0441\u0441\u044B\u043F\u0430\u043B\u0438\u0441\u044C")):this.ev("\u041C\u0443\u0440\u0430\u0432\u0435\u0439 \u0432 \u0433\u043D\u0435\u0437\u0434\u0435"))}}),s.push({m:7,kind:"push",z:G(1662,1052,90,40,50),need:25,act:()=>{this.s.myc||(this.s.myc=1,this.ev("\u041C\u0438\u0446\u0435\u043B\u0438\u0439 \u0432\u044B\u0442\u044F\u043D\u0443\u0442"))}}),s.push({m:8,kind:"down",z:g(578,1e3,50,30),act:()=>{this.s.vine||(this.s.vine=!0,this.ev("\u041B\u0438\u0430\u043D\u0430 \u043D\u0430 \u043C\u0430\u0442\u0435"))}}),s.push({m:9,kind:"up",z:g(505,1062,30,60),act:()=>{this.s.platform||(this.s.platform=!0,this.ev("\u041F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0430 \u043F\u043E\u0434\u043D\u044F\u0442\u0430"))}}),s.push({m:9,kind:"down",z:g(652,1062,34,50),act:()=>{this.s.camera||(this.s.camera=!0,this.ev("\u0424\u043E\u0442\u043E\u043B\u043E\u0432\u0443\u0448\u043A\u0430 \u0443\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u0430"))}}),s.push({m:9,kind:"down",z:g(622,1012,30,30),act:()=>this.dropTreeSeed()}),s.push({m:11,kind:"down",z:g(1368,556,34,40,45),act:()=>{this.s.cover||(this.s.cover=!0,this.ev("\u041E\u043A\u043D\u043E \u043E\u0442\u043A\u0440\u044B\u0442\u043E"))}}),s.push({m:12,kind:"up",z:g(1896,757,30,50),act:()=>{this.s.cane||(this.s.cane=!0,this.ev("\u041F\u043E\u0434\u043F\u043E\u0440\u043A\u0430 \u043F\u043E\u0434\u043D\u044F\u0442\u0430"))}}),s.push({m:12,kind:"up",z:g(1940,712,40,26),act:()=>{this.s.tie==="tree"&&(this.s.tie="robot",this.ev("\u0421\u0442\u044F\u0436\u043A\u0430 \u043D\u0430 \u043D\u0430\u0432\u0435\u0441\u043D\u043E\u043C"))}}),s.push({m:12,kind:"down",z:g(1941,546,50,80),act:()=>{this.s.tie==="robot"&&(this.s.tie="post",this.ev("\u0421\u0442\u044F\u0436\u043A\u0430 \u043D\u0430 \u0441\u0442\u043E\u043B\u0431\u0438\u043A\u0435"))}});for(let[r,l]of Object.entries(t)){let f=K[r];if(l===13&&s.push({m:13,kind:"up",z:J(r,30),act:()=>{this.s.trees||(this.s.trees=!0,this.ev("\u041C\u043E\u043B\u043E\u0434\u044B\u0435 \u0434\u0435\u0440\u0435\u0432\u044C\u044F \u043F\u043E\u0434\u043D\u044F\u0442\u044B"))}}),l===15){let[o,h]=st(r,-32,14),[y,c]=st(r,0,18),[u,p]=st(r,32,14);s.push({m:15,kind:"up",z:{k:"box",x:o,y:h,w:30,h:28,a:f.a},act:()=>{this.s.canopy||(this.s.canopy=!0,this.ev("\u041D\u0430\u0432\u0435\u0441 \u0434\u043B\u044F \u0433\u043D\u0435\u0437\u0434 \u043F\u043E\u0434\u043D\u044F\u0442"))}}),s.push({m:15,kind:"push",z:{k:"box",x:y,y:c,w:30,h:36,a:f.dir-90,dir:f.dir},need:14,act:()=>{this.s.skylight||(this.s.skylight=1,this.ev("\u041E\u043A\u043D\u043E \u0441\u0430\u0434\u0430 \u0437\u0430\u0434\u0432\u0438\u043D\u0443\u0442\u043E"))}}),s.push({m:15,kind:"down",z:{k:"box",x:u,y:p,w:30,h:28,a:f.a},act:()=>{this.s.hatch||(this.s.hatch=!0,this.ev("\u041A\u043E\u043C\u043F\u043E\u0441\u0442\u043D\u044B\u0439 \u043B\u044E\u043A \u043E\u0442\u043A\u0440\u044B\u0442"))}})}}this.triggers=s.map(r=>({...r,t:0}))}ev(t){this.events.push(t)}releaseSeeds(){if(!this.s.seedsOut){this.s.seedsOut=!0;for(let[t,[e,i]]of[[-96,30],[86,72],[12,-102]].entries())this.objs.push({id:"seed"+t,kind:"seed",x:820+e,y:543+i,r:18});this.ev("\u0421\u0435\u043C\u0435\u043D\u0430 \u0432\u044B\u0431\u0440\u043E\u0448\u0435\u043D\u044B")}}dropTreeSeed(){this.s.treeSeed||(this.s.treeSeed=!0,this.objs.push({id:"seed3",kind:"seed",x:803,y:968,r:18}),this.ev("\u0421\u0435\u043C\u0435\u0447\u043A\u043E \u0443\u043F\u0430\u043B\u043E \u0441 \u0434\u0435\u0440\u0435\u0432\u0430"))}async load(t){if(!(!t||this.pixels||typeof fetch>"u"||typeof createImageBitmap>"u"))try{let e=await(await fetch(t)).blob(),i=await createImageBitmap(e),s=typeof OffscreenCanvas<"u"?new OffscreenCanvas(i.width,i.height):null;if(!s)return;let r=s.getContext("2d");r.drawImage(i,0,0),this.pixels={w:i.width,h:i.height,data:r.getImageData(0,0,i.width,i.height).data}}catch{this.pixels=null}}colorAt(t,e){if(t<0||e<0||t>2362||e>1143)return[90,90,90];let i=t-181;if(i<0||i>2e3)return[60,60,62];let s=this.pixels;if(!s)return[235,235,230];let r=Math.min(s.w-1,Math.max(0,Math.floor(i/2e3*s.w))),f=(Math.min(s.h-1,Math.max(0,Math.floor((1-e/1143)*s.h)))*s.w+r)*4;return[s.data[f],s.data[f+1],s.data[f+2]]}bodyPoints(t,e){let i=[];for(let s=-e.half;s<=e.half;s+=20)i.push(t.local2world(e.front,s)),i.push(t.local2world(-e.back,s));for(let s=-e.back+20;s<e.front;s+=25)i.push(t.local2world(s,-e.half)),i.push(t.local2world(s,e.half));return i}collide(t,e){for(let i=0;i<3;i++){let s=0,r=0;for(let l of this.bodyPoints(t,e))for(let f of this.solids){let o=ft(f,l.x,l.y);if(o&&o.d>0){let h=o.nx*o.d,y=o.ny*o.d;Math.abs(h)>Math.abs(s)&&(s=h),Math.abs(y)>Math.abs(r)&&(r=y)}}if(!s&&!r)break;t.pose.x+=s,t.pose.y+=r}}toolTip(t,e,i,s){let r=110*Math.sin(Math.max(0,Math.min(180,s))*Math.PI/180);return t.local2world(e.front+Math.max(10,r),i==="D"?40:0)}update(t,e,i){let s=this.s,r=this.bodyPoints(t,e);this.robotSpeed=t.speedMm||0;let l=[];for(let h=-e.half+10;h<=e.half-10;h+=15)l.push(t.local2world(e.front,h));let f=[];for(let h of["C","D"]){let y=t.motors[h];if(!y||!String(t.ports[h]).startsWith("motor"))continue;let c=this.tools[h],u=y.pos,p=this.toolTip(t,e,h,u),M=Math.sin(Math.max(0,Math.min(180,u))*Math.PI/180);!c.down&&u>=60?(c.down=!0,c.downTip=p,c.deep=M,c.lastDownTip=p,f.push({kind:"down",tip:p})):c.down&&u<=30&&(c.down=!1,f.push({kind:"up",tip:c.lastDownTip||p})),c.down&&M>=c.deep&&(c.deep=M,c.lastDownTip=p),c.tip=p}for(let h of this.triggers)if(h.kind==="push"){let c=((t.pose.h*180/Math.PI+90-h.z.dir)%360+540)%360-180;if(Math.abs(c)>30||(t.speedMm||0)<15)continue;let u=-1;for(let p of l)u=Math.max(u,vt(h.z,p.x,p.y));h.depth&&u>=h.need&&h.depth(u),!h.depth&&u>=h.need&&h.act()}else if(h.kind==="touch"){let y=l.some(c=>I(h.z,c.x,c.y))||Object.values(this.tools).some(c=>c.tip&&I(h.z,c.tip.x,c.tip.y));h.t=y?h.t+i:0,h.t>.12&&h.act()}else for(let y of f)(h.kind===y.kind||h.kind==="updown")&&I(h.z,y.tip.x,y.tip.y,h.kind==="updown"?0:12)&&h.act();let o=W(135,966,16);r.some(h=>I(o,h.x,h.y))&&(s.katydidMoved=!0,l.some(h=>I(o,h.x,h.y,-6))&&(s.katydidOut=!0));for(let h of this.fragile){if(s[h.key])continue;(Object.values(this.tools).some(c=>c.tip&&I(h.s,c.tip.x,c.tip.y,4))||r.some(c=>I(h.s,c.x,c.y,4)))&&(s[h.key]=!0,this.ev("\u041C\u0438\u043A\u0440\u043E\u044D\u043A\u043E\u0441\u0438\u0441\u0442\u0435\u043C\u0430 \u0441\u0434\u0432\u0438\u043D\u0443\u0442\u0430!"))}for(let h of this.objs){t.pushCircle(h);for(let y of this.solids){let c=ft(y,h.x,h.y);c&&(h.x+=c.nx*(c.d+h.r*.2),h.y+=c.ny*(c.d+h.r*.2))}h.x=Math.max(h.r,Math.min(2362-h.r,h.x)),h.y=Math.max(h.r,Math.min(1143-h.r,h.y))}}raycast(t,e,i,s){let r=1/0;for(let l of this.solids)r=Math.min(r,ct(l,t,e,i,s));for(let l of this.objs)r=Math.min(r,ct({k:"circle",x:l.x,y:l.y,r:l.r},t,e,i,s));return r}score(){let t=this.s,e=[],i=this.docks,s=(E,L,F,Z)=>e.push({m:E,pts:L,max:F,parts:Z}),r=E=>this.objs.find(L=>L.id===E),l=r("scan"),f=g(1052,231,76,76,30),o=l&&I(f,l.x,l.y,l.r*.6);s(1,(t.droneUp?20:0)+(t.droneUp&&t.mapFlipped&&o?10:0),30,[["\u0414\u0440\u043E\u043D \u043D\u0435 \u043A\u0430\u0441\u0430\u0435\u0442\u0441\u044F \u043C\u0430\u0442\u0430",t.droneUp,20],["\u0411\u043E\u043D\u0443\u0441: \u043A\u0430\u0440\u0442\u0430 \u043F\u0435\u0440\u0435\u0432\u0435\u0440\u043D\u0443\u0442\u0430, \u043C\u0435\u0442\u043A\u0430 \u0432 \u0437\u043E\u043D\u0435",t.droneUp&&t.mapFlipped&&o,10]]);let h=this.objs.filter(E=>/^seed[012]$/.test(E.id)&&Math.hypot(E.x-181-639,E.y-543)>48).length;s(2,h*10,30,[["\u0421\u0435\u043C\u0435\u043D\u0430 \u043D\u0435 \u043A\u0430\u0441\u0430\u044E\u0442\u0441\u044F \u0441\u0442\u0435\u0431\u043B\u044F: "+h+" \u0438\u0437 3",h>0,h*10]]),s(3,(t.flagDown?20:0)+(t.flagDown&&t.rockBack?10:0),30,[["\u0424\u043B\u0430\u0436\u043E\u043A \u043E\u043F\u0443\u0449\u0435\u043D",t.flagDown,20],["\u0411\u043E\u043D\u0443\u0441: \u043A\u0430\u043C\u0435\u043D\u044C \u0432\u0435\u0440\u043D\u0443\u043B\u0441\u044F \u043D\u0430 \u043C\u0435\u0441\u0442\u043E",t.flagDown&&t.rockBack,10]]);let y=(t.leaf1?1:0)+(t.leaf2?1:0),c=t.katydidOut?0:(y>=1?10:0)+(y===2&&!t.katydidMoved?20:0);s(4,c,30,[["\u041E\u0434\u0438\u043D \u043B\u0438\u0441\u0442 \u0441\u043D\u044F\u0442",y>=1&&!t.katydidOut,10],["\u0411\u043E\u043D\u0443\u0441: \u0432\u0442\u043E\u0440\u043E\u0439 \u043B\u0438\u0441\u0442, \u043A\u0443\u0437\u043D\u0435\u0447\u0438\u043A \u043D\u0430 \u043C\u0435\u0441\u0442\u0435",y===2&&!t.katydidMoved&&!t.katydidOut,20],...t.katydidOut?[["\u041A\u0443\u0437\u043D\u0435\u0447\u0438\u043A \u0432\u043D\u0435 \u0437\u043E\u043D\u044B: 0 \u043E\u0447\u043A\u043E\u0432 \u0437\u0430 \u043C\u0438\u0441\u0441\u0438\u044E",!1,0]]:[]]),s(5,t.root===2?20:t.root===1?10:0,20,[["\u041A\u043E\u0440\u0435\u043D\u044C \u0432\u044B\u0442\u044F\u043D\u0443\u0442 \u0447\u0430\u0441\u0442\u0438\u0447\u043D\u043E (10) \u0438\u043B\u0438 \u043F\u043E\u043B\u043D\u043E\u0441\u0442\u044C\u044E (20)",t.root>0,t.root===2?20:t.root*10]]);let u=t.antHome?t.fragments*10:0;s(6,u,30,[["\u041C\u0443\u0440\u0430\u0432\u0435\u0439 \u0443 \u0433\u043D\u0435\u0437\u0434\u0430, \u043B\u0438\u0441\u0442\u044C\u044F \u0432 \u0433\u043D\u0435\u0437\u0434\u0435: "+(t.antHome?t.fragments:0)+" \u0438\u0437 3",u>0,u]]),s(7,t.myc?20:0,30,[["\u041C\u0438\u0446\u0435\u043B\u0438\u0439 \u043F\u043E\u043B\u043D\u043E\u0441\u0442\u044C\u044E \u0432\u044B\u0442\u044F\u043D\u0443\u0442",!!t.myc,20],["\u0411\u043E\u043D\u0443\u0441 \u0441 \u0441\u043E\u0441\u0435\u0434\u043D\u0438\u043C \u0441\u0442\u043E\u043B\u043E\u043C (\u0432 \u0441\u0438\u043C\u0443\u043B\u044F\u0442\u043E\u0440\u0435 \u043D\u0435\u0442 \u0441\u043E\u043F\u0435\u0440\u043D\u0438\u043A\u0430)",!1,0]]),s(8,t.vine?30:0,30,[["\u041B\u0438\u0430\u043D\u0430 \u043A\u0430\u0441\u0430\u0435\u0442\u0441\u044F \u043C\u0430\u0442\u0430",t.vine,30]]);let p=r("seed3"),M=!!p&&Math.hypot(p.x-181-578,p.y-1075)>64;s(9,(t.platform?10:0)+(t.camera?10:0)+(M?10:0),30,[["\u041F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0430 \u043F\u043E\u0434\u043D\u044F\u0442\u0430",t.platform,10],["\u0424\u043E\u0442\u043E\u043B\u043E\u0432\u0443\u0448\u043A\u0430 \u0443\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u0430",t.camera,10],["\u0421\u0435\u043C\u0435\u0447\u043A\u043E \u043D\u0435 \u043A\u0430\u0441\u0430\u0435\u0442\u0441\u044F \u0434\u0435\u0440\u0435\u0432\u0430",M,10]]),s(10,(t.spiderMoved?0:10)+(t.snailMoved?0:10),20,[["\u0414\u043E\u043C \u043F\u0430\u0443\u043A\u0430 \u043D\u0430 \u043C\u0435\u0441\u0442\u0435",!t.spiderMoved,10],["\u0414\u043E\u043C \u0443\u043B\u0438\u0442\u043A\u0438 \u043D\u0430 \u043C\u0435\u0441\u0442\u0435",!t.snailMoved,10]]),s(11,t.cover?20:0,20,[["\u041A\u0440\u044B\u0448\u043A\u0430 \u043A\u043E\u0440\u043D\u0435\u0439 \u043E\u043F\u0443\u0449\u0435\u043D\u0430 \u0434\u043E \u043C\u0430\u0442\u0430",t.cover,20]]),s(12,(t.cane?20:0)+(t.tie==="post"?10:0),30,[["\u041F\u043E\u0434\u043F\u043E\u0440\u043A\u0430 \u043F\u043E\u0434\u043D\u044F\u0442\u0430 \u0438 \u043A\u0430\u0441\u0430\u0435\u0442\u0441\u044F \u0434\u0435\u0440\u0435\u0432\u0430",t.cane,20],["\u0421\u0442\u044F\u0436\u043A\u0430 \u0432\u043E\u043A\u0440\u0443\u0433 \u0441\u0442\u043E\u043B\u0431\u0438\u043A\u0430",t.tie==="post",10]]);let v=this.dockOf(13),b=this.dockOf(14),x=this.dockOf(15),m=r("keystone"),C=!!(v&&m&&I(J(v,10),m.x,m.y));s(13,C&&t.trees?30:0,30,[["\u041A\u043B\u044E\u0447\u0435\u0432\u043E\u0439 \u0432\u0438\u0434 \u043D\u0430 \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0435",C,0],["\u0438 \u043C\u043E\u043B\u043E\u0434\u044B\u0435 \u0434\u0435\u0440\u0435\u0432\u044C\u044F \u043F\u043E\u0434\u043D\u044F\u0442\u044B",C&&t.trees,30]]);let R=b?this.objs.filter(E=>E.kind==="seed"&&I(J(b,4),E.x,E.y)).length:0;s(14,R*10,40,[["\u0421\u0435\u043C\u0435\u043D\u0430 \u0432 \u0441\u0442\u0430\u043D\u0446\u0438\u0438: "+R+" (5 + 5 \u0431\u043E\u043D\u0443\u0441 \u0437\u0430 \u043A\u0430\u0436\u0434\u043E\u0435)",R>0,R*10]]);let j=x&&(et[x]==="canopy"&&t.canopy||et[x]==="skylight"&&t.skylight||et[x]==="hatch"&&t.hatch);s(15,(t.canopy?10:0)+(t.skylight?10:0)+(t.hatch?10:0)+(j?10:0),40,[["\u041D\u0430\u0432\u0435\u0441 \u0434\u043B\u044F \u0433\u043D\u0435\u0437\u0434 \u043F\u043E\u0434\u043D\u044F\u0442",t.canopy,10],["\u041E\u043A\u043D\u043E \u0441\u0430\u0434\u0430 \u043F\u043E\u043B\u043D\u043E\u0441\u0442\u044C\u044E \u0437\u0430\u0434\u0432\u0438\u043D\u0443\u0442\u043E",!!t.skylight,10],["\u041A\u043E\u043C\u043F\u043E\u0441\u0442\u043D\u044B\u0439 \u043B\u044E\u043A \u043E\u0442\u043A\u0440\u044B\u0442",t.hatch,10],["\u042D\u043A\u043E\u0431\u043E\u043D\u0443\u0441 \u0434\u043E\u043A\u0430 \xAB"+(x?K[x].ru:"-")+"\xBB",!!j,10]]);let N=e.reduce((E,L)=>E+L.pts,0)+50+20;return{rows:e,tokens:50,inspection:20,total:N}}snapshot(){return{s:{...this.s},docks:this.docks,objs:this.objs.map(t=>({id:t.id,kind:t.kind,x:Math.round(t.x),y:Math.round(t.y),r:t.r})),score:this.score()}}};var xt=Array.from({length:16},(n,t)=>{let e=7*Math.sqrt((t+.5)/16),i=t*2.399963;return[e*Math.cos(i),e*Math.sin(i)]}),wt=56,pt=Math.PI*wt/360,Et=112,k={front:105,back:75,half:80},At={E:[95,-28],F:[95,28]},St={large:1050,medium:1110,small:660},q=["A","B","C","D","E","F"],B=.005,Tt={A:"motor:large",B:"motor:large",C:"motor:medium",D:"motor:medium",E:"color",F:"color"},ot=class{constructor(t){this.kind=t,this.pos=0,this.vel=0,this.cmd=0,this.accel=1e3,this.decel=1e3,this.job=null,this.offset=0}get max(){return St[this.kind]||1050}},T=(n,t,e)=>Math.max(t,Math.min(e,n)),it=(n,t,e,i,s)=>{let r=Math.abs(t)>Math.abs(n)&&Math.sign(t||1)===Math.sign(n||t||1)?e:i,l=t-n,f=r*s;return Math.abs(l)<=f?t:n+Math.sign(l)*f},dt=(n,t,e)=>Math.sign(n)*Math.min(t,Math.sqrt(2*e*Math.abs(n))),H=class{constructor(t={}){this.preset=t,this.ports={...Tt,...t.robot||{}};let e=t.start||{x:190,y:150,h:-90};this.pose={x:e.x,y:e.y,h:(e.h||0)*Math.PI/180},this.drift=t.drift||0,this.motors={};for(let i of q)String(this.ports[i]).startsWith("motor")&&(this.motors[i]=new ot(this.ports[i].split(":")[1]||"medium"));this.pairs={},this.pairJob=null,this.t=0,this.yawOffset=this.pose.h,this.matrix={text:"",image:null,pixels:null},this.prints=[],this.beeps=[],this.buttons={left:!1,right:!1},this.box=t.box?{...t.box,r:55}:null,this.lever=t.lever?{...t.lever,up:!0,flips:0}:null,this.trail=[[this.pose.x,this.pose.y]],this.trailT=0,this.maxLineDist=0,this.events=[],this.field=t.field==="bioglow"?new X(t):null,this.speedMm=0}spot(t,e){if(!this.field)return at(t,e);let i=0,s=0,r=0;for(let[l,f]of xt){let o=this.field.colorAt(t+l,e+f);i+=o[0],s+=o[1],r+=o[2]}return[i/16,s/16,r/16]}device(t){return this.ports[t]}motor(t){let e=this.motors[t];if(!e)throw new Error(`\u041D\u0430 \u043F\u043E\u0440\u0442\u0443 ${t} \u043D\u0435\u0442 \u043C\u043E\u0442\u043E\u0440\u0430 (\u0442\u0430\u043C: ${this.ports[t]||"\u043F\u0443\u0441\u0442\u043E"})`);return e}motorRun(t,e,i=1e3){let s=this.motor(t);this.releasePair(t),this.cancelJob(s),s.cmd=T(e,-s.max,s.max),s.accel=i,s.decel=i}motorStop(t,e="brake"){let i=this.motor(t);this.releasePair(t),this.cancelJob(i),i.cmd=0,i.decel=e==="coast"?1500:12e3}motorForDegrees(t,e,i,s=1e3,r=1e3){let l=this.motor(t);this.releasePair(t),this.cancelJob(l);let f=Math.sign(e||1)*Math.sign(i||1);return new Promise(o=>{l.job={target:l.pos+Math.abs(e)*f,vmax:Math.min(Math.abs(i),l.max),accel:s,decel:r,resolve:o}})}motorToRelative(t,e,i){let s=this.motor(t);return this.releasePair(t),this.cancelJob(s),new Promise(r=>{s.job={target:e+s.offset,vmax:Math.min(Math.abs(i),s.max),accel:1e3,decel:1e3,resolve:r}})}cancelJob(t){if(t.job){let e=t.job.resolve;t.job=null,e(3)}}releasePair(t){if(this.pairJob&&this.pairJob.ports.includes(t)){let e=this.pairJob.resolve;this.pairJob=null,e&&e(3)}}pairPorts(t){let e=this.pairs[t];if(!e)throw new Error("\u041F\u0430\u0440\u0430 \u043C\u043E\u0442\u043E\u0440\u043E\u0432 \u043D\u0435 \u043D\u0430\u0441\u0442\u0440\u043E\u0435\u043D\u0430: \u0441\u043D\u0430\u0447\u0430\u043B\u0430 motor_pair.pair(motor_pair.PAIR_1, port.A, port.B)");return e}static steer(t){return t=T(t,-100,100),t>=0?[1,1-t/50]:[1+t/50,1]}pairMove(t,e,i,s=1e3){let[r,l]=this.pairPorts(t);if(this.pairJob){let h=this.pairJob.resolve;this.pairJob=null,h&&h(3)}let f=this.motor(r),o=this.motor(l);this.cancelJob(f),this.cancelJob(o),f.cmd=T(-e,-f.max,f.max),o.cmd=T(i,-o.max,o.max),f.accel=o.accel=s,f.decel=o.decel=s}pairStop(t,e="brake"){let[i,s]=this.pairPorts(t);if(this.pairJob){let r=this.pairJob.resolve;this.pairJob=null,r&&r(3)}for(let r of[i,s]){let l=this.motor(r);this.cancelJob(l),l.cmd=0,l.decel=e==="coast"?1500:12e3}}pairForDegrees(t,e,i,s,r,l=1e3,f=1e3){let[o,h]=this.pairPorts(t);if(this.pairJob){let M=this.pairJob.resolve;this.pairJob=null,M&&M(3)}let y=this.motor(o),c=this.motor(h);this.cancelJob(y),this.cancelJob(c);let u=Math.max(Math.abs(i),Math.abs(s))||1,p=Math.sign(e||1)*Math.sign(r||1);return new Promise(M=>{this.pairJob={ports:[o,h],A:o,B:h,l:i/u*p,r:s/u*p,total:Math.abs(e),done:0,vp:0,vmax:Math.min(Math.abs(r),y.max),accel:l,decel:f,resolve:M}})}local2world(t,e){let i=this.pose;return{x:i.x-Math.sin(i.h)*t+Math.cos(i.h)*e,y:i.y+Math.cos(i.h)*t+Math.sin(i.h)*e}}sensorPoint(t){let e=this.preset.sensorPos&&this.preset.sensorPos[t]||At[t]||[95,0];return this.local2world(e[0],e[1])}needDevice(t,e){if(!String(this.ports[t]||"").startsWith(e))throw new Error(`\u041D\u0430 \u043F\u043E\u0440\u0442\u0443 ${t} \u043D\u0435\u0442 \u0443\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432\u0430 \xAB${e}\xBB (\u0442\u0430\u043C: ${this.ports[t]||"\u043F\u0443\u0441\u0442\u043E"})`)}reflection(t){this.needDevice(t,"color");let e=this.sensorPoint(t);return lt(this.spot(e.x,e.y))}color(t){this.needDevice(t,"color");let e=this.sensorPoint(t);return ht(this.spot(e.x,e.y))}rgbi(t){this.needDevice(t,"color");let e=this.sensorPoint(t),i=this.spot(e.x,e.y);return[...i.map(s=>Math.round(s*4)),Math.round((i[0]+i[1]+i[2])*4/3)]}distance(t){this.needDevice(t,"distance");let e=this.local2world(k.front,0),i=-Math.sin(this.pose.h),s=Math.cos(this.pose.h),r=1/0;i>1e-6&&(r=Math.min(r,(2362-e.x)/i)),i<-1e-6&&(r=Math.min(r,-e.x/i)),s>1e-6&&(r=Math.min(r,(1143-e.y)/s)),s<-1e-6&&(r=Math.min(r,-e.y/s));for(let l of[this.box,this.lever&&{x:this.lever.x,y:this.lever.y,r:40}]){if(!l)continue;let f=e.x-l.x,o=e.y-l.y,h=f*i+o*s,y=f*f+o*o-l.r*l.r,c=h*h-y;if(c>=0){let u=-h-Math.sqrt(c);u>0&&(r=Math.min(r,u))}}return this.field&&(r=Math.min(r,this.field.raycast(e.x,e.y,i,s))),r>2e3?-1:Math.round(r)}forcePressed(t){return this.needDevice(t,"force"),this.frontContact()<3}force(t){return this.needDevice(t,"force"),this.frontContact()<3?60:0}frontContact(){let t=1/0;for(let e of[-k.half+10,0,k.half-10]){let i=this.local2world(k.front,e);t=Math.min(t,i.x,i.y,2362-i.x,1143-i.y),this.box&&(t=Math.min(t,Math.hypot(i.x-this.box.x,i.y-this.box.y)-this.box.r)),this.field&&(t=Math.min(t,this.field.raycast(this.local2world(k.front-5,e).x,this.local2world(k.front-5,e).y,-Math.sin(this.pose.h),Math.cos(this.pose.h))-5))}return t}yawDeci(){let t=(this.pose.h-this.yawOffset)*180/Math.PI;return t=((t+180)%360+360)%360-180,Math.round(t*10)}resetYaw(t){this.yawOffset=this.pose.h-t/10*Math.PI/180}step(t=B){if(this.t+=t,this.field&&!this.matchOver&&this.t>=(this.preset.matchTime||150)){this.matchOver=!0;for(let i of Object.values(this.motors))this.cancelJob(i),i.cmd=0,i.decel=12e3;if(this.pairJob){let i=this.pairJob.resolve;this.pairJob=null,i&&i(3)}this.events.push({toast:"\u0412\u0440\u0435\u043C\u044F \u043C\u0430\u0442\u0447\u0430 \u0432\u044B\u0448\u043B\u043E"})}let e=this.pairJob;if(e){let i=e.total-e.done,s=dt(i,e.vmax,e.decel);e.vp=it(e.vp,s,e.accel,e.decel,t),e.done+=e.vp*t;let r=this.motors[e.A],l=this.motors[e.B];r.vel=-e.vp*e.l,l.vel=e.vp*e.r,r.cmd=r.vel,l.cmd=l.vel,r.pos+=r.vel*t,l.pos+=l.vel*t,e.total-e.done<.5&&Math.abs(e.vp)<60&&(r.vel=l.vel=r.cmd=l.cmd=0,this.pairJob=null,e.resolve(0))}for(let[i,s]of Object.entries(this.motors))if(!(e&&e.ports.includes(i))){if(s.job){let r=s.job,l=r.target-s.pos;s.vel=it(s.vel,dt(l,r.vmax,r.decel),r.accel,r.decel,t),Math.abs(l)<.5&&Math.abs(s.vel)<60&&(s.pos=r.target,s.vel=0,s.cmd=0,s.job=null,r.resolve(0))}else s.vel=it(s.vel,s.cmd,s.accel,s.decel,t);s.pos+=s.vel*t}if(this.kinematics(t),this.trailT+=t,this.trailT>.05&&(this.trailT=0,this.trail.push([Math.round(this.pose.x),Math.round(this.pose.y)]),this.trail.length>3e3&&this.trail.shift()),this.preset.trackLine){let i=this.sensorPoint(this.preset.trackLine),s=tt(i.x,i.y,Y);this.t>.3&&(this.maxLineDist=Math.max(this.maxLineDist,s))}}kinematics(t){let e=this.pose,i=0,s=0,r=this.motors.A,l=this.motors.B;r&&String(this.ports.A).startsWith("motor")&&(i=-r.vel*pt*(1-this.drift/2)),l&&String(this.ports.B).startsWith("motor")&&(s=l.vel*pt*(1+this.drift/2));let f=(i+s)/2,o=(s-i)/Et;this.speedMm=f;let h={...e};e.h+=o*t,e.x+=-Math.sin(e.h)*f*t,e.y+=Math.cos(e.h)*f*t;let y=[[k.front,-k.half],[k.front,k.half],[-k.back,-k.half],[-k.back,k.half]].map(([p,M])=>this.local2world(p,M)),c=0,u=0;for(let p of y)p.x<0&&(c=Math.max(c,-p.x)),p.x>2362&&(c=Math.min(c,2362-p.x)),p.y<0&&(u=Math.max(u,-p.y)),p.y>1143&&(u=Math.min(u,1143-p.y));if(c||u){e.x+=c,e.y+=u;let p=-Math.sin(e.h),M=Math.cos(e.h),v=Math.abs(u)>=Math.abs(c)?[0,Math.sign(u)]:[Math.sign(c),0],b=p*v[0]+M*v[1];if(Math.abs(f)>1&&Math.abs(b)>.6){let m=Math.atan2(v[0]*Math.sign(f),-v[1]*Math.sign(f))-e.h;for(;m>Math.PI;)m-=2*Math.PI;for(;m<-Math.PI;)m+=2*Math.PI;e.h+=T(m,-1,1)*Math.min(1,t*15)}}if(this.field){this.field.collide(this,k),this.field.update(this,k,t);for(let p of this.field.events.splice(0))this.events.push({toast:p})}if(this.box&&this.pushBox(h),this.lever&&this.motors.C){let p=this.motors.C.pos,M=110*Math.sin(T(p,0,180)*Math.PI/180),v=this.local2world(k.front+M,0),b=Math.hypot(v.x-this.lever.x,v.y-this.lever.y);this.lever.up&&b<70&&p>60&&(this.lever.up=!1,this.lever.flips++,this.events.push("lever"))}}pushCircle(t){let e=this.pose,i=t.x-e.x,s=t.y-e.y,r=i*-Math.sin(e.h)+s*Math.cos(e.h),l=i*Math.cos(e.h)+s*Math.sin(e.h),f=T(r,-k.back,k.front),o=T(l,-k.half,k.half),h=r-f,y=l-o,c=Math.hypot(h,y);if(c>=t.r)return!1;let u,p;c<1e-6?(u=r>=0?k.front+t.r:-k.back-t.r,p=l):(u=f+h/c*t.r,p=o+y/c*t.r);let M=this.local2world(u,p);return t.x=M.x,t.y=M.y,!0}pushBox(){let t=this.box,e=this.pose,i=t.x-e.x,s=t.y-e.y,r=i*-Math.sin(e.h)+s*Math.cos(e.h),l=i*Math.cos(e.h)+s*Math.sin(e.h),f=T(r,-k.back,k.front),o=T(l,-k.half,k.half),h=r-f,y=l-o,c=Math.hypot(h,y);if(c>=t.r)return;let u,p;c<1e-6?(u=r>=0?k.front+t.r:-k.back-t.r,p=l):(u=f+h/c*t.r,p=o+y/c*t.r);let M=this.local2world(u,p);t.x=T(M.x,t.r,2362-t.r),t.y=T(M.y,t.r,1143-t.r)}boxInZone(t){return!!this.box&&this.box.x>=t.x0&&this.box.x<=t.x1&&this.box.y>=t.y0&&this.box.y<=t.y1}get heading(){return this.yawDeciWorld()/10}yawDeciWorld(){let t=this.pose.h*180/Math.PI;return Math.round((((t+180)%360+360)%360-180)*10)}snapshot(){let t={};for(let[e,i]of Object.entries(this.motors))t[e]=Math.round(i.pos);return{t:this.t,pose:{x:this.pose.x,y:this.pose.y,h:this.pose.h},motors:t,matrix:this.matrix,box:this.box&&{x:this.box.x,y:this.box.y},lever:this.lever&&{up:this.lever.up,flips:this.lever.flips},sensors:Object.fromEntries(q.filter(e=>String(this.ports[e])==="color").map(e=>[e,this.sensorPoint(e)])),maxLineDist:this.maxLineDist,yaw:this.yawDeci(),field:this.field?this.field.snapshot():null}}};var mt={"hub.py":`
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
`};var Pt=["A","B","C","D","E","F"],ut={1:"0101011111111110111000100",2:"0000001010011100010000000",3:"0000001010000001000101110",4:"0000001010000000111000000",5:"0000001010000000111010001",13:"0000000001000101010001000",14:"1000101010001000101010001",43:"1111110001100011000111111"};async function yt({code:n,preset:t,speed:e=1,loadMicroPython:i,wasmUrl:s,post:r,onSim:l,now:f=()=>performance.now()}){let o=new H(t);o.field&&await o.field.load(t.matUrl||String(s||"").replace(/micropython\.wasm$/,"bioglow/mat.jpg")),l&&l(o);let h=!1,y=f(),c=[],u=0,p=()=>(f()-y)/1e3*e,M=(a={})=>r({type:"state",state:o.snapshot(),...a});function v(){if(h)return;let a=p(),d=0;for(;o.t+B<=a&&d<6e3;){o.step(B),d++;for(let _=c.length-1;_>=0;_--)c[_].t<=o.t&&c.splice(_,1)[0].resolve(0)}d>=6e3&&(y=f()-o.t*1e3/e),f()-u>33&&(u=f(),M());for(let _ of o.events.splice(0))r({type:"event",event:_})}let b=a=>{let d=Pt[a];if(d===void 0)throw new Error("\u041D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043D\u044B\u0439 \u043F\u043E\u0440\u0442: "+a);return d},x=a=>new Promise(d=>c.push({t:o.t+Math.max(0,a)/1e3,resolve:d})),m=a=>(...d)=>{if(v(),o.matchOver)throw new Error("SystemExit: \u0432\u0440\u0435\u043C\u044F \u043C\u0430\u0442\u0447\u0430 2:30 \u0432\u044B\u0448\u043B\u043E");return a(...d)},C=a=>a===0||a===4?"coast":"brake",R=a=>H.steer(a),j={now:()=>(v(),Math.round(o.t*1e3)),sleep:m(a=>x(a)),tick:m(()=>x(B*1e3)),m_run:m((a,d,_)=>o.motorRun(b(a),d,_)),m_stop:m((a,d)=>o.motorStop(b(a),C(d))),m_deg:m((a,d,_,w,A)=>o.motorForDegrees(b(a),d,_,w,A)),m_time:m((a,d,_,w)=>(o.motorRun(b(a),_,w),x(d).then(()=>(o.motorStop(b(a)),0)))),m_rel:m((a,d,_)=>o.motorToRelative(b(a),d,_)),m_abs:m((a,d,_)=>{let A=(o.motor(b(a)).pos%360+360)%360,S=d-A;return S>180&&(S-=360),S<-180&&(S+=360),o.motorForDegrees(b(a),S,Math.abs(_))}),m_relpos:m(a=>Math.round(o.motor(b(a)).pos-o.motor(b(a)).offset)),m_reset:m((a,d)=>{let _=o.motor(b(a));_.offset=_.pos-d}),m_abspos:m(a=>(Math.round(o.motor(b(a)).pos)%360+540)%360-180),m_vel:m(a=>Math.round(o.motor(b(a)).vel)),p_pair:m((a,d,_)=>{o.pairs[a]=[b(d),b(_)],o.motor(b(d)),o.motor(b(_))}),p_unpair:m(a=>{delete o.pairs[a]}),p_move:m((a,d,_,w)=>{let[A,S]=R(d);o.pairMove(a,_*A,_*S,w)}),p_tank:m((a,d,_,w)=>o.pairMove(a,d,_,w)),p_stop:m((a,d)=>o.pairStop(a,C(d))),p_deg:m((a,d,_,w,A,S)=>{let[D,_t]=R(_);return o.pairForDegrees(a,d,D,_t,w,A,S)}),p_tank_deg:m((a,d,_,w,A,S)=>{let D=Math.max(Math.abs(_),Math.abs(w))||1;return o.pairForDegrees(a,d,_/D,w/D,D,A,S)}),p_time:m((a,d,_,w,A)=>{let[S,D]=R(_);return o.pairMove(a,w*S,w*D,A),x(d).then(()=>(o.pairStop(a),0))}),p_tank_time:m((a,d,_,w,A)=>(o.pairMove(a,_,w,A),x(d).then(()=>(o.pairStop(a),0)))),reflection:m(a=>o.reflection(b(a))),color:m(a=>o.color(b(a))),rgbi:m(a=>o.rgbi(b(a))),distance:m(a=>o.distance(b(a))),force:m(a=>o.force(b(a))),pressed:m(a=>o.forcePressed(b(a))),tilt:m(()=>[o.yawDeci(),0,0]),gyro:m(()=>[0,0,0]),reset_yaw:m(a=>o.resetYaw(a)),button:m(a=>a===1?o.buttons.left?100:0:a===2&&o.buttons.right?100:0),matrix_write:m((a,d,_)=>(o.matrix={text:a,image:null,pixels:null},M(),x(Math.max(1,a.length)*_))),matrix_image:m(a=>{o.matrix={text:"",image:a,pixels:ut[a]?[...ut[a]].map(d=>d==="1"?100:0):null}}),matrix_clear:m(()=>{o.matrix={text:"",image:null,pixels:null}}),matrix_pixel:m((a,d,_)=>{let w=o.matrix.pixels?[...o.matrix.pixels]:new Array(25).fill(0);a>=0&&a<5&&d>=0&&d<5&&(w[d*5+a]=_),o.matrix={text:"",image:null,pixels:w}}),matrix_get:m((a,d)=>o.matrix.pixels&&o.matrix.pixels[d*5+a]||0),matrix_show:m(a=>{o.matrix={text:"",image:null,pixels:Array.from(a).slice(0,25)}}),beep:m((a,d,_)=>(o.beeps.push(a),r({type:"beep",freq:a,ms:d/e,vol:_}),x(d)))},N=[],E=await i({url:s,heapsize:4*1024*1024,pystack:4096,stdout:a=>{o.prints.push(a),r({type:"print",line:a})},stderr:a=>N.push(a),linebuffer:!0});try{E.FS.mkdir("/lib")}catch{}for(let[a,d]of Object.entries(mt))E.FS.writeFile("/lib/"+a,d);E.registerJsModule("_sim",j);let L=setInterval(v,4);y=f();let F=null;try{await E.runPythonAsync(n),await E.runPythonAsync(`import runloop as _rl
import asyncio as _aio
if _rl._tasks:
    await _aio.gather(*_rl._tasks)
`)}catch(a){F=String(a&&a.message||a)+(N.length?`
`+N.join(`
`):"")}v();for(let a of q)o.motors[a]&&(o.cancelJob(o.motors[a]),o.motors[a].cmd=0,o.motors[a].decel=12e3);if(o.pairJob){let a=o.pairJob.resolve;o.pairJob=null,a(3)}let Z=o.t+.4;for(;o.t<Z;)o.step(B);return clearInterval(L),h=!0,r({type:"state",state:o.snapshot()}),r({type:"done",error:F,prints:o.prints.length,beeps:o.beeps.length}),{sim:o,error:F}}self.onmessage=async n=>{let t=n.data;if(t.type==="start")try{let e=await import(t.mjsUrl),i=await yt({code:t.code,preset:t.preset,speed:t.speed||1,wasmUrl:t.wasmUrl,loadMicroPython:e.loadMicroPython,post:s=>self.postMessage(s),onSim:s=>{self.__sim=s}})}catch(e){self.postMessage({type:"done",error:String(e&&e.message||e)})}else t.type==="button"&&self.__sim&&(self.__sim.buttons[t.which]=t.down)};
