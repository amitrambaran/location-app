const mapBoxToken = 'pk.eyJ1IjoiYW1pdHJhbWJhcmFuIiwiYSI6ImNqc252YnZmZjA0NDUzeWxpenNpdzdibWsifQ.F4mln7_wTFVzIaOr9C8AAg';
var dropboxContent = document.querySelector("#dropbox-content");
var currentCoords = document.querySelector("#currentCoords");
var inputCoords = document.querySelector("#inputCoords");
var selectedCoords = document.querySelector("#selectedCoords");
var dropbox = document.getElementById("droppable");
var haversineOutput = document.getElementById("haversine-distance");
var mymap = L.map('mapid').setView([43.6532, -79.3832], 9);
var latLongPair = {
    lat1: 0,
    lng1: 0,
    latDropped: 0,
    lngDropped: 0
};

var webWorker = new Worker('js/webworker.js');
webWorker.addEventListener('error', handleWorkerError);
webWorker.addEventListener('message', handleWorkerMessage);

function handleWorkerError(event) {
    console.warn('Error in web worker: ', event.message);
}

function handleWorkerMessage(message) {
    haversineOutput.innerHTML = "The distance between your two locations is: " + message.data + " kms";
}

window.onload = function () {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(geoSuccess, geoFailure);
    }
    else {
        currentCoords.innerHTML = "Geolocation not supported.";
    }
}

function geoSuccess(position) {
    currentLat = position.coords.latitude;
    currentLong = position.coords.longitude;
    //console.log(currentLat, currentLong);
    currentCoords.innerHTML = "Your current coordinates are: " + currentLat + ", " + currentLong;
    //create map
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: mapBoxToken
    }).addTo(mymap);
    L.marker([currentLat, currentLong]).bindPopup("Your current location").addTo(mymap);
    latLongPair.lat1 = currentLat;
    latLongPair.lng1 = currentLong;
}

function geoFailure(error) {
    currentCoords.innerHTML = "Error: " + error.message;
}

function dragOverHandler(event) {
    ignoreDrag(event);
    console.log("drag enter");
    addHoverClass();
};

function dragLeaveHandler(event) {
    ignoreDrag(event);
    console.log("drag leave")
    removeHoverClass();
}

function dropHandler(event) {
    ignoreDrag(event);
    let file = event.dataTransfer.files[0];
    let reader = new FileReader();
    reader.onload = function (event) {
        let coordinates = event.target.result, coordinateString = "", coordinateArray = coordinates.split(',');
        draggedLat = coordinateArray[0];
        draggedLong = coordinateArray[1];
        coordinateString = draggedLat + ", " + draggedLong;
        inputCoords.innerHTML = "Your dropped coordinates are: " + coordinateString;
        L.marker([draggedLat, draggedLong]).bindPopup("Dropped coordinates: " + coordinateString).addTo(mymap);
        draggedLatLongMap(draggedLat, draggedLong);
        webWorker.postMessage(latLongPair);
    }
    reader.readAsText(file);
    removeHoverClass();
}

function ignoreDrag(event) {
    event.stopPropagation();
    event.preventDefault();
}

function onMapClick(event) {
    clickedCoords = event.latlng.toString();
    selectedCoords.innerHTML = "Your selected coordinates are: " + event.latlng.lat + ", " + event.latlng.lng;
    var myMarker = L.marker([event.latlng.lat, event.latlng.lng], { title: "Your selected location", draggable: true })
        .addTo(mymap)
        .on('dragend', function () {
            let selectedLat = parseFloat(myMarker.getLatLng().lat);
            let selectedLong = parseFloat(myMarker.getLatLng().lng);
            console.log(selectedLat, selectedLong);
            selectedCoords.innerHTML = "Your selected coordinates are: " + selectedLat + ", " + selectedLong;
            myMarker.bindPopup("Moved to: " + selectedLat + ", " + selectedLong + ".");
            selectedLatLongMap(selectedLat, selectedLong);
            webWorker.postMessage(latLongPair)
        });
    selectedLatLongMap(event.latlng.lat, event.latlng.lng);
    webWorker.postMessage(latLongPair)
}

function draggedLatLongMap(lat, lng) {
    latLongPair.latDropped = parseFloat(lat);
    latLongPair.lngDropped = parseFloat(lng);
}

function selectedLatLongMap(lat, lng) {
    latLongPair.lat1 = lat;
    latLongPair.lng1 = lng;
}

function addHoverClass() {
    dropboxContent.innerHTML = "Drop!";
    dropbox.classList.add('hoverwithfile');
}

function removeHoverClass() {
    dropboxContent.innerHTML = "Drag coordinate text file here";
    dropbox.classList.remove('hoverwithfile');
}

mymap.on('click', onMapClick);