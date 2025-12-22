class GameSetting{ //変更可能な設定を管理
    #blockSize;
    get blockSize() { return this.#blockSize }
    set blockSize(newValue) { this.#blockSize = newValue }

    #dropInterval = 1000;
    get dropInterval() { return this.#dropInterval }
    set dropInterval(newValue) { this.#dropInterval = newValue }
}