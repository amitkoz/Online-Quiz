const username = document.getElementById("username");
const saveScoreBtn = document.getElementById("saveScoreBtn");
const mostRecentScore = localStorage.getItem("mostRecentScore");
const finalScore = document.getElementById("finalScore");
const scoreMsg = localStorage.getItem("scoreMsg")
const endMsg =  document.getElementById("endMsg");
const highScores = JSON.parse(localStorage.getItem("highScores")) || [];

finalScore.innerText = mostRecentScore;
endMsg.innerText = scoreMsg;

const Confettiful = function (el) {
    this.el = el;
    this.containerEl = null;
    this.confettiColors = ["#EF2964", "#00C09D", "#2D87B0", "#48485E", "#EFFF1D"];
    this.confettiAnimations = ["slow", "medium", "fast"];

    this._setupElements();
    this._renderConfetti();
};


username.addEventListener("keyup", () => {
    saveScoreBtn.disabled = !username.value;
});

saveHighScore = e => {
    console.log("clicked");
    e.preventDefault();


    const score = {
        score: mostRecentScore,
        name: username.value
    };

    highScores.push(score);

// Sorts the array by score
    highScores.sort( (a,b) => b.score - a.score);

    highScores.splice(5);

    localStorage.setItem("highScores", JSON.stringify(highScores));
    window.location.assign("index.html");
};

// CONFETTI
Confettiful.prototype._setupElements = function () {
    const containerEl = document.createElement("div");
    const elPosition = this.el.style.position;

    if (elPosition !== "relative" || elPosition !== "absolute") {
        this.el.style.position = "relative";
    }

    containerEl.classList.add("confetti-container");

    this.el.appendChild(containerEl);

    this.containerEl = containerEl;
};

Confettiful.prototype._renderConfetti = function () {
    this.confettiInterval = setInterval(() => {
        const confettiEl = document.createElement("div");
        const confettiSize = Math.floor(Math.random() * 3) + 7 + "px";
        const confettiBackground = this.confettiColors[
            Math.floor(Math.random() * this.confettiColors.length)
            ];
        const confettiLeft = Math.floor(Math.random() * this.el.offsetWidth) + "px";
        const confettiAnimation = this.confettiAnimations[
            Math.floor(Math.random() * this.confettiAnimations.length)
            ];

        confettiEl.classList.add(
            "confetti",
            "confetti--animation-" + confettiAnimation
        );
        confettiEl.style.left = confettiLeft;
        confettiEl.style.width = confettiSize;
        confettiEl.style.height = confettiSize;
        confettiEl.style.backgroundColor = confettiBackground;

        confettiEl.removeTimeout = setTimeout(function () {
            confettiEl.parentNode.removeChild(confettiEl);
        }, 3000);

        this.containerEl.appendChild(confettiEl);
    }, 25);
};

window.confettiful = new Confettiful(document.querySelector(".js-container"));