// This game shell was happily copied from Googler Seth Ladd's "Bad Aliens" game and his Google IO talk in 2011

window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (/* function */ callback, /* DOMElement */ element) {
                window.setTimeout(callback, 1000 / 60);
            };
})();



function Timer() {
    this.gameTime = 0;
    this.maxStep = 0.05;
    this.wallLastTimestamp = 0;
}

Timer.prototype.tick = function () {
    var wallCurrent = Date.now();
    var wallDelta = (wallCurrent - this.wallLastTimestamp) / 1000;
    this.wallLastTimestamp = wallCurrent;

    var gameDelta = Math.min(wallDelta, this.maxStep);
    this.gameTime += gameDelta;
    return gameDelta;
}

function GameEngine() {
    this.entities = [];
    this.tiles = [];
    this.foods = [];
    this.showOutlines = false;
    this.ctx = null;
    this.click = null;
    this.mouse = null;
    this.wheel = null;
    this.surfaceWidth = null;
    this.surfaceHeight = null;
    this.space = null;
    this.isPaused = true;
    this.hasStarted = false;
}
GameEngine.prototype.loadSave = function(objects) {
    this.entities = [];
    this.tiles = [];
    this.foods = [];
    this.isPaused = true;
    this.hasStarted = false;
    var antHill;
    var entity;
    for(var i = 0; i < objects.length; i++) {
        if(objects[i].type === "anthill") {
            entity = new AntHill(this, objects[i].x, objects[i].y);
            entity.timer = objects[i].time;
            entity.food = objects[i].food;
            antHill = entity;
        } else if(objects[i].type === "food") {
            entity = new Food(this, objects[i].x, objects[i].y);
            entity.size = objects[i].size;
        } else if(objects[i].type === "ant") {
            entity = new Ant(this, objects[i].x, objects[i].y, objects[i].direction, antHill);
            entity.path = objects[i].path;
            entity.foodTrail = objects[i].foodTrail;
            entity.tileCount = objects[i].tileCount;
            entity.foundFood = objects[i].foundFood;
            entity.foundFoodTrail = objects[i].foundFoodTrail;
            entity.justFoundFood = objects[i].justFoundFood;
            entity.eatingCount = objects[i].eatingCount;
            entity.distanceMoved = objects[i].distanceMoved;
            entity.badDir = objects[i].badDir;
            entity.gotLastPiece = objects[i].gotLastPiece;
            entity.foundBadTrail = objects[i].foundBadTrail;
        } else if(objects[i].type === "tile") {
            var background = new Animation(ASSET_MANAGER.getAsset("./img/tiles.png"), objects[i].background.startX, 0, 32, 32, 1, 0, true, false);
            entity = new Tile(this, objects[i].x, objects[i].y, background);
            entity.foodTrails = objects[i].foodTrails;
            entity.paths = objects[i].paths;
        }
        this.addEntity(entity);
    }

    for(var i = 0; i < this.tiles.length; i++) {
        if(this.tiles[i].paths.length > 0) {
            for(var j = 0; j < this.tiles[i].paths.length; j++) {
                var antIndex = this.tiles[i].paths[j].ant;
                this.tiles[i].paths[j].ant = this.entities[antIndex];
            }
        }
    }
};

GameEngine.prototype.saveState = function() {
    var objects = [];
    var info;
    for(var i = 0; i < this.entities.length; i++) {
        if(this.entities[i] instanceof AntHill) {
            info = {type: "anthill", x: this.entities[i].x, y: this.entities[i].y,time: this.entities[i].timer,
                food: this.entities[i].food};
        } else if(this.entities[i] instanceof Food) {
            info = {type: "food", x: this.entities[i].x, y: this.entities[i].y, size: this.entities[i].size};
        } else if(this.entities[i] instanceof Ant) {
            info = {type: "ant", x: this.entities[i].x, y: this.entities[i].y, direction: this.entities[i].direction,
                path: this.entities[i].path, foodTrail: this.entities[i].foodTrail, tileCount: this.entities[i].tileCount,
                foundFood: this.entities[i].foundFood, foundFoodTrail: this.entities[i].foundFoodTrail,
                justFoundFood: this.entities[i].justFoundFood, eatingCount: this.entities[i].eatingCount,
                distanceMoved: this.entities[i].distanceMoved, badDir: this.entities[i].badDir,
                gotLastPiece: this.entities[i].gotLastPiece, foundBadTrail: this.entities[i].foundBadTrail};
        } else {
            info = {type: "tile", x: this.entities[i].x, y: this.entities[i].y, background: this.entities[i].background,
                foodTrails: this.entities[i].foodTrails, paths: []};
                if(this.entities[i].paths.length > 0) {
                    for (var j = 0; j < this.entities[i].paths.length; j++) {
                        info.paths.push({direction: this.entities[i].paths[j].direction, ant: this.entities.indexOf(this.entities[i].paths[j].ant)});
                    }
                }
        }
        objects.push(info);
    }
    return objects;
};

