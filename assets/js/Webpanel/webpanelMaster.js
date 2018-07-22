// WebpanelMaster.js rewrite

window.onload = function(){

	// Executes when complete page is fully loaded, including all frames, objects and images

	pageIndex = window.location.pathname.split("/").pop();

	if (pageIndex == "WebsiteManager.html"){

		console.log("LOADING Website Manager 2.0");

		initFunctions();

		activateStaticContentPanels();
		activateDynamicContentPanels();
		activateUploadModule();

		$("#accountPage-signOut").click(function(){
			console.log(generateId());
		})

		console.log("Website Manager 2.0 Loaded");
	}

}

////////////////////////////////////////////////////////////////////

var dataType = {}; // All organizable data is dumped to this object.

////////////////////////////////////////////////////////////////////

function initFunctions(){

	function initYearDropdowns(dropdownClassName, appendSeason){

		var dateObject = new Date();
		var currentYear = dateObject.getFullYear();

		if (dropdownClassName == ".dropdownYearInput2"){
			currentYear = currentYear + 5;
		}

		$(dropdownClassName).empty();
		$(dropdownClassName).each(function(){

			$(this).val(currentYear);

			for (var year = currentYear; year >= 2014; year--){
				$(this).append($("<option></option>").val(year).html(((appendSeason == true) ? "Season " : "") + year));
			}

			
		})

	}

	initYearDropdowns(".dropdownYearInput");
	initYearDropdowns(".dropdownYearInput1");
	initYearDropdowns(".dropdownYearInput2");

	$("#personTitleY1Input").prepend($("<option></option>").val("present").html("Present"));
}

// Neccessary methods

function flipButton(button, text, status, special){

	console.log("Flipping Button:" + button + " | " + text + ", " + status);

	button.text(text);

	if (status == "danger"){
		button.removeClass("btn-success");
		if (special){
			$(button).append('<i class="fa fa-user-times spacedIcon"></i>');
		} else {
			$(button).append('<i class="fa fa-remove spacedIcon"></i>');
		}
		
	} else {
		button.removeClass("btn-danger");
		if (special){
			$(button).append('<i class="fa fa-user-plus spacedIcon"></i>');
		} else {
			$(button).append('<i class="fa fa-plus spacedIcon"></i>');
		}
		
	}

	button.addClass("btn-" + status);
	
}

var generatedIds = {};

function generateId(){
	var newID = Math.random().toString(36).substring(7);
	if (generatedIds[newID] == true){
		return generateId();
	} else {
		generatedIds[newID] = true;
		return newID;
	}
}

function checkFields(inputFields){

	for (inputFieldIndex = 0; inputFieldIndex < inputFields.length - 1; inputFieldIndex++){

		var inputField = inputFields[inputFieldIndex];

		var fieldValue = (inputField.val() != null) ? inputField.val() : "";

		if (fieldValue.replace(/ /g, "") == ""){
			return false;
		}
	
	}

	return true;
	
}

// Actual work

