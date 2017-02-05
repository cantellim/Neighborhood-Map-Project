var map;
//object array that sets up the location info
var locations = [
	{
		title: "Washington Monument",
		address: "2 15th St NW, Washington, DC",
		location: {lat: 38.8895, lng: -77.0353}
	},
	{	title: "Lincoln Memorial",
		address: "2 Lincoln Memorial Cir, NW Washington, DC",
		location: {lat: 38.8893, lng: -77.0500}
	},
	{
		title: "Jefferson Memorial",
		address: "701 E Basin Dr SW, Washington, DC",
		location: {lat: 38.8812, lng: -77.0366}
	},
	{
		title: "White House",
		address: "1600 Pennsylvania Ave NW, Washington, DC",
		location: {lat: 38.8977, lng: -77.0365}
	},
	{	
		title: "Ford's Theater",
		address: "511 10th St NW, Washington. DC",
		location: {lat: 38.8966, lng: -77.0256}
	},
	{
		title: "Air and Space Museum",
		address: "600 Independence Ave SW, Washington, DC",
		location: {lat: 38.8880, lng: -77.0199}
	},
	{
		title: "Nationals Park",
		address: "1500 S Capitol St SE, Washington, DC",
		location: {lat: 38.8728, lng: -77.0074}
	}
];
//initializes the map
function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 38.8900, lng: -77.0369},
		zoom: 14
	});

	google.maps.event.addDomListener(window, "resize", function() {
		var center = map.getCenter();
		google.maps.event.trigger(map, "resize");
		map.setCenter(center);
	});
//creates the infowindow
var infowindow = new google.maps.InfoWindow();

var bounds = new google.maps.LatLngBounds();

//creates marker properties and puts them in the maker array
	for (var i = 0; i < locations.length; i++) {
		locations[i].marker = new google.maps.Marker({
					position: locations[i].location,
					map: map,
					title: locations[i].title,
					address: locations[i].address,
					animation: google.maps.Animation.DROP,
					id: i
		});

		locations[i].marker.addListener('click', function(){
		populateInfoWindow(this, infowindow);
		toggleBounce(this);
	});
		bounds.extend(locations[i].marker.position);

}
		map.fitBounds(bounds);
		//creates the bounce animation
		function toggleBounce(marker, infowindow) {
			if (marker.getAnimation() !== null) {
				marker.setAnimation(null);
			} else {
				marker.setAnimation(google.maps.Animation.BOUNCE);
			}
				setTimeout(function() {
				marker.setAnimation(null);
			}, 2000);
		}	
	};


//populates the infowindow
function populateInfoWindow(marker, infowindow) {
	var contentString;
	var locationTitle = marker.title;
	var locationAddress = marker.address;
	var newName = encodeURI(locationTitle);

//Wikipedia API request URL
	var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + newName + '&format=json&callback=wikiCallback';

//AJAX request for Wikipedia API information used in infowindows
	$.ajax({
			type: "GET",
			url: wikiUrl,
			dataType: "jsonp",
		}).done(function(data) {
		var articleList = data[1];
			if (articleList.length > 0) {
			for (var i = 0; i < articleList.length; i++) {
				articleStr = articleList[i];
				var url = 'http://en.wikipedia.org/wiki/' + articleStr;
			if (infowindow.marker != marker) {
					infowindow.marker = marker;
					contentString = '<div>' + locationTitle + '<p>' + locationAddress + '</p>' + '<p>' + data[1] + '</p>' + '<a href=" ' + url + '">' + url + '</a>' + '</div>';
					infowindow.setContent(contentString);
			} else {
				contentString = '<div>' + locationTitle + '<p>' + locationAddress + '</p>' + '<p>' + 'No articles found on Wikipedia'+ '</p>' + '</div>';
					infowindow.setContent(contentString);
			}
		}
	}

	//Communicate error when Wikipedia API is unable to be reached or is not available
		}).fail(function() {
			alert( "Wikipedia loading error. Please try again." );
		})
			infowindow.addListener('closeclick', function() {
			infowindow.setMarker(null);
		});
			infowindow.open(map, marker);
		}

//the viewmodel
function appViewModel() {
	var self = this;
	self.places = ko.observableArray(locations);
	self.filter = ko.observable('');
	//This connects to the DOM with a click event. Thenever a list item is clicked, this function is run
	self.clicker = function(locations) {
		google.maps.event.trigger(locations.marker, 'click')
		};

	self.filteredLocations = ko.computed(function(location) {
	//if no value has been entered, just return the observable array and set the marker to visable
		if (!self.filter()) {
			self.places().forEach(function(location) {
			if (location.marker) {
				location.marker.setVisible(true);
			}
		});
		return self.places();
		} else {
			var filter = self.filter().toLowerCase();
			return ko.utils.arrayFilter(self.places(), function(item) {
			var result = item.title.toLowerCase().indexOf(filter);
			//If there were no matches between the filter and the list, hide the marker
			if (result < 0) {
				item.marker.setVisible(false);
			} else {
				//And if there was a match, it shows the marker
				item.marker.setVisible(true);
			}
			return item.title.toLowerCase().indexOf(filter) > -1;
		});
	}
	});
	};
//Needed for knockout to work
ko.applyBindings(new appViewModel());

//Expands the hamburger in the DOM. Wasn't sure where to put this, figured since it didn't really realate to anything else should put this at the end
$( '.menu' ).click(function(){
$('.search-box').toggleClass('expand');
});

//ERROR ERROR. Let's you know if there is an error with loading google maps
function mapError() {
alert("Google Maps has failed to load. Have you tried turning it off and on again?");
}
