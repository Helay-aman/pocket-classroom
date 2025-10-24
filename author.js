// author.js
import { LS } from './storage.js';
import { uid, escapeHtml } from './utils.js';

function blankCapsule() {
  return {
    schema: 'pocket-classroom/v1',
    id: null,
    meta: { title:'', subject:'', level:'Beginner', description:'' },
    notes: [],
    flashcards: [], // [{front, back}]
    quiz: [], // [{q, choices:[...], correct:0, explanation:''}]
    updatedAt: new Date().toISOString()
  };
}

export function initAuthor() {
  const form = document.getElementById('authorForm');
  const notesArea = document.getElementById('notesArea');
  const fcEditor = document.getElementById('flashcardsEditor');
  const quizEditor = document.getElementById('quizEditor');

  function clearEditor() {
    document.getElementById('capsuleId').value = '';
    document.getElementById('metaTitle').value = '';
    document.getElementById('metaSubject').value = '';
    document.getElementById('metaLevel').value = 'Beginner';
    document.getElementById('metaDesc').value = '';
    notesArea.value = '';
    fcEditor.innerHTML = '';
    quizEditor.innerHTML = '';
    document.getElementById('authorMsg').textContent = '';
  }

  function renderFlashcardRow(card = {front:'',back:''}, idx = null) {
    const id = uid(6);
    const li = document.createElement('div');
    li.className = 'list-group-item flashcard-row';
    li.dataset.idx = idx ?? '';
    li.innerHTML = `
      <input class="form-control form-control-sm fc-front" placeholder="Front" value="${escapeHtml(card.front)}" />
      <input class="form-control form-control-sm fc-back" placeholder="Back" value="${escapeHtml(card.back)}" />
      <button class="btn btn-sm btn-outline-danger btn-remove"><i class="fa fa-trash"></i></button>
    `;
    li.querySelector('.btn-remove').addEventListener('click', () => li.remove());
    return li;
  }

  function renderQuestionBlock(q = null) {
    const id = uid(6);
    const idx = quizEditor.children.length;
    const wrapper = document.createElement('div');
    wrapper.className = 'accordion-item';
    wrapper.innerHTML = `
      <h2 class="accordion-header">
        <button class="accordion-button collapsed" type="button">${q ? escapeHtml(q.q).slice(0,40) : 'New question'}</button>
      </h2>
      <div class="accordion-collapse collapse show">
        <div class="accordion-body">
          <input class="form-control q-text mb-2" placeholder="Question" value="${q ? escapeHtml(q.q) : ''}" />
          <div class="mb-2 choices">
            <input class="form-control mb-1 choice" placeholder="Choice A" value="${q && q.choices[0] ? escapeHtml(q.choices[0]) : ''}" />
            <input class="form-control mb-1 choice" placeholder="Choice B" value="${q && q.choices[1] ? escapeHtml(q.choices[1]) : ''}" />
            <input class="form-control mb-1 choice" placeholder="Choice C" value="${q && q.choices[2] ? escapeHtml(q.choices[2]) : ''}" />
            <input class="form-control mb-1 choice" placeholder="Choice D" value="${q && q.choices[3] ? escapeHtml(q.choices[3]) : ''}" />
          </div>
          <div class="d-flex gap-2 align-items-center">
            <label class="m-0 small-muted">Correct:</label>
            <select class="form-select form-select-sm correct" style="width:auto;">
              <option value="0">A</option>
              <option value="1">B</option>
              <option value="2">C</option>
              <option value="3">D</option>
            </select>
            <button class="btn btn-sm btn-danger ms-auto btn-remove-q">Remove</button>
          </div>
          <textarea class="form-control mt-2 explanation" rows="2" placeholder="Explanation (optional)">${q && q.explanation ? escapeHtml(q.explanation) : ''}</textarea>
        </div>
      </div>
    `;
    if (q && typeof q.correct === 'number') wrapper.querySelector('.correct').value = q.correct;
    wrapper.querySelector('.btn-remove-q').addEventListener('click', () => wrapper.remove());
    return wrapper;
  }

  document.getElementById('addCard').addEventListener('click', () => {
    fcEditor.appendChild(renderFlashcardRow());
  });

  document.getElementById('addQuestion').addEventListener('click', () => {
    quizEditor.appendChild(renderQuestionBlock());
  });

  document.getElementById('btnCancelEdit').addEventListener('click', (e) => {
    e.preventDefault();
    clearEditor();
    // switch back to library tab externally via main.js
    document.querySelector('[data-target="library"]').click();
  });

  // Auto-save (simple debounce)
  let autoTimer = null;
  form.addEventListener('input', () => {
    clearTimeout(autoTimer);
    autoTimer = setTimeout(() => saveDraft(false), 700);
  });

  function gatherFromForm() {
    const id = document.getElementById('capsuleId').value || null;
    const meta = {
      title: document.getElementById('metaTitle').value.trim(),
      subject: document.getElementById('metaSubject').value.trim(),
      level: document.getElementById('metaLevel').value,
      description: document.getElementById('metaDesc').value.trim()
    };
    const notes = (document.getElementById('notesArea').value || '').split(/\r?\n/).map(s=>s.trim()).filter(s=>s.length);
    const flashcards = Array.from(fcEditor.querySelectorAll('.flashcard-row')).map(row => {
      const f = row.querySelector('.fc-front').value.trim();
      const b = row.querySelector('.fc-back').value.trim();
      return { front: f, back: b };
    }).filter(c => c.front || c.back);
    const quiz = Array.from(quizEditor.querySelectorAll('.accordion-item')).map(block => {
      const qtxt = block.querySelector('.q-text').value.trim();
      const choices = Array.from(block.querySelectorAll('.choice')).map(i=>i.value.trim());
      const correct = parseInt(block.querySelector('.correct').value,10) || 0;
      const explanation = block.querySelector('.explanation').value.trim();
      return { q: qtxt, choices, correct, explanation };
    }).filter(q => q.q && q.choices.some(c => c));
    return { id, meta, notes, flashcards, quiz };
  }

  function saveDraft(showMsg=true) {
    const data = gatherFromForm();
    const ok = data.meta.title && (data.notes.length || data.flashcards.length || data.quiz.length);
    if (!ok) {
      if (showMsg) document.getElementById('authorMsg').textContent = 'Title plus at least one content type required';
      return false;
    }
    const cid = data.id || uid(10);
    const capsule = {
      schema:'pocket-classroom/v1',
      id: cid,
      meta: data.meta,
      notes: data.notes,
      flashcards: data.flashcards,
      quiz: data.quiz,
      updatedAt: new Date().toISOString()
    };
    LS.saveCapsule(cid, capsule);
    document.getElementById('capsuleId').value = cid;
    if (showMsg) document.getElementById('authorMsg').textContent = 'Saved';
    return true;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (saveDraft(true)) {
      // stay or navigate
      document.getElementById('authorMsg').textContent = 'Saved ✅';
    }
  });

  // expose functions
  return {
    loadCapsuleForEdit(id) {
      const cap = LS.loadCapsule(id);
      if (!cap) return;
      document.getElementById('capsuleId').value = cap.id;
      document.getElementById('metaTitle').value = cap.meta.title || '';
      document.getElementById('metaSubject').value = cap.meta.subject || '';
      document.getElementById('metaLevel').value = cap.meta.level || 'Beginner';
      document.getElementById('metaDesc').value = cap.meta.description || '';
      document.getElementById('notesArea').value = (cap.notes || []).join('\n');
      fcEditor.innerHTML = '';
      (cap.flashcards || []).forEach((c,i) => fcEditor.appendChild(renderFlashcardRow(c,i)));
      quizEditor.innerHTML = '';
      (cap.quiz || []).forEach(q => quizEditor.appendChild(renderQuestionBlock(q)));
    },

    newEmpty() {
      clearEditor();
      document.getElementById('capsuleId').value = '';
      document.getElementById('metaLevel').value = 'Beginner';
      // ensure at least one empty flashcard and one empty question for convenience
      fcEditor.innerHTML = '';
      quizEditor.innerHTML = '';
      fcEditor.appendChild(renderFlashcardRow());
      quizEditor.appendChild(renderQuestionBlock());
    },

    validateJsonAndSave(obj) {
      try {
        if (!obj || obj.schema !== 'pocket-classroom/v1') throw new Error('Bad schema');
        if (!obj.meta || !obj.meta.title) throw new Error('Title required');
        // avoid id collisions: create new id
        obj.id = uid(10);
        obj.updatedAt = new Date().toISOString();
        LS.saveCapsule(obj.id, obj);
        return obj.id;
      } catch(e) {
        console.error(e);
        return null;
      }
    }
  };
}