function activateStaticContentPanels(){

	//
	$("#teamHistorySelector").empty();

	var dateObject = new Date();

	var queryYear = dateObject.getFullYear();

	var baseObject = document.createElement("optgroup");
	baseObject.label = "History";
	$(baseObject).appendTo($("#teamHistorySelector"));

	for (var year = dateObject.getFullYear() + 1; year >= 2014; year--){
		$(baseObject).append($("<option></option>").val(year).html("Season " + year));
	}

	$("#teamHistorySelector").prepend($("<option></option>").val("no-select").html("Select a Season"));

	$("#teamHistorySelector").val("no-select");

	$("#btn_People_changeOrder").click(function(){
		$("#teamHistorySelector").val("no-select");
		$("#panel_PeopleOrder").empty();
	})

	function loadDraggablePersonDisplay(){

		var loadType = (btn_changeView.text() == "View Mentors") ? "Leaders" : "Mentors";
		var seasonYear = $("#teamHistorySelector").val();

		$("#panel_PeopleOrder").empty();

		if (seasonYear == "no-select"){
			console.log("No Season Selected");
			return;
		}

		console.log("Loading " + loadType + " data for " + seasonYear);

		var relevantPeople = [];

		var dataSet = dataType["People"].panelItems;

		// Get relevant people

		for (personID in dataSet){
			var personData = dataSet[personID];

			var isMentor = false;

			for (titleIndex in personData.titles){
				var titleData = personData.titles[titleIndex];
				if ( (titleData.title.toLowerCase().includes("mentor") || titleData.title.toLowerCase().includes("coach")) && (titleData.startYear <= seasonYear) && (titleData.endYear >= seasonYear) ) {
					if (loadType == "Mentors"){
						personData.id = personID;
						relevantPeople.push(personData);
					}
					isMentor = true;
					break;
				} 
			}

			if ((personData.yearJoined <= seasonYear)  && (personData.yearGraduated >= seasonYear) && (loadType == "Leaders")){
				personData.id = personID;
				relevantPeople.push(personData);
			}

		}

		console.log("Relevant People Detected: " + relevantPeople.length);

		
		// Get sorting list

		$.ajax({
			type: "POST",
			url: "assets/php/getPageData.php",
			data: {request : "getPeopleOrder"},
			success: function(response) {
				sortRelevantUsers(response);	
			},
			error : function(){
				sortRelevantUsers();
			}
		});


		function sortRelevantUsers(sortingAlgorithm){

			// Present in that order (it's own fn' for reset)
			console.log("Sorting to current specifications. . .");


			// Render items

			for (personIndex in relevantPeople){
				$("#panel_PeopleOrder").append('<button class="btn btn-default SortableDisplayButton" id="' + relevantPeople[personIndex].id + '" value="' + personIndex + '" type="button">' + relevantPeople[personIndex].name + '</button>')
			}

			sortable($("#panel_PeopleOrder"), {
				forcePlaceholderSize: true,
				placeholderClass: "placeholderClass"
			})

			console.log("Done loading data; Move as you please");

		}
		
		// Save sorting list if order is changed;


	}

	$("#teamHistorySelector").change(loadDraggablePersonDisplay);

	var btn_changeView = $("#btn_ChangePersonView");

	btn_changeView.click(function(){

		if (btn_changeView.text() == "View Mentors"){
			btn_changeView.text("View Leaders");
		} else {
			btn_changeView.text("View Mentors");
		}

		console.log("Switching view to " + btn_changeView.text());

		// Load people

		loadDraggablePersonDisplay();
	})

	$("#btn_SavePeopleOrder").click(function(){

		$("#btn_SavePeopleOrder").attr("disabled", true);
		// AJAX call to save the order
	})

	$("#btn_ReloadPeopleOrder").click(loadDraggablePersonDisplay);


	// HANDLING PERSON OBJECT YEAR LOGIC

	//
	var py0 = $("#form_People_yearJoined");
	var py1 = $("#form_People_yearGraduated");

	py0.change(function(){
		if (py0.val() > py1.val()){
			alert("The year this person joined the team cannot be after the year they left.");
		}
	})

	py1.change(function(){
		if (py0.val() > py1.val()){
			alert("The year this person left the team cannot be before the year they joined.");
		}
	})

	var y0 = $("#personTitleY0Input");
	var y1 = $("#personTitleY1Input");

	y0.change(function(){

		console.log("Year changed");

		if (convertYear(y0.val()) > convertYear(y1.val())){
			y0.val(y1.val());
			alert("Your start year cannot occur after your end year!");
		}

		if (convertYear(y0.val()) < convertYear(py0.val())){
			alert("A person should not have a title before the year they were on the team.")
		}
	})

	y1.change(function(){

		console.log("Year changed");

		if (convertYear(y0.val()) > convertYear(y1.val())){
			y1.val(y0.val());
			alert("Your end year cannot occur before your start year!");
		}
	})

	// HANDLING PERSON OBJECT TITLE MODAL

	//
	$("#btn_AddPeopleTitle").click(function(){

		console.log("Adding Title to Person");

		$("#personTitleModalHeading").text("Add a Title");
		$("#modalTitlePersonDisplay").text($("#form_People_name").val());
		
		$("#modalTitleInputDropdown").val("Captain");
		$("#modalTitleInputString").val("").attr("placeholder", "Select a Title . . .");
		$("#modalTitleInputString").attr("disabled", true);
		$("#personTitleY0Input").val(queryYear);
		$("#personTitleY1Input").val(queryYear);

		$("#personTitleModalIDTracker").text(generateId());

		$("#PersonTitleModal").modal('show');

		// createPeopleTitle();

	})

	$("#personTitleModalConfirm").click(function(){

		var t0 = $("#modalTitleInputDropdown").val();
		var t1 = $("#modalTitleInputString").val();

		if (((t0.toLowerCase() == "head") || (t0.toLowerCase() == "director") || (t0.toLowerCase() == "custom")) && (t1.replace(/ /g, "") == "")){
			alert("You must fill in the second text field or change the title.");
			$("#modalTitleInputString").focus();
			return;
		}

		console.log("Finished modifying a Title");

		$("#PersonTitleModal").modal('hide');

		var existingID = $("#personTitleModalIDTracker").text();

		var title;

		if (t0.toLowerCase() == "custom"){
			title = t1;
		} else if ((t0.toLowerCase() == "head") || (t0.toLowerCase() == "director")){
			title = t0 + " of " + t1;
		} else {
			title = t0;
		}

		var existingData = {
			title : title,
			t0 : t0,
			t1 : t1,
			startYear : $("#personTitleY0Input").val(),
			endYear : $("#personTitleY1Input").val(),
		}

		var existingItem = $("#personTitleFieldBox").children("#" + existingID);

		if (existingItem.length == 0){
			existingItem = null;
			console.log("New Item!");
		}

		createPeopleTitle(existingID, existingData, existingItem);
	})

	$("#modalTitleInputDropdown").change(updateTitleModalLocks);

	//

	// HANDLING ROBOT PLAYLIST MODAL
	//
	$("#btn_AddRobotPlaylist").click(function(){

		console.log("Adding robot competition and playlist");

		var titleBox = $("#robotPlaylistBar-Template").clone();

		$(titleBox).children("#robotPlaylistDelete").click(function(){
			titleBox.remove();
		})

		$(titleBox).attr("id", "");

		$(titleBox).appendTo($("#robotPlaylistFieldBox"));

	})
}

