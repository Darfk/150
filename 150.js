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
  //console.log(e.keyCode);
};

document.body.onkeyup = function (e) {
  input.keyRelease(e.keyCode);
};

var world = {
  gravity: new THREE.Vector2(0, -0.2),
};

// tangentScene.add(new Wall(0, -80, 128, 16));
// tangentScene.add(new Platform(-64, -128, 64, 16));
// tangentScene.add(new Platform(-96, -128, 64, 16));

tangentScene.registerEntityTypes([Wall, JumpPad, Coin, Platform]);

// tangentScene.add(new JumpPad(0, -64));
// tangentScene.add(new JumpPad(64, -64));

// tangentScene.add(new Wall(0, -80, 128, 8));

var camera = new TANGENT.Camera();
camera.zoom = 4;

var mode = 0, player, editor;

function switchMode() {
    mode = mode === 0 ? 1 : 0;
    tangentScene.entities = [];

    if(mode){
      if(typeof localStorage.level !== "undefined"){
        tangentScene.loadScene(JSON.parse(localStorage.level));
      }
      console.log("loaded");
      player = new Player();
      tangentScene.add(player);
    }else{
      if(typeof localStorage.level !== "undefined"){
        tangentScene.loadScene(JSON.parse(localStorage.level));
      }
      editor = new Editor();
      tangentScene.add(editor);
    }
}

switchMode();

function main(t) {
  debug.clearRect(0, 0, debug.canvas.width, debug.canvas.height);
  debug.fillStyle = '#fff';

  if(mode){
    debug.fillText("P: Switch to editor", 10, 16);
  }else{
    debug.fillText("P: Switch to game", 10, 16);
  }

  input.update();

  if(input.keys[80] === 1){
    switchMode();
  }

  tangentScene.update(t);
  tangentScene.collide();

  tangentScene.destroy();

  cx.clearRect(0, 0, cx.canvas.width, cx.canvas.height);
  cx.save();
  cx.scale(1, -1);

  if(mode) {
    camera.position.x += (player.position.x - camera.position.x) / 10;
    camera.position.y += (player.position.y - camera.position.y) / 10;
  }else{
    camera.position.x += (editor.position.x - camera.position.x) / 20;
    camera.position.y += (editor.position.y - camera.position.y) / 20;
  }

  camera.frame(cx);

  tangentScene.draw();

  cx.restore();

  requestAnimationFrame(main);
}

main();

