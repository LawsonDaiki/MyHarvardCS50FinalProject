// Global variables
const oneDayInMilliseconds = 86400000;

// a array of objects to store the places data
let places = [];

// Variable to store an array of 'TravelDate' obj. It is a variable for the user's travel dates.
let travelDates = [];

// Obj for the 'places' array. It is an obj to store the data of the user's choosen place.
function Place(id, name, custom_name, place_id, location, formatted_address, international_phone_number, website, business_status, opening_hours, arrival_time, departure_time, route) {
    this.id = id;
    this.name = name;
    this.custom_name = custom_name;
    this.place_id = place_id;
    this.location = location;
    this.formatted_address = formatted_address;
    this.international_phone_number = international_phone_number;
    this.website = website;
    this.business_status = business_status;
    this.opening_hours = opening_hours;
    this.arrival_time = arrival_time;
    this.departure_time = departure_time;
    this.route = route
}

// Obj for the item in the 'travelDates' array
function TravelDate(id, date) {
    this.id = id,
    this.date = date
}

// Convert Epoch time (milliseconds) to time in HH:MM format
function convertEpochToHHMM(epochTimeMilliseconds) {
    const dateFormat = new Date(epochTimeMilliseconds); // transform arrival timestamp in to a Date object
    const dateUTC = dateFormat.toUTCString(); // converto it to UTC(GMT) string
    const parsedDateUTC = dateUTC.split(" "); // parse it to a array
    const parsedTimeUTC = parsedDateUTC[4].split(":"); // parse the hour, minutes and seconds
    return parsedTimeUTC[0] + ":" + parsedTimeUTC[1]; // add hour and minutes into a single string
}

// Convert HH:MM time format to Epoch time in milliseconds format
// the 'inputedDate' is the radio return value, e.g. '1dateId-addModal';
function convertHHMMToEpoch(hhmm, inputedDate) {
    const dateId = parseInt(inputedDate,10); // Parse 'inputedDate' string to get just the id number

    // Loop to find the respective date of the id
    let dateString;
    for (let i = 0; i < travelDates.length; i++) {
        if (travelDates[i].id == dateId) {
            dateString = travelDates[i].date;
        }
    }

    const timeSplit = hhmm.split(":"); // Separete the HH:MM to an array
    const hoursToMilliseconds = Number(timeSplit[0]) * 3600000; // Convert the HH value to a integer and transform to milliseconds
    const minutesToMilliseconds = Number(timeSplit[1]) * 60000; // Convert the MM value to a integer and transofrm to milliseconds
    return dateString + hoursToMilliseconds + minutesToMilliseconds;
}

//check if the place arrival time and departure time data is valid and return an array of errors messages
function checkPlaceTimeForm(searchedPlace) {
    let errors = []

    if (isNaN(searchedPlace.arrival_time)) errors.push("Must provide arrival time.");

    if (isNaN(searchedPlace.departure_time)) errors.push("Must provide departure time.");

    if (searchedPlace.arrival_time > searchedPlace.departure_time) errors.push("Departure time must be later than the arrival time.")
    
    if (places) {
        for (var i = 0; i < places.length; i++) {
            if (searchedPlace.id == places[i].id) continue;
            if (searchedPlace.arrival_time >= places[i].arrival_time && searchedPlace.arrival_time < places[i].departure_time) {
                errors.push("Time conflict.");
                break;
            }
            if (searchedPlace.departure_time > places[i].arrival_time && searchedPlace.departure_time <= places[i].departure_time) {
                errors.push("Time conflict.");
                break;
            }
        }
    }
    return errors;
}

// bubble sort the array of 'places'
function bubbleSort(){
    // Getting the array length
      var length = places.length;
      
      // The main loop to iterate over the whole list
      for (var i = length-1; i >= 0; i--){
         // Child loop to make iterate all over and over and compare by pairs
         for(var j = 1; j <= i; j++){
             // If the current item is smaller than the next, they will change positions
            if(places[j-1].arrival_time > places[j].arrival_time){
                 var aux = places[j-1];
                 places[j-1] = places[j];
                 places[j] = aux;
            }
            // If both of the itens has the same arrival time
            else if(places[j-1].arrival_time == places[j].arrival_time && places[j-1].departure_time > places[j].departure_time){
                var aux = places[j-1];
                places[j-1] = places[j];
                places[j] = aux;
            }
         }
      }
      return;
}

// bubble sorte the array of 'travelDates'
function sortDates() {
    // Getting the array length
    var length = travelDates.length;
      
    // The main loop to iterate over the whole list
    for (var i = length-1; i >= 0; i--){
       // Child loop to make iterate all over and over and compare by pairs
       for(var j = 1; j <= i; j++){
           // If the current item is smaller than the next, they will change positions
          if(travelDates[j-1].date > travelDates[j].date){
               var aux = travelDates[j-1];
               travelDates[j-1] = travelDates[j];
               travelDates[j] = aux;
          }
       }
    }
    return;
}

