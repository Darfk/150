
var aspect = 16/9;
var height = 720;

var scene = new THREE.Scene();
var zoom = 200;
var camera = new THREE.OrthographicCamera( -1 * zoom * aspect, zoom * aspect, -1 * zoom, zoom, 0, 10 );
var renderer = new THREE.WebGLRenderer();
renderer.setSize( height * aspect, height );
document.body.appendChild( renderer.domElement );

var input = new TANGENT.Input();
document.body.onkeydown = function (e) {
  input.keyPress(e.keyCode);
};

document.body.onkeyup = function (e) {
  input.keyRelease(e.keyCode);
};

var world = {
  gravity: new THREE.Vector2(0, 0.2),
};

var geometry = new THREE.CubeGeometry(1,1.6,1);
var material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
var cube = new THREE.Mesh( geometry, material );


//scene.add( cube );
camera.position.z = 5;

var Player = function(position) {
  this.velocity = new THREE.Vector2();
  this.position = position || new THREE.Vector2();
  this.size = new THREE.Vector2(25, 40);
  this.halves = new THREE.Vector2(this.size.x/2, this.size.y/2);
  this.body = true;
  this.geometry = new THREE.CubeGeometry(this.size.x,this.size.y,1);
  this.material = new THREE.MeshBasicMaterial( { color: 0x5555ff } );
  this.cube = new THREE.Mesh( this.geometry, this.material );
  scene.add( this.cube );
}

Player.prototype.thrustLeft = 0.4;
Player.prototype.thrustRight = 0.4;
Player.prototype.thrustAirLeft = 0.2;
Player.prototype.thrustAirRight = 0.2;
Player.prototype.thrustJump = 6;
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
  this.position = new THREE.Vector3(posX, posY, 0);
  this.velocity = new THREE.Vector2();
  this.size = new THREE.Vector2(sizeX, sizeY);
  this.halves = new THREE.Vector2(sizeX/2, sizeY/2);
  this.collider = true;
  this.geometry = new THREE.CubeGeometry(sizeX,sizeY,1);
  this.material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
  this.cube = new THREE.Mesh( this.geometry, this.material );
  this.cube.position = this.position;
  scene.add( this.cube );
}

Wall.prototype.draw = function () {
};

Wall.prototype.update = function () {
};


var Player = TANGENT.extend(Player,TANGENT.Body);
var tangentScene = new TANGENT.Scene();

tangentScene.add(new Wall(0, 50, 200, 10));
tangentScene.add(new Wall(150, 0, 200, 10));
tangentScene.add(new Wall(100, 25, 25, 25));

setTimeout(function(){
  var player = new Player();
  tangentScene.add(player);
}, 1000);

function render(t) {

  input.update();
  // cube.position.x = Math.sin(t/1000) * 10;
  tangentScene.update();
  tangentScene.collide();
  tangentScene.draw();
  
  requestAnimationFrame(render);
  renderer.render(scene, camera);
}
render();

