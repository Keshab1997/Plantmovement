let currentQuestionIndex = 0;
let questions = [];
let timerInterval;
let timeLeft = 60; // ৬০ সেকেন্ড প্রতি প্রশ্নে
let answered = new Array(questions.length).fill(false);
let score = 0; // নতুন: স্কোর ট্র্যাক করতে
let correctAnswers = 0; // নতুন: সঠিক উত্তরের সংখ্যা

document.addEventListener("DOMContentLoaded", () => {
    startQuiz();
    startTimer();
    document.addEventListener("keydown", handleKeyPress);
});

function startQuiz() {
    shuffleOptions();
    displayQuestion();
}

function startTimer() {
    timeLeft = 60;
    document.getElementById("timer").textContent = `সময় বাকি: ${timeLeft} সেকেন্ড`;
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById("timer").textContent = `সময় বাকি: ${timeLeft} সেকেন্ড`;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            showExplanation();
        }
    }, 1000);
}

function shuffleOptions() {
    questions.forEach(question => {
        question.shuffledOptions = [...question.options];
        for (let i = question.shuffledOptions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [question.shuffledOptions[i], question.shuffledOptions[j]] = [question.shuffledOptions[j], question.shuffledOptions[i]];
        }
    });
}

function displayQuestion() {
    const quizContainer = document.getElementById("quiz-container");
    const question = questions[currentQuestionIndex];
    quizContainer.innerHTML = `
        <h2>${question.question}</h2>
        <div class="options">
            ${question.shuffledOptions.map((option, index) => `
                <div class="option" data-option="${index + 1}" onclick="handleOptionClick(${index + 1})" tabindex="0">${index + 1}. ${option}</div>
            `).join("")}
        </div>
        <div id="explanation" class="explanation"></div>
    `;
    updateProgress();
    // প্রথম অপশনে ফোকাস
    const firstOption = document.querySelector(".option");
    if (firstOption) firstOption.focus();
}

function updateProgress() {
    const remaining = questions.length - answered.filter(Boolean).length;
    document.getElementById("progress").textContent = `বাকি প্রশ্ন: ${remaining}`;
    document.getElementById("score").textContent = `স্কোর: ${score}/${questions.length}`; // নতুন: স্কোর দেখানো
}

function handleOptionClick(index) {
    if (answered[currentQuestionIndex]) {
        if (currentQuestionIndex === questions.length - 1) {
            showSummary(); // শেষ প্রশ্ন হলে সারাংশ দেখাও
        } else {
            nextQuestion(); // অন্যথায় পরবর্তী প্রশ্নে যাও
        }
        return;
    }
    checkAnswer(index);
}

function checkAnswer(selectedIndex) {
    if (answered[currentQuestionIndex]) return;
    const question = questions[currentQuestionIndex];
    const selectedOption = question.shuffledOptions[selectedIndex - 1];
    const correctOption = question.options[question.correctIndex];
    const options = document.querySelectorAll(".option");
    options.forEach((option, index) => {
        if (question.shuffledOptions[index] === correctOption) {
            option.classList.add("correct");
        } else if (index === selectedIndex - 1) {
            option.classList.add("wrong");
        }
    });
    if (selectedOption === correctOption) {
        score++; // নতুন: সঠিক উত্তর হলে স্কোর বাড়াও
        correctAnswers++;
    }
    answered[currentQuestionIndex] = true;
    showExplanation();
    clearInterval(timerInterval);
}

function showExplanation() {
    const question = questions[currentQuestionIndex];
    document.getElementById("explanation").innerHTML = `
        <p><strong>সঠিক উত্তর:</strong> ${question.options[question.correctIndex]}</p>
        <p><strong>ব্যাখ্যা:</strong> ${question.explanation}</p>
        <p><strong>পরীক্ষা:</strong> ${question.exam}</p>
    `;
    document.getElementById("explanation").style.display = "block";
}

function showSummary() {
    const quizContainer = document.getElementById("quiz-container");
    quizContainer.innerHTML = `
        <h2>কুইজের সারাংশ</h2>
        <p><strong>মোট স্কোর:</strong> ${score}/${questions.length}</p>
        <p><strong>সঠিক উত্তর:</strong> ${correctAnswers}</p>
        <p><strong>ভুল উত্তর:</strong> ${questions.length - correctAnswers}</p>
        <div class="summary-buttons">
            <button onclick="restartQuiz()">পুনরায় শুরু</button>
            <button onclick="window.location.href='index.html'">হোমে ফিরে যাও</button>
        </div>
    `;
    clearInterval(timerInterval);
    document.getElementById("timer").style.display = "none";
    document.getElementById("progress").style.display = "none";
    document.getElementById("score").style.display = "none";
}

function restartQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    correctAnswers = 0;
    answered = new Array(questions.length).fill(false);
    startQuiz();
    startTimer();
    document.getElementById("timer").style.display = "block";
    document.getElementById("progress").style.display = "block";
    document.getElementById("score").style.display = "block";
}

function nextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
        clearInterval(timerInterval);
        startTimer();
        document.getElementById("explanation").style.display = "none";
    } else {
        showSummary(); // শেষ প্রশ্ন হলে সারাংশ দেখাও
    }
}

function prevQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
        clearInterval(timerInterval);
        startTimer();
        document.getElementById("explanation").style.display = "none";
    }
}

function handleKeyPress(event) {
    const options = document.querySelectorAll(".option");
    if (event.key >= "1" && event.key <= "4") {
        const index = parseInt(event.key);
        if (!answered[currentQuestionIndex]) {
            checkAnswer(index);
            setTimeout(() => {
                if (currentQuestionIndex === questions.length - 1) {
                    showSummary();
                } else {
                    nextQuestion();
                }
            }, 500); // ০.৫ সেকেন্ড পর নেক্সট প্রশ্ন বা সারাংশ
        }
    } else if (event.key === "Enter" && !answered[currentQuestionIndex]) {
        const focusedOption = document.activeElement;
        if (focusedOption && focusedOption.classList.contains("option")) {
            const index = parseInt(focusedOption.getAttribute("data-option"));
            checkAnswer(index);
            setTimeout(() => {
                if (currentQuestionIndex === questions.length - 1) {
                    showSummary();
                } else {
                    nextQuestion();
                }
            }, 500);
        }
    } else if (event.key === "ArrowDown") {
        nextQuestion();
    } else if (event.key === "ArrowUp") {
        prevQuestion();
    } else if (event.key === "Tab") {
        event.preventDefault();
        const currentFocus = document.activeElement;
        let nextIndex = 0;
        if (currentFocus.classList.contains("option")) {
            const currentIndex = parseInt(currentFocus.getAttribute("data-option"));
            nextIndex = (currentIndex % options.length) + 1;
        }
        const nextOption = document.querySelector(`.option[data-option="${nextIndex}"]`);
        if (nextOption) nextOption.focus();
    }
}
