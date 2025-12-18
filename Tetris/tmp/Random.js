class Random {
    constructor(seed = Date.now()) {
        this.seed = seed;
    }

    // 0以上1未満の乱数を返す（Math.random()の代わり）
    next() {
        this.seed ^= this.seed << 13;
        this.seed ^= this.seed >> 17;
        this.seed ^= this.seed << 5;
        return (this.seed >>> 0) / 4294967296;
    }
}