(function(){
  'use strict';
  const D=window.AirbandStageData;
  const TOOLS=[['earth','흙 블록','▧','#a48365','#e8d8c2'],['fire','불','♨','#dc8b63','#fae5d2'],['water','물','◈','#659eb8','#dcecf1'],['light','빛','✳','#c1a84e','#f7edc6'],['wall','일반 벽','▤','#879888','#e0e7dc'],['spike','가시 블록','▲','#b77765','#f0ddd0'],['monster','몬스터','●','#9b817a','#ece1d7'],['spawn','시작점','S','#5b9477','#dcecdf'],['goal','도착점','⚑','#869e53','#eaf0cf'],['erase','지우개','×','#a58071','#f2e9df']];
  const copy=v=>JSON.parse(JSON.stringify(v));
  window.createAirbandEditor=function({onMenu,onPlay,onOpen}){
    let storage;try{storage=localStorage;}catch(_){storage={getItem:()=>null,setItem:()=>{throw new Error('저장을 사용할 수 없어요.');}};}
    const library=new D.Library(storage), canvas=document.getElementById('editor-canvas'), ctx=canvas.getContext('2d');
    const name=document.getElementById('editor-name'), status=document.getElementById('editor-save-state'), cameraInput=document.getElementById('editor-camera');
    const verticalInput=document.getElementById('editor-camera-y');
    const monsterElement=document.getElementById('editor-monster-element'),monsterSpeed=document.getElementById('editor-monster-speed'),monsterShared=document.getElementById('editor-monster-shared');
    let draft=copy(library.state.draft),tool='earth',camera=0,cameraY=0,hover=null,painting=false,strokeTool='earth',lastCell=null,history=[];
    function message(text,error=false){status.textContent=text;status.dataset.error=error;}
    function refresh(){
      document.getElementById('editor-count').textContent='높이 48칸 · 블록 '+draft.objects.filter(o=>['earth','fire','water','light','wall','spike'].includes(o.type)).length+' · 몬스터 '+draft.objects.filter(o=>o.type==='monster').length;
      document.getElementById('editor-undo').disabled=!history.length;
      document.getElementById('editor-publish').textContent=draft.id?'저장하고 나가기':'＋ 추가하기';
    }
    function save(){
      try{library.saveDraft(draft);message('● 자동 저장됨 · 이 브라우저에 보관 중');refresh();return true;}
      catch(_){message('저장하지 못했어요. 브라우저 저장 공간·권한을 확인해 주세요.',true);refresh();return false;}
    }
    function remember(){history.push(copy(draft));if(history.length>80)history.shift();}
    function syncMonsterSpeed(){monsterSpeed.disabled=monsterShared.checked;if(monsterShared.checked)monsterSpeed.value=window.Airband.CONFIG.monsterProjectileSpeed;}
    monsterShared.addEventListener('change',syncMonsterSpeed);
    function monsterProperties(report=false){
      const properties={attackElement:monsterElement.value};
      if(!monsterShared.checked){const speed=monsterSpeed.valueAsNumber;if(!D.validMonsterSpeed(speed)){if(report)message('몬스터 속도는 50~1500px/s, 10 단위로 입력해 주세요.',true);return null;}properties.projectileSpeed=speed;}
      return properties;
    }
    function choose(type){tool=type;document.getElementById('editor-monster-options').hidden=type!=='monster';syncMonsterSpeed();document.getElementById('editor-tool-name').textContent=TOOLS.find(t=>t[0]===type)[1];for(const b of document.querySelectorAll('[data-tool]'))b.setAttribute('aria-pressed',b.dataset.tool===type);}
    for(const [type,label,symbol,color,pale] of TOOLS){
      const b=document.createElement('button');b.type='button';b.className='editor-tool';b.dataset.tool=type;b.setAttribute('aria-pressed',type===tool);b.style.setProperty('--tool-color',color);b.style.setProperty('--tool-pale',pale);
      const icon=document.createElement('span');icon.textContent=symbol;const text=document.createElement('span');text.textContent=label;b.append(icon,text);b.addEventListener('click',()=>choose(type));document.getElementById('editor-tools').append(b);
    }
    function cell(event){const r=canvas.getBoundingClientRect(),x=(event.clientX-r.left)*1280/r.width+camera,y=(event.clientY-r.top)*600/r.height+cameraY;return {col:Math.floor(x/64),row:Math.floor((530-y)/64)};}
    function place(c,type){
      if(c.col<0||c.col>=draft.width/64||c.row< -20||c.row>27)return false;
      const x=c.col*64,y=530-(c.row+1)*64;
      const old=draft.objects.find(o=>o.x===x&&o.y===y);
      const properties=type==='monster'?monsterProperties(true):{};if(!properties)return false;
      const object={type,x,y,...properties};
      if((old&&JSON.stringify(old)===JSON.stringify(object))||(!old&&type==='erase'))return false;
      draft.objects=draft.objects.filter(o=>!(o.x===x&&o.y===y)&&!((type==='spawn'||type==='goal')&&o.type===type));
      if(type!=='erase')draft.objects.push(object);return true;
    }
    function paint(c){
      let changed=false;
      if(lastCell){
        const steps=Math.max(Math.abs(c.col-lastCell.col),Math.abs(c.row-lastCell.row));
        for(let i=1;i<=steps;i++)changed=place({col:Math.round(lastCell.col+(c.col-lastCell.col)*i/steps),row:Math.round(lastCell.row+(c.row-lastCell.row)*i/steps)},strokeTool)||changed;
      }else changed=place(c,strokeTool);
      lastCell=c;if(changed)save();
    }
    canvas.addEventListener('contextmenu',e=>e.preventDefault());
    canvas.addEventListener('pointerdown',e=>{if(e.button!==0&&e.button!==2)return;e.preventDefault();canvas.focus({preventScroll:true});remember();painting=true;lastCell=null;strokeTool=e.button===2?'erase':tool;canvas.setPointerCapture(e.pointerId);hover=cell(e);paint(hover);refresh();});
    canvas.addEventListener('pointermove',e=>{hover=cell(e);if(painting)paint(hover);});
    const endStroke=()=>{painting=false;lastCell=null;};
    canvas.addEventListener('pointerup',endStroke);canvas.addEventListener('pointercancel',endStroke);canvas.addEventListener('lostpointercapture',endStroke);canvas.addEventListener('pointerleave',()=>{if(!painting)hover=null;});
    canvas.addEventListener('wheel',e=>{e.preventDefault();if(e.shiftKey||Math.abs(e.deltaX)>Math.abs(e.deltaY)){camera=Math.max(0,Math.min(draft.width-1280,camera+Math.sign(e.deltaX||e.deltaY)*128));cameraInput.value=camera;}else{cameraY=Math.max(-1280,Math.min(1280,cameraY+Math.sign(e.deltaY)*128));verticalInput.value=cameraY;}},{passive:false});
    cameraInput.addEventListener('input',()=>{camera=Number(cameraInput.value);});
    verticalInput.addEventListener('input',()=>{cameraY=Number(verticalInput.value);hover=null;});
    name.addEventListener('input',()=>{draft.name=name.value;save();});
    document.getElementById('editor-undo').addEventListener('click',()=>{if(!history.length)return;draft=history.pop();name.value=draft.name;save();});
    document.getElementById('editor-new').addEventListener('click',()=>{remember();draft=D.blank();draft.name='나의 스테이지 '+(library.state.stages.length+1);name.value=draft.name;camera=0;cameraY=0;cameraInput.value=0;verticalInput.value=0;save();});
    document.getElementById('editor-exit').addEventListener('click',()=>{save();onMenu();});
    document.getElementById('editor-preview').addEventListener('click',()=>{const error=D.validate(draft);if(error){message(error,true);return;}save();onPlay(copy(draft));});
    document.getElementById('editor-publish').addEventListener('click',()=>{
      try{draft=library.publish(draft);message('스테이지를 목록에 저장했어요.');renderMenu();onMenu();}
      catch(error){message(error.message||'스테이지를 저장하지 못했어요.',true);}
    });
    window.addEventListener('pagehide',()=>{if(!document.getElementById('editor-screen').hidden)save();});
    window.addEventListener('keydown',e=>{
      if(document.getElementById('editor-screen').hidden||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;
      if(e.code==='Escape'){e.preventDefault();save();onMenu();}
      if((e.ctrlKey||e.metaKey)&&e.code==='KeyZ'){e.preventDefault();document.getElementById('editor-undo').click();}
    });
    function open(stage){
      onOpen();draft=copy(stage?(library.state.draft.id===stage.id?library.state.draft:stage):library.state.draft);
      name.value=draft.name;camera=0;cameraY=0;cameraInput.max=draft.width-1280;cameraInput.value=0;verticalInput.value=0;history=[];hover=null;painting=false;
      document.getElementById('editor-screen').hidden=false;syncMonsterSpeed();refresh();
      message(library.readError||'● 배치는 자동 저장됩니다. 추가하기를 누르면 첫 화면에 등록돼요.',!!library.readError);canvas.focus({preventScroll:true});window.scrollTo({top:0});
    }
    function rect(context,x,y,w,h,fill,stroke){context.fillStyle=fill;context.fillRect(x,y,w,h);if(stroke){context.strokeStyle=stroke;context.lineWidth=1;context.strokeRect(x+.5,y+.5,w-1,h-1);}}
    function drawObject(context,o,time=0){context.imageSmoothingEnabled=false;window.AirbandPixel.object(context,o,time);}

    function preview(target,stage){const c=target.getContext('2d');c.fillStyle='#e4edda';c.fillRect(0,0,target.width,target.height);const scale=Math.min(target.width/stage.width,target.height/(D.BOTTOM-D.TOP));c.save();c.translate((target.width-stage.width*scale)/2,0);c.scale(scale,scale);c.translate(0,-D.TOP);for(const o of stage.objects)drawObject(c,o);c.restore();}
    function renderMenu(){
      const list=document.getElementById('custom-stage-list');list.replaceChildren();document.getElementById('custom-empty').hidden=!!library.state.stages.length;
      for(const stage of library.state.stages){
        const card=document.createElement('article');card.className='custom-card';card.dataset.customStage=stage.id;
        const pic=document.createElement('canvas');pic.width=560;pic.height=90;pic.setAttribute('aria-hidden','true');preview(pic,stage);
        const body=document.createElement('div');body.className='custom-card-body';const title=document.createElement('h3');title.textContent=stage.name;
        const desc=document.createElement('p');desc.textContent='직접 만든 맵 · 몬스터 '+stage.objects.filter(o=>o.type==='monster').length+'마리';
        const actions=document.createElement('div');actions.className='custom-card-actions';
        const play=document.createElement('button');play.className='primary-button';play.textContent='플레이 →';play.dataset.customPlay=stage.id;play.addEventListener('click',()=>onPlay(copy(stage)));
        const edit=document.createElement('button');edit.className='secondary-button';edit.textContent='배치 수정';edit.dataset.customEdit=stage.id;edit.addEventListener('click',()=>open(stage));
        actions.append(play,edit);body.append(title,desc,actions);card.append(pic,body);list.append(card);
      }
    }
    let lastTime=0;
    function frame(time){
      if(!document.getElementById('editor-screen').hidden&&time-lastTime>30){
        lastTime=time;ctx.clearRect(0,0,1280,600);rect(ctx,0,0,1280,600,'#e6eedc');
        ctx.save();ctx.translate(-camera,-cameraY);
        ctx.strokeStyle='#cbdabe';ctx.lineWidth=1;
        for(let x=Math.floor(camera/64)*64;x<camera+1280;x+=64){ctx.beginPath();ctx.moveTo(x,D.TOP);ctx.lineTo(x,D.BOTTOM);ctx.stroke();}
        for(let y=D.TOP;y<=D.BOTTOM;y+=64){ctx.beginPath();ctx.moveTo(camera,y);ctx.lineTo(camera+1280,y);ctx.stroke();}
        ctx.save();ctx.setLineDash([6,6]);ctx.strokeStyle='#9db687';ctx.beginPath();ctx.moveTo(camera,530);ctx.lineTo(camera+1280,530);ctx.stroke();ctx.restore();
        ctx.fillStyle='#90a57f';ctx.font='10px sans-serif';ctx.textAlign='left';ctx.fillText('초기 높이 기준선 · 바닥 없음',camera+12,522);
        rect(ctx,camera,D.TOP-600,1280,600,'#d8e0d1');rect(ctx,camera,D.BOTTOM,1280,600,'#d8e0d1');
        for(const o of draft.objects)if(o.x+64>=camera&&o.x<=camera+1280)drawObject(ctx,o,time/1000);
        if(hover&&hover.row>=-20&&hover.row<28&&hover.col>=0&&hover.col<draft.width/64){const o={type:tool,x:hover.col*64,y:530-(hover.row+1)*64,...(tool==='monster'?monsterProperties():{})};ctx.globalAlpha=.45;if(tool!=='erase')drawObject(ctx,o,time/1000);ctx.globalAlpha=1;ctx.strokeStyle=tool==='erase'?'#ba8067':'#6b9875';ctx.lineWidth=2;ctx.strokeRect(o.x+1,o.y+1,62,62);}
        ctx.restore();
      }requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);renderMenu();
    return {open,renderMenu,get draft(){return copy(draft);},get library(){return library;}};
  };
})();
