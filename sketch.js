const density =
  '零壱弐参肆伍陸漆捌玖電脳機械東京未来夜夢界光闇雨風火水空アイウエオカキクケコサシスセソ ';

let gifs = [];
let gifNames = [];

let currentGif = 0;

let buffer;
let menuVisible = true;

const gifFiles = [
  'assets/akira.gif',
  'assets/tetsuo.gif',
  'assets/cyclops.gif',
  'assets/magneto.gif',
  'assets/ghost in a shell.gif',
  'assets/death note.gif',
];

// --- touch / mouse press tracking (shared by tap + swipe detection) ---
let pressStartX = 0;
let pressStartY = 0;
let pressLastX = 0;
let pressLastY = 0;

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

  let cnv = createCanvas(windowWidth, windowHeight);

  // skip retina-resolution rendering — keeps frame rate smooth on phones
  pixelDensity(1);

  // stop the page from scrolling / pinch-zooming while the
  // user is swiping or tapping on the canvas
  cnv.elt.style.touchAction = 'none';
  document.body.style.overscrollBehavior = 'none';

  frameRate(24);

  textFont('monospace');
  textStyle(BOLD);
  textAlign(LEFT, TOP);

  noStroke();

  buffer = createGraphics(750, 393);
}

function draw() {

  background(0);

  drawAsciiGif(gifs[currentGif]);

  drawScanlines();

  if (menuVisible) {
    drawMenu();
  }

  drawMenuToggle();
}

function drawAsciiGif(gif) {

  const gifAspect = buffer.width / buffer.height;

  // fewer, bigger characters on small screens — keeps the image
  // legible on phones and keeps the per-frame char count light
  const cols = constrain(floor(width / 9), 40, 130);
  const rows = floor(cols / gifAspect);

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

  // spacing (character cell size) is derived from the canvas size,
  // so the whole grid always fits the screen, on any device
  const spacing = min(width / cols, height / rows);

  const asciiWidth = cols * spacing;
  const asciiHeight = rows * spacing;

  const offsetX = (width - asciiWidth) / 2;
  const offsetY = (height - asciiHeight) / 2;

  textSize(spacing);

  for (let row = 0; row < rows; row++) {

    const sampleY = floor(
      map(row, 0, rows, 0, buffer.height)
    );

    for (let col = 0; col < cols; col++) {

      const sampleX = floor(
        map(col, 0, cols, 0, buffer.width)
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
        offsetX + col * spacing,
        offsetY + row * spacing
      );
    }
  }
}

// ---------- menu ----------

function getMenuLayout() {

  const isSmall = width < 500;

  const x = 20;
  const y = 20;
  const w = min(isSmall ? width - 80 : 280, width - 40);
  const itemHeight = isSmall ? 42 : 32;
  const fontSize = isSmall ? 15 : 16;
  const topPadding = 40;
  const bottomPadding = 60;
  const h = gifNames.length * itemHeight + topPadding + bottomPadding;

  return { x, y, w, h, itemHeight, fontSize, topPadding };
}

function drawMenu() {

  push();

  const m = getMenuLayout();

  fill(0, 190);
  rect(m.x, m.y, m.w, m.h, 6);

  textSize(m.fontSize);

  for (let i = 0; i < gifNames.length; i++) {

    const itemY = m.y + m.topPadding + i * m.itemHeight;

    if (i === currentGif) {
      fill(0, 255, 180);
      text("> " + gifNames[i], m.x + 20, itemY);
    } else {
      fill(180);
      text(gifNames[i], m.x + 20, itemY);
    }
  }

  fill(120);
  textSize(12);

  text(
    "[ SWIPE / ARROWS ] change",
    m.x + 20,
    m.y + m.h - 38
  );

  text(
    "[ TAP AN ITEM ] select",
    m.x + 20,
    m.y + m.h - 18
  );

  pop();
}

