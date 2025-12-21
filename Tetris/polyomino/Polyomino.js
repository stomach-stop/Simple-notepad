class Polyomino{ //ブロックの情報を取得
    constructor(type, shape, center, color, x = 4, y = 0){
        this.type = type; //ブロックの種類
        this.shape = shape; //ブロックの形
        this.center = center; //回転の中心
        this.color = color; //ブロックの色
        this.x = x; //初期座標
        this.y = y;
        this.rotState = 0; //回転状態
    }

    static rotKey = ["0", "R", "2", "L"];

    get pos(){ //座標を取得
        return this.shape.map(([sx, sy]) => [this.x + sx, this.y + sy]);
    }

    clone(){ //コピーを返す
        const clone = new this.constructor(
            this.type,
            this.shape.map(([sx, sy]) => [sx, sy]),
            this.center,
            this.color,
            this.x,
            this.y
        );
        clone.rotState = this.rotState;
        return clone;
    }

    cloneMoved(dx, dy){ //移動したコピーを返す
        const clone = this.clone();
        clone.x += dx;
        clone.y += dy;
        return clone;
    }

    cloneRotatedRight(){ //右回転したコピーを返す
        const clone = this.clone();
        const [cx, cy] = clone.center;
        clone.shape = clone.shape.map(([x, y]) => {
            const dx = x - cx;
            const dy = y - cy;
            return [cx - dy, cy + dx];
        });
        return clone;
    }

    cloneRotatedLeft(){ //左回転したコピーを返す
        const clone = this.clone();
        const [cx, cy] = clone.center;
        clone.shape = clone.shape.map(([x, y]) => {
            const dx = x - cx;
            const dy = y - cy;
            return [cx + dy, cy - dx];
        });
        return clone;
    }

    rotateRight(board){ //右回転
        const old = this.rotState; //現在の回転状態
        const next = (this.rotState + 1) % 4; //次の回転状態

        const key = `${Polyomino.rotKey[old]}>${Polyomino.rotKey[next]}`; //キーを生成
        const table = this.getTable(); //テーブルを適用

        const rotated = this.cloneRotatedRight();
        for(const [dx, dy] of table[key]){
            const moved = rotated.cloneMoved(dx, dy);
            if(board.canPlace(moved)){
                moved.rotState = next;
                return moved;
            }
        }
    }

    rotateLeft(board){ //左回転
        const old = this.rotState;
        const next = (this.rotState + 3) % 4;

        const key = `${Polyomino.rotKey[old]}>${Polyomino.rotKey[next]}`; //キーを生成
        const table = this.getTable();

        const rotated = this.cloneRotatedLeft();
        for(const [dx, dy] of table[key]){
            const moved = rotated.cloneMoved(dx, dy);
            if(board.canPlace(moved)){
                moved.rotState = next;
                return moved;
            }
        }
    }
}