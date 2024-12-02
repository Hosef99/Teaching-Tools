// Elements
const menuDiv = document.getElementById('menu');
const gameDiv = document.getElementById('game');
const resultDiv = document.getElementById('result');
const startGameBtn = document.getElementById('startGame');
const submitAnswerBtn = document.getElementById('submitAnswer');
const restartGameBtn = document.getElementById('restartGame');
const questionEl = document.getElementById('question');
const answerInput = document.getElementById('answer');
const timerEl = document.getElementById('timer');
const wrongCountEl = document.getElementById('wrongCount');
const resultMessageEl = document.getElementById('resultMessage');
const recordEl = document.getElementById('record');
const gameHistoryEl = document.getElementById('gameHistory');

// Variables
let multiplier = 0;
let questionList = [];
let currentIndex = 0;
let timeLeft = 30;
let wrongCount = 0;
let sessionRecord = [];
let timerInterval;

// Helper: Load and Save Cookies
function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${JSON.stringify(value)};expires=${d.toUTCString()};path=/`;
}

function getCookie(name) {
    const cookies = document.cookie.split('; ');
    for (const cookie of cookies) {
        const [key, value] = cookie.split('=');
        if (key === name) return JSON.parse(value);
    }
    return null;
}

// Initialize Game History from Cookies
let gameHistory = getCookie('gameHistory') || [];

// Display Game History
function updateGameHistory() {
    gameHistoryEl.innerHTML = '';
    gameHistory.forEach((entry, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${entry.result}</td>
            <td>${entry.correctAnswers}</td>
            <td>${entry.timeLeft}s</td>
        `;
        gameHistoryEl.appendChild(row);
    });
}

// Generate Pairs
function genPair(){
    allPossible = [];
    for (let i = 2; i <= 9; i++) {
        for (let j = i; j < 9; j++) {
            allPossible.push([i,j]);
        }
    }
    return allPossible;
}

// Start Game
function startGame() {
    questionList = (genPair().sort(() => Math.random() - 0.5)).slice(0, 10);
    currentIndex = 0;
    timeLeft = 30;
    wrongCount = 0;
    sessionRecord = [];

    wrongCountEl.innerText = wrongCount;
    recordEl.innerHTML = '';
    menuDiv.classList.add('hidden');
    gameDiv.classList.remove('hidden');

    updateQuestion();
    startTimer();
}

// Update Question
function updateQuestion() {
    if (currentIndex >= questionList.length) {
        endGame('You win! Great job!');
        return;
    }
    const currentPair = questionList[currentIndex];
    questionEl.innerText = `What is ${currentPair[0]*currentPair[1]} ÷ ${currentPair[0]}?`;
    answerInput.value = '';
    answerInput.focus();
}

// Check Answer
function checkAnswer() {
    const userAnswer = parseInt(answerInput.value);
    const currentPair = questionList[currentIndex];
    const correctAnswer = currentPair[1];

    if (userAnswer === correctAnswer) {
        sessionRecord.push(`${currentPair[0]*currentPair[1]} ÷ ${currentPair[0]} = ${correctAnswer}`);
        updateRecord();
        currentIndex++;
        updateQuestion();
    } else {
        flashWrongAnswer();
        wrongCount++;
        wrongCountEl.innerText = wrongCount;
        if (wrongCount >= 3) {
            endGame('You lose! Better luck next time.');
        }
    }
}

// Flash Wrong Answer
function flashWrongAnswer() {
    wrongCountEl.classList.add('wrong-flash');
    setTimeout(() => wrongCountEl.classList.remove('wrong-flash'), 500);
}

// Update Record
function updateRecord() {
    recordEl.innerHTML = '';
    sessionRecord.forEach((entry) => {
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.textContent = entry;
        recordEl.appendChild(li);
    });
}

// Timer
function startTimer() {
    timerEl.innerText = timeLeft;
    timerInterval = setInterval(() => {
        timeLeft--;
        timerEl.innerText = timeLeft;
        if (timeLeft <= 0) {
            endGame('Time is up! You lose.');
        }
    }, 1000);
}

// End Game
function endGame(message) {
    clearInterval(timerInterval);
    gameDiv.classList.add('hidden');
    resultDiv.classList.remove('hidden');
    resultMessageEl.innerText = message;

    // Calculate correct answers
    const correctAnswers = sessionRecord.length;

    // Populate time left summary
    const timeSummary = message.includes('win') ? `Time Left: ${timeLeft} seconds` : 'Time Expired';
    document.getElementById('timeLeftSummary').innerText = timeSummary;

    // Populate results table
    const resultTableBody = document.getElementById('resultTableBody');
    resultTableBody.innerHTML = '';
    sessionRecord.forEach((entry) => {
        const [question, correctAnswer] = entry.split(' = ');
        const row = document.createElement('tr');
        row.innerHTML = `
        <td>${question}</td>
        <td>${correctAnswer}</td>
    `;
        resultTableBody.appendChild(row);
    });


    // Save game history
    const result = message.includes('win') ? 'Win' : 'Lose';
    gameHistory.push({ result, correctAnswers, timeLeft });
    setCookie('gameHistory', gameHistory, 30);
    updateGameHistory();
}

// Restart Game
function restartGame() {
    resultDiv.classList.add('hidden');
    menuDiv.classList.remove('hidden');
}

// Event Listeners
startGameBtn.addEventListener('click', startGame);
submitAnswerBtn.addEventListener('click', checkAnswer);
restartGameBtn.addEventListener('click', restartGame);
answerInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        checkAnswer();
    }
});
updateGameHistory();
