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
          if($('#loadingSpinner').is(':visible')) {
            $('#loadingSpinner').hide();
            $('#question2').show();
          }
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
    if($(".city_name").is(':empty'))
      $("#loadingSpinner").show();
    else
      $("#question2").show();
  });
  $("#noBtn").on("click", function(e) {
    $("#locationQ").hide();
    $("#locationQ2").show();
    $("#locationForm").show();
    $("#locationInput").focus();
    $('#yesBtn').hide();
    $('#noBtn').hide();
  });
  $("#locationForm").submit(function(e) {
    e.preventDefault();
    window.locationValue = $("#locationInput").val();
    doSearch();
    $("#locationQ2").hide();
    $("#locationForm").hide();
  });
  $("#yesBtn").on("click", function(e) {
    doSearch();
    $("#yesBtn").hide();
    $("#noBtn").hide();
    $("#question2").hide();
  });
}

var doSearch = function() {
  if (window.latitude !== null && typeof window.latitude !== 'undefined')
    var coordinates = new google.maps.LatLng(window.latitude, window.longitude);
  else {
    $("#question2").html("Sorry! We can't seem to find your location.");
    $("#locationInput").focus();
    $("#map").hide();
  }

	var request = {
    location: coordinates,
		query: window.eatValue + " " + window.locationValue,
    radius: '500',
    types: ['restaurant']
	};
  var callback = function(data, status) {
    if (status !== google.maps.places.PlacesServiceStatus.OK) {
      console.error("google api failed with status " + status);
      return;
    }
    if(data.length == 0) {
      console.error("we have no results from API");
      return;
    }
    else {
      $('.resultName').html("");
      $('.resultRating').html("");
      for (var i = 0; i < 10; i++) {
        $('.resultName').append('<span id="name">'+data[i].name+'</span><br>');
        if(typeof data[i].rating !== "undefined" && data[i].rating !== null)
          rating = data[i].rating
        else
          rating = "----"
        $('.resultRating').append('<span id="rating">'+rating+'</span><br>');
      }
      var infowindow = new google.maps.InfoWindow();
      bounds = new google.maps.LatLngBounds();
      for (var i = 0; i < 10; i++) {
        bounds.extend(createMarker(data[i], infowindow));
      }
      $("#map").show();
      google.maps.event.trigger(map, 'resize');
      map.fitBounds(bounds);
      $('html,body').scrollTop(0);
    }
  };

  var service = new google.maps.places.PlacesService(map);
	service.textSearch(request, callback);
}

var map;
var bounds

function initMap() {
    if (window.latitude !== null && typeof window.latitude !== 'undefined') {
      lat = window.latitude;
      lng = window.longitude;
    }
    else {
      lat = 37.7822;
      lng = -122.4167;
    }

    map = new google.maps.Map($('#map')[0], {
      center: {lat: lat, lng: lng},
      zoom: 15
    });
}

var count = 0;

function createMarker(place, infowindow) {
  var positionLoc = new google.maps.LatLng(place.geometry.location.G,place.geometry.location.K);
  
  var marker = new google.maps.Marker({
    position: positionLoc,
    animation: google.maps.Animation.DROP,
    title: place.name
  });

  setTimeout(function() {
    marker.setMap(map);
  }, count += 100);

  google.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent(place.name);
    infowindow.open(map, this);
  });

  return positionLoc;
}
