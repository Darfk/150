var aspect = 16/9;
var height = 720;

var cx = document.createElement('canvas');
document.body.appendChild(cx);
cx = cx.getContext('2d');
cx.canvas.width = 1024;
cx.canvas.height = 768;

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
  this.rayDown = new TANGENT.Ray(new THREE.Vector2(), TANGENT.RayDirection.DOWN, 8);
  this.boxCollider = new TANGENT.BoxCollider(new THREE.Vector2(),
                                              new THREE.Vector2(this.size.x, this.size.y));
};

Player.prototype.thrustX = 0.2;
Player.prototype.thrustAirX = 0.1;
Player.prototype.thrustJump = -1.9;
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
  cx.save();
  cx.fillStyle='#109010';
  cx.translate(this.position.x - this.size.x * 0.5, this.position.y - this.size.y * 0.5);
  cx.fillRect(0,0,this.size.x,this.size.y)
  cx.restore();
};

var Wall = function (posX, posY, sizeX, sizeY) {
  this.life = 0;
  this.position = new THREE.Vector3(posX, posY, 0);
  this.velocity = new THREE.Vector2();
  this.size = new THREE.Vector2(sizeX, sizeY);
  this.collider = true;
};

Wall.prototype.draw = function () {
  cx.save();
  cx.fillStyle='#901010';
  cx.translate(this.position.x - this.size.x * 0.5, this.position.y - this.size.y * 0.5);
  cx.fillRect(0,0,this.size.x,this.size.y)
  cx.restore();
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

var camera = new TANGENT.Camera();

function main(t) {
  debug.clearRect(0, 0, debug.canvas.width, debug.canvas.height);
  debug.fillStyle = '#fff';

  input.update();
  tangentScene.update();
  tangentScene.collide();

  cx.clearRect(0, 0, cx.canvas.width, cx.canvas.height);
  cx.save();
  cx.scale(1, -1);

  if(player) {
    camera.position.x += (player.position.x - camera.position.x) / 10;
    camera.position.y += (player.position.y - camera.position.y) / 10;
  }

  camera.frame(cx);

  tangentScene.draw();

  cx.restore();

  requestAnimationFrame(main);
}

main();

