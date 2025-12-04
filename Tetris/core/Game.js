class Game{ //ゲームのロジック
    constructor(factory, board){
        this.factory = factory;
        this.board = board;

        //ブロック関連
        this.current = this.factory.createSevenBag(); //今のブロック
        this.next = this.factory.createSevenBag(); //次のブロック
        this.hold = null; //ホールド枠
        this.canHold = true; //ホールド可能か
        this.ghost; //ブロックの影
        this.updateGhost();

        //落下設定
        this.dropInterval = 1000; //落下間隔
        this.lastDropTime = millis(); //落下記録
        this.lockDelay = 500; //固定遅延
        this.lockTimer = 0; //固定タイマー
        this.lockMoveResets = 0; //延命回数
        this.maxLockResets = 15; //延命回数の上限

        //イベントを購読
        eventBus.on("line-clear", ({lines}) => {
            this.onLineClear(lines);
        });
        eventBus.on("piece-locked", () => {
            this.onPieceLocked();
        });
    }

    update(){ //ゲームの更新
        if(millis() - this.lastDropTime > this.dropInterval){
            this.lastDropTime = millis();
            if(!this.move(0, 1)){ //落下できない
                this.startLockDelay();
            }
        }
        this.updateLockDelay();
    }

    move(dx, dy){ //移動
        const moved = this.current.cloneMoved(dx, dy);
        if(this.board.canPlace(moved)){ //動けるなら
            this.current = moved; //動いたデータで上書き
            this.updateGhost();
            this.resetLockDelay();
            return true;
        }
        return false;
    }

    rotateRight(){ //右回転
        const rotated = this.current.rotateRight(this.board);
        this.current = rotated;
        this.updateGhost();
        this.resetLockDelay();
    }

    rotateLeft(){ //左回転
        const rotated = this.current.rotateLeft(this.board);
        this.current = rotated;
        this.updateGhost();
        this.resetLockDelay();
    }

    spawnNext(){ //次のブロックを生成
        this.current = this.next;
        this.next = this.factory.createSevenBag();
        this.canHold = true;
        this.updateGhost();
        
    }

    swapHold(){ //ホールド枠のブロックと交換
        if(this.canHold){
            if(this.hold != null){
                const tmp = this.hold;
                this.hold = this.current;
                this.current = tmp;
            }else{
                this.hold = this.current;
                this.spawnNext();
            }
            
            this.current.x = 4;
            this.current.y = 0;
            this.canHold = false;
        }
    }

    updateGhost(){ //ブロックの影を更新
        let clone = this.current.clone();
        while(this.board.canPlace(clone.cloneMoved(0, 1))){
            clone = clone.cloneMoved(0, 1);
        }
        this.ghost = clone;
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
        this.board.fix(this.current);
        const lines = this.board.clearLines();
        this.lockTimer = 0;
        this.lockMoveResets = 0;
        
    }

    onLineClear(lines){ //スコア処理
    }

    onPieceLocked(){ //続行処理
        this.spawnNext();
        if(!this.board.canPlace(this.current)){
            this.onGameOver();
        }
    }

    onGameOver(){ //ゲームオーバー処理
    }
}