class PolyManager{ //ブロックの出現制御
    constructor(factory, board){
        this.factory = factory;
        this.board = board;

        this.current = this.factory.createNext(); //今のブロック
        this.next = this.factory.createNext(); //次のブロック
        this.hold = null; //ホールド枠
        this.canHold = true; //ホールド可能か
        this.ghost; //ブロックの影
        this.updateGhost();
    }

    spawnNext(){ //次のブロックを生成
        this.current = this.next;
        this.next = this.factory.createNext();
        this.canHold = true;
        this.updateGhost();
        this.lockTimer = 0;
        this.lockMoveResets = 0;
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
}