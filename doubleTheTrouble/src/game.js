/** @type {import("../typings/phaser.d.ts")} */

/*
TODO LIST:
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    IMPORTANT!!! DONATE TO https://www.fesliyanstudios.com/policy IN ORDER TO USE THERE AMAZING MUSIC
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    -Add Highscore mechanincs
        -Save score locally with cookies
        -Save score to database

    -Add credits


    -Implement and ad system

    -Forward game to cordova
    
    -upload on appstore

    -marketing campaign

    WHAT TO DECIDE:
        
    -Add traps
        -If sprite grabs the mist coin, a thick mist that makes it hard to see appears for a minute

    -Send to publisher

    Whats Done:
        -Game music
            -Looping
        -Moving platforms
        -Rain
        -Coins
        -Score system in game
        -Death Mechanics
            -Get hit you die
            -Fall you die
        -Main screen allows you to start game
            -Game is paused until you start so no rain falls on the start screen

        -Movement
            -Click each side to switch that sides sprite direction

        -Add Sound
            -Sounds Occure:
                -When sprites change direction
                -When sprite falls
                -When sprite gets hit by rain
                -When sprite grabs mist
                -When sprite grabs coin
                -When sprite grabs shield
        -Make homescreen look better
        -Add Powerups
            -Shield
                -Shield collides with rain
                -Makes both of the sprites invincible to the rain

*/
//DONT USE COOKIES, IT WILL NOT WORK WITH CORDOVA, USE LOCALSTORAGE INSTEAD!

//HOW DB WILL WORK, FIRST YOULL PUT IN YOUR NICKNAME, THEN IT WILL SEND THAT NAME TO THE DB
//AND SAVE YOUR NAME AS A LOCALSTORAGE
//WHENEVER YOU GET A HIGHSCORE, YOUR NAME IS PAIRED WITH THE SCORE AND SENT TO MONGODB
var socket = io();

localStorage.getItem("nick");
console.log("welcome back " + localStorage.getItem("nick"));
console.log("STARTED ");
var gforce = 375;
var config = {
    type: Phaser.CANVAS,
    width: 1000,
    height: 550,
    parent: "master",
    physics: {
        default: "arcade",
        arcade: {
            gravity: {
                y: gforce,
            },
            debug: false,
        },
    },
    scene: {
        preload: resourceLoader,
        create: mechanics,
        update: controls,
    },
};

var game = new Phaser.Game(config);

var leftScale = 1.5;
var rightScale = 1.5;
var shieldActive = false;

function resourceLoader() {
    //STATIC OBJECTS
    this.load.image("background", "/../resources/images/background.png");
    this.load.image("gameOver", "/../resources/images/gameOver.PNG");

    //PLATFORS
    this.load.image("leftPlatform", "/../resources/images/left_platform.png");
    this.load.image("rightPlatform", "/../resources/images/right_platform.png");

    //SPRITE
    this.load.image("sprite", "/../resources/images/sprite.png");
    this.load.spritesheet({
        key: "blueBot",
        url: "/../resources/images/bluebot.png",
        frameConfig: { frameWidth: 229, frameHeight: 479 },
        //229X479
    });
    this.load.spritesheet({
        key: "redBot",
        url: "/../resources/images/redbot.png",
        frameConfig: { frameWidth: 229, frameHeight: 479 },
        //229X479
    });
    //DROPS
    this.load.image("drop", "/../resources/images/drop.png");
    this.load.image("coin", "/../resources/images/coin.png");
    this.load.image("shield", "/../resources/images/Shield.png");
    this.load.image("forcefield", "/../resources/images/forcefield.png"); //FORCEFIELD FOR POWERUP
    this.load.image("mist", "/../resources/images/mist.png");

    //GAME MUSIC
    this.load.audio(
        "music",
        "/../resources/sound/FASTER2019-01-02_-_8_Bit_Menu_-_David_Renda_-_FesliyanStudios.com.mp3"
    );

    //SFX
    this.load.audio("switchDirection", "/../resources/sound/SFX/turnRight.wav");
    this.load.audio("coinCollect", "/../resources/sound/SFX/coinCollect.wav");
    this.load.audio("shieldActive", "/../resources/sound/SFX/shieldActive.wav");
    this.load.audio("shieldInactive", "/../resources/sound/SFX/shieldInactive.wav");
    this.load.audio("forcefieldHit", "/../resources/sound/SFX/forcefieldHit.wav");
    this.load.audio("bonus", "/../resources/sound/SFX/bonus.wav");

    //LOAD ALL GAME FILES, SPRITES, SOUND, PICTUR ES
}