// Helpers

function convertYear(givenYear){
	if (givenYear.toLowerCase() == "present"){
		return new Date().getFullYear();
	}
	return givenYear;
}

function updateTitleModalLocks(){
	var t0 = $("#modalTitleInputDropdown").val().toLowerCase();
	if ((t0 == "captain") || (t0 == "co-captain") || (t0 == "coach") || (t0 == "mentor")){
		$("#modalTitleInputString").val("").attr("placeholder", "Select a Title . . .");
		$("#modalTitleInputString").attr("disabled", true);
	} else {
		$("#modalTitleInputString").attr("disabled", false);
		$("#modalTitleInputString").attr("placeholder", $("#modalTitleInputDropdown:selected").text());
		$("#modalTitleInputString").focus();
	}
}

function createPeopleTitle(existingID, existingData, existingItem){

	console.log("Modifying Title . . .");

	var titleBox = (existingItem != null) ? existingItem : $("#personTitleBar-Template").clone();

	var titleID = (existingID != null) ? existingID : generateId();

	var titleInput = $(titleBox).children("#personTitleInput");

	if (existingData){
		titleInput.text(existingData.title + " (" + existingData.startYear + "-" + existingData.endYear + ")");
		console.log("Updated Item Display");
	}

	if (existingItem == null){
		$(titleBox).children("#personTitleDelete").click(function(){
			titleBox.remove();
		})
	}

	$(titleBox).children("#personTitleEdit").unbind('click');

	$(titleBox).children("#personTitleEdit").click(function(){

		$("#personTitleModalHeading").text("Edit a Title");
		$("#modalTitlePersonDisplay").text($("#form_People_name").val());
		
		$("#modalTitleInputDropdown").val(existingData.t0);

		updateTitleModalLocks();

		$("#modalTitleInputString").val(existingData.t1).attr("placeholder", "Select a Title . . .");
		$("#personTitleY0Input").val(existingData.startYear);
		$("#personTitleY1Input").val(existingData.endYear);

		$("#personTitleModalIDTracker").text(titleID);

		$("#PersonTitleModal").modal('show');


	})

	$(titleBox).attr("id", titleID);

	$(titleBox).appendTo($("#personTitleFieldBox"));

}

//

