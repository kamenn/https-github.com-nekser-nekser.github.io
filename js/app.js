// A cross-browser requestAnimationFrame
// See https://hacks.mozilla.org/2011/08/animating-with-javascript-from-setinterval-to-requestanimationframe/
var requestAnimFrame = (function(){
    return window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(callback){
            window.setTimeout(callback, 1000 / 60);
        };
})();

var IMAGES_PATH = 'images';
var lastTime = Date.now();
var gameTime = 0;
var lastGameTime = 0;
var SQUARE_SIZE = 80;
var gameOver = false;
var SPEED = 1.0;
var squares = [];

var canvas = document.createElement('canvas'),
	context = canvas.getContext('2d');



	//TODO: в конфиг
var BOARD_WIDTH = SQUARE_SIZE * 5;
var BOARD_HEIGHT = SQUARE_SIZE * 8;
var STAND_HEIGHT = 15;
var HEADER_HEIGHT = SQUARE_SIZE * 2;
var OFFSET_TOP = HEADER_HEIGHT;

var SCORE = 0;
var freeColumns = [0,1,2,3,4];

canvas.width = BOARD_WIDTH;
canvas.height = BOARD_HEIGHT + STAND_HEIGHT;

var gameDiv = document.getElementById('game');

gameDiv.appendChild(canvas);

resources.load([
    'images/positive.png',
    'images/negative.png',
    'images/zero.png',
    'images/bgr.png',
    'images/header.png',
    'images/refresh.png'
]);
resources.onReady(init);


/*
* Инициализируем игру
*/
function init(){
	gameTime = 0;
	gameOver = false;
	SCORE = 0;
	lastGameTime = 0;
	lastTime = Date.now();
	squares.splice(0, squares.length);
	freeColumns = [0,1,2,3,4];
	createNewSquare();
	main();

}



function main(){
	if(!gameOver){
		var now = Date.now();

		var	delta = (now - lastTime) / 1000.0;

		update(delta);

		render();

		lastTime = now;
		requestAnimFrame(main);
	} else {
		alert("Game Over!");
	}
}


function update(dt){
	gameTime += dt;
	SPEED = 1 / (Math.floor( gameTime / 30 ) + 1);
	console.log(SPEED);
	if(gameTime	- lastGameTime > SPEED){
		lastGameTime = gameTime;
		//console.log("updateSquares");
		updateSquares();
	}
	checkCollisions(squares[squares.length - 1]);
	checkPoints();
}
function linkSquares(index_a, index_b, callback){
	 (function() {
        // Выполняем действия
        squares[index_b].y += 10
        if (squares[index_b].y == squares[index_a].y) {
            callback(index_a, index_b);
        } else {
            setTimeout(arguments.callee, 10);
        }
    })();
	
}
function checkPoints(){
	for(var i = 0; i < squares.length; i++){
		for(var j = i; j < squares.length; j++){
			if(squares[i] != squares[j]){
				/*
				*Сложение элементов друг на другом
				*/
				if(squares[i].x == squares[j].x && 
					squares[i].y == squares[j].y + SQUARE_SIZE){
					if((squares[i].number > 10 && squares[j].number < 0) ||
						(squares[i].number < -10 && squares[j].number > 0) ||
						(squares[i].number >= -10 && squares[i].number <= 10)){
						
						linkSquares(i,j, function(i, j){
							squares[i].number += squares[j].number;
							
							squares.splice(j,1);
							if(squares[i].number > 0){
							//squares.splice(j,1);
							squares[i].image = resources.get('images/positive.png');
							} else if(squares[i].number < 0){
								
								//squares.splice(j,1);
								squares[i].image = resources.get('images/negative.png');
							} else {
								squares[i].image = resources.get('images/zero.png');
								SCORE += Math.abs(squares[j].number);
								if(i > j){
									squares.splice(i,1);
									//squares.splice(j,1);
									//TODO сделать удаление не сраз
								} else {
									//squares.splice(j,1);
									setTimeout(function(){
											for(var k = 0; k < squares.length; k++){
												if(squares[k].number == 0){
													destroySquare(k);
												}
											}
									}, 2000);
								}
							}
						});
						
					}
				}
			}
		}
	}
	for(var i = 0; i < squares.length; i++){
		for(var j = i; j < squares.length; j++){
			if(squares[i].y == squares[j].y && 
					squares[i].x == squares[j].x + SQUARE_SIZE && squares[i].number == (-1)*squares[j].number){
					//TODO добавить анимацию слияния квадратов
					squares[i].number = 0;
					SCORE += Math.abs(squares[j].number);
					squares[i].image = resources.get('images/zero.png');
					squares.splice(j,1);
					setTimeout(function(){
										for(var k = 0; k < squares.length; k++){
											if(squares[k].number == 0){
												destroySquare(k);
											}
										}
								}, 2000);
			}
		}
	}
}
/**
 * @param {Function} callback Фукнция, вызываемая по окончании работы.
 */
