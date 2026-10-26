var Z={white:[246,246,240],black:[28,28,30],red:[214,40,40],blue:[37,99,235],green:[22,160,74],yellow:[250,204,21],homeL:[255,237,213],homeR:[219,234,254],orange:[234,88,12],gray:[203,213,225],zone:[226,232,240]},I={BLACK:0,MAGENTA:1,PURPLE:2,BLUE:3,AZURE:4,TURQUOISE:5,GREEN:6,YELLOW:7,ORANGE:8,RED:9,WHITE:10,UNKNOWN:-1};function Q(n,t,e,s,o=40){let r=[];for(let l=0;l<=o;l++){let f=l/o,i=1-f;r.push([i*i*i*n[0]+3*i*i*f*t[0]+3*i*f*f*e[0]+f*f*f*s[0],i*i*i*n[1]+3*i*i*f*t[1]+3*i*f*f*e[1]+f*f*f*s[1]])}return r}var V=[...Q([450,640],[700,640],[800,900],[1050,900]),...Q([1050,900],[1300,900],[1350,640],[1600,640]).slice(1),...Q([1600,640],[1800,640],[1850,820],[1900,860]).slice(1)],Mt=[{t:"rect",x0:0,y0:0,x1:380,y1:320,c:"homeL",label:"\u0414\u041E\u041C: \u041B\u0415\u0412\u0410\u042F"},{t:"rect",x0:1982,y0:0,x1:2362,y1:320,c:"homeR",label:"\u0414\u041E\u041C: \u041F\u0420\u0410\u0412\u0410\u042F"},{t:"frame",x0:0,y0:0,x1:380,y1:320,w:10,c:"orange"},{t:"frame",x0:1982,y0:0,x1:2362,y1:320,w:10,c:"blue"},{t:"seg",a:[450,60],b:[450,300],w:8,c:"black"},...Array.from({length:11},(n,t)=>({t:"seg",a:[550+t*100,60],b:[550+t*100,t%5===4?140:100],w:4,c:"black"})),{t:"seg",a:[450,60],b:[1550,60],w:4,c:"black"},{t:"seg",a:[450,430],b:[2e3,430],w:20,c:"black"},{t:"poly",pts:V,w:20,c:"black"},{t:"rect",x0:1880,y0:820,x1:1990,y1:930,c:"green"},{t:"rect",x0:450,y0:960,x1:600,y1:1110,c:"red"},{t:"rect",x0:700,y0:960,x1:850,y1:1110,c:"blue"},{t:"rect",x0:950,y0:960,x1:1100,y1:1110,c:"yellow"},{t:"rect",x0:1200,y0:960,x1:1350,y1:1110,c:"green"},{t:"rect",x0:1600,y0:120,x1:1850,y1:320,c:"zone"},{t:"frame",x0:1600,y0:120,x1:1850,y1:320,w:6,c:"gray"}];var lt=(n,t,e,s)=>{let o=s[0]-e[0],r=s[1]-e[1],l=o*o+r*r,f=l?Math.max(0,Math.min(1,((n-e[0])*o+(t-e[1])*r)/l)):0;return Math.hypot(n-(e[0]+o*f),t-(e[1]+r*f))};function Y(n,t,e){let s=1/0;for(let o=1;o<e.length;o++)s=Math.min(s,lt(n,t,e[o-1],e[o]));return s}function _t(n,t,e){return n.t==="rect"?t>=n.x0&&t<=n.x1&&e>=n.y0&&e<=n.y1:n.t==="frame"?t>=n.x0&&t<=n.x1&&e>=n.y0&&e<=n.y1?t-n.x0<n.w||n.x1-t<n.w||e-n.y0<n.w||n.y1-e<n.w:!1:n.t==="seg"?lt(t,e,n.a,n.b)<=n.w/2:n.t==="poly"?Y(t,e,n.pts)<=n.w/2:!1}function kt(n,t){if(n<0||t<0||n>2362||t>1143)return Z.gray;let e=Z.white;for(let s of Mt)_t(s,n,t)&&(e=Z[s.c]);return e}var at=Array.from({length:64},(n,t)=>{let e=7*Math.sqrt((t+.5)/64),s=t*2.399963;return[e*Math.cos(s),e*Math.sin(s)]});function ht(n,t){let e=0,s=0,o=0;for(let[l,f]of at){let i=kt(n+l,t+f);e+=i[0],s+=i[1],o+=i[2]}let r=at.length;return[e/r,s/r,o/r]}function tt(n){let t=(.3*n[0]+.59*n[1]+.11*n[2])/255;return Math.max(0,Math.min(100,Math.round(t*97+1)))}function et(n){let[t,e,s]=n,o=Math.max(t,e,s),r=Math.min(t,e,s),l=o/255,f=o?(o-r)/o:0;if(l<.25)return I.BLACK;if(f<.25)return l>.7?I.WHITE:I.UNKNOWN;let i;return o===t?i=(60*((e-s)/(o-r))+360)%360:o===e?i=60*((s-t)/(o-r))+120:i=60*((t-e)/(o-r))+240,i<15||i>=340?I.RED:i<40?I.ORANGE:i<70?I.YELLOW:i<160?I.GREEN:i<200?I.AZURE:i<260?I.BLUE:I.MAGENTA}var K={mine:{ru:"\u0428\u0430\u0445\u0442\u0430",x:1889,y:1043,w:124,h:124,a:-40,dir:50},city:{ru:"\u0413\u043E\u0440\u043E\u0434",x:1283,y:96,w:92,h:135,a:0,dir:270},farm:{ru:"\u0424\u0435\u0440\u043C\u0430",x:1002,y:630,w:90,h:132,a:0,dir:90}},xt={mine:15,city:14,farm:13},ot={mine:"canopy",city:"skylight",farm:"hatch"},D=n=>n*Math.PI/180,x=(n,t,e,s,o=0)=>({k:"box",x:n+181,y:t,w:e,h:s,a:o}),C=(n,t,e)=>({k:"circle",x:n+181,y:t,r:e}),H=(n,t,e,s,o)=>({k:"box",x:n+181,y:t,w:o,h:s,a:e-90,dir:e});function $(n,t,e){let s=t-n.x,o=e-n.y,r=Math.cos(D(-(n.a||0))),l=Math.sin(D(-(n.a||0)));return[s*r-o*l,s*l+o*r]}function O(n,t,e,s=0){if(n.k==="circle")return Math.hypot(t-n.x,e-n.y)<=n.r+s;let[o,r]=$(n,t,e);return Math.abs(o)<=n.w/2+s&&Math.abs(r)<=n.h/2+s}function ft(n,t,e){if(n.k==="circle"){let c=t-n.x,y=e-n.y,b=Math.hypot(c,y);return b>=n.r?null:b<1e-6?{nx:1,ny:0,d:n.r}:{nx:c/b,ny:y/b,d:n.r-b}}let[s,o]=$(n,t,e),r=n.w/2-Math.abs(s),l=n.h/2-Math.abs(o);if(r<=0||l<=0)return null;let f=0,i=0,d;r<l?(f=Math.sign(s)||1,d=r):(i=Math.sign(o)||1,d=l);let h=Math.cos(D(n.a||0)),m=Math.sin(D(n.a||0));return{nx:f*h-i*m,ny:f*m+i*h,d}}function gt(n,t,e){let[s,o]=$(n,t,e);return Math.abs(s)>n.w/2||Math.abs(o)>n.h/2?-1:o+n.h/2}function ct(n,t,e,s,o){if(n.k==="circle"){let y=t-n.x,b=e-n.y,g=y*s+b*o,M=y*y+b*b-n.r*n.r,k=g*g-M;if(k<0)return 1/0;let u=-g-Math.sqrt(k);return u>0?u:1/0}let[r,l]=$(n,t,e),f=Math.cos(D(-(n.a||0))),i=Math.sin(D(-(n.a||0))),d=s*f-o*i,h=s*i+o*f,m=-1/0,c=1/0;for(let[y,b,g]of[[r,d,n.w/2],[l,h,n.h/2]]){if(Math.abs(b)<1e-9){if(Math.abs(y)>g)return 1/0;continue}let M=(-g-y)/b,k=(g-y)/b;M>k&&([M,k]=[k,M]),m=Math.max(m,M),c=Math.min(c,k)}return m<=c&&m>0?m:1/0}var G=(n,t=0)=>{let e=K[n];return x(e.x,e.y,e.w+t,e.h+t,e.a)};function st(n,t=0,e=0){let s=K[n],o=D(s.dir+180),r=D(s.dir+90),l=s.dir%180===90?s.h/2:s.w/2;return[181+s.x+Math.cos(o)*(l+e)+Math.cos(r)*t,s.y+Math.sin(o)*(l+e)+Math.sin(r)*t]}var X=class{constructor(t={}){this.docks={...xt,...t.docks||{}},this.s={droneUp:!1,mapFlipped:!1,seedsOut:!1,flagDown:!1,rockFlipped:!1,rockBack:!1,leaf1:!1,leaf2:!1,katydidMoved:!1,katydidOut:!1,root:0,myc:0,vine:!1,platform:!1,camera:!1,treeSeed:!1,spiderMoved:!1,snailMoved:!1,cover:!1,cane:!1,tie:"tree",trees:!1,canopy:!1,skylight:0,hatch:!1,fragments:3,antHome:!1},this.objs=[{id:"scan",kind:"scan",x:1334,y:165,r:16},{id:"keystone",kind:"keystone",x:t.keystone?t.keystone.x:520,y:t.keystone?t.keystone.y:300,r:40}],this.tools={C:{down:!1,tip:null},D:{down:!1,tip:null}},this.carry=null,this.events=[],this.pixels=null,this.build();for(let[e,s]of Object.entries(t.fieldState||{}))this.s[e]=s}build(){let t=this.docks,e=r=>Object.keys(t).find(l=>t[l]===r);this.dockOf=e,this.solids=[C(1153,61,34),x(639,543,52,52,45),x(80,661,120,56),x(135,1030,110,100),x(406,1112,40,52),C(578,1075,58),x(1520,1078,100,110),x(1662,1102,50,60),x(1409,596,78,78,45),C(1940,757,32),x(1941,546,30,60)];let s=e(15);s&&this.solids.push(G(s)),this.fragile=[{key:"spiderMoved",s:C(752,1050,22)},{key:"snailMoved",s:C(1044,723,26)}];let o=[];o.push({m:1,kind:"push",z:H(1098,61,0,40,90),need:12,act:()=>{this.s.droneUp||(this.s.droneUp=!0,this.ev("\u0414\u0440\u043E\u043D \u0432\u0437\u043B\u0435\u0442\u0435\u043B"))}}),o.push({m:1,kind:"down",z:x(1153,128,70,50),act:()=>{this.s.droneUp&&!this.s.mapFlipped&&(this.s.mapFlipped=!0,this.ev("\u041A\u0430\u0440\u0442\u0430 LiDAR \u043F\u0435\u0440\u0435\u0432\u0435\u0440\u043D\u0443\u0442\u0430"))}}),o.push({m:2,kind:"touch",z:C(639,543,62),act:()=>this.releaseSeeds()}),o.push({m:3,kind:"push",z:H(158,661,180,36,56),need:10,act:()=>{this.s.flagDown||(this.s.flagDown=!0,this.s.rockFlipped=!0,this.ev("\u0424\u043B\u0430\u0436\u043E\u043A \u043E\u043F\u0443\u0449\u0435\u043D"))}}),o.push({m:3,kind:"down",z:x(80,661,90,60),act:()=>{this.s.rockFlipped&&!this.s.rockBack&&(this.s.rockBack=!0,this.ev("\u041A\u0430\u043C\u0435\u043D\u044C \u043D\u0430 \u043C\u0435\u0441\u0442\u0435"))}}),o.push({m:4,kind:"up",z:x(100,965,30,30),act:()=>{this.s.leaf1||(this.s.leaf1=!0,this.ev("\u041B\u0438\u0441\u0442 \u0441\u043D\u044F\u0442"))}}),o.push({m:4,kind:"up",z:x(170,965,30,30),act:()=>{this.s.leaf2||(this.s.leaf2=!0,this.ev("\u041B\u0438\u0441\u0442 \u0441\u043D\u044F\u0442"))}}),o.push({m:4,kind:"updown",z:x(135,965,22,30),act:()=>{this.s.katydidMoved=!0}}),o.push({m:5,kind:"push",z:H(406,1061,90,50,50),need:15,depth:r=>{this.s.root=Math.max(this.s.root,r>=38?2:1)}}),o.push({m:6,kind:"down",z:x(1606,1048,60,64),act:()=>{this.s.antHome||(this.s.antHome=!0,Math.abs(this.robotSpeed)>330?(this.s.fragments=0,this.ev("\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u0431\u044B\u0441\u0442\u0440\u043E: \u043B\u0438\u0441\u0442\u044C\u044F \u0440\u0430\u0441\u0441\u044B\u043F\u0430\u043B\u0438\u0441\u044C")):this.ev("\u041C\u0443\u0440\u0430\u0432\u0435\u0439 \u0432 \u0433\u043D\u0435\u0437\u0434\u0435"))}}),o.push({m:7,kind:"push",z:H(1662,1052,90,40,50),need:25,act:()=>{this.s.myc||(this.s.myc=1,this.ev("\u041C\u0438\u0446\u0435\u043B\u0438\u0439 \u0432\u044B\u0442\u044F\u043D\u0443\u0442"))}}),o.push({m:8,kind:"down",z:x(578,1e3,50,30),act:()=>{this.s.vine||(this.s.vine=!0,this.ev("\u041B\u0438\u0430\u043D\u0430 \u043D\u0430 \u043C\u0430\u0442\u0435"))}}),o.push({m:9,kind:"up",z:x(505,1062,30,60),act:()=>{this.s.platform||(this.s.platform=!0,this.ev("\u041F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0430 \u043F\u043E\u0434\u043D\u044F\u0442\u0430"))}}),o.push({m:9,kind:"down",z:x(652,1062,34,50),act:()=>{this.s.camera||(this.s.camera=!0,this.ev("\u0424\u043E\u0442\u043E\u043B\u043E\u0432\u0443\u0448\u043A\u0430 \u0443\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u0430"))}}),o.push({m:9,kind:"down",z:x(622,1012,30,30),act:()=>this.dropTreeSeed()}),o.push({m:11,kind:"down",z:x(1368,556,34,40,45),act:()=>{this.s.cover||(this.s.cover=!0,this.ev("\u041E\u043A\u043D\u043E \u043E\u0442\u043A\u0440\u044B\u0442\u043E"))}}),o.push({m:12,kind:"up",z:x(1896,757,30,50),act:()=>{this.s.cane||(this.s.cane=!0,this.ev("\u041F\u043E\u0434\u043F\u043E\u0440\u043A\u0430 \u043F\u043E\u0434\u043D\u044F\u0442\u0430"))}}),o.push({m:12,kind:"up",z:x(1940,712,40,26),act:()=>{this.s.tie==="tree"&&(this.s.tie="robot",this.ev("\u0421\u0442\u044F\u0436\u043A\u0430 \u043D\u0430 \u043D\u0430\u0432\u0435\u0441\u043D\u043E\u043C"))}}),o.push({m:12,kind:"down",z:x(1941,546,50,80),act:()=>{this.s.tie==="robot"&&(this.s.tie="post",this.ev("\u0421\u0442\u044F\u0436\u043A\u0430 \u043D\u0430 \u0441\u0442\u043E\u043B\u0431\u0438\u043A\u0435"))}});for(let[r,l]of Object.entries(t)){let f=K[r];if(l===13&&o.push({m:13,kind:"up",z:G(r,30),act:()=>{this.s.trees||(this.s.trees=!0,this.ev("\u041C\u043E\u043B\u043E\u0434\u044B\u0435 \u0434\u0435\u0440\u0435\u0432\u044C\u044F \u043F\u043E\u0434\u043D\u044F\u0442\u044B"))}}),l===15){let[i,d]=st(r,-32,14),[h,m]=st(r,0,18),[c,y]=st(r,32,14);o.push({m:15,kind:"up",z:{k:"box",x:i,y:d,w:30,h:28,a:f.a},act:()=>{this.s.canopy||(this.s.canopy=!0,this.ev("\u041D\u0430\u0432\u0435\u0441 \u0434\u043B\u044F \u0433\u043D\u0435\u0437\u0434 \u043F\u043E\u0434\u043D\u044F\u0442"))}}),o.push({m:15,kind:"push",z:{k:"box",x:h,y:m,w:30,h:36,a:f.dir-90,dir:f.dir},need:14,act:()=>{this.s.skylight||(this.s.skylight=1,this.ev("\u041E\u043A\u043D\u043E \u0441\u0430\u0434\u0430 \u0437\u0430\u0434\u0432\u0438\u043D\u0443\u0442\u043E"))}}),o.push({m:15,kind:"down",z:{k:"box",x:c,y,w:30,h:28,a:f.a},act:()=>{this.s.hatch||(this.s.hatch=!0,this.ev("\u041A\u043E\u043C\u043F\u043E\u0441\u0442\u043D\u044B\u0439 \u043B\u044E\u043A \u043E\u0442\u043A\u0440\u044B\u0442"))}})}}this.triggers=o.map(r=>({...r,t:0}))}ev(t){this.events.push(t)}releaseSeeds(){if(!this.s.seedsOut){this.s.seedsOut=!0;for(let[t,[e,s]]of[[-96,30],[86,72],[12,-102]].entries())this.objs.push({id:"seed"+t,kind:"seed",x:820+e,y:543+s,r:18});this.ev("\u0421\u0435\u043C\u0435\u043D\u0430 \u0432\u044B\u0431\u0440\u043E\u0448\u0435\u043D\u044B")}}dropTreeSeed(){this.s.treeSeed||(this.s.treeSeed=!0,this.objs.push({id:"seed3",kind:"seed",x:803,y:968,r:18}),this.ev("\u0421\u0435\u043C\u0435\u0447\u043A\u043E \u0443\u043F\u0430\u043B\u043E \u0441 \u0434\u0435\u0440\u0435\u0432\u0430"))}async load(t){if(!(!t||this.pixels||typeof fetch>"u"||typeof createImageBitmap>"u"))try{let e=await(await fetch(t)).blob(),s=await createImageBitmap(e),o=typeof OffscreenCanvas<"u"?new OffscreenCanvas(s.width,s.height):null;if(!o)return;let r=o.getContext("2d");r.drawImage(s,0,0),this.pixels={w:s.width,h:s.height,data:r.getImageData(0,0,s.width,s.height).data}}catch{this.pixels=null}}colorAt(t,e){if(t<0||e<0||t>2362||e>1143)return[90,90,90];let s=t-181;if(s<0||s>2e3)return[60,60,62];let o=this.pixels;if(!o)return[235,235,230];let r=Math.min(o.w-1,Math.max(0,Math.floor(s/2e3*o.w))),f=(Math.min(o.h-1,Math.max(0,Math.floor((1-e/1143)*o.h)))*o.w+r)*4;return[o.data[f],o.data[f+1],o.data[f+2]]}bodyPoints(t,e){let s=[];for(let o=-e.half;o<=e.half;o+=20)s.push(t.local2world(e.front,o)),s.push(t.local2world(-e.back,o));for(let o=-e.back+20;o<e.front;o+=25)s.push(t.local2world(o,-e.half)),s.push(t.local2world(o,e.half));return s}collide(t,e){for(let s=0;s<3;s++){let o=0,r=0;for(let l of this.bodyPoints(t,e))for(let f of this.solids){let i=ft(f,l.x,l.y);if(i&&i.d>0){let d=i.nx*i.d,h=i.ny*i.d;Math.abs(d)>Math.abs(o)&&(o=d),Math.abs(h)>Math.abs(r)&&(r=h)}}if(!o&&!r)break;t.pose.x+=o,t.pose.y+=r}}toolTip(t,e,s,o){let r=t.model&&t.model.tools[s]||{off:s==="D"?40:0,reach:110},l=r.reach*Math.sin(Math.max(0,Math.min(180,o))*Math.PI/180);return t.local2world(e.front+Math.max(10,l),r.off)}update(t,e,s){var d;let o=this.s,r=this.bodyPoints(t,e);this.robotSpeed=t.speedMm||0;let l=[];for(let h=-e.half+10;h<=e.half-10;h+=15)l.push(t.local2world(e.front,h));let f=[];for(let h of Object.keys(t.model&&t.model.tools||{C:1,D:1})){let m=t.motors[h];if(!m||!String(t.ports[h]).startsWith("motor"))continue;let c=(d=this.tools)[h]||(d[h]={down:!1,tip:null}),y=m.pos,b=this.toolTip(t,e,h,y),g=Math.sin(Math.max(0,Math.min(180,y))*Math.PI/180);!c.down&&y>=60?(c.down=!0,c.downTip=b,c.deep=g,c.lastDownTip=b,f.push({kind:"down",tip:b})):c.down&&y<=30&&(c.down=!1,f.push({kind:"up",tip:c.lastDownTip||b})),c.down&&g>=c.deep&&(c.deep=g,c.lastDownTip=b),c.tip=b}for(let h of this.triggers)if(h.kind==="push"){let c=((t.pose.h*180/Math.PI+90-h.z.dir)%360+540)%360-180;if(Math.abs(c)>30||(t.speedMm||0)<15)continue;let y=-1;for(let b of l)y=Math.max(y,gt(h.z,b.x,b.y));h.depth&&y>=h.need&&h.depth(y),!h.depth&&y>=h.need&&h.act()}else if(h.kind==="touch"){let m=l.some(c=>O(h.z,c.x,c.y))||Object.values(this.tools).some(c=>c.tip&&O(h.z,c.tip.x,c.tip.y));h.t=m?h.t+s:0,h.t>.12&&h.act()}else for(let m of f)(h.kind===m.kind||h.kind==="updown")&&O(h.z,m.tip.x,m.tip.y,h.kind==="updown"?0:12)&&h.act();let i=C(135,966,16);r.some(h=>O(i,h.x,h.y))&&(o.katydidMoved=!0,l.some(h=>O(i,h.x,h.y,-6))&&(o.katydidOut=!0));for(let h of this.fragile){if(o[h.key])continue;(Object.values(this.tools).some(c=>c.tip&&O(h.s,c.tip.x,c.tip.y,4))||r.some(c=>O(h.s,c.x,c.y,4)))&&(o[h.key]=!0,this.ev("\u041C\u0438\u043A\u0440\u043E\u044D\u043A\u043E\u0441\u0438\u0441\u0442\u0435\u043C\u0430 \u0441\u0434\u0432\u0438\u043D\u0443\u0442\u0430!"))}for(let h of this.objs){t.pushCircle(h);for(let m of this.solids){let c=ft(m,h.x,h.y);c&&(h.x+=c.nx*(c.d+h.r*.2),h.y+=c.ny*(c.d+h.r*.2))}h.x=Math.max(h.r,Math.min(2362-h.r,h.x)),h.y=Math.max(h.r,Math.min(1143-h.r,h.y))}}raycast(t,e,s,o){let r=1/0;for(let l of this.solids)r=Math.min(r,ct(l,t,e,s,o));for(let l of this.objs)r=Math.min(r,ct({k:"circle",x:l.x,y:l.y,r:l.r},t,e,s,o));return r}score(){let t=this.s,e=[],s=this.docks,o=(w,L,z,q)=>e.push({m:w,pts:L,max:z,parts:q}),r=w=>this.objs.find(L=>L.id===w),l=r("scan"),f=x(1052,231,76,76,30),i=l&&O(f,l.x,l.y,l.r*.6);o(1,(t.droneUp?20:0)+(t.droneUp&&t.mapFlipped&&i?10:0),30,[["\u0414\u0440\u043E\u043D \u043D\u0435 \u043A\u0430\u0441\u0430\u0435\u0442\u0441\u044F \u043C\u0430\u0442\u0430",t.droneUp,20],["\u0411\u043E\u043D\u0443\u0441: \u043A\u0430\u0440\u0442\u0430 \u043F\u0435\u0440\u0435\u0432\u0435\u0440\u043D\u0443\u0442\u0430, \u043C\u0435\u0442\u043A\u0430 \u0432 \u0437\u043E\u043D\u0435",t.droneUp&&t.mapFlipped&&i,10]]);let d=this.objs.filter(w=>/^seed[012]$/.test(w.id)&&Math.hypot(w.x-181-639,w.y-543)>48).length;o(2,d*10,30,[["\u0421\u0435\u043C\u0435\u043D\u0430 \u043D\u0435 \u043A\u0430\u0441\u0430\u044E\u0442\u0441\u044F \u0441\u0442\u0435\u0431\u043B\u044F: "+d+" \u0438\u0437 3",d>0,d*10]]),o(3,(t.flagDown?20:0)+(t.flagDown&&t.rockBack?10:0),30,[["\u0424\u043B\u0430\u0436\u043E\u043A \u043E\u043F\u0443\u0449\u0435\u043D",t.flagDown,20],["\u0411\u043E\u043D\u0443\u0441: \u043A\u0430\u043C\u0435\u043D\u044C \u0432\u0435\u0440\u043D\u0443\u043B\u0441\u044F \u043D\u0430 \u043C\u0435\u0441\u0442\u043E",t.flagDown&&t.rockBack,10]]);let h=(t.leaf1?1:0)+(t.leaf2?1:0),m=t.katydidOut?0:(h>=1?10:0)+(h===2&&!t.katydidMoved?20:0);o(4,m,30,[["\u041E\u0434\u0438\u043D \u043B\u0438\u0441\u0442 \u0441\u043D\u044F\u0442",h>=1&&!t.katydidOut,10],["\u0411\u043E\u043D\u0443\u0441: \u0432\u0442\u043E\u0440\u043E\u0439 \u043B\u0438\u0441\u0442, \u043A\u0443\u0437\u043D\u0435\u0447\u0438\u043A \u043D\u0430 \u043C\u0435\u0441\u0442\u0435",h===2&&!t.katydidMoved&&!t.katydidOut,20],...t.katydidOut?[["\u041A\u0443\u0437\u043D\u0435\u0447\u0438\u043A \u0432\u043D\u0435 \u0437\u043E\u043D\u044B: 0 \u043E\u0447\u043A\u043E\u0432 \u0437\u0430 \u043C\u0438\u0441\u0441\u0438\u044E",!1,0]]:[]]),o(5,t.root===2?20:t.root===1?10:0,20,[["\u041A\u043E\u0440\u0435\u043D\u044C \u0432\u044B\u0442\u044F\u043D\u0443\u0442 \u0447\u0430\u0441\u0442\u0438\u0447\u043D\u043E (10) \u0438\u043B\u0438 \u043F\u043E\u043B\u043D\u043E\u0441\u0442\u044C\u044E (20)",t.root>0,t.root===2?20:t.root*10]]);let c=t.antHome?t.fragments*10:0;o(6,c,30,[["\u041C\u0443\u0440\u0430\u0432\u0435\u0439 \u0443 \u0433\u043D\u0435\u0437\u0434\u0430, \u043B\u0438\u0441\u0442\u044C\u044F \u0432 \u0433\u043D\u0435\u0437\u0434\u0435: "+(t.antHome?t.fragments:0)+" \u0438\u0437 3",c>0,c]]),o(7,t.myc?20:0,30,[["\u041C\u0438\u0446\u0435\u043B\u0438\u0439 \u043F\u043E\u043B\u043D\u043E\u0441\u0442\u044C\u044E \u0432\u044B\u0442\u044F\u043D\u0443\u0442",!!t.myc,20],["\u0411\u043E\u043D\u0443\u0441 \u0441 \u0441\u043E\u0441\u0435\u0434\u043D\u0438\u043C \u0441\u0442\u043E\u043B\u043E\u043C (\u0432 \u0441\u0438\u043C\u0443\u043B\u044F\u0442\u043E\u0440\u0435 \u043D\u0435\u0442 \u0441\u043E\u043F\u0435\u0440\u043D\u0438\u043A\u0430)",!1,0]]),o(8,t.vine?30:0,30,[["\u041B\u0438\u0430\u043D\u0430 \u043A\u0430\u0441\u0430\u0435\u0442\u0441\u044F \u043C\u0430\u0442\u0430",t.vine,30]]);let y=r("seed3"),b=!!y&&Math.hypot(y.x-181-578,y.y-1075)>64;o(9,(t.platform?10:0)+(t.camera?10:0)+(b?10:0),30,[["\u041F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0430 \u043F\u043E\u0434\u043D\u044F\u0442\u0430",t.platform,10],["\u0424\u043E\u0442\u043E\u043B\u043E\u0432\u0443\u0448\u043A\u0430 \u0443\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u0430",t.camera,10],["\u0421\u0435\u043C\u0435\u0447\u043A\u043E \u043D\u0435 \u043A\u0430\u0441\u0430\u0435\u0442\u0441\u044F \u0434\u0435\u0440\u0435\u0432\u0430",b,10]]),o(10,(t.spiderMoved?0:10)+(t.snailMoved?0:10),20,[["\u0414\u043E\u043C \u043F\u0430\u0443\u043A\u0430 \u043D\u0430 \u043C\u0435\u0441\u0442\u0435",!t.spiderMoved,10],["\u0414\u043E\u043C \u0443\u043B\u0438\u0442\u043A\u0438 \u043D\u0430 \u043C\u0435\u0441\u0442\u0435",!t.snailMoved,10]]),o(11,t.cover?20:0,20,[["\u041A\u0440\u044B\u0448\u043A\u0430 \u043A\u043E\u0440\u043D\u0435\u0439 \u043E\u043F\u0443\u0449\u0435\u043D\u0430 \u0434\u043E \u043C\u0430\u0442\u0430",t.cover,20]]),o(12,(t.cane?20:0)+(t.tie==="post"?10:0),30,[["\u041F\u043E\u0434\u043F\u043E\u0440\u043A\u0430 \u043F\u043E\u0434\u043D\u044F\u0442\u0430 \u0438 \u043A\u0430\u0441\u0430\u0435\u0442\u0441\u044F \u0434\u0435\u0440\u0435\u0432\u0430",t.cane,20],["\u0421\u0442\u044F\u0436\u043A\u0430 \u0432\u043E\u043A\u0440\u0443\u0433 \u0441\u0442\u043E\u043B\u0431\u0438\u043A\u0430",t.tie==="post",10]]);let g=this.dockOf(13),M=this.dockOf(14),k=this.dockOf(15),u=r("keystone"),P=!!(g&&u&&O(G(g,10),u.x,u.y));o(13,P&&t.trees?30:0,30,[["\u041A\u043B\u044E\u0447\u0435\u0432\u043E\u0439 \u0432\u0438\u0434 \u043D\u0430 \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0435",P,0],["\u0438 \u043C\u043E\u043B\u043E\u0434\u044B\u0435 \u0434\u0435\u0440\u0435\u0432\u044C\u044F \u043F\u043E\u0434\u043D\u044F\u0442\u044B",P&&t.trees,30]]);let R=M?this.objs.filter(w=>w.kind==="seed"&&O(G(M,4),w.x,w.y)).length:0;o(14,R*10,40,[["\u0421\u0435\u043C\u0435\u043D\u0430 \u0432 \u0441\u0442\u0430\u043D\u0446\u0438\u0438: "+R+" (5 + 5 \u0431\u043E\u043D\u0443\u0441 \u0437\u0430 \u043A\u0430\u0436\u0434\u043E\u0435)",R>0,R*10]]);let T=k&&(ot[k]==="canopy"&&t.canopy||ot[k]==="skylight"&&t.skylight||ot[k]==="hatch"&&t.hatch);o(15,(t.canopy?10:0)+(t.skylight?10:0)+(t.hatch?10:0)+(T?10:0),40,[["\u041D\u0430\u0432\u0435\u0441 \u0434\u043B\u044F \u0433\u043D\u0435\u0437\u0434 \u043F\u043E\u0434\u043D\u044F\u0442",t.canopy,10],["\u041E\u043A\u043D\u043E \u0441\u0430\u0434\u0430 \u043F\u043E\u043B\u043D\u043E\u0441\u0442\u044C\u044E \u0437\u0430\u0434\u0432\u0438\u043D\u0443\u0442\u043E",!!t.skylight,10],["\u041A\u043E\u043C\u043F\u043E\u0441\u0442\u043D\u044B\u0439 \u043B\u044E\u043A \u043E\u0442\u043A\u0440\u044B\u0442",t.hatch,10],["\u042D\u043A\u043E\u0431\u043E\u043D\u0443\u0441 \u0434\u043E\u043A\u0430 \xAB"+(k?K[k].ru:"-")+"\xBB",!!T,10]]);let N=e.reduce((w,L)=>w+L.pts,0)+50+20;return{rows:e,tokens:50,inspection:20,total:N}}snapshot(){return{s:{...this.s},docks:this.docks,objs:this.objs.map(t=>({id:t.id,kind:t.kind,x:Math.round(t.x),y:Math.round(t.y),r:t.r})),score:this.score()}}};var it={course:{title:"\u0420\u043E\u0431\u043E\u0442 \u043A\u0443\u0440\u0441\u0430",ports:{A:"motor:large",B:"motor:large",C:"motor:medium",D:"motor:medium",E:"color",F:"color"},drive:["A","B"],wheel:56,track:112,body:{front:105,back:75,half:80},sensors:{E:[95,-28],F:[95,28]},tools:{C:{off:0,reach:110,kind:"arm"},D:{off:40,reach:110,kind:"arm"}},hub:{f:-5,r:0,along:!0},roles:{A:"\u043B\u0435\u0432\u043E\u0435 \u043A\u043E\u043B\u0435\u0441\u043E",B:"\u043F\u0440\u0430\u0432\u043E\u0435 \u043A\u043E\u043B\u0435\u0441\u043E",C:"\u043D\u0430\u0432\u0435\u0441\u043D\u043E\u0435 (\u0440\u0443\u043A\u0430)",D:"\u043D\u0430\u0432\u0435\u0441\u043D\u043E\u0435 2",E:"\u043B\u0435\u0432\u044B\u0439 \u0434\u0430\u0442\u0447\u0438\u043A",F:"\u043F\u0440\u0430\u0432\u044B\u0439 \u0434\u0430\u0442\u0447\u0438\u043A"}},"driving-base":{title:"\u041F\u0440\u0438\u0432\u043E\u0434\u043D\u0430\u044F \u0431\u0430\u0437\u0430",ports:{C:"motor:medium",D:"motor:medium",E:"motor:medium",F:"distance",B:"color",A:""},drive:["C","D"],wheel:56,track:113,body:{front:78,back:92,half:64},sensors:{B:[70,0],F:[78,0]},tools:{E:{off:0,reach:95,kind:"arm"}},hub:{f:-10,r:0,along:!0},roles:{C:"\u043B\u0435\u0432\u043E\u0435 \u043A\u043E\u043B\u0435\u0441\u043E",D:"\u043F\u0440\u0430\u0432\u043E\u0435 \u043A\u043E\u043B\u0435\u0441\u043E",E:"\u0440\u0443\u043A\u0430",F:"\u0434\u0430\u0442\u0447\u0438\u043A \u0440\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u044F",B:"\u0434\u0430\u0442\u0447\u0438\u043A \u0446\u0432\u0435\u0442\u0430",A:""}},advanced:{title:"\u041F\u0440\u043E\u0434\u0432\u0438\u043D\u0443\u0442\u0430\u044F \u043F\u0440\u0438\u0432\u043E\u0434\u043D\u0430\u044F \u0431\u0430\u0437\u0430",ports:{A:"motor:large",E:"motor:large",C:"motor:medium",D:"motor:medium",B:"color",F:"color"},drive:["A","E"],wheel:88,track:145,body:{front:112,back:82,half:92},sensors:{B:[92,-34],F:[92,34]},tools:{C:{off:0,reach:70,kind:"dozer"},D:{off:0,reach:120,kind:"lift"}},hub:{f:-12,r:0,along:!1},roles:{A:"\u043B\u0435\u0432\u043E\u0435 \u043A\u043E\u043B\u0435\u0441\u043E",E:"\u043F\u0440\u0430\u0432\u043E\u0435 \u043A\u043E\u043B\u0435\u0441\u043E",C:"\u043E\u0442\u0432\u0430\u043B (\u0431\u0443\u043B\u044C\u0434\u043E\u0437\u0435\u0440)",D:"\u043F\u043E\u0434\u044A\u0435\u043C\u043D\u0430\u044F \u0440\u0443\u043A\u0430",B:"\u043B\u0435\u0432\u044B\u0439 \u0434\u0430\u0442\u0447\u0438\u043A \u0446\u0432\u0435\u0442\u0430",F:"\u043F\u0440\u0430\u0432\u044B\u0439 \u0434\u0430\u0442\u0447\u0438\u043A \u0446\u0432\u0435\u0442\u0430"}}};function dt(n={}){let t=n.robot,e=typeof t=="string"?t:n.robotModel||"course",s=it[e]||it.course,o=JSON.parse(JSON.stringify(s));return o.name=it[e]?e:"course",t&&typeof t=="object"&&Object.assign(o.ports,t),n.sensorPos&&Object.assign(o.sensors,n.sensorPos),o}var vt=Array.from({length:16},(n,t)=>{let e=7*Math.sqrt((t+.5)/16),s=t*2.399963;return[e*Math.cos(s),e*Math.sin(s)]}),wt=56,Lt=Math.PI*wt/360;var Et={large:1050,medium:1110,small:660},U=["A","B","C","D","E","F"],W=.005;var nt=class{constructor(t){this.kind=t,this.pos=0,this.vel=0,this.cmd=0,this.accel=1e3,this.decel=1e3,this.job=null,this.offset=0}get max(){return Et[this.kind]||1050}},E=(n,t,e)=>Math.max(t,Math.min(e,n)),At={marker:24,cube:24,crate:30,baton:10},rt=(n,t,e,s,o)=>{let r=Math.abs(t)>Math.abs(n)&&Math.sign(t||1)===Math.sign(n||t||1)?e:s,l=t-n,f=r*o;return Math.abs(l)<=f?t:n+Math.sign(l)*f},pt=(n,t,e)=>Math.sign(n)*Math.min(t,Math.sqrt(2*e*Math.abs(n))),J=class{constructor(t={}){this.preset=t,this.model=dt(t),this.ports=this.model.ports,this.body=this.model.body,this.mmPerDeg=Math.PI*this.model.wheel/360;let e=t.start||{x:190,y:150,h:-90};this.pose={x:e.x,y:e.y,h:(e.h||0)*Math.PI/180},this.drift=t.drift||0,this.motors={};for(let s of U)String(this.ports[s]).startsWith("motor")&&(this.motors[s]=new nt(this.ports[s].split(":")[1]||"medium"));this.pairs={},this.pairJob=null,this.t=0,this.yawOffset=this.pose.h,this.matrix={text:"",image:null,pixels:null},this.prints=[],this.beeps=[],this.buttons={left:!1,right:!1},this.box=t.box?{...t.box,r:55}:null,this.lever=t.lever?{...t.lever,up:!0,flips:0}:null,this.trail=[[this.pose.x,this.pose.y]],this.trailT=0,this.maxLineDist=0,this.events=[],this.field=t.field==="bioglow"?new X(t):null,this.speedMm=0,this.objects=(t.objects||[]).map((s,o)=>({id:s.id||s.kind+o,kind:s.kind,x:s.x,y:s.y,r:s.r||At[s.kind]||25,fixed:s.kind==="marker"||!!s.fixed,touched:!1,carried:null,lifted:!1})),this.toolState={}}spot(t,e){if(!this.field)return ht(t,e);let s=0,o=0,r=0;for(let[l,f]of vt){let i=this.field.colorAt(t+l,e+f);s+=i[0],o+=i[1],r+=i[2]}return[s/16,o/16,r/16]}device(t){return this.ports[t]}motor(t){let e=this.motors[t];if(!e)throw new Error(`\u041D\u0430 \u043F\u043E\u0440\u0442\u0443 ${t} \u043D\u0435\u0442 \u043C\u043E\u0442\u043E\u0440\u0430 (\u0442\u0430\u043C: ${this.ports[t]||"\u043F\u0443\u0441\u0442\u043E"})`);return e}motorRun(t,e,s=1e3){let o=this.motor(t);this.releasePair(t),this.cancelJob(o),o.cmd=E(e,-o.max,o.max),o.accel=s,o.decel=s}motorStop(t,e="brake"){let s=this.motor(t);this.releasePair(t),this.cancelJob(s),s.cmd=0,s.decel=e==="coast"?1500:12e3}motorForDegrees(t,e,s,o=1e3,r=1e3){let l=this.motor(t);this.releasePair(t),this.cancelJob(l);let f=Math.sign(e||1)*Math.sign(s||1);return new Promise(i=>{l.job={target:l.pos+Math.abs(e)*f,vmax:Math.min(Math.abs(s),l.max),accel:o,decel:r,resolve:i}})}motorToRelative(t,e,s){let o=this.motor(t);return this.releasePair(t),this.cancelJob(o),new Promise(r=>{o.job={target:e+o.offset,vmax:Math.min(Math.abs(s),o.max),accel:1e3,decel:1e3,resolve:r}})}cancelJob(t){if(t.job){let e=t.job.resolve;t.job=null,e(3)}}releasePair(t){if(this.pairJob&&this.pairJob.ports.includes(t)){let e=this.pairJob.resolve;this.pairJob=null,e&&e(3)}}pairPorts(t){let e=this.pairs[t];if(!e)throw new Error("\u041F\u0430\u0440\u0430 \u043C\u043E\u0442\u043E\u0440\u043E\u0432 \u043D\u0435 \u043D\u0430\u0441\u0442\u0440\u043E\u0435\u043D\u0430: \u0441\u043D\u0430\u0447\u0430\u043B\u0430 motor_pair.pair(motor_pair.PAIR_1, port.A, port.B)");return e}static steer(t){return t=E(t,-100,100),t>=0?[1,1-t/50]:[1+t/50,1]}pairMove(t,e,s,o=1e3){let[r,l]=this.pairPorts(t);if(this.pairJob){let d=this.pairJob.resolve;this.pairJob=null,d&&d(3)}let f=this.motor(r),i=this.motor(l);this.cancelJob(f),this.cancelJob(i),f.cmd=E(-e,-f.max,f.max),i.cmd=E(s,-i.max,i.max),f.accel=i.accel=o,f.decel=i.decel=o}pairStop(t,e="brake"){let[s,o]=this.pairPorts(t);if(this.pairJob){let r=this.pairJob.resolve;this.pairJob=null,r&&r(3)}for(let r of[s,o]){let l=this.motor(r);this.cancelJob(l),l.cmd=0,l.decel=e==="coast"?1500:12e3}}pairForDegrees(t,e,s,o,r,l=1e3,f=1e3){let[i,d]=this.pairPorts(t);if(this.pairJob){let b=this.pairJob.resolve;this.pairJob=null,b&&b(3)}let h=this.motor(i),m=this.motor(d);this.cancelJob(h),this.cancelJob(m);let c=Math.max(Math.abs(s),Math.abs(o))||1,y=Math.sign(e||1)*Math.sign(r||1);return new Promise(b=>{this.pairJob={ports:[i,d],A:i,B:d,l:s/c*y,r:o/c*y,total:Math.abs(e),done:0,vp:0,vmax:Math.min(Math.abs(r),h.max),accel:l,decel:f,resolve:b}})}local2world(t,e){let s=this.pose;return{x:s.x-Math.sin(s.h)*t+Math.cos(s.h)*e,y:s.y+Math.cos(s.h)*t+Math.sin(s.h)*e}}sensorPoint(t){let e=this.model.sensors[t]||[this.body.front-10,0];return this.local2world(e[0],e[1])}needDevice(t,e){if(!String(this.ports[t]||"").startsWith(e))throw new Error(`\u041D\u0430 \u043F\u043E\u0440\u0442\u0443 ${t} \u043D\u0435\u0442 \u0443\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432\u0430 \xAB${e}\xBB (\u0442\u0430\u043C: ${this.ports[t]||"\u043F\u0443\u0441\u0442\u043E"})`)}reflection(t){this.needDevice(t,"color");let e=this.sensorPoint(t);return tt(this.spot(e.x,e.y))}color(t){this.needDevice(t,"color");let e=this.sensorPoint(t);return et(this.spot(e.x,e.y))}rgbi(t){this.needDevice(t,"color");let e=this.sensorPoint(t),s=this.spot(e.x,e.y);return[...s.map(o=>Math.round(o*4)),Math.round((s[0]+s[1]+s[2])*4/3)]}distance(t){this.needDevice(t,"distance");let e=this.local2world(this.body.front,0),s=-Math.sin(this.pose.h),o=Math.cos(this.pose.h),r=1/0;s>1e-6&&(r=Math.min(r,(2362-e.x)/s)),s<-1e-6&&(r=Math.min(r,-e.x/s)),o>1e-6&&(r=Math.min(r,(1143-e.y)/o)),o<-1e-6&&(r=Math.min(r,-e.y/o));for(let l of[this.box,this.lever&&{x:this.lever.x,y:this.lever.y,r:40},...this.objects.filter(f=>!f.carried)]){if(!l)continue;let f=e.x-l.x,i=e.y-l.y,d=f*s+i*o,h=f*f+i*i-l.r*l.r,m=d*d-h;if(m>=0){let c=-d-Math.sqrt(m);c>0&&(r=Math.min(r,c))}}return this.field&&(r=Math.min(r,this.field.raycast(e.x,e.y,s,o))),r>2e3?-1:Math.round(r)}forcePressed(t){return this.needDevice(t,"force"),this.frontContact()<3}force(t){return this.needDevice(t,"force"),this.frontContact()<3?60:0}frontContact(){let t=1/0;for(let e of[-this.body.half+10,0,this.body.half-10]){let s=this.local2world(this.body.front,e);t=Math.min(t,s.x,s.y,2362-s.x,1143-s.y),this.box&&(t=Math.min(t,Math.hypot(s.x-this.box.x,s.y-this.box.y)-this.box.r));for(let o of this.objects)o.carried||(t=Math.min(t,Math.hypot(s.x-o.x,s.y-o.y)-o.r));this.field&&(t=Math.min(t,this.field.raycast(this.local2world(this.body.front-5,e).x,this.local2world(this.body.front-5,e).y,-Math.sin(this.pose.h),Math.cos(this.pose.h))-5))}return t}yawDeci(){let t=(this.pose.h-this.yawOffset)*180/Math.PI;return t=((t+180)%360+360)%360-180,Math.round(t*10)}resetYaw(t){this.yawOffset=this.pose.h-t/10*Math.PI/180}step(t=W){if(this.t+=t,this.field&&!this.matchOver&&this.t>=(this.preset.matchTime||150)){this.matchOver=!0;for(let s of Object.values(this.motors))this.cancelJob(s),s.cmd=0,s.decel=12e3;if(this.pairJob){let s=this.pairJob.resolve;this.pairJob=null,s&&s(3)}this.events.push({toast:"\u0412\u0440\u0435\u043C\u044F \u043C\u0430\u0442\u0447\u0430 \u0432\u044B\u0448\u043B\u043E"})}let e=this.pairJob;if(e){let s=e.total-e.done,o=pt(s,e.vmax,e.decel);e.vp=rt(e.vp,o,e.accel,e.decel,t),e.done+=e.vp*t;let r=this.motors[e.A],l=this.motors[e.B];r.vel=-e.vp*e.l,l.vel=e.vp*e.r,r.cmd=r.vel,l.cmd=l.vel,r.pos+=r.vel*t,l.pos+=l.vel*t,e.total-e.done<.5&&Math.abs(e.vp)<60&&(r.vel=l.vel=r.cmd=l.cmd=0,this.pairJob=null,e.resolve(0))}for(let[s,o]of Object.entries(this.motors))if(!(e&&e.ports.includes(s))){if(o.job){let r=o.job,l=r.target-o.pos;o.vel=rt(o.vel,pt(l,r.vmax,r.decel),r.accel,r.decel,t),Math.abs(l)<.5&&Math.abs(o.vel)<60&&(o.pos=r.target,o.vel=0,o.cmd=0,o.job=null,r.resolve(0))}else o.vel=rt(o.vel,o.cmd,o.accel,o.decel,t);o.pos+=o.vel*t}if(this.kinematics(t),this.trailT+=t,this.trailT>.05&&(this.trailT=0,this.trail.push([Math.round(this.pose.x),Math.round(this.pose.y)]),this.trail.length>3e3&&this.trail.shift()),this.preset.trackLine){let s=this.sensorPoint(this.preset.trackLine),o=Y(s.x,s.y,V);this.t>.3&&(this.maxLineDist=Math.max(this.maxLineDist,o))}}kinematics(t){let e=this.pose,s=0,o=0,[r,l]=this.model.drive,f=this.motors[r],i=this.motors[l];f&&(s=-f.vel*this.mmPerDeg*(1-this.drift/2)),i&&(o=i.vel*this.mmPerDeg*(1+this.drift/2));let d=(s+o)/2,h=(o-s)/this.model.track;this.speedMm=d;let m={...e};e.h+=h*t,e.x+=-Math.sin(e.h)*d*t,e.y+=Math.cos(e.h)*d*t;let c=[[this.body.front,-this.body.half],[this.body.front,this.body.half],[-this.body.back,-this.body.half],[-this.body.back,this.body.half]].map(([M,k])=>this.local2world(M,k)),y=0,b=0;for(let M of c)M.x<0&&(y=Math.max(y,-M.x)),M.x>2362&&(y=Math.min(y,2362-M.x)),M.y<0&&(b=Math.max(b,-M.y)),M.y>1143&&(b=Math.min(b,1143-M.y));if(y||b){e.x+=y,e.y+=b;let M=-Math.sin(e.h),k=Math.cos(e.h),u=Math.abs(b)>=Math.abs(y)?[0,Math.sign(b)]:[Math.sign(y),0],P=M*u[0]+k*u[1];if(Math.abs(d)>1&&Math.abs(P)>.6){let T=Math.atan2(u[0]*Math.sign(d),-u[1]*Math.sign(d))-e.h;for(;T>Math.PI;)T-=2*Math.PI;for(;T<-Math.PI;)T+=2*Math.PI;e.h+=E(T,-1,1)*Math.min(1,t*15)}}if(this.field){this.field.collide(this,this.body),this.field.update(this,this.body,t);for(let M of this.field.events.splice(0))this.events.push({toast:M})}this.box&&this.pushBox(m),this.objects.length&&this.updateObjects();let g=Object.keys(this.model.tools)[0];if(this.lever&&g&&this.motors[g]){let M=this.motors[g].pos,k=110*Math.sin(E(M,0,180)*Math.PI/180),u=this.local2world(this.body.front+k,0),P=Math.hypot(u.x-this.lever.x,u.y-this.lever.y);this.lever.up&&P<70&&M>60&&(this.lever.up=!1,this.lever.flips++,this.events.push("lever"))}}readings(){let t={};for(let e of U){let s=String(this.ports[e]||"");try{if(s==="color"){let o=this.sensorPoint(e),r=this.spot(o.x,o.y);t[e]={color:et(r),refl:tt(r)}}else s==="distance"?t[e]={dist:this.distance(e)}:s==="force"?t[e]={force:this.force(e)}:this.motors[e]&&(t[e]={pos:Math.round(this.motors[e].pos),vel:Math.round(this.motors[e].vel)})}catch{}}return t}toolTip(t){let e=this.model.tools[t],s=this.motors[t],o=E(s?s.pos:0,0,180),r=e.reach*Math.sin(o*Math.PI/180);return{...this.local2world(this.body.front+Math.max(8,r),e.off),a:o}}updateObjects(){var t;for(let e of this.objects)if(!e.carried)if(e.fixed){let s={x:this.pose.x,y:this.pose.y},o={x:e.x,y:e.y,r:e.r};this.pushCircle(o)&&(this.pose.x-=o.x-e.x,this.pose.y-=o.y-e.y,e.touched||(e.touched=!0,this.events.push({toast:"\u0420\u043E\u0431\u043E\u0442 \u0437\u0430\u0434\u0435\u043B \u043C\u0435\u0442\u043A\u0443!"})))}else this.pushCircle(e)&&(e.moved=!0);for(let[e,s]of Object.entries(this.model.tools)){if(!this.motors[e])continue;let r=(t=this.toolState)[e]||(t[e]={down:!1}),l=this.toolTip(e);if(s.kind==="dozer"){if(l.a<60)continue;for(let i of this.objects){if(i.fixed||i.carried)continue;let d=i.x-this.pose.x,h=i.y-this.pose.y,m=d*-Math.sin(this.pose.h)+h*Math.cos(this.pose.h),c=d*Math.cos(this.pose.h)+h*Math.sin(this.pose.h),y=this.body.front+s.reach;if(m>this.body.front-5&&m<y+i.r&&Math.abs(c)<this.body.half){let b=this.local2world(y+i.r,c);i.x=b.x,i.y=b.y,i.moved=!0}}continue}if(!r.down&&l.a>=60){r.down=!0;let i=this.objects.find(d=>d.carried===e);if(i)i.carried=null,i.lifted=!1,i.x=l.x,i.y=l.y,this.events.push({toast:"\u041F\u0440\u0435\u0434\u043C\u0435\u0442 \u043E\u0442\u043F\u0443\u0449\u0435\u043D"});else{let d=this.objects.filter(h=>!h.fixed&&!h.carried).sort((h,m)=>Math.hypot(h.x-l.x,h.y-l.y)-Math.hypot(m.x-l.x,m.y-l.y))[0];d&&Math.hypot(d.x-l.x,d.y-l.y)<d.r+30&&(d.carried=e,this.events.push({toast:"\u041F\u0440\u0435\u0434\u043C\u0435\u0442 \u0437\u0430\u0445\u0432\u0430\u0447\u0435\u043D"}))}}else if(r.down&&l.a<=30){r.down=!1;let i=this.objects.find(d=>d.carried===e);i&&(i.lifted=!0)}let f=this.objects.find(i=>i.carried===e);if(f){let i=this.local2world(this.body.front+f.r+4,s.off);f.x=i.x,f.y=i.y}}for(let e of this.objects)e.x=E(e.x,e.r,2362-e.r),e.y=E(e.y,e.r,1143-e.r)}pushCircle(t){let e=this.pose,s=t.x-e.x,o=t.y-e.y,r=s*-Math.sin(e.h)+o*Math.cos(e.h),l=s*Math.cos(e.h)+o*Math.sin(e.h),f=E(r,-this.body.back,this.body.front),i=E(l,-this.body.half,this.body.half),d=r-f,h=l-i,m=Math.hypot(d,h);if(m>=t.r)return!1;let c,y;m<1e-6?(c=r>=0?this.body.front+t.r:-this.body.back-t.r,y=l):(c=f+d/m*t.r,y=i+h/m*t.r);let b=this.local2world(c,y);return t.x=b.x,t.y=b.y,!0}pushBox(){let t=this.box,e=this.pose,s=t.x-e.x,o=t.y-e.y,r=s*-Math.sin(e.h)+o*Math.cos(e.h),l=s*Math.cos(e.h)+o*Math.sin(e.h),f=E(r,-this.body.back,this.body.front),i=E(l,-this.body.half,this.body.half),d=r-f,h=l-i,m=Math.hypot(d,h);if(m>=t.r)return;let c,y;m<1e-6?(c=r>=0?this.body.front+t.r:-this.body.back-t.r,y=l):(c=f+d/m*t.r,y=i+h/m*t.r);let b=this.local2world(c,y);t.x=E(b.x,t.r,2362-t.r),t.y=E(b.y,t.r,1143-t.r)}boxInZone(t){return!!this.box&&this.box.x>=t.x0&&this.box.x<=t.x1&&this.box.y>=t.y0&&this.box.y<=t.y1}get heading(){return this.yawDeciWorld()/10}yawDeciWorld(){let t=this.pose.h*180/Math.PI;return Math.round((((t+180)%360+360)%360-180)*10)}snapshot(){let t={};for(let[e,s]of Object.entries(this.motors))t[e]=Math.round(s.pos);return{t:this.t,pose:{x:this.pose.x,y:this.pose.y,h:this.pose.h},motors:t,matrix:this.matrix,box:this.box&&{x:this.box.x,y:this.box.y},lever:this.lever&&{up:this.lever.up,flips:this.lever.flips},sensors:Object.fromEntries(U.filter(e=>String(this.ports[e])==="color").map(e=>[e,this.sensorPoint(e)])),maxLineDist:this.maxLineDist,yaw:this.yawDeci(),field:this.field?this.field.snapshot():null,objects:this.objects.map(e=>({id:e.id,kind:e.kind,x:e.x,y:e.y,r:e.r,touched:e.touched,carried:e.carried,lifted:e.lifted})),model:this.model.name,front:this.local2world(this.body.front,0),readings:this.readings()}}};var mt={"hub.py":`
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
`};var St=["A","B","C","D","E","F"],ut={1:"0101011111111110111000100",2:"0000001010011100010000000",3:"0000001010000001000101110",4:"0000001010000000111000000",5:"0000001010000000111010001",13:"0000000001000101010001000",14:"1000101010001000101010001",43:"1111110001100011000111111"};async function yt({code:n,preset:t,speed:e=1,loadMicroPython:s,wasmUrl:o,post:r,onSim:l,now:f=()=>performance.now()}){let i=new J(t);i.field&&await i.field.load(t.matUrl||String(o||"").replace(/micropython\.wasm$/,"bioglow/mat.jpg")),l&&l(i);let d=!1,h=f(),m=[],c=0,y=()=>(f()-h)/1e3*e,b=(a={})=>r({type:"state",state:i.snapshot(),...a});function g(){if(d)return;let a=y(),p=0;for(;i.t+W<=a&&p<6e3;){i.step(W),p++;for(let _=m.length-1;_>=0;_--)m[_].t<=i.t&&m.splice(_,1)[0].resolve(0)}p>=6e3&&(h=f()-i.t*1e3/e),f()-c>33&&(c=f(),b());for(let _ of i.events.splice(0))r({type:"event",event:_})}let M=a=>{let p=St[a];if(p===void 0)throw new Error("\u041D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043D\u044B\u0439 \u043F\u043E\u0440\u0442: "+a);return p},k=a=>new Promise(p=>m.push({t:i.t+Math.max(0,a)/1e3,resolve:p})),u=a=>(...p)=>{if(g(),i.matchOver)throw new Error("SystemExit: \u0432\u0440\u0435\u043C\u044F \u043C\u0430\u0442\u0447\u0430 2:30 \u0432\u044B\u0448\u043B\u043E");return a(...p)},P=a=>a===0||a===4?"coast":"brake",R=a=>J.steer(a),T={now:()=>(g(),Math.round(i.t*1e3)),sleep:u(a=>k(a)),tick:u(()=>k(W*1e3)),m_run:u((a,p,_)=>i.motorRun(M(a),p,_)),m_stop:u((a,p)=>i.motorStop(M(a),P(p))),m_deg:u((a,p,_,v,A)=>i.motorForDegrees(M(a),p,_,v,A)),m_time:u((a,p,_,v)=>(i.motorRun(M(a),_,v),k(p).then(()=>(i.motorStop(M(a)),0)))),m_rel:u((a,p,_)=>i.motorToRelative(M(a),p,_)),m_abs:u((a,p,_)=>{let A=(i.motor(M(a)).pos%360+360)%360,S=p-A;return S>180&&(S-=360),S<-180&&(S+=360),i.motorForDegrees(M(a),S,Math.abs(_))}),m_relpos:u(a=>Math.round(i.motor(M(a)).pos-i.motor(M(a)).offset)),m_reset:u((a,p)=>{let _=i.motor(M(a));_.offset=_.pos-p}),m_abspos:u(a=>(Math.round(i.motor(M(a)).pos)%360+540)%360-180),m_vel:u(a=>Math.round(i.motor(M(a)).vel)),p_pair:u((a,p,_)=>{i.pairs[a]=[M(p),M(_)],i.motor(M(p)),i.motor(M(_))}),p_unpair:u(a=>{delete i.pairs[a]}),p_move:u((a,p,_,v)=>{let[A,S]=R(p);i.pairMove(a,_*A,_*S,v)}),p_tank:u((a,p,_,v)=>i.pairMove(a,p,_,v)),p_stop:u((a,p)=>i.pairStop(a,P(p))),p_deg:u((a,p,_,v,A,S)=>{let[j,bt]=R(_);return i.pairForDegrees(a,p,j,bt,v,A,S)}),p_tank_deg:u((a,p,_,v,A,S)=>{let j=Math.max(Math.abs(_),Math.abs(v))||1;return i.pairForDegrees(a,p,_/j,v/j,j,A,S)}),p_time:u((a,p,_,v,A)=>{let[S,j]=R(_);return i.pairMove(a,v*S,v*j,A),k(p).then(()=>(i.pairStop(a),0))}),p_tank_time:u((a,p,_,v,A)=>(i.pairMove(a,_,v,A),k(p).then(()=>(i.pairStop(a),0)))),reflection:u(a=>i.reflection(M(a))),color:u(a=>i.color(M(a))),rgbi:u(a=>i.rgbi(M(a))),distance:u(a=>i.distance(M(a))),force:u(a=>i.force(M(a))),pressed:u(a=>i.forcePressed(M(a))),tilt:u(()=>[i.yawDeci(),0,0]),gyro:u(()=>[0,0,0]),reset_yaw:u(a=>i.resetYaw(a)),button:u(a=>a===1?i.buttons.left?100:0:a===2&&i.buttons.right?100:0),matrix_write:u((a,p,_)=>(i.matrix={text:a,image:null,pixels:null},b(),k(Math.max(1,a.length)*_))),matrix_image:u(a=>{i.matrix={text:"",image:a,pixels:ut[a]?[...ut[a]].map(p=>p==="1"?100:0):null}}),matrix_clear:u(()=>{i.matrix={text:"",image:null,pixels:null}}),matrix_pixel:u((a,p,_)=>{let v=i.matrix.pixels?[...i.matrix.pixels]:new Array(25).fill(0);a>=0&&a<5&&p>=0&&p<5&&(v[p*5+a]=_),i.matrix={text:"",image:null,pixels:v}}),matrix_get:u((a,p)=>i.matrix.pixels&&i.matrix.pixels[p*5+a]||0),matrix_show:u(a=>{i.matrix={text:"",image:null,pixels:Array.from(a).slice(0,25)}}),beep:u((a,p,_)=>(i.beeps.push(a),r({type:"beep",freq:a,ms:p/e,vol:_}),k(p)))},N=[],w=await s({url:o,heapsize:4*1024*1024,pystack:4096,stdout:a=>{i.prints.push(a),r({type:"print",line:a})},stderr:a=>N.push(a),linebuffer:!0});try{w.FS.mkdir("/lib")}catch{}for(let[a,p]of Object.entries(mt))w.FS.writeFile("/lib/"+a,p);w.registerJsModule("_sim",T);let L=setInterval(g,4);h=f();let z=null;try{await w.runPythonAsync(n),await w.runPythonAsync(`import runloop as _rl
import asyncio as _aio
if _rl._tasks:
    await _aio.gather(*_rl._tasks)
`)}catch(a){z=String(a&&a.message||a)+(N.length?`
`+N.join(`
`):"")}g();for(let a of U)i.motors[a]&&(i.cancelJob(i.motors[a]),i.motors[a].cmd=0,i.motors[a].decel=12e3);if(i.pairJob){let a=i.pairJob.resolve;i.pairJob=null,a(3)}let q=i.t+.4;for(;i.t<q;)i.step(W);return clearInterval(L),d=!0,r({type:"state",state:i.snapshot()}),r({type:"done",error:z,prints:i.prints.length,beeps:i.beeps.length}),{sim:i,error:z}}self.onmessage=async n=>{let t=n.data;if(t.type==="start")try{let e=await import(t.mjsUrl),s=await yt({code:t.code,preset:t.preset,speed:t.speed||1,wasmUrl:t.wasmUrl,loadMicroPython:e.loadMicroPython,post:o=>self.postMessage(o),onSim:o=>{self.__sim=o}})}catch(e){self.postMessage({type:"done",error:String(e&&e.message||e)})}else t.type==="button"&&self.__sim&&(self.__sim.buttons[t.which]=t.down)};
