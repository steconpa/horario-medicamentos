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
    validateDrugNames();
});

function validateSleepingSchedule(){
  const startTime = new Date(`2000-01-01T${startSleepTime.value}:00Z`);
  const endTime = new Date(`2000-01-01T${endSleepTime.value}:00Z`);
  let timeDifference  = endTime - startTime;

  if (timeDifference  < 0) {
    timeDifference  += 24 * 3600000;
  }

  const hoursDifference = timeDifference /3600000

  if (hoursDifference < 6 || hoursDifference > 10) {
    const errorMessage = `Ha indicado ${hoursDifference.toFixed(2)} horas para dormir. Se recomienda que sean entre 6 a 10 horas. Por favor, corrija los datos introducidos`;

    endSleepTime.classList.add("invalid-input");
    endSleepTime.nextElementSibling.innerText = errorMessage;
    return false;
  } else {
    endSleepTime.classList.remove("invalid-input");
    endSleepTime.nextElementSibling.innerText = "";
    return true;
  }
}

function validateDatesTreatmentBegins() {
  // Obtener todos los inputs de fecha
  const inputsDates = medicationContainer.querySelectorAll("input[type='date']");
  
  // Obtener la fecha actual
  const actualDate = new Date();
  actualDate.setHours(0, 0, 0, 0);

  // Obtener la fecha límite (20 días después de la fecha actual)
  const limitDate = new Date(actualDate.getTime() + (3600000 * 24 * 20))

  // Establecer el valor de isValid en true
  let isValid = true;

  // Validar cada input
  for (let i = 0; i < inputsDates.length; i++) {
    const dateInput = new Date(`${inputsDates[i].value}T00:00:00.000`);

    if (!inputsDates[i] || dateInput < actualDate || dateInput > limitDate ) {
      // Si la fecha no es válida, agregar una clase y mostrar un mensaje de error
      let errorMessage = `La fecha ${dateInput.toLocaleDateString('es-ES', {day: 'numeric', month: 'numeric', year: 'numeric'})} no es valida. `;
      errorMessage += `Verifique que no sea anterior al ${actualDate.toLocaleDateString('es-ES', {day: 'numeric', month: 'numeric', year: 'numeric'})}, `;
      errorMessage += `ni mayor al ${limitDate.toLocaleDateString('es-ES', {day: 'numeric', month: 'numeric', year: 'numeric'})}, `;
      
      inputsDates[i].classList.add("invalid-input");
      inputsDates[i].nextElementSibling.innerText = errorMessage;
      isValid = false;
    } else{
      // Si la fecha es válida, eliminar la clase y el mensaje de error
      inputsDates[i].classList.remove("invalid-input");
      inputsDates[i].nextElementSibling.innerText = "";
      isValid = true;
    }
  }
  // Devolver el valor de isValid
  return isValid;
}

function validateDrugNames() {
  const drugNameInputs = medicationContainer.querySelectorAll("input[type='text'][id*='drug-name']");

  const drugNames = [];
  
  // Establecer el valor de isValid en true
  let isValid = true;

  for (let i = 0; i < drugNameInputs.length; i++) {
    const drugNameInput = drugNameInputs[i];
    const drugName = drugNameInput.value.trim();
    let errorMessage = "";
    console.log(drugName);

    if (!drugName || drugName.length < 4 || drugName.length > 100) {
      errorMessage = `El nombre del medicamento puede tener entre 4 y 100 caracteres.`;
      drugNameInput.classList.add("invalid-input");
      drugNameInput.nextElementSibling.innerText = errorMessage;
      isValid = false;
    }else {
      if (drugNames.includes(drugName)) {
      errorMessage = `El valor ${drugName} ya ha sido ingresado en otro campo.`;
      drugNameInput.classList.add("invalid-input");
      drugNameInput.nextElementSibling.innerText = errorMessage;
      isValid = false;
    }else {
      drugNameInput.classList.remove("invalid-input");
      drugNameInput.nextElementSibling.innerText = "";
      isValid = true;
    }
  }
    drugNames.push(drugName);
  }
  return isValid;
}

