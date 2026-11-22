(function(root){
  'use strict';
  const KEY='airband-stages-v1', SIZE=64, WIDTH=4096, GROUND=530;
  const TOP=GROUND-28*SIZE, BOTTOM=GROUND+20*SIZE;
  const TYPES=['earth','fire','water','light','wall','spike','monster','spawn','goal'];
  const copy=value=>JSON.parse(JSON.stringify(value));
  const ATTACK_ELEMENTS=['alternate','fire','water'];
  const validMonsterSpeed=value=>Number.isFinite(value)&&value>=50&&value<=1500&&value%10===0;
  function blank(){return {version:3,name:'나의 스테이지',width:WIDTH,objects:[{type:'spawn',x:128,y:466},{type:'goal',x:3840,y:466}]};}
  function normalize(value){
    if(!value||!Array.isArray(value.objects))throw new Error('스테이지 구조를 읽을 수 없어요.');
    const width=Number.isInteger(value.width)&&value.width>=1280&&value.width<=8192?value.width:WIDTH;
    const cells=new Map();
    for(const o of value.objects.slice(0,4096)){
      if(!o||!TYPES.includes(o.type)||!Number.isFinite(o.x)||!Number.isFinite(o.y))continue;
      const x=Math.round(o.x/SIZE)*SIZE, row=Math.round((GROUND-o.y)/SIZE), y=GROUND-row*SIZE;
      if(x<0||x+SIZE>width||row<-19||row>28)continue;
      if(o.type==='spawn'||o.type==='goal')for(const [k,v] of cells)if(v.type===o.type)cells.delete(k);
      const object={type:o.type,x,y};
      if(o.type==='monster'){
        object.attackElement=ATTACK_ELEMENTS.includes(o.attackElement)?o.attackElement:'alternate';
        if(validMonsterSpeed(o.projectileSpeed))object.projectileSpeed=o.projectileSpeed;
      }
      cells.set(x+':'+y,object);
    }
    return {version:3,id:typeof value.id==='string'&&/^custom-[a-z0-9-]+$/.test(value.id)?value.id:undefined,name:typeof value.name==='string'?value.name.trim().slice(0,40)||'나의 스테이지':'나의 스테이지',width,objects:[...cells.values()]};
  }
  function validate(stage){
    if(!stage.objects.some(o=>o.type==='spawn'))return '시작점을 하나 배치해 주세요.';
    if(!stage.objects.some(o=>o.type==='goal'))return '도착점을 하나 배치해 주세요.';
    return '';
  }
  class Library{
    constructor(storage){
      this.storage=storage; this.state={version:1,draft:blank(),stages:[]}; this.readError='';
      try{
        const raw=storage.getItem(KEY); if(!raw)return;
        const state=JSON.parse(raw);
        this.state={version:1,draft:state.draft?normalize(state.draft):blank(),stages:(Array.isArray(state.stages)?state.stages:[]).map(normalize).filter(s=>s.id&& !validate(s))};
      }catch(_){this.readError='저장된 맵을 읽지 못했어요. 현재 배치는 새로 저장할 수 있습니다.';}
    }
    persist(next){this.storage.setItem(KEY,JSON.stringify(next));this.state=next;}
    saveDraft(value){
      const next=copy(this.state);next.draft=normalize(value);
      const index=next.stages.findIndex(s=>s.id===next.draft.id);
      if(index>=0&&!validate(next.draft))next.stages[index]=copy(next.draft);
      this.persist(next);return next.draft;
    }
    publish(value){
      const stage=normalize(value), error=validate(stage);if(error)throw new Error(error);
      if(!stage.id)stage.id='custom-'+(globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2));
      const next=copy(this.state), index=next.stages.findIndex(s=>s.id===stage.id);
      if(index<0)next.stages.push(stage);else next.stages[index]=stage;
      next.draft=stage;this.persist(next);return copy(stage);
    }
  }
  const api={KEY,SIZE,WIDTH,GROUND,TOP,BOTTOM,TYPES,ATTACK_ELEMENTS,validMonsterSpeed,blank,normalize,validate,Library};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.AirbandStageData=api;
})(typeof globalThis!=='undefined'?globalThis:this);
