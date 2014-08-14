var Editor = function () {
  this.position = new THREE.Vector2();
  this.mode = 0;
  this.spawnEntity = null;
  this.spawnEntityIdx = 0;

  this.spawnEntityEnum = [];
  for(var i in tangentScene.entityMap) {
    this.spawnEntityEnum.push(i);
  }

  this.spawnEntity = tangentScene.createEntity(
    this.spawnEntityEnum[this.spawnEntityIdx],
    [this.position.x, this.position.y, 8, 8]
  );

};

Editor.prototype.gridLines = 4;
Editor.prototype.gridPow = 3;
Editor.prototype.gridSize = 8;

Editor.prototype.update = function () {

  if(input.keys[65] === 1 && this.mode === 0){
    this.spawnEntityIdx = (this.spawnEntityIdx - 1).wrap(this.spawnEntityEnum.length);
    this.spawnEntity = tangentScene.createEntity(
      this.spawnEntityEnum[this.spawnEntityIdx],
      [this.position.x, this.position.y, 8, 8]
    );
  }

  if(input.keys[83] === 1 && this.mode === 0){
    this.spawnEntityIdx = (this.spawnEntityIdx + 1).wrap(this.spawnEntityEnum.length);
    this.spawnEntity = tangentScene.createEntity(
      this.spawnEntityEnum[this.spawnEntityIdx],
      [this.position.x, this.position.y, 8, 8]
    );
  }

  if(input.keys[79] === 1) {
    localStorage.setItem("level", JSON.stringify(tangentScene.serialize()))
    console.log("saved");
  }    

  if(input.keys[73] === 1) {
    console.log();
    if(typeof localStorage.level !== "undefined"){
      tangentScene.loadScene(JSON.parse(localStorage.level));
      tangentScene.add(new Editor());
      console.log("loaded");
    }
  }    

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
    tangentScene.add(tangentScene.createEntity(
      this.spawnEntityEnum[this.spawnEntityIdx],
      [this.position.x, this.position.y, 8, 8]
    ));
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

  if(input.keys[81] === 1){
    this.position.x = this.gridSize * Math.floor(this.position.x / this.gridSize);
    this.position.y = this.gridSize * Math.floor(this.position.y / this.gridSize);
  }
};

Editor.prototype.draw = function () {

  if(this.spawnEntity) {
    this.spawnEntity.position.x = this.position.x;
    this.spawnEntity.position.y = this.position.y;
    cx.save();
    cx.globalAlpha = 0.5;
    this.spawnEntity.draw();
    cx.restore();
  }

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
    //cx.strokeRect(-this.gridSize / 2, -this.gridSize / 2, this.gridSize, this.gridSize);
  }

  debug.fillText(this.position.x + ', ' + this.position.y, 10, 32);
  debug.fillText('M: mode', 10, 48);
  if(this.mode){
    debug.fillText('Z: delete', 10, 64);
  }else{
    debug.fillText('Z: place ' + this.spawnEntityEnum[this.spawnEntityIdx], 10, 64);
  }
  debug.fillText('A/S: prev/next entity', 10, 80);

  debug.fillText('Q: snap grid', 10, 96);

  debug.fillText('Grid Size: ' + this.gridSize, 10, 112);


  cx.restore();
};
