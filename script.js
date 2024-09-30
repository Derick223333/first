document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('questionForm');
    const questionList = document.getElementById('questionList');
    const subjectTabs = document.getElementById('subjectTabs');
    let currentSubject = 'all';

    const database = firebase.database();
    const questionsRef = database.ref('questions');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const subject = document.getElementById('subject').value;
        const question = document.getElementById('question').value;

        if (subject && question) {
            addQuestion(subject, question);
            form.reset();
        }
    });

    function addQuestion(subject, question) {
        const newQuestionRef = questionsRef.push();
        newQuestionRef.set({
            subject: subject,
            question: question,
            answers: []
        });
    }

    function displayQuestion(key, questionData) {
        const questionItem = document.createElement('div');
        questionItem.classList.add('question-item');
        questionItem.dataset.subject = questionData.subject;
        questionItem.innerHTML = `
            <p><span class="question-subject">${questionData.subject}:</span> ${questionData.question}</p>
            <div class="answer-form">
                <input type="text" class="answer-input" placeholder="답변을 입력하세요">
                <button type="button" class="answer-submit">답변하기</button>
            </div>
            <div class="answer-list"></div>
        `;
        questionList.appendChild(questionItem);
        
        questionItem.classList.add('show');
        
        const answerSubmit = questionItem.querySelector('.answer-submit');
        const answerInput = questionItem.querySelector('.answer-input');
        const answerList = questionItem.querySelector('.answer-list');
        
        answerSubmit.addEventListener('click', () => {
            const answer = answerInput.value.trim();
            if (answer) {
                addAnswer(key, answer);
                answerInput.value = '';
            }
        });

        if (questionData.answers) {
            Object.entries(questionData.answers).forEach(([answerKey, answerData]) => {
                displayAnswer(answerList, answerData);
            });
        }

        filterQuestions(currentSubject);
    }

    function addAnswer(questionKey, answer) {
        const answerRef = questionsRef.child(questionKey).child('answers').push();
        answerRef.set({
            text: answer,
            likes: 0,
            dislikes: 0
        });
    }

    function displayAnswer(answerList, answerData) {
        const answerItem = document.createElement('div');
        answerItem.classList.add('answer-item');
        answerItem.innerHTML = `
            <span class="answer-text">${answerData.text}</span>
            <div class="answer-reactions">
                <button class="reaction-button like" data-reaction="like">👍 <span class="reaction-count">${answerData.likes}</span></button>
                <button class="reaction-button dislike" data-reaction="dislike">👎 <span class="reaction-count">${answerData.dislikes}</span></button>
            </div>
        `;
        answerList.appendChild(answerItem);
    }

    questionsRef.on('child_added', (snapshot) => {
        const questionData = snapshot.val();
        displayQuestion(snapshot.key, questionData);
    });

    subjectTabs.addEventListener('click', (e) => {
        if (e.target.classList.contains('tab-button')) {
            currentSubject = e.target.dataset.subject;
            filterQuestions(currentSubject);
            setActiveTab(e.target);
        }
    });

    function filterQuestions(subject) {
        const questions = questionList.querySelectorAll('.question-item');
        questions.forEach(question => {
            if (subject === 'all' || question.dataset.subject === subject) {
                question.classList.add('show');
            } else {
                question.classList.remove('show');
            }
        });
    }

    function setActiveTab(clickedTab) {
        const tabs = subjectTabs.querySelectorAll('.tab-button');
        tabs.forEach(tab => tab.classList.remove('active'));
        clickedTab.classList.add('active');
    }
});
