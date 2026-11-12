import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js';

const canvas=document.querySelector('#scene');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
const scene=new THREE.Scene();scene.background=new THREE.Color('#d59b62');scene.fog=new THREE.Fog('#d59b62',48,190);
const camera=new THREE.PerspectiveCamera(56,innerWidth/innerHeight,.1,350);camera.position.set(0,5.3,-10.7);camera.lookAt(0,1,7);
scene.add(new THREE.HemisphereLight('#fff0d4','#603823',2.1));const sunLight=new THREE.DirectionalLight('#ffe3b4',3.3);sunLight.position.set(-12,23,-2);sunLight.castShadow=true;sunLight.shadow.mapSize.set(1024,1024);sunLight.shadow.camera.left=-18;sunLight.shadow.camera.right=18;sunLight.shadow.camera.top=30;sunLight.shadow.camera.bottom=-20;scene.add(sunLight);
const mat=(color,rough=.8,metal=0)=>new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal});
const mats={sand:mat('#c78b51'),track:mat('#875138'),trackEdge:mat('#e6bc7e'),rock:mat('#6a5041'),rock2:mat('#a86e47'),cactus:mat('#42634a'),cactus2:mat('#638263'),horse:mat('#50382e'),horseLight:mat('#987052'),mane:mat('#271d1b'),leather:mat('#5a3224'),cloth:mat('#b34531'),blue:mat('#41627b'),gold:mat('#e9bd67',.42,.25),steel:mat('#bac5c7',.23,.82),dark:mat('#252128'),bone:mat('#f2dfb6'),tusk:mat('#6cc5cf',.35,.2),white:mat('#f6e8d5')};
function mesh(geo,material,parent=scene,pos=[0,0,0],cast=true){const o=new THREE.Mesh(geo,material);o.position.set(...pos);o.castShadow=cast;o.receiveShadow=true;parent.add(o);return o}
function box(parent,material,pos,scale){const o=mesh(new THREE.BoxGeometry(...scale),material,parent,pos);return o}
function ball(parent,material,pos,scale){const o=mesh(new THREE.SphereGeometry(1,14,10),material,parent,pos);o.scale.set(...scale);return o}
function cyl(parent,material,pos,r1,r2,h,segments=9){return mesh(new THREE.CylinderGeometry(r1,r2,h,segments),material,parent,pos)}
// Endless ground and the sun-baked raceway.
const floor=mesh(new THREE.PlaneGeometry(260,340),mats.sand,scene,[0,-.08,100],false);floor.rotation.x=-Math.PI/2;
const road=mesh(new THREE.PlaneGeometry(9.2,340),mats.track,scene,[0,-.035,100],false);road.rotation.x=-Math.PI/2;
for(const x of [-4.7,4.7]){const edge=mesh(new THREE.PlaneGeometry(.18,340),mats.trackEdge,scene,[x,-.025,100],false);edge.rotation.x=-Math.PI/2;}
// Distant layered mesas.
for(let i=0;i<13;i++){const x=-105+i*17,z=118+(i%3)*16,w=20+(i%4)*8,h=16+(i%5)*5;const g=new THREE.ConeGeometry(w,h,5);const m=mesh(g,mat(i%2?'#a56549':'#b97951'),scene,[x,h/2-2,z],false);m.rotation.y=(i%2)*.24;m.scale.z=.58;}
// Rider and horse, built from reusable low-poly shapes.
const mount=new THREE.Group();scene.add(mount);
const horse=new THREE.Group();mount.add(horse);
ball(horse,mats.horse,[0,1.25,0],[.57,.62,1.04]);ball(horse,mats.horseLight,[0,1.68,.78],[.34,.4,.47]);
const head=ball(horse,mats.horse,[0,1.93,1.12],[.3,.42,.34]);head.rotation.x=-.25;
for(const s of [-1,1]){const ear=mesh(new THREE.ConeGeometry(.12,.38,6),mats.horse,horse,[s*.19,2.28,1.05]);ear.rotation.z=s*-.22;ball(horse,mats.dark,[s*.26,1.99,1.34],[.045,.055,.04]);ball(horse,mats.white,[s*.27,2.01,1.37],[.017,.02,.012]);}
// mane, tail and reins
for(let i=0;i<5;i++){const tuft=mesh(new THREE.ConeGeometry(.15,.43,6),mats.mane,horse,[0,2.02-i*.14,.83-i*.17]);tuft.rotation.x=-.4;}
const tail=mesh(new THREE.ConeGeometry(.16,.88,7),mats.mane,horse,[0,1.38,-1.05]);tail.rotation.x=-.5;
box(horse,mats.leather,[0,1.78,.05],[.78,.13,.88]);
const legs=[];
for(const s of [-1,1])for(const z of [-.61,.64]){const pivot=new THREE.Group();pivot.position.set(s*.34,1.04,z);horse.add(pivot);cyl(pivot,mats.horse,[0,-.42,0],.115,.15,.78);ball(pivot,mats.dark,[0,-.81,.06],[.14,.11,.21]);legs.push({pivot,phase:(s+z)*1.6});}
const rider=new THREE.Group();horse.add(rider);rider.position.set(0,1.73,-.05);
const torso=ball(rider,mats.cloth,[0,.36,-.05],[.36,.47,.3]);torso.rotation.x=-.16;
ball(rider,mats.blue,[0,.27,-.1],[.39,.18,.32]);
const headR=ball(rider,mats.horseLight,[0,.94,.06],[.24,.29,.24]);
const hat=mesh(new THREE.CylinderGeometry(.31,.28,.15,9),mats.gold,rider,[0,1.18,.05]);ball(rider,mats.gold,[0,1.27,.05],[.2,.12,.19]);
// arms reaching toward reins
for(const s of [-1,1]){const arm=cyl(rider,mats.cloth,[s*.36,.48,.21],.105,.13,.56);arm.rotation.x=-1.05;arm.rotation.z=s*.48;}
const stand=new THREE.Group();horse.add(stand);stand.position.set(-1.1,1.3,-.05);stand.visible=false;
ball(stand,mats.tusk,[0,.58,0],[.34,.46,.25]);ball(stand,mats.gold,[0,1.13,0],[.25,.25,.24]);for(const s of [-1,1]){cyl(stand,mats.tusk,[s*.44,.62,.03],.1,.15,.68).rotation.z=s*.24;ball(stand,mats.gold,[s*.47,.28,.04],[.13,.14,.12]);cyl(stand,mats.tusk,[s*.16,.05,0],.14,.16,.34);}
// Spin's twin steel balls orbit the rider when selected.
const spinBalls=[];for(const s of [-1,1]){const b=ball(horse,mats.steel,[s*.83,1.6,.15],[.19,.19,.19]);b.visible=false;spinBalls.push(b);}
// Decorative repeating scenery.
const scenery=[];
function makeCactus(x,z){const g=new THREE.Group();scene.add(g);g.position.set(x,0,z);cyl(g,mats.cactus,[0,.92,0],.25,.3,1.85,8);for(const s of [-1,1]){cyl(g,mats.cactus2,[s*.38,.87,0],.13,.16,.69,7).rotation.z=s*.45;cyl(g,mats.cactus2,[s*.53,1.1,0],.12,.14,.57,7).rotation.z=s*-.1;}scenery.push({group:g,kind:'decor'});}
function makeRock(x,z){const o=mesh(new THREE.DodecahedronGeometry(.8,0),mats.rock2,scene,[x,.42,z]);o.scale.set(1.3,.62,.9);scenery.push({group:o,kind:'decor'});}
for(let i=0;i<20;i++){const z=12+i*9;makeCactus((i%2?1:-1)*(7+Math.random()*9),z);if(i%2===0)makeRock((i%4?1:-1)*(6+Math.random()*3),z+4);}
// Obstacles and relics use the same moving world-relative coordinates.
const obstacles=[],relics=[],effects=[];let nextObstacle=26;
function addObstacle(x,z,type){const g=new THREE.Group();scene.add(g);g.position.set(x,0,z);if(type==='cactus'){cyl(g,mats.cactus,[0,.8,0],.26,.3,1.6,7);for(const s of [-1,1]){cyl(g,mats.cactus2,[s*.36,.75,0],.12,.14,.6,7).rotation.z=s*.5;}}else{const o=mesh(new THREE.DodecahedronGeometry(.64,0),mats.rock2,g,[0,.46,0]);o.scale.set(1.25,.72,1);ball(g,mats.rock,[.2,.58,.13],[.17,.12,.18]);}obstacles.push({group:g,x,type,active:true});}
function addRelic(x,z,index){const g=new THREE.Group();scene.add(g);g.position.set(x,.85,z);const halo=mesh(new THREE.TorusGeometry(.48,.045,8,24),mats.gold,g,[0,0,0]);halo.rotation.x=Math.PI/2;ball(g,mats.bone,[0,0,0],[.25,.34,.2]);const mark=mesh(new THREE.OctahedronGeometry(.17),mats.gold,g,[0,.42,0]);mark.rotation.y=.4;relics.push({group:g,x,index,active:true,halo,mark});}
[72,172,286,414].forEach((z,i)=>addRelic([0,-2.5,2.5,0][i],z,i));
function randomLane(){return [-2.65,0,2.65][Math.floor(Math.random()*3)];}
// Ambient dust motes.
const dust=[];for(let i=0;i<48;i++){const d=mesh(new THREE.SphereGeometry(.035,5,4),new THREE.MeshBasicMaterial({color:'#fff1d2',transparent:true,opacity:.35}),scene,[ (Math.random()-.5)*16,Math.random()*4,Math.random()*50]);dust.push(d);}

