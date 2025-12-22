class Game{ //ゲームの制御
    constructor(setting, factory, board){
        //関連クラスの初期化
        this.poly = new PolyManager(factory, board);
        this.lock = new LockManager(board, this.poly);
        this.mover = new MoveManager(
            board,
            this.poly,
            () => this.lock.resetLockDelay()
        );
        this.effect = new EffectManager(board);

        this.setting = setting;

        //落下設定
        this.dropInterval = this.setting.dropInterval; //落下間隔
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

    //ファザード
    move(dx, dy) { return this.mover.move(dx, dy) }
    rotateLeft() { return this.mover.rotateLeft() }
    rotateRight() { return this.mover.rotateRight() }

    spawnNext() { return this.poly.spawnNext()}
    swapHold() { return this.poly.swapHold() }
    updateGhost() { return this.poly.updateGhost() }
    get current() { return this.poly.current }
    get ghost() { return this.poly.ghost }

    lockPiece() { return this.lock.lockPiece() }

    select(key) { return this.effect.select(key) }
    detonate() { return this.effect.detonate(this.setting.blockSize) }
}