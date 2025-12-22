class SevenBagStrategy extends Strategy{
    constructor(){
        super();
        this.bag = [];
    }

    nextType(shapes){
        if(this.bag.length === 0){
            this.bag = Object.keys(shapes);
            for(let i = this.bag.length - 1; i > 0; i--){
                const j = Math.floor(Math.random() * (i + 1));
                [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]];
            }
        }
        return this.bag.pop();
    }
}