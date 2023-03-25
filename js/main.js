class Medication {
  constructor(name, dosage, frequency, duration, dateBegins, overlapping) {
    this._name = name;
    this._dosage = dosage;
    this._startDate = dateBegins;
    this._endDate = getDateXDaysFromDate(this._startDate, duration);
    this._frequency = this.getDatesBetween(this._startDate, this._endDate, frequency);
    this._overlapping = overlapping;
  }

  getDatesBetween(startDate, endDate, frequency) {
    const dates = [];
    let currentDate = new Date(startDate);
  
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setHours(currentDate.getHours() + frequency);
    }
  
    return dates;
  }
}


const form = document.querySelector('form');
const startSleepTime = document.getElementById('start_sleep_time');
const endSleepTime = document.getElementById('end_sleep_time');

const medicationTemplate = document.querySelector('#medication-template');
const medicationContainer = document.querySelector('#medications-container');
const addMedButton = document.getElementById('add-med-button');
let medicationIndex = document.querySelectorAll('.drug').length;
let treatmentDrugs = [];

const removeMedButton = document.querySelector('#remove-med-button');

addMedButton.addEventListener('click', (event) => {
    // Clonar el template del medicamento y crear un nuevo fragmento
    medicationIndex++;
    const newMedication = document.importNode(medicationTemplate.content, true);
    const fragment = document.createDocumentFragment();
    
    // Cambiar el valor de los atributos id y name para que sean únicos
    newMedication.querySelectorAll('.label-medication').forEach(element => {
        element.setAttribute('for', element.getAttribute('for').replace(/\d+$/, medicationIndex));
    });
    
    newMedication.querySelectorAll('[id]').forEach(element => {
        element.id = element.id.replace(/\d+$/, medicationIndex);
    });
    
    newMedication.querySelectorAll('[name]').forEach(element => {
        element.name = element.name.replace(/\d+$/, medicationIndex);
    });
    
    // Agregar el nuevo grupo de campos de medicamentos al fragmento
    fragment.appendChild(newMedication);
    
    // Agregar el fragmento al contenedor
    medicationContainer.appendChild(fragment);
});

removeMedButton.addEventListener('click', (event) => {
    const medications = medicationContainer.querySelectorAll('.drug');
    
    if (medications.length > 1) {
      medicationContainer.removeChild(medications[medications.length - 1]);
      medicationIndex--;
    }
  });

form.addEventListener('submit', (event) => {
    event.preventDefault();
    if(validateSleepingSchedule() &&
    validateDatesTreatmentBegins() &&
    validateDrugNameInputs() &&
    validateDosageInputs()){
      processMedicationForm();
    }
});

function validateSleepingSchedule(){
  const startTime = new Date(`2000-01-01T${startSleepTime.value}:00Z`);
  const endTime = new Date(`2000-01-01T${endSleepTime.value}:00Z`);
  const timeDifference = (endTime - startTime + 24 * 3600000) % (24 * 3600000);
  const hoursDifference = timeDifference /3600000

  if (hoursDifference < 6 || hoursDifference > 10) {
    const errorMessage = `Ha indicado ${hoursDifference.toFixed(2)} horas para dormir. 
    Se recomienda que sean entre 6 a 10 horas. Por favor, corrija los datos introducidos`;

    showError(endSleepTime, errorMessage);
    return false;
  } else {
    clearError(endSleepTime);
    return true;
  }
}

function validateDatesTreatmentBegins() {
  // Obtener todos los inputs tipo fecha
  const inputsDates = medicationContainer.querySelectorAll("input[type='date']");
  const actualDate = getTodayAtMidnight();
  const limitDate = getDateXDaysFromDate(actualDate, 20);

  // Validar cada input
  for (const input of inputsDates) {

    const dateInput = getDateFromInput(input);
    let errorMessage = validateDateInput(dateInput, actualDate, limitDate);

    if ( errorMessage ) {
      showError(input, errorMessage);
      return false;
    } else{
      clearError(input);
    }
  }
  return true;
}

function getTodayAtMidnight() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function getDateXDaysFromDate(date, numberDays ) {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + numberDays);
  newDate.setHours(23, 59, 59, 0);
  return newDate;
}

function getDateFromInput(input) {
  const time = getSleepTime();
  const date = new Date(input.value + `T${time}`);
  return isNaN(date.getTime()) ? null : date;
}

