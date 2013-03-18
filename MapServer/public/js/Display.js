/**
 * @author Charlie Calvert
 */
function Display()
{	
	// We have to give it a unique name in this context
	thisDisplay = this;	 
}

Display.prototype.clearResponse = function()
{
	$('#response').empty();
};

Display.prototype.isValidRow = function(row) {
	return !( (row.description === undefined) || 
			(row.description === '[object Object]') || 
			(row.description === '-') );	
};


Display.prototype.displayRow = function(row) {
	//var middle = (!thisDisplay.isValidRow(row)) ? '' : row.MiddleName;
	var description = (!thisDisplay.isValidRow(row)) ? '' : row.description;
	
	//var displayMiddle = (!thisDisplay.isValidRow(row)) ? '-' : row.MiddleName;	
	var displayDescription = (!thisDisplay.isValidRow(row)) ? '---' : row.description;	
	
	textToDisplay = "City: " + row.locationName + " (Latitude: " + row.latitude + " Longitude: " + row.longitude + ")";
	var coreString = '<li><input id=' + row.itemName + 
			  ' locationName="' + row.locationName +
			  '" latitude=' + row.latitude + 
			  ' longitude=' + row.longitude + 
			  ' type=radio name=responseGroup />';
	$('#response').append(coreString + 
			textToDisplay + '</li>');	
};

Display.prototype.showResponse = function(textToDisplay)
{
	$('#response').append('<li>' + textToDisplay + '</li>');
};

Display.prototype.showDebug = function(textToDisplay)
{
	$("#debug").append('<li>' + textToDisplay + '</li>');
};

Display.prototype.showError = function(request, ajaxOptions, thrownError) {
	thisDisplay.showDebug("Error occurred: = " + ajaxOptions + " " + thrownError );
	thisDisplay.showDebug(request.status);
	thisDisplay.showDebug(request.statusText);
	thisDisplay.showDebug(request.getAllResponseHeaders());
	thisDisplay.showDebug(request.responseText);
};