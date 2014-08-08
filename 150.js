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
  gravity: new THREE.Vector2(0, -0.05),
};

var Player = function(position) {
  this.velocity = new THREE.Vector2();
  this.position = position || new THREE.Vector2();
  this.size = new THREE.Vector2(12, 16);
  this.geometry = new THREE.PlaneGeometry(this.size.x,this.size.y);
  this.material = new THREE.MeshLambertMaterial({map: brickTexture});
  this.cube = new THREE.Mesh( this.geometry, this.material );

  this.rayDown = new TANGENT.Ray(new THREE.Vector2(), TANGENT.RayDirection.DOWN, 8);
  this.boxCollider = new TANGENT.BoxCollider(new THREE.Vector2(),
                                              new THREE.Vector2(this.size.x, this.size.y));

  scene.add( this.cube );
}

Player.prototype.thrustX = 0.2;
Player.prototype.thrustAirX = 0.1;
Player.prototype.thrustJump = -2.9;
Player.prototype.dragX = 0.1;
Player.prototype.dragAirX = 0.05;
Player.prototype.dragY = 0.02;
Player.prototype.groundTime;
Player.prototype.update = function () {

  this.velocity.x = Math.max(Math.min(this.velocity.x, 2), -2);
  
  if(input.keys[37] > 0) {
    this.velocity.x -= this.ground ? this.thrustX : this.thrustAirX;
    this.velocity.x = Math.max(-6, this.velocity.x);
  }

  if(input.keys[39] > 0) {
    this.velocity.x += this.ground ? this.thrustX : this.thrustAirX;
    this.velocity.x = Math.min(6, this.velocity.x);
  }
  
  if(this.ground && input.keys[90] === 1) {
    this.velocity.y -= this.thrustJump;
  }

  if ( this.ground ) {
    if(this.groundTime > 5){
      this.velocity.x -= this.velocity.x * this.dragX;
    }else{
      debug.fillText("GroundTime", 10, 30);
    }
    this.groundTime += 1;
  }else{
    this.groundTime = 0;
  }
 
  this.ground = false;

  this.velocity.addVectors(this.velocity, world.gravity);
  this.position.addVectors(this.position, this.velocity);

  this.boxCollider.position.x = this.position.x;
  this.boxCollider.position.y = this.position.y;

  var self = this;

  this.boxCollider.OnCollision = function (x, y, o){
    if(Math.abs(y) > Math.abs(x)){
      self.position.x += x;
      if((self.velocity.x > 0 && x < 0) || self.velocity.x < 0 && x > 0) {
        self.velocity.x = 0;
      }
    }else{
      self.position.y += y;
      if((self.velocity.y > 0 && y < 0) || self.velocity.y < 0 && y > 0) {
        self.velocity.y = 0;
      }
      if (y>0) {
        self.ground = true;
        debug.fillText("Ground", 10, 20);
      }

   }

    self.boxCollider.position.x = self.position.x;
    self.boxCollider.position.y = self.position.y;
      
    debug.strokeStyle = 'white';
    debug.save();
    debug.translate(100, 100);
    debug.beginPath();
    debug.moveTo(0,0);
    debug.lineTo(x, y);
    debug.stroke();
    debug.restore();
    debug.fillText(x.toFixed(2) + " " + y.toFixed(2), 10, 10);
  };

  tangentScene.ColliderCast(this.boxCollider);

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
tangentScene.add(new Wall(0, -48, 16, 16));
tangentScene.add(new Wall(16, -64, 16, 16));

tangentScene.add(new Wall(-16, -64, 16, 16));

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

