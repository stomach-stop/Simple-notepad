class ScoreManager {
    constructor() {
        this.score = 0;
        this.level = 1;
        this.combo = -1; // 最初は -1
        this.b2b = false;

        eventBus.on("piece-locked", (data) => {
            this.onPieceLocked(data);
        });
        eventBus.on("hard-drop", ({dist}) => {
            this.score += dist * 2; // Guideline Hard Drop
        });
    }

    onPieceLocked({ lines, tspin, mini }) {
        this.combo = (lines > 0) ? this.combo + 1 : -1;

        let base = this.calcLineScore(lines, tspin, mini);

        // B2B
        if (this.isB2BTarget(lines, tspin)) {
            if (this.b2b) base *= 1.5;
            this.b2b = true;
        } else {
            this.b2b = false;
        }

        // コンボ
        if (this.combo > 0) {
            base += 50 * this.combo * this.level;
        }

        this.score += base * this.level;

        // レベルアップ
        this.updateLevel();
    }

    calcLineScore(lines, tspin, mini) {
        // Guideline（簡易）
        if (tspin) {
            if (mini) return [100, 200][lines] || 0;
            return [400, 800, 1200, 1600][lines] || 0;
        } else {
            return [0, 100, 300, 500, 800][lines] || 0;
        }
    }

    isB2BTarget(lines, tspin) {
        return (tspin || lines === 4);
    }

    updateLevel() {
        // 10ラインごととか、必要に応じて
    }
}