var rainDropRate = 1350;

function addPlayer() {
    socket.emit("chooseName", document.getElementById("pickName").value);
}

socket.on("nnError", function (errorCode) {
    document.getElementById("nameNotice").style.display = "block";
    if (errorCode === 1) {
        document.getElementById("nameNotice").innerHTML = "This nickname is used by another player";
    } else if (errorCode === 2) {
        document.getElementById("nameNotice").innerHTML = "Special characters are not allowed";
    } else {
        document.getElementById("nameNotice").innerHTML = "please keep your name below the 15 character limit";
    }
});

socket.on("newNickname", function () {
    localStorage.setItem(firstTime, "oldPlayer");
    localStorage.setItem("nick", document.getElementById("pickName").value);

    document.getElementById("nameNotice").style.display = "block";
    document.getElementById("nameNotice").style.color = "green";
    document.getElementById("nameNotice").innerHTML = "You have chosen the name " + localStorage.getItem("nick");

    setTimeout(() => {
        location.reload();
    }, 1500);
});

var firstTime = "playerNameMemory"; //Math.random() * 10000;

function mechanics() {
    var playerName = () => {
        document.getElementById("menu").style.display = "none";
        document.getElementById("playerChooseName").style.display = "inline";
    };

    /*============================================ START CLOSE MENU AND SHOW GAME MECHANICS =================================================================================================================
    ===================================================================================================================================================================================
    ==================================================================================================================================================================================*/

    document.getElementById("start_game").ontouchstart = () => {
        if (localStorage.getItem(firstTime) == null) {
            playerName();
        } else {
            console.log("game started!");

            document.getElementById("playerChooseName").style.display = "none";
            document.getElementById("game").style.display = "inline";
            document.getElementById("master").style.display = "inline";

            shieldInt = setInterval(spawnShield, 7500);
            coinInt = setInterval(spawnCoin, 1000);
            acidRainInt = setInterval(spawnRain, rainDropRate);
            trapInt = setInterval(spawnTrap, 6500);
            timeInt = setInterval(timeSurvivedPoints, 10000);
            difficultyInt = setInterval(increaseDifficulty, 2500);
        }
    };

    /*============================================ END CLOSE MENU AND SHOW GAME MECHANICS =================================================================================================================
    ===================================================================================================================================================================================
    ==================================================================================================================================================================================*/

    this.add.image(500, 275, "background");

    /*============================================ START MUSIC TOGGLE MECHANICS =================================================================================================================
    ===================================================================================================================================================================================
    ==================================================================================================================================================================================*/

    var tempvar = "bgGameMusic";
    var toggle = localStorage.getItem(tempvar);
    musicPlay = null;

    backgroundMusic = this.sound.add("music");
    backgroundMusic.setLoop(true);

    function toggleSwitch(newState, boolean, string) {
        localStorage.setItem(tempvar, newState);

        document.getElementById("Music").innerHTML = "Music: " + string;
        if (boolean == true) {
            backgroundMusic.play();
        } else {
            backgroundMusic.pause();
        }
    }

    if (musicPlay == null) {
        backgroundMusic.play();
    }

    document.getElementById("Music").onclick = function () {
        if (musicPlay == null) {
            toggleSwitch("off", false, "OFF");
            musicPlay = false;
        } else if (localStorage.getItem(tempvar) == "off" || musicPlay == false) {
            toggleSwitch("on", true, "ON");
            musicPlay = true;
        } else if (localStorage.getItem(tempvar) == "on" || musicPlay == true) {
            toggleSwitch("off", false, "OFF");
            musicPlay = false;
        }
    };
    //End background music

    if (toggle == "off") {
        backgroundMusic.pause();
        document.getElementById("Music").innerHTML = "Music: OFF";
    }

    /*============================================ END MUSIC TOGGLE MECHANICS =================================================================================================================
    ===================================================================================================================================================================================
    ==================================================================================================================================================================================*/

    /*============================================ START SPRITE MECHANICS =================================================================================================================
       ===================================================================================================================================================================================
       ==================================================================================================================================================================================*/

    switchDirectionSound = this.sound.add("switchDirection");
    animateSprite = (keyName, spriteName) => {
        this.anims.create({
            key: keyName,
            frames: this.anims.generateFrameNumbers(spriteName, {
                start: 0,
                end: 1,
            }),
            frameRate: 5,
            repeat: -1,
        });
    };
    animateSprite("moveRightSprite", "blueBot");
    animateSprite("moveLeftSprite", "redBot");

    leftSprite = this.physics.add.sprite(250, 230, "redBot").setScale(0.18, 0.18).play("moveLeftSprite");
    rightSprite = this.physics.add.sprite(750, 230, "blueBot").setScale(0.18, 0.18).play("moveRightSprite");
    //rightSprite.anims.play("slide");

    rightSprite.body.collideWorldBounds = true;
    rightSprite.body.onWorldBounds = true;

    leftSprite.body.collideWorldBounds = true;
    leftSprite.body.onWorldBounds = true;

    /*============================================ END SPRITE MECHANICS =================================================================================================================
       ===================================================================================================================================================================================
       ==================================================================================================================================================================================*/

    /*============================================ START PLATFORM MECHANICS =================================================================================================================
    ===================================================================================================================================================================================
    ==================================================================================================================================================================================*/

    leftPlatform = this.physics.add
        .sprite(250, 375, "leftPlatform")
        .setGravity(0, gforce * -1)
        .setImmovable(true)
        .setScale(1.5, 1);
    rightPlatform = this.physics.add
        .sprite(750, 375, "rightPlatform")
        .setGravity(0, gforce * -1)
        .setImmovable(true)
        .setScale(1.5, 1);

    this.physics.add.collider(rightSprite, rightPlatform);
    this.physics.add.collider(leftSprite, leftPlatform);

    /*============================================ END PLATFORM MECHANICS =================================================================================================================
    ===================================================================================================================================================================================
    ==================================================================================================================================================================================*/

    /*============================================ START RAIN DROP MECHANICS =================================================================================================================
    ===================================================================================================================================================================================
    ==================================================================================================================================================================================*/
    rain = this.physics.add.group();

    function spawnRain() {
        sizes = Math.random() * (200 - 65) + 65;

        rainObject = rain
            .create(Math.random() * 1001, -150, "drop")
            .setDisplaySize(20, sizes)
            .setAlpha(0.5)
            .setOffset(0, -20);
        //console.log(randomExcludeRange());
    }

    function increaseDifficulty() {
        if (rainDropRate > 350) {
            rainDropRate -= 50;
            clearInterval(acidRainInt);
            acidRainInt = setInterval(spawnRain, rainDropRate);
        }
    }
    this.physics.add.overlap(leftSprite, rain, onDeath, null, this);
    this.physics.add.overlap(rightSprite, rain, onDeath, null, this);

    /*============================================ END RAIN DROP MECHANICS =================================================================================================================
    ===================================================================================================================================================================================
    ==================================================================================================================================================================================*/

    /*============================================ START SHIELD MECHANICS =================================================================================================================
    ===================================================================================================================================================================================
    ==================================================================================================================================================================================*/

    shield = this.physics.add.group();

    var activeShieldSound = this.sound.add("shieldActive");
    var inactiveShieldSound = this.sound.add("shieldInactive");
    var forcefieldHitSound = this.sound.add("forcefieldHit");

    function spawnShield() {
        shieldObject = shield.create(Math.random() * 1001, 0, "shield");
        shieldObject.body.setCircle(25).setOffset(3, 3);
    }

    function onShieldCollect(sprite, collectedShield) {
        console.log("Shield Activated!");

        collectedShield.destroy();
        shieldActive = true;
        activeShieldSound.play();

        function countdown() {
            time--;
            timer.setText(time);
        }

        addScore(50);

        var warning = this.add
            .text(500, 220, "Shield Gone in: ", {
                fontSize: "20px",
                fontFamily: '"Press Start 2P"',
            })
            .setOrigin(0.5, 0.5);
        var time = 5;
        var timer = this.add
            .text(500, 280, time, {
                fontSize: "50px",
                fontFamily: '"Press Start 2P"',
            })
            .setOrigin(0.5, 0.5);

        counter = setInterval(countdown, 1000);

        leftActiveShield = this.physics.add
            .sprite(leftSprite.x, leftSprite.y - 15, "forcefield")
            .setScale(0.5, 0.5)
            .setOrigin(0.5);
        rightActiveShield = this.physics.add
            .sprite(rightSprite.x, rightSprite.y - 15, "forcefield")
            .setScale(0.5, 0.5)
            .setOrigin(0.5);

        function onDrainTouchShield(shield, dropTouch) {
            forcefieldHitSound.play();
            dropTouch.destroy();

            addScore(25);

            console.log("drop removed from existince");
        }

        function updateShieldPos() {
            leftActiveShield.x = leftSprite.x;
            leftActiveShield.y = leftSprite.y - 15;

            rightActiveShield.x = rightSprite.x;
            rightActiveShield.y = rightSprite.y - 15;
        }
        setInterval(updateShieldPos, 1);

        function deactivateShield() {
            inactiveShieldSound.play();
            leftActiveShield.destroy();
            rightActiveShield.destroy();
            timer.destroy();
            warning.destroy();
            shieldActive = false;
            clearInterval(counter);
        }
        setTimeout(deactivateShield, 5000);

        this.physics.add.collider(leftActiveShield, leftPlatform);
        this.physics.add.collider(rightActiveShield, rightPlatform);
        this.physics.add.collider(leftActiveShield, rain, onDrainTouchShield, null, this);
        this.physics.add.collider(rightActiveShield, rain, onDrainTouchShield, null, this);
    }

    this.physics.add.overlap(leftSprite, shield, onShieldCollect, null, this);
    this.physics.add.overlap(rightSprite, shield, onShieldCollect, null, this);
    /*============================================ END SHIELD MECHANICS =================================================================================================================
        ===================================================================================================================================================================================
        ==================================================================================================================================================================================*/

    var trap = this.physics.add.group();
    isTrapActive = false;

    function spawnTrap() {
        trapObject = trap
            .create(Math.random() * 1001, 0, "mist")
            .setScale(0.35, 0.35)
            .setAlpha(0.5);
        //MAKE THE SPRITE MUCH HARDER TO SEE FOR A TEMPORARY AMOUNT OF TIME
    }
    var DGL = false;
    var DGR = false;

    function onTrapCollect(sprite, collectedTrap) {
        console.log("trap is true");
        collectedTrap.destroy();

        function stopTrap() {
            lIncrease = 0.02;
            rIncrease = 0.02;
            clearInterval(platformInt);
            platformNormalize = setInterval(() => {
                leftPlatform.setScale((leftScale += lIncrease), 1);
                rightPlatform.setScale((rightScale += rIncrease), 1);
                if (leftScale == 1.5) {
                    lIncrease = 0;
                }
                if (rightScale == 1.5) {
                    rIncrease = 0;
                }
                if (leftScale == 1.5 && rightScale == 1.5) {
                    clearInterval(platformNormalize);
                }
            }, 30);
            isTrapActive = false;
        }

        if (isTrapActive === false) {
            console.log("trap is false!");
            isTrapActive = true;
            var platformInt = setInterval(() => {
                var RRL = Math.random() * (1.8 - 1.2) + 1.2;

                if (DGL === false) {
                    leftPlatform.setScale((leftScale += 0.02), 1);
                }

                if (leftScale > RRL || DGL === true) {
                    DGL = true;
                    leftPlatform.setScale((leftScale -= 0.02), 1);

                    if (leftScale > 0.75 && leftScale < 0.77) {
                        DGL = false;
                    }
                }

                var RRR = Math.random() * (1.8 - 1.2) + 1.2;

                if (DGR === false) {
                    rightPlatform.setScale((rightScale += 0.02), 1);
                }

                if (rightScale > RRR || DGR === true) {
                    DGR = true;
                    rightPlatform.setScale((rightScale -= 0.02), 1);
                    if (rightScale > 0.75 && rightScale < 0.77) {
                        DGR = false;
                    }
                }
            }, 30);

            setTimeout(stopTrap, 10000);
        }
    }

    this.physics.add.overlap(leftSprite, trap, onTrapCollect, null, this);
    this.physics.add.overlap(rightSprite, trap, onTrapCollect, null, this);

    /*============================================ START COIN AND SCORE MECHANICS =================================================================================================================
    ===================================================================================================================================================================================
    ==================================================================================================================================================================================*/

    coin = this.physics.add.group();

    function spawnCoin() {
        coinObject = coin.create(Math.random() * 1001, 0, "coin").setScale(0.35, 0.35);
    }

    var scoreBoard = this.add
        .text(510, 90, "Score: 0", {
            fontSize: "20px",
            fontFamily: '"Press Start 2P"',
        })
        .setOrigin(0.5);

    addScore = (amount) => {
        score += amount;
        scoreBoard.setText("Score: " + score);
    };

    score = 0;
    coinSound = this.sound.add("coinCollect");
    speedUp = 1;

    function onCoinCollect(sprites, collectedCoin) {
        console.log(rainDropRate);

        coinSound.play();
        collectedCoin.destroy(true);
        addScore(50);
        console.log(score);

        //COINS = POINTS
    }

    bonusSound = this.sound.add("bonus");
    timeSurvivedPoints = () => {
        var opacity = 0.7;

        var floatingAlert = this.add
            .text(510, 450, "Time Bonus \n\n  +250Pts", {
                fontSize: "15px",
                fontFamily: '"Press Start 2P"',
            })
            .setOrigin(0.5)
            .setAlpha(opacity);

        floatingAlert.x = Math.random() * 1001;

        yRaise = 565;
        let raiseText = setInterval(() => {
            if (opacity > -1) {
                yRaise -= 1.5;
                floatingAlert.y = yRaise;
                opacity -= 0.0035;
                floatingAlert.setAlpha(opacity);
            } else {
                clearInterval(raiseText);
                floatingAlert.destroy();
            }
        }, 10);

        bonusSound.play();
        addScore(250);
    };

    this.physics.add.overlap(leftSprite, coin, onCoinCollect, null, this);
    this.physics.add.overlap(rightSprite, coin, onCoinCollect, null, this);

    this.physics.add.collider(leftPlatform, coin);
    this.physics.add.collider(rightPlatform, coin);

    /*============================================ END COIN AND SCORE MECHANICS =================================================================================================================
    ===================================================================================================================================================================================
    ==================================================================================================================================================================================*/

    /*============================================ START HIGHSCOREE MECHANICS =================================================================================================================
    ===================================================================================================================================================================================
    ==================================================================================================================================================================================*/

    var highscoreMem = "hsMemory";
    if (localStorage.getItem(highscoreMem) == null) {
        console.log("no score");
        highscore = "0";
    }

    function onHighScore() {
        var intHS = parseInt(localStorage.getItem(highscoreMem));
        if (isNaN(intHS) == true) {
            intHS = 0;
        }
        if (score > intHS || intHS == "NaN") {
            localStorage.setItem(highscoreMem, score);
            socket.emit("player", localStorage.getItem("nick"));
            socket.emit("highscore", parseInt(localStorage.getItem(highscoreMem)));
        }

        console.log("highscore is: " + parseInt(localStorage.getItem(highscoreMem)));
    }

    document.getElementById("show_score").ontouchstart = function () {
        document.body.style.overflow = "scroll";
        socket.emit("hsGo");

        document.getElementById("highscoreMenu").style.display = "inline";
        document.getElementById("menu").style.display = "none";
        if (localStorage.getItem(highscoreMem) === null) {
            localStorage.setItem(highscoreMem, 0);
        }
        document.getElementById("yourscore").innerHTML =
            localStorage.getItem("nick") + " | " + localStorage.getItem(highscoreMem) + "<small>pts</small>";

        socket.on("topPlayers", function (doc) {
            for (var i = 0; i < doc.length; i++) {
                var cleanData = JSON.stringify(doc[i])
                    .replace('{"nickname":"', "")
                    .replace(',"highscore":', " | ")
                    .replace("}", "")
                    .replace('"', "");
                console.log(cleanData);
                topList = document.createElement("P");
                var rank = i + 1;
                topList.innerHTML = rank + ". " + cleanData + "<small> pts</small><hr />";
                document.getElementById("topscore").appendChild(topList);
            }
        });
    };

    document.getElementById("goHome").ontouchstart = function () {
        document.body.style.overflow = "hidden";

        document.getElementById("highscoreMenu").style.display = "none";
        document.getElementById("menu").style.display = "inline";
    };

    /*============================================ END HIGHSCORE MECHANICS =================================================================================================================
    ===================================================================================================================================================================================
    ==================================================================================================================================================================================*/

    /*============================================ START DEATH  MECHANICS =================================================================================================================
    ===================================================================================================================================================================================
    ==================================================================================================================================================================================*/

    this.physics.world.on("worldbounds", (body, up, down, left, right) => {
        if (down) {
            onDeath.call(this);
        }
    });

    function onDeath() {
        onHighScore();

        clearInterval(acidRainInt);
        clearInterval(coinInt);
        clearInterval(shieldInt);
        clearInterval(trapInt);
        clearInterval(timeInt);

        var gameOverTab = this.add.image(500, 205, "gameOver");
        gameOverTab.depth = 1;

        var finalScore = this.add
            .text(500, 260, score, {
                fontSize: "50px",
                fontFamily: '"Press Start 2P"',
            })
            .setOrigin(0.5);

        finalScore.depth = 2;

        leftSprite.destroy();
        rightSprite.destroy();

        if (shieldActive === true) {
            //deactivateShield();
        }

        document.getElementById("game").style.display = "none";
        document.getElementById("restart").style.display = "inline";

        this.add
            .text(500, 380, "Tap to Reset", {
                fontSize: "20px",
                fontFamily: '"Press Start 2P"',
            })
            .setOrigin(0.5);

        //console.log("game over!");
    }

    document.getElementById("restart").onclick = function () {
        location.reload();
    };
    /*============================================ END DEATH MECHANICS =================================================================================================================
    ===================================================================================================================================================================================
    ==================================================================================================================================================================================*/

    obObject = this.physics.add.staticGroup();
    obObject.create(0, 750, "rightPlatform").setSize(1200, 50);

    this.physics.add.overlap(obObject, rain, onOutOfBounds, null, this);
    this.physics.add.overlap(obObject, shield, onOutOfBounds, null, this);
    this.physics.add.overlap(obObject, trap, onOutOfBounds, null, this);
    this.physics.add.overlap(obObject, coin, onOutOfBounds, null, this);

    function onOutOfBounds(block, clearObject) {
        clearObject.destroy();
    }
}
var leftDirection = 0;
var rightDirection = 0;

function controls() {
    if (window.innerHeight > window.innerWidth) {
        document.getElementById("suggestion").style.display = "inline";
    } else {
        document.getElementById("suggestion").style.display = "none";
    }

    document.getElementById("touchLeft").ontouchstart = function () {
        leftDirection++;
        if (leftDirection === 1) {
            leftSprite.setVelocityX(150);
            switchDirectionSound.play();
            leftSprite.flipX = true;
        } else {
            leftDirection = 0;
            leftSprite.setVelocityX(-150);
            switchDirectionSound.play();
            leftSprite.flipX = false;
        }
    };

    document.getElementById("touchRight").ontouchstart = function () {
        rightDirection++;
        if (rightDirection === 1) {
            rightSprite.setVelocityX(150);
            switchDirectionSound.play();
            rightSprite.flipX = true;
        } else {
            rightDirection = 0;
            rightSprite.setVelocityX(-150);
            switchDirectionSound.play();
            rightSprite.flipX = false;
        }
    };
    //CREATE THE GAMES MOVEMENTS
}
