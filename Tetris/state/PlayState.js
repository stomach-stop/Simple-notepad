class PlayState extends State{
    enter(manager){
        this.board = manager.board;
        this.game = manager.game;
        this.renderer = manager.renderer;
    }

    update(){
        this.game.update();
    }

    render(){
        this.renderer.drawBoard(this.board);
        this.renderer.drawPolyomino(this.game.current);
        this.renderer.drawPolyomino(this.game.ghost, 0.3);
    }
}