function activateDynamicContentPanels(){

	var formPanelNames = ["Contact", "Sponsor", "Robot", "People"];

	function loadPanelItems(panelName){

		var formPanelName = (panelName != "People") ? panelName + "s" : "People";

		console.log("Loading " + formPanelName + " of " + panelName);

		dataType[panelName].panelPanel.empty();

		for (item in dataType[panelName].panelItems) {
			dataType[panelName].panelPanel.append('<button class="btn btn-default SortableDisplayButton" value="' + item + '" type="button">' + dataType[panelName].panelItems[item].name + '</button>');
		}

		if (formPanelName != "People"){
			sortable(dataType[panelName].panelPanel, {
				forcePlaceholderSize: true,
				placeholderClass: "placeholderClass"
			})
		}

		dataType[panelName].panelPanel.children().click(function(){

			dataType[panelName].selectedPanelButton = $(this);
			dataType[panelName].selectedPanelMode = "Destroy";

			console.log("Selected a " + panelName);

			dataType[panelName].panelForm.removeClass("panelNotActive");

			console.log("Val: " + $(this).val());

			var itemObject = dataType[panelName].panelItems[$(this).val()];

			switch(panelName){
				case "Contact":
					//
					$("#form_Contact_name").val(itemObject.name);
					$("#form_Contact_information").val(itemObject.contact);

					break;
				case "Sponsor":
					//
					$("#form_Sponsor_name").val(itemObject.name);
					$("#form_Sponsor_link").val(itemObject.link);
					// Logo

					break;
				case "Robot":
					//
					$("#form_Robot_name").val(itemObject.name);
					$("#form_Robot_seasonYear").val(itemObject.seasonYear);
					$("#form_Robot_description").val(itemObject.description);
					$("#form_Robot_videos").val(itemObject.videos);
					$("#form_Robot_matchPlaylists").val(itemObject.matchPlaylists);
					$("#form_Robot_CADiFrame").val(itemObject.CADiFrame);

					break;
				case "People":
					//
					$("#form_People_name").val(itemObject.name);
					$("#form_People_yearJoined").val(itemObject.yearJoined);
					$("#form_People_yearGraduated").val(itemObject.yearGraduated);
					// Logo

					// Titles
					$("#personTitleFieldBox").empty();
					for (index in itemObject.titles){
						createPeopleTitle(index, itemObject.titles[index]);
					}

					break;
			}

			flipButton(dataType[panelName].panelUseButton, "Delete " + ((panelName != "People") ? panelName : "Person") , "danger");
			dataType[panelName].panelUpdateButton.removeClass("VisibilityHidden");

		});

	}

	function btn_useCallback(){

		var panelName = $(this).attr("id").replace("Btn_Use", "");

		if (dataType[panelName].selectedPanelMode == "Add"){

			console.log("Adding " + panelName);

			saveSelectedItem(panelName);

		} else if (dataType[panelName].selectedPanelMode == "Destroy"){

			console.log("Removing " + panelName);

			delete dataType[panelName].panelItems[dataType[panelName].selectedPanelButton.attr("value")];

		} else {
			console.log("Invalid Panel Management Mode for '" + panelName + "' --> " + dataType[panelName].selectedPanelMode);
		}

		dataType[panelName].panelForm.addClass("panelNotActive");

		loadPanelItems(panelName);

	}

	function btn_updateCallback(){

		var panelName = $(this).attr("id").replace("Btn_Update", "");

		console.log("Updating " + panelName);

		saveSelectedItem(panelName, true);

		dataType[panelName].panelForm.addClass("panelNotActive");

		alert("Please press \"Save Changes\" to save the updates you have just made.");

	}

	function btn_addCallback(){

		var panelName = $(this).attr("id").replace("Btn_Add", "");

		console.log("Adding at " + panelName);

		switch(panelName){
			case "Contact":
				//
				$("#form_Contact_name").val("");
				$("#form_Contact_information").val("");

				break;
			case "Sponsor":
				//
				$("#form_Sponsor_name").val("");
				$("#form_Sponsor_link").val("");

				break;
			case "Robot":
				//
				$("#form_Robot_name").val("");
				$("#form_Robot_seasonYear").val(new Date().getFullYear());
				$("#form_Robot_description").val("");
				$("#form_Robot_videos").val("");
				$("#form_Robot_matchPlaylists").val("");
				$("#form_Robot_CADiFrame").val("");

				break;
			case "People":
				//
				$("#form_People_name").val("");
				$("#form_People_yearJoined").val(new Date().getFullYear());
				$("#form_People_yearGraduated").val(new Date().getFullYear());

				$("#personTitleFieldBox").empty();

				break;
		}

		flipButton(dataType[panelName].panelUseButton, "Add " + ((panelName != "People") ? panelName : "Person"), "success");
		dataType[panelName].panelUpdateButton.addClass("VisibilityHidden");

		dataType[panelName].selectedPanelMode = "Add";

		dataType[panelName].panelForm.removeClass("panelNotActive");

	}

	function saveSelectedItem(panelName, isUpdate){

		console.log("Saving item(s) at " + panelName);

		var proceed = true;

		switch(panelName){
			case "Contact":

				proceed = checkFields(
					$("#form_Contact_name"),
					$("#form_Contact_information")
				);

				break;
			case "Sponsor":
				
				proceed = checkFields(
					$("#form_Sponsor_name"),
					$("#form_Sponsor_link")
				);

				break;
			case "Robot":
				
				proceed = checkFields(
					$("#form_Robot_name"),
					$("#form_Robot_description"),
					$("#form_Robot_videos"),
					($("#form_Robot_matchPlaylists")),
					$("#form_Robot_CADiFrame")
				);

				break;
			case "People":
				
				proceed = checkFields(
					$("#form_People_name"),
					$("#form_People_yearJoined"),
					$("#form_People_yearGraduated")
				);

				break;
		}

		if (!proceed){
			alert("A field in the " + panelName + " section has not been filled out. Please do not leave any blanks.");
			return;
		}

		var itemId = (isUpdate) ? dataType[panelName].selectedPanelButton.attr("value") : generateId();

		var saveObject = {}

		switch(panelName){
			case "Contact":
				//
				saveObject = {
					name: $("#form_Contact_name").val(),
					contact: $("#form_Contact_information").val()
				};

				break;
			case "Sponsor":
				//
				saveObject = {
					name: $("#form_Sponsor_name").val(),
					link: $("#form_Sponsor_link").val(),
					logo: ""
				};

				break;
			case "Robot":

				saveObject = {

					name : $("#form_Robot_name").val(),
					seasonYear : $("#form_Robot_seasonYear").val(),
					description : $("#form_Robot_description").val(),

					videos : $("#form_Robot_videos").val(),
					type : $("#robotType").val(),

					matchPlaylists : [],
				};

				$("#robotPlaylistFieldBox").children("div").each(function(){

					var compTitle = $(this).children("#robotPlaylistInput-comp");
					var compPlaylist = $(this).children("#robotPlaylistInput-url");

					if (compTitle.val().replace(/ /g, "") != ""){

						var compTitleObject = {
							title: compTitle.val().trim(),
							playlist: compPlaylist.val().trim()
						};

						saveObject.matchPlaylists.push(compTitleObject);
					}

				})

				break;
			case "People":
				
				saveObject = {
					name : $("#form_People_name").val(),
					yearJoined : $("#form_People_yearJoined").val(),
					yearGraduated : $("#form_People_yearGraduated").val(),
					headshot : "",
					titles : {}
				};

				$("#personTitleFieldBox").children("div").each(function(){

					var titleID = $(this).attr("id");
					var titleName = $(this).children("#personTitleInput");

					if (titleName.text().replace(/ /g, "") != ""){

						//////////////////////

						// Solely for parsing the Title parts

						function capitalizeFirstLetter(string) {
							return string.charAt(0).toUpperCase() + string.slice(1);
						}

						
						var startYear = "";
						var endYear = "";

						var dateString = titleName.text().split("(")[1];
						dateString = dateString.replace(")", "");
						startYear = dateString.split("-")[0].trim();
						endYear = dateString.split("-")[1].trim();

						var titleActual = titleName.text().split("(")[0].trim();
						var titleLower = titleActual.toLowerCase();

						var t0 = "";
						var t1 = "";

						if (titleLower.startsWith("head of") || titleLower.startsWith("director of")){
							t0 = capitalizeFirstLetter(titleLower.split(" ")[0]);
							t1 = titleActual.substring(titleActual.indexOf("of") + 2, titleActual.length).trim();
						} else if ((titleLower == "captain") || (titleLower == "co-captain") || (titleLower == "mentor") || (titleLower == "coach")){
							t0 = capitalizeFirstLetter(titleLower);
						} else {
							t0 = "Custom";
							t1 = titleActual;
						}

						console.log("t0: " + t0 + " t1: " + t1);

						/////////////////////////

						var titleObject = {
							title : titleActual,
							t0 : t0,
							t1 : t1,
							startYear : startYear,
							endYear : endYear
						}

						saveObject.titles[titleID] = titleObject;

					}

				})

				break;
		}

		dataType[panelName].panelItems[itemId] = saveObject;

	}

	function btn_saveCallback(){

		var panelName = $(this).attr("id").replace("Btn_Save", "");

		console.log("Saving " + panelName);

		$(this).addClass("disabled");

		// Saving

		$.ajax({
			type: "POST",
			url: "assets/php/setPageData.php",
			data: {request : panelName, objectData : JSON.stringify(dataType[panelName].panelItems)},
			success: function(response) {

				// update
				alert(response);
				$(this).removeClass("disabled");
			},
			error : function(){
				console.log("Error saving");
			}
		});

	}

	function doPanel(formPanelNameIndex){

		// Get variation of variable names
		var panelName = formPanelNames[formPanelNameIndex];
		var formPanelName = (panelName != "People") ? panelName + "s" : "People";
		
		// Get the buttons and divs
		var panelForm = $("#form_" + formPanelName);
		var panelPanel = $("#panel_" + formPanelName);

		var panelUseButton = $("#Btn_Use"+panelName);
		var panelUpdateButton = $("#Btn_Update"+panelName);
		var panelAddButton = $("#Btn_Add"+panelName);

		var panelSaveButton = $("#Btn_Save"+formPanelName);

		dataType[panelName] = {};

		dataType[panelName].panelForm = panelForm;
		dataType[panelName].panelPanel = panelPanel;

		dataType[panelName].panelUseButton = panelUseButton;
		dataType[panelName].panelUpdateButton = panelUpdateButton;
		dataType[panelName].panelAddButton = panelAddButton;

		dataType[panelName].panelSaveButton = panelSaveButton;

		console.log("Use:" + panelUseButton + ", Update:" + panelUpdateButton + ", Add:" + panelAddButton + ", Save:" + panelSaveButton);

		// Variables

		dataType[panelName].selectedPanelButton;
		dataType[panelName].selectedPanelMode = "";


		// Load via php

		var requestFromPanelName = {
			"Contact" 	: "contactData",
			"Sponsor" 	: "sponsorData",
			"Robot" 	: "robotData",
			"People" 	: "teamData"
		};

		function postAJAX(response){

			var dataObject = JSON.parse(response);
			var newDataObject = {};

			for (item in dataObject){
				newDataObject[dataObject[item].id] = dataObject[item];
			}

			console.log("FORMATTED: " + JSON.stringify(newDataObject));

			dataType[panelName].panelItems = newDataObject;

			// Bind functions to buttons

			panelForm.addClass("panelNotActive");

			panelAddButton.click(btn_addCallback);

			panelUpdateButton.click(btn_updateCallback);

			panelUseButton.click(btn_useCallback);

			panelSaveButton.click(btn_saveCallback);

			loadPanelItems(panelName);

		}

		$.ajax({
			type: "POST",
			url: "assets/php/getPageData.php",
			data: {request : requestFromPanelName[panelName]},
			success: function(response) {

				console.log("LOAD RESPONSE: " + response);

				if (response == false){
					alert("An error has occured. Consider reloading the page.");
					return;
				}

				postAJAX(response);

			},
			error: function (xhr, status) {
				postAJAX("{}");
				/*
				alert(panelName + " -> " + status);
				alert(xhr);
				*/
			}
		});
	}


	for (formPanelNameIndex = 0; formPanelNameIndex < formPanelNames.length; formPanelNameIndex++){
		doPanel(formPanelNameIndex);
	}

}

