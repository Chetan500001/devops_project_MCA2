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

console.log('DOM Elements loaded:', {
    welcomeScreen,
    gameScreen,
    playerNameInput,
    startGameBtn,
    rockBtn,
    paperBtn,
    scissorsBtn,
    playerChoiceImg,
    computerChoiceImg
});

// Image URLs
const rockUrl = './images/rockgame.jpg';
const paperUrl = './images/papergame.jpg';
const scissorsUrl = './images/scissorsgame.jpg';

// Game State
let playerSelection = '';
let computerPoint = 0;
let playerPoint = 0;
let playerName = 'Player';
let difficulty = 'easy';
let matchCount = 1;
let playerWins = 0;
let computerWins = 0;
let gameActive = true;

// Markov Chain Model
let playerMoves = [];
let transitionMatrix = {
    'rock': { 'rock': 1/3, 'paper': 1/3, 'scissors': 1/3 },
    'paper': { 'rock': 1/3, 'paper': 1/3, 'scissors': 1/3 },
    'scissors': { 'rock': 1/3, 'paper': 1/3, 'scissors': 1/3 }
};

// Initialize the game setup
function defaultSetup() {
    console.log('Running defaultSetup');
    console.log('Setting images:', {
        playerChoiceImg,
        computerChoiceImg,
        rockUrl,
        paperUrl
    });
    
    // Set default images with error handling
    playerChoiceImg.onerror = function() {
        console.error('Failed to load player choice image');
        this.src = './images/default.jpg'; // Different fallback image
    };
    computerChoiceImg.onerror = function() {
        console.error('Failed to load computer choice image');
        this.src = './images/default.jpg'; // Different fallback image
    };
    
    playerChoiceImg.src = paperUrl;
    computerChoiceImg.src = rockUrl;
    displayPlayerPoints.textContent = `Points: ${playerPoint}/5`;
    displayComputerPoints.textContent = `Points: ${computerPoint}/5`;
    showResult.textContent = "Make your choice!";
    
    console.log('Default setup completed');
}

// Event Listeners
console.log('Setting up event listeners...');
startGameBtn.addEventListener('click', startGame);
playAgainBtn.addEventListener('click', playAgain);
resetGameBtn.addEventListener('click', resetGame);
easyModeBtn.addEventListener('click', () => setDifficulty('easy'));
mediumModeBtn.addEventListener('click', () => setDifficulty('medium'));
hardModeBtn.addEventListener('click', () => setDifficulty('hard'));

rockBtn.addEventListener('click', () => {
    console.log('Rock button clicked');
    if (!gameActive) return;
    playerSelection = 'rock';
    playerChoiceImg.src = rockUrl;
    playground();
});

paperBtn.addEventListener('click', () => {
    console.log('Paper button clicked');
    if (!gameActive) return;
    playerSelection = 'paper';
    playerChoiceImg.src = paperUrl;
    playground();
});

scissorsBtn.addEventListener('click', () => {
    console.log('Scissors button clicked');
    if (!gameActive) return;
    playerSelection = 'scissors';
    playerChoiceImg.src = scissorsUrl;
    playground();
});

console.log('Event listeners set up');

// Start Game Function
function startGame() {
    console.log('Starting game...');
    playerName = playerNameInput.value.trim() || 'Player';
    playerNameDisplay.textContent = playerName;
    
    console.log('Toggling screens...');
    welcomeScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    
    // Reset game state
    playerPoint = 0;
    computerPoint = 0;
    playerWins = 0;
    computerWins = 0;
    matchCount = 1;
    gameActive = true;
    
    // Update displays
    playerWinsDisplay.textContent = playerWins;
    computerWinsDisplay.textContent = computerWins;
    matchCountDisplay.textContent = `Match: ${matchCount}`;
    
    // Initialize the game setup
    defaultSetup();
    
    // Clear history
    historyContainer.innerHTML = '';
    
    console.log('Game started successfully');
}

