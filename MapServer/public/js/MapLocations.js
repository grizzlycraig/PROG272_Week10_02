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
		$('#firstName').val(firstName);
		
		// KLUDGE BUG FIX HERE??  ASSIGNING 3 to .length?!?
		if (locDetails.length = 3) {
			$('#middleName').val(middleName);
		}
		$('#lastName').val(lastName);
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


	function getNames() {
		var names = {};
		names.firstName = $.trim($('#firstName').val());
		names.middleName = $.trim($('#middleName').val());
		names.lastName = $.trim($('#lastName').val());
		if (!utilities.readyForUpdate(firstName, lastName)) {
			alert("Please enter a name");
			return null;
		}
		return names;
	}


	MapLocations.prototype.insertPresident = function() {
		names = getNames();
		if (names) {
			insertRecord(names.firstName, names.middleName, names.lastName);
		}
	};



	var insertRecord = function(firstName, middleName, lastName) {
		var pName = firstName + " " + middleName + " " + lastName;
		display.showDebug("inserting: " + pName);
		clearResponse('called putitem');
		var president = new EasyMapLocation(pName, 5, 6, 7, 8);
		var query = president.toJSON();
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
	$('button:#insertPresident').click(locations.insertPresident);
	$('button:#savePresidents').click(locations.saveLocations);
	$('button:#update').click(locations.update);
	$('button:#deleteitem').click(locations.deleteItem);
	$('button:#testAzureSimpleDb').click(locations.testAzureSimpleDb);
});

