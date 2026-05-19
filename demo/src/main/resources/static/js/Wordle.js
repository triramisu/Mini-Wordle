class GameWordle {
    constructor(boardEl, keyboardEl, msgEl) {
        this.WORDS = [];
        this.inputLockedUntil = 0;
        this.gameVersion = 0;
        this.ROWS = 6;
        this.COLS = 5;
        this.boardEl = boardEl;
        this.keyboardEl = keyboardEl;
        this.msgEl = msgEl;
        this.solution = "";
        this.grid = [];
        this.curRow = 0;
        this.curCol = 0;
        this.gameOver = false;
        this.keyState = {};
        this.githubRawUrl = "https://raw.githubusercontent.com/tabatkins/wordle-list/main/words";
        this.handleKeyDown = (e) => this.onKeyDown(e);
        window.addEventListener("keydown", this.handleKeyDown);
    }

    async init() {
        this.gameVersion++;
        this.boardEl.innerHTML = "";
        this.keyboardEl.innerHTML = "";
        this.msgEl.textContent = "Đang tải dữ liệu...";
        this.msgEl.className = "alert alert-secondary text-center px-4 py-2 small";

        try {
            if (this.WORDS.length === 0) {
                const response = await fetch(this.githubRawUrl);
                const text = await response.text();
                this.WORDS = text.split('\n').map(w => w.trim().toUpperCase()).filter(w => w.length === 5);
            }
            this.solution = this.WORDS[Math.floor(Math.random() * this.WORDS.length)];
            const alertEl = document.getElementById('loadingMsg');
            if(alertEl) alertEl.style.display = 'none';
            document.getElementById('newGame').disabled = false;
            this.msgEl.textContent = "";
            this.msgEl.className = "h5 mb-3 fw-bold";
        } catch (error) {
            this.msgEl.textContent = "Lỗi tải dữ liệu!";
            return;
        }

        this.grid = Array.from({ length: this.ROWS }, () => Array(this.COLS).fill(""));
        this.curRow = 0;
        this.curCol = 0;
        this.gameOver = false;
        this.keyState = {};
        this.inputLockedUntil = 0;

        for (let r = 0; r < this.ROWS; r++) {
            const row = document.createElement("div");
            row.className = "wordle-row";
            for (let c = 0; c < this.COLS; c++) {
                const t = document.createElement("div");
                t.className = "tile";
                t.dataset.r = r;
                t.dataset.c = c;
                row.appendChild(t);
            }
            this.boardEl.appendChild(row);
        }

        const rows = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
        rows.forEach((keys, idx) => {
            const row = document.createElement("div");
            row.className = "keys";
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
        let k = e.key;
        if (k === "Enter") this.handleInput("Enter");
        else if (k === "Backspace") this.handleInput("Back");
        else {
            k = k.toUpperCase();
            if (/^[A-Z]$/.test(k)) this.handleInput(k);
        }
    }

    handleInput(key) {
        if (this.gameOver || Date.now() < this.inputLockedUntil) return;
        if (key === "Enter") return this.submitRow();
        if (key === "Back") return this.backspace();
        if (key.length === 1 && this.curCol < this.COLS) {
            this.grid[this.curRow][this.curCol] = key;
            this.updateTile(this.curRow, this.curCol, key);
            this.curCol++;
        }
    }

    updateTile(r, c, val) {
        const tile = this.boardEl.querySelector(`.tile[data-r="${r}"][data-c="${c}"]`);
        if (tile) {
            tile.textContent = val;
            tile.classList.toggle("filled", !!val);
        }
    }

    backspace() {
        if (this.curCol > 0) {
            this.curCol--;
            this.grid[this.curRow][this.curCol] = "";
            this.updateTile(this.curRow, this.curCol, "");
        }
    }

    submitRow() {
        if (this.curCol < this.COLS) return this.showMessage("Chưa đủ 5 chữ cái!", 2000, "text-warning");

        const guess = this.grid[this.curRow].join("");
        if (!this.WORDS.includes(guess)) {
            this.showMessage("Từ không có trong từ điển!", 1500, "text-danger");
            for (let i = 0; i < this.COLS; i++) {
                this.grid[this.curRow][i] = "";
                this.updateTile(this.curRow, i, "");
            }
            this.curCol = 0;
            return;
        }

        this.inputLockedUntil = Date.now() + 1200;
        const solArr = this.solution.split("");
        const guessArr = guess.split("");
        const result = Array(this.COLS).fill("absent");

        for (let i = 0; i < this.COLS; i++) {
            if (guessArr[i] === solArr[i]) {
                result[i] = "correct";
                solArr[i] = null;
            }
        }
        for (let i = 0; i < this.COLS; i++) {
            if (result[i] === "correct") continue;
            const idx = solArr.indexOf(guessArr[i]);
            if (idx !== -1) {
                result[i] = "present";
                solArr[idx] = null;
            }
        }

        this.revealRow(this.curRow, guessArr, result).then(() => {
            for (let i = 0; i < this.COLS; i++) {
                const ch = guessArr[i];
                const prev = this.keyState[ch];
                const state = result[i];
                if (!prev || (prev === "absent" && state !== "absent") || (prev === "present" && state === "correct")) {
                    this.keyState[ch] = state;
                    const keyEl = [...document.querySelectorAll('.key')].find(k => k.dataset.key === ch);
                    if (keyEl) {
                        keyEl.classList.remove("absent", "present", "correct");
                        keyEl.classList.add(state);
                    }
                }
            }

            if (guess === this.solution) {
                this.gameOver = true;
                this.saveFlashcard(this.solution);
                this.showMessage(`Chính xác! ${this.solution}`, 0, "win text-success");
            } else if (++this.curRow >= this.ROWS) {
                this.gameOver = true;
                this.saveFlashcard(this.solution);
                this.showMessage(`Thua rồi! Đáp án là: ${this.solution}`, 0, "lose text-danger");
            } else {
                this.curCol = 0;
            }
        });
    }

    revealRow(r, guessArr, resultArr) {
        const version = this.gameVersion;
        return new Promise((resolve) => {
            for (let i = 0; i < this.COLS; i++) {
                setTimeout(() => {
                    if (this.gameVersion !== version) return;
                    const tile = this.boardEl.querySelector(`.tile[data-r="${r}"][data-c="${i}"]`);
                    if(tile) {
                        tile.classList.add("revealed", resultArr[i]);
                    }
                    if (i === this.COLS - 1) resolve();
                }, i * 250);
            }
        });
    }

    saveFlashcard(word) {
        fetch('/api/flashcards', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ word: word })
        });
    }

    showMessage(text, time = 1500, cls = "") {
        this.msgEl.innerHTML = text;
        this.msgEl.className = `h5 mb-3 fw-bold ${cls}`;
        if (time > 0) {
            setTimeout(() => {
                this.msgEl.textContent = "";
                this.msgEl.className = "h5 mb-3 fw-bold";
            }, time);
        }
    }
}
window.GameWordle = GameWordle;
