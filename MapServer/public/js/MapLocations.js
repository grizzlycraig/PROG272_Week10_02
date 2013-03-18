/**
 * @author CGM from Charlie's archetypes
 */

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
		describey = $("input[name=responseGroup]:checked").attr('description');
		
		$('#locationName').val(locationName);
		$('#latitude').val(latitudey)
		$('#longitude').val(longitudey);
		$('#description').val(describey);
	};

	var clearResponse = function(debugMessage) {
		locationMode = false;
		display.clearResponse();
		display.showDebug(debugMessage);
	};

/*	MapLocations.prototype.testAzureSimpleDb = function() {
		window.location.replace('/testAzureSimpleDb');
	};
*/

	var showLocations = function(boolInserting) {
		display.clearResponse();
		var count = 0;
		var lastLocIndex = ($(locationsList).length - 1);	// remember: 0-based...
		$(locationsList).each(function() {
			$(this).each(function() {
				this.itemName = 'item' + count++;
				display.displayRow(this);
			});
		});
		// BUG FIX: if we're inserting, go ahead and check the radio button
		if ( boolInserting) {
			$("input[name=responseGroup]:radio:last").attr('checked', true);
		}
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
				showLocations(false);	// We're NOT inserting a new loc here..
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
		var data = { details: 'locations', data: JSON.stringify(locationsList) };
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
		locInfo.description = $.trim($('#description').val());
		if (!utilities.readyForUpdate(locInfo.locationName, locInfo.latitude, locInfo.longitude)) {
			alert("Please enter all required fields: City, Latitude & Longitude");
			return null;
		}
		return locInfo;
	}

	MapLocations.prototype.insertLocation = function() {
		locInfo = getLocInfo();
		if (locInfo) {
			insertRecord(locInfo.locationName, locInfo.latitude, locInfo.longitude, locInfo.description);
		}
	};

	var insertRecord = function(locationName, latitude, longitude, description) {
		display.showDebug("Inserting city: " + locationName);
		clearResponse('called putitem');
		var newLoc = new EasyMapLocation(locationName, latitude, longitude, description); // KLUDGE blank descrip for now...
		var query = newLoc.toJSON();
		locationsList.push(query);
		showLocations(true);	// We ARE IN FACT inserting a new loc here..
	};

	MapLocations.prototype.deleteItem = function() {
		if (!locationMode) {
			alert("You must select Get Locations before trying to delete a location");
			return;
		}
		clearResponse('Called delete item: ' + selectedItem);
		query = "itemName=" + selectedItem;
		utilities.deleteFromArray2(locationsList, selectedItem);			
		showLocations(false);	// We're NOT inserting a new loc here..	
	};

	MapLocations.prototype.clearFields() {
		$('#locationName').val("");
		$('#latitude').val("")
		$('#longitude').val("");
		$('#description').val("");
	}
	
	// COMMENT THIS FOR NOW TO STOP MY CONFUSION 
	/* 
	// TODO: Get this method working so we can update an existing
	// record
	MapLocations.prototype.update = function() {
		if (!locationMode) {
			alert("You must select Get Locations before updating.");
			return;
		}

		var names = getLocInfo();
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
	*/
	
	return MapLocations;

})();

$(document).ready(function() {
	var locations = new MapLocations(new Display(), new Utilities());
	$('button:#getLocations').click(locations.getLocations);
	$('button:#insertLocation').click(locations.insertLocation);
	$('button:#saveLocations').click(locations.saveLocations);
	$('button:#update').click(locations.update);
	$('button:#deleteitem').click(locations.deleteItem);
	$('button:#clearFields').click(locations.clearFields);
	$('button:#testAzureSimpleDb').click(locations.testAzureSimpleDb);
});

