// Create global scope variable to store the place data
let searchedPlace = new Place;

let newMarker = null;

let map = null;

// Create the google map
function initMap() {
  let mapSettings = null;
  if (!places) mapSettings = {
    center: {
      lat: 40.708913,
      lng: -74.039099
    },
    zoom: 13,
    disableDefaultUI: true
  }
  else mapSettings = {
    center: places[0].location,
    zoom: 13,
    disableDefaultUI: true
  }

  map = new google.maps.Map(document.getElementById('map'), mapSettings);

  // Create a marker variable to the global scope
  newMarker = new google.maps.Marker({
    position: null,
    map: map
  });

  return;
}

function initAutocomplete() {
  // Create the search box and link it to the UI element.
  var input = document.getElementById('my-input-searchbox');
  var autocomplete = new google.maps.places.Autocomplete(input);
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);
  var marker = new google.maps.Marker({
    map: map
  });

  // Bias the SearchBox results towards current map's viewport.
  autocomplete.bindTo('bounds', map);
  // Set the data fields to return when the user selects a place.
  autocomplete.setFields(['name', 'place_id', 'geometry', 'formatted_address', 'address_components']);

  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  autocomplete.addListener('place_changed', function() {
    var place = autocomplete.getPlace();
    if (!place.geometry) {
      alert("Returned place contains no geometry");
      return;
    }
    var bounds = new google.maps.LatLngBounds();

    // Create marker
    newMarker.setMap(null);
    newMarker = new google.maps.Marker({
      position: place.geometry.location,
      map: map
    });

    // Create info window
    var infowindow = new google.maps.InfoWindow({
      content: '<h2>' + place.name + '</h2>' + '<a target="_blank" href=' +'"https://www.google.com/maps/place/?q=place_id:' + place.place_id + '">Open in Google Maps</a>' + '<button id="open-add-place-modal" class="button bto-principal">Add Place</button>',
      //maxWidth: 200
    });
    // Open the info window at the marker
    infowindow.open(map, newMarker);
    // Open the info window when marker are clicked
    newMarker.addListener('click', function() {
      infowindow.open(map, newMarker);
    });

    if (place.geometry.viewport) {
      // Only geocodes have viewport.
      bounds.union(place.geometry.viewport);
    } else {
      bounds.extend(place.geometry.location);
    }
    map.fitBounds(bounds);

    searchedPlace.name = place.name;
    searchedPlace.place_id = place.place_id; 
    searchedPlace.location = place.geometry.location;
    searchedPlace.formatted_address = place.formatted_address;

    // Set auto focus to the add local button
    setTimeout(function(){ document.getElementById('open-add-place-modal').focus() }, 500);
  });

  return;
}