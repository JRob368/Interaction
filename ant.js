function Ant(game,x,y, direction,antHill) {
    Entity.call(this, game, x, y);
    this.walkAnimationUp = new Animation(ASSET_MANAGER.getAsset("./img/ants.png"), 0, 0, 32, 32, 0.2, 4, true, false);
    this.walkAnimationDown = new Animation(ASSET_MANAGER.getAsset("./img/ants.png"), 128, 0, 32, 32, 0.2, 4, true, false);
    this.walkAnimationLeft = new Animation(ASSET_MANAGER.getAsset("./img/ants.png"), 0, 32, 32, 32, 0.2, 4, true, false);
    this.walkAnimationRight = new Animation(ASSET_MANAGER.getAsset("./img/ants.png"), 128, 32, 32, 32, 0.2, 4, true, false);
    this.walkFoodAnimationUp = new Animation(ASSET_MANAGER.getAsset("./img/ants.png"), 0, 64, 32, 32, 0.2, 4, true, false);
    this.walkFoodAnimationDown = new Animation(ASSET_MANAGER.getAsset("./img/ants.png"), 128, 64, 32, 32, 0.2, 4, true, false);
    this.walkFoodAnimationLeft = new Animation(ASSET_MANAGER.getAsset("./img/ants.png"), 0, 96, 32, 32, 0.2, 4, true, false);
    this.walkFoodAnimationRight = new Animation(ASSET_MANAGER.getAsset("./img/ants.png"), 128, 96, 32, 32, 0.2, 4, true, false);
    this.width = 2;
    this.height = 2;
    this.speed = 50;
    this.direction = direction;
    this.reverseDirections = this.buildReverseDirections();
    this.path = [{x: this.x, y: this.y, direction: this.direction}];
    this.lastCoord = {x: this.x, y: this.y};
    this.tileCount = 3;
    this.foundFood = false;
    this.home = antHill;
}

Ant.prototype = new Entity();
Ant.prototype.constructor = Ant;

Ant.prototype.update = function () {
    if(this.foundFood) {
        this.returnHome();
    } else {
        this.forage();
    }

    Entity.prototype.update.call(this);
};

Ant.prototype.returnHome = function() {

    if(!this.intersects(this.home) || this.path.length >= 1) {
        if(Math.abs(this.x - this.lastCoord.x) >= 32 || Math.abs(this.y - this.lastCoord.y) >= 32) {
            for (i = 0; i < this.game.tiles.length; i++) {
                if (this.intersects(this.game.tiles[i])) {
                    this.game.tiles[i].foodTrails.push({direction: this.direction});
                }

            }
            this.lastCoord.x = this.x;
            this.lastCoord.y = this.y;
        }
        var newLoc = this.path.pop();
        //Move the ant in the right direction.
        this.x = newLoc.x;
        this.y = newLoc.y;
        this.direction = this.reverseDirections[newLoc.direction];
    } else {
        this.home.food++;
        this.removeFromWorld = true;
    }
};

Ant.prototype.willMoveOffScreen = function(distance) {
    var willMoveOff = false;
    switch(this.direction) {
        case "north":
            if(this.y - distance < 0) {
                willMoveOff = true;
            }
            break;
        case "south":
            if(this.y + distance > this.game.ctx.canvas.height - 32){
                willMoveOff = true;
            }
            break;
        case "west":
            if(this.x - distance < 0) {
                willMoveOff = true;
            }
            break;
        case "east":
            if(this.x + distance > this.game.ctx.canvas.width - 32) {
                willMoveOff = true;
            }
            break;
    }
    return willMoveOff;
};

