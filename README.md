#  Pocket Classroom – Offline Learning Capsules

A single-page web app (SPA) built with **HTML, CSS (Bootstrap), and Vanilla JavaScript** that lets students create, study, and share mini learning “capsules” — including **notes, flashcards, and quizzes** — all working **offline** with **LocalStorage**.

---

##  Live Demo

 [Live Demo Link (GitHub Pages)](https://your-github-username.github.io/pocket-classroom)

*(Replace the above link with your deployed GitHub Pages URL)*

---

##  Features

###  Library
- Displays all saved learning capsules.
- Shows title, subject, level, last updated time.
- Actions: **Learn**, **Edit**, **Export**, **Delete**.
- Supports importing/exporting capsules as JSON.

###  Author Mode
- Create or edit capsules with:
  - Meta info (Title, Subject, Level, Description)
  - Notes editor (multi-line text)
  - Flashcards editor (front/back)
  - Quiz editor (4 choices + correct answer)
- Auto-save and manual save.
- Validation ensures at least one content type (note/flashcard/quiz) exists.

###  Learn Mode
- Tabs for **Notes**, **Flashcards**, and **Quiz**.
- Notes: searchable list.
- Flashcards: flip animation, mark known/unknown, progress stored in LocalStorage.
- Quiz: sequential questions, instant feedback, score tracking & best score saved.

###  Persistence
- Fully offline; all data saved in **LocalStorage**.
- JSON export/import with schema:
  ```json
  "schema": "pocket-classroom/v1"
  
  ## 🚀 Live Demo
[View here](https://helay-aman.github.io/pocket-classroom/)


