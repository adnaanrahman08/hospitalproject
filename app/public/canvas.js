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
let headImage;
let mask2;
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
  headImage = loadImage("./models/human-head.png");
  bodyImage = loadImage("./models/human-body.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  background("#D1E1FF");
  image(headImage, 0, 0, 200, 200); // head
  image(bodyImage, 220, 0, 300, 700); // body
  mask2 = createGraphics(width, height);

  mask2.image(headImage, 0, 0, 200, 200); // head mask
  mask = createGraphics(width, height);
  mask.image(bodyImage, 220, 0, 300, 700); // body mask
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
  mask2.loadPixels();
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i + 3] = mask.pixels[i] || mask2.pixels[i];
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

  // Hide the table when clearing the canvas
  const dataTable = document.getElementById('data-table');
  dataTable.style.display = 'none';

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

  // Show the table when the calculate button is clicked
  const dataTable = document.getElementById('data-table');
  dataTable.style.display = 'table';
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

// Calculate Totals
const dailyInput = document.getElementById('daily');
const alternateInput = document.getElementById('alternate');
const weekendInput = document.getElementById('weekend');
const faceTotalSpan = document.getElementById('faceid');
const trunkTotalSpan = document.getElementById('trunkid');

let faceTCSValue = 0;
let trunkTCSValue = 0;

dailyInput.addEventListener('input', calculateTotal);
alternateInput.addEventListener('input', calculateTotal);
weekendInput.addEventListener('input', calculateTotal);

function calculateTotal() {
  const dailyValue = parseFloat(dailyInput.value);
  const alternateValue = parseFloat(alternateInput.value);
  const weekendValue = parseFloat(weekendInput.value);

  const faceTotal = (dailyValue * 7 * faceTCSValue) + ((3 / 7) * alternateValue * 7 * faceTCSValue) + ((2 / 7) * weekendValue * 7 * faceTCSValue);
  const trunkTotal = (dailyValue * 7 * trunkTCSValue) + ((3 / 7) * alternateValue * 7 * trunkTCSValue) + ((2 / 7) * weekendValue * 7 * trunkTCSValue);

  faceTotalSpan.textContent = faceTotal.toFixed(2);
  trunkTotalSpan.textContent = trunkTotal.toFixed(2);
}

const calculateButton = document.querySelector('button[onclick="updateTable()"]');
calculateButton.addEventListener('click', updateTable);

function populateTable() {
  const tableBody = document.querySelector('#data-table tbody');

  tableBody.innerHTML = '';

  let totalTcsValue = 0;
  const selectedGender = document.querySelector('input[name="gender"]:checked').value;

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

    // Calculate ftu and tcs based on body part
    if (part.name === 'Trunk') {
      ftuValue = (parseFloat(part.remainingPercentage) / 100) * 7;
      if (selectedGender === "male") {
        tcsValue = ftuValue * 0.5;
      } else if (selectedGender === "female") {
        tcsValue = ftuValue * 0.4;
      }
      totalTcsValue += tcsValue;
    } else if (part.name === 'Both Arms') {
      ftuValue = (parseFloat(part.remainingPercentage) / 100) * 6;
      if (selectedGender === "male") {
        tcsValue = ftuValue * 0.5;
      } else if (selectedGender === "female") {
        tcsValue = ftuValue * 0.4;
      }
      totalTcsValue += tcsValue;
    } else if (part.name === 'Both Hands') {
      ftuValue = (parseFloat(part.remainingPercentage) / 100) * 2;
      if (selectedGender === "male") {
        tcsValue = ftuValue * 0.5;
      } else if (selectedGender === "female") {
        tcsValue = ftuValue * 0.4;
      }
      totalTcsValue += tcsValue;
    } else if (part.name === 'Both Legs') {
      ftuValue = (parseFloat(part.remainingPercentage) / 100) * 12;
      if (selectedGender === "male") {
        tcsValue = ftuValue * 0.5;
      } else if (selectedGender === "female") {
        tcsValue = ftuValue * 0.4;
      }
      totalTcsValue += tcsValue;
    } else if (part.name === 'Feet') {
      ftuValue = (parseFloat(part.remainingPercentage) / 100) * 4;
      if (selectedGender === "male") {
        tcsValue = ftuValue * 0.5;
      } else if (selectedGender === "female") {
        tcsValue = ftuValue * 0.4;
      }
      totalTcsValue += tcsValue;
    } else if (part.name === 'Face & Neck') {
      ftuValue = (parseFloat(part.remainingPercentage) / 100) * 2.5;
      if (selectedGender === "male") {
        tcsValue = ftuValue * 0.5;
      } else if (selectedGender === "female") {
        tcsValue = ftuValue * 0.4;
      }
      faceTCSValue = tcsValue.toFixed(2);
    }

    trunkTCSValue = totalTcsValue.toFixed(2);

    ftuCell.textContent = ftuValue.toFixed(1);
    tcsCell.textContent = tcsValue.toFixed(2);

    newRow.appendChild(bodyPartCell);
    newRow.appendChild(percentageCell);
    newRow.appendChild(ftuCell);
    newRow.appendChild(tcsCell);

    tableBody.appendChild(newRow);
  });

  calculateTotal();
}

