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

let isNoteDragging = false;

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
  if (mouseIsPressed && !isNoteDragging) {
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

// Clear the canvas
function clearCanvas() {
  background("#D1E1FF");
  image(bodyImage, 0, 0, 300, 700);

  coloredPixels = 0;
  let totalPixels = 0;
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
  let tableContent = '';

  for (const bodyPart of bodyParts) {
    const remainingPercentage = ((bodyPart.remainingPixels / bodyPart.originalTotalPixels) * 100).toFixed(1) + '%';

    tableContent += `<tr>
      <td>${bodyPart.name}</td>
      <td>${remainingPercentage}</td>
    </tr>`;
  }

  tableBody.innerHTML = tableContent;
}

// Call the populateTable function when the page loads
window.addEventListener('DOMContentLoaded', populateTable);

// Add note button click event
const addNoteButton = document.getElementById('add-note-button');
addNoteButton.addEventListener('click', () => {
  createNote();
});

function createNote() {
  // Create note element
  const note = document.createElement('div');
  note.classList.add('note');

  // Create close button
  const closeButton = document.createElement('span');
  closeButton.classList.add('close-button');
  closeButton.innerHTML = '&#10006;'; // X icon
  closeButton.addEventListener('click', () => {
    note.remove(); // Remove the note when the close button is clicked
  });

  // Create text input
  const textInput = document.createElement('textarea');
  textInput.classList.add('note-text');
  textInput.placeholder = 'Write your note...';

  // Append close button and text input to the note element
  note.appendChild(closeButton);
  note.appendChild(textInput);

  // Append the note to the note container
  const noteContainer = document.getElementById('note-container');
  noteContainer.appendChild(note);

  // Make the note draggable
  interact(note)
    .draggable({
      onmove: window.dragMoveListener
    })
    .resizable({
      preserveAspectRatio: false,
      edges: { left: true, right: true, bottom: true, top: true }
    })
    .on('dragstart', () => {
      isNoteDragging = true; // Set the flag to indicate note dragging
    })
    .on('dragend', () => {
      isNoteDragging = false; // Reset the flag when dragging ends
    })
    .on('dragmove', (event) => {
      const target = event.target;
      const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
      const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

      target.style.transform = `translate(${x}px, ${y}px)`;

      target.setAttribute('data-x', x);
      target.setAttribute('data-y', y);
    })
    .on('resizemove', function (event) {
      let target = event.target,
        x = (parseFloat(target.getAttribute('data-x')) || 0),
        y = (parseFloat(target.getAttribute('data-y')) || 0);

      // update the element's style
      target.style.width = event.rect.width + 'px';
      target.style.height = event.rect.height + 'px';

      // translate when resizing from top or left edges
      x += event.deltaRect.left;
      y += event.deltaRect.top;

      target.style.webkitTransform = target.style.transform =
        'translate(' + x + 'px,' + y + 'px)';

      target.setAttribute('data-x', x);
      target.setAttribute('data-y', y);
    });
}


function dragMoveListener(event) {
  let target = event.target,
    // keep the dragged position in the data-x/data-y attributes
    x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
    y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

  // translate the element
  target.style.transform = `translate(${x}px, ${y}px)`;

  // update the position attributes
  target.setAttribute('data-x', x);
  target.setAttribute('data-y', y);
}
