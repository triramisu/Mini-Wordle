class GameWordle {
    constructor(boardEl, keyboardEl, msgEl) {
        this.WORDS = []; // Mảng trống, sẽ tải từ Git
        this.solution = "";
        // Các biến cấu hình khác
        this.ROWS = 6; this.COLS = 5;
        this.boardEl = boardEl; this.keyboardEl = keyboardEl; this.msgEl = msgEl;
        this.gameOver = false; this.curRow = 0; this.curCol = 0;
        this.grid = []; this.keyState = {};

        // Nguồn Github chứa từ Wordle
        this.githubRawUrl = "https://raw.githubusercontent.com/tabatkins/wordle-list/main/words";

        window.addEventListener("keydown", (e) => this.onKeyDown(e));
    }

    async init() {
        this.boardEl.innerHTML = "";
        this.keyboardEl.innerHTML = "";
        this.msgEl.textContent = "Đang tải dữ liệu...";

        try {
            // Fetch dữ liệu từ Github
            const response = await fetch(this.githubRawUrl);
            const text = await response.text();

            // Cắt theo dòng, lấy các từ có 5 chữ cái
            this.WORDS = text.split('\n').map(w => w.trim().toUpperCase()).filter(w => w.length === 5);

            // Chọn ngẫu nhiên đáp án
            this.solution = this.WORDS[Math.floor(Math.random() * this.WORDS.length)];
            console.log("Solution:", this.solution); // In ra console để test

            document.querySelector('.alert').style.display = 'none'; // Ẩn thông báo đang tải
            document.getElementById('newGame').disabled = false;
            this.msgEl.textContent = "";
        } catch (error) {
            this.msgEl.textContent = "Lỗi tải từ vựng từ GitHub!";
            return;
        }

        this.gameOver = false; this.curRow = 0; this.curCol = 0;
        this.grid = Array.from({ length: this.ROWS }, () => Array(this.COLS).fill(""));
        this.keyState = {};

        // Vẽ Bàn cờ
        for (let r = 0; r < this.ROWS; r++) {
            const row = document.createElement("div");
            row.className = "wordle-row";
            for (let c = 0; c < this.COLS; c++) {
                const t = document.createElement("div");
                t.className = "tile"; t.dataset.r = r; t.dataset.c = c;
                row.appendChild(t);
            }
            this.boardEl.appendChild(row);
        }

        // Vẽ bàn phím
        const rows = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
        rows.forEach((keys, idx) => {
            const row = document.createElement("div"); row.className = "keys";
            if (idx === 2) row.appendChild(this.mkKey("Enter", "Enter", "wide bg-primary"));
            for (const ch of keys) row.appendChild(this.mkKey(ch));
            if (idx === 2) row.appendChild(this.mkKey("Back", "Back", "wide bg-secondary"));
            this.keyboardEl.appendChild(row);
        });
    }

    mkKey(label, action = label, extraClass = "") {
        const k = document.createElement("div");
        k.className = "key " + extraClass;
        k.textContent = label;
        k.dataset.key = action;
        k.addEventListener("click", () => this.handleInput(action));
        return k;
    }

    onKeyDown(e) {
        if (this.gameOver) return;
        if (e.key === "Enter") this.handleInput("Enter");
        else if (e.key === "Backspace") this.handleInput("Back");
        else if (/^[A-Za-z]$/.test(e.key)) this.handleInput(e.key.toUpperCase());
    }

    handleInput(key) {
        if (this.gameOver) return;
        if (key === "Enter") return this.submitRow();
        if (key === "Back") {
            if (this.curCol > 0) {
                this.curCol--;
                this.grid[this.curRow][this.curCol] = "";
                this.updateTile(this.curRow, this.curCol, "");
            }
            return;
        }
        if (this.curCol < this.COLS) {
            this.grid[this.curRow][this.curCol] = key;
            this.updateTile(this.curRow, this.curCol, key);
            this.curCol++;
        }
    }

    updateTile(r, c, val) {
        const tile = this.boardEl.querySelector(`.tile[data-r="${r}"][data-c="${c}"]`);
        tile.textContent = val;
        tile.classList.toggle("filled", !!val);
    }

    submitRow() {
        if (this.curCol < this.COLS) {
            this.showMessage("Chưa đủ 5 chữ cái!", "text-warning");
            return;
        }

        const guess = this.grid[this.curRow].join("");
        if (!this.WORDS.includes(guess)) {
            this.showMessage("Từ không có trong từ điển!", "text-danger");
            return;
        }

        const solArr = this.solution.split("");
        const guessArr = guess.split("");
        const result = Array(this.COLS).fill("absent");

        // Xử lý logic Wordle (Xanh lá -> Vàng -> Xám)
        for (let i = 0; i < this.COLS; i++) {
            if (guessArr[i] === solArr[i]) { result[i] = "correct"; solArr[i] = null; }
        }
        for (let i = 0; i < this.COLS; i++) {
            if (result[i] === "correct") continue;
            const idx = solArr.indexOf(guessArr[i]);
            if (idx !== -1) { result[i] = "present"; solArr[idx] = null; }
        }

        // Hiển thị màu
        for (let i = 0; i < this.COLS; i++) {
            const tile = this.boardEl.querySelector(`.tile[data-r="${this.curRow}"][data-c="${i}"]`);
            tile.classList.add("revealed", result[i]);

            const ch = guessArr[i];
            const state = result[i];
            this.keyState[ch] = state;
            const keyEl = [...document.querySelectorAll('.key')].find(k => k.dataset.key === ch);
            if (keyEl) {
                keyEl.classList.remove("absent", "present", "correct");
                keyEl.classList.add(state);
            }
        }

        // Gắn FLASHCARD khi Thắng hoặc Thua
        if (guess === this.solution) {
            this.gameOver = true;
            this.saveFlashcard(this.solution);
            this.showMessage(`Chính xác! ${this.solution}`, "win");
        } else if (++this.curRow >= this.ROWS) {
            this.gameOver = true;
            this.saveFlashcard(this.solution);
            this.showMessage(`Thua rồi! Đáp án là: ${this.solution}`, "lose");
        } else {
            this.curCol = 0;
        }
    }

    saveFlashcard(word) {
        // Gửi API tới Spring Boot Backend để lưu từ
        fetch('/api/flashcards', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ word: word })
        });
    }

    showMessage(text, cls = "") {
        this.msgEl.textContent = text;
        this.msgEl.className = `h5 mb-3 fw-bold ${cls}`;
    }
}
window.GameWordle = GameWordle;