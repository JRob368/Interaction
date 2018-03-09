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
    this.width = 32;
    this.height = 32;
    this.speed = 1;
    this.direction = direction;
    this.reverseDirections = this.buildReverseDirections();
    this.path = [{x: this.x, y: this.y, direction: this.direction}];
    this.foodTrail = [];
    this.tileCount = 3;
    this.foundFood = false;
    this.foundFoodTrail = false;
    this.justFoundFood = false;
    this.eatingCount = 0;
    this.home = antHill;
    this.distanceMoved = 0;
    this.badDir= null;
    this.gotLastPiece = false;
    this.foundBadTrail = false;
}

Ant.prototype = new Entity();
Ant.prototype.constructor = Ant;

Ant.prototype.update = function () {
    if(this.foundFoodTrail) {
        //this.foodTrail.splice(0,1);
        this.followTrail();
    } else if(this.foundFood) {
        this.returnHome();
    } else {
        this.forage();
    }
    Entity.prototype.update.call(this);
};

Ant.prototype.followTrail = function() {

    if(this.foodTrail.length > 0) {

        if(this.distanceMoved >= 32) {
            this.direction = this.foodTrail.pop().direction;
            for (var i = 0; i < this.game.tiles.length; i++) {
                if (this.game.tiles[i].x === this.x && this.game.tiles[i].y === this.y) {
                    if(this.game.tiles[i].foodTrails.length === 0) {
                        this.foodTrail.length = 0;
                    }
                }
            }

            this.path.push({x: this.x, y: this.y, direction: this.direction});
            this.distanceMoved = 0;
        }
        var distance = this.speed;
        this.distanceMoved += distance;
        this.move(distance);
    } else {
        this.foundFoodTrail = false;
        if(this.direction === "north") {this.y++;}
        else if(this.direction === "south") {this.y--;}
        else if(this.direction === "west") {this.x++;}
        else {this.x--;}
        this.checkAndConsumeFood();
        this.path.pop();
        if(!this.foundFood) {
            this.foundFood = true;
            this.gotLastPiece = true;
            this.foundBadTrail = true;
            this.direction = this.reverseDirections[this.direction];
            this.distanceMoved = 32;
            //this.path.pop();
            //console.log(this.x + " " + this.y);
        }

    }
};

Ant.prototype.returnHome = function() {
    if(this.justFoundFood) {
        this.eatingCount++;
        if(this.eatingCount > 15) this.justFoundFood = false;
    } else if(!(this.x === this.home.x && this.y === this.home.y)) {

        if(this.distanceMoved >= 32) {
            this.direction = this.reverseDirections[this.path[this.path.length - 1].direction];
            this.foodTrail.push(this.path.pop());
            this.distanceMoved = 0;
            for (var i = 0; i < this.game.tiles.length; i++) {
                if (this.game.tiles[i].x === this.x && this.game.tiles[i].y === this.y) {
                    if(this.gotLastPiece) {
                        this.game.tiles[i].foodTrails.length = 0;
                    } else {
                        this.game.tiles[i].foodTrails.push({direction: this.direction, trail: this.foodTrail.slice(0)});
                    }
                }
            }
        }
        var distance = this.speed;
        this.distanceMoved += distance;
        this.move(distance);

    } else {
        if(!this.foundBadTrail) {
            this.home.food++;
        }
        this.home.timer = 780;
        this.removeFromWorld = true;

        for (var i = 0; i < this.game.tiles.length; i++) {
            for(var j = 0; j < this.game.tiles[i].paths.length; j++) {
                if (this.game.tiles[i].paths[j].ant === this) {
                    this.game.tiles[i].paths.splice(j,1);
                }
            }
        }
    }

};

Ant.prototype.move = function(distance) {
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
};

Ant.prototype.willMoveOffScreen = function() {
    var willMoveOff = false;
    switch(this.direction) {
        case "north":
            if(this.y === 0) {
                willMoveOff = true;
            }
            break;
        case "south":
            if(this.y === this.game.ctx.canvas.height - 32){
                willMoveOff = true;
            }
            break;
        case "west":
            if(this.x === 0) {
                willMoveOff = true;
            }
            break;
        case "east":
            if(this.x === this.game.ctx.canvas.width - 32) {
                willMoveOff = true;
            }
            break;
    }
    return willMoveOff;
};
Ant.prototype.checkAndConsumeFood = function() {
    for(var i = 0; i < this.game.foods.length; i++) {
        var intersection = this.intersectsFood(this.game.foods[i]);
        if(intersection.found === true) {
            this.game.foods[i].size--;
            this.foundFood = true;
            this.foodTrail = [{x: this.x, y:this.y, direction: this.direction}];
            this.justFoundFood = true;
            if(this.game.foods[i].size === 0) {
                this.gotLastPiece = true;
            }
            this.direction = intersection.direction;
            this.distanceMoved = 32;
        }
    }
};

