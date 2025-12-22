class GravityBomb extends Effect{ //隙間に重力を適用
    constructor(){
        super();
    }

    apply(board, x, y){
        for(let col = 0; col < board.width; col++){
            for(let row = board.height - 2; row >= 0; row--){
                if(board.grid[row][col] && !board.grid[row + 1][col]){
                    let ny = row;
                    while(ny + 1 < board.height && !board.grid[ny + 1][col]){
                        [board.grid[ny][col], board.grid[ny + 1][col]] =
                        [board.grid[ny + 1][col], board.grid[ny][col]];
                        ny++;
                    }
                }
            }
        }
    }
}