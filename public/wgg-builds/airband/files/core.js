(function (root) {
  'use strict';
  const StageData = typeof module !== 'undefined' && module.exports ? require('./stage-data.js') : root.AirbandStageData;
  const { Tutorial } = typeof module !== 'undefined' && module.exports ? require('./tutorial.js') : root.AirbandTutorial;
  const DEFAULT_CONFIG = Object.freeze({
    worldWidth: 2280, worldHeight: 700, groundY: 530,
    playerSpeed: 270, jumpSpeed: 510, gravity: 1320,
    bandRadius: 30, maxCharge: 3, blastRadius: 170,
    blastForce: 430, extraBlastForce: 650,
    projectileSpeed: 660, projectileLife: 5,
    earthRadius: 44, earthLife: 60, earthHP: 70, earthLandingMargin: 8,
    monsterHP: 160, projectileDamage: 34, laserDamage: 46,
    monsterProjectileSpeed: 240, monsterAttackInterval: 2, monsterAttackRange: 900, monsterProjectileLife: 8,
    blastCooldown: 0.5, shootCooldown: 0.3,
    directionDistance: 12, decelerationRatio: 0.72, idleDirectionDelay: 0.055
  });
  const CONFIG = { ...DEFAULT_CONFIG };
  const ELEMENTS = Object.freeze({
    air: { name: '에어', en: 'AIR', color: '#4bada4', pale: '#dff4ee' },
    fire: { name: '불', en: 'FIRE', color: '#ed825d', pale: '#fff0e6' },
    water: { name: '물', en: 'WATER', color: '#509fda', pale: '#e6f3fe' },
    earth: { name: '흙', en: 'EARTH', color: '#ac8367', pale: '#f4eadf' },
    light: { name: '빛', en: 'LIGHT', color: '#d6af42', pale: '#fff8d8' }
  });
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const inside = (x, y, r) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
  const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  function sourceContains(x, y, source) {
    if (source.shape === 'circle') return Math.hypot(x - source.x - source.w / 2, y - source.y - source.h / 2) <= source.w / 2;
    return inside(x, y, source);
  }
  function segmentSource(x1, y1, x2, y2, source) {
    if (source.shape !== 'circle') return segmentRect(x1, y1, x2, y2, source);
    const dx = x2 - x1, dy = y2 - y1, ox = x1 - source.x - source.w / 2, oy = y1 - source.y - source.h / 2;
    const a = dx * dx + dy * dy, b = 2 * (ox * dx + oy * dy), c = ox * ox + oy * oy - source.w * source.w / 4;
    if (a < 1e-10) return c <= 0 ? { enter: 0, exit: 1 } : null;
    const discriminant = b * b - 4 * a * c;
    if (discriminant <= 0) return null;
    const lo = Math.max(0, (-b - Math.sqrt(discriminant)) / (2 * a));
    const hi = Math.min(1, (-b + Math.sqrt(discriminant)) / (2 * a));
    return lo <= hi ? { enter: lo, exit: hi } : null;
  }
  const STAGES = Object.freeze({
    test: { name: '테스트 스테이지', title: '평야 테스트 필드', label: 'TEST FIELD', subtitle: '네 가지 속성과 조작을 자유롭게 시험해 보세요.', goalText: '자유 실험 · 종료 조건 없음' },
    basic: { name: '튜토리얼 스테이지', title: '튜토리얼 스테이지', label: 'TUTORIAL', subtitle: '우클릭을 꾹! 공기 방울에 힘을 담고 자유롭게 연습해요.', goalText: '추천 안내 7개 · 자유 연습 · 출구에서 선택' },
    boss: { name: '보스 스테이지', title: '깊은 숲의 기척', label: 'COMING SOON', available: false }
  });
  function makeStage(id) {
    const source = (element, x, y, size = 64, label = false) => ({ id: element + '-' + x + '-' + y, x, y, w: size, h: size, element, shape: element === 'light' ? 'circle' : 'rect', solid: element === 'earth', wall: false, label });
    if (id !== 'basic') return {
      width: CONFIG.worldWidth, height: CONFIG.worldHeight,
      sources: ['fire', 'water', 'earth', 'light'].map((element, i) => source(element, 360 + i * 240, 350, 82, true)),
      monsterX: 1730, goal: null, signs: []
    };
    const floor = CONFIG.groundY;
    const sources = [source('fire', 1180, floor - 128, 96, true),source('fire',2432,floor-128,80,true),
      source('water',2656,floor-128,80,true),source('earth',2880,floor-64,64,true),source('light',3104,floor-128,80,true)];
    return { width: 4200, height: CONFIG.worldHeight, sources,
      monsters:[{x:1550,y:floor-61,trainingDummy:true},{x:3440,y:floor-61,trainingDummy:true}],
      goal: { x: 3970, y: floor - 150, w: 70, h: 150 },
      signs: [
        { x: 360, title: '01 · 공기 방울 연습', text: '우클릭은 꾹! 좌클릭은 눌렀다 떼기' },
        { x: 1070, title: '02 · 그릇처럼 담고, 떠내요', text: '불 안으로 → 밖으로. SHIFT로 허수아비를 맞혀 보세요.' },
        { x: 2432, title: '03 · 네 가지 힘, 자유롭게', text: '원하는 속성을 담으면 두 능력을 알려드려요.' }
      ]
    };
  }
  function segmentRect(x1, y1, x2, y2, r) {
    let lo = 0, hi = 1;
    for (const [p, d, min, max] of [[x1, x2 - x1, r.x, r.x + r.w], [y1, y2 - y1, r.y, r.y + r.h]]) {
      if (Math.abs(d) < 0.000001) { if (p < min || p > max) return null; }
      else {
        const a = (min - p) / d, b = (max - p) / d;
        lo = Math.max(lo, Math.min(a, b)); hi = Math.min(hi, Math.max(a, b));
        if (lo > hi) return null;
      }
    }
    return { enter: lo, exit: hi };
  }
  function customLayout(stage) {
    const sources=[],blocks=[],monsters=[];let spawn,goal;
    stage.objects.forEach((o,i)=>{
      if(['earth','fire','water','light'].includes(o.type))sources.push({id:'placed-'+i,x:o.x,y:o.y,w:64,h:64,element:o.type,shape:o.type==='light'?'circle':'rect',solid:o.type==='earth',wall:false,label:o.type!=='earth'});
      if(o.type==='wall')blocks.push({x:o.x,y:o.y,w:64,h:64,solid:true,wall:true,element:null});
      if(o.type==='spike')blocks.push({kind:'spike',x:o.x,y:o.y,w:64,h:64,solid:true,wall:true,element:null});
      if(o.type==='monster')monsters.push({x:o.x+4,y:o.y+3,attackElement:o.attackElement,projectileSpeed:o.projectileSpeed});
      if(o.type==='spawn')spawn={x:o.x+17,y:o.y+16};
      if(o.type==='goal')goal={x:o.x,y:o.y-64,w:64,h:128};
    });
    return {width:stage.width,height:StageData.BOTTOM-StageData.TOP,top:StageData.TOP,bottom:StageData.BOTTOM,hasGround:false,sources,blocks,monsters,spawn,goal,signs:[]};
  }
  class Game {
    constructor(stageId = 'test') { this.stageId = stageId === 'basic' ? 'basic' : 'test'; this.reset(); }
    loadStage(stageId) {
      if (!STAGES[stageId] || STAGES[stageId].available === false) return false;
      this.customStage = null; this.stageId = stageId; this.reset(); return true;
    }
    loadCustomStage(value) {
      const stage=StageData.normalize(value);if(StageData.validate(stage))return false;
      this.customStage=stage;this.stageId=stage.id||'custom-preview';this.reset();return true;
    }
    reset() {
      this.stage = this.customStage ? {name:'내 스테이지',title:this.customStage.name,label:'YOUR WORLD',subtitle:'직접 배치한 블록과 몬스터가 있는 나만의 길.',goalText:'배치한 도착 지점까지'} : STAGES[this.stageId];
      this.layout = this.customStage ? customLayout(this.customStage) : makeStage(this.stageId);
      this.worldWidth = this.layout.width; this.worldHeight = this.layout.height;
      this.worldTop=this.layout.top??0;this.worldBottom=this.layout.bottom??this.layout.height;
      this.completed = false;this.dead=false;this.hurtUntil=0;
      this.tutorial = !this.customStage && this.stageId === 'basic' ? new Tutorial() : null;
      this.time = 0; this.paused = false; this.serial = 1; this.teleportSerial = 0;
      this.player = { x: 170, y: CONFIG.groundY - 48, w: 30, h: 48, vx: 0, vy: 0, grounded: true, face: 1, hp:4, maxHP:4 };
      if(this.layout.spawn)Object.assign(this.player,this.layout.spawn,{grounded:false});
      this.ground = { id: 'floor', x: 0, y: CONFIG.groundY, w: this.worldWidth, h: this.worldHeight - CONFIG.groundY, solid: true, wall: true, element: null };
      this.sources = this.layout.sources;
      this.band = { active: false, x: 0, y: 0, element: 'air', direction: 1, charging: false, charge: 0, touched: new Set() };
      this.direction = { lastX: 0, lastY: 0, lastT: 0, speed: 0, travel: 0, sign: 1, lastMove: 0 };
      this.earths = []; this.projectiles = []; this.enemyProjectiles = []; this.effects = []; this.pendingBlasts = [];
      this.monsters = (this.layout.monsters || [{x:this.layout.monsterX,y:CONFIG.groundY-61}]).map(m=>({...m,attackElement:StageData.ATTACK_ELEMENTS.includes(m.attackElement)?m.attackElement:'alternate',w:56,h:61,hp:CONFIG.monsterHP,maxHP:CONFIG.monsterHP,flash:0,attackTimer:0,shotCount:0,shotFlash:0,face:1}));
      this.emptyMonster={hp:0,maxHP:CONFIG.monsterHP};
      this.stats = { collected: new Set(), shots: 0, blasts: 0 };
      this.events = []; this.note = this.tutorial ? '첫 연습: A · D로 걸어보고 SPACE로 점프하세요.' : '우클릭을 누른 채 속성 오브젝트 안에 들어갔다가 나와 보세요.';
      this.rightHeld = false; this.lastExplosionTime = -Infinity; this.shootRequested = false;
      this.lastUse = { blast: -Infinity, shoot: -Infinity };
    }
    tell(message) { this.note = message; this.events.push({ time: this.time, message }); if (this.events.length > 8) this.events.shift(); }
    cooldownRemaining(action) {
      const duration = CONFIG[action === 'blast' ? 'blastCooldown' : 'shootCooldown'];
      return Math.max(0, duration - (this.time - this.lastUse[action]) - 1e-9);
    }
    coolingDown(action) {
      const remaining = this.cooldownRemaining(action);
      if (remaining <= 0) return false;
      this.tell((action === 'blast' ? '폭발' : '분출') + ' 준비 중 · ' + (Math.ceil(remaining * 10) / 10).toFixed(1) + '초 남았어요.');
      return true;
    }
    get monster() { return this.monsters[0] || this.emptyMonster; }
    respawnMonsters() { for(const m of this.monsters){m.hp=m.maxHP=CONFIG.monsterHP;m.attackTimer=0;m.shotCount=0;m.shotFlash=0;m.recoverTime=0;}this.enemyProjectiles=[]; }
    resumeTutorial(){
      if(!this.tutorial||!this.completed)return false;
      this.completed=false;this.tutorial.exitDismissed=true;this.pause(false);return true;
    }
    walls() { return [...(this.layout.hasGround===false?[]:[this.ground]),...(this.layout.blocks||[])]; }
    defeat(message){this.dead=true;this.player.hp=0;this.pause(true);this.tell(message);}
    damagePlayer(message='가시에 닿았어요.'){
      if(this.dead||this.time<this.hurtUntil)return false;
      this.player.hp=Math.max(0,this.player.hp-1);this.hurtUntil=this.time+1;
      if(this.player.hp===0)this.defeat('체력이 모두 줄었어요. 다시 시작하거나 맵을 수정할 수 있어요.');
      else this.tell(message+' 체력 '+this.player.hp+' / 4');
      return true;
    }
    attackWalls() { return [...this.walls(), ...this.sources.filter(s => s.solid)]; }
    solidRects() {
      return [...this.walls(), ...this.sources.filter(s => s.solid), ...this.earths.filter(e => e.hp > 0).map(e => ({ x: e.x - e.r, y: e.y - e.r, w: e.r * 2, h: e.r * 2, earth:e }))];
    }
    playerSolids(){return this.solidRects().filter(s=>!s.earth?.playerPassThrough);}
    supportFromNewEarth(earth){
      const p=this.player,box={x:earth.x-earth.r,y:earth.y-earth.r,w:earth.r*2,h:earth.r*2},margin=CONFIG.earthLandingMargin;
      const feet=p.y+p.h,destinationY=box.y-p.h;
      // Resolve a platform born beneath the body upward, without applying a blast force.
      if(earth.y>=p.y+p.h/2&&feet>=box.y&&p.y<box.y+box.h&&p.x<box.x+box.w+margin&&p.x+p.w>box.x-margin&&destinationY>=this.worldTop){
        const sweptBody={x:p.x,y:destinationY,w:p.w,h:feet-destinationY};
        const blocked=this.playerSolids().some(s=>s.earth!==earth&&overlap(sweptBody,s));
        if(!blocked){p.y=destinationY;p.grounded=p.vy>=0;if(p.grounded)p.vy=0;return true;}
      }
      // A blocked lift or an overhead spawn must never trap the existing player.
      // Only this player's collision is deferred until their body leaves the new earth.
      if(overlap(p,box))earth.playerPassThrough=true;
      return false;
    }
    canPlace(x, y) {
      const r = CONFIG.bandRadius;
      return x >= r && x <= this.worldWidth - r && y >= this.worldTop+r && y <= this.worldBottom-r;
    }
    elementSources() { return [...this.sources,...this.enemyProjectiles.filter(s=>s.life>0)]; }
    collectElement(source) {
      const b=this.band;
      if(!b.active||b.element!=='air')return false;
      b.element=source.element;this.stats.collected.add(b.element);b.touched.clear();
      this.tell((source.owner==='monster'?'몬스터 발사체에서 ':'')+ELEMENTS[b.element].name+' 속성 획득! 우클릭을 떼어도 저장됩니다.');
      this.effects.push({kind:'collect',x:b.x,y:b.y,color:ELEMENTS[b.element].color,age:0,life:.6});
      this.tutorial?.event('collect',{element:b.element},this);return true;
    }
    activate(x, y) {
      if (this.paused || this.band.active) return false;
      this.rightHeld = true;
      if (!this.canPlace(x, y)) { this.tell('맵 안에서 에어밴드를 만들어 주세요. 벽·바닥·가시를 포함한 모든 물체는 통과할 수 있어요.'); return false; }
      Object.assign(this.band, { active: true, x, y, createdAt: this.time, charging: false, charge: 0, touched: new Set() });
      this.tutorial?.event('create',{},this);
      for (const source of this.elementSources()) if (sourceContains(x, y, source)) this.band.touched.add(source.id);
      this.direction = { lastX: x, lastY: y, lastT: this.time, speed: 0, travel: 0, sign: this.band.direction, lastMove: this.time };
      return true;
    }
    releaseBand() {
      this.rightHeld = false;
      if (this.band.active && this.band.charging) this.explode();
      this.band.active = false; this.band.charging = false; this.band.charge = 0; this.band.touched.clear();
    }
    moveBand(x, y) {
      if (!this.band.active || this.paused) return;
      const tx = clamp(x, CONFIG.bandRadius, this.worldWidth - CONFIG.bandRadius);
      const ty = clamp(y, this.worldTop+CONFIG.bandRadius, this.worldBottom-CONFIG.bandRadius);
      this.moveBandSegment(tx, ty);
    }
    moveBandSegment(tx, ty) {
      const b = this.band, oldX = b.x, oldY = b.y;
      b.x = tx; b.y = ty;
      if (b.element !== 'air') return;
      const candidates = [];
      for (const s of this.elementSources()) {
        const hit = segmentSource(oldX, oldY, b.x, b.y, s);
        if (hit) b.touched.add(s.id);
        if (b.touched.has(s.id) && !sourceContains(b.x, b.y, s)) {
          if (hit) candidates.push({ s, exit: hit.exit });
          b.touched.delete(s.id);
        }
      }
      // Earliest exit wins; exact ties use the stable source order in this test stage.
      candidates.sort((a, c) => a.exit - c.exit);
      if (candidates.length) this.collectElement(candidates[0].s);
      this.tutorial?.event('drag', { distance: Math.hypot(b.x - oldX, b.y - oldY) }, this);
    }
    trackPointer(x, y) {
      if (!this.band.active || this.paused) return;
      const d = this.direction, dx = x - d.lastX, dy = y - d.lastY;
      const dt = Math.max(this.time - d.lastT, 1 / 240), speed = Math.hypot(dx, dy) / dt;
      if (Math.abs(dx) > 0.2) {
        const sign = Math.sign(dx);
        if (sign !== d.sign) d.travel = 0;
        d.sign = sign; d.travel += Math.abs(dx);
        if (speed < d.speed * CONFIG.decelerationRatio && d.travel >= CONFIG.directionDistance) this.band.direction = d.sign;
        d.lastMove = this.time;
      }
      Object.assign(d, { lastX: x, lastY: y, lastT: this.time, speed });
    }
    startCharge() {
      if (!this.band.active || this.band.charging || this.paused) return false;
      if (this.coolingDown('blast')) return false;
      this.band.charging = true; this.band.charge = 0; return true;
    }
    endCharge() { if (this.band.charging && this.band.active && !this.paused) return this.explode(); return false; }
    requestShoot() {
      if (this.band.active && !this.band.charging && !this.paused && !this.coolingDown('shoot')) this.shootRequested = true;
    }
    consume() {
      this.band.element = 'air'; this.band.touched.clear();
      for (const s of this.elementSources()) if (sourceContains(this.band.x, this.band.y, s)) this.band.touched.add(s.id);
    }
    shoot() {
      const b = this.band;
      if (!b.active || b.charging || this.paused || this.time === this.lastExplosionTime) return false;
      if (this.coolingDown('shoot')) return false;
      const element = b.element, dir = b.direction;
      this.stats.shots++; this.lastUse.shoot = this.time;
      this.tutorial?.event('shoot',{element},this);
      if (element === 'fire' || element === 'water') {
        this.projectiles.push({ x: b.x, y: b.y, vx: dir * CONFIG.projectileSpeed, element, life: CONFIG.projectileLife });
        this.tell(ELEMENTS[element].name + ' 분출 · 에어 상태로 돌아왔어요.');
      } else if (element === 'light') {
        let endX = dir > 0 ? this.worldWidth : 0;
        for (const w of this.attackWalls()) {
          const hit = segmentRect(b.x, b.y, endX, b.y, w);
          if (hit) endX = b.x + (endX - b.x) * hit.enter;
        }
        for(const m of this.monsters)if (m.hp > 0 && segmentRect(b.x, b.y, endX, b.y, m)) this.damageMonster(CONFIG.laserDamage,m,{method:'shoot',element});
        for (const e of this.earths) if (Math.abs(e.y - b.y) <= e.r && (e.x - b.x) * dir >= 0 && (endX - e.x) * dir >= 0) e.hp -= CONFIG.laserDamage;
        this.effects.push({ kind: 'laser', x: b.x, y: b.y, endX, color: ELEMENTS.light.color, age: 0, life: 0.32 });
        this.tell('빛 분출 · 적을 관통하고 벽에서 멈춥니다.');
      } else this.tell(ELEMENTS[element].name + '는 분출 효과가 없어요. 속성은 소모됩니다.');
      this.consume(); return true;
    }
    damageMonster(amount,monster=this.monster,attack={}) {
      monster.hp = Math.max(0, monster.hp - amount); monster.flash = 0.18;
      if(monster.trainingDummy){
        this.tutorial?.event('hit',attack,this);
        if(!monster.hp){monster.recoverTime=2;this.tell('허수아비 명중! 잠시 후 다시 일어나요.');}
      }else if (!monster.hp) this.tell('몬스터 처치! 오른쪽 위에서 다시 배치할 수 있어요.');
    }
    knockback(blast) {
      const p = this.player, dx = Math.round(p.x + p.w / 2) - Math.round(blast.x), dy = Math.round(p.y + p.h / 2) - Math.round(blast.y);
      const distance = Math.hypot(dx, dy);
      if (distance < 1) return false;
      if (distance <= blast.radius) {
        const force = blast.force * (0.4 + 0.6 * (1 - distance / blast.radius));
        p.vx += dx / distance * force; p.vy += dy / distance * force; p.grounded = false;
        this.tutorial?.event('knockback', { element: blast.element, force, dx: dx / distance, dy: dy / distance }, this);
      }
      return true;
    }
    teleportDestination(x, y) {
      const p = this.player, destination = { x: x - p.w / 2, y: y - p.h / 2, w: p.w, h: p.h };
      const rightLimit = this.worldWidth;
      if (destination.x < 0 || destination.x + p.w > rightLimit || destination.y < this.worldTop || destination.y + p.h > this.worldBottom) return null;
      const solids = this.solidRects();
      if (solids.some(s => overlap(destination, s))) return null;
      return { x: destination.x, y: destination.y, grounded: solids.some(s => Math.abs(destination.y + p.h - s.y) < .01 && destination.x < s.x + s.w && destination.x + p.w > s.x) };
    }
    teleport(destination) {
      const p = this.player, fromX = p.x + p.w / 2, fromY = p.y + p.h / 2;
      Object.assign(p, destination, { vx: 0, vy: 0 });
      const x = p.x + p.w / 2, y = p.y + p.h / 2;
      this.teleportSerial++;
      this.effects.push({ kind: 'teleport', x, y, fromX, fromY, age: 0, life: .45, color: ELEMENTS.light.color });
      this.tutorial?.event('teleport', { distance: Math.hypot(x - fromX, y - fromY) }, this);
    }
    explode() {
      const b = this.band;
      if (!b.active || this.paused) return false;
      if (this.coolingDown('blast')) return false;
      const element = b.element, charge = clamp(b.charge / CONFIG.maxCharge, 0, 1);
      const destination = element === 'light' ? this.teleportDestination(b.x, b.y) : null;
      if (element === 'light' && !destination) {
        b.charging = false; b.charge = 0; this.shootRequested = false;
        this.tell('이곳은 몸이 들어갈 공간이 없어요. 밴드를 빈 공간으로 옮겨 주세요. 빛은 유지돼요.');
        return false;
      }
      const blast = { x: b.x, y: b.y, element, radius: CONFIG.blastRadius + 75 * charge, force: CONFIG.blastForce + CONFIG.extraBlastForce * charge };
      this.stats.blasts++; this.lastUse.blast = this.time; this.lastExplosionTime = this.time; this.shootRequested = false;
      b.charging = false; b.charge = 0;
      if (element === 'light') {
        this.tell('빛 폭발 · 폭발한 위치로 순간이동했어요.');
        this.teleport(destination);
      } else if (element === 'earth') {
        const earth={ id: this.serial++, x: b.x, y: b.y, r: CONFIG.earthRadius, hp: CONFIG.earthHP, life: CONFIG.earthLife, element: null, wall: false };
        this.earths.push(earth);this.supportFromNewEarth(earth);
        this.tell('흙 생성 · ' + CONFIG.earthLife + '초 유지 / 에어 폭발로 제거할 수 있어요.');
      } else {
        if (!this.knockback(blast)) this.pendingBlasts.push(blast);
        for (const e of this.earths) if (Math.hypot(e.x - b.x, e.y - b.y) < blast.radius + e.r) {
          if (element === 'air') e.hp = 0; else e.hp -= 30 + 70 * charge;
        }
        if(element!=='air')for(const m of this.monsters)if (m.hp > 0 && Math.hypot(m.x + m.w / 2 - b.x, m.y + m.h / 2 - b.y) < blast.radius) this.damageMonster(25 + 75 * charge,m,{method:'blast',element});
        this.tell(ELEMENTS[element].name + ' 폭발 · 충전 ' + (charge * CONFIG.maxCharge).toFixed(1) + '초');
      }
      if (element !== 'light') this.effects.push({ kind: 'blast', ...blast, color: ELEMENTS[element].color, age: 0, life: 0.55 });
      this.consume(); this.tutorial?.event('blast', { element, chargeFraction:charge }, this); return true;
    }
    updateMonsterAttacks(dt) {
      const p=this.player,px=p.x+p.w/2,py=p.y+p.h/2,solids=this.solidRects();
      for(const m of this.monsters){
        if(m.trainingDummy){
          if(m.hp<=0){m.recoverTime=Math.max(0,(m.recoverTime||0)-dt);if(m.recoverTime===0){m.hp=m.maxHP;m.flash=.3;}}
          continue;
        }
        m.shotFlash=Math.max(0,m.shotFlash-dt);
        const x=m.x+m.w/2,y=m.y+m.h/2,dx=px-x,dy=py-y,distance=Math.hypot(dx,dy);
        if(m.hp<=0||distance>CONFIG.monsterAttackRange||distance<1||solids.some(w=>segmentRect(x,y,px,py,w))){m.attackTimer=0;continue;}
        m.face=dx<0?-1:1;m.aimX=dx/distance;m.aimY=dy/distance;m.attackTimer+=dt;
        if(m.attackTimer+1e-9<CONFIG.monsterAttackInterval)continue;
        m.attackTimer=0;
        const element=m.attackElement==='alternate'?(m.shotCount%2?'water':'fire'):m.attackElement;
        const speed=StageData.validMonsterSpeed(m.projectileSpeed)?m.projectileSpeed:CONFIG.monsterProjectileSpeed;
        const radius=14;m.shotCount++;m.shotFlash=.25;
        this.enemyProjectiles.push({id:'enemy-shot-'+this.serial++,owner:'monster',x:x+m.aimX*38-radius,y:y+m.aimY*38-radius,w:radius*2,h:radius*2,shape:'circle',solid:false,wall:false,element,vx:m.aimX*speed,vy:m.aimY*speed,life:CONFIG.monsterProjectileLife});
      }
    }
    updateEnemyProjectiles(dt) {
      const solids=this.solidRects();
      for(const shot of this.enemyProjectiles){
        if(shot.life<=0)continue;
        const oldX=shot.x,oldY=shot.y,r=shot.w/2,cx=oldX+r,cy=oldY+r;
        const dx=shot.vx*dt,dy=shot.vy*dt,hits=[];
        for(const w of solids){const hit=segmentRect(cx,cy,cx+dx,cy+dy,{x:w.x-r,y:w.y-r,w:w.w+2*r,h:w.h+2*r});if(hit)hits.push({t:hit.enter,player:false});}
        const p=this.player,hitPlayer=segmentRect(cx,cy,cx+dx,cy+dy,{x:p.x-r,y:p.y-r,w:p.w+2*r,h:p.h+2*r});
        if(hitPlayer)hits.push({t:hitPlayer.enter,player:true});
        hits.sort((a,b)=>a.t-b.t);const hit=hits[0],travel=hit?hit.t:1;
        shot.x+=dx*travel;shot.y+=dy*travel;shot.life-=dt;
        const b=this.band;
        if(b.active&&b.element==='air'){
          const crossing=segmentSource(b.x,b.y,b.x-(shot.x-oldX),b.y-(shot.y-oldY),{...shot,x:oldX,y:oldY});
          if(crossing)b.touched.add(shot.id);
          if(crossing&&b.touched.has(shot.id)&&!sourceContains(b.x,b.y,shot))this.collectElement(shot);
        }
        if(hit){
          shot.life=0;
          if(hit.player)this.damagePlayer(ELEMENTS[shot.element].name+' 발사체에 맞았어요.');
          this.effects.push({kind:'collect',x:shot.x+r,y:shot.y+r,color:ELEMENTS[shot.element].color,age:0,life:.2});
        }
        if(this.dead)break;
      }
      this.enemyProjectiles=this.enemyProjectiles.filter(s=>s.life>0&&s.x+s.w>=0&&s.x<=this.worldWidth&&s.y+s.h>=this.worldTop&&s.y<=this.worldBottom);
      const liveIds=new Set(this.elementSources().map(s=>s.id));for(const id of this.band.touched)if(!liveIds.has(id))this.band.touched.delete(id);
    }
    pause(value) {
      this.paused = value;
      if (value) { this.band.charging = false; this.band.charge = 0; this.band.active = false; this.band.touched.clear(); this.rightHeld = false; this.shootRequested = false; }
    }
    update(dt, input = {}) {
      if (this.paused || this.completed || this.dead) return;
      this.time += dt;
      if (this.band.charging) this.band.charge = Math.min(CONFIG.maxCharge, this.band.charge + dt);
      const d = this.direction;
      if (this.band.active && this.time - d.lastMove > CONFIG.idleDirectionDelay && d.travel >= CONFIG.directionDistance) { this.band.direction = d.sign; d.travel = 0; d.speed = 0; }
      if (this.shootRequested) { this.shootRequested = false; this.shoot(); }
      const p = this.player, axis = Number(!!input.right) - Number(!!input.left), oldPlayerX = p.x;
      if (axis) { p.vx += (axis * CONFIG.playerSpeed - p.vx) * Math.min(1, dt * (p.grounded ? 16 : 3)); p.face = axis; }
      else p.vx *= Math.exp(-dt * (p.grounded ? 10 : 1.8));
      const jumped = !!input.jump && p.grounded;
      if (jumped) { p.vy = -CONFIG.jumpSpeed; p.grounded = false; }
      p.vy += CONFIG.gravity * dt;
      for(const earth of this.earths)if(earth.playerPassThrough&&!overlap(p,{x:earth.x-earth.r,y:earth.y-earth.r,w:earth.r*2,h:earth.r*2}))earth.playerPassThrough=false;
      const solids = this.playerSolids();
      let nextX = p.x + p.vx * dt, hitX = false;
      for (const s of solids) {
        if (p.y >= s.y + s.h || p.y + p.h <= s.y) continue;
        if (p.vx > 0 && p.x + p.w <= s.x + 0.01 && nextX + p.w >= s.x) { nextX = Math.min(nextX, s.x - p.w); hitX = true; }
        if (p.vx < 0 && p.x >= s.x + s.w - 0.01 && nextX <= s.x + s.w) { nextX = Math.max(nextX, s.x + s.w); hitX = true; }
      }
      p.x = clamp(nextX, 0, this.worldWidth - p.w); if (hitX) p.vx = 0;
      let nextY = p.y + p.vy * dt, hitY = false; p.grounded = false;
      for (const s of solids) {
        const margin=s.earth?CONFIG.earthLandingMargin:0;
        const landingOverlap=p.x<s.x+s.w+margin&&p.x+p.w>s.x-margin;
        const bodyOverlap=p.x<s.x+s.w&&p.x+p.w>s.x;
        if (p.vy >= 0 && landingOverlap && p.y + p.h <= s.y + 0.01 && nextY + p.h >= s.y) { nextY = Math.min(nextY, s.y - p.h); hitY = true; p.grounded = true; }
        if (p.vy < 0 && bodyOverlap && p.y >= s.y + s.h - 0.01 && nextY <= s.y + s.h) { nextY = Math.max(nextY, s.y + s.h); hitY = true; }
      }
      p.y = nextY; if (hitY) p.vy = 0;
      for(const s of this.layout.blocks||[])if(s.kind==='spike'&&p.x<=s.x+s.w+.01&&p.x+p.w>=s.x-.01&&p.y<=s.y+s.h+.01&&p.y+p.h>=s.y-.01)this.damagePlayer();
      if(p.y>this.worldBottom+200)this.defeat('맵 밖으로 떨어졌어요. 발판을 배치하거나 다시 시작해 주세요.');
      if(this.dead)return;
      this.tutorial?.event('movement', { distance: axis ? Math.abs(p.x - oldPlayerX) : 0, jumped }, this);
      this.tutorial?.update(this);
      this.pendingBlasts = this.pendingBlasts.filter(blast => !this.knockback(blast));
      for (const shot of this.projectiles) {
        const oldX = shot.x, oldY = shot.y; shot.x += shot.vx * dt; shot.life -= dt;
        const hits = [];
        for (const w of this.attackWalls()) { const hit = segmentRect(oldX, oldY, shot.x, shot.y, w); if (hit) hits.push({ t: hit.enter, kind: 'wall' }); }
        for(const m of this.monsters)if (m.hp > 0) { const hit = segmentRect(oldX, oldY, shot.x, shot.y, m); if (hit) hits.push({ t: hit.enter, kind: 'monster',monster:m }); }
        for (const e of this.earths) { const hit = segmentRect(oldX, oldY, shot.x, shot.y, { x: e.x - e.r, y: e.y - e.r, w: e.r * 2, h: e.r * 2 }); if (hit) hits.push({ t: hit.enter, kind: 'earth', earth: e }); }
        hits.sort((a, b) => a.t - b.t);
        if (hits.length) {
          if (hits[0].kind === 'monster') this.damageMonster(CONFIG.projectileDamage,hits[0].monster,{method:'shoot',element:shot.element});
          if (hits[0].kind === 'earth') hits[0].earth.hp -= CONFIG.projectileDamage;
          shot.life = 0;
          this.effects.push({ kind: 'collect', x: shot.x, y: shot.y, color: ELEMENTS[shot.element].color, age: 0, life: 0.25 });
        }
      }
      this.projectiles = this.projectiles.filter(s => s.life > 0 && s.x >= 0 && s.x <= this.worldWidth);
      this.updateMonsterAttacks(dt);this.updateEnemyProjectiles(dt);if(this.dead)return;
      for (const e of this.earths) e.life -= dt;
      this.earths = this.earths.filter(e => e.life > 0 && e.hp > 0);
      for (const e of this.effects) e.age += dt;
      this.effects = this.effects.filter(e => e.age < e.life);
      for(const m of this.monsters)m.flash = Math.max(0, m.flash - dt);
      const atGoal=this.layout.goal&&overlap(this.player,this.layout.goal);
      if(this.tutorial&&!atGoal)this.tutorial.exitDismissed=false;
      if (atGoal && !this.tutorial?.exitDismissed) {
        this.completed = true; this.pause(true); this.tell(this.stage.title+' 완료! 도착 지점에 도착했어요.');
      }
    }
  }
  const api = { Game, CONFIG, DEFAULT_CONFIG, ELEMENTS, STAGES, segmentRect, sourceContains, segmentSource, inside, clamp };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Airband = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
