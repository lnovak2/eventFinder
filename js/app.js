var map;
var locations = [];
var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
var num = 1;
var markers=[];
var markerCluster;

function initMap(){
	map = new google.maps.Map(document.getElementById('map'), {
	center: {lat: 41.8781, lng: -87.6298},
	zoom: 3
	});
};

function renderDataMarkers(locations) {
	for (var i=0; i<markers.length; i++){
		markers[i].setMap(null);
	}
	if(markerCluster)
		markerCluster.clearMarkers();
	markers = locations.map(function(location, i){
		return new google.maps.Marker({
			position: location,
			label: labels[i % labels.length]
		})
	});
	markerCluster = new MarkerClusterer(map, markers,
	{imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'})
}


var eventful_url_base = '/events/search';

function getDataFromEventful (callback){
	var query = {
		app_key: eventful_key,
		keywords: $('#keyword').val(),
		location: $('#location').val(),
		date: $('#date').val(),
		within: $('#within').val(),
		page_size: 10,
		page_number: num
	}
	EVDB.API.call(eventful_url_base, query, callback);
};

function displayEventfulData(data){
	console.log(data);
	var resultElement = '';
	if (data.events) {
		data.events.event.forEach(function(item) {
	     resultElement += 
	     '<div class="data">' +
		     '<div class="photo">' +
				getEventPicture(item) +
			 '</div>' +
			 '<div class="info">' +
			 	'<h2>' + item.title + '</h2>' +
			 	'<h3>' + item.start_time + '</h3>' +
			 	'<h4>' + item.venue_name + '</h4>' +
			 	'<p>' + 
			 	item.city_name + ', ' + item.region_abbr + '</br>' +
			 	getEventAddress(item) +'</p>' +
			 '</div>' +
		'</div>';
	    });
	    resultElement +=
	    '<div class="nav">' +
		    '<div id="buttons">' +
		    	'<button type="button" id="previous">Previous</button>' +
		    	'<p>Page ' + data.page_number + ' of ' + data.page_count + '</p>' +
		    	'<button type="button" id="next">Next</button>' +
		    '</div>'+
		'</div>';
	    locations = data.events.event.map(function(item){
	    	return {lat: parseFloat(item.latitude), lng: parseFloat(item.longitude)};
	    })
	   renderDataMarkers(locations);
	} else {
		resultElement = '<h2>No Results</h2>'
	}
	$('#list').html(resultElement);
	renderPreviousButton(data);
};

function getEventAddress (item) {
	if(!item.venue_address){
		return 'No Address Found';
	}
	return item.venue_address;
}

function getEventPicture (item) {
	if (item.image){
		return '<img src=' + item.image.medium.url + '>';	
	} else{
		return '<p>Image not Available</p>';
	}
};

function renderPreviousButton(data){
	console.log(data.page_number)
	if(data.page_number > 1){
		$('#previous').show();
	} else {
		$('#previous').hide();
	}
}

function clearMarkers(){
	renderDataMarkers(null);
}

function deleteMarkers(){
	clearMarkers();
	markers = [];
};

$('#submit').click(function(event){
	event.preventDefault();
	getDataFromEventful(displayEventfulData);
	$('#initial_picture').hide();
	$('#list').show();
	$('#map').show();
});

$('#list').on('click', '#next', function(event){
	event.preventDefault();
	num++;
	getDataFromEventful(displayEventfulData);
});

$('#list').on('click', '#previous', function(event){
	event.preventDefault();
	num--;
	getDataFromEventful(displayEventfulData);
});

