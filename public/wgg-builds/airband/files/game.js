(function () {
  'use strict';
  const { Game, CONFIG: C, ELEMENTS, STAGES, clamp } = window.Airband;
  const game = new Game();
  const P=window.AirbandPixel;
  const canvas = document.getElementById('game'), ctx = canvas.getContext('2d');
  const W = 1280, H = 660;
  const labelLayer=document.getElementById('game-labels'),labelPool=[];
  let labelCount=0,labelBoundsKey='';
  const ui = Object.fromEntries(['state-name', 'state-mode', 'state-icon', 'charge-time', 'charge-fill', 'direction', 'blast-cooldown', 'shoot-cooldown', 'toast', 'discovered', 'earth-count', 'pause-overlay', 'pause', 'respawn'].map(id => [id, document.getElementById(id)]));
  const symbols = { air: '◌', fire: '♨', water: '◈', earth: '▧', light: '✳' };
  const keys = new Set();
  let camera = 0, cameraY=0, previous = performance.now(), accumulator = 0, jumpQueued = false, pointer = null;
  let screen = 'menu';
  let tutorialViewKey = '';
  let lastTeleportSerial = 0;
  let teleportCamera = null;
  let cameraLookAhead = 0;
  let tutorialAdvance = null;
  const step = 1 / 120;
  for(const art of document.querySelectorAll('[data-scene]'))P.preview(art.getContext('2d'),art.dataset.scene,art.width,art.height);
  const hero=document.getElementById('pixel-hero');if(hero){const h=hero.getContext('2d');h.imageSmoothingEnabled=false;h.scale(2,2);P.player(h,{x:15,y:36,w:30,h:48,face:1,vx:0,grounded:true},{band:{active:true,x:71,y:21}});P.band(h,{active:true,x:71,y:21,direction:1,charge:0,element:'air'},0,0,11,3);}
  function resolution() {
    canvas.width=W;canvas.height=H;ctx.setTransform(1,0,0,1,0,0);ctx.imageSmoothingEnabled=false;
  }
  window.addEventListener('resize',resolution);resolution();

  function point(event) {
    const rect = canvas.getBoundingClientRect(), scale = Math.min(rect.width / W, rect.height / H);
    return { x: (event.clientX - rect.left - (rect.width - W * scale) / 2) / scale + camera,
      y: (event.clientY - rect.top - (rect.height - H * scale) / 2) / scale + cameraY };
  }
  function setPaused(value) {
    if (screen === 'menu') value = true;
    keys.clear(); jumpQueued = false; pointer = null;
    game.pause(value); ui['pause-overlay'].hidden = !value || screen !== 'game' || game.completed || game.dead;
    ui.pause.innerHTML = value ? '▶ <span>계속하기</span><kbd>ESC</kbd>' : 'Ⅱ <span>일시정지</span><kbd>ESC</kbd>';
    document.querySelector('.live-label').childNodes[1].textContent = game.completed ? ' 스테이지 완료 ' : value ? ' 잠시 쉬는 중 ' : ' 플레이 중 ';
    if (screen === 'game' && !game.completed && !game.dead) {
      if (value) document.getElementById('resume').focus(); else canvas.focus({ preventScroll: true });
    }
    syncUI();
  }
  function restart() {
    tutorialAdvance=null;
    game.reset(); lastTeleportSerial=game.teleportSerial; teleportCamera=null; cameraLookAhead=0; camera = horizontalCameraTarget(); cameraY=game.customStage?Math.max(game.worldTop,game.player.y-420):0;keys.clear(); jumpQueued = false; pointer = null;
    setPaused(false); game.tell(game.stage.name + '를 다시 시작했어요.');
  }
  function showMenu() {
    tutorialAdvance=null;
    screen = 'menu'; setPaused(true);
    document.getElementById('play-screen').hidden = true;
    document.getElementById('editor-screen').hidden = true;
    editor.renderMenu();
    document.getElementById('stage-menu').hidden = false;
    document.getElementById('fullscreen').hidden = true;
    document.getElementById('clear-overlay').hidden = true;
    document.title = '에어밴드 · 스테이지 선택';
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    document.getElementById('menu-title').focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  }
  function startStage(id) {
    if (!(typeof id==='object'?game.loadCustomStage(id):game.loadStage(id))) return;
    tutorialAdvance=null;
    id=game.stageId;
    lastTeleportSerial=game.teleportSerial;
    teleportCamera=null;
    screen = 'game'; cameraLookAhead=0; camera = horizontalCameraTarget();cameraY=game.customStage?Math.max(game.worldTop,game.player.y-420):0; accumulator = 0;
    document.getElementById('stage-menu').hidden = true;
    document.getElementById('editor-screen').hidden = true;
    document.getElementById('game-edit').hidden = !game.customStage;
    ui.respawn.textContent=game.tutorial?'허수아비 다시 세우기':'몬스터 재배치';
    document.getElementById('terrain-info').textContent=game.customStage?'자동 바닥 없음 · 배치한 블록만 발판':'바닥: 캐릭터 충돌 · 밴드 통과';
    document.getElementById('play-screen').hidden = false;
    document.getElementById('fullscreen').hidden = false;
    document.getElementById('stage-eyebrow').textContent = (id === 'test' ? '00 / ' : '01 / ') + game.stage.label;
    document.getElementById('stage-heading').textContent = game.stage.title;
    document.getElementById('stage-subtitle').textContent = game.stage.subtitle;
    document.getElementById('stage-kind').textContent = game.stage.name;
    document.getElementById('stage-short-title').textContent = game.stage.title;
    document.getElementById('stage-goal-text').textContent = game.stage.goalText;
    document.querySelector('.scene-label').textContent = game.stage.label;
    document.getElementById('field-label').textContent = (id === 'test' ? '00 — ' : '01 — ') + game.stage.label;
    document.getElementById('field-title').textContent = id === 'test' ? '속성 안으로, 그리고 밖으로.' : '흙을 딛고, 흐름을 담아.';
    document.getElementById('field-hint').textContent = id === 'test' ? '우클릭을 누른 채 속성 오브젝트를 통과해 보세요.' : '에어밴드에 속성을 담고 폭발·분출해 보세요.';
    document.getElementById('game-frame').setAttribute('aria-label', game.stage.name);
    document.title = '에어밴드 · ' + game.stage.name;
    document.querySelector('#clear-overlay .pause-card>p:not(.eyebrow)').textContent=game.stage.title+' 스테이지를 완료했어요.';
    setPaused(false); window.scrollTo({ top: 0 });
  }
  const editor=window.createAirbandEditor({
    onMenu:showMenu,onPlay:startStage,
    onOpen:()=>{tutorialAdvance=null;screen='editor';setPaused(true);document.getElementById('play-screen').hidden=true;document.getElementById('stage-menu').hidden=true;document.getElementById('fullscreen').hidden=true;document.title='에어밴드 · 스테이지 만들기';}
  });
  document.getElementById('editor-open').addEventListener('click',()=>editor.open());
  document.getElementById('game-edit').addEventListener('click',()=>editor.open(game.customStage));
  document.getElementById('dead-edit').addEventListener('click',()=>editor.open(game.customStage));
  document.getElementById('dead-restart').addEventListener('click',restart);
  document.getElementById('dead-menu').addEventListener('click',showMenu);
  for (const button of document.querySelectorAll('[data-stage]')) button.addEventListener('click', () => startStage(button.dataset.stage));
  document.querySelector('.brand').addEventListener('click', e => { e.preventDefault(); showMenu(); });
  for (const id of ['stage-menu-button', 'pause-to-menu', 'clear-to-menu']) document.getElementById(id).addEventListener('click', showMenu);
  document.getElementById('clear-restart').addEventListener('click', restart);
  document.getElementById('clear-next').addEventListener('click',continueFromTutorial);
  document.getElementById('clear-practice').addEventListener('click',()=>{
    if(game.resumeTutorial()){tutorialAdvance=null;setPaused(false);game.tell('자유롭게 더 연습하세요. 출구에서 나갔다 돌아오면 다시 선택할 수 있어요.');}
  });
  function selectLesson(index){if(!game.tutorial||game.completed)return;game.tutorial.select(index);syncTutorial();canvas.focus({preventScroll:true});}
  for(const button of document.querySelectorAll('[data-lesson]'))button.addEventListener('click',()=>selectLesson(Number(button.dataset.lesson)));
  document.getElementById('tutorial-prev').addEventListener('click',()=>selectLesson(game.tutorial.index-1));
  document.getElementById('tutorial-next').addEventListener('click',()=>selectLesson(game.tutorial.index+1));
  document.getElementById('tutorial-replay').addEventListener('click',()=>selectLesson(game.tutorial.index));
  function continueFromTutorial(){
    if(!tutorialAdvance||screen!=='game'||!game.completed||!game.tutorial)return;
    const stage=tutorialAdvance.stage;tutorialAdvance=null;
    if(stage)startStage(stage);else{if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});editor.open();}
  }
  document.getElementById('pause').addEventListener('click', () => setPaused(!game.paused));
  document.getElementById('resume').addEventListener('click', () => setPaused(false));
  document.getElementById('restart').addEventListener('click', restart);
  document.getElementById('restart-paused').addEventListener('click', restart);
  ui.respawn.addEventListener('click', () => {
    if (game.paused) return;
    game.respawnMonsters(); game.tell(game.tutorial?'허수아비를 다시 세웠어요. 마음껏 연습하세요.':'배치된 몬스터를 모두 회복했어요.');
    canvas.focus({ preventScroll: true });
  });
  document.getElementById('fullscreen').addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.getElementById('game-frame').requestFullscreen();
      canvas.focus({ preventScroll: true });
    } catch (_) { game.tell('이 브라우저에서는 전체 화면을 열 수 없어요.'); }
  });
  const settingsDialog = document.getElementById('settings-dialog');
  const settingGroups = [
    ['플레이어', [['playerSpeed','이동 속도','px/s',50,800,10],['jumpSpeed','점프 힘','px/s',100,1000,10],['gravity','중력','px/s²',100,3000,20]]],
    ['쿨타임', [['blastCooldown','폭발 쿨타임','초 · 0이면 제한 없음',0,10,0.1],['shootCooldown','분출 쿨타임','초 · 0이면 제한 없음',0,10,0.1]]],
    ['에어밴드 · 폭발', [['bandRadius','에어밴드 반경','px',10,70,1],['maxCharge','최대 충전 시간','초',0.5,10,0.1],['blastRadius','기본 폭발 반경','px',30,500,5],['blastForce','기본 밀어내기 힘','',0,1500,10],['extraBlastForce','최대 충전 추가 힘','',0,2000,10]]],
    ['분출 · 투사체', [['projectileSpeed','투사체 속도','px/s',100,1800,20],['projectileLife','투사체 수명','초',0.5,15,0.5],['projectileDamage','투사체 피해량','HP',0,500,1],['laserDamage','빛 피해량','HP',0,500,1]]],
    ['몬스터 원거리 공격', [['monsterProjectileSpeed','몬스터 발사체 속도','px/s · 새 발사체부터 적용',50,1500,10]]],
    ['흙 · 몬스터', [['earthRadius','흙 반경','px',10,100,1],['earthLife','흙 유지 시간','초',1,180,1],['earthHP','흙 체력','HP',1,500,1],['monsterHP','몬스터 최대 체력','HP',1,2000,1]]]
  ];
  const fields = settingGroups.flatMap(group => group[1]);
  const storageKey = 'airband-settings-v1';
  function validValue(value, field) {
    return typeof value === 'number' && Number.isFinite(value) && value >= field[3] && value <= field[4] && Math.abs((value-field[3])/field[5] - Math.round((value-field[3])/field[5])) < 0.00001;
  }
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
    for (const field of fields) if (saved && validValue(saved[field[0]], field)) C[field[0]] = saved[field[0]];
    game.reset();
  } catch (_) {}
  document.getElementById('settings-fields').innerHTML = settingGroups.map(([title, items]) => `<fieldset><legend>${title}</legend>${items.map(([key,label,unit,min,max,step]) => `<div class="setting-row"><label for="setting-${key}">${label}<small>${unit || '강도'}</small></label><input type="range" aria-label="${label} 슬라이더" data-range="${key}" min="${min}" max="${max}" step="${step}"><input id="setting-${key}" name="${key}" type="number" required min="${min}" max="${max}" step="${step}"></div>`).join('')}</fieldset>`).join('');
  const settingsForm = document.getElementById('settings-form');
  function fillSettings(values) {
    for (const [key] of fields) {
      settingsForm.elements[key].value = values[key];
      settingsForm.querySelector(`[data-range="${key}"]`).value = values[key];
    }
  }
  function updateSettingsGuide() { document.getElementById('earth-life-guide').textContent = C.earthLife; }
  updateSettingsGuide();
  let pausedBeforeSettings = false;
  document.getElementById('settings-open').addEventListener('click', () => {
    pausedBeforeSettings = game.paused; setPaused(true); fillSettings(C);
    document.getElementById('settings-error').textContent = ''; settingsDialog.showModal();
  });
  settingsDialog.addEventListener('close', () => { setPaused(pausedBeforeSettings); document.getElementById('settings-open').focus({preventScroll:true}); });
  for (const id of ['settings-close','settings-cancel']) document.getElementById(id).addEventListener('click', () => settingsDialog.close());
  document.getElementById('settings-defaults').addEventListener('click', () => fillSettings(window.Airband.DEFAULT_CONFIG));
  settingsForm.addEventListener('input', e => {
    const key = e.target.dataset.range || e.target.name;
    if (!key) return;
    if (e.target.dataset.range) settingsForm.elements[key].value = e.target.value;
    else if (e.target.validity.valid) settingsForm.querySelector(`[data-range="${key}"]`).value = e.target.value;
  });
  settingsForm.addEventListener('submit', e => {
    e.preventDefault();
    const values = {};
    for (const field of fields) {
      const value = settingsForm.elements[field[0]].valueAsNumber;
      if (!validValue(value, field)) { document.getElementById('settings-error').textContent = '각 항목의 허용 범위와 입력 간격을 확인해 주세요.'; return; }
      values[field[0]] = value;
    }
    const hpChanged = C.monsterHP !== values.monsterHP;
    Object.assign(C, values);
    if (hpChanged) game.respawnMonsters();
    let message = '수치를 적용하고 저장했어요. 새로운 설정으로 실험해 보세요.';
    try { localStorage.setItem(storageKey, JSON.stringify(values)); } catch (_) { message = '수치를 적용했어요. 브라우저 저장은 사용할 수 없어 새로고침하면 초기화됩니다.'; }
    updateSettingsGuide(); settingsDialog.close(); game.tell(message); syncUI();
  });
  const blockedKeys = ['KeyA', 'KeyD', 'Space', 'ShiftLeft', 'ShiftRight'];
  window.addEventListener('keydown', e => {
    if (settingsDialog.open) return;
    if (screen !== 'game' || game.completed || game.dead) return;
    if (e.code === 'Escape') { e.preventDefault(); if (!e.repeat) setPaused(!game.paused); return; }
    if(e.target.closest?.('#tutorial-guide button, #tutorial-guide summary'))return;
    if (!blockedKeys.includes(e.code) || e.ctrlKey || e.metaKey || e.altKey || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    e.preventDefault();
    if (game.paused) return;
    keys.add(e.code);
    if (e.code === 'Space' && !e.repeat) jumpQueued = true;
    if (e.code.startsWith('Shift') && !e.repeat) game.requestShoot();
  });
  window.addEventListener('keyup', e => keys.delete(e.code));
  canvas.addEventListener('contextmenu', e => e.preventDefault());
  canvas.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse') { game.tell('키보드와 마우스로 플레이하는 PC 테스트 버전입니다.'); return; }
    try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
  });
  // Mouse events report every button transition; pointerdown/up only report the first/last.
  // Separate buttons are required because the right button stays held during a left-button charge.
  canvas.addEventListener('mousedown', e => {
    if (game.paused) return;
    e.preventDefault(); canvas.focus({ preventScroll: true });
    pointer = point(e);
    if (e.button === 2) game.activate(pointer.x, pointer.y);
    if (e.button === 0) game.startCharge();
  });
  canvas.addEventListener('pointermove', e => {
    if (game.paused) return;
    pointer = point(e); game.trackPointer(pointer.x, pointer.y); game.moveBand(pointer.x, pointer.y);
  });
  window.addEventListener('mouseup', e => {
    if (game.paused) return;
    if (e.button === 0) game.endCharge();
    if (e.button === 2) game.releaseBand();
  });
  canvas.addEventListener('pointercancel', () => setPaused(true));
  window.addEventListener('blur', () => { if (screen === 'game' && !game.paused) setPaused(true); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && screen === 'game' && !game.paused) setPaused(true); });
  function syncUI() {
    syncTutorial();
    const b = game.band, meta = ELEMENTS[b.element];
    ui['state-name'].textContent = meta.name;
    ui['state-mode'].textContent = b.charging ? '충전 중' : b.active ? '활성화' : b.element !== 'air' ? '저장됨' : '대기';
    ui['state-icon'].textContent = symbols[b.element];
    document.querySelector('.status-hud').style.setProperty('--element', meta.color);
    ui['charge-time'].textContent = b.charge.toFixed(1) + ' / ' + C.maxCharge.toFixed(1) + 's';
    ui['charge-fill'].style.width = (b.charge / C.maxCharge * 100) + '%';
    ui.direction.textContent = b.direction === 1 ? '오른쪽 →' : '← 왼쪽';
    for (const action of ['blast', 'shoot']) {
      const remaining = game.cooldownRemaining(action), label = ui[action + '-cooldown'];
      label.textContent = remaining > 0 ? (Math.ceil(remaining * 10) / 10).toFixed(1) + '초' : '준비';
      label.dataset.ready = remaining <= 0;
    }
    ui.toast.textContent = game.note;
    ui.discovered.textContent = game.stats.collected.size;
    ui['earth-count'].textContent = game.earths.length;
    document.getElementById('player-hearts').textContent='♥ '.repeat(game.player.hp)+'♡ '.repeat(4-game.player.hp);
    document.getElementById('player-hp').textContent=game.player.hp+' / 4';
    const deadOverlay=document.getElementById('dead-overlay'),justDied=game.dead&&screen==='game'&&deadOverlay.hidden;
    deadOverlay.hidden=!game.dead||screen!=='game';document.getElementById('dead-edit').hidden=!game.customStage;
    if(justDied){document.getElementById('dead-reason').textContent=game.note;document.querySelector('.live-label').childNodes[1].textContent=' 다시 도전하기 ';document.getElementById('dead-restart').focus({preventScroll:true});}
    const clearOverlay = document.getElementById('clear-overlay');
    const justCompleted = game.completed && screen === 'game' && clearOverlay.hidden;
    clearOverlay.hidden = !game.completed || screen !== 'game';
    const tutorialCleared=game.completed&&screen==='game'&&!!game.tutorial,nextButton=document.getElementById('clear-next'),menuButton=document.getElementById('clear-to-menu');
    nextButton.hidden=!tutorialCleared;menuButton.className=tutorialCleared?'secondary-button':'primary-button';
    document.getElementById('clear-practice').hidden=!tutorialCleared;
    document.querySelector('#clear-overlay h2').textContent=tutorialCleared?'연습을 이어갈까요?':'도착한 작은 바람.';
    if (justCompleted) {
      document.querySelector('.live-label').childNodes[1].textContent = ' 스테이지 완료 ';
      if(tutorialCleared){
        const firstStage=editor.library.state.stages[0];
        tutorialAdvance={stage:firstStage?JSON.parse(JSON.stringify(firstStage)):null};
        const remaining=game.tutorial.view(game).remaining;
        document.querySelector('#clear-overlay .pause-card>p:not(.eyebrow)').textContent=(remaining.length?'아직 해 보지 않은 연습: '+remaining.join(' · ')+'. ':'모든 체험을 해 봤어요! ')+(firstStage?'더 연습하거나 「'+firstStage.name+'」 스테이지로 진행하세요.':'더 연습하거나 맵 에디터에서 나의 스테이지를 만드세요.');
        nextButton.textContent=firstStage?'나의 스테이지로 →':'맵 에디터로 →';
      }
      (tutorialCleared?nextButton:menuButton).focus({ preventScroll: true });
    }
    ui.pause.disabled = game.completed || game.dead;
    for (const card of document.querySelectorAll('[data-element]')) card.classList.toggle('found', game.stats.collected.has(card.dataset.element));
  }
  function syncTutorial() {
    const guide=document.getElementById('tutorial-guide');
    guide.hidden=!game.tutorial;document.getElementById('viewport').dataset.tutorial=String(!!game.tutorial);document.querySelector('.field-label').hidden=!!game.tutorial;
    if(!game.tutorial){tutorialViewKey='';return;}
    const view=game.tutorial.view(game),key=JSON.stringify({...view,target:undefined,earthLife:C.earthLife,maxCharge:C.maxCharge,projectileLife:C.projectileLife});
    if(key===tutorialViewKey)return;tutorialViewKey=key;
    for(const [id,value] of Object.entries({count:'안내 '+(view.index+1)+' / '+view.total+(view.index<view.total-1?' · 완료 시 자동 진행':' · 자유 연습'),title:view.title,keys:view.keys,instruction:view.instruction,detail:view.detail,context:view.context,success:view.success?'✓ '+view.success:''}))document.getElementById('tutorial-'+id).textContent=value;
    guide.dataset.step=view.id;
    const hold=document.getElementById('tutorial-hold');hold.dataset.held=String(view.rightHeld);document.getElementById('tutorial-hold-state').textContent=view.rightHeld?'누르고 있어요 ✓':'우클릭 대기';
    document.querySelector('.tutorial-ability').hidden=view.element==='air'&&view.index<4;
    document.getElementById('tutorial-element-name').textContent=view.elementName+(view.element==='air'?' · 기본 상태':game.band.element==='air'?' · 직전에 담은 힘':' · 담은 힘');
    document.getElementById('tutorial-blast').textContent=view.ability.blast;document.getElementById('tutorial-shoot').textContent=view.ability.shoot;
    document.getElementById('tutorial-ability-detail').textContent=view.ability.detail+(view.element==='earth'?' 현재 흙 유지 시간 '+C.earthLife+'초.':'')+' 충전은 최대 '+C.maxCharge+'초. 불·물 투사체는 적·지형에 닿거나 '+C.projectileLife+'초 뒤 사라져요. 우클릭 해제 시 속성 저장, 능력 사용 시 소모. 충전 중 우클릭을 떼도 폭발해요.';
    document.querySelectorAll('.tutorial-steps li').forEach((item,index)=>{item.dataset.state=view.checks[index]?'done':'pending';const button=item.querySelector('button');button.setAttribute('aria-pressed',String(index===view.index));if(index===view.index)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');});
    document.getElementById('tutorial-prev').disabled=view.index===0;document.getElementById('tutorial-next').disabled=view.index===view.total-1;
    document.getElementById('tutorial-trials').innerHTML=Object.entries(view.trials).map(([element,trial])=>'<span><b>'+ELEMENTS[element].name+'</b> '+['collected','blast','shoot'].map((action,i)=>(trial[action]?'✓':'○')+['담기','폭발','분출'][i]).join(' ')+'</span>').join('');
  }
  function roundRect(x,y,w,h,r,fill,stroke,width=2) {
    if(stroke)P.frame(ctx,x,y,w,h,fill||'#c6d9bd',stroke,Math.max(2,width));else if(fill)P.rect(ctx,x,y,w,h,fill);
  }

  function line(x,y,xx,yy,color,width=2){P.line(ctx,x,y,xx,yy,color,width);}

  function circle(x,y,r,fill,stroke,width=2){P.circle(ctx,x,y,r,fill,stroke,width);}

  function text(label, x, y, size, color, align = 'left', weight = 400) {
    const screenY=y-P.snap(cameraY);if(x < -300||x>W+300||screenY < -50||screenY>H+80)return;
    let item=labelPool[labelCount++];
    if(!item){item=document.createElement('span');labelPool.push(item);labelLayer.appendChild(item);}
    item.hidden=false;item.textContent=label;item.style.left=x/W*100+'%';item.style.top=screenY/H*100+'%';
    item.style.fontSize=Math.max(13,size+2)+'px';item.style.fontWeight=weight;item.style.color=color;
    item.style.transform='translate('+(align==='center'?'-50%':align==='right'?'-100%':'0')+', -80%)';
  }
  function placeLabelLayer(){
    const scale=Math.min(canvas.clientWidth/W,canvas.clientHeight/H),width=W*scale,height=H*scale;
    const x=canvas.offsetLeft+(canvas.clientWidth-width)/2,y=canvas.offsetTop+(canvas.clientHeight-height)/2,key=[x,y,width,height].join(',');
    if(key===labelBoundsKey)return;labelBoundsKey=key;
    Object.assign(labelLayer.style,{left:x+'px',top:y+'px',width:width+'px',height:height+'px'});
  }
  function landscape(){P.landscape(ctx,{width:W,height:H,camera,cameraY,groundY:C.groundY,custom:!!game.customStage});}

  function drawSource(s,index) {
    const x=s.x-camera;if(x < -160||x>W+160)return;
    ctx.save();
    const covered=game.sources.some(other=>other!==s&&other.solid&&Math.abs(other.y+other.h-s.y)<.1&&other.x<s.x+s.w&&other.x+other.w>s.x);
    P.tile(ctx,s.element,x,s.y,s.w,s.h,game.time,{grass:!covered});
    if(s.label){text(ELEMENTS[s.element].en,x+s.w/2,s.y-14,9,'#d2dfc5','center',600);if(game.stageId==='test')text(ELEMENTS[s.element].name+(s.solid?' · 발판':' · 통과 가능'),x+s.w/2,s.y+s.h+24,10,'#d2dfc5','center');}
    if(game.band.active&&game.band.touched.has(s.id)&&game.band.element==='air')text('밖으로 나가면 획득',x+s.w/2,s.y-30,10,'#d7f2ce','center');
    ctx.restore();
  }

  function drawStageDetails(){
    for(const w of game.layout.blocks||[])P.tile(ctx,w.kind==='spike'?'spike':'wall',w.x-camera,w.y,w.w,w.h,game.time);
    if(!game.tutorial)for(const sign of game.layout.signs){const x=sign.x-camera;if(x < -240||x>W+180)continue;text(sign.title,x,268,13,'#d9e6c9','left',600);text(sign.text,x,289,10,'#bccfb3');P.line(ctx,x,306,x+36,306,'#8fa273',2);}
    const goal=game.layout.goal;if(goal){const x=goal.x+goal.w/2-camera,y=goal.y+goal.h;if(x>-150&&x<W+150){P.object(ctx,{type:'goal',x:x-32,y:y-64},game.time);text('도착 지점',x,y-82,11,'#d9e6c9','center');}}
  }

  function drawPlayer(){
    P.player(ctx,game.player,{time:game.time,band:game.band,camera,hurt:game.time<game.hurtUntil});
  }

  function drawMonster(m){
    const x=m.x-camera;if(x>W+100||x < -100)return;
    P.monster(ctx,m,game.time,camera);
    if(m.trainingDummy){text(m.hp>0?'허수아비 · 공격하지 않아요':'잠시 후 다시 일어나요',x+m.w/2,m.y-34,10,'#eddaab','center');}
    if(m.hp>0&&!m.trainingDummy)text((m.attackElement==='fire'?'불':m.attackElement==='water'?'물':'불·물 교대')+' 원거리',x+m.w/2,m.y-35,9,m.attackElement==='water'?'#a5dbe5':'#f1c596','center');
    if(m.hp>0){P.frame(ctx,x-2,m.y-14,m.w+4,6,'#718365','#3b513e',2);P.rect(ctx,x,m.y-12,(m.w)*m.hp/m.maxHP,2,'#c4b773');text(Math.ceil(m.hp)+' / '+m.maxHP,x+m.w/2,m.y-24,9,'#cfddbc','center');}
  }

  function drawBand(){
    P.band(ctx,game.band,game.time,camera,C.bandRadius,C.maxCharge);
    if(game.band.active&&game.band.charging)text(game.band.charge.toFixed(1)+'s',game.band.x-camera,game.band.y+C.bandRadius+28,10,'#d4f1e5','center');
  }

  function drawTutorial(){
    if(!game.tutorial)return;
    const view=game.tutorial.view(game),target=view.target;
    let x=target.x-camera,y=target.y,label='지금 여기서 연습해 보세요';
    if(target.kind==='dummy')label='방울을 같은 높이에 · SHIFT';
    if(view.id==='elements')label='네 가지 힘을 자유롭게 담아 보세요';
    if(x>-180&&x<W+180){
      const pulse=Math.floor(Math.sin(game.time*4)*3)*2;
      P.line(ctx,x,y-75-pulse,x,y-47-pulse,'#cfdfa9',3);P.line(ctx,x,y-47-pulse,x-8,y-55-pulse,'#cfdfa9',3);P.line(ctx,x,y-47-pulse,x+8,y-55-pulse,'#cfdfa9',3);
      if(view.id==='band'){P.circle(ctx,x,y,30,null,'#b3d0a1',2);P.line(ctx,x+42,y,x+130,y,'#b9d99e',2);label='우클릭을 누른 채 마우스 이동 →';}
      if(target.kind==='air'){
        P.circle(ctx,x,y,C.bandRadius,null,'#b3d0a1',2);const dir=target.pushDirection,px=game.player.x+game.player.w/2-camera;
        P.line(ctx,px,y-16,px+dir*65,y-16,'#f9efbd',3);P.line(ctx,px+dir*65,y-16,px+dir*55,y-24,'#f9efbd',3);P.line(ctx,px+dir*65,y-16,px+dir*55,y-8,'#f9efbd',3);
        label='기본 폭발 · 데미지 0 / 몸 밀어내기';
      }
      if(target.kind==='source'){
        const s=game.sources.find(s=>s.id===target.sourceId),left=s.x-camera-32,right=s.x+s.w-camera+40;
        P.line(ctx,left,y,right,y,'#faf2bd',3);P.line(ctx,right,y,right-10,y-8,'#faf2bd',3);P.line(ctx,right,y,right-10,y+8,'#faf2bd',3);
        label='밴드 중심을 안으로 → 밖으로';
      }
      text(label,x,Math.max(150,y-94),11,'#e1ecc7','center',600);
    }
    for(let ax=420;ax<game.worldWidth-180;ax+=420){const px=ax-camera;if(px<0||px>W)continue;P.line(ctx,px,512,px+30,512,'#93ae8577',3);P.line(ctx,px+30,512,px+22,504,'#93ae8577',3);P.line(ctx,px+30,512,px+22,520,'#93ae8577',3);}
    if(game.band.active&&game.band.element==='air'&&game.band.touched.size){P.rect(ctx,game.band.x-camera-2,game.band.y-2,4,4,'#fff9bd');}
  }
  function draw(){
    labelCount=0;placeLabelLayer();
    ctx.clearRect(0,0,W,H);landscape();ctx.save();ctx.translate(0,-P.snap(cameraY));
    game.sources.forEach(drawSource);drawStageDetails();drawTutorial();
    for(const e of game.earths){P.circle(ctx,e.x-camera,e.y,e.r,'#ac8056','#735b42',2);P.line(ctx,e.x-camera-e.r-C.earthLandingMargin,e.y-e.r,e.x-camera+e.r+C.earthLandingMargin,e.y-e.r,'#dfbd79',3);for(let i=0;i<7;i++)P.rect(ctx,e.x-camera+Math.sin(i*4)*e.r*.6,e.y+Math.cos(i*4)*e.r*.6,4,4,'#d7a96c');text(Math.ceil(e.life)+'s',e.x-camera,e.y+4,10,'#fff0be','center');}
    game.monsters.forEach(drawMonster);
    for(const shot of game.enemyProjectiles)if(shot.x+shot.w-camera>=0&&shot.x-camera<=W)P.enemyProjectile(ctx,shot,game.time,camera);
    if(game.band.active&&game.band.element==='light'){
      const b=game.band,p=game.player,valid=!!game.teleportDestination(b.x,b.y),color=valid?'#f4d06b':'#c57561',x=b.x-camera-p.w/2,y=b.y-p.h/2;
      P.frame(ctx,x,y,p.w,p.h,valid?'#f4d06b22':'#c5756122',color,2);
      if(!valid){P.line(ctx,x,y,x+p.w,y+p.h,color,2);P.line(ctx,x+p.w,y,x,y+p.h,color,2);}
      text(valid?'빛 폭발 → 이곳으로 순간이동':'이동할 공간이 없어요',b.x-camera,b.y+p.h/2+17,10,color,'center',600);
    }
    drawPlayer();
    for(const s of game.projectiles){const color=ELEMENTS[s.element].color,x=s.x-camera;P.line(ctx,x-Math.sign(s.vx)*28,s.y,x,s.y,color,4);P.circle(ctx,x,s.y,6,color,'#e5dfac',2);}
    for(const e of game.effects){const progress=e.age/e.life;ctx.save();ctx.globalAlpha=1-progress;
      if(e.kind==='blast'){P.circle(ctx,e.x-camera,e.y,e.radius*progress,null,e.color,4);P.circle(ctx,e.x-camera,e.y,e.radius*progress*.7,null,e.color,2);}
      if(e.kind==='collect')for(let i=0;i<8;i++)P.rect(ctx,e.x-camera+Math.cos(i*Math.PI/4)*progress*48,e.y+Math.sin(i*Math.PI/4)*progress*48,4,4,e.color);
      if(e.kind==='laser'){P.line(ctx,e.x-camera,e.y,e.endX-camera,e.y,'#e0c76e',8);P.line(ctx,e.x-camera,e.y,e.endX-camera,e.y,'#fff0b4',2);}
      if(e.kind==='teleport')for(const [x,y] of [[e.fromX,e.fromY],[e.x,e.y]]){
        P.circle(ctx,x-camera,y,16+progress*32,null,'#f1da85',3);
        for(let i=0;i<8;i++){const a=i*Math.PI/4;P.rect(ctx,x-camera+Math.cos(a)*(12+progress*48),y+Math.sin(a)*(12+progress*48),4,4,'#fff0ba');}
      }
      ctx.restore();
    }
    drawBand();ctx.restore();
    for(let i=labelCount;i<labelPool.length;i++)labelPool[i].hidden=true;
  }

  function horizontalCameraTarget(){return clamp(game.player.x+game.player.w/2-W/2+cameraLookAhead,0,Math.max(0,game.worldWidth-W));}
  function followCamera(dt) {
    const moveDirection=Number(keys.has('KeyD'))-Number(keys.has('KeyA'));
    cameraLookAhead+=(moveDirection*110-cameraLookAhead)*(1-Math.exp(-dt*6));
    const nextCamera=horizontalCameraTarget();
    const nextCameraY=game.customStage?Math.max(game.worldTop,game.player.y-380):0;
    const oldCamera=camera,oldCameraY=cameraY;
    if(game.teleportSerial!==lastTeleportSerial){
      lastTeleportSerial=game.teleportSerial;teleportCamera={elapsed:0,x:camera,y:cameraY};pointer=null;
    }
    if(teleportCamera){
      teleportCamera.elapsed=Math.min(.35,teleportCamera.elapsed+dt);
      const t=teleportCamera.elapsed/.35,ease=t*t*(3-2*t);
      camera=teleportCamera.x+(nextCamera-teleportCamera.x)*ease;
      cameraY=teleportCamera.y+(nextCameraY-teleportCamera.y)*ease;
      if(t>=1)teleportCamera=null;
    }else{
      camera+=(nextCamera-camera)*Math.min(1,dt*5);
      if(game.customStage)cameraY+=(nextCameraY-cameraY)*Math.min(1,dt*5);
    }
    // Keep fast falls visible; teleporting retains its deliberate smooth transition.
    if(game.customStage&&!teleportCamera)cameraY=Math.max(cameraY,game.player.y+game.player.h-(H-96));
    if(pointer&&game.band.active&&(Math.abs(camera-oldCamera)>.001||Math.abs(cameraY-oldCameraY)>.001)){
      pointer.x+=camera-oldCamera;pointer.y+=cameraY-oldCameraY;game.moveBand(pointer.x,pointer.y);
    }
  }
  function frame(now) {
    const dt = Math.min((now - previous) / 1000, .05); previous = now;
    const playing=screen==='game'&&!game.paused&&!game.completed&&!game.dead;
    if (playing) {
      accumulator += dt;
      while (accumulator >= step) {
        game.update(step, { left: keys.has('KeyA'), right: keys.has('KeyD'), jump: jumpQueued }); jumpQueued = false; accumulator -= step;
      }
    } else accumulator = 0;
    if(screen==='game'&&(playing||((game.completed||game.dead)&&(teleportCamera||game.teleportSerial!==lastTeleportSerial))))followCamera(dt);
    if (screen === 'game') {
      syncUI();
      if(screen==='game')draw();
    }
    requestAnimationFrame(frame);
  }
  showMenu();
  requestAnimationFrame(frame);
  // Read-only snapshots for the test harness and future balancing tools.
  window.airbandDebug = { snapshot: () => ({ screen, stageId: game.stageId, tutorial:game.tutorial?game.tutorial.view(game):null, completed: game.completed, dead:game.dead, worldTop:game.worldTop,worldBottom:game.worldBottom, worldWidth: game.worldWidth, player: { ...game.player }, band: { ...game.band, touched: [...game.band.touched] }, camera,cameraY, paused: game.paused, earths: game.earths.length, projectiles: game.projectiles.length, enemyProjectiles:game.enemyProjectiles.map(s=>({...s})), collected: [...game.stats.collected], monsterHP: game.monster.hp, monsters:game.monsters.map(m=>({...m})), sources: game.sources.map(s => ({ ...s })), ground: { ...game.ground }, cooldowns: { blast: game.cooldownRemaining('blast'), shoot: game.cooldownRemaining('shoot') }, stats: { shots: game.stats.shots, blasts: game.stats.blasts } }), staff:()=>P.staffPose(game.player,game.band), editor:()=>editor.draft };
})();
