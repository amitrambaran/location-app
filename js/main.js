const mapBoxToken = 'pk.eyJ1IjoiYW1pdHJhbWJhcmFuIiwiYSI6ImNqc252YnZmZjA0NDUzeWxpenNpdzdibWsifQ.F4mln7_wTFVzIaOr9C8AAg';
var dropboxContent = document.querySelector("#dropbox-content");
var results = document.querySelector("#results");
var mymap = L.map('mapid').setView([43.6532, -79.3832], 9);
var dropbox = document.getElementById("droppable");


window.onload = function () {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(geoSuccess, geoFailure);
    }
    else {
        results.innerHTML = "Geolocation not supported.";
    }
}

function geoSuccess(position) {
    currentLat = position.coords.latitude;
    currentLong = position.coords.longitude;
    console.log(currentLat, currentLong);
    results.innerHTML = "Your last coordinates are: " + currentLat + ", " + currentLong;
    //create map
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: mapBoxToken
    }).addTo(mymap);
    L.marker([currentLat, currentLong]).addTo(mymap);
}

function geoFailure(error) {
    results.innerHTML = "Error: " + error.message;
}


function dragOverHandler(event) {
    ignoreDrag(event);
    console.log("drag enter");
    dropboxContent.innerHTML = "Drop!";
    dropbox.classList.add('hoverwithfile');
};

function dragLeaveHandler(event) {
    ignoreDrag(event);
    console.log("drag leave")
    dropboxContent.innerHTML = "Drag coordinate text file here";
    dropbox.classList.remove('hoverwithfile');
}

function dropHandler(event) {
    ignoreDrag(event);
    let file = event.dataTransfer.files[0];
    let reader = new FileReader();
    reader.onload = function (event) {
        let coordinates = event.target.result;
        coordinateArray = coordinates.split(',');
        inputLat = coordinateArray[0];
        inputLong = coordinateArray[1];
        console.log(inputLat, inputLong);
    }
    reader.readAsText(file);

}

function ignoreDrag(event) {
    event.stopPropagation();
    event.preventDefault();
}
