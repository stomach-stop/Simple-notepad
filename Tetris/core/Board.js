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

    fix(polyomino){ //ブロックを固定
        for(const [x, y] of polyomino.getPos()){
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
        this.grid = this.grid.filter(row => row.some(cell => !cell));
        const linesCleared = this.height - this.grid.length;
        while(this.grid.length < this.height){
            this.grid.unshift(Array(this.width).fill(null));
        }
        return linesCleared;
    }

    canPlace(polyomino){ //配置可能か
        for(const [x, y] of polyomino.getPos()){
            if(y >= this.height) return false;
            if(x < 0 || x >= this.width) return false;
            if(y >= 0 && this.grid[y][x]) return false;
        }
        return true;
    }
    
    canSpawn(polyomino){ //続行可能か
        return this.canPlace(polyomino);
    }
}