// utils.js
export function uid(len = 8){
  const s = crypto?.getRandomValues ? [...crypto.getRandomValues(new Uint8Array(len))].map(n => (n%36).toString(36)) : Date.now().toString(36);
  return (s.join ? s.join('') : s).slice(0,len);
}

export function timeAgo(iso){
  try {
    const d = new Date(iso);
    const sec = Math.floor((Date.now()-d.getTime())/1000);
    if (sec < 60) return `${sec}s`;
    if (sec < 3600) return `${Math.floor(sec/60)}m`;
    if (sec < 86400) return `${Math.floor(sec/3600)}h`;
    return `${Math.floor(sec/86400)}d`;
  } catch(e){ return iso; }
}

export function slugify(s='') {
  return s.toString().toLowerCase().trim().replace(/[^\w]+/g,'-').replace(/^-+|-+$/g,'');
}

export function escapeHtml(unsafe) {
  if (!unsafe && unsafe !== 0) return '';
  return String(unsafe).replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}
