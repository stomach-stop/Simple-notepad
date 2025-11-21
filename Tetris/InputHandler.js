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