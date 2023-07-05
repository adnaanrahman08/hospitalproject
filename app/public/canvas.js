let isDrawing = false;
let brushSize = 15;
let brushColor = "#FFC867";
let isAddingPolygonPoints = false;


// New array to store the points of the polygon
let polygonPoints = [];


// New button to toggle Add Polygon Points mode
togglePolygonPointsButton.innerHTML = "Add Polygon Points";
togglePolygonPointsButton.onclick = function () {
  isAddingPolygonPoints = !isAddingPolygonPoints;

  // If the user is stopping polygon points addition
  if (!isAddingPolygonPoints && polygonPoints.length > 2) {
    // Draw the line from the last point to the first one to close the shape
    context.beginPath();
    context.moveTo(polygonPoints[0].x, polygonPoints[0].y);
    context.lineTo(polygonPoints[polygonPoints.length - 1].x, polygonPoints[polygonPoints.length - 1].y);
    context.strokeStyle = 'red';  // Change this to the color you want
    context.stroke();

    // Fill the polygon
    context.beginPath();
    context.moveTo(polygonPoints[0].x, polygonPoints[0].y);
    for (let i = 1; i < polygonPoints.length; i++) {
      context.lineTo(polygonPoints[i].x, polygonPoints[i].y);
    }
    context.closePath(); // Closes the path from the current point to the start point
    context.fillStyle = 'rgba(255, 0, 0, 0.5)'; // Fill color (semi-transparent red)
    context.fill();

    // Create a blob of text data and download it
    const polygonPointsData = polygonPoints.map(point => `${point.x},${point.y}`).join('\n');
    const blob = new Blob([polygonPointsData], { type: 'text/plain;charset=utf-8;' });
    const anchor = document.createElement("a");
    const url = URL.createObjectURL(blob);
    anchor.href = url;
    anchor.download = "polygonPoints.txt";
    document.body.appendChild(anchor);
    anchor.click();
    setTimeout(function () {
      document.body.removeChild(anchor);
      window.URL.revokeObjectURL(url);
    }, 0);
  }

  togglePolygonPointsButton.innerHTML = isAddingPolygonPoints ? "Stop Adding Polygon Points" : "Add Polygon Points";
};


drawOnArmsButton.onclick = function () {
  isDrawing = !isDrawing;
  drawOnArmsButton.innerHTML = isDrawing ? "Stop Drawing on Arms" : "Draw on Arms";

  // Check if drawing is enabled
  if (isDrawing) {
    // Disable drawing
    isDrawing = false;
    // Fill the left arm polygon shape
    context.beginPath();
    context.moveTo(leftArmPolygonPoints[0].x, leftArmPolygonPoints[0].y);
    for (let i = 1; i < leftArmPolygonPoints.length; i++) {
      context.lineTo(leftArmPolygonPoints[i].x, leftArmPolygonPoints[i].y);
    }
    context.closePath();
    context.fillStyle = brushColor;
    context.fill();

    // Fill the right arm polygon shape
    context.beginPath();
    context.moveTo(rightArmPolygonPoints[0].x, rightArmPolygonPoints[0].y);
    for (let i = 1; i < rightArmPolygonPoints.length; i++) {
      context.lineTo(rightArmPolygonPoints[i].x, rightArmPolygonPoints[i].y);
    }
    context.closePath();
    context.fillStyle = brushColor;
    context.fill();
  } else {


    // Clear the fill from the arm shapes
    context.clearRect(0, 0, canvas.width, canvas.height);
    const image = layer.findOne('Image');
    layer.draw();
    context.drawImage(imageObj, image.x(), image.y(), image.width(), image.height());
  }
};

drawOnHandsButton.onclick = function () {
  isDrawing = !isDrawing;
  drawOnHandsButton.innerHTML = isDrawing ? "Stop Drawing on Hands" : "Draw on Hands";

  // Check if drawing is enabled
  if (isDrawing) {
    isDrawing = false;
    // Fill the right hand polygon shape
    context.beginPath();
    context.moveTo(rightHandPolygonPoints[0].x, rightHandPolygonPoints[0].y);
    for (let i = 1; i < rightHandPolygonPoints.length; i++) {
      context.lineTo(rightHandPolygonPoints[i].x, rightHandPolygonPoints[i].y);
    }
    context.closePath();
    context.fillStyle = brushColor;
    context.fill();

    // Fill the left hand polygon shape
    context.beginPath();
    context.moveTo(leftHandPolygonPoints[0].x, leftHandPolygonPoints[0].y);
    for (let i = 1; i < leftHandPolygonPoints.length; i++) {
      context.lineTo(leftHandPolygonPoints[i].x, leftHandPolygonPoints[i].y);
    }
    context.closePath();
    context.fillStyle = brushColor;
    context.fill();
  } else {

    // Clear the fill from the hand shapes
    context.clearRect(0, 0, canvas.width, canvas.height);
    const image = layer.findOne('Image');
    layer.draw();
    context.drawImage(imageObj, image.x(), image.y(), image.width(), image.height());
  }
};


let leftArmPolygonPoints = [
  { x: 54, y: 116 },
  { x: 87, y: 123 },
  { x: 80, y: 141 },
  { x: 80, y: 160 },
  { x: 76, y: 180 },
  { x: 68, y: 200 },
  { x: 57, y: 221 },
  { x: 46, y: 246 },
  { x: 27, y: 237 },
  { x: 31, y: 215 },
  { x: 32, y: 193 },
  { x: 36, y: 171 },
  { x: 44, y: 156 },
  { x: 51, y: 115 }
];

