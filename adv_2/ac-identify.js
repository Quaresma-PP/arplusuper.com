/* First-party technical signals. These identify a browser approximately, not a person. */
(async function(){
 'use strict';if(window.__acIdentifying)return;window.__acIdentifying=true;
 const gated=document.documentElement.hasAttribute('data-ac-gate'),denied=document.documentElement.hasAttribute('data-ac-denied');
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
 const body={collection_status:'complete'};
 const safe=(fn,fallback='')=>{try{return fn();}catch{return fallback;}};
 const digest=async value=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),n=>n.toString(16).padStart(2,'0')).join('');
 try{
  Object.assign(body,{screen:safe(()=>screen.width+' × '+screen.height),timezone:safe(()=>Intl.DateTimeFormat().resolvedOptions().timeZone),language:navigator.language||'',platform:navigator.userAgentData?.platform||navigator.platform||'',touch_points:navigator.maxTouchPoints||0,pixel_ratio:window.devicePixelRatio||1,color_depth:safe(()=>screen.colorDepth),hardware_concurrency:navigator.hardwareConcurrency||'',device_memory:navigator.deviceMemory||'',mobile:navigator.userAgentData?.mobile??/Android.*Mobile|iPhone|iPod/.test(navigator.userAgent)});
  const partial=[];let canvas='';
  try{const c=document.createElement('canvas');c.width=240;c.height=60;const ctx=c.getContext('2d');if(!ctx)throw Error();ctx.fillStyle='#16537e';ctx.fillRect(0,0,240,60);ctx.font='17px Arial';ctx.fillStyle='#f1c232';ctx.fillText('AeroPlus · Conforto 123',8,34);canvas=await digest(c.toDataURL());}catch{partial.push('canvas indisponível');}
  try{const gl=document.createElement('canvas').getContext('webgl'),ext=gl?.getExtension('WEBGL_debug_renderer_info');if(ext){body.webgl_vendor=gl.getParameter(ext.UNMASKED_VENDOR_WEBGL);body.webgl_renderer=gl.getParameter(ext.UNMASKED_RENDERER_WEBGL);}else partial.push('GPU não exposta');gl?.getExtension('WEBGL_lose_context')?.loseContext();}catch{partial.push('WebGL indisponível');}
  try{const u=await navigator.userAgentData?.getHighEntropyValues(['model','fullVersionList']);if(u){body.model=u.model||'';body.ua_full_version=JSON.stringify(u.fullVersionList||[]).slice(0,160);}}catch{partial.push('Client Hints restritos');}
  // Keep v1 material stable so existing signed fingerprints remain recognizable.
  const material={screen:body.screen,timezone:body.timezone,language:body.language,platform:body.platform,touch_points:body.touch_points,pixel_ratio:body.pixel_ratio,color_depth:body.color_depth,hardware_concurrency:body.hardware_concurrency,device_memory:body.device_memory,webgl_vendor:body.webgl_vendor||'',webgl_renderer:body.webgl_renderer||''};
  try{body.fingerprint=await digest(JSON.stringify({version:1,ua:navigator.userAgent,...material,canvas}));body.fingerprint_quality=partial.length?'partial':'complete';}catch{body.fingerprint_quality='unavailable';partial.push('SHA-256 indisponível');}
  body.collection_status=partial.length?partial.join('; '):'complete';
  const endpoint=new URL('/api/visit-metadata',location.origin);
  const res=await fetch(endpoint,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:controller.signal});
  if(denied)return;
  if(res.status===503){location.reload();return;}
  if(!res.ok)return;
  const result=await res.json();
  if(gated||document.documentElement.hasAttribute('data-btu-enabled')&&result.btu!==(document.documentElement.dataset.btuEnabled==='1')){
   const last=safe(()=>Number(sessionStorage.getItem('ac_access_retry')||0),0);
   if(Date.now()-last>5000){try{sessionStorage.setItem('ac_access_retry',String(Date.now()));}catch{}location.reload();}
  }
 }catch{if(gated){const status=document.getElementById('access-status');if(status)status.textContent='Não foi possível preparar seu acesso. Atualize a página para tentar novamente.';}}
 finally{clearTimeout(timer);}
})();
