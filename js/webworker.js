function haversineCalc(coordinates) {
    lat1 = coordinates.data.lat1;
    lng1 = coordinates.data.lng1;
    lat2 = coordinates.data.latDropped;
    lng2 = coordinates.data.lngDropped;
    console.log("message received from main script");
    console.log(lat1, lng1, lat2, lng2);

    var R = 6371; // km
    var x1 = lat2 - lat1;
    var dLat = toRad(x1);
    var x2 = lng2 - lng1;
    var dLon = toRad(x2);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    console.log("Haversine distance: " + d);
    postMessage(d);
}
self.addEventListener('message', haversineCalc);

function toRad(x) {
    return x * Math.PI / 180;
}