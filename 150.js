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
debug.font = '16pt Courier';
var tangentScene = new TANGENT.Scene();

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
  this.size = new THREE.Vector2(12, 16);
  this.rayDown = new TANGENT.Ray(new THREE.Vector2(), TANGENT.RayDirection.DOWN, 8);
  this.boxCollider = new TANGENT.BoxCollider(new THREE.Vector2(),
                                              new THREE.Vector2(this.size.x, this.size.y));
  this.physParent = null;
};

Player.prototype.thrustX = 0.1;
Player.prototype.thrustAirX = 0.05;
Player.prototype.thrustJump = -4;
Player.prototype.dragX = 0.2;
Player.prototype.dragAirX = 0.0;
Player.prototype.groundTime;
Player.prototype.velocityMaxX = 2;
Player.prototype.velocityMaxY = 6;
Player.prototype.groundTimeThreshold = 5;

Player.prototype.update = function (t) {

  this.velocity.x = Math.max(Math.min(this.velocity.x, Player.prototype.velocityMaxX),
                             -Player.prototype.velocityMaxX);
  this.velocity.y = Math.max(Math.min(this.velocity.y, Player.prototype.velocityMaxY),
                             -Player.prototype.velocityMaxY);
  
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
    this.groundTime += 1;
  }else{
    this.groundTime = 0;
  }

  if(!(input.keys[39]||input.keys[37])||(input.keys[39]&&input.keys[37])) {
    if(this.ground && this.groundTime > Player.prototype.groundTimeThreshold) {
      this.velocity.x -= Player.prototype.dragX * this.velocity.x;
    }else{
      this.velocity.x -= Player.prototype.dragAirX * this.velocity.x;
    }
  }

  if(Math.abs(this.velocity.x) < 0.05) {
    this.velocity.x = 0;
  }

  this.ground = false;

  this.velocity.addVectors(this.velocity, world.gravity);

  if(this.physParent) {
    this.position.addVectors(this.position, this.physParent.deltaPosition);
  }

  this.position.addVectors(this.position, this.velocity);

  this.physParent = null;

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
        if(o.nonStationary) {
          self.physParent = o;
        }
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
  cx.strokeStyle='#50b050';
  cx.strokeRect(0,0,this.size.x,this.size.y)
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
  cx.fillStyle='#606060';
  cx.translate(this.position.x - this.size.x * 0.5, this.position.y - this.size.y * 0.5);
  cx.fillRect(0,0,this.size.x,this.size.y)
  cx.strokeStyle='#808080';
  cx.strokeRect(0,0,this.size.x,this.size.y)
  cx.restore();
};

Wall.prototype.update = function (t) {};

var Platform = function (posX, posY, sizeX, sizeY) {
  this.life = 0;
  this.position = new THREE.Vector3(posX, posY, 0);
  this.origin = new THREE.Vector3(posX, posY, 0);
  this.velocity = new THREE.Vector2();
  this.size = new THREE.Vector2(sizeX, sizeY);
  this.collider = true;
  this.nonStationary = true;
  this.deltaPosition = new THREE.Vector2();
};

Platform.prototype.draw = function () {
  cx.save();
  cx.fillStyle='#606060';
  cx.translate(this.position.x - this.size.x * 0.5, this.position.y - this.size.y * 0.5);
  cx.fillRect(0,0,this.size.x,this.size.y)
  cx.restore();
};

Platform.prototype.update = function (t) {
  this.deltaPosition.copy(this.position);
  this.position.y = this.origin.y + Math.sin(this.origin.x + t * 0.001 * 0.2 * Math.TAU) * 64;
  this.deltaPosition.subVectors(this.position, this.deltaPosition);
};

var Editor = function () {
  this.position = new THREE.Vector2();
  this.mode = 0;
};

Editor.prototype.gridLines = 4;
Editor.prototype.gridPow = 3;
Editor.prototype.gridSize = 16;

