// Variable to remind which place id is open in the edit modal
let currentEditId = null;

// Get edit modal element
const editModal = document.getElementById("edit-place-modal");
// Get edit modal button
const editModalBtn = document.getElementById("open-edit-button");
// Get close button of the add place modal
const editCloseBtn = document.getElementById("editCloseBtn");

// Listen for close click
editCloseBtn.addEventListener("click", closeEditModal);
// Function close modal
function closeEditModal() {
    editModal.style.display = "none";
    currentEditId = 0;
    return;
}

// Listen to outside click
window.addEventListener("click", outsideClick);
// Function to close modal if outside click
function outsideClick(event) {
    if(event.target == editModal) {
        editModal.style.display = "none";
        currentEditId = 0;
    }
    return;
}

// Function open modal
function openEditModal(place) {
    editModal.style.display = "block";

    resetEditModal();

    addInfoToEditModal(place)

    defaultCheckRadioEditModal(place);

    // Downloadable data
    let placesData = new Blob([JSON.stringify(places)], {type : 'application/json'});
    let placesUrl = window.URL.createObjectURL(placesData);
    document.getElementById('download_places').href = placesUrl;

    let datesData = new Blob([JSON.stringify(travelDates)], {type : 'application/json'});
    let datesUrl = window.URL.createObjectURL(datesData);
    document.getElementById('download_travelDates').href = datesUrl;

    return;
}

function resetEditModal() {
    document.getElementById("editPlaceTitle").textContent = "";
    document.getElementById("editPlaceAddress").textContent = "";
    const modalWebsite = document.getElementById("editPlaceWebsite");
    modalWebsite.textContent = "";
    modalWebsite.setAttribute("href", "");
    document.getElementById("editPlacePhonenumber").textContent = "";
    document.getElementById("editPlaceBusinessStatus").textContent = "";
    document.getElementById("editPlaceOpeningHours").innerHTML = "";
    document.getElementById("error-message-editModal").innerHTML = ""

    // Close name editing display
    document.querySelector("#customPlaceNameInput").style.display = "none";
    document.querySelector("#saveCustomNameButton").style.display = "none";
    document.querySelector("#cancelCustomNameButton").style.display = "none";

    // Add title and edit button again
    document.querySelector("#editPlaceTitle").style.display = "block";
    document.querySelector("#editPlaceNameButton").style.display = "block";

    // Clear time input values
    document.getElementById("form-editplace").reset();

    return;
}

// Insert place's info to the Edit Modal
function addInfoToEditModal(place) {
    // Add name or the custom name (if there are any)
    const modalTitle = document.getElementById("editPlaceTitle");
    if (place.custom_name) modalTitle.textContent = place.custom_name;
    else modalTitle.textContent = place.name;

    document.getElementById("editPlaceAddress").textContent = place.formatted_address;

    // Insert place website (if it exists) to the edit place modal
    if (place.website) {
        const modalWebsite = document.getElementById("editPlaceWebsite");
        modalWebsite.textContent = place.website;
        modalWebsite.setAttribute("href", place.website);
    }

    // Insert link to open place at Google Maps
    document.getElementById("openPlaceAtGoogleMaps").setAttribute("href", `https://www.google.com/maps/place/?q=place_id:${place.place_id}`);

    // Insert place phonenumber (if it exists) to the edit place modal
    if (place.modalPhonenumber) document.getElementById("editPlacePhonenumber").textContent = place.international_phone_number;

    // Insert place business status to the edit place modal
    if (place.business_status) document.getElementById("editPlaceBusinessStatus").textContent = place.business_status;

    // Insert place opening hours (if it exists) to the edit place modal
    if (place.opening_hours) {
      const ulOpeningHours = document.getElementById("editPlaceOpeningHours");
      for (x in place.opening_hours.weekday_text) {
        let li = document.createElement("li");
        li.textContent = place.opening_hours.weekday_text[x];
        li.setAttribute("id", "editPlaceOpeningHours");
        ulOpeningHours.appendChild(li);
      }
    }

    // Insert the arrival time and departure time in the time input as defaul value
    document.getElementById("editArrivalTime").defaultValue = convertEpochToHHMM(place.arrival_time);
    document.getElementById("editDepartureTime").defaultValue = convertEpochToHHMM(place.departure_time);

    return;
}

function defaultCheckRadioEditModal(place) {
    let dateId = null;

    // With the place arrival time, get the the date id where it is in
    for(let i = 0; i < travelDates.length; i++) if(place.arrival_time >= travelDates[i].date && place.arrival_time < (travelDates[i].date + oneDayInMilliseconds)) dateId = travelDates[i].id;

    // Get radio of the respective clicked place date
    document.getElementById(`${dateId}dateId-editModal`).checked = true;

    return;
}

function showErrorMessagesEditModal(errors){
    document.getElementById("error-message-editModal").innerHTML = "";

    let ul = document.querySelector("#error-message-editModal");
    errors.forEach(function(error){
        let li = document.createElement("li");
        li.textContent = error;
        ul.appendChild(li);
    });
}

// When the EDIT button is clicked at the INFOWINDOW of the google maps
const googlemapseditform = document.getElementById("map");
googlemapseditform.addEventListener("click", function(event) {
    // Get the target id and parse it to get just the number. It will help to use the id
    const targetId = parseInt(event.target.id,10);
    if(event.target.className == "marker-edit-btn") {
        // Loop over the 'places' obj to find the respective id place
        for (let i = 0; i < places.length; i++) {
            if (targetId == places[i].id) {
                openEditModal(places[i]);
                currentEditId = targetId;
            }
        }
    }
    return;
});

