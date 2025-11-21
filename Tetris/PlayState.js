class PlayState extends GameState{
    enter(manager){
        this.manager = manager;
        this.game = manager.game;
        this.renderer = manager.renderer;
    }

    update(){
        this.game.update();
    }

    render(){
        this.renderer.drawBoard(this.game.board);
        this.renderer.drawPolyomino(this.game.current);
        this.renderer.drawPolyomino(this.game.ghost, 0.3);
    }
}