function destroy(index, callback) {
    // Инициализируем переменные

    (function() {
        // Выполняем действия
        squares[index].width -= 10;
        if (squares[index].width <= 0) {
            callback();
        } else {
            setTimeout(arguments.callee, 5);
        }
    })();
}
/*
*
*Заглушка для метода уничтожения квадрта
*/
function destroySquare(index){
	destroy(index, function(){
		squares.splice(index, 1);
	});
}
function updateSquares(){
	var flag = false;

	for(var i = 0; i < squares.length; i++){
		if(squares[i].isActive){
			//console.log("updateActiveSquare");
			updateActiveSquare(squares[i]);
			flag = true;
		}
	}
	if(!flag){
		//console.log("new Square");
		createNewSquare();
	}
}
function moveSquare(Square, y, callback){
	 (function() {
        // Выполняем действия
        Square.y += 10;
        if (Square.y - y == SQUARE_SIZE) {
            callback();
        } else {
            setTimeout(arguments.callee, 10);
        }
    })();
	
}
function updateActiveSquare(Square){
	moveSquare(Square, Square.y, function(){
		if(Square.y + SQUARE_SIZE >= BOARD_HEIGHT){
			Square.isActive	= false;
		}
	});
}
function checkCollisions(Square){
	for(var i = 0; i < squares.length; i++){
		if(!squares[i].isActive){
			if(Square.y + SQUARE_SIZE >= squares[i].y && Square.x == squares[i].x){
				Square.isActive	= false;
			}
		}
	}
	if(Square.y == OFFSET_TOP && !Square.isActive){
		for(var k = 0; k < freeColumns.length; k++){
			if(freeColumns[k] == Square.x / SQUARE_SIZE){
				freeColumns.splice(k, 1);
			}
		}
	}
	return Square.isActive;
}

function randomInteger(min, max) {
  var rand = min + Math.random() * (max - min)
  rand = Math.round(rand);
  return rand;
}

function setGameOver(){
	gameOver = true;

}
function createNewSquare(){	
	//checkTopLevel();
	if(freeColumns.length == 0){
		setGameOver();
	}
	var index = randomInteger(0, freeColumns.length - 1);
	xCoord = freeColumns[index] * SQUARE_SIZE;

	var number = 0;

	/*
	* Генерируем случайное число, отличное от нуля.
	* Чтобы отрицательные и положительные числа генерировались равновероятно,
	* вначале генерируем знак, а затем значение.
	*/
	while(0 == number){
		number = randomInteger(-1, 1);
	}
	number *= randomInteger(1,10);
	squares.push({
		x: xCoord,
		y: OFFSET_TOP,
		isActive: true,
		number: number,
		width: SQUARE_SIZE,
		image: number <= 0 ? resources.get('images/negative.png') : resources.get('images/positive.png')
	});
}

/*
* Rendering functions
*
*/
function render(){
	context.clearRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);
	renderBackground();
	renderHeader();
	for(var i = 0; i < squares.length; i++){
		renderSquare(squares[i])
	}
}

