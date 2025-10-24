// storage.js
export const LS = {
  INDEX_KEY: 'pc_capsules_index',
  CAPSULE_KEY: id => `pc_capsule_${id}`,
  PROGRESS_KEY: id => `pc_progress_${id}`,

  loadIndex() {
    try {
      const raw = localStorage.getItem(this.INDEX_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { console.error(e); return []; }
  },

  saveIndex(index) {
    localStorage.setItem(this.INDEX_KEY, JSON.stringify(index));
  },

  saveCapsule(id, capsule) {
    localStorage.setItem(this.CAPSULE_KEY(id), JSON.stringify(capsule));
    // update index
    const idx = this.loadIndex();
    const existing = idx.find(i => i.id === id);
    const meta = { id, title: capsule.meta.title, subject: capsule.meta.subject || '', level: capsule.meta.level || 'Beginner', updatedAt: capsule.updatedAt || new Date().toISOString() };
    if (existing) {
      Object.assign(existing, meta);
    } else {
      idx.unshift(meta);
    }
    this.saveIndex(idx);
  },

  loadCapsule(id) {
    try {
      const raw = localStorage.getItem(this.CAPSULE_KEY(id));
      return raw ? JSON.parse(raw) : null;
    } catch(e){ console.error(e); return null; }
  },

  deleteCapsule(id) {
    localStorage.removeItem(this.CAPSULE_KEY(id));
    localStorage.removeItem(this.PROGRESS_KEY(id));
    const idx = this.loadIndex().filter(i => i.id !== id);
    this.saveIndex(idx);
  },

  loadProgress(id) {
    try {
      const raw = localStorage.getItem(this.PROGRESS_KEY(id));
      return raw ? JSON.parse(raw) : { bestScore: 0, knownFlashcards: [] };
    } catch(e){ console.error(e); return { bestScore:0, knownFlashcards: [] }; }
  },

  saveProgress(id, progress) {
    localStorage.setItem(this.PROGRESS_KEY(id), JSON.stringify(progress));
  },

  clearAll() {
    // careful: only clear keys we created
    const keys = Object.keys(localStorage);
    for (const k of keys) {
      if (k.startsWith('pc_')) localStorage.removeItem(k);
    }
  }
};
