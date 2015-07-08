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
var SQUARE_SIZE = 50;

var squares = [];

var canvas = document.createElement('canvas'),
	context = canvas.getContext('2d');
	//TODO: в конфиг
canvas.width = SQUARE_SIZE * 5 ;
canvas.height = SQUARE_SIZE * 8;
document.body.appendChild(canvas);




/*
* Инициализируем игру
*/
function init(){
	createNewSquare();
	main();

}



function main(){
	var now = Date.now();

	var	delta = (now - lastTime) / 1000.0;

	update(delta);

	render();

	lastTime = now;
	requestAnimFrame(main);
}


function update(dt){
	gameTime += dt;
	if(gameTime	- lastGameTime > 1){
		lastGameTime = gameTime;
		console.log("updateSquares");
		updateSquares();
	}
	checkHandles();
	checkCollisions(squares[squares.length - 1]);
}

function updateSquares(){
	var flag = false;

	for(var i = 0; i < squares.length; i++){
		if(squares[i].isActive){
			console.log("updateActiveSquare");
			updateActiveSquare(squares[i]);
			flag = true;
		}
	}
	if(!flag){
		console.log("new Square");
		createNewSquare();
	}
}

function updateActiveSquare(Square){
	Square.y += SQUARE_SIZE;
	if(Square.y + SQUARE_SIZE >= canvas.height){
		Square.isActive	= false;
	}
}
function checkCollisions(Square){
	for(var i = 0; i < squares.length; i++){
		if(!squares[i].isActive){
			if(Square.y + SQUARE_SIZE >= squares[i].y && Square.x == squares[i].x){
				Square.isActive	= false;
			}
		}
	}
}

function randomInteger(min, max) {
  var rand = min + Math.random() * (max - min)
  rand = Math.round(rand);
  return rand;
}
function createNewSquare(){
	squares.push({
		x: randomInteger(0, 4) * SQUARE_SIZE,
		y: 0,
		isActive: true,
		number: randomInteger(-10,10)
	});
}

function render(){
	context.clearRect(0, 0, canvas.width, canvas.height);
	for(var i = 0; i < squares.length; i++){
		renderSquare(squares[i])
	}
}

function renderSquare(Square){
	var img = new Image(); 
	img.src = IMAGES_PATH + '/1.png'
	context.drawImage(img, Square.x, Square.y, SQUARE_SIZE, SQUARE_SIZE);
	context.font = "30px Arial";
	context.textAlign = "center";
	context.textBaseline  = "middle";
	context.fillStyle = "white";
	context.fillText(Square.number,Square.x + SQUARE_SIZE / 2, Square.y + SQUARE_SIZE / 2);
}

//Обработчик пользовательских нажатий
function checkHandles(){

}
document.addEventListener('keydown', function(event) {
	var currentSquare = squares[squares.length - 1];

	switch(event.keyCode) {
    case 39:
        key = 'RIGHT';
        if(currentSquare.x + SQUARE_SIZE < canvas.width){
        	currentSquare.x += SQUARE_SIZE;
        }
        break;
    case 37:
        key = 'LEFT'; 
        if(currentSquare.x > 0){
			currentSquare.x -= SQUARE_SIZE;
        }
        break;
    case 40:
        key = 'DOWN'; 
        if(currentSquare.y + SQUARE_SIZE < canvas.height){
        	currentSquare.y += SQUARE_SIZE;
        }
        break;
    }
   	console.log(squares[squares.length - 1].x);
});



init();
