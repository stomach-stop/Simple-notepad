function setup(){
    manager = new GameManager();
    handler = new InputHandler(manager);
    createDisplay();
}

function draw(){
    background(255);
    manager.update();
    manager.render();
    handler.update();
}

function keyPressed(){
    handler.onKeyDown(key);
}

function keyReleased(){
    handler.onKeyUp(key);
}

function createDisplay(){ //ゲーム画面を生成
    const boardWidth = 16;
    const boardHeight = 22;

    let blockSize = floor(min(
        windowWidth / boardWidth,
        windowHeight / boardHeight
    ));

    canvas = createCanvas(
        blockSize * boardWidth,
        blockSize * boardHeight
    );

    canvas.position(
        (windowWidth - width) / 2,
        (windowHeight - height) / 2
    );

    manager.setBlockSize(blockSize);
}

function windowResized(){ //画面を再生成
    createDisplay();
}

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

class GameState{ //Stateパターン
    enter(manager){} //状態に入ったときの処理
    update(){} //毎フレームの処理
    render(){} //描画処理
}

class MenuState extends GameState{}
class PlayState extends GameState{
    enter(manager){
        this.manager = manager;
        this.game = manager.game;
        this.renderer = manager.renderer;
    }

    update(){
        this.game.update();
    }

    render(){
        this.renderer.drawBoard(this.game.board);
        this.renderer.drawPolyomino(this.game.current);
        this.renderer.drawPolyomino(this.game.ghost, 0.3);
    }
}
class GameOverState extends GameState{}

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

class Polyomino{ //ブロックの基本操作
    constructor(type, shape, color, center, x = 4, y = 0){
        this.type = type; //ブロックの種類
        this.shape = shape; //ブロックの形
        this.color = color; //ブロックの色
        this.center = center; //回転の中心
        this.x = x; //初期座標
        this.y = y;

    }

    getPos(){ //座標を取得
        return this.shape.map(([sx, sy]) => [this.x + sx, this.y + sy]);
    }

    clone(){ //コピーを返す
        return new this.constructor(
            this.type,
            this.shape.map(([sx, sy]) => [sx, sy]),
            this.color,
            this.center,
            this.x,
            this.y
        );
    }

    cloneMoved(dx, dy){ //移動したコピーを返す
        const clone = this.clone();
        clone.x += dx;
        clone.y += dy;
        return clone;
    }

    cloneRotatedRight(){ //右回転したコピーを返す
        const clone = this.clone();
        const [cx, cy] = clone.center;
        clone.shape = clone.shape.map(([x, y]) => {
            const dx = x - cx;
            const dy = y - cy;
            return [cx - dy, cy + dx];
        });
        return clone;
    }

    cloneRotatedLeft(){ //左回転したコピーを返す
        const clone = this.clone();
        const [cx, cy] = clone.center;
        clone.shape = clone.shape.map(([x, y]) => {
            const dx = x - cx;
            const dy = y - cy;
            return [cx + dy, cy - dx];
        });
        return clone;
    }
}

class Tetromino extends Polyomino{
    constructor(type, shape, color, center, x, y){
        super(type, shape, color, center, x, y);
        this.rotState = 0; //回転状態
    }

    static SRS = {
        "0>R": [[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]],
        "R>0": [[0,0],[1,0],[1,-1],[0,2],[1,2]],

        "R>2": [[0,0],[1,0],[1,-1],[0,2],[1,2]],
        "2>R": [[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]],

        "2>L": [[0,0],[1,0],[1,1],[0,-2],[1,-2]],
        "L>2": [[0,0],[-1,0],[-1,-1],[0,2],[-1,2]],

        "L>0": [[0,0],[1,0],[1,-1],[0,2],[1,2]],
        "0>L": [[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]],
    };

    static SRS_I = {
        "0>R": [[0,0],[-2,0],[1,0],[-2,-1],[1,2]],
        "R>0": [[0,0],[2,0],[-1,0],[2,1],[-1,-2]],

        "R>2": [[0,0],[-1,0],[2,0],[-1,2],[2,-1]],
        "2>R": [[0,0],[1,0],[-2,0],[1,-2],[-2,1]],

        "2>L": [[0,0],[2,0],[-1,0],[2,1],[-1,-2]],
        "L>2": [[0,0],[-2,0],[1,0],[-2,-1],[1,2]],

        "L>0": [[0,0],[1,0],[-2,0],[1,-2],[-2,1]],
        "0>L": [[0,0],[-1,0],[2,0],[-1,2],[2,-1]]
    };

