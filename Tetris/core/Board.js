class Board{
    constructor(width, height){
        this.width = width;
        this.height = height;
        this.grid = this.createGrid();
    }

    createGrid(){ //盤面を作る
        return Array.from({length: this.height}, () =>
        Array(this.width).fill(null));

    }

    isInside(x, y){ //座標が盤面内部か
        return (
            x >= 0 && x < this.width &&
            y >= 0 && y < this.height
        );
    }

    fix(polyomino){ //ブロックを固定
        if(!this.canPlace(polyomino)) return false;

        for(const [x, y] of polyomino.pos){
            if(
                x >= 0 && x < this.width &&
                y >= 0 && y < this.height
            ){
                this.grid[y][x] = {
                    type: polyomino.type,
                    color: polyomino.color
                };
            }
        }
    }

    clearLines(){ //埋まった行を削除
        let lines = 0;
        for(let y = this.height - 1; y >= 0; y--){
            if(this.grid[y].every(cell => cell)){
                this.grid.splice(y, 1);
                this.grid.unshift(Array(this.width).fill(null));
                lines++;
                y++;
            }
        }
        return {lines};
    }

    clearCell(x, y){ //指定したセルを削除
        if(!this.isInside(x, y)) return;
        this.grid[y][x] = null;
    }

    canPlace(polyomino){ //配置可能か
        for(const [x, y] of polyomino.pos){
            if(y >= this.height) return false;
            if(x < 0 || x >= this.width) return false;
            if(y >= 0 && this.grid[y][x]) return false;
        }
        return true;
    }
}