let rightArmPolygonPoints = [
  { x: 210, y: 121 },
  { x: 217, y: 138 },
  { x: 217, y: 161 },
  { x: 223, y: 179 },
  { x: 230, y: 198 },
  { x: 238, y: 213 },
  { x: 245, y: 230 },
  { x: 251, y: 244 },
  { x: 268, y: 234 },
  { x: 266, y: 220 },
  { x: 264, y: 205 },
  { x: 265, y: 190 },
  { x: 261, y: 175 },
  { x: 255, y: 159 },
  { x: 251, y: 144 },
  { x: 247, y: 129 },
  { x: 245, y: 115 },
  { x: 209, y: 117 }
];

let rightHandPolygonPoints = [
  { x: 251, y: 244.8000030517578 },
  { x: 270, y: 231.8000030517578 },
  { x: 278, y: 243.8000030517578 },
  { x: 288, y: 255.8000030517578 },
  { x: 296, y: 270.8000030517578 },
  { x: 296, y: 279.8000030517578 },
  { x: 283, y: 267.8000030517578 },
  { x: 291, y: 298.8000030517578 },
  { x: 286, y: 300.8000030517578 },
  { x: 278, y: 285.8000030517578 },
  { x: 279, y: 309.8000030517578 },
  { x: 274, y: 310.8000030517578 },
  { x: 270, y: 284.8000030517578 },
  { x: 266, y: 307.8000030517578 },
  { x: 261, y: 308.8000030517578 },
  { x: 260, y: 286.8000030517578 },
  { x: 256, y: 298.8000030517578 },
  { x: 253, y: 302.8000030517578 },
  { x: 250, y: 246.8000030517578 }
];

let leftHandPolygonPoints = [
  { x: 26, y: 234.6666717529297 },
  { x: 47, y: 243.6666717529297 },
  { x: 47, y: 257.6666717529297 },
  { x: 47, y: 273.6666717529297 },
  { x: 47, y: 287.6666717529297 },
  { x: 46, y: 301.6666717529297 },
  { x: 42, y: 302.6666717529297 },
  { x: 38, y: 286.6666717529297 },
  { x: 36, y: 307.6666717529297 },
  { x: 33, y: 311.6666717529297 },
  { x: 29, y: 284.6666717529297 },
  { x: 25, y: 306.6666717529297 },
  { x: 21, y: 312.6666717529297 },
  { x: 19, y: 285.6666717529297 },
  { x: 13, y: 298.6666717529297 },
  { x: 7, y: 302.6666717529297 },
  { x: 15, y: 267.6666717529297 },
  { x: 6, y: 278.6666717529297 },
  { x: 0, y: 278.6666717529297 },
  { x: 8, y: 257.6666717529297 },
  { x: 25, y: 235.6666717529297 }
];



function pointInPolygon(point, polygon) {
  let c = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    if (((polygon[i].y > point.y) != (polygon[j].y > point.y)) && (point.x < (polygon[j].x - polygon[i].x) * (point.y - polygon[i].y) / (polygon[j].y - polygon[i].y) + polygon[i].x)) {
      c = !c;
    }
  }
  return c;
}

document.addEventListener('scroll', function () {
  let pixelFromTop = window.scrollY;

  let header = document.querySelector('header');
  if (pixelFromTop > 50) {
    header.classList.add('hidden');
  } else {
    header.classList.remove('hidden');
  }
});

window.onload = function () {
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
imageObj.src = './models/human-body.png';


// Get the canvas element and set its size
const canvas = document.querySelector('#canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Get the 2D drawing context
const context = canvas.getContext('2d');

// Modify mousedown event listener
canvas.addEventListener('mousedown', function (e) {
  if (isAddingPolygonPoints) {
    // Add point to the polygon
    const pos = getRelativePointerPosition(canvas, e);
    polygonPoints.push(pos);

    // Draw the new point
    context.beginPath();
    context.arc(pos.x, pos.y, 5, 0, 2 * Math.PI);  // 5 is the radius of the point
    context.fillStyle = 'red';  // Change this to the color you want
    context.fill();

    // Draw a line to the new point from the previous point
    if (polygonPoints.length > 1) {
      const prevPos = polygonPoints[polygonPoints.length - 2];
      context.beginPath();
      context.moveTo(prevPos.x, prevPos.y);
      context.lineTo(pos.x, pos.y);
      context.strokeStyle = 'red';  // Change this to the color you want
      context.stroke();
    }
  } else {
    if (!isPointInsideImage(canvas, e) || e.button !== 0) {
      return;
    }
    isDrawing = true;
    const pos = getRelativePointerPosition(canvas, e);
    context.beginPath();
    context.moveTo(pos.x, pos.y);
  }
});


// Event listener for mouse move event
canvas.addEventListener('mousemove', function (e) {
  const pos = getRelativePointerPosition(canvas, e);
  if (isDrawing && pointInPolygon(pos, leftArmPolygonPoints)) {
    context.lineTo(pos.x, pos.y);
    context.strokeStyle = brushColor;
    context.lineWidth = brushSize;
    context.lineCap = 'round';
    context.stroke();
  }
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