Ant.prototype.forage = function() {
    //Check to see if the ant moved to food the last turn

    for(i = 0; i < this.game.foods.length; i++) {
        if(this.intersects(this.game.foods[i])) {
            this.foundFood = true;
            this.game.foods[i].size -= 2;
        }

    }

    if(!this.foundFood) {
        var distance = this.game.clockTick * this.speed;
        //If ant has moved 3 tiles or will move off screen choose a new direction and leave a path.
        if(this.willMoveOffScreen(distance) || this.tileCount >= 2) {
            this.tileCount = 0;
            var directions = this.getAvailableDirections(distance);
            var choice = Math.floor(Math.random() * directions.length);
            this.direction = directions[choice];
        }

        //Check which tile the ant is on and leave a path
        if (Math.abs(this.x - this.lastCoord.x) >= 32 || Math.abs(this.y - this.lastCoord.y) >= 32) {
            for (i = 0; i < this.game.tiles.length; i++) {
                if (this.intersects(this.game.tiles[i])) {
                    this.game.tiles[i].paths.push({direction: this.direction});
                }

            }
            this.lastCoord.x = this.x;
            this.lastCoord.y = this.y;
            this.tileCount++;
        }

        //Move the ant in the right direction.
        switch (this.direction) {
            case "north":
                this.y -= distance;
                break;
            case "south":
                this.y += distance;
                break;
            case "west":
                this.x -= distance;
                break;
            case "east":
                this.x += distance;
                break;
        }
        this.path.push({x: this.x, y: this.y, direction: this.direction});
    }
};

Ant.prototype.buildReverseDirections = function() {
    var directions = [];
    directions["north"] = "south";
    directions["south"] = "north";
    directions["east"] = "west";
    directions["west"] = "east";
    return directions;
};

//Gives the ant all available directions that won't cause it to walk out of the game world
//or reverse it's current direction.
Ant.prototype.getAvailableDirections = function(distance) {
    var directions = [];
    //add all directions that won't cause the ant to leave the game world.
    if(!(this.y - distance < 0)) {
        directions.push("north");
    }
    if(!(this.y + distance > this.game.ctx.canvas.height - 32)){
        directions.push("south");
    }
    if(!(this.x - distance < 0)) {

        directions.push("west");
    }
    if(!(this.x + distance > this.game.ctx.canvas.width - 32)){
        directions.push("east");
    }

    //remove the direction that will cause the ant to turn around 180 degrees.
    var backwards = this.reverseDirections[this.direction];
    var reverseIndex = directions.indexOf(backwards);
    if(reverseIndex !== -1) {
        directions.splice(reverseIndex,1);
    }

    //more than one option, make sure ant isn't walking backwards along it's old path
    if(directions.length >= 1) {
        if(this.path.indexOf({x: this.x, y: this.y, direction: this.direction}) != -1) {
            console.log("found an old path");
        }
    }
    return directions;
};

Ant.prototype.intersects = function(tile) {
    return this.x + 16 < tile.x + tile.width && this.x + 16 + this.width > tile.x &&
        this.y + 16 < tile.y + tile.height && this.height + this.y + 16 > tile.y;
};

Ant.prototype.draw = function (ctx) {

    switch(this.direction) {
        case "north":
            if(this.foundFood) {
                this.walkFoodAnimationUp.drawFrame(this.game.clockTick, ctx, this.x, this.y);
            } else {
                this.walkAnimationUp.drawFrame(this.game.clockTick, ctx, this.x, this.y);
            }
            break;
        case "south":
            if(this.foundFood) {
                this.walkFoodAnimationDown.drawFrame(this.game.clockTick, ctx, this.x, this.y);
            } else {
                this.walkAnimationDown.drawFrame(this.game.clockTick, ctx, this.x, this.y);
            }

            break;
        case "west":
            if(this.foundFood) {
                this.walkFoodAnimationLeft.drawFrame(this.game.clockTick, ctx, this.x, this.y);
            } else {
                this.walkAnimationLeft.drawFrame(this.game.clockTick, ctx, this.x, this.y);
            }
            break;
        case "east":
            if(this.foundFood) {
                this.walkFoodAnimationRight.drawFrame(this.game.clockTick, ctx, this.x, this.y);
            } else {
                this.walkAnimationRight.drawFrame(this.game.clockTick, ctx, this.x, this.y);
            }
            break;
    }

    Entity.prototype.draw.call(this);
};