function renderBackground(){
	var bgrImg = resources.get('images/bgr.png');

	context.drawImage(bgrImg, 0, 0, BOARD_WIDTH, canvas.height);

}
function renderTime(){
	var minutes = Math.floor(gameTime / 60);
	var seconds = Math.floor(gameTime % 60)
	var time = minutes + ':' + (seconds < 10 ? '0'+seconds : seconds);

	context.font = "15px Arial";
	context.textAlign = "right";
	context.textBaseline  = "bottom";
	context.fillStyle = "white";
	context.fillText("Time " + time, BOARD_WIDTH - 10, HEADER_HEIGHT - 10);
}
function renderScore(){
	context.font = "15px Arial";
	context.textAlign = "left";
	context.textBaseline  = "bottom";
	context.fillStyle = "white";
	context.fillText("Score " + SCORE, 10, HEADER_HEIGHT - 10);
}
function renderButtons(){
	var refreshImage = resources.get('images/refresh.png');

	context.drawImage(refreshImage, BOARD_WIDTH - 40, 0, 40, 40);
}
function renderHeader(){
	var headerImage = resources.get('images/header.png');
	context.drawImage(headerImage, 0, 0, BOARD_WIDTH, HEADER_HEIGHT);
	renderTime();
	renderScore();
	renderButtons();
}
function renderSquare(Square){
	var img = Square.image;
	context.drawImage(img, Square.x, Square.y, Square.width, Square.width);
	context.font = "30px Arial";
	context.textAlign = "center";
	context.textBaseline  = "middle";
	context.fillStyle = "white";
	context.fillText(Square.number,Square.x + SQUARE_SIZE / 2, Square.y + SQUARE_SIZE / 2);
}



function squareToBottom(Square){
	var topY = BOARD_HEIGHT - SQUARE_SIZE;
	for(var i = 0; i < squares.length; i++){
		if(!squares[i].isActive && squares[i].x == Square.x){
			if(squares[i].y <= topY){
				topY = squares[i].y - SQUARE_SIZE;
			}
		}
	}
	Square.y = topY;
}


//Обработчики клика
canvas.addEventListener('click', function(){
	var x = event.pageX - canvas.offsetLeft,
        y = event.pageY - canvas.offsetTop;
    if(x >= canvas.offsetLeft + BOARD_WIDTH - 40 && x <= canvas.offsetTop + BOARD_WIDTH
    	&& y >= 0 && y <= 40){
    	//TODO Анимация кнопки
    	init();
    }
});
//Обработчик пользовательских нажатий (TODO: вынести в отдельный файл)
document.addEventListener('keydown', function(event) {
	var currentSquare = squares[squares.length - 1];

	switch(event.keyCode) {
    case 39:
        key = 'RIGHT';
        var allowToRight = true;
        if(currentSquare.x + SQUARE_SIZE < BOARD_WIDTH && currentSquare.isActive){
        	for(var i = 0; i < squares.length; i++){
				if(!squares[i].isActive && squares[i].y == currentSquare.y){
					if(currentSquare.x + SQUARE_SIZE == squares[i].x) allowToRight	= false;
				}
			}
			if(allowToRight){
	        	currentSquare.x += SQUARE_SIZE;
	        }
        }
        
        break;
    case 37:
        key = 'LEFT';
        var allowToLeft = true; 
        if(currentSquare.x > 0 && currentSquare.isActive){
        	for(var i = 0; i < squares.length; i++){
				if(!squares[i].isActive && squares[i].y == currentSquare.y){
					if(currentSquare.x - SQUARE_SIZE == squares[i].x) allowToLeft	= false;
				}
			}
			if(allowToLeft){
        		currentSquare.x -= SQUARE_SIZE;
        	}
        }
        
        break;
    case 40:
        key = 'DOWN'; 
        if(currentSquare.y + SQUARE_SIZE < BOARD_HEIGHT && currentSquare.isActive){
        	squareToBottom(currentSquare);
        	currentSquare.isActive = false;
        }
        break;
    }
});