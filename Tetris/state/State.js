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