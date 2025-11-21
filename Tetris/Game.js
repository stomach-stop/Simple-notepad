class Game{ //ゲームのロジック
    constructor(factory, board){
        this.factory = factory;
        this.board = board;

        this.current = this.factory.createSevenBag(); //今のブロック
        this.next = this.factory.createSevenBag(); //次のブロック
        this.hold = null; //ホールド枠
        this.canHold = true; //ホールド可能か
        this.ghost; //ブロックの影
        this.updateGhost();

        //仮設定
        this.dropInterval = 1000; //落下間隔
        this.lastDropTime = millis();
    }

    update(){
        if(millis() - this.lastDropTime > this.dropInterval){
            this.lastDropTime = millis();

            if(!this.move(0, 1)){
                this.board.fix(this.current);
                this.board.clearLines();
                this.spawnNext();

                if(!this.board.canSpawn(this.current)){ //ゲームオーバー
                }
            }
        }
    }

    move(dx, dy){ //移動
        const moved = this.current.cloneMoved(dx, dy);
        if(this.board.canPlace(moved)){ //動けるなら
            this.current = moved; //動いたデータで上書き
            return true;
        }
        return false;
    }

    rotateRight(){ //右回転
        const rotated = this.current.rotateRight(this.board);
        if(rotated){
            this.current = rotated;
        }
    }

    rotateLeft(){ //左回転
        const rotated = this.current.rotateLeft(this.board);
        if(rotated){
            this.current = rotated;
        }
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
}