// When the EDIT button is clicked at the DATES SECTION
const planTable = document.querySelector(".dates-container");
planTable.addEventListener("click", function(event) {
    // Get the target id and parse it to get just the number. It will help to use the id
    const targetId = parseInt(event.target.id,10);
    if(event.target.className == "edit-place-button-class") {
        // Loop over the 'places' obj to find the respective id place
        for (i = 0; i < places.length; i++) {
            if (targetId == places[i].id) {
                openEditModal(places[i]);
                currentEditId = targetId;
            }
        }
    }
    return;
});

// When the EDIT PLACE NAME button is clicked
const editPlaceName = document.querySelector("#editPlaceNameButton");
editPlaceName.addEventListener("click", function() {
    // Search for the original name and custom name
    let originalName = null;
    let customName = null;
    for (i = 0; i < places.length; i++) {
        if (currentEditId == places[i].id) {
            originalName = places[i].name;
            customName = places[i].custom_name;
        }
    }

    document.querySelector("#editPlaceTitle").style.display = "none"; // Clear the title
    document.querySelector("#editPlaceNameButton").style.display = "none"; // Clear edit title button
    document.querySelector("#customPlaceNameInput").style.display = "block"; // Add text input
    document.querySelector("#saveCustomNameButton").style.display = "block"; // Add save button
    document.querySelector("#cancelCustomNameButton").style.display = "block"; // Add cancel button

    // Add default value to the input
    if (customName) customNameInput.value = customName;
    else customNameInput.value = originalName;

    return;
});

// When SAVE button is clicked to change place name
const saveButton = document.querySelector("#saveCustomNameButton");
saveButton.addEventListener("click", function(event) {
    event.preventDefault();

    // Get name
    const customNameInput = document.querySelector("#customPlaceNameInput");

    // Update name in the 'places' variable
    let index = null;
    if (!customNameInput.value) {
        for (i = 0; i < places.length; i++) {
            if (currentEditId == places[i].id) {
                places[i].custom_name = null;
                index = i;
            }
        }
    }
    else {
        for (i = 0; i < places.length; i++) {
            if (currentEditId == places[i].id) {
                places[i].custom_name = customNameInput.value;
                index = i;
            }
        }
    }

    // Close name editing display
    customNameInput.style.display = "none";
    document.querySelector("#saveCustomNameButton").style.display = "none";
    document.querySelector("#cancelCustomNameButton").style.display = "none";

    // Add title and edit button again
    const placeName = document.querySelector("#editPlaceTitle");
    placeName.style.display = "block";
    document.querySelector("#editPlaceNameButton").style.display = "block";

    // Display place's name
    if (places[index].custom_name) placeName.textContent = places[index].custom_name;
    else placeName.textContent = places[index].name;

    printTable();

    return;
    
})

// When CANCEL button is clicked next to the save button
const cancelButton = document.querySelector("#cancelCustomNameButton");
cancelButton.addEventListener("click", function(event) {
    event.preventDefault();

    // Close name editing display
    document.querySelector("#customPlaceNameInput").style.display = "none";
    document.querySelector("#saveCustomNameButton").style.display = "none";
    document.querySelector("#cancelCustomNameButton").style.display = "none";

    // Add title and edit button again
    document.querySelector("#editPlaceTitle").style.display = "block";
    document.querySelector("#editPlaceNameButton").style.display = "block";
    
    return;
})

// When EDIT PLACE button is clicked at the Edit Date Modal
const editPlace = document.getElementById("edit-place");
editPlace.addEventListener("click", function(){
    event.preventDefault();

    let editingPlace = new Place;
    editingPlace.id = currentEditId;

    // Get the selected date
    let checkedDate = null;
    const getDate = document.getElementsByName('travelDates-editModal');
    for (let i = 0; i < getDate.length; i++) {
        if (getDate[i].checked) {
          checkedDate = getDate[i].value;
          break;
        }
    }

    // Add arrival time and departure time to the searchedPlace object
    const form = document.getElementById("form-editplace");
    editingPlace.arrival_time = convertHHMMToEpoch(form.editArrivalTime.value, checkedDate);
    editingPlace.departure_time = convertHHMMToEpoch(form.editDepartureTime.value, checkedDate);

    //check if the place arrival time and departure time data is valid and return an array of errors messages
    const errorMessage = checkPlaceTimeForm(editingPlace);
    //show data errors if there any
    if(errorMessage.length > 0){
        showErrorMessagesEditModal(errorMessage);
        return;
    }
    

    // Loop over the 'places' obj to find the respective id place and change it's arrival_time and departure_time
    for (i = 0; i < places.length; i++) {
        if (editingPlace.id == places[i].id) {
            places[i].arrival_time = editingPlace.arrival_time;
            places[i].departure_time = editingPlace.departure_time;
        }
    }

    console.log("obj 'places' edited");

    printTable();

    closeEditModal()

    // Set auto focus to the search bar
    document.getElementById('my-input-searchbox').focus();

    return;
});

// When the DELETE place is clicked
const deletePlace = document.getElementById("delete-place");
deletePlace.addEventListener("click", function(event) {
    event.preventDefault();

    // Loop over the 'places' obj to find the respective id place to remove
    for (i = 0; i < places.length; i++) {
        if (currentEditId == places[i].id) {
            places.splice(i, 1);
        }
    }

    console.log("an item in 'places' obj deleted");

    printTable();

    closeEditModal()

    return;
});