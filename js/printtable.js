// An array of markers of the places
let markers = [];

// Create DOM element for the arrival time, departure time and place's name
function createTd(divData, diClass) {
    const div = document.createElement("div");
    div.textContent = divData;
    div.classList.add(diClass);
    return div;
}

// Create DOM edit button to edit 'place'
function createEditPlaceButton(tdClass, id) {
    const td = document.createElement("div");
    td.classList.add(tdClass);
    td.setAttribute("id", `${id}EditPlaceId`);
    return td;
}

// Create a marker and a info window with the place info and append the marker to the markers array
function addMarker(place) {

    // Get the marker icon
    let image = {
        url: 'https://maps.google.com/mapfiles/ms/icons/pink-dot.png',
    }
    
    // Create google maps marker
    let marker = new google.maps.Marker({
      position: place.location,
      map: map,
      icon: image
    });

    // append the marker to the 'markers' array
    markers.push(marker);

    // Create info window
    var infowindow = new google.maps.InfoWindow({
        content: '<h2>' + place.name + '</h2>' + '<a class="marker-edit-btn" id="' + place.id + 'infowindow">Edit</a>',
        //maxWidth: 200
      });

    // Open the info window when marker are clicked
    marker.addListener('click', function() {
        infowindow.open(map, marker);
    });

    return [marker, infowindow];
}

// Create a row with the place's info and create and conect the respective marker and infowindow
function createPlaceTr(place) {
    // Create the row with the attributes
    const placeTr = document.createElement("div");
    placeTr.classList.add("place-row");
    placeTr.setAttribute("id", `${place.id}RowId`);
    placeTr.classList.add(`place-row-id-${place.id}`);

    // Add style to display edit button when hover over place row
    var css = `.place-row-id-${place.id}:hover .edit-place-button-class { display: block; }`;
    var style = document.querySelector('#placeRowStyleSheet');
    style.appendChild(document.createTextNode(css));

    // Check if there are a conflict between the arrival time, departure time and opening hours
    if (isThereATimeConflict(place) === "true") {
        placeTr.classList.add("time-conflict" );
        console.log(`There's a time conflict with the place ${place.name} opening hours`);
    }

    const arrivalHHHMM = convertEpochToHHMM(place.arrival_time); // add hour and minutes into a single string
    const departureHHMM = convertEpochToHHMM(place.departure_time); // add hour and minutes into a single string

    // create a marker and infowindow and add an event listener to open info window of the respective clicked row
    let [marker, infowindow] = addMarker(place)

    // Create the data for the placeTr
    const td1 = createTd(arrivalHHHMM, "td-arrivaltime-class");
    const td2 = createTd(departureHHMM, "td-departuretime-class");
    let td3 = null;
    if (place.custom_name) td3 = createTd(place.custom_name, "td-name-class");
    else td3 = createTd(place.name, "td-name-class");

    // add event listener to open the respective infowindow when the placeRow is clicked
    placeTr.addEventListener("click", function(event) {
        if (event.target.classList.value != "edit-place-button-class") infowindow.open(map, marker); // the info window will not open if the edit button is clicked
    });

    // Append all the infos and the edit button to the row
    placeTr.appendChild(td1);
    placeTr.appendChild(td2);
    placeTr.appendChild(td3);
    placeTr.appendChild(createEditPlaceButton("edit-place-button-class", place.id));

    // Create Add Route Button
    const routeButton = createRouteButton(place);

    // Create div to insert the placeTr and routeButton
    const placeContainer = document.createElement("div");
    placeContainer.setAttribute("class", "place-container");
    placeContainer.setAttribute("id", `${place.id}placeContainer`);
    placeContainer.classList.add("draggable");
    placeContainer.setAttribute("draggable", "true");

    // append the routeButton and the placeTr inside the placeContainer
    if (routeButton) placeContainer.appendChild(routeButton);
    placeContainer.appendChild(placeTr);

    // add drag and drop feature to the placeTr
    placeContainer.addEventListener("dragstart", () => {
        placeContainer.classList.add("dragging");
        draggedPlaceId = place.id;
    });
    placeContainer.addEventListener("dragend", (event) => {
        placeContainer.classList.remove("dragging");
        updatePlacesOnDragOver(draggedPlaceId, belowTargetPlaceId, draggedOverDateId);
    });

    // Get the Id of the respective date that the 'place' it's in
    let dateId = null;
    for(let i = 0; i < travelDates.length; i++) {
        if (place.arrival_time >= travelDates[i].date && place.arrival_time < (travelDates[i].date + oneDayInMilliseconds)) {
            dateId = travelDates[i].id;
            break;
        }
    }
    if(dateId == null) { // In case there is no match between places time and the dates database, an error message will log
        console.log("ERROR printing places. Date table not found.");
        return;
    }

    // Append the whole row to the respective date section
    const getDateTable = document.getElementById(`${dateId}dateTable`);
    getDateTable.appendChild(placeContainer);

    return;
}

