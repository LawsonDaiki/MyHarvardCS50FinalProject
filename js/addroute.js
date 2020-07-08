// Route obj
function Route(places_origin_id, transport_mode, route_time, details) {
    this.places_origin_id = places_origin_id;
    this.transport_mode = transport_mode;
    this.route_time = route_time;
    this.details = details
}

const addRouteModal = document.querySelector("#add-route-modal");

// CLOSE modal when the close button is clicked
const addRouteModalCloseButton = document.querySelector("#addRouteModalCloseBtn");
addRouteModalCloseButton.addEventListener("click", function() {
    addRouteModal.style.display = "none";
});

// Listen to outside click
window.addEventListener("click", outsideClick);
// Function to close modal if outside click
function outsideClick(event) {
    if(event.target == addRouteModal) {
        addRouteModal.style.display = "none";
    }
    return;
}

// Variable to store the origin and destiny places infos
let originPlace = new Place();
let destinyPlace = new Place();
let routeTimeInMinutes = null;
let routeTimeInMilliseconds = null;
let routeTimeString = null;
let transportMode = null;
let routeDetails = null;
let currentSubtractButtonStatus = "edit"; // This variable is to check the current status of the add button. If it is at edit mode or undo mode
let currentAddButtonStatus = "edit"; // This variable is to check the current status of the add button. If it is at edit mode or undo mode

// Reset Add Route Modal
function resetAddRouteModal(){
    // Reset variables
    transportMode = null;
    routeDetails = null;
    routeTimeInMinutes = null;
    routeTimeInMilliseconds = null;
    routeTimeString = null;
    currentSubtractButtonStatus = "edit";
    currentAddButtonStatus = "edit";

    // Reset the route time and time buttons displayed in modal
    const routeTimeDisplay = document.querySelector("#routeTime");
    routeTimeDisplay.innerHTML = "";
    const subtractTimeButton = document.querySelector("#subtract-time-button");
    subtractTimeButton.style.display = "none";
    const addTimeButton = document.querySelector("#add-time-button");
    addTimeButton.style.display = "none";
    const customTimeInput = document.querySelector("#customRouteTimeInput");
    customTimeInput.style.display = "none";
    const enterCustomTime = document.querySelector("#enterCustomTime");
    enterCustomTime.style.display = "none";

    // Reset errors messages
    let errorMessageInModal = document.querySelector("#error-message-addRouteModal");
    errorMessageInModal.innerHTML = "";

    return;
}

// open the Add Route Modal when button is clicked
function openAddRouteModal(placeId) {
    addRouteModal.style.display = "block";

    resetAddRouteModal();

    //Get origin and destiny names
    for (let i = 0; i < places.length; i++) {
        if (places[i].id == placeId) {
            originPlace = places[i - 1];
            destinyPlace = places[i];
        }
    }

    // Add places name and time
    const routeOrigin = document.querySelector("#addRouteOriginLabel");
    routeOrigin.innerHTML = `Origin (${originPlace.name}) departure time:`;
    const originTimeInput = document.querySelector("#addRouteOriginDepartureTime");
    originTimeInput.value = convertEpochToHHMM(originPlace.departure_time);

    const routeDestiny = document.querySelector("#addRouteDestinationLabel");
    routeDestiny.innerHTML = `Destiny (${destinyPlace.name}) arrival time:`;
    const destinyTimeInput = document.querySelector("#addRouteDestinationArrivalTime");
    destinyTimeInput.value = convertEpochToHHMM(destinyPlace.arrival_time);

    // Add link to open route at Google Maps
    const api = 'https://www.google.com/maps/dir/?api=1&';
    let origin = '&origin=' + originPlace.location.lat + ',' + originPlace.location.lng + '&';
    let destination = 'destination=' + destinyPlace.location.lat + ',' + destinyPlace.location.lng;
    const url = api + origin + destination;
    const linkRouteGoogleMaps = document.querySelector("#openRouteAtGoogleMaps");
    linkRouteGoogleMaps.setAttribute("href", url);

    // Select 'none' to transport mode input
    if (!destinyPlace.route) document.querySelector("#inputTransportModeNone").selected = 'true';
    else {
        if (destinyPlace.route.transport_mode === "car") {
            document.querySelector("#inputTransportModeCar").selected = 'true';
            const routeTimeDisplay = document.querySelector("#routeTime");
            routeTimeDisplay.innerHTML = `calculating...`
            searchRoute(destinyPlace.route.transport_mode);
        }
        else if (destinyPlace.route.transport_mode === "pedestrian") {
            document.querySelector("#inputTransportModePedestrian").selected = 'true';
            const routeTimeDisplay = document.querySelector("#routeTime");
            routeTimeDisplay.innerHTML = `calculating...`
            searchRoute(destinyPlace.route.transport_mode);
        }
        else if (destinyPlace.route.transport_mode === "publicTransport") {
            document.querySelector("#inputTransportModePublicTransport").selected = 'true';
            const routeTimeDisplay = document.querySelector("#routeTime");
            routeTimeDisplay.innerHTML = `calculating...`
            searchRoute(destinyPlace.route.transport_mode);
        }
        else if (destinyPlace.route.transport_mode === "custom") {
            document.querySelector("#inputTransportModeCustom").selected = 'true';
            console.log('test');
            // Display the custom time input and the custom time submit button
            const customTimeInput = document.querySelector("#customRouteTimeInput");
            customTimeInput.style.display = "block";
            customTimeInput.value = convertEpochToHHMM(destinyPlace.route.route_time);
            const enterCustomTime = document.querySelector("#enterCustomTime");
            enterCustomTime.style.display = "block";
        }
    }

    return;
}

