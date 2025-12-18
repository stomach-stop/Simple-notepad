class InputHandler {
    constructor(manager) {
        this.manager = manager;
        this.pressed = {};
        this.DAS = 150;
        this.ARR = 30;
        this.SDI = 50;

        // 画面外フォーカスアウト時の安全装置
        window.addEventListener('blur', () => {
            this.reset();
        });
    }

    get game() {
        return this.manager.game;
    }

    reset() {
        this.pressed = {};
    }

    update() {
        const now = millis();

        ["a", "d", "arrowleft", "arrowright"].forEach(k => {
            const state = this.pressed[k];
            if (!state) return;

            const sincePressed = now - state.timePressed;
            const sinceAct = now - state.lastAct;

            if (sincePressed >= this.DAS && sinceAct >= this.ARR) {
                this.handle(k);
                state.lastAct = now;
            }
        });

        ["s", "arrowdown"].forEach(k => {
            const sd = this.pressed[k];
            if (sd && now - sd.lastAct >= this.SDI) {
                this.handle("s");
                sd.lastAct = now;
            }
        });
    }

    handle(key) {
        if (!this.game) return;

        // 矢印キー変換
        if (key === "arrowup") key = "w";
        if (key === "arrowleft") key = "a";
        if (key === "arrowdown") key = "s";
        if (key === "arrowright") key = "d";

        switch (key) {
            case "w":
                let dist = 0;
                while (this.game.move(0, 1)) {
                    dist++;
                    if (dist > 30) break;
                }
                this.game.lockPiece();
                eventBus.emit("hard-drop", { dist });
                break;
            case "a": this.game.move(-1, 0); break;
            case "s": this.game.move(0, 1); break;
            case "d": this.game.move(1, 0); break;
            case "e": this.game.rotateRight(); break;
            case "q": this.game.rotateLeft(); break;
            case "c": this.game.swapHold(); break;
        }
        this.game.updateGhost();
    }

    onKeyDown(key, isReplay = false) {
        key = key.toLowerCase();

        // 【追加】システム操作（R, N）はここで処理して終了
        // （ログには残さず、長押し判定もしない）
        if (!isReplay) {
            if (key === 'r') {
                if (this.manager.inputLogs && this.manager.inputLogs.length > 0) {
                    console.log("Replay Start");
                    this.manager.startReplay({
                        seed: this.manager.replaySeed,
                        logs: this.manager.inputLogs
                    });
                }
                return;
            }
            if (key === 'n') {
                console.log("New Game");
                this.manager.startNewGame();
                return;
            }
        }

        // --- 以下、通常のゲーム操作 ---

        // 記録
        if (this.manager.isRecording && !isReplay) {
            this.manager.inputLogs.push({
                time: millis() - this.manager.gameStartTime,
                type: "down",
                key: key
            });
        }

        if (!this.pressed[key]) {
            this.pressed[key] = {
                timePressed: millis(),
                lastAct: 0,
            };
            this.handle(key);
            this.pressed[key].lastAct = millis();
        }
    }

    onKeyUp(key, isReplay = false) {
        key = key.toLowerCase();

        // RとNは何もしない
        if (key === 'r' || key === 'n') return;

        // 記録
        if (this.manager.isRecording && !isReplay) {
            this.manager.inputLogs.push({
                time: millis() - this.manager.gameStartTime,
                type: "up",
                key: key
            });
        }

        delete this.pressed[key];
    }
}