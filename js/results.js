class Medication {
  constructor(name, dosage, frequency, duration, dateBegins, overlapping) {
    this._name = name;
    this._dosage = dosage;
    this._startDate = dateBegins;
    this._overlapping = overlapping;
    // Fecha de finalización del tratamiento (calculada a partir de la duración)
    this._endDate = getDateXDaysFromDate(this._startDate, duration);
    // Array de fechas en las que se debe tomar el medicamento (calculado a partir de la frecuencia)
    this._frequency = this.getDatesBetween(this._startDate, this._endDate, frequency, this._overlapping);
  }

  // Función que calcula todas las fechas en las que se debe tomar el medicamento
  getDatesBetween(startDate, endDate, frequency, overlapping) {
    // Array para almacenar las fechas
    const dates = [];
    // Inicializa fecha actual con la fecha de inicio del tratamiento
    let currentDate = new Date(startDate);
  
    // Mientras la fecha actual sea menor o igual a la fecha de finalización del tratamiento
    while (currentDate <= endDate) {

      // Si la fecha no es válida debido a que se solapa con otra fecha de otro medicamento
      if (!this.isValidDate( currentDate, overlapping )) {

        // Se aumenta en una hora la fecha actual y se continúa con la siguiente iteración
        currentDate.setHours(currentDate.getHours() + 1);
        continue;
      }

      // Si la fecha es válida, se añade al array de fechas del medicamento actual
      dates.push(new Date(currentDate));
      // Se aumenta la fecha actual en la frecuencia indicada por el usuario
      currentDate.setHours(currentDate.getHours() + frequency);
    }

    // Se devuelve el array con todas las fechas
    return dates;
  }

  /* Valida si una fecha es válida para la creación de un nuevo medicamento.
  La fecha no debe coincidir con las fechas de frecuencia de otros medicamentos, a menos que ambos medicamentos permitan el solapamiento.
  @param {Date} date - Fecha a validar.
  @param {boolean} overlapping - Indica si se permite el solapamiento de fechas.
  @returns {boolean} - Retorna true si la fecha es válida, o false si ya está ocupada por otro medicamento.*/
  isValidDate(date, overlapping) {
    const frequencyDates = Object.keys(medicationFrequencies);

    // Si no hay medicamentos anteriores, la fecha es válida
    if (frequencyDates.length === 0) {
      return true;
    }
  
    // Validar que la fecha no coincida con la frecuencia de otro medicamento
    for (let frequencyDate of frequencyDates) {

      const medicationDates = medicationFrequencies[frequencyDate];
      const fechaFrecuencia = new Date(frequencyDate);
      // Si la fecha coincide con una fecha de un medicamento anterior
      if (fechaFrecuencia.getTime() === date.getTime()) {
        
        for (let medication of medicationDates) {
          const medicationOverlapping = medication._overlapping;
  
          // Si el solapamiento no está permitido y la fecha coincide con una fecha ocupada
          if (medicationOverlapping === false) {
            return false;
          }
  
          // Si el solapamiento está permitido pero el nuevo medicamento no lo permite
          if (medicationOverlapping === true && overlapping === false) {
            return false;
          }
        }
      }
    }
  
    // Si la fecha no coincide con ninguna fecha de otro medicamento o ambos permiten el solapamiento, es válida
    return true;
  }

  getFrequencyDates() {
  return this._frequency;
}
  
}

const form = document.querySelector('form');
const startSleepTime = document.getElementById('start_sleep_time');
const endSleepTime = document.getElementById('end_sleep_time');

const medicationTemplate = document.querySelector('#medication-template');
const medicationContainer = document.querySelector('#medications-container');
const addMedButton = document.getElementById('add-med-button');
let medicationIndex = document.querySelectorAll('.drug').length;
const medicationFrequencies = {};

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
    const sleepingScheduleValid = validateSleepingSchedule();
    const datesBeginsValid = validateDatesTreatmentBegins();
    const drugNameInputsValid = validateDrugNameInputs();
    const dosageInputsValid = validateDosageInputs();

    if(sleepingScheduleValid && datesBeginsValid
      && drugNameInputsValid && dosageInputsValid ){
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
  return date.toLocaleDateString("default", { day: "numeric", month: "numeric", year: "numeric" });
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
    const values = getMedicationValues(medication);
    const medicationObject = createMedicationObject(values);
    processFrequencyDates(medicationObject);
  });
  console.log(medicationFrequencies);
}

function getMedicationValues(medication) {
  const drugName = medication.querySelector('.drug-name').value;
  const drugDosage = medication.querySelector('.drug-dosage').value;
  const drugFrequency = parseInt(medication.querySelector('.drug-frequency').value);
  const drugDuration = parseInt(medication.querySelector('.treatment-duration').value);
  const dateBeginsInput = medication.querySelector('.date-treatment-begins');
  const dateBegins = getDateFromInput(dateBeginsInput);
  const drugOverlapping = medication.querySelector('.drug-overlapping').checked;

  return {
    drugName,
    drugDosage,
    drugFrequency,
    drugDuration,
    dateBegins,
    drugOverlapping,
  };
}

function createMedicationObject(values) {
  console.log(values);
  const medicationObject = new Medication(
    values.drugName,
    values.drugDosage,
    values.drugFrequency,
    values.drugDuration,
    values.dateBegins,
    invertCheckboxValue(values.drugOverlapping)
  );
  console.log(medicationObject);
  return medicationObject;
}

function invertCheckboxValue(booleanValue) {
  return booleanValue = !booleanValue;
}

function processFrequencyDates(medication) {
  const medicationFrequencyDates = medication.getFrequencyDates();

  medicationFrequencyDates.forEach((frequencyDate) => {
    if (!medicationFrequencies[frequencyDate]) {
      medicationFrequencies[frequencyDate] = [];
    }
    medicationFrequencies[frequencyDate].push(medication);
  });
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