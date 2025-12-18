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

class State{ //Stateパターン
    enter(manager){ //状態に入ったときの処理
        throw new Error("enter method must be implemented.");
    }
    update(){ //毎フレームの処理
        throw new Error("update method must be implemented.");
    }
    render(){ //描画処理
        throw new Error("render method must be implemented.");
    }
}

class MenuState extends State{}

class PlayState extends State{
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

class GameOverState extends State{}

class Game{ //ゲームの制御
    constructor(factory, board){
        //関連クラスの初期化
        this.board = board;
        this.poly = new PolyManager(factory, board);
        this.lock = new LockManager(board, this.poly);
        this.mover = new MoveManager(
            board,
            this.poly,
            () => this.lock.resetLockDelay()
        );

        //落下設定
        this.dropInterval = 1000; //落下間隔
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

    move(dx, dy) { return this.mover.move(dx, dy) }
    rotateLeft() { return this.mover.rotateLeft() }
    rotateRight() { return this.mover.rotateRight() }
    swapHold() { return this.poly.swapHold() }
    updateGhost() { return this.poly.updateGhost() }
    lockPiece() { return this.lock.lockPiece() }

    get current() { return this.poly.current }
    get ghost() { return this.poly.ghost }
}

class LockManager{ //ブロックの固定制御
    constructor(board, poly){
        this.board = board;
        this.poly = poly;

        this.lockDelay = 500; //固定遅延
        this.lockTimer = 0; //固定タイマー
        this.lockMoveResets = 0; //延命回数
        this.maxLockResets = 10; //延命回数の上限
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
        const piece = this.poly.current;
        this.board.fix(piece);
        this.board.clearLines();
        this.poly.spawnNext();

        if(!this.board.canPlace(piece)){
            eventBus.emit("game-over", {});
        }
    }
}

class MoveManager{ //ブロックの動作制御
    constructor(board, poly, resetLockDelay){
        this.board = board;
        this.poly = poly;
        this.resetLockDelay = resetLockDelay;
    }

    move(dx, dy){ //移動
        const moved = this.poly.current.cloneMoved(dx, dy);
        if(this.board.canPlace(moved)){ //動けるなら
            this.poly.current = moved; //動いたデータで上書き
            this.poly.updateGhost();
            this.resetLockDelay();
            return true;
        }
        return false;
    }

    rotateRight(){ //右回転
        const rotated = this.poly.current.rotateRight(this.board);
        this.poly.current = rotated;
        this.poly.updateGhost();
        this.resetLockDelay();
    }

    rotateLeft(){ //左回転
        const rotated = this.poly.current.rotateLeft(this.board);
        this.poly.current = rotated;
        this.poly.updateGhost();
        this.resetLockDelay();
    }
}

class PolyManager{ //ブロックの出現制御
    constructor(factory, board){
        this.factory = factory;
        this.board = board;

        this.current = this.factory.createSevenBag(); //今のブロック
        this.next = this.factory.createSevenBag(); //次のブロック
        this.hold = null; //ホールド枠
        this.canHold = true; //ホールド可能か
        this.ghost; //ブロックの影
        this.updateGhost();
    }

