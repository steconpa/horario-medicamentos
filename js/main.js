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
  const inputsDates = medicationContainer.querySelectorAll("input[type='date']");
  const actualDate = new Date();
  const limitDate = new Date(actualDate.getTime() + (3600000 * 24 * 20))

  for (let i = 0; i < inputsDates.length; i++) {
    var dateBeginsInput = inputsDates[i];
    var dateInput = new Date(dateBeginsInput.value);

    if (!dateBeginsInput || dateInput < actualDate || dateInput > limitDate ) {
      alert( dateInput + " fecha invalida.");
      return false;
    }
  }
  return true;
}

