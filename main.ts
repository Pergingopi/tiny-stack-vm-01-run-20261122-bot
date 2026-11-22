// Tiny stack VM for make.fun's tiny-stack-vm-01 (ISA v1): a fresh, compact
// interpreter of the ISA in kit program/generator/subject/ISA.md. Values are
// 32-bit wrapping ints; data stack 256, call stack 64, memory 256 words.
// The T table packs each opcode's [immediate bytes, pops, pushes] as one
// char (code = imm*16 + pops*4 + pushes, offset by 32), verified against
// the reference VM's OPS table. Traps keep the output written so far.
// A stray non-directory entry in the input dir is skipped: without this,
// one stray file would throw while reading its program.bin and sink the
// whole run instead of just that entry.
import{readdirSync as R,readFileSync as F,writeFileSync as W,mkdirSync as M,statSync as S}from'node:fs';
import{join as J}from'node:path';
const I=process.env.MAKEFUN_INPUT_DIR||'/input',O=process.env.MAKEFUN_OUTPUT_DIR||'/output',T=" 1a$&*+/        )))))))%)))%))) )))             @DD@            %(              $$!$";
for(const d of R(I).sort()){
 if(!S(J(I,d)).isDirectory())continue;
 const p=F(J(I,d,'program.bin')),q=F(J(I,d,'input.bin')),D=new Int32Array(256),C=new Int32Array(64),Y=new Int32Array(256),o=new Uint8Array(65536);
 let s=0,c=0,pc=0,n=0,ip=0,l=0,e=-1;
 while(e<0){
  if(n===1e6)e=10;
  else if(pc<0||pc>=p.length)e=9;
  else{
   const b=p[pc];
   if(!(b<8||b>=16&&b<35&&b!==31||b>=48&&b<53||b>=64&&b<66||b>=80&&b<84))e=5;
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
       case 1:D[s++]=(p[pc-1]<<24)>>24;break;
       case 2:D[s++]=p[pc-4]|p[pc-3]<<8|p[pc-2]<<16|p[pc-1]<<24;break;
       case 3:s--;break;
       case 4:D[s]=D[s-1];s++;break;
       case 5:{const t=D[s-1];D[s-1]=D[s-2];D[s-2]=t;break;}
       case 6:D[s]=D[s-2];s++;break;
       case 7:{const a=D[s-3];D[s-3]=D[s-2];D[s-2]=D[s-1];D[s-1]=a;break;}
       case 0x17:D[s-1]=-D[s-1]|0;break;
       case 0x1b:D[s-1]=~D[s-1];break;
       case 0x30:case 0x31:case 0x32:{
        const r=((p[pc-2]|p[pc-1]<<8)<<16)>>16;
        if(b===0x30||(b===0x31)===(D[--s]===0))pc+=r;
        break;}
       case 0x33:
        if(c===64)e=7;else{C[c++]=pc;pc=p[pc-2]|p[pc-1]<<8;}
        break;
       case 0x34:
        if(c===0)e=8;else pc=C[--c];
        break;
       case 0x40:{const a=D[s-1];if(a<0||a>255)e=6;else D[s-1]=Y[a];break;}
       case 0x41:{const a=D[s-1],v=D[s-2];if(a<0||a>255)e=6;else{Y[a]=v;s-=2;}break;}
       case 0x50:{const g=String(D[s-1]);if(l+g.length>65536)e=11;else{for(let k=0;k<g.length;k++)o[l++]=g.charCodeAt(k);s--;}break;}
       case 0x51:
        if(l>=65536)e=11;else o[l++]=D[--s]&255;
        break;
       case 0x52:D[s++]=ip<q.length?q[ip++]:-1;break;
       case 0x53:e=D[--s]&255;break;
       default:{
        const y=D[s-1],x=D[s-2];
        if((b===0x13||b===0x14||b===0x15||b===0x16)&&y===0)e=4;
        else{
         let r;
         if(b===0x10)r=x+y|0;
         else if(b===0x11)r=x-y|0;
         else if(b===0x12)r=Math.imul(x,y);
         else if(b===0x13)r=(x/y)|0;
         else if(b===0x14)r=x%y|0;
         else if(b===0x15)r=Math.floor((x>>>0)/(y>>>0))|0;
         else if(b===0x16)r=(x>>>0)%(y>>>0)|0;
         else if(b===0x18)r=x&y;
         else if(b===0x19)r=x|y;
         else if(b===0x1a)r=x^y;
         else if(b===0x1c)r=x<<(y&31);
         else if(b===0x1d)r=x>>(y&31);
         else if(b===0x1e)r=(x>>>(y&31))|0;
         else if(b===0x20)r=x===y?1:0;
         else if(b===0x21)r=x<y?1:0;
         else r=(x>>>0)<(y>>>0)?1:0;
         s-=2;D[s++]=r;
        }
        break;}
      }
     }
    }
   }
  }
 }
 M(J(O,d),{recursive:true});
 W(J(O,d,'stdout.bin'),o.subarray(0,l));
 W(J(O,d,'exit.txt'),e+'\n');
}
