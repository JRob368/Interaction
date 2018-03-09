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

var globalGame;
var foodPieces = 3;

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
    globalGame = new GameEngine();
    loadGame();
    globalGame.init(ctx);
    globalGame.start();

});



function setFoodPieces(desiredPieces) {
    foodPieces = desiredPieces;
}

function restart() {
    console.log("reloading game world");
    globalGame.entities = [];
    globalGame.tiles = [];
    globalGame.foods = [];
    globalGame.isPaused = true;
    globalGame.hasStarted = false;
    loadGame();
}
function loadGame() {

    createTiles(globalGame);

    var antHill = new AntHill(globalGame,416,416);
    for(var i = 0; i < foodPieces; i++) {
        var x = Math.floor(Math.random() * 32);
        var y = Math.floor(Math.random() * 25);
        if(x === 13 && y === 13) {
            i--;
        } else {
            globalGame.addEntity(new Food(globalGame, x * 32, y * 32));
        }
    }

    globalGame.addEntity(antHill);

}

function start() {
    globalGame.isPaused = false;
}

function pause() {
    globalGame.isPaused = true;
}

function save() {
    globalGame.isPaused = true;
    var objects = globalGame.saveState();
    var objectsString = JSON.stringify(objects);
    socket.emit("save", { studentname: "James Roberts", statename: "aState", data: objectsString});
    console.log("Simulation Saved");
}

function loadSave() {
    socket.emit("load", { studentname: "James Roberts", statename: "aState" });
    console.log("Attempting to Load");
}

var socket = io.connect("http://24.16.255.56:8888");

socket.on("load", function (data) {
    if(data !== null && data.data !== null) {
        var objects = JSON.parse(data.data);
        globalGame.loadSave(objects);
        console.log("Loading Successful");
    } else {
        console.log("Load Failed");
    }
});