"use strict";
// Change this name to personalize the animation.
const phrase = "Ashyy";
const canvas = document.getElementById("heart");
const ctx = canvas.getContext("2d");
const reduced = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };
const polygon = Array.from({length:720}, (_,i) => {
  const a = 2*Math.PI*i/720;
  return [16*Math.sin(a)**3*21,(13*Math.cos(a)-5*Math.cos(2*a)-2*Math.cos(3*a)-Math.cos(4*a))*21+20];
});
function spans(y) {
  const xs=[];
  polygon.forEach(([x1,y1],i)=>{
    const [x2,y2]=polygon[(i+1)%polygon.length];
    if ((y1<=y && y<y2)||(y2<=y && y<y1)) xs.push(x1+(y-y1)*(x2-x1)/(y2-y1));
  });
  xs.sort((a,b)=>a-b);
  return xs.reduce((out,x,i)=>{if(i%2===0)out.push([x,xs[i+1]]);return out;},[]);
}
const points=[];
const top=Math.max(...polygon.map(p=>p[1]));
const bottom=Math.min(...polygon.map(p=>p[1]));
for(let y=top-12;y>bottom+12;y-=23){
  for(const a of spans(y+11))for(const b of spans(y-11)){
    const left=Math.max(a[0],b[0])+4, right=Math.min(a[1],b[1])-4;
    let x=left;
    const row=[];
    while(true){
      const size=12+Math.floor(Math.random()*5);
      ctx.font=`bold ${size}px Arial`;
      const width=ctx.measureText(phrase).width;
      if(x+width>right)break;
      row.push({x:x+width/2,y,size,width,drift:Math.random()*20-10});
      x+=width+7;
    }
    const last=row[row.length-1];
    const extra=last?right-(last.x+last.width/2):0;
    row.forEach((p,i)=>{
      p.x=row.length===1?(left+right)/2:p.x+extra*i/(row.length-1);
      p.edge=i===0||i===row.length-1;
      p.color=[p.edge?250:185+Math.random()*55,12+Math.random()*14,35+Math.random()*15];
      points.push(p);
    });
  }
}
points.sort((a,b)=>{
  if(a.edge!==b.edge)return a.edge?-1:1;
  return a.edge?Math.atan2(a.x,a.y)-Math.atan2(b.x,b.y):Math.hypot(b.x,b.y)-Math.hypot(a.x,a.y);
});
let start,frame;
function draw(now){
  if(start===undefined)start=now;
  const elapsed=reduced.matches?12000:now-start+120;
  ctx.fillStyle="#060208";
  ctx.fillRect(0,0,800,800);
  ctx.textAlign="center";ctx.textBaseline="middle";
  points.forEach((p,i)=>{
    const u=Math.max(0,Math.min(1,(elapsed-i/points.length*10000)/672));
    if(u===0)return;
    const ease=1-(1-u)**3;
    const flash=Math.sin(Math.PI*Math.max(0,(u-0.55)/0.45))*0.65;
    const shimmer=elapsed>11000&&!reduced.matches?Math.max(0,Math.sin(now/400+i*3.7)-0.97)*12:0;
    const color=p.color.map((c,j)=>Math.round(c+((j===0?255:200)-c)*Math.max(flash,shimmer)));
    ctx.font=`bold ${p.size}px Arial`;
    ctx.globalAlpha=ease;
    ctx.shadowColor=`rgb(${color.join(",")})`;ctx.shadowBlur=4;
    ctx.fillStyle=`rgb(${color.join(",")})`;
    ctx.fillText(phrase,400+p.x+p.drift*(1-ease),400-p.y-34*(1-ease));
  });
  ctx.globalAlpha=1;ctx.shadowBlur=0;
  if(!reduced.matches)frame=requestAnimationFrame(draw);
}
function replay(){cancelAnimationFrame(frame);start=undefined;frame=requestAnimationFrame(draw);}
document.getElementById("replay").addEventListener("click",replay);
if (reduced.addEventListener) reduced.addEventListener("change", replay);
else if (reduced.addListener) reduced.addListener(replay);
replay();
