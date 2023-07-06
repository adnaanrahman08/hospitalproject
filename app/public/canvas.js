let surfaceArea = 0;
let bodyImage;
let mask;
let brushColor = "#FFC867";
let brushSize = 50; 
let totalPixelCount = 0;
let lastMouseX, lastMouseY;
let paintCanvas;

document.addEventListener('scroll', function() {
  let pixelFromTop = window.scrollY;

  let header = document.querySelector('header');
  if (pixelFromTop > 50) {
    header.classList.add('hidden');
  } else {
    header.classList.remove('hidden');
  }
});

window.onload = function() {
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

  bodyImage.loadPixels();
  for (let i = 0; i < bodyImage.pixels.length; i += 4) {
    if (bodyImage.pixels[i+3] !== 0) { 
      totalPixelCount++;
    }
  }
  paintCanvas = createGraphics(width, height);
  paintCanvas.background(0, 0, 0);
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

  let radius = brushSize / 2;

  circle(mouseX, mouseY, radius);

  let totalArea = PI * pow(radius, 2);
  
  let xStart = max(0, mouseX - radius);
  let yStart = max(0, mouseY - radius);
  
  let xEnd = min(width, mouseX + radius);
  let yEnd = min(height, mouseY + radius);


  if (mouseX !== lastMouseX || mouseY !== lastMouseY) {
    // Load all the pixels in the paintCanvas into the paintCanvas's pixels[] array
    paintCanvas.loadPixels();

    // Loop over the area determined above
    for (let y = yStart; y < yEnd; y++) {
      for (let x = xStart; x < xEnd; x++) {

        // Calculate the index in the pixels[] array that corresponds to the current (x, y) location
        let idx = 4 * (y * width + x);

        // If the current location is within the radius of the brush marker and is a part of the mask
        if (dist(x, y, mouseX, mouseY) <= radius) {
          if (mask.pixels[idx] > 0) {
            // check all channels (RGBA) of the pixel
            if (paintCanvas.pixels[idx] == 0 && paintCanvas.pixels[idx+1] == 0 && paintCanvas.pixels[idx+2] == 0) {
              surfaceArea += totalArea / (PI * pow(radius, 2));
              // set all channels (RGBA) of the pixel to 255
              paintCanvas.pixels[idx] = 255;
              paintCanvas.pixels[idx+1] = 255;
              paintCanvas.pixels[idx+2] = 255;
              paintCanvas.pixels[idx+3] = 255;
            }
          }
        }
      }
    }
    paintCanvas.updatePixels();
  }
  
  lastMouseX = mouseX;
  lastMouseY = mouseY;

  calculateSurfaceArea();
}

const bsa = document.getElementById("bsa");

// Calculate BSA
function calculateSurfaceArea() {
  let surfaceAreaPercentage = (surfaceArea / totalPixelCount) * 100;
  bsa.innerHTML= "Body Surface Area: " + surfaceAreaPercentage.toFixed(2) + "%" + ", " + surfaceArea.toFixed(2) + " cm<sup>2</sup>";
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

// Change brush size
const brushSizeRange = document.getElementById("brushSizeRange");
const brushSizeLabel = document.getElementById("brushSizeLabel");

brushSizeLabel.textContent = brushSize;

brushSizeRange.addEventListener("input", function() {
  brushSize = parseInt(brushSizeRange.value);
  brushSizeLabel.textContent = brushSize;
});
