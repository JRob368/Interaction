function Food(game,x,y) {
    Entity.call(this, game, x, y);
    this.largeAnimation = new Animation(ASSET_MANAGER.getAsset("./img/ants.png"), 0, 128, 32, 32, 1, 1, true, false);
    this.mediumAnimation = new Animation(ASSET_MANAGER.getAsset("./img/ants.png"), 32, 128, 32, 32, 1, 1, true, false);
    this.smallAnimation = new Animation(ASSET_MANAGER.getAsset("./img/ants.png"), 64, 128, 32, 32, 1, 1, true, false);
    this.smallestAnimation = new Animation(ASSET_MANAGER.getAsset("./img/ants.png"), 96, 128, 32, 32, 1, 1, true, false);

    this.width = 32;
    this.height = 32;
    this.maxSize = 12;
    this.size = 12;
}

Food.prototype = new Entity();
Food.prototype.constructor = Food;

Food.prototype.update = function () {
    if(this.size === 0) this.removeFromWorld = true;
};

Food.prototype.draw = function(ctx){
    if(this.size >= this.maxSize * 3/4) {
        this.largeAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    } else if (this.size >= this.maxSize / 2) {
        this.mediumAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    } else if(this.size >= 2) {
        this.smallAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    } else {
        this.smallestAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    }
};
