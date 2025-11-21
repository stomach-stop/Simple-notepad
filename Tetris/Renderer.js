class Renderer{ //描画処理
    setBlockSize(blockSize){
        this.blockSize = blockSize;
    }

    drawBoard(board){ //ボードを描画
        const w =  board.width;
        const h = board.height;

        for(let i = 0; i < h; i++){
            for(let j = 0; j < w; j++){
                const cell = board.grid[i][j];
                if(cell){
                    fill(cell.color);
                }else{
                    fill("white");
                }
                rect(
                    j * this.blockSize,
                    i * this.blockSize,
                    this.blockSize,
                    this.blockSize,
                );
            }
        }
    }

    drawPolyomino(polyomino, alpha = 1.0){ //ブロックを描画
        drawingContext.globalAlpha = alpha; //透明度

        fill(polyomino.color);
        stroke(0);
        strokeWeight(1);

        for(const [x, y] of polyomino.getPos()){
            rect(
                x * this.blockSize,
                y * this.blockSize,
                this.blockSize,
                this.blockSize
            );
        }

        drawingContext.globalAlpha = 1.0; //デフォルトに戻す
    }
}