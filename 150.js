var track = new Audio();
track.src = 'hand.ogg';
track.bpm = 125.0;
track.offset = -0.075;
track.volume = 0;

var aspect = 16/9;
var height = 720;

var scene = new THREE.Scene();
var zoom = 200;
// var camera = new THREE.OrthographicCamera( -1 * zoom * aspect, zoom * aspect, -1 * zoom, zoom, 0, 10 );

// var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
// directionalLight.position.set( 0, 50, 100 );
// scene.add(directionalLight);

var pointLight = new THREE.PointLight()
pointLight.position.set( 100, 100, 100 );
scene.add(pointLight);

// var ambientLight = new THREE.AmbientLight( 0xffffff );
// scene.add(ambientLight);

var camera = new THREE.PerspectiveCamera(95, aspect, 1, 500);
camera.position.z = 150;
camera.position.y = 10;
camera.lookAt(new THREE.Vector3());

console.log(camera.rotation);

var renderer = new THREE.WebGLRenderer();
renderer.setSize( height * aspect, height );
document.body.appendChild(renderer.domElement);

var debug = document.createElement('canvas');
document.body.appendChild(debug);
debug = debug.getContext('2d');

var input = new TANGENT.Input();
document.body.onkeydown = function (e) {
  input.keyPress(e.keyCode);
};

document.body.onkeyup = function (e) {
  input.keyRelease(e.keyCode);
};

var world = {
  gravity: new THREE.Vector2(0, -0.2),
};

var Player = function(position) {
  this.velocity = new THREE.Vector2();
  this.position = position || new THREE.Vector2();
  this.size = new THREE.Vector2(25, 40);
  this.halves = new THREE.Vector2(this.size.x/2, this.size.y/2);
  this.body = true;
  this.geometry = new THREE.PlaneGeometry(this.size.x,this.size.y);
  this.material = TANGENT.testShaderMaterial;
  this.cube = new THREE.Mesh( this.geometry, this.material );
  this.collider = true;
  scene.add( this.cube );
}

Player.prototype.thrustLeft = 0.4;
Player.prototype.thrustRight = 0.4;
Player.prototype.thrustAirLeft = 0.2;
Player.prototype.thrustAirRight = 0.2;
Player.prototype.thrustJump = -10;
Player.prototype.dragX = 0.1;
Player.prototype.dragAirX = 0.05;
Player.prototype.dragY = 0.02;

Player.prototype.update = function () {

  if(this.ground && input.keys[90] === 1) {
    this.velocity.y -= this.thrustJump;
  }

  if ( this.ground ) {
    this.velocity.x -= this.velocity.x * this.dragX;
  }else{
    this.velocity.x -= this.velocity.x * this.dragAirX;
  }

  this.velocity.y -= this.velocity.y * this.dragY;
  
  if(input.keys[37] > 0) {
    this.velocity.x -= this.ground ? this.thrustLeft : this.thrustAirLeft;
  }

  if(input.keys[39] > 0) {
    this.velocity.x += this.ground ? this.thrustRight : this.thrustAirRight;
  }
  
  this.velocity.addVectors(this.velocity, world.gravity);
  this.position.addVectors(this.position, this.velocity);

  this.ground = false;

};

Player.prototype.draw = function () {
  this.cube.position.x = this.position.x;
  this.cube.position.y = this.position.y;
};

var Wall = function (posX, posY, sizeX, sizeY) {
  this.life = 0;
  this.position = new THREE.Vector3(posX, posY, 0);
  this.velocity = new THREE.Vector2();
  this.size = new THREE.Vector2(sizeX, sizeY);
  this.halves = new THREE.Vector2(sizeX/2, sizeY/2);
  this.collider = true;
  this.geometry = new THREE.PlaneGeometry(sizeX, sizeY);
  this.material = TANGENT.testShaderMaterial.clone();
  this.mesh = new THREE.Mesh( this.geometry, this.material );
  this.mesh.position = this.position;
  scene.add( this.mesh );
}

Wall.prototype.draw = function () {
  if(this.life < 30) {
  }
};

Wall.prototype.update = function () {
  this.life+=1
};


var Player = TANGENT.extend(Player,TANGENT.Body);
var tangentScene = new TANGENT.Scene();

tangentScene.add(new Wall(0, -50, 200, 10));
// tangentScene.add(new Wall(150, 0, 200, 10));
// tangentScene.add(new Wall(100, -25, 25, 25));


var player;

setTimeout(function(){
  player = new Player();
  tangentScene.add(player);
  track.play();
}, 1000);

function onStartBeat(track) {
  if(track.barBeat===3) {
    tangentScene.add(new Wall(Math.random()*300-150, track.cur * track.bpm / 2, 50, 10));
  }
};

function  main(t) {

  var cameraLookAt = new THREE.Vector3();

  debug.clearRect(0, 0, debug.canvas.width, debug.canvas.height);
  debug.fillStyle = '#fff';
  if(track.played.length > 0) {
    track.cur = track.played.end(0);
    track.beatClamp = ((track.cur + track.offset) * (track.bpm / 60.0)) % 1;
    track.beat = ((track.cur + track.offset) * (track.bpm / 60.0)).toFixed(0);
    track.startBeat = track.prevBeat !== track.beat;
    track.prevBeat = track.beat;
    track.barBeat = track.beat % 4 + 1;
    track.bar = Math.floor((track.beat / 4 + 1));
    track.startBar = track.prevBar !== track.bar;
    track.prevBar = track.bar;
    debug.fillText(track.cur.toFixed(1) + ' : ' + track.bar + ' : ' + track.barBeat, 10, 10);

    if(track.startBar) {
      debug.fillRect(5, 15, 20, 20);
    }

    if(track.startBeat) {
      onStartBeat(track);
      debug.fillRect(10, 20, 10, 10);
    }
    //camera.position.y = 10 + track.cur * track.bpm / 2;
  }

  if (player) {
    //camera.position.y = player.position.y + 50;
    camera.position.x += (player.position.x - camera.position.x) / 5;
    camera.position.y += (player.position.y - camera.position.y) / 5;
    //cameraLookAt.x += (player.position.x - cameraLookAt.x) / 3;
    //cameraLookAt.y += camera.position.y = (player.position.y - cameraLookAt.y) / 3;
    cameraLookAt.z = 0;
    //camera.lookAt(cameraLookAt);
  }


  input.update();
  tangentScene.update();
  tangentScene.collide();
  tangentScene.draw();

  requestAnimationFrame(main);
  renderer.render(scene, camera);
}

main();

