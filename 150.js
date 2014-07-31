var aspect = 16/9;
var height = 720;

var scene = new THREE.Scene();
// var zoom = 400;
// var camera = new THREE.OrthographicCamera( -1 * zoom * aspect, zoom * aspect, -1 * zoom, zoom, 0, 10 );

// var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
// directionalLight.position.set( 0, 50, 100 );
// scene.add(directionalLight);

var pointLight = new THREE.PointLight()
pointLight.position.set( 100, 100, 100 );
scene.add(pointLight);

// var ambientLight = new THREE.AmbientLight( 0xffffff );
// scene.add(ambientLight);

var brickTexture = THREE.ImageUtils.loadTexture('brick.png');
brickTexture.minFilter = THREE.NearestFilter
brickTexture.magFilter = THREE.NearestFilter

var camera = new THREE.PerspectiveCamera(95, aspect, 1, 500);
camera.position.z = 100;
camera.position.y = 10;
camera.lookAt(new THREE.Vector3());

var renderer = new THREE.WebGLRenderer();
renderer.setSize( height * aspect, height );
document.body.appendChild(renderer.domElement);

var debug = document.createElement('canvas');
document.body.appendChild(debug);
debug = debug.getContext('2d');

var tangentScene = new TANGENT.Scene();

var input = new TANGENT.Input();
document.body.onkeydown = function (e) {
  input.keyPress(e.keyCode);
};

document.body.onkeyup = function (e) {
  input.keyRelease(e.keyCode);
};

var world = {
  gravity: new THREE.Vector2(0, -0.1),
};

var Player = function(position) {
  this.velocity = new THREE.Vector2();
  this.position = position || new THREE.Vector2();
  this.size = new THREE.Vector2(16, 16);
  this.geometry = new THREE.PlaneGeometry(this.size.x,this.size.y);
  this.material = new THREE.MeshLambertMaterial({map: brickTexture});
  this.cube = new THREE.Mesh( this.geometry, this.material );

  this.rayDown = new TANGENT.Ray(new THREE.Vector2(), TANGENT.RayDirection.DOWN, 8);
  this.xBoxCollider = new TANGENT.BoxCollider(new THREE.Vector2(),
                                              new THREE.Vector2(this.size.x, this.size.y - 8));
  this.yBoxCollider = new TANGENT.BoxCollider(new THREE.Vector2(),
                                              new THREE.Vector2(this.size.x - 8, this.size.y));

  scene.add( this.cube );
}

Player.prototype.thrustX = 0.2;
Player.prototype.thrustAirX = 0.1;
Player.prototype.thrustJump = -4;
Player.prototype.dragX = 0.1;
Player.prototype.dragAirX = 0.05;
Player.prototype.dragY = 0.02;
Player.prototype.groundTime;
Player.prototype.update = function () {

  if(this.ground && input.keys[90] === 1) {
    this.velocity.y -= this.thrustJump;
  }

  if ( this.ground ) {
    if(this.groundTime > 5){
      this.velocity.x -= this.velocity.x * this.dragX;
    }
    this.groundTime += 1;
  }else{
    this.groundTime = 0;
  }

  this.velocity.x = Math.max(Math.min(this.velocity.x, 4), -4);
  
  if(input.keys[37] > 0) {
    this.velocity.x -= this.ground ? this.thrustX : this.thrustAirX;
    this.velocity.x = Math.max(-6, this.velocity.x);
  }

  if(input.keys[39] > 0) {
    this.velocity.x += this.ground ? this.thrustX : this.thrustAirX;
    this.velocity.x = Math.min(6, this.velocity.x);
  }
  
  // Do ray collisions
  this.rayDown.position.x = this.position.x;
  this.rayDown.position.y = this.position.y;

  tangentScene.RayCast(this.rayDown);

  if(this.rayDown.collisionResults[0]) {
    // this.position.y += this.rayDown.length - this.rayDown.collisionResults[0].penetration;
    // this.velocity.y = 0;
    this.ground = true;
  }else{
    this.ground = false;
  }

  // Do box collisions
  this.xBoxCollider.position.x = this.position.x;
  this.xBoxCollider.position.y = this.position.y;

  this.yBoxCollider.position.x = this.position.x;
  this.yBoxCollider.position.y = this.position.y;
  
  var self = this;
  this.yBoxCollider.OnCollide = function (xPen, yPen, other) {
    self.position.y += yPen;
    self.velocity.y = 0;
  };

  this.xBoxCollider.OnCollide = function (xPen, yPen, other) {
    self.position.x += xPen;
    self.velocity.x = 0;
  };

  tangentScene.ColliderCast(this.yBoxCollider);
  tangentScene.ColliderCast(this.xBoxCollider);

  // var xMaxPen = 0, yMaxPen = 0;
  // if(this.boxCollider.collisionResults.length > 0){
  //   for(var i=0;i<this.boxCollider.collisionResults.length;i++){
  //     if(Math.abs(this.boxCollider.collisionResults[i].x) > Math.abs(xMaxPen)){
  //       xMaxPen = this.boxCollider.collisionResults[i].x;
  //     }
  //     if(Math.abs(this.boxCollider.collisionResults[i].y) > Math.abs(yMaxPen)){
  //       yMaxPen = this.boxCollider.collisionResults[i].y;
  //     }
  //   }
  //   if(xMaxPen > yMaxPen) {
  //     this.position.y += yMaxPen;
  //   }else{
  //     this.position.x += xMaxPen;
  //   }
  // }

  this.velocity.addVectors(this.velocity, world.gravity);
  this.position.addVectors(this.position, this.velocity);

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
  this.collider = true;
  this.geometry = new THREE.PlaneGeometry(sizeX, sizeY, 2, 1);
  this.material = TANGENT.mapShaderMaterial.clone();
  this.material.map = brickTexture;
  this.mesh = new THREE.Mesh( this.geometry, this.material );
  this.mesh.position = this.position;
  scene.add( this.mesh );
}

Wall.prototype.draw = function () {
  if(this.life < 30) {
  }
};

Wall.prototype.update = function () {
};

//var Player = TANGENT.extend(Player,TANGENT.Body);
var Wall = TANGENT.extend(Wall,TANGENT.BoxCollider);

tangentScene.add(new Wall(0, -64, 16, 16));
tangentScene.add(new Wall(16, -64, 16, 16));
tangentScene.add(new Wall(0, -48, 16, 16));
tangentScene.add(new Wall(16, -64, 16, 16));

tangentScene.add(new Wall(16, 32, 16, 16));

for(var i=0;i<10;i++){
  tangentScene.add(new Wall(i*16+32, -i*4-50, 16, 16));
}

var player;
player = new Player();
tangentScene.add(player);

function main(t) {

  var cameraLookAt = new THREE.Vector3();

  debug.clearRect(0, 0, debug.canvas.width, debug.canvas.height);
  debug.fillStyle = '#fff';

  if (player) {
    camera.position.x += (player.position.x - camera.position.x) / 5;
    camera.position.y += (player.position.y - camera.position.y) / 5;
    cameraLookAt.z = 0;
  }


  input.update();
  tangentScene.update();
  tangentScene.collide();
  tangentScene.draw();

  requestAnimationFrame(main);
  renderer.render(scene, camera);
}

main();

