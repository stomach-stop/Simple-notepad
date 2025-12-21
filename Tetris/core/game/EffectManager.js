class EffectManager{
    constructor(board){
        this.board = board;
        this.effect = null;
    }

    select(key){ //エフェクトの決定
        switch(key){
            case "1": this.effect = new SquareBomb(); break;
            case "2": this.effect = new CrossBomb(); break;
            case "3": this.effect = new VerticalBomb(); break;
            case "4": this.effect = new HorizontalBomb(); break;
            case "5": this.effect = new GravityBomb(); break;
            case "6": this.effect = null; break;
        }
    }

    detonate(size){ //エフェクトの実行
        if(!this.effect) return;
        this.effect.apply(
            this.board,
            this.toBoardPos(mouseX, size),
            this.toBoardPos(mouseY, size)
        );
        this.board.clearLines();
    }

    toBoardPos(pos, size){ //マウス座標をゲーム座標に変換
        return Math.floor(pos / size);
    }
}