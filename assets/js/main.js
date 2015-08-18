MAXIMUM_LOADING_TIME = 5000;
GMAPS_API_KEY = "AIzaSyDZymPd6_9qWy_mhMnZvmU_-SEw5cj2jds";

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
            key: GMAPS_API_KEY
          }
      }).then(
        function(data){
          window.locationValue = data.results[0].formatted_address;
          if(isLoading()) {
            $('#loadingSpinner').hide();
            $("#locationQ").show();
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

var isLoading = function() {
  return $('#loadingSpinner').is(':visible')
}

var loadingSequence = function() {
  $("#loadingSpinner").show();
  setTimeout(function() {
    if(isLoading()) {
      $("#loadingSpinner").hide();
      $("#locationQ2").show();
      $("#locationQ2").prepend("<span class='question'>Oops! We couldn't find you.</span><br>");
      $("#locationInput").focus();
    }
  }, MAXIMUM_LOADING_TIME);
}

var resolveEatSubmit = function() {
  $("#eatQ").hide();
  if($(".city_name").is(':empty'))
    loadingSequence();
  else
    $("#locationQ").show();
}

var resolveNoBtn = function() {
  $("#locationQ").hide();
  $("#locationQ2").show();
  $("#locationInput").focus();
}

var resolveLocationSubmit = function() {
  $("#locationQ2").hide();
  $("#locationForm").hide();
}

var resolveYesBtn = function() {
  $("#locationQ").hide();
}

var prepCustomLocation = function(address) {
  window.locationValue = address;
  return $.ajax({
          url: "https://maps.googleapis.com/maps/api/geocode/json",
          type: "GET",
          data: {
            address: address,
            key: "AIzaSyDZymPd6_9qWy_mhMnZvmU_-SEw5cj2jds"
          }
      }).then(
        function(data){
          window.latitude = data.results[0].geometry.location.lat;
          window.longitude = data.results[0].geometry.location.lng;
        }
      );
}

var getPhoto = function(photoRef) {
  window.locationValue = address;
  return $.ajax({
          url: "https://maps.googleapis.com/maps/api/place/photo",
          type: "GET",
          data: {
            photoreference: photoRef,
            key: "AIzaSyDZymPd6_9qWy_mhMnZvmU_-SEw5cj2jds",
            maxwidth:400
          }
      });
}

var setupHandlers = function() {
  $("#eatForm").submit(function(e) {
    e.preventDefault();
    window.eatValue = $("#eatInput").val();
    resolveEatSubmit();
  });
  $("#noBtn").on("click", function(e) {
    resolveNoBtn();
  });
  $("#locationForm").submit(function(e) {
    e.preventDefault();
    prepCustomLocation($("#locationInput").val()).then(function() {
      doSearch();
      resolveLocationSubmit();
    });
  });
  $("#yesBtn").on("click", function(e) {
    doSearch();
    resolveYesBtn();
  });
}

var doSearch = function() {
  var coordinates = new google.maps.LatLng(window.latitude, window.longitude);

	var request = {
    location: coordinates,
		query: window.eatValue,
    radius: '500',
    types: ['restaurant','food']
	};
  var callback = function(data, status) {
    if (status !== google.maps.places.PlacesServiceStatus.OK) {
      console.error("google api failed with status " + status);
      $("#noResults").show();
      return;
    }
    if(data.length == 0) {
      console.error("we have no results from API");
      return;
    }
    else {
      $('.eachResult').show();
      console.log(data);
      $('.resultName').html("");
      $('.resultRating').html("");
      var dataCount = Math.min(data.length, 6)
      for (var i = 0; i < dataCount; i++) {
        $('.resultName_'+i).append('<span id="name">'+data[i].name+'</span><br>');
        $('.resultAddress_'+i).append('<span id="address">'+data[i].formatted_address+'</span><br>');
        //console.log(data[i].photos);
        if(typeof data[i].rating !== "undefined" && data[i].rating !== null)
          rating = data[i].rating
        else
          rating = "----"
        $('.resultRating_'+i).append('<span id="rating">'+rating+'</span><br>');
        switch(data[i].price_level) {
            case 1:
                $('.resultPrice_'+i).append('<span id="price_level"><i class="fa fa-usd"></i></span><br>');
                break;
            case 2:
                $('.resultPrice_'+i).append('<span id="price_level"><i class="fa fa-usd"></i><i class="fa fa-usd"></i></span><br>');
                break;
            case 3:
                $('.resultPrice_'+i).append('<span id="price_level"><i class="fa fa-usd"></i><i class="fa fa-usd"></i><i class="fa fa-usd"></i></span><br>');
                break;
            case 4:
                $('.resultPrice_'+i).append('<span id="price_level"><i class="fa fa-usd"></i><i class="fa fa-usd"></i><i class="fa fa-usd"></i><i class="fa fa-usd"></i></span><br>');
                break;
            default:
                $('.resultPrice_'+i).append('<span id="price_level">-</span><br>');
        }
        $('.tryagain').show();
        $('.hvr-icon-spin').show();

      }
      var infowindow = new google.maps.InfoWindow();
      var bounds = new google.maps.LatLngBounds();
      for (var i = 0; i < dataCount; i++) {
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

var individualMarkerTimeout = 0;

function createMarker(place, infowindow) {
  var positionLoc = new google.maps.LatLng(place.geometry.location.G,place.geometry.location.K);
  
  var marker = new google.maps.Marker({
    position: positionLoc,
    animation: google.maps.Animation.DROP,
    title: place.name
  });

  setTimeout(function() {
    marker.setMap(map);
  }, individualMarkerTimeout += 100);

  google.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent(place.name);
    infowindow.open(map, this);
  });

  return positionLoc;
}
