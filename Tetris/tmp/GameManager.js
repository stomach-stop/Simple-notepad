class GameManager { 
    constructor() { 
        this.factory = new TetrominoFactory();
        this.board = new Board(10, 20);
        this.renderer = new Renderer();
        this.inputHandler = new InputHandler(this);
        this.replayData = null;
        
        this.startNewGame();
    }

    startNewGame() {
        // 入力リセット
        if (this.inputHandler) this.inputHandler.reset();

        // 盤面を新品にする
        this.board = new Board(10, 20);

        // 乱数シードをリセット
        const seed = Date.now();
        this.random = new Random(seed);
        this.factory.setRandom(this.random);

        // 工場の在庫をリセット
        this.factory.reset();

        this.game = new Game(this.factory, this.board);

        // 記録開始
        this.isRecording = true;
        this.inputLogs = [];
        this.gameStartTime = millis();
        this.replaySeed = seed;

        this.changeState(new PlayState());
    }

    startReplay(replayData) {
        // 入力リセット
        if (this.inputHandler) this.inputHandler.reset();

        // 盤面を新品にする
        this.board = new Board(10, 20);

        // 保存されたシードを使う
        this.random = new Random(replayData.seed);
        this.factory.setRandom(this.random);

        // 工場の在庫をリセット
        this.factory.reset();

        this.game = new Game(this.factory, this.board);

        // 記録停止（再生のみ）
        this.isRecording = false;

        this.changeState(new ReplayState(replayData));
    }

    setBlockSize(blockSize) { this.renderer.setBlockSize(blockSize); }
    update() { this.state.update(this); }
    render() { this.state.render(this); }
    changeState(newState) { 
        this.state = newState;
        this.state.enter(this);
    }
}