class VerticalBomb extends Effect{ //縦1列のブロックを消去
    constructor(){
        super();
        this.range = 20;
    }

    apply(board, x, y){
        for(let dy = -this.range; dy <= this.range; dy++){
            this.clear(board, x, y + dy);
        }
    }
}
