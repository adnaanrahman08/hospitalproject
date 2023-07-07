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

let polygonPoints = [];
let isDrawingPolygon = false;

// Add event listener for button click
document.getElementById('addPolygonPoints').addEventListener('click', function () {
  // Toggle isDrawingPolygon variable
  isDrawingPolygon = !isDrawingPolygon;
});

// Register mouse click to add polygon points
function mouseClicked() {
  // If we are in polygon drawing mode, add a new vertex to the polygon
  if (isDrawingPolygon) {
    // Check if mouse is within the canvas
    if(mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
      // Add clicked point to polygon points array
      polygonPoints.push({ x: mouseX, y: mouseY });
    }
  }
}

// Save polygon points to a file on button click
document.getElementById('savePolygonPoints').addEventListener('click', function () {
  savePolygonPoints();
});

// Save polygon points to a file
function savePolygonPoints() {
  // Convert polygon points array to string
  let data = JSON.stringify(polygonPoints, null, 2);

  // Create a blob of the data
  let file = new Blob([data], { type: 'text/plain' });

  // Create a link for our script to 'click'
  let a = document.createElement('a');
  a.href = URL.createObjectURL(file);
  a.download = 'polygon_points.txt';

  // Trigger the download
  a.click();
}

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
  // Always draw the body image at the start of each frame
  image(bodyImage, 0, 0, 600, 700);

  if (mouseIsPressed) {
    // If we are not in polygon drawing mode, draw with the marker.
    if (!isDrawingPolygon) {
      fill(brushColor);
      circle(mouseX, mouseY, brushSize);
    }
  }
  

  // If we are in polygon drawing mode, draw the polygon
  if (isDrawingPolygon) {
    drawPolygon();
  }
}



function drawPolygon() {
  // Draw a point at each polygon vertex
  for (let point of polygonPoints) {
    ellipse(point.x, point.y, 5, 5);  // Draws a small circle at (x, y)
  }

  // Set stroke color and weight
  stroke(255, 0, 0); // Red color
  strokeWeight(2); // 2 pixels wide

  // No fill for the polygon
  noFill();

  // Draw lines between the polygon vertices
  if (polygonPoints.length > 1) {
    beginShape();
    for (let point of polygonPoints) {
      vertex(point.x, point.y);
    }
    if (!isDrawingPolygon) { // if drawing completed then close the polygon
      endShape(CLOSE);
    } else {
      endShape();
    }
  }


  // Re-enable fill for other drawing
  fill(255);

  // Reset stroke color and weight to default
  stroke(0); // Black color
  strokeWeight(1); // 1 pixel wide
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


  let tolerance = 10;

  let brushR = red(color(brushColor));
  let brushG = green(color(brushColor));
  let brushB = blue(color(brushColor));

  loadPixels();
  for (let i = 0; i < pixels.length; i += 4) {
    let pixelR = pixels[i];
    let pixelG = pixels[i + 1];
    let pixelB = pixels[i + 2];

    if (
      Math.abs(pixelR - brushR) <= tolerance &&
      Math.abs(pixelG - brushG) <= tolerance &&
      Math.abs(pixelB - brushB) <= tolerance
    ) {
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
