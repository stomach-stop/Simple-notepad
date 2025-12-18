class Game {
    constructor(factory, board) {
        this.factory = factory;
        this.board = board;

        this.current = this.factory.createSevenBag();
        this.next = this.factory.createSevenBag();
        this.hold = null;
        this.canHold = true;
        this.ghost;
        this.updateGhost();

        this.dropInterval = 1000;
        this.lastDropTime = millis();
        this.lockDelay = 500;
        this.lockTimer = 0;
        this.lockMoveResets = 0;
        this.maxLockResets = 15;
    }

    update() {
        if (millis() - this.lastDropTime > this.dropInterval) {
            this.lastDropTime = millis();
            if (!this.move(0, 1)) {
                this.startLockDelay();
            }
        }
        this.updateLockDelay();
    }

    move(dx, dy) {
        const moved = this.current.cloneMoved(dx, dy);
        if (this.board.canPlace(moved)) {
            this.current = moved;
            this.updateGhost();
            this.resetLockDelay();
            return true;
        }
        return false;
    }

    // 回転失敗時のエラー対策
    rotateRight() {
        const rotated = this.current.rotateRight(this.board);
        if (rotated) {
            this.current = rotated;
            this.updateGhost();
            this.resetLockDelay();
        }
    }

    rotateLeft() {
        const rotated = this.current.rotateLeft(this.board);
        if (rotated) {
            this.current = rotated;
            this.updateGhost();
            this.resetLockDelay();
        }
    }

    spawnNext() {
        this.current = this.next;
        this.next = this.factory.createSevenBag();
        this.canHold = true;
        this.updateGhost();
        this.lockTimer = 0;
        this.lockMoveResets = 0;
    }

    swapHold() {
        if (this.canHold) {
            if (this.hold != null) {
                const tmp = this.hold;
                this.hold = this.current;
                this.current = tmp;
            } else {
                this.hold = this.current;
                this.spawnNext();
            }
            this.current.x = 4;
            this.current.y = 0;
            
            // 安全策：即死回避
            if (!this.board.canPlace(this.current)) {
                // 必要ならゲームオーバー処理
            }
            
            this.canHold = false;
            this.updateGhost();
        }
    }

    updateGhost() {
        if (!this.current) return;
        let clone = this.current.clone();
        while (this.board.canPlace(clone.cloneMoved(0, 1))) {
            clone = clone.cloneMoved(0, 1);
        }
        this.ghost = clone;
    }

    startLockDelay() {
        if (this.lockTimer == 0) {
            this.lockTimer = millis();
            this.lockMoveResets = 0;
        }
    }

    updateLockDelay() {
        if (this.lockTimer == 0) return;
        if (millis() - this.lockTimer >= this.lockDelay) {
            this.lockPiece();
        }
    }

    resetLockDelay() {
        if (this.lockTimer > 0 && this.lockMoveResets < this.maxLockResets) {
            this.lockTimer = millis();
            this.lockMoveResets++;
        }
    }

    lockPiece() {
        this.board.fix(this.current);
        this.board.clearLines();
        this.spawnNext();
        if (!this.board.canPlace(this.current)) {
            eventBus.emit("game-over", {});
        }
    }
}