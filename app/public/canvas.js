const canvas = new fabric.Canvas('canvas');
let polygonCount = 1;
let startDrawingPolygon;
let ArrayLength;
let addTexture = false;
let circleCount = 1;
const fillColor = "rgba(46, 240, 56, 0.5)";

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
  for (const obj of canvas.getObjects()) {
    if (obj.polygonNo === polygonCount) {
      const points = window["polygon" + polygonCount].get("points");
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
      window["polygon" + polygonCount].set({ points: points });
      canvas.renderAll();
    }
  }
  for (const obj of canvas.getObjects()) {
    if (obj.name === "draggableCircle") {
      canvas.bringForward(obj);
      canvas.renderAll();
    }
  }
  polygonCount++;
  canvas.renderAll();

  // Calculate area using Shoelace formula
  const points = window["polygon" + (polygonCount - 1)].get("points");
  let area = 0;
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const curr = points[i];
    const next = points[(i + 1) % n];
    area += curr.x * next.y;
    area -= curr.y * next.x;
  }
  area = Math.abs(area / 2);

  // Display the area on the screen
  const areaDisplay = document.getElementById("areaDisplay");
  areaDisplay.textContent = "Area: " + area.toFixed(2);
}

function Addpolygon() {
  startDrawingPolygon = true;
}

canvas.on('object:moving', function (option) {
  const startY = option.e.offsetY;
  const startX = option.e.offsetX;
  for (const obj of canvas.getObjects()) {
    if (obj.name === "Polygon") {
      if (obj.PolygonNumber === option.target.polygonNo) {
        const points = window["polygon" + option.target.polygonNo].get("points");
        points[option.target.circleNo - 1].x = startX - obj.left;
        points[option.target.circleNo - 1].y = startY - obj.top;
        obj.set({
          points: points
        });
        canvas.renderAll();

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

        // Update the area display
        const areaDisplay = document.getElementById("areaDisplay");
        areaDisplay.textContent = "Area: " + area.toFixed(2);
      }
    }

    if (obj.name === "draggableCircle") {
      canvas.bringForward(obj);
    }
  }
  canvas.renderAll();
});


canvas.on('mouse:down', function (option) {
  if (typeof option.target !== "undefined") {
    return;
  } else {
    if (addTexture) {
      console.log(option);
    }
    if (startDrawingPolygon) {
      const circle = new fabric.Circle({
        left: canvas.getPointer(option.e).x,
        top: canvas.getPointer(option.e).y,
        radius: 7,
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
      canvas.bringToFront(circle);
      circleCount++;
      canvas.renderAll();
    }
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

// Function to remove all polygons from the canvas
function clearPolygons() {
  const objects = canvas.getObjects();
  for (let i = objects.length - 1; i >= 0; i--) {
    if (objects[i].name === "Polygon" || objects[i].name === "draggableCircle") {
      canvas.remove(objects[i]);
    }
  }
  polygonCount = 1;
  circleCount = 1;

  // Clear area display
  const areaDisplay = document.getElementById("areaDisplay");
  areaDisplay.textContent = "";
}

