/***********************
* 0h Game Jam
* Sam Donow: sad3@williams.edu
* (c) 2pm November 2, 2014
* 
* Visual modifications made after the game jam for polish
* with the aid of Nigel Munoz: nm9@williams.edu
*************************/

var START_TIME = currentTime();


var player 
var direction
var SpawnTime
var enemies
var frameCount
var font = "Oswald"
var digitsToDisplay

var boop = loadSound('sound1.wav')
var showStartScreen

defineFont("Oswald", "Oswald-Regular")
Array.prototype.remove = function(obj) {
    for (var i = 0; i < this.length; ++i) {
        if (obj === this[i]) {
            this.splice(i,1)
            return
        }
    }
}

function onSetup() {

    lastKeyCode = 0;
    player = {
        value : 0,
        x : screenWidth / 2,
        y : screenHeight * (8.0 / 9.0),
        direction : 0
    }

    SpawnTime = 30
    enemies = []
    frameCount = 0
    digitsToDisplay = 2
    showStartScreen = true
}


// When a key is pushed
function onKeyStart(key) {
    if (showStartScreen == true) {
        showStartScreen = false
    } else {
        if (key == 37) {
            player.direction = -1
        } else if (key == 39) {
            player.direction = 1
        } 
    }
}

function onKeyEnd(key) {
    if ((key == 37 && direction == -1) || (key == 39 && direction == 1)) {
        player.direction = 0
    }
}

/** defaults color align, etc */
function printNumber(str, xloc, yloc) {
    fillText(str,
         xloc, 
         yloc,             
         makeColor(0.9, 0.9, 0.9, 1.0), 
         "60px " + font, 
         "left",
         "top")
}

function gaussian(mean, sd) {
    var s = 0
    for (var i = 0; i < 9; i++) {
        s += randomReal(-1, 1)
    }

    return s * sd + mean
}

function spawnEnemies() {
    if (floor(frameCount) % SpawnTime == 0) {
        enemies.push({
            x : randomReal(screenWidth / 9.0, 8.0 * screenWidth / 9.0),
            y : 0,
            value : gaussian( min(2, 2 / (0.01 * (frameCount + 1))), 0.3 * (1 + (Math.sqrt(frameCount) / 55)))
        })
    }
}

function moveEnemies() {
    for (var i = 0; i < enemies.length; ++i) {
        enemies[i].y += 9 + (frameCount) / (SpawnTime * 8)
    }
}

/** computes the bounds of a number */
function bounds(str, x, y) {
    _ch_ctx.textAlign    = 'left'
    _ch_ctx.textBaseline = 'top';
    _ch_ctx.font         = '60px ' + font

    return {
        xmin: x,
        ymin: y,
        xmax: x + _ch_ctx.measureText(str).width,
        ymax: y + 60
    }
}

/** From Morgan McGuire's utils */
function fillTextWordWrap(maxWidth, lineHeight, text, x, y, color, style, xAlign, yAlign) {
    xAlign = (xAlign === undefined) ? 'start' : xAlign;
    yAlign = (yAlign === undefined) ? 'alphabetic' : yAlign;

    _ch_ctx.textAlign    = xAlign;
    _ch_ctx.textBaseline = yAlign;
    _ch_ctx.font         = style;
    _ch_ctx.fillStyle    = color;

    var words = text.split(' ');
    var line = '';

    for (var n = 0; n < words.length; ++n) {
        var testLine = line + words[n];
        var testWidth = _ch_ctx.measureText(testLine).width;
        if (testWidth > maxWidth) {
            // Fail: draw the line
            try { _ch_ctx.fillText(line, x, y); } catch (e) {}
            line = words[n] + ' ';
            y += lineHeight;
        } else {
            // Succeed; add the word (and maybe whitespace) to the
            // line and continue
            line = testLine + ((n === words.length - 1) ? '' : ' ');
        }
    }

    // Draw the final line fragment
    try { _ch_ctx.fillText(line, x, y); } catch (e) {}
}

function clamp(v, low, high) {
    return Math.max(low, Math.min(high, v));
}

///end McGuire's utils


function handleCollisions() {
    pbounds = bounds(player.value.toFixed(digitsToDisplay) + '', player.x, player.y)
    for (var i = 0; i < enemies.length; ++i) {
        ebounds = bounds(enemies[i].value.toFixed(digitsToDisplay) + '', enemies[i].x, enemies[i].y)
        if (((ebounds.xmin > pbounds.xmin && ebounds.xmin < pbounds.xmax) ||
            (ebounds.xmax > pbounds.xmin && ebounds.xmax < pbounds.xmax)) &&
            ((ebounds.ymin > pbounds.ymin && ebounds.ymin < pbounds.ymax) ||
            (ebounds.ymax > pbounds.ymin && ebounds.ymax < pbounds.ymax))) {
            playSound(boop)
            if (player.value + enemies[i].value > 10) {
                alert("You lost, but at least you got up to\n" + player.value)
                onSetup()
                return
            } else if (player.value + enemies[i].value < 0) {
                alert("You went Negative. You lost.")
                onSetup()
                return
            }
            player.value += enemies[i].value
            enemies.splice(i, 1)
        }
    }
}

function cullEnemies() {
     for (var i = 0; i < enemies.length; ++i) {
        ebounds = bounds(enemies[i].value + '', enemies[i].x, enemies[i].y)

        if (ebounds.ymin > screenHeight) {
            enemies.splice(i, 1)
        }
    } 
}

function onTick() {

    fillRectangle(0, 0, screenWidth, screenHeight, makeColor(0.1, 0.1, 0.1));

    if (!showStartScreen) {
        frameCount += 1
        if (digitsToDisplay < 20) {
            digitsToDisplay = 4 + (frameCount / 300)
        }

        SpawnTime -= 2 * (frameCount % 300 == 0)
        SpawnTime = max(SpawnTime, 10) 
        

        printNumber(player.value.toFixed(digitsToDisplay), player.x, player.y)


        //player simulation
        player.x += 13 * player.direction
        player.x = clamp(player.x, screenWidth / 9.0, 8.0 * screenWidth / 9.0)
        spawnEnemies()
        
        cullEnemies()
        moveEnemies()
        for (var i = 0; i < enemies.length; ++i) {
            printNumber(enemies[i].value.toFixed(digitsToDisplay), enemies[i].x, enemies[i].y)
        }
        handleCollisions()
    } else {
        fillTextWordWrap(0.9 * screenWidth, 100, "Move with arrow keys to collect the falling numbers to get your sum as close to 10 as possible. You lose if you go over or go negative.",
         screenWidth/2, 
         screenHeight / 2.15,             
         makeColor(0.9, 0.9, 0.9, 1.0), 
         "85px " + font,
         "center",
         "center")
        fillText("10 Sum", 0.5 * screenWidth, 0.2 * screenHeight, makeColor(0.9, 0.9, 0.9), '200px ' + font, 'center')
        fillText("By: Sam Donow", 0.365 * screenWidth, 0.26 * screenHeight, makeColor(0.9, 0.9, 0.9), '60px ' + font)
        fillText("Press any key to start", 0.5 * screenWidth, 0.87 * screenHeight, makeColor(0.9, 0.9, 0.9), '125px ' + font, 'center')
            }
}