    static rotKey = ["0", "R", "2", "L"];

    rotateRight(board){ //右回転
        const old = this.rotState; //現在の回転状態
        const next = (this.rotState + 1) % 4; //次の回転状態

        const key = `${Tetromino.rotKey[old]}>${Tetromino.rotKey[next]}`;
        const table = (this.type === "I") ? Tetromino.SRS_I : Tetromino.SRS;

        const rotated = this.cloneRotatedRight();
        for(const [dx, dy] of table[key]){
            const moved = rotated.cloneMoved(dx, dy);
            if(board.canPlace(moved)){
                moved.rotState = next;
                return moved;
            }
        }
    }

    rotateLeft(board){ //左回転
        const old = this.rotState;
        const next = (this.rotState + 3) % 4;

        const key = `${Tetromino.rotKey[old]}>${Tetromino.rotKey[next]}`; //キーを生成
        const table = (this.type === "I") ? Tetromino.SRS_I : Tetromino.SRS;

        const rotated = this.cloneRotatedLeft();
        for(const [dx, dy] of table[key]){
            const moved = rotated.cloneMoved(dx, dy);
            if(board.canPlace(moved)){
                moved.rotState = next;
                return moved;
            }
        }
    }
}

class Pentomino extends Polyomino{}
class Hexomino extends Polyomino{}

class Factory{ //Factoryパターン
    constructor(){
        this.bag = [];
    }

    //生成ルールが増えたらStrategyパターンを適用
    create(type){ //ブロックを生成
        const {shape, center} = this.shapes[type];
        const color = this.colors[type];
        return new this.Product(type, shape, color, center);
    }

    createRandom(){ //ランダムにブロックを生成
        const types = Object.keys(this.shapes);
        const type = types[Math.floor(Math.random() * types.length)];
        return this.create(type);
    }

    createSevenBag(){ //7-bag方式
        if(this.bag.length == 0){
            const types = Object.keys(this.shapes);
            this.bag = types.slice(); //コピーを生成
            for(let i = this.bag.length - 1; i > 0; i--){ //シャッフル
                const j = Math.floor(Math.random() * (i + 1));
                [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]];
            }
        }
        const type = this.bag.pop();
        return this.create(type);
    } //シャッフルはメソッドとして分割するかも
}

class TetrominoFactory extends Factory{ //テトリミノのデータ
    constructor(){
        super();
        this.Product = Tetromino;
        this.shapes = { //形と中心
            I: { shape: [[0,0],[1,0],[2,0],[3,0]], center: [1.5,0.5] },
            O: { shape: [[0,0],[1,0],[0,1],[1,1]], center: [0.5,0.5] },
            T: { shape: [[1,0],[0,1],[1,1],[2,1]], center: [1,1] },
            S: { shape: [[1,0],[2,0],[0,1],[1,1]], center: [1,1] },
            Z: { shape: [[0,0],[1,0],[1,1],[2,1]], center: [1,1] },
            J: { shape: [[0,0],[0,1],[1,1],[2,1]], center: [1,1] },
            L: { shape: [[2,0],[0,1],[1,1],[2,1]], center: [1,1] }
        };
        this.colors = { //色
            I: "cyan",
            O: "yellow",
            T: "purple",
            S: "green",
            Z: "red",
            J: "blue",
            L: "orange"
        };
    }
}

class PentominoFactory extends Factory{}
class HexominoFactory extends Factory{}

class Board{
    constructor(width, height){
        this.width = width;
        this.height = height;
        this.grid = this.createGrid();
    }

    createGrid(){ //盤面を作る
        return Array.from({length: this.height}, () =>
        Array(this.width).fill(null));

    }

    fix(polyomino){ //ブロックを固定
        for(const [x, y] of polyomino.getPos()){
            if(
                x >= 0 && x < this.width &&
                y >= 0 && y < this.height
            ){
                this.grid[y][x] = {
                    type: polyomino.type,
                    color: polyomino.color
                };
            }
        }
    }

