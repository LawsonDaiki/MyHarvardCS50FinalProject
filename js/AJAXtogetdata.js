async function preload() {
    fetch('./dates.json')
        .then(response => response.json())
        .then(function(data) {
            travelDates = data;

            // Create date section and radio selectors in the modals
            printDatesSection();
            createDatesRadioButtonsAtAddPlaceModal();
            createDatesRadioButtonsAtEditPlaceModal();

            console.log("dates JSON loaded");
        })
        .then(
            fetch('./places.json')
                .then(response => response.json())
                .then(function(data) {
                    places = data;

                    initMap(); // Iniciate Google Maps
                    initAutocomplete(); // Iniciate Google auto complete
                    printTable(); // Print places
                    
                    console.log("places JSON loaded");
                })
                .catch(error => {
                    console.error('There has been a problem with your fetch operation:', error);
                })
        )
        return;
}

preload();