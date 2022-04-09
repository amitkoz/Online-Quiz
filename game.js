const question = document.getElementById("question");
const choices = Array.from(document.getElementsByClassName("choice-text"));
const progressText = document.getElementById("progressText");
const scoreText = document.getElementById("score");
const progressBarFull = document.getElementById("progressBarFull");
const loader = document.getElementById("loader");
const game = document.getElementById("game");

let currentQuestion = {};
// question isn't ready to be answered
let acceptingAnswers = false;
let score = 0;
let questionCounter = 0;
let availableQuestions = [];
let questionTimeout = null;
let questions = [];
let span = document.getElementById('time');


// decode HTML entities to applicable characters
castString = (string) => {
    let ans = string.split('&quot;').join('"');
    ans = ans.split('&#039;').join('\'');
    ans = ans.split('&rsquo;').join('\'');
    ans = ans.split('&amp;').join('&');
    ans = ans.split('&lt;').join('<');
    ans = ans.split('&gt;').join('>');
    return ans;

};

// FETCH
fetch("https://opentdb.com/api.php?amount=100")
    .then(res => {
        return res.json();
    })
    .then(loadedQuestions => {
        console.log(loadedQuestions["results"]);
        questions = loadedQuestions["results"].map(loadedQuestion => {
            const formattedQuestion = {
                question: castString(loadedQuestion.question)
            };

            const answerChoices = [...loadedQuestion["incorrect_answers"]];
            formattedQuestion.answer = Math.floor(Math.random() * 3) + 1;
            answerChoices.splice(formattedQuestion.answer - 1, 0, loadedQuestion["correct_answer"]);

            answerChoices.forEach((choice, index) => {
                formattedQuestion["choice" + (index + 1)] = castString(choice);
            })

            return formattedQuestion;
        });
        startGame();
    })
    .catch(err => {
        console.error(err);
    });

// CONSTANTS
const CORRECT_BONUS = 20;
const MAX_QUESTIONS = 10;
const SECONDS = 15;
const LOW_SCORE_MSG = "Not bad,\n next time try harder!";
const MID_SCORE_MSG = "Almost a champion,\n an additional little effort!";
const HIGH_SCORE_MSG = "Congratulations!";

startGame = () => {
    questionCounter = 0;
    score = 0;
    availableQuestions = [...questions];
    getNewQuestion();
    game.classList.remove("hidden");
    loader.classList.add("hidden");
};

getNewQuestion = () => {

    clearTimeout(questionTimeout);
    // if the type of the question is 'multiple' - we will want to see all four answers
    const bool1 = document.getElementsByClassName('choice-container')[2];
    bool1.style.visibility = 'visible';
    const bool2 = document.getElementsByClassName('choice-container')[3];
    bool2.style.visibility = 'visible';


    if (availableQuestions.length === 0 || questionCounter >= MAX_QUESTIONS) {
        localStorage.setItem('mostRecentScore', score.toFixed(2));
        if (score == 0) {
            localStorage.setItem('scoreMsg', LOW_SCORE_MSG); // today
        } else if (score < MAX_QUESTIONS * CORRECT_BONUS) {
            localStorage.setItem('scoreMsg', MID_SCORE_MSG); // today
        } else { //score>=MAX_QUESTIONS*CORRECT_BONUS
            localStorage.setItem('scoreMsg', HIGH_SCORE_MSG); // today
        }

        // Go to the final page
        return (window.location.assign('end.html'));
    }
    questionCounter++;
    progressText.innerText = `Question ${questionCounter}/${MAX_QUESTIONS}`;

    // Update the progress bar
    progressBarFull.style.width = `${(questionCounter / MAX_QUESTIONS) * 100}%`;
    // reset the timer
    countdown.init();
    // choose random question (index)
    const questionIndex = Math.floor(Math.random() * availableQuestions.length);
    currentQuestion = availableQuestions[questionIndex];
    // get rid of all HTML's special signs
    question.innerText = currentQuestion.question;

    // show the answers
    choices.forEach(choice => {

        const number = choice.dataset["number"];
        choice.innerText = currentQuestion["choice" + number];
        // if the type of the question is boolean - show only two answers
        if (choices[0].innerHTML === 'True' || choices[0].innerHTML === 'False') {
            const bool1 = document.getElementsByClassName('choice-container')[2];
            bool1.style.visibility = 'hidden';
            const bool2 = document.getElementsByClassName('choice-container')[3];
            bool2.style.visibility = 'hidden';
        }
    });
    // delete the used question from our available list
    availableQuestions.splice(questionIndex, 1);
    // question is ready to be answered
    acceptingAnswers = true;
    questionTimeout = setTimeout(function () {
        getNewQuestion();
    }, SECONDS * 1000);
    countdown.start();//new
};

// user choose an answer
choices.forEach(choice => {
    choice.addEventListener('click', e => {
        if (!acceptingAnswers) return;
        // stop the timer
        countdown.stop();
        const timeLeft = (countdown.totalTime - countdown.usedTime) / 100;
        acceptingAnswers = false;
        const selectedChoice = e.target;
        const selectedAnswer = selectedChoice.dataset['number'];

        const classToApply = selectedAnswer == currentQuestion.answer ? 'correct' : 'incorrect';

        // if user is correct: add to the score CORRECT_BONUS and the timeLeft (score logic)
        if (classToApply == 'correct') {
            incrementScore(CORRECT_BONUS + timeLeft);

        }

        // Adds a class to the element
        selectedChoice.parentElement.classList.add(classToApply);
        // wait a little after choose the answer
        setTimeout(() => {
            selectedChoice.parentElement.classList.remove(classToApply);
            getNewQuestion();
        }, 1000);

    });
});

incrementScore = num => {
    score += num;
    scoreText.innerText = score.toFixed(2);
};

// TIMER COUNTDOWN
function Countdown(elem, seconds) {
    const that = {};

    that.elem = elem;
    that.seconds = seconds;
    that.totalTime = seconds * 100;
    that.usedTime = 0;
    that.startTime = +new Date();
    that.timer = null;

    that.count = function () {
        that.usedTime = Math.floor((+new Date() - that.startTime) / 10);

        let tt = that.totalTime - that.usedTime;
        if (tt <= 0) {
            that.elem.innerHTML = '00:00:00';
            clearInterval(that.timer);
        } else {
            let mi = Math.floor(tt / (60 * 100));
            let ss = Math.floor((tt - mi * 60 * 100) / 100);
            let ms = tt - Math.floor(tt / 100) * 100;

            that.elem.innerHTML = that.fillZero(mi) + ":" + that.fillZero(ss) + "." + that.fillZero(ms);
        }
    };

    that.init = function () {
        if (that.timer) {
            clearInterval(that.timer);
            that.elem.innerHTML = '00:00:00';
            that.totalTime = seconds * 100;
            that.usedTime = 0;
            that.startTime = +new Date();
            that.timer = null;
        }
    };

    that.start = function () {
        if (!that.timer) {
            that.timer = setInterval(that.count, 1);
        }
    };

    that.stop = function () {
        console.log('usedTime = ' + countdown.usedTime);
        if (that.timer) clearInterval(that.timer);
    };

    that.fillZero = function (num) {
        return num < 10 ? '0' + num : num;
    };

    return that;
}


let countdown = new Countdown(span, SECONDS);


