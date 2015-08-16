$(function() {
  setupHandlers();
  $("#eatInput").focus();

  navigator.geolocation.getCurrentPosition(
    function(data) {
      window.latitude = data.coords.latitude;
      window.longitude = data.coords.longitude;

      $.ajax({
          url: "https://maps.googleapis.com/maps/api/geocode/json",
          type: "GET",
          data: {
            latlng: window.latitude + "," + window.longitude, 
            sensor: true, 
            key:"AIzaSyDZymPd6_9qWy_mhMnZvmU_-SEw5cj2jds"
          }
      }).then(
        function(data){
          window.locationValue = data.results[0].formatted_address;
          // console.log(window.locationValue);
          // console.log(data.results)
          $('.city_name').text(data.results[1].address_components[0].long_name);
        }
      );
    },
    function(error) {
      console.error(error.toString());
    }
  );
});


var setupHandlers = function() {
  $("#eatForm").submit(function(e) {
    e.preventDefault();
    window.eatValue = $("#eatInput").val();
    $("#eatForm").hide();
    $("#question").hide();
    $("#locationQ").show();
  });
  $("#noBtn").on("click", function(e) {
    $("#locationForm").show();
    $("#locationInput").focus();
    $('#yesBtn').hide();
    $('#noBtn').hide();

  });
  $("#locationForm").submit(function(e) {
    e.preventDefault();
    window.locationValue = $("#locationInput").val();
    $("#locationForm").html("<h2>RESULTS</h2>");
    doSearch();
  });
  $("#yesBtn").on("click", function(e) {
    doSearch();
    $("#map").show();
    $("#yesBtn").hide();
    $("#noBtn").hide();
  });
}

var doSearch = function() {
  if (window.latitude !== null && typeof window.latitude !== 'undefined')
    var coordinates = new google.maps.LatLng(window.latitude, window.longitude);
  else 
   console.error("we cant get user location.");
	var request = {
    location: coordinates,
		query: window.eatValue + " " + window.locationValue,
    radius: '500',
    types: ['restaurant']
	};
  var callback = function(data, status) {
    if(data.length == 0)
      console.error("we have no results from API");
    else {
      $('.resultName').html("");
      $('.resultRating').html("");
      for (var i = 0; i < 10; i++) {
        $('.resultName').append('<span id="name">'+data[i].name+'</span><br>');
        $('.resultRating').append('<span id="rating">'+data[i].rating+'</span><br>');
      }
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < data.length; i++) {
          //var position = new google.maps.LatLng(latitude[i],longitude[i]);
          createMarker(data[i]);
          
        }
      }
    }
  };
  
  


  //wrong instance of map??
  var infowindow = new google.maps.InfoWindow();
  var service = new google.maps.places.PlacesService(map);
	service.textSearch(request, callback);
console.log("COORDINATES"+coordinates);
}

function initMap() {
    var map = new google.maps.Map($('#map')[0], {
      center: {lat: 37.7833, lng: -122.4167},
      zoom: 15
    });
}

function createMarker(place) {
  //var myLatLng = {lat: place.geometry.location.G, lng: place.geometry.location.K};
  var positionLoc = new google.maps.LatLng(place.geometry.location.G,place.geometry.location.K);
  //console.log(myLatLng);
  var marker = new google.maps.Marker({
    setMap: map,
    position: positionLoc,
    animation: google.maps.Animation.DROP
  });

  google.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent(place.name);
    infowindow.open(map, this);
  });
}