const state={running:false,distance:0,speed:14,playerX:0,targetX:0,jumpY:0,jumpV:0,parts:0,act:1,style:'tusk',stamina:100,health:3,boost:false,attackCD:0,invuln:0,shake:0,toastTimer:0,spawned:0};
const keys={};const $=s=>document.querySelector(s);const toastEl=$('#toast');let audio=null,muted=false;
function sound(freq=440,duration=.1,wave='sine'){if(muted)return;try{audio??=new AudioContext();const osc=audio.createOscillator(),gain=audio.createGain();osc.type=wave;osc.frequency.value=freq;gain.gain.setValueAtTime(.055,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);osc.connect(gain);gain.connect(audio.destination);osc.start();osc.stop(audio.currentTime+duration);}catch{}}
function toast(text){toastEl.textContent=text;toastEl.classList.add('show');state.toastTimer=1.8;}
function updateHUD(){const d=Math.floor(state.distance);$('#distance').textContent=String(d).padStart(3,'0');$('#progress-fill').style.width=`${Math.min(100,d/5)}%`;document.querySelectorAll('#relics i').forEach((el,i)=>el.classList.toggle('found',i<state.parts));$('#style-name').textContent=state.style==='spin'?'SPIN · AÇO GIRATÓRIO':`TUSK · ATO ${state.act}`;$('#style-sub').textContent=state.style==='spin'?'DUAS BOLAS DE AÇO':['UNHA GIRATÓRIA','UNHA DE LONGO ALCANCE','RASGO DIMENSIONAL','ROTA INFINITA'][state.act-1];$('#style-icon').textContent=state.style==='spin'?'◉':'✧';$('#stamina-fill').style.width=`${state.stamina}%`;}
function setStyle(){state.style=state.style==='tusk'?'spin':'tusk';stand.visible=state.style==='tusk';spinBalls.forEach(b=>b.visible=state.style==='spin');toast(state.style==='spin'?'SPIN — DUAS BOLAS DE AÇO':'TUSK — ATO '+state.act);sound(state.style==='spin'?330:520,.12,'triangle');updateHUD();}
function startGame(){state.running=true;state.distance=0;state.speed=14;state.playerX=0;state.targetX=0;state.jumpY=0;state.jumpV=0;state.parts=0;state.act=1;state.style='tusk';state.stamina=100;state.health=3;state.invuln=0;state.attackCD=0;nextObstacle=24;obstacles.forEach(o=>scene.remove(o.group));obstacles.length=0;relics.forEach((r,i)=>{r.active=true;r.group.visible=true;r.group.position.set([0,-2.5,2.5,0][i],.85,[72,172,286,414][i]);});$('#start-screen').classList.add('hidden');$('#end-screen').classList.add('hidden');$('#hud').style.display='flex';$('#controls-hint').style.display='block';$('#center-message').classList.remove('show');stand.visible=true;spinBalls.forEach(b=>b.visible=false);addObstacle(randomLane(),24,'cactus');addObstacle(randomLane(),49,'rock');updateHUD();sound(500,.16,'triangle');}
function finish(win=false){state.running=false;$('#end-screen').classList.remove('hidden');$('#controls-hint').style.display='none';$('#final-distance').textContent=`${Math.floor(state.distance)} m`;$('#final-parts').textContent=`${state.parts} / 4`;$('#end-kicker').textContent=win?'LENDAS NASCEM NO HORIZONTE':'FIM DA JORNADA';$('#end-title').innerHTML=win?'A ROTA<br>INFINITA.':'A corrida<br>continua.';$('#end-copy').textContent=win?'Você atravessou a fronteira e dominou o poder do cadáver santo.':'O deserto guarda mais mistérios. Reúna as partes e tente novamente.';}
function jump(){if(!state.running||state.jumpY>0.01)return;state.jumpV=8.2;sound(230,.08,'triangle');}
function attack(){if(!state.running||state.attackCD>0)return;state.attackCD=state.style==='spin'?.75:.62;sound(state.style==='spin'?175:720,.12,state.style==='spin'?'sawtooth':'triangle');let target=null;for(const o of obstacles){if(o.active&&o.group.position.z>0&&o.group.position.z<31&&Math.abs(o.x-state.playerX)<4&&(!target||o.group.position.z<target.group.position.z))target=o;}if(target){target.active=false;const g=target.group;for(let i=0;i<7;i++){const p=mesh(new THREE.TetrahedronGeometry(.13),i%2?mats.gold:mats.steel,scene,[g.position.x,.7,g.position.z]);effects.push({object:p,life:.55,velocity:new THREE.Vector3((Math.random()-.5)*5,Math.random()*4,Math.random()*5)});}scene.remove(g);toast(state.style==='spin'?'STEEL BALL!':'TUSK NAIL!');}else toast(state.style==='spin'?'SPIN!':'NAIL SHOT!');}
function collision(){if(state.invuln>0)return;state.health--;state.invuln=1.4;state.shake=.45;state.stamina=Math.max(0,state.stamina-18);$('#damage-flash').classList.add('hit');setTimeout(()=>$('#damage-flash').classList.remove('hit'),140);sound(90,.2,'sawtooth');toast(`IMPACTO · ${state.health} ${state.health===1?'VIDA':'VIDAS'}`);if(state.health<=0)finish(false);}
function collect(r){r.active=false;r.group.visible=false;state.parts++;state.act=state.parts>=4?4:state.parts+1;state.stamina=Math.min(100,state.stamina+22);state.health=Math.min(3,state.health+1);sound(740,.19,'sine');toast(`PARTE SAGRADA ${state.parts}/4 · TUSK ATO ${state.act}`);if(state.parts===4){$('#center-message').innerHTML='TUSK · ATO IV<br><small style="font:600 12px DM Sans;letter-spacing:3px">ROTA INFINITA DESPERTA</small>';$('#center-message').classList.add('show');setTimeout(()=>$('#center-message').classList.remove('show'),2100);}updateHUD();}

