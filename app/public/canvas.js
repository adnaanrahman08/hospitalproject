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
  { name: 'Face & Neck', color: [254, 138, 141], pixelsLeft: 0, originalTotalPixels: 0, originalColorPixels: 0, targetColorPixels: 0 },
  { name: 'Trunk', color: [238, 238, 238], pixelsLeft: 0, originalTotalPixels: 0, originalColorPixels: 0, targetColorPixels: 0 },
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
  calculateTotalPixels();
}

function calculateOriginalTotalPixels() {
  const selectedGender = document.querySelector('input[name="gender"]:checked').value;
  let formulaValue = 0;

  if (selectedGender === "male") {
    formulaValue = 0.5 * 82.98;
  } else if (selectedGender === "female") {
    formulaValue = 0.5 * 63.91;
  }

  // Define the target colors for each body part
  const faceAndNeckColor = [254, 138, 141];
  const trunkColor = [238, 238, 238];

  // Calculate target color pixels for each body part
  const faceAndNeckColorPixels = countPixelsByColor(faceAndNeckColor);
  const trunkColorPixels = countPixelsByColor(trunkColor);

  for (const bodyPart of bodyParts) {
    if (bodyPart.name === "Face & Neck") {
      bodyPart.originalTotalPixels = (formulaValue * 0.09).toFixed(2);
      bodyPart.originalColorPixels = faceAndNeckColorPixels;
    } else if (bodyPart.name === "Trunk") {
      bodyPart.originalTotalPixels = (formulaValue * 0.91).toFixed(2);
      bodyPart.originalColorPixels = trunkColorPixels;
    }
  }
}

function countPixelsByColor(targetColor) {
  const tolerance = 10;
  loadPixels();
  let count = 0;

  for (let i = 0; i < pixels.length; i += 4) {
    let pixelR = pixels[i];
    let pixelG = pixels[i + 1];
    let pixelB = pixels[i + 2];

    if (
      Math.abs(pixelR - targetColor[0]) <= tolerance &&
      Math.abs(pixelG - targetColor[1]) <= tolerance &&
      Math.abs(pixelB - targetColor[2]) <= tolerance
    ) {
      count++;
    }
  }

  return count;
}

function calculateTotalPixels() {
  for (const bodyPart of bodyParts) {
    const targetColor = bodyPart.color;
    const targetColorPixels = countPixelsByColor(targetColor);

    bodyPart.targetColorPixels = targetColorPixels;

    bodyPart.pixelsLeft = (bodyPart.originalTotalPixels * (bodyPart.targetColorPixels / bodyPart.originalColorPixels)).toFixed(2);
    console.log(`Pixels left for ${bodyPart.name}: ${bodyPart.pixelsLeft}`);
  }
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
  image(headImage, 0, 0, 200, 200); // head
  image(bodyImage, 220, 0, 300, 700); // body

  loadPixels();
  calculateTotalPixels();

  for (const bodyPart of bodyParts) {
    bodyPart.pixelsLeft = bodyPart.originalTotalPixels;
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
    let percentage = ((bodyPart.originalTotalPixels - bodyPart.pixelsLeft) / bodyPart.originalTotalPixels) * 100;
    percentage = Math.min(100, Math.max(0, percentage));
    bodyPart.remainingPercentage = percentage.toFixed(1) + '%';
  }
}

const genderRadios = document.getElementsByName("gender");
genderRadios.forEach((radio) => {
  radio.addEventListener("change", function () {
    selectedGender = document.querySelector('input[name="gender"]:checked').value;
    calculateOriginalTotalPixels();
    calculateTotalPixels();
    calculateRemainingPixels();
    populateTable();
  });
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
    const bsaCell = document.createElement('td');
    const ftuCell = document.createElement('td');
    const tcsCell = document.createElement('td');

    bodyPartCell.textContent = part.name;
    percentageCell.textContent = part.remainingPercentage;
    bsaCell.textContent = (part.originalTotalPixels - part.pixelsLeft).toFixed(2)

    let ftuValue = 0;
    let tcsValue = 0;

    // Calculate ftu and tcs based on body part
    if (part.name === 'Trunk') {
      ftuValue = parseFloat(part.originalTotalPixels - part.pixelsLeft) / 2;
      if (selectedGender === "male") {
        tcsValue = ftuValue * 0.5;
      } else if (selectedGender === "female") {
        tcsValue = ftuValue * 0.4;
      }
      totalTcsValue += tcsValue;
    } else if (part.name === 'Face & Neck') {
      ftuValue = parseFloat(part.originalTotalPixels - part.pixelsLeft) / 2;
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
    newRow.appendChild(bsaCell);
    newRow.appendChild(ftuCell);
    newRow.appendChild(tcsCell);

    tableBody.appendChild(newRow);
  });

  calculateTotal();
}