    clearLines(){ //埋まった行を削除
        this.grid = this.grid.filter(row => row.some(cell => !cell));
        const linesCleared = this.height - this.grid.length;
        while(this.grid.length < this.height){
            this.grid.unshift(Array(this.width).fill(null));
        }
        return linesCleared;
    }

    canPlace(polyomino){ //配置可能か
        for(const [x, y] of polyomino.getPos()){
            if(y >= this.height) return false;
            if(x < 0 || x >= this.width) return false;
            if(y >= 0 && this.grid[y][x]) return false;
            /*
            if (x < 0 || x >= this.width || y >= this.height) return false;
            if (y >= 0 && this.grid[y][x]) return false;
            */
        }
        return true;
    }
    
    canSpawn(polyomino){ //続行可能か
        return this.canPlace(polyomino);
    }
}

class Renderer{ //描画処理
    setBlockSize(blockSize){
        this.blockSize = blockSize;
    }

    drawBoard(board){ //ボードを描画
        const w =  board.width;
        const h = board.height;

        for(let i = 0; i < h; i++){
            for(let j = 0; j < w; j++){
                const cell = board.grid[i][j];
                if(cell){
                    fill(cell.color);
                }else{
                    fill("white");
                }
                rect(
                    j * this.blockSize,
                    i * this.blockSize,
                    this.blockSize,
                    this.blockSize,
                );
            }
        }
    }

    drawPolyomino(polyomino, alpha = 1.0){ //ブロックを描画
        drawingContext.globalAlpha = alpha; //透明度

        fill(polyomino.color);
        stroke(0);
        strokeWeight(1);

        for(const [x, y] of polyomino.getPos()){
            rect(
                x * this.blockSize,
                y * this.blockSize,
                this.blockSize,
                this.blockSize
            );
        }

        drawingContext.globalAlpha = 1.0; //デフォルトに戻す
    }
}

class InputHandler{ //入力処理
    constructor(manager){
        this.manager = manager;
        this.game = manager.game;

        this.pressed = {}; //キーの状態
        this.DAS = 150; //連続移動の遅延
        this.ARR = 30; //連続移動の間隔
        this.SDI = 50; //落下移動の間隔
    }

    update(){ //ブロックの連続移動処理
        const now = millis();

        ["a", "d"].forEach(k => {
            const state = this.pressed[k];
            if(!state) return;

            const sincePressed = now - state.timePressed;
            const sinceAct = now - state.lastAct;

            if(sincePressed >= this.DAS && sinceAct >= this.ARR){
                this.handle(k);
                state.lastAct = now;
            }
        });

        const sd = this.pressed["s"];
        if(sd && now - sd.lastAct >= this.SDI) {
            this.handle("s");
            sd.lastAct = now;
        }
    }

    handle(key){ //Commandパターンを使えばリプレイ機能を作れる
        switch(key){ //キーごとの操作
            case "w": while(this.game.move(0, 1)){} break;
            case "a": this.game.move(-1, 0); break;
            case "s": this.game.move(0, 1); break;
            case "d": this.game.move(1, 0); break;
            case "e": this.game.rotateRight(); break;
            case "q": this.game.rotateLeft(); break;
            case "c": this.game.swapHold(); break;
        }
        this.game.updateGhost();
    }

    onKeyDown(key){ //キーの入力処理
        key = key.toLowerCase();

        if(!this.pressed[key]){ //キー情報の初期化
            this.pressed[key] = {
                timePressed: millis(),
                lastAct: 0,
            };
        }

        this.handle(key);
        this.pressed[key].lastAct = millis();
    }

    onKeyUp(key){ //キー情報の削除
        key = key.toLowerCase();
        delete this.pressed[key];
    }
}

//自分でやること
//SRSの実装(左側で壁キックされないバグが発生)
//完成したコードのファイル分け
//Mementoパターンによる差し戻し機能の追加
//MementoとCommandの併用によるリプレイの逆再生
//Observerパターンによるイベントの発行
//生成パターン増加に伴うStrategyパターンの適用

//人に任せること
//ペンタミノとヘキサミノの追加
//Commandパターンによるリプレイ機能の追加
//ゲーム以外の画面作り(メニュー、設定画面、操作説明など)
//スコアや、ホールドしてるブロック、次のブロックの表示
//その他機能の追加