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
	function submitForm(){

		var request = {
			query: $('#textBox').val()
		}
		service.textSearch(request, callback);

	}
	//Enter Button function
	$("input").keypress(function(event) {
	    if (event.which == 13) {
	        
	        //*****ASK GABE
	        $('#mainForm').submit(submitForm());
          event.preventDefault();
	    }
	});
	// if i want to include a map
	// function callback(results, status) {
	//   if (status == google.maps.places.PlacesServiceStatus.OK) {
	//     for (var i = 0; i < results.length; i++) {
	//       var place = results[i];
	//       createMarker(results[i]);
	//     }
	//   }
	// }
