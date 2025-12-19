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
    const boardWidth = 10;
    const boardHeight = 20;

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