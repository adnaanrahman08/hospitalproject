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
  const $selectedItem = $("#selected-item");

  $selectOption.select2({
    placeholder: "Search for a topical steroid",
    allowClear: true,
    minimumResultsForSearch: -1,
  });

  // Handle search functionality
  $searchInput.on("input", function () {
    const searchText = $searchInput.val().toLowerCase();

    // Always get the original options from the select element
    const originalOptions = $selectOption.find('option');

    if (searchText === "") {
      $selectOption.html(originalOptions);
    } else {
      // Filter options based on search text
      const filteredOptions = originalOptions.filter(function () {
        const optionText = $(this).text().toLowerCase();
        return optionText.includes(searchText);
      });

      $selectOption.html(filteredOptions);
    }

    $selectOption.trigger("change");
  });

  $selectOption.on("change", function () {
    const selectedOption = $selectOption.find(":selected").text();
    $selectedItem.val(selectedOption);
  });

  $selectOption.find("optgroup").show();

  $selectOption.trigger("change");
});


calculateRemainingPixels();
populateTable();


function generatePDF() {
  const form = document.querySelector('dialog form');
  const isValid = form.checkValidity();

  if (!isValid) {
    return;
  }

  const today = new Date();
  const dateValue = today.toLocaleDateString();

  const name = document.getElementById('name').value;
  const dateOfBirth = document.getElementById('dob').value;
  const hospitalNumber = document.getElementById('hospitalNumber').value;
  const doctorName = document.getElementById('doctorName').value;
  const diagnosis = document.getElementById('diagnosis').value;
  const soaps = document.getElementById('soaps').value;
  // const faceMoisturiser = document.getElementById('faceMoisturiser').value;
  const bodyMoisturiser = document.getElementById('bodyMoisturizer').value;
  const faceSteroid = document.getElementById('faceSteroidInput').value;
  const bodySteroid = document.getElementById('bodySteroidInput').value;

  fetch('treatmentplan.html')
    .then(response => response.text())
    .then(treatmentplan => {
      const htmlContent = treatmentplan
        .replace(/{dateValue}/g, dateValue)
        .replace(/{name}/g, name)
        .replace(/{dateOfBirth}/g, dateOfBirth)
        .replace(/{hospitalNumber}/g, hospitalNumber)
        .replace(/{diagnosis}/g, diagnosis)
        .replace(/{soaps}/g, soaps)
        // .replace(/{faceMoisturiser}/g, faceMoisturiser)
        .replace(/{bodyMoisturizer}/g, bodyMoisturiser)
        .replace(/{doctorName}/g, doctorName)
        .replace(/{faceSteroidInput}/g, faceSteroid)
        .replace(/{bodySteroidInput}/g, bodySteroid);

      const generateFileName = () => `${name}-${dateValue}-Skin-Treatment-Plan.pdf`;

      const options = {
        margin: 20,
        filename: generateFileName(),
      };

      html2pdf().from(htmlContent).set(options).save();
    })
    .catch(error => {
      console.error('Failed to load treatmentplan.html:', error);
    });
}

