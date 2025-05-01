// DOM Elements
const welcomeScreen = document.getElementById('welcome-screen');
const gameScreen = document.getElementById('game-screen');
const playerNameInput = document.getElementById('player-name');
const playerNameDisplay = document.getElementById('player-name-display');
const startGameBtn = document.getElementById('start-game');
const easyModeBtn = document.getElementById('easy-mode');
const mediumModeBtn = document.getElementById('medium-mode');
const hardModeBtn = document.getElementById('hard-mode');
const playAgainBtn = document.getElementById('play-again');
const resetGameBtn = document.getElementById('reset-game');
const matchCountDisplay = document.getElementById('match-count');
const playerWinsDisplay = document.getElementById('player-wins');
const computerWinsDisplay = document.getElementById('computer-wins');
const historyContainer = document.getElementById('history-container');
const rockBtn = document.querySelector(".rock-btn");
const paperBtn = document.querySelector(".paper-btn");
const scissorsBtn = document.querySelector(".scissors-btn");
const showResult = document.querySelector(".show-result");
const choiceContainer = document.querySelector(".choice-container");
const pointsContainer = document.querySelector(".points-container");
const displayPlayerPoints = document.querySelector(".show-player-points");
const displayComputerPoints = document.querySelector(".show-computer-points");
const playerChoiceImg = document.querySelector(".player-choice");
const computerChoiceImg = document.querySelector(".computer-choice");

const rockUrl = 'rockgame.jpg';
const paperUrl = 'papergame.jpg';
const scissorsUrl = 'scissorsgame.jpg';
const defaultUrl = 'default.jpg';

let playerSelection = '';
let computerPoint = 0;
let playerPoint = 0;
let playerName = 'Player';
let difficulty = 'easy';
let matchCount = 1;
let playerWins = 0;
let computerWins = 0;
let gameActive = true;

let playerMoves = [];
let transitionMatrix = {
    'rock': { 'rock': 1/3, 'paper': 1/3, 'scissors': 1/3 },
    'paper': { 'rock': 1/3, 'paper': 1/3, 'scissors': 1/3 },
    'scissors': { 'rock': 1/3, 'paper': 1/3, 'scissors': 1/3 }
};

function defaultSetup() {
    function setImageWithFallback(imgElement, src) {
        imgElement.onerror = function() {
            this.src = defaultUrl;
            this.onerror = function() {
                this.style.display = 'none';
                this.parentElement.innerHTML += '<p class="error-message">Image failed to load</p>';
            };
        };
        imgElement.src = src;
    }

    setImageWithFallback(playerChoiceImg, paperUrl);
    setImageWithFallback(computerChoiceImg, rockUrl);

    const choiceButtons = document.querySelectorAll('.choice-btn img');
    choiceButtons.forEach(button => {
        const imgSrc = button.alt.toLowerCase() === 'rock' ? rockUrl :
                      button.alt.toLowerCase() === 'paper' ? paperUrl :
                      scissorsUrl;
        setImageWithFallback(button, imgSrc);
    });

    displayPlayerPoints.textContent = `Points: ${playerPoint}/5`;
    displayComputerPoints.textContent = `Points: ${computerPoint}/5`;
    showResult.textContent = "Make your choice!";
}

startGameBtn.addEventListener('click', startGame);
playAgainBtn.addEventListener('click', playAgain);
resetGameBtn.addEventListener('click', resetGame);
easyModeBtn.addEventListener('click', () => setDifficulty('easy'));
mediumModeBtn.addEventListener('click', () => setDifficulty('medium'));
hardModeBtn.addEventListener('click', () => setDifficulty('hard'));

rockBtn.addEventListener('click', () => makeMove('rock', rockUrl));
paperBtn.addEventListener('click', () => makeMove('paper', paperUrl));
scissorsBtn.addEventListener('click', () => makeMove('scissors', scissorsUrl));

function startGame() {
    playerName = playerNameInput.value.trim() || 'Player';
    playerNameDisplay.textContent = playerName;
    welcomeScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    playerPoint = 0;
    computerPoint = 0;
    playerWins = 0;
    computerWins = 0;
    matchCount = 1;
    gameActive = true;
    playerWinsDisplay.textContent = playerWins;
    computerWinsDisplay.textContent = computerWins;
    matchCountDisplay.textContent = `Match: ${matchCount}`;
    defaultSetup();
    historyContainer.innerHTML = '';
}

