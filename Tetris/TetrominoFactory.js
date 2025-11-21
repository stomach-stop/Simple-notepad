class TetrominoFactory extends Factory{ //テトリミノのデータ
    constructor(){
        super();
        this.Product = Tetromino;
        this.shapes = { //形と中心
            I: { shape: [[0,0],[1,0],[2,0],[3,0]], center: [1.5,0.5] },
            O: { shape: [[0,0],[1,0],[0,1],[1,1]], center: [0.5,0.5] },
            T: { shape: [[1,0],[0,1],[1,1],[2,1]], center: [1,1] },
            S: { shape: [[1,0],[2,0],[0,1],[1,1]], center: [1,1] },
            Z: { shape: [[0,0],[1,0],[1,1],[2,1]], center: [1,1] },
            J: { shape: [[0,0],[0,1],[1,1],[2,1]], center: [1,1] },
            L: { shape: [[2,0],[0,1],[1,1],[2,1]], center: [1,1] }
        };
        this.colors = { //色
            I: "cyan",
            O: "yellow",
            T: "purple",
            S: "green",
            Z: "red",
            J: "blue",
            L: "orange"
        };
    }
}