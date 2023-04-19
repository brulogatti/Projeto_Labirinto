//Setando o mapa: 0-chão 1-parede
let app = {};
var checkTimer = false;


(function (context) {

    let levels = [];
    levels[0] = generateMapLevel1Automatic();

    levels[1] = generateMapLevel2Automatic();

    levels[2] = generateMapLevel3Automatic();

    function Game(id, level) {
        this.el = document.getElementById(id);
        this.level_idx = 0;
        this.tileTypes = ['floor', 'wall'];
        this.tileDim = 32;
        /*Herdando as propriedades de cada nível: mapa, início do jogador, início do objetivo */
        this.map = level.map;
        this.theme = level.theme;
        this.player = { ...level.player };
        this.goal = { ...level.goal };
        this.player.el = null;
    };

    Game.prototype.populateMap = function (level) {
        this.el.className = 'game-container-' + level.theme;
        let tiles = document.getElementById('tiles');
        for (var y = 0; y < this.map.length; ++y) {
            for (var x = 0; x < this.map[y].length; ++x) {
                let tileCode = this.map[y][x];
                let tileType = this.tileTypes[tileCode];
                let tile = this.createEl(x, y, tileType);
                tiles.appendChild(tile);
            }
        }

    };

    Game.prototype.createEl = function (x, y, type) {
        let el = document.createElement('div');
        el.className = type;
        el.style.width = el.style.height = this.tileDim + 'px';
        el.style.left = x * this.tileDim + 'px';
        el.style.top = y * this.tileDim + 'px';
        return el;
    };

    Game.prototype.sizeUp = function () {
        let map = this.el.querySelector('.game-map');
        map.style.height = this.map.length * this.tileDim + 'px';
        map.style.width = this.map[0].length * this.tileDim + 'px';
    };

    Game.prototype.placeSprite = function (type) {
        let x = this[type].x;
        let y = this[type].y;
        let sprite = this.createEl(x, y, type);
        sprite.id = type;
        sprite.style.borderRadius = this.tileDim + 'px';
        let layer = this.el.querySelector('#sprites');
        layer.appendChild(sprite);
        return sprite;
    };

    Game.prototype.keyboardListener = function () {
        document.addEventListener('keydown', event => {
            this.movePlayer(event);
            //A cada novo movimento, verifica se chegou no objetivo
            this.checkGoal();
        });
    };

    Game.prototype.movePlayer = function (event) {
        event.preventDefault();
        //Limitando os comandos de entrada para as setas
        if (event.keyCode < 37 || event.keyCode > 40) {
            return;
        }
        switch (event.keyCode) {
            case 37:
                this.moveLeft();
                break;
            case 38:
                this.moveUp();
                break;
            case 39:
                this.moveRight()
                break;
            case 40:
                this.moveDown();
                break;
        }
    };

    Game.prototype.moveUp = function () {
        //Estabelece o perímetro do labirinto
        if (this.player.y == 0) {
            this.collide();
            setFail();
            return;
        }

        //Verifica se é uma parede
        let nextTile = this.map[this.player.y - 1][this.player.x];
        if (nextTile == 1) {
            this.collide();
            setFail();
            return;
        }

        this.player.y -= 1;
        this.updateVert();
    };

    Game.prototype.moveDown = function () {
        //Estabelece o perímetro do labirinto
        if (this.player.y == this.map.length - 1) {
            this.collide();
            setFail();
            return;
        }

        //Verifica se é uma parede
        let nextTile = this.map[this.player.y + 1][this.player.x];
        if (nextTile == 1) {
            this.collide();
            setFail();
            return;
        }

        this.player.y += 1;
        this.updateVert();
    };

    Game.prototype.moveLeft = function (sprite) {
        //Estabelece o perímetro do labirinto
        if (this.player.x == 0) {
            this.collide();
            setFail();
            return;
        }
        //Verifica se é uma parede
        let nextTile = this.map[this.player.y][this.player.x - 1];
        if (nextTile == 1) {
            this.collide();
            setFail();
            return;
        }

        this.player.x -= 1;
        this.updateHoriz(sprite);
    };

    Game.prototype.moveRight = function (sprite) {
        //Estabelece o perímetro do labirinto
        if (this.player.x == this.map[this.player.y].length - 1) {
            this.collide();
            setFail();
            return;
        }

        //Verifica se é uma parede
        let nextTile = this.map[this.player.y][this.player.x + 1];
        if (nextTile == 1) {
            this.collide();
            setFail();
            return;
        }

        this.player.x += 1;
        this.updateHoriz(sprite);
    };

    Game.prototype.buttonListeners = function () {
        let up = document.getElementById('up');
        let left = document.getElementById('left');
        let down = document.getElementById('down');
        let right = document.getElementById('right');

        let obj = this;



        up.addEventListener('mousedown', function () {
            obj.moveUp();
            obj.checkGoal();
        });

        down.addEventListener('mousedown', function () {
            obj.moveDown();
            obj.checkGoal();
        });

        left.addEventListener('mousedown', function () {
            obj.moveLeft();
            obj.checkGoal();
        });

        right.addEventListener('mousedown', function () {
            obj.moveRight();
            obj.checkGoal();
        });
    }

    Game.prototype.checkGoal = function () {
        let body = document.querySelector('body');

        if (this.player.y == this.goal.y && this.player.x == this.goal.x) {
            pauseTimer();
            this.checkTimer=false;
            getTime();
            body.className = 'success';

        } else {
            if(body.className!='fail'){
            body.className = '';
            }
        }
    };

    Game.prototype.updateVert = function () {
        if(!this.checkTimer){
            startTimer();
            this.checkTimer=true;
        }
        this.player.el.style.top = this.player.y * this.tileDim + 'px';
    };

    Game.prototype.updateHoriz = function (sprite) {
        if(!this.checkTimer){
            startTimer();
            this.checkTimer=true;
        }
        this.player.el.style.left = this.player.x * this.tileDim + 'px';
    };

    Game.prototype.placeLevel = function (level) {
        this.populateMap(level);
        this.sizeUp();
        this.placeSprite('goal');
        let playerSprite = this.placeSprite('player');
        this.player.el = playerSprite;
    };

    Game.prototype.addListeners = function () {
        this.keyboardListener();
        this.buttonListeners();
        this.addMazeListener();
    };

    Game.prototype.addMazeListener = function () {
        let map = this.el.querySelector('.game-map');
        let obj = this;
        map.addEventListener('mousedown', function (e) {

            if (obj.player.y != obj.goal.y || obj.player.x != obj.goal.x) {
                return;
            }

            obj.changeLevel();

            let layers = obj.el.querySelectorAll('.layer');

            for (layer of layers) {
                layer.innerHTML = '';
            }

            obj.placeLevel(levels[obj.level_idx]);
            obj.checkGoal();

        });

    };

    Game.prototype.changeLevel = function () {
        this.level_idx++;
        if (this.level_idx > levels.length - 1) {
            this.level_idx = 0;
        }
        let level = levels[this.level_idx];
        this.map = level.map;
        this.theme = level.theme;
        this.player = { ...level.player };
        this.goal = { ...level.goal };
    };

    Game.prototype.collide = function () {
        this.player.el.className += 'collide';

        let obj = this;

        window.setTimeout(function () {
            obj.player.el.className = 'player';
        }, 200);

        return 0;
    }

    context.init = function () {
        let myGame = new Game('game-container-1', levels[0]);
        myGame.placeLevel(levels[myGame.level_idx]);
        myGame.addListeners();
    };
})(app);