Editor.prototype.update = function () {
  if(input.keys[39] === 1 || input.keys[39] > 20){
    this.position.x += this.gridSize
  }
  if(input.keys[37] === 1 || input.keys[37] > 20){
    this.position.x -= this.gridSize
  }
  if(input.keys[38] === 1 || input.keys[38] > 20){
    this.position.y += this.gridSize
  }
  if(input.keys[40] === 1 || input.keys[40] > 20){
    this.position.y -= this.gridSize
  }

  if(input.keys[88] === 1){
    this.mode = this.mode === 1 ? 0 : 1;
  }

  if(input.keys[90] === 1){
    tangentScene.add(new Wall(this.position.x|0, this.position.y|0, 16, 16));
  }

  if(input.keys[33] === 1){
    this.gridPow++;
    this.gridPow = Math.max(0, Math.min(7, this.gridPow));
  }

  if(input.keys[34] === 1){
    this.gridPow--;
    this.gridPow = Math.max(0, Math.min(7, this.gridPow));
  }

  this.gridSize = Math.pow(2, this.gridPow);

  if(input.keys[83] === 1){
    this.position.x = this.gridSize * Math.floor(this.position.x / this.gridSize);
    this.position.y = this.gridSize * Math.floor(this.position.y / this.gridSize);
  }


};

Editor.prototype.draw = function () {
  cx.save();
  cx.translate(this.position.x, this.position.y);

  cx.strokeStyle = '#a0a0a0';
  if(this.mode){
    cx.strokeStyle = '#ff8080';
  }

  for(var i=0;i<this.gridLines;i++){
    cx.beginPath();
    cx.moveTo(-this.gridSize / 2, 0);
    cx.lineTo( this.gridSize / 2, 0);
    cx.moveTo(0, -this.gridSize / 2);
    cx.lineTo(0,  this.gridSize / 2);
    cx.stroke();

    cx.strokeRect(-this.gridSize / 2, -this.gridSize / 2, this.gridSize, this.gridSize);
  }

  debug.fillText(this.position.x + ', ' + this.position.y, 10, 32);
  debug.fillText('X: mode', 10, 48);
  if(this.mode){
    debug.fillText('Z: delete', 10, 64);
  }else{
    debug.fillText('Z: place', 10, 64);
  }
  debug.fillText('S: snap', 10, 80);

  debug.fillText('Grid Size: ' + this.gridSize, 10, 96);


  cx.restore();
};

// tangentScene.add(new Wall(0, -80, 128, 16));
// tangentScene.add(new Platform(-64, -128, 64, 16));
// tangentScene.add(new Platform(-96, -128, 64, 16));


tangentScene.loadScene({"p":Platform, "w":Wall}, [
  ["w", 0, -80, 16, 16],
  ["w", 128, -80, 128, 16],

  ["w", -64, -80, 8, 16],
  ["w", -96, -80, 8, 16],
  ["w", -128, -80, 8, 16],

]);

if(false){
  var player = new Player();
  tangentScene.add(player);
}else{
  var editor = new Editor();
  tangentScene.add(editor);
}

var camera = new TANGENT.Camera();
camera.zoom = 2;

function main(t) {
  debug.clearRect(0, 0, debug.canvas.width, debug.canvas.height);
  debug.fillStyle = '#fff';

  input.update();
  tangentScene.update(t);
  tangentScene.collide();

  cx.clearRect(0, 0, cx.canvas.width, cx.canvas.height);
  cx.save();
  cx.scale(1, -1);

  if(player) {
    camera.position.x += (player.position.x - camera.position.x) / 10;
    camera.position.y += (player.position.y - camera.position.y) / 10;
  }else if(editor){
    camera.position.x += (editor.position.x - camera.position.x) / 20;
    camera.position.y += (editor.position.y - camera.position.y) / 20;
  }

  camera.frame(cx);

  tangentScene.draw();

  cx.restore();

  requestAnimationFrame(main);
}

main();