// Set Game Difficulty
function setDifficulty(level) {
    difficulty = level;
    
    // Reset selected class on all buttons
    easyModeBtn.classList.remove('selected');
    mediumModeBtn.classList.remove('selected');
    hardModeBtn.classList.remove('selected');
    
    // Add selected class to the clicked button
    document.getElementById(`${level}-mode`).classList.add('selected');
}

// Update Markov Chain Model
function updateMarkovModel(playerMove) {
    if (playerMoves.length === 0) {
        playerMoves.push(playerMove);
        return;
    }
    
    const lastMove = playerMoves[playerMoves.length - 1];
    playerMoves.push(playerMove);
    
    // Update transition probabilities
    const total = Object.values(transitionMatrix[lastMove]).reduce((sum, val) => sum + val, 0);
    
    // Increase the probability for the observed transition
    transitionMatrix[lastMove][playerMove] += 1;
    
    // Normalize probabilities
    for (const move in transitionMatrix[lastMove]) {
        transitionMatrix[lastMove][move] /= (total + 1);
    }
}

// Get Computer Choice based on Markov Chain prediction and difficulty
function getComputerChoice() {
    let computerMove;
    
    if (playerMoves.length > 0) {
        const lastPlayerMove = playerMoves[playerMoves.length - 1];
        let predictedMove;
        
        // Predict next player move based on Markov model
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
        
        // Determine counter move based on prediction
        const counterMoves = {
            'rock': 'paper',
            'paper': 'scissors',
            'scissors': 'rock'
        };
        
        // Apply different strategies based on difficulty
        switch (difficulty) {
            case 'easy':
                // 30% chance to use counter move, 70% random
                if (Math.random() < 0.3) {
                    computerMove = counterMoves[predictedMove];
                } else {
                    computerMove = ['rock', 'paper', 'scissors'][Math.floor(Math.random() * 3)];
                }
                break;
                
            case 'medium':
                // 60% chance to use counter move, 40% random
                if (Math.random() < 0.6) {
                    computerMove = counterMoves[predictedMove];
                } else {
                    computerMove = ['rock', 'paper', 'scissors'][Math.floor(Math.random() * 3)];
                }
                break;
                
            case 'hard':
                // 90% chance to use counter move, 10% random
                if (Math.random() < 0.9) {
                    computerMove = counterMoves[predictedMove];
                } else {
                    computerMove = ['rock', 'paper', 'scissors'][Math.floor(Math.random() * 3)];
                }
                break;
        }
    } else {
        // First move is random
        computerMove = ['rock', 'paper', 'scissors'][Math.floor(Math.random() * 3)];
    }
    
    // Set computer choice image
    switch (computerMove) {
        case 'rock':
            computerChoiceImg.src = rockUrl;
            break;
        case 'paper':
            computerChoiceImg.src = paperUrl;
            break;
        case 'scissors':
            computerChoiceImg.src = scissorsUrl;
            break;
    }
    
    return computerMove;
}

// Update points display
function showPoints() {
    displayPlayerPoints.textContent = `Points: ${playerPoint}/5`;
    displayComputerPoints.textContent = `Points: ${computerPoint}/5`;
}