// Function that return if the place arrival and departure time have conflict with it opening hours
// It return "true" if there are a conflict
// "false" if there are NO conflict
// "error" if there are an error in the input
function isThereATimeConflict(place) {
    if (!place || !place.arrival_time || !place.departure_time || !place.business_status) return "false";

    let arrival_date = new Date(place.arrival_time); // Get date from place.arrival_time variable that it is in Epoch Time in milliseconds format
    let arrival_string = arrival_date.toUTCString().split(" "); // Convert it to UTC string and split it in an array
    let arrival_weekday = weekdayStringToWeekdayNumber(arrival_string[0]); // Convert the weekday string to the respective number
    let arrival_time_string = arrival_string[4].split(":"); // Split the time to HH and MM array
    let arrival_time = Number(arrival_time_string[0] + arrival_time_string[1]); // Join and convert the time to a integer number

    let departure_date = new Date(place.departure_time); // Get date from place.departure_time variable that it is in Epoch Time in milliseconds format
    let departure_string = departure_date.toUTCString().split(" "); // Convert it to UTC string and split it in an array
    let departure_time_string = departure_string[4].split(":"); // Split the time to HH and MM array
    let departure_time = Number(departure_time_string[0] + departure_time_string[1]); // Join and convert the time to a integer number

    // That clause maybe redundant but its good to be safe
    if (place.business_status != "OPERATIONAL") return "true";

    // If there are no place.opening_hours, it means that the place is 24h
    if (!place.opening_hours) return "false";

    // Check if the place is open 24h all week
    if (place.opening_hours.periods.length == 1 && place.opening_hours.periods[0].close == null) return "false";

    // If the place is OPERATIONAL we need to check if there are any time conflict with the arrival and departure time
    let arrivalCheck = null;
    let departureCheck = null;
    let openTime = null;
    let closeTime = null;
    let openWeekday = null;
    let closeWeekday = null;
    let closeWeekdayPreviusDay = null;
    let closeTimePreviusDay = null;
    let openWeekdayPreviusDay = null;
    let yesterdayCloseTimeIsToday = "no";
    for(let i = 0; i < place.opening_hours.periods.length; i++) {
        arrivalCheck = null;
        departureCheck = null;
        openWeekday = place.opening_hours.periods[i].open.day;
        closeWeekday = place.opening_hours.periods[i].close.day;
        if (i > 0) {
            openWeekdayPreviusDay = place.opening_hours.periods[i - 1].open.day;
            closeWeekdayPreviusDay = place.opening_hours.periods[i - 1].close.day;
            if (openWeekdayPreviusDay != closeWeekdayPreviusDay && closeWeekdayPreviusDay === arrival_weekday) yesterdayCloseTimeIsToday = "yes";
        }
        openTime = Number(place.opening_hours.periods[i].open.time);
        closeTime = Number(place.opening_hours.periods[i].close.time);
        if (openWeekday != closeWeekday) { // In case that today close time is tomorrow
            closeTime = 2400;
        }
        if (openWeekday == arrival_weekday) {
            if (arrival_time >= openTime && arrival_time <= closeTime) arrivalCheck = "noConflict";
            if (departure_time >= openTime && departure_time <= closeTime) departureCheck = "noConflict";
            if (arrivalCheck == "noConflict" && departureCheck == "noConflict") return "false";
        }
        if (yesterdayCloseTimeIsToday === "yes" && closeWeekdayPreviusDay == arrival_weekday) { // In case that the place is a overnight and the user will be there early morning
            console.log('test1');
            closeTimePreviusDay = Number(place.opening_hours.periods[i - 1].close.time);
            if (arrival_time >= 0 && arrival_time <= closeTimePreviusDay) arrivalCheck = "noConflict";
            if (departure_time >= 0 && departure_time <= closeTimePreviusDay) departureCheck = "noConflict";
            if (arrivalCheck == "noConflict" && departureCheck == "noConflict") return "false";
        }
    };

    return "true";
}

function weekdayStringToWeekdayNumber(string) {
    if(string == "Sun,") return 0;
    if(string == "Mon,") return 1;
    if(string == "Tue,") return 2;
    if(string == "Wed,") return 3;
    if(string == "Thu,") return 4;
    if(string == "Fri,") return 5;
    if(string == "Sat,") return 6;
}

function monthNameToMonthNumber(string) {
    if(string == "Jan") return "01";
    if(string == "Feb") return "02";
    if(string == "Mar") return "03";
    if(string == "Apr") return "04";
    if(string == "May") return "05";
    if(string == "Jun") return "06";
    if(string == "Jul") return "07";
    if(string == "Aug") return "08";
    if(string == "Sep") return "09";
    if(string == "Oct") return "10";
    if(string == "Nov") return "11;"
    if(string == "Dec") return "12";
}

// Close modal when 'Escape' keyword is clicked
const page = document.querySelector("body");
page.addEventListener("keydown", function(event) {
    if(event.key == "Escape") {
        const addModal = document.getElementById("add-place-modal");
        addModal.style.display = "none";

        closeEditModal();

        const editDateModal = document.querySelector("#edit-date-modal");
        editDateModal.style.display = "none";

        const addRouteModal = document.querySelector("#add-route-modal");
        addRouteModal.style.display = "none";

        const addDayModal = document.querySelector("#add-day-modal")
        addDayModal.style.display = "none";
    }
});

var css = '.2PlaceRow { background-color: red; }';
var style = document.createElement('style');

if (style.styleSheet) {
    style.styleSheet.cssText = css;
} else {
    style.appendChild(document.createTextNode(css));
}

document.head.appendChild(style);