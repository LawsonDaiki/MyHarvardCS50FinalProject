let draggedPlaceId = null;
let belowTargetPlaceId = null;
let draggedOverDateId = null;

// Function for the container for the drag and drop feature
// Function used at the container event listener creation
function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('.draggable:not(.dragging)')]

  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect()
    const offset = y - box.top - box.height / 2
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child }
    } else {
      return closest
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element
}

// Update the 'places' variable after a place is dragged
function updateTime(placeId, dateId, bellowTargetId) {
  // Get place arrival time, departure time and dragged item index
  let index = null;
  let arrival_time = null;
  let departure_time = null;
  for(let i = 0; i < places.length; i++) {
    if(places[i].id == placeId) {
      arrival_time = places[i].arrival_time;
      departure_time = places[i].departure_time;
      index = i;
    }
  }

  // Get dateId time in Epoch milliseconds
  let selectedDate = null;
  for(let i = 0; i < travelDates.length; i++) {
    if(travelDates[i].id == dateId) {
      selectedDate = travelDates[i].date;
    }
  }

  // Get places of targeted date
  let placesInDay = [];
  for(let i = 0; i < places.length; i++) {
    if(places[i].arrival_time >= selectedDate && places[i].arrival_time < (selectedDate + 86400000)) placesInDay.push(places[i]);
  }

  // In the case the place has not been moved
  if(bellowTargetId != null) {
    for(let i = 0; i < placesInDay.length; i++) {
      if(placesInDay[i].id == bellowTargetId && i - 1 == index) return
    }
  }
  if(bellowTargetId == null) {
    if(placesInDay.length != 0) {
      if(placesInDay[placesInDay.length - 1].id == placeId) return
    }
  }

  // In the case targeted date is empty
  if(placesInDay.length == 0) {
    places[index].arrival_time = selectedDate + (arrival_time % 86400000);
    places[index].departure_time = selectedDate + (departure_time % 86400000);
    return
  }


  // In the case target at the end of the day.
  if(placesInDay.length != 0 && bellowTargetId == null) {

    // In case is possible to insert the place without changing the arrival time and departure time.
    if((selectedDate + (arrival_time % 86400000)) >= placesInDay[placesInDay.length - 1].departure_time) {
      places[index].arrival_time = selectedDate + (arrival_time % 86400000);
      places[index].departure_time = selectedDate + (departure_time % 86400000);
      return
    }

    // In case the arrival time and departure time need to be updated
    else {
      places[index].arrival_time = placesInDay[placesInDay.length - 1].departure_time;

      //In case the departure time wont be in the next day
      if (places[index].arrival_time + (departure_time - arrival_time) < (selectedDate + 86400000)) {
        places[index].departure_time = places[index].arrival_time + (departure_time - arrival_time);
      }
      else { // In case the departure time will be in the next day, the time will be set to 23h59
        places[index].departure_time = selectedDate + 86400000 - 60000;
      }
      return
    }
  }

  // In the case target at the top of the day
  if(belowTargetPlaceId == placesInDay[0].id) {
    
    // In case is possible to insert the place without changing the arrival time and departure time.
    if( (selectedDate + (departure_time % 86400000)) <= placesInDay[0].arrival_time) {
      places[index].arrival_time = selectedDate + (arrival_time % 86400000);
      places[index].departure_time = selectedDate + (departure_time % 86400000);
      return
    }

    // In case the arrival time and departure time need to be updated
    else {
      places[index].departure_time = placesInDay[0].arrival_time;

      // In case the arrival time wont be in the previus day
      if(places[index].departure_time - (departure_time - arrival_time) >= selectedDate) {
        places[index].arrival_time = places[index].departure_time - (departure_time - arrival_time);
      }
      else { // In case the arrival time will be in the previus day, the time will be set to 00h00
        places[index].arrival_time = selectedDate;
      }
      return
    }
  }

  // In the case target is between places
  if(bellowTargetId != null && bellowTargetId != placesInDay[0].id) {
    let bellowTargetIndex = null;
    let aboveTargetIndex = null;

    // Search for the index of the place above target
    for(let i = 0; i < places.length ; i++) {
      if(places[i].id == bellowTargetId) {
        bellowTargetIndex = i;
        aboveTargetIndex = i - 1;
      }
    }

    // In case is possible to insert the place without changing the arrival time and departure time.
    if( (selectedDate + (arrival_time % 86400000)) >= places[aboveTargetIndex].departure_time && (selectedDate + (departure_time % 864000000)) <= places[bellowTargetIndex].arrival_time ) {
      places[index].arrival_time = selectedDate + (arrival_time % 86400000);
      places[index].departure_time = selectedDate + (departure_time % 86400000);
      return
    }

    // In case the time between the target are equal o smaller than the duration of the target place event
    if(places[bellowTargetIndex].arrival_time - places[aboveTargetIndex].departure_time <= departure_time - arrival_time) {
      places[index].arrival_time = places[aboveTargetIndex].departure_time;
      places[index].departure_time = places[bellowTargetIndex].arrival_time;
      return
    }
    else {
      places[index].arrival_time = places[aboveTargetIndex].departure_time;
      places[index].departure_time = places[index].arrival_time + (departure_time - arrival_time);
      return;
    }
  }

  return;
}

// Updates only the dragged element arrival time and departure time
function updateTimeAtDateSection(draggedPlaceId) {
  // Get arrival time and departure time elements at DOM
  const arrivalTimeDiv = document.getElementById(`${draggedPlaceId}RowId`).getElementsByClassName("td-arrivaltime-class")[0];
  const departureTimeDiv = document.getElementById(`${draggedPlaceId}RowId`).getElementsByClassName("td-departuretime-class")[0];
  
  // Get arrival time and departure time of the respective place Id and convert to HH:MM format
  let arrivalTime = null;
  let departureTime = null;
  for (let i = 0; i < places.length; i++) {
    if (places[i].id == draggedPlaceId) {
      arrivalTime = places[i].arrival_time;
      departureTime = places[i].departure_time;
    }
  }
  arrivalTime = convertEpochToHHMM(arrivalTime);
  departureTime = convertEpochToHHMM(departureTime);

  // Change dragged place times
  arrivalTimeDiv.textContent = arrivalTime;
  departureTimeDiv.textContent = departureTime;

}

// Function implemented at the event listener of the end of the drag.
function updatePlacesOnDragOver(draggedPlaceId, belowTargetPlaceId, draggedOverDateId) {
  if(draggedPlaceId == null || draggedOverDateId == null) {
    console.log("error")
    return
  }

  updateTime(draggedPlaceId, draggedOverDateId, belowTargetPlaceId); // Update the dragged arrival and departure times at the 'places' variable
  // updateTimeAtDateSection(draggedPlaceId); // Update the arrival and departure times of the dragged row
  printTable();

  return;
}