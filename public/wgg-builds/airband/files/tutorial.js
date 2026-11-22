(function (root) {
  'use strict';
  const LESSONS = Object.freeze([
    {id:'move',label:'이동',title:'먼저, 걷고 점프해 보세요',keys:'A · D / SPACE'},
    {id:'band',label:'생성',title:'우클릭을 꾹, 공기 방울을 만들어요',keys:'우클릭 유지 + 마우스 이동'},
    {id:'blast',label:'폭발',title:'좌클릭을 눌렀다 떼면 폭발해요',keys:'우클릭 유지 + 좌클릭 후 떼기'},
    {id:'charge',label:'밀기·충전',title:'가까이서 터뜨리고, 더 강하게 밀어 봐요',keys:'우클릭 유지 + 좌클릭 길게 → 떼기'},
    {id:'collect',label:'담기',title:'그릇에 담듯, 불의 힘을 떠내요',keys:'우클릭 유지 + 안으로 → 밖으로'},
    {id:'shoot',label:'분출',title:'담은 불을 허수아비에게 보내요',keys:'우클릭 유지 + SHIFT'},
    {id:'elements',label:'속성 비교',title:'네 가지 힘을 자유롭게 비교해요',keys:'우클릭 유지 + 좌클릭 / SHIFT'}
  ]);
  const names={air:'에어',fire:'불',water:'물',earth:'흙',light:'빛'};
  const ABILITIES=Object.freeze({
    air:{blast:'몸을 밀어내요. 몬스터 피해는 0이고, 생성된 흙은 제거해요.',shoot:'분출 효과가 없어요.',detail:'좌클릭을 길게 눌렀다 떼면 더 강하게 밀어요. 몸 가까이에 방울을 놓아 보세요.'},
    fire:{blast:'몸을 밀어내고 적에게 폭발 피해를 줘요.',shoot:'방울 중심에서 불 투사체를 좌우로 발사해요.',detail:'충전하면 밀어내기와 피해가 커져요. 파란 불은 충전 연출이에요.'},
    water:{blast:'몸을 밀어내고 적에게 폭발 피해를 줘요.',shoot:'방울 중심에서 물 투사체를 좌우로 발사해요.',detail:'충전하면 밀어내기와 피해가 커져요. 얼음 표현은 충전 연출이에요.'},
    earth:{blast:'방울 위치에 원형 흙 발판을 만들어요. 몸은 밀지 않아요.',shoot:'공격 효과 없이 담은 흙만 사라져요.',detail:'몸 아래에 겹쳐 만들면 안전할 때 발판 위에 올라서요. 가장자리도 조금 여유롭게 착지해요. 생성된 흙에는 HP가 있고 에어 폭발로 제거할 수 있어요.'},
    light:{blast:'방울 위치로 순간이동해요. 밀어내기·폭발 피해는 없어요.',shoot:'적을 관통하고 벽에 막히는 레이저를 발사해요.',detail:'몸이 들어갈 빈 공간에서만 순간이동해요. 막힌 곳에서는 빛이 유지돼요. 충전해도 도착 위치는 같아요.'}
  });
  // Practice thresholds affect the guide only; they never restrict gameplay.
  const PRACTICE={walk:100,drag:80,chargeFraction:1/3,displacement:8,successSeconds:1.5};
  class Tutorial {
    constructor(){
      this.index=0;this.walked=0;this.jumped=false;this.created=false;this.dragged=0;
      this.shortBlast=false;this.chargedBlast=false;this.pushed=false;this.airPush=null;this.airAttempted=false;
      this.fireHit=false;this.elementTrials=Object.fromEntries(['fire','water','earth','light'].map(e=>[e,{collected:false,blast:false,shoot:false}]));
      this.success='';this.successUntil=0;this.pendingGuide=null;this.lastElement='air';this.lastAction=null;this.exitDismissed=false;
    }
    get step(){return LESSONS[this.index];}
    get ready(){return this.checks.every(Boolean);}
    get checks(){return [this.walked>=PRACTICE.walk&&this.jumped,this.created&&this.dragged>=PRACTICE.drag,this.shortBlast||this.chargedBlast,this.shortBlast&&this.chargedBlast&&this.pushed,this.elementTrials.fire.collected,this.elementTrials.fire.shoot&&this.fireHit,Object.values(this.elementTrials).every(e=>e.collected&&e.blast&&e.shoot)];}
    allows(){return true;}
    allowsSource(){return true;}
    revealed(){return true;}
    select(index){this.index=Math.max(0,Math.min(LESSONS.length-1,index));this.pendingGuide=null;}
    notify(game,message){this.success=message;this.successUntil=game.time+PRACTICE.successSeconds;game.tell(message);}
    event(type,data,game){
      const before=this.checks;
      if(type==='movement'){this.walked+=data.distance;this.jumped||=data.jumped;}
      if(type==='create')this.created=true;
      if(type==='drag')this.dragged+=data.distance;
      if(type==='collect'&&this.elementTrials[data.element]){
        this.elementTrials[data.element].collected=true;this.lastElement=data.element;
        this.notify(game,names[data.element]+'의 힘을 담았어요! 폭발이나 분출로 써 보세요.');
      }
      if(type==='blast'){
        this.lastAction={type,element:data.element,time:game.time};
        if(data.element==='air'){
          this.airAttempted=true;
          if(data.chargeFraction>=PRACTICE.chargeFraction)this.chargedBlast=true;else this.shortBlast=true;
        }else if(this.elementTrials[data.element])this.elementTrials[data.element].blast=true;
      }
      if(type==='knockback'&&data.element==='air'&&data.force>0)this.airPush={x:game.player.x,y:game.player.y,dx:data.dx,dy:data.dy,time:game.time};
      if(type==='shoot'){
        this.lastAction={type,element:data.element,time:game.time,hit:false};
        if(this.elementTrials[data.element])this.elementTrials[data.element].shoot=true;
        if(data.element==='earth')this.notify(game,'흙은 분출 효과 없이 담은 속성만 사라져요. 다시 담아 폭발도 써 보세요.');
      }
      if(type==='hit'&&data.method==='shoot'){
        if(data.element==='fire')this.fireHit=true;
        if(this.lastAction?.type==='shoot')this.lastAction.hit=true;
        this.notify(game,'명중! 플레이어가 아니라 방울 중심에서 공격이 나가요.');
      }
      this.recordCompletions(before,game);
    }
    recordCompletions(before,game){
      const after=this.checks;
      for(let i=0;i<after.length;i++)if(after[i]&&!before[i])this.notify(game,LESSONS[i].label+' 체험 완료! 같은 자리에서 더 연습해도 좋아요.');
      if(after[this.index]&&!this.pendingGuide&&this.index<LESSONS.length-1)this.pendingGuide={at:game.time+PRACTICE.successSeconds,index:this.index};
    }
    update(game){
      const before=this.checks;
      if(this.airPush){const a=this.airPush,p=game.player;if((p.x-a.x)*a.dx+(p.y-a.y)*a.dy>=PRACTICE.displacement){this.pushed=true;this.airPush=null;}else if(game.time-a.time>1.2)this.airPush=null;}
      this.recordCompletions(before,game);
      if(this.pendingGuide&&game.time>=this.pendingGuide.at){this.index=Math.min(LESSONS.length-1,this.index+1);this.pendingGuide=null;}
    }
    view(game){
      const b=game.band,p=game.player,step=this.step,checks=this.checks;
      const fire=game.sources.find(s=>s.element==='fire'),dummy=game.monsters.find(m=>m.trainingDummy);
      const dir=p.x<100?1:p.x>game.worldWidth-130?-1:p.face;
      let target={x:360,y:514,kind:'move'},instruction='',detail='';
      if(step.id==='move'){instruction='A·D로 걷고 SPACE로 한 번 점프해 보세요.';detail=(this.walked>=PRACTICE.walk?'✓ 걷기':'○ 걷기')+' / '+(this.jumped?'✓ 점프':'○ 점프')+' · 화살표는 추천 방향이에요. 언제든 돌아올 수 있어요.';}
      if(step.id==='band'){target={x:p.x+170,y:340,kind:'band'};instruction='우클릭을 꾹 누른 채 마우스를 움직여 보세요.';detail='에어밴드는 벽·바닥·가시를 포함한 모든 물체를 통과해요. 우클릭을 떼면 거두고, 담은 힘은 저장해요.';}
      if(step.id==='blast'){target={x:p.x+140,y:350,kind:'band'};instruction='우클릭을 누른 채 좌클릭을 눌렀다 떼세요.';detail='누르는 동안 충전되고, 좌클릭을 뗄 때 방울 위치에서 폭발해요. 먼저 짧게 터뜨려 보세요.';}
      if(step.id==='charge'){
        target={x:Math.max(30,Math.min(game.worldWidth-30,p.x+p.w/2-dir*58)),y:p.y+p.h/2,kind:'air',pushDirection:dir};
        instruction='몸 옆의 원에 방울을 놓고 터뜨려 보세요. 이번에는 좌클릭을 길게 눌렀다 떼세요.';
        detail=(this.shortBlast?'✓':'○')+' 짧게 / '+(this.chargedBlast?'✓':'○')+' 충전 / '+(this.pushed?'✓':'○')+' 몸 밀기 · 기본 에어의 몬스터 데미지는 0이에요.';
        if(this.airAttempted&&!this.pushed)detail+=' 방울을 몸 가까운 원으로 옮겨 보세요.';
      }
      if(step.id==='collect'){target={x:fire.x+fire.w/2,y:fire.y+fire.h/2,kind:'source',sourceId:fire.id};instruction='방울 중심을 불 안에 넣고, 다시 밖으로 빼세요.';detail='그릇에 담아 떠내듯! 위로만 뺄 필요는 없어요. 어느 방향으로든 밖으로 나오면 불을 담아요.';}
      if(step.id==='shoot'){target={x:dummy.x+dummy.w/2,y:dummy.y+dummy.h/2,kind:'dummy'};instruction='불을 담은 방울을 허수아비 높이에 놓고, 우클릭을 누른 채 SHIFT를 누르세요.';detail=(this.elementTrials.fire.shoot?'✓':'○')+' 불 분출 / '+(this.fireHit?'✓':'○')+' 허수아비 명중 · 방울을 좌우로 움직였다 멈춰 방향 화살표를 맞추세요.';}
      if(step.id==='elements'){target={x:2860,y:440,kind:'elements'};instruction='불·물·흙·빛 중 원하는 힘을 담아 폭발과 분출을 비교하세요.';detail='네 속성을 함께 둔 자유 연습장이에요. 흙의 분출도 눌러 보세요. 순서와 체험 완료는 이동을 막지 않아요.';}
      let context='';
      if(step.id!=='move'||b.active){
        if(!b.active)context=b.element==='air'?'빈 곳에서 우클릭을 누르고 있어 보세요.':names[b.element]+'의 힘은 저장돼 있어요. 우클릭으로 다시 생성하세요.';
        else if(b.charging)context='우클릭은 그대로! 좌클릭을 떼면 폭발해요. '+b.charge.toFixed(1)+'초 충전 중';
        else if(b.element==='air'){
          const source=game.sources.find(s=>b.touched.has(s.id));
          context=source?names[source.element]+'의 힘을 담는 중 · 방울 중심을 밖으로 빼세요.':this.lastAction&&game.time-this.lastAction.time<4?'능력을 썼어요. 물체에서 힘을 다시 담을 수 있어요.':'우클릭 유지 · 좌클릭 후 떼기: 폭발 / SHIFT: 분출';
          if(source)target={x:source.x+source.w/2,y:source.y+source.h/2,kind:'source',sourceId:source.id};
        }else context=names[b.element]+'을 담았어요. 사용하면 에어 상태로 돌아와요. 다른 힘을 담으려면 먼저 사용하세요.';
        if(b.active&&b.element==='air'&&!b.touched.size&&!b.charging&&this.lastAction?.type==='shoot'&&!this.lastAction.hit&&this.lastAction.element==='fire'&&game.time-this.lastAction.time>1&&game.time-this.lastAction.time<5)context='빗나갔다면 방울 높이와 좌우 방향 화살표를 맞추세요. 불은 다시 담을 수 있어요.';
        const wait=Math.max(game.cooldownRemaining('blast'),game.cooldownRemaining('shoot'));if(wait>0)context+=' · 준비 중 '+wait.toFixed(1)+'초 (폭발·분출은 각각 표시)';
      }
      const element=b.element!=='air'?b.element:this.lastElement,ability=ABILITIES[element];
      return {id:step.id,index:this.index,total:LESSONS.length,title:step.title,keys:step.keys,instruction,detail,context,target,ready:this.ready,checks,
        success:game.time<this.successUntil?this.success:'',rightHeld:game.rightHeld&&b.active,element,elementName:names[element],ability,
        trials:JSON.parse(JSON.stringify(this.elementTrials)),remaining:LESSONS.filter((s,i)=>!checks[i]).map(s=>s.label)};
    }
  }
  const api={Tutorial,LESSONS,ABILITIES,PRACTICE};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.AirbandTutorial=api;
})(typeof globalThis!=='undefined'?globalThis:this);
