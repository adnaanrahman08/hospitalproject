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

let bodyParts = [
  { name: 'Arms', color: [255, 226, 209], coloredPixels: 0, totalPixels: 0, originalTotalPixels: 0 },
  { name: 'Head', color: [214, 131, 131], coloredPixels: 0, totalPixels: 0, originalTotalPixels: 0 },
  { name: 'Legs', color: [202, 196, 206], coloredPixels: 0, totalPixels: 0, originalTotalPixels: 0 },
  { name: 'Chest', color: [238, 238, 238], coloredPixels: 0, totalPixels: 0, originalTotalPixels: 0 },
];

window.onload = function () {
  document.getElementById("color-picker").value = brushColor;
};
function preload() {
  bodyImage = loadImage("./models/human-front.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  background("#D1E1FF");
  image(bodyImage, 0, 0, 300, 700);
  mask = createGraphics(width, height);
  mask.image(bodyImage, 0, 0, 300, 700);
  calculateOriginalTotalPixels();
  calculateTotalPixels();
  logTotalPixels();
}

function calculateOriginalTotalPixels() {
  const tolerance = 10;

  for (const bodyPart of bodyParts) {
    let partPixels = 0;

    for (let i = 0; i < bodyImage.width; i++) {
      for (let j = 0; j < bodyImage.height; j++) {
        const pixelColor = bodyImage.get(i, j);

        if (
          Math.abs(pixelColor[0] - bodyPart.color[0]) <= tolerance &&
          Math.abs(pixelColor[1] - bodyPart.color[1]) <= tolerance &&
          Math.abs(pixelColor[2] - bodyPart.color[2]) <= tolerance
        ) {
          partPixels++;
        }
      }
    }

    bodyPart.originalTotalPixels = partPixels;
  }
}

function calculateTotalPixels() {
  const tolerance = 10;

  for (const bodyPart of bodyParts) {
    let partPixels = 0;

    for (let i = 0; i < bodyImage.width; i++) {
      for (let j = 0; j < bodyImage.height; j++) {
        const pixelColor = bodyImage.get(i, j);

        if (
          Math.abs(pixelColor[0] - bodyPart.color[0]) <= tolerance &&
          Math.abs(pixelColor[1] - bodyPart.color[1]) <= tolerance &&
          Math.abs(pixelColor[2] - bodyPart.color[2]) <= tolerance
        ) {
          partPixels++;
        }
      }
    }

    bodyPart.totalPixels = partPixels;
  }
}

function calculateRemainingPixels() {
  for (const bodyPart of bodyParts) {
    const remainingPixels = bodyPart.originalTotalPixels - bodyPart.totalPixels;
    bodyPart.remainingPixels = remainingPixels;

    console.log(`Remaining pixels for ${bodyPart.name}:`, remainingPixels);
    console.log(`Original pixels for ${bodyPart.name}:`, bodyPart.originalTotalPixels);
    console.log(`Total pixels for ${bodyPart.name}:`, bodyPart.totalPixels);
  }
}

function logTotalPixels() {
  bodyParts.forEach((part) => {
    console.log(`Total pixels for ${part.name}:`, part.totalPixels);
  });
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

function calculateColoredPercentage(part) {
  let percentage = (part.coloredPixels / part.totalPixels) * 100;
  percentage = Math.min(percentage, 100);
  return percentage.toFixed(1) + '%';
}

const bsa = document.getElementById("bsa");

function calculateSurfaceArea() {
  calculateTotalPixels();
  calculateRemainingPixels();
  populateTable();
}

// Clear the canvas
function clearCanvas() {
  background("#D1E1FF");
  image(bodyImage, 0, 0, 300, 700);

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

// Define sample data
const tableData = [
  { bodyPart: 'Left Arm', percentage: '0%', ftu: '0', tcs: '0' },
];

function updateTable() {
  calculateTotalPixels();
  calculateRemainingPixels();
  populateTable();
}

// Function to populate the table
function populateTable() {
  const tableBody = document.querySelector('#data-table tbody');

  tableBody.innerHTML = '';

  bodyParts.forEach((part) => {
    const newRow = document.createElement('tr');
    const bodyPartCell = document.createElement('td');
    const percentageCell = document.createElement('td');

    const remainingPercentage = (part.remainingPixels / part.originalColoredPixels) * 100;
    part.remainingPercentage = Math.max(0, remainingPercentage).toFixed(1) + '%';

    bodyPartCell.textContent = part.name;
    percentageCell.textContent = part.remainingPercentage;

    newRow.appendChild(bodyPartCell);
    newRow.appendChild(percentageCell);

    tableBody.appendChild(newRow);
  });
}

// Call the populateTable function when the page loads
window.addEventListener('DOMContentLoaded', populateTable);
