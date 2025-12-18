class LockManager{ //ブロックの固定制御
    constructor(board, poly){
        this.board = board;
        this.poly = poly;

        this.lockDelay = 500; //固定遅延
        this.lockTimer = 0; //固定タイマー
        this.lockMoveResets = 0; //延命回数
        this.maxLockResets = 10; //延命回数の上限
    }

    startLockDelay(){ //固定タイマーを開始
        if(this.lockTimer == 0){
            this.lockTimer = millis();
            this.lockMoveResets = 0;
        }
    }

    updateLockDelay(){
        if(this.lockTimer == 0) return;
        if(millis() - this.lockTimer >= this.lockDelay){
            this.lockPiece();
        }
    }

    resetLockDelay(){ //固定遅延のリセット
        if(this.lockTimer > 0 &&
            this.lockMoveResets < this.maxLockResets
        ){
            this.lockTimer = millis();
            this.lockMoveResets++;
        }
    }

    lockPiece(){ //ブロックの固定処理
        const piece = this.poly.current;
        this.board.fix(piece);
        this.board.clearLines();
        this.poly.spawnNext();

        if(!this.board.canPlace(piece)){
            eventBus.emit("game-over", {});
        }
    }
}