app.init();


function generateMapLevel1Automatic() {
    numero = (Math.floor(Math.random() * 8));
    if (numero == 0) {
        levels = {
            map: [
                [1, 1, 0, 0, 1],
                [1, 0, 1, 0, 0],
                [0, 1, 0, 0, 0],
                [0, 1, 0, 1, 0],
                [0, 0, 0, 1, 0]
            ],

            player: {
                x: 3,
                y: 0
            },
            goal: {
                x: 0,
                y: 2
            },
            theme: 'default',
        };
    }
    if (numero == 1) {
        levels = {
            map: [
                [1, 1, 0, 0, 1],
                [1, 0, 0, 0, 0],
                [0, 0, 1, 1, 0],
                [0, 0, 0, 1, 0],
                [0, 1, 0, 1, 0]
            ],

            player: {
                x: 4,
                y: 4
            },
            goal: {
                x: 0,
                y: 4
            },
            theme: 'default',
        };
    }
    if (numero == 2) {
        levels = {
            map: [
                [1, 1, 1, 0, 0],
                [1, 0, 0, 1, 0],
                [0, 0, 0, 1, 0],
                [0, 1, 0, 0, 0],
                [0, 1, 0, 1, 0]
            ],

            player: {
                x: 0,
                y: 4
            },
            goal: {
                x: 4,
                y: 4
            },
            theme: 'default',
        };
    }
    if(numero==3){
        levels = {
            map: [
                [0, 0, 0, 0, 1],
                [0, 1, 1, 0, 1],
                [0, 0, 0, 0, 1],
                [1, 0, 1, 0, 1],
                [0, 0, 1, 0, 0]
            ],

            player: {
                x: 0,
                y: 4
            },
            goal: {
                x: 4,
                y: 4
            },
            theme: 'default',
        };
    }
    if(numero==4){
        levels = {
            map: [
                [1, 1, 0, 0, 0],
                [0, 1, 0, 1, 0],
                [0, 1, 0, 1, 0],
                [0, 1, 1, 1, 0],
                [0, 0, 0, 0, 0]
            ],

            player: {
                x: 2,
                y: 4
            },
            goal: {
                x: 2,
                y: 2
            },
            theme: 'default',
        };
    }
    if(numero==5){
        levels = {
            map: [
                [0, 0, 0, 0, 0],
                [0, 1, 1, 1, 0],
                [0, 0, 0, 1, 0],
                [1, 1, 0, 1, 0],
                [0, 0, 0, 1, 0]
            ],

            player: {
                x: 0,
                y: 4
            },
            goal: {
                x: 4,
                y: 4
            },
            theme: 'default',
        };
    }
    if(numero==6){
        levels = {
            map: [
                [1, 0, 0, 0, 0],
                [1, 0, 1, 1, 0],
                [0, 0, 0, 0, 0],
                [0, 1, 0, 0, 0],
                [0, 1, 1, 1, 0]
            ],

            player: {
                x: 0,
                y: 4
            },
            goal: {
                x: 4,
                y: 0
            },
            theme: 'default',
        };
    }
    if(numero==7){
        levels = {
            map: [
                [0, 0, 0, 1, 1],
                [0, 1, 0, 0, 1],
                [0, 1, 1, 0, 0],
                [0, 1, 1, 1, 0],
                [0, 0, 0, 1, 0]
            ],

            player: {
                x: 0,
                y: 4
            },
            goal: {
                x: 4,
                y: 4
            },
            theme: 'default',
        };
    }
    return levels;
}

