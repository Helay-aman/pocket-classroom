// main.js
import { renderLibrary } from './library.js';
import { initAuthor } from './author.js';
import { initLearn } from './learn.js';
import { LS } from './storage.js';
import { slugify } from './utils.js';

const author = initAuthor();
const learn = initLearn();

const libraryEl = document.getElementById('libraryGrid');
renderLibrary(libraryEl, handleLibraryAction);
learn.refreshSelector();

// Tab switching
document.querySelectorAll('#topTabs a').forEach(a => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('#topTabs a').forEach(x => x.classList.remove('active'));
    a.classList.add('active');
    const target = a.dataset.target;
    document.querySelectorAll('.app-section').forEach(sec => sec.style.display = 'none');
    document.getElementById(target).style.display = '';
    // refresh library when opened
    if (target === 'library') {
      renderLibrary(libraryEl, handleLibraryAction);
    }
    if (target === 'learn') learn.refreshSelector();
  });
});

// top buttons
document.getElementById('btnNew').addEventListener('click', () => {
  document.querySelector('[data-target="author"]').click();
  author.newEmpty();
});
document.getElementById('btnImport').addEventListener('click', () => {
  document.getElementById('importFile').click();
});
document.getElementById('importFile').addEventListener('change', (e) => {
  const f = e.target.files[0];
  if (!f) return;
  const fr = new FileReader();
  fr.onload = (ev) => {
    try {
      const obj = JSON.parse(ev.target.result);
      const id = author.validateJsonAndSave(obj);
      if (id) {
        alert('Import successful');
        document.querySelector('[data-target="library"]').click();
        renderLibrary(libraryEl, handleLibraryAction);
      } else alert('Invalid file');
    } catch(err) {
      alert('Invalid JSON');
    }
  };
  fr.readAsText(f);
});

// theme toggle (light/dark)
const themeToggle = document.getElementById('themeToggle');
const themeKey = 'pc_theme';
function applyTheme(t){
  if (t === 'light') {
    document.body.classList.remove('bg-dark');
    document.body.classList.add('bg-light','text-dark');
  } else {
    document.body.classList.remove('bg-light','text-dark');
    document.body.classList.add('bg-dark','text-light');
  }
  localStorage.setItem(themeKey, t);
}
themeToggle.addEventListener('click', () => {
  const cur = localStorage.getItem(themeKey) || 'dark';
  applyTheme(cur === 'dark' ? 'light' : 'dark');
});
applyTheme(localStorage.getItem(themeKey) || 'dark');

// library action handler
function handleLibraryAction(action, id) {
  if (action === 'learn') {
    document.querySelector('[data-target="learn"]').click();
    // set selector value and load
    const sel = document.getElementById('learnSelector');
    sel.value = id;
    sel.dispatchEvent(new Event('change'));
  } else if (action === 'edit') {
    document.querySelector('[data-target="author"]').click();
    author.loadCapsuleForEdit(id);
  } else if (action === 'export') {
    const cap = LS.loadCapsule(id);
    if (!cap) return alert('Missing capsule');
    const blob = new Blob([JSON.stringify(cap, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slugify(cap.meta.title || 'capsule')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  } else if (action === 'delete') {
    if (!confirm('Delete capsule?')) return;
    LS.deleteCapsule(id);
    renderLibrary(libraryEl, handleLibraryAction);
    learn.refreshSelector();
  }
}

// keyboard shortcuts: [, ] to cycle tabs (Notes/Flashcards/Quiz)
window.addEventListener('keydown', (e) => {
  if (['[',']'].includes(e.key)) {
    const learnButtons = Array.from(document.querySelectorAll('[data-learn-tab]'));
    const curIndex = learnButtons.findIndex(b => b.classList.contains('active'));
    const nextIndex = e.key === ']' ? (curIndex + 1) % learnButtons.length : (curIndex - 1 + learnButtons.length) % learnButtons.length;
    learnButtons[nextIndex].click();
  }
});
