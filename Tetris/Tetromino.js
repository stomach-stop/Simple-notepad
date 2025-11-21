class Tetromino extends Polyomino{
    constructor(type, shape, color, center, x, y){
        super(type, shape, color, center, x, y);
        this.rotState = 0; //回転状態
    }

    static SRS = {
        "0>R": [[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]],
        "R>0": [[0,0],[1,0],[1,-1],[0,2],[1,2]],

        "R>2": [[0,0],[1,0],[1,-1],[0,2],[1,2]],
        "2>R": [[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]],

        "2>L": [[0,0],[1,0],[1,1],[0,-2],[1,-2]],
        "L>2": [[0,0],[-1,0],[-1,-1],[0,2],[-1,2]],

        "L>0": [[0,0],[1,0],[1,-1],[0,2],[1,2]],
        "0>L": [[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]],
    };

    static SRS_I = {
        "0>R": [[0,0],[-2,0],[1,0],[-2,-1],[1,2]],
        "R>0": [[0,0],[2,0],[-1,0],[2,1],[-1,-2]],

        "R>2": [[0,0],[-1,0],[2,0],[-1,2],[2,-1]],
        "2>R": [[0,0],[1,0],[-2,0],[1,-2],[-2,1]],

        "2>L": [[0,0],[2,0],[-1,0],[2,1],[-1,-2]],
        "L>2": [[0,0],[-2,0],[1,0],[-2,-1],[1,2]],

        "L>0": [[0,0],[1,0],[-2,0],[1,-2],[-2,1]],
        "0>L": [[0,0],[-1,0],[2,0],[-1,2],[2,-1]]
    };

    static rotKey = ["0", "R", "2", "L"];

    rotateRight(board){ //右回転
        const old = this.rotState; //現在の回転状態
        const next = (this.rotState + 1) % 4; //次の回転状態

        const key = `${Tetromino.rotKey[old]}>${Tetromino.rotKey[next]}`;
        const table = (this.type === "I") ? Tetromino.SRS_I : Tetromino.SRS;

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

        const key = `${Tetromino.rotKey[old]}>${Tetromino.rotKey[next]}`; //キーを生成
        const table = (this.type === "I") ? Tetromino.SRS_I : Tetromino.SRS;

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