var Player = function(x, y) {
  this.velocity = new THREE.Vector2();
  this.position = new THREE.Vector2(x, y);
  this.size = new THREE.Vector2(12, 16);
  this.rayDown = new TANGENT.Ray(new THREE.Vector2(), TANGENT.RayDirection.DOWN, 8);
  this.boxCollider = new TANGENT.BoxCollider(new THREE.Vector2(),
                                              new THREE.Vector2(this.size.x, this.size.y));
  this.physParent = null;
  this.coin = 0;
};

Player.prototype.type = 'player';
Player.prototype.thrustX = 0.2;
Player.prototype.thrustAirX = 0.1;
Player.prototype.thrustJump = 4;
Player.prototype.thrustEnemyJump = 6;
Player.prototype.thrustEnemyBonk = 3;
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
    this.velocity.y += this.thrustJump;
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

    if(o.type === 'jumppad') {

      if(Math.abs(y) <= Math.abs(x) && y > 0){
        o.jumpedOn = true;
        if(input.keys[90]){
          self.velocity.y = self.thrustEnemyJump;
        }else{
          self.velocity.y = self.thrustEnemyBonk;
        }
      }

    }else if(o.type === 'coin') {

      self.coin ++;
      o.trash = true;

    }else{

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
        }
      }

   }

    self.boxCollider.position.x = self.position.x;
    self.boxCollider.position.y = self.position.y;
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