GameEngine.prototype.pause = function() {
    this.isPaused = !this.isPaused;
};

GameEngine.prototype.init = function (ctx) {
    this.ctx = ctx;
    this.surfaceWidth = this.ctx.canvas.width;
    this.surfaceHeight = this.ctx.canvas.height;
    this.startInput();
    this.timer = new Timer();
    console.log('game initialized');
};

GameEngine.prototype.start = function () {
    console.log("starting game");
    var that = this;
    (function gameLoop() {
        that.loop();
        requestAnimFrame(gameLoop, that.ctx.canvas);
    })();
}

GameEngine.prototype.startInput = function () {
    console.log('Starting input');
    var that = this;
    /*
    this.ctx.canvas.addEventListener("keydown", function (e) {
        if (String.fromCharCode(e.which) === 'A') that.A = true;
        if (String.fromCharCode(e.which) === 'W') that.W = true;
        if (String.fromCharCode(e.which) === 'S') that.S = true;
        if (String.fromCharCode(e.which) === 'D') that.D = true;
        if (String.fromCharCode(e.which) === 'K') that.K = true;
        if (String.fromCharCode(e.which) === 'I') that.I = true;
        if (String.fromCharCode(e.which) === 'O') that.O = true;
        if (String.fromCharCode(e.which) === ' ') that.space = true;

        e.preventDefault();
    }, false);
    */
    console.log('Input started');
};

GameEngine.prototype.addEntity = function (entity) {
    console.log('added entity');
    this.entities.push(entity);
    if(entity instanceof Tile) {
        this.tiles.push(entity);
    }
    if(entity instanceof Food) {
        this.foods.push(entity);
    }
};

GameEngine.prototype.draw = function () {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.save();

    for (var i = 0; i < this.entities.length; i++) {
        this.entities[i].draw(this.ctx);
    }
    this.ctx.restore();
};

GameEngine.prototype.update = function () {
    var entitiesCount = this.entities.length;

    for (var i = 0; i < entitiesCount; i++) {
        var entity = this.entities[i];

        if (!entity.removeFromWorld) {
            entity.update();
        }
    }

    for (var i = this.entities.length - 1; i >= 0; --i) {
        if (this.entities[i].removeFromWorld) {
            this.entities.splice(i, 1);
        }
    }

    for (var i = this.foods.length - 1; i >= 0; --i) {
        if (this.foods[i].removeFromWorld) {
            this.foods.splice(i, 1);
        }
    }
};

GameEngine.prototype.loop = function () {
    if(!this.isPaused) {
        this.clockTick = this.timer.tick();
        this.update();
        this.draw();
    } else if(!this.hasStarted) {
        this.clockTick = this.timer.tick();
        this.update();
        this.draw();
        this.hasStarted = true;
    }
};

function Entity(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.removeFromWorld = false;
}

Entity.prototype.update = function () {
};

Entity.prototype.draw = function (ctx) {
    if (this.game.showOutlines && this.radius) {
        this.game.ctx.beginPath();
        this.game.ctx.strokeStyle = "green";
        this.game.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.game.ctx.stroke();
        this.game.ctx.closePath();
    }
};

Entity.prototype.rotateAndCache = function (image, angle) {
    var offscreenCanvas = document.createElement('canvas');
    var size = Math.max(image.width, image.height);
    offscreenCanvas.width = size;
    offscreenCanvas.height = size;
    var offscreenCtx = offscreenCanvas.getContext('2d');
    offscreenCtx.save();
    offscreenCtx.translate(size / 2, size / 2);
    offscreenCtx.rotate(angle);
    offscreenCtx.translate(0, 0);
    offscreenCtx.drawImage(image, -(image.width / 2), -(image.height / 2));
    offscreenCtx.restore();
    //offscreenCtx.strokeStyle = "red";
    //offscreenCtx.strokeRect(0,0,size,size);
    return offscreenCanvas;
};
