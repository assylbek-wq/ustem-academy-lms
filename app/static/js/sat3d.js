var Lo="186",Ci={LEFT:0,MIDDLE:1,RIGHT:2,ROTATE:0,DOLLY:1,PAN:2},Pi={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},Eu=0,Rc=1,Tu=2;var $r=1,Do=2,Vs=3,Ii=0,Ne=1,Ee=2,Xn=0,Gs=1,ci=2,Cc=3,Pc=4,wu=5;var es=100,Au=101,Ru=102,Cu=103,Pu=104,Iu=200,Lu=201,Du=202,Nu=203,Ic=204,Lc=205,Uu=206,Fu=207,Ou=208,Bu=209,zu=210,ku=211,Hu=212,Vu=213,Gu=214,Ya=0,Za=1,Ja=2,Rs=3,Ka=4,$a=5,ja=6,Qa=7,No=0,Wu=1,Xu=2,Ln=0,Dc=1,Nc=2,Uc=3,ns=4,Fc=5,Oc=6,Bc=7;var zc=300,Li=301,is=302,Uo=303,Fo=304,jr=306,Cs=1e3,Bn=1001,to=1002,He=1003,qu=1004;var Qr=1005;var Xe=1006,Oo=1007;var Di=1008;var an=1009,kc=1010,Hc=1011,Ws=1012,Bo=1013,Dn=1014,yn=1015,Nn=1016,zo=1017,ko=1018,Xs=1020,Vc=35902,Gc=35899,Wc=1021,Xc=1022,vn=1023,kn=1026,Ni=1027,Ho=1028,Vo=1029,Ui=1030,Go=1031;var Wo=1033,ta=33776,ea=33777,na=33778,ia=33779,Xo=35840,qo=35841,Yo=35842,Zo=35843,Jo=36196,Ko=37492,$o=37496,jo=37488,Qo=37489,sa=37490,tl=37491,el=37808,nl=37809,il=37810,sl=37811,rl=37812,al=37813,ol=37814,ll=37815,cl=37816,hl=37817,ul=37818,dl=37819,fl=37820,pl=37821,ml=36492,gl=36494,_l=36495,xl=36283,yl=36284,ra=36285,vl=36286;var pr=2300,eo=2301,Xa=2302,_c=2303,xc=2400,yc=2401,vc=2402;var Yu=3200;var aa=0,Zu=1,hi="",We="srgb",mr="srgb-linear",gr="linear",pe="srgb";var qa=7680;var Ju=519,Ku=512,$u=513,ju=514,Ml=515,Qu=516,td=517,Sl=518,ed=519,qc=35044,oa=35048;var Yc="300 es",An=2e3,Ps=2001;function gf(i){for(let t=i.length-1;t>=0;--t)if(i[t]>=65535)return!0;return!1}function _f(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function _r(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function nd(){let i=_r("canvas");return i.style.display="block",i}var Vh={},Is=null;function xr(...i){let t="THREE."+i.shift();Is?Is("log",t,...i):console.log(t,...i)}function id(i){let t=i[0];if(typeof t=="string"&&t.startsWith("TSL:")){let e=i[1];e&&e.isStackTrace?i[0]+=" "+e.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function zt(...i){i=id(i);let t="THREE."+i.shift();if(Is)Is("warn",t,...i);else{let e=i[0];e&&e.isStackTrace?console.warn(e.getError(t)):console.warn(t,...i)}}function Wt(...i){i=id(i);let t="THREE."+i.shift();if(Is)Is("error",t,...i);else{let e=i[0];e&&e.isStackTrace?console.error(e.getError(t)):console.error(t,...i)}}function Zi(...i){let t=i.join(" ");t in Vh||(Vh[t]=!0,zt(...i))}function sd(i,t,e){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(t,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:n()}}setTimeout(r,e)})}var rd={[Ya]:Za,[Ja]:ja,[Ka]:Qa,[Rs]:$a,[Za]:Ya,[ja]:Ja,[Qa]:Ka,[$a]:Rs},Rn=class{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){let n=this._listeners;return n===void 0?!1:n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){let n=this._listeners;if(n===void 0)return;let s=n[t];if(s!==void 0){let r=s.indexOf(e);r!==-1&&s.splice(r,1)}}dispatchEvent(t){let e=this._listeners;if(e===void 0)return;let n=e[t.type];if(n!==void 0){t.target=this;let s=n.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,t);t.target=null}}},Ze=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Gh=1234567,hr=Math.PI/180,Ls=180/Math.PI;function zn(){let i=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Ze[i&255]+Ze[i>>8&255]+Ze[i>>16&255]+Ze[i>>24&255]+"-"+Ze[t&255]+Ze[t>>8&255]+"-"+Ze[t>>16&15|64]+Ze[t>>24&255]+"-"+Ze[e&63|128]+Ze[e>>8&255]+"-"+Ze[e>>16&255]+Ze[e>>24&255]+Ze[n&255]+Ze[n>>8&255]+Ze[n>>16&255]+Ze[n>>24&255]).toLowerCase()}function Qt(i,t,e){return Math.max(t,Math.min(e,i))}function Zc(i,t){return(i%t+t)%t}function xf(i,t,e,n,s){return n+(i-t)*(s-n)/(e-t)}function yf(i,t,e){return i!==t?(e-i)/(t-i):0}function ur(i,t,e){return(1-e)*i+e*t}function vf(i,t,e,n){return ur(i,t,1-Math.exp(-e*n))}function Mf(i,t=1){return t-Math.abs(Zc(i,t*2)-t)}function Sf(i,t,e){return i<=t?0:i>=e?1:(i=(i-t)/(e-t),i*i*(3-2*i))}function bf(i,t,e){return i<=t?0:i>=e?1:(i=(i-t)/(e-t),i*i*i*(i*(i*6-15)+10))}function Ef(i,t){return i+Math.floor(Math.random()*(t-i+1))}function Tf(i,t){return i+Math.random()*(t-i)}function wf(i){return i*(.5-Math.random())}function Af(i){i!==void 0&&(Gh=i);let t=Gh+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function Rf(i){return i*hr}function Cf(i){return i*Ls}function Pf(i){return i>0&&Number.isInteger(i)&&2**Math.round(Math.log2(i))===i}function If(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function Lf(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function Df(i,t,e,n,s){let r=Math.cos,a=Math.sin,o=r(e/2),l=a(e/2),c=r((t+n)/2),h=a((t+n)/2),d=r((t-n)/2),u=a((t-n)/2),p=r((n-t)/2),g=a((n-t)/2);switch(s){case"XYX":i.set(o*h,l*d,l*u,o*c);break;case"YZY":i.set(l*u,o*h,l*d,o*c);break;case"ZXZ":i.set(l*d,l*u,o*h,o*c);break;case"XZX":i.set(o*h,l*g,l*p,o*c);break;case"YXY":i.set(l*p,o*h,l*g,o*c);break;case"ZYZ":i.set(l*g,l*p,o*h,o*c);break;default:zt("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function wn(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:case Uint8ClampedArray:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function ge(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var Jc={DEG2RAD:hr,RAD2DEG:Ls,generateUUID:zn,clamp:Qt,euclideanModulo:Zc,mapLinear:xf,inverseLerp:yf,lerp:ur,damp:vf,pingpong:Mf,smoothstep:Sf,smootherstep:bf,randInt:Ef,randFloat:Tf,randFloatSpread:wf,seededRandom:Af,degToRad:Rf,radToDeg:Cf,isPowerOfTwo:Pf,ceilPowerOfTwo:If,floorPowerOfTwo:Lf,setQuaternionFromProperEuler:Df,normalize:ge,denormalize:wn},eh=class eh{constructor(t=0,e=0){this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("THREE.Vector2: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let e=this.x,n=this.y,s=t.elements;return this.x=s[0]*e+s[3]*n+s[6],this.y=s[1]*e+s[4]*n+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=Qt(this.x,t.x,e.x),this.y=Qt(this.y,t.y,e.y),this}clampScalar(t,e){return this.x=Qt(this.x,t,e),this.y=Qt(this.y,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Qt(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(Qt(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){let n=Math.cos(e),s=Math.sin(e),r=this.x-t.x,a=this.y-t.y;return this.x=r*n-a*s+t.x,this.y=r*s+a*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};eh.prototype.isVector2=!0;var it=eh,Ke=class{constructor(t=0,e=0,n=0,s=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=s}static slerpFlat(t,e,n,s,r,a,o){let l=n[s+0],c=n[s+1],h=n[s+2],d=n[s+3],u=r[a+0],p=r[a+1],g=r[a+2],S=r[a+3];if(d!==S||l!==u||c!==p||h!==g){let m=l*u+c*p+h*g+d*S;m<0&&(u=-u,p=-p,g=-g,S=-S,m=-m);let f=1-o;if(m<.9995){let M=Math.acos(m),T=Math.sin(M);f=Math.sin(f*M)/T,o=Math.sin(o*M)/T,l=l*f+u*o,c=c*f+p*o,h=h*f+g*o,d=d*f+S*o}else{l=l*f+u*o,c=c*f+p*o,h=h*f+g*o,d=d*f+S*o;let M=1/Math.sqrt(l*l+c*c+h*h+d*d);l*=M,c*=M,h*=M,d*=M}}t[e]=l,t[e+1]=c,t[e+2]=h,t[e+3]=d}static multiplyQuaternionsFlat(t,e,n,s,r,a){let o=n[s],l=n[s+1],c=n[s+2],h=n[s+3],d=r[a],u=r[a+1],p=r[a+2],g=r[a+3];return t[e]=o*g+h*d+l*p-c*u,t[e+1]=l*g+h*u+c*d-o*p,t[e+2]=c*g+h*p+o*u-l*d,t[e+3]=h*g-o*d-l*u-c*p,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,s){return this._x=t,this._y=e,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){let n=t._x,s=t._y,r=t._z,a=t._order,o=Math.cos,l=Math.sin,c=o(n/2),h=o(s/2),d=o(r/2),u=l(n/2),p=l(s/2),g=l(r/2);switch(a){case"XYZ":this._x=u*h*d+c*p*g,this._y=c*p*d-u*h*g,this._z=c*h*g+u*p*d,this._w=c*h*d-u*p*g;break;case"YXZ":this._x=u*h*d+c*p*g,this._y=c*p*d-u*h*g,this._z=c*h*g-u*p*d,this._w=c*h*d+u*p*g;break;case"ZXY":this._x=u*h*d-c*p*g,this._y=c*p*d+u*h*g,this._z=c*h*g+u*p*d,this._w=c*h*d-u*p*g;break;case"ZYX":this._x=u*h*d-c*p*g,this._y=c*p*d+u*h*g,this._z=c*h*g-u*p*d,this._w=c*h*d+u*p*g;break;case"YZX":this._x=u*h*d+c*p*g,this._y=c*p*d+u*h*g,this._z=c*h*g-u*p*d,this._w=c*h*d-u*p*g;break;case"XZY":this._x=u*h*d-c*p*g,this._y=c*p*d-u*h*g,this._z=c*h*g+u*p*d,this._w=c*h*d+u*p*g;break;default:zt("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){let n=e/2,s=Math.sin(n);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){let e=t.elements,n=e[0],s=e[4],r=e[8],a=e[1],o=e[5],l=e[9],c=e[2],h=e[6],d=e[10],u=n+o+d;if(u>0){let p=.5/Math.sqrt(u+1);this._w=.25/p,this._x=(h-l)*p,this._y=(r-c)*p,this._z=(a-s)*p}else if(n>o&&n>d){let p=2*Math.sqrt(1+n-o-d);this._w=(h-l)/p,this._x=.25*p,this._y=(s+a)/p,this._z=(r+c)/p}else if(o>d){let p=2*Math.sqrt(1+o-n-d);this._w=(r-c)/p,this._x=(s+a)/p,this._y=.25*p,this._z=(l+h)/p}else{let p=2*Math.sqrt(1+d-n-o);this._w=(a-s)/p,this._x=(r+c)/p,this._y=(l+h)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<1e-8?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(Qt(this.dot(t),-1,1)))}rotateTowards(t,e){let n=this.angleTo(t);if(n===0)return this;let s=Math.min(1,e/n);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){let n=t._x,s=t._y,r=t._z,a=t._w,o=e._x,l=e._y,c=e._z,h=e._w;return this._x=n*h+a*o+s*c-r*l,this._y=s*h+a*l+r*o-n*c,this._z=r*h+a*c+n*l-s*o,this._w=a*h-n*o-s*l-r*c,this._onChangeCallback(),this}slerp(t,e){let n=t._x,s=t._y,r=t._z,a=t._w,o=this.dot(t);o<0&&(n=-n,s=-s,r=-r,a=-a,o=-o);let l=1-e;if(o<.9995){let c=Math.acos(o),h=Math.sin(c);l=Math.sin(l*c)/h,e=Math.sin(e*c)/h,this._x=this._x*l+n*e,this._y=this._y*l+s*e,this._z=this._z*l+r*e,this._w=this._w*l+a*e,this._onChangeCallback()}else this._x=this._x*l+n*e,this._y=this._y*l+s*e,this._z=this._z*l+r*e,this._w=this._w*l+a*e,this.normalize();return this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){let t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(t),s*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},nh=class nh{constructor(t=0,e=0,n=0){this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("THREE.Vector3: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(Wh.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(Wh.setFromAxisAngle(t,e))}applyMatrix3(t){let e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[3]*n+r[6]*s,this.y=r[1]*e+r[4]*n+r[7]*s,this.z=r[2]*e+r[5]*n+r[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let e=this.x,n=this.y,s=this.z,r=t.elements,a=1/(r[3]*e+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*e+r[4]*n+r[8]*s+r[12])*a,this.y=(r[1]*e+r[5]*n+r[9]*s+r[13])*a,this.z=(r[2]*e+r[6]*n+r[10]*s+r[14])*a,this}applyQuaternion(t){let e=this.x,n=this.y,s=this.z,r=t.x,a=t.y,o=t.z,l=t.w,c=2*(a*s-o*n),h=2*(o*e-r*s),d=2*(r*n-a*e);return this.x=e+l*c+a*d-o*h,this.y=n+l*h+o*c-r*d,this.z=s+l*d+r*h-a*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[4]*n+r[8]*s,this.y=r[1]*e+r[5]*n+r[9]*s,this.z=r[2]*e+r[6]*n+r[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=Qt(this.x,t.x,e.x),this.y=Qt(this.y,t.y,e.y),this.z=Qt(this.z,t.z,e.z),this}clampScalar(t,e){return this.x=Qt(this.x,t,e),this.y=Qt(this.y,t,e),this.z=Qt(this.z,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Qt(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){let n=t.x,s=t.y,r=t.z,a=e.x,o=e.y,l=e.z;return this.x=s*l-r*o,this.y=r*a-n*l,this.z=n*o-s*a,this}projectOnVector(t){let e=t.lengthSq();if(e===0)return this.set(0,0,0);let n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return Xl.copy(this).projectOnVector(t),this.sub(Xl)}reflect(t){return this.sub(Xl.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(Qt(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y,s=this.z-t.z;return e*e+n*n+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){let s=Math.sin(e)*t;return this.x=s*Math.sin(n),this.y=Math.cos(e)*t,this.z=s*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){let e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=s,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=Math.random()*Math.PI*2,e=Math.random()*2-1,n=Math.sqrt(1-e*e);return this.x=n*Math.cos(t),this.y=e,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};nh.prototype.isVector3=!0;var P=nh,Xl=new P,Wh=new Ke,ih=class ih{constructor(t,e,n,s,r,a,o,l,c){this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,a,o,l,c)}set(t,e,n,s,r,a,o,l,c){let h=this.elements;return h[0]=t,h[1]=s,h[2]=o,h[3]=e,h[4]=r,h[5]=l,h[6]=n,h[7]=a,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,s=e.elements,r=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],h=n[4],d=n[7],u=n[2],p=n[5],g=n[8],S=s[0],m=s[3],f=s[6],M=s[1],T=s[4],_=s[7],b=s[2],v=s[5],A=s[8];return r[0]=a*S+o*M+l*b,r[3]=a*m+o*T+l*v,r[6]=a*f+o*_+l*A,r[1]=c*S+h*M+d*b,r[4]=c*m+h*T+d*v,r[7]=c*f+h*_+d*A,r[2]=u*S+p*M+g*b,r[5]=u*m+p*T+g*v,r[8]=u*f+p*_+g*A,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],h=t[8];return e*a*h-e*o*c-n*r*h+n*o*l+s*r*c-s*a*l}invert(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],h=t[8],d=h*a-o*c,u=o*l-h*r,p=c*r-a*l,g=e*d+n*u+s*p;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let S=1/g;return t[0]=d*S,t[1]=(s*c-h*n)*S,t[2]=(o*n-s*a)*S,t[3]=u*S,t[4]=(h*e-s*l)*S,t[5]=(s*r-o*e)*S,t[6]=p*S,t[7]=(n*l-c*e)*S,t[8]=(a*e-n*r)*S,this}transpose(){let t,e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,s,r,a,o){let l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*a+c*o)+a+t,-s*c,s*l,-s*(-c*a+l*o)+o+e,0,0,1),this}scale(t,e){return Zi("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(ql.makeScale(t,e)),this}rotate(t){return Zi("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(ql.makeRotation(-t)),this}translate(t,e){return Zi("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(ql.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){let e=this.elements,n=t.elements;for(let s=0;s<9;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}};ih.prototype.isMatrix3=!0;var Zt=ih,ql=new Zt,Xh=new Zt().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),qh=new Zt().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Nf(){let i={enabled:!0,workingColorSpace:mr,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===pe&&(s.r=ni(s.r),s.g=ni(s.g),s.b=ni(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===pe&&(s.r=As(s.r),s.g=As(s.g),s.b=As(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===hi?gr:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return Zi("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return Zi("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(s,r)}},t=[.64,.33,.3,.6,.15,.06],e=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[mr]:{primaries:t,whitePoint:n,transfer:gr,toXYZ:Xh,fromXYZ:qh,luminanceCoefficients:e,workingColorSpaceConfig:{unpackColorSpace:We},outputColorSpaceConfig:{drawingBufferColorSpace:We}},[We]:{primaries:t,whitePoint:n,transfer:pe,toXYZ:Xh,fromXYZ:qh,luminanceCoefficients:e,outputColorSpaceConfig:{drawingBufferColorSpace:We}}}),i}var re=Nf();function ni(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function As(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var cs,no=class{static getDataURL(t,e="image/png"){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let n;if(t instanceof HTMLCanvasElement)n=t;else{cs===void 0&&(cs=_r("canvas")),cs.width=t.width,cs.height=t.height;let s=cs.getContext("2d");t instanceof ImageData?s.putImageData(t,0,0):s.drawImage(t,0,0,t.width,t.height),n=cs}return n.toDataURL(e)}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){let e=_r("canvas");e.width=t.width,e.height=t.height;let n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);let s=n.getImageData(0,0,t.width,t.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=ni(r[a]/255)*255;return n.putImageData(s,0,0),e}else if(t.data){let e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(ni(e[n]/255)*255):e[n]=ni(e[n]);return{data:e,width:t.width,height:t.height}}else return zt("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}},Uf=0,Ds=class{constructor(t=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:Uf++}),this.uuid=zn(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){let e=this.data;return typeof HTMLVideoElement<"u"&&e instanceof HTMLVideoElement?t.set(e.videoWidth,e.videoHeight,0):typeof VideoFrame<"u"&&e instanceof VideoFrame?t.set(e.displayWidth,e.displayHeight,0):e!==null?t.set(e.width,e.height,e.depth||0):t.set(0,0,0),t}set needsUpdate(t){t===!0&&this.version++}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(Yl(s[a].image)):r.push(Yl(s[a]))}else r=Yl(s);n.url=r}return e||(t.images[this.uuid]=n),n}};function Yl(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?no.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(zt("Texture: Unable to serialize Texture."),{})}var Ff=0,Zl=new P,en=class i extends Rn{constructor(t=i.DEFAULT_IMAGE,e=i.DEFAULT_MAPPING,n=Bn,s=Bn,r=Xe,a=Di,o=vn,l=an,c=i.DEFAULT_ANISOTROPY,h=hi){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Ff++}),this.uuid=zn(),this.name="",this.source=new Ds(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new it(0,0),this.repeat=new it(1,1),this.center=new it(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Zt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(Zl).x}get height(){return this.source.getSize(Zl).y}get depth(){return this.source.getSize(Zl).z}get image(){return this.source.data}set image(t){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.normalized=t.normalized,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(let e in t){let n=t[e];if(n===void 0){zt(`Texture.setValues(): parameter '${e}' has value of undefined.`);continue}let s=this[e];if(s===void 0){zt(`Texture.setValues(): property '${e}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[e]=n}}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==zc)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case Cs:t.x=t.x-Math.floor(t.x);break;case Bn:t.x=t.x<0?0:1;break;case to:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case Cs:t.y=t.y-Math.floor(t.y);break;case Bn:t.y=t.y<0?0:1;break;case to:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}};en.DEFAULT_IMAGE=null;en.DEFAULT_MAPPING=zc;en.DEFAULT_ANISOTROPY=1;var sh=class sh{constructor(t=0,e=0,n=0,s=1){this.x=t,this.y=e,this.z=n,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,s){return this.x=t,this.y=e,this.z=n,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("THREE.Vector4: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let e=this.x,n=this.y,s=this.z,r=this.w,a=t.elements;return this.x=a[0]*e+a[4]*n+a[8]*s+a[12]*r,this.y=a[1]*e+a[5]*n+a[9]*s+a[13]*r,this.z=a[2]*e+a[6]*n+a[10]*s+a[14]*r,this.w=a[3]*e+a[7]*n+a[11]*s+a[15]*r,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,s,r,l=t.elements,c=l[0],h=l[4],d=l[8],u=l[1],p=l[5],g=l[9],S=l[2],m=l[6],f=l[10];if(Math.abs(h-u)<.01&&Math.abs(d-S)<.01&&Math.abs(g-m)<.01){if(Math.abs(h+u)<.1&&Math.abs(d+S)<.1&&Math.abs(g+m)<.1&&Math.abs(c+p+f-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;let T=(c+1)/2,_=(p+1)/2,b=(f+1)/2,v=(h+u)/4,A=(d+S)/4,x=(g+m)/4;return T>_&&T>b?T<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(T),s=v/n,r=A/n):_>b?_<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(_),n=v/s,r=x/s):b<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(b),n=A/r,s=x/r),this.set(n,s,r,e),this}let M=Math.sqrt((m-g)*(m-g)+(d-S)*(d-S)+(u-h)*(u-h));return Math.abs(M)<.001&&(M=1),this.x=(m-g)/M,this.y=(d-S)/M,this.z=(u-h)/M,this.w=Math.acos((c+p+f-1)/2),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=Qt(this.x,t.x,e.x),this.y=Qt(this.y,t.y,e.y),this.z=Qt(this.z,t.z,e.z),this.w=Qt(this.w,t.w,e.w),this}clampScalar(t,e){return this.x=Qt(this.x,t,e),this.y=Qt(this.y,t,e),this.z=Qt(this.z,t,e),this.w=Qt(this.w,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Qt(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};sh.prototype.isVector4=!0;var Te=sh,io=class extends Rn{constructor(t=1,e=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Xe,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=n.depth,this.scissor=new Te(0,0,t,e),this.scissorTest=!1,this.viewport=new Te(0,0,t,e),this.textures=[];let s={width:t,height:e,depth:n.depth},r=new en(s),a=n.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(t={}){let e={minFilter:Xe,generateMipmaps:!1,flipY:!1,internalFormat:null};t.mapping!==void 0&&(e.mapping=t.mapping),t.wrapS!==void 0&&(e.wrapS=t.wrapS),t.wrapT!==void 0&&(e.wrapT=t.wrapT),t.wrapR!==void 0&&(e.wrapR=t.wrapR),t.magFilter!==void 0&&(e.magFilter=t.magFilter),t.minFilter!==void 0&&(e.minFilter=t.minFilter),t.format!==void 0&&(e.format=t.format),t.type!==void 0&&(e.type=t.type),t.anisotropy!==void 0&&(e.anisotropy=t.anisotropy),t.colorSpace!==void 0&&(e.colorSpace=t.colorSpace),t.flipY!==void 0&&(e.flipY=t.flipY),t.generateMipmaps!==void 0&&(e.generateMipmaps=t.generateMipmaps),t.internalFormat!==void 0&&(e.internalFormat=t.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(e)}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),t!==null&&t.renderTarget===null&&(t.renderTarget=this),this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,e,n=1){if(this.width!==t||this.height!==e||this.depth!==n){this.width=t,this.height=e,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=t,this.textures[s].image.height=e,this.textures[s].image.depth=n,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let e=0,n=t.textures.length;e<n;e++){this.textures[e]=t.textures[e].clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;let s=Object.assign({},t.textures[e].image);this.textures[e].source=new Ds(s)}if(this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveColorBuffer=t.resolveColorBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,this.storeMultisampledColorBuffer=t.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=t.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=t.storeMultisampledStencilBuffer,t.depthTexture!==null)if(t.depthTexture.renderTarget===t){let e=t.depthTexture.clone();e.renderTarget=null,this.depthTexture=e}else this.depthTexture=t.depthTexture;return this.samples=t.samples,this.multiview=t.multiview,this.useArrayDepthTexture=t.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},rn=class extends io{constructor(t=1,e=1,n={}){super(t,e,n),this.isWebGLRenderTarget=!0}},yr=class extends en{constructor(t=null,e=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=He,this.minFilter=He,this.wrapR=Bn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}};var so=class extends en{constructor(t=null,e=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=He,this.minFilter=He,this.wrapR=Bn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}};var Io=class Io{constructor(t,e,n,s,r,a,o,l,c,h,d,u,p,g,S,m){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,a,o,l,c,h,d,u,p,g,S,m)}set(t,e,n,s,r,a,o,l,c,h,d,u,p,g,S,m){let f=this.elements;return f[0]=t,f[4]=e,f[8]=n,f[12]=s,f[1]=r,f[5]=a,f[9]=o,f[13]=l,f[2]=c,f[6]=h,f[10]=d,f[14]=u,f[3]=p,f[7]=g,f[11]=S,f[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Io().fromArray(this.elements)}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){let e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){let e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return this.determinantAffine()===0?(t.set(1,0,0),e.set(0,1,0),n.set(0,0,1),this):(t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){if(t.determinantAffine()===0)return this.identity();let e=this.elements,n=t.elements,s=1/hs.setFromMatrixColumn(t,0).length(),r=1/hs.setFromMatrixColumn(t,1).length(),a=1/hs.setFromMatrixColumn(t,2).length();return e[0]=n[0]*s,e[1]=n[1]*s,e[2]=n[2]*s,e[3]=0,e[4]=n[4]*r,e[5]=n[5]*r,e[6]=n[6]*r,e[7]=0,e[8]=n[8]*a,e[9]=n[9]*a,e[10]=n[10]*a,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){let e=this.elements,n=t.x,s=t.y,r=t.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(s),c=Math.sin(s),h=Math.cos(r),d=Math.sin(r);if(t.order==="XYZ"){let u=a*h,p=a*d,g=o*h,S=o*d;e[0]=l*h,e[4]=-l*d,e[8]=c,e[1]=p+g*c,e[5]=u-S*c,e[9]=-o*l,e[2]=S-u*c,e[6]=g+p*c,e[10]=a*l}else if(t.order==="YXZ"){let u=l*h,p=l*d,g=c*h,S=c*d;e[0]=u+S*o,e[4]=g*o-p,e[8]=a*c,e[1]=a*d,e[5]=a*h,e[9]=-o,e[2]=p*o-g,e[6]=S+u*o,e[10]=a*l}else if(t.order==="ZXY"){let u=l*h,p=l*d,g=c*h,S=c*d;e[0]=u-S*o,e[4]=-a*d,e[8]=g+p*o,e[1]=p+g*o,e[5]=a*h,e[9]=S-u*o,e[2]=-a*c,e[6]=o,e[10]=a*l}else if(t.order==="ZYX"){let u=a*h,p=a*d,g=o*h,S=o*d;e[0]=l*h,e[4]=g*c-p,e[8]=u*c+S,e[1]=l*d,e[5]=S*c+u,e[9]=p*c-g,e[2]=-c,e[6]=o*l,e[10]=a*l}else if(t.order==="YZX"){let u=a*l,p=a*c,g=o*l,S=o*c;e[0]=l*h,e[4]=S-u*d,e[8]=g*d+p,e[1]=d,e[5]=a*h,e[9]=-o*h,e[2]=-c*h,e[6]=p*d+g,e[10]=u-S*d}else if(t.order==="XZY"){let u=a*l,p=a*c,g=o*l,S=o*c;e[0]=l*h,e[4]=-d,e[8]=c*h,e[1]=u*d+S,e[5]=a*h,e[9]=p*d-g,e[2]=g*d-p,e[6]=o*h,e[10]=S*d+u}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(Of,t,Bf)}lookAt(t,e,n){let s=this.elements;return hn.subVectors(t,e),hn.lengthSq()===0&&(hn.z=1),hn.normalize(),gi.crossVectors(n,hn),gi.lengthSq()===0&&(Math.abs(n.z)===1?hn.x+=1e-4:hn.z+=1e-4,hn.normalize(),gi.crossVectors(n,hn)),gi.normalize(),xa.crossVectors(hn,gi),s[0]=gi.x,s[4]=xa.x,s[8]=hn.x,s[1]=gi.y,s[5]=xa.y,s[9]=hn.y,s[2]=gi.z,s[6]=xa.z,s[10]=hn.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,s=e.elements,r=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],h=n[1],d=n[5],u=n[9],p=n[13],g=n[2],S=n[6],m=n[10],f=n[14],M=n[3],T=n[7],_=n[11],b=n[15],v=s[0],A=s[4],x=s[8],w=s[12],R=s[1],I=s[5],N=s[9],F=s[13],L=s[2],B=s[6],X=s[10],G=s[14],tt=s[3],Z=s[7],J=s[11],Y=s[15];return r[0]=a*v+o*R+l*L+c*tt,r[4]=a*A+o*I+l*B+c*Z,r[8]=a*x+o*N+l*X+c*J,r[12]=a*w+o*F+l*G+c*Y,r[1]=h*v+d*R+u*L+p*tt,r[5]=h*A+d*I+u*B+p*Z,r[9]=h*x+d*N+u*X+p*J,r[13]=h*w+d*F+u*G+p*Y,r[2]=g*v+S*R+m*L+f*tt,r[6]=g*A+S*I+m*B+f*Z,r[10]=g*x+S*N+m*X+f*J,r[14]=g*w+S*F+m*G+f*Y,r[3]=M*v+T*R+_*L+b*tt,r[7]=M*A+T*I+_*B+b*Z,r[11]=M*x+T*N+_*X+b*J,r[15]=M*w+T*F+_*G+b*Y,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[4],s=t[8],r=t[12],a=t[1],o=t[5],l=t[9],c=t[13],h=t[2],d=t[6],u=t[10],p=t[14],g=t[3],S=t[7],m=t[11],f=t[15],M=l*p-c*u,T=o*p-c*d,_=o*u-l*d,b=a*p-c*h,v=a*u-l*h,A=a*d-o*h;return e*(S*M-m*T+f*_)-n*(g*M-m*b+f*v)+s*(g*T-S*b+f*A)-r*(g*_-S*v+m*A)}determinantAffine(){let t=this.elements,e=t[0],n=t[4],s=t[8],r=t[1],a=t[5],o=t[9],l=t[2],c=t[6],h=t[10];return e*(a*h-o*c)-n*(r*h-o*l)+s*(r*c-a*l)}transpose(){let t=this.elements,e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){let s=this.elements;return t.isVector3?(s[12]=t.x,s[13]=t.y,s[14]=t.z):(s[12]=t,s[13]=e,s[14]=n),this}invert(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],h=t[8],d=t[9],u=t[10],p=t[11],g=t[12],S=t[13],m=t[14],f=t[15],M=e*o-n*a,T=e*l-s*a,_=e*c-r*a,b=n*l-s*o,v=n*c-r*o,A=s*c-r*l,x=h*S-d*g,w=h*m-u*g,R=h*f-p*g,I=d*m-u*S,N=d*f-p*S,F=u*f-p*m,L=M*F-T*N+_*I+b*R-v*w+A*x;if(L===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let B=1/L;return t[0]=(o*F-l*N+c*I)*B,t[1]=(s*N-n*F-r*I)*B,t[2]=(S*A-m*v+f*b)*B,t[3]=(u*v-d*A-p*b)*B,t[4]=(l*R-a*F-c*w)*B,t[5]=(e*F-s*R+r*w)*B,t[6]=(m*_-g*A-f*T)*B,t[7]=(h*A-u*_+p*T)*B,t[8]=(a*N-o*R+c*x)*B,t[9]=(n*R-e*N-r*x)*B,t[10]=(g*v-S*_+f*M)*B,t[11]=(d*_-h*v-p*M)*B,t[12]=(o*w-a*I-l*x)*B,t[13]=(e*I-n*w+s*x)*B,t[14]=(S*T-g*b-m*M)*B,t[15]=(h*b-d*T+u*M)*B,this}scale(t){let e=this.elements,n=t.x,s=t.y,r=t.z;return e[0]*=n,e[4]*=s,e[8]*=r,e[1]*=n,e[5]*=s,e[9]*=r,e[2]*=n,e[6]*=s,e[10]*=r,e[3]*=n,e[7]*=s,e[11]*=r,this}getMaxScaleOnAxis(){let t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,s))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){let e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){let n=Math.cos(e),s=Math.sin(e),r=1-n,a=t.x,o=t.y,l=t.z,c=r*a,h=r*o;return this.set(c*a+n,c*o-s*l,c*l+s*o,0,c*o+s*l,h*o+n,h*l-s*a,0,c*l-s*o,h*l+s*a,r*l*l+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,s,r,a){return this.set(1,n,r,0,t,1,a,0,e,s,1,0,0,0,0,1),this}compose(t,e,n){let s=this.elements,r=e._x,a=e._y,o=e._z,l=e._w,c=r+r,h=a+a,d=o+o,u=r*c,p=r*h,g=r*d,S=a*h,m=a*d,f=o*d,M=l*c,T=l*h,_=l*d,b=n.x,v=n.y,A=n.z;return s[0]=(1-(S+f))*b,s[1]=(p+_)*b,s[2]=(g-T)*b,s[3]=0,s[4]=(p-_)*v,s[5]=(1-(u+f))*v,s[6]=(m+M)*v,s[7]=0,s[8]=(g+T)*A,s[9]=(m-M)*A,s[10]=(1-(u+S))*A,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,e,n){let s=this.elements;t.x=s[12],t.y=s[13],t.z=s[14];let r=this.determinantAffine();if(r===0)return n.set(1,1,1),e.identity(),this;let a=hs.set(s[0],s[1],s[2]).length(),o=hs.set(s[4],s[5],s[6]).length(),l=hs.set(s[8],s[9],s[10]).length();r<0&&(a=-a),bn.copy(this);let c=1/a,h=1/o,d=1/l;return bn.elements[0]*=c,bn.elements[1]*=c,bn.elements[2]*=c,bn.elements[4]*=h,bn.elements[5]*=h,bn.elements[6]*=h,bn.elements[8]*=d,bn.elements[9]*=d,bn.elements[10]*=d,e.setFromRotationMatrix(bn),n.x=a,n.y=o,n.z=l,this}makePerspective(t,e,n,s,r,a,o=An,l=!1){let c=this.elements,h=2*r/(e-t),d=2*r/(n-s),u=(e+t)/(e-t),p=(n+s)/(n-s),g,S;if(l)g=r/(a-r),S=a*r/(a-r);else if(o===An)g=-(a+r)/(a-r),S=-2*a*r/(a-r);else if(o===Ps)g=-a/(a-r),S=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=u,c[12]=0,c[1]=0,c[5]=d,c[9]=p,c[13]=0,c[2]=0,c[6]=0,c[10]=g,c[14]=S,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(t,e,n,s,r,a,o=An,l=!1){let c=this.elements,h=2/(e-t),d=2/(n-s),u=-(e+t)/(e-t),p=-(n+s)/(n-s),g,S;if(l)g=1/(a-r),S=a/(a-r);else if(o===An)g=-2/(a-r),S=-(a+r)/(a-r);else if(o===Ps)g=-1/(a-r),S=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=0,c[12]=u,c[1]=0,c[5]=d,c[9]=0,c[13]=p,c[2]=0,c[6]=0,c[10]=g,c[14]=S,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(t){let e=this.elements,n=t.elements;for(let s=0;s<16;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}};Io.prototype.isMatrix4=!0;var ce=Io,hs=new P,bn=new ce,Of=new P(0,0,0),Bf=new P(1,1,1),gi=new P,xa=new P,hn=new P,Yh=new ce,Zh=new Ke,Hn=class i{constructor(t=0,e=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,s=this._order){return this._x=t,this._y=e,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){let s=t.elements,r=s[0],a=s[4],o=s[8],l=s[1],c=s[5],h=s[9],d=s[2],u=s[6],p=s[10];switch(e){case"XYZ":this._y=Math.asin(Qt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,p),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(u,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Qt(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,p),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-d,r),this._z=0);break;case"ZXY":this._x=Math.asin(Qt(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(-d,p),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-Qt(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(u,p),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(Qt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-d,r)):(this._x=0,this._y=Math.atan2(o,p));break;case"XZY":this._z=Math.asin(-Qt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(u,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-h,p),this._y=0);break;default:zt("Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return Yh.makeRotationFromQuaternion(t),this.setFromRotationMatrix(Yh,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return Zh.setFromEuler(this),this.setFromQuaternion(Zh,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Hn.DEFAULT_ORDER="XYZ";var vr=class{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}},zf=0,Jh=new P,us=new Ke,Kn=new ce,ya=new P,Qs=new P,kf=new P,Hf=new Ke,Kh=new P(1,0,0),$h=new P(0,1,0),jh=new P(0,0,1),Qh={type:"added"},Vf={type:"removed"},ds={type:"childadded",child:null},Jl={type:"childremoved",child:null},we=class i extends Rn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:zf++}),this.uuid=zn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let t=new P,e=new Hn,n=new Ke,s=new P(1,1,1);function r(){n.setFromEuler(e,!1)}function a(){e.setFromQuaternion(n,void 0,!1)}e._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new ce},normalMatrix:{value:new Zt}}),this.matrix=new ce,this.matrixWorld=new ce,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new vr,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return us.setFromAxisAngle(t,e),this.quaternion.multiply(us),this}rotateOnWorldAxis(t,e){return us.setFromAxisAngle(t,e),this.quaternion.premultiply(us),this}rotateX(t){return this.rotateOnAxis(Kh,t)}rotateY(t){return this.rotateOnAxis($h,t)}rotateZ(t){return this.rotateOnAxis(jh,t)}translateOnAxis(t,e){return Jh.copy(t).applyQuaternion(this.quaternion),this.position.add(Jh.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(Kh,t)}translateY(t){return this.translateOnAxis($h,t)}translateZ(t){return this.translateOnAxis(jh,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(Kn.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?ya.copy(t):ya.set(t,e,n);let s=this.parent;this.updateWorldMatrix(!0,!1),Qs.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Kn.lookAt(Qs,ya,this.up):Kn.lookAt(ya,Qs,this.up),this.quaternion.setFromRotationMatrix(Kn),s&&(Kn.extractRotation(s.matrixWorld),us.setFromRotationMatrix(Kn),this.quaternion.premultiply(us.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(Wt("Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(Qh),ds.child=t,this.dispatchEvent(ds),ds.child=null):Wt("Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(Vf),Jl.child=t,this.dispatchEvent(Jl),Jl.child=null),this}removeFromParent(){let t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),Kn.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),Kn.multiply(t.parent.matrixWorld)),t.applyMatrix4(Kn),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(Qh),ds.child=t,this.dispatchEvent(ds),ds.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,s=this.children.length;n<s;n++){let a=this.children[n].getObjectByProperty(t,e);if(a!==void 0)return a}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);let s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Qs,t,kf),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Qs,Hf,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(t){t(this);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverseVisible(t)}traverseAncestors(t){let e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let t=this.pivot;if(t!==null){let e=t.x,n=t.y,s=t.z,r=this.matrix.elements;r[12]+=e-r[0]*e-r[4]*n-r[8]*s,r[13]+=n-r[1]*e-r[5]*n-r[9]*s,r[14]+=s-r[2]*e-r[6]*n-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].updateMatrixWorld(t)}updateWorldMatrix(t,e,n=!1){let s=this.parent;if(t===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),e===!0){let r=this.children;for(let a=0,o=r.length;a<o;a++)r[a].updateWorldMatrix(!1,!0,n)}}toJSON(t){let e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(t),s.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(t.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let l=o.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){let d=l[c];r(t.shapes,d)}else r(t.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(t.materials,this.material[l]));s.material=o}else s.material=r(t.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){let l=this.animations[o];s.animations.push(r(t.animations,l))}}if(e){let o=a(t.geometries),l=a(t.materials),c=a(t.textures),h=a(t.images),d=a(t.shapes),u=a(t.skeletons),p=a(t.animations),g=a(t.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),d.length>0&&(n.shapes=d),u.length>0&&(n.skeletons=u),p.length>0&&(n.animations=p),g.length>0&&(n.nodes=g)}return n.object=s,n;function a(o){let l=[];for(let c in o){let h=o[c];delete h.metadata,l.push(h)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.pivot=t.pivot!==null?t.pivot.clone():null,this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.static=t.static,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){let s=t.children[n];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};we.DEFAULT_UP=new P(0,1,0);we.DEFAULT_MATRIX_AUTO_UPDATE=!0;we.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Xt=class extends we{constructor(){super(),this.isGroup=!0,this.type="Group"}},Gf={type:"move"},Ns=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Xt,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Xt,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new P,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new P),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Xt,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new P,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new P,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){let e=this._hand;if(e)for(let n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let s=null,r=null,a=null,o=this._targetRay,l=this._grip,c=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(c&&t.hand){a=!0;for(let S of t.hand.values()){let m=e.getJointPose(S,n),f=this._getHandJoint(c,S);m!==null&&(f.matrix.fromArray(m.transform.matrix),f.matrix.decompose(f.position,f.rotation,f.scale),f.matrixWorldNeedsUpdate=!0,f.jointRadius=m.radius),f.visible=m!==null}let h=c.joints["index-finger-tip"],d=c.joints["thumb-tip"],u=h.position.distanceTo(d.position),p=.02,g=.005;c.inputState.pinching&&u>p+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&u<=p-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:t,target:this})));o!==null&&(s=e.getPose(t.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Gf)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){let n=new Xt;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}},ad={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},_i={h:0,s:0,l:0},va={h:0,s:0,l:0};function Kl(i,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?i+(t-i)*6*e:e<1/2?t:e<2/3?i+(t-i)*6*(2/3-e):i}var Nt=class{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){let s=t;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=We){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,re.colorSpaceToWorking(this,e),this}setRGB(t,e,n,s=re.workingColorSpace){return this.r=t,this.g=e,this.b=n,re.colorSpaceToWorking(this,s),this}setHSL(t,e,n,s=re.workingColorSpace){if(t=Zc(t,1),e=Qt(e,0,1),n=Qt(n,0,1),e===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+e):n+e-n*e,a=2*n-r;this.r=Kl(a,r,t+1/3),this.g=Kl(a,r,t),this.b=Kl(a,r,t-1/3)}return re.colorSpaceToWorking(this,s),this}setStyle(t,e=We){function n(r){r!==void 0&&parseFloat(r)<1&&zt("Color: Alpha component of "+t+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(t)){let r,a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,e);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:zt("Color: Unknown color model "+t)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(t)){let r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(a===6)return this.setHex(parseInt(r,16),e);zt("Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=We){let n=ad[t.toLowerCase()];return n!==void 0?this.setHex(n,e):zt("Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=ni(t.r),this.g=ni(t.g),this.b=ni(t.b),this}copyLinearToSRGB(t){return this.r=As(t.r),this.g=As(t.g),this.b=As(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=We){return re.workingToColorSpace(Je.copy(this),t),Math.round(Qt(Je.r*255,0,255))*65536+Math.round(Qt(Je.g*255,0,255))*256+Math.round(Qt(Je.b*255,0,255))}getHexString(t=We){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=re.workingColorSpace){re.workingToColorSpace(Je.copy(this),e);let n=Je.r,s=Je.g,r=Je.b,a=Math.max(n,s,r),o=Math.min(n,s,r),l,c,h=(o+a)/2;if(o===a)l=0,c=0;else{let d=a-o;switch(c=h<=.5?d/(a+o):d/(2-a-o),a){case n:l=(s-r)/d+(s<r?6:0);break;case s:l=(r-n)/d+2;break;case r:l=(n-s)/d+4;break}l/=6}return t.h=l,t.s=c,t.l=h,t}getRGB(t,e=re.workingColorSpace){return re.workingToColorSpace(Je.copy(this),e),t.r=Je.r,t.g=Je.g,t.b=Je.b,t}getStyle(t=We){re.workingToColorSpace(Je.copy(this),t);let e=Je.r,n=Je.g,s=Je.b;return t!==We?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(t,e,n){return this.getHSL(_i),this.setHSL(_i.h+t,_i.s+e,_i.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(_i),t.getHSL(va);let n=ur(_i.h,va.h,e),s=ur(_i.s,va.s,e),r=ur(_i.l,va.l,e);return this.setHSL(n,s,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){let e=this.r,n=this.g,s=this.b,r=t.elements;return this.r=r[0]*e+r[3]*n+r[6]*s,this.g=r[1]*e+r[4]*n+r[7]*s,this.b=r[2]*e+r[5]*n+r[8]*s,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Je=new Nt;Nt.NAMES=ad;var Mr=class i{constructor(t,e=25e-5){this.isFogExp2=!0,this.name="",this.color=new Nt(t),this.density=e}clone(){return new i(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}};var Vn=class extends we{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Hn,this.environmentIntensity=1,this.environmentRotation=new Hn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){let e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),e.object.backgroundBlurriness=this.backgroundBlurriness,e.object.backgroundIntensity=this.backgroundIntensity,e.object.backgroundRotation=this.backgroundRotation.toArray(),e.object.environmentIntensity=this.environmentIntensity,e.object.environmentRotation=this.environmentRotation.toArray(),e}},En=new P,$n=new P,$l=new P,jn=new P,fs=new P,ps=new P,tu=new P,jl=new P,Ql=new P,tc=new P,ec=new Te,nc=new Te,ic=new Te,ei=class i{constructor(t=new P,e=new P,n=new P){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,s){s.subVectors(n,e),En.subVectors(t,e),s.cross(En);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(t,e,n,s,r){En.subVectors(s,e),$n.subVectors(n,e),$l.subVectors(t,e);let a=En.dot(En),o=En.dot($n),l=En.dot($l),c=$n.dot($n),h=$n.dot($l),d=a*c-o*o;if(d===0)return r.set(0,0,0),null;let u=1/d,p=(c*l-o*h)*u,g=(a*h-o*l)*u;return r.set(1-p-g,g,p)}static containsPoint(t,e,n,s){return this.getBarycoord(t,e,n,s,jn)===null?!1:jn.x>=0&&jn.y>=0&&jn.x+jn.y<=1}static getInterpolation(t,e,n,s,r,a,o,l){return this.getBarycoord(t,e,n,s,jn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,jn.x),l.addScaledVector(a,jn.y),l.addScaledVector(o,jn.z),l)}static getInterpolatedAttribute(t,e,n,s,r,a){return ec.setScalar(0),nc.setScalar(0),ic.setScalar(0),ec.fromBufferAttribute(t,e),nc.fromBufferAttribute(t,n),ic.fromBufferAttribute(t,s),a.setScalar(0),a.addScaledVector(ec,r.x),a.addScaledVector(nc,r.y),a.addScaledVector(ic,r.z),a}static isFrontFacing(t,e,n,s){return En.subVectors(n,e),$n.subVectors(t,e),En.cross($n).dot(s)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,s){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[s]),this}setFromAttributeAndIndices(t,e,n,s){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,s),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return En.subVectors(this.c,this.b),$n.subVectors(this.a,this.b),En.cross($n).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return i.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return i.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,n,s,r){return i.getInterpolation(t,this.a,this.b,this.c,e,n,s,r)}containsPoint(t){return i.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return i.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){let n=this.a,s=this.b,r=this.c,a,o;fs.subVectors(s,n),ps.subVectors(r,n),jl.subVectors(t,n);let l=fs.dot(jl),c=ps.dot(jl);if(l<=0&&c<=0)return e.copy(n);Ql.subVectors(t,s);let h=fs.dot(Ql),d=ps.dot(Ql);if(h>=0&&d<=h)return e.copy(s);let u=l*d-h*c;if(u<=0&&l>=0&&h<=0)return a=l/(l-h),e.copy(n).addScaledVector(fs,a);tc.subVectors(t,r);let p=fs.dot(tc),g=ps.dot(tc);if(g>=0&&p<=g)return e.copy(r);let S=p*c-l*g;if(S<=0&&c>=0&&g<=0)return o=c/(c-g),e.copy(n).addScaledVector(ps,o);let m=h*g-p*d;if(m<=0&&d-h>=0&&p-g>=0)return tu.subVectors(r,s),o=(d-h)/(d-h+(p-g)),e.copy(s).addScaledVector(tu,o);let f=1/(m+S+u);return a=S*f,o=u*f,e.copy(n).addScaledVector(fs,a).addScaledVector(ps,o)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}},Gn=class{constructor(t=new P(1/0,1/0,1/0),e=new P(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(Tn.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(Tn.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){let n=Tn.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);let n=t.geometry;if(n!==void 0){let r=n.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)t.isMesh===!0?t.getVertexPosition(a,Tn):Tn.fromBufferAttribute(r,a),Tn.applyMatrix4(t.matrixWorld),this.expandByPoint(Tn);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),Ma.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Ma.copy(n.boundingBox)),Ma.applyMatrix4(t.matrixWorld),this.union(Ma)}let s=t.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,Tn),Tn.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(tr),Sa.subVectors(this.max,tr),ms.subVectors(t.a,tr),gs.subVectors(t.b,tr),_s.subVectors(t.c,tr),xi.subVectors(gs,ms),yi.subVectors(_s,gs),Gi.subVectors(ms,_s);let e=[0,-xi.z,xi.y,0,-yi.z,yi.y,0,-Gi.z,Gi.y,xi.z,0,-xi.x,yi.z,0,-yi.x,Gi.z,0,-Gi.x,-xi.y,xi.x,0,-yi.y,yi.x,0,-Gi.y,Gi.x,0];return!sc(e,ms,gs,_s,Sa)||(e=[1,0,0,0,1,0,0,0,1],!sc(e,ms,gs,_s,Sa))?!1:(ba.crossVectors(xi,yi),e=[ba.x,ba.y,ba.z],sc(e,ms,gs,_s,Sa))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,Tn).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(Tn).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(Qn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),Qn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),Qn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),Qn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),Qn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),Qn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),Qn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),Qn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(Qn),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}},Qn=[new P,new P,new P,new P,new P,new P,new P,new P],Tn=new P,Ma=new Gn,ms=new P,gs=new P,_s=new P,xi=new P,yi=new P,Gi=new P,tr=new P,Sa=new P,ba=new P,Wi=new P;function sc(i,t,e,n,s){for(let r=0,a=i.length-3;r<=a;r+=3){Wi.fromArray(i,r);let o=s.x*Math.abs(Wi.x)+s.y*Math.abs(Wi.y)+s.z*Math.abs(Wi.z),l=t.dot(Wi),c=e.dot(Wi),h=n.dot(Wi);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>o)return!1}return!0}var Le=new P,Ea=new it,Wf=0,ke=class extends Rn{constructor(t,e,n=!1){if(super(),Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Wf++}),this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=qc,this.updateRanges=[],this.gpuType=yn,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[t+s]=e.array[n+s];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)Ea.fromBufferAttribute(this,e),Ea.applyMatrix3(t),this.setXY(e,Ea.x,Ea.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)Le.fromBufferAttribute(this,e),Le.applyMatrix3(t),this.setXYZ(e,Le.x,Le.y,Le.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)Le.fromBufferAttribute(this,e),Le.applyMatrix4(t),this.setXYZ(e,Le.x,Le.y,Le.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)Le.fromBufferAttribute(this,e),Le.applyNormalMatrix(t),this.setXYZ(e,Le.x,Le.y,Le.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)Le.fromBufferAttribute(this,e),Le.transformDirection(t),this.setXYZ(e,Le.x,Le.y,Le.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=wn(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=ge(n,this.array)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=wn(e,this.array)),e}setX(t,e){return this.normalized&&(e=ge(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=wn(e,this.array)),e}setY(t,e){return this.normalized&&(e=ge(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=wn(e,this.array)),e}setZ(t,e){return this.normalized&&(e=ge(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=wn(e,this.array)),e}setW(t,e){return this.normalized&&(e=ge(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=ge(e,this.array),n=ge(n,this.array)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,s){return t*=this.itemSize,this.normalized&&(e=ge(e,this.array),n=ge(n,this.array),s=ge(s,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this}setXYZW(t,e,n,s,r){return t*=this.itemSize,this.normalized&&(e=ge(e,this.array),n=ge(n,this.array),s=ge(s,this.array),r=ge(r,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return t.name=this.name,t.usage=this.usage,t.gpuType=this.gpuType,t}dispose(){this.dispatchEvent({type:"dispose"})}};var Sr=class extends ke{constructor(t,e,n){super(new Uint16Array(t),e,n)}};var br=class extends ke{constructor(t,e,n){super(new Uint32Array(t),e,n)}};var Ht=class extends ke{constructor(t,e,n){super(new Float32Array(t),e,n)}},Xf=new Gn,er=new P,rc=new P,ii=class{constructor(t=new P,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){let n=this.center;e!==void 0?n.copy(e):Xf.setFromPoints(t).getCenter(n);let s=0;for(let r=0,a=t.length;r<a;r++)s=Math.max(s,n.distanceToSquared(t[r]));return this.radius=Math.sqrt(s),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){let e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){let n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;er.subVectors(t,this.center);let e=er.lengthSq();if(e>this.radius*this.radius){let n=Math.sqrt(e),s=(n-this.radius)*.5;this.center.addScaledVector(er,s/n),this.radius+=s}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(rc.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(er.copy(t.center).add(rc)),this.expandByPoint(er.copy(t.center).sub(rc))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}},qf=0,_n=new ce,ac=new we,xs=new P,un=new Gn,nr=new Gn,ze=new P,ae=class i extends Rn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:qf++}),this.uuid=zn(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(gf(t)?br:Sr)(t,1):this.index=t,this}setIndirect(t,e=0){return this.indirect=t,this.indirectOffset=e,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){let e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new Zt().getNormalMatrix(t);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(t),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(t){return _n.makeRotationFromQuaternion(t),this.applyMatrix4(_n),this}rotateX(t){return _n.makeRotationX(t),this.applyMatrix4(_n),this}rotateY(t){return _n.makeRotationY(t),this.applyMatrix4(_n),this}rotateZ(t){return _n.makeRotationZ(t),this.applyMatrix4(_n),this}translate(t,e,n){return _n.makeTranslation(t,e,n),this.applyMatrix4(_n),this}scale(t,e,n){return _n.makeScale(t,e,n),this.applyMatrix4(_n),this}lookAt(t){return ac.lookAt(t),ac.updateMatrix(),this.applyMatrix4(ac.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(xs).negate(),this.translate(xs.x,xs.y,xs.z),this}setFromPoints(t){let e=this.getAttribute("position");if(e===void 0){let n=[];for(let s=0,r=t.length;s<r;s++){let a=t[s];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new Ht(n,3))}else{let n=Math.min(t.length,e.count);for(let s=0;s<n;s++){let r=t[s];e.setXYZ(s,r.x,r.y,r.z||0)}t.length>e.count&&zt("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Gn);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Wt("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new P(-1/0,-1/0,-1/0),new P(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,s=e.length;n<s;n++){let r=e[n];un.setFromBufferAttribute(r),this.morphTargetsRelative?(ze.addVectors(this.boundingBox.min,un.min),this.boundingBox.expandByPoint(ze),ze.addVectors(this.boundingBox.max,un.max),this.boundingBox.expandByPoint(ze)):(this.boundingBox.expandByPoint(un.min),this.boundingBox.expandByPoint(un.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Wt('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new ii);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Wt("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new P,1/0);return}if(t){let n=this.boundingSphere.center;if(un.setFromBufferAttribute(t),e)for(let r=0,a=e.length;r<a;r++){let o=e[r];nr.setFromBufferAttribute(o),this.morphTargetsRelative?(ze.addVectors(un.min,nr.min),un.expandByPoint(ze),ze.addVectors(un.max,nr.max),un.expandByPoint(ze)):(un.expandByPoint(nr.min),un.expandByPoint(nr.max))}un.getCenter(n);let s=0;for(let r=0,a=t.count;r<a;r++)ze.fromBufferAttribute(t,r),s=Math.max(s,n.distanceToSquared(ze));if(e)for(let r=0,a=e.length;r<a;r++){let o=e[r],l=this.morphTargetsRelative;for(let c=0,h=o.count;c<h;c++)ze.fromBufferAttribute(o,c),l&&(xs.fromBufferAttribute(t,c),ze.add(xs)),s=Math.max(s,n.distanceToSquared(ze))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&Wt('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){Wt("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=e.position,s=e.normal,r=e.uv,a=this.getAttribute("tangent");(a===void 0||a.count!==n.count)&&(a=new ke(new Float32Array(4*n.count),4),this.setAttribute("tangent",a));let o=[],l=[];for(let x=0;x<n.count;x++)o[x]=new P,l[x]=new P;let c=new P,h=new P,d=new P,u=new it,p=new it,g=new it,S=new P,m=new P;function f(x,w,R){c.fromBufferAttribute(n,x),h.fromBufferAttribute(n,w),d.fromBufferAttribute(n,R),u.fromBufferAttribute(r,x),p.fromBufferAttribute(r,w),g.fromBufferAttribute(r,R),h.sub(c),d.sub(c),p.sub(u),g.sub(u);let I=1/(p.x*g.y-g.x*p.y);isFinite(I)&&(S.copy(h).multiplyScalar(g.y).addScaledVector(d,-p.y).multiplyScalar(I),m.copy(d).multiplyScalar(p.x).addScaledVector(h,-g.x).multiplyScalar(I),o[x].add(S),o[w].add(S),o[R].add(S),l[x].add(m),l[w].add(m),l[R].add(m))}let M=this.groups;M.length===0&&(M=[{start:0,count:t.count}]);for(let x=0,w=M.length;x<w;++x){let R=M[x],I=R.start,N=R.count;for(let F=I,L=I+N;F<L;F+=3)f(t.getX(F+0),t.getX(F+1),t.getX(F+2))}let T=new P,_=new P,b=new P,v=new P;function A(x){b.fromBufferAttribute(s,x),v.copy(b);let w=o[x];T.copy(w),T.sub(b.multiplyScalar(b.dot(w))).normalize(),_.crossVectors(v,w);let I=_.dot(l[x])<0?-1:1;a.setXYZW(x,T.x,T.y,T.z,I)}for(let x=0,w=M.length;x<w;++x){let R=M[x],I=R.start,N=R.count;for(let F=I,L=I+N;F<L;F+=3)A(t.getX(F+0)),A(t.getX(F+1)),A(t.getX(F+2))}this._transformed=!0}computeVertexNormals(){let t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==e.count)n=new ke(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let u=0,p=n.count;u<p;u++)n.setXYZ(u,0,0,0);let s=new P,r=new P,a=new P,o=new P,l=new P,c=new P,h=new P,d=new P;if(t)for(let u=0,p=t.count;u<p;u+=3){let g=t.getX(u+0),S=t.getX(u+1),m=t.getX(u+2);s.fromBufferAttribute(e,g),r.fromBufferAttribute(e,S),a.fromBufferAttribute(e,m),h.subVectors(a,r),d.subVectors(s,r),h.cross(d),o.fromBufferAttribute(n,g),l.fromBufferAttribute(n,S),c.fromBufferAttribute(n,m),o.add(h),l.add(h),c.add(h),n.setXYZ(g,o.x,o.y,o.z),n.setXYZ(S,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let u=0,p=e.count;u<p;u+=3)s.fromBufferAttribute(e,u+0),r.fromBufferAttribute(e,u+1),a.fromBufferAttribute(e,u+2),h.subVectors(a,r),d.subVectors(s,r),h.cross(d),n.setXYZ(u+0,h.x,h.y,h.z),n.setXYZ(u+1,h.x,h.y,h.z),n.setXYZ(u+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)ze.fromBufferAttribute(t,e),ze.normalize(),t.setXYZ(e,ze.x,ze.y,ze.z)}toNonIndexed(){function t(o,l){let c=o.array,h=o.itemSize,d=o.normalized,u=new c.constructor(l.length*h),p=0,g=0;for(let S=0,m=l.length;S<m;S++){o.isInterleavedBufferAttribute?p=l[S]*o.data.stride+o.offset:p=l[S]*h;for(let f=0;f<h;f++)u[g++]=c[p++]}return new ke(u,h,d)}if(this.index===null)return zt("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let e=new i,n=this.index.array,s=this.attributes;for(let o in s){let l=s[o],c=t(l,n);e.setAttribute(o,c)}let r=this.morphAttributes;for(let o in r){let l=[],c=r[o];for(let h=0,d=c.length;h<d;h++){let u=c[h],p=t(u,n);l.push(p)}e.morphAttributes[o]=l}e.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,l=a.length;o<l;o++){let c=a[o];e.addGroup(c.start,c.count,c.materialIndex)}return e}toJSON(){let t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,t.name=this.name,Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};let e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});let n=this.attributes;for(let l in n){let c=n[l];t.data.attributes[l]=c.toJSON(t.data)}let s={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],h=[];for(let d=0,u=c.length;d<u;d++){let p=c[d];h.push(p.toJSON(t.data))}h.length>0&&(s[l]=h,r=!0)}r&&(t.data.morphAttributes=s,t.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(t.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(t.data.boundingSphere=o.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let e={};this.name=t.name;let n=t.index;n!==null&&this.setIndex(n.clone());let s=t.attributes;for(let c in s){let h=s[c];this.setAttribute(c,h.clone(e))}let r=t.morphAttributes;for(let c in r){let h=[],d=r[c];for(let u=0,p=d.length;u<p;u++)h.push(d[u].clone(e));this.morphAttributes[c]=h}this.morphTargetsRelative=t.morphTargetsRelative;let a=t.groups;for(let c=0,h=a.length;c<h;c++){let d=a[c];this.addGroup(d.start,d.count,d.materialIndex)}let o=t.boundingBox;o!==null&&(this.boundingBox=o.clone());let l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this._transformed=t._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}},ro=class{constructor(t,e){this.isInterleavedBuffer=!0,this.array=t,this.stride=e,this.count=t!==void 0?t.length/e:0,this.usage=qc,this.updateRanges=[],this.version=0,this.uuid=zn()}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.array=new t.array.constructor(t.array),this.count=t.count,this.stride=t.stride,this.usage=t.usage,this}copyAt(t,e,n){t*=this.stride,n*=e.stride;for(let s=0,r=this.stride;s<r;s++)this.array[t+s]=e.array[n+s];return this}set(t,e=0){return this.array.set(t,e),this}clone(t){t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=zn()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let e=new this.array.constructor(t.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(e,this.stride);return n.setUsage(this.usage),n}onUpload(t){return this.onUploadCallback=t,this}toJSON(t){t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=zn()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer)));let e={uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride};return e.usage=this.usage,e}},tn=new P,Er=class i{constructor(t,e,n,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=t,this.itemSize=e,this.offset=n,this.normalized=s}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(t){this.data.needsUpdate=t}applyMatrix4(t){for(let e=0,n=this.data.count;e<n;e++)tn.fromBufferAttribute(this,e),tn.applyMatrix4(t),this.setXYZ(e,tn.x,tn.y,tn.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)tn.fromBufferAttribute(this,e),tn.applyNormalMatrix(t),this.setXYZ(e,tn.x,tn.y,tn.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)tn.fromBufferAttribute(this,e),tn.transformDirection(t),this.setXYZ(e,tn.x,tn.y,tn.z);return this}getComponent(t,e){let n=this.array[t*this.data.stride+this.offset+e];return this.normalized&&(n=wn(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=ge(n,this.array)),this.data.array[t*this.data.stride+this.offset+e]=n,this}setX(t,e){return this.normalized&&(e=ge(e,this.array)),this.data.array[t*this.data.stride+this.offset]=e,this}setY(t,e){return this.normalized&&(e=ge(e,this.array)),this.data.array[t*this.data.stride+this.offset+1]=e,this}setZ(t,e){return this.normalized&&(e=ge(e,this.array)),this.data.array[t*this.data.stride+this.offset+2]=e,this}setW(t,e){return this.normalized&&(e=ge(e,this.array)),this.data.array[t*this.data.stride+this.offset+3]=e,this}getX(t){let e=this.data.array[t*this.data.stride+this.offset];return this.normalized&&(e=wn(e,this.array)),e}getY(t){let e=this.data.array[t*this.data.stride+this.offset+1];return this.normalized&&(e=wn(e,this.array)),e}getZ(t){let e=this.data.array[t*this.data.stride+this.offset+2];return this.normalized&&(e=wn(e,this.array)),e}getW(t){let e=this.data.array[t*this.data.stride+this.offset+3];return this.normalized&&(e=wn(e,this.array)),e}setXY(t,e,n){return t=t*this.data.stride+this.offset,this.normalized&&(e=ge(e,this.array),n=ge(n,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this}setXYZ(t,e,n,s){return t=t*this.data.stride+this.offset,this.normalized&&(e=ge(e,this.array),n=ge(n,this.array),s=ge(s,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this.data.array[t+2]=s,this}setXYZW(t,e,n,s,r){return t=t*this.data.stride+this.offset,this.normalized&&(e=ge(e,this.array),n=ge(n,this.array),s=ge(s,this.array),r=ge(r,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this.data.array[t+2]=s,this.data.array[t+3]=r,this}clone(t){if(t===void 0){xr("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let e=[];for(let n=0;n<this.count;n++){let s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[s+r])}return new ke(new this.array.constructor(e),this.itemSize,this.normalized)}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.clone(t)),new i(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(t){if(t===void 0){xr("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let e=[];for(let n=0;n<this.count;n++){let s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[s+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:e,normalized:this.normalized}}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.toJSON(t)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},oc=new P,Yf=new P,Zf=new Zt,dn=class{constructor(t=new P(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,s){return this.normal.set(t,e,n),this.constant=s,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){let s=oc.subVectors(n,e).cross(Yf.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(s,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){let t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e,n=!0){let s=t.delta(oc),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;let a=-(t.start.dot(this.normal)+this.constant)/r;return n===!0&&(a<0||a>1)?null:e.copy(t.start).addScaledVector(s,a)}intersectsLine(t){let e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){let n=e||Zf.getNormalMatrix(t),s=this.coplanarPoint(oc).applyMatrix4(t),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(t){return this.normal.fromArray(t.normal),this.constant=t.constant,this}},Jf=0,xn=class extends Rn{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Jf++}),this.uuid=zn(),this.name="",this.type="Material",this.blending=Gs,this.side=Ii,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Ic,this.blendDst=Lc,this.blendEquation=es,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Nt(0,0,0),this.blendAlpha=0,this.depthFunc=Rs,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Ju,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=qa,this.stencilZFail=qa,this.stencilZPass=qa,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(let e in t){let n=t[e];if(n===void 0){zt(`Material: parameter '${e}' has value of undefined.`);continue}let s=this[e];if(s===void 0){zt(`Material: '${e}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector2&&n&&n.isVector2||s&&s.isEuler&&n&&n.isEuler||s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[e]=n}}toJSON(t){let e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(t).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(t).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let a=[];for(let o in r){let l=r[o];delete l.metadata,a.push(l)}return a}if(e){let r=s(t.textures),a=s(t.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}fromJSON(t,e){if(t.uuid!==void 0&&(this.uuid=t.uuid),t.name!==void 0&&(this.name=t.name),t.color!==void 0&&this.color!==void 0&&this.color.setHex(t.color),t.roughness!==void 0&&(this.roughness=t.roughness),t.metalness!==void 0&&(this.metalness=t.metalness),t.sheen!==void 0&&(this.sheen=t.sheen),t.sheenColor!==void 0&&(this.sheenColor=new Nt().setHex(t.sheenColor)),t.sheenRoughness!==void 0&&(this.sheenRoughness=t.sheenRoughness),t.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(t.emissive),t.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(t.specular),t.specularIntensity!==void 0&&(this.specularIntensity=t.specularIntensity),t.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(t.specularColor),t.shininess!==void 0&&(this.shininess=t.shininess),t.clearcoat!==void 0&&(this.clearcoat=t.clearcoat),t.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=t.clearcoatRoughness),t.dispersion!==void 0&&(this.dispersion=t.dispersion),t.retroreflectivity!==void 0&&(this.retroreflectivity=t.retroreflectivity),t.iridescence!==void 0&&(this.iridescence=t.iridescence),t.iridescenceIOR!==void 0&&(this.iridescenceIOR=t.iridescenceIOR),t.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=t.iridescenceThicknessRange),t.transmission!==void 0&&(this.transmission=t.transmission),t.thickness!==void 0&&(this.thickness=t.thickness),t.attenuationDistance!==void 0&&(this.attenuationDistance=t.attenuationDistance),t.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(t.attenuationColor),t.anisotropy!==void 0&&(this.anisotropy=t.anisotropy),t.anisotropyRotation!==void 0&&(this.anisotropyRotation=t.anisotropyRotation),t.fog!==void 0&&(this.fog=t.fog),t.flatShading!==void 0&&(this.flatShading=t.flatShading),t.blending!==void 0&&(this.blending=t.blending),t.combine!==void 0&&(this.combine=t.combine),t.side!==void 0&&(this.side=t.side),t.shadowSide!==void 0&&(this.shadowSide=t.shadowSide),t.opacity!==void 0&&(this.opacity=t.opacity),t.transparent!==void 0&&(this.transparent=t.transparent),t.alphaTest!==void 0&&(this.alphaTest=t.alphaTest),t.alphaHash!==void 0&&(this.alphaHash=t.alphaHash),t.depthFunc!==void 0&&(this.depthFunc=t.depthFunc),t.depthTest!==void 0&&(this.depthTest=t.depthTest),t.depthWrite!==void 0&&(this.depthWrite=t.depthWrite),t.colorWrite!==void 0&&(this.colorWrite=t.colorWrite),t.clippingPlanes!==void 0&&(this.clippingPlanes=t.clippingPlanes.map(n=>new dn().fromJSON(n))),t.clipIntersection!==void 0&&(this.clipIntersection=t.clipIntersection),t.clipShadows!==void 0&&(this.clipShadows=t.clipShadows),t.depthPacking!==void 0&&(this.depthPacking=t.depthPacking),t.blendSrc!==void 0&&(this.blendSrc=t.blendSrc),t.blendDst!==void 0&&(this.blendDst=t.blendDst),t.blendEquation!==void 0&&(this.blendEquation=t.blendEquation),t.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=t.blendSrcAlpha),t.blendDstAlpha!==void 0&&(this.blendDstAlpha=t.blendDstAlpha),t.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=t.blendEquationAlpha),t.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(t.blendColor),t.blendAlpha!==void 0&&(this.blendAlpha=t.blendAlpha),t.stencilWriteMask!==void 0&&(this.stencilWriteMask=t.stencilWriteMask),t.stencilFunc!==void 0&&(this.stencilFunc=t.stencilFunc),t.stencilRef!==void 0&&(this.stencilRef=t.stencilRef),t.stencilFuncMask!==void 0&&(this.stencilFuncMask=t.stencilFuncMask),t.stencilFail!==void 0&&(this.stencilFail=t.stencilFail),t.stencilZFail!==void 0&&(this.stencilZFail=t.stencilZFail),t.stencilZPass!==void 0&&(this.stencilZPass=t.stencilZPass),t.stencilWrite!==void 0&&(this.stencilWrite=t.stencilWrite),t.wireframe!==void 0&&(this.wireframe=t.wireframe),t.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=t.wireframeLinewidth),t.wireframeLinecap!==void 0&&(this.wireframeLinecap=t.wireframeLinecap),t.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=t.wireframeLinejoin),t.rotation!==void 0&&(this.rotation=t.rotation),t.linewidth!==void 0&&(this.linewidth=t.linewidth),t.linecap!==void 0&&(this.linecap=t.linecap),t.linejoin!==void 0&&(this.linejoin=t.linejoin),t.dashSize!==void 0&&(this.dashSize=t.dashSize),t.gapSize!==void 0&&(this.gapSize=t.gapSize),t.scale!==void 0&&(this.scale=t.scale),t.polygonOffset!==void 0&&(this.polygonOffset=t.polygonOffset),t.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=t.polygonOffsetFactor),t.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=t.polygonOffsetUnits),t.dithering!==void 0&&(this.dithering=t.dithering),t.alphaToCoverage!==void 0&&(this.alphaToCoverage=t.alphaToCoverage),t.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=t.premultipliedAlpha),t.forceSinglePass!==void 0&&(this.forceSinglePass=t.forceSinglePass),t.allowOverride!==void 0&&(this.allowOverride=t.allowOverride),t.visible!==void 0&&(this.visible=t.visible),t.toneMapped!==void 0&&(this.toneMapped=t.toneMapped),t.userData!==void 0&&(this.userData=t.userData),t.vertexColors!==void 0&&(typeof t.vertexColors=="number"?this.vertexColors=t.vertexColors>0:this.vertexColors=t.vertexColors),t.size!==void 0&&(this.size=t.size),t.sizeAttenuation!==void 0&&(this.sizeAttenuation=t.sizeAttenuation),t.map!==void 0&&(this.map=e[t.map]||null),t.matcap!==void 0&&(this.matcap=e[t.matcap]||null),t.alphaMap!==void 0&&(this.alphaMap=e[t.alphaMap]||null),t.bumpMap!==void 0&&(this.bumpMap=e[t.bumpMap]||null),t.bumpScale!==void 0&&(this.bumpScale=t.bumpScale),t.normalMap!==void 0&&(this.normalMap=e[t.normalMap]||null),t.normalMapType!==void 0&&(this.normalMapType=t.normalMapType),t.normalScale!==void 0){let n=t.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new it().fromArray(n)}return t.displacementMap!==void 0&&(this.displacementMap=e[t.displacementMap]||null),t.displacementScale!==void 0&&(this.displacementScale=t.displacementScale),t.displacementBias!==void 0&&(this.displacementBias=t.displacementBias),t.roughnessMap!==void 0&&(this.roughnessMap=e[t.roughnessMap]||null),t.metalnessMap!==void 0&&(this.metalnessMap=e[t.metalnessMap]||null),t.emissiveMap!==void 0&&(this.emissiveMap=e[t.emissiveMap]||null),t.emissiveIntensity!==void 0&&(this.emissiveIntensity=t.emissiveIntensity),t.specularMap!==void 0&&(this.specularMap=e[t.specularMap]||null),t.specularIntensityMap!==void 0&&(this.specularIntensityMap=e[t.specularIntensityMap]||null),t.specularColorMap!==void 0&&(this.specularColorMap=e[t.specularColorMap]||null),t.envMap!==void 0&&(this.envMap=e[t.envMap]||null),t.envMapRotation!==void 0&&this.envMapRotation.fromArray(t.envMapRotation),t.envMapIntensity!==void 0&&(this.envMapIntensity=t.envMapIntensity),t.reflectivity!==void 0&&(this.reflectivity=t.reflectivity),t.refractionRatio!==void 0&&(this.refractionRatio=t.refractionRatio),t.lightMap!==void 0&&(this.lightMap=e[t.lightMap]||null),t.lightMapIntensity!==void 0&&(this.lightMapIntensity=t.lightMapIntensity),t.aoMap!==void 0&&(this.aoMap=e[t.aoMap]||null),t.aoMapIntensity!==void 0&&(this.aoMapIntensity=t.aoMapIntensity),t.gradientMap!==void 0&&(this.gradientMap=e[t.gradientMap]||null),t.clearcoatMap!==void 0&&(this.clearcoatMap=e[t.clearcoatMap]||null),t.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=e[t.clearcoatRoughnessMap]||null),t.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=e[t.clearcoatNormalMap]||null),t.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new it().fromArray(t.clearcoatNormalScale)),t.iridescenceMap!==void 0&&(this.iridescenceMap=e[t.iridescenceMap]||null),t.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=e[t.iridescenceThicknessMap]||null),t.transmissionMap!==void 0&&(this.transmissionMap=e[t.transmissionMap]||null),t.thicknessMap!==void 0&&(this.thicknessMap=e[t.thicknessMap]||null),t.anisotropyMap!==void 0&&(this.anisotropyMap=e[t.anisotropyMap]||null),t.sheenColorMap!==void 0&&(this.sheenColorMap=e[t.sheenColorMap]||null),t.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=e[t.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;let e=t.clippingPlanes,n=null;if(e!==null){let s=e.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=e[r].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.allowOverride=t.allowOverride,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}},Cn=class extends xn{constructor(t){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new Nt(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.rotation=t.rotation,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}},ys,ir=new P,vs=new P,Ms=new P,Ss=new it,sr=new it,od=new ce,Ta=new P,rr=new P,wa=new P,eu=new it,lc=new it,nu=new it,Wn=class extends we{constructor(t=new Cn){if(super(),this.isSprite=!0,this.type="Sprite",ys===void 0){ys=new ae;let e=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),n=new ro(e,5);ys.setIndex([0,1,2,0,2,3]),ys.setAttribute("position",new Er(n,3,0,!1)),ys.setAttribute("uv",new Er(n,2,3,!1))}this.geometry=ys,this.material=t,this.center=new it(.5,.5),this.count=1}intersectsFrustum(t){return t.intersectsSprite(this)}raycast(t,e){t.camera===null&&Wt('Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),vs.setFromMatrixScale(this.matrixWorld),od.copy(t.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(t.camera.matrixWorldInverse,this.matrixWorld),Ms.setFromMatrixPosition(this.modelViewMatrix),t.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&vs.multiplyScalar(-Ms.z);let n=this.material.rotation,s,r;n!==0&&(r=Math.cos(n),s=Math.sin(n));let a=this.center;Aa(Ta.set(-.5,-.5,0),Ms,a,vs,s,r),Aa(rr.set(.5,-.5,0),Ms,a,vs,s,r),Aa(wa.set(.5,.5,0),Ms,a,vs,s,r),eu.set(0,0),lc.set(1,0),nu.set(1,1);let o=t.ray.intersectTriangle(Ta,rr,wa,!1,ir);if(o===null&&(Aa(rr.set(-.5,.5,0),Ms,a,vs,s,r),lc.set(0,1),o=t.ray.intersectTriangle(Ta,wa,rr,!1,ir),o===null))return;let l=t.ray.origin.distanceTo(ir);l<t.near||l>t.far||e.push({distance:l,point:ir.clone(),uv:ei.getInterpolation(ir,Ta,rr,wa,eu,lc,nu,new it),face:null,object:this})}copy(t,e){return super.copy(t,e),t.center!==void 0&&this.center.copy(t.center),this.material=t.material,this}};function Aa(i,t,e,n,s,r){Ss.subVectors(i,e).addScalar(.5).multiply(n),s!==void 0?(sr.x=r*Ss.x-s*Ss.y,sr.y=s*Ss.x+r*Ss.y):sr.copy(Ss),i.copy(t),i.x+=sr.x,i.y+=sr.y,i.applyMatrix4(od)}var ti=new P,cc=new P,Ra=new P,Ca=new P,Ji=class{constructor(t=new P,e=new P(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,ti)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);let n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){let e=ti.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(ti.copy(this.origin).addScaledVector(this.direction,e),ti.distanceToSquared(t))}distanceSqToSegment(t,e,n,s){cc.copy(t).add(e).multiplyScalar(.5),Ra.copy(e).sub(t).normalize(),Ca.copy(this.origin).sub(cc);let r=t.distanceTo(e)*.5,a=-this.direction.dot(Ra),o=Ca.dot(this.direction),l=-Ca.dot(Ra),c=Ca.lengthSq(),h=Math.abs(1-a*a),d,u,p,g;if(h>0)if(d=a*l-o,u=a*o-l,g=r*h,d>=0)if(u>=-g)if(u<=g){let S=1/h;d*=S,u*=S,p=d*(d+a*u+2*o)+u*(a*d+u+2*l)+c}else u=r,d=Math.max(0,-(a*u+o)),p=-d*d+u*(u+2*l)+c;else u=-r,d=Math.max(0,-(a*u+o)),p=-d*d+u*(u+2*l)+c;else u<=-g?(d=Math.max(0,-(-a*r+o)),u=d>0?-r:Math.min(Math.max(-r,-l),r),p=-d*d+u*(u+2*l)+c):u<=g?(d=0,u=Math.min(Math.max(-r,-l),r),p=u*(u+2*l)+c):(d=Math.max(0,-(a*r+o)),u=d>0?r:Math.min(Math.max(-r,-l),r),p=-d*d+u*(u+2*l)+c);else u=a>0?-r:r,d=Math.max(0,-(a*u+o)),p=-d*d+u*(u+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,d),s&&s.copy(cc).addScaledVector(Ra,u),p}intersectSphere(t,e){if(t.radius<0)return null;ti.subVectors(t.center,this.origin);let n=ti.dot(this.direction),s=ti.dot(ti)-n*n,r=t.radius*t.radius;if(s>r)return null;let a=Math.sqrt(r-s),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,e):this.at(o,e)}intersectsSphere(t){return t.radius<0?!1:this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){let e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){let n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){let e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,s,r,a,o,l,c=1/this.direction.x,h=1/this.direction.y,d=1/this.direction.z,u=this.origin;return c>=0?(n=(t.min.x-u.x)*c,s=(t.max.x-u.x)*c):(n=(t.max.x-u.x)*c,s=(t.min.x-u.x)*c),h>=0?(r=(t.min.y-u.y)*h,a=(t.max.y-u.y)*h):(r=(t.max.y-u.y)*h,a=(t.min.y-u.y)*h),n>a||r>s||((r>n||isNaN(n))&&(n=r),(a<s||isNaN(s))&&(s=a),d>=0?(o=(t.min.z-u.z)*d,l=(t.max.z-u.z)*d):(o=(t.max.z-u.z)*d,l=(t.min.z-u.z)*d),n>l||o>s)||((o>n||n!==n)&&(n=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,e)}intersectsBox(t){return this.intersectBox(t,ti)!==null}intersectTriangle(t,e,n,s,r){let a=this.origin,o=this.direction,l=o.x,c=o.y,h=o.z,d=t.x-a.x,u=t.y-a.y,p=t.z-a.z,g=e.x-a.x,S=e.y-a.y,m=e.z-a.z,f=n.x-a.x,M=n.y-a.y,T=n.z-a.z,_=Math.abs(l),b=Math.abs(c),v=Math.abs(h),A,x,w,R,I,N,F,L,B,X,G,tt;if(_>=b&&_>=v?(w=l,N=d,B=g,tt=f,l>=0?(A=c,x=h,R=u,I=p,F=S,L=m,X=M,G=T):(A=h,x=c,R=p,I=u,F=m,L=S,X=T,G=M)):b>=v?(w=c,N=u,B=S,tt=M,c>=0?(A=h,x=l,R=p,I=d,F=m,L=g,X=T,G=f):(A=l,x=h,R=d,I=p,F=g,L=m,X=f,G=T)):(w=h,N=p,B=m,tt=T,h>=0?(A=l,x=c,R=d,I=u,F=g,L=S,X=f,G=M):(A=c,x=l,R=u,I=d,F=S,L=g,X=M,G=f)),w===0)return null;let Z=A/w,J=x/w,Y=1/w,ft=R-Z*N,bt=I-J*N,At=F-Z*B,kt=L-J*B,Bt=X-Z*tt,W=G-J*tt,j=Bt*kt-W*At,ht=ft*W-bt*Bt,Ft=At*bt-kt*ft;if(s){if(j<0||ht<0||Ft<0)return null}else if((j<0||ht<0||Ft<0)&&(j>0||ht>0||Ft>0))return null;let vt=j+ht+Ft;if(vt===0)return null;let qt=Y*(j*N+ht*B+Ft*tt);return(vt>0?qt<0:qt>0)?null:this.at(qt/vt,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},qe=class extends xn{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Nt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Hn,this.combine=No,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}},iu=new ce,Xi=new Ji,Pa=new ii,su=new P,Ia=new P,La=new P,Da=new P,hc=new P,Na=new P,ru=new P,Ua=new P,at=class extends we{constructor(t=new ae,e=new qe){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){let s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(t,e){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;e.fromBufferAttribute(s,t);let o=this.morphTargetInfluences;if(r&&o){Na.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let h=o[l],d=r[l];h!==0&&(hc.fromBufferAttribute(d,t),a?Na.addScaledVector(hc,h):Na.addScaledVector(hc.sub(e),h))}e.add(Na)}return e}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Pa.copy(n.boundingSphere),Pa.applyMatrix4(r),Xi.copy(t.ray).recast(t.near),!(Pa.containsPoint(Xi.origin)===!1&&(Xi.intersectSphere(Pa,su)===null||Xi.origin.distanceToSquared(su)>(t.far-t.near)**2))&&(iu.copy(r).invert(),Xi.copy(t.ray).applyMatrix4(iu),!(n.boundingBox!==null&&Xi.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(t,e,Xi)))}_computeIntersections(t,e,n){let s,r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,d=r.attributes.normal,u=r.groups,p=r.drawRange;if(o!==null)if(Array.isArray(a))for(let g=0,S=u.length;g<S;g++){let m=u[g],f=a[m.materialIndex],M=Math.max(m.start,p.start),T=Math.min(o.count,Math.min(m.start+m.count,p.start+p.count));for(let _=M,b=T;_<b;_+=3){let v=o.getX(_),A=o.getX(_+1),x=o.getX(_+2);s=Fa(this,f,t,n,c,h,d,v,A,x),s&&(s.faceIndex=Math.floor(_/3),s.face.materialIndex=m.materialIndex,e.push(s))}}else{let g=Math.max(0,p.start),S=Math.min(o.count,p.start+p.count);for(let m=g,f=S;m<f;m+=3){let M=o.getX(m),T=o.getX(m+1),_=o.getX(m+2);s=Fa(this,a,t,n,c,h,d,M,T,_),s&&(s.faceIndex=Math.floor(m/3),e.push(s))}}else if(l!==void 0)if(Array.isArray(a))for(let g=0,S=u.length;g<S;g++){let m=u[g],f=a[m.materialIndex],M=Math.max(m.start,p.start),T=Math.min(l.count,Math.min(m.start+m.count,p.start+p.count));for(let _=M,b=T;_<b;_+=3){let v=_,A=_+1,x=_+2;s=Fa(this,f,t,n,c,h,d,v,A,x),s&&(s.faceIndex=Math.floor(_/3),s.face.materialIndex=m.materialIndex,e.push(s))}}else{let g=Math.max(0,p.start),S=Math.min(l.count,p.start+p.count);for(let m=g,f=S;m<f;m+=3){let M=m,T=m+1,_=m+2;s=Fa(this,a,t,n,c,h,d,M,T,_),s&&(s.faceIndex=Math.floor(m/3),e.push(s))}}}};function Kf(i,t,e,n,s,r,a,o){let l;if(t.side===Ne?l=n.intersectTriangle(a,r,s,!0,o):l=n.intersectTriangle(s,r,a,t.side===Ii,o),l===null)return null;Ua.copy(o),Ua.applyMatrix4(i.matrixWorld);let c=e.ray.origin.distanceTo(Ua);return c<e.near||c>e.far?null:{distance:c,point:Ua.clone(),object:i}}function Fa(i,t,e,n,s,r,a,o,l,c){i.getVertexPosition(o,Ia),i.getVertexPosition(l,La),i.getVertexPosition(c,Da);let h=Kf(i,t,e,n,Ia,La,Da,ru);if(h){let d=new P;ei.getBarycoord(ru,Ia,La,Da,d),s&&(h.uv=ei.getInterpolatedAttribute(s,o,l,c,d,new it)),r&&(h.uv1=ei.getInterpolatedAttribute(r,o,l,c,d,new it)),a&&(h.normal=ei.getInterpolatedAttribute(a,o,l,c,d,new P),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));let u={a:o,b:l,c,normal:new P,materialIndex:0};ei.getNormal(Ia,La,Da,u.normal),h.face=u,h.barycoord=d}return h}var Tr=class extends en{constructor(t=null,e=1,n=1,s,r,a,o,l,c=He,h=He,d,u){super(null,a,o,l,c,h,s,r,d,u),this.isDataTexture=!0,this.image={data:t,width:e,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var si=class extends ke{constructor(t,e,n,s=1){super(t,e,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){let t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}},bs=new ce,au=new ce,Oa=[],ou=new Gn,$f=new ce,ar=new at,or=new ii,ri=class extends at{constructor(t,e,n){super(t,e),this.isInstancedMesh=!0,this.instanceMatrix=new si(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,$f)}computeBoundingBox(){let t=this.geometry,e=this.count;this.boundingBox===null&&(this.boundingBox=new Gn),t.boundingBox===null&&t.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,bs),ou.copy(t.boundingBox).applyMatrix4(bs),this.boundingBox.union(ou)}computeBoundingSphere(){let t=this.geometry,e=this.count;this.boundingSphere===null&&(this.boundingSphere=new ii),t.boundingSphere===null&&t.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,bs),or.copy(t.boundingSphere).applyMatrix4(bs),this.boundingSphere.union(or)}copy(t,e){return super.copy(t,e),this.instanceMatrix.copy(t.instanceMatrix),t.morphTexture!==null&&(this.morphTexture=t.morphTexture.clone()),t.instanceColor!==null&&(this.instanceColor=t.instanceColor.clone()),this.count=t.count,t.boundingBox!==null&&(this.boundingBox=t.boundingBox.clone()),t.boundingSphere!==null&&(this.boundingSphere=t.boundingSphere.clone()),this}getColorAt(t,e){return this.instanceColor===null?e.setRGB(1,1,1):e.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,e){return e.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,e){let n=e.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,a=t*r+1;for(let o=0;o<n.length;o++)n[o]=s[a+o]}raycast(t,e){let n=this.matrixWorld,s=this.count;if(ar.geometry=this.geometry,ar.material=this.material,ar.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),or.copy(this.boundingSphere),or.applyMatrix4(n),t.ray.intersectsSphere(or)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,bs),au.multiplyMatrices(n,bs),ar.matrixWorld=au,ar.raycast(t,Oa);for(let a=0,o=Oa.length;a<o;a++){let l=Oa[a];l.instanceId=r,l.object=this,e.push(l)}Oa.length=0}}setColorAt(t,e){return this.instanceColor===null&&(this.instanceColor=new si(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),e.toArray(this.instanceColor.array,t*3),this}setMatrixAt(t,e){return e.toArray(this.instanceMatrix.array,t*16),this}setMorphAt(t,e){let n=e.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new Tr(new Float32Array(s*this.count),s,this.count,Ho,yn));let r=this.morphTexture.source.data.data,a=0;for(let c=0;c<n.length;c++)a+=n[c];let o=this.geometry.morphTargetsRelative?1:1-a,l=s*t;return r[l]=o,r.set(n,l+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},qi=new ii,jf=new it(.5,.5),Ba=new P,Us=class{constructor(t=new dn,e=new dn,n=new dn,s=new dn,r=new dn,a=new dn){this.planes=[t,e,n,s,r,a]}set(t,e,n,s,r,a){let o=this.planes;return o[0].copy(t),o[1].copy(e),o[2].copy(n),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(t){let e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=An,n=!1){let s=this.planes,r=t.elements,a=r[0],o=r[1],l=r[2],c=r[3],h=r[4],d=r[5],u=r[6],p=r[7],g=r[8],S=r[9],m=r[10],f=r[11],M=r[12],T=r[13],_=r[14],b=r[15];if(s[0].setComponents(c-a,p-h,f-g,b-M).normalize(),s[1].setComponents(c+a,p+h,f+g,b+M).normalize(),s[2].setComponents(c+o,p+d,f+S,b+T).normalize(),s[3].setComponents(c-o,p-d,f-S,b-T).normalize(),n)s[4].setComponents(l,u,m,_).normalize(),s[5].setComponents(c-l,p-u,f-m,b-_).normalize();else if(s[4].setComponents(c-l,p-u,f-m,b-_).normalize(),e===An)s[5].setComponents(c+l,p+u,f+m,b+_).normalize();else if(e===Ps)s[5].setComponents(l,u,m,_).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),qi.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{let e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),qi.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(qi)}intersectsSprite(t){qi.center.set(0,0,0);let e=jf.distanceTo(t.center);return qi.radius=.7071067811865476+e,qi.applyMatrix4(t.matrixWorld),this.intersectsSphere(qi)}intersectsSphere(t){let e=this.planes,n=t.center,s=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(t){let e=this.planes;for(let n=0;n<6;n++){let s=e[n];if(Ba.x=s.normal.x>0?t.max.x:t.min.x,Ba.y=s.normal.y>0?t.max.y:t.min.y,Ba.z=s.normal.z>0?t.max.z:t.min.z,s.distanceToPoint(Ba)<0)return!1}return!0}containsPoint(t){let e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var fn=class extends xn{constructor(t){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Nt(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.linewidth=t.linewidth,this.linecap=t.linecap,this.linejoin=t.linejoin,this.fog=t.fog,this}},ao=new P,oo=new P,lu=new ce,lr=new Ji,za=new ii,uc=new P,cu=new P,Pn=class extends we{constructor(t=new ae,e=new fn){super(),this.isLine=!0,this.type="Line",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}computeLineDistances(){let t=this.geometry;if(t.index===null){let e=t.attributes.position,n=[0];for(let s=1,r=e.count;s<r;s++)ao.fromBufferAttribute(e,s-1),oo.fromBufferAttribute(e,s),n[s]=n[s-1],n[s]+=ao.distanceTo(oo);t.setAttribute("lineDistance",new Ht(n,1))}else zt("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let n=this.geometry,s=this.matrixWorld,r=t.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),za.copy(n.boundingSphere),za.applyMatrix4(s),za.radius+=r,t.ray.intersectsSphere(za)===!1)return;lu.copy(s).invert(),lr.copy(t.ray).applyMatrix4(lu);let o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=this.isLineSegments?2:1,h=n.index,u=n.attributes.position;if(h!==null){let p=Math.max(0,a.start),g=Math.min(h.count,a.start+a.count);for(let S=p,m=g-1;S<m;S+=c){let f=h.getX(S),M=h.getX(S+1),T=ka(this,t,lr,l,f,M,S);T&&e.push(T)}if(this.isLineLoop){let S=h.getX(g-1),m=h.getX(p),f=ka(this,t,lr,l,S,m,g-1);f&&e.push(f)}}else{let p=Math.max(0,a.start),g=Math.min(u.count,a.start+a.count);for(let S=p,m=g-1;S<m;S+=c){let f=ka(this,t,lr,l,S,S+1,S);f&&e.push(f)}if(this.isLineLoop){let S=ka(this,t,lr,l,g-1,p,g-1);S&&e.push(S)}}}updateMorphTargets(){let e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){let s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}};function ka(i,t,e,n,s,r,a){let o=i.geometry.attributes.position;if(ao.fromBufferAttribute(o,s),oo.fromBufferAttribute(o,r),e.distanceSqToSegment(ao,oo,uc,cu)>n)return;uc.applyMatrix4(i.matrixWorld);let c=t.ray.origin.distanceTo(uc);if(!(c<t.near||c>t.far))return{distance:c,point:cu.clone().applyMatrix4(i.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:i}}var hu=new P,uu=new P,Mi=class extends Pn{constructor(t,e){super(t,e),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let t=this.geometry;if(t.index===null){let e=t.attributes.position,n=[];for(let s=0,r=e.count;s<r;s+=2)hu.fromBufferAttribute(e,s),uu.fromBufferAttribute(e,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+hu.distanceTo(uu);t.setAttribute("lineDistance",new Ht(n,1))}else zt("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}};var wr=class extends en{constructor(t=[],e=Li,n,s,r,a,o,l,c,h){super(t,e,n,s,r,a,o,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}},Ar=class extends en{constructor(t,e,n,s,r,a,o,l,c){super(t,e,n,s,r,a,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}};var Si=class extends en{constructor(t,e,n=Dn,s,r,a,o=He,l=He,c,h=kn,d=1){if(h!==kn&&h!==Ni)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let u={width:t,height:e,depth:d};super(u,s,r,a,o,l,h,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.source=new Ds(Object.assign({},t.image)),this.compareFunction=t.compareFunction,this}toJSON(t){let e=super.toJSON(t);return e.compareFunction=this.compareFunction,e}},lo=class extends Si{constructor(t,e=Dn,n=Li,s,r,a=He,o=He,l,c=kn){let h={width:t,height:t,depth:1},d=[h,h,h,h,h,h];super(t,t,e,n,s,r,a,o,l,c),this.image=d,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(t){this.image=t}},Rr=class extends en{constructor(t=null){super(),this.sourceTexture=t,this.isExternalTexture=!0}copy(t){return super.copy(t),this.sourceTexture=t.sourceTexture,this}},$e=class i extends ae{constructor(t=1,e=1,n=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:s,heightSegments:r,depthSegments:a};let o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);let l=[],c=[],h=[],d=[],u=0,p=0;g("z","y","x",-1,-1,n,e,t,a,r,0),g("z","y","x",1,-1,n,e,-t,a,r,1),g("x","z","y",1,1,t,n,e,s,a,2),g("x","z","y",1,-1,t,n,-e,s,a,3),g("x","y","z",1,-1,t,e,n,s,r,4),g("x","y","z",-1,-1,t,e,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new Ht(c,3)),this.setAttribute("normal",new Ht(h,3)),this.setAttribute("uv",new Ht(d,2));function g(S,m,f,M,T,_,b,v,A,x,w){let R=_/A,I=b/x,N=_/2,F=b/2,L=v/2,B=A+1,X=x+1,G=0,tt=0,Z=new P;for(let J=0;J<X;J++){let Y=J*I-F;for(let ft=0;ft<B;ft++){let bt=ft*R-N;Z[S]=bt*M,Z[m]=Y*T,Z[f]=L,c.push(Z.x,Z.y,Z.z),Z[S]=0,Z[m]=0,Z[f]=v>0?1:-1,h.push(Z.x,Z.y,Z.z),d.push(ft/A),d.push(1-J/x),G+=1}}for(let J=0;J<x;J++)for(let Y=0;Y<A;Y++){let ft=u+Y+B*J,bt=u+Y+B*(J+1),At=u+(Y+1)+B*(J+1),kt=u+(Y+1)+B*J;l.push(ft,bt,kt),l.push(bt,At,kt),tt+=6}o.addGroup(p,tt,w),p+=tt,u+=G}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}},Cr=class i extends ae{constructor(t=1,e=1,n=4,s=8,r=1){super(),this.type="CapsuleGeometry",this.parameters={radius:t,height:e,capSegments:n,radialSegments:s,heightSegments:r},e=Math.max(0,e),n=Math.max(1,Math.floor(n)),s=Math.max(3,Math.floor(s)),r=Math.max(1,Math.floor(r));let a=[],o=[],l=[],c=[],h=e/2,d=Math.PI/2*t,u=e,p=2*d+u,g=n*2+r,S=s+1,m=new P,f=new P;for(let M=0;M<=g;M++){let T=0,_=0,b=0,v=0;if(M<=n){let w=M/n,R=w*Math.PI/2;_=-h-t*Math.cos(R),b=t*Math.sin(R),v=-t*Math.cos(R),T=w*d}else if(M<=n+r){let w=(M-n)/r;_=-h+w*e,b=t,v=0,T=d+w*u}else{let w=(M-n-r)/n,R=w*Math.PI/2;_=h+t*Math.sin(R),b=t*Math.cos(R),v=t*Math.sin(R),T=d+u+w*d}let A=Math.max(0,Math.min(1,T/p)),x=0;M===0?x=.5/s:M===g&&(x=-.5/s);for(let w=0;w<=s;w++){let R=w/s,I=R*Math.PI*2,N=Math.sin(I),F=Math.cos(I);f.x=-b*F,f.y=_,f.z=b*N,o.push(f.x,f.y,f.z),m.set(-b*F,v,b*N),m.normalize(),l.push(m.x,m.y,m.z),c.push(R+x,A)}if(M>0){let w=(M-1)*S;for(let R=0;R<s;R++){let I=w+R,N=w+R+1,F=M*S+R,L=M*S+R+1;a.push(I,N,F),a.push(N,L,F)}}}this.setIndex(a),this.setAttribute("position",new Ht(o,3)),this.setAttribute("normal",new Ht(l,3)),this.setAttribute("uv",new Ht(c,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radius,t.height,t.capSegments,t.radialSegments,t.heightSegments)}},In=class i extends ae{constructor(t=1,e=32,n=0,s=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:t,segments:e,thetaStart:n,thetaLength:s},e=Math.max(3,e);let r=[],a=[],o=[],l=[],c=new P,h=new it;a.push(0,0,0),o.push(0,0,1),l.push(.5,.5);for(let d=0,u=3;d<=e;d++,u+=3){let p=n+d/e*s;c.x=t*Math.cos(p),c.y=t*Math.sin(p),a.push(c.x,c.y,c.z),o.push(0,0,1),h.x=(a[u]/t+1)/2,h.y=(a[u+1]/t+1)/2,l.push(h.x,h.y)}for(let d=1;d<=e;d++)r.push(d,d+1,0);this.setIndex(r),this.setAttribute("position",new Ht(a,3)),this.setAttribute("normal",new Ht(o,3)),this.setAttribute("uv",new Ht(l,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radius,t.segments,t.thetaStart,t.thetaLength)}},ee=class i extends ae{constructor(t=1,e=1,n=1,s=32,r=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:n,radialSegments:s,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:l};let c=this;s=Math.floor(s),r=Math.floor(r);let h=[],d=[],u=[],p=[],g=0,S=[],m=n/2,f=0;M(),a===!1&&(t>0&&T(!0),e>0&&T(!1)),this.setIndex(h),this.setAttribute("position",new Ht(d,3)),this.setAttribute("normal",new Ht(u,3)),this.setAttribute("uv",new Ht(p,2));function M(){let _=new P,b=new P,v=0,A=(e-t)/n;for(let x=0;x<=r;x++){let w=[],R=x/r,I=R*(e-t)+t;for(let N=0;N<=s;N++){let F=N/s,L=F*l+o,B=Math.sin(L),X=Math.cos(L);b.x=I*B,b.y=-R*n+m,b.z=I*X,d.push(b.x,b.y,b.z),_.set(B,A,X).normalize(),u.push(_.x,_.y,_.z),p.push(F,1-R),w.push(g++)}S.push(w)}for(let x=0;x<s;x++)for(let w=0;w<r;w++){let R=S[w][x],I=S[w+1][x],N=S[w+1][x+1],F=S[w][x+1];(t>0||w!==0)&&(h.push(R,I,F),v+=3),(e>0||w!==r-1)&&(h.push(I,N,F),v+=3)}c.addGroup(f,v,0),f+=v}function T(_){let b=g,v=new it,A=new P,x=0,w=_===!0?t:e,R=_===!0?1:-1;for(let N=1;N<=s;N++)d.push(0,m*R,0),u.push(0,R,0),p.push(.5,.5),g++;let I=g;for(let N=0;N<=s;N++){let L=N/s*l+o,B=Math.cos(L),X=Math.sin(L);A.x=w*X,A.y=m*R,A.z=w*B,d.push(A.x,A.y,A.z),u.push(0,R,0),v.x=B*.5+.5,v.y=X*.5*R+.5,p.push(v.x,v.y),g++}for(let N=0;N<s;N++){let F=b+N,L=I+N;_===!0?h.push(L,L+1,F):h.push(L+1,L,F),x+=3}c.addGroup(f,x,_===!0?1:2),f+=x}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},bi=class i extends ee{constructor(t=1,e=1,n=32,s=1,r=!1,a=0,o=Math.PI*2){super(0,t,e,n,s,r,a,o),this.type="ConeGeometry",this.parameters={radius:t,height:e,radialSegments:n,heightSegments:s,openEnded:r,thetaStart:a,thetaLength:o}}static fromJSON(t){return new i(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},co=class i extends ae{constructor(t=[],e=[],n=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:t,indices:e,radius:n,detail:s};let r=[],a=[];o(s),c(n),h(),this.setAttribute("position",new Ht(r,3)),this.setAttribute("normal",new Ht(r.slice(),3)),this.setAttribute("uv",new Ht(a,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function o(M){let T=new P,_=new P,b=new P;for(let v=0;v<e.length;v+=3)p(e[v+0],T),p(e[v+1],_),p(e[v+2],b),l(T,_,b,M)}function l(M,T,_,b){let v=b+1,A=[];for(let x=0;x<=v;x++){A[x]=[];let w=M.clone().lerp(_,x/v),R=T.clone().lerp(_,x/v),I=v-x;for(let N=0;N<=I;N++)N===0&&x===v?A[x][N]=w:A[x][N]=w.clone().lerp(R,N/I)}for(let x=0;x<v;x++)for(let w=0;w<2*(v-x)-1;w++){let R=Math.floor(w/2);w%2===0?(u(A[x][R+1]),u(A[x+1][R]),u(A[x][R])):(u(A[x][R+1]),u(A[x+1][R+1]),u(A[x+1][R]))}}function c(M){let T=new P;for(let _=0;_<r.length;_+=3)T.x=r[_+0],T.y=r[_+1],T.z=r[_+2],T.normalize().multiplyScalar(M),r[_+0]=T.x,r[_+1]=T.y,r[_+2]=T.z}function h(){let M=new P;for(let T=0;T<r.length;T+=3){M.x=r[T+0],M.y=r[T+1],M.z=r[T+2];let _=m(M)/2/Math.PI+.5,b=f(M)/Math.PI+.5;a.push(_,1-b)}g(),d()}function d(){for(let M=0;M<a.length;M+=6){let T=a[M+0],_=a[M+2],b=a[M+4],v=Math.max(T,_,b),A=Math.min(T,_,b);v>.9&&A<.1&&(T<.2&&(a[M+0]+=1),_<.2&&(a[M+2]+=1),b<.2&&(a[M+4]+=1))}}function u(M){r.push(M.x,M.y,M.z)}function p(M,T){let _=M*3;T.x=t[_+0],T.y=t[_+1],T.z=t[_+2]}function g(){let M=new P,T=new P,_=new P,b=new P,v=new it,A=new it,x=new it;for(let w=0,R=0;w<r.length;w+=9,R+=6){M.set(r[w+0],r[w+1],r[w+2]),T.set(r[w+3],r[w+4],r[w+5]),_.set(r[w+6],r[w+7],r[w+8]),v.set(a[R+0],a[R+1]),A.set(a[R+2],a[R+3]),x.set(a[R+4],a[R+5]),b.copy(M).add(T).add(_).divideScalar(3);let I=m(b);S(v,R+0,M,I),S(A,R+2,T,I),S(x,R+4,_,I)}}function S(M,T,_,b){b<0&&M.x===1&&(a[T]=M.x-1),_.x===0&&_.z===0&&(a[T]=b/2/Math.PI+.5)}function m(M){return Math.atan2(M.z,-M.x)}function f(M){return Math.atan2(-M.y,Math.sqrt(M.x*M.x+M.z*M.z))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.vertices,t.indices,t.radius,t.detail)}};var pn=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){zt("Curve: .getPoint() not implemented.")}getPointAt(t,e){let n=this.getUtoTmapping(t);return this.getPoint(n,e)}getPoints(t=5){let e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return e}getSpacedPoints(t=5){let e=[];for(let n=0;n<=t;n++)e.push(this.getPointAt(n/t));return e}getLength(){let t=this.getLengths();return t[t.length-1]}getLengths(t=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===t+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let e=[],n,s=this.getPoint(0),r=0;e.push(0);for(let a=1;a<=t;a++)n=this.getPoint(a/t),r+=n.distanceTo(s),e.push(r),s=n;return this.cacheArcLengths=e,e}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(t,e=null){let n=this.getLengths(),s=0,r=n.length,a;e?a=e:a=t*n[r-1];let o=0,l=r-1,c;for(;o<=l;)if(s=Math.floor(o+(l-o)/2),c=n[s]-a,c<0)o=s+1;else if(c>0)l=s-1;else{l=s;break}if(s=l,n[s]===a)return s/(r-1);let h=n[s],u=n[s+1]-h,p=(a-h)/u;return(s+p)/(r-1)}getTangent(t,e){let s=t-1e-4,r=t+1e-4;s<0&&(s=0),r>1&&(r=1);let a=this.getPoint(s),o=this.getPoint(r),l=e||(a.isVector2?new it:new P);return l.copy(o).sub(a).normalize(),l}getTangentAt(t,e){let n=this.getUtoTmapping(t);return this.getTangent(n,e)}computeFrenetFrames(t,e=!1){let n=new P,s=[],r=[],a=[],o=new P,l=new ce;for(let p=0;p<=t;p++){let g=p/t;s[p]=this.getTangentAt(g,new P)}r[0]=new P,a[0]=new P;let c=Number.MAX_VALUE,h=Math.abs(s[0].x),d=Math.abs(s[0].y),u=Math.abs(s[0].z);h<=c&&(c=h,n.set(1,0,0)),d<=c&&(c=d,n.set(0,1,0)),u<=c&&n.set(0,0,1),o.crossVectors(s[0],n).normalize(),r[0].crossVectors(s[0],o),a[0].crossVectors(s[0],r[0]);for(let p=1;p<=t;p++){if(r[p]=r[p-1].clone(),a[p]=a[p-1].clone(),o.crossVectors(s[p-1],s[p]),o.length()>Number.EPSILON){o.normalize();let g=Math.acos(Qt(s[p-1].dot(s[p]),-1,1));r[p].applyMatrix4(l.makeRotationAxis(o,g))}a[p].crossVectors(s[p],r[p])}if(e===!0){let p=Math.acos(Qt(r[0].dot(r[t]),-1,1));p/=t,s[0].dot(o.crossVectors(r[0],r[t]))>0&&(p=-p);for(let g=1;g<=t;g++)r[g].applyMatrix4(l.makeRotationAxis(s[g],p*g)),a[g].crossVectors(s[g],r[g])}return{tangents:s,normals:r,binormals:a}}clone(){return new this.constructor().copy(this)}copy(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}toJSON(){let t={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return t.arcLengthDivisions=this.arcLengthDivisions,t.type=this.type,t}fromJSON(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}},Fs=class extends pn{constructor(t=0,e=0,n=1,s=1,r=0,a=Math.PI*2,o=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=t,this.aY=e,this.xRadius=n,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=a,this.aClockwise=o,this.aRotation=l}getPoint(t,e=new it){let n=e,s=Math.PI*2,r=this.aEndAngle-this.aStartAngle,a=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(a?r=0:r=s),this.aClockwise===!0&&!a&&(r===s?r=-s:r=r-s);let o=this.aStartAngle+t*r,l=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){let h=Math.cos(this.aRotation),d=Math.sin(this.aRotation),u=l-this.aX,p=c-this.aY;l=u*h-p*d+this.aX,c=u*d+p*h+this.aY}return n.set(l,c)}copy(t){return super.copy(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}toJSON(){let t=super.toJSON();return t.aX=this.aX,t.aY=this.aY,t.xRadius=this.xRadius,t.yRadius=this.yRadius,t.aStartAngle=this.aStartAngle,t.aEndAngle=this.aEndAngle,t.aClockwise=this.aClockwise,t.aRotation=this.aRotation,t}fromJSON(t){return super.fromJSON(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}},ho=class extends Fs{constructor(t,e,n,s,r,a){super(t,e,n,n,s,r,a),this.isArcCurve=!0,this.type="ArcCurve"}};function Kc(){let i=0,t=0,e=0,n=0;function s(r,a,o,l){i=r,t=o,e=-3*r+3*a-2*o-l,n=2*r-2*a+o+l}return{initCatmullRom:function(r,a,o,l,c){s(a,o,c*(o-r),c*(l-a))},initNonuniformCatmullRom:function(r,a,o,l,c,h,d){let u=(a-r)/c-(o-r)/(c+h)+(o-a)/h,p=(o-a)/h-(l-a)/(h+d)+(l-o)/d;u*=h,p*=h,s(a,o,u,p)},calc:function(r){let a=r*r,o=a*r;return i+t*r+e*a+n*o}}}var du=new P,fu=new P,dc=new Kc,fc=new Kc,pc=new Kc,ai=class extends pn{constructor(t=[],e=!1,n="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=t,this.closed=e,this.curveType=n,this.tension=s}getPoint(t,e=new P){let n=e,s=this.points,r=s.length,a=(r-(this.closed?0:1))*t,o=Math.floor(a),l=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/r)+1)*r:l===0&&o===r-1&&(o=r-2,l=1);let c,h;this.closed||o>0?c=s[(o-1)%r]:(fu.subVectors(s[0],s[1]).add(s[0]),c=fu);let d=s[o%r],u=s[(o+1)%r];if(this.closed||o+2<r?h=s[(o+2)%r]:(du.subVectors(s[r-1],s[r-2]).add(s[r-1]),h=du),this.curveType==="centripetal"||this.curveType==="chordal"){let p=this.curveType==="chordal"?.5:.25,g=Math.pow(c.distanceToSquared(d),p),S=Math.pow(d.distanceToSquared(u),p),m=Math.pow(u.distanceToSquared(h),p);S<1e-4&&(S=1),g<1e-4&&(g=S),m<1e-4&&(m=S),dc.initNonuniformCatmullRom(c.x,d.x,u.x,h.x,g,S,m),fc.initNonuniformCatmullRom(c.y,d.y,u.y,h.y,g,S,m),pc.initNonuniformCatmullRom(c.z,d.z,u.z,h.z,g,S,m)}else this.curveType==="catmullrom"&&(dc.initCatmullRom(c.x,d.x,u.x,h.x,this.tension),fc.initCatmullRom(c.y,d.y,u.y,h.y,this.tension),pc.initCatmullRom(c.z,d.z,u.z,h.z,this.tension));return n.set(dc.calc(l),fc.calc(l),pc.calc(l)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(s.clone())}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){let s=this.points[e];t.points.push(s.toArray())}return t.closed=this.closed,t.curveType=this.curveType,t.tension=this.tension,t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(new P().fromArray(s))}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}};function pu(i,t,e,n,s){let r=(n-t)*.5,a=(s-e)*.5,o=i*i,l=i*o;return(2*e-2*n+r+a)*l+(-3*e+3*n-2*r-a)*o+r*i+e}function Qf(i,t){let e=1-i;return e*e*t}function tp(i,t){return 2*(1-i)*i*t}function ep(i,t){return i*i*t}function dr(i,t,e,n){return Qf(i,t)+tp(i,e)+ep(i,n)}function np(i,t){let e=1-i;return e*e*e*t}function ip(i,t){let e=1-i;return 3*e*e*i*t}function sp(i,t){return 3*(1-i)*i*i*t}function rp(i,t){return i*i*i*t}function fr(i,t,e,n,s){return np(i,t)+ip(i,e)+sp(i,n)+rp(i,s)}var Pr=class extends pn{constructor(t=new it,e=new it,n=new it,s=new it){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=t,this.v1=e,this.v2=n,this.v3=s}getPoint(t,e=new it){let n=e,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(fr(t,s.x,r.x,a.x,o.x),fr(t,s.y,r.y,a.y,o.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},uo=class extends pn{constructor(t=new P,e=new P,n=new P,s=new P){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=t,this.v1=e,this.v2=n,this.v3=s}getPoint(t,e=new P){let n=e,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(fr(t,s.x,r.x,a.x,o.x),fr(t,s.y,r.y,a.y,o.y),fr(t,s.z,r.z,a.z,o.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},Ir=class extends pn{constructor(t=new it,e=new it){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=t,this.v2=e}getPoint(t,e=new it){let n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new it){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},fo=class extends pn{constructor(t=new P,e=new P){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=t,this.v2=e}getPoint(t,e=new P){let n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new P){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Lr=class extends pn{constructor(t=new it,e=new it,n=new it){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new it){let n=e,s=this.v0,r=this.v1,a=this.v2;return n.set(dr(t,s.x,r.x,a.x),dr(t,s.y,r.y,a.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Dr=class extends pn{constructor(t=new P,e=new P,n=new P){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new P){let n=e,s=this.v0,r=this.v1,a=this.v2;return n.set(dr(t,s.x,r.x,a.x),dr(t,s.y,r.y,a.y),dr(t,s.z,r.z,a.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Nr=class extends pn{constructor(t=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=t}getPoint(t,e=new it){let n=e,s=this.points,r=(s.length-1)*t,a=Math.floor(r),o=r-a,l=s[a===0?a:a-1],c=s[a],h=s[a>s.length-2?s.length-1:a+1],d=s[a>s.length-3?s.length-1:a+2];return n.set(pu(o,l.x,c.x,h.x,d.x),pu(o,l.y,c.y,h.y,d.y)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(s.clone())}return this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){let s=this.points[e];t.points.push(s.toArray())}return t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(new it().fromArray(s))}return this}},po=Object.freeze({__proto__:null,ArcCurve:ho,CatmullRomCurve3:ai,CubicBezierCurve:Pr,CubicBezierCurve3:uo,EllipseCurve:Fs,LineCurve:Ir,LineCurve3:fo,QuadraticBezierCurve:Lr,QuadraticBezierCurve3:Dr,SplineCurve:Nr}),mo=class extends pn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(t){this.curves.push(t)}closePath(){let t=this.curves[0].getPoint(0),e=this.curves[this.curves.length-1].getPoint(1);if(!t.equals(e)){let n=t.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new po[n](e,t))}return this}getPoint(t,e){let n=t*this.getLength(),s=this.getCurveLengths(),r=0;for(;r<s.length;){if(s[r]>=n){let a=s[r]-n,o=this.curves[r],l=o.getLength(),c=l===0?0:1-a/l;return o.getPointAt(c,e)}r++}return null}getLength(){let t=this.getCurveLengths();return t[t.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let t=[],e=0;for(let n=0,s=this.curves.length;n<s;n++)e+=this.curves[n].getLength(),t.push(e);return this.cacheLengths=t,t}getSpacedPoints(t=40){let e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return this.autoClose&&e.push(e[0]),e}getPoints(t=12){let e=[],n;for(let s=0,r=this.curves;s<r.length;s++){let a=r[s],o=a.isEllipseCurve?t*2:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?t*a.points.length:t,l=a.getPoints(o);for(let c=0;c<l.length;c++){let h=l[c];n&&n.equals(h)||(e.push(h),n=h)}}return this.autoClose&&e.length>1&&!e[e.length-1].equals(e[0])&&e.push(e[0]),e}copy(t){super.copy(t),this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){let s=t.curves[e];this.curves.push(s.clone())}return this.autoClose=t.autoClose,this}toJSON(){let t=super.toJSON();t.autoClose=this.autoClose,t.curves=[];for(let e=0,n=this.curves.length;e<n;e++){let s=this.curves[e];t.curves.push(s.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.autoClose=t.autoClose,this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){let s=t.curves[e];this.curves.push(new po[s.type]().fromJSON(s))}return this}},Ur=class extends mo{constructor(t){super(),this.type="Path",this.currentPoint=new it,t&&this.setFromPoints(t)}setFromPoints(t){this.moveTo(t[0].x,t[0].y);for(let e=1,n=t.length;e<n;e++)this.lineTo(t[e].x,t[e].y);return this}moveTo(t,e){return this.currentPoint.set(t,e),this}lineTo(t,e){let n=new Ir(this.currentPoint.clone(),new it(t,e));return this.curves.push(n),this.currentPoint.set(t,e),this}quadraticCurveTo(t,e,n,s){let r=new Lr(this.currentPoint.clone(),new it(t,e),new it(n,s));return this.curves.push(r),this.currentPoint.set(n,s),this}bezierCurveTo(t,e,n,s,r,a){let o=new Pr(this.currentPoint.clone(),new it(t,e),new it(n,s),new it(r,a));return this.curves.push(o),this.currentPoint.set(r,a),this}splineThru(t){let e=[this.currentPoint.clone()].concat(t),n=new Nr(e);return this.curves.push(n),this.currentPoint.copy(t[t.length-1]),this}arc(t,e,n,s,r,a){let o=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(t+o,e+l,n,s,r,a),this}absarc(t,e,n,s,r,a){return this.absellipse(t,e,n,n,s,r,a),this}ellipse(t,e,n,s,r,a,o,l){let c=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(t+c,e+h,n,s,r,a,o,l),this}absellipse(t,e,n,s,r,a,o,l){let c=new Fs(t,e,n,s,r,a,o,l);if(this.curves.length>0){let d=c.getPoint(0);d.equals(this.currentPoint)||this.lineTo(d.x,d.y)}this.curves.push(c);let h=c.getPoint(1);return this.currentPoint.copy(h),this}copy(t){return super.copy(t),this.currentPoint.copy(t.currentPoint),this}toJSON(){let t=super.toJSON();return t.currentPoint=this.currentPoint.toArray(),t}fromJSON(t){return super.fromJSON(t),this.currentPoint.fromArray(t.currentPoint),this}},Os=class extends Ur{constructor(t){super(t),this.uuid=zn(),this.type="Shape",this.holes=[]}getPointsHoles(t){let e=[];for(let n=0,s=this.holes.length;n<s;n++)e[n]=this.holes[n].getPoints(t);return e}extractPoints(t){return{shape:this.getPoints(t),holes:this.getPointsHoles(t)}}copy(t){super.copy(t),this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){let s=t.holes[e];this.holes.push(s.clone())}return this}toJSON(){let t=super.toJSON();t.uuid=this.uuid,t.holes=[];for(let e=0,n=this.holes.length;e<n;e++){let s=this.holes[e];t.holes.push(s.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.uuid=t.uuid,this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){let s=t.holes[e];this.holes.push(new Ur().fromJSON(s))}return this}};function ap(i,t,e=2){let n=t&&t.length,s=n?t[0]*e:i.length,r=ld(i,0,s,e,!0),a=[];if(!r||r.next===r.prev)return a;let o,l,c;if(n&&(r=up(i,t,r,e)),i.length>80*e){o=i[0],l=i[1];let h=o,d=l;for(let u=e;u<s;u+=e){let p=i[u],g=i[u+1];p<o&&(o=p),g<l&&(l=g),p>h&&(h=p),g>d&&(d=g)}c=Math.max(h-o,d-l),c=c!==0?32767/c:0}return Fr(r,a,e,o,l,c,0),a}function ld(i,t,e,n,s){let r;if(s===Sp(i,t,e,n)>0)for(let a=t;a<e;a+=n)r=mu(a/n|0,i[a],i[a+1],r);else for(let a=e-n;a>=t;a-=n)r=mu(a/n|0,i[a],i[a+1],r);return r&&Bs(r,r.next)&&(Br(r),r=r.next),r}function Ki(i,t){if(!i)return i;t||(t=i);let e=i,n;do if(n=!1,!e.steiner&&(Bs(e,e.next)||Re(e.prev,e,e.next)===0)){if(Br(e),e=t=e.prev,e===e.next)break;n=!0}else e=e.next;while(n||e!==t);return t}function Fr(i,t,e,n,s,r,a){if(!i)return;!a&&r&&gp(i,n,s,r);let o=i;for(;i.prev!==i.next;){let l=i.prev,c=i.next;if(r?lp(i,n,s,r):op(i)){t.push(l.i,i.i,c.i),Br(i),i=c.next,o=c.next;continue}if(i=c,i===o){a?a===1?(i=cp(Ki(i),t),Fr(i,t,e,n,s,r,2)):a===2&&hp(i,t,e,n,s,r):Fr(Ki(i),t,e,n,s,r,1);break}}}function op(i){let t=i.prev,e=i,n=i.next;if(Re(t,e,n)>=0)return!1;let s=t.x,r=e.x,a=n.x,o=t.y,l=e.y,c=n.y,h=Math.min(s,r,a),d=Math.min(o,l,c),u=Math.max(s,r,a),p=Math.max(o,l,c),g=n.next;for(;g!==t;){if(g.x>=h&&g.x<=u&&g.y>=d&&g.y<=p&&cr(s,o,r,l,a,c,g.x,g.y)&&Re(g.prev,g,g.next)>=0)return!1;g=g.next}return!0}function lp(i,t,e,n){let s=i.prev,r=i,a=i.next;if(Re(s,r,a)>=0)return!1;let o=s.x,l=r.x,c=a.x,h=s.y,d=r.y,u=a.y,p=Math.min(o,l,c),g=Math.min(h,d,u),S=Math.max(o,l,c),m=Math.max(h,d,u),f=Mc(p,g,t,e,n),M=Mc(S,m,t,e,n),T=i.prevZ,_=i.nextZ;for(;T&&T.z>=f&&_&&_.z<=M;){if(T.x>=p&&T.x<=S&&T.y>=g&&T.y<=m&&T!==s&&T!==a&&cr(o,h,l,d,c,u,T.x,T.y)&&Re(T.prev,T,T.next)>=0||(T=T.prevZ,_.x>=p&&_.x<=S&&_.y>=g&&_.y<=m&&_!==s&&_!==a&&cr(o,h,l,d,c,u,_.x,_.y)&&Re(_.prev,_,_.next)>=0))return!1;_=_.nextZ}for(;T&&T.z>=f;){if(T.x>=p&&T.x<=S&&T.y>=g&&T.y<=m&&T!==s&&T!==a&&cr(o,h,l,d,c,u,T.x,T.y)&&Re(T.prev,T,T.next)>=0)return!1;T=T.prevZ}for(;_&&_.z<=M;){if(_.x>=p&&_.x<=S&&_.y>=g&&_.y<=m&&_!==s&&_!==a&&cr(o,h,l,d,c,u,_.x,_.y)&&Re(_.prev,_,_.next)>=0)return!1;_=_.nextZ}return!0}function cp(i,t){let e=i;do{let n=e.prev,s=e.next.next;!Bs(n,s)&&hd(n,e,e.next,s)&&Or(n,s)&&Or(s,n)&&(t.push(n.i,e.i,s.i),Br(e),Br(e.next),e=i=s),e=e.next}while(e!==i);return Ki(e)}function hp(i,t,e,n,s,r){let a=i;do{let o=a.next.next;for(;o!==a.prev;){if(a.i!==o.i&&yp(a,o)){let l=ud(a,o);a=Ki(a,a.next),l=Ki(l,l.next),Fr(a,t,e,n,s,r,0),Fr(l,t,e,n,s,r,0);return}o=o.next}a=a.next}while(a!==i)}function up(i,t,e,n){let s=[];for(let r=0,a=t.length;r<a;r++){let o=t[r]*n,l=r<a-1?t[r+1]*n:i.length,c=ld(i,o,l,n,!1);c===c.next&&(c.steiner=!0),s.push(xp(c))}s.sort(dp);for(let r=0;r<s.length;r++)e=fp(s[r],e);return e}function dp(i,t){let e=i.x-t.x;if(e===0&&(e=i.y-t.y,e===0)){let n=(i.next.y-i.y)/(i.next.x-i.x),s=(t.next.y-t.y)/(t.next.x-t.x);e=n-s}return e}function fp(i,t){let e=pp(i,t);if(!e)return t;let n=ud(e,i);return Ki(n,n.next),Ki(e,e.next)}function pp(i,t){let e=t,n=i.x,s=i.y,r=-1/0,a;if(Bs(i,e))return e;do{if(Bs(i,e.next))return e.next;if(s<=e.y&&s>=e.next.y&&e.next.y!==e.y){let d=e.x+(s-e.y)*(e.next.x-e.x)/(e.next.y-e.y);if(d<=n&&d>r&&(r=d,a=e.x<e.next.x?e:e.next,d===n))return a}e=e.next}while(e!==t);if(!a)return null;let o=a,l=a.x,c=a.y,h=1/0;e=a;do{if(n>=e.x&&e.x>=l&&n!==e.x&&cd(s<c?n:r,s,l,c,s<c?r:n,s,e.x,e.y)){let d=Math.abs(s-e.y)/(n-e.x);Or(e,i)&&(d<h||d===h&&(e.x>a.x||e.x===a.x&&mp(a,e)))&&(a=e,h=d)}e=e.next}while(e!==o);return a}function mp(i,t){return Re(i.prev,i,t.prev)<0&&Re(t.next,i,i.next)<0}function gp(i,t,e,n){let s=i;do s.z===0&&(s.z=Mc(s.x,s.y,t,e,n)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==i);s.prevZ.nextZ=null,s.prevZ=null,_p(s)}function _p(i){let t,e=1;do{let n=i,s;i=null;let r=null;for(t=0;n;){t++;let a=n,o=0;for(let c=0;c<e&&(o++,a=a.nextZ,!!a);c++);let l=e;for(;o>0||l>0&&a;)o!==0&&(l===0||!a||n.z<=a.z)?(s=n,n=n.nextZ,o--):(s=a,a=a.nextZ,l--),r?r.nextZ=s:i=s,s.prevZ=r,r=s;n=a}r.nextZ=null,e*=2}while(t>1);return i}function Mc(i,t,e,n,s){return i=(i-e)*s|0,t=(t-n)*s|0,i=(i|i<<8)&16711935,i=(i|i<<4)&252645135,i=(i|i<<2)&858993459,i=(i|i<<1)&1431655765,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,i|t<<1}function xp(i){let t=i,e=i;do(t.x<e.x||t.x===e.x&&t.y<e.y)&&(e=t),t=t.next;while(t!==i);return e}function cd(i,t,e,n,s,r,a,o){return(s-a)*(t-o)>=(i-a)*(r-o)&&(i-a)*(n-o)>=(e-a)*(t-o)&&(e-a)*(r-o)>=(s-a)*(n-o)}function cr(i,t,e,n,s,r,a,o){return!(i===a&&t===o)&&cd(i,t,e,n,s,r,a,o)}function yp(i,t){return i.next.i!==t.i&&i.prev.i!==t.i&&!vp(i,t)&&(Or(i,t)&&Or(t,i)&&Mp(i,t)&&(Re(i.prev,i,t.prev)||Re(i,t.prev,t))||Bs(i,t)&&Re(i.prev,i,i.next)>0&&Re(t.prev,t,t.next)>0)}function Re(i,t,e){return(t.y-i.y)*(e.x-t.x)-(t.x-i.x)*(e.y-t.y)}function Bs(i,t){return i.x===t.x&&i.y===t.y}function hd(i,t,e,n){let s=Va(Re(i,t,e)),r=Va(Re(i,t,n)),a=Va(Re(e,n,i)),o=Va(Re(e,n,t));return!!(s!==r&&a!==o||s===0&&Ha(i,e,t)||r===0&&Ha(i,n,t)||a===0&&Ha(e,i,n)||o===0&&Ha(e,t,n))}function Ha(i,t,e){return t.x<=Math.max(i.x,e.x)&&t.x>=Math.min(i.x,e.x)&&t.y<=Math.max(i.y,e.y)&&t.y>=Math.min(i.y,e.y)}function Va(i){return i>0?1:i<0?-1:0}function vp(i,t){let e=i;do{if(e.i!==i.i&&e.next.i!==i.i&&e.i!==t.i&&e.next.i!==t.i&&hd(e,e.next,i,t))return!0;e=e.next}while(e!==i);return!1}function Or(i,t){return Re(i.prev,i,i.next)<0?Re(i,t,i.next)>=0&&Re(i,i.prev,t)>=0:Re(i,t,i.prev)<0||Re(i,i.next,t)<0}function Mp(i,t){let e=i,n=!1,s=(i.x+t.x)/2,r=(i.y+t.y)/2;do e.y>r!=e.next.y>r&&e.next.y!==e.y&&s<(e.next.x-e.x)*(r-e.y)/(e.next.y-e.y)+e.x&&(n=!n),e=e.next;while(e!==i);return n}function ud(i,t){let e=Sc(i.i,i.x,i.y),n=Sc(t.i,t.x,t.y),s=i.next,r=t.prev;return i.next=t,t.prev=i,e.next=s,s.prev=e,n.next=e,e.prev=n,r.next=n,n.prev=r,n}function mu(i,t,e,n){let s=Sc(i,t,e);return n?(s.next=n.next,s.prev=n,n.next.prev=s,n.next=s):(s.prev=s,s.next=s),s}function Br(i){i.next.prev=i.prev,i.prev.next=i.next,i.prevZ&&(i.prevZ.nextZ=i.nextZ),i.nextZ&&(i.nextZ.prevZ=i.prevZ)}function Sc(i,t,e){return{i,x:t,y:e,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function Sp(i,t,e,n){let s=0;for(let r=t,a=e-n;r<e;r+=n)s+=(i[a]-i[r])*(i[r+1]+i[a+1]),a=r;return s}var bc=class{static triangulate(t,e,n=2){return ap(t,e,n)}},Yi=class i{static area(t){let e=t.length,n=0;for(let s=e-1,r=0;r<e;s=r++)n+=t[s].x*t[r].y-t[r].x*t[s].y;return n*.5}static isClockWise(t){return i.area(t)<0}static triangulateShape(t,e){let n=[],s=[],r=[];gu(t),_u(n,t);let a=t.length;e.forEach(gu);for(let l=0;l<e.length;l++)s.push(a),a+=e[l].length,_u(n,e[l]);let o=bc.triangulate(n,s);for(let l=0;l<o.length;l+=3)r.push(o.slice(l,l+3));return r}};function gu(i){let t=i.length;t>2&&i[t-1].equals(i[0])&&i.pop()}function _u(i,t){for(let e=0;e<t.length;e++)i.push(t[e].x),i.push(t[e].y)}var zr=class i extends ae{constructor(t=new Os([new it(.5,.5),new it(-.5,.5),new it(-.5,-.5),new it(.5,-.5)]),e={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:t,options:e},t=Array.isArray(t)?t:[t];let n=this,s=[],r=[];for(let o=0,l=t.length;o<l;o++){let c=t[o];a(c)}this.setAttribute("position",new Ht(s,3)),this.setAttribute("uv",new Ht(r,2)),this.computeVertexNormals();function a(o){let l=[],c=e.curveSegments!==void 0?e.curveSegments:12,h=e.steps!==void 0?e.steps:1,d=e.depth!==void 0?e.depth:1,u=e.bevelEnabled!==void 0?e.bevelEnabled:!0,p=e.bevelThickness!==void 0?e.bevelThickness:.2,g=e.bevelSize!==void 0?e.bevelSize:p-.1,S=e.bevelOffset!==void 0?e.bevelOffset:0,m=e.bevelSegments!==void 0?e.bevelSegments:3,f=e.extrudePath,M=e.UVGenerator!==void 0?e.UVGenerator:bp,T,_=!1,b,v,A,x;if(f){T=f.getSpacedPoints(h),_=!0,u=!1;let nt=f.isCatmullRomCurve3?f.closed:!1;b=f.computeFrenetFrames(h,nt),v=new P,A=new P,x=new P}u||(m=0,p=0,g=0,S=0);let w=o.extractPoints(c),R=w.shape,I=w.holes;if(!Yi.isClockWise(R)){R=R.reverse();for(let nt=0,rt=I.length;nt<rt;nt++){let ot=I[nt];Yi.isClockWise(ot)&&(I[nt]=ot.reverse())}}function F(nt){let ot=10000000000000001e-36,lt=nt[0];for(let dt=1;dt<=nt.length;dt++){let Vt=dt%nt.length,Ot=nt[Vt],Yt=Ot.x-lt.x,Jt=Ot.y-lt.y,D=Yt*Yt+Jt*Jt,ue=Math.max(Math.abs(Ot.x),Math.abs(Ot.y),Math.abs(lt.x),Math.abs(lt.y)),ie=ot*ue*ue;if(D<=ie){nt.splice(Vt,1),dt--;continue}lt=Ot}}F(R),I.forEach(F);let L=I.length,B=R;for(let nt=0;nt<L;nt++){let rt=I[nt];R=R.concat(rt)}function X(nt,rt,ot){return rt||Wt("ExtrudeGeometry: vec does not exist"),nt.clone().addScaledVector(rt,ot)}let G=R.length;function tt(nt,rt,ot){let lt,dt,Vt,Ot=nt.x-rt.x,Yt=nt.y-rt.y,Jt=ot.x-nt.x,D=ot.y-nt.y,ue=Ot*Ot+Yt*Yt,ie=Ot*D-Yt*Jt;if(Math.abs(ie)>Number.EPSILON){let C=Math.sqrt(ue),y=Math.sqrt(Jt*Jt+D*D),z=rt.x-Yt/C,V=rt.y+Ot/C,K=ot.x-D/y,ct=ot.y+Jt/y,ut=((K-z)*D-(ct-V)*Jt)/(Ot*D-Yt*Jt);lt=z+Ot*ut-nt.x,dt=V+Yt*ut-nt.y;let $=lt*lt+dt*dt;if($<=2)return new it(lt,dt);Vt=Math.sqrt($/2)}else{let C=!1;Ot>Number.EPSILON?Jt>Number.EPSILON&&(C=!0):Ot<-Number.EPSILON?Jt<-Number.EPSILON&&(C=!0):Math.sign(Yt)===Math.sign(D)&&(C=!0),C?(lt=-Yt,dt=Ot,Vt=Math.sqrt(ue)):(lt=Ot,dt=Yt,Vt=Math.sqrt(ue/2))}return new it(lt/Vt,dt/Vt)}let Z=[];for(let nt=0,rt=B.length,ot=rt-1,lt=nt+1;nt<rt;nt++,ot++,lt++)ot===rt&&(ot=0),lt===rt&&(lt=0),Z[nt]=tt(B[nt],B[ot],B[lt]);let J=[],Y,ft=Z.concat();for(let nt=0,rt=L;nt<rt;nt++){let ot=I[nt];Y=[];for(let lt=0,dt=ot.length,Vt=dt-1,Ot=lt+1;lt<dt;lt++,Vt++,Ot++)Vt===dt&&(Vt=0),Ot===dt&&(Ot=0),Y[lt]=tt(ot[lt],ot[Vt],ot[Ot]);J.push(Y),ft=ft.concat(Y)}let bt;if(m===0)bt=Yi.triangulateShape(B,I);else{let nt=[],rt=[];for(let ot=0;ot<m;ot++){let lt=ot/m,dt=p*Math.cos(lt*Math.PI/2),Vt=g*Math.sin(lt*Math.PI/2)+S;for(let Ot=0,Yt=B.length;Ot<Yt;Ot++){let Jt=X(B[Ot],Z[Ot],Vt);ht(Jt.x,Jt.y,-dt),lt===0&&nt.push(Jt)}for(let Ot=0,Yt=L;Ot<Yt;Ot++){let Jt=I[Ot];Y=J[Ot];let D=[];for(let ue=0,ie=Jt.length;ue<ie;ue++){let C=X(Jt[ue],Y[ue],Vt);ht(C.x,C.y,-dt),lt===0&&D.push(C)}lt===0&&rt.push(D)}}bt=Yi.triangulateShape(nt,rt)}let At=bt.length,kt=g+S;for(let nt=0;nt<G;nt++){let rt=u?X(R[nt],ft[nt],kt):R[nt];_?(A.copy(b.normals[0]).multiplyScalar(rt.x),v.copy(b.binormals[0]).multiplyScalar(rt.y),x.copy(T[0]).add(A).add(v),ht(x.x,x.y,x.z)):ht(rt.x,rt.y,0)}for(let nt=1;nt<=h;nt++)for(let rt=0;rt<G;rt++){let ot=u?X(R[rt],ft[rt],kt):R[rt];_?(A.copy(b.normals[nt]).multiplyScalar(ot.x),v.copy(b.binormals[nt]).multiplyScalar(ot.y),x.copy(T[nt]).add(A).add(v),ht(x.x,x.y,x.z)):ht(ot.x,ot.y,d/h*nt)}for(let nt=m-1;nt>=0;nt--){let rt=nt/m,ot=p*Math.cos(rt*Math.PI/2),lt=g*Math.sin(rt*Math.PI/2)+S;for(let dt=0,Vt=B.length;dt<Vt;dt++){let Ot=X(B[dt],Z[dt],lt);ht(Ot.x,Ot.y,d+ot)}for(let dt=0,Vt=I.length;dt<Vt;dt++){let Ot=I[dt];Y=J[dt];for(let Yt=0,Jt=Ot.length;Yt<Jt;Yt++){let D=X(Ot[Yt],Y[Yt],lt);_?ht(D.x,D.y+T[h-1].y,T[h-1].x+ot):ht(D.x,D.y,d+ot)}}}Bt(),W();function Bt(){let nt=s.length/3;if(u){let rt=0,ot=G*rt;for(let lt=0;lt<At;lt++){let dt=bt[lt];Ft(dt[2]+ot,dt[1]+ot,dt[0]+ot)}rt=h+m*2,ot=G*rt;for(let lt=0;lt<At;lt++){let dt=bt[lt];Ft(dt[0]+ot,dt[1]+ot,dt[2]+ot)}}else{for(let rt=0;rt<At;rt++){let ot=bt[rt];Ft(ot[2],ot[1],ot[0])}for(let rt=0;rt<At;rt++){let ot=bt[rt];Ft(ot[0]+G*h,ot[1]+G*h,ot[2]+G*h)}}n.addGroup(nt,s.length/3-nt,0)}function W(){let nt=s.length/3,rt=0;j(B,rt),rt+=B.length;for(let ot=0,lt=I.length;ot<lt;ot++){let dt=I[ot];j(dt,rt),rt+=dt.length}n.addGroup(nt,s.length/3-nt,1)}function j(nt,rt){let ot=nt.length;for(;--ot>=0;){let lt=ot,dt=ot-1;dt<0&&(dt=nt.length-1);for(let Vt=0,Ot=h+m*2;Vt<Ot;Vt++){let Yt=G*Vt,Jt=G*(Vt+1),D=rt+lt+Yt,ue=rt+dt+Yt,ie=rt+dt+Jt,C=rt+lt+Jt;vt(D,ue,ie,C)}}}function ht(nt,rt,ot){l.push(nt),l.push(rt),l.push(ot)}function Ft(nt,rt,ot){qt(nt),qt(rt),qt(ot);let lt=s.length/3,dt=M.generateTopUV(n,s,lt-3,lt-2,lt-1);me(dt[0]),me(dt[1]),me(dt[2])}function vt(nt,rt,ot,lt){qt(nt),qt(rt),qt(lt),qt(rt),qt(ot),qt(lt);let dt=s.length/3,Vt=M.generateSideWallUV(n,s,dt-6,dt-3,dt-2,dt-1);me(Vt[0]),me(Vt[1]),me(Vt[3]),me(Vt[1]),me(Vt[2]),me(Vt[3])}function qt(nt){s.push(l[nt*3+0]),s.push(l[nt*3+1]),s.push(l[nt*3+2])}function me(nt){r.push(nt.x),r.push(nt.y)}}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){let t=super.toJSON(),e=this.parameters.shapes,n=this.parameters.options;return Ep(e,n,t)}static fromJSON(t,e){let n=[];for(let r=0,a=t.shapes.length;r<a;r++){let o=e[t.shapes[r]];n.push(o)}let s=t.options.extrudePath;return s!==void 0&&(t.options.extrudePath=new po[s.type]().fromJSON(s)),new i(n,t.options)}},bp={generateTopUV:function(i,t,e,n,s){let r=t[e*3],a=t[e*3+1],o=t[n*3],l=t[n*3+1],c=t[s*3],h=t[s*3+1];return[new it(r,a),new it(o,l),new it(c,h)]},generateSideWallUV:function(i,t,e,n,s,r){let a=t[e*3],o=t[e*3+1],l=t[e*3+2],c=t[n*3],h=t[n*3+1],d=t[n*3+2],u=t[s*3],p=t[s*3+1],g=t[s*3+2],S=t[r*3],m=t[r*3+1],f=t[r*3+2];return Math.abs(o-h)<Math.abs(a-c)?[new it(a,1-l),new it(c,1-d),new it(u,1-g),new it(S,1-f)]:[new it(o,1-l),new it(h,1-d),new it(p,1-g),new it(m,1-f)]}};function Ep(i,t,e){if(e.shapes=[],Array.isArray(i))for(let n=0,s=i.length;n<s;n++){let r=i[n];e.shapes.push(r.uuid)}else e.shapes.push(i.uuid);return e.options=Object.assign({},t),t.extrudePath!==void 0&&(e.options.extrudePath=t.extrudePath.toJSON()),e}var kr=class i extends co{constructor(t=1,e=0){let n=(1+Math.sqrt(5))/2,s=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(s,r,t,e),this.type="IcosahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new i(t.radius,t.detail)}},Hr=class i extends ae{constructor(t=[new it(0,-.5),new it(.5,0),new it(0,.5)],e=12,n=0,s=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:t,segments:e,phiStart:n,phiLength:s},e=Math.floor(e),s=Qt(s,0,Math.PI*2);let r=[],a=[],o=[],l=[],c=[],h=1/e,d=new P,u=new it,p=new P,g=new P,S=new P,m=0,f=0;for(let M=0;M<=t.length-1;M++)switch(M){case 0:m=t[M+1].x-t[M].x,f=t[M+1].y-t[M].y,p.x=f*1,p.y=-m,p.z=f*0,S.copy(p),p.normalize(),l.push(p.x,p.y,p.z);break;case t.length-1:l.push(S.x,S.y,S.z);break;default:m=t[M+1].x-t[M].x,f=t[M+1].y-t[M].y,p.x=f*1,p.y=-m,p.z=f*0,g.copy(p),p.x+=S.x,p.y+=S.y,p.z+=S.z,p.normalize(),l.push(p.x,p.y,p.z),S.copy(g)}for(let M=0;M<=e;M++){let T=n+M*h*s,_=Math.sin(T),b=Math.cos(T);for(let v=0;v<=t.length-1;v++){d.x=t[v].x*_,d.y=t[v].y,d.z=t[v].x*b,a.push(d.x,d.y,d.z),u.x=M/e,u.y=v/(t.length-1),o.push(u.x,u.y);let A=l[3*v+0]*_,x=l[3*v+1],w=l[3*v+0]*b;c.push(A,x,w)}}for(let M=0;M<e;M++)for(let T=0;T<t.length-1;T++){let _=T+M*t.length,b=_,v=_+t.length,A=_+t.length+1,x=_+1;r.push(b,v,x),r.push(A,x,v)}this.setIndex(r),this.setAttribute("position",new Ht(a,3)),this.setAttribute("uv",new Ht(o,2)),this.setAttribute("normal",new Ht(c,3))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.points,t.segments,t.phiStart,t.phiLength)}};var nn=class i extends ae{constructor(t=1,e=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:s};let r=t/2,a=e/2,o=Math.floor(n),l=Math.floor(s),c=o+1,h=l+1,d=t/o,u=e/l,p=[],g=[],S=[],m=[];for(let f=0;f<h;f++){let M=f*u-a;for(let T=0;T<c;T++){let _=T*d-r;g.push(_,-M,0),S.push(0,0,1),m.push(T/o),m.push(1-f/l)}}for(let f=0;f<l;f++)for(let M=0;M<o;M++){let T=M+c*f,_=M+c*(f+1),b=M+1+c*(f+1),v=M+1+c*f;p.push(T,_,v),p.push(_,b,v)}this.setIndex(p),this.setAttribute("position",new Ht(g,3)),this.setAttribute("normal",new Ht(S,3)),this.setAttribute("uv",new Ht(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.width,t.height,t.widthSegments,t.heightSegments)}},zs=class i extends ae{constructor(t=.5,e=1,n=32,s=1,r=0,a=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:t,outerRadius:e,thetaSegments:n,phiSegments:s,thetaStart:r,thetaLength:a},n=Math.max(3,n),s=Math.max(1,s);let o=[],l=[],c=[],h=[],d=t,u=(e-t)/s,p=new P,g=new it;for(let S=0;S<=s;S++){for(let m=0;m<=n;m++){let f=r+m/n*a;p.x=d*Math.cos(f),p.y=d*Math.sin(f),l.push(p.x,p.y,p.z),c.push(0,0,1),g.x=(p.x/e+1)/2,g.y=(p.y/e+1)/2,h.push(g.x,g.y)}d+=u}for(let S=0;S<s;S++){let m=S*(n+1);for(let f=0;f<n;f++){let M=f+m,T=M,_=M+n+1,b=M+n+2,v=M+1;o.push(T,_,v),o.push(_,b,v)}}this.setIndex(o),this.setAttribute("position",new Ht(l,3)),this.setAttribute("normal",new Ht(c,3)),this.setAttribute("uv",new Ht(h,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.innerRadius,t.outerRadius,t.thetaSegments,t.phiSegments,t.thetaStart,t.thetaLength)}};var oi=class i extends ae{constructor(t=1,e=32,n=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:n,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},e=Math.max(3,Math.floor(e)),n=Math.max(2,Math.floor(n));let l=Math.min(a+o,Math.PI),c=0,h=[],d=new P,u=new P,p=[],g=[],S=[],m=[];for(let f=0;f<=n;f++){let M=[],T=f/n,_=a+T*o,b=t*Math.cos(_),v=Math.sqrt(t*t-b*b),A=0;f===0&&a===0?A=.5/e:f===n&&l===Math.PI&&(A=-.5/e);for(let x=0;x<=e;x++){let w=x/e,R=s+w*r;d.x=-v*Math.cos(R),d.y=b,d.z=v*Math.sin(R),g.push(d.x,d.y,d.z),u.copy(d).normalize(),S.push(u.x,u.y,u.z),m.push(w+A,1-T),M.push(c++)}h.push(M)}for(let f=0;f<n;f++)for(let M=0;M<e;M++){let T=h[f][M+1],_=h[f][M],b=h[f+1][M],v=h[f+1][M+1];(f!==0||a>0)&&p.push(T,_,v),(f!==n-1||l<Math.PI)&&p.push(_,b,v)}this.setIndex(p),this.setAttribute("position",new Ht(g,3)),this.setAttribute("normal",new Ht(S,3)),this.setAttribute("uv",new Ht(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}};var Vr=class i extends ae{constructor(t=1,e=.4,n=12,s=48,r=Math.PI*2,a=0,o=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:t,tube:e,radialSegments:n,tubularSegments:s,arc:r,thetaStart:a,thetaLength:o},n=Math.floor(n),s=Math.floor(s);let l=[],c=[],h=[],d=[],u=new P,p=new P,g=new P;for(let S=0;S<=n;S++){let m=a+S/n*o;for(let f=0;f<=s;f++){let M=f/s*r;p.x=(t+e*Math.cos(m))*Math.cos(M),p.y=(t+e*Math.cos(m))*Math.sin(M),p.z=e*Math.sin(m),c.push(p.x,p.y,p.z),u.x=t*Math.cos(M),u.y=t*Math.sin(M),g.subVectors(p,u).normalize(),h.push(g.x,g.y,g.z),d.push(f/s),d.push(S/n)}}for(let S=1;S<=n;S++)for(let m=1;m<=s;m++){let f=(s+1)*S+m-1,M=(s+1)*(S-1)+m-1,T=(s+1)*(S-1)+m,_=(s+1)*S+m;l.push(f,M,_),l.push(M,T,_)}this.setIndex(l),this.setAttribute("position",new Ht(c,3)),this.setAttribute("normal",new Ht(h,3)),this.setAttribute("uv",new Ht(d,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc,t.thetaStart,t.thetaLength)}};var Ei=class i extends ae{constructor(t=new Dr(new P(-1,-1,0),new P(-1,1,0),new P(1,1,0)),e=64,n=1,s=8,r=!1){super(),this.type="TubeGeometry",this.parameters={path:t,tubularSegments:e,radius:n,radialSegments:s,closed:r};let a=t.computeFrenetFrames(e,r);this.tangents=a.tangents,this.normals=a.normals,this.binormals=a.binormals;let o=new P,l=new P,c=new it,h=new P,d=[],u=[],p=[],g=[];S(),this.setIndex(g),this.setAttribute("position",new Ht(d,3)),this.setAttribute("normal",new Ht(u,3)),this.setAttribute("uv",new Ht(p,2));function S(){for(let T=0;T<e;T++)m(T);m(r===!1?e:0),M(),f()}function m(T){h=t.getPointAt(T/e,h);let _=a.normals[T],b=a.binormals[T];for(let v=0;v<=s;v++){let A=v/s*Math.PI*2,x=Math.sin(A),w=-Math.cos(A);l.x=w*_.x+x*b.x,l.y=w*_.y+x*b.y,l.z=w*_.z+x*b.z,l.normalize(),u.push(l.x,l.y,l.z),o.x=h.x+n*l.x,o.y=h.y+n*l.y,o.z=h.z+n*l.z,d.push(o.x,o.y,o.z)}}function f(){for(let T=1;T<=e;T++)for(let _=1;_<=s;_++){let b=(s+1)*(T-1)+(_-1),v=(s+1)*T+(_-1),A=(s+1)*T+_,x=(s+1)*(T-1)+_;g.push(b,v,x),g.push(v,A,x)}}function M(){for(let T=0;T<=e;T++)for(let _=0;_<=s;_++)c.x=T/e,c.y=_/s,p.push(c.x,c.y)}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){let t=super.toJSON();return t.path=this.parameters.path.toJSON(),t}static fromJSON(t){return new i(new po[t.path.type]().fromJSON(t.path),t.tubularSegments,t.radius,t.radialSegments,t.closed)}};var Gr=class extends xn{constructor(t){super(),this.isShadowMaterial=!0,this.type="ShadowMaterial",this.color=new Nt(0),this.transparent=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.fog=t.fog,this}};function ss(i){let t={};for(let e in i){t[e]={};for(let n in i[e]){let s=i[e][n];if(xu(s))s.isRenderTargetTexture?(zt("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=s.clone();else if(Array.isArray(s))if(xu(s[0])){let r=[];for(let a=0,o=s.length;a<o;a++)r[a]=s[a].clone();t[e][n]=r}else t[e][n]=s.slice();else t[e][n]=s}}return t}function je(i){let t={};for(let e=0;e<i.length;e++){let n=ss(i[e]);for(let s in n)t[s]=n[s]}return t}function xu(i){return i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)}function Tp(i){let t=[];for(let e=0;e<i.length;e++)t.push(i[e].clone());return t}function $c(i){let t=i.getRenderTarget();return t===null?i.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:re.workingColorSpace}var dd={clone:ss,merge:je},wp=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Ap=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Ve=class extends xn{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=wp,this.fragmentShader=Ap,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=ss(t.uniforms),this.uniformsGroups=Tp(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this.defaultAttributeValues=Object.assign({},t.defaultAttributeValues),this.index0AttributeName=t.index0AttributeName,this.uniformsNeedUpdate=t.uniformsNeedUpdate,this}toJSON(t){let e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(let s in this.uniforms){let a=this.uniforms[s].value;a&&a.isTexture?e.uniforms[s]={type:"t",value:a.toJSON(t).uuid}:a&&a.isColor?e.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?e.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?e.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?e.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?e.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?e.uniforms[s]={type:"m4",value:a.toArray()}:e.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}fromJSON(t,e){if(super.fromJSON(t,e),t.uniforms!==void 0)for(let n in t.uniforms){let s=t.uniforms[n];switch(this.uniforms[n]={},s.type){case"t":this.uniforms[n].value=e[s.value]||null;break;case"c":this.uniforms[n].value=new Nt().setHex(s.value);break;case"v2":this.uniforms[n].value=new it().fromArray(s.value);break;case"v3":this.uniforms[n].value=new P().fromArray(s.value);break;case"v4":this.uniforms[n].value=new Te().fromArray(s.value);break;case"m3":this.uniforms[n].value=new Zt().fromArray(s.value);break;case"m4":this.uniforms[n].value=new ce().fromArray(s.value);break;default:this.uniforms[n].value=s.value}}if(t.defines!==void 0&&(this.defines=t.defines),t.vertexShader!==void 0&&(this.vertexShader=t.vertexShader),t.fragmentShader!==void 0&&(this.fragmentShader=t.fragmentShader),t.glslVersion!==void 0&&(this.glslVersion=t.glslVersion),t.extensions!==void 0)for(let n in t.extensions)this.extensions[n]=t.extensions[n];return t.lights!==void 0&&(this.lights=t.lights),t.clipping!==void 0&&(this.clipping=t.clipping),this}},go=class extends Ve{constructor(t){super(t),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},Ti=class extends xn{constructor(t){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Nt(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Nt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=aa,this.normalScale=new it(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Hn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}};var li=class extends xn{constructor(t){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new Nt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Nt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=aa,this.normalScale=new it(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Hn,this.combine=No,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.envMapIntensity=t.envMapIntensity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}},_o=class extends xn{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Yu,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}},xo=class extends xn{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}};var $i=class extends fn{constructor(t){super(),this.isLineDashedMaterial=!0,this.type="LineDashedMaterial",this.scale=1,this.dashSize=3,this.gapSize=1,this.setValues(t)}copy(t){return super.copy(t),this.scale=t.scale,this.dashSize=t.dashSize,this.gapSize=t.gapSize,this}};function Es(i,t){return!i||i.constructor===t?i:typeof t.BYTES_PER_ELEMENT=="number"?new t(i):Array.prototype.slice.call(i)}function mc(i){return i!==void 0&&i.inTangents!==void 0&&i.outTangents!==void 0}var wi=class{constructor(t,e,n,s){this.parameterPositions=t,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new e.constructor(n),this.sampleValues=e,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(t){let e=this.parameterPositions,n=this._cachedIndex,s=e[n],r=e[n-1];n:{t:{let a;e:{i:if(!(t<s)){for(let o=n+2;;){if(s===void 0){if(t<r)break i;return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(r=s,s=e[++n],t<s)break t}a=e.length;break e}if(!(t>=r)){let o=e[1];t<o&&(n=2,r=o);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(s=r,r=e[--n-1],t>=r)break t}a=n,n=0;break e}break n}for(;n<a;){let o=n+a>>>1;t<e[o]?a=o:n=o+1}if(s=e[n],r=e[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,t,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(t){let e=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=t*s;for(let a=0;a!==s;++a)e[a]=n[r+a];return e}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},yo=class extends wi{constructor(t,e,n,s){super(t,e,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:xc,endingEnd:xc}}intervalChanged_(t,e,n){let s=this.parameterPositions,r=t-2,a=t+1,o=s[r],l=s[a];if(o===void 0)switch(this.getSettings_().endingStart){case yc:r=t,o=2*e-n;break;case vc:r=s.length-2,o=e+s[r]-s[r+1];break;default:r=t,o=n}if(l===void 0)switch(this.getSettings_().endingEnd){case yc:a=t,l=2*n-e;break;case vc:a=1,l=n+s[1]-s[0];break;default:a=t-1,l=e}let c=(n-e)*.5,h=this.valueSize;this._weightPrev=c/(e-o),this._weightNext=c/(l-n),this._offsetPrev=r*h,this._offsetNext=a*h}interpolate_(t,e,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,h=this._offsetPrev,d=this._offsetNext,u=this._weightPrev,p=this._weightNext,g=(n-e)/(s-e),S=g*g,m=S*g,f=-u*m+2*u*S-u*g,M=(1+u)*m+(-1.5-2*u)*S+(-.5+u)*g+1,T=(-1-p)*m+(1.5+p)*S+.5*g,_=p*m-p*S;for(let b=0;b!==o;++b)r[b]=f*a[h+b]+M*a[c+b]+T*a[l+b]+_*a[d+b];return r}},vo=class extends wi{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t,e,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,h=(n-e)/(s-e),d=1-h;for(let u=0;u!==o;++u)r[u]=a[c+u]*d+a[l+u]*h;return r}},Mo=class extends wi{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t){return this.copySampleValue_(t-1)}},So=class extends wi{interpolate_(t,e,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,h=this.inTangents,d=this.outTangents;if(!h||!d){let g=(n-e)/(s-e),S=1-g;for(let m=0;m!==o;++m)r[m]=a[c+m]*S+a[l+m]*g;return r}let u=o*2,p=t-1;for(let g=0;g!==o;++g){let S=a[c+g],m=a[l+g],f=p*u+g*2,M=d[f],T=d[f+1],_=t*u+g*2,b=h[_],v=h[_+1],A=Cp(n,e,M,b,s);r[g]=fd(A,S,T,v,m)}return r}};function fd(i,t,e,n,s){let r=1-i;return r*r*r*t+3*r*r*i*e+3*r*i*i*n+i*i*i*s}function Rp(i,t,e,n,s){let r=1-i;return 3*r*r*(e-t)+6*r*i*(n-e)+3*i*i*(s-n)}function Cp(i,t,e,n,s){let r=(i-t)/(s-t);for(let a=0;a<8;a++){let o=fd(r,t,e,n,s)-i;if(Math.abs(o)<1e-10)break;let l=Rp(r,t,e,n,s);if(Math.abs(l)<1e-10)break;r=Math.max(0,Math.min(1,r-o/l))}return r}var mn=class{constructor(t,e,n,s){if(t===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(e===void 0||e.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+t);this.name=t,this.times=Es(e,this.TimeBufferType),this.values=Es(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(t){let e=t.constructor,n;if(e.toJSON!==this.toJSON)n=e.toJSON(t);else{n={name:t.name,times:Es(t.times,Array),values:Es(t.values,Array)};let s=t.getInterpolation();s!==t.DefaultInterpolation&&(n.interpolation=s),mc(t.settings)&&(n.settings={inTangents:Es(t.settings.inTangents,Array),outTangents:Es(t.settings.outTangents,Array)})}return n.type=t.ValueTypeName,n}InterpolantFactoryMethodDiscrete(t){return new Mo(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodLinear(t){return new vo(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodSmooth(t){return new yo(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodBezier(t){let e=new So(this.times,this.values,this.getValueSize(),t);return this.settings&&(e.inTangents=this.settings.inTangents,e.outTangents=this.settings.outTangents),e}setInterpolation(t){let e;switch(t){case pr:e=this.InterpolantFactoryMethodDiscrete;break;case eo:e=this.InterpolantFactoryMethodLinear;break;case Xa:e=this.InterpolantFactoryMethodSmooth;break;case _c:e=this.InterpolantFactoryMethodBezier;break}if(e===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(t!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return zt("KeyframeTrack:",n),this}return this.createInterpolant=e,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return pr;case this.InterpolantFactoryMethodLinear:return eo;case this.InterpolantFactoryMethodSmooth:return Xa;case this.InterpolantFactoryMethodBezier:return _c}}getValueSize(){return this.values.length/this.times.length}shift(t){if(t!==0){let e=this.times;for(let n=0,s=e.length;n!==s;++n)e[n]+=t}return this}scale(t){if(t!==1){let e=this.times;for(let n=0,s=e.length;n!==s;++n)e[n]*=t;mc(this.settings)&&(yu(this.settings.inTangents,t),yu(this.settings.outTangents,t))}return this}trim(t,e){let n=this.times,s=n.length,r=0,a=s-1;for(;r!==s&&n[r]<t;)++r;for(;a!==-1&&n[a]>e;)--a;if(++a,r!==0||a!==s){r>=a&&(a=Math.max(a,1),r=a-1);let o=this.getValueSize();this.times=n.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let t=!0,e=this.getValueSize();e-Math.floor(e)!==0&&(Wt("KeyframeTrack: Invalid value size in track.",this),t=!1);let n=this.times,s=this.values,r=n.length;r===0&&(Wt("KeyframeTrack: Track is empty.",this),t=!1);let a=null;for(let o=0;o!==r;o++){let l=n[o];if(typeof l=="number"&&isNaN(l)){Wt("KeyframeTrack: Time is not a valid number.",this,o,l),t=!1;break}if(a!==null&&a>l){Wt("KeyframeTrack: Out of order keys.",this,o,l,a),t=!1;break}a=l}if(s!==void 0&&_f(s))for(let o=0,l=s.length;o!==l;++o){let c=s[o];if(isNaN(c)){Wt("KeyframeTrack: Value is not a valid number.",this,o,c),t=!1;break}}return t}optimize(){let t=this.times.slice(),e=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===Xa,r=t.length-1,a=1;for(let o=1;o<r;++o){let l=!1,c=t[o],h=t[o+1];if(c!==h&&(o!==1||c!==t[0]))if(s)l=!0;else{let d=o*n,u=d-n,p=d+n;for(let g=0;g!==n;++g){let S=e[d+g];if(S!==e[u+g]||S!==e[p+g]){l=!0;break}}}if(l){if(o!==a){t[a]=t[o];let d=o*n,u=a*n;for(let p=0;p!==n;++p)e[u+p]=e[d+p]}++a}}if(r>0){t[a]=t[r];for(let o=r*n,l=a*n,c=0;c!==n;++c)e[l+c]=e[o+c];++a}return a!==t.length?(this.times=t.slice(0,a),this.values=e.slice(0,a*n)):(this.times=t,this.values=e),this}clone(){let t=this.times.slice(),e=this.values.slice(),n=this.constructor,s=new n(this.name,t,e);return s.createInterpolant=this.createInterpolant,mc(this.settings)&&(s.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),s}};function yu(i,t){for(let e=0,n=i.length;e!==n;e+=2)i[e]*=t}mn.prototype.ValueTypeName="";mn.prototype.TimeBufferType=Float32Array;mn.prototype.ValueBufferType=Float32Array;mn.prototype.DefaultInterpolation=eo;var Ai=class extends mn{constructor(t,e,n){super(t,e,n)}};Ai.prototype.ValueTypeName="bool";Ai.prototype.ValueBufferType=Array;Ai.prototype.DefaultInterpolation=pr;Ai.prototype.InterpolantFactoryMethodLinear=void 0;Ai.prototype.InterpolantFactoryMethodSmooth=void 0;var bo=class extends mn{constructor(t,e,n,s){super(t,e,n,s)}};bo.prototype.ValueTypeName="color";var Eo=class extends mn{constructor(t,e,n,s){super(t,e,n,s)}};Eo.prototype.ValueTypeName="number";var To=class extends wi{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t,e,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=(n-e)/(s-e),c=t*o;for(let h=c+o;c!==h;c+=4)Ke.slerpFlat(r,0,a,c-o,a,c,l);return r}},Wr=class extends mn{constructor(t,e,n,s){super(t,e,n,s)}InterpolantFactoryMethodLinear(t){return new To(this.times,this.values,this.getValueSize(),t)}};Wr.prototype.ValueTypeName="quaternion";Wr.prototype.InterpolantFactoryMethodSmooth=void 0;var Ri=class extends mn{constructor(t,e,n){super(t,e,n)}};Ri.prototype.ValueTypeName="string";Ri.prototype.ValueBufferType=Array;Ri.prototype.DefaultInterpolation=pr;Ri.prototype.InterpolantFactoryMethodLinear=void 0;Ri.prototype.InterpolantFactoryMethodSmooth=void 0;var wo=class extends mn{constructor(t,e,n,s){super(t,e,n,s)}};wo.prototype.ValueTypeName="vector";var Ao=class{constructor(t,e,n){let s=this,r=!1,a=0,o=0,l,c=[];this.onStart=void 0,this.onLoad=t,this.onProgress=e,this.onError=n,this._abortController=null,this.itemStart=function(h){o++,r===!1&&s.onStart!==void 0&&s.onStart(h,a,o),r=!0},this.itemEnd=function(h){a++,s.onProgress!==void 0&&s.onProgress(h,a,o),a===o&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(h){s.onError!==void 0&&s.onError(h)},this.resolveURL=function(h){return h=h.normalize("NFC"),l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,d){return c.push(h,d),this},this.removeHandler=function(h){let d=c.indexOf(h);return d!==-1&&c.splice(d,2),this},this.getHandler=function(h){for(let d=0,u=c.length;d<u;d+=2){let p=c[d],g=c[d+1];if(p.global&&(p.lastIndex=0),p.test(h))return g}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},pd=new Ao,Ro=class{constructor(t){this.manager=t!==void 0?t:pd,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(t,e){let n=this;return new Promise(function(s,r){n.load(t,s,e,r)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}abort(){return this}};Ro.DEFAULT_MATERIAL_NAME="__DEFAULT";var ji=class extends we{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new Nt(t),this.intensity=e}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){let e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,e}},Xr=class extends ji{constructor(t,e,n){super(t,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(we.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Nt(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}toJSON(t){let e=super.toJSON(t);return e.object.groundColor=this.groundColor.getHex(),e}},gc=new ce,vu=new P,Mu=new P,qr=class{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new it(512,512),this.mapType=an,this.map=null,this.mapPass=null,this.matrix=new ce,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Us,this._frameExtents=new it(1,1),this._viewportCount=1,this._viewports=[new Te(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(t){let e=this.camera;vu.setFromMatrixPosition(t.matrixWorld),e.position.copy(vu),Mu.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(Mu),e.updateMatrixWorld(),this._updateMatrix(e,this.matrix,this._frustum)}_updateMatrix(t,e,n,s){gc.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),n.setFromProjectionMatrix(gc,t.coordinateSystem,t.reversedDepth);let r=this._frameExtents,a=s?s.z/r.x:1,o=s?s.w/r.y:1,l=s?s.x/r.x:0,c=s?s.y/r.y:0;t.coordinateSystem===Ps||t.reversedDepth?e.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,1,0,0,0,0,1):e.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,.5,.5,0,0,0,1),e.multiply(gc)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.autoUpdate=t.autoUpdate,this.needsUpdate=t.needsUpdate,this.normalBias=t.normalBias,this.blurSamples=t.blurSamples,this.mapSize.copy(t.mapSize),this.biasNode=t.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let t={};return t.intensity=this.intensity,t.bias=this.bias,t.normalBias=this.normalBias,t.radius=this.radius,t.blurSamples=this.blurSamples,t.mapSize=this.mapSize.toArray(),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}},Ga=new P,Wa=new Ke,On=new P,Yr=class extends we{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new ce,this.projectionMatrix=new ce,this.projectionMatrixInverse=new ce,this.coordinateSystem=An,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorld.decompose(Ga,Wa,On),On.x===1&&On.y===1&&On.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ga,Wa,On.set(1,1,1)).invert()}updateWorldMatrix(t,e,n=!1){super.updateWorldMatrix(t,e,n),this.matrixWorld.decompose(Ga,Wa,On),On.x===1&&On.y===1&&On.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ga,Wa,On.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},vi=new P,Su=new it,bu=new it,De=class extends Yr{constructor(t=50,e=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){let e=.5*this.getFilmHeight()/t;this.fov=Ls*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){let t=Math.tan(hr*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return Ls*2*Math.atan(Math.tan(hr*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,n){vi.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(vi.x,vi.y).multiplyScalar(-t/vi.z),vi.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(vi.x,vi.y).multiplyScalar(-t/vi.z)}getViewSize(t,e){return this.getViewBounds(t,Su,bu),e.subVectors(bu,Su)}setViewOffset(t,e,n,s,r,a){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=this.near,e=t*Math.tan(hr*.5*this.fov)/this.zoom,n=2*e,s=this.aspect*n,r=-.5*s,a=this.view;if(this.view!==null&&this.view.enabled){let l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*s/l,e-=a.offsetY*n/c,s*=a.width/l,n*=a.height/c}let o=this.filmOffset;o!==0&&(r+=t*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,e,e-n,t,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}};var Ec=class extends qr{constructor(){super(new De(90,1,.5,500)),this.isPointLightShadow=!0}},Qi=class extends ji{constructor(t,e,n=0,s=2){super(t,e),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=s,this.shadow=new Ec}get power(){return this.intensity*4*Math.PI}set power(t){this.intensity=t/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(t,e){return super.copy(t,e),this.distance=t.distance,this.decay=t.decay,this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.distance=this.distance,e.object.decay=this.decay,e.object.shadow=this.shadow.toJSON(),e}},ks=class extends Yr{constructor(t=-1,e=1,n=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-t,a=n+t,o=s+e,l=s-e;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=h*this.view.offsetY,l=o-h*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}},Tc=class extends qr{constructor(){super(new ks(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},ts=class extends ji{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(we.DEFAULT_UP),this.updateMatrix(),this.target=new we,this.shadow=new Tc}dispose(){super.dispose(),this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.shadow=this.shadow.toJSON(),e.object.target=this.target.uuid,e}},Zr=class extends ji{constructor(t,e){super(t,e),this.isAmbientLight=!0,this.type="AmbientLight"}};var Jr=class extends ae{constructor(){super(),this.isInstancedBufferGeometry=!0,this.type="InstancedBufferGeometry",this.instanceCount=1/0}copy(t){return super.copy(t),this.instanceCount=t.instanceCount,this}toJSON(){let t=super.toJSON();return t.instanceCount=this.instanceCount,t.isInstancedBufferGeometry=!0,t}};var Ts=-90,ws=1,Co=class extends we{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new De(Ts,ws,t,e);s.layers=this.layers,this.add(s);let r=new De(Ts,ws,t,e);r.layers=this.layers,this.add(r);let a=new De(Ts,ws,t,e);a.layers=this.layers,this.add(a);let o=new De(Ts,ws,t,e);o.layers=this.layers,this.add(o);let l=new De(Ts,ws,t,e);l.layers=this.layers,this.add(l);let c=new De(Ts,ws,t,e);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let t=this.coordinateSystem,e=this.children.concat(),[n,s,r,a,o,l]=e;for(let c of e)this.remove(c);if(t===An)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===Ps)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(let c of e)this.add(c),c.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());let[r,a,o,l,c,h]=this.children,d=t.getRenderTarget(),u=t.getActiveCubeFace(),p=t.getActiveMipmapLevel(),g=t.xr.enabled;t.xr.enabled=!1;let S=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let m=!1;t.isWebGLRenderer===!0?m=t.state.buffers.depth.getReversed():m=t.reversedDepthBuffer,t.setRenderTarget(n,0,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,r),t.setRenderTarget(n,1,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,a),t.setRenderTarget(n,2,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,o),t.setRenderTarget(n,3,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,l),t.setRenderTarget(n,4,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,c),n.texture.generateMipmaps=S,t.setRenderTarget(n,5,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,h),t.setRenderTarget(d,u,p),t.xr.enabled=g,n.texture.needsPMREMUpdate=!0}},Po=class extends De{constructor(t=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=t}};var jc="\\[\\]\\.:\\/",Pp=new RegExp("["+jc+"]","g"),Qc="[^"+jc+"]",Ip="[^"+jc.replace("\\.","")+"]",Lp=/((?:WC+[\/:])*)/.source.replace("WC",Qc),Dp=/(WCOD+)?/.source.replace("WCOD",Ip),Np=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Qc),Up=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Qc),Fp=new RegExp("^"+Lp+Dp+Np+Up+"$"),Op=["material","materials","bones","map"],wc=class{constructor(t,e,n){let s=n||be.parseTrackName(e);this._targetGroup=t,this._bindings=t.subscribe_(e,s)}getValue(t,e){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(t,e)}setValue(t,e){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(t,e)}bind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].bind()}unbind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].unbind()}},be=class i{constructor(t,e,n){this.path=e,this.parsedPath=n||i.parseTrackName(e),this.node=i.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,e,n){return t&&t.isAnimationObjectGroup?new i.Composite(t,e,n):new i(t,e,n)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(Pp,"")}static parseTrackName(t){let e=Fp.exec(t);if(e===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+t);let n={nodeName:e[2],objectName:e[3],objectIndex:e[4],propertyName:e[5],propertyIndex:e[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);Op.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+t);return n}static findNode(t,e){if(e===void 0||e===""||e==="."||e===-1||e===t.name||e===t.uuid)return t;if(t.skeleton){let n=t.skeleton.getBoneByName(e);if(n!==void 0)return n}if(t.children){let n=function(r){for(let a=0;a<r.length;a++){let o=r[a];if(o.name===e||o.uuid===e)return o;let l=n(o.children);if(l)return l}return null},s=n(t.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,e){t[e]=this.targetObject[this.propertyName]}_getValue_array(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)t[e++]=n[s]}_getValue_arrayElement(t,e){t[e]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,e){this.resolvedProperty.toArray(t,e)}_setValue_direct(t,e){this.targetObject[this.propertyName]=t[e]}_setValue_direct_setNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++]}_setValue_array_setNeedsUpdate(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,e){this.resolvedProperty[this.propertyIndex]=t[e]}_setValue_arrayElement_setNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,e){this.resolvedProperty.fromArray(t,e)}_setValue_fromArray_setNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,e){this.bind(),this.getValue(t,e)}_setValue_unbound(t,e){this.bind(),this.setValue(t,e)}bind(){let t=this.node,e=this.parsedPath,n=e.objectName,s=e.propertyName,r=e.propertyIndex;if(t||(t=i.findNode(this.rootNode,e.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){zt("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=e.objectIndex;switch(n){case"materials":if(!t.material){Wt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){Wt("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){Wt("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let h=0;h<t.length;h++)if(t[h].name===c){c=h;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){Wt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){Wt("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[n]===void 0){Wt("PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[n]}if(c!==void 0){if(t[c]===void 0){Wt("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[c]}}let a=t[s];if(a===void 0){let c=e.nodeName;Wt("PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",t);return}let o=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?o=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!t.geometry){Wt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){Wt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[r]!==void 0&&(r=t.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(l=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};be.Composite=wc;be.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};be.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};be.prototype.GetterByBindingType=[be.prototype._getValue_direct,be.prototype._getValue_array,be.prototype._getValue_arrayElement,be.prototype._getValue_toArray];be.prototype.SetterByBindingTypeAndVersioning=[[be.prototype._setValue_direct,be.prototype._setValue_direct_setNeedsUpdate,be.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[be.prototype._setValue_array,be.prototype._setValue_array_setNeedsUpdate,be.prototype._setValue_array_setMatrixWorldNeedsUpdate],[be.prototype._setValue_arrayElement,be.prototype._setValue_arrayElement_setNeedsUpdate,be.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[be.prototype._setValue_fromArray,be.prototype._setValue_fromArray_setNeedsUpdate,be.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var $x=new Float32Array(1);var Hs=class{constructor(t=1,e=0,n=0){this.radius=t,this.phi=e,this.theta=n}set(t,e,n){return this.radius=t,this.phi=e,this.theta=n,this}copy(t){return this.radius=t.radius,this.phi=t.phi,this.theta=t.theta,this}makeSafe(){return this.phi=Qt(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(t){return this.setFromCartesianCoords(t.x,t.y,t.z)}setFromCartesianCoords(t,e,n){return this.radius=Math.sqrt(t*t+e*e+n*n),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(t,n),this.phi=Math.acos(Qt(e/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}};var rh=class rh{constructor(t,e,n,s){this.elements=[1,0,0,1],t!==void 0&&this.set(t,e,n,s)}identity(){return this.set(1,0,0,1),this}fromArray(t,e=0){for(let n=0;n<4;n++)this.elements[n]=t[n+e];return this}set(t,e,n,s){let r=this.elements;return r[0]=t,r[2]=e,r[1]=n,r[3]=s,this}};rh.prototype.isMatrix2=!0;var Ac=rh;var Kr=class extends Rn{constructor(t,e=null){super(),this.object=t,this.domElement=e,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(t){this.domElement!==null&&this.disconnect(),this.domElement=t}disconnect(){}dispose(){}update(){}};function th(i,t,e,n){let s=Bp(n);switch(e){case Wc:return i*t;case Ho:return i*t/s.components*s.byteLength;case Vo:return i*t/s.components*s.byteLength;case Ui:return i*t*2/s.components*s.byteLength;case Go:return i*t*2/s.components*s.byteLength;case Xc:return i*t*3/s.components*s.byteLength;case vn:return i*t*4/s.components*s.byteLength;case Wo:return i*t*4/s.components*s.byteLength;case ta:case ea:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case na:case ia:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case qo:case Zo:return Math.max(i,16)*Math.max(t,8)/4;case Xo:case Yo:return Math.max(i,8)*Math.max(t,8)/2;case Jo:case Ko:case jo:case Qo:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case $o:case sa:case tl:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case el:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case nl:return Math.floor((i+4)/5)*Math.floor((t+3)/4)*16;case il:return Math.floor((i+4)/5)*Math.floor((t+4)/5)*16;case sl:return Math.floor((i+5)/6)*Math.floor((t+4)/5)*16;case rl:return Math.floor((i+5)/6)*Math.floor((t+5)/6)*16;case al:return Math.floor((i+7)/8)*Math.floor((t+4)/5)*16;case ol:return Math.floor((i+7)/8)*Math.floor((t+5)/6)*16;case ll:return Math.floor((i+7)/8)*Math.floor((t+7)/8)*16;case cl:return Math.floor((i+9)/10)*Math.floor((t+4)/5)*16;case hl:return Math.floor((i+9)/10)*Math.floor((t+5)/6)*16;case ul:return Math.floor((i+9)/10)*Math.floor((t+7)/8)*16;case dl:return Math.floor((i+9)/10)*Math.floor((t+9)/10)*16;case fl:return Math.floor((i+11)/12)*Math.floor((t+9)/10)*16;case pl:return Math.floor((i+11)/12)*Math.floor((t+11)/12)*16;case ml:case gl:case _l:return Math.ceil(i/4)*Math.ceil(t/4)*16;case xl:case yl:return Math.ceil(i/4)*Math.ceil(t/4)*8;case ra:case vl:return Math.ceil(i/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function Bp(i){switch(i){case an:case kc:return{byteLength:1,components:1};case Ws:case Hc:case Nn:return{byteLength:2,components:1};case zo:case ko:return{byteLength:2,components:4};case Dn:case Bo:case yn:return{byteLength:4,components:1};case Vc:case Gc:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Lo}}));typeof window<"u"&&(window.__THREE__?zt("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Lo);function Fd(){let i=null,t=!1,e=null,n=null;function s(r,a){n=i.requestAnimationFrame(s),e(r,a)}return{start:function(){t!==!0&&e!==null&&i!==null&&(n=i.requestAnimationFrame(s),t=!0)},stop:function(){i!==null&&i.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){i=r}}}function zp(i){let t=new WeakMap;function e(o,l){let c=o.array,h=o.usage,d=c.byteLength,u=i.createBuffer();i.bindBuffer(l,u),i.bufferData(l,c,h),o.onUploadCallback();let p;if(c instanceof Float32Array)p=i.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)p=i.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?p=i.HALF_FLOAT:p=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)p=i.SHORT;else if(c instanceof Uint32Array)p=i.UNSIGNED_INT;else if(c instanceof Int32Array)p=i.INT;else if(c instanceof Int8Array)p=i.BYTE;else if(c instanceof Uint8Array)p=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)p=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:u,type:p,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:d}}function n(o,l,c){let h=l.array,d=l.updateRanges;if(i.bindBuffer(c,o),d.length===0)i.bufferSubData(c,0,h);else{d.sort((p,g)=>p.start-g.start);let u=0;for(let p=1;p<d.length;p++){let g=d[u],S=d[p];S.start<=g.start+g.count+1?g.count=Math.max(g.count,S.start+S.count-g.start):(++u,d[u]=S)}d.length=u+1;for(let p=0,g=d.length;p<g;p++){let S=d[p];i.bufferSubData(c,S.start*h.BYTES_PER_ELEMENT,h,S.start,S.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),t.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);let l=t.get(o);l&&(i.deleteBuffer(l.buffer),t.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let h=t.get(o);(!h||h.version<o.version)&&t.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let c=t.get(o);if(c===void 0)t.set(o,e(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:s,remove:r,update:a}}var kp=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Hp=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Vp=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Gp=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Wp=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Xp=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,qp=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Yp=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Zp=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,Jp=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Kp=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,$p=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,jp=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Qp=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,tm=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,em=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,nm=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,im=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,sm=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,rm=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,am=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,om=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,lm=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,cm=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,hm=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,um=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,dm=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,fm=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,pm=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,mm=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,gm="gl_FragColor = linearToOutputTexel( gl_FragColor );",_m=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,xm=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,ym=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,vm=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Mm=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Sm=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,bm=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Em=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Tm=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,wm=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Am=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Rm=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Cm=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Pm=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Im=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,Lm=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureCubeUV( envMap, envMapRotation * retroVec, roughness );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_CUBE_UV
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,Dm=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Nm=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Um=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Fm=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Om=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Bm=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,zm=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,km=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Hm=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Vm=`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,Gm=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Wm=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Xm=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,qm=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Ym=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Zm=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Jm=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Km=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,$m=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,jm=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Qm=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,t0=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,e0=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,n0=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,i0=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,s0=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,r0=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,a0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,o0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,l0=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,c0=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,h0=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,u0=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,d0=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,f0=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,p0=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,m0=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,g0=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,_0=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,x0=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,y0=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,v0=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,M0=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,S0=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,b0=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,E0=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,T0=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,w0=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,A0=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,R0=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,C0=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,P0=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,I0=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,L0=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,D0=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,N0=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,U0=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,F0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,O0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,B0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,z0=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,k0=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,H0=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,V0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,G0=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,W0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,X0=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,q0=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,Y0=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,Z0=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,J0=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,K0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,$0=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,j0=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Q0=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,tg=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,eg=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,ng=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,ig=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,sg=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,rg=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,ag=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,og=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,lg=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,cg=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,hg=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,ug=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,dg=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,fg=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,pg=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,mg=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,gg=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,_g=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,xg=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,yg=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,ne={alphahash_fragment:kp,alphahash_pars_fragment:Hp,alphamap_fragment:Vp,alphamap_pars_fragment:Gp,alphatest_fragment:Wp,alphatest_pars_fragment:Xp,aomap_fragment:qp,aomap_pars_fragment:Yp,batching_pars_vertex:Zp,batching_vertex:Jp,begin_vertex:Kp,beginnormal_vertex:$p,bsdfs:jp,iridescence_fragment:Qp,bumpmap_pars_fragment:tm,clipping_planes_fragment:em,clipping_planes_pars_fragment:nm,clipping_planes_pars_vertex:im,clipping_planes_vertex:sm,color_fragment:rm,color_pars_fragment:am,color_pars_vertex:om,color_vertex:lm,common:cm,cube_uv_reflection_fragment:hm,defaultnormal_vertex:um,displacementmap_pars_vertex:dm,displacementmap_vertex:fm,emissivemap_fragment:pm,emissivemap_pars_fragment:mm,colorspace_fragment:gm,colorspace_pars_fragment:_m,envmap_fragment:xm,envmap_common_pars_fragment:ym,envmap_pars_fragment:vm,envmap_pars_vertex:Mm,envmap_physical_pars_fragment:Lm,envmap_vertex:Sm,fog_vertex:bm,fog_pars_vertex:Em,fog_fragment:Tm,fog_pars_fragment:wm,gradientmap_pars_fragment:Am,lightmap_pars_fragment:Rm,lights_lambert_fragment:Cm,lights_lambert_pars_fragment:Pm,lights_pars_begin:Im,lights_toon_fragment:Dm,lights_toon_pars_fragment:Nm,lights_phong_fragment:Um,lights_phong_pars_fragment:Fm,lights_physical_fragment:Om,lights_physical_pars_fragment:Bm,lights_fragment_begin:zm,lights_fragment_maps:km,lights_fragment_end:Hm,lightprobes_pars_fragment:Vm,logdepthbuf_fragment:Gm,logdepthbuf_pars_fragment:Wm,logdepthbuf_pars_vertex:Xm,logdepthbuf_vertex:qm,map_fragment:Ym,map_pars_fragment:Zm,map_particle_fragment:Jm,map_particle_pars_fragment:Km,metalnessmap_fragment:$m,metalnessmap_pars_fragment:jm,morphinstance_vertex:Qm,morphcolor_vertex:t0,morphnormal_vertex:e0,morphtarget_pars_vertex:n0,morphtarget_vertex:i0,normal_fragment_begin:s0,normal_fragment_maps:r0,normal_pars_fragment:a0,normal_pars_vertex:o0,normal_vertex:l0,normalmap_pars_fragment:c0,clearcoat_normal_fragment_begin:h0,clearcoat_normal_fragment_maps:u0,clearcoat_pars_fragment:d0,iridescence_pars_fragment:f0,opaque_fragment:p0,packing:m0,premultiplied_alpha_fragment:g0,project_vertex:_0,dithering_fragment:x0,dithering_pars_fragment:y0,roughnessmap_fragment:v0,roughnessmap_pars_fragment:M0,shadowmap_pars_fragment:S0,shadowmap_pars_vertex:b0,shadowmap_vertex:E0,shadowmask_pars_fragment:T0,skinbase_vertex:w0,skinning_pars_vertex:A0,skinning_vertex:R0,skinnormal_vertex:C0,specularmap_fragment:P0,specularmap_pars_fragment:I0,tonemapping_fragment:L0,tonemapping_pars_fragment:D0,transmission_fragment:N0,transmission_pars_fragment:U0,uv_pars_fragment:F0,uv_pars_vertex:O0,uv_vertex:B0,worldpos_vertex:z0,background_vert:k0,background_frag:H0,backgroundCube_vert:V0,backgroundCube_frag:G0,cube_vert:W0,cube_frag:X0,depth_vert:q0,depth_frag:Y0,distance_vert:Z0,distance_frag:J0,equirect_vert:K0,equirect_frag:$0,linedashed_vert:j0,linedashed_frag:Q0,meshbasic_vert:tg,meshbasic_frag:eg,meshlambert_vert:ng,meshlambert_frag:ig,meshmatcap_vert:sg,meshmatcap_frag:rg,meshnormal_vert:ag,meshnormal_frag:og,meshphong_vert:lg,meshphong_frag:cg,meshphysical_vert:hg,meshphysical_frag:ug,meshtoon_vert:dg,meshtoon_frag:fg,points_vert:pg,points_frag:mg,shadow_vert:gg,shadow_frag:_g,sprite_vert:xg,sprite_frag:yg},yt={common:{diffuse:{value:new Nt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Zt},alphaMap:{value:null},alphaMapTransform:{value:new Zt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Zt}},envmap:{envMap:{value:null},envMapRotation:{value:new Zt},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Zt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Zt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Zt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Zt},normalScale:{value:new it(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Zt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Zt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Zt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Zt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Nt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new P},probesMax:{value:new P},probesResolution:{value:new P}},points:{diffuse:{value:new Nt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Zt},alphaTest:{value:0},uvTransform:{value:new Zt}},sprite:{diffuse:{value:new Nt(16777215)},opacity:{value:1},center:{value:new it(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Zt},alphaMap:{value:null},alphaMapTransform:{value:new Zt},alphaTest:{value:0}}},Yn={basic:{uniforms:je([yt.common,yt.specularmap,yt.envmap,yt.aomap,yt.lightmap,yt.fog]),vertexShader:ne.meshbasic_vert,fragmentShader:ne.meshbasic_frag},lambert:{uniforms:je([yt.common,yt.specularmap,yt.envmap,yt.aomap,yt.lightmap,yt.emissivemap,yt.bumpmap,yt.normalmap,yt.displacementmap,yt.fog,yt.lights,{emissive:{value:new Nt(0)},envMapIntensity:{value:1}}]),vertexShader:ne.meshlambert_vert,fragmentShader:ne.meshlambert_frag},phong:{uniforms:je([yt.common,yt.specularmap,yt.envmap,yt.aomap,yt.lightmap,yt.emissivemap,yt.bumpmap,yt.normalmap,yt.displacementmap,yt.fog,yt.lights,{emissive:{value:new Nt(0)},specular:{value:new Nt(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:ne.meshphong_vert,fragmentShader:ne.meshphong_frag},standard:{uniforms:je([yt.common,yt.envmap,yt.aomap,yt.lightmap,yt.emissivemap,yt.bumpmap,yt.normalmap,yt.displacementmap,yt.roughnessmap,yt.metalnessmap,yt.fog,yt.lights,{emissive:{value:new Nt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:ne.meshphysical_vert,fragmentShader:ne.meshphysical_frag},toon:{uniforms:je([yt.common,yt.aomap,yt.lightmap,yt.emissivemap,yt.bumpmap,yt.normalmap,yt.displacementmap,yt.gradientmap,yt.fog,yt.lights,{emissive:{value:new Nt(0)}}]),vertexShader:ne.meshtoon_vert,fragmentShader:ne.meshtoon_frag},matcap:{uniforms:je([yt.common,yt.bumpmap,yt.normalmap,yt.displacementmap,yt.fog,{matcap:{value:null}}]),vertexShader:ne.meshmatcap_vert,fragmentShader:ne.meshmatcap_frag},points:{uniforms:je([yt.points,yt.fog]),vertexShader:ne.points_vert,fragmentShader:ne.points_frag},dashed:{uniforms:je([yt.common,yt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:ne.linedashed_vert,fragmentShader:ne.linedashed_frag},depth:{uniforms:je([yt.common,yt.displacementmap]),vertexShader:ne.depth_vert,fragmentShader:ne.depth_frag},normal:{uniforms:je([yt.common,yt.bumpmap,yt.normalmap,yt.displacementmap,{opacity:{value:1}}]),vertexShader:ne.meshnormal_vert,fragmentShader:ne.meshnormal_frag},sprite:{uniforms:je([yt.sprite,yt.fog]),vertexShader:ne.sprite_vert,fragmentShader:ne.sprite_frag},background:{uniforms:{uvTransform:{value:new Zt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:ne.background_vert,fragmentShader:ne.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Zt}},vertexShader:ne.backgroundCube_vert,fragmentShader:ne.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:ne.cube_vert,fragmentShader:ne.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:ne.equirect_vert,fragmentShader:ne.equirect_frag},distance:{uniforms:je([yt.common,yt.displacementmap,{referencePosition:{value:new P},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:ne.distance_vert,fragmentShader:ne.distance_frag},shadow:{uniforms:je([yt.lights,yt.fog,{color:{value:new Nt(0)},opacity:{value:1}}]),vertexShader:ne.shadow_vert,fragmentShader:ne.shadow_frag}};Yn.physical={uniforms:je([Yn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Zt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Zt},clearcoatNormalScale:{value:new it(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Zt},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Zt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Zt},sheen:{value:0},sheenColor:{value:new Nt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Zt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Zt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Zt},transmissionSamplerSize:{value:new it},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Zt},attenuationDistance:{value:0},attenuationColor:{value:new Nt(0)},specularColor:{value:new Nt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Zt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Zt},anisotropyVector:{value:new it},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Zt}}]),vertexShader:ne.meshphysical_vert,fragmentShader:ne.meshphysical_frag};var bl={r:0,b:0,g:0},vg=new ce,Od=new Zt;Od.set(-1,0,0,0,1,0,0,0,1);function Mg(i,t,e,n,s,r){let a=new Nt(0),o=s===!0?0:1,l,c,h=null,d=0,u=null;function p(M){let T=M.isScene===!0?M.background:null;if(T&&T.isTexture){let _=M.backgroundBlurriness>0;T=t.get(T,_)}return T}function g(M){let T=!1,_=p(M);_===null?m(a,o):_&&_.isColor&&(m(_,1),T=!0);let b=i.xr.getEnvironmentBlendMode();b==="additive"?e.buffers.color.setClear(0,0,0,1,r):b==="alpha-blend"&&e.buffers.color.setClear(0,0,0,0,r),(i.autoClear||T)&&(e.buffers.depth.setTest(!0),e.buffers.depth.setMask(!0),e.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function S(M,T){let _=p(T);_&&(_.isCubeTexture||_.mapping===jr)?(c===void 0&&(c=new at(new $e(1,1,1),new Ve({name:"BackgroundCubeMaterial",uniforms:ss(Yn.backgroundCube.uniforms),vertexShader:Yn.backgroundCube.vertexShader,fragmentShader:Yn.backgroundCube.fragmentShader,side:Ne,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(b,v,A){this.matrixWorld.copyPosition(A.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(c)),c.material.uniforms.envMap.value=_,c.material.uniforms.backgroundBlurriness.value=T.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=T.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(vg.makeRotationFromEuler(T.backgroundRotation)).transpose(),_.isCubeTexture&&_.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(Od),c.material.toneMapped=re.getTransfer(_.colorSpace)!==pe,(h!==_||d!==_.version||u!==i.toneMapping)&&(c.material.needsUpdate=!0,h=_,d=_.version,u=i.toneMapping),c.layers.enableAll(),M.unshift(c,c.geometry,c.material,0,0,null)):_&&_.isTexture&&(l===void 0&&(l=new at(new nn(2,2),new Ve({name:"BackgroundMaterial",uniforms:ss(Yn.background.uniforms),vertexShader:Yn.background.vertexShader,fragmentShader:Yn.background.fragmentShader,side:Ii,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(l)),l.material.uniforms.t2D.value=_,l.material.uniforms.backgroundIntensity.value=T.backgroundIntensity,l.material.toneMapped=re.getTransfer(_.colorSpace)!==pe,_.matrixAutoUpdate===!0&&_.updateMatrix(),l.material.uniforms.uvTransform.value.copy(_.matrix),(h!==_||d!==_.version||u!==i.toneMapping)&&(l.material.needsUpdate=!0,h=_,d=_.version,u=i.toneMapping),l.layers.enableAll(),M.unshift(l,l.geometry,l.material,0,0,null))}function m(M,T){M.getRGB(bl,$c(i)),e.buffers.color.setClear(bl.r,bl.g,bl.b,T,r)}function f(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return a},setClearColor:function(M,T=1){a.set(M),o=T,m(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(M){o=M,m(a,o)},render:g,addToRenderList:S,dispose:f}}function Sg(i,t){let e=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=u(null),r=s,a=!1;function o(I,N,F,L,B){let X=!1,G=d(I,L,F,N);r!==G&&(r=G,c(r.object)),X=p(I,L,F,B),X&&g(I,L,F,B),B!==null&&t.update(B,i.ELEMENT_ARRAY_BUFFER),(X||a)&&(a=!1,_(I,N,F,L),B!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,t.get(B).buffer))}function l(){return i.createVertexArray()}function c(I){return i.bindVertexArray(I)}function h(I){return i.deleteVertexArray(I)}function d(I,N,F,L){let B=L.wireframe===!0,X=n[N.id];X===void 0&&(X={},n[N.id]=X);let G=I.isInstancedMesh===!0?I.id:0,tt=X[G];tt===void 0&&(tt={},X[G]=tt);let Z=tt[F.id];Z===void 0&&(Z={},tt[F.id]=Z);let J=Z[B];return J===void 0&&(J=u(l()),Z[B]=J),J}function u(I){let N=[],F=[],L=[];for(let B=0;B<e;B++)N[B]=0,F[B]=0,L[B]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:N,enabledAttributes:F,attributeDivisors:L,object:I,attributes:{},index:null}}function p(I,N,F,L){let B=r.attributes,X=N.attributes,G=0,tt=F.getAttributes();for(let Z in tt)if(tt[Z].location>=0){let Y=B[Z],ft=X[Z];if(ft===void 0&&(Z==="instanceMatrix"&&I.instanceMatrix&&(ft=I.instanceMatrix),Z==="instanceColor"&&I.instanceColor&&(ft=I.instanceColor)),Y===void 0||Y.attribute!==ft||ft&&Y.data!==ft.data)return!0;G++}return r.attributesNum!==G||r.index!==L}function g(I,N,F,L){let B={},X=N.attributes,G=0,tt=F.getAttributes();for(let Z in tt)if(tt[Z].location>=0){let Y=X[Z];Y===void 0&&(Z==="instanceMatrix"&&I.instanceMatrix&&(Y=I.instanceMatrix),Z==="instanceColor"&&I.instanceColor&&(Y=I.instanceColor));let ft={};ft.attribute=Y,Y&&Y.data&&(ft.data=Y.data),B[Z]=ft,G++}r.attributes=B,r.attributesNum=G,r.index=L}function S(){let I=r.newAttributes;for(let N=0,F=I.length;N<F;N++)I[N]=0}function m(I){f(I,0)}function f(I,N){let F=r.newAttributes,L=r.enabledAttributes,B=r.attributeDivisors;F[I]=1,L[I]===0&&(i.enableVertexAttribArray(I),L[I]=1),B[I]!==N&&(i.vertexAttribDivisor(I,N),B[I]=N)}function M(){let I=r.newAttributes,N=r.enabledAttributes;for(let F=0,L=N.length;F<L;F++)N[F]!==I[F]&&(i.disableVertexAttribArray(F),N[F]=0)}function T(I,N,F,L,B,X,G){G===!0?i.vertexAttribIPointer(I,N,F,B,X):i.vertexAttribPointer(I,N,F,L,B,X)}function _(I,N,F,L){S();let B=L.attributes,X=F.getAttributes(),G=N.defaultAttributeValues;for(let tt in X){let Z=X[tt];if(Z.location>=0){let J=B[tt];if(J===void 0&&(tt==="instanceMatrix"&&I.instanceMatrix&&(J=I.instanceMatrix),tt==="instanceColor"&&I.instanceColor&&(J=I.instanceColor)),J!==void 0){let Y=J.normalized,ft=J.itemSize,bt=t.get(J);if(bt===void 0)continue;let At=bt.buffer,kt=bt.type,Bt=bt.bytesPerElement,W=kt===i.INT||kt===i.UNSIGNED_INT||J.gpuType===Bo;if(J.isInterleavedBufferAttribute){let j=J.data,ht=j.stride,Ft=J.offset;if(j.isInstancedInterleavedBuffer){for(let vt=0;vt<Z.locationSize;vt++)f(Z.location+vt,j.meshPerAttribute);I.isInstancedMesh!==!0&&L._maxInstanceCount===void 0&&(L._maxInstanceCount=j.meshPerAttribute*j.count)}else for(let vt=0;vt<Z.locationSize;vt++)m(Z.location+vt);i.bindBuffer(i.ARRAY_BUFFER,At);for(let vt=0;vt<Z.locationSize;vt++)T(Z.location+vt,ft/Z.locationSize,kt,Y,ht*Bt,(Ft+ft/Z.locationSize*vt)*Bt,W)}else{if(J.isInstancedBufferAttribute){for(let j=0;j<Z.locationSize;j++)f(Z.location+j,J.meshPerAttribute);I.isInstancedMesh!==!0&&L._maxInstanceCount===void 0&&(L._maxInstanceCount=J.meshPerAttribute*J.count)}else for(let j=0;j<Z.locationSize;j++)m(Z.location+j);i.bindBuffer(i.ARRAY_BUFFER,At);for(let j=0;j<Z.locationSize;j++)T(Z.location+j,ft/Z.locationSize,kt,Y,ft*Bt,ft/Z.locationSize*j*Bt,W)}}else if(G!==void 0){let Y=G[tt];if(Y!==void 0)switch(Y.length){case 2:i.vertexAttrib2fv(Z.location,Y);break;case 3:i.vertexAttrib3fv(Z.location,Y);break;case 4:i.vertexAttrib4fv(Z.location,Y);break;default:i.vertexAttrib1fv(Z.location,Y)}}}}M()}function b(){w();for(let I in n){let N=n[I];for(let F in N){let L=N[F];for(let B in L){let X=L[B];for(let G in X)h(X[G].object),delete X[G];delete L[B]}}delete n[I]}}function v(I){if(n[I.id]===void 0)return;let N=n[I.id];for(let F in N){let L=N[F];for(let B in L){let X=L[B];for(let G in X)h(X[G].object),delete X[G];delete L[B]}}delete n[I.id]}function A(I){for(let N in n){let F=n[N];for(let L in F){let B=F[L];if(B[I.id]===void 0)continue;let X=B[I.id];for(let G in X)h(X[G].object),delete X[G];delete B[I.id]}}}function x(I){for(let N in n){let F=n[N],L=I.isInstancedMesh===!0?I.id:0,B=F[L];if(B!==void 0){for(let X in B){let G=B[X];for(let tt in G)h(G[tt].object),delete G[tt];delete B[X]}delete F[L],Object.keys(F).length===0&&delete n[N]}}}function w(){R(),a=!0,r!==s&&(r=s,c(r.object))}function R(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:w,resetDefaultState:R,dispose:b,releaseStatesOfGeometry:v,releaseStatesOfObject:x,releaseStatesOfProgram:A,initAttributes:S,enableAttribute:m,disableUnusedAttributes:M}}function bg(i,t,e){let n;function s(l){n=l}function r(l,c){i.drawArrays(n,l,c),e.update(c,n,1)}function a(l,c,h){h!==0&&(i.drawArraysInstanced(n,l,c,h),e.update(c,n,h))}function o(l,c,h){if(h===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,c,0,h);let u=0;for(let p=0;p<h;p++)u+=c[p];e.update(u,n,1)}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o}function Eg(i,t,e,n){let s;function r(){if(s!==void 0)return s;if(t.has("EXT_texture_filter_anisotropic")===!0){let A=t.get("EXT_texture_filter_anisotropic");s=i.getParameter(A.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(A){return!(A!==vn&&n.convert(A)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(A){let x=A===Nn&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(A!==an&&A!==yn&&!x&&n.convert(A)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE))}function l(A){if(A==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";A="mediump"}return A==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=e.precision!==void 0?e.precision:"highp",h=l(c);h!==c&&(zt("WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);let d=e.logarithmicDepthBuffer===!0,u=e.reversedDepthBuffer===!0&&t.has("EXT_clip_control");e.reversedDepthBuffer===!0&&u===!1&&zt("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let p=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),S=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),f=i.getParameter(i.MAX_VERTEX_ATTRIBS),M=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),T=i.getParameter(i.MAX_VARYING_VECTORS),_=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),b=i.getParameter(i.MAX_SAMPLES),v=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:d,reversedDepthBuffer:u,maxTextures:p,maxVertexTextures:g,maxTextureSize:S,maxCubemapSize:m,maxAttributes:f,maxVertexUniforms:M,maxVaryings:T,maxFragmentUniforms:_,maxSamples:b,samples:v}}function Tg(i){let t=this,e=null,n=0,s=!1,r=!1,a=new dn,o=new Zt,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(d,u){let p=d.length!==0||u||n!==0||s;return s=u,n=d.length,p},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(d,u){e=h(d,u,0)},this.setState=function(d,u,p){let g=d.clippingPlanes,S=d.clipIntersection,m=d.clipShadows,f=i.get(d);if(!s||g===null||g.length===0||r&&!m)r?h(null):c();else{let M=r?0:n,T=M*4,_=f.clippingState||null;l.value=_,_=h(g,u,T,p);for(let b=0;b!==T;++b)_[b]=e[b];f.clippingState=_,this.numIntersection=S?this.numPlanes:0,this.numPlanes+=M}};function c(){l.value!==e&&(l.value=e,l.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function h(d,u,p,g){let S=d!==null?d.length:0,m=null;if(S!==0){if(m=l.value,g!==!0||m===null){let f=p+S*4,M=u.matrixWorldInverse;o.getNormalMatrix(M),(m===null||m.length<f)&&(m=new Float32Array(f));for(let T=0,_=p;T!==S;++T,_+=4)a.copy(d[T]).applyMatrix4(M,o),a.normal.toArray(m,_),m[_+3]=a.constant}l.value=m,l.needsUpdate=!0}return t.numPlanes=S,t.numIntersection=0,m}}var Ys=4,wg=6,Ag=20,Rg=256,la=new ks,md=new Nt,ah=null,oh=0,lh=0,ch=!1,Cg=new P,rs=new P,Fi=class{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(t,e=0,n=.1,s=100,r={}){let{size:a=256,position:o=Cg}=r;ah=this._renderer.getRenderTarget(),oh=this._renderer.getActiveCubeFace(),lh=this._renderer.getActiveMipmapLevel(),ch=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(t,n,s,l,o),e>0&&this._blur(l,0,0,e),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=xd(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=_d(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodMeshes.length;t++)this._lodMeshes[t].geometry.dispose()}_cleanup(t){this._renderer.setRenderTarget(ah,oh,lh),this._renderer.xr.enabled=ch,t.scissorTest=!1,qs(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===Li||t.mapping===is?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),ah=this._renderer.getRenderTarget(),oh=this._renderer.getActiveCubeFace(),lh=this._renderer.getActiveMipmapLevel(),ch=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=e||this._allocateTargets();return this._textureToCubeUV(t,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,n={magFilter:Xe,minFilter:Xe,generateMipmaps:!1,type:Nn,format:vn,colorSpace:mr,depthBuffer:!1},s=gd(t,e,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=gd(t,e,n);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=Pg(r)),this._blurMaterial=Lg(r,t,e),this._ggxMaterial=Ig(r,t,e)}return s}_compileMaterial(t){let e=new at(new ae,t);this._renderer.compile(e,la)}_sceneToCubeUV(t,e,n,s,r){let l=new De(90,1,e,n),c=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],d=this._renderer,u=d.autoClear,p=d.toneMapping;d.getClearColor(md),d.toneMapping=Ln,d.autoClear=!1,d.state.buffers.depth.getReversed()&&(d.setRenderTarget(s),d.clearDepth(),d.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new at(new $e,new qe({name:"PMREM.Background",side:Ne,depthWrite:!1,depthTest:!1})));let S=this._backgroundBox,m=S.material,f=!1,M=t.background;M?M.isColor&&(m.color.copy(M),t.background=null,f=!0):(m.color.copy(md),f=!0);for(let T=0;T<6;T++){let _=T%3;_===0?(l.up.set(0,c[T],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+h[T],r.y,r.z)):_===1?(l.up.set(0,0,c[T]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+h[T],r.z)):(l.up.set(0,c[T],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+h[T]));let b=this._cubeSize;qs(s,_*b,T>2?b:0,b,b),d.setRenderTarget(s),f&&d.render(S,l),d.render(t,l)}d.toneMapping=p,d.autoClear=u,t.background=M}_textureToCubeUV(t,e){let n=this._renderer,s=t.mapping===Li||t.mapping===is;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=xd()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=_d());let r=s?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=r;let o=r.uniforms;o.envMap.value=t;let l=this._cubeSize;qs(e,0,0,3*l,2*l),n.setRenderTarget(e),n.render(a,la)}_applyPMREM(t){let e=this._renderer,n=e.autoClear;e.autoClear=!1;let s=this._lodMeshes.length;for(let r=1;r<s;r++)this._applyGGXFilter(t,r-1,r);e.autoClear=n}_applyGGXFilter(t,e,n){let s=this._renderer,r=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[n];o.material=a;let l=a.uniforms,c=n/(this._lodMeshes.length-1),h=e/(this._lodMeshes.length-1),d=Math.sqrt(c*c-h*h),u=c*1.25,p=d*u,{_lodMax:g}=this,S=this._sizeLods[n],m=3*S*(n>g-Ys?n-g+Ys:0),f=4*(this._cubeSize-S);l.envMap.value=t.texture,l.roughness.value=p,l.mipInt.value=g-e,qs(r,m,f,3*S,2*S),s.setRenderTarget(r),s.render(o,la),l.envMap.value=r.texture,l.roughness.value=0,l.mipInt.value=g-n,qs(t,m,f,3*S,2*S),s.setRenderTarget(t),s.render(o,la)}_blur(t,e,n,s){let r=this._pingPongRenderTarget,a=Math.min(s,Math.PI)/Math.SQRT2;this._blurPass(t,r,e,n,a),this._blurPass(r,t,n,n,a)}_blurPass(t,e,n,s,r){let a=this._renderer,o=this._blurMaterial,l=this._lodMeshes[s];l.material=o;let c=o.uniforms;c.envMap.value=t.texture,c.sigma.value=r,c.mipInt.value=this._lodMax-n;let h=this._sizeLods[s],d=3*h*(s>this._lodMax-Ys?s-this._lodMax+Ys:0),u=4*(this._cubeSize-h);qs(e,d,u,3*h,2*h),a.setRenderTarget(e),a.render(l,la)}};function Pg(i){let t=[],e=[],n=i,s=i-Ys+1+wg;for(let r=0;r<s;r++){let a=Math.pow(2,n);t.push(a);let o=1/(a-2),l=-o,c=1+o,h=[l,l,c,l,c,c,l,l,c,c,l,c],d=6,u=6,p=3,g=new Float32Array(p*u*d),S=new Float32Array(p*u*d);for(let f=0;f<d;f++){let M=f%3*2/3-1,T=f>2?0:-1,_=[M,T,0,M+2/3,T,0,M+2/3,T+1,0,M,T,0,M+2/3,T+1,0,M,T+1,0];g.set(_,p*u*f);for(let b=0;b<u;b++){let v=h[b*2]*2-1,A=h[b*2+1]*2-1;f===0?rs.set(1,A,v):f===1?rs.set(-v,1,-A):f===2?rs.set(-v,A,1):f===3?rs.set(-1,A,-v):f===4?rs.set(-v,-1,A):rs.set(v,A,-1),rs.toArray(S,(f*u+b)*p)}}let m=new ae;m.setAttribute("position",new ke(g,p)),m.setAttribute("outputDirection",new ke(S,p)),e.push(new at(m,null)),n>Ys&&n--}return{lodMeshes:e,sizeLods:t}}function gd(i,t,e){let n=new rn(i,t,e);return n.texture.mapping=jr,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function qs(i,t,e,n,s){i.viewport.set(t,e,n,s),i.scissor.set(t,e,n,s)}function Ig(i,t,e){return new Ve({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:Rg,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:wl(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:Xn,depthTest:!1,depthWrite:!1})}function Lg(i,t,e){return new Ve({name:"SphericalGaussianBlur",defines:{SAMPLES:Ag,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:wl(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float sigma;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359
			#define GOLDEN_ANGLE 2.39996322973

			void main() {

				if ( sigma == 0.0 ) {

					gl_FragColor = vec4( bilinearCubeUV( envMap, vOutputDirection, mipInt ), 1.0 );
					return;

				}

				vec3 outputDirection = normalize( vOutputDirection );

				vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
				vec3 tangent = normalize( cross( up, outputDirection ) );
				vec3 bitangent = cross( outputDirection, tangent );

				// Truncate the kernel at three standard deviations or at the antipode.
				float thetaMax = min( 3.0 * sigma, PI );
				float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

				vec3 accumColor = vec3( 0.0 );
				float accumWeight = 0.0;

				for ( int i = 0; i < SAMPLES; i ++ ) {

					// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
					float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
					float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
					float phi = float( i ) * GOLDEN_ANGLE;

					vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
					vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

					// Correct the planar sample density to solid angle.
					float weight = sin( theta ) / theta;

					accumColor += weight * bilinearCubeUV( envMap, sampleDirection, mipInt );
					accumWeight += weight;

				}

				gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

			}
		`,blending:Xn,depthTest:!1,depthWrite:!1})}function _d(){return new Ve({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:wl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Xn,depthTest:!1,depthWrite:!1})}function xd(){return new Ve({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:wl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Xn,depthTest:!1,depthWrite:!1})}function wl(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var Tl=class extends rn{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;let n={width:t,height:t,depth:1},s=[n,n,n,n,n,n];this.texture=new wr(s),this._setTextureOptions(e),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new $e(5,5,5),r=new Ve({name:"CubemapFromEquirect",uniforms:ss(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Ne,blending:Xn});r.uniforms.tEquirect.value=e;let a=new at(s,r),o=e.minFilter;return e.minFilter===Di&&(e.minFilter=Xe),new Co(1,10,this).update(t,a),e.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(t,e=!0,n=!0,s=!0){let r=t.getRenderTarget();for(let a=0;a<6;a++)t.setRenderTarget(this,a),t.clear(e,n,s);t.setRenderTarget(r)}};function Dg(i){let t=new WeakMap,e=new WeakMap,n=null;function s(u,p=!1){return u==null?null:p?a(u):r(u)}function r(u){if(u&&u.isTexture){let p=u.mapping;if(p===Uo||p===Fo)if(t.has(u)){let g=t.get(u).texture;return o(g,u.mapping)}else{let g=u.image;if(g&&g.height>0){let S=new Tl(g.height);return S.fromEquirectangularTexture(i,u),t.set(u,S),u.addEventListener("dispose",c),o(S.texture,u.mapping)}else return null}}return u}function a(u){if(u&&u.isTexture){let p=u.mapping,g=p===Uo||p===Fo,S=p===Li||p===is;if(g||S){let m=e.get(u),f=m!==void 0?m.texture.pmremVersion:0;if(u.isRenderTargetTexture&&u.pmremVersion!==f)return n===null&&(n=new Fi(i)),m=g?n.fromEquirectangular(u,m):n.fromCubemap(u,m),m.texture.pmremVersion=u.pmremVersion,e.set(u,m),m.texture;if(m!==void 0)return m.texture;{let M=u.image;return g&&M&&M.height>0||S&&M&&l(M)?(n===null&&(n=new Fi(i)),m=g?n.fromEquirectangular(u):n.fromCubemap(u),m.texture.pmremVersion=u.pmremVersion,e.set(u,m),u.addEventListener("dispose",h),m.texture):null}}}return u}function o(u,p){return p===Uo?u.mapping=Li:p===Fo&&(u.mapping=is),u}function l(u){let p=0,g=6;for(let S=0;S<g;S++)u[S]!==void 0&&p++;return p===g}function c(u){let p=u.target;p.removeEventListener("dispose",c);let g=t.get(p);g!==void 0&&(t.delete(p),g.dispose())}function h(u){let p=u.target;p.removeEventListener("dispose",h);let g=e.get(p);g!==void 0&&(e.delete(p),g.dispose())}function d(){t=new WeakMap,e=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:s,dispose:d}}function Ng(i){let t={};function e(n){if(t[n]!==void 0)return t[n];let s=i.getExtension(n);return t[n]=s,s}return{has:function(n){return e(n)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(n){let s=e(n);return s===null&&Zi("WebGLRenderer: "+n+" extension not supported."),s}}}function Ug(i,t,e,n){let s={},r=new WeakMap;function a(d){let u=d.target;u.index!==null&&t.remove(u.index);for(let g in u.attributes)t.remove(u.attributes[g]);u.removeEventListener("dispose",a),delete s[u.id];let p=r.get(u);p&&(t.remove(p),r.delete(u)),n.releaseStatesOfGeometry(u),u.isInstancedBufferGeometry===!0&&delete u._maxInstanceCount,e.memory.geometries--}function o(d,u){return s[u.id]===!0||(u.addEventListener("dispose",a),s[u.id]=!0,e.memory.geometries++),u}function l(d){let u=d.attributes;for(let p in u)t.update(u[p],i.ARRAY_BUFFER)}function c(d){let u=[],p=d.index,g=d.attributes.position,S=0;if(g===void 0)return;if(p!==null){let M=p.array;S=p.version;for(let T=0,_=M.length;T<_;T+=3){let b=M[T+0],v=M[T+1],A=M[T+2];u.push(b,v,v,A,A,b)}}else{let M=g.array;S=g.version;for(let T=0,_=M.length/3-1;T<_;T+=3){let b=T+0,v=T+1,A=T+2;u.push(b,v,v,A,A,b)}}let m=new(g.count>=65535?br:Sr)(u,1);m.version=S;let f=r.get(d);f&&t.remove(f),r.set(d,m)}function h(d){let u=r.get(d);if(u){let p=d.index;p!==null&&u.version<p.version&&c(d)}else c(d);return r.get(d)}return{get:o,update:l,getWireframeAttribute:h}}function Fg(i,t,e){let n;function s(d){n=d}let r,a;function o(d){r=d.type,a=d.bytesPerElement}function l(d,u){i.drawElements(n,u,r,d*a),e.update(u,n,1)}function c(d,u,p){p!==0&&(i.drawElementsInstanced(n,u,r,d*a,p),e.update(u,n,p))}function h(d,u,p){if(p===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,u,0,r,d,0,p);let S=0;for(let m=0;m<p;m++)S+=u[m];e.update(S,n,1)}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=h}function Og(i){let t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(e.calls++,a){case i.TRIANGLES:e.triangles+=o*(r/3);break;case i.LINES:e.lines+=o*(r/2);break;case i.LINE_STRIP:e.lines+=o*(r-1);break;case i.LINE_LOOP:e.lines+=o*r;break;case i.POINTS:e.points+=o*r;break;default:Wt("WebGLInfo: Unknown draw mode:",a);break}}function s(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:s,update:n}}function Bg(i,t,e){let n=new WeakMap,s=new Te;function r(a,o,l){let c=a.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,d=h!==void 0?h.length:0,u=n.get(o);if(u===void 0||u.count!==d){let w=function(){A.dispose(),n.delete(o),o.removeEventListener("dispose",w)};u!==void 0&&u.texture.dispose();let p=o.morphAttributes.position!==void 0,g=o.morphAttributes.normal!==void 0,S=o.morphAttributes.color!==void 0,m=o.morphAttributes.position||[],f=o.morphAttributes.normal||[],M=o.morphAttributes.color||[],T=0;p===!0&&(T=1),g===!0&&(T=2),S===!0&&(T=3);let _=o.attributes.position.count*T,b=1;_>t.maxTextureSize&&(b=Math.ceil(_/t.maxTextureSize),_=t.maxTextureSize);let v=new Float32Array(_*b*4*d),A=new yr(v,_,b,d);A.type=yn,A.needsUpdate=!0;let x=T*4;for(let R=0;R<d;R++){let I=m[R],N=f[R],F=M[R],L=_*b*4*R;for(let B=0;B<I.count;B++){let X=B*x;p===!0&&(s.fromBufferAttribute(I,B),v[L+X+0]=s.x,v[L+X+1]=s.y,v[L+X+2]=s.z,v[L+X+3]=0),g===!0&&(s.fromBufferAttribute(N,B),v[L+X+4]=s.x,v[L+X+5]=s.y,v[L+X+6]=s.z,v[L+X+7]=0),S===!0&&(s.fromBufferAttribute(F,B),v[L+X+8]=s.x,v[L+X+9]=s.y,v[L+X+10]=s.z,v[L+X+11]=F.itemSize===4?s.w:1)}}u={count:d,texture:A,size:new it(_,b)},n.set(o,u),o.addEventListener("dispose",w)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",a.morphTexture,e);else{let p=0;for(let S=0;S<c.length;S++)p+=c[S];let g=o.morphTargetsRelative?1:1-p;l.getUniforms().setValue(i,"morphTargetBaseInfluence",g),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",u.texture,e),l.getUniforms().setValue(i,"morphTargetsTextureSize",u.size)}return{update:r}}function zg(i,t,e,n,s){let r=new WeakMap;function a(c){let h=s.render.frame,d=c.geometry,u=t.get(c,d);if(r.get(u)!==h&&(t.update(u),r.set(u,h)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),r.get(c)!==h&&(e.update(c.instanceMatrix,i.ARRAY_BUFFER),c.instanceColor!==null&&e.update(c.instanceColor,i.ARRAY_BUFFER),r.set(c,h))),c.isSkinnedMesh){let p=c.skeleton;r.get(p)!==h&&(p.update(),r.set(p,h))}return u}function o(){r=new WeakMap}function l(c){let h=c.target;h.removeEventListener("dispose",l),n.releaseStatesOfObject(h),e.remove(h.instanceMatrix),h.instanceColor!==null&&e.remove(h.instanceColor)}return{update:a,dispose:o}}var kg={[Dc]:"LINEAR_TONE_MAPPING",[Nc]:"REINHARD_TONE_MAPPING",[Uc]:"CINEON_TONE_MAPPING",[ns]:"ACES_FILMIC_TONE_MAPPING",[Oc]:"AGX_TONE_MAPPING",[Bc]:"NEUTRAL_TONE_MAPPING",[Fc]:"CUSTOM_TONE_MAPPING"};function Hg(i,t,e,n,s,r){let a=new rn(t,e,{type:i,depthBuffer:s,stencilBuffer:r,samples:n?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),o=null,l=null,c=new ae;c.setAttribute("position",new Ht([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new Ht([0,2,0,0,2,0],2));let h=new go({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),d=new at(c,h),u=new ks(-1,1,1,-1,0,1),p=null,g=null,S=!1,m,f=null,M=[],T=!1;this.setSize=function(_,b){a.setSize(_,b),o!==null&&o.setSize(_,b),l!==null&&l.setSize(_,b);for(let v=0;v<M.length;v++){let A=M[v];A.setSize&&A.setSize(_,b)}},this.setEffects=function(_){M=_,T=M.length>0&&M[0].isRenderPass===!0;let b=a.width,v=a.height;M.length>0&&o===null&&(o=new rn(b,v,{type:Nn,depthBuffer:!1,stencilBuffer:!1}),l=new rn(b,v,{type:Nn,depthBuffer:!1,stencilBuffer:!1}));for(let A=0;A<M.length;A++){let x=M[A];x.setSize&&x.setSize(b,v)}},this.begin=function(_,b){if(S||_.toneMapping===Ln&&M.length===0)return!1;if(f=b,b!==null){let v=b.width,A=b.height;(a.width!==v||a.height!==A)&&this.setSize(v,A)}return T===!1&&_.setRenderTarget(a),m=_.toneMapping,_.toneMapping=Ln,!0},this.hasRenderPass=function(){return T},this.end=function(_,b){_.toneMapping=m,S=!0;let v=a,A=o;for(let x=0;x<M.length;x++){let w=M[x];w.enabled!==!1&&(w.render(_,A,v,b),w.needsSwap!==!1&&(v=A,A=A===o?l:o))}if(p!==_.outputColorSpace||g!==_.toneMapping){p=_.outputColorSpace,g=_.toneMapping,h.defines={},re.getTransfer(p)===pe&&(h.defines.SRGB_TRANSFER="");let x=kg[g];x&&(h.defines[x]=""),h.needsUpdate=!0}h.uniforms.tDiffuse.value=v.texture,_.setRenderTarget(f),_.render(d,u),f=null,S=!1},this.isCompositing=function(){return S},this.dispose=function(){a.dispose(),o!==null&&o.dispose(),l!==null&&l.dispose(),c.dispose(),h.dispose()}}var Bd=new en,dh=new Si(1,1),zd=new yr,kd=new so,Hd=new wr,yd=[],vd=[],Md=new Float32Array(16),Sd=new Float32Array(9),bd=new Float32Array(4);function Ks(i,t,e){let n=i[0];if(n<=0||n>0)return i;let s=t*e,r=yd[s];if(r===void 0&&(r=new Float32Array(s),yd[s]=r),t!==0){n.toArray(r,0);for(let a=1,o=0;a!==t;++a)o+=e,i[a].toArray(r,o)}return r}function Ue(i,t){if(i.length!==t.length)return!1;for(let e=0,n=i.length;e<n;e++)if(i[e]!==t[e])return!1;return!0}function Fe(i,t){for(let e=0,n=t.length;e<n;e++)i[e]=t[e]}function Al(i,t){let e=vd[t];e===void 0&&(e=new Int32Array(t),vd[t]=e);for(let n=0;n!==t;++n)e[n]=i.allocateTextureUnit();return e}function Vg(i,t){let e=this.cache;e[0]!==t&&(i.uniform1f(this.addr,t),e[0]=t)}function Gg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ue(e,t))return;i.uniform2fv(this.addr,t),Fe(e,t)}}function Wg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(i.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(Ue(e,t))return;i.uniform3fv(this.addr,t),Fe(e,t)}}function Xg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ue(e,t))return;i.uniform4fv(this.addr,t),Fe(e,t)}}function qg(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(Ue(e,t))return;i.uniformMatrix2fv(this.addr,!1,t),Fe(e,t)}else{if(Ue(e,n))return;bd.set(n),i.uniformMatrix2fv(this.addr,!1,bd),Fe(e,n)}}function Yg(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(Ue(e,t))return;i.uniformMatrix3fv(this.addr,!1,t),Fe(e,t)}else{if(Ue(e,n))return;Sd.set(n),i.uniformMatrix3fv(this.addr,!1,Sd),Fe(e,n)}}function Zg(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(Ue(e,t))return;i.uniformMatrix4fv(this.addr,!1,t),Fe(e,t)}else{if(Ue(e,n))return;Md.set(n),i.uniformMatrix4fv(this.addr,!1,Md),Fe(e,n)}}function Jg(i,t){let e=this.cache;e[0]!==t&&(i.uniform1i(this.addr,t),e[0]=t)}function Kg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ue(e,t))return;i.uniform2iv(this.addr,t),Fe(e,t)}}function $g(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Ue(e,t))return;i.uniform3iv(this.addr,t),Fe(e,t)}}function jg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ue(e,t))return;i.uniform4iv(this.addr,t),Fe(e,t)}}function Qg(i,t){let e=this.cache;e[0]!==t&&(i.uniform1ui(this.addr,t),e[0]=t)}function t_(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ue(e,t))return;i.uniform2uiv(this.addr,t),Fe(e,t)}}function e_(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Ue(e,t))return;i.uniform3uiv(this.addr,t),Fe(e,t)}}function n_(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ue(e,t))return;i.uniform4uiv(this.addr,t),Fe(e,t)}}function i_(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(dh.compareFunction=e.isReversedDepthBuffer()?Sl:Ml,r=dh):r=Bd,e.setTexture2D(t||r,s)}function s_(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture3D(t||kd,s)}function r_(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTextureCube(t||Hd,s)}function a_(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture2DArray(t||zd,s)}function o_(i){switch(i){case 5126:return Vg;case 35664:return Gg;case 35665:return Wg;case 35666:return Xg;case 35674:return qg;case 35675:return Yg;case 35676:return Zg;case 5124:case 35670:return Jg;case 35667:case 35671:return Kg;case 35668:case 35672:return $g;case 35669:case 35673:return jg;case 5125:return Qg;case 36294:return t_;case 36295:return e_;case 36296:return n_;case 35678:case 36198:case 36298:case 36306:case 35682:return i_;case 35679:case 36299:case 36307:return s_;case 35680:case 36300:case 36308:case 36293:return r_;case 36289:case 36303:case 36311:case 36292:return a_}}function l_(i,t){i.uniform1fv(this.addr,t)}function c_(i,t){let e=Ks(t,this.size,2);i.uniform2fv(this.addr,e)}function h_(i,t){let e=Ks(t,this.size,3);i.uniform3fv(this.addr,e)}function u_(i,t){let e=Ks(t,this.size,4);i.uniform4fv(this.addr,e)}function d_(i,t){let e=Ks(t,this.size,4);i.uniformMatrix2fv(this.addr,!1,e)}function f_(i,t){let e=Ks(t,this.size,9);i.uniformMatrix3fv(this.addr,!1,e)}function p_(i,t){let e=Ks(t,this.size,16);i.uniformMatrix4fv(this.addr,!1,e)}function m_(i,t){i.uniform1iv(this.addr,t)}function g_(i,t){i.uniform2iv(this.addr,t)}function __(i,t){i.uniform3iv(this.addr,t)}function x_(i,t){i.uniform4iv(this.addr,t)}function y_(i,t){i.uniform1uiv(this.addr,t)}function v_(i,t){i.uniform2uiv(this.addr,t)}function M_(i,t){i.uniform3uiv(this.addr,t)}function S_(i,t){i.uniform4uiv(this.addr,t)}function b_(i,t,e){let n=this.cache,s=t.length,r=Al(e,s);Ue(n,r)||(i.uniform1iv(this.addr,r),Fe(n,r));let a;this.type===i.SAMPLER_2D_SHADOW?a=dh:a=Bd;for(let o=0;o!==s;++o)e.setTexture2D(t[o]||a,r[o])}function E_(i,t,e){let n=this.cache,s=t.length,r=Al(e,s);Ue(n,r)||(i.uniform1iv(this.addr,r),Fe(n,r));for(let a=0;a!==s;++a)e.setTexture3D(t[a]||kd,r[a])}function T_(i,t,e){let n=this.cache,s=t.length,r=Al(e,s);Ue(n,r)||(i.uniform1iv(this.addr,r),Fe(n,r));for(let a=0;a!==s;++a)e.setTextureCube(t[a]||Hd,r[a])}function w_(i,t,e){let n=this.cache,s=t.length,r=Al(e,s);Ue(n,r)||(i.uniform1iv(this.addr,r),Fe(n,r));for(let a=0;a!==s;++a)e.setTexture2DArray(t[a]||zd,r[a])}function A_(i){switch(i){case 5126:return l_;case 35664:return c_;case 35665:return h_;case 35666:return u_;case 35674:return d_;case 35675:return f_;case 35676:return p_;case 5124:case 35670:return m_;case 35667:case 35671:return g_;case 35668:case 35672:return __;case 35669:case 35673:return x_;case 5125:return y_;case 36294:return v_;case 36295:return M_;case 36296:return S_;case 35678:case 36198:case 36298:case 36306:case 35682:return b_;case 35679:case 36299:case 36307:return E_;case 35680:case 36300:case 36308:case 36293:return T_;case 36289:case 36303:case 36311:case 36292:return w_}}var fh=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=o_(e.type)}},ph=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=A_(e.type)}},mh=class{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){let s=this.seq;for(let r=0,a=s.length;r!==a;++r){let o=s[r];o.setValue(t,e[o.id],n)}}},hh=/(\w+)(\])?(\[|\.)?/g;function Ed(i,t){i.seq.push(t),i.map[t.id]=t}function R_(i,t,e){let n=i.name,s=n.length;for(hh.lastIndex=0;;){let r=hh.exec(n),a=hh.lastIndex,o=r[1],l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===s){Ed(e,c===void 0?new fh(o,i,t):new ph(o,i,t));break}else{let d=e.map[o];d===void 0&&(d=new mh(o),Ed(e,d)),e=d}}}var Zs=class{constructor(t,e){this.seq=[],this.map={};let n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let a=0;a<n;++a){let o=t.getActiveUniform(e,a),l=t.getUniformLocation(e,o.name);R_(o,l,this)}let s=[],r=[];for(let a of this.seq)a.type===t.SAMPLER_2D_SHADOW||a.type===t.SAMPLER_CUBE_SHADOW||a.type===t.SAMPLER_2D_ARRAY_SHADOW?s.push(a):r.push(a);s.length>0&&(this.seq=s.concat(r))}setValue(t,e,n,s){let r=this.map[e];r!==void 0&&r.setValue(t,n,s)}setOptional(t,e,n){let s=e[n];s!==void 0&&this.setValue(t,n,s)}static upload(t,e,n,s){for(let r=0,a=e.length;r!==a;++r){let o=e[r],l=n[o.id];l.needsUpdate!==!1&&o.setValue(t,l.value,s)}}static seqWithValue(t,e){let n=[];for(let s=0,r=t.length;s!==r;++s){let a=t[s];a.id in e&&n.push(a)}return n}};function Td(i,t,e){let n=i.createShader(t);return i.shaderSource(n,e),i.compileShader(n),n}var C_=37297,P_=0;function I_(i,t){let e=i.split(`
`),n=[],s=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let a=s;a<r;a++){let o=a+1;n.push(`${o===t?">":" "} ${o}: ${e[a]}`)}return n.join(`
`)}var wd=new Zt;function L_(i){re._getMatrix(wd,re.workingColorSpace,i);let t=`mat3( ${wd.elements.map(e=>e.toFixed(4))} )`;switch(re.getTransfer(i)){case gr:return[t,"LinearTransferOETF"];case pe:return[t,"sRGBTransferOETF"];default:return zt("WebGLProgram: Unsupported color space: ",i),[t,"LinearTransferOETF"]}}function Ad(i,t,e){let n=i.getShaderParameter(t,i.COMPILE_STATUS),r=(i.getShaderInfoLog(t)||"").trim();if(n&&r==="")return"";let a=/ERROR: 0:(\d+)/.exec(r);if(a){let o=parseInt(a[1]);return e.toUpperCase()+`

`+r+`

`+I_(i.getShaderSource(t),o)}else return r}function D_(i,t){let e=L_(t);return[`vec4 ${i}( vec4 value ) {`,`	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,"}"].join(`
`)}var N_={[Dc]:"Linear",[Nc]:"Reinhard",[Uc]:"Cineon",[ns]:"ACESFilmic",[Oc]:"AgX",[Bc]:"Neutral",[Fc]:"Custom"};function U_(i,t){let e=N_[t];return e===void 0?(zt("WebGLProgram: Unsupported toneMapping:",t),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}var El=new P;function F_(){re.getLuminanceCoefficients(El);let i=El.x.toFixed(4),t=El.y.toFixed(4),e=El.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function O_(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(ha).join(`
`)}function B_(i){let t=[];for(let e in i){let n=i[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function z_(i,t){let e={},n=i.getProgramParameter(t,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(t,s),a=r.name,o=1;r.type===i.FLOAT_MAT2&&(o=2),r.type===i.FLOAT_MAT3&&(o=3),r.type===i.FLOAT_MAT4&&(o=4),e[a]={type:r.type,location:i.getAttribLocation(t,a),locationSize:o}}return e}function ha(i){return i!==""}function Rd(i,t){let e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return i.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function Cd(i,t){return i.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var k_=/^[ \t]*#include +<([\w\d./]+)>/gm;function gh(i){return i.replace(k_,V_)}var H_=new Map;function V_(i,t){let e=ne[t];if(e===void 0){let n=H_.get(t);if(n!==void 0)e=ne[n],zt('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,n);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+t+">")}return gh(e)}var G_=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Pd(i){return i.replace(G_,W_)}function W_(i,t,e,n){let s="";for(let r=parseInt(t);r<parseInt(e);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Id(i){let t=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?t+=`
#define HIGH_PRECISION`:i.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}var X_={[$r]:"SHADOWMAP_TYPE_PCF",[Vs]:"SHADOWMAP_TYPE_VSM"};function q_(i){return X_[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var Y_={[Li]:"ENVMAP_TYPE_CUBE",[is]:"ENVMAP_TYPE_CUBE",[jr]:"ENVMAP_TYPE_CUBE_UV"};function Z_(i){return i.envMap===!1?"ENVMAP_TYPE_CUBE":Y_[i.envMapMode]||"ENVMAP_TYPE_CUBE"}var J_={[is]:"ENVMAP_MODE_REFRACTION"};function K_(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":J_[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}var $_={[No]:"ENVMAP_BLENDING_MULTIPLY",[Wu]:"ENVMAP_BLENDING_MIX",[Xu]:"ENVMAP_BLENDING_ADD"};function j_(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":$_[i.combine]||"ENVMAP_BLENDING_NONE"}function Q_(i){let t=i.envMapCubeUVHeight;if(t===null)return null;let e=Math.log2(t)-2,n=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),7*16)),texelHeight:n,maxMip:e}}function tx(i,t,e,n){let s=i.getContext(),r=e.defines,a=e.vertexShader,o=e.fragmentShader,l=q_(e),c=Z_(e),h=K_(e),d=j_(e),u=Q_(e),p=O_(e),g=B_(r),S=s.createProgram(),m,f,M=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(m=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(ha).join(`
`),m.length>0&&(m+=`
`),f=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(ha).join(`
`),f.length>0&&(f+=`
`)):(m=[Id(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+h:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexNormals?"#define HAS_NORMAL":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(ha).join(`
`),f=[Id(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+c:"",e.envMap?"#define "+h:"",e.envMap?"#define "+d:"",u?"#define CUBEUV_TEXEL_WIDTH "+u.texelWidth:"",u?"#define CUBEUV_TEXEL_HEIGHT "+u.texelHeight:"",u?"#define CUBEUV_MAX_MIP "+u.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.retroreflection?"#define USE_RETROREFLECTION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor?"#define USE_COLOR":"",e.vertexAlphas||e.batchingColor?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==Ln?"#define TONE_MAPPING":"",e.toneMapping!==Ln?ne.tonemapping_pars_fragment:"",e.toneMapping!==Ln?U_("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",ne.colorspace_pars_fragment,D_("linearToOutputTexel",e.outputColorSpace),F_(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(ha).join(`
`)),a=gh(a),a=Rd(a,e),a=Cd(a,e),o=gh(o),o=Rd(o,e),o=Cd(o,e),a=Pd(a),o=Pd(o),e.isRawShaderMaterial!==!0&&(M=`#version 300 es
`,m=[p,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,f=["#define varying in",e.glslVersion===Yc?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===Yc?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+f);let T=M+m+a,_=M+f+o,b=Td(s,s.VERTEX_SHADER,T),v=Td(s,s.FRAGMENT_SHADER,_);s.attachShader(S,b),s.attachShader(S,v),e.index0AttributeName!==void 0?s.bindAttribLocation(S,0,e.index0AttributeName):e.hasPositionAttribute===!0&&s.bindAttribLocation(S,0,"position"),s.linkProgram(S);function A(I){if(i.debug.checkShaderErrors){let N=s.getProgramInfoLog(S)||"",F=s.getShaderInfoLog(b)||"",L=s.getShaderInfoLog(v)||"",B=N.trim(),X=F.trim(),G=L.trim(),tt=!0,Z=!0;if(s.getProgramParameter(S,s.LINK_STATUS)===!1)if(tt=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,S,b,v);else{let J=Ad(s,b,"vertex"),Y=Ad(s,v,"fragment");Wt("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(S,s.VALIDATE_STATUS)+`

Material Name: `+I.name+`
Material Type: `+I.type+`

Program Info Log: `+B+`
`+J+`
`+Y)}else B!==""?zt("WebGLProgram: Program Info Log:",B):(X===""||G==="")&&(Z=!1);Z&&(I.diagnostics={runnable:tt,programLog:B,vertexShader:{log:X,prefix:m},fragmentShader:{log:G,prefix:f}})}s.deleteShader(b),s.deleteShader(v),x=new Zs(s,S),w=z_(s,S)}let x;this.getUniforms=function(){return x===void 0&&A(this),x};let w;this.getAttributes=function(){return w===void 0&&A(this),w};let R=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return R===!1&&(R=s.getProgramParameter(S,C_)),R},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(S),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=P_++,this.cacheKey=t,this.usedTimes=1,this.program=S,this.vertexShader=b,this.fragmentShader=v,this}var ex=0,_h=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t,e,n){let s=this._getShaderCacheForMaterial(t);return s.has(e)===!1&&(s.add(e),e.usedTimes++),s.has(n)===!1&&(s.add(n),n.usedTimes++),this}remove(t){let e=this.materialCache.get(t);for(let n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderStage(t){return this._getShaderStage(t.vertexShader)}getFragmentShaderStage(t){return this._getShaderStage(t.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){let e=this.materialCache,n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){let e=this.shaderCache,n=e.get(t);return n===void 0&&(n=new xh(t),e.set(t,n)),n}},xh=class{constructor(t){this.id=ex++,this.code=t,this.usedTimes=0}};function nx(i){return i===Ui||i===sa||i===ra}function ix(i,t,e,n,s,r){let a=new vr,o=new _h,l=new Set,c=[],h=new Map,d=n.logarithmicDepthBuffer,u=n.precision,p={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function g(x){return l.add(x),x===0?"uv":`uv${x}`}function S(x,w,R,I,N,F){let L=I.fog,B=N.geometry,X=x.isMeshStandardMaterial||x.isMeshLambertMaterial||x.isMeshPhongMaterial?I.environment:null,G=x.isMeshStandardMaterial||x.isMeshLambertMaterial&&!x.envMap||x.isMeshPhongMaterial&&!x.envMap,tt=t.get(x.envMap||X,G),Z=tt&&tt.mapping===jr?tt.image.height:null,J=p[x.type];x.precision!==null&&(u=n.getMaxPrecision(x.precision),u!==x.precision&&zt("WebGLProgram.getParameters:",x.precision,"not supported, using",u,"instead."));let Y=B.morphAttributes.position||B.morphAttributes.normal||B.morphAttributes.color,ft=Y!==void 0?Y.length:0,bt=0;B.morphAttributes.position!==void 0&&(bt=1),B.morphAttributes.normal!==void 0&&(bt=2),B.morphAttributes.color!==void 0&&(bt=3);let At,kt,Bt,W;if(J){let ve=Yn[J];At=ve.vertexShader,kt=ve.fragmentShader}else{At=x.vertexShader,kt=x.fragmentShader;let ve=o.getVertexShaderStage(x),de=o.getFragmentShaderStage(x);o.update(x,ve,de),Bt=ve.id,W=de.id}let j=i.getRenderTarget(),ht=i.state.buffers.depth.getReversed(),Ft=N.isInstancedMesh===!0,vt=N.isBatchedMesh===!0,qt=!!x.map,me=!!x.matcap,nt=!!tt,rt=!!x.aoMap,ot=!!x.lightMap,lt=!!x.bumpMap&&x.wireframe===!1,dt=!!x.normalMap,Vt=!!x.displacementMap,Ot=!!x.emissiveMap,Yt=!!x.metalnessMap,Jt=!!x.roughnessMap,D=x.anisotropy>0,ue=x.clearcoat>0,ie=x.dispersion>0,C=x.retroreflectivity>0,y=x.iridescence>0,z=x.sheen>0,V=x.transmission>0,K=D&&!!x.anisotropyMap,ct=ue&&!!x.clearcoatMap,ut=ue&&!!x.clearcoatNormalMap,$=ue&&!!x.clearcoatRoughnessMap,et=y&&!!x.iridescenceMap,pt=y&&!!x.iridescenceThicknessMap,Lt=z&&!!x.sheenColorMap,xt=z&&!!x.sheenRoughnessMap,mt=!!x.specularMap,Dt=!!x.specularColorMap,Gt=!!x.specularIntensityMap,jt=V&&!!x.transmissionMap,O=V&&!!x.thicknessMap,gt=!!x.gradientMap,Q=!!x.alphaMap,_t=x.alphaTest>0,Et=!!x.alphaHash,st=!!x.extensions,Ut=Ln;x.toneMapped&&(j===null||j.isXRRenderTarget===!0)&&(Ut=i.toneMapping);let Pt={shaderID:J,shaderType:x.type,shaderName:x.name,vertexShader:At,fragmentShader:kt,defines:x.defines,customVertexShaderID:Bt,customFragmentShaderID:W,isRawShaderMaterial:x.isRawShaderMaterial===!0,glslVersion:x.glslVersion,precision:u,batching:vt,batchingColor:vt&&N._colorsTexture!==null,instancing:Ft,instancingColor:Ft&&N.instanceColor!==null,instancingMorph:Ft&&N.morphTexture!==null,outputColorSpace:j===null?i.outputColorSpace:j.isXRRenderTarget===!0?j.texture.colorSpace:re.workingColorSpace,alphaToCoverage:!!x.alphaToCoverage,map:qt,matcap:me,envMap:nt,envMapMode:nt&&tt.mapping,envMapCubeUVHeight:Z,aoMap:rt,lightMap:ot,bumpMap:lt,normalMap:dt,displacementMap:Vt,emissiveMap:Ot,normalMapObjectSpace:dt&&x.normalMapType===Zu,normalMapTangentSpace:dt&&x.normalMapType===aa,packedNormalMap:dt&&x.normalMapType===aa&&nx(x.normalMap.format),metalnessMap:Yt,roughnessMap:Jt,anisotropy:D,anisotropyMap:K,clearcoat:ue,clearcoatMap:ct,clearcoatNormalMap:ut,clearcoatRoughnessMap:$,dispersion:ie,retroreflection:C,iridescence:y,iridescenceMap:et,iridescenceThicknessMap:pt,sheen:z,sheenColorMap:Lt,sheenRoughnessMap:xt,specularMap:mt,specularColorMap:Dt,specularIntensityMap:Gt,transmission:V,transmissionMap:jt,thicknessMap:O,gradientMap:gt,opaque:x.transparent===!1&&x.blending===Gs&&x.alphaToCoverage===!1,alphaMap:Q,alphaTest:_t,alphaHash:Et,combine:x.combine,mapUv:qt&&g(x.map.channel),aoMapUv:rt&&g(x.aoMap.channel),lightMapUv:ot&&g(x.lightMap.channel),bumpMapUv:lt&&g(x.bumpMap.channel),normalMapUv:dt&&g(x.normalMap.channel),displacementMapUv:Vt&&g(x.displacementMap.channel),emissiveMapUv:Ot&&g(x.emissiveMap.channel),metalnessMapUv:Yt&&g(x.metalnessMap.channel),roughnessMapUv:Jt&&g(x.roughnessMap.channel),anisotropyMapUv:K&&g(x.anisotropyMap.channel),clearcoatMapUv:ct&&g(x.clearcoatMap.channel),clearcoatNormalMapUv:ut&&g(x.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:$&&g(x.clearcoatRoughnessMap.channel),iridescenceMapUv:et&&g(x.iridescenceMap.channel),iridescenceThicknessMapUv:pt&&g(x.iridescenceThicknessMap.channel),sheenColorMapUv:Lt&&g(x.sheenColorMap.channel),sheenRoughnessMapUv:xt&&g(x.sheenRoughnessMap.channel),specularMapUv:mt&&g(x.specularMap.channel),specularColorMapUv:Dt&&g(x.specularColorMap.channel),specularIntensityMapUv:Gt&&g(x.specularIntensityMap.channel),transmissionMapUv:jt&&g(x.transmissionMap.channel),thicknessMapUv:O&&g(x.thicknessMap.channel),alphaMapUv:Q&&g(x.alphaMap.channel),vertexTangents:!!B.attributes.tangent&&(dt||D),vertexNormals:!!B.attributes.normal,vertexColors:x.vertexColors,vertexAlphas:x.vertexColors===!0&&!!B.attributes.color&&B.attributes.color.itemSize===4,pointsUvs:N.isPoints===!0&&!!B.attributes.uv&&(qt||Q),fog:!!L,useFog:x.fog===!0,fogExp2:!!L&&L.isFogExp2,flatShading:x.wireframe===!1&&(x.flatShading===!0||B.attributes.normal===void 0&&dt===!1&&(x.isMeshLambertMaterial||x.isMeshPhongMaterial||x.isMeshStandardMaterial||x.isMeshPhysicalMaterial)),sizeAttenuation:x.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:ht,skinning:N.isSkinnedMesh===!0,hasPositionAttribute:B.attributes.position!==void 0,morphTargets:B.morphAttributes.position!==void 0,morphNormals:B.morphAttributes.normal!==void 0,morphColors:B.morphAttributes.color!==void 0,morphTargetsCount:ft,morphTextureStride:bt,numSunLights:w.sun.length,numDirLights:w.directional.length,numPointLights:w.point.length,numSpotLights:w.spot.length,numSpotLightMaps:w.spotLightMap.length,numRectAreaLights:w.rectArea.length,numHemiLights:w.hemi.length,numSunLightShadows:w.sunShadowMap.length,numDirLightShadows:w.directionalShadowMap.length,numPointLightShadows:w.pointShadowMap.length,numSpotLightShadows:w.spotShadowMap.length,numSpotLightShadowsWithMaps:w.numSpotLightShadowsWithMaps,numLightProbes:w.numLightProbes,numLightProbeGrids:F.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:x.dithering,shadowMapEnabled:i.shadowMap.enabled&&R.length>0,shadowMapType:i.shadowMap.type,toneMapping:Ut,decodeVideoTexture:qt&&x.map.isVideoTexture===!0&&re.getTransfer(x.map.colorSpace)===pe,decodeVideoTextureEmissive:Ot&&x.emissiveMap.isVideoTexture===!0&&re.getTransfer(x.emissiveMap.colorSpace)===pe,premultipliedAlpha:x.premultipliedAlpha,doubleSided:x.side===Ee,flipSided:x.side===Ne,useDepthPacking:x.depthPacking>=0,depthPacking:x.depthPacking||0,index0AttributeName:x.index0AttributeName,extensionClipCullDistance:st&&x.extensions.clipCullDistance===!0&&e.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(st&&x.extensions.multiDraw===!0||vt)&&e.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:e.has("KHR_parallel_shader_compile"),customProgramCacheKey:x.customProgramCacheKey()};return Pt.vertexUv1s=l.has(1),Pt.vertexUv2s=l.has(2),Pt.vertexUv3s=l.has(3),l.clear(),Pt}function m(x){let w=[];if(x.shaderID?w.push(x.shaderID):(w.push(x.customVertexShaderID),w.push(x.customFragmentShaderID)),x.defines!==void 0)for(let R in x.defines)w.push(R),w.push(x.defines[R]);return x.isRawShaderMaterial===!1&&(f(w,x),M(w,x),w.push(i.outputColorSpace)),w.push(x.customProgramCacheKey),w.join()}function f(x,w){x.push(w.precision),x.push(w.outputColorSpace),x.push(w.envMapMode),x.push(w.envMapCubeUVHeight),x.push(w.mapUv),x.push(w.alphaMapUv),x.push(w.lightMapUv),x.push(w.aoMapUv),x.push(w.bumpMapUv),x.push(w.normalMapUv),x.push(w.displacementMapUv),x.push(w.emissiveMapUv),x.push(w.metalnessMapUv),x.push(w.roughnessMapUv),x.push(w.anisotropyMapUv),x.push(w.clearcoatMapUv),x.push(w.clearcoatNormalMapUv),x.push(w.clearcoatRoughnessMapUv),x.push(w.iridescenceMapUv),x.push(w.iridescenceThicknessMapUv),x.push(w.sheenColorMapUv),x.push(w.sheenRoughnessMapUv),x.push(w.specularMapUv),x.push(w.specularColorMapUv),x.push(w.specularIntensityMapUv),x.push(w.transmissionMapUv),x.push(w.thicknessMapUv),x.push(w.combine),x.push(w.fogExp2),x.push(w.sizeAttenuation),x.push(w.morphTargetsCount),x.push(w.morphAttributeCount),x.push(w.numSunLights),x.push(w.numDirLights),x.push(w.numPointLights),x.push(w.numSpotLights),x.push(w.numSpotLightMaps),x.push(w.numHemiLights),x.push(w.numRectAreaLights),x.push(w.numSunLightShadows),x.push(w.numDirLightShadows),x.push(w.numPointLightShadows),x.push(w.numSpotLightShadows),x.push(w.numSpotLightShadowsWithMaps),x.push(w.numLightProbes),x.push(w.shadowMapType),x.push(w.toneMapping),x.push(w.numClippingPlanes),x.push(w.numClipIntersection),x.push(w.depthPacking)}function M(x,w){a.disableAll(),w.instancing&&a.enable(0),w.instancingColor&&a.enable(1),w.instancingMorph&&a.enable(2),w.matcap&&a.enable(3),w.envMap&&a.enable(4),w.normalMapObjectSpace&&a.enable(5),w.normalMapTangentSpace&&a.enable(6),w.clearcoat&&a.enable(7),w.iridescence&&a.enable(8),w.alphaTest&&a.enable(9),w.vertexColors&&a.enable(10),w.vertexAlphas&&a.enable(11),w.vertexUv1s&&a.enable(12),w.vertexUv2s&&a.enable(13),w.vertexUv3s&&a.enable(14),w.vertexTangents&&a.enable(15),w.anisotropy&&a.enable(16),w.alphaHash&&a.enable(17),w.batching&&a.enable(18),w.dispersion&&a.enable(19),w.retroreflection&&a.enable(24),w.batchingColor&&a.enable(20),w.gradientMap&&a.enable(21),w.packedNormalMap&&a.enable(22),w.vertexNormals&&a.enable(23),x.push(a.mask),a.disableAll(),w.fog&&a.enable(0),w.useFog&&a.enable(1),w.flatShading&&a.enable(2),w.logarithmicDepthBuffer&&a.enable(3),w.reversedDepthBuffer&&a.enable(4),w.skinning&&a.enable(5),w.morphTargets&&a.enable(6),w.morphNormals&&a.enable(7),w.morphColors&&a.enable(8),w.premultipliedAlpha&&a.enable(9),w.shadowMapEnabled&&a.enable(10),w.doubleSided&&a.enable(11),w.flipSided&&a.enable(12),w.useDepthPacking&&a.enable(13),w.dithering&&a.enable(14),w.transmission&&a.enable(15),w.sheen&&a.enable(16),w.opaque&&a.enable(17),w.pointsUvs&&a.enable(18),w.decodeVideoTexture&&a.enable(19),w.decodeVideoTextureEmissive&&a.enable(20),w.alphaToCoverage&&a.enable(21),w.numLightProbeGrids>0&&a.enable(22),w.hasPositionAttribute&&a.enable(23),x.push(a.mask)}function T(x){let w=p[x.type],R;if(w){let I=Yn[w];R=dd.clone(I.uniforms)}else R=x.uniforms;return R}function _(x,w){let R=h.get(w);return R!==void 0?++R.usedTimes:(R=new tx(i,w,x,s),c.push(R),h.set(w,R)),R}function b(x){if(--x.usedTimes===0){let w=c.indexOf(x);c[w]=c[c.length-1],c.pop(),h.delete(x.cacheKey),x.destroy()}}function v(x){o.remove(x)}function A(){o.dispose()}return{getParameters:S,getProgramCacheKey:m,getUniforms:T,acquireProgram:_,releaseProgram:b,releaseShaderCache:v,programs:c,dispose:A}}function sx(){let i=new WeakMap;function t(a){return i.has(a)}function e(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function n(a){i.delete(a)}function s(a,o,l){i.get(a)[o]=l}function r(){i=new WeakMap}return{has:t,get:e,remove:n,update:s,dispose:r}}function rx(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.material.id!==t.material.id?i.material.id-t.material.id:i.materialVariant!==t.materialVariant?i.materialVariant-t.materialVariant:i.z!==t.z?i.z-t.z:i.id-t.id}function Ld(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.z!==t.z?t.z-i.z:i.id-t.id}function Dd(){let i=[],t=0,e=[],n=[],s=[];function r(){t=0,e.length=0,n.length=0,s.length=0}function a(u){let p=0;return u.isInstancedMesh&&(p+=2),u.isSkinnedMesh&&(p+=1),p}function o(u,p,g,S,m,f){let M=i[t];return M===void 0?(M={id:u.id,object:u,geometry:p,material:g,materialVariant:a(u),groupOrder:S,renderOrder:u.renderOrder,z:m,group:f},i[t]=M):(M.id=u.id,M.object=u,M.geometry=p,M.material=g,M.materialVariant=a(u),M.groupOrder=S,M.renderOrder=u.renderOrder,M.z=m,M.group=f),t++,M}function l(u,p,g,S,m,f,M){M.reversedDepth===!0&&(m=-m);let T=o(u,p,g,S,m,f);g.transmission>0?n.push(T):g.transparent===!0?s.push(T):e.push(T)}function c(u,p,g,S,m,f){let M=o(u,p,g,S,m,f);g.transmission>0?n.unshift(M):g.transparent===!0?s.unshift(M):e.unshift(M)}function h(u,p){e.length>1&&e.sort(u||rx),n.length>1&&n.sort(p||Ld),s.length>1&&s.sort(p||Ld)}function d(){for(let u=t,p=i.length;u<p;u++){let g=i[u];if(g.id===null)break;g.id=null,g.object=null,g.geometry=null,g.material=null,g.group=null}}return{opaque:e,transmissive:n,transparent:s,init:r,push:l,unshift:c,finish:d,sort:h}}function ax(){let i=new WeakMap;function t(n,s){let r=i.get(n),a;return r===void 0?(a=new Dd,i.set(n,[a])):s>=r.length?(a=new Dd,r.push(a)):a=r[s],a}function e(){i=new WeakMap}return{get:t,dispose:e}}function ox(){let i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={direction:new P,color:new Nt};break;case"SpotLight":e={position:new P,direction:new P,color:new Nt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new P,color:new Nt,distance:0,decay:0};break;case"HemisphereLight":e={direction:new P,skyColor:new Nt,groundColor:new Nt};break;case"RectAreaLight":e={color:new Nt,position:new P,halfWidth:new P,halfHeight:new P};break}return i[t.id]=e,e}}}function lx(){let i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new it};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new it};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new it,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[t.id]=e,e}}}var cx=0;function hx(i,t){return(t.castShadow?2:0)-(i.castShadow?2:0)+(t.map?1:0)-(i.map?1:0)}function ux(i){let t=new ox,e=lx(),n={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new P);let s=new P,r=new ce,a=new ce;function o(c){let h=0,d=0,u=0;for(let N=0;N<9;N++)n.probe[N].set(0,0,0);let p=0,g=0,S=0,m=0,f=0,M=0,T=0,_=0,b=0,v=0,A=0,x=0,w=0,R=0;c.sort(hx);for(let N=0,F=c.length;N<F;N++){let L=c[N],B=L.color,X=L.intensity,G=L.distance,tt=null;if(L.shadow&&L.shadow.map&&(L.shadow.map.texture.format===Ui?tt=L.shadow.map.texture:tt=L.shadow.map.depthTexture||L.shadow.map.texture),L.isAmbientLight)h+=B.r*X,d+=B.g*X,u+=B.b*X;else if(L.isLightProbe){for(let Z=0;Z<9;Z++)n.probe[Z].addScaledVector(L.sh.coefficients[Z],X);R++}else if(L.isSunLight){let Z=t.get(L);if(Z.color.copy(L.color).multiplyScalar(L.intensity),L.castShadow){let J=L.shadow,Y=e.get(L);Y.shadowIntensity=J.intensity,Y.shadowBias=J.bias,Y.shadowNormalBias=J.normalBias,Y.shadowRadius=J.radius,Y.shadowMapSize.copy(J.mapSize).multiply(J.getFrameExtents()),n.sunShadow[g]=Y,n.sunShadowMap[g]=tt;let ft=J.getViewportCount();for(let bt=0;bt<ft;bt++)n.sunShadowMatrix[S+bt]=J.getMatrix(bt),n.sunShadowCascade[S+bt]=J._cascadeData[bt];S+=ft,g++}n.sun[p]=Z,p++}else if(L.isDirectionalLight){let Z=t.get(L);if(Z.color.copy(L.color).multiplyScalar(L.intensity),L.castShadow){let J=L.shadow,Y=e.get(L);Y.shadowIntensity=J.intensity,Y.shadowBias=J.bias,Y.shadowNormalBias=J.normalBias,Y.shadowRadius=J.radius,Y.shadowMapSize=J.mapSize,n.directionalShadow[m]=Y,n.directionalShadowMap[m]=tt,n.directionalShadowMatrix[m]=L.shadow.matrix,b++}n.directional[m]=Z,m++}else if(L.isSpotLight){let Z=t.get(L);Z.position.setFromMatrixPosition(L.matrixWorld),Z.color.copy(B).multiplyScalar(X),Z.distance=G,Z.coneCos=Math.cos(L.angle),Z.penumbraCos=Math.cos(L.angle*(1-L.penumbra)),Z.decay=L.decay,n.spot[M]=Z;let J=L.shadow;if(L.map&&(n.spotLightMap[x]=L.map,x++,J.updateMatrices(L),L.castShadow&&w++),n.spotLightMatrix[M]=J.matrix,L.castShadow){let Y=e.get(L);Y.shadowIntensity=J.intensity,Y.shadowBias=J.bias,Y.shadowNormalBias=J.normalBias,Y.shadowRadius=J.radius,Y.shadowMapSize=J.mapSize,n.spotShadow[M]=Y,n.spotShadowMap[M]=tt,A++}M++}else if(L.isRectAreaLight){let Z=t.get(L);Z.color.copy(B).multiplyScalar(X),Z.halfWidth.set(L.width*.5,0,0),Z.halfHeight.set(0,L.height*.5,0),n.rectArea[T]=Z,T++}else if(L.isPointLight){let Z=t.get(L);if(Z.color.copy(L.color).multiplyScalar(L.intensity),Z.distance=L.distance,Z.decay=L.decay,L.castShadow){let J=L.shadow,Y=e.get(L);Y.shadowIntensity=J.intensity,Y.shadowBias=J.bias,Y.shadowNormalBias=J.normalBias,Y.shadowRadius=J.radius,Y.shadowMapSize=J.mapSize,Y.shadowCameraNear=J.camera.near,Y.shadowCameraFar=J.camera.far,n.pointShadow[f]=Y,n.pointShadowMap[f]=tt,n.pointShadowMatrix[f]=L.shadow.matrix,v++}n.point[f]=Z,f++}else if(L.isHemisphereLight){let Z=t.get(L);Z.skyColor.copy(L.color).multiplyScalar(X),Z.groundColor.copy(L.groundColor).multiplyScalar(X),n.hemi[_]=Z,_++}}T>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=yt.LTC_FLOAT_1,n.rectAreaLTC2=yt.LTC_FLOAT_2):(n.rectAreaLTC1=yt.LTC_HALF_1,n.rectAreaLTC2=yt.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=d,n.ambient[2]=u;let I=n.hash;(I.sunLength!==p||I.directionalLength!==m||I.pointLength!==f||I.spotLength!==M||I.rectAreaLength!==T||I.hemiLength!==_||I.numSunShadows!==g||I.numDirectionalShadows!==b||I.numPointShadows!==v||I.numSpotShadows!==A||I.numSpotMaps!==x||I.numLightProbes!==R)&&(n.sun.length=p,n.directional.length=m,n.spot.length=M,n.rectArea.length=T,n.point.length=f,n.hemi.length=_,n.sunShadow.length=g,n.sunShadowMap.length=g,n.sunShadowMatrix.length=S,n.sunShadowCascade.length=S,n.directionalShadow.length=b,n.directionalShadowMap.length=b,n.directionalShadowMatrix.length=b,n.pointShadow.length=v,n.pointShadowMap.length=v,n.pointShadowMatrix.length=v,n.spotShadow.length=A,n.spotShadowMap.length=A,n.spotLightMatrix.length=A+x-w,n.spotLightMap.length=x,n.numSpotLightShadowsWithMaps=w,n.numLightProbes=R,I.sunLength=p,I.directionalLength=m,I.pointLength=f,I.spotLength=M,I.rectAreaLength=T,I.hemiLength=_,I.numSunShadows=g,I.numDirectionalShadows=b,I.numPointShadows=v,I.numSpotShadows=A,I.numSpotMaps=x,I.numLightProbes=R,n.version=cx++)}function l(c,h){let d=0,u=0,p=0,g=0,S=0,m=0,f=h.matrixWorldInverse;for(let M=0,T=c.length;M<T;M++){let _=c[M];if(_.isSunLight){let b=n.sun[d];b.direction.setFromMatrixPosition(_.matrixWorld),b.direction.transformDirection(f),d++}else if(_.isDirectionalLight){let b=n.directional[u];b.direction.setFromMatrixPosition(_.matrixWorld),s.setFromMatrixPosition(_.target.matrixWorld),b.direction.sub(s),b.direction.transformDirection(f),u++}else if(_.isSpotLight){let b=n.spot[g];b.position.setFromMatrixPosition(_.matrixWorld),b.position.applyMatrix4(f),b.direction.setFromMatrixPosition(_.matrixWorld),s.setFromMatrixPosition(_.target.matrixWorld),b.direction.sub(s),b.direction.transformDirection(f),g++}else if(_.isRectAreaLight){let b=n.rectArea[S];b.position.setFromMatrixPosition(_.matrixWorld),b.position.applyMatrix4(f),a.identity(),r.copy(_.matrixWorld),r.premultiply(f),a.extractRotation(r),b.halfWidth.set(_.width*.5,0,0),b.halfHeight.set(0,_.height*.5,0),b.halfWidth.applyMatrix4(a),b.halfHeight.applyMatrix4(a),S++}else if(_.isPointLight){let b=n.point[p];b.position.setFromMatrixPosition(_.matrixWorld),b.position.applyMatrix4(f),p++}else if(_.isHemisphereLight){let b=n.hemi[m];b.direction.setFromMatrixPosition(_.matrixWorld),b.direction.transformDirection(f),m++}}}return{setup:o,setupView:l,state:n}}function Nd(i){let t=new ux(i),e=[],n=[],s=[];function r(u){d.camera=u,e.length=0,n.length=0,s.length=0}function a(u){e.push(u)}function o(u){n.push(u)}function l(u){s.push(u)}function c(){t.setup(e)}function h(u){t.setupView(e,u)}let d={lightsArray:e,shadowsArray:n,lightProbeGridArray:s,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:d,setupLights:c,setupLightsView:h,pushLight:a,pushShadow:o,pushLightProbeGrid:l}}function dx(i){let t=new WeakMap;function e(s,r=0){let a=t.get(s),o;return a===void 0?(o=new Nd(i),t.set(s,[o])):r>=a.length?(o=new Nd(i),a.push(o)):o=a[r],o}function n(){t=new WeakMap}return{get:e,dispose:n}}var fx=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,px=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,mx=[new P(1,0,0),new P(-1,0,0),new P(0,1,0),new P(0,-1,0),new P(0,0,1),new P(0,0,-1)],gx=[new P(0,-1,0),new P(0,-1,0),new P(0,0,1),new P(0,0,-1),new P(0,-1,0),new P(0,-1,0)],Ud=new ce,ca=new P,uh=new P;function _x(i,t,e){let n=new Us,s=new it,r=new it,a=new Te,o=new _o,l=new xo,c={},h=e.maxTextureSize,d={[Ii]:Ne,[Ne]:Ii,[Ee]:Ee},u=new Ve({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new it},radius:{value:4}},vertexShader:fx,fragmentShader:px}),p=u.clone();p.defines.HORIZONTAL_PASS=1;let g=new ae;g.setAttribute("position",new ke(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let S=new at(g,u),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=$r;let f=this.type;this.render=function(v,A,x){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||v.length===0)return;this.type===Do&&(zt("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=$r);let w=i.getRenderTarget(),R=i.getActiveCubeFace(),I=i.getActiveMipmapLevel(),N=i.state;N.setBlending(Xn),N.buffers.depth.getReversed()===!0?N.buffers.color.setClear(0,0,0,0):N.buffers.color.setClear(1,1,1,1),N.buffers.depth.setTest(!0),N.setScissorTest(!1);let F=f!==this.type;F&&A.traverse(function(L){L.material&&(Array.isArray(L.material)?L.material.forEach(B=>B.needsUpdate=!0):L.material.needsUpdate=!0)});for(let L=0,B=v.length;L<B;L++){let X=v[L],G=X.shadow;if(G===void 0){zt("WebGLShadowMap:",X,"has no shadow.");continue}if(G.autoUpdate===!1&&G.needsUpdate===!1)continue;s.copy(G.mapSize);let tt=G.getFrameExtents();s.multiply(tt),r.copy(G.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/tt.x),s.x=r.x*tt.x,G.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/tt.y),s.y=r.y*tt.y,G.mapSize.y=r.y));let Z=i.state.buffers.depth.getReversed();if(G.camera._reversedDepth=Z,G.map===null||F===!0){if(G.map!==null&&(G.map.depthTexture!==null&&(G.map.depthTexture.dispose(),G.map.depthTexture=null),G.map.dispose()),this.type===Vs){if(X.isPointLight){zt("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}G.map=new rn(s.x,s.y,{format:Ui,type:Nn,minFilter:Xe,magFilter:Xe,generateMipmaps:!1}),G.map.texture.name=X.name+".shadowMap",G.map.depthTexture=new Si(s.x,s.y,yn),G.map.depthTexture.name=X.name+".shadowMapDepth",G.map.depthTexture.format=kn,G.map.depthTexture.compareFunction=null,G.map.depthTexture.minFilter=He,G.map.depthTexture.magFilter=He}else X.isPointLight?(G.map=new Tl(s.x),G.map.depthTexture=new lo(s.x,Dn)):(G.map=new rn(s.x,s.y),G.map.depthTexture=new Si(s.x,s.y,Dn)),G.map.depthTexture.name=X.name+".shadowMap",G.map.depthTexture.format=kn,this.type===$r?(G.map.depthTexture.compareFunction=Z?Sl:Ml,G.map.depthTexture.minFilter=Xe,G.map.depthTexture.magFilter=Xe):(G.map.depthTexture.compareFunction=null,G.map.depthTexture.minFilter=He,G.map.depthTexture.magFilter=He);G.camera.updateProjectionMatrix()}G.map.isWebGLCubeRenderTarget!==!0&&(G.map.width!==s.x||G.map.height!==s.y)&&G.map.setSize(s.x,s.y);let J=G.map.isWebGLCubeRenderTarget?6:G.getViewportCount();X.isPointLight!==!0&&G.updateMatrices(X,x);for(let Y=0;Y<J;Y++){let ft=G.getCamera(Y);if(X.isPointLight){let bt=G.camera,At=G.matrix,kt=X.distance||bt.far;kt!==bt.far&&(bt.far=kt,bt.updateProjectionMatrix()),ca.setFromMatrixPosition(X.matrixWorld),bt.position.copy(ca),uh.copy(bt.position),uh.add(mx[Y]),bt.up.copy(gx[Y]),bt.lookAt(uh),bt.updateMatrixWorld(),At.makeTranslation(-ca.x,-ca.y,-ca.z),Ud.multiplyMatrices(bt.projectionMatrix,bt.matrixWorldInverse),G._frustum.setFromProjectionMatrix(Ud,bt.coordinateSystem,bt.reversedDepth)}if(G.map.isWebGLCubeRenderTarget)i.setRenderTarget(G.map,Y),i.clear();else{Y===0&&(i.setRenderTarget(G.map),i.clear());let bt=G.getViewport(Y);a.set(r.x*bt.x,r.y*bt.y,r.x*bt.z,r.y*bt.w),N.viewport(a)}n=G.getFrustum(Y),_(A,x,ft,X,this.type)}G.isPointLightShadow!==!0&&this.type===Vs&&M(G,x),G.needsUpdate=!1}f=this.type,m.needsUpdate=!1,i.setRenderTarget(w,R,I)};function M(v,A){let x=t.update(S);u.defines.VSM_SAMPLES!==v.blurSamples&&(u.defines.VSM_SAMPLES=v.blurSamples,p.defines.VSM_SAMPLES=v.blurSamples,u.needsUpdate=!0,p.needsUpdate=!0),v.mapPass===null?v.mapPass=new rn(s.x,s.y,{format:Ui,type:Nn}):(v.mapPass.width!==v.map.width||v.mapPass.height!==v.map.height)&&v.mapPass.setSize(v.map.width,v.map.height),u.uniforms.shadow_pass.value=v.map.depthTexture,u.uniforms.resolution.value.set(v.map.width,v.map.height),u.uniforms.radius.value=v.radius,i.setRenderTarget(v.mapPass),i.clear(),i.renderBufferDirect(A,null,x,u,S,null),p.uniforms.shadow_pass.value=v.mapPass.texture,p.uniforms.resolution.value.set(v.map.width,v.map.height),p.uniforms.radius.value=v.radius,i.setRenderTarget(v.map),i.clear(),i.renderBufferDirect(A,null,x,p,S,null)}function T(v,A,x,w){let R=null,I=x.isPointLight===!0?v.customDistanceMaterial:v.customDepthMaterial;if(I!==void 0)R=I;else if(R=x.isPointLight===!0?l:o,i.localClippingEnabled&&A.clipShadows===!0&&Array.isArray(A.clippingPlanes)&&A.clippingPlanes.length!==0||A.displacementMap&&A.displacementScale!==0||A.alphaMap&&A.alphaTest>0||A.map&&A.alphaTest>0||A.alphaToCoverage===!0){let N=R.uuid,F=A.uuid,L=c[N];L===void 0&&(L={},c[N]=L);let B=L[F];B===void 0&&(B=R.clone(),L[F]=B,A.addEventListener("dispose",b)),R=B}if(R.visible=A.visible,R.wireframe=A.wireframe,w===Vs?R.side=A.shadowSide!==null?A.shadowSide:A.side:R.side=A.shadowSide!==null?A.shadowSide:d[A.side],R.alphaMap=A.alphaMap,R.alphaTest=A.alphaToCoverage===!0?.5:A.alphaTest,R.map=A.map,R.clipShadows=A.clipShadows,R.clippingPlanes=A.clippingPlanes,R.clipIntersection=A.clipIntersection,R.displacementMap=A.displacementMap,R.displacementScale=A.displacementScale,R.displacementBias=A.displacementBias,R.wireframeLinewidth=A.wireframeLinewidth,R.linewidth=A.linewidth,x.isPointLight===!0&&R.isMeshDistanceMaterial===!0){let N=i.properties.get(R);N.light=x}return R}function _(v,A,x,w,R){if(v.visible===!1)return;if(v.layers.test(A.layers)&&(v.isMesh||v.isLine||v.isPoints)&&(v.castShadow||v.receiveShadow&&R===Vs)&&(!v.frustumCulled||v.intersectsFrustum(n))){v.modelViewMatrix.multiplyMatrices(x.matrixWorldInverse,v.matrixWorld);let F=t.update(v),L=v.material;if(Array.isArray(L)){let B=F.groups;for(let X=0,G=B.length;X<G;X++){let tt=B[X],Z=L[tt.materialIndex];if(Z&&Z.visible){let J=T(v,Z,w,R);v.onBeforeShadow(i,v,A,x,F,J,tt),i.renderBufferDirect(x,null,F,J,v,tt),v.onAfterShadow(i,v,A,x,F,J,tt)}}}else if(L.visible){let B=T(v,L,w,R);v.onBeforeShadow(i,v,A,x,F,B,null),i.renderBufferDirect(x,null,F,B,v,null),v.onAfterShadow(i,v,A,x,F,B,null)}}let N=v.children;for(let F=0,L=N.length;F<L;F++)_(N[F],A,x,w,R)}function b(v){v.target.removeEventListener("dispose",b);for(let x in c){let w=c[x],R=v.target.uuid;R in w&&(w[R].dispose(),delete w[R])}}}function xx(i,t){function e(){let O=!1,gt=new Te,Q=null,_t=new Te(0,0,0,0);return{setMask:function(Et){Q!==Et&&!O&&(i.colorMask(Et,Et,Et,Et),Q=Et)},setLocked:function(Et){O=Et},setClear:function(Et,st,Ut,Pt,ve){ve===!0&&(Et*=Pt,st*=Pt,Ut*=Pt),gt.set(Et,st,Ut,Pt),_t.equals(gt)===!1&&(i.clearColor(Et,st,Ut,Pt),_t.copy(gt))},reset:function(){O=!1,Q=null,_t.set(-1,0,0,0)}}}function n(){let O=!1,gt=!1,Q=null,_t=null,Et=null;return{setReversed:function(st){if(gt!==st){let Ut=t.get("EXT_clip_control");st?Ut.clipControlEXT(Ut.LOWER_LEFT_EXT,Ut.ZERO_TO_ONE_EXT):Ut.clipControlEXT(Ut.LOWER_LEFT_EXT,Ut.NEGATIVE_ONE_TO_ONE_EXT),gt=st;let Pt=Et;Et=null,this.setClear(Pt)}},getReversed:function(){return gt},setTest:function(st){st?j(i.DEPTH_TEST):ht(i.DEPTH_TEST)},setMask:function(st){Q!==st&&!O&&(i.depthMask(st),Q=st)},setFunc:function(st){if(gt&&(st=rd[st]),_t!==st){switch(st){case Ya:i.depthFunc(i.NEVER);break;case Za:i.depthFunc(i.ALWAYS);break;case Ja:i.depthFunc(i.LESS);break;case Rs:i.depthFunc(i.LEQUAL);break;case Ka:i.depthFunc(i.EQUAL);break;case $a:i.depthFunc(i.GEQUAL);break;case ja:i.depthFunc(i.GREATER);break;case Qa:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}_t=st}},setLocked:function(st){O=st},setClear:function(st){Et!==st&&(Et=st,gt&&(st=1-st),i.clearDepth(st))},reset:function(){O=!1,Q=null,_t=null,Et=null,gt=!1}}}function s(){let O=!1,gt=null,Q=null,_t=null,Et=null,st=null,Ut=null,Pt=null,ve=null;return{setTest:function(de){O||(de?j(i.STENCIL_TEST):ht(i.STENCIL_TEST))},setMask:function(de){gt!==de&&!O&&(i.stencilMask(de),gt=de)},setFunc:function(de,Sn,Un){(Q!==de||_t!==Sn||Et!==Un)&&(i.stencilFunc(de,Sn,Un),Q=de,_t=Sn,Et=Un)},setOp:function(de,Sn,Un){(st!==de||Ut!==Sn||Pt!==Un)&&(i.stencilOp(de,Sn,Un),st=de,Ut=Sn,Pt=Un)},setLocked:function(de){O=de},setClear:function(de){ve!==de&&(i.clearStencil(de),ve=de)},reset:function(){O=!1,gt=null,Q=null,_t=null,Et=null,st=null,Ut=null,Pt=null,ve=null}}}let r=new e,a=new n,o=new s,l=new WeakMap,c=new WeakMap,h={},d={},u={},p=new WeakMap,g=[],S=null,m=!1,f=null,M=null,T=null,_=null,b=null,v=null,A=null,x=new Nt(0,0,0),w=0,R=!1,I=null,N=null,F=null,L=null,B=null,X=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),G=!1,tt=0,Z=i.getParameter(i.VERSION);Z.indexOf("WebGL")!==-1?(tt=parseFloat(/^WebGL (\d)/.exec(Z)[1]),G=tt>=1):Z.indexOf("OpenGL ES")!==-1&&(tt=parseFloat(/^OpenGL ES (\d)/.exec(Z)[1]),G=tt>=2);let J=null,Y={},ft=i.getParameter(i.SCISSOR_BOX),bt=i.getParameter(i.VIEWPORT),At=new Te().fromArray(ft),kt=new Te().fromArray(bt);function Bt(O,gt,Q,_t){let Et=new Uint8Array(4),st=i.createTexture();i.bindTexture(O,st),i.texParameteri(O,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(O,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Ut=0;Ut<Q;Ut++)O===i.TEXTURE_3D||O===i.TEXTURE_2D_ARRAY?i.texImage3D(gt,0,i.RGBA,1,1,_t,0,i.RGBA,i.UNSIGNED_BYTE,Et):i.texImage2D(gt+Ut,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,Et);return st}let W={};W[i.TEXTURE_2D]=Bt(i.TEXTURE_2D,i.TEXTURE_2D,1),W[i.TEXTURE_CUBE_MAP]=Bt(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),W[i.TEXTURE_2D_ARRAY]=Bt(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),W[i.TEXTURE_3D]=Bt(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),j(i.DEPTH_TEST),a.setFunc(Rs),lt(!1),dt(Rc),j(i.CULL_FACE),rt(Xn);function j(O){h[O]!==!0&&(i.enable(O),h[O]=!0)}function ht(O){h[O]!==!1&&(i.disable(O),h[O]=!1)}function Ft(O,gt){return u[O]!==gt?(i.bindFramebuffer(O,gt),u[O]=gt,O===i.DRAW_FRAMEBUFFER&&(u[i.FRAMEBUFFER]=gt),O===i.FRAMEBUFFER&&(u[i.DRAW_FRAMEBUFFER]=gt),!0):!1}function vt(O,gt){let Q=g,_t=!1;if(O){Q=p.get(gt),Q===void 0&&(Q=[],p.set(gt,Q));let Et=O.textures;if(Q.length!==Et.length||Q[0]!==i.COLOR_ATTACHMENT0){for(let st=0,Ut=Et.length;st<Ut;st++)Q[st]=i.COLOR_ATTACHMENT0+st;Q.length=Et.length,_t=!0}}else Q[0]!==i.BACK&&(Q[0]=i.BACK,_t=!0);_t&&i.drawBuffers(Q)}function qt(O){return S!==O?(i.useProgram(O),S=O,!0):!1}let me={[es]:i.FUNC_ADD,[Au]:i.FUNC_SUBTRACT,[Ru]:i.FUNC_REVERSE_SUBTRACT};me[Cu]=i.MIN,me[Pu]=i.MAX;let nt={[Iu]:i.ZERO,[Lu]:i.ONE,[Du]:i.SRC_COLOR,[Ic]:i.SRC_ALPHA,[zu]:i.SRC_ALPHA_SATURATE,[Ou]:i.DST_COLOR,[Uu]:i.DST_ALPHA,[Nu]:i.ONE_MINUS_SRC_COLOR,[Lc]:i.ONE_MINUS_SRC_ALPHA,[Bu]:i.ONE_MINUS_DST_COLOR,[Fu]:i.ONE_MINUS_DST_ALPHA,[ku]:i.CONSTANT_COLOR,[Hu]:i.ONE_MINUS_CONSTANT_COLOR,[Vu]:i.CONSTANT_ALPHA,[Gu]:i.ONE_MINUS_CONSTANT_ALPHA};function rt(O,gt,Q,_t,Et,st,Ut,Pt,ve,de){if(O===Xn){m===!0&&(ht(i.BLEND),m=!1);return}if(m===!1&&(j(i.BLEND),m=!0),O!==wu){if(O!==f||de!==R){if((M!==es||b!==es)&&(i.blendEquation(i.FUNC_ADD),M=es,b=es),de)switch(O){case Gs:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case ci:i.blendFunc(i.ONE,i.ONE);break;case Cc:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Pc:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:Wt("WebGLState: Invalid blending: ",O);break}else switch(O){case Gs:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case ci:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case Cc:Wt("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Pc:Wt("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Wt("WebGLState: Invalid blending: ",O);break}T=null,_=null,v=null,A=null,x.set(0,0,0),w=0,f=O,R=de}return}Et=Et||gt,st=st||Q,Ut=Ut||_t,(gt!==M||Et!==b)&&(i.blendEquationSeparate(me[gt],me[Et]),M=gt,b=Et),(Q!==T||_t!==_||st!==v||Ut!==A)&&(i.blendFuncSeparate(nt[Q],nt[_t],nt[st],nt[Ut]),T=Q,_=_t,v=st,A=Ut),(Pt.equals(x)===!1||ve!==w)&&(i.blendColor(Pt.r,Pt.g,Pt.b,ve),x.copy(Pt),w=ve),f=O,R=!1}function ot(O,gt){O.side===Ee?ht(i.CULL_FACE):j(i.CULL_FACE);let Q=O.side===Ne;gt&&(Q=!Q),lt(Q),O.blending===Gs&&O.transparent===!1?rt(Xn):rt(O.blending,O.blendEquation,O.blendSrc,O.blendDst,O.blendEquationAlpha,O.blendSrcAlpha,O.blendDstAlpha,O.blendColor,O.blendAlpha,O.premultipliedAlpha),a.setFunc(O.depthFunc),a.setTest(O.depthTest),a.setMask(O.depthWrite),r.setMask(O.colorWrite);let _t=O.stencilWrite;o.setTest(_t),_t&&(o.setMask(O.stencilWriteMask),o.setFunc(O.stencilFunc,O.stencilRef,O.stencilFuncMask),o.setOp(O.stencilFail,O.stencilZFail,O.stencilZPass)),Ot(O.polygonOffset,O.polygonOffsetFactor,O.polygonOffsetUnits),O.alphaToCoverage===!0?j(i.SAMPLE_ALPHA_TO_COVERAGE):ht(i.SAMPLE_ALPHA_TO_COVERAGE)}function lt(O){I!==O&&(O?i.frontFace(i.CW):i.frontFace(i.CCW),I=O)}function dt(O){O!==Eu?(j(i.CULL_FACE),O!==N&&(O===Rc?i.cullFace(i.BACK):O===Tu?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):ht(i.CULL_FACE),N=O}function Vt(O){O!==F&&(G&&i.lineWidth(O),F=O)}function Ot(O,gt,Q){O?(j(i.POLYGON_OFFSET_FILL),(L!==gt||B!==Q)&&(L=gt,B=Q,a.getReversed()&&(gt=-gt),i.polygonOffset(gt,Q))):ht(i.POLYGON_OFFSET_FILL)}function Yt(O){O?j(i.SCISSOR_TEST):ht(i.SCISSOR_TEST)}function Jt(O){O===void 0&&(O=i.TEXTURE0+X-1),J!==O&&(i.activeTexture(O),J=O)}function D(O,gt,Q){Q===void 0&&(J===null?Q=i.TEXTURE0+X-1:Q=J);let _t=Y[Q];_t===void 0&&(_t={type:void 0,texture:void 0},Y[Q]=_t),(_t.type!==O||_t.texture!==gt)&&(J!==Q&&(i.activeTexture(Q),J=Q),i.bindTexture(O,gt||W[O]),_t.type=O,_t.texture=gt)}function ue(){let O=Y[J];O!==void 0&&O.type!==void 0&&(i.bindTexture(O.type,null),O.type=void 0,O.texture=void 0)}function ie(){try{i.compressedTexImage2D(...arguments)}catch(O){Wt("WebGLState:",O)}}function C(){try{i.compressedTexImage3D(...arguments)}catch(O){Wt("WebGLState:",O)}}function y(){try{i.texSubImage2D(...arguments)}catch(O){Wt("WebGLState:",O)}}function z(){try{i.texSubImage3D(...arguments)}catch(O){Wt("WebGLState:",O)}}function V(){try{i.compressedTexSubImage2D(...arguments)}catch(O){Wt("WebGLState:",O)}}function K(){try{i.compressedTexSubImage3D(...arguments)}catch(O){Wt("WebGLState:",O)}}function ct(){try{i.texStorage2D(...arguments)}catch(O){Wt("WebGLState:",O)}}function ut(){try{i.texStorage3D(...arguments)}catch(O){Wt("WebGLState:",O)}}function $(){try{i.texImage2D(...arguments)}catch(O){Wt("WebGLState:",O)}}function et(){try{i.texImage3D(...arguments)}catch(O){Wt("WebGLState:",O)}}function pt(O){return d[O]!==void 0?d[O]:i.getParameter(O)}function Lt(O,gt){d[O]!==gt&&(i.pixelStorei(O,gt),d[O]=gt)}function xt(O){At.equals(O)===!1&&(i.scissor(O.x,O.y,O.z,O.w),At.copy(O))}function mt(O){kt.equals(O)===!1&&(i.viewport(O.x,O.y,O.z,O.w),kt.copy(O))}function Dt(O,gt){let Q=c.get(gt);Q===void 0&&(Q=new WeakMap,c.set(gt,Q));let _t=Q.get(O);_t===void 0&&(_t=i.getUniformBlockIndex(gt,O.name),Q.set(O,_t))}function Gt(O,gt){let _t=c.get(gt).get(O);l.get(gt)!==_t&&(i.uniformBlockBinding(gt,_t,O.__bindingPointIndex),l.set(gt,_t))}function jt(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),a.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),i.pixelStorei(i.PACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.BROWSER_DEFAULT_WEBGL),i.pixelStorei(i.PACK_ROW_LENGTH,0),i.pixelStorei(i.PACK_SKIP_PIXELS,0),i.pixelStorei(i.PACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_ROW_LENGTH,0),i.pixelStorei(i.UNPACK_IMAGE_HEIGHT,0),i.pixelStorei(i.UNPACK_SKIP_PIXELS,0),i.pixelStorei(i.UNPACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_SKIP_IMAGES,0),h={},d={},J=null,Y={},u={},p=new WeakMap,g=[],S=null,m=!1,f=null,M=null,T=null,_=null,b=null,v=null,A=null,x=new Nt(0,0,0),w=0,R=!1,I=null,N=null,F=null,L=null,B=null,At.set(0,0,i.canvas.width,i.canvas.height),kt.set(0,0,i.canvas.width,i.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:j,disable:ht,bindFramebuffer:Ft,drawBuffers:vt,useProgram:qt,setBlending:rt,setMaterial:ot,setFlipSided:lt,setCullFace:dt,setLineWidth:Vt,setPolygonOffset:Ot,setScissorTest:Yt,activeTexture:Jt,bindTexture:D,unbindTexture:ue,compressedTexImage2D:ie,compressedTexImage3D:C,texImage2D:$,texImage3D:et,pixelStorei:Lt,getParameter:pt,updateUBOMapping:Dt,uniformBlockBinding:Gt,texStorage2D:ct,texStorage3D:ut,texSubImage2D:y,texSubImage3D:z,compressedTexSubImage2D:V,compressedTexSubImage3D:K,scissor:xt,viewport:mt,reset:jt}}function yx(i,t,e,n,s,r,a){let o=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new it,h=new WeakMap,d=new Set,u,p=new WeakMap,g=!1;try{g=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function S(C,y){return g?new OffscreenCanvas(C,y):_r("canvas")}function m(C,y,z){let V=1,K=ie(C);if((K.width>z||K.height>z)&&(V=z/Math.max(K.width,K.height)),V<1)if(typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&C instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&C instanceof ImageBitmap||typeof VideoFrame<"u"&&C instanceof VideoFrame){let ct=Math.floor(V*K.width),ut=Math.floor(V*K.height);u===void 0&&(u=S(ct,ut));let $=y?S(ct,ut):u;return $.width=ct,$.height=ut,$.getContext("2d").drawImage(C,0,0,ct,ut),zt("WebGLRenderer: Texture has been resized from ("+K.width+"x"+K.height+") to ("+ct+"x"+ut+")."),$}else return"data"in C&&zt("WebGLRenderer: Image in DataTexture is too big ("+K.width+"x"+K.height+")."),C;return C}function f(C){return C.generateMipmaps}function M(C){i.generateMipmap(C)}function T(C){return C.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:C.isWebGL3DRenderTarget?i.TEXTURE_3D:C.isWebGLArrayRenderTarget||C.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function _(C,y,z,V,K,ct=!1){if(C!==null){if(i[C]!==void 0)return i[C];zt("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+C+"'")}let ut;V&&(ut=t.get("EXT_texture_norm16"),ut||zt("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let $=y;if(y===i.RED&&(z===i.FLOAT&&($=i.R32F),z===i.HALF_FLOAT&&($=i.R16F),z===i.UNSIGNED_BYTE&&($=i.R8),z===i.UNSIGNED_SHORT&&ut&&($=ut.R16_EXT),z===i.SHORT&&ut&&($=ut.R16_SNORM_EXT)),y===i.RED_INTEGER&&(z===i.UNSIGNED_BYTE&&($=i.R8UI),z===i.UNSIGNED_SHORT&&($=i.R16UI),z===i.UNSIGNED_INT&&($=i.R32UI),z===i.BYTE&&($=i.R8I),z===i.SHORT&&($=i.R16I),z===i.INT&&($=i.R32I)),y===i.RG&&(z===i.FLOAT&&($=i.RG32F),z===i.HALF_FLOAT&&($=i.RG16F),z===i.UNSIGNED_BYTE&&($=i.RG8),z===i.UNSIGNED_SHORT&&ut&&($=ut.RG16_EXT),z===i.SHORT&&ut&&($=ut.RG16_SNORM_EXT)),y===i.RG_INTEGER&&(z===i.UNSIGNED_BYTE&&($=i.RG8UI),z===i.UNSIGNED_SHORT&&($=i.RG16UI),z===i.UNSIGNED_INT&&($=i.RG32UI),z===i.BYTE&&($=i.RG8I),z===i.SHORT&&($=i.RG16I),z===i.INT&&($=i.RG32I)),y===i.RGB_INTEGER&&(z===i.UNSIGNED_BYTE&&($=i.RGB8UI),z===i.UNSIGNED_SHORT&&($=i.RGB16UI),z===i.UNSIGNED_INT&&($=i.RGB32UI),z===i.BYTE&&($=i.RGB8I),z===i.SHORT&&($=i.RGB16I),z===i.INT&&($=i.RGB32I)),y===i.RGBA_INTEGER&&(z===i.UNSIGNED_BYTE&&($=i.RGBA8UI),z===i.UNSIGNED_SHORT&&($=i.RGBA16UI),z===i.UNSIGNED_INT&&($=i.RGBA32UI),z===i.BYTE&&($=i.RGBA8I),z===i.SHORT&&($=i.RGBA16I),z===i.INT&&($=i.RGBA32I)),y===i.RGB&&(z===i.UNSIGNED_SHORT&&ut&&($=ut.RGB16_EXT),z===i.SHORT&&ut&&($=ut.RGB16_SNORM_EXT),z===i.UNSIGNED_INT_5_9_9_9_REV&&($=i.RGB9_E5),z===i.UNSIGNED_INT_10F_11F_11F_REV&&($=i.R11F_G11F_B10F)),y===i.RGBA){let et=ct?gr:re.getTransfer(K);z===i.FLOAT&&($=i.RGBA32F),z===i.HALF_FLOAT&&($=i.RGBA16F),z===i.UNSIGNED_BYTE&&($=et===pe?i.SRGB8_ALPHA8:i.RGBA8),z===i.UNSIGNED_SHORT&&ut&&($=ut.RGBA16_EXT),z===i.SHORT&&ut&&($=ut.RGBA16_SNORM_EXT),z===i.UNSIGNED_SHORT_4_4_4_4&&($=i.RGBA4),z===i.UNSIGNED_SHORT_5_5_5_1&&($=i.RGB5_A1)}return($===i.R16F||$===i.R32F||$===i.RG16F||$===i.RG32F||$===i.RGBA16F||$===i.RGBA32F)&&t.get("EXT_color_buffer_float"),$}function b(C,y){let z;return C?y===null||y===Dn||y===Xs?z=i.DEPTH24_STENCIL8:y===yn?z=i.DEPTH32F_STENCIL8:y===Ws&&(z=i.DEPTH24_STENCIL8,zt("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):y===null||y===Dn||y===Xs?z=i.DEPTH_COMPONENT24:y===yn?z=i.DEPTH_COMPONENT32F:y===Ws&&(z=i.DEPTH_COMPONENT16),z}function v(C,y){return f(C)===!0||C.isFramebufferTexture&&C.minFilter!==He&&C.minFilter!==Xe?Math.log2(Math.max(y.width,y.height))+1:C.mipmaps!==void 0&&C.mipmaps.length>0?C.mipmaps.length:C.isCompressedTexture&&Array.isArray(C.image)?y.mipmaps.length:1}function A(C){let y=C.target;y.removeEventListener("dispose",A),w(y),y.isVideoTexture&&h.delete(y),y.isHTMLTexture&&d.delete(y)}function x(C){let y=C.target;y.removeEventListener("dispose",x),I(y)}function w(C){let y=n.get(C);if(y.__webglInit===void 0)return;let z=C.source,V=p.get(z);if(V){let K=V[y.__cacheKey];K.usedTimes--,K.usedTimes===0&&R(C),Object.keys(V).length===0&&p.delete(z)}n.remove(C)}function R(C){let y=n.get(C);i.deleteTexture(y.__webglTexture);let z=C.source,V=p.get(z);delete V[y.__cacheKey],a.memory.textures--}function I(C){let y=n.get(C);if(C.depthTexture&&(C.depthTexture.dispose(),n.remove(C.depthTexture)),C.isWebGLCubeRenderTarget)for(let V=0;V<6;V++){if(Array.isArray(y.__webglFramebuffer[V]))for(let K=0;K<y.__webglFramebuffer[V].length;K++)i.deleteFramebuffer(y.__webglFramebuffer[V][K]);else i.deleteFramebuffer(y.__webglFramebuffer[V]);y.__webglDepthbuffer&&i.deleteRenderbuffer(y.__webglDepthbuffer[V])}else{if(Array.isArray(y.__webglFramebuffer))for(let V=0;V<y.__webglFramebuffer.length;V++)i.deleteFramebuffer(y.__webglFramebuffer[V]);else i.deleteFramebuffer(y.__webglFramebuffer);if(y.__webglDepthbuffer&&i.deleteRenderbuffer(y.__webglDepthbuffer),y.__webglMultisampledFramebuffer&&i.deleteFramebuffer(y.__webglMultisampledFramebuffer),y.__webglColorRenderbuffer)for(let V=0;V<y.__webglColorRenderbuffer.length;V++)y.__webglColorRenderbuffer[V]&&i.deleteRenderbuffer(y.__webglColorRenderbuffer[V]);y.__webglDepthRenderbuffer&&i.deleteRenderbuffer(y.__webglDepthRenderbuffer)}let z=C.textures;for(let V=0,K=z.length;V<K;V++){let ct=n.get(z[V]);ct.__webglTexture&&(i.deleteTexture(ct.__webglTexture),a.memory.textures--),n.remove(z[V])}n.remove(C)}let N=0;function F(){N=0}function L(){return N}function B(C){N=C}function X(){let C=N;return C>=s.maxTextures&&zt("WebGLTextures: Trying to use "+(C+1)+" texture units while this GPU supports only "+s.maxTextures),N+=1,C}function G(C){let y=[];return y.push(C.wrapS),y.push(C.wrapT),y.push(C.wrapR||0),y.push(C.magFilter),y.push(C.minFilter),y.push(C.anisotropy),y.push(C.internalFormat),y.push(C.format),y.push(C.type),y.push(C.generateMipmaps),y.push(C.premultiplyAlpha),y.push(C.flipY),y.push(C.unpackAlignment),y.push(C.colorSpace),y.join()}function tt(C,y){let z=n.get(C);if(C.isVideoTexture&&D(C),C.isRenderTargetTexture===!1&&C.isExternalTexture!==!0&&C.version>0&&z.__version!==C.version){let V=C.image;if(V===null)zt("WebGLRenderer: Texture marked for update but no image data found.");else if(V.complete===!1)zt("WebGLRenderer: Texture marked for update but image is incomplete");else{ht(z,C,y);return}}else C.isExternalTexture&&(z.__webglTexture=C.sourceTexture?C.sourceTexture:null);e.bindTexture(i.TEXTURE_2D,z.__webglTexture,i.TEXTURE0+y)}function Z(C,y){let z=n.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&z.__version!==C.version){ht(z,C,y);return}else C.isExternalTexture&&(z.__webglTexture=C.sourceTexture?C.sourceTexture:null);e.bindTexture(i.TEXTURE_2D_ARRAY,z.__webglTexture,i.TEXTURE0+y)}function J(C,y){let z=n.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&z.__version!==C.version){ht(z,C,y);return}e.bindTexture(i.TEXTURE_3D,z.__webglTexture,i.TEXTURE0+y)}function Y(C,y){let z=n.get(C);if(C.isCubeDepthTexture!==!0&&C.version>0&&z.__version!==C.version){Ft(z,C,y);return}e.bindTexture(i.TEXTURE_CUBE_MAP,z.__webglTexture,i.TEXTURE0+y)}let ft={[Cs]:i.REPEAT,[Bn]:i.CLAMP_TO_EDGE,[to]:i.MIRRORED_REPEAT},bt={[He]:i.NEAREST,[qu]:i.NEAREST_MIPMAP_NEAREST,[Qr]:i.NEAREST_MIPMAP_LINEAR,[Xe]:i.LINEAR,[Oo]:i.LINEAR_MIPMAP_NEAREST,[Di]:i.LINEAR_MIPMAP_LINEAR},At={[Ku]:i.NEVER,[ed]:i.ALWAYS,[$u]:i.LESS,[Ml]:i.LEQUAL,[ju]:i.EQUAL,[Sl]:i.GEQUAL,[Qu]:i.GREATER,[td]:i.NOTEQUAL};function kt(C,y){if(y.type===yn&&t.has("OES_texture_float_linear")===!1&&(y.magFilter===Xe||y.magFilter===Oo||y.magFilter===Qr||y.magFilter===Di||y.minFilter===Xe||y.minFilter===Oo||y.minFilter===Qr||y.minFilter===Di)&&zt("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(C,i.TEXTURE_WRAP_S,ft[y.wrapS]),i.texParameteri(C,i.TEXTURE_WRAP_T,ft[y.wrapT]),(C===i.TEXTURE_3D||C===i.TEXTURE_2D_ARRAY)&&i.texParameteri(C,i.TEXTURE_WRAP_R,ft[y.wrapR]),i.texParameteri(C,i.TEXTURE_MAG_FILTER,bt[y.magFilter]),i.texParameteri(C,i.TEXTURE_MIN_FILTER,bt[y.minFilter]),y.compareFunction&&(i.texParameteri(C,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(C,i.TEXTURE_COMPARE_FUNC,At[y.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(y.magFilter===He||y.minFilter!==Qr&&y.minFilter!==Di||y.type===yn&&t.has("OES_texture_float_linear")===!1)return;if(y.anisotropy>1||n.get(y).__currentAnisotropy){let z=t.get("EXT_texture_filter_anisotropic");i.texParameterf(C,z.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(y.anisotropy,s.getMaxAnisotropy())),n.get(y).__currentAnisotropy=y.anisotropy}}}function Bt(C,y){let z=!1;C.__webglInit===void 0&&(C.__webglInit=!0,y.addEventListener("dispose",A));let V=y.source,K=p.get(V);K===void 0&&(K={},p.set(V,K));let ct=G(y);if(ct!==C.__cacheKey){K[ct]===void 0&&(K[ct]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,z=!0),K[ct].usedTimes++;let ut=K[C.__cacheKey];ut!==void 0&&(K[C.__cacheKey].usedTimes--,ut.usedTimes===0&&R(y)),C.__cacheKey=ct,C.__webglTexture=K[ct].texture}return z}function W(C,y,z){return Math.floor(Math.floor(C/z)/y)}function j(C,y,z,V){let ct=C.updateRanges;if(ct.length===0)e.texSubImage2D(i.TEXTURE_2D,0,0,0,y.width,y.height,z,V,y.data);else{ct.sort((Lt,xt)=>Lt.start-xt.start);let ut=0;for(let Lt=1;Lt<ct.length;Lt++){let xt=ct[ut],mt=ct[Lt],Dt=xt.start+xt.count,Gt=W(mt.start,y.width,4),jt=W(xt.start,y.width,4);mt.start<=Dt+1&&Gt===jt&&W(mt.start+mt.count-1,y.width,4)===Gt?xt.count=Math.max(xt.count,mt.start+mt.count-xt.start):(++ut,ct[ut]=mt)}ct.length=ut+1;let $=e.getParameter(i.UNPACK_ROW_LENGTH),et=e.getParameter(i.UNPACK_SKIP_PIXELS),pt=e.getParameter(i.UNPACK_SKIP_ROWS);e.pixelStorei(i.UNPACK_ROW_LENGTH,y.width);for(let Lt=0,xt=ct.length;Lt<xt;Lt++){let mt=ct[Lt],Dt=Math.floor(mt.start/4),Gt=Math.ceil(mt.count/4),jt=Dt%y.width,O=Math.floor(Dt/y.width),gt=Gt,Q=1;e.pixelStorei(i.UNPACK_SKIP_PIXELS,jt),e.pixelStorei(i.UNPACK_SKIP_ROWS,O),e.texSubImage2D(i.TEXTURE_2D,0,jt,O,gt,Q,z,V,y.data)}C.clearUpdateRanges(),e.pixelStorei(i.UNPACK_ROW_LENGTH,$),e.pixelStorei(i.UNPACK_SKIP_PIXELS,et),e.pixelStorei(i.UNPACK_SKIP_ROWS,pt)}}function ht(C,y,z){let V=i.TEXTURE_2D;(y.isDataArrayTexture||y.isCompressedArrayTexture)&&(V=i.TEXTURE_2D_ARRAY),y.isData3DTexture&&(V=i.TEXTURE_3D);let K=Bt(C,y),ct=y.source;e.bindTexture(V,C.__webglTexture,i.TEXTURE0+z);let ut=n.get(ct);if(ct.version!==ut.__version||K===!0){if(e.activeTexture(i.TEXTURE0+z),(typeof ImageBitmap<"u"&&y.image instanceof ImageBitmap)===!1){let Q=re.getPrimaries(re.workingColorSpace),_t=y.colorSpace===hi?null:re.getPrimaries(y.colorSpace),Et=y.colorSpace===hi||Q===_t?i.NONE:i.BROWSER_DEFAULT_WEBGL;e.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,y.flipY),e.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,y.premultiplyAlpha),e.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Et)}e.pixelStorei(i.UNPACK_ALIGNMENT,y.unpackAlignment);let et=m(y.image,!1,s.maxTextureSize);et=ue(y,et);let pt=r.convert(y.format,y.colorSpace),Lt=r.convert(y.type),xt=_(y.internalFormat,pt,Lt,y.normalized,y.colorSpace,y.isVideoTexture);kt(V,y);let mt,Dt=y.mipmaps,Gt=y.isVideoTexture!==!0,jt=ut.__version===void 0||K===!0,O=ct.dataReady,gt=v(y,et);if(y.isDepthTexture)xt=b(y.format===Ni,y.type),jt&&(Gt?e.texStorage2D(i.TEXTURE_2D,1,xt,et.width,et.height):e.texImage2D(i.TEXTURE_2D,0,xt,et.width,et.height,0,pt,Lt,null));else if(y.isDataTexture)if(Dt.length>0){Gt&&jt&&e.texStorage2D(i.TEXTURE_2D,gt,xt,Dt[0].width,Dt[0].height);for(let Q=0,_t=Dt.length;Q<_t;Q++)mt=Dt[Q],Gt?O&&e.texSubImage2D(i.TEXTURE_2D,Q,0,0,mt.width,mt.height,pt,Lt,mt.data):e.texImage2D(i.TEXTURE_2D,Q,xt,mt.width,mt.height,0,pt,Lt,mt.data);y.generateMipmaps=!1}else Gt?(jt&&e.texStorage2D(i.TEXTURE_2D,gt,xt,et.width,et.height),O&&j(y,et,pt,Lt)):e.texImage2D(i.TEXTURE_2D,0,xt,et.width,et.height,0,pt,Lt,et.data);else if(y.isCompressedTexture)if(y.isCompressedArrayTexture){Gt&&jt&&e.texStorage3D(i.TEXTURE_2D_ARRAY,gt,xt,Dt[0].width,Dt[0].height,et.depth);for(let Q=0,_t=Dt.length;Q<_t;Q++)if(mt=Dt[Q],y.format!==vn)if(pt!==null)if(Gt){if(O)if(y.layerUpdates.size>0){let Et=th(mt.width,mt.height,y.format,y.type);for(let st of y.layerUpdates){let Ut=mt.data.subarray(st*Et/mt.data.BYTES_PER_ELEMENT,(st+1)*Et/mt.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,Q,0,0,st,mt.width,mt.height,1,pt,Ut)}}else e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,Q,0,0,0,mt.width,mt.height,et.depth,pt,mt.data)}else e.compressedTexImage3D(i.TEXTURE_2D_ARRAY,Q,xt,mt.width,mt.height,et.depth,0,mt.data,0,0);else zt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Gt?O&&e.texSubImage3D(i.TEXTURE_2D_ARRAY,Q,0,0,0,mt.width,mt.height,et.depth,pt,Lt,mt.data):e.texImage3D(i.TEXTURE_2D_ARRAY,Q,xt,mt.width,mt.height,et.depth,0,pt,Lt,mt.data);y.layerUpdates.size>0&&y.clearLayerUpdates()}else{Gt&&jt&&e.texStorage2D(i.TEXTURE_2D,gt,xt,Dt[0].width,Dt[0].height);for(let Q=0,_t=Dt.length;Q<_t;Q++)mt=Dt[Q],y.format!==vn?pt!==null?Gt?O&&e.compressedTexSubImage2D(i.TEXTURE_2D,Q,0,0,mt.width,mt.height,pt,mt.data):e.compressedTexImage2D(i.TEXTURE_2D,Q,xt,mt.width,mt.height,0,mt.data):zt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Gt?O&&e.texSubImage2D(i.TEXTURE_2D,Q,0,0,mt.width,mt.height,pt,Lt,mt.data):e.texImage2D(i.TEXTURE_2D,Q,xt,mt.width,mt.height,0,pt,Lt,mt.data)}else if(y.isDataArrayTexture)if(Gt){if(jt&&e.texStorage3D(i.TEXTURE_2D_ARRAY,gt,xt,et.width,et.height,et.depth),O)if(y.layerUpdates.size>0){let Q=th(et.width,et.height,y.format,y.type);for(let _t of y.layerUpdates){let Et=et.data.subarray(_t*Q/et.data.BYTES_PER_ELEMENT,(_t+1)*Q/et.data.BYTES_PER_ELEMENT);e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,_t,et.width,et.height,1,pt,Lt,Et)}y.clearLayerUpdates()}else e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,et.width,et.height,et.depth,pt,Lt,et.data)}else e.texImage3D(i.TEXTURE_2D_ARRAY,0,xt,et.width,et.height,et.depth,0,pt,Lt,et.data);else if(y.isData3DTexture)Gt?(jt&&e.texStorage3D(i.TEXTURE_3D,gt,xt,et.width,et.height,et.depth),O&&e.texSubImage3D(i.TEXTURE_3D,0,0,0,0,et.width,et.height,et.depth,pt,Lt,et.data)):e.texImage3D(i.TEXTURE_3D,0,xt,et.width,et.height,et.depth,0,pt,Lt,et.data);else if(y.isFramebufferTexture){if(jt)if(Gt)e.texStorage2D(i.TEXTURE_2D,gt,xt,et.width,et.height);else{let Q=et.width,_t=et.height;for(let Et=0;Et<gt;Et++)e.texImage2D(i.TEXTURE_2D,Et,xt,Q,_t,0,pt,Lt,null),Q>>=1,_t>>=1}}else if(y.isHTMLTexture){if("texElementImage2D"in i){let Q=i.canvas;if(Q.hasAttribute("layoutsubtree")||Q.setAttribute("layoutsubtree","true"),et.parentNode!==Q){Q.appendChild(et),d.add(y),Q.onpaint=_t=>{let Et=_t.changedElements;for(let st of d)Et.includes(st.image)&&(st.needsUpdate=!0)},Q.requestPaint();return}if(i.texElementImage2D.length===3)i.texElementImage2D(i.TEXTURE_2D,i.RGBA8,et);else{let Et=i.RGBA,st=i.RGBA,Ut=i.UNSIGNED_BYTE;i.texElementImage2D(i.TEXTURE_2D,0,Et,st,Ut,et)}i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)}}else if(Dt.length>0){if(Gt&&jt){let Q=ie(Dt[0]);e.texStorage2D(i.TEXTURE_2D,gt,xt,Q.width,Q.height)}for(let Q=0,_t=Dt.length;Q<_t;Q++)mt=Dt[Q],Gt?O&&e.texSubImage2D(i.TEXTURE_2D,Q,0,0,pt,Lt,mt):e.texImage2D(i.TEXTURE_2D,Q,xt,pt,Lt,mt);y.generateMipmaps=!1}else if(Gt){if(jt){let Q=ie(et);e.texStorage2D(i.TEXTURE_2D,gt,xt,Q.width,Q.height)}O&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,pt,Lt,et)}else e.texImage2D(i.TEXTURE_2D,0,xt,pt,Lt,et);f(y)&&M(V),ut.__version=ct.version,y.onUpdate&&y.onUpdate(y)}C.__version=y.version}function Ft(C,y,z){if(y.image.length!==6)return;let V=Bt(C,y),K=y.source;e.bindTexture(i.TEXTURE_CUBE_MAP,C.__webglTexture,i.TEXTURE0+z);let ct=n.get(K);if(K.version!==ct.__version||V===!0){e.activeTexture(i.TEXTURE0+z);let ut=re.getPrimaries(re.workingColorSpace),$=y.colorSpace===hi?null:re.getPrimaries(y.colorSpace),et=y.colorSpace===hi||ut===$?i.NONE:i.BROWSER_DEFAULT_WEBGL;e.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,y.flipY),e.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,y.premultiplyAlpha),e.pixelStorei(i.UNPACK_ALIGNMENT,y.unpackAlignment),e.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,et);let pt=y.isCompressedTexture||y.image[0].isCompressedTexture,Lt=y.image[0]&&y.image[0].isDataTexture,xt=[];for(let st=0;st<6;st++)!pt&&!Lt?xt[st]=m(y.image[st],!0,s.maxCubemapSize):xt[st]=Lt?y.image[st].image:y.image[st],xt[st]=ue(y,xt[st]);let mt=xt[0],Dt=r.convert(y.format,y.colorSpace),Gt=r.convert(y.type),jt=_(y.internalFormat,Dt,Gt,y.normalized,y.colorSpace),O=y.isVideoTexture!==!0,gt=ct.__version===void 0||V===!0,Q=K.dataReady,_t=v(y,mt);kt(i.TEXTURE_CUBE_MAP,y);let Et;if(pt){O&&gt&&e.texStorage2D(i.TEXTURE_CUBE_MAP,_t,jt,mt.width,mt.height);for(let st=0;st<6;st++){Et=xt[st].mipmaps;for(let Ut=0;Ut<Et.length;Ut++){let Pt=Et[Ut];y.format!==vn?Dt!==null?O?Q&&e.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+st,Ut,0,0,Pt.width,Pt.height,Dt,Pt.data):e.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+st,Ut,jt,Pt.width,Pt.height,0,Pt.data):zt("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):O?Q&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+st,Ut,0,0,Pt.width,Pt.height,Dt,Gt,Pt.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+st,Ut,jt,Pt.width,Pt.height,0,Dt,Gt,Pt.data)}}}else{if(Et=y.mipmaps,O&&gt){Et.length>0&&_t++;let st=ie(xt[0]);e.texStorage2D(i.TEXTURE_CUBE_MAP,_t,jt,st.width,st.height)}for(let st=0;st<6;st++)if(Lt){O?Q&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+st,0,0,0,xt[st].width,xt[st].height,Dt,Gt,xt[st].data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+st,0,jt,xt[st].width,xt[st].height,0,Dt,Gt,xt[st].data);for(let Ut=0;Ut<Et.length;Ut++){let ve=Et[Ut].image[st].image;O?Q&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+st,Ut+1,0,0,ve.width,ve.height,Dt,Gt,ve.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+st,Ut+1,jt,ve.width,ve.height,0,Dt,Gt,ve.data)}}else{O?Q&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+st,0,0,0,Dt,Gt,xt[st]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+st,0,jt,Dt,Gt,xt[st]);for(let Ut=0;Ut<Et.length;Ut++){let Pt=Et[Ut];O?Q&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+st,Ut+1,0,0,Dt,Gt,Pt.image[st]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+st,Ut+1,jt,Dt,Gt,Pt.image[st])}}}f(y)&&M(i.TEXTURE_CUBE_MAP),ct.__version=K.version,y.onUpdate&&y.onUpdate(y)}C.__version=y.version}function vt(C,y,z,V,K,ct){let ut=r.convert(z.format,z.colorSpace),$=r.convert(z.type),et=_(z.internalFormat,ut,$,z.normalized,z.colorSpace),pt=n.get(y),Lt=n.get(z);if(Lt.__renderTarget=y,!pt.__hasExternalTextures){let xt=Math.max(1,y.width>>ct),mt=Math.max(1,y.height>>ct);K===i.TEXTURE_3D||K===i.TEXTURE_2D_ARRAY?e.texImage3D(K,ct,et,xt,mt,y.depth,0,ut,$,null):e.texImage2D(K,ct,et,xt,mt,0,ut,$,null)}e.bindFramebuffer(i.FRAMEBUFFER,C),Jt(y)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,V,K,Lt.__webglTexture,0,Yt(y)):(K===i.TEXTURE_2D||K>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&K<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,V,K,Lt.__webglTexture,ct),e.bindFramebuffer(i.FRAMEBUFFER,null)}function qt(C,y,z){if(i.bindRenderbuffer(i.RENDERBUFFER,C),y.depthBuffer){let V=y.depthTexture,K=V&&V.isDepthTexture?V.type:null,ct=b(y.stencilBuffer,K),ut=y.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;Jt(y)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Yt(y),ct,y.width,y.height):z?i.renderbufferStorageMultisample(i.RENDERBUFFER,Yt(y),ct,y.width,y.height):i.renderbufferStorage(i.RENDERBUFFER,ct,y.width,y.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,ut,i.RENDERBUFFER,C)}else{let V=y.textures;for(let K=0;K<V.length;K++){let ct=V[K],ut=r.convert(ct.format,ct.colorSpace),$=r.convert(ct.type),et=_(ct.internalFormat,ut,$,ct.normalized,ct.colorSpace);Jt(y)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Yt(y),et,y.width,y.height):z?i.renderbufferStorageMultisample(i.RENDERBUFFER,Yt(y),et,y.width,y.height):i.renderbufferStorage(i.RENDERBUFFER,et,y.width,y.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function me(C,y,z){let V=y.isWebGLCubeRenderTarget===!0;if(e.bindFramebuffer(i.FRAMEBUFFER,C),!(y.depthTexture&&y.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let K=n.get(y.depthTexture);if(K.__renderTarget=y,(!K.__webglTexture||y.depthTexture.image.width!==y.width||y.depthTexture.image.height!==y.height)&&(y.depthTexture.image.width=y.width,y.depthTexture.image.height=y.height,y.depthTexture.needsUpdate=!0),V){if(K.__webglInit===void 0&&(K.__webglInit=!0,y.depthTexture.addEventListener("dispose",A)),K.__webglTexture===void 0){K.__webglTexture=i.createTexture(),e.bindTexture(i.TEXTURE_CUBE_MAP,K.__webglTexture),kt(i.TEXTURE_CUBE_MAP,y.depthTexture);let pt=r.convert(y.depthTexture.format),Lt=r.convert(y.depthTexture.type),xt;y.depthTexture.format===kn?xt=i.DEPTH_COMPONENT24:y.depthTexture.format===Ni&&(xt=i.DEPTH24_STENCIL8);for(let mt=0;mt<6;mt++)i.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+mt,0,xt,y.width,y.height,0,pt,Lt,null)}}else tt(y.depthTexture,0);let ct=K.__webglTexture,ut=Yt(y),$=V?i.TEXTURE_CUBE_MAP_POSITIVE_X+z:i.TEXTURE_2D,et=y.depthTexture.format===Ni?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(y.depthTexture.format===kn)Jt(y)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,et,$,ct,0,ut):i.framebufferTexture2D(i.FRAMEBUFFER,et,$,ct,0);else if(y.depthTexture.format===Ni)Jt(y)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,et,$,ct,0,ut):i.framebufferTexture2D(i.FRAMEBUFFER,et,$,ct,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function nt(C){let y=n.get(C),z=C.isWebGLCubeRenderTarget===!0;if(y.__boundDepthTexture!==C.depthTexture){let V=C.depthTexture;if(y.__depthDisposeCallback&&y.__depthDisposeCallback(),V){let K=()=>{delete y.__boundDepthTexture,delete y.__depthDisposeCallback,V.removeEventListener("dispose",K)};V.addEventListener("dispose",K),y.__depthDisposeCallback=K}y.__boundDepthTexture=V}if(C.depthTexture&&!y.__autoAllocateDepthBuffer)if(z)for(let V=0;V<6;V++)me(y.__webglFramebuffer[V],C,V);else{let V=C.texture.mipmaps;V&&V.length>0?me(y.__webglFramebuffer[0],C,0):me(y.__webglFramebuffer,C,0)}else if(z){y.__webglDepthbuffer=[];for(let V=0;V<6;V++)if(e.bindFramebuffer(i.FRAMEBUFFER,y.__webglFramebuffer[V]),y.__webglDepthbuffer[V]===void 0)y.__webglDepthbuffer[V]=i.createRenderbuffer(),qt(y.__webglDepthbuffer[V],C,!1);else{let K=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ct=y.__webglDepthbuffer[V];i.bindRenderbuffer(i.RENDERBUFFER,ct),i.framebufferRenderbuffer(i.FRAMEBUFFER,K,i.RENDERBUFFER,ct)}}else{let V=C.texture.mipmaps;if(V&&V.length>0?e.bindFramebuffer(i.FRAMEBUFFER,y.__webglFramebuffer[0]):e.bindFramebuffer(i.FRAMEBUFFER,y.__webglFramebuffer),y.__webglDepthbuffer===void 0)y.__webglDepthbuffer=i.createRenderbuffer(),qt(y.__webglDepthbuffer,C,!1);else{let K=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ct=y.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,ct),i.framebufferRenderbuffer(i.FRAMEBUFFER,K,i.RENDERBUFFER,ct)}}e.bindFramebuffer(i.FRAMEBUFFER,null)}function rt(C,y,z){let V=n.get(C);y!==void 0&&vt(V.__webglFramebuffer,C,C.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),z!==void 0&&nt(C)}function ot(C){let y=C.texture,z=n.get(C),V=n.get(y);C.addEventListener("dispose",x);let K=C.textures,ct=C.isWebGLCubeRenderTarget===!0,ut=K.length>1;if(ut||(V.__webglTexture===void 0&&(V.__webglTexture=i.createTexture()),V.__version=y.version,a.memory.textures++),ct){z.__webglFramebuffer=[];for(let $=0;$<6;$++)if(y.mipmaps&&y.mipmaps.length>0){z.__webglFramebuffer[$]=[];for(let et=0;et<y.mipmaps.length;et++)z.__webglFramebuffer[$][et]=i.createFramebuffer()}else z.__webglFramebuffer[$]=i.createFramebuffer()}else{if(y.mipmaps&&y.mipmaps.length>0){z.__webglFramebuffer=[];for(let $=0;$<y.mipmaps.length;$++)z.__webglFramebuffer[$]=i.createFramebuffer()}else z.__webglFramebuffer=i.createFramebuffer();if(ut)for(let $=0,et=K.length;$<et;$++){let pt=n.get(K[$]);pt.__webglTexture===void 0&&(pt.__webglTexture=i.createTexture(),a.memory.textures++)}if(C.samples>0&&Jt(C)===!1){z.__webglMultisampledFramebuffer=i.createFramebuffer(),z.__webglColorRenderbuffer=[],e.bindFramebuffer(i.FRAMEBUFFER,z.__webglMultisampledFramebuffer);for(let $=0;$<K.length;$++){let et=K[$];z.__webglColorRenderbuffer[$]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,z.__webglColorRenderbuffer[$]);let pt=r.convert(et.format,et.colorSpace),Lt=r.convert(et.type),xt=_(et.internalFormat,pt,Lt,et.normalized,et.colorSpace,C.isXRRenderTarget===!0),mt=Yt(C);i.renderbufferStorageMultisample(i.RENDERBUFFER,mt,xt,C.width,C.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+$,i.RENDERBUFFER,z.__webglColorRenderbuffer[$])}i.bindRenderbuffer(i.RENDERBUFFER,null),C.depthBuffer&&(z.__webglDepthRenderbuffer=i.createRenderbuffer(),qt(z.__webglDepthRenderbuffer,C,!0)),e.bindFramebuffer(i.FRAMEBUFFER,null)}}if(ct){e.bindTexture(i.TEXTURE_CUBE_MAP,V.__webglTexture),kt(i.TEXTURE_CUBE_MAP,y);for(let $=0;$<6;$++)if(y.mipmaps&&y.mipmaps.length>0)for(let et=0;et<y.mipmaps.length;et++)vt(z.__webglFramebuffer[$][et],C,y,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+$,et);else vt(z.__webglFramebuffer[$],C,y,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+$,0);f(y)&&M(i.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(ut){for(let $=0,et=K.length;$<et;$++){let pt=K[$],Lt=n.get(pt),xt=i.TEXTURE_2D;(C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(xt=C.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture(xt,Lt.__webglTexture),kt(xt,pt),vt(z.__webglFramebuffer,C,pt,i.COLOR_ATTACHMENT0+$,xt,0),f(pt)&&M(xt)}e.unbindTexture()}else{let $=i.TEXTURE_2D;if((C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&($=C.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture($,V.__webglTexture),kt($,y),y.mipmaps&&y.mipmaps.length>0)for(let et=0;et<y.mipmaps.length;et++)vt(z.__webglFramebuffer[et],C,y,i.COLOR_ATTACHMENT0,$,et);else vt(z.__webglFramebuffer,C,y,i.COLOR_ATTACHMENT0,$,0);f(y)&&M($),e.unbindTexture()}C.depthBuffer&&nt(C)}function lt(C){let y=C.textures;for(let z=0,V=y.length;z<V;z++){let K=y[z];if(f(K)){let ct=T(C),ut=n.get(K).__webglTexture;e.bindTexture(ct,ut),M(ct),e.unbindTexture()}}}let dt=[],Vt=[];function Ot(C){if(C.samples>0){if(Jt(C)===!1){let y=C.textures,z=C.width,V=C.height,K=i.COLOR_BUFFER_BIT,ct=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ut=n.get(C),$=y.length>1;if($)for(let pt=0;pt<y.length;pt++)e.bindFramebuffer(i.FRAMEBUFFER,ut.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+pt,i.RENDERBUFFER,null),e.bindFramebuffer(i.FRAMEBUFFER,ut.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+pt,i.TEXTURE_2D,null,0);e.bindFramebuffer(i.READ_FRAMEBUFFER,ut.__webglMultisampledFramebuffer);let et=C.texture.mipmaps;et&&et.length>0?e.bindFramebuffer(i.DRAW_FRAMEBUFFER,ut.__webglFramebuffer[0]):e.bindFramebuffer(i.DRAW_FRAMEBUFFER,ut.__webglFramebuffer);for(let pt=0;pt<y.length;pt++){if(C.resolveDepthBuffer&&(C.depthBuffer&&(K|=i.DEPTH_BUFFER_BIT),C.stencilBuffer&&C.resolveStencilBuffer&&(K|=i.STENCIL_BUFFER_BIT)),$){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,ut.__webglColorRenderbuffer[pt]);let Lt=n.get(y[pt]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,Lt,0)}i.blitFramebuffer(0,0,z,V,0,0,z,V,K,i.NEAREST),l===!0&&(dt.length=0,Vt.length=0,dt.push(i.COLOR_ATTACHMENT0+pt),C.depthBuffer&&C.storeMultisampledDepthBuffer===!1&&(dt.push(ct),Vt.push(ct),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,Vt)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,dt))}if(e.bindFramebuffer(i.READ_FRAMEBUFFER,null),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),$)for(let pt=0;pt<y.length;pt++){e.bindFramebuffer(i.FRAMEBUFFER,ut.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+pt,i.RENDERBUFFER,ut.__webglColorRenderbuffer[pt]);let Lt=n.get(y[pt]).__webglTexture;e.bindFramebuffer(i.FRAMEBUFFER,ut.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+pt,i.TEXTURE_2D,Lt,0)}e.bindFramebuffer(i.DRAW_FRAMEBUFFER,ut.__webglMultisampledFramebuffer)}else if(C.depthBuffer&&C.storeMultisampledDepthBuffer===!1&&l){let y=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[y])}}}function Yt(C){return Math.min(s.maxSamples,C.samples)}function Jt(C){let y=n.get(C);return C.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&y.__useRenderToTexture!==!1}function D(C){let y=a.render.frame;h.get(C)!==y&&(h.set(C,y),C.update())}function ue(C,y){let z=C.colorSpace,V=C.format,K=C.type;return C.isCompressedTexture===!0||C.isVideoTexture===!0||z!==mr&&z!==hi&&(re.getTransfer(z)===pe?(V!==vn||K!==an)&&zt("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Wt("WebGLTextures: Unsupported texture color space:",z)),y}function ie(C){return typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement?(c.width=C.naturalWidth||C.width,c.height=C.naturalHeight||C.height):typeof VideoFrame<"u"&&C instanceof VideoFrame?(c.width=C.displayWidth,c.height=C.displayHeight):(c.width=C.width,c.height=C.height),c}this.allocateTextureUnit=X,this.resetTextureUnits=F,this.getTextureUnits=L,this.setTextureUnits=B,this.setTexture2D=tt,this.setTexture2DArray=Z,this.setTexture3D=J,this.setTextureCube=Y,this.rebindTextures=rt,this.setupRenderTarget=ot,this.updateRenderTargetMipmap=lt,this.updateMultisampleRenderTarget=Ot,this.setupDepthRenderbuffer=nt,this.setupFrameBufferTexture=vt,this.useMultisampledRTT=Jt,this.isReversedDepthBuffer=function(){return e.buffers.depth.getReversed()}}function vx(i,t){function e(n,s=hi){let r,a=re.getTransfer(s);if(n===an)return i.UNSIGNED_BYTE;if(n===zo)return i.UNSIGNED_SHORT_4_4_4_4;if(n===ko)return i.UNSIGNED_SHORT_5_5_5_1;if(n===Vc)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===Gc)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===kc)return i.BYTE;if(n===Hc)return i.SHORT;if(n===Ws)return i.UNSIGNED_SHORT;if(n===Bo)return i.INT;if(n===Dn)return i.UNSIGNED_INT;if(n===yn)return i.FLOAT;if(n===Nn)return i.HALF_FLOAT;if(n===Wc)return i.ALPHA;if(n===Xc)return i.RGB;if(n===vn)return i.RGBA;if(n===kn)return i.DEPTH_COMPONENT;if(n===Ni)return i.DEPTH_STENCIL;if(n===Ho)return i.RED;if(n===Vo)return i.RED_INTEGER;if(n===Ui)return i.RG;if(n===Go)return i.RG_INTEGER;if(n===Wo)return i.RGBA_INTEGER;if(n===ta||n===ea||n===na||n===ia)if(a===pe)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===ta)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===ea)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===na)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===ia)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===ta)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===ea)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===na)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===ia)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Xo||n===qo||n===Yo||n===Zo)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===Xo)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===qo)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Yo)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Zo)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Jo||n===Ko||n===$o||n===jo||n===Qo||n===sa||n===tl)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(n===Jo||n===Ko)return a===pe?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===$o)return a===pe?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===jo)return r.COMPRESSED_R11_EAC;if(n===Qo)return r.COMPRESSED_SIGNED_R11_EAC;if(n===sa)return r.COMPRESSED_RG11_EAC;if(n===tl)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===el||n===nl||n===il||n===sl||n===rl||n===al||n===ol||n===ll||n===cl||n===hl||n===ul||n===dl||n===fl||n===pl)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(n===el)return a===pe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===nl)return a===pe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===il)return a===pe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===sl)return a===pe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===rl)return a===pe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===al)return a===pe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===ol)return a===pe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===ll)return a===pe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===cl)return a===pe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===hl)return a===pe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===ul)return a===pe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===dl)return a===pe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===fl)return a===pe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===pl)return a===pe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===ml||n===gl||n===_l)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(n===ml)return a===pe?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===gl)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===_l)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===xl||n===yl||n===ra||n===vl)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(n===xl)return r.COMPRESSED_RED_RGTC1_EXT;if(n===yl)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===ra)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===vl)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Xs?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:e}}var Mx=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Sx=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,yh=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e){if(this.texture===null){let n=new Rr(t.texture);(t.depthNear!==e.depthNear||t.depthFar!==e.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=n}}getMesh(t){if(this.texture!==null&&this.mesh===null){let e=t.cameras[0].viewport,n=new Ve({vertexShader:Mx,fragmentShader:Sx,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new at(new nn(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},vh=class extends Rn{constructor(t,e){super();let n=this,s=null,r=1,a=null,o="local-floor",l=1,c=null,h=null,d=null,u=null,p=null,g=null,S=typeof XRWebGLBinding<"u",m=new yh,f={},M=e.getContextAttributes(),T=null,_=null,b=[],v=[],A=new it,x=null,w=null,R=new De;R.viewport=new Te;let I=new De;I.viewport=new Te;let N=[R,I],F=new Po,L=null,B=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(W){let j=b[W];return j===void 0&&(j=new Ns,b[W]=j),j.getTargetRaySpace()},this.getControllerGrip=function(W){let j=b[W];return j===void 0&&(j=new Ns,b[W]=j),j.getGripSpace()},this.getHand=function(W){let j=b[W];return j===void 0&&(j=new Ns,b[W]=j),j.getHandSpace()};function X(W){let j=v.indexOf(W.inputSource);if(j===-1)return;let ht=b[j];ht!==void 0&&(ht.update(W.inputSource,W.frame,c||a),ht.dispatchEvent({type:W.type,data:W.inputSource}))}function G(){s.removeEventListener("select",X),s.removeEventListener("selectstart",X),s.removeEventListener("selectend",X),s.removeEventListener("squeeze",X),s.removeEventListener("squeezestart",X),s.removeEventListener("squeezeend",X),s.removeEventListener("end",G),s.removeEventListener("inputsourceschange",tt);for(let W=0;W<b.length;W++){let j=v[W];j!==null&&(v[W]=null,b[W].disconnect(j))}L=null,B=null,m.reset();for(let W in f)delete f[W];if(t.setRenderTarget(T),p=null,u=null,d=null,s=null,_=null,Bt.stop(),n.isPresenting=!1,t.setPixelRatio(x),t.setSize(A.width,A.height,!1),w!==null){let W=w.camera;W.fov=w.fov,W.zoom=w.zoom,W.updateProjectionMatrix(),w=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(W){r=W,n.isPresenting===!0&&zt("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(W){o=W,n.isPresenting===!0&&zt("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(W){c=W},this.getBaseLayer=function(){return u!==null?u:p},this.getBinding=function(){return d===null&&S&&(d=new XRWebGLBinding(s,e)),d},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(W){if(s=W,s!==null){if(T=t.getRenderTarget(),s.addEventListener("select",X),s.addEventListener("selectstart",X),s.addEventListener("selectend",X),s.addEventListener("squeeze",X),s.addEventListener("squeezestart",X),s.addEventListener("squeezeend",X),s.addEventListener("end",G),s.addEventListener("inputsourceschange",tt),M.xrCompatible!==!0&&await e.makeXRCompatible(),x=t.getPixelRatio(),t.getSize(A),S&&"createProjectionLayer"in XRWebGLBinding.prototype){let ht=null,Ft=null,vt=null;M.depth&&(vt=M.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,ht=M.stencil?Ni:kn,Ft=M.stencil?Xs:Dn);let qt={colorFormat:e.RGBA8,depthFormat:vt,scaleFactor:r};d=this.getBinding(),u=d.createProjectionLayer(qt),s.updateRenderState({layers:[u]}),t.setPixelRatio(1),t.setSize(u.textureWidth,u.textureHeight,!1),_=new rn(u.textureWidth,u.textureHeight,{format:vn,type:an,depthTexture:new Si(u.textureWidth,u.textureHeight,Ft,void 0,void 0,void 0,void 0,void 0,void 0,ht),stencilBuffer:M.stencil,colorSpace:t.outputColorSpace,samples:M.antialias?4:0,resolveDepthBuffer:u.ignoreDepthValues===!1,resolveStencilBuffer:u.ignoreDepthValues===!1,storeMultisampledDepthBuffer:u.ignoreDepthValues===!1,storeMultisampledStencilBuffer:u.ignoreDepthValues===!1})}else{let ht={antialias:M.antialias,alpha:!0,depth:M.depth,stencil:M.stencil,framebufferScaleFactor:r};p=new XRWebGLLayer(s,e,ht),s.updateRenderState({baseLayer:p}),t.setPixelRatio(1),t.setSize(p.framebufferWidth,p.framebufferHeight,!1),_=new rn(p.framebufferWidth,p.framebufferHeight,{format:vn,type:an,colorSpace:t.outputColorSpace,stencilBuffer:M.stencil,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1,storeMultisampledDepthBuffer:p.ignoreDepthValues===!1,storeMultisampledStencilBuffer:p.ignoreDepthValues===!1})}_.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await s.requestReferenceSpace(o),Bt.setContext(s),Bt.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function tt(W){for(let j=0;j<W.removed.length;j++){let ht=W.removed[j],Ft=v.indexOf(ht);Ft>=0&&(v[Ft]=null,b[Ft].disconnect(ht))}for(let j=0;j<W.added.length;j++){let ht=W.added[j],Ft=v.indexOf(ht);if(Ft===-1){for(let qt=0;qt<b.length;qt++)if(qt>=v.length){v.push(ht),Ft=qt;break}else if(v[qt]===null){v[qt]=ht,Ft=qt;break}if(Ft===-1)break}let vt=b[Ft];vt&&vt.connect(ht)}}let Z=new P,J=new P;function Y(W,j,ht){Z.setFromMatrixPosition(j.matrixWorld),J.setFromMatrixPosition(ht.matrixWorld);let Ft=Z.distanceTo(J),vt=j.projectionMatrix.elements,qt=ht.projectionMatrix.elements,me=vt[14]/(vt[10]-1),nt=vt[14]/(vt[10]+1),rt=(vt[9]+1)/vt[5],ot=(vt[9]-1)/vt[5],lt=(vt[8]-1)/vt[0],dt=(qt[8]+1)/qt[0],Vt=me*lt,Ot=me*dt,Yt=Ft/(-lt+dt),Jt=Yt*-lt;if(j.matrixWorld.decompose(W.position,W.quaternion,W.scale),W.translateX(Jt),W.translateZ(Yt),W.matrixWorld.compose(W.position,W.quaternion,W.scale),W.matrixWorldInverse.copy(W.matrixWorld).invert(),vt[10]===-1)W.projectionMatrix.copy(j.projectionMatrix),W.projectionMatrixInverse.copy(j.projectionMatrixInverse);else{let D=me+Yt,ue=nt+Yt,ie=Vt-Jt,C=Ot+(Ft-Jt),y=rt*nt/ue*D,z=ot*nt/ue*D;W.projectionMatrix.makePerspective(ie,C,y,z,D,ue),W.projectionMatrixInverse.copy(W.projectionMatrix).invert()}}function ft(W,j){j===null?W.matrixWorld.copy(W.matrix):W.matrixWorld.multiplyMatrices(j.matrixWorld,W.matrix),W.matrixWorldInverse.copy(W.matrixWorld).invert()}this.updateCamera=function(W){if(s===null)return;let j=W.near,ht=W.far;m.texture!==null&&(m.depthNear>0&&(j=m.depthNear),m.depthFar>0&&(ht=m.depthFar)),F.near=I.near=R.near=j,F.far=I.far=R.far=ht,(L!==F.near||B!==F.far)&&(s.updateRenderState({depthNear:F.near,depthFar:F.far}),L=F.near,B=F.far),F.layers.mask=W.layers.mask|6,R.layers.mask=F.layers.mask&-5,I.layers.mask=F.layers.mask&-3;let Ft=W.parent,vt=F.cameras;ft(F,Ft);for(let qt=0;qt<vt.length;qt++)ft(vt[qt],Ft);vt.length===2?Y(F,R,I):F.projectionMatrix.copy(R.projectionMatrix),w===null&&W.isPerspectiveCamera&&(w={camera:W,fov:W.fov,zoom:W.zoom}),bt(W,F,Ft)};function bt(W,j,ht){ht===null?W.matrix.copy(j.matrixWorld):(W.matrix.copy(ht.matrixWorld),W.matrix.invert(),W.matrix.multiply(j.matrixWorld)),W.matrix.decompose(W.position,W.quaternion,W.scale),W.updateMatrixWorld(!0),W.projectionMatrix.copy(j.projectionMatrix),W.projectionMatrixInverse.copy(j.projectionMatrixInverse),W.isPerspectiveCamera&&(W.fov=Ls*2*Math.atan(1/W.projectionMatrix.elements[5]),W.zoom=1)}this.getCamera=function(){return F},this.getFoveation=function(){if(!(u===null&&p===null))return l},this.setFoveation=function(W){l=W,u!==null&&(u.fixedFoveation=W),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=W)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(F)},this.getCameraTexture=function(W){return f[W]};let At=null;function kt(W,j){if(h=j.getViewerPose(c||a),g=j,h!==null){let ht=h.views;p!==null&&(t.setRenderTargetFramebuffer(_,p.framebuffer),t.setRenderTarget(_));let Ft=!1;ht.length!==F.cameras.length&&(F.cameras.length=0,Ft=!0);for(let nt=0;nt<ht.length;nt++){let rt=ht[nt],ot=null;if(p!==null)ot=p.getViewport(rt);else{let dt=d.getViewSubImage(u,rt);ot=dt.viewport,nt===0&&(t.setRenderTargetTextures(_,dt.colorTexture,dt.depthStencilTexture),t.setRenderTarget(_))}let lt=N[nt];lt===void 0&&(lt=new De,lt.layers.enable(nt),lt.viewport=new Te,N[nt]=lt),lt.matrix.fromArray(rt.transform.matrix),lt.matrix.decompose(lt.position,lt.quaternion,lt.scale),lt.projectionMatrix.fromArray(rt.projectionMatrix),lt.projectionMatrixInverse.copy(lt.projectionMatrix).invert(),lt.viewport.set(ot.x,ot.y,ot.width,ot.height),nt===0&&(F.matrix.copy(lt.matrix),F.matrix.decompose(F.position,F.quaternion,F.scale)),Ft===!0&&F.cameras.push(lt)}let vt=s.enabledFeatures;if(vt&&vt.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&S){d=n.getBinding();let nt=d.getDepthInformation(ht[0]);nt&&nt.isValid&&nt.texture&&m.init(nt,s.renderState)}if(vt&&vt.includes("camera-access")&&S){t.state.unbindTexture(),d=n.getBinding();for(let nt=0;nt<ht.length;nt++){let rt=ht[nt].camera;if(rt){let ot=f[rt];ot||(ot=new Rr,f[rt]=ot);let lt=d.getCameraImage(rt);ot.sourceTexture=lt}}}}for(let ht=0;ht<b.length;ht++){let Ft=v[ht],vt=b[ht];Ft!==null&&vt!==void 0&&vt.update(Ft,j,c||a)}At&&At(W,j),j.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:j}),g=null}let Bt=new Fd;Bt.setAnimationLoop(kt),this.setAnimationLoop=function(W){At=W},this.dispose=function(){}}},bx=new ce,Vd=new Zt;Vd.set(-1,0,0,0,1,0,0,0,1);function Ex(i,t){function e(m,f){m.matrixAutoUpdate===!0&&m.updateMatrix(),f.value.copy(m.matrix)}function n(m,f){f.color.getRGB(m.fogColor.value,$c(i)),f.isFog?(m.fogNear.value=f.near,m.fogFar.value=f.far):f.isFogExp2&&(m.fogDensity.value=f.density)}function s(m,f,M,T,_){f.isNodeMaterial?f.uniformsNeedUpdate=!1:f.isMeshBasicMaterial?r(m,f):f.isMeshLambertMaterial?(r(m,f),f.envMap&&(m.envMapIntensity.value=f.envMapIntensity)):f.isMeshToonMaterial?(r(m,f),d(m,f)):f.isMeshPhongMaterial?(r(m,f),h(m,f),f.envMap&&(m.envMapIntensity.value=f.envMapIntensity)):f.isMeshStandardMaterial?(r(m,f),u(m,f),f.isMeshPhysicalMaterial&&p(m,f,_)):f.isMeshMatcapMaterial?(r(m,f),g(m,f)):f.isMeshDepthMaterial?r(m,f):f.isMeshDistanceMaterial?(r(m,f),S(m,f)):f.isMeshNormalMaterial?r(m,f):f.isLineBasicMaterial?(a(m,f),f.isLineDashedMaterial&&o(m,f)):f.isPointsMaterial?l(m,f,M,T):f.isSpriteMaterial?c(m,f):f.isShadowMaterial?(m.color.value.copy(f.color),m.opacity.value=f.opacity):f.isShaderMaterial&&(f.uniformsNeedUpdate=!1)}function r(m,f){m.opacity.value=f.opacity,f.color&&m.diffuse.value.copy(f.color),f.emissive&&m.emissive.value.copy(f.emissive).multiplyScalar(f.emissiveIntensity),f.map&&(m.map.value=f.map,e(f.map,m.mapTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,e(f.alphaMap,m.alphaMapTransform)),f.bumpMap&&(m.bumpMap.value=f.bumpMap,e(f.bumpMap,m.bumpMapTransform),m.bumpScale.value=f.bumpScale,f.side===Ne&&(m.bumpScale.value*=-1)),f.normalMap&&(m.normalMap.value=f.normalMap,e(f.normalMap,m.normalMapTransform),m.normalScale.value.copy(f.normalScale),f.side===Ne&&m.normalScale.value.negate()),f.displacementMap&&(m.displacementMap.value=f.displacementMap,e(f.displacementMap,m.displacementMapTransform),m.displacementScale.value=f.displacementScale,m.displacementBias.value=f.displacementBias),f.emissiveMap&&(m.emissiveMap.value=f.emissiveMap,e(f.emissiveMap,m.emissiveMapTransform)),f.specularMap&&(m.specularMap.value=f.specularMap,e(f.specularMap,m.specularMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest);let M=t.get(f),T=M.envMap,_=M.envMapRotation;T&&(m.envMap.value=T,m.envMapRotation.value.setFromMatrix4(bx.makeRotationFromEuler(_)).transpose(),T.isCubeTexture&&T.isRenderTargetTexture===!1&&m.envMapRotation.value.premultiply(Vd),m.reflectivity.value=f.reflectivity,m.ior.value=f.ior,m.refractionRatio.value=f.refractionRatio),f.lightMap&&(m.lightMap.value=f.lightMap,m.lightMapIntensity.value=f.lightMapIntensity,e(f.lightMap,m.lightMapTransform)),f.aoMap&&(m.aoMap.value=f.aoMap,m.aoMapIntensity.value=f.aoMapIntensity,e(f.aoMap,m.aoMapTransform))}function a(m,f){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,f.map&&(m.map.value=f.map,e(f.map,m.mapTransform))}function o(m,f){m.dashSize.value=f.dashSize,m.totalSize.value=f.dashSize+f.gapSize,m.scale.value=f.scale}function l(m,f,M,T){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,m.size.value=f.size*M,m.scale.value=T*.5,f.map&&(m.map.value=f.map,e(f.map,m.uvTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,e(f.alphaMap,m.alphaMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest)}function c(m,f){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,m.rotation.value=f.rotation,f.map&&(m.map.value=f.map,e(f.map,m.mapTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,e(f.alphaMap,m.alphaMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest)}function h(m,f){m.specular.value.copy(f.specular),m.shininess.value=Math.max(f.shininess,1e-4)}function d(m,f){f.gradientMap&&(m.gradientMap.value=f.gradientMap)}function u(m,f){m.metalness.value=f.metalness,f.metalnessMap&&(m.metalnessMap.value=f.metalnessMap,e(f.metalnessMap,m.metalnessMapTransform)),m.roughness.value=f.roughness,f.roughnessMap&&(m.roughnessMap.value=f.roughnessMap,e(f.roughnessMap,m.roughnessMapTransform)),f.envMap&&(m.envMapIntensity.value=f.envMapIntensity)}function p(m,f,M){m.ior.value=f.ior,f.sheen>0&&(m.sheenColor.value.copy(f.sheenColor).multiplyScalar(f.sheen),m.sheenRoughness.value=f.sheenRoughness,f.sheenColorMap&&(m.sheenColorMap.value=f.sheenColorMap,e(f.sheenColorMap,m.sheenColorMapTransform)),f.sheenRoughnessMap&&(m.sheenRoughnessMap.value=f.sheenRoughnessMap,e(f.sheenRoughnessMap,m.sheenRoughnessMapTransform))),f.clearcoat>0&&(m.clearcoat.value=f.clearcoat,m.clearcoatRoughness.value=f.clearcoatRoughness,f.clearcoatMap&&(m.clearcoatMap.value=f.clearcoatMap,e(f.clearcoatMap,m.clearcoatMapTransform)),f.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=f.clearcoatRoughnessMap,e(f.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),f.clearcoatNormalMap&&(m.clearcoatNormalMap.value=f.clearcoatNormalMap,e(f.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(f.clearcoatNormalScale),f.side===Ne&&m.clearcoatNormalScale.value.negate())),f.dispersion>0&&(m.dispersion.value=f.dispersion),f.retroreflectivity>0&&(m.retroreflectivity.value=f.retroreflectivity),f.iridescence>0&&(m.iridescence.value=f.iridescence,m.iridescenceIOR.value=f.iridescenceIOR,m.iridescenceThicknessMinimum.value=f.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=f.iridescenceThicknessRange[1],f.iridescenceMap&&(m.iridescenceMap.value=f.iridescenceMap,e(f.iridescenceMap,m.iridescenceMapTransform)),f.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=f.iridescenceThicknessMap,e(f.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),f.transmission>0&&(m.transmission.value=f.transmission,m.transmissionSamplerMap.value=M.texture,m.transmissionSamplerSize.value.set(M.width,M.height),f.transmissionMap&&(m.transmissionMap.value=f.transmissionMap,e(f.transmissionMap,m.transmissionMapTransform)),m.thickness.value=f.thickness,f.thicknessMap&&(m.thicknessMap.value=f.thicknessMap,e(f.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=f.attenuationDistance,m.attenuationColor.value.copy(f.attenuationColor)),f.anisotropy>0&&(m.anisotropyVector.value.set(f.anisotropy*Math.cos(f.anisotropyRotation),f.anisotropy*Math.sin(f.anisotropyRotation)),f.anisotropyMap&&(m.anisotropyMap.value=f.anisotropyMap,e(f.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=f.specularIntensity,m.specularColor.value.copy(f.specularColor),f.specularColorMap&&(m.specularColorMap.value=f.specularColorMap,e(f.specularColorMap,m.specularColorMapTransform)),f.specularIntensityMap&&(m.specularIntensityMap.value=f.specularIntensityMap,e(f.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,f){f.matcap&&(m.matcap.value=f.matcap)}function S(m,f){let M=t.get(f).light;m.referencePosition.value.setFromMatrixPosition(M.matrixWorld),m.nearDistance.value=M.shadow.camera.near,m.farDistance.value=M.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function Tx(i,t,e,n){let s={},r={},a=[],o=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(_,b){let v=b.program;n.uniformBlockBinding(_,v)}function c(_,b){let v=s[_.id];v===void 0&&(m(_),v=h(_),s[_.id]=v,_.addEventListener("dispose",M));let A=b.program;n.updateUBOMapping(_,A);let x=t.render.frame;r[_.id]!==x&&(u(_),r[_.id]=x)}function h(_){let b=d();_.__bindingPointIndex=b;let v=i.createBuffer(),A=_.__size,x=_.usage;return i.bindBuffer(i.UNIFORM_BUFFER,v),i.bufferData(i.UNIFORM_BUFFER,A,x),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,b,v),v}function d(){for(let _=0;_<o;_++)if(a.indexOf(_)===-1)return a.push(_),_;return Wt("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function u(_){let b=s[_.id],v=_.uniforms,A=_.__cache;i.bindBuffer(i.UNIFORM_BUFFER,b);for(let x=0,w=v.length;x<w;x++){let R=v[x];if(Array.isArray(R))for(let I=0,N=R.length;I<N;I++)p(R[I],x,I,A);else p(R,x,0,A)}i.bindBuffer(i.UNIFORM_BUFFER,null)}function p(_,b,v,A){if(S(_,b,v,A)===!0){let x=_.__offset,w=_.value;if(Array.isArray(w)){let R=0;for(let I=0;I<w.length;I++){let N=w[I],F=f(N);g(N,_.__data,R),typeof N!="number"&&typeof N!="boolean"&&!N.isMatrix3&&!ArrayBuffer.isView(N)&&(R+=F.storage/Float32Array.BYTES_PER_ELEMENT)}}else g(w,_.__data,0);i.bufferSubData(i.UNIFORM_BUFFER,x,_.__data)}}function g(_,b,v){typeof _=="number"||typeof _=="boolean"?b[0]=_:_.isMatrix3?(b[0]=_.elements[0],b[1]=_.elements[1],b[2]=_.elements[2],b[3]=0,b[4]=_.elements[3],b[5]=_.elements[4],b[6]=_.elements[5],b[7]=0,b[8]=_.elements[6],b[9]=_.elements[7],b[10]=_.elements[8],b[11]=0):ArrayBuffer.isView(_)?b.set(new _.constructor(_.buffer,_.byteOffset,b.length)):_.toArray(b,v)}function S(_,b,v,A){let x=_.value,w=b+"_"+v;if(A[w]===void 0)return typeof x=="number"||typeof x=="boolean"?A[w]=x:ArrayBuffer.isView(x)?A[w]=x.slice():A[w]=x.clone(),!0;{let R=A[w];if(typeof x=="number"||typeof x=="boolean"){if(R!==x)return A[w]=x,!0}else{if(ArrayBuffer.isView(x))return!0;if(R.equals(x)===!1)return R.copy(x),!0}}return!1}function m(_){let b=_.uniforms,v=0,A=16;for(let w=0,R=b.length;w<R;w++){let I=Array.isArray(b[w])?b[w]:[b[w]];for(let N=0,F=I.length;N<F;N++){let L=I[N],B=Array.isArray(L.value)?L.value:[L.value];for(let X=0,G=B.length;X<G;X++){let tt=B[X],Z=f(tt),J=v%A,Y=J%Z.boundary,ft=J+Y;v+=Y,ft!==0&&A-ft<Z.storage&&(v+=A-ft),L.__data=new Float32Array(Z.storage/Float32Array.BYTES_PER_ELEMENT),L.__offset=v,v+=Z.storage}}}let x=v%A;return x>0&&(v+=A-x),_.__size=v,_.__cache={},this}function f(_){let b={boundary:0,storage:0};return typeof _=="number"||typeof _=="boolean"?(b.boundary=4,b.storage=4):_.isVector2?(b.boundary=8,b.storage=8):_.isVector3||_.isColor?(b.boundary=16,b.storage=12):_.isVector4?(b.boundary=16,b.storage=16):_.isMatrix3?(b.boundary=48,b.storage=48):_.isMatrix4?(b.boundary=64,b.storage=64):_.isTexture?zt("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(_)?(b.boundary=16,b.storage=_.byteLength):zt("WebGLRenderer: Unsupported uniform value type.",_),b}function M(_){let b=_.target;b.removeEventListener("dispose",M);let v=a.indexOf(b.__bindingPointIndex);a.splice(v,1),i.deleteBuffer(s[b.id]),delete s[b.id],delete r[b.id]}function T(){for(let _ in s)i.deleteBuffer(s[_]);a=[],s={},r={}}return{bind:l,update:c,dispose:T}}var wx=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),qn=null;function Ax(){return qn===null&&(qn=new Tr(wx,16,16,Ui,Nn),qn.name="DFG_LUT",qn.minFilter=Xe,qn.magFilter=Xe,qn.wrapS=Bn,qn.wrapT=Bn,qn.generateMipmaps=!1,qn.needsUpdate=!0),qn}var Js=class{constructor(t={}){let{canvas:e=nd(),context:n=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:d=!1,reversedDepthBuffer:u=!1,outputBufferType:p=an}=t;this.isWebGLRenderer=!0;let g;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");g=n.getContextAttributes().alpha}else g=a;let S=p,m=new Set([Wo,Go,Vo]),f=new Set([an,Dn,Ws,Xs,zo,ko]),M=new Uint32Array(4),T=new Int32Array(4),_=new P,b=null,v=null,A=[],x=[],w=null;this.domElement=e,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Ln,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let R=this,I=!1,N=null,F=null,L=null,B=null;this._outputColorSpace=We;let X=0,G=0,tt=null,Z=-1,J=null,Y=new Te,ft=new Te,bt=null,At=new Nt(0),kt=0,Bt=e.width,W=e.height,j=1,ht=null,Ft=null,vt=new Te(0,0,Bt,W),qt=new Te(0,0,Bt,W),me=!1,nt=new Us,rt=!1,ot=!1,lt=new ce,dt=new P,Vt=new Te,Ot={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Yt=!1;function Jt(){return tt===null?j:1}let D=n;function ue(E,U){return e.getContext(E,U)}let ie,C,y,z,V,K,ct,ut,$,et,pt,Lt,xt,mt,Dt,Gt,jt,O,gt,Q,_t,Et,st;try{let E={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:d};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${Lo}`),e.addEventListener("webglcontextlost",ve,!1),e.addEventListener("webglcontextrestored",de,!1),e.addEventListener("webglcontextcreationerror",Sn,!1),D===null){let U="webgl2";if(D=ue(U,E),D===null)throw ue(U)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}Ut()}catch(E){throw e.removeEventListener("webglcontextlost",ve,!1),e.removeEventListener("webglcontextrestored",de,!1),e.removeEventListener("webglcontextcreationerror",Sn,!1),Wt("WebGLRenderer: "+E.message),E}function Ut(){ie=new Ng(D),ie.init(),_t=new vx(D,ie),C=new Eg(D,ie,t,_t),y=new xx(D,ie),C.reversedDepthBuffer&&u&&y.buffers.depth.setReversed(!0),F=D.createFramebuffer(),L=D.createFramebuffer(),B=D.createFramebuffer(),z=new Og(D),V=new sx,K=new yx(D,ie,y,V,C,_t,z),ct=new Dg(R),ut=new zp(D),Et=new Sg(D,ut),$=new Ug(D,ut,z,Et),et=new zg(D,$,ut,Et,z),O=new Bg(D,C,K),Dt=new Tg(V),pt=new ix(R,ct,ie,C,Et,Dt),Lt=new Ex(R,V),xt=new ax,mt=new dx(ie),jt=new Mg(R,ct,y,et,g,l),Gt=new _x(R,et,C),st=new Tx(D,z,C,y),gt=new bg(D,ie,z),Q=new Fg(D,ie,z),z.programs=pt.programs,R.capabilities=C,R.extensions=ie,R.properties=V,R.renderLists=xt,R.shadowMap=Gt,R.state=y,R.info=z}S!==an&&(w=new Hg(S,e.width,e.height,o,s,r));let Pt=new vh(R,D);this.xr=Pt,this.getContext=function(){return D},this.getContextAttributes=function(){return D.getContextAttributes()},this.forceContextLoss=function(){let E=ie.get("WEBGL_lose_context");E&&E.loseContext()},this.forceContextRestore=function(){let E=ie.get("WEBGL_lose_context");E&&E.restoreContext()},this.getPixelRatio=function(){return j},this.setPixelRatio=function(E){E!==void 0&&(j=E,this.setSize(Bt,W,!1))},this.getSize=function(E){return E.set(Bt,W)},this.setSize=function(E,U,q=!0){if(Pt.isPresenting){zt("WebGLRenderer: Can't change size while VR device is presenting.");return}Bt=E,W=U,e.width=Math.floor(E*j),e.height=Math.floor(U*j),q===!0&&(e.style.width=E+"px",e.style.height=U+"px"),w!==null&&w.setSize(e.width,e.height),this.setViewport(0,0,E,U)},this.getDrawingBufferSize=function(E){return E.set(Bt*j,W*j).floor()},this.setDrawingBufferSize=function(E,U,q){Bt=E,W=U,j=q,e.width=Math.floor(E*q),e.height=Math.floor(U*q),this.setViewport(0,0,E,U)},this.setEffects=function(E){if(S===an){Wt("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(E){for(let U=0;U<E.length;U++)if(E[U].isOutputPass===!0){zt("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}w.setEffects(E||[])},this.getCurrentViewport=function(E){return E.copy(Y)},this.getViewport=function(E){return E.copy(vt)},this.setViewport=function(E,U,q,k){E.isVector4?vt.set(E.x,E.y,E.z,E.w):vt.set(E,U,q,k),y.viewport(Y.copy(vt).multiplyScalar(j).round())},this.getScissor=function(E){return E.copy(qt)},this.setScissor=function(E,U,q,k){E.isVector4?qt.set(E.x,E.y,E.z,E.w):qt.set(E,U,q,k),y.scissor(ft.copy(qt).multiplyScalar(j).round())},this.getScissorTest=function(){return me},this.setScissorTest=function(E){y.setScissorTest(me=E)},this.setOpaqueSort=function(E){ht=E},this.setTransparentSort=function(E){Ft=E},this.getClearColor=function(E){return E.copy(jt.getClearColor())},this.setClearColor=function(){jt.setClearColor(...arguments)},this.getClearAlpha=function(){return jt.getClearAlpha()},this.setClearAlpha=function(){jt.setClearAlpha(...arguments)},this.clear=function(E=!0,U=!0,q=!0){let k=0;if(E){let H=!1;if(tt!==null){let St=tt.texture.format;H=m.has(St)}if(H){let St=tt.texture.type,wt=f.has(St),Mt=jt.getClearColor(),Rt=jt.getClearAlpha(),It=Mt.r,te=Mt.g,se=Mt.b;wt?(M[0]=It,M[1]=te,M[2]=se,M[3]=Rt,D.clearBufferuiv(D.COLOR,0,M)):(T[0]=It,T[1]=te,T[2]=se,T[3]=Rt,D.clearBufferiv(D.COLOR,0,T))}else k|=D.COLOR_BUFFER_BIT}U&&(k|=D.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),q&&(k|=D.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),k!==0&&D.clear(k)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(E){E.setRenderer(this),N=E},this.dispose=function(){e.removeEventListener("webglcontextlost",ve,!1),e.removeEventListener("webglcontextrestored",de,!1),e.removeEventListener("webglcontextcreationerror",Sn,!1),jt.dispose(),xt.dispose(),mt.dispose(),V.dispose(),ct.dispose(),et.dispose(),Et.dispose(),st.dispose(),pt.dispose(),Pt.dispose(),Pt.removeEventListener("sessionstart",Dh),Pt.removeEventListener("sessionend",Nh),Vi.stop()};function ve(E){E.preventDefault(),xr("WebGLRenderer: Context Lost."),I=!0}function de(){xr("WebGLRenderer: Context Restored."),I=!1;let E=z.autoReset,U=Gt.enabled,q=Gt.autoUpdate,k=Gt.needsUpdate,H=Gt.type;Ut(),z.autoReset=E,Gt.enabled=U,Gt.autoUpdate=q,Gt.needsUpdate=k,Gt.type=H}function Sn(E){Wt("WebGLRenderer: A WebGL context could not be created. Reason: ",E.statusMessage)}function Un(E){let U=E.target;U.removeEventListener("dispose",Un),cf(U)}function cf(E){hf(E),V.remove(E)}function hf(E){let U=V.get(E).programs;U!==void 0&&(U.forEach(function(q){pt.releaseProgram(q)}),E.isShaderMaterial&&pt.releaseShaderCache(E))}this.renderBufferDirect=function(E,U,q,k,H,St){U===null&&(U=Ot);let wt=H.isMesh&&H.matrixWorld.determinantAffine()<0,Mt=ff(E,U,q,k,H);y.setMaterial(k,wt);let Rt=q.index,It=1;if(k.wireframe===!0){if(Rt=$.getWireframeAttribute(q),Rt===void 0)return;It=2}let te=q.drawRange,se=q.attributes.position,Ct=te.start*It,fe=(te.start+te.count)*It;St!==null&&(Ct=Math.max(Ct,St.start*It),fe=Math.min(fe,(St.start+St.count)*It)),Rt!==null?(Ct=Math.max(Ct,0),fe=Math.min(fe,Rt.count)):se!=null&&(Ct=Math.max(Ct,0),fe=Math.min(fe,se.count));let Ie=fe-Ct;if(Ie<0||Ie===1/0)return;Et.setup(H,k,Mt,q,Rt);let Se,ye=gt;if(Rt!==null&&(Se=ut.get(Rt),ye=Q,ye.setIndex(Se)),H.isMesh)k.wireframe===!0?(y.setLineWidth(k.wireframeLinewidth*Jt()),ye.setMode(D.LINES)):ye.setMode(D.TRIANGLES);else if(H.isLine){let Ye=k.linewidth;Ye===void 0&&(Ye=1),y.setLineWidth(Ye*Jt()),H.isLineSegments?ye.setMode(D.LINES):H.isLineLoop?ye.setMode(D.LINE_LOOP):ye.setMode(D.LINE_STRIP)}else H.isPoints?ye.setMode(D.POINTS):H.isSprite&&ye.setMode(D.TRIANGLES);if(H.isBatchedMesh)if(ie.get("WEBGL_multi_draw"))ye.renderMultiDraw(H._multiDrawStarts,H._multiDrawCounts,H._multiDrawCount);else{let Ye=H._multiDrawStarts,Tt=H._multiDrawCounts,Qe=H._multiDrawCount,le=Rt?ut.get(Rt).bytesPerElement:1,gn=V.get(k).currentProgram.getUniforms();for(let Fn=0;Fn<Qe;Fn++)gn.setValue(D,"_gl_DrawID",Fn),ye.render(Ye[Fn]/le,Tt[Fn])}else if(H.isInstancedMesh)ye.renderInstances(Ct,Ie,H.count);else if(q.isInstancedBufferGeometry){let Ye=q._maxInstanceCount!==void 0?q._maxInstanceCount:1/0,Tt=Math.min(q.instanceCount,Ye);ye.renderInstances(Ct,Ie,Tt)}else ye.render(Ct,Ie)};function Lh(E,U,q,k){N!==null&&E.isNodeMaterial&&N.setObject(k,E),rt===!0&&Dt.setState(E,q,!1),E.transparent===!0&&E.side===Ee&&E.forceSinglePass===!1?(E.side=Ne,E.needsUpdate=!0,_a(E,U,k),E.side=Ii,E.needsUpdate=!0,_a(E,U,k),E.side=Ee):_a(E,U,k)}this.compile=function(E,U,q=null){q===null&&(q=E),N!==null&&N.renderStart(E,U,q),v=mt.get(q),v.init(U),x.push(v),q.traverseVisible(function(H){H.isLight&&H.layers.test(U.layers)&&(v.pushLight(H),H.castShadow&&v.pushShadow(H))}),E!==q&&E.traverseVisible(function(H){H.isLight&&H.layers.test(U.layers)&&(v.pushLight(H),H.castShadow&&v.pushShadow(H))}),v.setupLights(),N!==null&&N.updateLights(v.state.lightsArray),ot=this.localClippingEnabled,rt=Dt.init(this.clippingPlanes,ot),rt===!0&&Dt.setGlobalState(this.clippingPlanes,U),N!==null&&Gt.render(v.state.shadowsArray,q,U);let k=new Set;return E.traverse(function(H){if(!(H.isMesh||H.isPoints||H.isLine||H.isSprite))return;let St=H.material;if(St)if(Array.isArray(St))for(let wt=0;wt<St.length;wt++){let Mt=St[wt];Lh(Mt,q,U,H),k.add(Mt)}else Lh(St,q,U,H),k.add(St)}),v=x.pop(),N!==null&&N.renderEnd(),k},this.compileAsync=function(E,U,q=null){let k=this.compile(E,U,q);return new Promise(H=>{function St(){if(k.forEach(function(wt){let Rt=V.get(wt).currentProgram;(Rt===void 0||Rt.isReady())&&k.delete(wt)}),k.size===0){H(E);return}setTimeout(St,10)}ie.get("KHR_parallel_shader_compile")!==null?St():setTimeout(St,10)})};let Gl=null;function uf(E){Gl&&Gl(E)}function Dh(){Vi.stop()}function Nh(){Vi.start()}let Vi=new Fd;Vi.setAnimationLoop(uf),typeof self<"u"&&Vi.setContext(self),this.setAnimationLoop=function(E){Gl=E,Pt.setAnimationLoop(E),E===null?Vi.stop():Vi.start()},Pt.addEventListener("sessionstart",Dh),Pt.addEventListener("sessionend",Nh),this.render=function(E,U){if(U!==void 0&&U.isCamera!==!0){Wt("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(I===!0)return;N!==null&&N.renderStart(E,U);let q=Pt.enabled===!0&&Pt.isPresenting===!0,k=w!==null&&(tt===null||q)&&w.begin(R,tt);if(E.matrixWorldAutoUpdate===!0&&E.updateMatrixWorld(),U.parent===null&&U.matrixWorldAutoUpdate===!0&&U.updateMatrixWorld(),Pt.enabled===!0&&Pt.isPresenting===!0&&(w===null||w.isCompositing()===!1)&&(Pt.cameraAutoUpdate===!0&&Pt.updateCamera(U),U=Pt.getCamera()),E.isScene===!0&&E.onBeforeRender(R,E,U,tt),v=mt.get(E,x.length),v.init(U),v.state.textureUnits=K.getTextureUnits(),x.push(v),lt.multiplyMatrices(U.projectionMatrix,U.matrixWorldInverse),nt.setFromProjectionMatrix(lt,An,U.reversedDepth),ot=this.localClippingEnabled,rt=Dt.init(this.clippingPlanes,ot),b=xt.get(E,A.length),b.init(),A.push(b),Pt.enabled===!0&&Pt.isPresenting===!0){let wt=R.xr.getDepthSensingMesh();wt!==null&&Wl(wt,U,-1/0,R.sortObjects)}Wl(E,U,0,R.sortObjects),b.finish(),N!==null&&N.updateLights(v.state.lightsArray),R.sortObjects===!0&&b.sort(ht,Ft),Yt=Pt.enabled===!1||Pt.isPresenting===!1||Pt.hasDepthSensing()===!1,Yt&&jt.addToRenderList(b,E),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),rt===!0&&Dt.beginShadows();let H=v.state.shadowsArray;if(Gt.render(H,E,U),rt===!0&&Dt.endShadows(),(k&&w.hasRenderPass())===!1){let wt=b.opaque,Mt=b.transmissive;if(v.setupLights(),U.isArrayCamera){let Rt=U.cameras;if(Mt.length>0)for(let It=0,te=Rt.length;It<te;It++){let se=Rt[It];Fh(wt,Mt,E,se)}Yt&&jt.render(E);for(let It=0,te=Rt.length;It<te;It++){let se=Rt[It];Uh(b,E,se,se.viewport)}}else Mt.length>0&&Fh(wt,Mt,E,U),Yt&&jt.render(E),Uh(b,E,U)}tt!==null&&G===0&&(K.updateMultisampleRenderTarget(tt),K.updateRenderTargetMipmap(tt)),k&&w.end(R),E.isScene===!0&&E.onAfterRender(R,E,U),Et.resetDefaultState(),Z=-1,J=null,x.pop(),x.length>0?(v=x[x.length-1],K.setTextureUnits(v.state.textureUnits),rt===!0&&Dt.setGlobalState(R.clippingPlanes,v.state.camera)):v=null,A.pop(),A.length>0?b=A[A.length-1]:b=null,N!==null&&N.renderEnd()};function Wl(E,U,q,k){if(E.visible===!1)return;if(E.layers.test(U.layers)){if(E.isGroup)q=E.renderOrder;else if(E.isLOD)E.autoUpdate===!0&&E.update(U);else if(E.isLightProbeGrid)v.pushLightProbeGrid(E);else if(E.isLight)v.pushLight(E),E.castShadow&&v.pushShadow(E);else if(E.isSprite){if(!E.frustumCulled||E.intersectsFrustum(nt)){k&&Vt.setFromMatrixPosition(E.matrixWorld).applyMatrix4(lt);let wt=et.update(E),Mt=E.material;Mt.visible&&b.push(E,wt,Mt,q,Vt.z,null,U)}}else if((E.isMesh||E.isLine||E.isPoints)&&(!E.frustumCulled||E.intersectsFrustum(nt))){let wt=et.update(E),Mt=E.material;if(k&&(E.boundingSphere!==void 0?(E.boundingSphere===null&&E.computeBoundingSphere(),Vt.copy(E.boundingSphere.center)):(wt.boundingSphere===null&&wt.computeBoundingSphere(),Vt.copy(wt.boundingSphere.center)),Vt.applyMatrix4(E.matrixWorld).applyMatrix4(lt)),Array.isArray(Mt)){let Rt=wt.groups;for(let It=0,te=Rt.length;It<te;It++){let se=Rt[It],Ct=Mt[se.materialIndex];Ct&&Ct.visible&&b.push(E,wt,Ct,q,Vt.z,se,U)}}else Mt.visible&&b.push(E,wt,Mt,q,Vt.z,null,U)}}let St=E.children;for(let wt=0,Mt=St.length;wt<Mt;wt++)Wl(St[wt],U,q,k)}function Uh(E,U,q,k){let{opaque:H,transmissive:St,transparent:wt}=E;v.setupLightsView(q),rt===!0&&Dt.setGlobalState(R.clippingPlanes,q),k&&y.viewport(Y.copy(k)),H.length>0&&ga(H,U,q),St.length>0&&ga(St,U,q),wt.length>0&&ga(wt,U,q),y.buffers.depth.setTest(!0),y.buffers.depth.setMask(!0),y.buffers.color.setMask(!0),y.setPolygonOffset(!1)}function Fh(E,U,q,k){if((q.isScene===!0?q.overrideMaterial:null)!==null)return;if(v.state.transmissionRenderTarget[k.id]===void 0){let Ct=ie.has("EXT_color_buffer_half_float")||ie.has("EXT_color_buffer_float");v.state.transmissionRenderTarget[k.id]=new rn(1,1,{generateMipmaps:!0,type:Ct?Nn:an,minFilter:Di,samples:Math.max(4,C.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:re.workingColorSpace})}let St=v.state.transmissionRenderTarget[k.id],wt=k.viewport||Y;St.setSize(wt.z*R.transmissionResolutionScale,wt.w*R.transmissionResolutionScale);let Mt=R.getRenderTarget(),Rt=R.getActiveCubeFace(),It=R.getActiveMipmapLevel();R.setRenderTarget(St),R.getClearColor(At),kt=R.getClearAlpha(),kt<1&&R.setClearColor(16777215,.5),R.clear(),Yt&&jt.render(q);let te=R.toneMapping;R.toneMapping=Ln;let se=k.viewport;if(k.viewport!==void 0&&(k.viewport=void 0),v.setupLightsView(k),rt===!0&&Dt.setGlobalState(R.clippingPlanes,k),ga(E,q,k),K.updateMultisampleRenderTarget(St),K.updateRenderTargetMipmap(St),ie.has("WEBGL_multisampled_render_to_texture")===!1){let Ct=!1;for(let fe=0,Ie=U.length;fe<Ie;fe++){let Se=U[fe],{object:ye,geometry:Ye,material:Tt,group:Qe}=Se;if(Tt.side===Ee&&ye.layers.test(k.layers)){let le=Tt.side;Tt.side=Ne,Tt.needsUpdate=!0,Oh(ye,q,k,Ye,Tt,Qe),Tt.side=le,Tt.needsUpdate=!0,Ct=!0}}Ct===!0&&(K.updateMultisampleRenderTarget(St),K.updateRenderTargetMipmap(St))}R.setRenderTarget(Mt,Rt,It),R.setClearColor(At,kt),se!==void 0&&(k.viewport=se),R.toneMapping=te}function ga(E,U,q){let k=U.isScene===!0?U.overrideMaterial:null;for(let H=0,St=E.length;H<St;H++){let wt=E[H],{object:Mt,geometry:Rt,group:It}=wt,te=wt.material;te.allowOverride===!0&&k!==null&&(te=k),Mt.layers.test(q.layers)&&Oh(Mt,U,q,Rt,te,It)}}function Oh(E,U,q,k,H,St){N!==null&&H.isNodeMaterial&&N.setObject(E,H),E.onBeforeRender(R,U,q,k,H,St),E.modelViewMatrix.multiplyMatrices(q.matrixWorldInverse,E.matrixWorld),E.normalMatrix.getNormalMatrix(E.modelViewMatrix),H.onBeforeRender(R,U,q,k,E,St),H.transparent===!0&&H.side===Ee&&H.forceSinglePass===!1?(H.side=Ne,H.needsUpdate=!0,R.renderBufferDirect(q,U,k,H,E,St),H.side=Ii,H.needsUpdate=!0,R.renderBufferDirect(q,U,k,H,E,St),H.side=Ee):R.renderBufferDirect(q,U,k,H,E,St),E.onAfterRender(R,U,q,k,H,St)}function _a(E,U,q){U.isScene!==!0&&(U=Ot);let k=V.get(E),H=v.state.lights,St=v.state.shadowsArray,wt=H.state.version,Mt=pt.getParameters(E,H.state,St,U,q,v.state.lightProbeGridArray),Rt=pt.getProgramCacheKey(Mt),It=k.programs;k.environment=E.isMeshStandardMaterial||E.isMeshLambertMaterial||E.isMeshPhongMaterial?U.environment:null,k.fog=U.fog;let te=E.isMeshStandardMaterial||E.isMeshLambertMaterial&&!E.envMap||E.isMeshPhongMaterial&&!E.envMap;k.envMap=ct.get(E.envMap||k.environment,te),k.envMapRotation=k.environment!==null&&E.envMap===null?U.environmentRotation:E.envMapRotation,It===void 0&&(E.addEventListener("dispose",Un),It=new Map,k.programs=It);let se=It.get(Rt);if(se!==void 0){if(k.currentProgram===se&&k.lightsStateVersion===wt)return zh(E,Mt),se}else Mt.uniforms=pt.getUniforms(E),N!==null&&E.isNodeMaterial&&N.build(E,q,Mt),E.onBeforeCompile(Mt,R),se=pt.acquireProgram(Mt,Rt),It.set(Rt,se),k.uniforms=Mt.uniforms;let Ct=k.uniforms;return(!E.isShaderMaterial&&!E.isRawShaderMaterial||E.clipping===!0)&&(Ct.clippingPlanes=Dt.uniform),zh(E,Mt),k.needsLights=mf(E),k.lightsStateVersion=wt,k.needsLights&&(Ct.ambientLightColor.value=H.state.ambient,Ct.lightProbe.value=H.state.probe,Ct.sunLights.value=H.state.sun,Ct.sunLightShadows.value=H.state.sunShadow,Ct.directionalLights.value=H.state.directional,Ct.directionalLightShadows.value=H.state.directionalShadow,Ct.spotLights.value=H.state.spot,Ct.spotLightShadows.value=H.state.spotShadow,Ct.rectAreaLights.value=H.state.rectArea,Ct.ltc_1.value=H.state.rectAreaLTC1,Ct.ltc_2.value=H.state.rectAreaLTC2,Ct.pointLights.value=H.state.point,Ct.pointLightShadows.value=H.state.pointShadow,Ct.hemisphereLights.value=H.state.hemi,Ct.sunShadowMatrix.value=H.state.sunShadowMatrix,Ct.sunShadowCascade.value=H.state.sunShadowCascade,Ct.directionalShadowMatrix.value=H.state.directionalShadowMatrix,Ct.spotLightMatrix.value=H.state.spotLightMatrix,Ct.spotLightMap.value=H.state.spotLightMap,Ct.pointShadowMatrix.value=H.state.pointShadowMatrix),k.lightProbeGrid=v.state.lightProbeGridArray.length>0,k.currentProgram=se,k.uniformsList=null,se}function Bh(E){if(E.uniformsList===null){let U=E.currentProgram.getUniforms();E.uniformsList=Zs.seqWithValue(U.seq,E.uniforms)}return E.uniformsList}function zh(E,U){let q=V.get(E);q.outputColorSpace=U.outputColorSpace,q.batching=U.batching,q.batchingColor=U.batchingColor,q.instancing=U.instancing,q.instancingColor=U.instancingColor,q.instancingMorph=U.instancingMorph,q.skinning=U.skinning,q.morphTargets=U.morphTargets,q.morphNormals=U.morphNormals,q.morphColors=U.morphColors,q.morphTargetsCount=U.morphTargetsCount,q.numClippingPlanes=U.numClippingPlanes,q.numIntersection=U.numClipIntersection,q.vertexAlphas=U.vertexAlphas,q.vertexTangents=U.vertexTangents,q.toneMapping=U.toneMapping}function df(E,U){if(E.length===0)return null;if(E.length===1)return E[0].texture!==null?E[0]:null;_.setFromMatrixPosition(U.matrixWorld);for(let q=0,k=E.length;q<k;q++){let H=E[q];if(H.texture!==null&&H.boundingBox.containsPoint(_))return H}return null}function ff(E,U,q,k,H){U.isScene!==!0&&(U=Ot),K.resetTextureUnits();let St=U.fog,wt=k.isMeshStandardMaterial||k.isMeshLambertMaterial||k.isMeshPhongMaterial?U.environment:null,Mt=tt===null?R.outputColorSpace:tt.isXRRenderTarget===!0?tt.texture.colorSpace:re.workingColorSpace,Rt=k.isMeshStandardMaterial||k.isMeshLambertMaterial&&!k.envMap||k.isMeshPhongMaterial&&!k.envMap,It=ct.get(k.envMap||wt,Rt),te=k.vertexColors===!0&&!!q.attributes.color&&q.attributes.color.itemSize===4,se=!!q.attributes.tangent&&(!!k.normalMap||k.anisotropy>0),Ct=!!q.morphAttributes.position,fe=!!q.morphAttributes.normal,Ie=!!q.morphAttributes.color,Se=Ln;k.toneMapped&&(tt===null||tt.isXRRenderTarget===!0)&&(Se=R.toneMapping);let ye=q.morphAttributes.position||q.morphAttributes.normal||q.morphAttributes.color,Ye=ye!==void 0?ye.length:0,Tt=V.get(k),Qe=v.state.lights;if(rt===!0&&(ot===!0||E!==J)){let Me=E===J&&k.id===Z;Dt.setState(k,E,Me)}let le=!1;k.version===Tt.__version?(Tt.needsLights&&Tt.lightsStateVersion!==Qe.state.version||Tt.outputColorSpace!==Mt||H.isBatchedMesh&&Tt.batching===!1||!H.isBatchedMesh&&Tt.batching===!0||H.isBatchedMesh&&Tt.batchingColor===!0&&H._colorsTexture===null||H.isBatchedMesh&&Tt.batchingColor===!1&&H._colorsTexture!==null||H.isInstancedMesh&&Tt.instancing===!1||!H.isInstancedMesh&&Tt.instancing===!0||H.isSkinnedMesh&&Tt.skinning===!1||!H.isSkinnedMesh&&Tt.skinning===!0||H.isInstancedMesh&&Tt.instancingColor===!0&&H.instanceColor===null||H.isInstancedMesh&&Tt.instancingColor===!1&&H.instanceColor!==null||H.isInstancedMesh&&Tt.instancingMorph===!0&&H.morphTexture===null||H.isInstancedMesh&&Tt.instancingMorph===!1&&H.morphTexture!==null||Tt.envMap!==It||k.fog===!0&&Tt.fog!==St||Tt.numClippingPlanes!==void 0&&(Tt.numClippingPlanes!==Dt.numPlanes||Tt.numIntersection!==Dt.numIntersection)||Tt.vertexAlphas!==te||Tt.vertexTangents!==se||Tt.morphTargets!==Ct||Tt.morphNormals!==fe||Tt.morphColors!==Ie||Tt.toneMapping!==Se||Tt.morphTargetsCount!==Ye||!!Tt.lightProbeGrid!=v.state.lightProbeGridArray.length>0)&&(le=!0):(le=!0,Tt.__version=k.version);let gn=Tt.currentProgram;le===!0&&(gn=_a(k,U,H),N&&k.isNodeMaterial&&N.onUpdateProgram(k,gn,Tt));let Fn=!1,fi=!1,os=!1,xe=gn.getUniforms(),Ce=Tt.uniforms;if(y.useProgram(gn.program)&&(Fn=!0,fi=!0,os=!0),k.id!==Z&&(Z=k.id,fi=!0),Tt.needsLights){let Me=df(v.state.lightProbeGridArray,H);Tt.lightProbeGrid!==Me&&(Tt.lightProbeGrid=Me,fi=!0)}if(Fn||J!==E){y.buffers.depth.getReversed()&&E.reversedDepth!==!0&&(E._reversedDepth=!0,E.updateProjectionMatrix()),xe.setValue(D,"projectionMatrix",E.projectionMatrix),xe.setValue(D,"viewMatrix",E.matrixWorldInverse);let mi=xe.map.cameraPosition;mi!==void 0&&mi.setValue(D,dt.setFromMatrixPosition(E.matrixWorld)),C.logarithmicDepthBuffer&&xe.setValue(D,"logDepthBufFC",2/(Math.log(E.far+1)/Math.LN2)),(k.isMeshPhongMaterial||k.isMeshToonMaterial||k.isMeshLambertMaterial||k.isMeshBasicMaterial||k.isMeshStandardMaterial||k.isShaderMaterial)&&xe.setValue(D,"isOrthographic",E.isOrthographicCamera===!0),J!==E&&(J=E,fi=!0,os=!0)}if(Tt.needsLights&&(Qe.state.sunShadowMap.length>0&&xe.setValue(D,"sunShadowMap",Qe.state.sunShadowMap,K),Qe.state.directionalShadowMap.length>0&&xe.setValue(D,"directionalShadowMap",Qe.state.directionalShadowMap,K),Qe.state.spotShadowMap.length>0&&xe.setValue(D,"spotShadowMap",Qe.state.spotShadowMap,K),Qe.state.pointShadowMap.length>0&&xe.setValue(D,"pointShadowMap",Qe.state.pointShadowMap,K)),H.isSkinnedMesh){xe.setOptional(D,H,"bindMatrix"),xe.setOptional(D,H,"bindMatrixInverse");let Me=H.skeleton;Me&&(Me.boneTexture===null&&Me.computeBoneTexture(),xe.setValue(D,"boneTexture",Me.boneTexture,K))}H.isBatchedMesh&&(xe.setOptional(D,H,"batchingTexture"),xe.setValue(D,"batchingTexture",H._matricesTexture,K),xe.setOptional(D,H,"batchingIdTexture"),xe.setValue(D,"batchingIdTexture",H._indirectTexture,K),xe.setOptional(D,H,"batchingColorTexture"),H._colorsTexture!==null&&xe.setValue(D,"batchingColorTexture",H._colorsTexture,K));let pi=q.morphAttributes;if((pi.position!==void 0||pi.normal!==void 0||pi.color!==void 0)&&O.update(H,q,gn),(fi||Tt.receiveShadow!==H.receiveShadow)&&(Tt.receiveShadow=H.receiveShadow,xe.setValue(D,"receiveShadow",H.receiveShadow)),(k.isMeshStandardMaterial||k.isMeshLambertMaterial||k.isMeshPhongMaterial)&&k.envMap===null&&U.environment!==null&&(Ce.envMapIntensity.value=U.environmentIntensity),Ce.dfgLUT!==void 0&&(Ce.dfgLUT.value=Ax()),fi){if(xe.setValue(D,"toneMappingExposure",R.toneMappingExposure),Tt.needsLights&&pf(Ce,os),St&&k.fog===!0&&Lt.refreshFogUniforms(Ce,St),Lt.refreshMaterialUniforms(Ce,k,j,W,v.state.transmissionRenderTarget[E.id]),Tt.needsLights&&Tt.lightProbeGrid){let Me=Tt.lightProbeGrid;Ce.probesSH.value=Me.texture,Ce.probesMin.value.copy(Me.boundingBox.min),Ce.probesMax.value.copy(Me.boundingBox.max),Ce.probesResolution.value.copy(Me.resolution)}Zs.upload(D,Bh(Tt),Ce,K)}if(k.isShaderMaterial&&k.uniformsNeedUpdate===!0&&(Zs.upload(D,Bh(Tt),Ce,K),k.uniformsNeedUpdate=!1),k.isSpriteMaterial&&xe.setValue(D,"center",H.center),xe.setValue(D,"modelViewMatrix",H.modelViewMatrix),xe.setValue(D,"normalMatrix",H.normalMatrix),xe.setValue(D,"modelMatrix",H.matrixWorld),k.uniformsGroups!==void 0){let Me=k.uniformsGroups;for(let mi=0,ls=Me.length;mi<ls;mi++){let Hh=Me[mi];st.update(Hh,gn),st.bind(Hh,gn)}}return gn}function pf(E,U){E.ambientLightColor.needsUpdate=U,E.lightProbe.needsUpdate=U,E.sunLights.needsUpdate=U,E.sunLightShadows.needsUpdate=U,E.directionalLights.needsUpdate=U,E.directionalLightShadows.needsUpdate=U,E.pointLights.needsUpdate=U,E.pointLightShadows.needsUpdate=U,E.spotLights.needsUpdate=U,E.spotLightShadows.needsUpdate=U,E.rectAreaLights.needsUpdate=U,E.hemisphereLights.needsUpdate=U}function mf(E){return E.isMeshLambertMaterial||E.isMeshToonMaterial||E.isMeshPhongMaterial||E.isMeshStandardMaterial||E.isShadowMaterial||E.isShaderMaterial&&E.lights===!0}this.getActiveCubeFace=function(){return X},this.getActiveMipmapLevel=function(){return G},this.getRenderTarget=function(){return tt},this.setRenderTargetTextures=function(E,U,q){let k=V.get(E);k.__autoAllocateDepthBuffer=E.resolveDepthBuffer===!1,k.__autoAllocateDepthBuffer===!1&&(k.__useRenderToTexture=!1),V.get(E.texture).__webglTexture=U,V.get(E.depthTexture).__webglTexture=k.__autoAllocateDepthBuffer?void 0:q,k.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(E,U){let q=V.get(E);q.__webglFramebuffer=U,q.__useDefaultFramebuffer=U===void 0},this.setRenderTarget=function(E,U=0,q=0){tt=E,X=U,G=q;let k=null,H=!1,St=!1;if(E){let Mt=V.get(E);if(Mt.__useDefaultFramebuffer!==void 0){y.bindFramebuffer(D.FRAMEBUFFER,Mt.__webglFramebuffer),Y.copy(E.viewport),ft.copy(E.scissor),bt=E.scissorTest,y.viewport(Y),y.scissor(ft),y.setScissorTest(bt),Z=-1;return}else if(Mt.__webglFramebuffer===void 0)K.setupRenderTarget(E);else if(Mt.__hasExternalTextures)K.rebindTextures(E,V.get(E.texture).__webglTexture,V.get(E.depthTexture).__webglTexture);else if(E.depthBuffer){let te=E.depthTexture;if(Mt.__boundDepthTexture!==te){if(te!==null&&V.has(te)&&(E.width!==te.image.width||E.height!==te.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");K.setupDepthRenderbuffer(E)}}let Rt=E.texture;(Rt.isData3DTexture||Rt.isDataArrayTexture||Rt.isCompressedArrayTexture)&&(St=!0);let It=V.get(E).__webglFramebuffer;E.isWebGLCubeRenderTarget?(Array.isArray(It[U])?k=It[U][q]:k=It[U],H=!0):E.samples>0&&K.useMultisampledRTT(E)===!1?k=V.get(E).__webglMultisampledFramebuffer:Array.isArray(It)?k=It[q]:k=It,Y.copy(E.viewport),ft.copy(E.scissor),bt=E.scissorTest}else Y.copy(vt).multiplyScalar(j).floor(),ft.copy(qt).multiplyScalar(j).floor(),bt=me;if(q!==0&&(k=F),y.bindFramebuffer(D.FRAMEBUFFER,k)&&y.drawBuffers(E,k),y.viewport(Y),y.scissor(ft),y.setScissorTest(bt),H){let Mt=V.get(E.texture);D.framebufferTexture2D(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_CUBE_MAP_POSITIVE_X+U,Mt.__webglTexture,q)}else if(St){let Mt=U;for(let Rt=0;Rt<E.textures.length;Rt++){let It=V.get(E.textures[Rt]);D.framebufferTextureLayer(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0+Rt,It.__webglTexture,q,Mt)}}else if(E!==null&&q!==0){let Mt=V.get(E.texture);D.framebufferTexture2D(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,Mt.__webglTexture,q)}Z=-1};function kh(E){let U=V.get(E);return(U.__readFormat!==E.format||U.__readType!==E.type)&&(U.__readFormat=E.format,U.__readType=E.type,U.__formatReadable=C.textureFormatReadable(E.format),U.__typeReadable=C.textureTypeReadable(E.type)),U}this.readRenderTargetPixels=function(E,U,q,k,H,St,wt,Mt=0){if(!(E&&E.isWebGLRenderTarget)){Wt("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Rt=V.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&wt!==void 0&&(Rt=Rt[wt]),Rt){y.bindFramebuffer(D.FRAMEBUFFER,Rt);try{let It=E.textures[Mt],te=It.format,se=It.type;E.textures.length>1&&D.readBuffer(D.COLOR_ATTACHMENT0+Mt);let Ct=kh(It);if(Ct.__formatReadable===!1){Wt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Ct.__typeReadable===!1){Wt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}U>=0&&U<=E.width-k&&q>=0&&q<=E.height-H&&D.readPixels(U,q,k,H,_t.convert(te),_t.convert(se),St)}finally{let It=tt!==null?V.get(tt).__webglFramebuffer:null;y.bindFramebuffer(D.FRAMEBUFFER,It)}}},this.readRenderTargetPixelsAsync=async function(E,U,q,k,H,St,wt,Mt=0){if(!(E&&E.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Rt=V.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&wt!==void 0&&(Rt=Rt[wt]),Rt)if(U>=0&&U<=E.width-k&&q>=0&&q<=E.height-H){y.bindFramebuffer(D.FRAMEBUFFER,Rt);let It=E.textures[Mt],te=It.format,se=It.type;E.textures.length>1&&D.readBuffer(D.COLOR_ATTACHMENT0+Mt);let Ct=kh(It);if(Ct.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Ct.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let fe=D.createBuffer();D.bindBuffer(D.PIXEL_PACK_BUFFER,fe),D.bufferData(D.PIXEL_PACK_BUFFER,St.byteLength,D.STREAM_READ),D.readPixels(U,q,k,H,_t.convert(te),_t.convert(se),0),D.bindBuffer(D.PIXEL_PACK_BUFFER,null);let Ie=tt!==null?V.get(tt).__webglFramebuffer:null;y.bindFramebuffer(D.FRAMEBUFFER,Ie);let Se=D.fenceSync(D.SYNC_GPU_COMMANDS_COMPLETE,0);return D.flush(),await sd(D,Se,4),D.bindBuffer(D.PIXEL_PACK_BUFFER,fe),D.getBufferSubData(D.PIXEL_PACK_BUFFER,0,St),D.bindBuffer(D.PIXEL_PACK_BUFFER,null),D.deleteBuffer(fe),D.deleteSync(Se),St}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(E,U=null,q=0){let k=Math.pow(2,-q),H=Math.floor(E.image.width*k),St=Math.floor(E.image.height*k),wt=U!==null?U.x:0,Mt=U!==null?U.y:0;K.setTexture2D(E,0),D.copyTexSubImage2D(D.TEXTURE_2D,q,0,0,wt,Mt,H,St),y.unbindTexture()},this.copyTextureToTexture=function(E,U,q=null,k=null,H=0,St=0){let wt,Mt,Rt,It,te,se,Ct,fe,Ie,Se=E.isCompressedTexture?E.mipmaps[St]:E.image;if(q!==null)wt=q.max.x-q.min.x,Mt=q.max.y-q.min.y,Rt=q.isBox3?q.max.z-q.min.z:1,It=q.min.x,te=q.min.y,se=q.isBox3?q.min.z:0;else{let Ce=Math.pow(2,-H);wt=Math.floor(Se.width*Ce),Mt=Math.floor(Se.height*Ce),E.isDataArrayTexture?Rt=Se.depth:E.isData3DTexture?Rt=Math.floor(Se.depth*Ce):Rt=1,It=0,te=0,se=0}k!==null?(Ct=k.x,fe=k.y,Ie=k.z):(Ct=0,fe=0,Ie=0);let ye=_t.convert(U.format),Ye=_t.convert(U.type),Tt;U.isData3DTexture?(K.setTexture3D(U,0),Tt=D.TEXTURE_3D):U.isDataArrayTexture||U.isCompressedArrayTexture?(K.setTexture2DArray(U,0),Tt=D.TEXTURE_2D_ARRAY):(K.setTexture2D(U,0),Tt=D.TEXTURE_2D),y.activeTexture(D.TEXTURE0),y.pixelStorei(D.UNPACK_FLIP_Y_WEBGL,U.flipY),y.pixelStorei(D.UNPACK_PREMULTIPLY_ALPHA_WEBGL,U.premultiplyAlpha),y.pixelStorei(D.UNPACK_ALIGNMENT,U.unpackAlignment);let Qe=y.getParameter(D.UNPACK_ROW_LENGTH),le=y.getParameter(D.UNPACK_IMAGE_HEIGHT),gn=y.getParameter(D.UNPACK_SKIP_PIXELS),Fn=y.getParameter(D.UNPACK_SKIP_ROWS),fi=y.getParameter(D.UNPACK_SKIP_IMAGES);y.pixelStorei(D.UNPACK_ROW_LENGTH,Se.width),y.pixelStorei(D.UNPACK_IMAGE_HEIGHT,Se.height),y.pixelStorei(D.UNPACK_SKIP_PIXELS,It),y.pixelStorei(D.UNPACK_SKIP_ROWS,te),y.pixelStorei(D.UNPACK_SKIP_IMAGES,se);let os=E.isDataArrayTexture||E.isData3DTexture,xe=U.isDataArrayTexture||U.isData3DTexture;if(E.isDepthTexture){let Ce=V.get(E),pi=V.get(U),Me=V.get(Ce.__renderTarget),mi=V.get(pi.__renderTarget);y.bindFramebuffer(D.READ_FRAMEBUFFER,Me.__webglFramebuffer),y.bindFramebuffer(D.DRAW_FRAMEBUFFER,mi.__webglFramebuffer);for(let ls=0;ls<Rt;ls++)os&&(D.framebufferTextureLayer(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,V.get(E).__webglTexture,H,se+ls),D.framebufferTextureLayer(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,V.get(U).__webglTexture,St,Ie+ls)),D.blitFramebuffer(It,te,wt,Mt,Ct,fe,wt,Mt,D.DEPTH_BUFFER_BIT,D.NEAREST);y.bindFramebuffer(D.READ_FRAMEBUFFER,null),y.bindFramebuffer(D.DRAW_FRAMEBUFFER,null)}else if(H!==0||E.isRenderTargetTexture||V.has(E)){let Ce=V.get(E),pi=V.get(U);y.bindFramebuffer(D.READ_FRAMEBUFFER,L),y.bindFramebuffer(D.DRAW_FRAMEBUFFER,B);for(let Me=0;Me<Rt;Me++)os?D.framebufferTextureLayer(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,Ce.__webglTexture,H,se+Me):D.framebufferTexture2D(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,Ce.__webglTexture,H),xe?D.framebufferTextureLayer(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,pi.__webglTexture,St,Ie+Me):D.framebufferTexture2D(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,pi.__webglTexture,St),H!==0?D.blitFramebuffer(It,te,wt,Mt,Ct,fe,wt,Mt,D.COLOR_BUFFER_BIT,D.NEAREST):xe?D.copyTexSubImage3D(Tt,St,Ct,fe,Ie+Me,It,te,wt,Mt):D.copyTexSubImage2D(Tt,St,Ct,fe,It,te,wt,Mt);y.bindFramebuffer(D.READ_FRAMEBUFFER,null),y.bindFramebuffer(D.DRAW_FRAMEBUFFER,null)}else xe?E.isDataTexture||E.isData3DTexture?D.texSubImage3D(Tt,St,Ct,fe,Ie,wt,Mt,Rt,ye,Ye,Se.data):U.isCompressedArrayTexture?D.compressedTexSubImage3D(Tt,St,Ct,fe,Ie,wt,Mt,Rt,ye,Se.data):D.texSubImage3D(Tt,St,Ct,fe,Ie,wt,Mt,Rt,ye,Ye,Se):E.isDataTexture?D.texSubImage2D(D.TEXTURE_2D,St,Ct,fe,wt,Mt,ye,Ye,Se.data):E.isCompressedTexture?D.compressedTexSubImage2D(D.TEXTURE_2D,St,Ct,fe,Se.width,Se.height,ye,Se.data):D.texSubImage2D(D.TEXTURE_2D,St,Ct,fe,wt,Mt,ye,Ye,Se);y.pixelStorei(D.UNPACK_ROW_LENGTH,Qe),y.pixelStorei(D.UNPACK_IMAGE_HEIGHT,le),y.pixelStorei(D.UNPACK_SKIP_PIXELS,gn),y.pixelStorei(D.UNPACK_SKIP_ROWS,Fn),y.pixelStorei(D.UNPACK_SKIP_IMAGES,fi),St===0&&U.generateMipmaps&&D.generateMipmap(Tt),y.unbindTexture()},this.initRenderTarget=function(E){V.get(E).__webglFramebuffer===void 0&&K.setupRenderTarget(E)},this.initTexture=function(E){E.isCubeTexture?K.setTextureCube(E,0):E.isData3DTexture?K.setTexture3D(E,0):E.isDataArrayTexture||E.isCompressedArrayTexture?K.setTexture2DArray(E,0):K.setTexture2D(E,0),y.unbindTexture()},this.resetState=function(){X=0,G=0,tt=null,y.reset(),Et.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return An}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;let e=this.getContext();e.drawingBufferColorSpace=re._getDrawingBufferColorSpace(t),e.unpackColorSpace=re._getUnpackColorSpace()}};var Gd={type:"change"},Sh={type:"start"},Xd={type:"end"},Rl=new Ji,Wd=new dn,Rx=Math.cos(70*Jc.DEG2RAD),Oe=new P,on=2*Math.PI,_e={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},Mh=1e-6,Cl=class extends Kr{constructor(t,e=null){super(t,e),this.state=_e.NONE,this.target=new P,this.cursor=new P,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:Ci.ROTATE,MIDDLE:Ci.DOLLY,RIGHT:Ci.PAN},this.touches={ONE:Pi.ROTATE,TWO:Pi.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._cursorStyle="auto",this._domElementKeyEvents=null,this._lastPosition=new P,this._lastQuaternion=new Ke,this._lastTargetPosition=new P,this._quat=new Ke().setFromUnitVectors(t.up,new P(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new Hs,this._sphericalDelta=new Hs,this._scale=1,this._panOffset=new P,this._rotateStart=new it,this._rotateEnd=new it,this._rotateDelta=new it,this._panStart=new it,this._panEnd=new it,this._panDelta=new it,this._dollyStart=new it,this._dollyEnd=new it,this._dollyDelta=new it,this._dollyDirection=new P,this._mouse=new it,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=Px.bind(this),this._onPointerDown=Cx.bind(this),this._onPointerUp=Ix.bind(this),this._onContextMenu=Bx.bind(this),this._onMouseWheel=Nx.bind(this),this._onKeyDown=Ux.bind(this),this._onTouchStart=Fx.bind(this),this._onTouchMove=Ox.bind(this),this._onMouseDown=Lx.bind(this),this._onMouseMove=Dx.bind(this),this._interceptControlDown=zx.bind(this),this._interceptControlUp=kx.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}set cursorStyle(t){this._cursorStyle=t,t==="grab"?this.domElement.style.cursor="grab":this.domElement.style.cursor="auto"}get cursorStyle(){return this._cursorStyle}connect(t){super.connect(t),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.state=_e.NONE,this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents();let t=this.domElement.getRootNode();t.removeEventListener("keydown",this._interceptControlDown,{capture:!0}),t.removeEventListener("keyup",this._interceptControlUp,{capture:!0}),this._controlActive=!1,this._pointers.length=0,this._pointerPositions={},this.domElement.style.touchAction="",this.domElement.style.cursor="auto"}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(t){t.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=t}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(Gd),this.update(),this.state=_e.NONE}pan(t,e){this._pan(t,e),this.update()}dollyIn(t){this._dollyIn(t),this.update()}dollyOut(t){this._dollyOut(t),this.update()}rotateLeft(t){this._rotateLeft(t),this.update()}rotateUp(t){this._rotateUp(t),this.update()}update(t=null){let e=this.object.position;Oe.copy(e).sub(this.target),Oe.applyQuaternion(this._quat),this._spherical.setFromVector3(Oe),this.autoRotate&&this.state===_e.NONE&&this._rotateLeft(this._getAutoRotationAngle(t)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let n=this.minAzimuthAngle,s=this.maxAzimuthAngle;isFinite(n)&&isFinite(s)&&(n<-Math.PI?n+=on:n>Math.PI&&(n-=on),s<-Math.PI?s+=on:s>Math.PI&&(s-=on),n<=s?this._spherical.theta=Math.max(n,Math.min(s,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(n+s)/2?Math.max(n,this._spherical.theta):Math.min(s,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let r=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{let a=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),r=a!=this._spherical.radius}if(Oe.setFromSpherical(this._spherical),Oe.applyQuaternion(this._quatInverse),e.copy(this.target).add(Oe),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let a=null;if(this.object.isPerspectiveCamera){let o=Oe.length();a=this._clampDistance(o*this._scale);let l=o-a;this.object.position.addScaledVector(this._dollyDirection,l),this.object.updateMatrixWorld(),r=!!l}else if(this.object.isOrthographicCamera){let o=new P(this._mouse.x,this._mouse.y,0);o.unproject(this.object);let l=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),r=l!==this.object.zoom;let c=new P(this._mouse.x,this._mouse.y,0);c.unproject(this.object),this.object.position.sub(c).add(o),this.object.updateMatrixWorld(),a=Oe.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;a!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(a).add(this.object.position):(Rl.origin.copy(this.object.position),Rl.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(Rl.direction))<Rx?this.object.lookAt(this.target):(Wd.setFromNormalAndCoplanarPoint(this.object.up,this.target),Rl.intersectPlane(Wd,this.target))))}else if(this.object.isOrthographicCamera){let a=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),a!==this.object.zoom&&(this.object.updateProjectionMatrix(),r=!0)}return this._scale=1,this._performCursorZoom=!1,r||this._lastPosition.distanceToSquared(this.object.position)>Mh||8*(1-this._lastQuaternion.dot(this.object.quaternion))>Mh||this._lastTargetPosition.distanceToSquared(this.target)>Mh?(this.dispatchEvent(Gd),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(t){return t!==null?on/60*this.autoRotateSpeed*t:on/60/60*this.autoRotateSpeed}_getZoomScale(t){let e=Math.abs(t*.01);return Math.pow(.95,this.zoomSpeed*e)}_rotateLeft(t){this._sphericalDelta.theta-=t}_rotateUp(t){this._sphericalDelta.phi-=t}_panLeft(t,e){Oe.setFromMatrixColumn(e,0),Oe.multiplyScalar(-t),this._panOffset.add(Oe)}_panUp(t,e){this.screenSpacePanning===!0?Oe.setFromMatrixColumn(e,1):(Oe.setFromMatrixColumn(e,0),Oe.crossVectors(this.object.up,Oe)),Oe.multiplyScalar(t),this._panOffset.add(Oe)}_pan(t,e){let n=this.domElement;if(this.object.isPerspectiveCamera){let s=this.object.position;Oe.copy(s).sub(this.target);let r=Oe.length();r*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*t*r/n.clientHeight,this.object.matrix),this._panUp(2*e*r/n.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(t*(this.object.right-this.object.left)/this.object.zoom/n.clientWidth,this.object.matrix),this._panUp(e*(this.object.top-this.object.bottom)/this.object.zoom/n.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(t){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=t:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(t){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=t:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(t,e){if(!this.zoomToCursor)return;this._performCursorZoom=!0;let n=this.domElement.getBoundingClientRect(),s=t-n.left,r=e-n.top,a=n.width,o=n.height;this._mouse.x=s/a*2-1,this._mouse.y=-(r/o)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(t){return Math.max(this.minDistance,Math.min(this.maxDistance,t))}_handleMouseDownRotate(t){this._rotateStart.set(t.clientX,t.clientY)}_handleMouseDownDolly(t){this._updateZoomParameters(t.clientX,t.clientX),this._dollyStart.set(t.clientX,t.clientY)}_handleMouseDownPan(t){this._panStart.set(t.clientX,t.clientY)}_handleMouseMoveRotate(t){this._rotateEnd.set(t.clientX,t.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let e=this.domElement;this._rotateLeft(on*this._rotateDelta.x/e.clientHeight),this._rotateUp(on*this._rotateDelta.y/e.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(t){this._dollyEnd.set(t.clientX,t.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(t){this._panEnd.set(t.clientX,t.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(t){this._updateZoomParameters(t.clientX,t.clientY),t.deltaY<0?this._dollyIn(this._getZoomScale(t.deltaY)):t.deltaY>0&&this._dollyOut(this._getZoomScale(t.deltaY)),this.update()}_handleKeyDown(t){let e=!1;switch(t.code){case this.keys.UP:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateUp(on*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),e=!0;break;case this.keys.BOTTOM:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateUp(-on*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),e=!0;break;case this.keys.LEFT:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateLeft(on*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),e=!0;break;case this.keys.RIGHT:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateLeft(-on*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),e=!0;break}e&&(t.preventDefault(),this.update())}_handleTouchStartRotate(t){if(this._pointers.length===1)this._rotateStart.set(t.pageX,t.pageY);else{let e=this._getSecondPointerPosition(t),n=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._rotateStart.set(n,s)}}_handleTouchStartPan(t){if(this._pointers.length===1)this._panStart.set(t.pageX,t.pageY);else{let e=this._getSecondPointerPosition(t),n=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._panStart.set(n,s)}}_handleTouchStartDolly(t){let e=this._getSecondPointerPosition(t),n=t.pageX-e.x,s=t.pageY-e.y,r=Math.sqrt(n*n+s*s);this._dollyStart.set(0,r)}_handleTouchStartDollyPan(t){this.enableZoom&&this._handleTouchStartDolly(t),this.enablePan&&this._handleTouchStartPan(t)}_handleTouchStartDollyRotate(t){this.enableZoom&&this._handleTouchStartDolly(t),this.enableRotate&&this._handleTouchStartRotate(t)}_handleTouchMoveRotate(t){if(this._pointers.length==1)this._rotateEnd.set(t.pageX,t.pageY);else{let n=this._getSecondPointerPosition(t),s=.5*(t.pageX+n.x),r=.5*(t.pageY+n.y);this._rotateEnd.set(s,r)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let e=this.domElement;this._rotateLeft(on*this._rotateDelta.x/e.clientHeight),this._rotateUp(on*this._rotateDelta.y/e.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(t){if(this._pointers.length===1)this._panEnd.set(t.pageX,t.pageY);else{let e=this._getSecondPointerPosition(t),n=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._panEnd.set(n,s)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(t){let e=this._getSecondPointerPosition(t),n=t.pageX-e.x,s=t.pageY-e.y,r=Math.sqrt(n*n+s*s);this._dollyEnd.set(0,r),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);let a=(t.pageX+e.x)*.5,o=(t.pageY+e.y)*.5;this._updateZoomParameters(a,o)}_handleTouchMoveDollyPan(t){this.enableZoom&&this._handleTouchMoveDolly(t),this.enablePan&&this._handleTouchMovePan(t)}_handleTouchMoveDollyRotate(t){this.enableZoom&&this._handleTouchMoveDolly(t),this.enableRotate&&this._handleTouchMoveRotate(t)}_addPointer(t){this._pointers.push(t.pointerId)}_removePointer(t){delete this._pointerPositions[t.pointerId];for(let e=0;e<this._pointers.length;e++)if(this._pointers[e]==t.pointerId){this._pointers.splice(e,1);return}}_isTrackingPointer(t){for(let e=0;e<this._pointers.length;e++)if(this._pointers[e]==t.pointerId)return!0;return!1}_trackPointer(t){let e=this._pointerPositions[t.pointerId];e===void 0&&(e=new it,this._pointerPositions[t.pointerId]=e),e.set(t.pageX,t.pageY)}_getSecondPointerPosition(t){let e=t.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[e]}_customWheelEvent(t){let e=t.deltaMode,n={clientX:t.clientX,clientY:t.clientY,deltaY:t.deltaY};switch(e){case 1:n.deltaY*=16;break;case 2:n.deltaY*=100;break}return t.ctrlKey&&!this._controlActive&&(n.deltaY*=10),n}};function Cx(i){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(i.pointerId),this.domElement.ownerDocument.addEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(i)&&(this._addPointer(i),i.pointerType==="touch"?this._onTouchStart(i):this._onMouseDown(i),this._cursorStyle==="grab"&&(this.domElement.style.cursor="grabbing")))}function Px(i){this.enabled!==!1&&(i.pointerType==="touch"?this._onTouchMove(i):this._onMouseMove(i))}function Ix(i){switch(this._removePointer(i),this._pointers.length){case 0:this.domElement.releasePointerCapture(i.pointerId),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(Xd),this.state=_e.NONE,this._cursorStyle==="grab"&&(this.domElement.style.cursor="grab");break;case 1:let t=this._pointers[0],e=this._pointerPositions[t];this._onTouchStart({pointerId:t,pageX:e.x,pageY:e.y});break}}function Lx(i){let t;switch(i.button){case 0:t=this.mouseButtons.LEFT;break;case 1:t=this.mouseButtons.MIDDLE;break;case 2:t=this.mouseButtons.RIGHT;break;default:t=-1}switch(t){case Ci.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(i),this.state=_e.DOLLY;break;case Ci.ROTATE:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=_e.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=_e.ROTATE}break;case Ci.PAN:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=_e.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=_e.PAN}break;default:this.state=_e.NONE}this.state!==_e.NONE&&this.dispatchEvent(Sh)}function Dx(i){switch(this.state){case _e.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(i);break;case _e.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(i);break;case _e.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(i);break}}function Nx(i){this.enabled===!1||this.enableZoom===!1||this.state!==_e.NONE||(i.preventDefault(),this.dispatchEvent(Sh),this._handleMouseWheel(this._customWheelEvent(i)),this.dispatchEvent(Xd))}function Ux(i){this.enabled!==!1&&this._handleKeyDown(i)}function Fx(i){switch(this._trackPointer(i),this._pointers.length){case 1:switch(this.touches.ONE){case Pi.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(i),this.state=_e.TOUCH_ROTATE;break;case Pi.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(i),this.state=_e.TOUCH_PAN;break;default:this.state=_e.NONE}break;case 2:switch(this.touches.TWO){case Pi.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(i),this.state=_e.TOUCH_DOLLY_PAN;break;case Pi.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(i),this.state=_e.TOUCH_DOLLY_ROTATE;break;default:this.state=_e.NONE}break;default:this.state=_e.NONE}this.state!==_e.NONE&&this.dispatchEvent(Sh)}function Ox(i){switch(this._trackPointer(i),this.state){case _e.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(i),this.update();break;case _e.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(i),this.update();break;case _e.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(i),this.update();break;case _e.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(i),this.update();break;default:this.state=_e.NONE}}function Bx(i){this.enabled!==!1&&i.preventDefault()}function zx(i){i.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function kx(i){i.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}var Pl=class extends Vn{constructor(){super(),this.name="RoomEnvironment",this.position.y=-3.5;let t=new $e;t.deleteAttribute("uv");let e=new Ti({side:Ne}),n=new Ti,s=new Qi(16777215,900,28,2);s.position.set(.418,16.199,.3),this.add(s);let r=new at(t,e);r.position.set(-.757,13.219,.717),r.scale.set(31.713,28.305,28.591),this.add(r);let a=new ri(t,n,6),o=new we;o.position.set(-10.906,2.009,1.846),o.rotation.set(0,-.195,0),o.scale.set(2.328,7.905,4.651),o.updateMatrix(),a.setMatrixAt(0,o.matrix),o.position.set(-5.607,-.754,-.758),o.rotation.set(0,.994,0),o.scale.set(1.97,1.534,3.955),o.updateMatrix(),a.setMatrixAt(1,o.matrix),o.position.set(6.167,.857,7.803),o.rotation.set(0,.561,0),o.scale.set(3.927,6.285,3.687),o.updateMatrix(),a.setMatrixAt(2,o.matrix),o.position.set(-2.017,.018,6.124),o.rotation.set(0,.333,0),o.scale.set(2.002,4.566,2.064),o.updateMatrix(),a.setMatrixAt(3,o.matrix),o.position.set(2.291,-.756,-2.621),o.rotation.set(0,-.286,0),o.scale.set(1.546,1.552,1.496),o.updateMatrix(),a.setMatrixAt(4,o.matrix),o.position.set(-2.193,-.369,-5.547),o.rotation.set(0,.516,0),o.scale.set(3.875,3.487,2.986),o.updateMatrix(),a.setMatrixAt(5,o.matrix),this.add(a);let l=new at(t,$s(50));l.position.set(-16.116,14.37,8.208),l.scale.set(.1,2.428,2.739),this.add(l);let c=new at(t,$s(50));c.position.set(-16.109,18.021,-8.207),c.scale.set(.1,2.425,2.751),this.add(c);let h=new at(t,$s(17));h.position.set(14.904,12.198,-1.832),h.scale.set(.15,4.265,6.331),this.add(h);let d=new at(t,$s(43));d.position.set(-.462,8.89,14.52),d.scale.set(4.38,5.441,.088),this.add(d);let u=new at(t,$s(20));u.position.set(3.235,11.486,-12.541),u.scale.set(2.5,2,.1),this.add(u);let p=new at(t,$s(100));p.position.set(0,20,0),p.scale.set(1,.1,1),this.add(p)}dispose(){let t=new Set;this.traverse(e=>{e.isMesh&&(t.add(e.geometry),t.add(e.material))});for(let e of t)e.dispose()}};function $s(i){return new li({color:0,emissive:16777215,emissiveIntensity:i})}var Pe=(i,t,e)=>Math.min(e,Math.max(t,i)),he=(i,t,e)=>i+(t-i)*e,ln=i=>(i=Pe(i,0,1),i*i*(3-2*i)),XM=Math.PI/180,Ae=Math.PI*2;function Bi(i){let t=i>>>0||1;return()=>(t=t*1664525+1013904223>>>0)/4294967296}var as=i=>{let t=Math.sin(i*127.1+311.7)*43758.5453;return t-Math.floor(t)};function cn(i,t,e,{repeat:n,aniso:s=4,srgb:r=!0}={}){let a=document.createElement("canvas");a.width=i,a.height=t,e(a.getContext("2d"),i,t);let o=new Ar(a);return r&&(o.colorSpace=We),o.anisotropy=s,n&&(o.wrapS=o.wrapT=Cs,o.repeat.set(n[0],n[1])),o}function Il(i=128,t="rgba(255,255,255,1)",e="rgba(255,255,255,0)",n=.35){return cn(i,i,(s,r)=>{let a=s.createRadialGradient(r/2,r/2,0,r/2,r/2,r/2);a.addColorStop(0,t),a.addColorStop(n,t.replace(/[\d.]+\)$/,"0.55)")),a.addColorStop(1,e),s.fillStyle=a,s.fillRect(0,0,r,r)},{srgb:!0})}function qd(i=128,t=7){let e=Bi(t);return cn(i,i,(n,s)=>{for(let r=0;r<9;r++){let a=s/2+(e()-.5)*s*.34,o=s/2+(e()-.5)*s*.34,l=s*(.2+e()*.16),c=n.createRadialGradient(a,o,0,a,o,l);c.addColorStop(0,"rgba(255,255,255,.62)"),c.addColorStop(.55,"rgba(255,255,255,.3)"),c.addColorStop(1,"rgba(255,255,255,0)"),n.fillStyle=c,n.fillRect(0,0,s,s)}})}var $t=(i,t={})=>new Ti({color:i,roughness:.6,metalness:0,...t}),Mn=(i,t={})=>new li({color:i,...t});function Zn(i){i.traverse(t=>{t.geometry&&t.geometry.dispose();let e=Array.isArray(t.material)?t.material:t.material?[t.material]:[];for(let n of e){for(let s of["map","alphaMap","emissiveMap","bumpMap"])n[s]&&n[s].dispose();n.dispose()}})}function ui(i,t,e={}){let n=i.length;if(!n)return null;let s,r,a;if(t<=i[0].t)s=r=i[0],a=0;else if(t>=i[n-1].t)s=r=i[n-1],a=0;else{let o=0,l=n-1;for(;l-o>1;){let c=o+l>>1;i[c].t<=t?o=c:l=c}s=i[o],r=i[l],a=(t-s.t)/Math.max(1e-6,r.t-s.t)}return e.t=t,e.x=he(s.x,r.x,a),e.z=he(s.z,r.z,a),e.th=he(s.th,r.th,a),e.ro=he(s.ro||0,r.ro||0,a),e.ph=a<.5?s.ph:r.ph,e.vx=he(s.vx||0,r.vx||0,a),e.vz=he(s.vz||0,r.vz||0,a),e}var zi=.0145,ki=.22;function Hx(i,t,e){let s=Pe(Math.round(512*t/(Math.PI*e)),256,2048),r=Bi(i.length*31+5);return cn(512,s,a=>{if(i==="carbon"){a.fillStyle="#1b1e23",a.fillRect(0,0,512,s);let d=16;for(let u=0;u<s;u+=d)for(let p=0;p<512;p+=d){let g=p/d+u/d&1?.1:.03,S=a.createLinearGradient(p,u,p+d,u+d);S.addColorStop(0,`rgba(255,255,255,${g})`),S.addColorStop(1,"rgba(255,255,255,0)"),a.fillStyle=S,a.fillRect(p,u,d,d)}}else if(i==="glass"){a.fillStyle="#e3e9df",a.fillRect(0,0,512,s),a.strokeStyle="rgba(120,140,120,.12)",a.lineWidth=1;for(let d=-s;d<512+s;d+=9)a.beginPath(),a.moveTo(d,0),a.lineTo(d+s,s),a.moveTo(d,0),a.lineTo(d-s,s),a.stroke()}else if(i==="pla"){a.fillStyle="#f3f3f1",a.fillRect(0,0,512,s),a.fillStyle="rgba(0,0,0,.035)";for(let d=0;d<s;d+=4)a.fillRect(0,d,512,1)}else{a.fillStyle="#b98b57",a.fillRect(0,0,512,s);for(let u=0;u<2600;u++)a.fillStyle=`rgba(${r()<.5?"70,45,20":"255,235,200"},${.03+r()*.05})`,a.fillRect(r()*512,r()*s,1+r()*10,1);a.strokeStyle="rgba(80,52,24,.42)",a.lineWidth=2;let d=210;for(let u=-512;u<s+d;u+=d)a.beginPath(),a.moveTo(0,u+d*.9),a.lineTo(512,u),a.stroke()}let o=i==="carbon",l=(d,u,p)=>{a.fillStyle=p,a.fillRect(0,d,512,u)};l(s*.035,s*.03,"#ff6a1a"),l(s*.07,s*.012,o?"#e5e7eb":"#10213f");let c=s*.8,h=Math.min(s*.07,70);for(let d=0;d<4;d++)a.fillStyle=d%2?"#f8fafc":"#111827",a.fillRect(d*512/4,c,512/4,h),a.fillStyle=d%2?"#111827":"#f8fafc",a.fillRect(d*512/4,c+h,512/4,h);a.save(),a.translate(512*.25,s*.46),a.rotate(Math.PI/2),a.textAlign="center",a.textBaseline="middle",a.fillStyle=o?"#f1f5f9":"#10213f",a.font=`800 ${Math.round(512*.2)}px Inter, system-ui, sans-serif`,a.fillText("USTEM",0,0),a.restore(),a.save(),a.translate(512*.75,s*.46),a.rotate(Math.PI/2),a.textAlign="center",a.textBaseline="middle",a.fillStyle="#ff6a1a",a.font=`700 ${Math.round(512*.12)}px Inter, system-ui, sans-serif`,a.fillText("WSO CanSat",0,0),a.restore()},{aniso:8})}var Yd={paper:{roughness:.85},pla:{roughness:.45},glass:{roughness:.35},carbon:{roughness:.3,metalness:.15}},Zd={balsa:{color:15125400,roughness:.85},ply:{color:12884578,roughness:.75},pla:{color:16738842,roughness:.45},eps:{color:16185076,roughness:.95}},Vx={balsa:.003,ply:.003,pla:.003,eps:.005};function Gx(i,t,e,n){let s=Pe(t/e,0,1);if(i==="cone")return n*s;if(i==="parabolic")return n*(2*s-s*s);let r=(n*n+e*e)/(2*n);return Math.sqrt(Math.max(0,r*r-Math.pow(e-t,2)))+n-r}function Ll(i,{inside:t=!1,canGroup:e=null}={}){let n=i.d/1e3,s=n/2,r=i.len/100,a=Math.min(r*.6,i.d*i.noseK/1e3),o=r-a,l=new Xt,c=new Xt,h=new Xt;l.add(c,h);let d=Yd[i.material]||Yd.paper,u=$t(16777215,{map:Hx(i.material,o,n),side:Ee,...d}),p=new at(new ee(s,s,o,48,1,!0),u);p.position.y=o/2,c.add(p);let g=$t(16738842,{roughness:.38}),S=[],m=28;for(let Y=0;Y<=m;Y++){let ft=a*Y/m;S.push(new it(Math.max(5e-4,Gx(i.nose,ft,a,s)),a-ft))}S.reverse();let f=new at(new Hr(S,48),g),M=new at(new ee(s*.93,s*.93,.045,32),$t(14870768,{roughness:.5}));M.position.y=-.0225;let T=new at(new In(s*.93,32),$t(13358561));T.rotation.x=Math.PI/2,T.position.y=-.045,h.add(f,M,T),h.position.y=o;let _=Zd[i.finMat]||Zd.balsa,b=Vx[i.finMat]||.003,v=i.root/1e3,A=i.tip/1e3,x=i.span/1e3,w=i.sweep/1e3,R=new Os;R.moveTo(s*.98,0),R.lineTo(s*.98,v),R.lineTo(s+x,v-w),R.lineTo(s+x,v-w-Math.max(.004,A)),R.closePath();let I=new zr(R,{depth:b,bevelEnabled:!0,bevelThickness:b*.3,bevelSize:b*.3,bevelSegments:1});I.translate(0,0,-b/2);let N=$t(_.color,{roughness:_.roughness}),F=new Xt,L=i.fins||4;for(let Y=0;Y<L;Y++){let ft=new at(I,N);ft.rotation.y=Y*Ae/L+Math.PI/L,F.add(ft)}c.add(F);let B=$t(8149564,{roughness:.8}),X=new at(new ee(zi,zi,ki,24),B);X.position.y=ki/2-.012;let G=new at(new ee(zi*.45,zi*.8,.004,20),$t(2042167,{roughness:.9}));G.position.y=-.012;let tt=new at(new zs(zi,s*.99,40),$t(14075816,{side:Ee,roughness:.9}));tt.rotation.x=Math.PI/2,tt.position.y=.003,c.add(X,G,tt);let Z=$t(15067115,{roughness:.5});for(let Y of[r*.16,o*.72]){let ft=new at(new ee(.0045,.0045,.03,12,1,!0),Z);ft.material.side=Ee,ft.position.set(-(s+.0045),Y,0),c.add(ft)}let J=null;if(t){J=new Xt;let Y=new at(new ee(zi+.0015,zi+.0015,ki+.02,24,1,!0),$t(13214315,{side:Ee,roughness:.9}));Y.position.y=ki/2+.004,J.add(Y);for(let Bt of[.03,ki-.01]){let W=new at(new zs(zi+.0015,s*.97,40),$t(14271386,{side:Ee,roughness:.9}));W.rotation.x=Math.PI/2,W.position.y=Bt,J.add(W)}let ft=new at(new ee(s*.9,s*.9,.018,24),$t(15857145,{roughness:1}));ft.position.y=ki+.05,J.add(ft);let bt=Math.min(s*.86,.02+i.chute/100*.045),At=new at(new oi(bt,20,14),$t(14427686,{roughness:.9}));At.scale.y=1.5,At.position.y=o-.115-.03-bt*1.5-.02,J.add(At);let kt=[];for(let Bt=0;Bt<=40;Bt++){let W=Bt/40;kt.push(new P(Math.sin(W*26)*s*.5,ki+.07+W*Math.max(.05,At.position.y-bt*1.5-ki-.09),Math.cos(W*26)*s*.5))}J.add(new at(new Ei(new ai(kt),80,.0018,5),$t(16317180,{roughness:1}))),e&&(e.position.y=o-.012-.0575,J.add(e)),c.add(J)}return{group:l,bodyG:c,noseG:h,body:p,bodyMat:u,fins:F,inner:J,L:r,Lb:o,Ln:a,R:s,D:n,tubeR:s,setXray(Y){u.transparent=Y,u.opacity=Y?.22:1,u.depthWrite=!Y,u.needsUpdate=!0,g.transparent=Y,g.opacity=Y?.35:1,g.depthWrite=!Y,g.needsUpdate=!0,J&&(J.visible=Y)}}}function Jd(){let i=new Xt,t=(r,a,o,l)=>{let c=new bi(r,a,14,1,!0);c.rotateX(Math.PI),c.translate(0,-a/2,0);let h=new at(c,new qe({color:o,transparent:!0,opacity:l,blending:ci,depthWrite:!1,side:Ee,fog:!1}));return i.add(h),h},e=t(.03,.42,16742938,.55),n=t(.02,.3,16761418,.8),s=t(.011,.16,16774872,.95);return i.userData.flick=(r,a=1)=>{let o=.85+.3*Math.sin(r*91.3)*Math.sin(r*37.7),l=.9+.2*Math.sin(r*63.1+1);e.scale.set(l*a,o*a,l*a),n.scale.set(o,l*a,o),s.scale.set(1,o,1)},i.visible=!1,i}var bh=.033,Jn=.115,ua=.029,js=.0016,sn=i=>i/1e3,oe=(i,t,e,n,s={})=>new at(new $e(sn(i),sn(t),sn(e)),$t(n,s)),Hi=(i,t,e,n={},s=20)=>new at(new ee(sn(i),sn(i),sn(t),s),$t(e,n)),Ge={metalness:.85,roughness:.3},Kt=(i,t,e,n)=>(i.position.set(sn(t),sn(e),sn(n)),i);function Dl(i,t,e,{chip:n=7,shield:s=null,usb:r=!0}={}){let a=new Xt;a.add(Kt(oe(i,1.6,t,e,{roughness:.5}),0,.8,0));for(let o of[-1,1])a.add(Kt(oe(i-6,2.2,2.2,1120295),0,2.4,o*(t/2-1.6)));return s?a.add(Kt(oe(s[0],3,s[1],13358561,Ge),i/2-s[0]/2-3,3.1,0)):a.add(Kt(oe(n,1.2,n,724759,{roughness:.3}),2,2.2,0)),r&&a.add(Kt(oe(6,2.6,7.5,13751771,Ge),-i/2+2.5,2.9,0)),a}function Wx(i){let t=new Xt;switch(i.id){case"obc-nano":t.add(Dl(43,18,1920728));break;case"obc-pico":t.add(Dl(51,21,1409085));break;case"obc-esp32":t.add(Dl(52,28,1120295,{shield:[18,16]}));break;case"obc-esp32cam":{t.add(Dl(40,27,1120295,{shield:[16,15],usb:!1})),t.add(Kt(oe(8.5,5,8.5,2042167),-8,4.1,0));let e=Hi(3.4,4,724759,{roughness:.2});t.add(Kt(e,-8,8.2,0)),t.add(Kt(Hi(2.2,.4,3900150,{roughness:.05,metalness:.6}),-8,10.3,0)),t.add(Kt(oe(13,1.6,14,13751771,Ge),11,2.4,0));break}case"bat-lipo400":case"bat-lipo1000":{let e=i.id==="bat-lipo1000",n=e?48:34,s=e?30:22,r=e?7:5;t.add(Kt(oe(n,r,s,13094100,{metalness:.6,roughness:.4}),0,r/2,0)),t.add(Kt(oe(n*.7,.3,s*.92,e?14251782:16096779,{roughness:.6}),2,r+.1,0)),t.add(Kt(oe(5,r*.8,s*.9,11817737,{roughness:.7}),-n/2-2,r/2,0));for(let[a,o]of[[-1,14427686],[1,1120295]])t.add(Kt(Hi(.7,12,o),-n/2-8,r/2,a*3).rotateZ(Math.PI/2));break}case"bat-18650":{t.add(Kt(oe(22,3,22,1120295),0,1.5,0)),t.add(Kt(Hi(9.2,65,1483594,{roughness:.35},28),0,3+32.5,0)),t.add(Kt(Hi(9.3,3,15067115,Ge,28),0,68-1.5,0)),t.add(Kt(Hi(3.2,1.6,15067115,Ge),0,3+65.6,0));break}case"eps-tp4056":t.add(Kt(oe(26,1.6,17,1981066),0,.8,0),Kt(oe(6,2.6,7.5,13751771,Ge),-10,2.9,0),Kt(oe(5,1.4,4,724759),3,2.3,0),Kt(oe(1.6,.8,1,15680580,{emissive:15680580,emissiveIntensity:.6}),9,2,5));break;case"bmp280":case"bme280":t.add(Kt(oe(13,1.6,11,8266446),0,.8,0),Kt(oe(2.5,1,2.5,13751771,Ge),0,2.1,0));break;case"imu":t.add(Kt(oe(21,1.6,16,1920728),0,.8,0),Kt(oe(4,1,4,724759,{roughness:.3}),0,2.1,0));break;case"gps":t.add(Kt(oe(26,1.6,26,1920728),0,.8,0),Kt(oe(16,4,16,15194552,{roughness:.7}),0,3.6,0),Kt(oe(11,.3,11,13751771,Ge),0,5.7,0));break;case"ds18b20":t.add(Kt(oe(10,1.2,8,947344),0,.6,0));break;case"bh1750":t.add(Kt(oe(14,1.6,18,1920728),0,.8,0),Kt(oe(3,1,2.5,16317180,{roughness:.1}),0,2.1,0));break;case"sd":t.add(Kt(oe(24,1.6,24,1920728),0,.8,0),Kt(oe(14,2,15,13751771,Ge),3,2.6,0),Kt(oe(11,1,9,1120295),9,2.6,0));break;case"radio-lora":t.add(Kt(oe(17,1.2,16,988970),0,.6,0),Kt(oe(12,2.4,11,13358561,Ge),-1,2.4,0));break;case"radio-apc220":t.add(Kt(oe(37,1.6,17,1982639),0,.8,0),Kt(oe(12,3,11,13358561,Ge),6,3.1,0),Kt(Hi(3,6,13934615,Ge),-17,3,0).rotateZ(Math.PI/2));break;case"radio-nrf":t.add(Kt(oe(41,1.6,15,724759),0,.8,0),Kt(oe(10,2.4,10,13358561,Ge),8,2.8,0),Kt(Hi(3,7,13934615,Ge),-19,3,0).rotateZ(Math.PI/2));break;default:t.add(Kt(oe(22,1.6,16,1920728),0,.8,0),Kt(oe(5,1.2,5,724759),0,2.2,0))}return t}function Xx(i){return cn(256,256,(t,e,n)=>{t.fillStyle=i,t.fillRect(0,0,e,n),t.fillStyle="rgba(0,0,0,.05)";for(let s=0;s<n;s+=3)t.fillRect(0,s,e,1);t.fillStyle="#ff6a1a",t.fillRect(0,n*.12,e,n*.06),t.fillStyle="#10213f",t.font="800 26px Inter, system-ui, sans-serif",t.textAlign="center",t.textBaseline="middle",t.fillText("CanSat",e*.25,n*.52),t.fillText("USTEM",e*.75,n*.52)},{aniso:8})}function da(i,{detail:t=!0}={}){let e=new Xt,n=new Xt,s=new Xt;e.add(s,n);let r=i.find(v=>v.cat==="body"),a=r?r.id:"none",o=Jn,l=bh,c=null,h=$t(a==="body-frame"?1332013:a==="body-petg"?11977425:13620959,{roughness:.55});if(a==="body-pla"||a==="body-petg"){let v=a==="body-petg";c=$t(16777215,{map:Xx(v?"#c9d6e6":"#e8ecf1"),roughness:v?.2:.55,side:Ee,transparent:v,opacity:v?.55:1,depthWrite:!v});let A=new at(new ee(l,l,o-.006,48,1,!0),c);n.add(A)}else if(a==="none"){let v=new ae().setFromPoints(Array.from({length:65},(x,w)=>new P(Math.cos(w/64*Ae)*l,0,Math.sin(w/64*Ae)*l))),A=new $i({color:6583435,dashSize:.004,gapSize:.004});for(let x of[-o/2,o/2]){let w=new Pn(v,A);w.computeLineDistances(),w.position.y=x,n.add(w)}}let d=new at(new ee(l,l,.003,48),h);d.position.y=o/2-.0015;let u=new at(new ee(l,l,.003,48),h);u.position.y=-o/2+.0015,a!=="none"&&(n.add(d),s.add(u));let p=new at(new Vr(.005,.0012,8,20),$t(13751771,Ge));p.position.y=o/2+.005,n.add(p);let g=[],S=i.filter(v=>v.h),m=-o/2+.004,f=Math.max(o/2-.004,m+S.reduce((v,A)=>v+sn(A.h+2),0)),M=$t(13214247,{metalness:.8,roughness:.35});if(t||a==="body-frame")for(let v=0;v<4;v++){let A=Math.PI/4+v*Math.PI/2,x=new at(new ee(.0015,.0015,f-(-o/2+.003),8),M);x.position.set(Math.cos(A)*.026,(f+(-o/2+.003))/2,Math.sin(A)*.026),s.add(x)}for(let v of S){let A=new Xt,x=new at(new ee(ua,ua,js,40),$t(new Nt(v.color).multiplyScalar(.8),{roughness:.55}));if(x.position.y=js/2,A.add(x),t){let R=Wx(v);R.position.y=js,A.add(R)}else{let R=new at(new ee(ua*.8,ua*.8,Math.max(.001,sn(v.h)-js),16),$t(v.color));R.position.y=js+(sn(v.h)-js)/2,A.add(R)}A.position.y=m;let w=new we;w.position.set(ua,sn(v.h)/2,0),A.add(w),s.add(A),g.push({part:v,group:A,y0:m,h:sn(v.h),anchor:w}),m+=sn(v.h+2)}if(i.some(v=>v.id==="ds18b20")){let v=new at(new ee(.003,.003,.03,12),$t(13358561,Ge));v.position.set(l+.004,-o/2+.02,0),s.add(v)}let T=i.find(v=>v.cat==="antenna"),_=null;if(T)if(T.id==="ant-whip433"){let v=[new P(.018,o/2,0),new P(.02,o/2+.06,.002),new P(.03,o/2+.12,.004),new P(.046,o/2+.168,.006)],A=new at(new Ei(new ai(v),24,.0011,6),$t(1120295,{roughness:.5}));n.add(A),_=v[3]}else if(T.id==="ant-spring433"){let v=[];for(let A=0;A<=120;A++){let x=A/120;v.push(new P(.02+Math.cos(x*12*Ae)*.004,o/2-.03+x*.024,Math.sin(x*12*Ae)*.004))}s.add(new at(new Ei(new ai(v),240,5e-4,5),$t(13751771,Ge)))}else{let v=new at(new ee(.0032,.0032,.008,12),$t(13934615,Ge));v.position.set(.018,o/2+.004,0);let A=new at(new ee(.004,.0045,.05,12),$t(1120295,{roughness:.6}));A.position.set(.018,o/2+.033,0),n.add(v,A)}let b=m>o/2-.003;return{group:e,shellG:n,stackG:s,boards:g,wallMat:c,H:o,R:l,overflow:b,kind:a,stackTop:m,antTop:_,setXray(v){if(!c)return;let A=a==="body-petg";c.transparent=v||A,c.opacity=v?.16:A?.55:1,c.depthWrite=!(v||A),c.needsUpdate=!0},setExplode(v){n.position.set(-.105*v,.02*v,0),g.forEach((A,x)=>{A.group.position.y=A.y0+v*(x+.5)*.017})}}}var Eh=(i,t,e)=>{let n=document.createElement(i);return t&&(n.className=t),e!=null&&(n.textContent=e),n};function qx(i){return cn(128,128,(t,e)=>{let n=e/2,s=e*.4;i==="cg"?(t.fillStyle="#fff",t.beginPath(),t.arc(n,n,s,0,7),t.fill(),t.fillStyle="#10213f",t.beginPath(),t.moveTo(n,n),t.arc(n,n,s,0,Math.PI/2),t.closePath(),t.fill(),t.beginPath(),t.moveTo(n,n),t.arc(n,n,s,Math.PI,Math.PI*1.5),t.closePath(),t.fill(),t.strokeStyle="#10213f",t.lineWidth=7,t.beginPath(),t.arc(n,n,s,0,7),t.stroke()):(t.fillStyle="#fff",t.beginPath(),t.arc(n,n,s,0,7),t.fill(),t.strokeStyle="#dc2626",t.lineWidth=12,t.beginPath(),t.arc(n,n,s-4,0,7),t.stroke(),t.fillStyle="#dc2626",t.beginPath(),t.arc(n,n,s*.36,0,7),t.fill())})}var Th=class{constructor(t){this.host=t,t.classList.add("s3-builder"),this.renderer=new Js({antialias:!0,alpha:!0,powerPreference:"low-power"}),this.renderer.setPixelRatio(Math.min(2,window.devicePixelRatio||1)),this.renderer.toneMapping=ns,this.renderer.toneMappingExposure=.92,this.canvas=this.renderer.domElement,this.canvas.className="s3-canvas",this.labels=Eh("div","s3-labels"),this.svg=document.createElementNS("http://www.w3.org/2000/svg","svg"),this.svg.setAttribute("class","s3-leaders"),t.append(this.canvas,this.svg,this.labels),this.scene=new Vn;let e=new Fi(this.renderer);this.scene.environment=e.fromScene(new Pl,.04).texture,e.dispose(),this.scene.environmentIntensity=.55;let n=new ts(16777215,1.25);n.position.set(2,3,2.5),this.scene.add(n,new Zr(16777215,.25)),this.camera=new De(28,2,.01,50),this.controls=new Cl(this.camera,this.canvas),Object.assign(this.controls,{enablePan:!1,enableZoom:!1,enableDamping:!0,dampingFactor:.12,rotateSpeed:.8}),this.controls.addEventListener("start",()=>{this.touched=!0}),this.controls.addEventListener("change",()=>this.kick()),this.shadow=new at(new nn(1,1),new qe({map:Il(128,"rgba(15,23,42,.28)","rgba(15,23,42,0)",.3),transparent:!0,depthWrite:!1})),this.shadow.rotation.x=-Math.PI/2,this.scene.add(this.shadow),this.model=null,this.key="",this.xray=!1,this.explode=0,this.explodeTo=0,this.spin=0,this.items=[],this.ro=new ResizeObserver(()=>{this.resize(),this.kick()}),this.ro.observe(t),this.io=new IntersectionObserver(s=>{this.onscreen=s[0].isIntersecting,this.onscreen&&this.kick()}),this.io.observe(t),this.onscreen=!0,this.last=0,this.raf=0,this.loop=s=>this.frame(s),this.resize(),this.kick()}set(t){let e=JSON.stringify([t.mode,t.rocket,(t.parts||[]).map(n=>n.id)]);this.opts=t,e!==this.key&&(this.key=e,this.model&&(this.scene.remove(this.model.wrap),Zn(this.model.wrap)),this.model=t.mode==="rocket"?this.makeRocket(t):this.makeCan(t),this.scene.add(this.model.wrap),this.applyView(!0),this.modeWas!==t.mode?(this.modeWas=t.mode,this.touched=!1,this.frameCamera(!0)):this.frameCamera(!1)),this.updateMarkers(),this.kick()}makeRocket(t){let e=da(t.parts||[],{detail:!1}),n=Ll(t.rocket,{inside:!0,canGroup:e.group}),s=new Xt,r=new Xt;r.add(n.group),n.group.position.y=-n.L/2,s.add(r),s.rotation.z=Math.PI/2;let a=c=>{let h=new Wn(new Cn({map:qx(c),depthTest:!1,transparent:!0}));return h.renderOrder=10,n.group.add(h),h},o=a("cg"),l=a("cp");return{kind:"rocket",wrap:s,turn:r,rk:n,can:e,cg:o,cp:l,size:n.L,radius:n.R+t.rocket.span/1e3}}makeCan(t){let e=da(t.parts||[],{detail:!0}),n=new Xt,s=new Xt;return s.add(e.group),n.add(s),{kind:"can",wrap:n,turn:s,can:e,size:Jn,radius:e.R}}setXray(t){this.xray=t,this.applyView(),this.updateMarkers(),this.kick()}setExplode(t){this.explodeTo=t?1:0,this.applyView(),this.kick()}applyView(t){let e=this.model;e&&(e.kind==="rocket"?e.rk.setXray(this.xray):(e.can.setXray(this.xray||this.explodeTo>0),t&&(this.explode=this.explodeTo,e.can.setExplode(this.explode))))}frameCamera(t){let e=this.model;if(!e)return;let n=this.camera.aspect,s=Math.tan(this.camera.fov*Math.PI/360),r,a,o,l=new P;if(e.kind==="rocket")r=Math.max(e.size*.64/(s*n),e.radius*1.7/s),a=-.3,o=.16,this.shadow.scale.set(e.size*1.05,e.radius*2.6,1),this.shadow.position.set(0,-e.radius-.02,0);else{let c=this.explode,h=Math.max(Jn/2+.012,e.can.stackTop+c*e.can.boards.length*.017+.012),d=(h+Jn/2)/2+.012,u=e.radius*(1.25+2.4*c)+.02;r=Math.max(d/s,u/(s*n))*1.12,l.set(-.05*c+.012,(h-Jn/2)/2,0),a=.5,o=.3+.12*c,this.shadow.scale.set(.16+.12*c,.16,1),this.shadow.position.set(-.05*c,-Jn/2-.001,0)}if(this.dist=r,t||!this.touched)this.camera.position.set(l.x+Math.sin(a)*Math.cos(o)*r,l.y+Math.sin(o)*r,l.z+Math.cos(a)*Math.cos(o)*r);else{let c=this.camera.position.clone().sub(this.controls.target).normalize();this.camera.position.copy(l).addScaledVector(c,r)}this.controls.target.copy(l),this.controls.update()}updateMarkers(){let t=this.model,e=this.opts;if(!t||!e)return;if(this.items=[],t.kind==="rocket"){let s=Math.max(.035,t.rk.R*.9);t.cg.scale.setScalar(s),t.cp.scale.setScalar(s),t.cg.position.set(0,t.rk.L-(e.cg||0)/1e3,0),t.cp.position.set(0,t.rk.L-(e.cp||0)/1e3,0);let r=e.labels||{};if(this.items.push({obj:t.cg,text:r.cg,cls:"cg",dy:-1},{obj:t.cp,text:r.cp,cls:"cp",dy:1}),this.xray){let a=o=>{let l=new we;return l.position.set(0,o,0),t.rk.group.add(l),l};t.anchors||(t.anchors={can:a(t.rk.Lb-.07),motor:a(.1),chute:a(t.rk.Lb-.115-.09)}),this.items.push({obj:t.anchors.can,text:r.can,cls:"part",dy:-1},{obj:t.anchors.motor,text:r.motor,cls:"part",dy:-1},{obj:t.anchors.chute,text:r.chute,cls:"part",dy:1})}}else for(let s of t.can.boards)this.items.push({obj:s.anchor,text:s.part.name,cls:"board",color:s.part.color,side:!0});let n=this.items.map(s=>s.cls+":"+s.text).join("|");if(n!==this.labelSig){this.labelSig=n,this.labels.replaceChildren(),this.svg.replaceChildren();for(let s of this.items){if(s.el=Eh("div","s3-label s3-"+s.cls,s.text||""),s.color){let r=Eh("i");r.style.background=s.color,s.el.prepend(r)}s.line=document.createElementNS("http://www.w3.org/2000/svg","line"),this.labels.append(s.el),this.svg.append(s.line)}this.labelItems=this.items}else this.labelItems&&(this.items.forEach((s,r)=>{s.el=this.labelItems[r].el,s.line=this.labelItems[r].line}),this.labelItems=this.items)}resize(){let t=Math.max(200,this.host.clientWidth),e=Math.max(160,this.host.clientHeight);this.renderer.setSize(t,e,!1),this.camera.aspect=t/e,this.camera.updateProjectionMatrix(),this.W=t,this.H=e,this.svg.setAttribute("viewBox",`0 0 ${t} ${e}`),this.model&&this.frameCamera(!1)}kick(){this.idleAt=performance.now()+4e3,!this.raf&&this.onscreen&&(this.raf=requestAnimationFrame(this.loop))}frame(t){if(this.raf=0,!this.onscreen||!this.host.isConnected||this.host.offsetParent===null)return;let e=Math.min(.05,(t-(this.last||t))/1e3);this.last=t;let n=this.model,s=!1;n&&(Math.abs(this.explode-this.explodeTo)>.002&&(this.explode+=(this.explodeTo-this.explode)*Math.min(1,e*7),s=!0,n.kind==="can"&&(n.can.setExplode(this.explode),this.frameCamera(!1))),this.touched||(this.spin+=e*.35,n.turn.rotation.y=this.spin,s=!0)),this.controls.update(),this.renderer.render(this.scene,this.camera),this.placeLabels(),(s||t<this.idleAt)&&(this.raf=requestAnimationFrame(this.loop))}placeLabels(){let t=new P,e=this.W,n=this.H,s=[];for(let r of this.items)if(r.el)if(r.obj.getWorldPosition(t),t.project(this.camera),r.sx=(t.x*.5+.5)*e,r.sy=(-t.y*.5+.5)*n,r.side)s.push(r);else{let a=Pe(r.sy+r.dy*(this.model.radius*0+46),14,n-14);r.el.style.transform=`translate(${Math.round(r.sx)}px, ${Math.round(a)}px) translate(-50%, -50%)`,r.line.setAttribute("x1",r.sx),r.line.setAttribute("y1",r.sy+r.dy*9),r.line.setAttribute("x2",r.sx),r.line.setAttribute("y2",a-r.dy*10)}if(s.length){s.sort((h,d)=>h.sy-d.sy);let r=21,a=Math.min(e-8,Math.max(...s.map(h=>h.sx))+46),o=Math.max(12,Math.min(s[0].sy,n-12-r*(s.length-1))),l=r*(s.length-1),c=(s[0].sy+s[s.length-1].sy)/2;o=Pe(c-l/2,12,Math.max(12,n-12-l));for(let h of s){let d=Math.max(o,Math.min(h.sy,o));o=d+r,h.el.style.transform=`translate(${Math.round(a)}px, ${Math.round(d)}px) translate(0, -50%)`,h.el.style.maxWidth=Math.max(60,e-a-6)+"px",h.line.setAttribute("x1",h.sx),h.line.setAttribute("y1",h.sy),h.line.setAttribute("x2",a-4),h.line.setAttribute("y2",d)}}}dispose(){cancelAnimationFrame(this.raf),this.ro.disconnect(),this.io.disconnect(),this.controls.dispose(),this.model&&Zn(this.model.wrap),this.renderer.dispose(),this.canvas.remove(),this.labels.remove(),this.svg.remove()}};function wh(i,t=16738842,e=16777215,{gores:n=12}={}){let s=new Xt,r=i*.36,a=i*.26,o=Math.max(.18,i*1.05),l=7,c=4,h=[],d=[],u=[],p=new Nt(t),g=new Nt(e),S=.09;for(let A=0;A<n;A++){let x=A%2?g:p,w=h.length/3;for(let R=0;R<=l;R++){let I=S+(1-S)*(R/l),N=I*1.25;for(let F=0;F<=c;F++){let L=F/c,B=(A+L)/n*Ae,X=1+.045*Math.sin(L*Math.PI)*I,G=R===l?-.035*i*Math.sin(L*Math.PI):0,tt=r*(Math.sin(N)/Math.sin(1.25))*X,Z=a*(Math.cos(N)-Math.cos(1.25))/(1-Math.cos(1.25))-G;h.push(Math.cos(B)*tt,Z,Math.sin(B)*tt);let J=.82+.18*Math.sin(L*Math.PI);d.push(x.r*J,x.g*J,x.b*J)}}for(let R=0;R<l;R++)for(let I=0;I<c;I++){let N=w+R*(c+1)+I,F=N+1,L=N+c+1,B=L+1;u.push(N,L,F,F,L,B)}}let m=new ae;m.setAttribute("position",new Ht(h,3)),m.setAttribute("color",new Ht(d,3)),m.setIndex(u),m.computeVertexNormals();let f=new at(m,new li({vertexColors:!0,side:Ee})),M=new Xt;M.add(f);let T=new Float32Array(n*6),_=new Mi(new ae().setAttribute("position",new ke(T,3)),new fn({color:2042167,transparent:!0,opacity:.8}));_.frustumCulled=!1,s.add(M,_);let b=-1,v={group:s,canopy:f,d:i,Rp:r,lineLen:o,height:o+a,setOpen(A,x=0){let w=he(.1,1,A)*(1+x),R=he(2.4,1,A)*(1-x*.6),I=r*w,N=Math.sqrt(Math.max(.01,o*o-I*I));M.scale.set(w,R,w),M.position.y=N;for(let F=0;F<n;F++){let L=F/n*Ae;T[F*6]=0,T[F*6+1]=0,T[F*6+2]=0,T[F*6+3]=Math.cos(L)*I,T[F*6+4]=N,T[F*6+5]=Math.sin(L)*I}_.geometry.attributes.position.needsUpdate=!0,b=A},get open(){return b}};return v.setOpen(1),v}var Nl=2200,Ul=class{constructor(){let t=new nn(1,1),e=new Jr;e.index=t.index,e.setAttribute("position",t.attributes.position),e.setAttribute("uv",t.attributes.uv),this.pos=new Float32Array(Nl*3),this.misc=new Float32Array(Nl*2),this.col=new Float32Array(Nl*4),e.setAttribute("iPos",this.aPos=new si(this.pos,3).setUsage(oa)),e.setAttribute("iMisc",this.aMisc=new si(this.misc,2).setUsage(oa)),e.setAttribute("iCol",this.aCol=new si(this.col,4).setUsage(oa)),e.instanceCount=0;let n=new Ve({transparent:!0,depthWrite:!1,uniforms:{map:{value:qd(128,5)}},vertexShader:`
        attribute vec3 iPos; attribute vec2 iMisc; attribute vec4 iCol; varying vec2 vUv; varying vec4 vCol;
        void main(){ vUv = uv; vCol = iCol; vec4 mv = viewMatrix * vec4(iPos, 1.0);
          float c = cos(iMisc.y), s = sin(iMisc.y); vec2 p = vec2(position.x*c - position.y*s, position.x*s + position.y*c);
          mv.xy += p * iMisc.x; gl_Position = projectionMatrix * mv; }`,fragmentShader:`
        uniform sampler2D map; varying vec2 vUv; varying vec4 vCol;
        void main(){ float a = texture2D(map, vUv).a * vCol.a; if (a < 0.004) discard;
          gl_FragColor = vec4(vCol.rgb * (0.62 + 0.38*vUv.y), a);
          #include <colorspace_fragment>
        }`});this.mesh=new at(e,n),this.mesh.frustumCulled=!1,this.mesh.renderOrder=5,this.list=[]}clear(){this.list.length=0,this.mesh.geometry.instanceCount=0}add(t){this.list.length<Nl&&this.list.push(t)}update(t,e){let n=0,{pos:s,misc:r,col:a}=this;for(let o=0;o<this.list.length;o++){let l=this.list[o],c=t-l.te;if(c<0||c>l.life)continue;let h=(1-Math.exp(-l.drag*c))/l.drag;s[n*3]=l.x+l.vx*h+e*l.wk*c,s[n*3+1]=Math.max(l.floor||0,l.y+l.vy*h+(l.rise||0)*c),s[n*3+2]=l.z+l.vz*h,r[n*2]=l.s0+(l.sq||0)*(1-Math.exp(-c*28))+(l.s1-l.s0-(l.sq||0))*(1-Math.exp(-c*l.grow)),r[n*2+1]=l.rot+c*l.spin;let d=c/l.life;a[n*4]=l.c[0],a[n*4+1]=l.c[1],a[n*4+2]=l.c[2],a[n*4+3]=l.a*Math.min(1,c/(l.fade||.06))*Math.pow(1-d,1.4),n++}this.aPos.needsUpdate=this.aMisc.needsUpdate=this.aCol.needsUpdate=!0,this.mesh.geometry.instanceCount=n}},Ah=[.86,.86,.85],Yx=[.8,.82,.86],Rh=[.5,.4,.26],Zx=[.36,.36,.36];function fa(i,t,e,n,s,{speed:r=3,up:a=.5,c:o=Rh,a:l=.5,s1:c=1.2,life:h=3,wk:d=.5,flat:u=!0,push:p=null}={}){for(let g=0;g<e;g++){let S=as(t+g*3.1),m=as(t+g*7.7+1),f=as(t+g*1.3+2),M=S*Ae,T=u?m*.5:(m-.5)*Math.PI,_=r*(.4+.6*f);i.add({te:n+f*.08,x:s.x,y:s.y,z:s.z,vx:Math.cos(M)*Math.cos(T)*_+(p?p.x:0),vy:Math.sin(T)*_+a+(p?p.y:0),vz:Math.sin(M)*Math.cos(T)*_,drag:2.2,wk:d,s0:.1,s1:c*(.7+.6*m),grow:1.6,life:h*(.7+.5*S),c:o,a:l,rot:S*Ae,spin:(m-.5)*.8,floor:.05})}}function Kd(i,t,e,n){i.clear();let s=e.tLaunch,r=Math.min(e.tBurnout||s+n,e.tEject),a=e.tEject;fa(i,11,46,s+.02,{x:0,y:.18,z:0},{speed:5.5,up:.6,c:Ah,a:.75,s1:2.1,life:7,wk:.55}),fa(i,91,16,s+.05,{x:0,y:.1,z:0},{speed:3.5,up:.3,c:Rh,a:.4,s1:1.4,life:4,wk:.5});let o=null,l=0,c=(h,d)=>{let u=t(h);if(!u||o&&Math.hypot(u.x-o.x,u.y-o.y)<(d?.2:.6)&&h-o.t<(d?.03:.2))return;o={x:u.x,y:u.y,t:h},l++;let p=as(l*1.7),g=as(l*5.3+4),S=as(l*9.1+8),m=d?7:1.2;i.add({te:h,x:u.x,y:u.y,z:u.z,vx:-u.ax*m+(p-.5)*(d?1.4:.4),vy:-u.ay*m+(g-.5)*(d?1:.3),vz:(S-.5)*(d?1.4:.4),drag:4,wk:.9,fade:.012,s0:d?.22:.08,sq:d?1:.26,s1:d?2.6+p*1.4:.7+p*.3,grow:d?.45:.5,life:d?11+g*6:6+g*3,c:d?Ah:Yx,a:d?.85:.42,rot:S*Ae,spin:(p-.5)*.5,rise:.15})};for(let h=s;h<r;h+=.002)c(h,!0);for(let h=r;h<a;h+=.01)c(h,!1);if(!e.crash){let h=t(a-.01);h&&fa(i,301,30,a,{x:h.x+h.ax*.9,y:h.y+h.ay*.9,z:0},{speed:4.5,up:0,c:Ah,a:.8,s1:1.3,life:3.4,wk:.9,flat:!1,push:{x:h.ax*4+(h.vx||0)*.5,y:h.ay*4+(h.vy||0)*.5}})}}function Ol(i,t,e,n,s){let r=Pe(s/8,.35,3);fa(i,t,Math.round(10+10*r),e,{x:n,y:.08,z:0},{speed:1.2+1.6*r,up:.3*r,c:Rh,a:.55,s1:.5+.6*r,life:2+r,wk:.5}),s>14&&fa(i,t+50,18,e,{x:n,y:.1,z:0},{speed:5,up:2.5,c:Zx,a:.5,s1:1.6,life:4,wk:.5})}var Fl=class{constructor(t=8){let e=cn(128,128,(n,s)=>{n.strokeStyle="#fff",n.lineWidth=7,n.beginPath(),n.arc(s/2,s/2,s/2-8,0,Ae),n.stroke(),n.globalAlpha=.35,n.lineWidth=16,n.beginPath(),n.arc(s/2,s/2,s/2-12,0,Ae),n.stroke()});this.group=new Xt,this.pool=Array.from({length:t},()=>{let n=new Wn(new Cn({map:e,transparent:!0,depthWrite:!1,depthTest:!1,blending:ci,fog:!1}));return n.visible=!1,n.renderOrder=8,this.group.add(n),n})}update(t,e,n,s,r){let a=0,o=.9;if(e&&e.length){let l=0,c=e.length;for(;l<c;){let h=l+c>>1;e[h].t<t-o?l=h+1:c=h}for(let h=l;h<e.length&&e[h].t<=t&&a<this.pool.length-1;h++){let d=e[h],u=(t-d.t)/o,p=this.pool[a++],g=n(d.t);if(!g){a--;continue}p.position.copy(g);let S=s.position.distanceTo(g),m=S*Math.tan(s.fov*Math.PI/360)*(.02+.13*u);if(p.scale.set(m,m,1),p.material.opacity=.5*(1-u),p.material.color.set(d.ok?7268279:16557477),p.visible=!0,d.ok&&r&&u>.25&&a<this.pool.length){let f=this.pool[a++],M=(u-.25)/.75,T=s.position.distanceTo(r),_=T*Math.tan(s.fov*Math.PI/360)*(.01+.07*M);f.position.copy(r),f.scale.set(_,_,1),f.material.opacity=.6*(1-M),f.material.color.set(7268279),f.visible=!0}}}for(;a<this.pool.length;a++)this.pool[a].visible=!1}};var Be=new P(.48,.74,.47).normalize(),ma=new Nt(12901618),Jx=new Nt(4032216);function Ch(){let i=new Ve({side:Ne,depthWrite:!1,fog:!1,uniforms:{uSun:{value:Be},uHor:{value:ma},uZen:{value:Jx}},vertexShader:"varying vec3 vD; void main(){ vD = normalize(position); vec4 p = modelViewMatrix * vec4(position, 0.0); gl_Position = projectionMatrix * vec4(p.xyz, 1.0); gl_Position.z = gl_Position.w; }",fragmentShader:`
      varying vec3 vD; uniform vec3 uSun, uHor, uZen;
      void main(){
        vec3 d = normalize(vD);
        float h = clamp(d.y, -0.2, 1.0);
        vec3 c = mix(uHor, uZen, pow(smoothstep(0.0, 0.85, h), 0.62));
        c = mix(c, uHor * vec3(0.93, 0.95, 0.98), smoothstep(0.0, -0.08, h));
        float s = max(0.0, dot(d, normalize(uSun)));
        c += vec3(1.0, 0.93, 0.78) * (pow(s, 380.0) * 2.2 + pow(s, 28.0) * 0.22 + pow(s, 5.0) * 0.1);
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
      }`}),t=new at(new oi(1,32,16),i);return t.frustumCulled=!1,t.renderOrder=-10,t}function Qd(i){let t=new Ve({uniforms:{uFog:{value:ma},uDen:{value:i},uSunK:{value:1}},vertexShader:"varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }",fragmentShader:`
      precision highp float;
      varying vec3 vW; uniform vec3 uFog; uniform float uDen;
      float h1(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
        return mix(mix(h1(i), h1(i+vec2(1,0)), f.x), mix(h1(i+vec2(0,1)), h1(i+vec2(1,1)), f.x), f.y); }
      float fbm(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++) { s += a*n2(p); p = p*2.03 + 17.0; a *= 0.5; } return s; }
      void main(){
        vec2 p = vW.xz; float d = length(cameraPosition - vW); float r = length(p);
        vec3 dry = vec3(0.70, 0.66, 0.40), green = vec3(0.40, 0.54, 0.26), dark = vec3(0.28, 0.40, 0.21);
        float m1 = fbm(p*0.0035), m2 = fbm(p*0.027 + 7.0);
        vec3 c = mix(green, dry, smoothstep(0.36, 0.66, m1));
        c = mix(c, dark, smoothstep(0.52, 0.8, m2) * 0.45);
        // \u0432\u0434\u0430\u043B\u0438 \u043E\u0442 \u043F\u043B\u043E\u0449\u0430\u0434\u043A\u0438 - \u043F\u043E\u043B\u044F \u043A\u043B\u0435\u0442\u043A\u0430\u043C\u0438 \u0441 \u0431\u043E\u0440\u043E\u0437\u0434\u0430\u043C\u0438
        vec2 g = (p + vec2(310.0, 130.0)) / vec2(270.0, 190.0); vec2 cell = floor(g), cf = fract(g);
        float cr = h1(cell);
        float inside = smoothstep(0.0, 0.025, cf.x) * smoothstep(1.0, 0.975, cf.x) * smoothstep(0.0, 0.035, cf.y) * smoothstep(1.0, 0.965, cf.y);
        vec3 field = mix(vec3(0.63, 0.60, 0.33), vec3(0.34, 0.52, 0.24), cr);
        field = mix(field, vec3(0.53, 0.43, 0.29), step(0.78, cr));
        field = mix(field, vec3(0.80, 0.74, 0.36), step(0.93, cr));
        float rows = 0.5 + 0.5*sin((cr > 0.5 ? p.x : p.y) * 1.3);
        field *= 0.94 + 0.06*rows*(1.0 - smoothstep(120.0, 500.0, d));
        float farK = smoothstep(380.0, 760.0, r) * 0.85;
        c = mix(c, mix(c*0.78, field, inside), farK);
        // \u0433\u0440\u0443\u043D\u0442\u043E\u0432\u0430\u044F \u0434\u043E\u0440\u043E\u0433\u0430 \u043C\u0438\u043C\u043E \u043B\u0430\u0433\u0435\u0440\u044F \u0438 \u0442\u0440\u043E\u043F\u0430 \u043A \u0441\u0442\u043E\u043B\u0443
        float road = smoothstep(2.6, 1.5, abs(p.y - 46.0 - 16.0*sin(p.x*0.0042)));
        float path = smoothstep(0.7, 0.3, abs(p.x + p.y*0.55)) * step(0.0, p.y) * step(p.y, 46.0);
        vec3 dirt = vec3(0.66, 0.57, 0.42) * (0.92 + 0.16*n2(p*2.3));
        c = mix(c, dirt, max(road*0.92, path*0.5));
        // \u0432\u044B\u0442\u043E\u043F\u0442\u0430\u043D\u043D\u0430\u044F \u043F\u043B\u043E\u0449\u0430\u0434\u043A\u0430 \u0443 \u0441\u0442\u0430\u0440\u0442\u043E\u0432\u043E\u0433\u043E \u0441\u0442\u043E\u043B\u0430
        c = mix(c, dirt*1.04, smoothstep(5.5, 1.2, r) * 0.75);
        // \u043C\u0435\u043B\u043A\u0430\u044F \u0444\u0430\u043A\u0442\u0443\u0440\u0430 \u0442\u0440\u0430\u0432\u044B \u0432\u0431\u043B\u0438\u0437\u0438
        float nearK = 1.0 - smoothstep(6.0, 70.0, d), closeK = 1.0 - smoothstep(1.0, 14.0, d);
        c *= 0.88 + 0.2*n2(p*1.1)*nearK + 0.12*n2(p*7.0)*nearK + 0.06*(m2 - 0.5);
        c *= 0.86 + 0.28*n2(p*vec2(34.0, 21.0))*closeK + 0.14*closeK;
        c *= 1.0 + (n2(p*vec2(160.0, 55.0) + 3.0) - 0.5)*0.34*(1.0 - smoothstep(0.5, 6.0, d));
        c = mix(c, c*vec3(1.08, 1.04, 0.8), smoothstep(0.55, 0.9, n2(p*0.9 + 40.0))*nearK*0.5);
        c = pow(c, vec3(2.2));
        float f = 1.0 - exp(-d*d*uDen*uDen);
        c = mix(c, uFog, clamp(f, 0.0, 1.0));
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
      }`}),e=new In(6e4,72);return e.rotateX(-Math.PI/2),new at(e,t)}function Bl(i){let t=Bi(i),e=Array.from({length:7},(s,r)=>({f:3*Math.pow(1.93,r)*(.85+t()*.3),ph:t()*Ae,a:Math.pow(.56,r)})),n=e.reduce((s,r)=>s+r.a,0);return s=>{let r=0;for(let a of e)r+=a.a*(1-Math.abs(Math.sin(s*a.f+a.ph)));return Math.pow(r/n,1.5)}}function zl(i,t,e,n,s,r){let a=[],o=[],l=[],h=new Nt,d=new Nt(r.rock),u=new Nt(r.foot),p=new Nt(r.snow),g=new Nt(r.shade),S=[];for(let M=0;M<=n;M++)S.push(s(he(t,e,M/n)));for(let M=0;M<=n;M++){let T=he(t,e,M/n),_=S[M],b=Math.cos(T)*i,v=Math.sin(T)*i,A=(S[Math.min(n,M+1)]-S[Math.max(0,M-1)])/Math.max(1,r.span),x=Pe(.5+A*.9,0,1);for(let w=0;w<6;w++){let R=w/5,I=_*R;a.push(b,I,v),h.copy(u).lerp(d,$d(R*1.6)).lerp(g,(1-x)*.55*R);let N=$d((I-r.snowAt+(x-.5)*r.snowJ)/r.snowBand);h.lerp(p,N*(.75+.25*x)),h.lerp(ma,r.haze*(1-R*.55)),o.push(h.r,h.g,h.b)}}for(let M=0;M<n;M++)for(let T=0;T<5;T++){let _=M*6+T,b=_+6;l.push(_,b,_+1,_+1,b,b+1)}let m=new ae;m.setAttribute("position",new Ht(a,3)),m.setAttribute("color",new Ht(o,3)),m.setIndex(l);let f=new at(m,new qe({vertexColors:!0,side:Ee,fog:!1}));return f.frustumCulled=!1,f}var $d=i=>(i=Pe(i,0,1),i*i*(3-2*i));function tf(){let i=new Xt,t=Bl(41),e=Bl(97),n=Bl(13),s=Bl(211),r=a=>Math.pow(Math.max(0,Math.sin(-a)),.45);return i.add(zl(16500,-Math.PI*1.02,Math.PI*.02,520,a=>(1300+3600*t(a))*(.3+.7*r(a)),{foot:9347773,rock:6453660,shade:4018805,snow:16777215,snowAt:2500,snowBand:900,snowJ:700,haze:.5,span:420})),i.add(zl(12500,-Math.PI*1.04,Math.PI*.04,460,a=>(700+2300*e(a*1.3+2))*(.25+.75*r(a)),{foot:8361894,rock:5664646,shade:3426655,snow:15988732,snowAt:2150,snowBand:600,snowJ:500,haze:.36,span:300})),i.add(zl(8e3,-Math.PI*1.08,Math.PI*.08,300,a=>(140+760*n(a*.8+5))*(.3+.7*r(a)),{foot:8822904,rock:6587485,shade:4151877,snow:16777215,snowAt:1e9,snowBand:1,snowJ:0,haze:.4,span:110})),i.add(zl(9500,.04,Math.PI*.96,200,a=>50+330*s(a*.6+9)*Math.pow(Math.sin(a),.5),{foot:9743238,rock:8231536,shade:5600346,snow:16777215,snowAt:1e9,snowBand:1,snowJ:0,haze:.55,span:80})),i}function kl(i){let t=Bi(i);return cn(256,128,(e,n,s)=>{let r=16+Math.floor(t()*8);for(let a=0;a<2;a++)for(let o=0;o<r;o++){let l=o/(r-1),c=n*(.16+.68*l)+(t()-.5)*18,h=Math.sin(l*Math.PI),d=s*(.16+.24*h*(.6+.4*t())),u=s*.7-d*.55-h*s*.12*t()+a*5,p=e.createRadialGradient(c,u,0,c,u,d),g=a?"255,255,255":"206,216,232";p.addColorStop(0,`rgba(${g},.9)`),p.addColorStop(.55,`rgba(${g},.6)`),p.addColorStop(1,`rgba(${g},0)`),e.fillStyle=p,e.fillRect(0,0,n,s)}})}function ef(){let i=new Xt,t=Bi(77),e=[kl(3),kl(11),kl(29),kl(57)],n=[];for(let s=0;s<26;s++){let r=new Cn({map:e[s%4],transparent:!0,opacity:.86+t()*.12,depthWrite:!1,fog:!1,color:16777215}),a=new Wn(r),o=t()*Ae,l=1500+t()*6e3,c=700+t()*1300;a.position.set(Math.cos(o)*l,1100+t()*1100,Math.sin(o)*l),a.scale.set(c,c*.5,1),i.add(a),n.push({s:a,v:.6+t()*.8})}return i.userData.drift=(s,r)=>{for(let a of n)a.s.position.x+=s*(1.5+r)*a.v,a.s.position.x>7500&&(a.s.position.x=-7500)},i}function nf(i){let t=new Xt,e=Bi(913),n=70,s=new kr(1,1),r=new ee(.08,.12,1,5),a=new ri(s,Mn(16777215,{flatShading:!0}),n),o=new ri(r,Mn(7031343),n),l=new ri(new In(1,14).rotateX(-Math.PI/2),new qe({color:1780247,transparent:!0,opacity:.3,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),n),c=new ce,h=new Ke,d=new Nt;for(let u=0;u<n;u++){let p,g,S=0;do{let _=e()*Ae,b=22+Math.pow(e(),.6)*520;p=Math.cos(_)*b,g=Math.sin(_)*b}while(i(p,g)&&++S<20);let m=e()<.4,f=m?.7+e()*.8:3+e()*4.5,M=m?f*(.8+e()*.5):f*(.32+e()*.14);h.setFromAxisAngle(new P(0,1,0),e()*Ae),a.setMatrixAt(u,c.compose(new P(p,m?f*.5:f*.68,g),h,new P(M,m?f*.6:f*.5,M))),a.setColorAt(u,d.setHSL(.25+e()*.07,.45+e()*.2,.13+e()*.08)),o.setMatrixAt(u,c.compose(new P(p,m?.05:f*.2,g),h,new P(m?.01:1+f*.12,m?.01:f*.4,m?.01:1+f*.12)));let T=(m?f*.5:f*.68)/Be.y;l.setMatrixAt(u,c.compose(new P(p-Be.x*T,.02,g-Be.z*T),new Ke,new P(M*1.15,1,M*1.15)))}return a.instanceColor.needsUpdate=!0,t.add(l,o,a),t}function sf(){let i=new Xt,t=$t(10134445,{metalness:.8,roughness:.35}),e=$t(3621201,{roughness:.7}),n=new at(new ee(.16,.16,.008,24),$t(7041664,{metalness:.7,roughness:.5}));n.position.y=.11,i.add(n);for(let d=0;d<3;d++){let u=d*Ae/3+.5,p=new at(new ee(.008,.008,.42,8),e);p.position.set(Math.cos(u)*.17,.055,Math.sin(u)*.17),p.rotation.z=Math.cos(u)*1.15,p.rotation.x=-Math.sin(u)*1.15,i.add(p)}let s=new Xt;s.position.y=.11;let r=new at(new ee(.003,.003,1.3,8),t);r.position.y=.65,s.add(r),i.add(s);let a=new at(new $e(.22,.09,.14),$t(16096779,{roughness:.6}));a.position.set(-1.2,.045,6.2),i.add(a);let o=new at(new ee(.02,.02,.02,12),$t(14427686));o.position.set(-1.2,.1,6.2),i.add(o);let l=new Pn(new ae().setFromPoints([new P(.05,.1,.05),new P(.1,.01,.4),new P(-.5,.01,3.1),new P(-1.2,.02,6.1)]),new fn({color:1120295}));i.add(l);let c=new bi(.11,.34,10),h=$t(16738842,{roughness:.6});for(let d=0;d<6;d++){let u=d*Ae/6+.3,p=new at(c,h);p.position.set(Math.cos(u)*4.2,.17,Math.sin(u)*4.2),i.add(p)}return i.userData.setRail=d=>{s.rotation.z=-d},i.userData.railG=s,i}var jd=[15845797,14724226,13208930,16044981];function pa(i,t,{skin:e=0,cap:n=null,armL:s=.12,armR:r=.12}={}){let a=new Xt,o=i*.47,l=i*.33,c=i*.075,h=Mn(3359061),d=Mn(t),u=Mn(jd[e%jd.length]);for(let m of[-1,1]){let f=new at(new ee(i*.045,i*.04,o,8),h);f.position.set(m*i*.055,o/2,0),a.add(f)}let p=new at(new Cr(i*.095,l-i*.12,4,10),d);p.position.y=o+l/2,p.scale.z=.72,a.add(p);let g=new at(new oi(c,14,10),u);if(g.position.y=o+l+c*1.25,a.add(g),n!=null){let m=new at(new oi(c*1.06,14,8,0,Ae,0,Math.PI*.5),Mn(n));m.position.copy(g.position),m.position.y+=c*.12,a.add(m)}let S=[];for(let[m,f]of[[-1,s],[1,r]]){let M=new Xt;M.position.set(m*i*.125,o+l-i*.03,0);let T=new at(new ee(i*.028,i*.024,i*.34,7),u);T.position.y=-i*.17,M.add(T),M.rotation.x=-f,a.add(M),S.push(M)}return a.userData.arms=S,a.userData.h=i,a}function Kx(){let i=new Xt,t=$t(13751771,{metalness:.9,roughness:.3}),e=new at(new ee(.008,.008,.95,8),t);e.rotation.x=Math.PI/2,e.position.z=.3,i.add(e),[.36,.33,.3,.29,.28,.27].forEach((s,r)=>{let a=new at(new ee(.003,.003,s,6),t);a.rotation.z=Math.PI/2,a.position.z=-.12+r*.165,i.add(a)});let n=new at(new ee(.014,.014,.16,8),$t(1120295));return n.position.set(0,-.08,-.02),i.add(n),i}function rf(){let i=new Xt,t=$t(13358561,{metalness:.6,roughness:.4});for(let[_,b]of[[-1.5,-1.5],[1.5,-1.5],[-1.5,1.5],[1.5,1.5]]){let v=new at(new ee(.02,.02,2.1,8),t);v.position.set(_,1.05,b),i.add(v)}let e=cn(256,64,(_,b,v)=>{_.fillStyle="#ff6a1a",_.fillRect(0,0,b,v),_.fillStyle="#fff",_.font="800 34px Inter, system-ui, sans-serif",_.textAlign="center",_.textBaseline="middle",_.fillText("USTEM",b/2,v/2+2)}),n=new at(new bi(2.25,.85,4,1),Mn(16738842));n.rotation.y=Math.PI/4,n.position.y=2.52,i.add(n);for(let _=0;_<4;_++){let b=new at(new nn(3.06,.3),Mn(16777215,{map:e,side:Ee}));b.position.set(Math.sin(_*Math.PI/2)*1.53,1.98,Math.cos(_*Math.PI/2)*1.53),b.rotation.y=_*Math.PI/2,i.add(b)}let s=new at(new $e(1.5,.04,.65),Mn(15067115));s.position.set(0,.74,0),i.add(s);for(let[_,b]of[[-.68,-.27],[.68,-.27],[-.68,.27],[.68,.27]]){let v=new at(new ee(.015,.015,.74,6),t);v.position.set(_,.37,b),i.add(v)}let r=new at(new $e(.34,.015,.23),$t(3621201));r.position.set(-.2,.77,.05),i.add(r);let a=cn(128,80,(_,b,v)=>{_.fillStyle="#0b1220",_.fillRect(0,0,b,v),_.strokeStyle="#50e3c2",_.lineWidth=2,_.beginPath();for(let A=0;A<b;A+=4)_.lineTo(A,v*.75-Math.sin(A/26)*v*.4*Math.min(1,A/40));_.stroke(),_.fillStyle="#94a3b8";for(let A=0;A<4;A++)_.fillRect(6,6+A*6,30+A*17%22,2)}),o=new at(new nn(.34,.22),new qe({map:a}));o.position.set(-.2,.885,-.07),o.rotation.x=-.25,i.add(o);let l=new at(new $e(.16,.05,.11),$t(1976635));l.position.set(.35,.785,0),i.add(l);let c=new at(new $e(.6,.4,.4),Mn(1920728));c.position.set(1,.2,1),i.add(c);let h=new Xt,d=new at(new ee(.015,.02,3.2,8),t);d.position.y=1.6,h.add(d);let u=new at(new ee(.003,.003,.5,6),$t(1120295));u.position.y=3.45,h.add(u),h.position.set(1.9,0,-1.9),i.add(h);let p=[],g=(_,b,v,A=0)=>(_.position.set(b,0,v),_.rotation.y=A,i.add(_),p.push(_),_),S=g(pa(1.62,2450411,{skin:1,cap:16738842,armL:1.25,armR:1.25}),2.6,-2.3),m=Kx();m.position.set(0,1.28,.3),S.add(m),g(pa(1.45,16096779,{skin:0}),-.35,.75,Math.PI),g(pa(1.5,1096065,{skin:2,cap:1920728}),.25,.8,Math.PI);let f=g(pa(1.76,3359061,{skin:3}),-2.4,-2),M=g(pa(1.38,15680580,{skin:1,armR:2.6}),-3.3,-2.6);return((_,b,v,A,x=.28)=>{let w=new at(new In(1,20).rotateX(-Math.PI/2),new qe({color:1780247,transparent:!0,opacity:x,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));w.position.set(_,.02,b),w.scale.set(v,1,A),i.add(w)})(-Be.x*2.6,-Be.z*2.6,2.3,2.3,.3),i.userData={operator:S,yagi:m,mast:h,people:p,watchers:[f,M,S],antenna:new P},i}function af(){let i=new Xt,t=new at(new ee(.02,.025,3.2,8),$t(15067115,{metalness:.5,roughness:.4}));t.position.y=1.6,i.add(t);let e=new Xt;e.position.y=3.15,i.add(e);let n=[];for(let s=0;s<5;s++){let r=.17-s*.022,a=.17-(s+1)*.022,o=new ee(a,r,.26,12,1,!0);o.rotateZ(-Math.PI/2),o.translate(.13,0,0);let l=new at(o,Mn(s%2?16777215:16738842,{side:Ee})),c=new Xt;c.add(l),c.position.x=s?.26:.03,(s?n[s-1]:e).add(c),n.push(c)}return i.userData.update=(s,r)=>{let a=Pe(r/8,0,1),o=(1-a)*.42;n.forEach((l,c)=>{l.rotation.z=-o*(c?1:1.3)+Math.sin(s*(3+a*5)+c*.9)*.05*(.4+a)*(c+1)*.5,l.rotation.y=Math.sin(s*2.1+c)*.04*(c+1)})},i}function Ph(){return new at(new nn(1,1).rotateX(-Math.PI/2),new qe({map:Il(64,"rgba(20,30,20,.9)","rgba(20,30,20,0)",.4),transparent:!0,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-3,polygonOffsetUnits:-3}))}var di=.125,of=8e-5,Hl=.9,lf=["follow","station","onboard","wide"],Vl=(i,t,e)=>{let n=document.createElement(i);return t&&(n.className=t),e!=null&&(n.textContent=e),n},Ih=class{constructor(t,e={}){this.host=t,this.T=e;let n=this.renderer=new Js({antialias:!0,powerPreference:"high-performance"});n.outputColorSpace=We,n.toneMapping=ns,n.toneMappingExposure=1.02,n.shadowMap.enabled=!0,n.shadowMap.type=Do,this.pr=Math.min(window.devicePixelRatio||1,2),this.slow=0,n.domElement.className="s3-canvas",this.tags=Vl("div","s3-tags"),t.append(n.domElement,this.tags);let s=this.scene=new Vn;s.fog=new Mr(ma,of),this.cam=new De(42,1.6,.05,7e4),this.sky=Ch(),this.sky.scale.setScalar(1e3),s.add(this.sky);let r=Qd(of);r.renderOrder=-9,s.add(r);let a=tf();a.children.forEach((m,f)=>{m.renderOrder=-8+f,m.material.depthTest=!1,m.material.depthWrite=!1}),s.add(a),this.clouds=ef(),s.add(this.clouds);let o=Math.hypot(.5,.85),l=-.5/o,c=.85/o;s.add(nf((m,f)=>{let M=m*l+f*c,T=Math.abs(m*c-f*l);return Math.hypot(m,f)<20||M>0&&M<230&&T<10||Math.abs(f-46-16*Math.sin(m*.0042))<6})),this.pad=sf(),s.add(this.pad),this.sock=af(),this.sock.position.set(7,0,-6),s.add(this.sock),this.station=rf(),s.add(this.station),this.station.rotation.y=Math.atan2(.5,.85)*-1,s.add(new Xr(14478335,9212016,.85));let h=this.sun=new ts(16774108,2.4);h.castShadow=!0,h.shadow.mapSize.set(2048,2048),h.shadow.bias=-6e-4,h.shadow.normalBias=.012;let d=h.shadow.camera;d.left=d.bottom=-9,d.right=d.top=9,d.near=.5,d.far=60,s.add(h,h.target),this.catcher=new at(new nn(26,26).rotateX(-Math.PI/2),new Gr({opacity:.36})),this.catcher.receiveShadow=!0,this.catcher.position.y=.015,s.add(this.catcher);let u=new Vn,p=Ch();p.scale.setScalar(900),u.add(p);let g=new at(new In(880,24).rotateX(-Math.PI/2),new qe({color:7833434}));g.position.y=-2,u.add(g);let S=new Fi(n);this.envRT=S.fromScene(u,0,.5,2e3),S.dispose(),Zn(u),s.environment=this.envRT.texture,s.environmentIntensity=.75,this.ps=new Ul,s.add(this.ps.mesh),this.pulses=new Fl,s.add(this.pulses.group),this.blobR=Ph(),this.blobC=Ph(),s.add(this.blobR,this.blobC),this.models=new Xt,s.add(this.models),this.lines=new Xt,s.add(this.lines),this.flameLight=new Qi(16752704,0,9,1.6),s.add(this.flameLight),this.t=0,this.playing=!1,this.mode="follow",this.clock=0,this.last=performance.now(),this.orb={az:.55,el:.14,zoom:1,auto:!0},this.wideOrb={az:.22,el:.05},this.S1={},this.S2={},this.S3={},this.V=new P,this.V2=new P,this.tgt=new P(0,.6,0),this.labels=[],this.wind=3,this.rail=0,this.stationD=60,this.fl=null,this.pred=null,this.cfgKey="",this.bind(),this.visible=!0,this.io=new IntersectionObserver(m=>{this.visible=m[0].isIntersecting,this.visible&&this.kick()}),this.io.observe(t),this.ro=new ResizeObserver(()=>this.resize()),this.ro.observe(t),this.resize(),this.kick()}bind(){let t=this.renderer.domElement;t.style.touchAction="pan-y";let e=null;t.addEventListener("pointerdown",s=>{e={x:s.clientX,y:s.clientY},this.active=!0,this.orb.auto=!1,t.setPointerCapture(s.pointerId),t.classList.add("grab")}),t.addEventListener("pointermove",s=>{if(!e)return;let r=this.mode==="wide"?this.wideOrb:this.orb,a=s.clientX-e.x,o=s.clientY-e.y;e={x:s.clientX,y:s.clientY},r.az-=a*.006,r.el=Pe(r.el+o*.004,-.25,1.35)});let n=()=>{e=null,t.classList.remove("grab")};t.addEventListener("pointerup",n),t.addEventListener("pointercancel",n),t.addEventListener("pointerleave",()=>{e||(this.active=!1)}),t.addEventListener("wheel",s=>{!this.active&&!s.ctrlKey||(s.preventDefault(),this.orb.zoom=Pe(this.orb.zoom*Math.exp(s.deltaY*.0012),.45,7))},{passive:!1})}zoom(t){this.orb.zoom=Pe(this.orb.zoom*t,.45,7)}setCamera(t){lf.includes(t)&&(this.mode=t)}setConfig(t){let e=JSON.stringify([t.rocket,(t.parts||[]).map(r=>r.id),t.canChute]);this.wind=t.wind||0,this.rail=-((t.rocket.rail||0)*Math.PI)/180,(t.station!==this.stationD||!this.stPos)&&(this.stationD=t.station||60,this.stPos=new P(-.5*this.stationD,0,.85*this.stationD),this.station.position.copy(this.stPos),this.wideKey="");let n=this.station.userData;if(n.yagi.visible=!!t.yagi,n.mast.visible=!t.yagi,this.yagi=!!t.yagi,this.pad.userData.setRail(this.rail),e===this.cfgKey)return;this.cfgKey=e,this.cfg=t,Zn(this.models),this.models.clear();let s=this.rocket=Ll(t.rocket,{});s.group.rotation.order="ZYX",this.flame=Jd(),this.flame.position.y=-.014,this.flame.scale.setScalar(Math.max(1,t.rocket.d/75)),s.group.add(this.flame),this.rChute=wh(Math.max(.15,t.rocket.chute/100),14427686,16777215),s.group.add(this.rChute.group),this.cordGeo=new ae().setAttribute("position",new ke(new Float32Array(12),3)),this.cord=new Mi(this.cordGeo,new fn({color:15857145})),this.cord.frustumCulled=!1,s.group.add(this.cord),this.can=da(t.parts||[],{}),this.can.group.rotation.order="ZYX",this.canRig=new Xt,this.canRig.add(this.can.group),this.cChute=t.canChute>0?wh(t.canChute/100,16738842,16777215,{gores:8}):null,this.models.add(s.group,this.canRig),this.cChute&&this.models.add(this.cChute.group),this.models.traverse(r=>{r.isMesh&&!(r.material&&r.material.blending===ci)&&(r.castShadow=!0)}),this.pad.traverse(r=>{r.isMesh&&(r.castShadow=!0)}),this.station.traverse(r=>{r.isMesh&&!r.material.transparent&&(r.castShadow=!0)})}setFlight(t){if(Zn(this.lines),this.lines.clear(),this.ps.clear(),this.pathR=this.pathC=null,!t||!t.trip){this.fl=null,this.wideKey="";return}let e=this.fl={rocket:t.trip.rocket,can:t.trip.can,ev:t.ev,packets:t.packets||[]},n=e.ev;this.thE=ui(e.rocket,n.tEject-.011,{}).th,Kd(this.ps,r=>this.nozzleAt(r),n,2),n.crash?Ol(this.ps,700,n.crash,ui(e.rocket,n.crash,{}).x,30):(Ol(this.ps,500,n.tLand,n.xCan,n.vLandCan),Ol(this.ps,600,n.tLandRocket,n.xRocket,n.vLandRocket));let s=(r,a,o,l)=>{let c=[],h=[];for(let p of r)p.t>=a&&p.t<=o&&(c.push(p.x,Math.max(0,p.z)+di,0),h.push(p.t));let d=new ae().setAttribute("position",new Ht(c,3)),u=new Pn(d,new fn({color:l,transparent:!0,opacity:.85,fog:!1}));return u.frustumCulled=!1,this.lines.add(u),{l:u,ts:h}};this.pathR=s(e.rocket,n.tLaunch,n.tLandRocket||n.tEnd,16747069),this.pathC=n.crash?null:s(e.can,n.tEject,n.tLand,2282478),this.wideKey=""}setPrediction(t){if(this.predLine&&(this.scene.remove(this.predLine),Zn(this.predLine),this.predLine=null),this.pred=t&&t.ev?t:null,this.wideKey="",!this.pred||!t.path||t.path.length<2)return;let e=new ae().setFromPoints(t.path.map(n=>new P(n.x,Math.max(0,n.z)+di,0)));this.predLine=new Pn(e,new $i({color:16777215,dashSize:4,gapSize:3,transparent:!0,opacity:.8,fog:!1})),this.predLine.computeLineDistances(),this.predLine.frustumCulled=!1,this.scene.add(this.predLine)}setTime(t,e){this.t=t,this.playing=!!e,e&&(this.orb.auto=!1)}nozzleAt(t){let e=ui(this.fl.rocket,t,this.S3);return e?{x:e.x,y:Math.max(0,e.z)+di,z:0,ax:Math.sin(e.th),ay:Math.cos(e.th),vx:e.vx,vy:e.vz}:null}kick(){!this.raf&&!this.dead&&(this.raf=requestAnimationFrame(t=>this.frame(t)))}frame(t){if(this.raf=0,this.dead)return;if(!this.visible||document.hidden||!this.host.offsetParent){this.last=t,this.visible&&setTimeout(()=>this.kick(),400);return}let e=Math.min(.1,(t-this.last)/1e3);this.last=t,this.clock+=e,this.pose(e),this.aim(e),this.renderer.render(this.scene,this.cam),this.placeLabels(),this.slow=this.slow*.95+(e>.034?1:0)*.05,this.slow>.7&&this.clock>3&&(this.slow=0,this.pr>1?(this.pr=Math.max(1,this.pr-.5),this.resize()):this.renderer.shadowMap.enabled&&(this.renderer.shadowMap.enabled=!1,this.sun.castShadow=!1,this.catcher.visible=!1)),this.kick()}resize(){let t=this.host.clientWidth,e=this.host.clientHeight;!t||!e||(this.renderer.setPixelRatio(this.pr),this.renderer.setSize(t,e,!1),this.cam.aspect=t/e,this.cam.updateProjectionMatrix(),this.W=t,this.H=e)}pose(t){let e=this.t,n=this.fl,s=n&&n.ev,r=this.rocket,a=r.group,o=this.wind,l=n?ui(n.rocket,e,this.S1):{x:0,z:0,th:this.rail,ro:0,ph:0,vx:0,vz:0},c=!!(n&&s.crash&&e>=s.crash),h=!!(n&&!s.crash&&e>=s.tEject),d=l.th,u=l.x,p=Math.max(0,l.z)+di,g=0,S=0,m=0,f=0,M=(r.R+.0045)*(1-ln(l.z/3));h&&(f=e-s.tEject,d=s.rocketChuteOk?he(this.thE,l.th,ln(f/1.2)):he(this.thE,.35*Math.sin(e*4),ln(f/.8)),g=-.5*ln(f/2),S=ln(f/.7),e>=s.tLandRocket&&(m=ln((e-s.tLandRocket)/.55),d=he(d,1.545,m),p=he(di,r.R+.012,m)));let T=Math.sin(d),_=Math.cos(d);if(_<0&&!h&&(p=Math.max(p,-_*r.L-.1)),c){let At=ui(n.rocket,s.crash-.011,this.S3);d=At.th,u=At.x,p=Math.cos(d)<-.15?-Math.cos(d)*r.L-.1:r.R+.01,Math.cos(d)>=-.15&&(d=1.545*Math.sign(Math.sin(d)||1))}a.position.set(u+Math.cos(d)*M,p-Math.sin(d)*M,g),a.rotation.set(0,l.ro||0,-d);let b=n?e-s.tLaunch:-1,v=n?(s.tBurnout||s.tLaunch+2)-s.tLaunch:0,A=n&&b>0&&b<v&&!c?Math.min(1,b/.07)*(b<.45?1.35:.92)*Math.min(1,(v-b)/.18):0;this.flame.visible=A>.01,A>0&&this.flame.userData.flick(this.clock,A),this.flameLight.intensity=A*14,this.flameLight.position.set(u-T*.15,p-_*.15+.05,.1),this.power=A;let x=r.noseG,w=Math.sin(this.clock*2.3)*.18*S*(1-m);x.position.set(he(.17*S,0,m),r.Lb+he(Hl*.42*S,.32,m),he(.05*S,.17,m)),x.rotation.z=-(he(2.95,2.55,m)*S)+w;let R=h?ln(f/.6):0,I=this.rChute;if(I.group.visible=h&&f>.1,I.group.visible){let At=f-.25,Bt=s.rocketChuteOk?ln(At/.9):.05+.015*Math.sin(this.clock*31),W=Bt>.9?.05*Math.sin(this.clock*4.2)*Math.exp(-At/4)+.014*Math.sin(this.clock*2.1):0;I.setOpen(he(Bt,.82,m),W*(1-m)),I.group.position.set(0,r.Lb+Hl*R,0),I.group.rotation.z=d*.5*(1-m),I.group.scale.set(he(1,.13,m),1,1)}this.cord.visible=h,h&&(this.cordGeo.attributes.position.array.set([0,r.Lb,0,0,r.Lb+Hl*R,0,0,r.Lb+Hl*R*.5,0,x.position.x,x.position.y-.03,x.position.z]),this.cordGeo.attributes.position.needsUpdate=!0);let N=this.canRig,F=this.cChute;N.visible=h,F&&(F.group.visible=!1);let L=u,B=p,X=0,G=0,tt=0,Z=0;if(h){let At=ui(n.can,e,this.S2),kt=s.canChuteOk;if(L=At.x,B=Math.max(0,At.z)+.1,X=.5*ln(f/2),G=kt?At.th:f*5.5,e>=s.tLand&&(tt=ln((e-s.tLand)/.6),G=he(kt?At.th:0,1.5708,tt),B=he(.1,bh+.004,tt)),N.position.set(L,B,X),this.can.group.rotation.set(0,At.ro||0,-G),F){F.group.visible=f>.08;let Bt=N.scale.x,W=(Jn/2+.016)*Bt;if(kt){let j=f-.3;Z=ln(j/.7);let ht=Z>.9?.07*Math.sin(this.clock*5)*Math.exp(-j/3)+.016*Math.sin(this.clock*2.6):0;F.setOpen(he(Z,.8,tt),ht*(1-tt));let Ft=Math.atan2(-At.vx+o,Math.max(.5,-At.vz+4)),vt=he(Ft,At.th*.4,ln(f/1.3));F.group.position.set(L+Math.sin(G)*W,B+Math.cos(G)*W,X),F.group.rotation.set(0,0,-he(vt,1.5,tt)),F.group.scale.set(Bt*he(1,.13,tt),Bt,Bt)}else{let j=Math.max(0,f-.5),ht=ui(n.can,s.tEject+.5,this.S3),Ft=Math.max(.06,ht.z+di-2.4*j),vt=Ft<=.07?1:0;F.setOpen(f<.5?.08:.55,.12*Math.sin(this.clock*3.3)*(1-vt)),f<.5?F.group.position.set(L+Math.sin(G)*W,B+Math.cos(G)*W,X):F.group.position.set(ht.x+o*Math.min(j,(ht.z+di)/2.4),Ft,X+.4),F.group.rotation.set(0,0,vt?-1.5:.25*Math.sin(this.clock*1.7)),F.group.scale.set(Bt*(vt?.13:1),Bt,Bt)}}}this.st={px:a.position.x,py:a.position.y,pz:g,ax:T,ay:_,cx:L,cy:B,cz:X,ejected:h,crashed:c,age:f,cOpen:Z,s:l};let J=this.V;h?J.set(L,B+(F&&s.canChuteOk?F.height*.42*Z*(1-tt):0),X):J.set(u+T*r.L*.5,p+_*r.L*.5,0),this.tgt.copy(J);for(let At of[this.pathR,this.pathC])if(At){let kt=0,Bt=At.ts,W=0,j=Bt.length;for(;W<j;){let ht=W+j>>1;Bt[ht]<=e?W=ht+1:j=ht}kt=W,At.l.geometry.setDrawRange(0,kt)}this.ps.update(e,o);let Y=this.station.userData;this.pulses.update(e,n&&n.packets,At=>{let kt=ui(n.can,At,this.S3);return kt?this.V2.set(kt.x,Math.max(0,kt.z)+di+.1,At>=s.tEject?X:0).clone():null},this.cam,Y.antenna),this.clouds.userData.drift(t,o),this.sock.userData.update(this.clock,o),this.station.updateMatrixWorld();let ft=this.station.worldToLocal(this.V2.copy(J)),bt=Math.atan2(ft.y-1.4,Math.hypot(ft.x,ft.z));for(let At of Y.watchers)At.rotation.y=Math.atan2(ft.x-At.position.x,ft.z-At.position.z);Y.operator.userData.arms.forEach(At=>{At.rotation.x=this.yagi?-(.95+bt*.55):-.12}),Y.yagi.rotation.x=-bt,Y.watchers[1].userData.arms[1].rotation.x=n&&e>s.tLaunch?-(Math.PI/2+bt):-.12,(this.yagi?Y.yagi:Y.mast).getWorldPosition(Y.antenna),Y.antenna.y+=this.yagi?.1:3.4}aim(t){let e=this.cam,n=this.tgt,s=this.st,r=this.rocket,a=this.fl,o=a&&a.ev,l=1,c=42,h=.05;if(this.rocket.group.visible=!0,this.mode==="wide"){let f=o||this.pred&&this.pred.ev||{apogee:250,xCan:60,xRocket:30},M=[f.apogee,f.xCan,f.xRocket,this.stationD,this.W,this.H].join();if(M!==this.wideKey){this.wideKey=M;let b=Math.min(0,f.xCan||0,f.xRocket||0,this.stPos.x)-25,v=Math.max(0,f.xCan||0,f.xRocket||0)+25,A=(f.apogee||100)*1.14+25,x=Math.tan(40*Math.PI/360);this.wide={c:new P((b+v)/2,A*.44,0),d:Math.max(A/(2*x),(v-b)/(2*x*e.aspect))*1.08},this.buildRuler(f.apogee||100)}let T=this.wideOrb,_=this.wide;c=40,h=1,e.position.set(_.c.x+_.d*Math.sin(T.az)*Math.cos(T.el),Math.max(2,_.c.y+_.d*Math.sin(T.el)),_.c.z+_.d*Math.cos(T.az)*Math.cos(T.el)),e.up.set(0,1,0),e.lookAt(_.c),l=he(1,Pe(e.position.distanceTo(n)/24,1,45),ln((n.y-2)/40))}else if(this.mode==="station"){e.position.set(this.stPos.x+2.2,1.62,this.stPos.z-3.4);let f=e.position.distanceTo(n),M=Pe(f*.028,4.2,13);c=Pe(2*Math.atan(M/2/f)*180/Math.PI,.7,40),h=Math.max(.3,f*.15);let T=c*Math.PI/180*.012,_=this.clock;e.up.set(0,1,0),e.lookAt(n.x+f*T*Math.sin(_*1.9),n.y+f*T*Math.sin(_*2.7+1),n.z)}else if(this.mode==="onboard")if(c=82,h=.015,s.ejected){let f=this.can.group;f.updateWorldMatrix(!0,!1),e.position.copy(f.localToWorld(this.V2.set(0,-Jn/2-.012,0)));let M=f.localToWorld(this.V.set(0,-3,0));e.up.copy(f.localToWorld(new P(1,0,0)).sub(f.getWorldPosition(new P))).normalize(),e.lookAt(M)}else{let f=r.group;f.updateWorldMatrix(!0,!1);let M=Math.PI/(this.cfg.rocket.fins||4)*2,T=Math.cos(M),_=Math.sin(M),b=r.R+.075;e.position.copy(f.localToWorld(this.V2.set(T*b,r.Lb*.78,_*b)));let v=f.localToWorld(this.V.set(T*(r.R+.3),-.5,_*(r.R+.3)));e.up.copy(f.localToWorld(new P(T,.25,_)).sub(f.getWorldPosition(new P))).normalize(),e.lookAt(v)}else{let f=this.orb;f.auto&&!this.playing&&(f.az+=t*.09);let M=s.ejected?2.3+(this.cChute?this.cChute.height*1.7*s.cOpen:0):Math.max(2.9,r.L*3.1)*(this.power>0||a&&this.t>o.tLaunch?1.55:1);this.dist=this.dist==null?M:he(this.dist,M,1-Math.exp(-t*2.5));let T=this.dist*f.zoom,_=this.power*.012;e.position.set(n.x+T*Math.sin(f.az)*Math.cos(f.el)+_*Math.sin(this.clock*83),Math.max(.3,n.y+T*Math.sin(f.el)+_*Math.sin(this.clock*71)),n.z+T*Math.cos(f.az)*Math.cos(f.el)),e.up.set(0,1,0),e.lookAt(n)}(e.fov!==c||e.near!==h)&&(e.fov=c,e.near=h,e.updateProjectionMatrix()),this.rocket.group.scale.setScalar(l),this.canRig.scale.setScalar(l),this.ruler&&(this.ruler.visible=this.mode==="wide");for(let f of[this.pathR,this.pathC])f&&(f.l.visible=this.mode==="wide");this.predLine&&(this.predLine.visible=!a);let d=Math.round((n.x-Be.x*(n.y/Be.y))*2)/2,u=Math.round((n.z-Be.z*(n.y/Be.y))*2)/2,p=n.y/Be.y+30;this.sun.position.set(d+Be.x*p,Be.y*p,u+Be.z*p),this.sun.target.position.set(d,0,u);let g=this.sun.shadow.camera;Math.abs(g.far-(p+14))>.5&&(g.far=p+14,g.updateProjectionMatrix()),this.catcher.position.set(d,.015,u);let S=this.mode==="wide",m=(f,M,T,_,b)=>{if(f.visible=b&&S,f.visible){let v=6+T*.05;f.position.set(M-Be.x*(T/Be.y),.03,_-Be.z*(T/Be.y)),f.scale.setScalar(v),f.material.opacity=Pe(1.1-T/500,.25,.9)}};m(this.blobR,s.px,s.py,s.pz,s.py>3),m(this.blobC,s.cx,s.cy,s.cz,s.ejected&&s.cy>3)}tag(t,e,n,s,r,a){let o=Vl("div","s3-tag "+(n||""));o.append(Vl("span","",e));let l=Vl("b");l.setAttribute("data-notr",""),o.append(l),this.tags.append(o);let c={key:t,e:o,b:l,posFn:s,showFn:r,num:a};return this.labels.push(c),c}initLabels(){if(this.labels.length)return;let t=this.T,e=new P;this.tag("station",t.station||"Station","",()=>e.copy(this.stPos).setY(3.6),()=>this.mode==="wide"||this.mode==="follow"&&!this.fl),this.tag("pad",t.pad||"Pad","",()=>e.set(0,2.2,0),()=>this.mode==="wide"&&(!this.fl||this.st.py>30)),this.tag("can","CanSat","s3-tag-can",()=>e.set(this.st.cx,this.st.cy,this.st.cz),()=>this.st.ejected&&(this.mode==="wide"||this.mode==="station")),this.tag("rocket",t.rocket||"Rocket","s3-tag-rocket",()=>e.set(this.st.px,this.st.py,this.st.pz),()=>this.st.ejected&&(this.mode==="wide"||this.mode==="station")),this.tag("apogee",t.apogee||"Apogee","s3-tag-apo",()=>{let n=this.apoPoint();return n&&e.copy(n)},()=>this.mode==="wide"||!this.fl,()=>{let n=this.fl&&this.fl.ev||this.pred&&this.pred.ev;return n?`${this.fl?"":"\u2248 "}${Math.round(n.apogee)} \u043C`:""})}apoPoint(){let t=this.fl?this.fl.rocket:this.pred&&this.pred.path;if(!t||!t.length)return null;if(this.apoRows!==t){this.apoRows=t;let e=t[0];for(let n of t)n.z>e.z&&(e=n);this.apoP=new P(e.x,e.z+di,0)}return this.apoP}buildRuler(t){this.ruler&&(this.scene.remove(this.ruler),Zn(this.ruler));for(let r of this.labels.filter(a=>a.key==="tick"))r.e.remove();this.labels=this.labels.filter(r=>r.key!=="tick");let e=t>900?200:t>360?100:50,n=Math.ceil(t/e)*e,s=[0,0,-10,0,n,-10];for(let r=e;r<=n;r+=e){s.push(-4,r,-10,4,r,-10);let a=new P(0,r,-10);this.tag("tick","","s3-tag-tick",()=>a,()=>this.mode==="wide",()=>`${r} \u043C`)}this.ruler=new Mi(new ae().setAttribute("position",new Ht(s,3)),new fn({color:16777215,transparent:!0,opacity:.55,fog:!1})),this.ruler.frustumCulled=!1,this.scene.add(this.ruler)}placeLabels(){this.initLabels();let t=this.V2,e=this.W,n=this.H;for(let s of this.labels){let r=!!this.st&&s.showFn(),a=r&&s.posFn();if(r&&a?(t.copy(a).project(this.cam),r=t.z<1&&t.z>-1&&Math.abs(t.x)<.98&&Math.abs(t.y)<.95):r=!1,s.e.hidden=!r,!!r){if(s.num){let o=s.num();s.b.textContent!==o&&(s.b.textContent=o)}s.e.style.transform=`translate(${((t.x+1)/2*e).toFixed(1)}px, ${((1-t.y)/2*n).toFixed(1)}px)`}}}dispose(){this.dead=!0,cancelAnimationFrame(this.raf),this.io.disconnect(),this.ro.disconnect(),Zn(this.scene),this.envRT.dispose(),this.renderer.dispose(),this.renderer.forceContextLoss(),this.renderer.domElement.remove(),this.tags.remove()}};export{Th as BuilderView,lf as CAMERAS,Ih as FlightScene};
/*! Bundled license information:

three/build/three.core.js:
  (**
   * @license
   * Copyright 2010-2026 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)

three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2026 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
