var Coin = function (posX, posY) {
  this.position = new THREE.Vector3(posX, posY, 0);
  this.size = new THREE.Vector2(4, 4);
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
  cx.translate(this.position.x, this.position.y);
  cx.beginPath();
  cx.arc(0, 0, this.size.x * 0.5, 0, 2 * Math.PI, false);
  cx.fill();
  cx.restore();
};

Coin.prototype.update = function (t) {
  this.glimmer = Math.random()>0.99;
};
