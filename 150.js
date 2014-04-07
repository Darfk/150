var track = new Audio();
track.src = 'hand.ogg';
track.bpm = 125.0;
track.offset = -0.075;

var aspect = 16/9;
var height = 720;

var scene = new THREE.Scene();
var zoom = 200;
// var camera = new THREE.OrthographicCamera( -1 * zoom * aspect, zoom * aspect, -1 * zoom, zoom, 0, 10 );

var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
directionalLight.position.set( 100, 100, 100 );
scene.add(directionalLight);

// var ambientLight = new THREE.AmbientLight( 0xffffff );
// scene.add(ambientLight);

var camera = new THREE.PerspectiveCamera(95, aspect, 1, 500);
camera.position.z = 100;

camera.position.y = 50;
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
  this.geometry = new THREE.CubeGeometry(this.size.x,this.size.y,10);
  this.material = new THREE.MeshPhongMaterial( {
    ambient: 0x000080,
    color: 0x303060,
    specular: 0x000080,
    shininess: 10,
    shading: THREE.FlatShading
  });
  this.cube = new THREE.Mesh( this.geometry, this.material );
  this.collider = true;
  scene.add( this.cube );
}

Player.prototype.thrustLeft = 0.4;
Player.prototype.thrustRight = 0.4;
Player.prototype.thrustAirLeft = 0.2;
Player.prototype.thrustAirRight = 0.2;
Player.prototype.thrustJump = -6;
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
  this.geometry = new THREE.CubeGeometry(sizeX,sizeY,10);
  this.material = new THREE.MeshPhongMaterial( {
    ambient: 0x80000,
    color: 0x603030,
    specular: 0xf00000,
    shininess: 10,
    shading: THREE.FlatShading
  });
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

tangentScene.add(new Wall(0, -50, 200, 10));
tangentScene.add(new Wall(150, 0, 200, 10));
tangentScene.add(new Wall(100, -25, 25, 25));

setTimeout(function(){
  var player = new Player();
  tangentScene.add(player);
  track.play();
}, 1000);

function  main(t) {

  debug.clearRect(0, 0, debug.canvas.width, debug.canvas.height);
  debug.fillStyle = '#fff';
  if(track.played.length > 0) {
    track.cur = track.played.end(0);
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
      debug.fillRect(10, 20, 10, 10);
    }
    directionalLight.position.setX(Math.sin(track.cur) * 100);
    directionalLight.position.setY(Math.cos(track.cur) * 100);

  }
  input.update();
  // cube.position.x = Math.sin(t/1000) * 10;
  tangentScene.update();
  tangentScene.collide();
  tangentScene.draw();
  
  requestAnimationFrame(main);
  renderer.render(scene, camera);
}
main();