// Main game logic
function playground() {
    if (!gameActive) return;
    
    // Update Markov model with player's move
    updateMarkovModel(playerSelection);
    
    let computerSelection = getComputerChoice();
    let result = '';
    let outcome = '';
    
    // Clear previous animations
    playerChoiceImg.classList.remove('winner');
    computerChoiceImg.classList.remove('winner');
    
    if (playerPoint < 5 && computerPoint < 5) {
        if (playerSelection === 'rock') {
            if (computerSelection === 'paper') {
                result = "You lose!! Paper beats rock.";
                computerPoint++;
                outcome = 'lose';
                computerChoiceImg.classList.add('winner');
            } else if (computerSelection === 'scissors') {
                result = "You won!! Rock beats scissors.";
                playerPoint++;
                outcome = 'win';
                playerChoiceImg.classList.add('winner');
            } else if (computerSelection === 'rock') {
                result = "That's a tie!!";
                outcome = 'tie';
            }
        } else if (playerSelection === 'paper') {
            if (computerSelection === "scissors") {
                result = "You lose!! Scissors beats paper.";
                computerPoint++;
                outcome = 'lose';
                computerChoiceImg.classList.add('winner');
            } else if (computerSelection === 'rock') {
                result = "You won!! Paper beats rock.";
                playerPoint++;
                outcome = 'win';
                playerChoiceImg.classList.add('winner');
            } else if (computerSelection === 'paper') {
                result = "That's a tie!!";
                outcome = 'tie';
            }
        } else if (playerSelection === "scissors") {
            if (computerSelection === 'rock') {
                result = "You lose!! Rock beats scissors.";
                computerPoint++;
                outcome = 'lose';
                computerChoiceImg.classList.add('winner');
            } else if (computerSelection === 'paper') {
                result = "You won!! Scissors beats paper.";
                playerPoint++;
                outcome = 'win';
                playerChoiceImg.classList.add('winner');
            } else if (computerSelection === "scissors") {
                result = "That's a tie.";
                outcome = 'tie';
            }
        }
        
        showResult.textContent = result;
        showPoints();
        
        // Add move to history
        addToHistory(playerSelection, computerSelection, outcome);
        
        if (playerPoint === 5 || computerPoint === 5) {
            endRound();
        }
    }
}

// Add match result to history
function addToHistory(playerMove, computerMove, outcome) {
    const historyItem = document.createElement('div');
    historyItem.classList.add('history-item');
    
    const moveInfo = document.createElement('span');
    moveInfo.textContent = `${playerName}: ${playerMove} vs Computer: ${computerMove}`;
    
    const resultInfo = document.createElement('span');
    resultInfo.textContent = outcome.charAt(0).toUpperCase() + outcome.slice(1);
    resultInfo.classList.add(outcome);
    
    historyItem.appendChild(moveInfo);
    historyItem.appendChild(resultInfo);
    
    historyContainer.insertBefore(historyItem, historyContainer.firstChild);
    
    // Limit history to last 10 moves
    if (historyContainer.children.length > 10) {
        historyContainer.removeChild(historyContainer.lastChild);
    }
}

// End current round
function endRound() {
    gameActive = false;
    
    if (playerPoint > computerPoint) {
        showResult.textContent = `Congratulations ${playerName}! You won the round ${playerPoint}-${computerPoint}`;
        playerWins++;
    } else {
        showResult.textContent = `Computer wins this round ${computerPoint}-${playerPoint}. Better luck next time!`;
        computerWins++;
    }
    
    // Update overall stats
    playerWinsDisplay.textContent = playerWins;
    computerWinsDisplay.textContent = computerWins;
}

// Play Again Function
function playAgain() {
    // Reset round points
    playerPoint = 0;
    computerPoint = 0;
    
    // Update match count
    matchCount++;
    matchCountDisplay.textContent = `Match: ${matchCount}`;
    
    // Reset game state
    gameActive = true;
    defaultSetup();
}

// Reset Game Function
function resetGame() {
    // Reset all game stats
    playerPoint = 0;
    computerPoint = 0;
    playerWins = 0;
    computerWins = 0;
    matchCount = 1;
    
    // Reset Markov chain model
    playerMoves = [];
    transitionMatrix = {
        'rock': { 'rock': 1/3, 'paper': 1/3, 'scissors': 1/3 },
        'paper': { 'rock': 1/3, 'paper': 1/3, 'scissors': 1/3 },
        'scissors': { 'rock': 1/3, 'paper': 1/3, 'scissors': 1/3 }
    };
    
    // Update displays
    matchCountDisplay.textContent = `Match: ${matchCount}`;
    playerWinsDisplay.textContent = playerWins;
    computerWinsDisplay.textContent = computerWins;
    
    // Clear history
    historyContainer.innerHTML = '';
    
    // Reset game state
    gameActive = true;
    defaultSetup();
}

// Initialize game on load
document.addEventListener('DOMContentLoaded', () => {
    defaultSetup();
});