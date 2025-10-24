// learn.js
import { LS } from './storage.js';
import { escapeHtml } from './utils.js';

export function initLearn() {
  const selector = document.getElementById('learnSelector');
  const notesPane = document.getElementById('learnNotes');
  const flashPane = document.getElementById('learnFlashcards');
  const quizPane = document.getElementById('learnQuiz');
  const notesList = document.getElementById('notesList');
  const noteSearch = document.getElementById('noteSearch');

  const flashArea = document.getElementById('flashcardArea');
  const prevBtn = document.getElementById('prevCard');
  const nextBtn = document.getElementById('nextCard');
  const flipBtn = document.getElementById('flipCard');
  const markKnown = document.getElementById('markKnown');
  const markUnknown = document.getElementById('markUnknown');
  const counters = document.getElementById('cardCounters');

  const quizQuestion = document.getElementById('quizQuestion');
  const quizChoices = document.getElementById('quizChoices');
  const quizControls = document.getElementById('quizControls');

  let capsules = [];
  let currentCapsule = null;
  let fcIndex = 0;
  let flipped = false;
  let progress = { bestScore:0, knownFlashcards:[] };

  function refreshSelector() {
    selector.innerHTML = '';
    capsules = LS.loadIndex();
    if (!capsules.length) {
      selector.innerHTML = '<option value="">-- no capsules --</option>';
      return;
    }
    for (const c of capsules) {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.title + (c.subject ? ` — ${c.subject}` : '');
      selector.appendChild(opt);
    }
    if (!selector.value) selector.value = capsules[0].id;
    loadCapsule(selector.value);
  }

  function loadCapsule(id) {
    if (!id) return;
    currentCapsule = LS.loadCapsule(id);
    progress = LS.loadProgress(id);
    renderMeta();
    renderNotes();
    prepareFlashcards();
    prepareQuiz();
  }

  function renderMeta() {
    const meta = document.getElementById('learnMeta');
    if (!currentCapsule) { meta.innerHTML = ''; return; }
    meta.innerHTML = `<h4>${escapeHtml(currentCapsule.meta.title)} <small class="small-muted"> ${escapeHtml(currentCapsule.meta.subject)}</small></h4>`;
  }

  // NOTES
  function renderNotes(filter='') {
    notesList.innerHTML = '';
    const notes = (currentCapsule && currentCapsule.notes) ? currentCapsule.notes : [];
    const filtered = notes.filter(n => n.toLowerCase().includes(filter.toLowerCase()));
    filtered.forEach(n => {
      const li = document.createElement('li');
      li.innerHTML = escapeHtml(n);
      notesList.appendChild(li);
    });
  }

  noteSearch.addEventListener('input', (e) => {
    renderNotes(e.target.value);
  });

  selector.addEventListener('change', (e) => {
    loadCapsule(e.target.value);
  });

  // FLASHCARDS
  function prepareFlashcards() {
    fcIndex = 0;
    flipped = false;
    renderCard();
    updateCounters();
  }

  function renderCard() {
    flashArea.innerHTML = '';
    const cards = currentCapsule?.flashcards || [];
    if (!cards.length) {
      flashArea.innerHTML = '<div class="text-muted">No flashcards</div>';
      counters.textContent = '';
      return;
    }
    const card = cards[fcIndex];
    const container = document.createElement('div');
    container.className = 'card front-back';
    const front = document.createElement('div');
    front.className = 'card-face front';
    front.innerHTML = `<div class="fs-5 text-center">${escapeHtml(card.front)}</div>`;
    const back = document.createElement('div');
    back.className = 'card-face back';
    back.innerHTML = `<div class="fs-5 text-center">${escapeHtml(card.back)}</div>`;
    container.appendChild(front);
    container.appendChild(back);
    if (flipped) container.classList.add('flip');
    flashArea.appendChild(container);
  }

  function updateCounters() {
    const cards = currentCapsule?.flashcards || [];
    const known = progress?.knownFlashcards || [];
    counters.textContent = `Card ${fcIndex+1}/${cards.length} • Known: ${known.length}`;
  }

  prevBtn.addEventListener('click', () => {
    const n = (currentCapsule?.flashcards || []).length;
    if (!n) return;
    fcIndex = (fcIndex - 1 + n) % n;
    flipped = false;
    renderCard();
    updateCounters();
  });
  nextBtn.addEventListener('click', () => {
    const n = (currentCapsule?.flashcards || []).length;
    if (!n) return;
    fcIndex = (fcIndex + 1) % n;
    flipped = false;
    renderCard();
    updateCounters();
  });
  flipBtn.addEventListener('click', () => {
    flipped = !flipped;
    renderCard();
  });

  markKnown.addEventListener('click', () => {
    if (!currentCapsule) return;
    progress.knownFlashcards = progress.knownFlashcards || [];
    if (!progress.knownFlashcards.includes(fcIndex)) progress.knownFlashcards.push(fcIndex);
    LS.saveProgress(currentCapsule.id, progress);
    updateCounters();
  });

  markUnknown.addEventListener('click', () => {
    if (!currentCapsule) return;
    progress.knownFlashcards = (progress.knownFlashcards || []).filter(i => i !== fcIndex);
    LS.saveProgress(currentCapsule.id, progress);
    updateCounters();
  });

  // QUIZ
  let qIndex = 0;
  let score = 0;
  function prepareQuiz() {
    qIndex = 0;
    score = 0;
    quizQuestion.innerHTML = '';
    quizChoices.innerHTML = '';
    quizControls.textContent = '';
    if (!currentCapsule || !currentCapsule.quiz || !currentCapsule.quiz.length) {
      quizQuestion.innerHTML = '<div class="text-muted">No quiz questions</div>';
      return;
    }
    showQuestion(qIndex);
  }

  function showQuestion(i) {
    const q = currentCapsule.quiz[i];
    quizQuestion.textContent = q.q;
    quizChoices.innerHTML = '';
    q.choices.forEach((c, idx)=>{
      const b = document.createElement('button');
      b.className = 'btn btn-outline-light d-block mb-2';
      b.textContent = c || '';
      b.addEventListener('click', () => {
        // immediate feedback
        const correct = idx === q.correct;
        if (correct) score++;
        // show brief feedback then next
        Array.from(quizChoices.children).forEach(ch => ch.disabled = true);
        b.classList.toggle('btn-success', correct);
        b.classList.toggle('btn-danger', !correct);
        setTimeout(() => {
          qIndex++;
          if (qIndex >= currentCapsule.quiz.length) {
            finishQuiz();
          } else showQuestion(qIndex);
        }, 700);
      });
      quizChoices.appendChild(b);
    });
    quizControls.textContent = `Question ${i+1}/${currentCapsule.quiz.length}`;
  }

  function finishQuiz() {
    const pct = Math.round((score / currentCapsule.quiz.length) * 100);
    quizQuestion.innerHTML = `<div>Score: ${pct}% (${score}/${currentCapsule.quiz.length})</div>`;
    if (!progress.bestScore || pct > progress.bestScore) {
      progress.bestScore = pct;
      LS.saveProgress(currentCapsule.id, progress);
    }
    quizChoices.innerHTML = '';
    quizControls.textContent = `Best: ${progress.bestScore}%`;
  }

  // keyboard handlers
  window.addEventListener('keydown', (e) => {
    // space flips when flashcards visible
    const visibleFlash = !flashPane.style.display || flashPane.style.display === '';
    if (e.code === 'Space' && visibleFlash) {
      e.preventDefault();
      flipped = !flipped;
      renderCard();
    }
  });

  // UI switching from buttons
  document.querySelectorAll('[data-learn-tab]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const which = btn.dataset.learnTab;
      document.querySelectorAll('[data-learn-tab]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      notesPane.style.display = which==='notes' ? '' : 'none';
      flashPane.style.display = which==='flashcards' ? '' : 'none';
      quizPane.style.display = which==='quiz' ? '' : 'none';
    });
  });

  // expose
  return {
    refreshSelector,
    loadCapsule,
    current() { return currentCapsule; }
  };
}
