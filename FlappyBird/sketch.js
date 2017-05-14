// Be sure to choose File > Import Library > p5.serialport.js from the P5 IDE main menu to load serial library

// Terminal command to install p5.serialserver:  npm install p5.serialserver
// Terminal command to start server:  node ~/node_modules/p5.serialserver/startserver.js
var buttonPress = 1;
var GRAVITY = .5;
var FLAP = -7;
var GROUND_Y = 450;
var MIN_OPENING = 300;
var bird, ground;
var pipes;
var gameOver;
var birdImg, pipeImg, groundImg, bgImg;
var score = 0;
var flySound, gameoverSound, backgroundSound;


var serial;                            // variable to hold an instance of the serialport library
var options = { baudrate: 9600};      // set baudrate to 9600; must match Arduino baudrate
var portName = 'COM3'; // fill in your serial port name here
var inData;                            // for incoming serial data
var slider;

function preload() {
  birdImg = loadImage("assets/spyflap.png");
  pipeImg = loadImage("assets/flappy_pipe.png");
  groundImg = loadImage("assets/flappy_ground.png");
  bgImg = loadImage("assets/background.png");
  
  flySound = loadSound("assets/fly.mp3");
  gameoverSound = loadSound("assets/hit.mp3");
  backgroundSound = loadSound("assets/mission.mp3");
}



function setup() {
  createCanvas(400, 600);      
  // make the canvas

  serial = new p5.SerialPort();    // make a new instance of the serialport library
  serial.on('data', serialEvent);  // callback for when new data arrives
  serial.on('error', serialError); // callback for errors
  serial.open(portName, options);           // open a serial port @ 9600 
  
  bird = createSprite(width/2, height/2, 40,40);
  bird.rotateToDirection = true;
  bird.velocity.x = 4;
  bird.setCollider("circle", 0,0,20);
  bird.addImage(birdImg);

  ground = createSprite(800/2, GROUND_Y+100); //image 800x200
  ground.addImage(groundImg);

  pipes = new Group();
  gameOver = true;
  updateSprites(false);
  
  camera.position.y = height/2;

}

function draw() {
//print(buttonPress);

  if(gameOver && keyWentDown("x"))
    newGame();

  if(gameOver && (buttonPress==0))
    newGame();

  if(!gameOver) {
    
    if (!backgroundSound.isPlaying()) {
      backgroundSound.play();
    }

    if(keyWentDown("x"))
      bird.velocity.y = FLAP;
    
     bird.velocity.y += GRAVITY;
    
    if(bird.position.y<0)
      bird.position.y = 0;
    
    if(bird.position.y+bird.height/2 > GROUND_Y)
      die();

    if(bird.overlap(pipes))
      die();
      
        if (buttonPress == 0) {
     bird.velocity.y = FLAP;
    
     bird.velocity.y += GRAVITY;
        }
      
        
    

    //spawn pipes
    if(frameCount%60 == 0) {
      var pipeH = random(50, 300);
      var pipe = createSprite(bird.position.x + width, GROUND_Y-pipeH/2+1+100, 80, pipeH);
      pipe.addImage(pipeImg);
      pipes.add(pipe);

      //top pipe
      if(pipeH<200) {
        pipeH = height - (height-GROUND_Y)-(pipeH+MIN_OPENING);
        pipe = createSprite(bird.position.x + width, pipeH/2-100, 80, pipeH);
        pipe.mirrorY(-1);
        pipe.addImage(pipeImg);
        pipes.add(pipe);
      }
    }

    //get rid of passed pipes
    for(var i = 0; i<pipes.length; i++)
      if(pipes[i].position.x < bird.position.x-width/2) {
        if (pipes[i].position.y > 0) {
          score++;
        }
        pipes[i].remove();
      }
  }

  camera.position.x = bird.position.x + width/4;

  //wrap ground
  if(camera.position.x > ground.position.x-ground.width+width/2)
    ground.position.x+=ground.width;

  background(113, 197, 207)
  
  if(score> 10 ){
          background('red')
        }
  
  
  camera.off();
  image(bgImg, 0, GROUND_Y-190);
  camera.on();

  drawSprites(pipes);
  drawSprite(ground);
  drawSprite(bird);
  
  camera.off();
  fill(100);
  text(score, width - 35, 30);
  if (gameOver) {
    fill(0);
    textSize(20);
    text('Click to start game', width/2 - 75, height/2 - 70);
  }
}



function serialEvent() {
  // inData = Number(serial.read());   // can use this when just looking for 1 byte msgs from Arduino
  
  // Alternatively, read a string from the serial port, looking for new line as data separator:
  var inString = serial.readStringUntil('\r\n');
  // check to see that there's actually a string there:
  if (inString.length > 0 ) {
    var sensors = split(inString, ','); 
    // convert it to a number:
    inData = Number(inString);
    buttonPress = sensors[2];  
  }
}


function serialError(err) {
  println('Something went wrong with the serial port. ' + err);
}



function die() {
  updateSprites(false);
  gameOver = true; 
  gameoverSound.play();
  backgroundSound.stop();
}

function newGame() {
  score = 0;
  pipes.removeSprites();
  gameOver = false;
  updateSprites(true);
  bird.position.x = width/2;
  bird.position.y = height/2;
  bird.velocity.y = 0;
  ground.position.x = 800/2;
  ground.position.y = GROUND_Y+100;
}

function mousePressed() {
  if(gameOver)
    newGame();
  bird.velocity.y = FLAP;
  flySound.play();
}