function createAddRouteButton(place) {
    // Create icon
    const routeDiv = document.createElement("div");
    routeDiv.setAttribute("class", "icon-open-route-modal");

    // Create label written 'add route'
    const label = document.createElement("div");
    label.setAttribute("class", "label-open-route-modal");
    label.innerHTML = "add route";

    // Create button that contain the icon and the text 'add route'
    const routeButton = document.createElement("button");
    routeButton.setAttribute("class", "button-open-route-modal");
    routeButton.appendChild(routeDiv);
    routeButton.appendChild(label);

    // Create div to insert the button
    const widgetButton = document.createElement("div");
    widgetButton.setAttribute("class", "widget-button-open-route-modal");
    widgetButton.appendChild(routeButton);
    widgetButton.setAttribute("id", `${place.id}openRouteModalId`)

    // Add event listener to open Add Route Modal when clicked
    widgetButton.addEventListener("click", function(event) {
        openAddRouteModal(place.id);
    });
    
    return widgetButton;
}

function createRoute(place) {

    // Convert route time that it's in milliseconds to a string
    let routeTimeString = null;
    if (place.route.route_time < 60 * 60 * 1000) {
        routeTimmeString = (place.route.route_time / 60000) + " min";
    }
    else {
        routeTimmeString = Math.floor(place.route.route_time / (60 * 60 * 1000)) + " h " + ((place.route.route_time / 60000) % 60) + " min";
    }

    // Convert route mode to a string more easy to read for the user
    let routeMessage = null;
    if (place.route.transport_mode === "car") routeMessage = routeTimmeString + " by car";
    else if (place.route.transport_mode === "pedestrian") routeMessage = routeTimmeString + " on foot";
    else if (place.route.transport_mode === "publicTransport") routeMessage = routeTimmeString + " by public transport";
    else if (place.route.transport_mode === "custom") routeMessage = "set to " + routeTimmeString;

    // Create icon
    const routeDiv = document.createElement("div");
    routeDiv.setAttribute("class", "icon-open-route-modal");

    // Create label written route time and route transport mode
    const label = document.createElement("div");
    label.setAttribute("class", "label-open-route-modal");
    label.innerHTML = routeMessage;

    // Create button that contain the icon and the text 'add route'
    const routeButton = document.createElement("button");
    routeButton.setAttribute("class", "button-open-route-modal");
    routeButton.appendChild(routeDiv);
    routeButton.appendChild(label);

    // Create div to insert the button
    const widgetButton = document.createElement("div");
    widgetButton.setAttribute("class", "widget-button-open-route-modal");
    widgetButton.appendChild(routeButton);
    widgetButton.setAttribute("id", `${place.id}openRouteModalId`)

    // Add event listener to open Add Route Modal when clicked
    widgetButton.addEventListener("click", function(event) {
        openAddRouteModal(place.id);
    });
    
    return widgetButton;
}

// Create a button for the Route Modal
function createRouteButton(place) {

    // if the element is the first element of the day, the button will NOT be created
    const day = place.arrival_time - (place.arrival_time % oneDayInMilliseconds); // Get the day where the place is in
    const placesTime = place.arrival_time % oneDayInMilliseconds; // Get the time of the respective place
    let placesAtDay = []; // Array of the places that are in that day
    for (let i = 0; i < places.length; i++) {
        if (places[i].arrival_time >= day && places[i].arrival_time < (day + oneDayInMilliseconds)) {
            placesAtDay.push(places[i]);
        }
    }
    if(placesAtDay[0].id == place.id) return null;

    // If the 'place' has no route. Then create a 'Add Route' button
    if (!place.route) return createAddRouteButton(place);

    // Check if the route is valid. If the route is invalid, it will be deleted. Otherwise, it will be created a route.
    for (let i = 0; i < places.length; i++) {
        if (places[i].id == place.id) {
            if (places[i - 1].id == place.route.places_origin_id) {
                return createRoute(place);
            }
            else {
                places[i].route = null;
                return createAddRouteButton(place);
            }
        }
    }

    
    return;
}

// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
    return;
}

function clearTable() {
    const planTables = document.querySelectorAll(".date-table");
    for(let i = 0; i < planTables.length; i++ ) {
        planTables[i].innerHTML="";
    }
    return;
}

// This function will sort the 'places' array, print the places at the table, the markers and the info windows
function printTable() {
    // Clear the last table and markers
    clearTable();
    clearMarkers()

    if (places) {
        bubbleSort();

        // create a row with the place info and append it to the plan table
        places.forEach(function(place) { createPlaceTr(place) });
    }

    localStorage.setItem("userPlaces", JSON.stringify(places));
    localStorage.setItem("userTravelDates", JSON.stringify(travelDates));

    return;
}