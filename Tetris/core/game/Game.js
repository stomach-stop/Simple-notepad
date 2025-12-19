class Game{ //ゲームの制御
    constructor(factory, board){
        //関連クラスの初期化
        this.board = board;
        this.poly = new PolyManager(factory, board);
        this.lock = new LockManager(board, this.poly);
        this.mover = new MoveManager(
            board,
            this.poly,
            () => this.lock.resetLockDelay()
        );

        //落下設定
        this.dropInterval = 1000; //落下間隔
        this.lastDropTime = millis(); //落下記録
    }

    update(){ //ゲームの更新
        if(millis() - this.lastDropTime > this.dropInterval){
            this.lastDropTime = millis();
            if(!this.mover.move(0, 1)){
                this.lock.startLockDelay();
            }
        }
        this.lock.updateLockDelay();
    }

    move(dx, dy) { return this.mover.move(dx, dy) }
    rotateLeft() { return this.mover.rotateLeft() }
    rotateRight() { return this.mover.rotateRight() }
    spawnNext() { return this.poly.spawnNext()}
    swapHold() { return this.poly.swapHold() }
    updateGhost() { return this.poly.updateGhost() }
    lockPiece() { return this.lock.lockPiece() }

    get current() { return this.poly.current }
    get ghost() { return this.poly.ghost }
}