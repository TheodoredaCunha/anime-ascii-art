const density =
'零壱弐参肆伍陸漆捌玖電脳機械東京未来夜夢界光闇雨風火水空アイウエオカキクケコサシスセソ0123456789 ';

let gifs = [];
let gifNames = [];

let currentGif = 0;

let buffer;
let menuVisible = true;

const gifFiles = [
  'assets/akira.gif',
  'assets/akira2.gif',
  'assets/eva.gif',
  'assets/eva2.gif',
  'assets/gias.gif',
  'assets/gias2.gif',
  'assets/psycho pass.gif'
];

function preload() {

  for (let path of gifFiles) {

    gifs.push(loadImage(path));

    // clean menu names
    let name = path
      .replace('assets/', '')
      .replace('.gif', '');

    gifNames.push(name);
  }
}

function setup() {

  createCanvas(windowWidth, windowHeight);

  frameRate(24);

  textFont('monospace');
  textStyle(BOLD);

  noStroke();

  buffer = createGraphics(500, 262);
}

function draw() {

  background(0);

  drawAsciiGif(gifs[currentGif]);

  drawScanlines();

  if (menuVisible) {
    drawMenu();
  }
}

function drawAsciiGif(gif) {

  const scaleFactor = 0.5;

  const gifW = floor(buffer.width * scaleFactor);
  const gifH = floor(buffer.height * scaleFactor);

  const spacing = 8;
  const step = 2;

  const brightnessBoost = 1.2;
  const contrast = 1.25;

  buffer.clear();

  buffer.image(
    gif,
    0,
    0,
    buffer.width,
    buffer.height
  );

  buffer.loadPixels();

  const asciiWidth = (gifW / step) * spacing;
  const asciiHeight = (gifH / step) * spacing;

  const offsetX = (width - asciiWidth) / 2;
  const offsetY = (height - asciiHeight) / 2;

  textSize(spacing);

  for (let y = 0; y < gifH; y += step) {

    for (let x = 0; x < gifW; x += step) {

      const sampleX = floor(
        map(x, 0, gifW, 0, buffer.width)
      );

      const sampleY = floor(
        map(y, 0, gifH, 0, buffer.height)
      );

      const pixelIndex =
        (sampleY * buffer.width + sampleX) * 4;

      let r = buffer.pixels[pixelIndex];
      let g = buffer.pixels[pixelIndex + 1];
      let b = buffer.pixels[pixelIndex + 2];

      r *= brightnessBoost;
      g *= brightnessBoost;
      b *= brightnessBoost;

      r = ((r - 128) * contrast) + 128;
      g = ((g - 128) * contrast) + 128;
      b = ((b - 128) * contrast) + 128;

      r = constrain(r, 0, 255);
      g = constrain(g, 0, 255);
      b = constrain(b, 0, 255);

      const avg = (r + g + b) / 3;

      const charIndex = floor(
        map(avg, 0, 255, density.length - 1, 0)
      );

      const c = density.charAt(charIndex);

      fill(r, g, b, 240);

      text(
        c,
        offsetX + (x / step) * spacing,
        offsetY + (y / step) * spacing
      );
    }
  }
}

function drawMenu() {

  push();

  fill(0, 180);
  rect(20, 20, 260, gifNames.length * 28 + 50);

  textSize(16);

  for (let i = 0; i < gifNames.length; i++) {

    if (i === currentGif) {
      fill(0, 255, 180);
      text("> " + gifNames[i], 40, 60 + i * 28);
    } else {
      fill(180);
      text(gifNames[i], 40, 60 + i * 28);
    }
  }

  fill(120);
  textSize(12);

  text(
    "[ UP / DOWN ] select",
    40,
    height - 60
  );

  text(
    "[ M ] toggle menu",
    40,
    height - 40
  );

  pop();
}

function drawScanlines() {

  stroke(255, 15);

  for (let y = 0; y < height; y += 3) {
    line(0, y, width, y);
  }

  noStroke();
}

function keyPressed() {

  if (keyCode === DOWN_ARROW) {

    currentGif++;

    if (currentGif >= gifs.length) {
      currentGif = 0;
    }
  }

  if (keyCode === UP_ARROW) {

    currentGif--;

    if (currentGif < 0) {
      currentGif = gifs.length - 1;
    }
  }

  if (key === 'm' || key === 'M') {
    menuVisible = !menuVisible;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}