    spawnNext(){ //次のブロックを生成
        this.current = this.next;
        this.next = this.factory.createSevenBag();
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

class Polyomino{ //ブロックの情報を取得
    constructor(type, shape, color, center, x = 4, y = 0){
        this.type = type; //ブロックの種類
        this.shape = shape; //ブロックの形
        this.color = color; //ブロックの色
        this.center = center; //回転の中心
        this.x = x; //初期座標
        this.y = y;
        this.rotState = 0; //回転状態
    }

    static rotKey = ["0", "R", "2", "L"];

    getPos(){ //座標を取得
        return this.shape.map(([sx, sy]) => [this.x + sx, this.y + sy]);
    }

    clone(){ //コピーを返す
        const clone = new this.constructor(
            this.type,
            this.shape.map(([sx, sy]) => [sx, sy]),
            this.color,
            this.center,
            this.x,
            this.y
        );
        clone.rotState = this.rotState;
        return clone;
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

    rotateRight(board){ //右回転
        const old = this.rotState; //現在の回転状態
        const next = (this.rotState + 1) % 4; //次の回転状態

        const key = `${Polyomino.rotKey[old]}>${Polyomino.rotKey[next]}`; //キーを生成
        const table = this.getTable(); //テーブルを適用

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

        const key = `${Polyomino.rotKey[old]}>${Polyomino.rotKey[next]}`; //キーを生成
        const table = this.getTable();

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

class Tetromino extends Polyomino{ //SRS
    constructor(type, shape, color, center, x, y){
        super(type, shape, color, center, x, y);
    }

    static SRS = {
        "0>R": [[0,0],[-1,0],[-1,-1],[0,2],[-1,2]],
        "R>0": [[0,0],[1,0],[1,1],[0,-2],[1,-2]],

        "R>2": [[0,0],[1,0],[1,1],[0,-2],[1,-2]],
        "2>R": [[0,0],[-1,0],[-1,-1],[0,2],[-1,2]],

        "2>L": [[0,0],[1,0],[1,-1],[0,2],[1,2]],
        "L>2": [[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]],

        "L>0": [[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]],
        "0>L": [[0,0],[1,0],[1,-1],[0,2],[1,2]],
    };

    static SRS_I = {
        "0>R": [[0,0],[-2,0],[1,0],[-2,1],[1,-2]],
        "R>0": [[0,0],[2,0],[-1,0],[2,-1],[-1,2]],

        "R>2": [[0,0],[-1,0],[2,0],[-1,-2],[2,1]],
        "2>R": [[0,0],[1,0],[-2,0],[1,2],[-2,-1]],

        "2>L": [[0,0],[2,0],[-1,0],[2,-1],[-1,2]],
        "L>2": [[0,0],[-2,0],[1,0],[-2,1],[1,-2]],

        "L>0": [[0,0],[1,0],[-2,0],[1,2],[-2,-1]],
        "0>L": [[0,0],[-1,0],[2,0],[-1,-2],[2,1]]
    };

    getTable(){
        return (this.type === "I") ? Tetromino.SRS_I : Tetromino.SRS;
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

class EventBus{ //イベントを管理
    constructor(){
        this.handlers = {}; //イベント名
    }

    on(type, handler){ //イベントを購読
        (this.handlers[type] ??= []).push(handler);
    }

    off(type, handler){ //イベントの削除
        this.handlers[type] = (this.handlers[type] ?? []).filter(h => h !== handler);
    }

    emit(type, payload){ //イベントを通知
        (this.handlers[type] ?? []).forEach(h => h(payload));
    }
}

const eventBus = new EventBus();

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
        if(!this.canPlace(polyomino)) return false;

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
        eventBus.emit("piece-locked", {type: polyomino.type});
    }

    clearLines(){ //埋まった行を削除
        let linesCleared = 0;
        for(let y = this.height - 1; y >= 0; y--){
            if(this.grid[y].every(cell => cell)){
                this.grid.splice(y, 1);
                this.grid.unshift(Array(this.width).fill(null));
                linesCleared++;
                y++;
            }
        }
        if(linesCleared > 0){
            eventBus.emit("line-clear", {lines: linesCleared});
        }
        return linesCleared;
    }

    canPlace(polyomino){ //配置可能か
        for(const [x, y] of polyomino.getPos()){
            if(y >= this.height) return false;
            if(x < 0 || x >= this.width) return false;
            if(y >= 0 && this.grid[y][x]) return false;
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

    handle(key){
        const game = this.manager.game;

        switch(key){ //キーごとの操作
            case "w":
                let dist = 0;
                while(game.move(0, 1)) dist++;
                game.lockPiece();
                eventBus.emit("hard-drop", {dist});
                break;
            case "a": game.move(-1, 0); break;
            case "s": game.move(0, 1); break;
            case "d": game.move(1, 0); break;
            case "e": game.rotateRight(); break;
            case "q": game.rotateLeft(); break;
            case "c": game.swapHold(); break;
        }
        game.updateGhost();
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