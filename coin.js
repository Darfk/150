var Coin = function (posX, posY) {
  this.position = new THREE.Vector3(posX, posY, 0);
  this.size = new THREE.Vector2(8, 8);
  this.collider = true;
};

Coin.prototype.type = 'coin';
Coin.prototype.serialize = function () {
  return [
    this.type,
    this.position.x,
    this.position.y
  ];
};

Coin.prototype.draw = function () {
  cx.save();
  cx.fillStyle='#8042e0';
  // Divide this by 2, hehe
  if(this.glimmer) {
    cx.fillStyle='#ffffff';
  }
  cx.translate(this.position.x - this.size.x * 0.5, this.position.y - this.size.y * 0.5);
  cx.fillRect(0,0,this.size.x,this.size.y)
  cx.restore();
};

Coin.prototype.update = function (t) {
  this.glimmer = Math.random()>0.99;
};
