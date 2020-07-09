if (!travelDates) travelDates = [];

const addDayModal = document.querySelector("#add-day-modal")

// OPEN add day modal when add day button is clicked
const openAddDayModalButton = document.querySelector("#open-add-day-modal");
openAddDayModalButton.addEventListener("click", function() {
    addDayModal.style.display = "block";
    inputADateAsDefaultValue();

    // Set auto focus to the add local button
    document.getElementById('add-day-button').focus();
    
    return;
});

// Close add day modal when the close button is clicked
const closeAddDayButton = document.querySelector("#addDayCloseBtn");
closeAddDayButton.addEventListener("click", function() {
    addDayModal.style.display = "none";
    return;
});

// Listen to outside click
window.addEventListener("click", outsideClick);
// Function to close modal if outside click
function outsideClick(event) {
    if(event.target == addDayModal) {
        addDayModal.style.display = "none";
    }
    return;
}

// Function to clear the dates section
function clearDatesSection() {
    const dateContainer = document.querySelector(".dates-container");
    dateContainer.innerHTML="";
    return;
}

// Create a div of the edit button
function createEditDateButton(tdClass, id) {
    const td = document.createElement("div");
    td.classList.add(tdClass);
    td.setAttribute("id", `${id}EditDateId`);
    return td;
}

// Check if the date is valid. Verify if the day is in the future and if has already been taken
// 'time' parameter is in epoch time in milliseconds
function checkDate(time) {
    let today = new Date();
    today = today.getTime() - (today.getTime() % oneDayInMilliseconds); // Convert 'today' in multiple of a entire date
    let errors = []

    if (isNaN(time)) errors.push("Must provide a date.");

    if (time < today) errors.push("Date must be in the future.");

    // Search for a date conflict
    for (let i = 0; i < travelDates.length; i++) {
        if (travelDates[i].date == time) {
            errors.push("Date conflict.");
            break;
        }
    }

    return errors;
}

// Manipulate DOM to create a dates tables section at the display
function printDatesSection() {
    clearDatesSection();
    if (!travelDates) travelDates = [];
    travelDates.forEach(function(travelDate){

        // Create title with a date
        const dateTitle = document.createElement("div");
        let travelDateStr = new Date(travelDate.date);
        travelDateStr = travelDateStr.toUTCString().split(" ");
        dateTitle.textContent = travelDateStr[0] + " " + travelDateStr[1] + " " + travelDateStr[2] + " " + travelDateStr[3];
        dateTitle.classList.add("date-title");
        dateTitle.setAttribute("id", `${travelDate.id}dateTitle`);

        // Create edit button and add event listener
        const editButton = createEditDateButton("edit-date-button-class", travelDate.id)
        editButton.addEventListener("click", function() {
            openDateEditModal(travelDate.id);
        });

        // Create table
        const dateTable = document.createElement("div");
        dateTable.classList.add("date-table");
        dateTable.setAttribute("id", `${travelDate.id}dateTable`)

        // Attach an event listener for the drag and drop
        dateTable.addEventListener("dragover", (event) => {
            event.preventDefault();
            const afterElement = getDragAfterElement(dateTable, event.clientY)
            const dragged = document.querySelector(".dragging");
            draggedOverDateId = travelDate.id;
            if (afterElement == null) {
                dateTable.appendChild(dragged)
                belowTargetPlaceId = null;

            } else {
                dateTable.insertBefore(dragged, afterElement)
                belowTargetPlaceId = parseInt(afterElement.id,10);
            }
        });

        // Create div
        const dateDiv = document.createElement("div");
        dateDiv.classList.add("date-div");
        dateDiv.setAttribute("id", `${travelDate.id}dateDiv`);

        // Create header
        const header = document.createElement("div");
        header.classList.add("date-header");
        header.classList.add(`date-header-id-${travelDate.id}`);
        header.appendChild(dateTitle);
        header.appendChild(editButton);

        // Create div to insert the places
        const placesDiv = document.createElement("div");
        placesDiv.setAttribute("class", "places-div");
        placesDiv.setAttribute("id", `${travelDate.id}placesDiv`);
        placesDiv.appendChild(dateTable);

        dateDiv.appendChild(header);
        dateDiv.appendChild(placesDiv);
        const getDatesSection = document.querySelector(".dates-container");
        getDatesSection.appendChild(dateDiv);

        // Add style to display edit button when hover over place row
        var css = `.date-header-id-${travelDate.id}:hover .edit-date-button-class { display: block; }`;
        var style = document.querySelector('#dateHeaderStyleSheet');
        style.appendChild(document.createTextNode(css));
    });

    return;
}

