(function(root){
  'use strict';
  const C={ink:'#39483f',skin:'#eebd80',skinLight:'#ffdb9d',skinShade:'#ce9464',gold:'#edc358',orange:'#ce743b',orangeLight:'#eea04d',blue:'#6baeb5',grass:'#7d9c5b',soil:'#ac8056',soilDark:'#735b42',water:'#659fae',fire:'#e8984d',light:'#ecd07b'};
  const snap=(x,g=2)=>Math.round(x/g)*g;
  function rect(ctx,x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(snap(x),snap(y),Math.max(2,snap(w)),Math.max(2,snap(h)));}
  function line(ctx,x1,y1,x2,y2,color,width=2){
    let x=Math.round(x1/2),y=Math.round(y1/2);const tx=Math.round(x2/2),ty=Math.round(y2/2),dx=Math.abs(tx-x),dy=-Math.abs(ty-y),sx=x<tx?1:-1,sy=y<ty?1:-1;let error=dx+dy;
    for(let i=0;i<3000;i++){rect(ctx,x*2-width/2,y*2-width/2,width,width,color);if(x===tx&&y===ty)break;const e=error*2;if(e>=dy){error+=dy;x+=sx;}if(e<=dx){error+=dx;y+=sy;}}
  }
  function circle(ctx,x,y,r,fill,stroke,width=2){
    const cell=r>70?4:2,rr=r*r,inner=Math.max(0,r-width)**2;
    for(let yy=-r;yy<=r;yy+=cell)for(let xx=-r;xx<=r;xx+=cell){const d=xx*xx+yy*yy;if(d>rr)continue;const color=stroke&&d>=inner?stroke:fill;if(color)rect(ctx,x+xx,y+yy,cell,cell,color);}
  }
  function frame(ctx,x,y,w,h,fill,outline=C.ink,edge=2){rect(ctx,x,y,w,h,outline);rect(ctx,x+edge,y+edge,w-edge*2,h-edge*2,fill);}
  function staffPose(p,band){
    const sx=p.x+p.w/2,sy=p.y+24,active=!!band?.active;
    let dx=active?band.x-sx:(p.face||1)*.22,dy=active?band.y-sy:-1;
    const length=Math.hypot(dx,dy);if(length<.001){dx=p.face||1;dy=0;}else{dx/=length;dy/=length;}
    const hand=active?{x:sx+dx*13,y:sy+dy*13}:{x:sx+(p.face||1)*16,y:p.y+32};
    return{active,dx,dy,angle:Math.atan2(dy,dx),facing:active&&Math.abs(dx)>.1?Math.sign(dx):p.face||1,shoulder:{x:sx,y:sy},hand,base:{x:hand.x-dx*10,y:hand.y-dy*10},tip:{x:hand.x+dx*38,y:hand.y+dy*38}};
  }
  function player(ctx,p,{time=0,band=null,camera=0,hurt=false}={}){
    const pose=staffPose(p,band),x=snap(p.x-camera),y=snap(p.y),face=pose.facing;
    const box=(xx,yy,w,h,color)=>rect(ctx,x+(face===1?xx:30-xx-w),y+yy,w,h,color);
    ctx.save();if(hurt)ctx.globalAlpha=.65;
    const walking=p.grounded&&Math.abs(p.vx||0)>20,walk=walking?Math.sin(time*17):0;
    // A 16x24 pixel silhouette: shaved head, sky-blue mark, saffron robe and boots.
    box(6,36+Math.max(0,walk)*4,8,10,C.ink);box(18,36+Math.max(0,-walk)*4,8,10,C.ink);
    box(8,36,6,8,C.orange);box(18,36,6,8,C.gold);
    box(4,44+Math.max(0,walk)*2,10,4,C.ink);box(18,44+Math.max(0,-walk)*2,12,4,C.ink);
    box(4,18,24,20,C.ink);box(6,20,20,16,C.gold);box(6,22,8,14,C.orange);box(14,24,8,12,C.orangeLight);
    box(6,34,20,4,'#a85b34');box(6,30,18,2,'#ffe18a');box(6,20,6,4,C.orangeLight);
    box(6,2,20,16,C.ink);box(4,6,24,10,C.ink);box(8,0,16,2,C.ink);
    box(8,2,16,14,C.skin);box(6,6,20,8,C.skin);box(10,2,12,4,C.skinLight);box(8,14,14,4,C.skinShade);
    box(22,8,4,6,C.skinLight);box(8,8,4,6,C.skinShade);box(10,8,3,2,C.ink);box(20,8,3,2,C.ink);
    box(14,0,4,8,C.blue);box(12,6,8,2,C.blue);box(14,8,4,2,C.blue);box(16,14,4,2,'#a66c48');
    const sx=pose.shoulder.x-camera,sy=pose.shoulder.y,hx=pose.hand.x-camera,hy=pose.hand.y;
    line(ctx,sx-4,sy+2,hx-pose.dx*7,hy-pose.dy*7,C.ink,6);line(ctx,sx-4,sy+2,hx-pose.dx*7,hy-pose.dy*7,C.orangeLight,4);
    line(ctx,pose.base.x-camera,pose.base.y,pose.tip.x-camera,pose.tip.y,C.ink,6);
    line(ctx,pose.base.x-camera,pose.base.y,pose.tip.x-camera,pose.tip.y,'#9f744b',3);
    line(ctx,pose.tip.x-camera-pose.dx*8,pose.tip.y-pose.dy*8,pose.tip.x-camera,pose.tip.y,'#ecd9a2',3);
    line(ctx,sx+3,sy,hx,hy,C.ink,6);line(ctx,sx+3,sy,hx,hy,C.gold,4);rect(ctx,hx-2,hy-2,4,4,C.skinLight);
    if(pose.active){rect(ctx,pose.tip.x-camera-2,pose.tip.y-2,4,4,'#d8eee0');}
    ctx.restore();return pose;
  }
  function tile(ctx,kind,x,y,w=64,h=64,time=0,{grass=true}={}){
    const dark=kind==='wall'?'#626f62':C.soilDark,base=kind==='wall'?'#a0ad8d':C.soil;
    if(kind==='earth'||kind==='wall'){
      frame(ctx,x,y,w,h,base,dark,2);rect(ctx,x+4,y+4,w-8,4,kind==='wall'?'#c5cca4':'#d9aa6b');
      for(let j=16;j<h-4;j+=16){rect(ctx,x+2,y+j,w-4,2,dark+'77');for(let i=(j/16%2)*16+16;i<w-4;i+=32)rect(ctx,x+i,y+j-12,2,12,dark+'77');}
      if(kind==='earth'){for(let i=0;i<5;i++)rect(ctx,x+8+(i*23)%(w-16),y+14+(i*17)%Math.max(8,h-20),4,2,'#e4b977');if(grass){rect(ctx,x,y,w,4,'#54764e');rect(ctx,x+2,y+2,w-4,4,'#90ad63');for(let i=4;i<w;i+=12)rect(ctx,x+i,y-2,4,4,'#90ad63');}}
      return;
    }
    if(kind==='spike'){
      frame(ctx,x,y+42,w,h-42,'#a88064','#6f5b48',2);
      for(let i=0;i<w;i+=16)for(let row=0;row<20;row++){const half=Math.floor(row/3);rect(ctx,x+i+8-half,y+4+row*2,Math.min(14,2+half*2),2,row%3===0?'#e3c5a2':'#b9846c');}
      return;
    }
    if(kind==='light'){
      const r=w/2;circle(ctx,x+r,y+r,r,'#eccc6633','#c3a456',2);circle(ctx,x+r,y+r,r-6,null,'#f5df98',2);
      const pulse=2+Math.round(Math.sin(time*3)*2);line(ctx,x+r-10-pulse,y+r,x+r+10+pulse,y+r,'#fff3ba',3);line(ctx,x+r,y+r-10-pulse,x+r,y+r+10+pulse,'#fff3ba',3);rect(ctx,x+r-3,y+r-3,6,6,'#fff8d8');return;
    }
    if(kind==='fire'||kind==='water'){
      frame(ctx,x,y,w,h,kind==='fire'?'#f2d9a955':'#b9d7d555',kind==='fire'?'#c49c6d':'#77a4a1',2);
      if(kind==='fire'){
        const tick=Math.floor(time*7);
        for(let i=4;i<w-4;i+=8){const height=18+((i*7+tick*13)%Math.max(20,h-18));for(let yy=0;yy<height;yy+=4){const width=Math.max(2,8-Math.floor(yy/height*6));rect(ctx,x+i+Math.sin((yy+tick*4)/12)*2,y+h-4-yy,width,4,yy>height*.75?'#fbe19c':yy>height*.35?'#e8a34e':'#c56c3d');}}
      }else{
        for(let yy=12;yy<h-2;yy+=4)for(let xx=2;xx<w-2;xx+=4){const wave=Math.floor(Math.sin(xx/11+time*2)*2)*2;if(yy<20+wave)continue;rect(ctx,x+xx,y+yy,4,4,yy<26+wave?'#c9e8d7':yy%12===0?'#88b9b7':'#699fa5');}
        for(let i=0;i<4;i++)rect(ctx,x+10+(i*19)%(w-16),y+h-8-(Math.floor(time*10)+i*13)%Math.max(10,h-24),2,4,'#c9e8d7');
      }return;
    }
  }
  function monster(ctx,m,time=0,camera=0){
    const x=m.x-camera,y=m.y,bob=Math.floor(Math.sin(time*2)*2);
    if(m.trainingDummy){
      const sway=m.flash>0?Math.sin(time*50)*4:0;
      if(m.hp<=0){rect(ctx,x+4,y+48,48,10,'#9f7b48');for(let i=0;i<5;i++)rect(ctx,x+8+i*9,y+44+i%2*4,6,8,'#e3bd70');return;}
      line(ctx,x+28,y+16,x+28,y+60,'#70513c',6);line(ctx,x+2+sway,y+31,x+54+sway,y+31,'#ae8450',6);
      frame(ctx,x+12+sway,y+23,32,26,'#b98b50','#70513c',2);rect(ctx,x+16+sway,y+27,24,4,'#dfb86d');
      frame(ctx,x+16+sway,y+4,24,20,'#e1bd78','#70513c',2);rect(ctx,x+12+sway,y+4,32,4,'#c49455');rect(ctx,x+20+sway,y,16,6,'#c49455');
      rect(ctx,x+20+sway,y+12,4,2,'#70513c');rect(ctx,x+32+sway,y+12,4,2,'#70513c');line(ctx,x+24+sway,y+18,x+32+sway,y+18,'#8f6240',2);
      for(let i=0;i<4;i++)rect(ctx,x+14+i*8+sway,y+44,4,8,'#e0b96c');circle(ctx,x+28+sway,y+36,8,'#e0c185','#96614c',2);circle(ctx,x+28+sway,y+36,3,'#a36e51');
      if(m.flash>0){ctx.save();ctx.globalAlpha=.35;rect(ctx,x+12+sway,y+6,32,44,'#fff8ca');ctx.restore();}return;
    }
    if(m.hp<=0)return;
    frame(ctx,x+6,y+10+bob,44,44,'#b19b78',C.ink,2);rect(ctx,x+2,y+22+bob,52,30,'#b19b78');rect(ctx,x+6,y+12+bob,40,6,'#d0b58a');
    rect(ctx,x+6,y+6,8,12,C.ink);rect(ctx,x+40,y+4,10,14,C.ink);rect(ctx,x+8,y+8,4,6,'#8a745c');rect(ctx,x+42,y+6,6,6,'#8a745c');
    rect(ctx,x+10,y+50,14,10,C.ink);rect(ctx,x+34,y+50,14,10,C.ink);
    rect(ctx,x+14,y+28+bob,7,6,C.ink);rect(ctx,x+36,y+28+bob,7,6,C.ink);rect(ctx,x+16,y+28+bob,2,2,'#f0e8b2');rect(ctx,x+38,y+28+bob,2,2,'#f0e8b2');rect(ctx,x+23,y+41+bob,12,2,'#7c6854');
    const fire='#e99b51',water='#78b6c5',color=m.attackElement==='water'?water:m.attackElement==='fire'?fire:m.shotCount%2?water:fire;
    rect(ctx,x+14,y+18,8,4,m.attackElement==='water'?water:fire);rect(ctx,x+34,y+18,8,4,m.attackElement==='fire'?fire:water);
    const dx=m.aimX??(m.face||1),dy=m.aimY||0,hx=x+28+dx*34,hy=y+31+dy*20;
    line(ctx,x+28,y+34,hx,hy,C.ink,6);line(ctx,x+28,y+34,hx,hy,'#8b7658',3);circle(ctx,hx,hy,m.shotFlash>0?7:4,color,C.ink,2);
    if(m.flash>0){ctx.save();ctx.globalAlpha=.4;rect(ctx,x+6,y+12,44,42,'#fff0bb');ctx.restore();}
  }
  function object(ctx,o,time=0){
    if(['earth','wall','spike','fire','water','light'].includes(o.type))tile(ctx,o.type,o.x,o.y,64,64,time);
    else if(o.type==='monster')monster(ctx,{...o,x:o.x+4,y:o.y+3,hp:1},time);
    else if(o.type==='spawn'){player(ctx,{x:o.x+16,y:o.y+16,w:30,h:48,face:1,vx:0,grounded:true},{time});}
    else if(o.type==='goal'){line(ctx,o.x+28,o.y+4,o.x+28,o.y+64,C.ink,4);frame(ctx,o.x+30,o.y+6,24,18,'#b7c977',C.ink,2);rect(ctx,o.x+34,o.y+10,12,4,'#e7e5a6');}
  }
  function enemyProjectile(ctx,shot,time=0,camera=0){
    const x=shot.x+shot.w/2-camera,y=shot.y+shot.h/2,r=shot.w/2,color=shot.element==='fire'?'#e99b51':'#78b6c5',speed=Math.hypot(shot.vx,shot.vy)||1;
    line(ctx,x-shot.vx/speed*25,y-shot.vy/speed*25,x,y,color+'88',4);circle(ctx,x,y,r,color,C.ink,2);circle(ctx,x-3,y-3,r/2,shot.element==='fire'?'#ffe6a1':'#d1f0e7');
    if(shot.element==='fire'){rect(ctx,x-4,y-10,4,10,'#fff1bb');rect(ctx,x+4,y-3,4,8,'#c9793e');}
    else{line(ctx,x-7,y+3,x+7,y+3,'#d1f0e7',2);rect(ctx,x+3,y-8,4,4,'#e7f4dc');}
  }
  function landscape(ctx,{width=1280,height=660,camera=0,cameraY=0,groundY=530,custom=false}={}){
    rect(ctx,0,0,width,height,'#263f46');rect(ctx,0,0,width,160,'#223b48');rect(ctx,0,160,width,140,'#2c454b');rect(ctx,0,300,width,height-300,'#36514e');
    if(custom){for(let x=-snap(camera)%64;x<width;x+=64)for(let y=-snap(cameraY)%64;y<height;y+=64)rect(ctx,x,y,2,2,'#526c63');return;}
    circle(ctx,1050-camera*.08,100,32,'#829b94');
    for(let i=0;i<6;i++){const x=i*240-camera*.12-90;rect(ctx,x,80+i%3*32,80,12,'#38525b');rect(ctx,x+16,68+i%3*32,50,12,'#38525b');}
    for(let i=0;i<9;i++){const x=i*180-camera*.2-100,top=300+i%3*32;for(let y=top;y<groundY;y+=16)rect(ctx,x-(y-top)/2,y,80+(y-top),16,'#304a46');}
    for(let i=0;i<16;i++){const x=i*130-camera*.45-40,y=390+i%4*16;rect(ctx,x+22,y,8,groundY-y,'#344c40');rect(ctx,x+4,y-12,44,28,'#3d594b');rect(ctx,x-4,y+4,60,22,'#3d594b');rect(ctx,x+8,y+24,40,10,'#3d594b');rect(ctx,x+6,y-8,24,6,'#4b6655');}
    rect(ctx,0,groundY,width,height-groundY,'#6b5842');rect(ctx,0,groundY,width,6,'#3d5941');rect(ctx,0,groundY+4,width,8,'#69834f');rect(ctx,0,groundY+12,width,4,'#4d4d36');
    for(let x=-snap(camera)%32;x<width;x+=32)for(let y=groundY+24;y<height;y+=32){rect(ctx,x,y,8,4,'#87704d');rect(ctx,x+16,y+16,4,4,'#554732');}
  }
  function band(ctx,b,time=0,camera=0,r=30,maxCharge=3){
    if(!b.active)return;const x=b.x-camera,y=b.y,charge=b.charge/maxCharge,colors={air:'#c7f3f1',fire:charge>.6?'#a6ddff':'#ffbc7c',water:charge>.6?'#d5fff7':'#86d5f4',earth:'#e1ba80',light:'#fff1a1'},color=colors[b.element]||colors.air;
    // Shade a transparent sphere on the same 2px grid as the rest of the game.
    // The rim catches more light than the center; the lower hemisphere stays shaded.
    const alpha=a=>Math.round(Math.max(0,Math.min(1,a))*255).toString(16).padStart(2,'0');
    circle(ctx,x+2,y+4,r+2,null,'#0b202b66',2);
    circle(ctx,x,y,r+6,null,color+'0c',4);circle(ctx,x,y,r+2,null,color+'28',2);
    for(let yy=-r;yy<r;yy+=2)for(let xx=-r;xx<r;xx+=2){
      const nx=(xx+1)/r,ny=(yy+1)/r,d=nx*nx+ny*ny;if(d>1)continue;
      const z=Math.sqrt(1-d),rim=(1-z)**2,light=Math.max(0,-nx*.45-ny*.55+z*.6);
      rect(ctx,x+xx,y+yy,2,2,color+alpha(.055+rim*.48+light*.11));
      if(ny>.1)rect(ctx,x+xx,y+yy,2,2,'#173e54'+alpha((ny-.1)*.25*(1-rim)));
    }
    circle(ctx,x,y,r,null,color+'ad',2);
    const arc=(start,end,radius,shade)=>{let last=null;for(let a=start;a<=end+.01;a+=.12){const p=[x+Math.cos(a)*radius,y+Math.sin(a)*radius];if(last)line(ctx,...last,...p,shade,2);last=p;}};
    arc(Math.PI*1.08,Math.PI*1.69,r-4,'#f4ffffdc');
    arc(Math.PI*1.1,Math.PI*1.46,r-8,'#ecffff60');
    arc(.12,1.25,r-4,color+'99');
    rect(ctx,x-r*.42,y-r*.58,Math.max(2,r*.18),Math.max(2,r*.12),'#ffffffdd');
    rect(ctx,x-r*.22,y-r*.65,2,2,'#ffffffa0');
    const age=Number.isFinite(b.createdAt)?time-b.createdAt:Infinity;
    if(age>=0&&age<.32){const t=age/.32;circle(ctx,x,y,r+4+t*12,null,color+alpha((1-t)*.65),2);}
    line(ctx,x+b.direction*(r+8),y,x+b.direction*(r+18),y,color,2);line(ctx,x+b.direction*(r+18),y,x+b.direction*(r+14),y-4,color,2);
    if(b.charging)for(let i=0;i<Math.floor(charge*28);i++){const a=-Math.PI/2+i*Math.PI*2/28;rect(ctx,x+Math.cos(a)*(r+10),y+Math.sin(a)*(r+10),4,4,color);}
  }
  function preview(ctx,kind,w,h){
    ctx.imageSmoothingEnabled=false;ctx.save();ctx.scale(w/420,h/220);landscape(ctx,{width:420,height:220,groundY:184,camera:0});
    if(kind==='test'){tile(ctx,'fire',100,116,40,40,1);tile(ctx,'water',180,116,40,40,1);tile(ctx,'earth',260,144,40,40,1);tile(ctx,'light',340,116,40,40,1);}
    else if(kind==='basic'){tile(ctx,'fire',125,120,40,40,1);tile(ctx,'water',205,120,40,40,1);tile(ctx,'earth',285,144,40,40);tile(ctx,'light',350,104,40,40,1);band(ctx,{active:true,x:100,y:132,direction:1,charge:0,element:'fire'},0,0,18,3);line(ctx,114,132,175,132,'#f8edb3',2);line(ctx,175,132,168,126,'#f8edb3',2);}
    else{rect(ctx,0,0,420,184,'#2b4244');monster(ctx,{x:175,y:100,hp:1},0);circle(ctx,205,131,55,null,'#8a9e88',2);}
    player(ctx,{x:50,y:136,w:30,h:48,face:1,vx:0,grounded:true},{time:0,band:kind==='basic'?{active:true,x:100,y:132}:null});ctx.restore();
  }
  const api={C,snap,rect,line,circle,frame,staffPose,player,tile,monster,object,enemyProjectile,landscape,band,preview};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.AirbandPixel=api;
})(typeof globalThis!=='undefined'?globalThis:this);