function setDifficulty(level) {
    difficulty = level;
    easyModeBtn.classList.remove('selected');
    mediumModeBtn.classList.remove('selected');
    hardModeBtn.classList.remove('selected');
    document.getElementById(`${level}-mode`).classList.add('selected');
}

function updateMarkovModel(playerMove) {
    if (playerMoves.length === 0) {
        playerMoves.push(playerMove);
        return;
    }
    const lastMove = playerMoves[playerMoves.length - 1];
    playerMoves.push(playerMove);
    const total = Object.values(transitionMatrix[lastMove]).reduce((sum, val) => sum + val, 0);
    transitionMatrix[lastMove][playerMove] += 1;
    for (const move in transitionMatrix[lastMove]) {
        transitionMatrix[lastMove][move] /= (total + 1);
    }
}

function getComputerChoice() {
    let computerMove;
    if (playerMoves.length > 0) {
        const lastPlayerMove = playerMoves[playerMoves.length - 1];
        let predictedMove;
        const probabilities = transitionMatrix[lastPlayerMove];
        const randomValue = Math.random();
        let cumulativeProbability = 0;
        for (const move in probabilities) {
            cumulativeProbability += probabilities[move];
            if (randomValue <= cumulativeProbability) {
                predictedMove = move;
                break;
            }
        }
        const counterMoves = { 'rock': 'paper', 'paper': 'scissors', 'scissors': 'rock' };
        const randMove = () => ['rock', 'paper', 'scissors'][Math.floor(Math.random() * 3)];
        const chance = Math.random();
        const chanceMap = { 'easy': 0.3, 'medium': 0.6, 'hard': 0.9 };
        computerMove = chance < chanceMap[difficulty] ? counterMoves[predictedMove] : randMove();
    } else {
        computerMove = ['rock', 'paper', 'scissors'][Math.floor(Math.random() * 3)];
    }
    computerChoiceImg.src = computerMove === 'rock' ? rockUrl : computerMove === 'paper' ? paperUrl : scissorsUrl;
    return computerMove;
}

function showPoints() {
    displayPlayerPoints.textContent = `Points: ${playerPoint}/5`;
    displayComputerPoints.textContent = `Points: ${computerPoint}/5`;
}

function makeMove(selection, imgUrl) {
    if (!gameActive) return;
    playerSelection = selection;
    playerChoiceImg.src = imgUrl;
    playground();
}

function playground() {
    updateMarkovModel(playerSelection);
    let computerSelection = getComputerChoice();
    let result = '';
    let outcome = '';
    playerChoiceImg.classList.remove('winner');
    computerChoiceImg.classList.remove('winner');
    if (playerPoint < 5 && computerPoint < 5) {
        if (playerSelection === computerSelection) {
            result = "It's a tie!";
        } else if ((playerSelection === 'rock' && computerSelection === 'scissors') ||
                   (playerSelection === 'paper' && computerSelection === 'rock') ||
                   (playerSelection === 'scissors' && computerSelection === 'paper')) {
            result = `You won!! ${capitalize(playerSelection)} beats ${computerSelection}.`;
            playerPoint++;
            outcome = 'win';
            playerChoiceImg.classList.add('winner');
        } else {
            result = `You lose!! ${capitalize(computerSelection)} beats ${playerSelection}.`;
            computerPoint++;
            outcome = 'lose';
            computerChoiceImg.classList.add('winner');
        }
        showResult.textContent = result;
        showPoints();
        const log = `<p>Match ${matchCount}: You chose ${playerSelection}, Computer chose ${computerSelection} - <strong>${outcome.toUpperCase()}</strong></p>`;
        historyContainer.innerHTML += log;
    }

    if (playerPoint === 5 || computerPoint === 5) {
        gameActive = false;
        matchCount++;
        if (playerPoint === 5) playerWins++;
        else computerWins++;
        playerWinsDisplay.textContent = playerWins;
        computerWinsDisplay.textContent = computerWins;
        matchCountDisplay.textContent = `Match: ${matchCount}`;
        showResult.textContent += ' Click Play Again to continue.';
    }
}

function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

function playAgain() {
    playerPoint = 0;
    computerPoint = 0;
    gameActive = true;
    showPoints();
    showResult.textContent = "Make your choice!";
    playerChoiceImg.classList.remove('winner');
    computerChoiceImg.classList.remove('winner');
    defaultSetup();
}

function resetGame() {
    window.location.reload();
}
