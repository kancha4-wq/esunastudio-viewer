(() => {
  'use strict';
  const bundledRevision='31cd08054a878c011d8e7a56174e584394a42b154bea1da9c4d4dbfbfffacb3e';
  const enc = new TextEncoder(),dec = new TextDecoder();
  const hex = bytes => Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
  const sha = async bytes => hex(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)));
  const bytes = value => value instanceof Uint8Array ? value : enc.encode(value);
  function database(){return new Promise((resolve,reject)=>{
    const request=indexedDB.open('byu-catalogue-generations-v1',1);
    request.onupgradeneeded=()=>{request.result.createObjectStore('generations');request.result.createObjectStore('state');};
    request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);
  });}
  function request(r){return new Promise((resolve,reject)=>{r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
  function done(t){return new Promise((resolve,reject)=>{t.oncomplete=resolve;t.onerror=()=>reject(t.error);t.onabort=()=>reject(t.error);});}
  async function active(){const db=await database();try{const t=db.transaction(['state','generations'],'readonly'),finished=done(t);const id=await request(t.objectStore('state').get('active'));const item=id?await request(t.objectStore('generations').get(id)):null;await finished;return item||null;}finally{db.close();}}
  async function validateRows(document){
    if(document.kind!=='public_title_search_entrances'||document.rows?.length!==10612)throw Error('title_schema');
    const first=new URL(document.rows[0].links.amazon.destination).searchParams.get('tag');
    if(!first||!first.match(/^[A-Za-z0-9_-]+-22$/)||await sha(enc.encode(first))!==document.amazonTagSha256)throw Error('amazon_tag');
    const seen=new Set();
    for(const row of document.rows){
      if(seen.has(row.key)||row.actualLatestConfirmed)throw Error('title_identity');seen.add(row.key);
      const a=row.links.amazon,n=new URL(a.normalUrl),d=new URL(a.destination);
      if(n.protocol!=='https:'||!['www.amazon.co.jp','amazon.co.jp'].includes(n.hostname)||d.hostname!==n.hostname||d.pathname!==n.pathname||n.searchParams.has('tag')||a.destination!==a.normalUrl+(n.search?'&':'?')+'tag='+encodeURIComponent(first))throw Error('amazon_destination');
      const k=row.links.rakuten_kobo,kn=new URL(k.normalUrl),kd=new URL(k.destination);
      if(kn.protocol!=='https:'||kn.hostname!=='books.rakuten.co.jp'||kd.protocol!=='https:'||kd.hostname!=='hb.afl.rakuten.co.jp'||kd.searchParams.get('pc')!==k.normalUrl||kd.searchParams.get('m')!==k.normalUrl)throw Error('kobo_destination');
    }
  }
  async function installLocal(manifestBytes,payloadBytes,trustedManifestSha){
    const m=bytes(manifestBytes),p=bytes(payloadBytes);
    if(m.byteLength>65536||p.byteLength>32*1024*1024||!trustedManifestSha||await sha(m)!==trustedManifestSha)throw Error('manifest_trust');
    const manifest=JSON.parse(dec.decode(m));
    if(manifest.schema!=='local-catalogue-generation-v1'||!manifest.revision?.match(/^[a-f0-9]{64}$/)||!manifest.baseRevision?.match(/^[a-f0-9]{64}$/)||Object.keys(manifest.files||{}).join()!=='stores/title-search-entrances.json'||manifest.files['stores/title-search-entrances.json']!==await sha(p))throw Error('manifest_payload');
    const document=JSON.parse(dec.decode(p));await validateRows(document);
    const db=await database();try{
      const current=await active();if(current?.revision===manifest.revision)return false;
      if((current?.revision||bundledRevision)!==manifest.baseRevision)throw Error('base_revision');
      const t=db.transaction(['state','generations'],'readwrite'),finished=done(t);
      t.objectStore('generations').put({revision:manifest.revision,manifestSha256:trustedManifestSha,document},manifest.revision);
      t.objectStore('state').put(manifest.revision,'active');
      await finished;return true;
    }finally{db.close();}
  }
  async function checkOnResume(){
    const fixture=window.ByuLocalUpdateFixture;
    if(!fixture)return false;
    try{return await installLocal(fixture.manifestBytes,fixture.payloadBytes,fixture.trustedManifestSha);}
    catch(error){console.warn('Catalogue update rejected; saved generation retained',error);return false;}
  }
  window.ByuGeneration={checkOnResume,activeTitles:async()=>{const x=await active();return x?.document||null;},activeRevision:async()=>{const x=await active();return x?.revision||null;},installLocal};
})();
