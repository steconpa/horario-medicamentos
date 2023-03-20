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
    const container = document.querySelector('#medications-container');
    const medications = container.querySelectorAll('.drug');
    
    if (medications.length > 1) {
      container.removeChild(medications[medications.length - 1]);
      medicationIndex--;
    }
  });

form.addEventListener('submit', (event) => {
    event.preventDefault();
    validateSleepingSchedule();
});

function validateSleepingSchedule(){
    const startTime = new Date(`1970-01-01T${startSleepTime.value}`);
    const endTime = new Date(`1970-01-01T${endSleepTime.value}`);
    const timeDiff = Math.abs(endTime - startTime) / 3600000;

  if (timeDiff < 6 || timeDiff > 10) {
    alert(timeDiff+"El horario de sueño no es válido. Por favor, verifica los valores ingresados.");
    return false;
  }
}
