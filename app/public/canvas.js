document.addEventListener('scroll', function () {
  let pixelFromTop = window.scrollY;

  let header = document.querySelector('header');
  if (pixelFromTop > 50) {
    header.classList.add('hidden');
  } else {
    header.classList.remove('hidden');
  }
});

window.addEventListener("scroll", function () {
  let footer = document.getElementById("footer");
  let scrollPosition = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
  let scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight || 0;
  let windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight || 0;

  if (scrollPosition >= scrollHeight - windowHeight - 50) {
    footer.classList.remove('hidden2');
  } else {
    footer.classList.add('hidden2');
  }
});

let bodyImage;
let mask;
let brushColor = "#FFC867";
let brushSize = 50;
let coloredPixels = 0;
let totalPixels = 0;

window.onload = function () {
  document.getElementById("color-picker").value = brushColor;
};
function preload() {
  bodyImage = loadImage("./models/human-front.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  background("#D1E1FF");
  image(bodyImage, 0, 0, 600, 700);
  mask = createGraphics(width, height);
  mask.image(bodyImage, 0, 0, 600, 700);

  totalPixels = 0;
  loadPixels();
  totalPixels = 0;
  const tolerance = 20;

  for (let i = 0; i < pixels.length; i += 4) {
    let pixelR = pixels[i];
    let pixelG = pixels[i + 1];
    let pixelB = pixels[i + 2];
    let pixelA = pixels[i + 3];

    if (
      Math.abs(pixelR - 238) <= tolerance &&
      Math.abs(pixelG - 238) <= tolerance &&
      Math.abs(pixelB - 238) <= tolerance &&
      pixelA === 255
    ) {
      totalPixels++;
    }
  }
  updatePixels();
}


function draw() {
  if (mouseIsPressed) {
    marker();
    calculateSurfaceArea();
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

  let radius = brushSize / 2;

  circle(mouseX, mouseY, radius);


  let brushR = red(color(brushColor));
  let brushG = green(color(brushColor));
  let brushB = blue(color(brushColor));

  loadPixels();
  for (let i = 0; i < pixels.length; i += 4) {
    let pixelR = pixels[i];
    let pixelG = pixels[i + 1];
    let pixelB = pixels[i + 2];

    // Check if the pixel matches the brush color
    if (pixelR === brushR && pixelG === brushG && pixelB === brushB) {
      coloredPixels++;
    }
  }
  updatePixels();
}

function calculateColoredPercentage() {
  let percentage = (coloredPixels / totalPixels) * 100;
  percentage = Math.min(percentage, 100);
  return percentage.toFixed(1);
}

const bsa = document.getElementById("bsa");
function calculateSurfaceArea() {
  coloredPixels = 0;
  marker();
  let coloredPercentage = calculateColoredPercentage();
  bsa.innerHTML = "Area Percentage: " + coloredPercentage + "%";
}

// Clear the canvas
function clearCanvas() {
  background("#D1E1FF");
  image(bodyImage, 0, 0, 600, 700);

  coloredPixels = 0;
  totalPixels = 0;
  loadPixels();
  const tolerance = 10;

  for (let i = 0; i < pixels.length; i += 4) {
    let pixelR = pixels[i];
    let pixelG = pixels[i + 1];
    let pixelB = pixels[i + 2];
    let pixelA = pixels[i + 3];

    if (
      Math.abs(pixelR - 238) <= tolerance &&
      Math.abs(pixelG - 238) <= tolerance &&
      Math.abs(pixelB - 238) <= tolerance &&
      pixelA === 255
    ) {
      totalPixels++;
    }
  }
  updatePixels();

  bsa.innerHTML = "Area Percentage: ";
}

// Change colour
function changeBrushColor() {
  let colorPicker = document.getElementById("color-picker");
  brushColor = colorPicker.value;
}

// Change brush size
const brushSizeRange = document.getElementById("brushSizeRange");
const brushSizeLabel = document.getElementById("brushSizeLabel");

brushSizeLabel.textContent = brushSize;

brushSizeRange.addEventListener("input", function () {
  brushSize = parseInt(brushSizeRange.value);
  brushSizeLabel.textContent = brushSize;
});
