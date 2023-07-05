let isDrawing = false;
let brushSize = 15;
let brushColor = "#FFC867";

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

// Initialize Konva stage and layer
const stage = new Konva.Stage({
  container: 'canvas',
  width: window.innerWidth,
  height: window.innerHeight
});

const layer = new Konva.Layer();
stage.add(layer);

// Load the image
const imageObj = new Image();
imageObj.onload = function () {
  const image = new Konva.Image({
    image: imageObj,
    x: 0,
    y: 0,
    width: imageObj.width,
    height: imageObj.height
  });
  layer.add(image);

  // Update the canvas size
  canvas.width = imageObj.width;
  canvas.height = imageObj.height;

  stage.batchDraw();
};
imageObj.src = './models/human-head.png';


// Get the canvas element and set its size
const canvas = document.querySelector('#canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Get the 2D drawing context
const context = canvas.getContext('2d');

// Event listener for mouse down event
canvas.addEventListener('mousedown', function (e) {
  if (!isPointInsideImage(canvas, e)) {
    return;
  }
  isDrawing = true;
  const pos = getRelativePointerPosition(canvas, e);
  context.beginPath();
  context.moveTo(pos.x, pos.y);
});

// Event listener for mouse move event
canvas.addEventListener('mousemove', function (e) {
  if (!isDrawing) {
    return;
  }
  const pos = getRelativePointerPosition(canvas, e);
  context.lineTo(pos.x, pos.y);
  context.strokeStyle = brushColor;
  context.lineWidth = brushSize;
  context.lineCap = 'round';
  context.stroke();
});

// Event listener for mouse up event
canvas.addEventListener('mouseup', function () {
  isDrawing = false;
});

// Function to check if the point is inside the image
function isPointInsideImage(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const image = stage.findOne('Image'); 

  return (
    x >= image.x() &&
    y >= image.y() &&
    x <= image.x() + image.width() &&
    y <= image.y() + image.height()
  );
}


// Function to get the relative pointer position within the canvas
function getRelativePointerPosition(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
}

// Function to get the relative touch position within the canvas
function getRelativeTouchPosition(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.touches[0].clientX - rect.left,
    y: event.touches[0].clientY - rect.top
  };
}

// Function to clear the canvas
function clearCanvas() {
  context.clearRect(0, 0, canvas.width, canvas.height);
}

// Function to calculate body surface area
function calculateSurfaceArea() {
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  let shadedPixels = 0;

  // Count the number of shaded pixels
  for (let i = 0; i < data.length; i += 4) {
    const red = data[i];
    const green = data[i + 1];
    const blue = data[i + 2];
    const alpha = data[i + 3];

    // Check if the pixel is shaded (non-transparent)
    if (alpha > 0) {
      shadedPixels++;
    }
  }

  // Calculate the percentage of shaded area
  const totalPixels = canvas.width * canvas.height;
  const shadedPercentage = (shadedPixels / totalPixels) * 100;

  document.getElementById('bsa').textContent = 'Body Surface Area: ' + shadedPercentage.toFixed(2) + '%';
}


// Function to change the brush color
function changeBrushColor() {
  const colorPicker = document.getElementById('color-picker');
  brushColor = colorPicker.value;
}

// Event listener for brush size range change
const brushSizeRange = document.getElementById('brushSizeRange');
brushSizeRange.addEventListener('input', function () {
  brushSize = this.value;
  document.getElementById('brushSizeLabel').textContent = brushSize;
});

// Set the initial brush size label
document.getElementById('brushSizeLabel').textContent = brushSize;