// Keyboard and touch controls.
addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space'].includes(e.code))e.preventDefault();keys[e.code]=true;if(e.repeat)return;if(e.code==='Space'||e.code==='ArrowUp'||e.code==='KeyW')jump();if(e.code==='KeyQ')setStyle();if(e.code==='KeyE'||e.code==='Enter')attack();});addEventListener('keyup',e=>keys[e.code]=false);
document.querySelectorAll('[data-control]').forEach(btn=>{const action=btn.dataset.control;const down=e=>{e.preventDefault();if(action==='left')keys.ArrowLeft=true;if(action==='right')keys.ArrowRight=true;if(action==='jump')jump();if(action==='attack')attack();if(action==='style')setStyle();};const up=e=>{e.preventDefault();if(action==='left')keys.ArrowLeft=false;if(action==='right')keys.ArrowRight=false;};btn.addEventListener('pointerdown',down);btn.addEventListener('pointerup',up);btn.addEventListener('pointerleave',up);btn.addEventListener('pointercancel',up);});
$('#start-button').addEventListener('click',startGame);$('#restart-button').addEventListener('click',startGame);$('#switch-style').addEventListener('click',setStyle);$('#sound-toggle').addEventListener('click',()=>{muted=!muted;$('#sound-toggle').innerHTML=muted?'×<span>SOM</span>':'♫<span>SOM</span>';if(!muted)sound(520,.1);});
let prev=performance.now();
function frame(now){requestAnimationFrame(frame);const dt=Math.min(.04,(now-prev)/1000);prev=now;const t=now*.001;
  if(state.running){const left=keys.ArrowLeft||keys.KeyA,right=keys.ArrowRight||keys.KeyD;state.targetX=THREE.MathUtils.clamp(state.targetX+(right-left)*dt*7,-3.35,3.35);state.playerX=THREE.MathUtils.damp(state.playerX,state.targetX,10,dt);const wantsBoost=(keys.ShiftLeft||keys.ShiftRight)&&state.stamina>0;if(wantsBoost){state.stamina=Math.max(0,state.stamina-27*dt);state.speed=THREE.MathUtils.damp(state.speed,23,2,dt);}else{state.stamina=Math.min(100,state.stamina+12*dt);state.speed=THREE.MathUtils.damp(state.speed,14,2.1,dt);}state.boost=wantsBoost;state.distance+=state.speed*dt;state.jumpV-=19*dt;state.jumpY+=state.jumpV*dt;if(state.jumpY<0){state.jumpY=0;state.jumpV=0;}state.invuln=Math.max(0,state.invuln-dt);state.attackCD=Math.max(0,state.attackCD-dt);state.toastTimer-=dt;if(state.toastTimer<=0)toastEl.classList.remove('show');
    mount.position.x=state.playerX;mount.position.y=state.jumpY;mount.position.z=0;mount.rotation.z=THREE.MathUtils.damp(mount.rotation.z,-(state.targetX-state.playerX)*.12,8,dt);horse.rotation.x=Math.sin(t*13)*.018;legs.forEach(l=>{l.pivot.rotation.x=Math.sin(t*13+l.phase)*.52;});rider.rotation.x=Math.sin(t*13+.4)*.025;
    stand.position.x=-1.1+Math.sin(t*4)*.12;stand.position.y=1.3+Math.sin(t*6)*.1;stand.rotation.y=Math.sin(t*2)*.15;spinBalls.forEach((b,i)=>{b.position.set(Math.sin(t*5+i*Math.PI)*.82,1.55+Math.sin(t*8+i)*.18,.12+Math.cos(t*5+i*Math.PI)*.48);b.rotation.x=t*8;b.rotation.z=t*6;});
    for(const o of obstacles){if(!o.active)continue;o.group.position.z-=state.speed*dt;if(o.group.position.z<1.3&&o.group.position.z>-.7&&Math.abs(o.x-state.playerX)<1.02&&state.jumpY<.82)collision();if(o.group.position.z< -13){o.active=false;scene.remove(o.group);}}
    for(const r of relics){if(!r.active)continue;r.group.position.z-=state.speed*dt;r.group.rotation.y+=dt*1.6;r.halo.rotation.z+=dt*.5;r.mark.rotation.y+=dt*2;if(r.group.position.z<1.5&&r.group.position.z>-.5&&Math.abs(r.x-state.playerX)<1.2)collect(r);}
    for(const s of scenery){s.group.position.z-=state.speed*dt;if(s.group.position.z< -14){s.group.position.z+=180;s.group.position.x=(Math.random()<.5?-1:1)*(7+Math.random()*11);}}
    if(state.distance>=nextObstacle){const lane=randomLane();addObstacle(lane,165,Math.random()<.55?'cactus':'rock');if(Math.random()<.45)addObstacle(randomLane(),188,'rock');nextObstacle+=24+Math.random()*13;}
    for(const d of dust){d.position.z-=state.speed*dt*.55;if(d.position.z< -9)d.position.z=40+Math.random()*35;d.position.x+=Math.sin(t+d.position.z)*dt*.12;}
    for(let i=effects.length-1;i>=0;i--){const e=effects[i];e.life-=dt;e.object.position.addScaledVector(e.velocity,dt);e.velocity.y-=8*dt;e.object.rotation.x+=dt*6;if(e.life<=0){scene.remove(e.object);effects.splice(i,1);}}
    if(state.shake>0)state.shake=Math.max(0,state.shake-dt);camera.position.x=THREE.MathUtils.damp(camera.position.x,state.playerX*.28+(Math.random()-.5)*state.shake,5,dt);camera.position.y=5.3+Math.sin(t*26)*.035+(state.boost?.14:0);camera.lookAt(state.playerX*.2,1.15+state.jumpY*.18,7);if(state.distance>=500)finish(true);updateHUD();
  }else{horse.rotation.x=Math.sin(t*2)*.012;legs.forEach((l,i)=>l.pivot.rotation.x=Math.sin(t*2+i)*.06);mount.position.y=Math.sin(t*1.8)*.025;stand.rotation.y=Math.sin(t)*.12;for(const r of relics){r.group.rotation.y+=dt*.6;}camera.position.x=THREE.MathUtils.damp(camera.position.x,0,2,dt);camera.lookAt(0,1.15,7);}
  renderer.render(scene,camera);
}
requestAnimationFrame(frame);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));});
