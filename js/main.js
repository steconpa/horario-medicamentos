const form = document.querySelector('form');
const startSleepTime = document.getElementById('start_sleep_time');
const endSleepTime = document.getElementById('end_sleep_time');

const medicationTemplate = document.querySelector('#medication-template');
const medicationContainer = document.querySelector('#medications-container');
const addMedButton = document.getElementById('add-med-button');
let medicationIndex = document.querySelectorAll('.drug').length;

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
    validateSleepingSchedule();
    validateDatesTreatmentBegins();
    validateDrugNameInputs();
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
  const limitDate = getDateXDaysFromNow(20);

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

function getDateXDaysFromNow( numberDays ) {
  const date = new Date();
  date.setDate(date.getDate() + numberDays);
  date.setHours(0, 0, 0, 0);
  return date;
}

function getDateFromInput(input) {
  const date = new Date(input.value + "T00:00:00.000");
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

function showError(input, message) {
  input.classList.add("invalid-input");
  input.nextElementSibling.innerText = message;
}

function clearError(input) {
  input.classList.remove("invalid-input");
  input.nextElementSibling.innerText = "";
}