function generateMapLevel2Automatic(){
    numero = (Math.floor(Math.random() * 8));
    if(numero==0){
        levels = {
            map: [
                [1, 0, 1, 1, 1, 1],
                [0, 0, 0, 0, 0, 0],
                [0, 1, 1, 1, 0, 0],
                [0, 0, 0, 1, 1, 0],
                [0, 1, 0, 1, 0, 0]
            ],
            player: {
                x: 2,
                y: 4
            },
            goal: {
                x: 4,
                y: 4
            },
            theme: 'grassland'
        };
    }
    if(numero==1){
        levels = {
            map: [
                [0, 0, 0, 0, 0, 0],
                [0, 1, 1, 1, 1, 0],
                [0, 0, 0, 1, 1, 0],
                [0, 1, 0, 1, 0, 0],
                [1, 1, 0, 1, 0, 0]
            ],
            player: {
                x: 2,
                y: 4
            },
            goal: {
                x: 4,
                y: 4
            },
            theme: 'grassland'
        };
    }
    if(numero==2){
        levels = {
            map: [
                [1, 1, 0, 0, 0, 0],
                [1, 0, 1, 0, 1, 0],
                [0, 0, 1, 0, 1, 0],
                [0, 0, 1, 1, 0, 0],
                [0, 0, 0, 0, 0, 0]
            ],
            player: {
                x: 3,
                y: 2
            },
            goal: {
                x: 1,
                y: 1
            },
            theme: 'grassland'
        };
    }
    if(numero==3){
        levels = {
            map: [
                [0, 1, 0, 0, 1, 1],
                [0, 1, 0, 0, 0, 1],
                [0, 0, 1, 1, 0, 1],
                [0, 0, 1, 0, 0, 1],
                [0, 0, 0, 0, 0, 0]
            ],
            player: {
                x: 2,
                y: 1
            },
            goal: {
                x: 2,
                y: 4
            },
            theme: 'grassland'
        };
    }
    if(numero==4){
        levels = {
            map: [
                [0, 0, 0, 0, 1, 0],
                [1, 0, 0, 0, 0, 0],
                [1, 1, 1, 1, 1, 0],
                [1, 0, 0, 0, 1, 0],
                [0, 0, 0, 0, 0, 0]
            ],
            player: {
                x: 1,
                y: 3
            },
            goal: {
                x: 0,
                y: 0
            },
            theme: 'grassland'
        };
    }
    if(numero==5){
        levels = {
            map: [
                [1, 0, 0, 1, 0, 0],
                [1, 1, 0, 1, 1, 0],
                [1, 0, 0, 1, 1, 0],
                [0, 0, 0, 1, 1, 0],
                [0, 1, 0, 0, 0, 0]
            ],
            player: {
                x: 0,
                y: 4
            },
            goal: {
                x: 4,
                y: 0
            },
            theme: 'grassland'
        };
    }
    if(numero==6){
        levels = {
            map: [
                [0, 0, 0, 0, 0, 1],
                [0, 1, 0, 1, 0, 1],
                [0, 1, 0, 1, 1, 1],
                [0, 1, 0, 0, 1, 1],
                [1, 1, 1, 1, 1, 1]
            ],
            player: {
                x: 3,
                y: 3
            },
            goal: {
                x: 4,
                y: 1
            },
            theme: 'grassland'
        };
    }
    if(numero==7){
        levels = {
            map: [
                [0, 0, 0, 0, 1, 0],
                [0, 1, 0, 0, 0, 0],
                [0, 1, 0, 1, 0, 0],
                [0, 0, 1, 0, 0, 1],
                [0, 0, 1, 0, 0, 0]
            ],
            player: {
                x: 0,
                y: 0
            },
            goal: {
                x: 5,
                y: 4
            },
            theme: 'grassland'
        };
    }
    return levels;
}