window.addEventListener('DOMContentLoaded', function () {
  const $selectOption = $("#select-option");
  const $searchInput = $("#search-input");
  let options = $selectOption.find('option').clone();

  $selectOption.select2({
    placeholder: "Select a topical steroid",
    allowClear: true,
    minimumResultsForSearch: -1,
  });

  // Handle search functionality
  $searchInput.on("input", function () {
    const searchText = $searchInput.val().toLowerCase();

    if (searchText === "") {
      $selectOption.empty().append(options);
    } else {
      // Filter options based on search text
      const filteredOptions = options.filter(function () {
        const optionText = $(this).text().toLowerCase();
        return optionText.includes(searchText);
      });

      $selectOption.select2('destroy');

      $selectOption.empty().append(filteredOptions);

      $selectOption.select2({
        placeholder: "Select a topical steroid",
        allowClear: true,
        minimumResultsForSearch: -1,
      });
    }

    $selectOption.find("optgroup").show();

    $selectOption.trigger("change");
  });

  calculateRemainingPixels();
  populateTable();
});


function generatePDF() {
  const form = document.querySelector('dialog form');
  const isValid = form.checkValidity();

  if (!isValid) {
    return;
  }

  const dailyValue = document.getElementById('daily').value;
  const alternateValue = document.getElementById('alternate').value;
  const weekendValue = document.getElementById('weekend').value;
  const faceValue = document.getElementById('faceid').textContent;
  const trunkValue = document.getElementById('trunkid').textContent;
  const selectedSteroidText = document.getElementById('select-option').selectedOptions[0].textContent;
  const today = new Date();
  const dateValue = today.toLocaleDateString();

  const name = document.getElementById('name').value;
  const dateOfBirth = document.getElementById('dob').value;
  const hospitalNumber = document.getElementById('hospitalNumber').value;
  const doctorName = document.getElementById('doctorName').value;
  const diagnosis = document.getElementById('diagnosis').value;
  const soap = document.getElementById('soap').value;
  const faceMoisturiser = document.getElementById('faceMoisturiser').value;
  const bodyMoisturiser = document.getElementById('bodyMoisturiser').value;

  const tableRows = document.querySelectorAll('#data-table tbody tr');
  let tableContent = '';

  tableRows.forEach((row) => {
    const bodyPart = row.cells[0].textContent;
    const percentageCovered = row.cells[1].textContent;
    const ftuValue = row.cells[2].textContent;
    const tcsValue = row.cells[3].textContent;

    tableContent += `
      <tr>
        <td>${bodyPart}</td>
        <td>${percentageCovered}</td>
        <td>${ftuValue}</td>
        <td>${tcsValue}</td>
      </tr>
    `;
  });

  fetch('treatmentplan.html')
    .then(response => response.text())
    .then(treatmentplan => {
      const htmlContent = treatmentplan
        .replace('{dailyValue}', dailyValue)
        .replace('{alternateValue}', alternateValue)
        .replace('{weekendValue}', weekendValue)
        .replace('{faceValue}', faceValue)
        .replace('{trunkValue}', trunkValue)
        .replace('{selectedSteroidText}', selectedSteroidText)
        .replace('{tableRows}', tableContent)
        .replace('{dateValue}', dateValue)
        .replace('{name}', name)
        .replace('{dateOfBirth}', dateOfBirth)
        .replace('{hospitalNumber}', hospitalNumber)
        .replace('{diagnosis}', diagnosis)
        .replace('{soap}', soap)
        .replace('{faceMoisturiser}', faceMoisturiser)
        .replace('{bodyMoisturiser}', bodyMoisturiser)
        .replace('{doctorName}', doctorName);

      html2pdf()
        .set({ html2canvas: { scale: 2 } })
        .from(htmlContent)
        .save('topicalsteroid-calculator.pdf');
    })
    .catch(error => {
      console.error('Failed to load treatmentplan.html:', error);
    });
}

