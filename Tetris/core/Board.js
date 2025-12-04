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
        if(!this.canPlace(polyomino)) return false;

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
        eventBus.emit("piece-locked", {type: polyomino.type});
    }

    clearLines(){ //埋まった行を削除
        let linesCleared = 0;
        for(let y = this.height - 1; y >= 0; y--){
            if(this.grid[y].every(cell => cell)){
                this.grid.splice(y, 1);
                this.grid.unshift(Array(this.width).fill(null));
                linesCleared++;
                y++;
            }
        }
        if(linesCleared > 0){
            eventBus.emit("line-clear", {lines: linesCleared});
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