function generateMapLevel3Automatic(){
    numero = (Math.floor(Math.random() * 8));
    if(numero==0){
        levels = {
            map: [
                [1, 0, 1, 0, 0, 1, 0],
                [0, 0, 0, 0, 0, 1, 0],
                [1, 0, 1, 1, 0, 0, 0],
                [1, 0, 0, 1, 0, 1, 0],
                [1, 1, 0, 0, 1, 0, 0]
            ],
            player: {
                x: 2,
                y: 4
            },
            goal: {
                x: 6,
                y: 4
            },
            theme: 'dungeon'
        };
    }
    if(numero==1){
        levels = {
            map: [
                [0, 1, 0, 0, 0, 0, 0],
                [0, 1, 0, 0, 1, 1, 0],
                [0, 0, 0, 1, 0, 0, 0],
                [0, 1, 1, 1, 1, 1, 1],
                [0, 0, 0, 0, 0, 0, 0]
            ],
            player: {
                x: 4,
                y: 2
            },
            goal: {
                x: 6,
                y: 4
            },
            theme: 'dungeon'
        };
    }
    if(numero==2){
        levels = {
            map: [
                [1, 0, 0, 0, 0, 1, 0],
                [1, 1, 0, 1, 0, 1, 0],
                [1, 1, 0, 1, 0, 1, 0],
                [1, 0, 0, 1, 0, 1, 0],
                [0, 0, 0, 1, 0, 0, 0]
            ],
            player: {
                x: 0,
                y: 4
            },
            goal: {
                x: 6,
                y: 0
            },
            theme: 'dungeon'
        };
    }
    if(numero==3){
        levels = {
            map: [
                [0, 0, 1, 1, 1, 1, 1],
                [1, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 1, 1, 1, 0],
                [0, 1, 0, 0, 0, 1, 0],
                [0, 0, 0, 0, 0, 0, 0]
            ],
            player: {
                x: 0,
                y: 0
            },
            goal: {
                x: 6,
                y: 4
            },
            theme: 'dungeon'
        };
    }
    if(numero==4){
        levels = {
            map: [
                [0, 1, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 1, 0, 0],
                [0, 0, 1, 0, 1, 0, 0],
                [0, 1, 0, 1, 1, 0, 0],
                [1, 1, 0, 0, 0, 0, 0]
            ],
            player: {
                x: 6,
                y: 4
            },
            goal: {
                x: 3,
                y: 2
            },
            theme: 'dungeon'
        };
    }
    if(numero==5){
        levels = {
            map: [
                [0, 1, 1, 0, 0, 1, 0],
                [0, 0, 0, 0, 0, 0, 1],
                [0, 1, 1, 1, 1, 0, 1],
                [1, 0, 1, 0, 0, 0, 0],
                [0, 0, 1, 1, 0, 0, 1]
            ],
            player: {
                x: 0,
                y: 0
            },
            goal: {
                x: 3,
                y: 3
            },
            theme: 'dungeon'
        };
    }
    if(numero==6){
        levels = {
            map: [
                [0, 1, 0, 0, 0, 0, 0],
                [1, 0, 0, 0, 1, 0, 0],
                [0, 0, 1, 0, 1, 0, 0],
                [0, 1, 0, 1, 1, 0, 0],
                [1, 1, 0, 0, 0, 0, 0]
            ],
            player: {
                x: 6,
                y: 4
            },
            goal: {
                x: 0,
                y: 3
            },
            theme: 'dungeon'
        };
    }
    if(numero==7){
        levels = {
            map: [
                [1, 0, 0, 0, 0, 0, 1],
                [0, 1, 0, 0, 0, 1, 0],
                [1, 0, 1, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0],
                [0, 0, 1, 0, 1, 0, 0]
            ],
            player: {
                x: 5,
                y: 0
            },
            goal: {
                x: 0,
                y: 4
            },
            theme: 'dungeon'
        };
    }
    return levels;
}

