class HorizontalBomb extends Effect{ //横1列のブロックを消去
    constructor(){
        super();
        this.range = 10;
    }

    apply(board, x, y){
        for(let dx = -this.range; dx <= this.range; dx++){
            this.clear(board, x + dx, y);
        }
    }
}