function activateUploadModule(){

	// Uploading Files

	var imageSelectorModal = $("#ImageSelectorModal");
	var dropdownToggle = $("#ImageSelectorModalDirectoryDropdown");

	var directories = ["Headshots", "SplashHeaders", "SponsorLogos", "OtherImages"];


	var selectedImageUrl = "";
	var currentUploadFileBox;

	$(".uploadFileButton").click(function(){

		currentUploadFileBox = $(this).parent();

		imageSelectorModal.modal("show");

		// Set the working directory
		loadFilesInDirectory();

	});

	$("#imageSelectorModalDropdownMenu").children().click(function(){
		$("#imageSelectorModalDropdownSelected").text($(this).text());
		loadFilesInDirectory();
	});

	function deselectSelected(){
		$(".imageSelectorPreviewActive").each(function(){

			$(this).removeClass("imageSelectorPreviewActive");

		});
	}

	function prepareSelectEvents(){

		$(".imageSelectorPreview").each(function(){

			deselectSelected();

			$(this).click(function(){
				console.log("Selected " + $(this).attr("src"));
				$(this).addClass("imageSelectorPreviewActive");
				selectedImageUrl = $(this).attr("src");
			})

		});
	}

	$("#imageSelectorModalUploadPreviewActual").click(function(){
		deselectSelected();
		$(this).addClass("imageSelectorPreviewActive");
		selectedImageUrl = "Upload";
	})

	function loadFilesInDirectory(){
	    
	    $(".imageSelectorModalImages").empty();

		var directory = "/assets/img" + $("#imageSelectorModalDropdownSelected").text();

		if (window.location.href.indexOf("192.168") != -1){
			directory = $("#imageSelectorModalDropdownSelected").text();
		}

		console.log("directory: " + directory);
		
		$.ajax({
            url : directory,
            success: function (data) {
                $(data).find("a").attr("href", function (i, fileName) {
                    if( fileName.match(/\.(jpe?g|png|gif)$/) ) {
                        $(".imageSelectorModalImages").append("<img id='" + fileName + "' class='imageSelectorPreview' src='" + directory + "/" + fileName + "'>");
                    } 
                });
                prepareSelectEvents();
            },
            error : function(e){
            	console.log("An error has occured");
            	console.log(e);
            	$(".imageSelectorModalImages").append("<br><p>Failed to grab images from directory. Try again?</p>");
            }
        });
        
	}

	$("#imageSelectorModalSelectButton").change(function(){

		console.log("Upload detected");

		var reader = new FileReader();
		reader.onload = function(){
			$("#imageSelectorModalUploadPreviewActual").attr("src", reader.result);
		}
		
		var file = $("#imageSelectorModalSelectButton")[0].files[0];
		reader.readAsDataURL(file);

	});

	function doUpload(){

		var file = $("#imageSelectorModalSelectButton")[0].files[0];

		// Ensure it's an image
	    if(file.type.match(/image.*/)) {
	        console.log('An image has been loaded');

	        // Load the image
	        var reader = new FileReader();
	        reader.onload = function (readerEvent) {
	            var image = new Image();
	            image.onload = function (imageEvent) {

	                // Resize the image
	                var canvas = document.createElement('canvas'),
	                    max_height = 1920,
	                    max_width = 1080,
	                    width = image.width,
	                    height = image.height;
	                if (width > height) {
	                    if (width > max_width) {
	                        height *= max_width / width;
	                        width = max_width;
	                    }
	                } else {
	                    if (height > max_height) {
	                        width *= max_height / height;
	                        height = max_height;
	                    }
	                }
	                canvas.width = width;
	                canvas.height = height;
	                canvas.getContext('2d').drawImage(image, 0, 0, width, height);
	                var dataUrl = canvas.toDataURL('image/jpeg');
	                var resizedImage = dataURLToBlob(dataUrl);
	                /*
	                $.event.trigger({
	                    type: "imageResized",
	                    blob: resizedImage,
	                    url: dataUrl
	                });
	                */
	            }
	            image.src = readerEvent.target.result;
	        }
	        reader.readAsDataURL(file);
	    }

	};

	$("#imageSelectorModalUploadButton").click(function(){

		$(this).addClass("disabled");
		$("#imageSelectorModalUploadBar").removeClass("VisibilityHidden");
		$("#imageSelectorModalUploadBar").attr('aria-valuenow', 10);

		deselectSelected();
		$("#imageSelectorModalUploadPreviewActual").addClass("imageSelectorPreviewActive");
		selectedImageUrl = "Upload";

		doUpload();

	})
}

/* Utility function to convert a canvas to a BLOB */
var dataURLToBlob = function(dataURL) {
    var BASE64_MARKER = ';base64,';
    if (dataURL.indexOf(BASE64_MARKER) == -1) {
        var parts = dataURL.split(',');
        var contentType = parts[0].split(':')[1];
        var raw = parts[1];

        return new Blob([raw], {type: contentType});
    }

    var parts = dataURL.split(BASE64_MARKER);
    var contentType = parts[0].split(':')[1];
    var raw = window.atob(parts[1]);
    var rawLength = raw.length;

    var uInt8Array = new Uint8Array(rawLength);

    for (var i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], {type: contentType});
}
/* End Utility function to convert a canvas to a BLOB      */