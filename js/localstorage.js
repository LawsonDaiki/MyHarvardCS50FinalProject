const init = async() => {
    travelDates = [];
    places = [];
    try {
        travelDates = await JSON.parse(localStorage.getItem("userTravelDates"));
        places = await JSON.parse(localStorage.getItem("userPlaces"));
    }
    catch (err) {
        console.log(err);
        initMap(); // Iniciate Google Maps
        initAutocomplete(); // Iniciate Google auto complete
        
    }
}

init()
    .then(() => {
        // Create date section and radio selectors in the modals
        printDatesSection();
        createDatesRadioButtonsAtAddPlaceModal();
        createDatesRadioButtonsAtEditPlaceModal();

        initMap(); // Iniciate Google Maps
        initAutocomplete(); // Iniciate Google auto complete
        printTable(); // Print places
    })