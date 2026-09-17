const cfg = window.RECLAIM_CONFIG;
const SESSION_KEY = 'reclaim.session.v1';
function session(){try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}catch{return null}}
function saveSession(v){if(v)localStorage.setItem(SESSION_KEY,JSON.stringify(v));else localStorage.removeItem(SESSION_KEY)}
function errorMessage(body,status){const candidate=body?.msg||body?.detail||body?.message||body?.error_description||body?.error?.message||body?.error;if(typeof candidate==='string'&&candidate.trim())return candidate.trim();if(body&&typeof body==='object'){try{const encoded=JSON.stringify(body);if(encoded&&encoded!=='{}')return encoded}catch{}}return `Request failed (${status})`}
async function request(path,options={}){const current=session();const headers=new Headers(options.headers||{});headers.set('apikey',cfg.publishableKey);headers.set('Content-Type','application/json');if(current?.access_token)headers.set('Authorization',`Bearer ${current.access_token}`);const response=await fetch(`${cfg.supabaseUrl}${path}`,{...options,headers});let body=null;try{body=await response.json()}catch{}if(!response.ok){const error=new Error(errorMessage(body,response.status));error.status=response.status;error.body=body;throw error}return body}
async function rest(table,query=''){return request(`/rest/v1/${table}${query}`,{headers:{Accept:'application/json'}})}
window.ReclaimAPI=Object.freeze({
 session,
 async signIn(email,password){const data=await request('/auth/v1/token?grant_type=password',{method:'POST',body:JSON.stringify({email,password})});saveSession(data);return data},
 async signUp(email,password){return request('/auth/v1/signup',{method:'POST',body:JSON.stringify({email,password,options:{emailRedirectTo:cfg.siteUrl}})})},
 async signOut(){try{if(session()?.access_token)await request('/auth/v1/logout',{method:'POST'})}finally{saveSession(null)}},
 async currentUser(){if(!session()?.access_token)return null;try{return await request('/auth/v1/user')}catch{saveSession(null);return null}},
 async claims(){return rest('container_claims','?select=id,state,observed_gtin,product_id,jurisdiction_id,created_at&order=created_at.desc')},
 async evidence(){return rest('evidence_observations','?select=id,claim_id,manifest_id,recovery_event_id,source,observation_type,model_provider,model_id,model_version,confidence,observed_at&order=observed_at.desc')},
 async manifests(){return rest('collection_manifests','?select=id,status,created_at&order=created_at.desc')},
 async manifestItems(){return rest('manifest_items','?select=manifest_id,claim_id')},
 async recoveryEvents(){return rest('recovery_events','?select=id,manifest_id,facility_id,verification_method,verified_at&order=verified_at.desc')},
 async rewards(){return rest('reward_ledger','?select=id,recovery_event_id,amount_minor_units,currency,created_at&order=created_at.desc')},
 async lookupProduct(gtin){const value=String(gtin||'').replace(/\D/g,'');if(!/^\d{8,14}$/.test(value))throw new Error('Enter an 8–14 digit barcode.');const rows=await rest('products',`?select=id,gtin,name,brand,material,volume_ml&gtin=eq.${encodeURIComponent(value)}&limit=1`);return rows?.[0]||null},
 async pilotJurisdiction(){const rows=await rest('jurisdictions','?select=id,code,name&code=eq.US-LA-MOREHOUSE&limit=1');return rows?.[0]||null},
 async createScan(gtin){const user=await this.currentUser();if(!user?.id)throw new Error('Authentication required');const value=String(gtin||'').replace(/\D/g,'');if(!/^\d{8,14}$/.test(value))throw new Error('Enter an 8–14 digit barcode.');const rows=await request('/rest/v1/container_claims?select=id,state,observed_gtin,created_at',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({user_id:user.id,state:'scanned',observed_gtin:value})});return rows?.[0]||null},
 async captureAndIdentify(gtin){const claim=await this.createScan(gtin);const product=await this.lookupProduct(gtin);if(!product)return {claim,product:null,identified:false,reason:'unknown_product'};const jurisdiction=await this.pilotJurisdiction();if(!jurisdiction)return {claim,product,identified:false,reason:'pilot_jurisdiction_unavailable'};const result=await this.invoke('identify-claim',{claim_id:claim.id,product_id:product.id,jurisdiction_id:jurisdiction.id});return {claim:{...claim,state:result.state||'pending'},product,jurisdiction,identified:true}},
 async createManifest(){const user=await this.currentUser();if(!user?.id)throw new Error('Authentication required');const rows=await request('/rest/v1/collection_manifests?select=id,status,created_at',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({user_id:user.id,status:'open'})});return rows?.[0]||null},
 async addClaimToManifest(manifestId,claimId){await request('/rest/v1/manifest_items',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify({manifest_id:manifestId,claim_id:claimId})});return true},
 async submitManifest(manifestId){return this.invoke('submit-manifest',{manifest_id:manifestId})},
 async invoke(name,body){return request(`/functions/v1/${name}`,{method:'POST',body:JSON.stringify(body)})}
});