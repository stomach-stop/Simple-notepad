class GameManager{ //ゲームの状態遷移
    constructor(setting){ //初期設定
        //ゲームロジック関連
        this.strategy = new SevenBagStrategy();
        this.factory = new TetrominoFactory(this.strategy);
        this.board = new Board();
        this.game = new Game(setting, this.factory, this.board);

        //描画・状態
        this.renderer = new Renderer(setting);
        this.state = new PlayState();
        this.state.enter(this);
    }

    update(){ //現在の状態を実行
        this.state.update(this);
    }

    render(){ //描画
        this.state.render(this);
    }
    
    changeState(newState){ //状態遷移
        this.state = newState;
        this.state.enter(this);
    }
}