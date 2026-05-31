import{
  CELL,COLS,ROWS,W,H,R,D,L,U,DIRS,dir0,
  WALL,DOT,PELLET,EMPTY,DOOR,
  SCATTER,CHASE,FRIGHTENED,EATEN,HOUSE,
  SPEED_PAC,SPEED_GHOST,SPEED_FRIGHT,SPEED_EATEN,
  FRIGHT_DURATION,FRIGHT_FLASH,MAZE_DEF,
  isAlignedAt,canWalkAt,canWalkGhostAt,pickMoveToward
}from'./core.mjs';

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  AUDIO  (Web Audio API - synthetic)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const audio={
  ctx:null,chomping:false,
  init(){
    if(!this.ctx) this.ctx=new(window.AudioContext||window.webkitAudioContext)();
  },
  tone(freq,dur,type='square',vol=0.2,t=0){
    if(!this.ctx)return;
    const o=this.ctx.createOscillator(),g=this.ctx.createGain();
    o.connect(g);g.connect(this.ctx.destination);
    o.type=type;o.frequency.value=freq;
    const now=this.ctx.currentTime+t;
    g.gain.setValueAtTime(vol,now);
    g.gain.exponentialRampToValueAtTime(0.001,now+dur);
    o.start(now);o.stop(now+dur+0.01);
  },
  waka(){
    this.init();
    this.chomping=!this.chomping;
    this.tone(this.chomping?700:500,0.07,'square',0.12);
  },
  pellet(){
    this.init();
    this.tone(200,0.25,'sawtooth',0.18);
    this.tone(150,0.25,'sine',0.12,0.1);
  },
  eatGhost(n){
    this.init();
    const f=[440,880,1320,1760][n%4];
    this.tone(f,0.06,'square',0.25);
    this.tone(f*1.5,0.06,'square',0.2,0.07);
  },
  death(){
    this.init();
    [800,700,600,500,400,300,200,150].forEach((f,i)=>{
      this.tone(f,0.1,'sawtooth',0.22,i*0.08);
    });
  },
  levelUp(){
    this.init();
    [330,392,494,659,784].forEach((f,i)=>{
      this.tone(f,0.12,'triangle',0.2,i*0.1);
    });
  },
  start(){
    this.init();
    [220,294,370,440,370,294,440].forEach((f,i)=>{
      this.tone(f,0.15,'square',0.15,i*0.1);
    });
  }
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  ENTITY BASE
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
class Entity{
  constructor(col,row){
    this.x=col*CELL+CELL/2;
    this.y=row*CELL+CELL/2;
    this.dir=dir0();
    this.speed=2;
  }
  get tileCol(){return Math.round((this.x-CELL/2)/CELL);}
  get tileRow(){return Math.round((this.y-CELL/2)/CELL);}
  get alignedX(){return this.tileCol*CELL+CELL/2;}
  get alignedY(){return this.tileRow*CELL+CELL/2;}
  get aligned(){return isAlignedAt(this.x,this.y,this.speed);}
  canWalk(col,row,door=false){
    return canWalkAt(col,row,{door});
  }
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  PAC-MAN
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
class Pacman extends Entity{
  constructor(){
    super(13,29);
    this.dir={...L};
    this.nextDir={...L};
    this.mouth=0; this.mouthSpd=1;
    this.lives=3;
    this.speed=SPEED_PAC;
    this.dying=false; this.deathProg=0;
  }
  reset(){
    this.x=13*CELL+CELL/2; this.y=29*CELL+CELL/2;
    this.dir={...L}; this.nextDir={...L};
    this.mouth=0; this.mouthSpd=1;
    this.dying=false; this.deathProg=0;
  }
  update(){
    if(this.dying){
      this.deathProg=Math.min(1,this.deathProg+0.025);
      return;
    }
    if(this.aligned){
      this.x=this.alignedX; this.y=this.alignedY;
      const nd=this.nextDir;
      if(nd.dx!==0||nd.dy!==0){
        if(this.canWalk(this.tileCol+nd.dx,this.tileRow+nd.dy))
          this.dir={...nd};
      }
    }
    const cd=this.dir;
    if(cd.dx===0&&cd.dy===0)return;
    if(this.aligned&&!this.canWalk(this.tileCol+cd.dx,this.tileRow+cd.dy))return;
    this.x+=cd.dx*this.speed;
    this.y+=cd.dy*this.speed;
    if(this.x<0)this.x+=W;
    if(this.x>=W)this.x-=W;
    // Animate mouth
    this.mouth+=this.mouthSpd*0.12;
    if(this.mouth>=1){this.mouth=1;this.mouthSpd=-1;}
    if(this.mouth<=0){this.mouth=0;this.mouthSpd=1;}
  }
  draw(ctx){
    const r=CELL*0.46;
    ctx.save();
    ctx.translate(this.x,this.y);
    if(this.dying){
      const p=this.deathProg;
      const openAngle=Math.PI*(p<0.5?p*2:1);
      ctx.rotate(this.dir.angle||0);
      ctx.shadowColor='#FFE000';ctx.shadowBlur=20;
      ctx.fillStyle=`rgba(255,224,0,${1-p*0.8})`;
      const sr=r*(1-p*0.4);
      ctx.beginPath();
      ctx.moveTo(0,0);
      ctx.arc(0,0,sr,openAngle,-openAngle,true);
      ctx.closePath();ctx.fill();
    }else{
      const a=this.dir.angle||0;
      ctx.rotate(a);
      const mAngle=this.mouth*0.35;
      ctx.shadowColor='#FFE000';ctx.shadowBlur=18;
      ctx.fillStyle='#FFE000';
      ctx.beginPath();
      ctx.moveTo(0,0);
      ctx.arc(0,0,r,mAngle,Math.PI*2-mAngle);
      ctx.closePath();ctx.fill();
      // Eye
      ctx.fillStyle='#000';
      ctx.beginPath();ctx.arc(r*0.25,-r*0.55,r*0.13,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
  }
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  GHOST
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
class Ghost extends Entity{
  constructor(col,row,color,name,sCol,sRow,exitDelay){
    super(col,row);
    this.startCol=col;this.startRow=row;
    this.color=color;this.name=name;
    this.scatterCol=sCol;this.scatterRow=sRow;
    this.exitDelay=exitDelay;
    this.mode=HOUSE;
    this.frightTimer=0;
    this.eatScore=200;
    this.speed=SPEED_GHOST;
    this.dir={...U};
    this.exitTimer=exitDelay;
  }
  reset(){
    this.x=this.startCol*CELL+CELL/2;
    this.y=this.startRow*CELL+CELL/2;
    this.mode=HOUSE;
    this.frightTimer=0;
    this.speed=SPEED_GHOST;
    this.dir={...U};
    this.exitTimer=this.exitDelay;
  }
  frighten(){
    if(this.mode===EATEN)return;
    this.mode=FRIGHTENED;
    this.frightTimer=FRIGHT_DURATION;
    this.speed=SPEED_FRIGHT;
    // Reverse direction
    const od=DIRS.find(d=>d.dx===-this.dir.dx&&d.dy===-this.dir.dy);
    if(od)this.dir={...od};
  }
  eatMe(){
    this.mode=EATEN;
    this.speed=SPEED_EATEN;
    this.frightTimer=0;
  }
  update(pac,ghosts,dt){
    if(this.mode===EATEN){
      const homeX=13*CELL+CELL/2;
      const homeY=14*CELL+CELL/2;
      if(Math.abs(this.x-homeX)<CELL&&Math.abs(this.y-homeY)<CELL){
        this.x=homeX;
        this.y=homeY;
        this.mode=HOUSE;
        this.exitTimer=1500;
        this.speed=SPEED_GHOST;
        this.dir={...U};
        return;
      }
      if(this.aligned){
        this.x=this.alignedX;
        this.y=this.alignedY;
        this.moveToward({col:13,row:14});
      }
      const enc=this.tileCol+this.dir.dx;
      const enr=this.tileRow+this.dir.dy;
      if(this.aligned&&!this.canWalkGhost(enc,enr)){
        this.moveToward({col:13,row:14});
        return;
      }
      this.x+=this.dir.dx*this.speed;
      this.y+=this.dir.dy*this.speed;
      if(this.x<0)this.x+=W;
      if(this.x>=W)this.x-=W;
      return;
    }
    if(this.mode===FRIGHTENED){
      this.frightTimer-=dt;
      if(this.frightTimer<=0){
        this.mode=SCATTER;
        this.speed=SPEED_GHOST;
      }
    }
    if(this.mode===HOUSE){
      this.updateHouse(dt);
      return;
    }
    if(this.aligned){
      this.x=this.alignedX;
      this.y=this.alignedY;
      this.pickDir(pac,ghosts);
    }
    const nc=this.tileCol+this.dir.dx;
    const nr=this.tileRow+this.dir.dy;
    if(this.aligned&&!this.canWalkGhost(nc,nr)){
      this.pickDir(pac,ghosts);
      return;
    }
    this.x+=this.dir.dx*this.speed;
    this.y+=this.dir.dy*this.speed;
    if(this.x<0)this.x+=W;
    if(this.x>=W)this.x-=W;
  }
  updateHouse(dt){
    this.exitTimer=Math.max(0,this.exitTimer-dt);

    if(this.exitTimer>0){
      if(this.aligned){
        this.x=this.alignedX;
        this.y=this.alignedY;
        if(this.tileRow<=13)this.dir={...D};
        if(this.tileRow>=15)this.dir={...U};
      }
      this.y+=this.dir.dy*this.speed*0.6;
      return;
    }

    this.x=this.alignedX;
    this.y=this.alignedY;

    const col=this.tileCol;
    const row=this.tileRow;

    if(col===13&&row===11){
      this.mode=SCATTER;
      this.speed=SPEED_GHOST;
      this.dir={...L};
      return;
    }

    if(col!==13){
      this.dir=col<13?{...R}:{...L};
    }else{
      this.dir={...U};
    }

    const nc=this.tileCol+this.dir.dx;
    const nr=this.tileRow+this.dir.dy;
    const cell=MAZE_DEF[nr]?.[((nc%COLS)+COLS)%COLS];
    if(cell===WALL)return;
    this.x+=this.dir.dx*this.speed;
    this.y+=this.dir.dy*this.speed;
  }
  canWalkGhost(col,row){
    return canWalkGhostAt(this.mode,col,row);
  }
  pickDir(pac,ghosts){
    if(this.mode===FRIGHTENED){
      const avail=DIRS.filter(d=>{
        if(d.dx===-this.dir.dx&&d.dy===-this.dir.dy)return false;
        return this.canWalkGhost(this.tileCol+d.dx,this.tileRow+d.dy);
      });
      if(avail.length)this.dir={...avail[Math.floor(Math.random()*avail.length)]};
      return;
    }
    this.moveToward(this.getTarget(pac,ghosts));
  }
  moveToward(target){
    const next=pickMoveToward(
      this.tileCol,this.tileRow,this.dir,target,
      (c,r)=>this.canWalkGhost(c,r)
    );
    if(next)this.dir=next;
  }
  getTarget(pac,ghosts){
    if(this.mode===SCATTER)return{col:this.scatterCol,row:this.scatterRow};
    const pc={col:pac.tileCol,row:pac.tileRow},pd=pac.dir;
    switch(this.name){
      case'blinky':return pc;
      case'pinky':return{col:pc.col+pd.dx*4,row:pc.row+pd.dy*4};
      case'inky':{
        const blinky=ghosts.find(g=>g.name==='blinky');
        const piv={col:pc.col+pd.dx*2,row:pc.row+pd.dy*2};
        if(!blinky)return pc;
        return{col:piv.col*2-blinky.tileCol,row:piv.row*2-blinky.tileRow};
      }
      case'clyde':{
        const d=Math.hypot(this.tileCol-pc.col,this.tileRow-pc.row);
        return d>8?pc:{col:this.scatterCol,row:this.scatterRow};
      }
    }
    return pc;
  }
  get flashing(){return this.mode===FRIGHTENED&&this.frightTimer<FRIGHT_FLASH;}
  draw(ctx,t){
    const r=CELL*0.44;
    const {x,y}=this;
    let bodyColor=this.color;
    if(this.mode===FRIGHTENED){
      bodyColor=this.flashing&&Math.floor(t/220)%2?'#ffffff':'#0033ff';
    }else if(this.mode===EATEN){
      this._drawEyes(ctx,x,y,r);return;
    }
    ctx.save();
    ctx.shadowColor=bodyColor;ctx.shadowBlur=14;
    ctx.fillStyle=bodyColor;
    // Ghost body
    const bR=r/3;
    ctx.beginPath();
    ctx.arc(x,y,r,Math.PI,0,false);
    ctx.lineTo(x+r,y+r*0.9);
    ctx.arc(x+r-bR, y+r*0.9,bR,0,Math.PI,false);
    ctx.arc(x,      y+r*0.9,bR,0,Math.PI,false);
    ctx.arc(x-r+bR, y+r*0.9,bR,0,Math.PI,false);
    ctx.lineTo(x-r,y);
    ctx.closePath();ctx.fill();
    ctx.restore();
    if(this.mode!==FRIGHTENED){
      this._drawEyes(ctx,x,y,r);
    }else{
      this._drawScaredFace(ctx,x,y,r,bodyColor,t);
    }
  }
  _drawEyes(ctx,x,y,r){
    const eR=r*0.26,pR=r*0.16;
    const lx=x-r*0.35,rx2=x+r*0.35,ey=y-r*0.1;
    ctx.fillStyle='white';
    ctx.beginPath();ctx.ellipse(lx,ey,eR,eR*1.3,0,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.ellipse(rx2,ey,eR,eR*1.3,0,0,Math.PI*2);ctx.fill();
    const pd=this.dir;
    ctx.fillStyle=this.mode===EATEN?'#00BFFF':'#0022BB';
    ctx.beginPath();ctx.arc(lx+pd.dx*pR*0.6,ey+pd.dy*pR*0.6,pR,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(rx2+pd.dx*pR*0.6,ey+pd.dy*pR*0.6,pR,0,Math.PI*2);ctx.fill();
  }
  _drawScaredFace(ctx,x,y,r,col,t){
    const flash=this.flashing&&Math.floor(t/220)%2;
    const fc=flash?col:'white';
    ctx.fillStyle=fc;
    ctx.beginPath();ctx.arc(x-r*0.35,y-r*0.1,r*0.09,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(x+r*0.35,y-r*0.1,r*0.09,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle=fc;ctx.lineWidth=1.5;ctx.lineJoin='round';
    ctx.beginPath();
    ctx.moveTo(x-r*0.45,y+r*0.35);
    ctx.lineTo(x-r*0.22,y+r*0.2);
    ctx.lineTo(x,y+r*0.35);
    ctx.lineTo(x+r*0.22,y+r*0.2);
    ctx.lineTo(x+r*0.45,y+r*0.35);
    ctx.stroke();
  }
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  RENDERER
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const canvas=document.getElementById('canvas');
const ctx=canvas.getContext('2d');
canvas.width=W;canvas.height=H;

// Pre-compute wall pixel art â€” build offscreen canvas for walls (static)
const wallCanvas=document.createElement('canvas');
wallCanvas.width=W;wallCanvas.height=H;
const wctx=wallCanvas.getContext('2d');

function buildWallCache(){
  wctx.fillStyle='#000820';
  wctx.fillRect(0,0,W,H);
  // Dark fill for walls
  wctx.fillStyle='#00112a';
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)
    if(MAZE_DEF[r][c]===WALL)wctx.fillRect(c*CELL,r*CELL,CELL,CELL);
  // Neon edges
  const isWall=(r,c)=>{
    if(r<0||r>=ROWS||c<0||c>=COLS)return false;
    return MAZE_DEF[r][c]===WALL;
  };
  const isCorridor=(r,c)=>!isWall(r,c);
  wctx.shadowColor='#55AAFF';wctx.shadowBlur=7;
  wctx.fillStyle='#3399FF';
  for(let r=0;r<ROWS;r++){
    for(let c=0;c<COLS;c++){
      if(!isWall(r,c))continue;
      const x=c*CELL,y=r*CELL,t=2;
      if(isCorridor(r-1,c))wctx.fillRect(x,y,CELL,t);
      if(isCorridor(r+1,c))wctx.fillRect(x,y+CELL-t,CELL,t);
      if(isCorridor(r,c-1))wctx.fillRect(x,y,t,CELL);
      if(isCorridor(r,c+1))wctx.fillRect(x+CELL-t,y,t,CELL);
    }
  }
  wctx.shadowBlur=0;
}
buildWallCache();

let maze=[];

function drawFrame(ts){
  ctx.clearRect(0,0,W,H);
  ctx.drawImage(wallCanvas,0,0);

  // Dots & pellets
  for(let r=0;r<ROWS;r++){
    for(let c=0;c<COLS;c++){
      const t=maze[r][c];
      if(t!==DOT&&t!==PELLET&&t!==DOOR)continue;
      const px=c*CELL+CELL/2,py=r*CELL+CELL/2;
      if(t===DOT){
        ctx.fillStyle='#DDCCAA';
        ctx.beginPath();ctx.arc(px,py,2,0,Math.PI*2);ctx.fill();
      }else if(t===PELLET){
        const sz=4.5+Math.sin(ts*0.006)*1.5;
        ctx.save();
        ctx.shadowColor='#FFD700';ctx.shadowBlur=12;
        ctx.fillStyle='#FFD700';
        ctx.beginPath();ctx.arc(px,py,sz,0,Math.PI*2);ctx.fill();
        ctx.restore();
      }else if(t===DOOR){
        ctx.fillStyle='#FF88FF';
        ctx.fillRect(c*CELL+1,r*CELL+CELL/2-1.5,CELL-2,3);
      }
    }
  }
}

function drawLives(){
  const row=document.getElementById('lives-row');
  row.replaceChildren();
  for(let i=0;i<pacman.lives;i++){
    const c=document.createElement('canvas');
    c.width=18;c.height=18;
    const cx=c.getContext('2d');
    cx.save();cx.translate(9,9);
    cx.shadowColor='#FFE000';cx.shadowBlur=8;cx.fillStyle='#FFE000';
    cx.beginPath();cx.moveTo(0,0);cx.arc(0,0,7,0.4,Math.PI*2-0.4);cx.closePath();cx.fill();
    cx.restore();
    row.appendChild(c);
  }
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  SCORE POPUPS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const popups=[];
function addPopup(x,y,text,color='#ffffff'){
  popups.push({x,y,text,color,life:1});
}
function updatePopups(dt){
  for(let i=popups.length-1;i>=0;i--){
    popups[i].life-=dt/800;
    popups[i].y-=0.5;
    if(popups[i].life<=0)popups.splice(i,1);
  }
}
function drawPopups(){
  for(const p of popups){
    ctx.save();
    ctx.globalAlpha=Math.max(0,p.life);
    ctx.fillStyle=p.color;
    ctx.shadowColor=p.color;ctx.shadowBlur=6;
    ctx.font='7px monospace';
    ctx.textAlign='center';
    ctx.fillText(p.text,p.x,p.y);
    ctx.restore();
  }
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  OVERLAYS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function drawOverlay(state,ts){
  if(state==='title'){
    ctx.fillStyle='rgba(0,8,32,0.82)';ctx.fillRect(0,0,W,H);
    // Pac-Man logo with glow
    const tx=W/2,ty=H/2;
    ctx.textAlign='center';
    ctx.font='22px monospace';
    ctx.shadowColor='#FFE000';ctx.shadowBlur=24;
    ctx.fillStyle='#FFE000';ctx.fillText('PAC-MAN',tx,ty-50);
    ctx.shadowBlur=0;
    ctx.fillStyle='#aaa';ctx.font='8px monospace';
    ctx.fillText('PRESS SPACE / TAP',tx,ty+10);
    ctx.fillText('TO START',tx,ty+30);
    ctx.fillStyle='#0ff';
    ctx.fillText('ZQSD / FLECHES / D-PAD',tx,ty+60);
    ctx.fillStyle='#888';ctx.font='6px monospace';
    ctx.fillText('CLIQUEZ LE JEU PUIS JOUEZ',tx,ty+78);
    ctx.fillStyle='rgba(255,100,100,0.8)';ctx.font='6px monospace';
    ctx.fillText('â”€â”€â”€ GHOST RULES â”€â”€â”€',tx,ty+90);
    const g=['â— FantÃ´mes = danger','â— Pastilles = invincible!','â— FantÃ´mes bleus = +200pts'];
    g.forEach((t,i)=>{ctx.fillStyle='#ccc';ctx.fillText(t,tx,ty+108+i*14);});
  }
  if(state==='ready'){
    ctx.textAlign='center';
    ctx.font='14px monospace';
    ctx.shadowColor='#ffff00';ctx.shadowBlur=16;
    ctx.fillStyle='#ffff00';
    ctx.fillText('READY!',W/2,H/2+30);
    ctx.shadowBlur=0;
  }
  if(state==='dying'){
    // nothing extra â€” pac-man draws his own death anim
  }
  if(state==='levelComplete'){
    const flash=Math.floor(ts/300)%2;
    ctx.fillStyle='rgba(0,8,32,0.5)';ctx.fillRect(0,0,W,H);
    ctx.textAlign='center';
    ctx.font='14px monospace';
    ctx.shadowColor='#00ff88';ctx.shadowBlur=20;
    ctx.fillStyle=flash?'#00ff88':'#ffffff';
    ctx.fillText('LEVEL CLEAR!',W/2,H/2);
    ctx.shadowBlur=0;
  }
  if(state==='gameOver'){
    ctx.fillStyle='rgba(0,8,32,0.85)';ctx.fillRect(0,0,W,H);
    ctx.textAlign='center';
    ctx.font='18px monospace';
    ctx.shadowColor='#ff2244';ctx.shadowBlur=22;
    ctx.fillStyle='#ff2244';ctx.fillText('GAME OVER',W/2,H/2-50);
    ctx.shadowBlur=0;
    ctx.fillStyle='#fff';ctx.font='9px monospace';
    ctx.fillText(`SCORE: ${game.score}`,W/2,H/2-10);
    ctx.fillStyle='#0ff';
    ctx.fillText(`BEST:  ${game.hiScore}`,W/2,H/2+12);
    ctx.fillStyle='#aaa';ctx.font='7px monospace';
    ctx.fillText('SPACE / TAP TO RETRY',W/2,H/2+50);
  }
  if(state==='paused'){
    ctx.fillStyle='rgba(0,8,32,0.7)';ctx.fillRect(0,0,W,H);
    ctx.textAlign='center';
    ctx.font='14px monospace';
    ctx.shadowColor='#fff';ctx.shadowBlur=10;
    ctx.fillStyle='#fff';ctx.fillText('PAUSED',W/2,H/2);
    ctx.shadowBlur=0;
    ctx.fillStyle='#aaa';ctx.font='7px monospace';
    ctx.fillText('SPACE TO RESUME',W/2,H/2+25);
  }
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  GAME STATE
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
let pacman,ghosts;

const game={
  state:'title',
  score:0,
  hiScore:(()=>{try{return Number(localStorage.getItem('pacmanHi'))||0;}catch{return 0;}})(),
  level:1,
  dotsLeft:0,
  totalDots:0,
  modeTimer:0,
  modeIdx:0,
  // scatter/chase durations in ms: [scatter, chase, scatter, chase, scatter, chase, ...]
  modeCycle:[7000,20000,7000,20000,5000,20000,5000,1e9],
  ghostEatStreak:0,
  readyTimer:0,
  levelFlashTimer:0,
  lastTime:0,

  init(){
    pacman=new Pacman();
    ghosts=[
      new Ghost(13,11,'#FF2222','blinky',25,0,0),
      new Ghost(13,14,'#FFB8FF','pinky',  2,0,2500),
      new Ghost(11,14,'#00FFFF','inky',  27,30,5000),
      new Ghost(15,14,'#FFB852','clyde',  0,30,8000),
    ];
    // Blinky starts outside house
    ghosts[0].mode=SCATTER;
    this.score=0;
    this.level=1;
    this.resetLevel();
    this.state='title';
    this.updateHUD();
  },

  resetLevel(){
    maze=MAZE_DEF.map(r=>[...r]);
    this.totalDots=0;this.dotsLeft=0;
    for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)
      if(maze[r][c]===DOT||maze[r][c]===PELLET)this.totalDots++;
    this.dotsLeft=this.totalDots;
    pacman.reset();
    ghosts.forEach(g=>g.reset());
    // Blinky outside
    ghosts[0].mode=SCATTER;
    ghosts[0].x=13*CELL+CELL/2;
    ghosts[0].y=11*CELL+CELL/2;
    ghosts[0].dir={...L};
    this.modeTimer=0;this.modeIdx=0;
    this.ghostEatStreak=0;
    this.readyTimer=2500;
    this.state='ready';
    drawLives();
    this.updateHUD();
  },

  startGame(){
    audio.start();
    this.score=0;this.level=1;
    this.resetLevel();
    focusGame();
  },

  eatDot(col,row){
    const t=maze[row][col];
    if(t!==DOT&&t!==PELLET)return;
    maze[row][col]=EMPTY;
    this.dotsLeft--;
    if(t===DOT){
      this.score+=10;audio.waka();
    }else{
      this.score+=50;audio.pellet();
      this.ghostEatStreak=0;
      ghosts.forEach(g=>g.frighten());
    }
    if(this.score>this.hiScore){
      this.hiScore=this.score;
      localStorage.setItem('pacmanHi',this.hiScore);
    }
    this.updateHUD();
    if(this.dotsLeft<=0){
      this.state='levelComplete';
      this.levelFlashTimer=3500;
      audio.levelUp();
    }
  },

  checkCollisions(){
    if(this.state!=='playing')return;
    for(const g of ghosts){
      const dx=g.x-pacman.x,dy=g.y-pacman.y;
      if(dx*dx+dy*dy<(CELL*0.72)**2){
        if(g.mode===FRIGHTENED){
          g.eatMe();
          this.ghostEatStreak++;
          const pts=200*Math.pow(2,this.ghostEatStreak-1);
          this.score+=pts;
          audio.eatGhost(this.ghostEatStreak-1);
          addPopup(g.x,g.y,pts+'',pts>=800?'#FFD700':'#ffffff');
          this.updateHUD();
        }else if(g.mode!==EATEN&&g.mode!==HOUSE){
          this.die();return;
        }
      }
    }
  },

  die(){
    this.state='dying';
    pacman.dying=true;
    audio.death();
    setTimeout(()=>{
      pacman.lives--;
      drawLives();
      if(pacman.lives<=0){
        this.state='gameOver';
        const ann=document.getElementById('announcer');
        if(ann)ann.textContent=`Game Over. Score ${this.score}`;
      }else{
        this.resetLevel();
      }
    },2200);
  },

  updateHUD(){
    document.getElementById('hud-score').textContent=this.score;
    document.getElementById('hud-hi').textContent=this.hiScore;
    document.getElementById('hud-level').textContent=this.level;
    const ann=document.getElementById('announcer');
    if(ann)ann.textContent=`Score ${this.score}, niveau ${this.level}`;
  },

  update(dt,_ts){
    pollHeldKeys();
    if(this.state==='ready'){
      this.readyTimer-=dt;
      if(this.readyTimer<=0){this.state='playing';}
      pacman.update();return;
    }
    if(this.state==='levelComplete'){
      this.levelFlashTimer-=dt;
      if(this.levelFlashTimer<=0){
        this.level++;this.resetLevel();
      }
      return;
    }
    if(this.state!=='playing'){
      if(this.state==='dying')pacman.update();
      return;
    }
    // Mode cycling
    this.modeTimer+=dt;
    const cycleDur=this.modeCycle[this.modeIdx]||1e9;
    if(this.modeTimer>=cycleDur){
      this.modeTimer=0;
      this.modeIdx=Math.min(this.modeIdx+1,this.modeCycle.length-1);
      ghosts.forEach(g=>{
        if(g.mode===SCATTER)g.mode=CHASE;
        else if(g.mode===CHASE)g.mode=SCATTER;
      });
    }
    pacman.update();
    ghosts.forEach(g=>g.update(pacman,ghosts,dt));
    updatePopups(dt);
    // Eat dot
    if(pacman.aligned){
      const tc=pacman.tileCol,tr=pacman.tileRow;
      if(tr>=0&&tr<ROWS&&tc>=0&&tc<COLS)this.eatDot(tc,tr);
    }
    this.checkCollisions();
  }
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  GAME LOOP
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
let lastTs=0;
let rafId=0;
function loop(ts){
  const dt=Math.min(ts-lastTs||0,50);
  lastTs=ts;
  game.update(dt,ts);
  drawFrame(ts);
  if(game.state!=='title'&&game.state!=='gameOver'){
    ghosts.forEach(g=>g.draw(ctx,ts));
    pacman.draw(ctx);
    drawPopups();
  }
  drawOverlay(game.state,ts);
  rafId=requestAnimationFrame(loop);
}
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){
    cancelAnimationFrame(rafId);
    lastTs=0;
  }else{
    rafId=requestAnimationFrame(loop);
  }
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  INPUT
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const KEY_DIR={
  ArrowLeft:L,KeyA:L,
  ArrowRight:R,KeyD:R,
  ArrowUp:U,KeyW:U,
  ArrowDown:D,KeyS:D,
};
const KEY_POLL_ORDER=['ArrowUp','KeyW','ArrowDown','KeyS','ArrowLeft','KeyA','ArrowRight','KeyD'];
const keysHeld=new Set();

function focusGame(){
  document.body.focus();
  canvas.focus();
}

function setDir(d){
  audio.init();
  if(game.state==='title'||game.state==='gameOver'){
    game.startGame();
    pacman.nextDir={...d};
    return;
  }
  if(game.state==='paused')game.state='playing';
  if(game.state==='playing'||game.state==='ready'||game.state==='dying')
    pacman.nextDir={...d};
}

function pollHeldKeys(){
  if(game.state==='title'||game.state==='gameOver'||game.state==='paused')return;
  for(const code of KEY_POLL_ORDER){
    if(keysHeld.has(code)){setDir(KEY_DIR[code]);return;}
  }
}

function onKeyDown(e){
  const d=KEY_DIR[e.code];
  if(d){
    keysHeld.add(e.code);
    setDir(d);
    e.preventDefault();
    return;
  }
  switch(e.code){
    case'Space':
      audio.init();
      if(game.state==='title'||game.state==='gameOver'){game.startGame();break;}
      if(game.state==='playing'){game.state='paused';break;}
      if(game.state==='paused'){game.state='playing';break;}
      e.preventDefault();
      break;
    case'Escape':
      if(game.state==='playing')game.state='paused';
      else if(game.state==='paused')game.state='playing';
      e.preventDefault();
      break;
  }
}

function onKeyUp(e){
  keysHeld.delete(e.code);
}

window.addEventListener('keydown',onKeyDown,true);
window.addEventListener('keyup',onKeyUp,true);
document.body.addEventListener('click',focusGame);

['up','down','left','right'].forEach(name=>{
  const el=document.getElementById(`dbtn-${name}`);
  const d={up:U,down:D,left:L,right:R}[name];
  const press=()=>{el.classList.add('pressed');setDir(d);};
  const release=()=>el.classList.remove('pressed');
  el.addEventListener('pointerdown',press);
  el.addEventListener('pointerup',release);
  el.addEventListener('pointercancel',release);
});

// Swipe
let swipeStart=null;
document.addEventListener('touchstart',e=>{
  swipeStart={x:e.touches[0].clientX,y:e.touches[0].clientY};
},{passive:true});
document.addEventListener('touchend',e=>{
  if(!swipeStart)return;
  const dx=e.changedTouches[0].clientX-swipeStart.x;
  const dy=e.changedTouches[0].clientY-swipeStart.y;
  swipeStart=null;
  if(Math.max(Math.abs(dx),Math.abs(dy))<30)return;
  if(Math.abs(dx)>Math.abs(dy))setDir(dx>0?R:L);
  else setDir(dy>0?D:U);
},{passive:true});

canvas.addEventListener('click',()=>{
  audio.init();
  focusGame();
  if(game.state==='title'||game.state==='gameOver')game.startGame();
  else if(game.state==='paused')game.state='playing';
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  PWA SERVICE WORKER
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('sw.js').catch(()=>{});
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  START
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
game.init();
drawLives();
requestAnimationFrame(loop);
