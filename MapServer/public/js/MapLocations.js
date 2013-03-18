var MapLocations = (function(displayInit, initUtilities) {

	var display = null;
	var locationMode = false;
	var selectedItem = '';
	var utilities = null;
	var locationsList = null;

	function MapLocations(displayInit, initUtilities) {
		display = displayInit;
		utilities = initUtilities;
	}

	var radioSelection = function() {
		selectedItem = $("input[name=responseGroup]:checked").attr('id');
		locationName = $("input[name=responseGroup]:checked").attr('locationName');
		latitudey = $("input[name=responseGroup]:checked").attr('latitude');
		longitudey = $("input[name=responseGroup]:checked").attr('longitude');
		//KLUDGE FINAL add a description here? Maybe NOT if not displayed ...
		
		/* We no longer have the "first [middle] last" paradigm for one field: use it ALL 
		var locDetails = locationName.split(' ');
		var firstName = locDetails[0];
		var lastName = '';
		var middleName = undefined;
		
		// IF there are actually four parts, then there
		// was a description... otherwise, NOT. 
		if (locDetails.length === 3) {
			var middleName = locDetails[1];
			lastName = locDetails[2];
		} else {
			lastName = locDetails[1];
		}
		
		if (middleName !== undefined)
			middleName = ($.trim(middleName) === '-' ? '' : $.trim(middleName));
		display.showDebug(selectedItem);
		*/ 
		$('#firstName').val(locationName);
		
		// KLUDGE BUG FIX HERE??  ASSIGNING 3 to .length?!?
		//if (locDetails.length = 3) {
		//	$('#middleName').val(middleName);
		//}
		$('#latitude').val(latitudey)
		$('#longitude').val(longitudey);
	};

	var clearResponse = function(debugMessage) {
		locationMode = false;
		display.clearResponse();
		display.showDebug(debugMessage);
	};

	MapLocations.prototype.testAzureSimpleDb = function() {
		window.location.replace('/testAzureSimpleDb');
	};

	var showLocations = function() {
		display.clearResponse();
		var count = 0;
		$(locationsList).each(function() {
			$(this).each(function() {
				this.itemName = 'item' + count++;
				display.displayRow(this);
			});
		});
	};

	MapLocations.prototype.getLocations = function(callback) {
		clearResponse("Get Locations called");
		locationMode = true;
		request = $.ajax({
			type : "get",
			url : '/getLocations',
			cache : false,
			dataType : "json",
			success : function(data) {
				locationsList = data;
				showLocations();
				$('#responseGroup').change(radioSelection);
				$("input[name=responseGroup]:radio:first").attr('checked', true);
				radioSelection();
				if ( typeof (callback) == 'function') {
					display.showDebug("Callback coming");
					callback();
				}
			},
			error : display.showError
		});
	};
	
	MapLocations.prototype.saveLocations = function() {
		var data = { details: 'presidents', data: JSON.stringify(locationsList) };
		$.ajax(
		{
			type: "POST",
			url: '/saveLocations',
			dataType: "json",
			cache: 'False',
			data: data, 
			success: function(data) {
				display.showDebug(data.result);
			},
			error: display.showError			
		});	
	}


	function getLocInfo() {
		var locInfo = {};
		locInfo.locationName = $.trim($('#locationName').val());
		locInfo.latitude = $.trim($('#latitude').val());
		locInfo.longitude = $.trim($('#longitude').val());
		if (!utilities.readyForUpdate(locationName, latitude, longitude)) {
			alert("Please enter all required fields: City, Latitude & Longitude");
			return null;
		}
		return locInfo;
	}


	MapLocations.prototype.insertLocation = function() {
		locInfo = getLocInfo();
		if (locInfo) {
			insertRecord(locInfo.locationName, locInfo.latitude, locInfo.longitude);
		}
	};

	var insertRecord = function(locationName, latitude, longitude) {
		display.showDebug("Inserting city: " + locationName);
		clearResponse('called putitem');
		var newLoc = new EasyMapLocation(locationName, latitude, longitude, ""); // KLUDGE blank descrip for now...
		var query = newLoc.toJSON();
		locationsList.push(query);
		showLocations();
	};

	MapLocations.prototype.deleteItem = function() {
		if (!locationMode) {
			alert("You must select Get Locations before trying to delete a location");
			return;
		}
		clearResponse('Called delete item: ' + selectedItem);
		query = "itemName=" + selectedItem;
		utilities.deleteFromArray2(locationsList, selectedItem);			
		showLocations();	
	};

	// TODO: Get this method working so we can update an existing
	// record
	MapLocations.prototype.update = function() {
		if (!locationMode) {
			alert("You must select Get Locations before updating.");
			return;
		}

		var names = getNames();
		if ((names) === null)
			return;

		var query = "uuid=" + selectedItem + "&firstName=" + names.firstName + '&middleName=' + names.middleName + "&lastName=" + names.lastName;

		request = $.ajax({
			type : "get",
			data : query,
			url : '/update',
			cache : false,
			dataType : "json",
			success : function(data) {
				display.showResponse("success");
			},
			error : display.showError
		});
	};
	
	return MapLocations;

})();

$(document).ready(function() {
	var locations = new MapLocations(new Display(), new Utilities());
	$('button:#getPresidents').click(locations.getLocations);
	$('button:#insertLocation').click(locations.insertLocation);
	$('button:#savePresidents').click(locations.saveLocations);
	$('button:#update').click(locations.update);
	$('button:#deleteitem').click(locations.deleteItem);
	$('button:#testAzureSimpleDb').click(locations.testAzureSimpleDb);
});

