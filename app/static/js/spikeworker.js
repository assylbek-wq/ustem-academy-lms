var U={white:[246,246,240],black:[28,28,30],red:[214,40,40],blue:[37,99,235],green:[22,160,74],yellow:[250,204,21],homeL:[255,237,213],homeR:[219,234,254],orange:[234,88,12],gray:[203,213,225],zone:[226,232,240]},w={BLACK:0,MAGENTA:1,PURPLE:2,BLUE:3,AZURE:4,TURQUOISE:5,GREEN:6,YELLOW:7,ORANGE:8,RED:9,WHITE:10,UNKNOWN:-1};function W(a,t,e,s,i=40){let n=[];for(let c=0;c<=i;c++){let h=c/i,o=1-h;n.push([o*o*o*a[0]+3*o*o*h*t[0]+3*o*h*h*e[0]+h*h*h*s[0],o*o*o*a[1]+3*o*o*h*t[1]+3*o*h*h*e[1]+h*h*h*s[1]])}return n}var J=[...W([450,640],[700,640],[800,900],[1050,900]),...W([1050,900],[1300,900],[1350,640],[1600,640]).slice(1),...W([1600,640],[1800,640],[1850,820],[1900,860]).slice(1)],it=[{t:"rect",x0:0,y0:0,x1:380,y1:320,c:"homeL",label:"\u0414\u041E\u041C: \u041B\u0415\u0412\u0410\u042F"},{t:"rect",x0:1982,y0:0,x1:2362,y1:320,c:"homeR",label:"\u0414\u041E\u041C: \u041F\u0420\u0410\u0412\u0410\u042F"},{t:"frame",x0:0,y0:0,x1:380,y1:320,w:10,c:"orange"},{t:"frame",x0:1982,y0:0,x1:2362,y1:320,w:10,c:"blue"},{t:"seg",a:[450,60],b:[450,300],w:8,c:"black"},...Array.from({length:11},(a,t)=>({t:"seg",a:[550+t*100,60],b:[550+t*100,t%5===4?140:100],w:4,c:"black"})),{t:"seg",a:[450,60],b:[1550,60],w:4,c:"black"},{t:"seg",a:[450,430],b:[2e3,430],w:20,c:"black"},{t:"poly",pts:J,w:20,c:"black"},{t:"rect",x0:1880,y0:820,x1:1990,y1:930,c:"green"},{t:"rect",x0:450,y0:960,x1:600,y1:1110,c:"red"},{t:"rect",x0:700,y0:960,x1:850,y1:1110,c:"blue"},{t:"rect",x0:950,y0:960,x1:1100,y1:1110,c:"yellow"},{t:"rect",x0:1200,y0:960,x1:1350,y1:1110,c:"green"},{t:"rect",x0:1600,y0:120,x1:1850,y1:320,c:"zone"},{t:"frame",x0:1600,y0:120,x1:1850,y1:320,w:6,c:"gray"}];var z=(a,t,e,s)=>{let i=s[0]-e[0],n=s[1]-e[1],c=i*i+n*n,h=c?Math.max(0,Math.min(1,((a-e[0])*i+(t-e[1])*n)/c)):0;return Math.hypot(a-(e[0]+i*h),t-(e[1]+n*h))};function F(a,t,e){let s=1/0;for(let i=1;i<e.length;i++)s=Math.min(s,z(a,t,e[i-1],e[i]));return s}function nt(a,t,e){return a.t==="rect"?t>=a.x0&&t<=a.x1&&e>=a.y0&&e<=a.y1:a.t==="frame"?t>=a.x0&&t<=a.x1&&e>=a.y0&&e<=a.y1?t-a.x0<a.w||a.x1-t<a.w||e-a.y0<a.w||a.y1-e<a.w:!1:a.t==="seg"?z(t,e,a.a,a.b)<=a.w/2:a.t==="poly"?F(t,e,a.pts)<=a.w/2:!1}function at(a,t){if(a<0||t<0||a>2362||t>1143)return U.gray;let e=U.white;for(let s of it)nt(s,a,t)&&(e=U[s.c]);return e}var Y=Array.from({length:64},(a,t)=>{let e=7*Math.sqrt((t+.5)/64),s=t*2.399963;return[e*Math.cos(s),e*Math.sin(s)]});function D(a,t){let e=0,s=0,i=0;for(let[c,h]of Y){let o=at(a+c,t+h);e+=o[0],s+=o[1],i+=o[2]}let n=Y.length;return[e/n,s/n,i/n]}function q(a){let t=(.3*a[0]+.59*a[1]+.11*a[2])/255;return Math.max(0,Math.min(100,Math.round(t*97+1)))}function $(a){let[t,e,s]=a,i=Math.max(t,e,s),n=Math.min(t,e,s),c=i/255,h=i?(i-n)/i:0;if(c<.25)return w.BLACK;if(h<.25)return c>.7?w.WHITE:w.UNKNOWN;let o;return i===t?o=(60*((e-s)/(i-n))+360)%360:i===e?o=60*((s-t)/(i-n))+120:o=60*((t-e)/(i-n))+240,o<15||o>=340?w.RED:o<40?w.ORANGE:o<70?w.YELLOW:o<160?w.GREEN:o<200?w.AZURE:o<260?w.BLUE:w.MAGENTA}var lt=56,Z=Math.PI*lt/360,ct=112,y={front:105,back:75,half:80},ht={E:[95,-28],F:[95,28]},pt={large:1050,medium:1110,small:660},N=["A","B","C","D","E","F"],I=.005,mt={A:"motor:large",B:"motor:large",C:"motor:medium",D:"motor:medium",E:"color",F:"color"},H=class{constructor(t){this.kind=t,this.pos=0,this.vel=0,this.cmd=0,this.accel=1e3,this.decel=1e3,this.job=null,this.offset=0}get max(){return pt[this.kind]||1050}},P=(a,t,e)=>Math.max(t,Math.min(e,a)),K=(a,t,e,s,i)=>{let n=Math.abs(t)>Math.abs(a)&&Math.sign(t||1)===Math.sign(a||t||1)?e:s,c=t-a,h=n*i;return Math.abs(c)<=h?t:a+Math.sign(c)*h},Q=(a,t,e)=>Math.sign(a)*Math.min(t,Math.sqrt(2*e*Math.abs(a))),O=class{constructor(t={}){this.preset=t,this.ports={...mt,...t.robot||{}};let e=t.start||{x:190,y:150,h:-90};this.pose={x:e.x,y:e.y,h:(e.h||0)*Math.PI/180},this.drift=t.drift||0,this.motors={};for(let s of N)String(this.ports[s]).startsWith("motor")&&(this.motors[s]=new H(this.ports[s].split(":")[1]||"medium"));this.pairs={},this.pairJob=null,this.t=0,this.yawOffset=this.pose.h,this.matrix={text:"",image:null,pixels:null},this.prints=[],this.beeps=[],this.buttons={left:!1,right:!1},this.box=t.box?{...t.box,r:55}:null,this.lever=t.lever?{...t.lever,up:!0,flips:0}:null,this.trail=[[this.pose.x,this.pose.y]],this.trailT=0,this.maxLineDist=0,this.events=[]}device(t){return this.ports[t]}motor(t){let e=this.motors[t];if(!e)throw new Error(`\u041D\u0430 \u043F\u043E\u0440\u0442\u0443 ${t} \u043D\u0435\u0442 \u043C\u043E\u0442\u043E\u0440\u0430 (\u0442\u0430\u043C: ${this.ports[t]||"\u043F\u0443\u0441\u0442\u043E"})`);return e}motorRun(t,e,s=1e3){let i=this.motor(t);this.releasePair(t),this.cancelJob(i),i.cmd=P(e,-i.max,i.max),i.accel=s,i.decel=s}motorStop(t,e="brake"){let s=this.motor(t);this.releasePair(t),this.cancelJob(s),s.cmd=0,s.decel=e==="coast"?1500:12e3}motorForDegrees(t,e,s,i=1e3,n=1e3){let c=this.motor(t);this.releasePair(t),this.cancelJob(c);let h=Math.sign(e||1)*Math.sign(s||1);return new Promise(o=>{c.job={target:c.pos+Math.abs(e)*h,vmax:Math.min(Math.abs(s),c.max),accel:i,decel:n,resolve:o}})}motorToRelative(t,e,s){let i=this.motor(t);return this.releasePair(t),this.cancelJob(i),new Promise(n=>{i.job={target:e+i.offset,vmax:Math.min(Math.abs(s),i.max),accel:1e3,decel:1e3,resolve:n}})}cancelJob(t){if(t.job){let e=t.job.resolve;t.job=null,e(3)}}releasePair(t){if(this.pairJob&&this.pairJob.ports.includes(t)){let e=this.pairJob.resolve;this.pairJob=null,e&&e(3)}}pairPorts(t){let e=this.pairs[t];if(!e)throw new Error("\u041F\u0430\u0440\u0430 \u043C\u043E\u0442\u043E\u0440\u043E\u0432 \u043D\u0435 \u043D\u0430\u0441\u0442\u0440\u043E\u0435\u043D\u0430: \u0441\u043D\u0430\u0447\u0430\u043B\u0430 motor_pair.pair(motor_pair.PAIR_1, port.A, port.B)");return e}static steer(t){return t=P(t,-100,100),t>=0?[1,1-t/50]:[1+t/50,1]}pairMove(t,e,s,i=1e3){let[n,c]=this.pairPorts(t);if(this.pairJob){let M=this.pairJob.resolve;this.pairJob=null,M&&M(3)}let h=this.motor(n),o=this.motor(c);this.cancelJob(h),this.cancelJob(o),h.cmd=P(-e,-h.max,h.max),o.cmd=P(s,-o.max,o.max),h.accel=o.accel=i,h.decel=o.decel=i}pairStop(t,e="brake"){let[s,i]=this.pairPorts(t);if(this.pairJob){let n=this.pairJob.resolve;this.pairJob=null,n&&n(3)}for(let n of[s,i]){let c=this.motor(n);this.cancelJob(c),c.cmd=0,c.decel=e==="coast"?1500:12e3}}pairForDegrees(t,e,s,i,n,c=1e3,h=1e3){let[o,M]=this.pairPorts(t);if(this.pairJob){let b=this.pairJob.resolve;this.pairJob=null,b&&b(3)}let v=this.motor(o),u=this.motor(M);this.cancelJob(v),this.cancelJob(u);let x=Math.max(Math.abs(s),Math.abs(i))||1,_=Math.sign(e||1)*Math.sign(n||1);return new Promise(b=>{this.pairJob={ports:[o,M],A:o,B:M,l:s/x*_,r:i/x*_,total:Math.abs(e),done:0,vp:0,vmax:Math.min(Math.abs(n),v.max),accel:c,decel:h,resolve:b}})}local2world(t,e){let s=this.pose;return{x:s.x-Math.sin(s.h)*t+Math.cos(s.h)*e,y:s.y+Math.cos(s.h)*t+Math.sin(s.h)*e}}sensorPoint(t){let e=this.preset.sensorPos&&this.preset.sensorPos[t]||ht[t]||[95,0];return this.local2world(e[0],e[1])}needDevice(t,e){if(!String(this.ports[t]||"").startsWith(e))throw new Error(`\u041D\u0430 \u043F\u043E\u0440\u0442\u0443 ${t} \u043D\u0435\u0442 \u0443\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432\u0430 \xAB${e}\xBB (\u0442\u0430\u043C: ${this.ports[t]||"\u043F\u0443\u0441\u0442\u043E"})`)}reflection(t){this.needDevice(t,"color");let e=this.sensorPoint(t);return q(D(e.x,e.y))}color(t){this.needDevice(t,"color");let e=this.sensorPoint(t);return $(D(e.x,e.y))}rgbi(t){this.needDevice(t,"color");let e=this.sensorPoint(t),s=D(e.x,e.y);return[...s.map(i=>Math.round(i*4)),Math.round((s[0]+s[1]+s[2])*4/3)]}distance(t){this.needDevice(t,"distance");let e=this.local2world(y.front,0),s=-Math.sin(this.pose.h),i=Math.cos(this.pose.h),n=1/0;s>1e-6&&(n=Math.min(n,(2362-e.x)/s)),s<-1e-6&&(n=Math.min(n,-e.x/s)),i>1e-6&&(n=Math.min(n,(1143-e.y)/i)),i<-1e-6&&(n=Math.min(n,-e.y/i));for(let c of[this.box,this.lever&&{x:this.lever.x,y:this.lever.y,r:40}]){if(!c)continue;let h=e.x-c.x,o=e.y-c.y,M=h*s+o*i,v=h*h+o*o-c.r*c.r,u=M*M-v;if(u>=0){let x=-M-Math.sqrt(u);x>0&&(n=Math.min(n,x))}}return n>2e3?-1:Math.round(n)}forcePressed(t){return this.needDevice(t,"force"),this.frontContact()<3}force(t){return this.needDevice(t,"force"),this.frontContact()<3?60:0}frontContact(){let t=1/0;for(let e of[-y.half+10,0,y.half-10]){let s=this.local2world(y.front,e);t=Math.min(t,s.x,s.y,2362-s.x,1143-s.y),this.box&&(t=Math.min(t,Math.hypot(s.x-this.box.x,s.y-this.box.y)-this.box.r))}return t}yawDeci(){let t=(this.pose.h-this.yawOffset)*180/Math.PI;return t=((t+180)%360+360)%360-180,Math.round(t*10)}resetYaw(t){this.yawOffset=this.pose.h-t/10*Math.PI/180}step(t=I){this.t+=t;let e=this.pairJob;if(e){let s=e.total-e.done,i=Q(s,e.vmax,e.decel);e.vp=K(e.vp,i,e.accel,e.decel,t),e.done+=e.vp*t;let n=this.motors[e.A],c=this.motors[e.B];n.vel=-e.vp*e.l,c.vel=e.vp*e.r,n.cmd=n.vel,c.cmd=c.vel,n.pos+=n.vel*t,c.pos+=c.vel*t,e.total-e.done<.5&&Math.abs(e.vp)<60&&(n.vel=c.vel=n.cmd=c.cmd=0,this.pairJob=null,e.resolve(0))}for(let[s,i]of Object.entries(this.motors))if(!(e&&e.ports.includes(s))){if(i.job){let n=i.job,c=n.target-i.pos;i.vel=K(i.vel,Q(c,n.vmax,n.decel),n.accel,n.decel,t),Math.abs(c)<.5&&Math.abs(i.vel)<60&&(i.pos=n.target,i.vel=0,i.cmd=0,i.job=null,n.resolve(0))}else i.vel=K(i.vel,i.cmd,i.accel,i.decel,t);i.pos+=i.vel*t}if(this.kinematics(t),this.trailT+=t,this.trailT>.05&&(this.trailT=0,this.trail.push([Math.round(this.pose.x),Math.round(this.pose.y)]),this.trail.length>3e3&&this.trail.shift()),this.preset.trackLine){let s=this.sensorPoint(this.preset.trackLine),i=F(s.x,s.y,J);this.t>.3&&(this.maxLineDist=Math.max(this.maxLineDist,i))}}kinematics(t){let e=this.pose,s=0,i=0,n=this.motors.A,c=this.motors.B;n&&String(this.ports.A).startsWith("motor")&&(s=-n.vel*Z*(1-this.drift/2)),c&&String(this.ports.B).startsWith("motor")&&(i=c.vel*Z*(1+this.drift/2));let h=(s+i)/2,o=(i-s)/ct,M={...e};e.h+=o*t,e.x+=-Math.sin(e.h)*h*t,e.y+=Math.cos(e.h)*h*t;let v=[[y.front,-y.half],[y.front,y.half],[-y.back,-y.half],[-y.back,y.half]].map(([_,b])=>this.local2world(_,b)),u=0,x=0;for(let _ of v)_.x<0&&(u=Math.max(u,-_.x)),_.x>2362&&(u=Math.min(u,2362-_.x)),_.y<0&&(x=Math.max(x,-_.y)),_.y>1143&&(x=Math.min(x,1143-_.y));if(u||x){e.x+=u,e.y+=x;let _=-Math.sin(e.h),b=Math.cos(e.h),g=Math.abs(x)>=Math.abs(u)?[0,Math.sign(x)]:[Math.sign(u),0],f=_*g[0]+b*g[1];if(Math.abs(h)>1&&Math.abs(f)>.6){let p=Math.atan2(g[0]*Math.sign(h),-g[1]*Math.sign(h))-e.h;for(;p>Math.PI;)p-=2*Math.PI;for(;p<-Math.PI;)p+=2*Math.PI;e.h+=P(p,-1,1)*Math.min(1,t*15)}}if(this.box&&this.pushBox(M),this.lever&&this.motors.C){let _=this.motors.C.pos,b=110*Math.sin(P(_,0,180)*Math.PI/180),g=this.local2world(y.front+b,0),f=Math.hypot(g.x-this.lever.x,g.y-this.lever.y);this.lever.up&&f<70&&_>60&&(this.lever.up=!1,this.lever.flips++,this.events.push("lever"))}}pushBox(){let t=this.box,e=this.pose,s=t.x-e.x,i=t.y-e.y,n=s*-Math.sin(e.h)+i*Math.cos(e.h),c=s*Math.cos(e.h)+i*Math.sin(e.h),h=P(n,-y.back,y.front),o=P(c,-y.half,y.half),M=n-h,v=c-o,u=Math.hypot(M,v);if(u>=t.r)return;let x,_;u<1e-6?(x=n>=0?y.front+t.r:-y.back-t.r,_=c):(x=h+M/u*t.r,_=o+v/u*t.r);let b=this.local2world(x,_);t.x=P(b.x,t.r,2362-t.r),t.y=P(b.y,t.r,1143-t.r)}boxInZone(t){return!!this.box&&this.box.x>=t.x0&&this.box.x<=t.x1&&this.box.y>=t.y0&&this.box.y<=t.y1}get heading(){return this.yawDeciWorld()/10}yawDeciWorld(){let t=this.pose.h*180/Math.PI;return Math.round((((t+180)%360+360)%360-180)*10)}snapshot(){let t={};for(let[e,s]of Object.entries(this.motors))t[e]=Math.round(s.pos);return{t:this.t,pose:{x:this.pose.x,y:this.pose.y,h:this.pose.h},motors:t,matrix:this.matrix,box:this.box&&{x:this.box.x,y:this.box.y},lever:this.lever&&{up:this.lever.up,flips:this.lever.flips},sensors:Object.fromEntries(N.filter(e=>String(this.ports[e])==="color").map(e=>[e,this.sensorPoint(e)])),maxLineDist:this.maxLineDist,yaw:this.yawDeci()}}};var V={"hub.py":`
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
`};var ft=["A","B","C","D","E","F"],X={1:"0101011111111110111000100",2:"0000001010011100010000000",3:"0000001010000001000101110",4:"0000001010000000111000000",5:"0000001010000000111010001",13:"0000000001000101010001000",14:"1000101010001000101010001",43:"1111110001100011000111111"};async function tt({code:a,preset:t,speed:e=1,loadMicroPython:s,wasmUrl:i,post:n,onSim:c,now:h=()=>performance.now()}){let o=new O(t);c&&c(o);let M=!1,v=h(),u=[],x=0,_=()=>(h()-v)/1e3*e,b=(r={})=>n({type:"state",state:o.snapshot(),...r});function g(){if(M)return;let r=_(),l=0;for(;o.t+I<=r&&l<6e3;){o.step(I),l++;for(let m=u.length-1;m>=0;m--)u[m].t<=o.t&&u.splice(m,1)[0].resolve(0)}l>=6e3&&(v=h()-o.t*1e3/e),h()-x>33&&(x=h(),b());for(let m of o.events.splice(0))n({type:"event",event:m})}let f=r=>{let l=ft[r];if(l===void 0)throw new Error("\u041D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043D\u044B\u0439 \u043F\u043E\u0440\u0442: "+r);return l},R=r=>new Promise(l=>u.push({t:o.t+Math.max(0,r)/1e3,resolve:l})),p=r=>(...l)=>(g(),r(...l)),j=r=>r===0||r===4?"coast":"brake",C=r=>O.steer(r),et={now:()=>(g(),Math.round(o.t*1e3)),sleep:r=>(g(),R(r)),tick:()=>(g(),R(I*1e3)),m_run:p((r,l,m)=>o.motorRun(f(r),l,m)),m_stop:p((r,l)=>o.motorStop(f(r),j(l))),m_deg:p((r,l,m,d,E)=>o.motorForDegrees(f(r),l,m,d,E)),m_time:p((r,l,m,d)=>(o.motorRun(f(r),m,d),R(l).then(()=>(o.motorStop(f(r)),0)))),m_rel:p((r,l,m)=>o.motorToRelative(f(r),l,m)),m_abs:p((r,l,m)=>{let E=(o.motor(f(r)).pos%360+360)%360,A=l-E;return A>180&&(A-=360),A<-180&&(A+=360),o.motorForDegrees(f(r),A,Math.abs(m))}),m_relpos:p(r=>Math.round(o.motor(f(r)).pos-o.motor(f(r)).offset)),m_reset:p((r,l)=>{let m=o.motor(f(r));m.offset=m.pos-l}),m_abspos:p(r=>(Math.round(o.motor(f(r)).pos)%360+540)%360-180),m_vel:p(r=>Math.round(o.motor(f(r)).vel)),p_pair:p((r,l,m)=>{o.pairs[r]=[f(l),f(m)],o.motor(f(l)),o.motor(f(m))}),p_unpair:p(r=>{delete o.pairs[r]}),p_move:p((r,l,m,d)=>{let[E,A]=C(l);o.pairMove(r,m*E,m*A,d)}),p_tank:p((r,l,m,d)=>o.pairMove(r,l,m,d)),p_stop:p((r,l)=>o.pairStop(r,j(l))),p_deg:p((r,l,m,d,E,A)=>{let[S,st]=C(m);return o.pairForDegrees(r,l,S,st,d,E,A)}),p_tank_deg:p((r,l,m,d,E,A)=>{let S=Math.max(Math.abs(m),Math.abs(d))||1;return o.pairForDegrees(r,l,m/S,d/S,S,E,A)}),p_time:p((r,l,m,d,E)=>{let[A,S]=C(m);return o.pairMove(r,d*A,d*S,E),R(l).then(()=>(o.pairStop(r),0))}),p_tank_time:p((r,l,m,d,E)=>(o.pairMove(r,m,d,E),R(l).then(()=>(o.pairStop(r),0)))),reflection:p(r=>o.reflection(f(r))),color:p(r=>o.color(f(r))),rgbi:p(r=>o.rgbi(f(r))),distance:p(r=>o.distance(f(r))),force:p(r=>o.force(f(r))),pressed:p(r=>o.forcePressed(f(r))),tilt:p(()=>[o.yawDeci(),0,0]),gyro:p(()=>[0,0,0]),reset_yaw:p(r=>o.resetYaw(r)),button:p(r=>r===1?o.buttons.left?100:0:r===2&&o.buttons.right?100:0),matrix_write:p((r,l,m)=>(o.matrix={text:r,image:null,pixels:null},b(),R(Math.max(1,r.length)*m))),matrix_image:p(r=>{o.matrix={text:"",image:r,pixels:X[r]?[...X[r]].map(l=>l==="1"?100:0):null}}),matrix_clear:p(()=>{o.matrix={text:"",image:null,pixels:null}}),matrix_pixel:p((r,l,m)=>{let d=o.matrix.pixels?[...o.matrix.pixels]:new Array(25).fill(0);r>=0&&r<5&&l>=0&&l<5&&(d[l*5+r]=m),o.matrix={text:"",image:null,pixels:d}}),matrix_get:p((r,l)=>o.matrix.pixels&&o.matrix.pixels[l*5+r]||0),matrix_show:p(r=>{o.matrix={text:"",image:null,pixels:Array.from(r).slice(0,25)}}),beep:p((r,l,m)=>(o.beeps.push(r),n({type:"beep",freq:r,ms:l/e,vol:m}),R(l)))},G=[],T=await s({url:i,heapsize:4*1024*1024,pystack:4096,stdout:r=>{o.prints.push(r),n({type:"print",line:r})},stderr:r=>G.push(r),linebuffer:!0});try{T.FS.mkdir("/lib")}catch{}for(let[r,l]of Object.entries(V))T.FS.writeFile("/lib/"+r,l);T.registerJsModule("_sim",et);let ot=setInterval(g,4);v=h();let B=null;try{await T.runPythonAsync(a),await T.runPythonAsync(`import runloop as _rl
import asyncio as _aio
if _rl._tasks:
    await _aio.gather(*_rl._tasks)
`)}catch(r){B=String(r&&r.message||r)+(G.length?`
`+G.join(`
`):"")}g();for(let r of N)o.motors[r]&&(o.cancelJob(o.motors[r]),o.motors[r].cmd=0,o.motors[r].decel=12e3);if(o.pairJob){let r=o.pairJob.resolve;o.pairJob=null,r(3)}let rt=o.t+.4;for(;o.t<rt;)o.step(I);return clearInterval(ot),M=!0,n({type:"state",state:o.snapshot()}),n({type:"done",error:B,prints:o.prints.length,beeps:o.beeps.length}),{sim:o,error:B}}self.onmessage=async a=>{let t=a.data;if(t.type==="start")try{let e=await import(t.mjsUrl),s=await tt({code:t.code,preset:t.preset,speed:t.speed||1,wasmUrl:t.wasmUrl,loadMicroPython:e.loadMicroPython,post:i=>self.postMessage(i),onSim:i=>{self.__sim=i}})}catch(e){self.postMessage({type:"done",error:String(e&&e.message||e)})}else t.type==="button"&&self.__sim&&(self.__sim.buttons[t.which]=t.down)};
