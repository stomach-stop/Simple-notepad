class GameManager{ //ゲームの状態遷移
    constructor(){ //初期設定
        this.factory = new TetrominoFactory();
        this.board = new Board(10,20)
        this.game = new Game(this.factory, this.board);
        this.renderer = new Renderer();
        this.state = new PlayState();
        this.state.enter(this);
    }

    setBlockSize(blockSize){
        this.renderer.setBlockSize(blockSize);
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