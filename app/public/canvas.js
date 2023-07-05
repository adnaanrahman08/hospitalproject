let surfaceArea = 0;
let bodyImage;
let mask;
let brushColor = "#FFC867";

function preload() {
  bodyImage = loadImage("./models/human-front.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  background("#D1E1FF");
  image(bodyImage, 0, 0, 600, 700);
  mask = createGraphics(width, height);
  mask.image(bodyImage, 0, 0, 600, 700);
}

function draw() {
  if (mouseIsPressed) {
    marker();
  }
}

function marker() {
  loadPixels();
  mask.loadPixels();
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i + 3] = mask.pixels[i];
  }
  updatePixels();
  fill(brushColor);
  noStroke();

  circle(mouseX, mouseY, 50);

  if (mouseX >= 0 && mouseX < width && mouseY >= 0 && mouseY < height) {
    surfaceArea += PI * pow(25, 2);
  }
}

const bsa = document.getElementById("bsa");

// Calculate BSA
function calculateSurfaceArea() {
  bsa.innerHTML= "Body Surface Area: " + surfaceArea.toFixed(2);
}

// Clear the canvas
function clearCanvas() {
  background("#D1E1FF");
  image(bodyImage, 0, 0, 600, 700);

  surfaceArea = 0;

  bsa.innerHTML = "Body Surface Area: ";
}

// Change colour
function changeBrushColor() {
  let colorPicker = document.getElementById("color-picker");
  brushColor = colorPicker.value;
}