function generatePDFPrescription() {
  const form = document.querySelector('dialog form');
  const isValid = form.checkValidity();

  if (!isValid) {
    return;
  }

  const name = document.getElementById('name').value;
  const dateOfBirth = document.getElementById('dob').value;
  const hospitalNumber = document.getElementById('hospitalNumber').value;
  const address = document.getElementById('address').value;
  const today = new Date();
  const dateValue = today.toLocaleDateString();
  const soaps = document.getElementById('soaps').value;
  // const faceMoisturiser = document.getElementById('faceMoisturiser').value;
  const bodyMoisturiser = document.getElementById('bodyMoisturizer').value;
  const doctorName = document.getElementById('doctorName').value;
  const trunkValue = trunkTotalSpan.textContent;
  const faceValue = faceTotalSpan.textContent;


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
        .replace(/{soaps}/g, soaps)
        // .replace(/{faceMoisturiser}/g, faceMoisturiser)
        .replace(/{trunkid}/g, trunkValue)
        .replace(/{faceid}/g, faceValue)
        .replace(/{bodyMoisturizer}/g, bodyMoisturiser);

      const generateFileName = () => `${name}-${dateValue}-Prescription.pdf`;

      const options = {
        margin: 5,
        filename: generateFileName(),
      };

      html2pdf().from(htmlContent).set(options).save();
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
    <div class="close-icon" onclick="closeDialog()">&#10006;</div>
      <h2>Patient Details</h2>

      <!-- Patient Information Section -->
      <div class="form-section">
        <h3>Patient Information</h3>
        <label for="name">Patient Name:</label>
        <input type="text" id="name" required>

        <label for="dob">Date of Birth:</label>
        <input type="date" id="dob" required>

        <label for="address">Address:</label>
        <input type="text" id="address" required>

        <label for="hospitalNumber">Hospital Number:</label>
        <input type="text" id="hospitalNumber" required>
      </div>

      <!-- Diagnosis and Treatment Section -->
      <div class="form-section">
        <h3>Diagnosis and Treatment</h3>
        <label>Diagnosis:
        <input list="diagnosis" name="diagnosis" />
        </label>
        <datalist id="diagnosis">
        <option value="diagnosis1">
        <option value="diagnosis2">
        <option value="diagnosis3">
        <option value="diagnosis4">
        <option value="diagnosis5">
        </datalist>

        <label>Soap Substitute:
        <input list="soaps" name="soap" />
        </label>
        <datalist id="soaps">
        <option value="Soap1">
        <option value="Soap2">
        <option value="Soap3">
        <option value="Soap4">
        <option value="Soap5">
        </datalist>

        <label>Body Moisturizer:
        <input list="bodyMoisturizer" name="body-Moisturizer" />
        </label>
        <datalist id="bodyMoisturizer">
        <option value="Moist1">
        <option value="Moist2">
        <option value="Moist3">
        <option value="Moist4">
        <option value="Moist5">
        </datalist>

        <label for="faceSteroid">Face/Neck Topical Steroid:</label>
        <input list="faceSteroidOptions" id="faceSteroidInput" required>
        <datalist id="faceSteroidOptions">
          <optgroup label="Mild">
            <option value="Dermacort®">Dermacort® - Hydrocortisone 0.1%</option>
            <option value="Dioderm®">Dioderm® - Hydrocortisone 0.1%</option>
            <option value="Hc45®">Hc45® - Hydrocortisone 1%</option>
            <option value="Hydrocortisone 0.5%">Hydrocortisone 0.5% - Hydrocortisone 0.5%</option>
            <option value="Hydrocortisone 1%">Hydrocortisone 1% - Hydrocortisone 1%</option>
            <option value="Hydrocortisone 2.5%">Hydrocortisone 2.5% - Hydrocortisone 2.5%</option>
            <option value="Mildison Lipocream®">Mildison Lipocream® - Hydrocortisone 1%</option>
            <option value="Synalar 1 in 10®">Synalar 1 in 10® - Fluocinolone acetonide 0.0025%</option>
            <option value="Zenoxone® cream">Zenoxone® cream - Hydrocortisone 1%</option>
            <option value="Canesten HC®">(AntiFungal) Canesten HC® - Hydrocortisone 1% - Clotrimazole</option>
            <option value="Daktacort®">(AntiFungal) Daktacort® - Hydrocortisone 1% - Miconazole nitrate</option>
            <option value="Fucidin H®">(Antibacterial) Fucidin H® - Hydrocortisone 1% - Fusidic acid</option>
            <option value="Nystaform HC®">(Antibacterial, Antifungal) Nystaform HC® - Hydrocortisone 0.5% - Chlorhexidine, Nystatin</option>
            <option value="Terra-Cortril®">(Antibacterial) Terra-Cortril® - Hydrocortisone 1% - Oxytetracycline</option>
            <option value="Timodine®">(Antibacterial, Antifungal) Timodine® - Hydrocortisone 0.5% - Benzalkonium chloride, Nystatin</option>
          </optgroup>
          <optgroup label="Moderate">
            <option value="Alphaderm®">Alphaderm® - Hydrocortisone 1%, urea 10%</option>
            <option value="Betnovate-RD®">Betnovate-RD® - Betamethasone valerate 0.025%</option>
            <option value="Clobavate®">Clobavate® - Clobetasone butyrate 0.05%</option>
            <option value="Eumovate®">Eumovate® - Clobetasone butyrate 0.05%</option>
            <option value="Haelan®">Haelan® - Fludroxycortide 0.0125%</option>
            <option value="Modrasone®">Modrasone® - Alclometasone dipropionate 0.05%</option>
            <option value="Synalar 1 in 4®">Synalar 1 in 4® - Fluocinolone acetonide 0.00625%</option>
            <option value="Trimovate®">(Antibacterial, Antifungal) Trimovate® - Clobetasone butyrate 0.05% - Oxytetracycline, Nystatin</option>
          </optgroup>
          <optgroup label="Potent">
            <option value="Ultralanum Plain®">Ultralanum Plain® - Fluocortolone hexanoate 0.25%</option>
            <option value="Betacap®">Betacap® - Betamethasone valerate 0.1%</option>
            <option value="Beclometasone dipropionate">Beclometasone dipropionate - Beclometasone dipropionate 0.025%</option>
            <option value="Betnovate®">Betnovate® - Betamethasone valerate 0.1%</option>
            <option value="Bettamousse®">Bettamousse® - Contains 1.2 mg betamethasone valerate 0.1%</option>
            <option value="Cutivate® ointment">Cutivate® ointment - Fluticasone propionate 0.005%</option>
            <option value="Cutivate® cream">Cutivate® cream - Fluticasone propionate 0.05%</option>
            <option value="Diprosalic®">Diprosalic® - Betamethasone dipropionate 0.05%</option>
            <option value="Diprosone®">Diprosone® - Betamethasone dipropionate 0.05%</option>
            <option value="Elocon®">Elocon® - Mometasone furoate 0.1%</option>
            <option value="Locoid®">Locoid® - Hydrocortisone butyrate 0.1%</option>
            <option value="Metosyn®">Metosyn® - Fluocinonide 0.05%</option>
            <option value="Nerisone®">Nerisone® - Diflucortolone valerate 0.1%</option>
            <option value="Synalar®">Synalar® - Fluocinolone acetonide 0.025%</option>
            <option value="Aureocort®">(Antibacterial) Aureocort® - Triamcinolone acetonide 0.1% - Chlortetracycline, hydrochloride</option>
            <option value="Betamethasone and clioquinol">(Antibacterial) Betamethasone and clioquinol - Betamethasone valerate 0.1% - Clioquinol</option>
            <option value="Betamethasone and neomycin">(Antibacterial) Betamethasone and neomycin - Betamethasone valerate 0.1% - Neomycin sulphate</option>
            <option value="Fucibet®">(Antibacterial) Fucibet® - Betamethasone valerate 0.1% - Fucidic acid</option>
            <option value="Lotriderm®">(Antifungal) Lotriderm® - Betamethasone dipropionate 0.064% - Clotrimazole</option>
            <option value="Synalar C®">(Antibacterial) Synalar C® - Fluocinolone acetonide 0.025% - Clioquinol</option>
            <option value="Synalar N®">(Antifungal) Synalar N® - Fluocinolone acetonide 0.025% - Neomycin sulphate</option>
          </optgroup>
          <optgroup label="Very Potent">
            <option value="Clarelux®">Clarelux® - Clobetasol propionate 0.05%</option>
            <option value="Dermovate®">Dermovate® - Clobetasol propionate 0.05%</option>
            <option value="Etrivex®">Etrivex® - Clobetasol propionate 0.05%</option>
            <option value="Nerisone Forte®">Nerisone Forte® - Diflucortolone valerate 0.3%</option>
            <option value="Clobetasol with neomycin and nystatin">(Antibacterial, Antifungal) Clobetasol with neomycin and nystatin - Clobetasol propionate 0.05% - Neomycin, Nystatin</option>
          </optgroup>
        </datalist>

        <label for="bodySteroid">Trunk & Limbs Topical Steroid:</label>
        <input list="bodySteroidOptions" id="bodySteroidInput" required>
        <datalist id="bodySteroidOptions">
          <optgroup label="Mild">
            <option value="Dermacort®">Dermacort® - Hydrocortisone 0.1%</option>
            <option value="Dioderm®">Dioderm® - Hydrocortisone 0.1%</option>
            <option value="Hc45®">Hc45® - Hydrocortisone 1%</option>
            <option value="Hydrocortisone 0.5%">Hydrocortisone 0.5% - Hydrocortisone 0.5%</option>
            <option value="Hydrocortisone 1%">Hydrocortisone 1% - Hydrocortisone 1%</option>
            <option value="Hydrocortisone 2.5%">Hydrocortisone 2.5% - Hydrocortisone 2.5%</option>
            <option value="Mildison Lipocream®">Mildison Lipocream® - Hydrocortisone 1%</option>
            <option value="Synalar 1 in 10®">Synalar 1 in 10® - Fluocinolone acetonide 0.0025%</option>
            <option value="Zenoxone® cream">Zenoxone® cream - Hydrocortisone 1%</option>
            <option value="Canesten HC®">(AntiFungal) Canesten HC® - Hydrocortisone 1% - Clotrimazole</option>
            <option value="Daktacort®">(AntiFungal) Daktacort® - Hydrocortisone 1% - Miconazole nitrate</option>
            <option value="Fucidin H®">(Antibacterial) Fucidin H® - Hydrocortisone 1% - Fusidic acid</option>
            <option value="Nystaform HC®">(Antibacterial, Antifungal) Nystaform HC® - Hydrocortisone 0.5% - Chlorhexidine, Nystatin</option>
            <option value="Terra-Cortril®">(Antibacterial) Terra-Cortril® - Hydrocortisone 1% - Oxytetracycline</option>
            <option value="Timodine®">(Antibacterial, Antifungal) Timodine® - Hydrocortisone 0.5% - Benzalkonium chloride, Nystatin</option>
          </optgroup>
          <optgroup label="Moderate">
            <option value="Alphaderm®">Alphaderm® - Hydrocortisone 1%, urea 10%</option>
            <option value="Betnovate-RD®">Betnovate-RD® - Betamethasone valerate 0.025%</option>
            <option value="Clobavate®">Clobavate® - Clobetasone butyrate 0.05%</option>
            <option value="Eumovate®">Eumovate® - Clobetasone butyrate 0.05%</option>
            <option value="Haelan®">Haelan® - Fludroxycortide 0.0125%</option>
            <option value="Modrasone®">Modrasone® - Alclometasone dipropionate 0.05%</option>
            <option value="Synalar 1 in 4®">Synalar 1 in 4® - Fluocinolone acetonide 0.00625%</option>
            <option value="Trimovate®">(Antibacterial, Antifungal) Trimovate® - Clobetasone butyrate 0.05% - Oxytetracycline, Nystatin</option>
          </optgroup>
          <optgroup label="Potent">
            <option value="Ultralanum Plain®">Ultralanum Plain® - Fluocortolone hexanoate 0.25%</option>
            <option value="Betacap®">Betacap® - Betamethasone valerate 0.1%</option>
            <option value="Beclometasone dipropionate">Beclometasone dipropionate - Beclometasone dipropionate 0.025%</option>
            <option value="Betnovate®">Betnovate® - Betamethasone valerate 0.1%</option>
            <option value="Bettamousse®">Bettamousse® - Contains 1.2 mg betamethasone valerate 0.1%</option>
            <option value="Cutivate® ointment">Cutivate® ointment - Fluticasone propionate 0.005%</option>
            <option value="Cutivate® cream">Cutivate® cream - Fluticasone propionate 0.05%</option>
            <option value="Diprosalic®">Diprosalic® - Betamethasone dipropionate 0.05%</option>
            <option value="Diprosone®">Diprosone® - Betamethasone dipropionate 0.05%</option>
            <option value="Elocon®">Elocon® - Mometasone furoate 0.1%</option>
            <option value="Locoid®">Locoid® - Hydrocortisone butyrate 0.1%</option>
            <option value="Metosyn®">Metosyn® - Fluocinonide 0.05%</option>
            <option value="Nerisone®">Nerisone® - Diflucortolone valerate 0.1%</option>
            <option value="Synalar®">Synalar® - Fluocinolone acetonide 0.025%</option>
            <option value="Aureocort®">(Antibacterial) Aureocort® - Triamcinolone acetonide 0.1% - Chlortetracycline, hydrochloride</option>
            <option value="Betamethasone and clioquinol">(Antibacterial) Betamethasone and clioquinol - Betamethasone valerate 0.1% - Clioquinol</option>
            <option value="Betamethasone and neomycin">(Antibacterial) Betamethasone and neomycin - Betamethasone valerate 0.1% - Neomycin sulphate</option>
            <option value="Fucibet®">(Antibacterial) Fucibet® - Betamethasone valerate 0.1% - Fucidic acid</option>
            <option value="Lotriderm®">(Antifungal) Lotriderm® - Betamethasone dipropionate 0.064% - Clotrimazole</option>
            <option value="Synalar C®">(Antibacterial) Synalar C® - Fluocinolone acetonide 0.025% - Clioquinol</option>
            <option value="Synalar N®">(Antifungal) Synalar N® - Fluocinolone acetonide 0.025% - Neomycin sulphate</option>
          </optgroup>
          <optgroup label="Very Potent">
            <option value="Clarelux®">Clarelux® - Clobetasol propionate 0.05%</option>
            <option value="Dermovate®">Dermovate® - Clobetasol propionate 0.05%</option>
            <option value="Etrivex®">Etrivex® - Clobetasol propionate 0.05%</option>
            <option value="Nerisone Forte®">Nerisone Forte® - Diflucortolone valerate 0.3%</option>
            <option value="Clobetasol with neomycin and nystatin">(Antibacterial, Antifungal) Clobetasol with neomycin and nystatin - Clobetasol propionate 0.05% - Neomycin, Nystatin</option>
          </optgroup>
        </datalist>
      </div>

      <!-- Generate PDF Section -->
      <div class="form-section">
        <h3>Generate PDF</h3>
        <label for="generateOption">Generate:</label>
        <select id="generateOption" required>
          <option value="" disabled selected>Select an option</option>
          <option value="skinTreatmentPlan">Skin Treatment Plan</option>
          <option value="prescription">Prescription</option>
        </select>

        <button class="generate" onclick="generatePDFBasedOnSelection()">Generate</button>
      </div>

      <button type="button" id="backButton" onclick="prevStep()">Back</button>
      <button type="button" onclick="closeDialog()">Cancel</button>
    </div>
  </form>`;

  document.body.appendChild(dialog);

  dialog.showModal();

  const generatePdfButton = dialog.querySelector('#step2 button[class="generatepdf"]');
  const doctorName = dialog.querySelector('#doctorName');
  const doctorNameError = dialog.querySelector('#doctorNameError');

  doctorName.addEventListener('input', function () {
    const isEmpty = doctorName.value.trim() === "";
    generatePdfButton.disabled = !form.checkValidity();
    doctorNameError.style.display = isEmpty ? "inline" : "none";
  });

  // Handle form submission
  dialog.querySelector('form').addEventListener('submit', function (event) {
    event.preventDefault();
    generatePDFBasedOnSelection();
  });

  // form validity
  const form = dialog.querySelector('form');
  form.addEventListener('input', function () {
    generatePdfButton.disabled = !form.checkValidity();
  });
}

function generatePDFBasedOnSelection() {
  const selectedOption = document.getElementById('generateOption').value;

  if (selectedOption === "skinTreatmentPlan") {
    generatePDF();
  } else if (selectedOption === "prescription") {
    generatePDFPrescription();
  }
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