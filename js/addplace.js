if (!places) places = [];

// Get modal element
const addModal = document.getElementById("add-place-modal");
// Get close button of the add place modal
const addCloseBtn = document.getElementById("addCloseBtn");


// Listen for close click
addCloseBtn.addEventListener("click", closeModal);
// Listen to outside click
window.addEventListener("click", outsideClick);


// Function open modal
function openModal() {
    addModal.style.display = "block";
}
// Function close modal
function closeModal() {
    addModal.style.display = "none";
}
// Function to close modal if outside click
function outsideClick(event) {
    if(event.target == addModal) {
        addModal.style.display = "none";
    }
}

// Get more place's details from google maps and print it in the modal
function getPlaceDetais(newPlaceId) {
  
    var request = {
        placeId: newPlaceId,
        fields: ['international_phone_number', 'website', 'business_status',  'opening_hours']
    };
  
    var service = new google.maps.places.PlacesService(map);
  
    service.getDetails(request, function(place, status) {
      searchedPlace.international_phone_number = place.international_phone_number;
      searchedPlace.website = place.website;
      searchedPlace.business_status = place.business_status;
      searchedPlace.opening_hours = place.opening_hours;
  
      // Insert place name and address to the add place modal
      const modalTitle = document.getElementById("addPlaceTitle");
      modalTitle.textContent = searchedPlace.name;
      const modalAddress = document.getElementById("addPlaceAddress");
      modalAddress.textContent = searchedPlace.formatted_address;

      // Insert place website to the add place modal
      if (place.website) {
        const modalWebsite = document.getElementById("addPlaceWebsite");
        modalWebsite.textContent = place.website;
        modalWebsite.setAttribute("href", place.website);
      }
      // Insert place phonenumber to the add place modal
      if (place.modalPhonenumber) {
        const modalPhonenumber = document.getElementById("addPlacePhonenumber");
        modalPhonenumber.textContent = place.international_phone_number;
      }
      // Insert place business status to the add place modal
      if (place.business_status) {
        const modalBusinessStatus = document.getElementById("addPlaceBusinessStatus");
        modalBusinessStatus.textContent = place.business_status;
      }
      // Insert place opening hours to the add place modal
      if (place.opening_hours) {
        const ulOpeningHours = document.getElementById("addPlaceOpeningHours");
        for (x in place.opening_hours.weekday_text) {
          let li = document.createElement("li");
          li.textContent = place.opening_hours.weekday_text[x];
          li.setAttribute("id", "addPlaceOpeningHours");
          ulOpeningHours.appendChild(li);
        }
      }
    });
    return;
  }

// return the greatest id number in 'places'
function greatestId() {
    let greatestIdNumber = 0;
    // Search for the greatest id number
    for (i = 0; i < places.length; i++) {
        if (places[i].id > greatestIdNumber) greatestIdNumber = places[i].id;
    }
    return greatestIdNumber;
}

// Print errors messages at the Add Place Modal
function showErrorMessagesAddPlaceModal(errors){
    document.getElementById("error-message-addModal").innerHTML = "";

    let ul = document.querySelector("#error-message-addModal");
    errors.forEach(function(error){
        let li = document.createElement("li");
        li.textContent = error;
        ul.appendChild(li);
    });
    return;
}

// Reset the add modal datas
function clearAddPlaceModalCurrentData() {
    document.getElementById("addPlaceTitle").textContent = "";
    document.getElementById("addPlaceAddress").textContent = "";
    const modalWebsite = document.getElementById("addPlaceWebsite");
    modalWebsite.textContent = "";
    modalWebsite.setAttribute("href", "");
    document.getElementById("addPlacePhonenumber").textContent = "";
    document.getElementById("addPlaceBusinessStatus").textContent = "";
    document.getElementById("addPlaceOpeningHours").innerHTML = "";
    const form = document.querySelector("#form-addplace");
    form.reset();
    document.getElementById("error-message-addModal").innerHTML = "";
    return;
}

// When 'Add Place' button is clicked at the marker infowindow, it'll update the Add Place Modal
const googlemaps = document.querySelector("#map");
googlemaps.addEventListener("click", function(event) {
    if (event.target.id == "open-add-place-modal") {

        // In the case that the 'travelDates' are empty
        if (travelDates.length) {
            clearAddPlaceModalCurrentData();
        
            // Get more place details and print it at the Add Place Modal
            getPlaceDetais(searchedPlace.place_id); // 'searchedPlace' is variable created at googlemaps.js

            openModal();

            // Check the first day radio input
            const firstDayRadioInput = document.getElementsByName("travelDates-addModal")[0];
            firstDayRadioInput.checked = true;

            // Set autofocus to the first date radio input
            setTimeout(function(){ document.getElementsByName("travelDates-addModal")[0].focus() }, 500);
            
        }
        else {
            alert("You must select a travel date first.");
        }

    }
    return;
});

// When the 'add place' button is clicked at tha Add Place Modal
const addButton = document.querySelector("#add-place");
addButton.addEventListener("click", function(event) {
    event.preventDefault();

    // Get form input at the Add Place Modal
    const form = document.querySelector("#form-addplace");

    // Get the checked date
    let inputedDate;
    const getDate = document.getElementsByName('travelDates-addModal'); // This element is created at addday.js file when a day is added
    for (let i = 0; i < getDate.length; i++) {
        if (getDate[i].checked) {
            inputedDate = getDate[i].value;
          break;
        }
    }
    
    // Add arrival time and departure time to the 'searchedPlace' object
    searchedPlace.arrival_time = convertHHMMToEpoch(form.addArrivalTime.value, inputedDate);
    searchedPlace.departure_time = convertHHMMToEpoch(form.addDepartureTime.value, inputedDate);

    //check if the place arrival time and departure time data is valid and return an array of errors messages
    const errorMessage = checkPlaceTimeForm(searchedPlace);
    //show data errors if there any
    if(errorMessage.length > 0){
        showErrorMessagesAddPlaceModal(errorMessage);
        return;
    }

    // Clear the 'newMarker' marker. It's the marker created when the user search for a place
    newMarker.setMap(null);
    
    // insert an id to the new obj. It has to be the 'greatest Id number in the Ids' + 1
    searchedPlace.id = greatestId() + 1;

    // add the new place object to the 'places' array
    // But first, it has to be cloned to store the values and not the obj memory addresses
    let searchedPlaceClone = JSON.parse(JSON.stringify(searchedPlace));
    places.push(searchedPlaceClone);
    console.log("place added to the 'places' obj");

    printTable();

    closeModal();

    // Set auto focus to the search bar
    const searchBox = document.getElementById('my-input-searchbox');
    searchBox.value = "";
    searchBox.focus();

    return;
});