// Display the route time next to the search time button
function printRouteTime(routeTime) {
    const routeTimeDisplay = document.querySelector("#routeTime");
    routeTimeInMinutes = Math.round(routeTime / 60);
    routeTimeInMilliseconds = routeTimeInMinutes * 60000;

    if (routeTimeInMinutes < 60) {
        routeTimeString = `${routeTimeInMinutes} min`
        routeTimeDisplay.innerHTML = routeTimeString;
    }
    else {
        const routeHours = Math.floor(routeTimeInMinutes / 60);
        const routeMinutes = routeTimeInMinutes % 60;
        routeTimeString = `${routeHours} h ${routeMinutes} min`
        routeTimeDisplay.innerHTML = routeTimeString;
    }
    addEditButton(routeTimeString);
    return;
}

// Display the 'route not found' message next to the search time button
function printRouteTimeNotFound() {
    // Reset the route time and time buttons
    const subtractTimeButton = document.querySelector("#subtract-time-button");
    subtractTimeButton.style.display = "none";
    const addTimeButton = document.querySelector("#add-time-button");
    addTimeButton.style.display = "none";

    const routeTimeDisplay = document.querySelector("#routeTime");
    routeTimeDisplay.innerHTML = "Route not found";
    transportMode = null;
    return;
}

// Display the subtract and add time button for the origin and destiny respectively
function addEditButton(routeTimeString) {
    const subtractTimeButton = document.querySelector("#subtract-time-button");
    subtractTimeButton.innerHTML = "Subtract " + routeTimeString;
    subtractTimeButton.style.display = "block";

    const addTimeButton = document.querySelector("#add-time-button");
    addTimeButton.innerHTML = "Add " + routeTimeString;
    addTimeButton.style.display = "block";
    return;
}

// search route for the respective 'transportMode'. Because for each transportMode, the api url is different.
function searchRoute(transportMode) {

    // If transport mode is 'public transport'
    if (transportMode === "publicTransport") {
        const api = 'https://transit.router.hereapi.com/v8/routes?';
        let origin = '&origin=' + originPlace.location.lat + ',' + originPlace.location.lng + '&';
        let destination = 'destination=' + destinyPlace.location.lat + ',' + destinyPlace.location.lng;
        const apiKey = 'apiKey=j8-jK40BM2fbtjDwWJVNYYlGPcY_6vYl6GYTu6iD2Gc'
        const url = api + apiKey + origin + destination;

        searchRoutePublicTransport(url);
    }
    else { // If transporte mode is 'car' or 'pedestrian'
        const api = 'https://router.hereapi.com/v8/routes?';
        let transportModeString = 'transportMode=' + transportMode + '&';
        let origin = 'origin=' + originPlace.location.lat + ',' + originPlace.location.lng + '&';
        let destination = 'destination=' + destinyPlace.location.lat + ',' + destinyPlace.location.lng + '&'
        const summary = 'return=summary&'
        const apiKey = 'apiKey=j8-jK40BM2fbtjDwWJVNYYlGPcY_6vYl6GYTu6iD2Gc'
        const url = api + transportModeString + origin + destination + summary + apiKey;

        searchRouteCarOrPedestrian(url);
    }

    return;
}

