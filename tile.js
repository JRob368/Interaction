function Tile(game,x,y,background) {
    Entity.call(this, game,x,y);
    this.background = background;

    this.northSouth = new Animation(ASSET_MANAGER.getAsset("./img/paths.png"), 0, 0, 16, 16, 1, 0, true, false);
    this.eastWest = new Animation(ASSET_MANAGER.getAsset("./img/paths.png"), 16, 0, 16, 16, 1, 0, true, false);
    this.nSFood = new Animation(ASSET_MANAGER.getAsset("./img/paths.png"), 48, 0, 16, 16, 1, 0, true, false);
    this.eWFood = new Animation(ASSET_MANAGER.getAsset("./img/paths.png"), 32, 0, 16, 16, 1, 0, true, false);
    this.paths = [];
    this.foodTrails = [];
    this.width =32;
    this.height = 32;
    this.paths = [];
}

Tile.prototype = new Entity();
Tile.prototype.constructor = Tile;

Tile.prototype.update = function () {
};

Tile.prototype.draw = function (ctx) {

    this.background.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    if(this.foodTrails.length > 0) {
        for(var i = 0; i < this.foodTrails.length; i++) {
            if (this.foodTrails[i].direction === "north" || this.foodTrails[i].direction === "south") {
                this.nSFood.drawFrame(this.game.clockTick, ctx, this.x + 8, this.y + 8);
            } else {
                this.eWFood.drawFrame(this.game.clockTick, ctx, this.x + 8, this.y + 8);
            }
        }
    } else {
        for(var j = 0; j < this.paths.length; j++) {
            if (this.paths[j].direction === "north" || this.paths[j].direction === "south") {
                this.northSouth.drawFrame(this.game.clockTick, ctx, this.x + 8, this.y + 8);
            } else {
                this.eastWest.drawFrame(this.game.clockTick, ctx, this.x + 8, this.y + 8);
            }
        }
    }


    ctx.strokeRect(this.x,this.y,32,32);
    Entity.prototype.draw.call(this);
};