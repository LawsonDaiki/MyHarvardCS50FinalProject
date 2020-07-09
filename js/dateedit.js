let currenntEditDateId = null;

const editDateModal = document.querySelector("#edit-date-modal");

const editModalCloseButton = document.querySelector("#editDateCloseBtn");

const editDateInput = document.querySelector("#editDate");

const editDateButton = document.querySelector("#edit-date");

// When close button is clicked at the modal
editModalCloseButton.addEventListener("click", function() {
    editDateModal.style.display = "none";
});

// Listen to outside click
window.addEventListener("click", outsideClick);
// Function to close modal if outside click
function outsideClick(event) {
    if(event.target == editDateModal) {
        editDateModal.style.display = "none";
    }
    return;
}

// Open the edit date modal with the default value of the respective travelDateId
function openDateEditModal(travelDateId) {
    editDateModal.style.display = "block";

    document.querySelector("#edit-date-error-message").innerHTML = ""; // Clear previus error mesage

    currenntEditDateId = travelDateId;

    // Find the date of the respective date id
    let dateEpoch = null;
    for (let i = 0; i < travelDates.length; i++) if (travelDates[i].id == currenntEditDateId) dateEpoch = travelDates[i].date;

    // Transform the date to a string that the input will read, then input the default value
    const dateFormat = new Date(dateEpoch);
    const dateUTCSting = dateFormat.toUTCString();
    const dateArray = dateUTCSting.split(" ");
    const dateAsDefault = dateArray[3] + "-" + monthNameToMonthNumber(dateArray[2]) + "-" + dateArray[1];
    editDateInput.value = dateAsDefault;

    return;
}

function showErrorMessagesEditDateModal(errors) {
    // Get ul where the error mesage is displayed
    const ul = document.querySelector("#edit-date-error-message");
    // Clear the previus message
    ul.innerHTML = "";

    errors.forEach(function(error){
        let li = document.createElement("li");
        li.textContent = error;
        ul.appendChild(li);
    });
}

function updatePlacesToNewDate(dateId, newDate) {
    // Search for the old date
    let oldDate = null;
    for (let i = 0; i < travelDates.length; i++) if (travelDates[i].id == dateId) oldDate = travelDates[i].date;

    // Search for the places in the old date
    for (let i = 0; i < places.length; i++) {
        if (places[i].arrival_time >= oldDate && places[i].arrival_time < (oldDate + oneDayInMilliseconds)) {
            places[i].arrival_time = newDate + (places[i].arrival_time % oneDayInMilliseconds);
            places[i].departure_time = newDate + (places[i].departure_time % oneDayInMilliseconds);
        }
    }

    return;
}

// When the EDIT date button is clicked
editDateButton.addEventListener("click", function(event) {
    event.preventDefault();

    // Get inputed date and transform to epoch time in milliseconds
    const inputedDateFormat = new Date(editDateInput.value);
    const inputedDateEpoch = inputedDateFormat.getTime();

    const errorMessage = checkDate(inputedDateEpoch);

    if(errorMessage.length > 0){
        showErrorMessagesEditDateModal(errorMessage);
        return;
    }

    // Update all the places in the date
    updatePlacesToNewDate(currenntEditDateId, inputedDateEpoch);

    // Search for the respective date of the current editing date id and change the date
    for (let i = 0; i < travelDates.length; i++) {
        if (travelDates[i].id == currenntEditDateId) {
            travelDates[i].date = inputedDateEpoch;
            break;
        }
    }

    sortDates();

    // Clear the last table and markers
    clearTable();
    clearMarkers()
    clearDatesSection();

    printDatesSection(travelDates);
    createDatesRadioButtonsAtAddPlaceModal(travelDates);
    createDatesRadioButtonsAtEditPlaceModal(travelDates);

    printTable();

    // Close edit date modal
    editDateModal.style.display = "none";
});

// When the 'DELETE' button is clicked
const deleteDateButton = document.querySelector("#delete-date");
deleteDateButton.addEventListener("click", function (event) {
    event.preventDefault();
    
    // Search for the date in 'travelDates' array and delete the date
    let dateToDelete = null;
    for (let i = 0; i < travelDates.length; i++) {
        if (travelDates[i].id == currenntEditDateId) {
            dateToDelete = travelDates[i];
            travelDates.splice(i, 1);
        }
    }

    // Search for the places inside that date and delete then
    let indexesToDelete = [];
    if (places) {
        for (let i = 0; i < places.length; i++) {
            if (places[i].arrival_time >= dateToDelete.date && places[i].arrival_time < (dateToDelete.date + oneDayInMilliseconds)) indexesToDelete.push(i);
        }
        for (let i = 0; i < indexesToDelete.length; i++) {
            places.splice(indexesToDelete[i] - i, 1);
        }
    }

    // Clear the last table and markers
    clearMarkers()
    clearDatesSection();

    printDatesSection();
    createDatesRadioButtonsAtAddPlaceModal();
    createDatesRadioButtonsAtEditPlaceModal();
    printTable();

    // Close edit date modal
    editDateModal.style.display = "none";
});