// Create the dates radio input at the Add Place Modal
function createDatesRadioButtonsAtAddPlaceModal() {
    // Clear previus radio input
    const getDateInput = document.getElementById("dateInput-addModal");
    getDateInput.innerHTML = "";

    // Create a radio input for each date
    travelDates.forEach(function(travelDate){
        const dateInput = document.createElement("input");
        // Set all the attributes for the input
        dateInput.setAttribute("type", "radio");
        dateInput.setAttribute("id", `${travelDate.id}dateId-addModal`);
        dateInput.setAttribute("name", `travelDates-addModal`);
        dateInput.setAttribute("value", `${travelDate.id}dateId-addModal`);

        const dateLabel = document.createElement("label");
        // Set all the attributes for the label
        dateLabel.setAttribute("class", "add-place-modal-date-label")
        dateLabel.setAttribute("for", `${travelDate.id}dateId-addModal`);

        // Get the date for the label
        let travelDateStr = new Date(travelDate.date);
        travelDateStr = travelDateStr.toUTCString().split(" ");
        dateLabel.textContent = travelDateStr[0] + " " + travelDateStr[1] + " " + travelDateStr[2] + " " + travelDateStr[3];

        getDateInput.appendChild(dateInput);
        getDateInput.appendChild(dateLabel);
        getDateInput.appendChild(document.createElement("br"));
    })
    return;
}

// Create the dates radio input at the Edit Place Modal
function createDatesRadioButtonsAtEditPlaceModal() {
    // Clear previus radio input
    const getDateInput = document.getElementById("dateInput-editModal");
    getDateInput.innerHTML = "";

    // Create a radio input for each date
    travelDates.forEach(function(travelDate){
        const dateInput = document.createElement("input");
        // Set all the attributes for the input
        dateInput.setAttribute("type", "radio");
        dateInput.setAttribute("id", `${travelDate.id}dateId-editModal`);
        dateInput.setAttribute("name", `travelDates-editModal`);
        dateInput.setAttribute("value", `${travelDate.id}dateId-editModal`);

        const dateLabel = document.createElement("label");
        // Set all the attributes for the label
        dateLabel.setAttribute("class", "edit-place-modal-date-label")
        dateLabel.setAttribute("for", `${travelDate.id}dateId-editModal`);

        // Get the date for the label
        let travelDateStr = new Date(travelDate.date);
        travelDateStr = travelDateStr.toUTCString().split(" ");
        dateLabel.textContent = travelDateStr[0] + " " + travelDateStr[1] + " " + travelDateStr[2] + " " + travelDateStr[3];

        getDateInput.appendChild(dateInput);
        getDateInput.appendChild(dateLabel);
        getDateInput.appendChild(document.createElement("br"));
    })
    return;
}

function showErrorMessagesAddDayModal(errors) {
    // Get ul where the error mesage is displayed
    const ul = document.querySelector("#add-day-error-message");
    // Clear the previus message
    ul.innerHTML = "";

    errors.forEach(function(error){
        let li = document.createElement("li");
        li.textContent = error;
        ul.appendChild(li);
    });
}

// return the greatest id number in 'travelDates'
function greatesDatetId() {
    let greatestIdNumber = 0;
    // Search for the greatest id number
    for (i = 0; i < travelDates.length; i++) {
        if (travelDates[i].id > greatestIdNumber) greatestIdNumber = travelDates[i].id;
    }
    return greatestIdNumber;
}

// Place the next day value in to the date input at the Add Day Modal
// Or today's date if is the first time that the user is adding a day
function inputADateAsDefaultValue() {
    const addDayInput = document.querySelector("#addDay");

    if (travelDates.length) {
        // Find the last day
        let lastDay = 0;
        for (let i = 0; i < travelDates.length; i++) {
            if (travelDates[i].date > lastDay) lastDay = travelDates[i].date;
        }
        // Add 1 more day to the last day
        lastDay += oneDayInMilliseconds

        // Transform the date to a string that the input will read, then input the default value
        const dateFormat = new Date(lastDay);
        const dateUTCSting = dateFormat.toUTCString();
        const dateArray = dateUTCSting.split(" ");
        const dateAsDefault = dateArray[3] + "-" + monthNameToMonthNumber(dateArray[2]) + "-" + dateArray[1];
        addDayInput.value = dateAsDefault;
    }
    else {
        // Transform the date to a string that the input will read, then input the default value
        const dateFormat = new Date();
        const dateUTCSting = dateFormat.toUTCString();
        const dateArray = dateUTCSting.split(" ");
        const dateAsDefault = dateArray[3] + "-" + monthNameToMonthNumber(dateArray[2]) + "-" + dateArray[1];
        addDayInput.value = dateAsDefault;
    }

    return;
}

// When the ADD DAY button is clicked in the modal
const addDayButton = document.querySelector("#add-day-button");
addDayButton.addEventListener("click", function(event){
    event.preventDefault();

    const dayFormat = new Date(document.querySelector("#addDay").value) // Get date input
    const inputedDateEpoch = dayFormat.getTime(); // Convert it to epoch time in milliseconds
    
    const errorMessage = checkDate(inputedDateEpoch); // Check for error with the date

    // Print errors if there are any
    if(errorMessage.length > 0){
        showErrorMessagesAddDayModal(errorMessage);
        return;
    }

    travelDates.push(new TravelDate(greatesDatetId() + 1, inputedDateEpoch));

    sortDates();

    printDatesSection();
    createDatesRadioButtonsAtAddPlaceModal();
    createDatesRadioButtonsAtEditPlaceModal();
    printTable();

    // Get ul where the error mesage is displayed
    const ul = document.querySelector("#add-day-error-message");
    // Clear the previus message
    ul.innerHTML = "";  

    // Close modal
    addDayModal.style.display = "none";

    return
});