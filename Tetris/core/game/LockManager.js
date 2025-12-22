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
        this.board.fix(this.poly.current);

        const clear = this.board.clearLines();
        // const spin = 

        eventBus.emit("piece-locked", {
            lines: clear.lines
            /*
            tspin: spin.tspin,
            mini: spin.mini
            */
        });

        this.lockTimer = 0;
        this.poly.spawnNext();

        if(!this.board.canPlace(this.poly.current)){
            eventBus.emit("game-over", {});
        }
    }
}