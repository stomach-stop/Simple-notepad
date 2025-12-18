class MoveManager{ //ブロックの動作制御
    constructor(board, poly, resetLockDelay){
        this.board = board;
        this.poly = poly;
        this.resetLockDelay = resetLockDelay;
    }

    move(dx, dy){ //移動
        const moved = this.poly.current.cloneMoved(dx, dy);
        if(this.board.canPlace(moved)){ //動けるなら
            this.poly.current = moved; //動いたデータで上書き
            this.poly.updateGhost();
            this.resetLockDelay();
            return true;
        }
        return false;
    }

    rotateRight(){ //右回転
        const rotated = this.poly.current.rotateRight(this.board);
        this.poly.current = rotated;
        this.poly.updateGhost();
        this.resetLockDelay();
    }

    rotateLeft(){ //左回転
        const rotated = this.poly.current.rotateLeft(this.board);
        this.poly.current = rotated;
        this.poly.updateGhost();
        this.resetLockDelay();
    }
}