function getTimeFromPublicTransportJSON(data) {
    let departureString = null;
    let departureTimeString = null;
    let departureHours = null
    let departureHourString = null;
    let departureMinutes = null;
    let departureTime = null;
    let arrivalString = null;
    let arrivalTimeString = null;
    let arrivalHours = null;
    let arrivalHourString = null;
    let arrivalMinutes = null;
    let arrivalTime = null;
    let timeSum = null

    for (let i = 0; i < data.routes[0].sections.length; i++) {
        // Get the departure time
        departureString = data.routes[0].sections[i].departure.time;
        departureTimeString = departureString.split(":")
        departureMinutes = Number(departureTimeString[1]);
        departureHourString = departureTimeString[0].split("T");
        departureHours = Number(departureHourString[1]);
        departureTime = (departureHours * 60) + departureMinutes;

        // Get the arrival time
        arrivalString = data.routes[0].sections[i].arrival.time;
        arrivalTimeString = arrivalString.split(":");
        arrivalMinutes = Number(arrivalTimeString[1]);
        arrivalHourString = arrivalTimeString[0].split("T");
        arrivalHours = Number(arrivalHourString[1]);
        arrivalTime = (arrivalHours * 60) + arrivalMinutes;

        timeSum += (arrivalTime - departureTime); // time sum in minutes
    }

    return timeSum * 60; // returns time sum in seconds
}

function departureTimeInputValueToOriginal() {
    // Get form
    const formAddRouteModal = document.querySelector("#form-addroute");

    // Get the origin departure time input and convert it to epoch milliseconds
    const originDepartureTimeInputArray = formAddRouteModal.addRouteOriginDepartureTime.value.split(":");
    const originDepartureTimeInputInMilliseconds = (originDepartureTimeInputArray[0] * 60 * 60 * 1000) + (originDepartureTimeInputArray[1] * 60 * 1000);

    // Change departure time value
    formAddRouteModal.addRouteOriginDepartureTime.value = convertEpochToHHMM(originDepartureTimeInputInMilliseconds + routeTimeInMilliseconds);

    // Convert button to time edit
    const subtractTimeButton = document.querySelector("#subtract-time-button");
    subtractTimeButton.innerHTML = "Subtract " + routeTimeString;

    return;
}

function arrivalTimeInputValueToOriginal() {
    // Get form
    const formAddRouteModal = document.querySelector("#form-addroute");

    // Get destiny arrival time input and convert it to epoch milliseconds
    const destinyArrivalTimeInputArray = formAddRouteModal.addRouteDestinationArrivalTime.value.split(":");
    const destinyArrivalTimeInputInMilliseconds = (destinyArrivalTimeInputArray[0] * 60 * 60 * 1000) + (destinyArrivalTimeInputArray[1] * 60 * 1000);

    // Get the input value to the original departure time of the origin's place
    formAddRouteModal.addRouteDestinationArrivalTime.value = convertEpochToHHMM(destinyArrivalTimeInputInMilliseconds - routeTimeInMilliseconds);

    // Convert button to time edit
    const addTimeButton = document.querySelector("#add-time-button");
    addTimeButton.innerHTML = "Add " + routeTimeString;

    return;
}

function departureTimeInputEdit() {

    // Get form
    const formAddRouteModal = document.querySelector("#form-addroute");

    // Get the origin departure time input and convert it to epoch milliseconds
    const originDepartureTimeInputArray = formAddRouteModal.addRouteOriginDepartureTime.value.split(":");
    const originDepartureTimeInputInMilliseconds = (originDepartureTimeInputArray[0] * 60 * 60 * 1000) + (originDepartureTimeInputArray[1] * 60 * 1000);

    // Change departure time value
    formAddRouteModal.addRouteOriginDepartureTime.value = convertEpochToHHMM(originDepartureTimeInputInMilliseconds - routeTimeInMilliseconds);

    // Change edit button to undo button
    const subtractTimeButton = document.querySelector("#subtract-time-button");
    subtractTimeButton.innerHTML = "undo";

    return;
}

