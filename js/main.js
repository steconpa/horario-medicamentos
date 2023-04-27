class Medication {
  constructor(name, dosage, frequency, duration, dateBegins, overlapping, controlDates) {
    this._name = name;
    this._dosage = dosage;
    this._startDate = dateBegins;
    this._overlapping = overlapping;
    // Fecha de finalización del tratamiento (calculada a partir de la duración)
    this._endDate = getDateXDaysFromDate(this._startDate, duration);
    // Array de fechas en las que se debe tomar el medicamento (calculado a partir de la frecuencia)
    this._frequency = this.getFrequencyArray(frequency, controlDates);
  }

  // Función que calcula todas las fechas en las que se debe tomar el medicamento
  getFrequencyArray(frequency, controlDates) {
    // Array para almacenar las fechas
    const frequencyArr = [];
    // Inicializa fecha actual con la fecha de inicio del tratamiento
    let currentDate = new Date(this._startDate);
  
    // Mientras la fecha actual sea menor o igual a la fecha de finalización del tratamiento
    while (currentDate <= this._endDate) {

      // Si la fecha no es válida debido a que se solapa con otra fecha de otro medicamento
      if (!this.isValidDate( currentDate, controlDates )) {

        // Se aumenta en una hora la fecha actual y se continúa con la siguiente iteración
        currentDate.setHours( currentDate.getHours() + 1 );
        continue;
      }

      // Si la fecha es válida, se añade al array de fechas del medicamento actual
      frequencyArr.push(new Date(currentDate));
      // Se aumenta la fecha actual en la frecuencia indicada por el usuario
      currentDate.setHours(currentDate.getHours() + frequency);
    }

    // Se devuelve el array con todas las fechas
    return frequencyArr;
  }

  isValidDate(date, controlDates) {
    // Si no hay medicamentos anteriores, la fecha es válida
    if (!controlDates.length) {
      return true;
    }
  
    // Validar que la fecha no coincida con la frecuencia de otro medicamento
    for (let treatmentDate of controlDates) {

      const overlappingTreatmentDate = treatmentDate.overlapping;
      const dateTreatmentDate = treatmentDate.date;
      // Si la fecha coincide con una fecha de un medicamento anterior
      if (dateTreatmentDate.getTime() === date.getTime()) {

          // Si el solapamiento no está permitido y la fecha coincide con una fecha ocupada
          if (overlappingTreatmentDate === false) {
            return false;
          }
  
          // Si el solapamiento está permitido pero el nuevo medicamento no lo permite
          if (overlappingTreatmentDate === true && this._overlapping === false) {
            return false;
          }
        }
    }
  
    // Si la fecha no coincide con ninguna fecha de otro medicamento o ambos permiten el solapamiento, es válida
    return true;
  }
  
}

class TreatmentPlan {
  constructor(){
    this._medications = [];
    this._controlDates = [];
  }
  
  addMedicationToTreatment(medicationObject){
    this._medications.push(medicationObject);
  }
  
  addDatesToTreatment(medicationObject){
    const overlappingValue = medicationObject._overlapping;
    const datesFrecuncy = medicationObject._frequency;

    for(const dateValue of datesFrecuncy) {
      const dateOverlapping = {
        date: dateValue,
        overlapping: overlappingValue
      };

      if(!this._controlDates.length){
        this._controlDates.push(dateOverlapping);
      }

      // Verificar si la fecha ya existe en el array _controlDates
      const existingDate = this._controlDates.find(controlDate => controlDate.date.getTime() === dateValue.getTime());
      if (!existingDate) {
        this._controlDates.push(dateOverlapping)
      }
    }
    console.log(this._controlDates);
  }

  get getControlDates() {
    return this._controlDates;
  }
}

const form = document.querySelector('form');
const startSleepTime = document.getElementById('start-sleep-time');
const endSleepTime = document.getElementById('end-sleep-time');

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
    const sleepingScheduleValid = validateSleepingSchedule();
    const datesBeginsValid = validateDatesTreatmentBegins();
    const drugNameInputsValid = validateDrugNameInputs();
    const dosageInputsValid = validateDosageInputs();

    if(sleepingScheduleValid && datesBeginsValid
      && drugNameInputsValid && dosageInputsValid ){
      const newTreatmentCreated = processMedicationForm();
      console.log(newTreatmentCreated);
      localStorage.setItem('newTreatment', JSON.stringify(newTreatmentCreated));
      //window.location.href = 'results.html';
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

function getSleepTime() {
  const beforeStarting = form.querySelector('#before-starting');
  const startSleepTime = form.querySelector('#start-sleep-time');
  const endSleepTime = form.querySelector('#end-sleep-time');
  
  if (beforeStarting.checked) {
    return endSleepTime.value;
  } else {
    return startSleepTime.value;
  }
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
  const newTreatment = new TreatmentPlan();
  let treatmentControlDates = newTreatment._controlDates;

  medications.forEach((medication) => {
    const values = getMedicationValues(medication);
    const medicationObject = createMedicationObject(values, treatmentControlDates);
    newTreatment.addMedicationToTreatment(medicationObject);
    newTreatment.addDatesToTreatment(medicationObject);
    treatmentControlDates = newTreatment.getControlDates;
  });

  return newTreatment;
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

function createMedicationObject(values, controlDates) {
  const medicationObject = new Medication(
    values.drugName,
    values.drugDosage,
    values.drugFrequency,
    values.drugDuration,
    values.dateBegins,
    invertCheckboxValue(values.drugOverlapping),
    controlDates
  );
  console.log(medicationObject);
  return medicationObject;
}

function invertCheckboxValue(booleanValue) {
  return booleanValue = !booleanValue;
}