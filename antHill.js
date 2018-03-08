function AntHill(game,x,y) {

    this.animation = new Animation(ASSET_MANAGER.getAsset("./img/anthill.png"), 0, 0, 32, 32, 1, 0, true, false);
    this.timer = 798;
    Entity.call(this, game,x,y);
    this.directions = ["north","south","east","west"];
    this.width = 32;
    this.height = 32;
    this.food = 0;
}

AntHill.prototype = new Entity();
AntHill.prototype.constructor = AntHill;

AntHill.prototype.update = function () {
    this.timer++;
    if(this.timer >= 800) {
        this.timer = 0;
        var choice = Math.floor(Math.random() * this.directions.length);
        var direction = this.directions[choice];
        var ant = new Ant(this.game,this.x,this.y,direction,this);
        this.game.addEntity(ant);
    }
    Entity.prototype.update.call(this);
};

AntHill.prototype.draw = function (ctx) {
    this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    Entity.prototype.draw.call(this);
};