function startTimer() {
    resetTimer();
    cron = setInterval(() => { timer(); }, 10);
  }

function pauseTimer(){
  clearInterval(cron);
}

function resetTimer(){
  hour = 0;
  minute = 0;
  second = 0;
  millisecond = 0;
  document.getElementById('hour').innerText = '00';
  document.getElementById('minute').innerText = '00';
  document.getElementById('second').innerText = '00';
  document.getElementById('millisecond').innerText = '000';
}

function getTime(){
    hour = document.getElementById('hour').innerText;
    minute = document.getElementById('minute').innerText;
    second = document.getElementById('second').innerText;
    millisecond = document.getElementById('millisecond').innerText;

    document.getElementById('success-msg').innerText = "Objetivo alcançado! Você levou " + hour + ":" + minute + ":" + second + ":" + millisecond +". Toque no labirinto para ir ao próximo nível";
}

function timer() {
    if ((millisecond += 10) == 1000) {
      millisecond = 0;
      second++;
    }
    if (second == 60) {
      second = 0;
      minute++;
    }
    if (minute == 60) {
      minute = 0;
      hour++;
    }
    document.getElementById('hour').innerText = returnData(hour);
    document.getElementById('minute').innerText = returnData(minute);
    document.getElementById('second').innerText = returnData(second);
    document.getElementById('millisecond').innerText = returnData(millisecond);
  }
  
  function returnData(input) {
    return input > 10 ? input : `0${input}`
  }
  
  function setFail(){
    let body = document.querySelector('body');
    pauseTimer();
    this.checkTimer=false;
    getTime();
    body.className = 'fail';
    return true;
  }

/*

function generateMapLevel1(){
    //Gerar 9 um
    cont=0;
    let matriz = [];
    for (let x = 0; x < 5; x++) {
        for (let y = 0; y < 5; y++) {
            let numero=(Math.floor(Math.random() * 2));
            if(numero==1){
            cont++;
            }
            if(cont>9){
                numero=0;
            }
            matriz.push(numero);
        }
        
    } 
    var map = [
        [matriz[0],matriz[1],matriz[2],matriz[3],matriz[4]],
        [matriz[5],matriz[6],matriz[7],matriz[8],matriz[9]],
        [matriz[10],matriz[11],matriz[12],matriz[13],matriz[14]],
        [matriz[15],matriz[16],matriz[17],matriz[18],matriz[19]],
        [matriz[20],matriz[21],matriz[22],matriz[23],matriz[24]]
    ];

    do{
        checkBegin = true;
        var player={
            x:Math.floor(Math.random()*5),
            y:Math.floor(Math.random()*5)
        }
        if(map[player.x][player.y]==0){
            checkBegin=false;
        }
    }while(checkBegin);

    do{
        checkGoal=true;
        var goal={
            x:Math.floor(Math.random()*5),
            y:Math.floor(Math.random()*5)
        }
        if(map[goal.x][goal.y]==0 && player.x!=goal.x && player.y!=goal.y){
            checkGoal=false;
        }
    }while(checkGoal);

    level={
        map,
        player,
        goal,
        theme:'default'
    }

    return level;
}
*/