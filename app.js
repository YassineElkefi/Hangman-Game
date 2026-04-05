const wordList = [
  { word: "javascript",      hint: "Scripting language for web development" },
  { word: "nodejs",          hint: "JavaScript runtime for server-side development" },
  { word: "html",            hint: "Markup language for creating web pages" },
  { word: "css",             hint: "Stylesheet language for styling web pages" },
  { word: "react",           hint: "JavaScript library for building user interfaces" },
  { word: "python",          hint: "High-level programming language used for various applications" },
  { word: "api",             hint: "Application Programming Interface, defines interactions between software components" },
  { word: "git",             hint: "Version control system for tracking changes in source code" },
  { word: "database",        hint: "Structured collection of data, often stored and accessed using SQL" },
  { word: "java",            hint: "Object-oriented programming language used for building enterprise-level applications" },
  { word: "rest",            hint: "Representational State Transfer, an architectural style for designing networked applications" },
  { word: "json",            hint: "JavaScript Object Notation, lightweight data interchange format" },
  { word: "devops",          hint: "Collaborative approach between Development and Operations teams" },
  { word: "containerization",hint: "Encapsulating an application and its dependencies into a container" },
  { word: "agile",           hint: "Software development methodology emphasizing iterative and incremental development" },
  { word: "scrum",           hint: "Framework for Agile development, emphasizing teamwork and iterative progress" },
  { word: "cybersecurity",   hint: "Practices and measures to protect systems, networks, and data from digital attacks" },
  { word: "angular",         hint: "JavaScript framework for building single-page applications" },
  { word: "sql",             hint: "Structured Query Language, used for managing relational databases" },
  { word: "backend",         hint: "Server-side of an application responsible for business logic and data storage" },
  { word: "frontend",        hint: "Client-side of an application responsible for the user interface" },
  { word: "cloud",           hint: "Delivery of computing services over the internet" },
  { word: "docker",          hint: "Platform for deploying applications within lightweight, portable containers" },
  { word: "graphql",         hint: "Query language and runtime for APIs, designed as a flexible alternative to REST" },
];

// ── DOM References ──
const wordDisplay    = document.getElementById("word-display");
const hintText       = document.getElementById("hint-text");
const wrongCount     = document.getElementById("wrong-count");
const livesBar       = document.getElementById("lives-bar");
const keyboardDiv    = document.getElementById("keyboard");
const modal          = document.getElementById("modal");
const modalTitle     = document.getElementById("modal-title");
const modalSub       = document.getElementById("modal-sub");
const modalWord      = document.getElementById("modal-word");
const modalEmoji     = document.getElementById("modal-emoji");
const playAgainBtn   = document.getElementById("play-again");
const themeToggle    = document.getElementById("theme-toggle");
const scoreValue     = document.getElementById("score-value");

const bodyParts = ["h-head", "h-body", "h-larm", "h-rarm", "h-lleg", "h-rleg"];
const maxGuesses = 6;

// ── State ──
let currentWord      = "";
let correctLetters   = [];
let wrongGuessCounter = 0;
let score            = 0;


// Theming
function getStoredTheme() {
  return localStorage.getItem("hangman-theme") || "dark";
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("hangman-theme", theme);
}

themeToggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  applyTheme(current === "dark" ? "light" : "dark");
});

// Apply saved theme on load
applyTheme(getStoredTheme());


// Lives
function updateLives() {
  const pips = livesBar.querySelectorAll(".life-pip");
  pips.forEach((pip, i) => {
    pip.classList.toggle("lost", i >= (maxGuesses - wrongGuessCounter));
  });
}


// Word Display
function buildWordDisplay() {
  wordDisplay.innerHTML = "";
  currentWord.split("").forEach(() => {
    const li = document.createElement("li");
    li.classList.add("letter");
    li.dataset.letter = "";
    wordDisplay.appendChild(li);
  });
}

function revealLetter(letter) {
  const items = wordDisplay.querySelectorAll("li.letter");
  currentWord.split("").forEach((l, i) => {
    if (l === letter) {
      items[i].dataset.letter = letter.toUpperCase();
      items[i].classList.add("guessed");
    }
  });
}


//Gallows
function showBodyPart(index) {
  const el = document.getElementById(bodyParts[index]);
  if (el) el.classList.add("visible");
}

function resetGallows() {
  bodyParts.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove("visible");
  });
}


//Modal
function showModal(isWon) {
  setTimeout(() => {
    modalEmoji.textContent       = isWon ? "🏆" : "💀";
    modalTitle.textContent       = isWon ? "You Won!" : "Game Over";
    modalTitle.className         = "modal-title " + (isWon ? "win" : "lose");
    modalSub.textContent         = isWon ? "You guessed the word:" : "The correct word was:";
    modalWord.textContent        = currentWord.toUpperCase();
    modal.classList.add("show");
  }, 350);
}


//RESET
const resetGame = () => {
  const { word, hint } = wordList[Math.floor(Math.random() * wordList.length)];
  currentWord        = word;
  correctLetters     = [];
  wrongGuessCounter  = 0;

  //console.log("Word:", word);

  hintText.textContent       = hint;
  wrongCount.textContent     = `0 / ${maxGuesses}`;

  resetGallows();
  buildWordDisplay();
  updateLives();
  modal.classList.remove("show");

  keyboardDiv.querySelectorAll("button").forEach(btn => {
    btn.disabled = false;
    btn.className = "";
  });
};


// Game Logic
const initGame = (button, clickedLetter) => {
  button.disabled = true;

  if (currentWord.includes(clickedLetter)) {
    // Correct guess
    correctLetters.push(clickedLetter);
    revealLetter(clickedLetter);
    button.classList.add("correct-key");

    const uniqueLetters = [...new Set(currentWord.split(""))];
    const allGuessed    = uniqueLetters.every(l => correctLetters.includes(l));
    if (allGuessed) {
      score++;
      scoreValue.textContent = score;
      return showModal(true);
    }
  } else {
    wrongGuessCounter++;
    showBodyPart(wrongGuessCounter - 1);
    button.classList.add("wrong-key");
    wrongCount.textContent = `${wrongGuessCounter} / ${maxGuesses}`;
    updateLives();

    if (wrongGuessCounter === maxGuesses) return showModal(false);
  }
};


//Keyboard
for (let i = 97; i <= 122; i++) {
  const btn = document.createElement("button");
  btn.textContent = String.fromCharCode(i);
  keyboardDiv.appendChild(btn);
  btn.addEventListener("click", e => initGame(e.target, String.fromCharCode(i)));
}


//Keyboard Shortcuts
document.addEventListener("keydown", e => {
  const key = e.key.toLowerCase();
  if (key.length !== 1 || key < "a" || key > "z") return;
  const btn = [...keyboardDiv.querySelectorAll("button")].find(
    b => b.textContent === key && !b.disabled
  );
  if (btn) btn.click();
});


//Events
playAgainBtn.addEventListener("click", resetGame);


//Init game
resetGame();