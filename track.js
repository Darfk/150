var Track = function () {
  this.a = new Audio();
  this.a.src = 'wing.ogg';
  this.a.volume = 0.1;
  //this.a.play();
  this.bpm = 112.0;
  this.offset = -0.0;

  tangentScene.listen(this, "track:play", function () {
    this.a.play();
  });

  tangentScene.listen(this, "track:stop", function () {
    this.a.pause();
    this.a.currentTime = 0;
  });
};

Track.prototype.type = 'track';

Track.prototype.destroy = function () {
  this.a.pause();
  delete this.a;
};

Track.prototype.draw = function () {
  if(this.a.played.length > 0){

    if(this.startBeat){
      debug.fillStyle="#ffffff";
      if(this.startBar)
        debug.fillStyle="#ff0000";
      debug.fillRect(0, 0, 10, 10);
    }
    debug.fillStyle="#ffffff";
    debug.fillText(this.bar+':'+this.beat, 10,++debug.textLineNumber*debug.textLineHeight);
    debug.fillText(this.a.currentTime.toFixed(2), 10,++debug.textLineNumber*debug.textLineHeight);
  }
};

Track.prototype.update = function (t) {
  if(this.a.played.length > 0) {
    this.cur = this.a.currentTime;
    this.beatClamp = ((this.cur + this.offset) * (this.bpm / 60.0)) % 1;
    this.barClamp = ((this.cur + this.offset) * (this.bpm / 60.0)) / 4 % 1;
    this.beat = Math.floor((this.cur + this.offset) * (this.bpm / 60.0)) + 1;
    this.startBeat = this.prevBeat !== this.beat;
    this.prevBeat = this.beat;
    this.barBeat = this.beat % 4 + 1;
    this.bar = Math.floor(((this.beat - 1) / 4 + 1));
    this.startBar = this.prevBar !== this.bar;
    this.prevBar = this.bar;
  }
};
