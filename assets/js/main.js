$('#submitBtn').on('click', function (){
	submitForm();
  
});

$( "#mainForm" ).submit(function( event ) {
  event.preventDefault();
});
//Autofocus to the textbox
if (!("autofocus" in document.createElement("input"))) {
    $("#textBox").focus();
}			
	var map = new google.maps.Map(document.createElement('div'))
	var service = new google.maps.places.PlacesService(map);
  
	var callback = function(data) {
    $('.resultName').html("");
    $('.resultRating').html("");
		for (var i = 0; i < 10; i++) {

		    $('.resultName').append('<span id="name">'+data[i].name+'</span><br>');
		    $('.resultRating').append('<span id="rating">'+data[i].rating+'</span><br>');
		   
		}
		data.length=0;
		console.log(data);
	}
  var pyrmont = new google.maps.LatLng(37.7629571, -122.46647790000002);

  $(function() {
      navigator.geolocation.getCurrentPosition(function(data) {
          window.latitude = data.coords.latitude;
          window.longitude = data.coords.longitude;
          console.log(window.latitude);
          console.log(window.longitude);
          //console.log( window['coordinates']['latitude']+","+window['coordinates']['longitude']);

      }, function(error) {console.error(error);$('#question').text("What would you like to eat?","Oops! We can't quite get your location.")});

  });
  
	function submitForm(){

		var request = {
      location: pyrmont,
			query: $('#textBox').val(),
      radius: '500',
      types: ['restaurant'],
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


