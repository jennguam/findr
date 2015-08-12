$('#submitBtn').on('click', function (){
	submitForm();
  
});

$( "#mainForm" ).submit(function( event ) {
  event.preventDefault();
});
				
	var map = new google.maps.Map(document.createElement('div'))
	var service = new google.maps.places.PlacesService(map);
	var callback = function(data) {

		for (var i = 0; i < 10; i++) {
		    
		    $('.resultName').append('<span id="name">'+data[i].name+'</span><br>');
		    $('.resultRating').append('<span id="rating">'+data[i].rating+'</span><br>');
		    console.log(data[i].rating)
		    
		}
		data.length=0;
		console.log(data);
	}
	//Autofocus to the textbox
	if (!("autofocus" in document.createElement("input"))) {
	    $("#textBox").focus();
	}
  $(function() {
      navigator.geolocation.getCurrentPosition(function(data) {
          latitude = data["coords"]["latitude"];
          longitude = data["coords"]["longitude"];
          console.log(latitude+","+longitude);
      }, function(error) {console.error(error)});

    });
	function submitForm(){
    
    
		var request = {
      location: {latitude,longitude}, 
			query: $('#textBox').val(),
      types: ['store']
		}
		service.textSearch(request, callback);
    
	}
	//Enter Button function
	$("input").keypress(function(event) {
	    if (event.which == 13) {
	        
	        
	        $('#mainForm').submit(submitForm());
          event.preventDefault();
	    }
	});
  
  if (navigator.geolocation) {
  console.log('Geolocation is supported!');
    }
    else {
      console.log('Geolocation is not supported for this Browser/OS version yet.');
    }



// window.onload = function() {
//   var startPos;
//   var geoSuccess = function(position) {
//     startPos = position;
//     debugger
//     $('#startLat').innerHTML = startPos.coords.latitude;
//     $('#startLon').innerHTML = startPos.coords.longitude;
//   };
//   navigator.geolocation.getCurrentPosition(geoSuccess);
// };
	// if i want to include a map
	// function callback(results, status) {
	//   if (status == google.maps.places.PlacesServiceStatus.OK) {
	//     for (var i = 0; i < results.length; i++) {
	//       var place = results[i];
	//       createMarker(results[i]);
	//     }
	//   }
	// }
