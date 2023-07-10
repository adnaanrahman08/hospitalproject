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

let bodyParts = [
  { name: 'Face & Neck', color: [214, 131, 131], totalPixels: 0, originalTotalPixels: 0 },
  { name: 'Trunk', color: [238, 238, 238], totalPixels: 0, originalTotalPixels: 0 },
  { name: 'Both Arms', color: [255, 226, 209], totalPixels: 0, originalTotalPixels: 0 },
  { name: 'Both Hands', color: [107, 171, 144], totalPixels: 0, originalTotalPixels: 0 },
  { name: 'Both Legs', color: [234, 171, 154], totalPixels: 0, originalTotalPixels: 0 },
  { name: 'Feet', color: [127, 154, 229], totalPixels: 0, originalTotalPixels: 0 },
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
  calculateTotalPixels()
}

function calculateOriginalTotalPixels() {
  const tolerance = 10;

  loadPixels();

  for (const bodyPart of bodyParts) {
    bodyPart.originalTotalPixels = 0;

    for (let i = 0; i < pixels.length; i += 4) {
      let pixelR = pixels[i];
      let pixelG = pixels[i + 1];
      let pixelB = pixels[i + 2];

      if (
        Math.abs(pixelR - bodyPart.color[0]) <= tolerance &&
        Math.abs(pixelG - bodyPart.color[1]) <= tolerance &&
        Math.abs(pixelB - bodyPart.color[2]) <= tolerance
      ) {
        bodyPart.originalTotalPixels++;
      }
    }
  }
  updatePixels();
}

function calculateTotalPixels() {
  const tolerance = 10;

  loadPixels();

  for (const bodyPart of bodyParts) {
    bodyPart.totalPixels = 0; 

    for (let i = 0; i < pixels.length; i += 4) {
      let pixelR = pixels[i];
      let pixelG = pixels[i + 1];
      let pixelB = pixels[i + 2];

      if (
        Math.abs(pixelR - bodyPart.color[0]) <= tolerance &&
        Math.abs(pixelG - bodyPart.color[1]) <= tolerance &&
        Math.abs(pixelB - bodyPart.color[2]) <= tolerance
      ) {
        bodyPart.totalPixels++;
      }
    }
  }
  updatePixels();
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
}

// Clear the canvas
function clearCanvas() {
  background("#D1E1FF");
  image(bodyImage, 0, 0, 300, 700);

  loadPixels();
  calculateTotalPixels();

  for (const bodyPart of bodyParts) {
    bodyPart.totalPixels = bodyPart.originalTotalPixels;
  }

  updatePixels();
  calculateRemainingPixels();
  populateTable();
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

function updateTable() {
  calculateTotalPixels();
  calculateRemainingPixels();
  populateTable();
}

function calculateRemainingPixels() {
  for (const bodyPart of bodyParts) {
    const remainingPixels = bodyPart.originalTotalPixels - bodyPart.totalPixels;
    bodyPart.remainingPixels = remainingPixels;

    let percentage = (remainingPixels / bodyPart.originalTotalPixels) * 100;
    percentage = Math.max(0, percentage);
    bodyPart.remainingPercentage = percentage.toFixed(1) + '%';
  }
}

const genderRadios = document.getElementsByName("gender");
genderRadios.forEach((radio) => {
  radio.addEventListener("change", populateTable);
});

function populateTable() {
  const tableBody = document.querySelector('#data-table tbody');

  tableBody.innerHTML = '';

  bodyParts.forEach((part) => {
    const newRow = document.createElement('tr');
    const bodyPartCell = document.createElement('td');
    const percentageCell = document.createElement('td');
    const ftuCell = document.createElement('td');
    const tcsCell = document.createElement('td');

    bodyPartCell.textContent = part.name;
    percentageCell.textContent = part.remainingPercentage;

    let ftuValue = 0;
    let tcsValue = 0;
    const selectedGender = document.querySelector('input[name="gender"]:checked').value;

    // Calculate ftu and tcs based on body part
    if (part.name === 'Trunk') {
      ftuValue = (parseFloat(part.remainingPercentage) / 100) * 7;
      if (selectedGender === "male") {
        tcsValue = ftuValue * 0.5;
      } else if (selectedGender === "female") {
        tcsValue = ftuValue * 0.4;
      }
    } else if (part.name === 'Both Arms') {
      ftuValue = (parseFloat(part.remainingPercentage) / 100) * 6;
      if (selectedGender === "male") {
        tcsValue = ftuValue * 0.5;
      } else if (selectedGender === "female") {
        tcsValue = ftuValue * 0.4;
      }
    } else if (part.name === 'Both Hands') {
      ftuValue = (parseFloat(part.remainingPercentage) / 100) * 2;
      if (selectedGender === "male") {
        tcsValue = ftuValue * 0.5;
      } else if (selectedGender === "female") {
        tcsValue = ftuValue * 0.4;
      }
    } else if (part.name === 'Both Legs') {
      ftuValue = (parseFloat(part.remainingPercentage) / 100) * 12;
      if (selectedGender === "male") {
        tcsValue = ftuValue * 0.5;
      } else if (selectedGender === "female") {
        tcsValue = ftuValue * 0.4;
      }
    } else if (part.name === 'Feet') {
      ftuValue = (parseFloat(part.remainingPercentage) / 100) * 4;
      if (selectedGender === "male") {
        tcsValue = ftuValue * 0.5;
      } else if (selectedGender === "female") {
        tcsValue = ftuValue * 0.4;
      }
    } else if (part.name === 'Face & Neck') {
      ftuValue = (parseFloat(part.remainingPercentage) / 100) * 2.5;
      if (selectedGender === "male") {
        tcsValue = ftuValue * 0.5;
      } else if (selectedGender === "female") {
        tcsValue = ftuValue * 0.4;
      }
    }

    ftuCell.textContent = ftuValue.toFixed(1);
    tcsCell.textContent = tcsValue.toFixed(2);

    newRow.appendChild(bodyPartCell);
    newRow.appendChild(percentageCell);
    newRow.appendChild(ftuCell);
    newRow.appendChild(tcsCell);

    tableBody.appendChild(newRow);
  });
}

window.addEventListener('DOMContentLoaded', function () {
  calculateRemainingPixels();
  populateTable();
});