Ant.prototype.forage = function() {
    var distance = this.speed;
    this.distanceMoved += distance;

    //If ant has moved 3 tiles or will move off screen choose a new direction and leave a path.
    if(this.tileCount >= 2 || this.willMoveOffScreen()) {
        this.tileCount = 0;
        var directions = this.getAvailableDirections(distance);
        var choice = Math.floor(Math.random() * directions.length);
        this.direction = directions[choice];
    }

    this.move(distance);
    //Have moved the length of one tile.
    if(this.distanceMoved >= 32) {
        this.distanceMoved = 0;
        this.tileCount++;
        this.path.push({x: this.x, y: this.y, direction: this.direction});
        //check for food in surrounding tiles
        this.checkAndConsumeFood();

        var j = 0;
        var beenHere = false;
        this.badDir = null;
        while (!beenHere && j < this.path.length - 1) {
            if (this.path[j].x === this.x && this.path[j].y === this.y) {
                beenHere = true;
                if (j > 1) {
                    this.badDir = this.path[j - 1].direction;
                }
            } else {
                j++;
            }
        }
        if (beenHere) {
            this.path.length = j + 1;
        }


        for (var i = 0; i < this.game.tiles.length; i++) {
            if (this.game.tiles[i].x === this.x && this.game.tiles[i].y ===this.y) {
                if(this.game.tiles[i].foodTrails.length > 0) {
                    this.foundFoodTrail = true;
                    var shortest = this.game.tiles[i].foodTrails[0].trail.length;
                    var shortestIndex = 0;
                    for(var j = 1; j < this.game.tiles[i].foodTrails.length; j++) {
                        if(this.game.tiles[j].foodTrails.length < shortest) {
                            shortest = this.game.tiles[i].foodTrails[j].trail.length;
                            shortestIndex = j;
                        }
                    }
                    this.foodTrail = this.game.tiles[i].foodTrails[shortestIndex].trail.slice();
                    this.foodTrail.pop();
                    this.distanceMoved = 32;
                } else {
                    for (var j = 0; j < this.game.tiles[i].paths.length; j++) {
                        if (this.game.tiles[i].paths[j].ant === this) {
                            this.game.tiles[i].paths.splice(j, 1);
                        }
                    }
                    this.game.tiles[i].paths.push({direction: this.direction, ant: this});
                }
            }
        }
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
Ant.prototype.getAvailableDirections = function() {
    var directions = [];
    //add all directions that won't cause the ant to leave the game world.
    if(!(this.y <= 0)) {
        directions.push("north");
    }
    if(!(this.y >= this.game.ctx.canvas.height - 32)){
        directions.push("south");
    }
    if(!(this.x <= 0)) {

        directions.push("west");
    }
    if(!(this.x >= this.game.ctx.canvas.width - 32)){
        directions.push("east");
    }

    //remove the direction that will cause the ant to turn around 180 degrees.
    var backwards = this.reverseDirections[this.direction];
    var reverseIndex = directions.indexOf(backwards);
    if(reverseIndex !== -1) {
        directions.splice(reverseIndex,1);
    }
    if(this.badDir !== null) {
        var badIndex = directions.indexOf(this.badDir);
        if(badIndex !== -1) {
            directions.splice(badIndex,1);
        }
    }

    return directions;
};

Ant.prototype.intersectsFood = function(food) {
    var foundFood = {found: false, direction: null};
    if(this.y === food.y) {
        if(this.x === food.x + 32) {
            foundFood = {found: true, direction: "west"};
        } else if(this.x === food.x - 32) {
            foundFood = {found: true, direction: "east"};
        }
    } else if(this.x === food.x) {
        if(this.y === food.y + 32) {
            foundFood = {found: true, direction: "north"};
        } else if(this.y === food.y - 32) {
            foundFood = {found: true, direction: "south"};
        }
    }
    return foundFood;
};

Ant.prototype.draw = function (ctx) {

    switch(this.direction) {
        case "north":
            if(this.foundFood && !this.foundBadTrail) {
                this.walkFoodAnimationUp.drawFrame(this.game.clockTick, ctx, this.x, this.y);
            } else {
                this.walkAnimationUp.drawFrame(this.game.clockTick, ctx, this.x, this.y);
            }
            break;
        case "south":
            if(this.foundFood && !this.foundBadTrail) {
                this.walkFoodAnimationDown.drawFrame(this.game.clockTick, ctx, this.x, this.y);
            } else {
                this.walkAnimationDown.drawFrame(this.game.clockTick, ctx, this.x, this.y);
            }

            break;
        case "west":
            if(this.foundFood && !this.foundBadTrail) {
                this.walkFoodAnimationLeft.drawFrame(this.game.clockTick, ctx, this.x, this.y);
            } else {
                this.walkAnimationLeft.drawFrame(this.game.clockTick, ctx, this.x, this.y);
            }
            break;
        case "east":
            if(this.foundFood && !this.foundBadTrail) {
                this.walkFoodAnimationRight.drawFrame(this.game.clockTick, ctx, this.x, this.y);
            } else {
                this.walkAnimationRight.drawFrame(this.game.clockTick, ctx, this.x, this.y);
            }
            break;
    }

    Entity.prototype.draw.call(this);
};

