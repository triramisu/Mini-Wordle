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
    const fcLink = document.getElementById("fcLink");
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
                } else {
                    alert("Chưa có từ nào trong Flashcard! Hãy chơi game để lưu thêm từ.");
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
                        alert("Tuyệt vời! Bạn đã thuộc hết tất cả từ vựng.");
                    }
                });
        }
    }

    function displayFlashcard() {
        const word = flashcards[currentFcIndex].word;
        fcWord.textContent = word;
        fcLink.href = `https://translate.google.com/?sl=en&tl=vi&text=${encodeURIComponent(word)}&op=translate`;
    }
});
