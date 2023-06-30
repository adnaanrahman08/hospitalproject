const canvas = new fabric.Canvas('canvas');
let polygonCount = 1;
let startDrawingPolygon;
let ArrayLength;
let addTexture = false;
let circleCount = 1;
let circles = [];
let pointRadius = 7;
const fillColor = "rgba(46, 240, 56, 0.5)";
const weightInput = document.getElementById("weightInput");
const heightInput = document.getElementById("heightInput");
const areaDisplay = document.getElementById("areaDisplay");
const shapeTableBody = document.querySelector("#shapeTable tbody");
const shapeTable = document.getElementById("shapeTable");

function calculateBSA(weight, height) {
  // Du Bois Body Surface Area formula
  return 0.007184 * Math.pow(weight, 0.425) * Math.pow(height, 0.725);
}

function done() {
  startDrawingPolygon = false;
  ArrayLength = circleCount;
  circleCount = 1;
  window["polygon" + polygonCount] = new fabric.Polygon(
    [{ x: 0, y: 0 }, { x: 0.5, y: 0.5 }],
    {
      fill: fillColor,
      PolygonNumber: polygonCount,
      name: "Polygon",
      type: 'normal',
      noofcircles: ArrayLength
    }
  );
  canvas.add(window["polygon" + polygonCount]);

  const points = window["polygon" + polygonCount].get("points");
  for (const obj of canvas.getObjects()) {
    if (obj.polygonNo === polygonCount) {
      if (obj.circleNo === 1) {
        points[0].x = obj.left - window["polygon" + polygonCount].get("left");
        points[0].y = obj.top - window["polygon" + polygonCount].get("top");
      } else if (obj.circleNo === 2) {
        points[1].x = obj.left - window["polygon" + polygonCount].get("left");
        points[1].y = obj.top - window["polygon" + polygonCount].get("top");
      } else {
        points.push({
          x: obj.left - window["polygon" + polygonCount].get("left"),
          y: obj.top - window["polygon" + polygonCount].get("top"),
        });
      }
    }
  }
  window["polygon" + polygonCount].set({ points: points });

  canvas.renderAll();
  polygonCount++;

  // Calculate BSA using Du Bois formula
  const weight = parseFloat(weightInput.value);
  const height = parseFloat(heightInput.value);
  const bsa = calculateBSA(weight, height);

  // Calculate area using Shoelace formula
  let area = 0;
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const curr = points[i];
    const next = points[(i + 1) % n];
    area += curr.x * next.y;
    area -= curr.y * next.x;
  }
  area = Math.abs(area / 2);

  // Adjust area by BSA
  const adjustedArea = area / bsa;

  // Display the adjusted area on the screen
  areaDisplay.textContent = "Body Surface Area: " + adjustedArea.toFixed(2) + " m\u00B2";

  // Add the shape area to the table
  const shapeNumber = polygonCount - 1;
  const newRow = `
    <tr>
      <td>${shapeNumber}</td>
      <td>${adjustedArea.toFixed(2)}</td>
      <td><i class="material-icons-outlined">close</i></td>
    </tr>`;
  shapeTableBody.innerHTML += newRow;

  // Show the table if there is data
  shapeTable.style.display = "table";

}

function Addpolygon() {
  const weight = weightInput.value;
  const height = heightInput.value;

  if (weight === "" || height === "") {
    alert("Please enter weight and height first.");
    return;
  }

  startDrawingPolygon = true;
}

canvas.on('object:moving', function (option) {
  const startY = option.e.offsetY;
  const startX = option.e.offsetX;
  const points = window["polygon" + option.target.polygonNo].get("points");

  for (const obj of canvas.getObjects()) {
    if (obj.name === "Polygon" && obj.PolygonNumber === option.target.polygonNo) {
      points[option.target.circleNo - 1].x = startX - obj.left;
      points[option.target.circleNo - 1].y = startY - obj.top;
      obj.set({ points });

      // Calculate BSA using Du Bois formula
      const weight = parseFloat(weightInput.value);
      const height = parseFloat(heightInput.value);
      const bsa = calculateBSA(weight, height);

      // Calculate area using Shoelace formula
      let area = 0;
      const n = points.length;
      for (let i = 0; i < n; i++) {
        const curr = points[i];
        const next = points[(i + 1) % n];
        area += curr.x * next.y;
        area -= curr.y * next.x;
      }
      area = Math.abs(area / 2);

      // Adjust area by BSA
      const adjustedArea = area / bsa;

      // Display the adjusted area on the screen
      areaDisplay.textContent = "Body Surface Area: " + adjustedArea.toFixed(2) + " m\u00B2";

      // Update the shape area in the table
      const shapeNumber = obj.PolygonNumber;
      const shapeRows = shapeTableBody.getElementsByTagName("tr");
      const shapeRow = shapeRows[shapeNumber - 1];
      const shapeAreaCell = shapeRow.getElementsByTagName("td")[1];
      shapeAreaCell.textContent = adjustedArea.toFixed(2);
    }

    if (obj.name === "draggableCircle") {
      canvas.bringForward(obj);
    }
  }

  canvas.renderAll();
});

