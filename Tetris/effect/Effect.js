class Effect{
    apply(board, x, y){
        throw new Error("apply() must be implemented");
    }

    clear(board, x, y){
        if(board.isInside(x, y)){
            board.clearCell(x, y);
        }
    }
}
