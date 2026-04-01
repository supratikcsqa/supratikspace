(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=`You read teacher-marked answer sheet pages.
Extract only marks that the teacher has explicitly awarded.
Do not invent question labels or totals.
If a mark is ambiguous, keep the exact written form in awardedRaw and explain it in note.
Return one entry per clearly visible awarded mark or per clearly visible total row.
possibleRaw should be an empty string when the maximum marks are not visible.
confidence must be between 0 and 1.`,t=`Review these marked answer-sheet pages.
Return structured score suggestions that the teacher can edit.
Use short question labels like Q1, Q2(a), Total, or Page note only when visible evidence supports them.
Never guess hidden marks.
If the same mark appears twice across pages, keep only one entry.`;function n(e){if(typeof e?.output_text==`string`&&e.output_text.trim())return e.output_text;let t=Array.isArray(e?.output)?e.output:[];for(let e of t){let t=Array.isArray(e?.content)?e.content:[];for(let e of t)if(typeof e?.text==`string`&&e.text.trim())return e.text}throw Error(`The AI response did not include any structured text output.`)}async function r(r){if(!r.apiKey.trim())throw Error(`Add an OpenAI API key before running AI score calculation.`);if(r.images.length===0)throw Error(`Select at least one marked page for AI score calculation.`);let i={type:`object`,additionalProperties:!1,properties:{entries:{type:`array`,items:{type:`object`,additionalProperties:!1,properties:{label:{type:`string`},awardedRaw:{type:`string`},possibleRaw:{type:`string`},note:{type:`string`},confidence:{type:`number`}},required:[`label`,`awardedRaw`,`possibleRaw`,`note`,`confidence`]}},summary:{type:`array`,items:{type:`string`}}},required:[`entries`,`summary`]},a=await fetch(`https://api.openai.com/v1/responses`,{method:`POST`,headers:{"Content-Type":`application/json`,Authorization:`Bearer ${r.apiKey.trim()}`},body:JSON.stringify({model:r.model||`gpt-5`,store:!1,instructions:e,input:[{role:`user`,content:[{type:`input_text`,text:t},...r.images.map(e=>({type:`input_image`,image_url:e.dataUrl,detail:`high`}))]}],text:{format:{type:`json_schema`,name:`paper_scores`,strict:!0,schema:i}}})}),o=await a.json();if(!a.ok)throw Error(o?.error?.message??`The AI score calculation request failed.`);let s=n(o),c=JSON.parse(s);return{entries:Array.isArray(c.entries)?c.entries:[],summary:Array.isArray(c.summary)?c.summary:[]}}var i=`paper-marking-desk`,a=2,o=`sheets`,s=`workspace`,c=`workspace`,l=null;function u(){return{aiModel:`gpt-5`}}function d(e=Date.now()){return{id:c,folders:[],sheets:[],settings:u(),createdAt:e,updatedAt:e}}function f(){return l||(l=new Promise((e,t)=>{if(!(`indexedDB`in window)){t(Error(`IndexedDB is not available in this browser.`));return}let n=window.indexedDB.open(i,a);n.onerror=()=>{t(n.error??Error(`Failed to open the local database.`))},n.onupgradeneeded=()=>{let e=n.result;e.objectStoreNames.contains(o)||e.createObjectStore(o,{keyPath:`id`}),e.objectStoreNames.contains(s)||e.createObjectStore(s,{keyPath:`id`})},n.onsuccess=()=>{e(n.result)}}),l)}function ee(e){return new Promise((t,n)=>{e.oncomplete=()=>t(),e.onerror=()=>n(e.error??Error(`Transaction failed.`)),e.onabort=()=>n(e.error??Error(`Transaction was aborted.`))})}function p(e){return new Promise((t,n)=>{e.onsuccess=()=>t(e.result),e.onerror=()=>n(e.error??Error(`Database request failed.`))})}async function m(e){if(!e.objectStoreNames.contains(o))return[];let t=e.transaction(o,`readonly`),n=await p(t.objectStore(o).getAll());return await ee(t),Array.isArray(n)?n:[]}function h(e){let t=Date.now();if(e.length===0)return d(t);let n={id:crypto.randomUUID(),name:`Imported papers`,parentId:null,kind:`test`,accent:`#0f5fff`,scoreEntries:[],aiSummary:[],aiLastRunAt:null,lastSharedAt:null,createdAt:t,updatedAt:t};return{id:c,folders:[n],sheets:e.map((e,t)=>({...e,folderId:n.id,pageLabel:`Page ${t+1}`,sortOrder:t,markedAt:e.strokes.length>0?e.updatedAt:null,selectedForAi:e.strokes.length>0})).sort((e,t)=>e.sortOrder-t.sortOrder),settings:u(),createdAt:t,updatedAt:t}}async function te(){let e=await f(),t=e.transaction(s,`readonly`),n=await p(t.objectStore(s).get(c));if(await ee(t),n)return{...n,settings:{...u(),...n.settings??{}}};let r=h(await m(e));return await g(r),r}async function g(e){let t=(await f()).transaction(s,`readwrite`);t.objectStore(s).put({...e,id:c,updatedAt:Date.now()}),await ee(t)}async function _(){let e=await f(),t=[s,o].filter(t=>e.objectStoreNames.contains(t));if(t.length===0)return;let n=e.transaction(t,`readwrite`);for(let e of t)n.objectStore(e).clear();await ee(n)}var{PI:ne}=Math,re=ne+1e-4,v=.5,ie=[1,1];function ae(e,t,n,r=e=>e){return e*r(.5-t*(.5-n))}var{min:y}=Math;function oe(e,t,n){let r=y(1,t/n);return y(1,e+(y(1,1-r)-e)*(r*.275))}function se(e){return[-e[0],-e[1]]}function b(e,t){return[e[0]+t[0],e[1]+t[1]]}function ce(e,t,n){return e[0]=t[0]+n[0],e[1]=t[1]+n[1],e}function x(e,t){return[e[0]-t[0],e[1]-t[1]]}function le(e,t,n){return e[0]=t[0]-n[0],e[1]=t[1]-n[1],e}function S(e,t){return[e[0]*t,e[1]*t]}function ue(e,t,n){return e[0]=t[0]*n,e[1]=t[1]*n,e}function de(e,t){return[e[0]/t,e[1]/t]}function fe(e){return[e[1],-e[0]]}function pe(e,t){let n=t[0];return e[0]=t[1],e[1]=-n,e}function me(e,t){return e[0]*t[0]+e[1]*t[1]}function C(e,t){return e[0]===t[0]&&e[1]===t[1]}function w(e){return Math.hypot(e[0],e[1])}function he(e,t){let n=e[0]-t[0],r=e[1]-t[1];return n*n+r*r}function T(e){return de(e,w(e))}function E(e,t){return Math.hypot(e[1]-t[1],e[0]-t[0])}function D(e,t,n){let r=Math.sin(n),i=Math.cos(n),a=e[0]-t[0],o=e[1]-t[1],s=a*i-o*r,c=a*r+o*i;return[s+t[0],c+t[1]]}function ge(e,t,n,r){let i=Math.sin(r),a=Math.cos(r),o=t[0]-n[0],s=t[1]-n[1],c=o*a-s*i,l=o*i+s*a;return e[0]=c+n[0],e[1]=l+n[1],e}function O(e,t,n){return b(e,S(x(t,e),n))}function _e(e,t,n,r){let i=n[0]-t[0],a=n[1]-t[1];return e[0]=t[0]+i*r,e[1]=t[1]+a*r,e}function k(e,t,n){return b(e,S(t,n))}var A=[0,0],j=[0,0],M=[0,0];function ve(e,t){let n=k(e,T(fe(x(e,b(e,[1,1])))),-t),r=[],i=1/13;for(let t=i;t<=1;t+=i)r.push(D(n,e,re*2*t));return r}function ye(e,t,n){let r=[],i=1/n;for(let n=i;n<=1;n+=i)r.push(D(t,e,re*n));return r}function be(e,t,n){let r=x(t,n),i=S(r,.5),a=S(r,.51);return[x(e,i),x(e,a),b(e,a),b(e,i)]}function xe(e,t,n,r){let i=[],a=k(e,t,n),o=1/r;for(let t=o;t<1;t+=o)i.push(D(a,e,re*3*t));return i}function Se(e,t,n){return[b(e,S(t,n)),b(e,S(t,n*.99)),x(e,S(t,n*.99)),x(e,S(t,n))]}function Ce(e,t,n){return e===!1||e===void 0?0:e===!0?Math.max(t,n):e}function we(e,t,n){return e.slice(0,10).reduce((e,r)=>{let i=r.pressure;return t&&(i=oe(e,r.distance,n)),(e+i)/2},e[0].pressure)}function Te(e,t={}){let{size:n=16,smoothing:r=.5,thinning:i=.5,simulatePressure:a=!0,easing:o=e=>e,start:s={},end:c={},last:l=!1}=t,{cap:u=!0,easing:d=e=>e*(2-e)}=s,{cap:f=!0,easing:ee=e=>--e*e*e+1}=c;if(e.length===0||n<=0)return[];let p=e[e.length-1].runningLength,m=Ce(s.taper,n,p),h=Ce(c.taper,n,p),te=(n*r)**2,g=[],_=[],ne=we(e,a,n),v=ae(n,i,e[e.length-1].pressure,o),ie,y=e[0].vector,S=e[0].point,de=S,C=S,w=de,T=!1;for(let t=0;t<e.length;t++){let{pressure:r}=e[t],{point:s,vector:c,distance:l,runningLength:u}=e[t],f=t===e.length-1;if(!f&&p-u<3)continue;i?(a&&(r=oe(ne,l,n)),v=ae(n,i,r,o)):v=n/2,ie===void 0&&(ie=v);let se=u<m?d(u/m):1,fe=p-u<h?ee((p-u)/h):1;v=Math.max(.01,v*Math.min(se,fe));let E=(f?e[t]:e[t+1]).vector,D=f?1:me(c,E),O=me(c,y)<0&&!T,k=D!==null&&D<0;if(O||k){pe(A,y),ue(A,A,v);for(let e=0;e<=1;e+=.07692307692307693)le(j,s,A),ge(j,j,s,re*e),C=[j[0],j[1]],g.push(C),ce(M,s,A),ge(M,M,s,re*-e),w=[M[0],M[1]],_.push(w);S=C,de=w,k&&(T=!0);continue}if(T=!1,f){pe(A,c),ue(A,A,v),g.push(x(s,A)),_.push(b(s,A));continue}_e(A,E,c,D),pe(A,A),ue(A,A,v),le(j,s,A),C=[j[0],j[1]],(t<=1||he(S,C)>te)&&(g.push(C),S=C),ce(M,s,A),w=[M[0],M[1]],(t<=1||he(de,w)>te)&&(_.push(w),de=w),ne=r,y=c}let E=[e[0].point[0],e[0].point[1]],D=e.length>1?[e[e.length-1].point[0],e[e.length-1].point[1]]:b(e[0].point,[1,1]),O=[],k=[];if(e.length===1){if(!(m||h)||l)return ve(E,ie||v)}else{m||h&&e.length===1||(u?O.push(...ye(E,_[0],13)):O.push(...be(E,g[0],_[0])));let t=fe(se(e[e.length-1].vector));h||m&&e.length===1?k.push(D):f?k.push(...xe(D,t,v,29)):k.push(...Se(D,t,v))}return g.concat(k,_.reverse(),O)}var Ee=[0,0];function De(e){return e!=null&&e>=0}function Oe(e,t={}){let{streamline:n=.5,size:r=16,last:i=!1}=t;if(e.length===0)return[];let a=.15+(1-n)*.85,o=Array.isArray(e[0])?e:e.map(({x:e,y:t,pressure:n=v})=>[e,t,n]);if(o.length===2){let e=o[1];o=o.slice(0,-1);for(let t=1;t<5;t++)o.push(O(o[0],e,t/4))}o.length===1&&(o=[...o,[...b(o[0],ie),...o[0].slice(2)]]);let s=[{point:[o[0][0],o[0][1]],pressure:De(o[0][2])?o[0][2]:.25,vector:[...ie],distance:0,runningLength:0}],c=!1,l=0,u=s[0],d=o.length-1;for(let e=1;e<o.length;e++){let t=i&&e===d?[o[e][0],o[e][1]]:O(u.point,o[e],a);if(C(u.point,t))continue;let n=E(t,u.point);if(l+=n,e<d&&!c){if(l<r)continue;c=!0}le(Ee,u.point,t),u={point:t,pressure:De(o[e][2])?o[e][2]:v,vector:T(Ee),distance:n,runningLength:l},s.push(u)}return s[0].vector=s[1]?.vector||[0,0],s}function ke(e,t={}){return Te(Oe(e,t),t)}function Ae(e,t,n){return{x:e.x/t.width*n.width,y:e.y/t.height*n.height,pressure:e.pressure??.5}}function je(e,t,n,r=[],i=!0){let a=[...e.points,...r].map(e=>Ae(e,t,n));if(a.length===0)return[];let o=a.some(e=>e.pressure!==void 0),s=Math.max(1,e.width/t.width*n.width);return ke(a.map(e=>[e.x,e.y,e.pressure??.5]),{size:s,thinning:o?.62:.3,smoothing:.72,streamline:.42,simulatePressure:!o,easing:e=>e,last:i,start:{cap:!0,taper:0},end:{cap:!0,taper:0}})}function Me(e,t){if(t.length!==0){e.beginPath(),e.moveTo(t[0][0],t[0][1]);for(let n=1;n<t.length;n+=1)e.lineTo(t[n][0],t[n][1]);e.closePath(),e.fill()}}function Ne(e,t,n,r){if(t.points.length===0)return;let i=Math.max(1,t.width/n.width*r.width),a=Ae(t.points[0],n,r),o=je(t,n,r);if(e.save(),e.fillStyle=t.color,e.globalAlpha=t.opacity,t.points.length===1||o.length<4){e.beginPath(),e.arc(a.x,a.y,i/2,0,Math.PI*2),e.fill(),e.restore();return}Me(e,o),e.restore()}function Pe(e,t,n,r,i=[]){if(t.points.length===0)return;let a=Math.max(1,t.width/n.width*r.width),o=Ae(t.points[0],n,r),s=je(t,n,r,i,!1);if(e.save(),e.fillStyle=t.color,e.globalAlpha=t.opacity,t.points.length===1||s.length<4){e.beginPath(),e.arc(o.x,o.y,a/2,0,Math.PI*2),e.fill(),e.restore();return}Me(e,s),e.restore()}function Fe(e,t,n){e.clearRect(0,0,t,n)}function Ie(e,t,n,r={}){let i=e.getContext(`2d`,{alpha:!0,desynchronized:!0});if(!i)return null;let a=window.devicePixelRatio||1,o=Math.max(1,Math.round(t*a)),s=Math.max(1,Math.round(n*a)),c=e.width!==o||e.height!==s;return c&&(e.width=o,e.height=s),i.setTransform(a,0,0,a,0,0),((r.clear??!0)||c)&&Fe(i,t,n),i}function Le(e){return new Promise((t,n)=>{let r=URL.createObjectURL(e),i=new Image;i.onload=()=>{URL.revokeObjectURL(r),t(i)},i.onerror=()=>{URL.revokeObjectURL(r),n(Error(`Unable to read the selected image.`))},i.src=r})}async function Re(e){let t=await Le(e.image),n=document.createElement(`canvas`);n.width=e.width,n.height=e.height;let r=n.getContext(`2d`);if(!r)throw Error(`Unable to create an export surface for this page.`);r.drawImage(t,0,0,e.width,e.height);for(let t of e.strokes)Ne(r,t,{width:e.width,height:e.height},{width:e.width,height:e.height});return new Promise((e,t)=>{n.toBlob(n=>{if(!n){t(Error(`Unable to export the marked page.`));return}e(n)},`image/png`)})}async function ze(e){return new Promise((t,n)=>{let r=new FileReader;r.onload=()=>{if(typeof r.result==`string`){t(r.result);return}n(Error(`Unable to encode the selected image.`))},r.onerror=()=>n(r.error??Error(`Unable to read the selected image.`)),r.readAsDataURL(e)})}function Be(e,t){let n=URL.createObjectURL(e),r=document.createElement(`a`);r.href=n,r.download=t,document.body.append(r),r.click(),r.remove(),window.setTimeout(()=>{URL.revokeObjectURL(n)},1e3)}function Ve(e){return e.replace(/\u00bd/g,` 1/2`).replace(/\u00bc/g,` 1/4`).replace(/\u00be/g,` 3/4`).replace(/(\d)\s*,\s*(\d+\s*\/\s*\d+)/g,`$1 $2`).replace(/,/g,`.`).replace(/\s+/g,` `).trim()}function He(e){let t=e.match(/^(\d+)\s*\/\s*(\d+)$/);if(!t)return null;let n=Number(t[1]),r=Number(t[2]);return r===0?null:n/r}function Ue(e){let t=Ve(e);if(!t)return null;if(/^\d+(\.\d+)?$/.test(t))return Number(t);let n=He(t);if(n!==null)return n;let r=t.split(` `);if(r.length===2&&/^\d+(\.\d+)?$/.test(r[0])){let e=He(r[1]);if(e!==null)return Number(r[0])+e}return null}function N(e){return{...e,awardedValue:Ue(e.awardedRaw),possibleValue:Ue(e.possibleRaw),updatedAt:Date.now()}}function We(e){let t=0,n=0,r=!1,i=0,a=0;for(let o of e){let e=Ue(o.awardedRaw),s=Ue(o.possibleRaw);e===null?a+=1:(t+=e,i+=1),s!==null&&(r=!0,n+=s)}let o=r?n:null;return{awardedTotal:t,possibleTotal:o,percent:o&&o>0?Number((t/o*100).toFixed(1)):null,resolvedEntries:i,unresolvedEntries:a}}function P(e){return e===null?`Unparsed`:Number.isInteger(e)?String(e):e.toFixed(2).replace(/\.?0+$/,``)}function F(e,t){return t?e.folders.find(e=>e.id===t)??null:null}function Ge(e,t){return e.folders.filter(e=>e.parentId===t).sort((e,t)=>{if(e.kind!==t.kind){let n=tt(e.kind)-tt(t.kind);if(n!==0)return n}return e.name.localeCompare(t.name,void 0,{numeric:!0})})}function I(e,t){return t?e.sheets.filter(e=>e.folderId===t).sort((e,t)=>e.sortOrder-t.sortOrder):[]}function Ke(e,t){let n=[],r=[t];for(;r.length>0;){let t=r.shift();if(t){n.push(t);for(let n of Ge(e,t))r.push(n.id)}}return n}function L(e,t){let n=new Set(Ke(e,t));return e.folders.filter(e=>e.kind===`test`&&n.has(e.id)).sort((e,t)=>t.createdAt-e.createdAt)}function R(e,t){let n=F(e,t);for(;n;){if(n.kind===`student`)return n;n=F(e,n.parentId)}return null}function z(e,t){let n=F(e,t);for(;n;){if(n.kind===`classroom`)return n;n=F(e,n.parentId)}return null}function qe(e,t){return L(e,t).map(e=>({folder:e,totals:We(e.scoreEntries)}))}function Je(e,t){return I(e,t).filter(e=>e.strokes.length>0).length}function Ye(e,t,n,r,i=Date.now()){return{id:crypto.randomUUID(),name:e,parentId:n,kind:t,accent:r,scoreEntries:[],aiSummary:[],aiLastRunAt:null,lastSharedAt:null,createdAt:i,updatedAt:i}}function Xe(e=Date.now()){return{id:crypto.randomUUID(),label:``,awardedRaw:``,awardedValue:null,possibleRaw:``,possibleValue:null,note:``,linkedSheetIds:[],source:`manual`,confidence:null,createdAt:e,updatedAt:e}}function Ze(e,t,n){let r=F(e,t)??e.folders.slice().sort((e,t)=>e.name.localeCompare(t.name,void 0,{numeric:!0}))[0]??null,i=I(e,r?.id??null),a=i.find(e=>e.id===n)??i[0]??null;return{selectedFolderId:r?.id??null,selectedSheetId:a?.id??null}}function Qe(e,t,n){if(n===`classroom`)return null;let r=F(e,t);return r?n===`student`?r.kind===`classroom`?r.id:r.kind===`student`?r.parentId:z(e,r.id)?.id??null:r.kind===`student`?r.id:r.kind===`test`?r.parentId:null:null}function $e(e){return e===`classroom`?`Class`:e===`student`?`Student`:`Test`}function et(e){let t=e.map(e=>e.totals.percent).filter(e=>e!==null);if(t.length===0)return{averagePercent:null,bestPercent:null,testsWithScores:0};let n=t.reduce((e,t)=>e+t,0)/Math.max(1,t.length);return{averagePercent:Number(n.toFixed(1)),bestPercent:Math.max(...t),testsWithScores:t.length}}function tt(e){return e===`classroom`?0:e===`student`?1:2}var nt=`paper-marking-desk:openai-key`,rt=[`#d14343`,`#2453ff`,`#12705a`,`#7347d6`,`#111827`],B=[`#6b8afd`,`#ff8f66`,`#56a77a`,`#6b6fd3`,`#d76464`,`#2b7fff`],it=document.querySelector(`#app`);if(!it)throw Error(`The app container is missing.`);var V=it,H={workspace:d(),homeMode:!0,selectedFolderId:null,selectedSheetId:null,folderDraftName:``,folderDraftKind:`classroom`,homeSearch:``,testSurface:`organizer`,scorePadEntryId:null,scorePadBuffer:``,penColor:rt[0],penWidth:9,zoom:1,isLoading:!0,saveTone:`saved`,saveLabel:`Everything on this device is up to date.`,flash:null,aiApiKey:Sn(),aiBusy:!1,shareBusy:!1,editSession:null};function at(){let e=ot()??`home`,t=H.workspace.folders.find(e=>e.kind===`student`)??null,n=H.workspace.folders.find(e=>e.kind===`test`)??null,r=n?I(H.workspace,n.id)[0]??null:null;if(H.flash=null,e===`student`&&t){H.homeMode=!1,H.selectedFolderId=t.id,H.selectedSheetId=null;return}if(e===`organizer`&&n){H.homeMode=!1,H.selectedFolderId=n.id,H.selectedSheetId=r?.id??null,H.testSurface=`organizer`;return}if(e===`scoring`&&n){H.homeMode=!1,H.selectedFolderId=n.id,H.selectedSheetId=r?.id??null,H.testSurface=`scoring`,H.scorePadEntryId=n.scoreEntries[0]?.id??null,H.scorePadBuffer=n.scoreEntries[0]?.awardedRaw??``;return}if(e===`result`&&n){H.homeMode=!1,H.selectedFolderId=n.id,H.selectedSheetId=r?.id??null,H.testSurface=`result`;return}H.homeMode=!0}function ot(){let e=new URL(window.location.href).searchParams.get(`demo`);if(e)return e===`1`?`home`:e;let t=window.location.hash.replace(/^#/,``);return t?t===`demo`?`home`:t.startsWith(`demo-`)?t.slice(5)||`home`:null:null}function st(){let e=Date.now(),t={...Ye(`Batch A`,`classroom`,null,B[0],e-11e3),id:`demo-class`},n={...Ye(`Riya`,`student`,t.id,B[1],e-1e4),id:`demo-student`},r={...Ye(`Monday Test - 21 Aug`,`test`,n.id,B[2],e-9e3),id:`demo-test`};r.scoreEntries=[N({...Xe(e-6e3),label:`Q1`,awardedRaw:`4`,possibleRaw:`5`,note:`Method mark`}),N({...Xe(e-5e3),label:`Q2`,awardedRaw:`8`,possibleRaw:`10`,note:`Neater working`}),N({...Xe(e-4e3),label:`Q3`,awardedRaw:`6.5`,possibleRaw:`7`,note:`Half mark retained`})],r.lastSharedAt=e-1e3;let i=Array.from({length:6},(e,t)=>ct(r.id,t));return i[0].selectedForAi=!0,i[0].markedAt=e-3e3,i[1].markedAt=e-2500,i[2].markedAt=e-2e3,{id:`workspace`,folders:[t,n,r],sheets:i,settings:{aiModel:`gpt-5`},createdAt:e-12e3,updatedAt:e}}function ct(e,t){let n=`
    <svg xmlns="http://www.w3.org/2000/svg" width="1100" height="1550" viewBox="0 0 1100 1550">
      <rect width="1100" height="1550" fill="white"/>
      <rect x="78" y="90" width="944" height="48" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
      <rect x="78" y="170" width="280" height="16" rx="8" fill="#cbd5e1"/>
      <rect x="780" y="170" width="180" height="16" rx="8" fill="#cbd5e1"/>
      <g font-family="Arial, sans-serif" fill="#0f172a" font-size="34">
        <text x="90" y="126">Paper Review Desk Demo</text>
        <text x="90" y="250">Question ${t+1}. Solve the geometry expression shown below.</text>
      </g>
      ${Array.from({length:10},(e,t)=>{let n=320+t*98;return`
          <rect x="92" y="${n}" width="900" height="2" fill="#e2e8f0"/>
          <circle cx="980" cy="${n-12}" r="26" fill="none" stroke="#dc2626" stroke-width="4"/>
          <path d="M 710 ${n-52} C 760 ${n-10}, 815 ${n-2}, 862 ${n-40}" fill="none" stroke="#dc2626" stroke-width="6" stroke-linecap="round"/>
        `}).join(``)}
      <text x="792" y="250" font-family="Arial, sans-serif" fill="#dc2626" font-size="46">9${t}</text>
    </svg>
  `.trim(),r=new File([n],`page-${t+1}.svg`,{type:`image/svg+xml`});return{id:`demo-sheet-${t+1}`,folderId:e,name:`Page ${t+1}`,pageLabel:`Page ${t+1}`,image:r,width:1100,height:1550,sortOrder:t,strokes:t<3?[{id:crypto.randomUUID(),color:`#d14343`,width:10,opacity:1,points:[{x:740,y:380,pressure:.7},{x:798,y:410,pressure:.8},{x:856,y:394,pressure:.75}]}]:[],markedAt:null,selectedForAi:!1,createdAt:Date.now()-(10-t)*600,updatedAt:Date.now()-(10-t)*600}}var U=null,W=null,lt=null,G=[],ut=0,dt=0;V.addEventListener(`click`,pt),V.addEventListener(`change`,ht),V.addEventListener(`input`,mt),window.addEventListener(`resize`,()=>{if(H.editSession){K();return}window.requestAnimationFrame(Ut)}),ft();async function ft(){if(ot()){H.workspace=st(),at(),un(),H.isLoading=!1,H.saveTone=`saved`,H.saveLabel=`Demo workspace ready.`,K();return}K();try{H.workspace=await te(),un(),H.isLoading=!1,H.saveTone=`saved`,H.saveLabel=`Ready for local marking.`}catch(e){H.isLoading=!1,H.saveTone=`error`,H.saveLabel=En(e,`Unable to open the local workspace.`),H.flash={tone:`error`,text:H.saveLabel}}K()}function pt(e){let t=e.target?.closest(`[data-action]`);if(!t)return;let n=t.dataset.action;n&&gt(n,t)}function mt(e){let t=e.target;if(t instanceof HTMLElement){if(t instanceof HTMLInputElement&&t.dataset.field===`home-search`){H.homeSearch=t.value,K();return}if(t instanceof HTMLInputElement&&t.dataset.field===`folder-name`){H.folderDraftName=t.value;return}if(t instanceof HTMLInputElement&&t.dataset.field===`openai-key`){H.aiApiKey=t.value,Cn(t.value);return}if(t instanceof HTMLInputElement&&t.dataset.field===`pen-width`){H.penWidth=Number(t.value),K();return}t instanceof HTMLInputElement&&t.dataset.field===`zoom`&&(H.zoom=Number(t.value),K())}}function ht(e){let t=e.target;if(t instanceof HTMLElement){if(t instanceof HTMLInputElement&&t.type===`file`&&t.dataset.upload===`test`){let e=t.files?Array.from(t.files):[];if(t.value=``,e.length===0)return;Kt(e);return}if(t instanceof HTMLInputElement&&t.dataset.action===`toggle-ai-sheet`){let e=t.dataset.sheetId;e&&Yt(e,t.checked);return}if(t instanceof HTMLInputElement&&t.dataset.field===`ai-model`){H.workspace.settings.aiModel=t.value.trim()||`gpt-5`,Y(`Saved AI settings.`);return}t instanceof HTMLInputElement&&t.dataset.entryId&&t.dataset.scoreField&&on(t.dataset.entryId,t.dataset.scoreField,t.value)}}async function gt(e,t){switch(e){case`go-home`:H.homeMode=!0,H.testSurface=`organizer`,H.scorePadEntryId=null,H.scorePadBuffer=``,Z(null),K();return;case`select-folder`:{let e=t.dataset.folderId;e&&J(e);return}case`open-latest-test`:{let e=t.dataset.folderId;e&&J(e);return}case`upload-latest-test`:{let e=t.dataset.folderId;e&&(J(e),Z(`Test opened. Tap Add Page to upload papers.`,`info`),K());return}case`prepare-test-create`:H.folderDraftKind=`test`,H.folderDraftName=H.folderDraftName||``,Z(`Name the exam folder in Create, then tap Create.`,`info`),K();return;case`prepare-student-create`:H.folderDraftKind=`student`,H.folderDraftName=H.folderDraftName||``,Z(`Name the student in Create, then tap Create.`,`info`),K();return;case`back-to-student`:{let e=X(),t=R(H.workspace,e?.id??null);t?J(t.id):(H.homeMode=!0,K());return}case`open-organizer-surface`:{let e=t.dataset.folderId;e&&J(e),H.homeMode=!1,H.testSurface=`organizer`,K();return}case`open-scoring-surface`:{let e=t.dataset.folderId;e&&J(e),H.homeMode=!1,H.testSurface=`scoring`,kt(),K();return}case`open-result-surface`:{let e=t.dataset.folderId;e&&J(e),H.homeMode=!1,H.testSurface=`result`,K();return}case`back-to-organizer`:H.testSurface=`organizer`,K();return;case`set-folder-kind`:{let e=t.dataset.kind;e&&(H.folderDraftKind=e,K());return}case`create-folder`:await Wt();return;case`trigger-upload`:V.querySelector(`[data-upload="test"]`)?.click();return;case`prev-sheet`:Gt(-1);return;case`next-sheet`:Gt(1);return;case`select-sheet`:{let e=t.dataset.sheetId;e&&(H.selectedSheetId=e,Z(null),K());return}case`move-sheet-up`:{let e=t.dataset.sheetId;e&&qt(e,-1);return}case`move-sheet-down`:{let e=t.dataset.sheetId;e&&qt(e,1);return}case`remove-sheet`:{let e=t.dataset.sheetId;e&&await Jt(e);return}case`set-color`:{let e=t.dataset.color;e&&(H.penColor=e,K());return}case`download-sheet`:await Xt();return;case`open-edit-mode`:Zt();return;case`save-edit-mode`:await Qt();return;case`cancel-edit-mode`:$t();return;case`undo-edit-stroke`:en();return;case`clear-edit-strokes`:tn();return;case`share-marked`:await nn();return;case`share-current-sheet`:await rn();return;case`add-score-entry`:await an();return;case`select-score-entry`:{let e=t.dataset.entryId;e&&At(e);return}case`score-key`:{let e=t.dataset.key??``;e&&jt(e);return}case`score-backspace`:Mt();return;case`score-clear`:Nt();return;case`score-enter`:await Pt();return;case`remove-score-entry`:{let e=t.dataset.entryId;e&&await sn(e);return}case`run-ai-scores`:await cn();return;case`reset-workspace`:await ln();return;default:return}}function K(){let e=X(),t=fn(),n=pn(),r=e?.kind===`test`?e:null,i=I(H.workspace,r?.id??null),a=r?We(r.scoreEntries):null,o=R(H.workspace,e?.id??null),s=e?qe(H.workspace,e.id):[],c=et(s),l=Dt();document.body.style.overflow=H.editSession?`hidden`:``;let u=``;u=H.homeMode||!e?yt(l):e.kind===`test`?H.testSurface===`scoring`?Tt(e,i,t,a,l):H.testSurface===`result`?Et(e,i,t,a,l):wt(e,i,t,a,l):Ct(e,s,c,o,l),V.innerHTML=`
    <div class="screen-root">
      ${H.flash?`<div class="flash-banner flash-banner-global" data-tone="${H.flash.tone}">${Q(H.flash.text)}</div>`:``}
      ${u}
    </div>
    ${n?Rt(n):``}
  `,Bt()}function _t(e,t=``){return`
    <section class="workspace-shell ${t}">
      ${vt()}
      <div class="workspace-shell-main">
        ${e}
      </div>
    </section>
  `}function vt(){let e=H.workspace.folders.filter(e=>e.kind===`classroom`).sort((e,t)=>e.name.localeCompare(t.name,void 0,{numeric:!0})),t=H.workspace.folders.filter(e=>e.kind===`test`).sort((e,t)=>t.updatedAt-e.updatedAt).slice(0,4),n=H.homeSearch.trim().toLowerCase();return`
    <aside class="student-shell-sidebar workspace-sidebar">
      <div style="padding:10px 0 2px;">
        <div class="stitch-sidebar-search-wrap">
          <span style="color:var(--muted-soft);font-size:14px;">⌕</span>
          <input
            type="text"
            data-field="home-search"
            value="${Q(H.homeSearch)}"
            placeholder="Search students or tests"
          />
        </div>
      </div>

      <div style="padding:2px 0;">
        <p class="stitch-sidebar-section-label">Students</p>
        ${e.length===0?`<p class="empty-copy" style="padding:4px 4px 8px;">Create a class first, then add students and exam folders.</p>`:e.map(e=>{let t=Ge(H.workspace,e.id).filter(e=>e.kind===`student`),r=n?t.filter(e=>e.name.toLowerCase().includes(n)):t;if(n&&r.length===0)return``;let i=L(H.workspace,e.id).filter(e=>q(e).tone!==`success`).length>0?`warning`:`success`;return`
                    <div class="stitch-class-group">
                      <button
                        class="stitch-class-group-header"
                        data-action="select-folder"
                        data-folder-id="${e.id}"
                        style="border:none;background:transparent;width:100%;text-align:left;"
                      >
                        <span style="font-size:0.78rem;color:var(--muted-soft);margin-right:2px;">▾</span>
                        <strong>${Q(e.name)}</strong>
                        <span
                          class="stitch-class-badge"
                          style="${i===`warning`?`background:#fff7ed;color:#b45309;`:``}"
                        >${t.length}</span>
                      </button>
                      <div class="stitch-student-list">
                        ${r.map(e=>{let t=L(H.workspace,e.id),n=t.filter(e=>q(e).tone!==`success`).length,r=n===0&&t.length>0?`success`:n>0?`warning`:`idle`,i=n===0?`${t.length} test${t.length===1?``:`s`}`:`${n} to mark`;return`
                              <button
                                class="stitch-student-item"
                                data-action="select-folder"
                                data-folder-id="${e.id}"
                              >
                                <span class="stitch-student-avatar">${Q(e.name.slice(0,1).toUpperCase())}</span>
                                <span class="stitch-student-copy">
                                  <strong>${Q(e.name)}</strong>
                                  <span>${i}</span>
                                </span>
                                <span class="stitch-status-dot" data-tone="${r}"></span>
                              </button>
                            `}).join(``)}
                      </div>
                    </div>
                  `}).join(``)}
      </div>

      ${t.length===0?``:`
          <div style="padding:2px 0;">
            <p class="stitch-sidebar-section-label">Recent Tests</p>
            ${t.map(e=>{let t=R(H.workspace,e.id),n=q(e),r=We(e.scoreEntries);return`
                  <button
                    class="stitch-recent-test-item"
                    data-action="select-folder"
                    data-folder-id="${e.id}"
                  >
                    <strong>${Q(e.name)}</strong>
                    <div class="stitch-meta-row">
                      <span>${Q(t?.name??`Student`)}</span>
                      <span>${r.percent===null?n.label:`${r.percent}%`}</span>
                    </div>
                  </button>
                `}).join(``)}
          </div>
        `}
      ${xt()}
    </aside>
  `}function yt(e){let t=H.workspace.folders.filter(e=>e.kind===`test`).sort((e,t)=>t.updatedAt-e.updatedAt),n=H.homeSearch.trim().toLowerCase(),r=t.filter(e=>{if(!n)return!0;let t=R(H.workspace,e.id);return e.name.toLowerCase().includes(n)||t?.name.toLowerCase().includes(n)}).slice(0,e?4:8);return _t(`
    < section class="screen-home workspace-home-surface ${e?`is-portrait`:``}" >
      <div class="stitch-home-header" >
        <h2>Today's Marking</h2>
          </div>
      ${r.length===0?St():`<div class="stitch-today-grid">
               ${r.map(e=>bt(e,!1)).join(``)}
             </div>`}
  </section>
    `)}function bt(e,t){let n=R(H.workspace,e.id),r=z(H.workspace,e.id),i=I(H.workspace,e.id),a=Je(H.workspace,e.id),o=i.length>0?Math.round(a/i.length*100):0,s=q(e),c=s.label===`Shared`||s.label===`Scored`,l=Math.max(0,i.length-a);return`
    < article class="stitch-task-card" >
      <div class="stitch-task-card-head" >
        <h3>${Q(e.name)} </h3>
          < p > ${Q(r?.name??n?.name??`Exam`)} </p>
            </div>
            < div >
            <div class="stitch-task-progress-track" >
              <div class="stitch-task-progress-fill" style = "width:${o}%;" > </div>
                </div>
                < p class="stitch-task-progress-label" >
                  ${a===i.length&&i.length>0?`All ${i.length} students marked`:`${a} of ${i.length} students marked`}
  </p>
    </div>
    < div class="stitch-task-card-footer" >
      <button
          class="stitch-mark-btn ${c?`is-review`:``}"
  data - action="${c?`open-result-surface`:`select-folder`}"
  data - folder - id="${e.id}"
    >
    ${c?`Review Marks`:`Mark Now`}
  </button>
    < span class="stitch-students-left" > ${c?``:`${l} student${l===1?``:`s`} left`} </span>
      </div>
      </article>
        `}function xt(){return`
                < div class="stitch-create-panel" >
                  <p class="stitch-create-label" > Create New </p>
                    < div class="stitch-create-actions" >
                      <button class="stitch-create-btn${H.folderDraftKind===`classroom`?` is-active`:``}" data - action="set-folder-kind" data - kind="classroom" > + Class </button>
                        < button class="stitch-create-btn${H.folderDraftKind===`student`?` is-active`:``}" data - action="set-folder-kind" data - kind="student" > + Student </button>
                          < button class="stitch-create-btn${H.folderDraftKind===`test`?` is-active`:``}" data - action="set-folder-kind" data - kind="test" > + Exam </button>
                            </div>
      ${H.folderDraftKind?`
            <div class="stitch-create-inline-form">
              <input
                class="text-input"
                type="text"
                data-field="folder-name"
                value="${Q(H.folderDraftName)}"
                placeholder="${H.folderDraftKind===`classroom`?`E.g. Math 101`:H.folderDraftKind===`student`?`Student name`:`Exam name`}"
              />
              <button data-action="create-folder">Add</button>
            </div>
          `:``}
  </div>
    `}function St(){return`
    < div class="home-empty-card" >
      <p class="section-kicker" > Workspace setup </p>
        < h3 > Create a class, add students, then open each exam to check copies.</h3>
          < p class="supporting-copy" > Each class contains students.Each student contains exam folders.Open the exam folder to upload and check that student's copies.</p>
            </div>
              `}function Ct(e,t,n,r,i){let a=z(H.workspace,e.id),o=Ge(H.workspace,e.id).filter(e=>e.kind===`student`),s=L(H.workspace,e.id),c=s[0]??null,l=e.kind===`classroom`;return _t(`
            < section class="screen-student-history ${i?`is-portrait`:``}" >
              <div class="student-shell-main" >
                <header class="student-history-header" >
                  <div>
                  <div class="breadcrumb-row breadcrumb-row-tight" >
                    <button class="breadcrumb-back" data - action="go-home" > Workspace </button>
                      < span class="breadcrumb-pill" > ${Q(l?e.name:a?.name??e.name)} </span>
                        </div>
                        < h2 > ${Q(l?`${e.name}: Students`:`${e.name}: Exams`)} </h2>
                          </div>
                          < div class="student-history-actions" >
                            ${l?`
                  <button class="primary-button" data-action="prepare-student-create">
                    Add Student
                  </button>
                `:c?`
                  <button
                    class="primary-button"
                    data-action="open-latest-test"
                    data-folder-id="${c.id}"
                  >
                    Open Latest Exam
                  </button>
                `:`
                  <button class="primary-button" data-action="prepare-test-create">
                    Create Exam Folder
                  </button>
                `}
  <button class="subtle-button" data - action="${l?`prepare-student-create`:`prepare-test-create`}" > ${l?`New Student`:`New Exam Folder`} </button>
    </div>
    </header>
    < div class="student-history-timeline" >
      ${l?o.length===0?`
                  <div class="history-empty-panel student-empty-panel">
                    <div>
                      <p class="section-kicker">No students yet</p>
                      <h3>Add students inside ${Q(e.name)}.</h3>
                      <p class="supporting-copy">After that, open each student and create an exam folder for their copies.</p>
                    </div>
                  </div>
                `:o.map(e=>`
                        <button class="timeline-row" data-action="select-folder" data-folder-id="${e.id}">
                          <span class="timeline-rail is-last">
                            <span class="timeline-dot" data-tone="info"></span>
                          </span>
                          <span class="timeline-content">
                            <span class="timeline-row-main">
                              <span class="overview-copy">
                                <strong>${Q(e.name)}</strong>
                                <span class="timeline-meta">${L(H.workspace,e.id).length} exam${L(H.workspace,e.id).length===1?``:`s`}</span>
                              </span>
                              <span class="status-badge" data-tone="info">Open student</span>
                            </span>
                          </span>
                        </button>
                      `).join(``):s.length===0?`
                <div class="history-empty-panel student-empty-panel">
                  <div>
                    <p class="section-kicker">No exams yet</p>
                    <h3>No exam folders found for ${Q(e.name)}.</h3>
                    <p class="supporting-copy">Create an exam folder for this student, then upload the exam copies there.</p>
                    <div class="empty-panel-actions">
                      <button class="primary-button" data-action="prepare-test-create">Create Exam Folder</button>
                    </div>
                  </div>
                </div>
              `:s.map((e,t)=>Lt(e,t,s.length)).join(``)}
  <div class="history-empty-panel student-tail-panel" >
    <div>
    <p class="section-kicker" > Next batch </p>
      < h3 > ${l?`Add the next student to ${Q(e.name)}.`:s.length===0?`Start ${Q(e.name)}'s first exam.`:`No more exams found for ${Q(e.name)}.`} </h3>
        < p class="supporting-copy" > ${l?`Each student gets their own exam folders and checked copies.`:`Use the left rail to create the next exam folder and keep the full checking history clean.`} </p>
          </div>
          </div>
          </div>
          </div>

          < aside class="student-shell-summary" >
            <div class="overview-section" >
              <div class="section-heading" >
                <p class="section-kicker" > ${l?`Class summary`:`Student summary`} </p>
                  < span class="section-caption" > ${Q($e(e.kind))} </span>
                    </div>
                    < div class="metric-stack" >
                      <div class="metric-line" > <span>${l?`Students`:`Exams scored`} </span><strong>${l?o.length:n.testsWithScores}</strong > </div>
                        < div class="metric-line" > <span>Pending checking < /span><strong>${s.filter(e=>q(e).tone!==`success`).length}</strong > </div>
                          < div class="metric-line" > <span>Overall average < /span><strong>${n.averagePercent===null?`Not yet`:`${n.averagePercent}%`}</strong > </div>
                            </div>
                            </div>
                            < div class="overview-section" >
                              <div class="section-heading" >
                                <p class="section-kicker" > Recent activity </p>
                                  < span class="section-caption" > ${t.length} </span>
                                    </div>
          ${t.length===0?`<p class="empty-copy">Shared and scored tests will appear here after the first completed result.</p>`:t.slice(0,3).map(({folder:e,totals:t})=>`
                      <button class="history-row compact-history" data-action="select-folder" data-folder-id="${e.id}">
                        <span class="history-title">${Q(e.name)}</span>
                        <span class="history-percent">${t.percent===null?`Needs review`:`${t.percent}%`}</span>
                      </button>
                    `).join(``)}
  </div>
    </aside>
    </section>
      `)}function wt(e,t,n,r,i){let a=R(H.workspace,e.id),o=z(H.workspace,e.id),s=n??t[0]??null;return _t(`
    < section class="screen-organizer ${i?`is-portrait`:``}" >
      <header class="surface-topbar" >
        <div class="surface-topbar-start" >
          <button class="icon-square" data - action="${i?`go-home`:`back-to-student`}" > ${i?`Menu`:`Back`} </button>
          ${i?``:`<span>Workspace</span>`}
  </div>
    < h2 > ${Q(e.name)} </h2>
      < div class="surface-topbar-end" >
        <button class="primary-button" data - action="open-edit-mode" ${s?``:`disabled`}> Check Copy </button>
          </div>
          </header>
          < div class="organizer-layout" >
            <div class="organizer-board" >
              ${t.length===0?`
                <div class="organizer-empty">
                  <p class="section-kicker">Page organizer</p>
                  <h3>Upload this student's exam copies to begin checking.</h3>
                  <p class="supporting-copy">Add all pages for this exam here, arrange them, then open each copy for checking and marking.</p>
                </div>
              `:`
                <div class="organizer-grid stitch-organizer-grid">
                  ${t.map((e,r)=>It(e,r,e.id===n?.id,t.length)).join(``)}
                </div>
              `}
  <div class="organizer-bottom-bar" >
    ${i?`<button class="subtle-button stretch-button">Reorder Pages</button>`:``}
  <button class="primary-button organizer-add-button" data - action="trigger-upload" > Add Page </button>
    </div>
    < input class="hidden-file-input" type = "file" accept = "image/*" multiple data - upload="test" />
      </div>
      < aside class="organizer-detail-card" >
        <div class="organizer-detail-head" >
          <h3>Test Details </h3>
            </div>
            < div class="section-heading" >
              <p class="section-kicker" > Metadata </p>
                < span class="section-caption" > ${Q(a?.name??`Student`)} </span>
                  </div>
                  < div class="metric-stack" >
                    <div class="metric-line" > <span>Class < /span><strong>${Q(o?.name??`Class`)}</strong > </div>
                      < div class="metric-line" > <span>Date Taken < /span><strong>${wn(e.createdAt)}</strong > </div>
                        < div class="metric-line" > <span>Max Marks < /span><strong>${r?.possibleTotal===null||!r?`Unknown`:P(r.possibleTotal)}</strong > </div>
                          < div class="metric-line" > <span>Student < /span><strong>${Q(a?.name??`Workspace`)}</strong > </div>
                            < div class="metric-line" > <span>Pages < /span><strong>${t.length}</strong > </div>
                              </div>
          ${s?`
                <div class="selected-page-callout selected-page-callout-tall">
                  <img src="${vn(s)}" alt="" />
                  <div class="overview-copy">
                    <span class="section-kicker">Selected page</span>
                    <strong>${Q(s.pageLabel||s.name)}</strong>
                    <span>${s.strokes.length>0?`Checked copy`:`Ready to check`}</span>
                  </div>
                </div>
              `:``}
  <div class="organizer-detail-actions" >
    <button class="primary-button stretch-button" data - action="open-edit-mode" ${s?``:`disabled`}> Check Copy </button>
      < button class="subtle-button stretch-button" data - action="open-scoring-surface" > Scoring & amp; Totals </button>
        </div>
        </aside>
        </div>
        </section>
          `,`workspace-test-shell`)}function Tt(e,t,n,r,i){let a=Ot(e),o=n??t[0]??null,s=a?.awardedRaw||H.scorePadBuffer||`0`,c=a?.possibleRaw||`5`,l=o?t.findIndex(e=>e.id===o.id):-1;return _t(`
        < section class="screen-scoring ${i?`is-portrait`:``}" >
          <header class="surface-topbar" >
            <div class="surface-topbar-start" >
              <button class="icon-square" data - action="back-to-organizer" > Back </button>
                < span > ${i?`Marks and Totals Panel`:`Teacher Workspace`} </span>
                  </div>
                  < h2 > ${i?``:Q(e.name)} </h2>
                    < div class="surface-topbar-end" >
                      <button class="subtle-button" data - action="open-result-surface" > Result </button>
                        </div>
                        </header>
                        < div class="scoring-layout" >
                          <div class="scoring-stage-column" >
                            <div class="scoring-floating-toolbar" >
                              <button class="toolbar-chip is-active" > Select </button>
                                < button class="toolbar-chip" data - action="open-edit-mode" > Pen </button>
                                  < button class="toolbar-chip" > Erase </button>
                                    < button class="toolbar-chip" data - action="download-sheet" ${o?``:`disabled`}> Save </button>
                                      < button class="toolbar-chip" data - action="prev-sheet" ${l<=0?`disabled`:``}> Prev </button>
                                        < button class="toolbar-chip" data - action="next-sheet" ${l<0||l>=t.length-1?`disabled`:``}> Next </button>
                                          </div>
                                          < div class="scoring-stage-shell" >
                                            ${o?`
                  <div class="stage-scroll scoring-stage-scroll">
                    <div class="stage-frame scoring-stage-frame" data-stage-frame style="aspect-ratio:${o.width} / ${o.height};">
                      <img id="stage-image" src="${vn(o)}" alt="${Q(o.name)}" />
                      <canvas id="ink-layer"></canvas>
                    </div>
                  </div>
                `:`
                  <div class="organizer-empty">
                    <p class="section-kicker">Choose a page</p>
                    <h3>Select a page from the organizer before scoring.</h3>
                  </div>
                `}
  </div>
    </div>
    < aside class="stitch-score-panel" >
      <div class="stitch-score-panel-head" >
        <h3>Scoring & amp; Totals </h3>
          < button class="icon-square" data - action="open-result-surface" title = "View result" >✕</button>
            </div>
            < div class="stitch-score-current-banner" >
              <span>${Q(a?.label||`No question selected`)} </span>
                < span class="stitch-score-current-value" > ${Q(s||`—`)} / ${Q(c)}</span >
                  </div>
                  < div class="stitch-keypad" >
                    ${[`7`,`8`,`9`,`4`,`5`,`6`,`1`,`2`,`3`].map(e=>`<button class="stitch-key" data-action="score-key" data-key="${e}">${e}</button>`).join(``)}
  <button class="stitch-key" data - action="score-key" data - key="." >.</button>
    < button class="stitch-key" data - action="score-key" data - key="0" > 0 </button>
      < button class="stitch-key stitch-key-enter" data - action="score-enter" > ENTER </button>
        </div>
        < div style = "padding:6px 14px;background:#0f2744;display:flex;gap:6px;" >
          <button class="subtle-button" data - action="score-backspace" style = "flex:1;color:rgba(255,255,255,0.6);background:rgba(255,255,255,0.07);border-color:transparent;" >⌫ Back </button>
            < button class="subtle-button" data - action="score-clear" style = "flex:1;color:rgba(255,255,255,0.6);background:rgba(255,255,255,0.07);border-color:transparent;" > Clear </button>
              </div>
              < div class="stitch-score-question-list" >
                <h4>Question Scores(${e.scoreEntries.length}) </h4>
            ${e.scoreEntries.length===0?`<p class="empty-copy" style="padding:4px 0 0;">Add the first score row, then use the keypad above to enter marks.</p>`:e.scoreEntries.map(e=>`
                      <button
                        class="stitch-score-list-row"
                        data-action="select-score-entry"
                        data-entry-id="${e.id}"
                        data-active="${e.id===H.scorePadEntryId}"
                      >
                        <strong>${Q(e.label||`Question`)}</strong>
                        <span>${Q(e.awardedRaw||`—`)} / ${Q(e.possibleRaw||`—`)}</span>
                      </button>
                    `).join(``)}
  </div>
    < div class="stitch-score-total-row" >
      <span>Total Score </span>
        < span class="stitch-score-total-percent" >
          ${r?.percent===null||!r?`${P(r?.awardedTotal??0)} pts`:`${P(r.awardedTotal)} / ${P(r.possibleTotal??0)} (${r.percent}%)`}
  </span>
    </div>
    < div class="stitch-score-panel-actions" >
      <button class="stitch-save-next-btn" data - action="open-result-surface" > Save & amp; View Results </button>
        < button class="subtle-button stretch-button" data - action="add-score-entry" > + Add Question </button>
          </div>
          </aside>
          </div>
          </section>
            `,`workspace-test-shell`)}function Et(e,t,n,r,i){let a=R(H.workspace,e.id),o=z(H.workspace,e.id);return _t(`
          < section class="screen-result ${i?`is-portrait`:``}" >
            <header class="surface-topbar" >
              <div class="surface-topbar-start" >
                <button class="icon-square" data - action="back-to-organizer" > Back </button>
                  </div>
                  < h2 > Test Result </h2>
                    < div class="surface-topbar-end" >
                      <button class="primary-button" data - action="go-home" > Done </button>
                        </div>
                        </header>
                        < div style = "padding:var(--space-4);" >
                          ${Ft(e,t,n,r)}
        ${r?.percent!==null&&r!==null?``:`
            <div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap;">
              <button class="subtle-button" data-action="run-ai-scores" ${H.aiBusy?`disabled`:``}>${H.aiBusy?`Calculating...`:`Calculate Marks from AI`}</button>
              <button class="subtle-button" data-action="back-to-organizer">Back to Exam</button>
            </div>
            <div style="margin-top:12px;font-size:0.8rem;color:var(--muted);">
              ${[o?.name,a?.name,e.name].filter(Boolean).join(` / `)}
            </div>
          `}
  </div>
    </section>
      `,`workspace-test-shell`)}function Dt(){return window.innerHeight>window.innerWidth}function Ot(e){let t=e.scoreEntries.find(e=>e.id===H.scorePadEntryId)??e.scoreEntries[0]??null;return t&&t.id!==H.scorePadEntryId&&(H.scorePadEntryId=t.id,H.scorePadBuffer=t.awardedRaw),t}function kt(){let e=X();if(!e||e.kind!==`test`)return;let t=Ot(e);H.scorePadEntryId=t?.id??null,H.scorePadBuffer=t?.awardedRaw??``}function At(e){let t=X();if(!t||t.kind!==`test`)return;let n=t.scoreEntries.find(t=>t.id===e);n&&(H.scorePadEntryId=n.id,H.scorePadBuffer=n.awardedRaw,K())}function jt(e){let t=X();!t||t.kind!==`test`||(!H.scorePadEntryId&&t.scoreEntries.length>0&&(H.scorePadEntryId=t.scoreEntries[0].id),!(e===`.`&&H.scorePadBuffer.includes(`.`))&&(H.scorePadBuffer=`${H.scorePadBuffer}${e} `,K()))}function Mt(){H.scorePadBuffer=H.scorePadBuffer.slice(0,-1),K()}function Nt(){H.scorePadBuffer=``,K()}async function Pt(){let e=X();if(!e||e.kind!==`test`)return;let t=Ot(e);if(!t){await an();return}e.scoreEntries=e.scoreEntries.map(e=>e.id===t.id?N({...e,awardedRaw:H.scorePadBuffer}):e),await Y(`Score entry saved.`)}function Ft(e,t,n,r){let i=Je(H.workspace,e.id),a=r?.percent??null,o=H.shareBusy||i===0,s=r===null?null:`${P(r.awardedTotal)}${r.possibleTotal!==null&&r.possibleTotal!==void 0?` / ${P(r.possibleTotal)}`:``} `;return a===null?`
        < aside class="result-card" data - state="${i>0?`progress`:`empty`}" >
          <div class="section-heading" >
            <p class="section-kicker" > Result summary </p>
              < span class="section-caption" > ${e.lastSharedAt?`Shared ${wn(e.lastSharedAt)}`:`Local only`} </span>
                </div>
                < div class="result-score" >
                  <strong>${i} /${Math.max(1,t.length)}</strong >
                    <span>Pages marked </span>
                      </div>
                      < p class="supporting-copy" >
                        ${i===0?`Once the first page is marked, this panel becomes the quick completion and share checkpoint for the whole test.`:`Mark every needed page, then fill the score rows to generate the final percent before you share the paper back.`}
  </p>
    < button class="primary-button stretch-button" data - action="share-marked" ${o?`disabled`:``}>
      ${H.shareBusy?`Preparing share...`:`Share results`}
  </button>
    </aside>
      `:`
    < div class="stitch-result-layout" >
      <div class="stitch-result-card" >
        <div class="stitch-result-confetti-bg" > </div>
          < p class="stitch-result-score-label" > Final Score </p>
            < p class="stitch-result-percent" > ${a}% </p>
              < h3 class="stitch-result-grade" > ${zt(a)} </h3>
          ${s===null?``:`<p class="stitch-result-points">Total Points: ${s}</p>`}
  <div class="stitch-result-saved-indicator" >
    <span class="stitch-result-checkmark" >✓</span>
      < span class="stitch-result-saved-label" >
        ${e.lastSharedAt?`Shared ${wn(e.lastSharedAt)}`:`Saved locally`}
  </span>
    </div>
    < div class="stitch-result-actions" >
      <button class="stitch-share-btn" data - action="share-marked" ${o?`disabled`:``}>
        ${H.shareBusy?`Preparing...`:`⬆ Share Results`}
  </button>
    < button class="stitch-done-btn" data - action="go-home" > Done </button>
      </div>
      </div>
      < div class="stitch-result-preview-panel" >
        ${t.length>0?`
                <div class="stitch-result-preview-card">
                  <p class="stitch-result-preview-label">Marked Document — ${Q(e.name)}</p>
                  <div class="stitch-result-preview-img">
                    <img src="${vn(t[0])}" alt="Marked sheet preview" />
                  </div>
                </div>
              `:``}
  <div class="stitch-result-meta-bar" >
    <strong>${Q(e.name)} </strong>
      < span > ${i} of ${t.length} pages marked · ${e.scoreEntries.length} score rows </span>
        </div>
        </div>
        </div>
          `}function It(e,t,n,r){return`
    < div class="stitch-page-card" data - active="${n}" >
      <div class="stitch-page-card-header" >
        <span>${Q(e.pageLabel||e.name)} </span>
          < div class="stitch-page-card-arrows" >
            <button
            data - action="move-sheet-up"
  data - sheet - id="${e.id}"
            ${t===0?`disabled`:``}
  title = "Move up"
    >↑</button>
      < button
  data - action="move-sheet-down"
  data - sheet - id="${e.id}"
            ${t===r-1?`disabled`:``}
  title = "Move down"
    >↓</button>
      </div>
      </div>
      < button
  class="stitch-page-thumb"
  data - action="select-sheet"
  data - sheet - id="${e.id}"
  style = "border:none;padding:8px;width:100%;"
    >
    <img src="${vn(e)}" alt = "Page ${t+1}" />
      <span class="stitch-page-thumb-badge" > ${e.strokes.length>0?`Marked`:`Ready`} </span>
        </button>
        < div class="stitch-page-card-footer" >
          <span class="status-badge" data - tone="${e.strokes.length>0?`success`:`info`}" > ${e.strokes.length>0?`Marked`:`Ready`} </span>
            < button
  class="icon-button danger-button"
  data - action="remove-sheet"
  data - sheet - id="${e.id}"
  title = "Delete page"
    > Del </button>
    </div>
    </div>
      `}function Lt(e,t,n){let r=We(e.scoreEntries),i=q(e),a=I(H.workspace,e.id).length,o=Je(H.workspace,e.id),s=i.tone===`success`,c=i.tone===`warning`||i.tone===`info`,l=r.percent===null?`${o} / ${a||0} marked`:`${r.percent}% ${zt(r.percent)?` (${zt(r.percent).replace(`Grade `,``)})`:``} `;return`
    <div class="stitch-history-card">
      <div class="stitch-history-badge ${s?`is-graded`:c?`is-pending`:`is-idle`}">
        <span style="font-size:1.1rem;">${s?`✓`:c?`!`:`○`}</span>
        <span>${s?`Graded`:c?`Pending Review`:`Awaiting`}</span>
      </div>
      <div class="stitch-history-body">
        <p class="stitch-history-meta">${wn(e.createdAt)}</p>
        <p class="stitch-history-test-name">${Q(e.name)}</p>
        ${r.percent===null?`<p class="stitch-history-score" style="font-size:0.92rem;font-weight:500;color:var(--muted);">${l}</p>`:`<p class="stitch-history-score">${l}</p>`}
        <div class="stitch-history-actions">
          ${s?`<button class="stitch-history-btn" data-action="open-result-surface" data-folder-id="${e.id}">View &amp; Share</button>`:c?`<button class="stitch-history-btn is-primary" data-action="select-folder" data-folder-id="${e.id}">Review Now</button>`:`<button class="stitch-history-btn is-primary" data-action="select-folder" data-folder-id="${e.id}">Open Test</button>`}
        </div>
      </div>
    </div>
  `}function Rt(e){let t=bn(e),n=H.editSession?.draftStrokes.length??0,r=I(H.workspace,e.folderId),i=r.findIndex(t=>t.id===e.id),a=F(H.workspace,e.folderId);return`
    <div class="edit-overlay">
      <div class="edit-shell edit-shell-focus">
        <header class="edit-topbar">
          <div class="edit-title-block">
            <button class="subtle-button" data-action="cancel-edit-mode">Back</button>
            <div class="header-copy">
              <p class="eyebrow">Focused marking canvas</p>
              <h2>${Q(R(H.workspace,e.folderId)?.name||a?.name||`Current page`)}</h2>
              <p class="supporting-copy">${Q(e.pageLabel||e.name)}${a?` | ${a.name}`:``}</p>
            </div>
          </div>
          <div class="edit-action-row">
            <span class="info-chip">${i>=0?`Page ${i+1} of ${r.length}`:`Single page`}</span>
            <button class="subtle-button" data-action="undo-edit-stroke" ${n===0?`disabled`:``}>Undo</button>
            <button class="subtle-button" data-action="clear-edit-strokes" ${n===0?`disabled`:``}>Clear</button>
            <button class="primary-button" data-action="save-edit-mode">Save marks</button>
          </div>
        </header>

        <div class="edit-workbench">
          <aside class="edit-tool-rail">
            <div class="tool-rail-group">
              <span class="section-kicker">Ink</span>
              <div class="swatch-column">
                ${rt.map(e=>`
                    <button
                      class="swatch-button"
                      data-action="set-color"
                      data-color="${e}"
                      data-active="${H.penColor===e}"
                      style="--swatch:${e};"
                      aria-label="Set ink color"
                    ></button>
                  `).join(``)}
              </div>
            </div>
            <div class="tool-rail-group">
              <label class="range-control rail-range">
                <span>Stroke</span>
                <input type="range" min="3" max="24" step="1" value="${H.penWidth}" data-field="pen-width" />
                <strong>${H.penWidth}px</strong>
              </label>
            </div>
            <div class="tool-rail-group">
              <span class="section-kicker">Session</span>
              <span class="info-chip">${n} stroke${n===1?``:`s`}</span>
              <span class="edit-footnote">Scroll stays locked so Pencil movement feels direct.</span>
            </div>
          </aside>

          <div class="edit-stage-shell edit-stage-shell-focus">
            <div
              class="edit-stage-frame"
              data-edit-stage-frame
              style="width:${t.width}px; height:${t.height}px;"
            >
              <img id="edit-stage-image" src="${vn(e)}" alt="${Q(e.name)}" />
              <canvas id="edit-ink-layer"></canvas>
              <canvas id="edit-ink-preview-layer"></canvas>
            </div>
          </div>
        </div>

        <footer class="edit-footer">
          <div class="hero-chip-row">
            <span class="info-chip">${e.strokes.length>0?`Existing marks loaded`:`Fresh page`}</span>
            <span class="info-chip">Pencil and touch ready</span>
          </div>
          <div class="edit-action-row">
            <button class="subtle-button" data-action="cancel-edit-mode">Cancel</button>
            <button class="primary-button" data-action="save-edit-mode">Done</button>
          </div>
        </footer>
      </div>
    </div>
  `}function q(e){let t=I(H.workspace,e.id),n=Je(H.workspace,e.id),r=We(e.scoreEntries);return t.length===0?{label:`Awaiting pages`,tone:`idle`,actionLabel:`Open test`}:n===0?{label:`Needs marking`,tone:`warning`,actionLabel:`Mark test`}:r.percent===null?{label:`Scoring`,tone:`info`,actionLabel:`Continue review`}:e.lastSharedAt?{label:`Shared`,tone:`success`,actionLabel:`View & share`}:{label:`Scored`,tone:`success`,actionLabel:`View result`}}function zt(e){return e>=90?`Grade A`:e>=80?`Grade B`:e>=70?`Grade C`:e>=60?`Grade D`:`Needs review`}function Bt(){if(U?.disconnect(),U=null,W=null,lt=null,G=[],H.editSession){Ht();return}Vt()}function Vt(){let e=fn(),t=V.querySelector(`[data-stage-frame]`),n=V.querySelector(`#ink-layer`);if(!e||!t||!n)return;let r=++dt,i=()=>{if(r!==dt)return;let i=t.clientWidth,a=t.clientHeight,o=Ie(n,i,a);if(o)for(let t of e.strokes)Ne(o,t,{width:e.width,height:e.height},{width:i,height:a})};U=new ResizeObserver(()=>{i()}),U.observe(t),window.requestAnimationFrame(i)}function Ht(){let e=H.editSession,t=pn(),n=V.querySelector(`[data-edit-stage-frame]`),r=V.querySelector(`#edit-ink-layer`),i=V.querySelector(`#edit-ink-preview-layer`);if(!e||!t||!n||!r||!i)return;let a=++dt,o=()=>({width:n.clientWidth,height:n.clientHeight}),s=()=>{if(a!==dt)return;let{width:n,height:s}=o(),c=Ie(r,n,s),l=Ie(i,n,s);if(c)for(let r of e.draftStrokes)Ne(c,r,{width:t.width,height:t.height},{width:n,height:s});l&&W&&Pe(l,W,{width:t.width,height:t.height},{width:n,height:s},G)},c=()=>{if(a!==dt)return;let{width:e,height:n}=o(),r=Ie(i,e,n);r&&W&&Pe(r,W,{width:t.width,height:t.height},{width:e,height:n},G)},l=()=>{ut||=window.requestAnimationFrame(()=>{ut=0,c()})};i.addEventListener(`pointerdown`,e=>{e.button!==0&&e.pointerType===`mouse`||(lt=e.pointerId,W={id:crypto.randomUUID(),color:H.penColor,width:H.penWidth,opacity:1,points:mn(e,i,t)},G=hn(e,i,t),i.setPointerCapture(e.pointerId),l())}),i.addEventListener(`onpointerrawupdate`in i?`pointerrawupdate`:`pointermove`,e=>{e.pointerId!==lt||!W||(W.points.push(...mn(e,i,t)),G=hn(e,i,t),l())});let u=()=>{!W||!H.editSession||(W.points.length>0&&(H.editSession.draftStrokes=[...H.editSession.draftStrokes,W]),W=null,lt=null,G=[],K())};i.addEventListener(`pointerup`,u),i.addEventListener(`pointercancel`,u),i.addEventListener(`lostpointercapture`,u),U=new ResizeObserver(()=>{s()}),U.observe(n),window.requestAnimationFrame(s)}function Ut(){(V.querySelector(`#ink-layer`)??V.querySelector(`#edit-ink-layer`))&&Bt()}async function Wt(){let e=H.folderDraftName.trim(),t=X();if(!e){Z(`Give it a name first.`,`error`),K();return}if(H.folderDraftKind===`student`&&(!t||t.kind!==`classroom`)){Z(`Open a class first, then add the student inside that class.`,`error`),K();return}if(H.folderDraftKind===`test`&&(!t||t.kind!==`student`)){Z(`Open a student first, then create that student’s exam folder.`,`error`),K();return}let n=Qe(H.workspace,H.selectedFolderId,H.folderDraftKind),r=Ye(e,H.folderDraftKind,n,B[H.workspace.folders.length%B.length]);H.workspace.folders=[...H.workspace.folders,r],H.homeMode=!1,H.selectedFolderId=r.id,H.selectedSheetId=null,H.testSurface=r.kind===`test`?`organizer`:H.testSurface,H.scorePadEntryId=null,H.scorePadBuffer=``,H.folderDraftName=``,Z(`${$e(r.kind)} created.`,`info`),await Y(`${r.name} is ready.`)}function J(e){H.homeMode=!1,H.selectedFolderId=e;let t=F(H.workspace,e);H.selectedSheetId=I(H.workspace,t?.kind===`test`?e:null)[0]?.id??null,H.testSurface=t?.kind===`test`?`organizer`:H.testSurface,H.scorePadEntryId=null,H.scorePadBuffer=``,Z(null),K()}function Gt(e){let t=X();if(!t||t.kind!==`test`)return;let n=I(H.workspace,t.id),r=n[n.findIndex(e=>e.id===H.selectedSheetId)+e];r&&(H.selectedSheetId=r.id,K())}async function Kt(e){let t=X();if(!t||t.kind!==`test`){Z(`Open a student exam folder before uploading copies.`,`error`),K();return}let n=e.filter(e=>e.type.startsWith(`image/`));if(n.length===0){Z(`Only image files can be added here.`,`error`),K();return}H.saveTone=`saving`,H.saveLabel=`Importing pages...`,K();let r=I(H.workspace,t.id).length,i=[];for(let e of n){let n=await gn(e),a=Date.now();i.push({id:crypto.randomUUID(),folderId:t.id,name:e.name,pageLabel:`Page ${r+1}`,image:e,width:n.width,height:n.height,sortOrder:r,strokes:[],markedAt:null,selectedForAi:!1,createdAt:a,updatedAt:a}),r+=1}H.workspace.sheets=[...H.workspace.sheets,...i],H.selectedSheetId=H.selectedSheetId??i[0]?.id??null,Z(`${i.length} exam cop${i.length===1?`y`:`ies`} imported.`,`info`),await Y(`Exam copies imported and ready to check.`)}function qt(e,t){let n=H.workspace.sheets.find(t=>t.id===e);if(!n)return;let r=I(H.workspace,n.folderId),i=r[r.findIndex(t=>t.id===e)+t];if(!i)return;let a=n.sortOrder;n.sortOrder=i.sortOrder,i.sortOrder=a,Z(`Page order updated.`,`info`),Y(`Page order saved.`)}async function Jt(e){let t=H.workspace.sheets.find(t=>t.id===e);if(t){H.workspace.sheets=H.workspace.sheets.filter(t=>t.id!==e),xn(e),H.editSession?.sheetId===e&&(H.editSession=null);for(let t of H.workspace.folders)t.scoreEntries=t.scoreEntries.map(t=>({...t,linkedSheetIds:t.linkedSheetIds.filter(t=>t!==e)}));dn(t.folderId),un(),Z(`Page removed from this test.`,`info`),await Y(`Page removed.`)}}function Yt(e,t){let n=H.workspace.sheets.find(t=>t.id===e);n&&(n.selectedForAi=t,Y(`AI page selection saved.`))}async function Xt(){let e=fn();e&&(Be(await Re(e),`${Tn(e.pageLabel||e.name)}.png`),Z(`Marked page downloaded as PNG.`,`info`),K())}function Zt(){let e=fn();e&&(H.editSession={sheetId:e.id,draftStrokes:yn(e.strokes)},Z(null),K())}async function Qt(){let e=pn(),t=H.editSession;!e||!t||(e.strokes=yn(t.draftStrokes),e.markedAt=e.strokes.length>0?Date.now():null,e.selectedForAi=e.strokes.length>0,e.updatedAt=Date.now(),H.editSession=null,Z(`Edit session saved.`,`info`),await Y(`Marks saved from full-screen edit mode.`))}function $t(){H.editSession=null,Z(`Edit session discarded.`,`info`),K()}function en(){!H.editSession||H.editSession.draftStrokes.length===0||(H.editSession.draftStrokes=H.editSession.draftStrokes.slice(0,-1),K())}function tn(){!H.editSession||H.editSession.draftStrokes.length===0||(H.editSession.draftStrokes=[],K())}async function nn(){let e=X();if(!e||e.kind!==`test`)return;let t=I(H.workspace,e.id).filter(e=>e.strokes.length>0);if(t.length===0){Z(`Check at least one copy before sharing.`,`error`),K();return}H.shareBusy=!0,K();try{let n=await Promise.all(t.map(async e=>{let t=await Re(e);return new File([t],`${Tn(e.pageLabel||e.name)}.png`,{type:`image/png`})}));if(navigator.canShare&&navigator.canShare({files:n}))await navigator.share({files:n,title:e.name,text:`Checked copies for ${e.name}`});else for(let e of n)Be(e,e.name);e.lastSharedAt=Date.now(),Z(`All checked copies for this exam are ready to send from the device share sheet.`,`info`),await Y(`Checked copies share bundle prepared.`)}catch(e){e instanceof DOMException&&e.name===`AbortError`?Z(`Share cancelled.`,`info`):Z(En(e,`Unable to prepare the marked pages for sharing.`),`error`),K()}finally{H.shareBusy=!1,K()}}async function rn(){let e=X(),t=fn();if(!e||e.kind!==`test`||!t||t.strokes.length===0){Z(`Mark the current copy before sharing it.`,`error`),K();return}H.shareBusy=!0,K();try{let n=await Re(t),r=new File([n],`${Tn(t.pageLabel||t.name)}.png`,{type:`image/png`});navigator.canShare&&navigator.canShare({files:[r]})?await navigator.share({files:[r],title:`${e.name} - ${t.pageLabel||t.name}`,text:`Checked copy for ${t.pageLabel||t.name}`}):Be(r,r.name),e.lastSharedAt=Date.now(),Z(`This checked copy is ready to send from the device share sheet.`,`info`),await Y(`Current checked copy prepared.`)}catch(e){e instanceof DOMException&&e.name===`AbortError`?Z(`Share cancelled.`,`info`):Z(En(e,`Unable to prepare this checked copy for sharing.`),`error`),K()}finally{H.shareBusy=!1,K()}}async function an(){let e=X();if(!e||e.kind!==`test`)return;let t=Xe();t.label=`Q${e.scoreEntries.length+1}`,e.scoreEntries=[...e.scoreEntries,t],H.scorePadEntryId=t.id,H.scorePadBuffer=t.awardedRaw,await Y(`Score row added.`)}function on(e,t,n){let r=X();!r||r.kind!==`test`||(r.scoreEntries=r.scoreEntries.map(r=>r.id===e?N({...r,[t]:n}):r),Y(`Score entry saved.`))}async function sn(e){let t=X();if(!t||t.kind!==`test`)return;t.scoreEntries=t.scoreEntries.filter(t=>t.id!==e);let n=t.scoreEntries[0]??null;H.scorePadEntryId=n?.id??null,H.scorePadBuffer=n?.awardedRaw??``,await Y(`Score row removed.`)}async function cn(){let e=X();if(!e||e.kind!==`test`)return;if(!H.aiApiKey.trim()){Z(`Add an OpenAI API key on this device before running AI scoring.`,`error`),K();return}let t=I(H.workspace,e.id).filter(e=>e.strokes.length>0),n=t.filter(e=>e.selectedForAi),i=n.length>0?n:t;if(i.length===0){Z(`Mark at least one copy before calculating marks.`,`error`),K();return}H.aiBusy=!0,H.saveTone=`saving`,H.saveLabel=`Calculating marks from the checked copies...`,K();try{let t=await Promise.all(i.map(async e=>{let t=await Re(e);return{name:e.name,dataUrl:await ze(t)}})),n=await r({apiKey:H.aiApiKey,model:H.workspace.settings.aiModel,images:t}),a=Date.now(),o=e.scoreEntries.filter(e=>e.source!==`ai`),s=n.entries.map(e=>N({id:crypto.randomUUID(),label:e.label,awardedRaw:e.awardedRaw,awardedValue:null,possibleRaw:e.possibleRaw,possibleValue:null,note:e.note,linkedSheetIds:i.map(e=>e.id),source:`ai`,confidence:e.confidence,createdAt:a,updatedAt:a}));e.scoreEntries=[...o,...s],e.aiSummary=n.summary,e.aiLastRunAt=a,Z(`Marks calculated from the checked copies. Review before sharing.`,`info`),await Y(`AI suggestions saved.`)}catch(e){H.saveTone=`error`,H.saveLabel=En(e,`AI score calculation failed.`),Z(H.saveLabel,`error`),K()}finally{H.aiBusy=!1,K()}}async function ln(){if(window.confirm(`Reset the local workspace on this device? This clears folders, pages, and scores stored in this browser only.`)){await _();for(let e of H.workspace.sheets)xn(e.id);H.workspace=d(),H.homeMode=!0,H.selectedFolderId=null,H.selectedSheetId=null,H.folderDraftName=``,H.testSurface=`organizer`,H.scorePadEntryId=null,H.scorePadBuffer=``,H.editSession=null,Z(`Local workspace reset on this device.`,`info`),await Y(`Local workspace reset.`)}}async function Y(e){un(),H.saveTone=`saving`,H.saveLabel=`Saving locally...`,K();try{H.workspace.updatedAt=Date.now(),await g(H.workspace),H.saveTone=`saved`,H.saveLabel=e}catch(e){H.saveTone=`error`,H.saveLabel=En(e,`Unable to save the workspace.`)}K()}function un(){if(H.homeMode){H.selectedSheetId=null;return}let e=Ze(H.workspace,H.selectedFolderId,H.selectedSheetId);H.selectedFolderId=e.selectedFolderId,H.selectedSheetId=e.selectedSheetId}function dn(e){I(H.workspace,e).forEach((e,t)=>{e.sortOrder=t,(!e.pageLabel||/^Page \d+$/i.test(e.pageLabel))&&(e.pageLabel=`Page ${t+1}`)})}function X(){return F(H.workspace,H.selectedFolderId)}function fn(){return H.workspace.sheets.find(e=>e.id===H.selectedSheetId)??null}function pn(){return H.editSession?H.workspace.sheets.find(e=>e.id===H.editSession?.sheetId)??null:null}function mn(e,t,n){let r=t.getBoundingClientRect();return(e.getCoalescedEvents?e.getCoalescedEvents():[e]).map(e=>({x:$((e.clientX-r.left)/r.width*n.width,0,n.width),y:$((e.clientY-r.top)/r.height*n.height,0,n.height),pressure:e.pointerType===`mouse`?.5:$(e.pressure&&e.pressure>0?e.pressure:.5,.05,1)}))}function hn(e,t,n){if(!e.getPredictedEvents)return[];let r=t.getBoundingClientRect();return e.getPredictedEvents().map(e=>({x:$((e.clientX-r.left)/r.width*n.width,0,n.width),y:$((e.clientY-r.top)/r.height*n.height,0,n.height),pressure:e.pointerType===`mouse`?.5:$(e.pressure&&e.pressure>0?e.pressure:.5,.05,1)}))}function gn(e){return new Promise((t,n)=>{let r=URL.createObjectURL(e),i=new Image;i.onload=()=>{URL.revokeObjectURL(r),t({width:i.naturalWidth,height:i.naturalHeight})},i.onerror=()=>{URL.revokeObjectURL(r),n(Error(`Unable to read ${e.name}.`))},i.src=r})}var _n=new Map;function vn(e){let t=_n.get(e.id);if(t)return t;let n=URL.createObjectURL(e.image);return _n.set(e.id,n),n}function yn(e){return e.map(e=>({...e,points:e.points.map(e=>({...e}))}))}function bn(e){let t=window.innerHeight>window.innerWidth,n=t?80:window.innerWidth<1180?196:260,r=t?window.innerHeight<960?420:380:window.innerHeight<900?340:300,i=Math.max(260,window.innerWidth-n),a=Math.max(260,window.innerHeight-r),o=Math.min(i/e.width,a/e.height,1);return{width:Math.max(220,Math.floor(e.width*o)),height:Math.max(220,Math.floor(e.height*o))}}function xn(e){let t=_n.get(e);t&&(URL.revokeObjectURL(t),_n.delete(e))}function Z(e,t=`info`){H.flash=e?{tone:t,text:e}:null}function Sn(){try{return window.localStorage.getItem(nt)??``}catch{return``}}function Cn(e){try{e?window.localStorage.setItem(nt,e):window.localStorage.removeItem(nt)}catch{return}}function Q(e){return e.replaceAll(`&`,`&amp;`).replaceAll(`<`,`&lt;`).replaceAll(`>`,`&gt;`).replaceAll(`"`,`&quot;`).replaceAll(`'`,`&#39;`)}function wn(e){return new Intl.DateTimeFormat(void 0,{day:`numeric`,month:`short`,year:`numeric`}).format(e)}function Tn(e){return e.replace(/[\\/:*?"<>|]+/g,`-`).trim()||`marked-sheet`}function $(e,t,n){return Math.min(n,Math.max(t,e))}function En(e,t){return e instanceof Error?e.message:t}