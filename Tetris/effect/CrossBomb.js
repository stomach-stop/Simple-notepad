class CrossBomb extends Effect{ //十字範囲のブロックを消去
    constructor(){
        super();
        this.range = 4;
    }

    apply(board, x, y){
        this.clear(board, x, y);

        for(let i = 1; i <= this.range; i++){
            this.clear(board, x + i, y);
            this.clear(board, x - i, y);
            this.clear(board, x, y + i);
            this.clear(board, x, y - i);
        }
    }
}
