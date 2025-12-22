class Factory{ //Factoryパターン
    constructor(strategy){
        this.strategy = strategy;
    }

    create(type){ //ブロックを生成
        const {shape, center} = this.shapes[type];
        const color = this.colors[type];
        return new this.Product(type, shape, center, color);
    }

    createNext(){
        const type = this.strategy.nextType(this.shapes);
        return this.create(type);
    }
}