function arrivalTimeInputEdit() {
    // Get form
    const formAddRouteModal = document.querySelector("#form-addroute");

    // Get destiny arrival time input and convert it to epoch milliseconds
    const destinyArrivalTimeInputArray = formAddRouteModal.addRouteDestinationArrivalTime.value.split(":");
    const destinyArrivalTimeInputInMilliseconds = (destinyArrivalTimeInputArray[0] * 60 * 60 * 1000) + (destinyArrivalTimeInputArray[1] * 60 * 1000);

    // Get the input value to the original departure time of the origin's place
    formAddRouteModal.addRouteDestinationArrivalTime.value = convertEpochToHHMM(destinyArrivalTimeInputInMilliseconds + routeTimeInMilliseconds);

    // Change edit button to undo button
    const addTimeButton = document.querySelector("#add-time-button");
    addTimeButton.innerHTML = "undo";

    return;
}

function showErrorMessagesAddRouteModal(errors){
    let errorMessageInModal = document.querySelector("#error-message-addRouteModal");
    errorMessageInModal.innerHTML = "";

    errors.forEach(function(error){
        let li = document.createElement("li");
        li.textContent = error;
        errorMessageInModal.appendChild(li);
    });

    return;
}

// When the TRANSPORT MODE is changed at the Add Route Button
const transportModeInput = document.querySelector("#transportMode");
transportModeInput.addEventListener("change", function(event) {
    event.preventDefault();
    resetAddRouteModal();
    
    // Get transport mode
    transportMode = event.target.value;

    // Reset places's arrival and departure time
    const originTimeInput = document.querySelector("#addRouteOriginDepartureTime");
    originTimeInput.value = convertEpochToHHMM(originPlace.departure_time);

    const destinyTimeInput = document.querySelector("#addRouteDestinationArrivalTime");
    destinyTimeInput.value = convertEpochToHHMM(destinyPlace.arrival_time);


    if (transportMode === "none") {
        return;
    }
    else if (transportMode === "custom") {
        // Display the custom time input and the custom time submit button
        const customTimeInput = document.querySelector("#customRouteTimeInput");
        customTimeInput.style.display = "block";
        const enterCustomTime = document.querySelector("#enterCustomTime");
        enterCustomTime.style.display = "block";
    }
    else {
        // Print 'calculating' warning
        const routeTimeDisplay = document.querySelector("#routeTime");
        routeTimeDisplay.innerHTML = `calculating...`
        searchRoute(transportMode);
    }

    return;
});

// When the SUBTRACT time button is clicked
const subtractTimeButton = document.querySelector("#subtract-time-button");
subtractTimeButton.addEventListener("click", function(event) {
    event.preventDefault()
    if (currentSubtractButtonStatus === "undo") {
        departureTimeInputValueToOriginal();
        currentSubtractButtonStatus = "edit";
    }
    else {
        departureTimeInputEdit();
        if (currentAddButtonStatus == "undo") arrivalTimeInputValueToOriginal();

        // Change destiny arrival time to original value
        currentSubtractButtonStatus = "undo";
        currentAddButtonStatus = "edit"
    }

    return;
})

// When the ADD time button is clicked
const addTimeButton = document.querySelector("#add-time-button");
addTimeButton.addEventListener("click", function(event) {
    event.preventDefault()

    if (currentAddButtonStatus === "undo") {
        arrivalTimeInputValueToOriginal();
        currentAddButtonStatus = "edit";
    }
    else {
        arrivalTimeInputEdit();
        if (currentSubtractButtonStatus == "undo") departureTimeInputValueToOriginal();

        // Change origin departure time to original value
        currentAddButtonStatus = "undo";
        currentSubtractButtonStatus = "edit";
    }

    return;
})

// When the ENTER button from custom time is clicked
const enterCustomTime = document.querySelector("#enterCustomTime");
enterCustomTime.addEventListener("click", function(event) {
    event.preventDefault();

    // Reset edit buttons status
    currentSubtractButtonStatus = "edit";
    currentAddButtonStatus = "edit";

    // Reset places's arrival and departure time
    const originTimeInput = document.querySelector("#addRouteOriginDepartureTime");
    originTimeInput.value = convertEpochToHHMM(originPlace.departure_time);
    const destinyTimeInput = document.querySelector("#addRouteDestinationArrivalTime");
    destinyTimeInput.value = convertEpochToHHMM(destinyPlace.arrival_time);

    const customTimeInput = document.querySelector("#customRouteTimeInput"); // Get time input

    if (!customTimeInput.value) return; // If there are no input value
    else {
        const customTimeInputArray = customTimeInput.value.split(":");
        const routeTime = (customTimeInputArray[0] * 60 * 60) + (customTimeInputArray[1] * 60); // Convert route time in seconds
        printRouteTime(routeTime); // Print edit buttons
        const routeTimeDisplay = document.querySelector("#routeTime");
        routeTimeDisplay.innerHTML = ""; // Erase the route time display
    }

    return;
});