function validateDateInput(date, minDate, maxDate) {
  if (!date) {
    return 'Por favor ingrese la fecha en la que inicia el tratamiento.';
  } else if (date < minDate || date > maxDate) {
    return `La fecha ${formatDate(date)} no es válida. Debe estar entre ${formatDate(minDate)} y ${formatDate(maxDate)}.`;
  }

  return null; // no hay errores
}

function formatDate(date) {
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "numeric", year: "numeric" });
}

/**
 * Valida los inputs con los nombres de los medicamentos
 * @return {boolean} True si todas las entradas son validas.
 */
function validateDrugNameInputs() {
  const drugNameInputs = medicationContainer.querySelectorAll("input[type='text'][id*='drug-name']");

  const drugNames = new Set();

  for (const drugNameInput of drugNameInputs) {

    const { value: drugName } = drugNameInput;

    let errorMessage = validateDrugName(drugName, drugNames);

    if (errorMessage) {
      showError(drugNameInput, errorMessage);
      return false; // detiene las validaciones con el primer error
    } else {
      clearError(drugNameInput);
    }
    drugNames.add(drugName);
  }
  return true;
}

/**
 * Validaciones del nombre del medicamento
 * @param {string} drugName nombre del medicamento que se va a validar.
 * @param {Set} existingNames The set of rejected drug names.
 * @return {?string} restorna el mensaje de error o null si el nombre es valido.
 */
function validateDrugName(drugName, existingNames) {
  if (!drugName) {
    return 'Por favor ingrese el nombre del medicamento.';
  } else if (drugName.length < 4 || drugName.length > 100) {
    return 'El nombre del medicamento debe tener entre 4 y 100 caracteres.';
  } else if (existingNames.size > 0 && existingNames.has(drugName)) {
    return `El medicamento “${drugName}” ya ha sido ingresado en otro campo.`;
  }

  return null; // no hay errores
}

function validateDosageInputs() {
  const drugDosageInputs = medicationContainer.querySelectorAll("input[type='text'][id*='drug-dosage']");

  for (const drugDosageInput of drugDosageInputs) {

    const { value: drugDosage } = drugDosageInput;

    let errorMessage = validateDrugDosage(drugDosage);

    if (errorMessage) {
      showError(drugDosageInput, errorMessage);
      return false; // detiene las validaciones con el primer error
    } else {
      clearError(drugDosageInput);
    }
  }
  return true;
}

function validateDrugDosage(drugDosage){
  if (!drugDosage) {
    return 'Por favor ingrese la dosis del medicamento.';
  } else if (drugDosage.length < 4 || drugDosage.length > 100) {
    return 'La dosis del medicamento debe tener entre 4 y 100 caracteres.';
  }
}

function showError(input, message) {
  input.classList.add("invalid-input");
  input.nextElementSibling.innerText = message;
}

function clearError(input) {
  input.classList.remove("invalid-input");
  input.nextElementSibling.innerText = "";
}

function processMedicationForm() {
  
  const medications = medicationContainer.querySelectorAll('.drug');

  medications.forEach((medication) => {
    const drugName = medication.querySelector('.drug-name').value;
    const drugDosage = medication.querySelector('.drug-dosage').value;
    const drugFrequency = parseInt(medication.querySelector('.drug-frequency').value);
    const drugDuration = parseInt(medication.querySelector('.treatment-duration').value);
    const dateBeginsInput = medication.querySelector('.date-treatment-begins');
    const dateBegins = getDateFromInput(dateBeginsInput);
    const drugOverlapping = medication.querySelector('.drug-overlapping').checked;

    const medicamento = new Medication (drugName, drugDosage, drugFrequency, drugDuration, 
      dateBegins, invertCheckboxValue(drugOverlapping) );

    treatmentDrugs.push(medicamento);
  });

  // Hacer algo con el array de medicamentos, como enviarlo al servidor
  console.log(treatmentDrugs);
}

function invertCheckboxValue(booleanValue) {
  return booleanValue = !booleanValue;
}

function getSleepTime() {
  const beforeStarting = form.querySelector('#before-starting');
  const startSleepTime = form.querySelector('#start_sleep_time');
  const endSleepTime = form.querySelector('#end_sleep_time');
  
  if (beforeStarting.checked) {
    return endSleepTime.value;
  } else {
    return startSleepTime.value;
  }
}