import{readdirSync as R,readFileSync as F,writeFileSync as W,mkdirSync as M,statSync as S}from'node:fs';
const e=process.env,I=e.MAKEFUN_INPUT_DIR||'/input',O=e.MAKEFUN_OUTPUT_DIR||'/output',T=" 1a$&*+/        )))))))%)))%))) )))             @DD@            %(              $$!$",H=[(x,y)=>x+y,(x,y)=>x-y,Math.imul,(x,y)=>(x/y)|0,(x,y)=>x%y,(x,y)=>Math.floor((x>>>0)/(y>>>0)),(x,y)=>(x>>>0)%(y>>>0),0,(x,y)=>x&y,(x,y)=>x|y,(x,y)=>x^y,0,(x,y)=>x<<(y&31),(x,y)=>x>>(y&31),(x,y)=>x>>>(y&31),0,(x,y)=>x===y?1:0,(x,y)=>x<y?1:0,(x,y)=>(x>>>0)<(y>>>0)?1:0];
for(const d of R(I)){
 if(!S(I+'/'+d).isDirectory())continue;
 const p=F(I+'/'+d+'/program.bin'),q=F(I+'/'+d+'/input.bin'),D=new Int32Array(256),C=new Int32Array(64),Y=new Int32Array(256),o=new Uint8Array(65536);
 let s=0,c=0,pc=0,n=0,ip=0,l=0,e=-1;
 while(e<0){
  if(n===1e6)e=10;
  else if(pc<0||pc>=p.length)e=9;
  else{
   const b=p[pc];
   if((T[b]||' ')===' '&&b&&b!==52)e=5;
   else{
    const t=T.charCodeAt(b)-32,im=t>>4,po=(t>>2)&3,pu=t&3;
    if(pc+im>=p.length)e=9;
    else{
     n++;
     if(s<po)e=2;
     else if(s-po+pu>256)e=3;
     else{
      pc+=1+im;
      switch(b){
       case 0:e=0;break;
       case 1:D[s++]=p[pc-1]<<24>>24;break;
       case 2:D[s++]=p[pc-4]|p[pc-3]<<8|p[pc-2]<<16|p[pc-1]<<24;break;
       case 3:s--;break;
       case 4:D[s]=D[s-1];s++;break;
       case 5:[D[s-1],D[s-2]]=[D[s-2],D[s-1]];break;
       case 6:D[s]=D[s-2];s++;break;
       case 7:[D[s-3],D[s-2],D[s-1]]=[D[s-2],D[s-1],D[s-3]];break;
       case 0x17:D[s-1]=-D[s-1];break;
       case 0x1b:D[s-1]=~D[s-1];break;
       case 0x30:case 0x31:case 0x32:{
        const r=(p[pc-2]|p[pc-1]<<8)<<16>>16;
        if(b===0x30||(b===0x31)===(D[--s]===0))pc+=r;
        break;}
       case 0x33:
        if(c===64)e=7;else{C[c++]=pc;pc=p[pc-2]|p[pc-1]<<8;}
        break;
       case 0x34:
        if(c===0)e=8;else pc=C[--c];
        break;
       case 0x40:if(D[s-1]>>>0>255)e=6;else D[s-1]=Y[D[s-1]];break;
       case 0x41:if(D[s-1]>>>0>255)e=6;else{Y[D[s-1]]=D[s-2];s-=2;}break;
       case 0x50:{const g=D[s-1]+'';if(l+g.length>65536)e=11;else{o.set(Buffer.from(g),l);l+=g.length;s--;}break;}
       case 0x51:
        if(l>=65536)e=11;else o[l++]=D[--s]&255;
        break;
       case 0x52:D[s++]=ip<q.length?q[ip++]:-1;break;
       case 0x53:e=D[--s]&255;break;
       default:{const y=D[s-1],x=D[s-2];if(y===0&&b>0x12&&b<0x17)e=4;else{s-=2;D[s++]=H[b-16](x,y);}break;}
      }
     }
    }
   }
  }
 }
 M(O+'/'+d,{recursive:true});
 W(O+'/'+d+'/stdout.bin',o.subarray(0,l));
 W(O+'/'+d+'/exit.txt',e+'\n');
}