// Function that checks if a point is inside the body shape
function isPointInsideBody(x, y) {
  const img = document.getElementById("shapeImage");
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  canvas.width = img.width;
  canvas.height = img.height;

  context.drawImage(img, 0, 0, img.width, img.height);

  const imgPosition = img.getBoundingClientRect();
  const xInsideImage = x - imgPosition.left;
  const yInsideImage = y - imgPosition.top;

  const pixelData = context.getImageData(xInsideImage, yInsideImage, 1, 1).data;
  const [red, green, blue, alpha] = pixelData;

  if (!(red === 0 && green === 0 && blue === 0 && alpha === 0)) {
    return true;
  } else {
    console.log(`Background Color: rgba(${red}, ${green}, ${blue}, ${alpha})`);
    return false;
  }
}

canvas.on('mouse:down', function (option) {
  const weight = weightInput.value;
  const height = heightInput.value;

  if (weight === "" || height === "") {
    alert("Please enter weight and height first.");
    return;
  }

  if (typeof option.target !== "undefined") {
    return;
  } else {
    const x = option.e.clientX;
    const y = option.e.clientY;

    if (isPointInsideBody(x, y)) {
      console.log("Inside the path");
    } else {
      console.log("Outside the path");
      return;
    }

    if (addTexture) {
      console.log(option);
    }

    if (startDrawingPolygon) {
      const circle = new fabric.Circle({
        left: canvas.getPointer(option.e).x,
        top: canvas.getPointer(option.e).y,
        radius: pointRadius,
        hasBorders: false,
        hasControls: false,
        polygonNo: polygonCount,
        name: "draggableCircle",
        circleNo: circleCount,
        fill: "rgba(0, 0, 0, 0.5)",
        hasRotatingPoint: false,
        originX: 'center',
        originY: 'center'
      });
      canvas.add(circle);
      circles.push(circle);
      canvas.bringToFront(circle);
      circleCount++;
      canvas.renderAll();
    }
  }
});

// prevents user from opening right click browser menu while undoing point
canvas.upperCanvasEl.oncontextmenu = function (e) {
  e.preventDefault();
};

canvas.on('mouse:up', function (option) {
  if (option.e.button === 2 && startDrawingPolygon && circles.length > 0) {
    const circle = circles.pop();
    canvas.remove(circle);
    circleCount--;
    canvas.renderAll();
  }
});


document.getElementById("addPolygonBtn").addEventListener("click", function () {
  Addpolygon();
});

document.getElementById("createPolygonBtn").addEventListener("click", function () {
  done();

});

document.getElementById("clearPolygonBtn").addEventListener("click", function () {
  clearPolygons();
});

const pointSizeSlider = document.getElementById("pointSizeSlider");
const pointSizeDisplay = document.getElementById("pointSizeDisplay");

pointSizeSlider.addEventListener("input", function () {
  pointRadius = pointSizeSlider.value;
  pointSizeDisplay.textContent = pointSizeSlider.value;

  let activeObject = canvas.getActiveObject();
  if (activeObject && activeObject.name === 'draggableCircle') {
    activeObject.set('radius', pointRadius);
    activeObject.scaleToWidth(pointRadius * 2);
    activeObject.scaleToHeight(pointRadius * 2);

    canvas.renderAll();
  }
});

// Function to remove all polygons from the canvas
function clearPolygons() {
  const objects = canvas.getObjects().filter(obj => obj.name === "Polygon" || obj.name === "draggableCircle");
  canvas.remove(...objects);
  polygonCount = 1;
  circleCount = 1;

  // Clear area display
  areaDisplay.textContent = "";
  circles = [];

  // Clear the shape table
  shapeTableBody.innerHTML = "";

  // Hide the table if there is no data
  shapeTable.style.display = "none";
}

// Add event listener to table body for remove icon click
shapeTableBody.addEventListener("click", function (event) {
  const target = event.target;
  if (target.classList.contains("material-icons-outlined")) {
    // Remove the row from the table
    const row = target.parentNode.parentNode;
    const shapeNumber = row.getElementsByTagName("td")[0].textContent;
    const shapeToRemove = window["polygon" + shapeNumber];
    if (shapeToRemove) {
      // Remove the shape and its associated circle points
      const shapeCircles = canvas.getObjects().filter(obj => obj.polygonNo === Number(shapeNumber) && obj.name === "draggableCircle");
      canvas.remove(shapeToRemove, ...shapeCircles);
    }
    shapeTableBody.removeChild(row);

    // Update the shape numbers in the table
    const remainingRows = shapeTableBody.getElementsByTagName("tr");
    for (let i = 0; i < remainingRows.length; i++) {
      const shapeNumberCell = remainingRows[i].getElementsByTagName("td")[0];
      shapeNumberCell.textContent = i + 1;
    }

    // Check if the removed row was the last one
    if (remainingRows.length === 0) {
      // Reset the table
      clearPolygons();
    }
  }
});

let colorPicker;
colorPicker = document.querySelector("#color-picker");
colorPicker.addEventListener("input", updateFillColor, false);
colorPicker.addEventListener("change", updateFillColor, false);
colorPicker.select();

function updateFillColor(event) {
  const polygons = canvas.getObjects().filter(obj => obj.name === "Polygon");
  polygons.forEach(polygon => {
    polygon.set({ fill: event.target.value });
  });
  canvas.renderAll();
}

