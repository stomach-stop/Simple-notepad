class Factory{ //Factoryパターン
    constructor(){
        this.bag = [];
    }

    create(type){ //ブロックを生成
        const {shape, center} = this.shapes[type];
        const color = this.colors[type];
        return new this.Product(type, shape, center, color);
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
    }
}