const cfg = window.RECLAIM_CONFIG;
const SESSION_KEY = 'reclaim.session.v1';

function session() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; }
}
function saveSession(value) {
  if (value) localStorage.setItem(SESSION_KEY, JSON.stringify(value));
  else localStorage.removeItem(SESSION_KEY);
}
async function request(path, options = {}) {
  const current = session();
  const headers = new Headers(options.headers || {});
  headers.set('apikey', cfg.publishableKey);
  headers.set('Content-Type', 'application/json');
  if (current?.access_token) headers.set('Authorization', `Bearer ${current.access_token}`);
  const response = await fetch(`${cfg.supabaseUrl}${path}`, { ...options, headers });
  let body = null;
  try { body = await response.json(); } catch { /* fail closed below */ }
  if (!response.ok) {
    const error = new Error(body?.message || body?.error_description || body?.error || `Request failed (${response.status})`);
    error.status = response.status; error.body = body; throw error;
  }
  return body;
}
async function rest(table, query = '') {
  return request(`/rest/v1/${table}${query}`, { headers: { Accept: 'application/json' } });
}

window.ReclaimAPI = Object.freeze({
  session,
  async signIn(email, password) {
    const data = await request('/auth/v1/token?grant_type=password', { method: 'POST', body: JSON.stringify({ email, password }) });
    saveSession(data); return data;
  },
  async signUp(email, password) {
    return request('/auth/v1/signup', { method: 'POST', body: JSON.stringify({ email, password }) });
  },
  async signOut() {
    try { if (session()?.access_token) await request('/auth/v1/logout', { method: 'POST' }); } finally { saveSession(null); }
  },
  async currentUser() {
    if (!session()?.access_token) return null;
    try { return await request('/auth/v1/user'); } catch { saveSession(null); return null; }
  },
  async claims() { return rest('container_claims', '?select=id,state,created_at&order=created_at.desc'); },
  async evidence() { return rest('evidence_observations', '?select=id,claim_id,manifest_id,recovery_event_id,source,observation_type,model_provider,model_id,model_version,confidence,observed_at&order=observed_at.desc'); },
  async manifests() { return rest('collection_manifests', '?select=id,status,created_at&order=created_at.desc'); },
  async manifestItems() { return rest('manifest_items', '?select=manifest_id,claim_id'); },
  async recoveryEvents() { return rest('recovery_events', '?select=id,manifest_id,facility_id,verification_method,verified_at&order=verified_at.desc'); },
  async rewards() { return rest('reward_ledger', '?select=id,recovery_event_id,amount_minor_units,currency,created_at&order=created_at.desc'); },
  async createScan() {
    const user = await this.currentUser();
    if (!user?.id) throw new Error('Authentication required');
    const rows = await request('/rest/v1/container_claims?select=id,state,created_at', {
      method: 'POST', headers: { Prefer: 'return=representation' },
      body: JSON.stringify({ user_id: user.id, state: 'scanned' }),
    });
    return rows?.[0] || null;
  },
  async createManifest() {
    const user = await this.currentUser();
    if (!user?.id) throw new Error('Authentication required');
    const rows = await request('/rest/v1/collection_manifests?select=id,status,created_at', {
      method: 'POST', headers: { Prefer: 'return=representation' },
      body: JSON.stringify({ user_id: user.id, status: 'open' }),
    });
    return rows?.[0] || null;
  },
  async invoke(name, body) {
    return request(`/functions/v1/${name}`, { method: 'POST', body: JSON.stringify(body) });
  },
});
