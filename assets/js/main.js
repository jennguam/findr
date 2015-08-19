MAXIMUM_LOADING_TIME = 5000;
MAXIMUM_RESULTS = 6;
GMAPS_API_KEY = "AIzaSyDZymPd6_9qWy_mhMnZvmU_-SEw5cj2jds";
DEFAULT_PHOTO_URL = "https://maps.gstatic.com/mapfiles/place_api/icons/restaurant-71.png?height=190&width=190"
MAX_PHOTO_WIDTH = 180;
MAX_PHOTO_HEIGHT = 175;

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
  $("#locationQ2, #locationForm").hide();
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
            key: GMAPS_API_KEY
          }
      }).then(
        function(data){
          window.latitude = data.results[0].geometry.location.lat;
          window.longitude = data.results[0].geometry.location.lng;
        }
      );
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
  var service = new google.maps.places.PlacesService(map);

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
      $('.results').html("");
      var dataCount = Math.min(data.length, MAXIMUM_RESULTS);
      for (var i = 0; i < dataCount; i++) {
        singleResult = $(getSingleResult());
        singleResult.find('.resultName').append('<span id="name">'+data[i].name+'</span><br>');
        singleResult.find('.resultAddress').append('<span id="address">'+data[i].formatted_address+'</span><br>');
        if(data[i].photos)
          var photoUrl = data[i].photos[0].getUrl({maxWidth: MAX_PHOTO_WIDTH, maxHeight: MAX_PHOTO_HEIGHT});
        else
          var photoUrl = DEFAULT_PHOTO_URL;
        singleResult.find('.resultImageContainer').append('<img class="resultImage hidden-md" src='+photoUrl+'>');
        var rating = data[i].rating || "----";
        singleResult.find('.resultRating').append('<span id="ratingContainer">'+rating+'</span><br>');
        var dollarSigns = getDollarSigns(data[i].price_level);
        singleResult.find('.resultPrice').append('<span id="price_level">'+dollarSigns+'</span><br>');
        $('.results').append(singleResult);
      }
      $('.eachResult, .tryagain, .hvr-icon-spin').show();
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

var getDollarSigns = function(price_level) {
  var dollarSigns = "";
  for(var i=0; i<price_level; i++)
    dollarSigns += "&#36";
  return dollarSigns || "--";
}
  
var getSingleResult = function(){
  return '<div class="eachResult col-xs-12 well">' +
           '<div class="col-xs-3 hidden-xs">' +
             '<div class="resultImageContainer text-center"></div>' +
           '</div>' +
           '<div class="col-xs-9">' +
             '<div class="resultName resultname fadeIn"></div> ' +
             '<div class="resultAddress address fadeIn"></div>' +              
             '<div class="resultPrice price fadeIn"></div>' +
             '<div class="resultRating rating fadeIn"></div>' 
           '</div>' +
          '</div>'
}
