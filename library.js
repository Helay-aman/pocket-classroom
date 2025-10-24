// library.js
import { LS } from './storage.js';
import { timeAgo, escapeHtml } from './utils.js';

export function renderLibrary(containerEl, onAction){
  const idx = LS.loadIndex();

  containerEl.innerHTML = '';
  if (!idx.length) {
    document.getElementById('emptyLib').style.display = '';
    return;
  } else document.getElementById('emptyLib').style.display = 'none';

  for (const meta of idx) {
    const col = document.createElement('div');
    col.className = 'col-12 col-md-6 col-lg-4';
    col.innerHTML = `
      <div class="card p-3 h-100 bg-secondary text-light">
        <div class="d-flex">
          <div class="flex-grow-1">
            <h5 class="mb-1">${escapeHtml(meta.title)}</h5>
            <div class="small-muted">${escapeHtml(meta.subject)} • <span class="badge bg-dark">${escapeHtml(meta.level)}</span></div>
            <div class="small-muted mt-2">Updated ${timeAgo(meta.updatedAt)}</div>
          </div>
        </div>
        <div class="mt-3 d-flex gap-2">
          <button class="btn btn-sm btn-light flex-grow-1" data-act="learn" data-id="${meta.id}">Learn</button>
          <button class="btn btn-sm btn-outline-light" data-act="edit" data-id="${meta.id}"><i class="fa fa-pen"></i></button>
          <button class="btn btn-sm btn-outline-light" data-act="export" data-id="${meta.id}"><i class="fa fa-file-export"></i></button>
          <button class="btn btn-sm btn-danger" data-act="delete" data-id="${meta.id}"><i class="fa fa-trash"></i></button>
        </div>
      </div>
    `;
    // event delegation later
    containerEl.appendChild(col);
  }

  containerEl.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-act]');
    if (!btn) return;
    const act = btn.dataset.act;
    const id = btn.dataset.id;
    onAction(act, id);
  });
}
