class Factory { 
    constructor() {
        this.bag = [];
        this.random = { next: () => Math.random() };
    }

    setRandom(random) {
        this.random = random;
    }

    // 【追加】在庫リセット機能
    reset() {
        this.bag = [];
    }

    create(type) { 
        const { shape, center } = this.shapes[type];
        const color = this.colors[type];
        return new this.Product(type, shape, color, center);
    }

    createRandom() { 
        const types = Object.keys(this.shapes);
        const type = types[Math.floor(this.random.next() * types.length)];
        return this.create(type);
    }

    createSevenBag() { 
        if (this.bag.length == 0) {
            const types = Object.keys(this.shapes);
            this.bag = types.slice(); 
            for (let i = this.bag.length - 1; i > 0; i--) { 
                const j = Math.floor(this.random.next() * (i + 1));
                [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]];
            }
        }
        const type = this.bag.pop();
        return this.create(type);
    } 
}