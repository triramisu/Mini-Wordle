document.addEventListener("DOMContentLoaded", () => {
    const boardEl = document.getElementById("board");
    const keyboardEl = document.getElementById("keyboard");
    const msgEl = document.getElementById("msg");
    const newGameBtn = document.getElementById("newGame");

    const game = new GameWordle(boardEl, keyboardEl, msgEl);
    game.init();

    newGameBtn.addEventListener("click", () => {
        newGameBtn.blur();
        game.init();
    });

    const flashcardModal = new bootstrap.Modal(document.getElementById('flashcardModal'));
    const showBtn = document.getElementById("showFlashcards");
    const fcWord = document.getElementById("fcWord");
    const fcLearnedBtn = document.getElementById("fcLearned");
    const fcNextBtn = document.getElementById("fcNext");

    let flashcards = [];
    let currentFcIndex = 0;

    showBtn.onclick = () => {
        fetch('/api/flashcards')
            .then(res => res.json())
            .then(data => {
                flashcards = data;
                currentFcIndex = 0;
                if (flashcards.length > 0) {
                    displayFlashcard();
                    flashcardModal.show();
                }
            });
    }

    fcNextBtn.onclick = () => {
        if (flashcards.length > 0) {
            currentFcIndex = (currentFcIndex + 1) % flashcards.length;
            displayFlashcard();
        }
    }

    fcLearnedBtn.onclick = () => {
        if (flashcards.length > 0) {
            const id = flashcards[currentFcIndex].id;
            fetch(`/api/flashcards/${id}`, { method: 'DELETE' })
                .then(() => {
                    flashcards.splice(currentFcIndex, 1);
                    if (flashcards.length > 0) {
                        if (currentFcIndex >= flashcards.length) currentFcIndex = 0;
                        displayFlashcard();
                    } else {
                        flashcardModal.hide();
                    }
                });
        }
    }

    function displayFlashcard() {
        const card = flashcards[currentFcIndex];
        document.getElementById("fcWord").textContent = card.word;

        document.getElementById("fcPhonetic").textContent = card.phonetic ? card.phonetic : "";

        const posEl = document.getElementById("fcPartOfSpeech");
        if (card.partOfSpeech) {
            posEl.textContent = card.partOfSpeech;
            posEl.style.display = "inline-block";
        } else {
            posEl.style.display = "none";
        }

        document.getElementById("fcMeaning").textContent = card.meaning ? card.meaning : "Không có dữ liệu dịch";
        document.getElementById("fcEngDef").textContent = card.englishDefinition ? card.englishDefinition : "Không có định nghĩa";
        document.getElementById("fcUsage").textContent = card.usageExample ? `"${card.usageExample}"` : "Không có ví dụ";
    }
});
