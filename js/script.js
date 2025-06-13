
const emojis = ["🍕", "💩", "🧻", "🪙", "🧠", "🪞", "🍩", "💣", "😺", "👻", "🛸", "🎯"];
let round = 0;
let speed = 3000;
let falling = false;
let gameArea = document.getElementById("game-area");
let item = document.getElementById("item");
let roundDisplay = document.getElementById("round");
let message = document.getElementById("message");
let startBtn = document.getElementById("start-btn");
let leaderboardList = document.getElementById("leaderboard-list");
let submitBtn = document.getElementById("submit-score");
let walletInput = document.getElementById("wallet-input");
let livesDisplay = document.getElementById("lives");
let catchSound = new Audio("sound/catch.mp3");

let gameTimer;
let lives = 5;
let leaderboard = [];
let canSubmit = false;

function randomEmoji() {
    return emojis[Math.floor(Math.random() * emojis.length)];
}

function resetItem() {
    const size = Math.floor(Math.random() * 20) + 40;
    const rotation = Math.floor(Math.random() * 60) - 30;
    const left = Math.floor(Math.random() * 180) + 60;
    const hue = Math.floor(Math.random() * 360);
    const brightness = 0.8 + Math.random() * 0.4;
    item.style.left = left + "px";
    item.style.top = "-60px";
    item.style.fontSize = size + "px";
    item.style.transform = `rotate(${rotation}deg)`;
    item.textContent = randomEmoji();
    item.style.filter = `brightness(${brightness}) hue-rotate(${hue}deg)`;
}

function startRound() {
    round++;
    speed = Math.max(600, speed - 100);
    roundDisplay.textContent = round;
    resetItem();
    falling = true;
    item.style.display = "block";
    let posY = -60;
    let baseX = parseInt(item.style.left);
    let t = 0;
    clearInterval(gameTimer);
    gameTimer = setInterval(() => {
        if (!falling) return;
        t += 0.1;
        posY += 5;
        const offsetX = Math.sin(t * 2) * 40;
        item.style.top = posY + "px";
        item.style.left = (baseX + offsetX) + "px";
        if (posY > 500) {
            missItem();
        }
    }, speed / 100);
}

function missItem() {
    falling = false;
    item.style.display = "none";
    lives--;
    updateLivesDisplay();
    if (lives <= 0) {
        endGame();
    } else {
        setTimeout(startRound, 1000);
    }
}

function updateLivesDisplay() {
    livesDisplay.textContent = "❤️".repeat(lives) + "🖤".repeat(5 - lives);
}

item.onclick = () => {
    if (!falling) return;
    falling = false;
    item.style.display = "none";
    catchSound.currentTime = 0;
    catchSound.play();
    message.textContent = ["EZ 😎", "Too slow bro?", "Next round!", "Not bad.", "LOL ok then"][Math.floor(Math.random() * 5)];
    setTimeout(startRound, 1000);
};

function endGame() {
    falling = false;
    clearInterval(gameTimer);
    item.style.display = "none";
    message.textContent = `💀 Game Over at round ${round}!`;
    walletInput.style.display = "inline-block";
    submitBtn.style.display = "inline-block";
    startBtn.disabled = false;
    canSubmit = true;
}

function submitScore() {
    if (!canSubmit) return alert("You already submitted your score.");
    const addr = walletInput.value.trim();
    if (addr.length < 8) return alert("Wallet address too short!");
    const masked = addr.slice(0, 4) + "..." + addr.slice(-4);
    leaderboard.push({ addr: masked, score: round });
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 50);
    updateLeaderboard();
    walletInput.value = "";
    canSubmit = false;

    // 👇 supabase 전송
    if (typeof submitToSupabase === "function") {
        submitToSupabase(addr, round);
    } else {
        console.warn("⚠ submitToSupabase is not defined");
    }
}


function updateLeaderboard() {
    leaderboardList.innerHTML = "";
    leaderboard.forEach((entry, idx) => {
        const li = document.createElement("li");
        li.textContent = `${idx + 1}. ${entry.addr} - ${entry.score}`;
        if (idx === 0) li.classList.add("top-1");
        else if (idx === 1) li.classList.add("top-2");
        else if (idx === 2) li.classList.add("top-3");
        else if (idx < 10) li.classList.add("top-10");
        leaderboardList.appendChild(li);
    });
}

startBtn.onclick = () => {
    round = 0;
    speed = 3000;
    lives = 5;
    updateLivesDisplay();
    startBtn.disabled = true;
    walletInput.style.display = "none";
    submitBtn.style.display = "none";
    message.textContent = "Catch the item before it hits the ground!";
    canSubmit = false;
    startRound();
};

submitBtn.onclick = submitScore;
