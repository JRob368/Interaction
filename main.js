function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.timesFinished = 0;
    this.reverse = reverse;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
    var scaleBy = scaleBy || 1;
    this.elapsedTime += tick;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
            this.timesFinished++;
        }
    } else if (this.isDone()) {
        return;
    }
    var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
    var vindex = 0;
    if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
        index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
        vindex++;
    }
    while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
        index -= Math.floor(this.spriteSheet.width / this.frameWidth);
        vindex++;
    }

    var locX = x;
    var locY = y;
    var offset = vindex === 0 ? this.startX : 0;
    ctx.drawImage(this.spriteSheet,
                  index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
                  this.frameWidth, this.frameHeight,
                  locX, locY,
                  this.frameWidth * scaleBy,
                  this.frameHeight * scaleBy);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}



function createTiles(game) {
    for (var i = 0; i <= 32; i++) { //32
        for (var j = 0; j <= 25; j++) { //25
            var tileLoc = Math.floor(Math.random() * 8);
            var image = new Animation(ASSET_MANAGER.getAsset("./img/tiles.png"), tileLoc * 32, 0, 32, 32, 1, 0, true, false);
            var tile = new Tile(game,i*32,j*32,image);
            game.addEntity(tile);
        }
    }
}



// the "main" code begins here

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/tiles.png");
ASSET_MANAGER.queueDownload("./img/ants.png");
ASSET_MANAGER.queueDownload("./img/anthill.png");
ASSET_MANAGER.downloadAll(function () {
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');
    var gameEngine = new GameEngine();
    createTiles(gameEngine);

    var antHill = new AntHill(gameEngine,416,416);
    var food = new Food(gameEngine,256,256);
    var food1 = new Food(gameEngine,384,384);
    gameEngine.addEntity(food);
    gameEngine.addEntity(food1);
    gameEngine.addEntity(antHill);
    gameEngine.init(ctx);
    gameEngine.start();
});
