class ReplayState extends State { // 【変更】PlayState ではなく State を継承
    constructor(replayData) {
        super();
        this.replayData = replayData;
        this.logIndex = 0;
        this.replayStartTime = 0;
    }

    enter(manager) {
        // super.enter(manager); // Stateのenterはエラーを投げるだけなので呼ばない
        
        this.manager = manager;
        this.game = manager.game;
        this.renderer = manager.renderer; // 【追加】描画に必要なので確保
        this.replayStartTime = millis();
        
        this.logs = this.replayData.logs;
        this.logIndex = 0;
        console.log("Replay Start");
    }

    update(manager) {
        const now = millis() - this.replayStartTime;

        // ログを再生
        while (this.logIndex < this.logs.length) {
            const log = this.logs[this.logIndex];
            if (log.time <= now) {
                if (log.type === "down") {
                    manager.inputHandler.onKeyDown(log.key, true); // true = リプレイ中
                } else if (log.type === "up") {
                    manager.inputHandler.onKeyUp(log.key, true);
                }
                this.logIndex++;
            } else {
                break;
            }
        }
        
        // 【追加】PlayState任せにしていた更新処理を自分で実行
        this.game.update();
    }

    render(manager) {
        // 【追加】PlayState任せにしていた描画処理を自分で実行
        this.renderer.drawBoard(this.game.board);
        this.renderer.drawPolyomino(this.game.current);
        this.renderer.drawPolyomino(this.game.ghost, 0.3);
    }
}