function openDialog() {
  const dialog = document.createElement('dialog');
  dialog.innerHTML = `
  <form>
    <div id="step1">
      <div class="close-icon" onclick="closeDialog()">&#10006;</div>
      <h2>Add Consultant Name</h2>
      <label for="doctorName">Consultant Name:</label>
      <input type="text" id="doctorName" required>
      <p id="doctorNameError" style="display:none;color:red;">Consultant Name is required.</p>
      <button type="button" onclick="nextStep()">Next</button>
    </div>

    <div id="step2" class="hide">
        <h2>Patient Details</h2>
        <label for="name">Patient Name:</label>
        <input type="text" id="name" required>

        <label for="dob">Date of Birth:</label>
        <input type="date" id="dob" required>
        
        <label for="hospitalNumber">Hospital Number:</label>
        <input type="text" id="hospitalNumber" required>

        <label for="diagnosis">Diagnosis:</label>
        <input type="text" id="diagnosis" required>

        <label for="soap">Soap Substitute:</label>
        <input type="text" id="soap" required>

        <label for="faceMoisturiser">Face Moisturiser:</label>
        <input type="text" id="faceMoisturiser" required>

        <label for="bodyMoisturiser">Body Moisturiser:</label>
        <input type="text" id="bodyMoisturiser" required>

        <button class="generatepdf" onclick="generatePDF()">Generate PDF</button>
        <button type="button" id="backButton" onclick="prevStep()">Back</button>
        <button type="button" onclick="closeDialog()">Cancel</button>
    </div>
  </form>`;

  document.body.appendChild(dialog);

  dialog.showModal();

  const form = dialog.querySelector('form');
  const generatePdfButton = dialog.querySelector('#generatePdfButton');
  const nextButton = dialog.querySelector('#nextButton');
  const doctorName = dialog.querySelector('#doctorName');
  const doctorNameError = dialog.querySelector('#doctorNameError');

  doctorName.addEventListener('input', function () {
    const isEmpty = doctorName.value.trim() === "";
    nextButton.disabled = isEmpty;
    doctorNameError.style.display = isEmpty ? "inline" : "none";
  });

  // Handle form submission
  dialog.querySelector('form').addEventListener('submit', function (event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const address = document.getElementById('address').value;
    const dateOfBirth = document.getElementById('dateOfBirth').value;
    const hospitalNumber = document.getElementById('hospitalNumber').value;
    const doctorName = document.getElementById('doctorName').value;

    console.log('Doctor Name:', doctorName);
    console.log('Name:', name);
    console.log('Address:', address);
    console.log('Date of Birth:', dateOfBirth);
    console.log('Hospital Number:', hospitalNumber);

    closeDialog();
  });

  // form validity
  form.addEventListener('input', function () {
    generatePdfButton.disabled = !form.checkValidity();
  });
}

function nextStep() {
  const doctorName = document.getElementById('doctorName');
  const doctorNameError = document.getElementById('doctorNameError');

  // trim the input value to remove whitespace
  const doctorNameTrimmed = doctorName.value.trim();

  if (doctorNameTrimmed === "") {
    // if the input is empty, show the error message
    doctorNameError.style.display = "inline";
  } else {
    // if the input is not empty, proceed to the next step
    doctorNameError.style.display = "none";
    document.getElementById('step1').style.display = "none";
    document.getElementById('step2').style.display = "block";
  }
}

function prevStep() {
  document.getElementById('step1').style.display = "block";
  document.getElementById('step2').style.display = "none";
}

function closeDialog() {
  const dialog = document.querySelector('dialog');
  dialog.remove();
}




