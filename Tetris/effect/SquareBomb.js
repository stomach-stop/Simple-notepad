class SquareBomb extends Effect{ //正方範囲ブロックを消去
    constructor(){
        super();
        this.range = 1;
    }

    apply(board, x, y){
        for(let dy = -this.range; dy <= this.range; dy++){
            for(let dx = -this.range; dx <= this.range; dx++){
                this.clear(board, x + dx, y + dy);
            }
        }
    }
}