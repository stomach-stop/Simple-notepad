class RandomStrategy extends Strategy{
    nextType(shapes){
        const types = Object.keys(shapes);
        return types[Math.floor(Math.random() * types.length)];
    }
}