window.addEventListener('DOMContentLoaded', function () {
  const $selectOption = $("#select-option");
  const $searchInput = $("#search-input");

  $selectOption.select2({
    placeholder: "Select a topical steroid",
    allowClear: true,
    minimumResultsForSearch: -1,
  });

  // Handle search functionality
  $searchInput.on("input", function () {
    const searchText = $searchInput.val().toLowerCase();

    // Always get the original options from the select element
    let options = $selectOption.find('option');

    if (searchText === "") {
      $selectOption.html(options);
    } else {
      // Filter options based on search text
      const filteredOptions = options.filter(function () {
        const optionText = $(this).text().toLowerCase();
        return optionText.includes(searchText);
      });

      $selectOption.select2('destroy');

      $selectOption.html(filteredOptions);

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
  const faceSteroid = document.getElementById('faceSteroid').value;
  const bodySteroid = document.getElementById('bodySteroid').value;

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
        .replace(/{dailyValue}/g, dailyValue)
        .replace(/{alternateValue}/g, alternateValue)
        .replace(/{weekendValue}/g, weekendValue)
        .replace(/{faceValue}/g, faceValue)
        .replace(/{trunkValue}/g, trunkValue)
        .replace(/{selectedSteroidText}/g, selectedSteroidText)
        .replace(/{tableRows}/g, tableContent)
        .replace(/{dateValue}/g, dateValue)
        .replace(/{name}/g, name)
        .replace(/{dateOfBirth}/g, dateOfBirth)
        .replace(/{hospitalNumber}/g, hospitalNumber)
        .replace(/{diagnosis}/g, diagnosis)
        .replace(/{soap}/g, soap)
        .replace(/{faceMoisturiser}/g, faceMoisturiser)
        .replace(/{bodyMoisturiser}/g, bodyMoisturiser)
        .replace(/{doctorName}/g, doctorName)
        .replace(/{faceSteroid}/g, faceSteroid)
        .replace(/{bodySteroid}/g, bodySteroid);


      html2pdf()
        .set({ html2canvas: { scale: 2 } })
        .from(htmlContent)
        .save('topicalsteroid-calculator.pdf');
    })
    .catch(error => {
      console.error('Failed to load treatmentplan.html:', error);
    });
}

function generatePDFPrescription() {
  const name = document.getElementById('name').value;
  const dateOfBirth = document.getElementById('dob').value;
  const hospitalNumber = document.getElementById('hospitalNumber').value;
  const address = document.getElementById('address').value;
  const today = new Date();
  const dateValue = today.toLocaleDateString();
  const soap = document.getElementById('soap').value;
  const faceMoisturiser = document.getElementById('faceMoisturiser').value;
  const bodyMoisturiser = document.getElementById('bodyMoisturiser').value;
  
  fetch('prescription.html')
    .then(response => response.text())
    .then(prescription => {
      const htmlContent = prescription
        .replace(/{name}/g, name)
        .replace(/{address}/g, address)
        .replace(/{dateOfBirth}/g, dateOfBirth)
        .replace(/{hospitalNumber}/g, hospitalNumber)
        .replace(/{dateValue}/g, dateValue)
        .replace(/{doctorName}/g, doctorName)
        .replace(/{soap}/g, soap)
        .replace(/{faceMoisturiser}/g, faceMoisturiser)
        .replace(/{bodyMoisturiser}/g, bodyMoisturiser);


      html2pdf()
        .set({ html2canvas: { scale: 2 } })
        .from(htmlContent)
        .save('prescription.pdf');
    })
    .catch(error => {
      console.error('Failed to load prescription.html:', error);
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

        <label for="address">Address:</label>
        <input type="text" id="address" required
        
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

        <label for="faceSteroid">Face/Neck Topical Steroid:</label>
        <input type="text" id="faceSteroid" required>

        <label for="bodySteroid">Body Topical Steroid:</label>
        <input type="text" id="bodySteroid" required>

        <button class="generatepdf" onclick="generatePDF()">Generate Skin Treatment Plan</button>
        <button class="generatepdf" onclick="generatePDFPrescription()">Generate Prescription</button>
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