class ScoreManager {
    constructor() {
        this.score = 0;
        this.level = 1;
        this.combo = -1;
        this.b2b = false;
        this.totalLines = 0;

        //イベント購読
        eventBus.on("piece-locked", (data) => {
            this.onPieceLocked(data);
        });
        eventBus.on("hard-drop", ({dist}) => {
            this.score += dist * 2;
        });
    }

    /*
    onPieceLocked({lines, tspin, mini}){
        this.combo = (lines > 0) ? this.combo + 1 : -1; //コンボ継続判定
        let base = this.calcLineScore(lines, tspin, mini);

        if(tspin || lines == 4){ //B2B
            if(this.b2b) base *= 1.5;
            this.b2b = true;
        }else{
            this.b2b = false;
        }

        if(this.combo > 0){ //コンボ
            base += 50 * this.combo * this.level;
        }
        this.score += base * this.level;
        this.updateLevel(lines);
    }
    */

    onPieceLocked({lines}){
        this.combo = (lines > 0) ? this.combo + 1 : -1; //コンボ継続判定
        this.tspin = null;
        this.mini = null;
        let base = this.calcLineScore(lines, tspin, mini);

        if(lines == 4){ //B2B
            if(this.b2b) base *= 1.5;
            this.b2b = true;
        }else{
            this.b2b = false;
        }

        if(this.combo > 0){ //コンボ
            base += 50 * this.combo * this.level;
        }
        this.score += base * this.level;
        this.updateLevel(lines);
    }

    calcLineScore(lines, tspin, mini){ //スコアを計算
        if(tspin){
            if(mini) return [100, 200][lines] || 0;
            return [400, 800, 1200, 1600][lines] || 0;
        }else{
            return [0, 100, 300, 500, 800][lines] || 0;
        }
    }

    /*
    isB2BTarget(lines, tspin){
        return (tspin || lines == 4);
    }
    */

    updateLevel(lines){ //レベルアップ判定
        this.totalLines += lines;
        if(this.totalLines >= 10){
            this.level++;
            this.totalLines -= 10;
        }
    }

    getScore(){
        return this.score;
    }
}