// When the SUBMIT button is clicked at the Add Route Modal
const submitButton = document.querySelector("#add-route-button")
submitButton.addEventListener("click", function(event) {
    event.preventDefault();

    // Clear previus error messages
    let errorMessages = []
    let errorMessageInModal = document.querySelector("#error-message-addRouteModal");
    errorMessageInModal.innerHTML = "";

    // Check if the route was calculated
    if (transportMode === "car" || transportMode === "pedestrian" || transportMode === "publicTransport") {
        if (!routeTimeInMinutes) errorMessages.push("Wait until the route is calculated.");
    }
    if (transportMode === "custom" && !routeTimeInMinutes) errorMessages.push("Must input route time.")

    // Get form
    const formAddRouteModal = document.querySelector("#form-addroute");

    // Get the origin departure time input and convert it to epoch milliseconds
    const originDepartureTimeInputArray = formAddRouteModal.addRouteOriginDepartureTime.value.split(":")
    const originDepartureTimeInputInMilliseconds = (originDepartureTimeInputArray[0] * 60 * 60 * 1000) + (originDepartureTimeInputArray[1] * 60 * 1000) + (originPlace.departure_time - (originPlace.departure_time % oneDayInMilliseconds));
    // Add error message if the departure time is earlier than arrival time
    if (originDepartureTimeInputInMilliseconds < originPlace.arrival_time) errorMessages.push("Origin's departure time is in conflict with it's arrival time.");

    // Get destiny arrival time input and convert it to epoch milliseconds
    const destinyArrivalTimeInputArray = formAddRouteModal.addRouteDestinationArrivalTime.value.split(":");
    const destinyArrivalTimeInputInMilliseconds = (destinyArrivalTimeInputArray[0] * 60 * 60 * 1000) + (destinyArrivalTimeInputArray[1] * 60 * 1000) + (destinyPlace.arrival_time - (destinyPlace.arrival_time % oneDayInMilliseconds));
    // Add error message if the arrival time is later than departure time
    if (destinyArrivalTimeInputInMilliseconds > destinyPlace.departure_time) errorMessages.push("Destiny's arrival time is in conflict with it's departure time.");

    // If the origin departure time is later than the destiny arrival time
    if (originDepartureTimeInputInMilliseconds > destinyArrivalTimeInputInMilliseconds) errorMessages.push("Departure time must be earlier than the arrival time.");

    // Print error messages (if there are any) and finish the function operation
    if(errorMessages.length > 0){
        showErrorMessagesAddRouteModal(errorMessages);
        return;
    }

    // Add route to the destiny's 'places' and change times
    for (let i = 0; i < places.length; i++) {
        if (places[i].id == destinyPlace.id) {
            if (transportMode === "none") places[i].route = null;
            else places[i].route = new Route(originPlace.id, transportMode, routeTimeInMilliseconds, routeDetails);
            places[i - 1].departure_time = originDepartureTimeInputInMilliseconds;
            places[i].arrival_time = destinyArrivalTimeInputInMilliseconds;
        }
    }

    printTable();

    // Close modal
    addRouteModal.style.display = "none";


    return;
});

// function to get HERE api response for car and pedestrian
async function searchRouteCarOrPedestrian(url) {
    fetch(url)
        .then(response => response.json())
        .then(function(data) {
            printRouteTime(data.routes[0].sections[0].summary.duration)
            routeDetails = data.routes[0].sections[0];
        })
        .catch(error => {
            console.log(error);
            printRouteTimeNotFound();
        });
    return;
}

// function to get HERE api response for public transport route
async function searchRoutePublicTransport(url) {
    fetch(url)
        .then(response => response.json())
        .then(function(data) {
            printRouteTime(getTimeFromPublicTransportJSON(data))
            routeDetails = data.routes[0].sections;
        })
        .catch(error => {
            console.log(error);
            printRouteTimeNotFound();
        });
    return;
}