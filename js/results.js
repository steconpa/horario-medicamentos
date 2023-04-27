const resultsContainer = document.getElementById('results-section');
const treatmentPlan = JSON.parse(localStorage.getItem('newTreatment'));
console.log(treatmentPlan);

function getDatesArray(){
const datesArray = [];

treatmentPlan._controlDates.forEach(controlDate => {
  const convetedDate = new Date(controlDate.date);
  datesArray.push(convetedDate);
});

datesArray.sort((a, b) => a - b);
console.log(datesArray);
}

function convertDates(plan) {
  for (let i = 0; i < plan.length; i++) {
    const step = plan[i];
    const dateKeys = ['startDate', 'endDate']; // modify this array if there are other key names for date values
    
    // convert date strings to date objects for each step in the treatment plan
    dateKeys.forEach(key => {
      if (step.hasOwnProperty(key)) {
        step[key] = new Date(step[key]);
      }
    });
  }

  // update the treatment plan in localStorage with the converted date values
  localStorage.setItem('newTreatment', JSON.stringify(plan));
}
getDatesArray();
convertDates(treatmentPlan);