function getToggleLayout() {

  const size = 44; // comfortable touch target
  const margin = 16;

  return {
    x: width - margin - size,
    y: margin,
    size
  };
}

function drawMenuToggle() {

  push();

  const t = getToggleLayout();

  fill(0, 190);
  rect(t.x, t.y, t.size, t.size, 8);

  stroke(0, 255, 180);
  strokeWeight(2);

  const lineW = t.size * 0.5;
  const lineX = t.x + (t.size - lineW) / 2;
  const cy = t.y + t.size / 2;

  line(lineX, cy - 8, lineX + lineW, cy - 8);
  line(lineX, cy, lineX + lineW, cy);
  line(lineX, cy + 8, lineX + lineW, cy + 8);

  pop();
}

function isInsideRect(px, py, rx, ry, rw, rh) {
  return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
}

function getMenuItemAt(px, py) {

  if (!menuVisible) return -1;

  const m = getMenuLayout();

  if (!isInsideRect(px, py, m.x, m.y, m.w, m.h)) return -1;

  for (let i = 0; i < gifNames.length; i++) {

    const itemTop = m.y + m.topPadding + i * m.itemHeight;

    if (py >= itemTop && py < itemTop + m.itemHeight) {
      return i;
    }
  }

  return -1;
}

// ---------- navigation ----------

function nextGif() {
  currentGif++;
  if (currentGif >= gifs.length) {
    currentGif = 0;
  }
}

function prevGif() {
  currentGif--;
  if (currentGif < 0) {
    currentGif = gifs.length - 1;
  }
}

function toggleMenu() {
  menuVisible = !menuVisible;
}

function drawScanlines() {

  stroke(255, 15);

  for (let y = 0; y < height; y += 3) {
    line(0, y, width, y);
  }

  noStroke();
}

// ---------- input: keyboard (desktop) ----------

function keyPressed() {

  if (keyCode === DOWN_ARROW) {
    nextGif();
  }

  if (keyCode === UP_ARROW) {
    prevGif();
  }

  if (key === 'm' || key === 'M') {
    toggleMenu();
  }
}

// ---------- input: touch & mouse (taps + swipes) ----------

function handlePressStart(x, y) {
  pressStartX = x;
  pressStartY = y;
  pressLastX = x;
  pressLastY = y;
}

function handlePressMove(x, y) {
  pressLastX = x;
  pressLastY = y;
}

function handlePressEnd() {

  const dx = pressLastX - pressStartX;
  const dy = pressLastY - pressStartY;

  const swipeThreshold = 40;

  // a clear horizontal swipe changes the gif, like the arrow keys
  if (abs(dx) > swipeThreshold && abs(dx) > abs(dy)) {
    if (dx < 0) {
      nextGif();
    } else {
      prevGif();
    }
    return;
  }

  // otherwise treat the press as a tap
  const t = getToggleLayout();

  if (isInsideRect(pressStartX, pressStartY, t.x, t.y, t.size, t.size)) {
    toggleMenu();
    return;
  }

  const tappedItem = getMenuItemAt(pressStartX, pressStartY);

  if (tappedItem !== -1) {
    currentGif = tappedItem;
    return;
  }

  // tapped elsewhere: dismiss the menu so the art is unobstructed
  if (menuVisible) {
    menuVisible = false;
  }
}

function touchStarted() {
  if (touches.length > 0) {
    handlePressStart(touches[0].x, touches[0].y);
  } else {
    handlePressStart(mouseX, mouseY);
  }
  return false; // prevent default scroll/zoom
}

function touchMoved() {
  if (touches.length > 0) {
    handlePressMove(touches[0].x, touches[0].y);
  }
  return false;
}

function touchEnded() {
  handlePressEnd();
  return false;
}

function mousePressed() {
  handlePressStart(mouseX, mouseY);
}

function mouseDragged() {
  handlePressMove(mouseX, mouseY);
}

function mouseReleased() {
  handlePressEnd();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
