window.onload = function () {

	// Executes when complete page is fully loaded, including all frames, objects and images

	var pageIndex = window.location.pathname.split("/").pop();

	if (pageIndex == "WebsiteManager.html"){

		console.log("LOADING WEBSITE MANAGER");

		sortable(".webmasterRobotPanel", {
			forcePlaceholderSize: true,
			placeholderClass: 'placeholderClass'
		});

		function initYearDropdowns(dropdownClassName){

			var dateObject = new Date();
			var currentYear = dateObject.getFullYear();

			$(dropdownClassName).empty();
			$(dropdownClassName).each(function(){

				$(this).val(currentYear);

				for (var year = currentYear; year >= 2014; year--){
					$(this).append($("<option></option>").val(year).html(year));
				}

				
			})

		}

		initYearDropdowns(".dropdownYearInput");
		initYearDropdowns(".dropdownYearInput2");

		// Neccessary methods

		function flipButton(button, text, status, special){

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

		function generateId(){
			return Math.random().toString(36).substring(7);
		}

		function checkField(inputField){
			var fieldValue = (inputField.val() != null) ? inputField.val() : "";
			if (fieldValue.replace(/ /g, "") == ""){
				return false;
			}
			return true;
		}

		// Home Pages

		// Social Media

		// Contact Us Page

		$("#form_Contacts").addClass("panelNotActive");
		var selectedContactButton;
		var selectedContactMode = "";

		contactItems = {};

		function loadContactItems(){

			console.log("Loading Contacts");

			$("#panel_Contacts").empty();

			for (contactItem in contactItems){
				$("#panel_Contacts").append('<button class="btn btn-default SortableDisplayButton" value="' + contactItem + '" type="button">' + contactItems[contactItem].name + '</button>');
			}

			sortable("#panel_Contacts", {
				forcePlaceholderSize: true,
				placeholderClass: 'placeholderClass'
			});

			$("#panel_Contacts").children().click(function(){

				selectedContactButton = $(this);
				selectedContactMode = "Destroy";

				console.log("Selected a contact");

				$("#form_Contacts").removeClass("panelNotActive");

				console.log("val:" + $(this).val());
				var contactObject = contactItems[$(this).val()];

				$("#form_Contact_name").val(contactObject.name);
				$("#form_Contact_information").val(contactObject.contact);

				$("#btn_UpdateContact").removeClass("VisibilityHidden");
				flipButton($("#btn_UseContact"), "Delete Contact", "danger");

			})

		}

		$("#Btn_AddContact").click(function(){

			$("#form_Contact_name").val("");
			$("#form_Contact_information").val("");

			$("#btn_UpdateContact").addClass("VisibilityHidden");
			flipButton($("#btn_UseContact"), "Add Contact", "success");
			selectedContactMode = "Add";

			$("#form_Contacts").removeClass("panelNotActive");

		});

		function saveSelectedContact(isUpdate){
			var proceed = true;

			// Check that fields are valid
			proceed = checkField($("#form_Contact_name"));
			proceed = checkField($("#form_Contact_information"));

			if (!proceed){
				alert("A field has not been properly filled out. Please do not leave any blanks in required areas.");
				return;
			}

			var contactId = (isUpdate) : selectedContactButton.attr("value") ? generateId();

			contactItems[contactId] = {
				name: $("#form_Contact_name").val(),
				contact: $("#form_Contact_information").val()
			};
		}

		$("#btn_UpdateContact").click(function()){
			console.log("Updating contact");
			saveSelectedContact(true);
		}


		$("#btn_UseContact").click(function(){


			if (selectedContactMode == "Add"){

				console.log("Adding Contact");

				saveSelectedContact();

			} else if (selectedContactMode == "Destroy") {

				console.log("Removing contact");

				delete contactItems[selectedContactButton.attr("value")];

			} else {
				console.log("Invalid Contact Management Mode: " + selectedContactMode);
			}

				
			$("#form_Contacts").addClass("panelNotActive");

			loadContactItems();

		});

		loadContactItems();

		$("#Btn_SaveContacts").click(function(){
			console.log("Saving Contacts");
			$("#Btn_SaveContacts").addClass("disabled");
			// Saving time
		});

		// Sponsors


		$("#form_Sponsors").addClass("panelNotActive");
		var selectedSponsorButton;
		var selectedSponsorMode = "";

		sponsorItems = {};

		function loadSponsorItems(){

			console.log("Loading Sponsors");

			$("#panel_Sponsors").empty();

			for (sponsorItem in sponsorItems){
				$("#panel_Sponsors").append('<button class="btn btn-default SortableDisplayButton" value="' + sponsorItem + '" type="button">' + sponsorItems[sponsorItem].name + '</button>');
			}

			sortable("#panel_Sponsors", {
				forcePlaceholderSize: true,
				placeholderClass: 'placeholderClass'
			});

			$("#panel_Sponsors").children().click(function(){

				selectedSponsorButton = $(this);
				selectedSponsorMode = "Destroy";

				console.log("Selected a sponsor");

				$("#form_Sponsors").removeClass("panelNotActive");

				console.log("val:" + $(this).val());
				var sponsorObject = sponsorItems[$(this).val()];

				$("#form_Sponsor_name").val(sponsorObject.name);
				$("#form_Sponsor_link").val(sponsorObject.link);
				// Logo

				flipButton($("#btn_UseSponsor"), "Delete Sponsor", "danger");
				$("#btn_UpdateSponsor").removeClass("VisibilityHidden");

			})

		}

		$("#Btn_AddSponsor").click(function(){

			$("#form_Sponsor_name").val("");
			$("#form_Sponsor_link").val("");

			$("#btn_UpdateSponsor").addClass("VisibilityHidden");
			flipButton($("#btn_UseSponsor"), "Add Sponsor", "success");
			selectedSponsorMode = "Add";

			$("#form_Sponsors").removeClass("panelNotActive");

		});

		$("#btn_UseSponsor").click(function(){


			if (selectedSponsorMode == "Add"){

				console.log("Adding Sponsor");

				// Check that fields are valid

				var proceed = true;

				proceed = checkField($("#form_Sponsor_name"));
				proceed = checkField($("#form_Sponsor_link"));

				if (!proceed){
					alert("A field has not been properly filled out. Please do not leave any blanks in required areas.");
					return;
				}

				sponsorItems[generateId()] = {
					name: $("#form_Sponsor_name").val(),
					link: $("#form_Sponsor_link").val(),
					logo: ""
				};

			} else if (selectedSponsorMode == "Destroy") {

				console.log("Removing sponsor");

				delete sponsorItems[selectedSponsorButton.attr("value")];


			} else {
				console.log("Invalid Sponsor Management Mode: " + selectedSponsorMode);
			}

				
			$("#form_Sponsors").addClass("panelNotActive");

			loadSponsorItems();

		});

		loadSponsorItems();

		$("#Btn_SaveSponsors").click(function(){
			console.log("Saving Sponsors");
			$("#Btn_SaveSponsors").addClass("disabled");
			// Saving time
		});

		// Leaders & Mentors


		// Robots


		$("#form_Robots").addClass("panelNotActive");
		var selectedRobotButton;
		var selectedRobotMode = "";

		robotItems = {};

		function loadRobotItems(){

			console.log("Loading Robots");

			$("#panel_Robots").empty();

			for (robotItem in robotItems){
				$("#panel_Robots").append('<button class="btn btn-default SortableDisplayButton" value="' + robotItem + '" type="button">' + robotItems[robotItem].name + '</button>');
			}

			sortable("#panel_Robots", {
				forcePlaceholderSize: true,
				placeholderClass: 'placeholderClass'
			});

			$("#panel_Robots").children().click(function(){

				selectedRobotButton = $(this);
				selectedRobotMode = "Destroy";

				console.log("Selected a robot");

				$("#form_Robots").removeClass("panelNotActive");

				console.log("val:" + $(this).val());
				var robotObject = robotItems[$(this).val()];

				$("#form_Robot_name").val(robotObject.name);
				$("#form_Robot_seasonYear").val(robotObject.seasonYear);
				$("#form_Robot_description").val(robotObject.description);
				$("#form_Robot_videos").val(robotObject.videos);
				$("#form_Robot_matchPlaylists").val(robotObject.matchPlaylists);
				$("#form_Robot_CADiFrame").val(robotObject.CADiFrame);
				// Logo

				flipButton($("#btn_UseRobot"), "Delete Robot", "danger");
				$("#btn_UpdateRobot").removeClass("VisibilityHidden");

			})

		}

		$("#Btn_AddRobot").click(function(){

			$("#form_Robot_name").val("");
			$("#form_Robot_seasonYear").val("");
			$("#form_Robot_description").val("");
			$("#form_Robot_videos").val("");
			$("#form_Robot_matchPlaylists").val("");
			$("#form_Robot_CADiFrame").val("");

			flipButton($("#btn_UseRobot"), "Add Robot", "success");
			$("#btn_UpdateRobot").addClass("VisibilityHidden");
			selectedRobotMode = "Add";

			$("#form_Robots").removeClass("panelNotActive");

		});

		$("#btn_UseRobot").click(function(){


			if (selectedRobotMode == "Add"){

				console.log("Adding Robot");

				// Check that fields are valid

				var proceed = true;

				proceed = checkField($("#form_Robot_name"));
				proceed = checkField($("#form_Robot_description"));
				proceed = checkField($("#form_Robot_videos"));
				proceed = checkField($("#form_Robot_matchPlaylists"));
				proceed = checkField($("#form_Robot_CADiFrame"));

				if (!proceed){
					alert("A field has not been properly filled out. Please do not leave any blanks in required areas.");
					return;
				}

				robotItems[generateId()] = {
					name : $("#form_Robot_name").val(),
					seasonYear : $("#form_Robot_seasonYear").val(),
					description : $("#form_Robot_description").val(),
					videos : $("#form_Robot_videos").val(),
					matchPlaylists : $("#form_Robot_matchPlaylists").val(),
					CADiFrame : $("#form_Robot_CADiFrame").val()
				};

			} else if (selectedRobotMode == "Destroy") {

				console.log("Removing robot");

				delete robotItems[selectedRobotButton.attr("value")];


			} else {
				console.log("Invalid Robot Management Mode: " + selectedRobotMode);
			}

				
			$("#form_Robots").addClass("panelNotActive");

			loadRobotItems();

		});

		loadRobotItems();

		$("#Btn_SaveRobots").click(function(){
			console.log("Saving Robots");
			$("#Btn_SaveRobots").addClass("disabled");
			// Saving time
		});

		// Leaders & Mentors

		$("#form_People").addClass("panelNotActive");
		var selectedPeopleButton;
		var selectedPeopleMode = "";

		peopleItems = {};

		peopleItems[generateId()] = {
			name : "Steven",
			yearJoined : 2015,
			yearGraduated : 2016,
			titles : [
				{
					title : "Head of Division",
					startYear : 2015,
					endYear: 2017
				}
			]
		}

		function loadPeopleItems(){

			console.log("Loading People");

			$("#panel_People").empty();

			for (peopleItem in peopleItems){
				$("#panel_People").append('<button class="btn btn-default SortableDisplayButton" value="' + peopleItem + '" type="button">' + peopleItems[peopleItem].name + '</button>');
			}

			/*
			sortable("#panel_People", {
				forcePlaceholderSize: true,
				placeholderClass: 'placeholderClass'
			});
			*/

			$("#panel_People").children().click(function(){

				selectedPeopleButton = $(this);
				selectedPeopleMode = "Destroy";

				console.log("Selected a people");

				$("#form_People").removeClass("panelNotActive");

				console.log("val:" + $(this).val());
				var peopleObject = peopleItems[$(this).val()];

				$("#form_People_name").val(peopleObject.name);
				$("#form_People_yearJoined").val(peopleObject.yearJoined);
				$("#form_People_yearGraduated").val(peopleObject.yearGraduated);
				// Logo

				flipButton($("#btn_UsePeople"), "Delete Person", "danger", true);
				$("#btn_UpdatePeople").removeClass("VisibilityHidden");

			})

		}

		$("#Btn_AddPeople").click(function(){

			$("#form_People_name").val("");
			$("#form_People_yearJoined").val("");
			$("#form_People_yearGraduated").val("");

			flipButton($("#btn_UsePeople"), "Add Person", "success", true);
			$("#btn_UpdatePeople").addClass("VisibilityHidden");
			selectedPeopleMode = "Add";

			$("#form_People").removeClass("panelNotActive");


		});

		$("#btn_UsePeople").click(function(){


			if (selectedPeopleMode == "Add"){

				console.log("Adding People");

				// Check that fields are valid

				var proceed = true;

				proceed = checkField($("#form_People_name"));
				proceed = checkField($("#form_People_yearJoined"));
				proceed = checkField($("#form_People_yearGraduated"));

				if (!proceed){
					alert("A field has not been properly filled out. Please do not leave any blanks in required areas.");
					return;
				}

				peopleItems[generateId()] = {
					name : $("#form_People_name").val(),
					yearJoined : $("#form_People_yearJoined").val(),
					yearGraduated : $("#form_People_yearGraduated").val(),
					headshot : "",
					titles : {}
				};

			} else if (selectedPeopleMode == "Destroy") {

				console.log("Removing people");

				delete peopleItems[selectedPeopleButton.attr("value")];


			} else {
				console.log("Invalid People Management Mode: " + selectedPeopleMode);
			}

				
			$("#form_People").addClass("panelNotActive");

			loadPeopleItems();

		});

		loadPeopleItems();

		$("#Btn_SavePeople").click(function(){
			console.log("Saving People");
			$("#Btn_SavePeople").addClass("disabled");
			// Saving time
		});

		// People Sortable

		$("#teamHistorySelector").empty();

		var dateObject = new Date();
		var queryYear = dateObject.getFullYear();

		function loadPeopleItemsSortable(yearBound){
			$("#panel_PeopleOrder").empty();

			for (peopleItem in peopleItems){
				var shouldDisplay = false;

				for (title in peopleItems[peopleItem].titles){
					var titleData = peopleItems[peopleItem].titles[title];
					if (yearBound >= titleData.startYear && yearBound <= titleData.endYear){
						shouldDisplay = true;
					}
				}
				
				if (shouldDisplay){
					$("#panel_PeopleOrder").append('<button class="btn btn-default SortableDisplayButton" value="' + peopleItem + '" type="button">' + peopleItems[peopleItem].name + '</button>');
				}
			}

			sortable("#panel_PeopleOrder", {
				forcePlaceholderSize: true,
				placeholderClass: 'placeholderClass'
			});

		}

		for (var year = queryYear; year >= 2015; year--){
			$("#teamHistorySelector").append($("<option></option>").val(year).html("Season " + year));
		}

		$("#btn_People_changeOrder").click(function(){
			loadPeopleItemsSortable();
		})

		$("#teamHistorySelector").change(function(data){
			console.log("Year changed: " + data);
			var selectedYear = $("#teamHistorySelector").val();
			loadPeopleItemsSortable(selectedYear);
		});

		loadPeopleItemsSortable($("#teamHistorySelector").val());


		// Uploading Files

		var imageSelectorModal = $("#ImageSelectorModal");
		var dropdownToggle = $("#ImageSelectorModalDirectoryDropdown");

		var directories = ["Headshots", "SplashHeaders", "SponsorLogos", "OtherImages"];

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
	
		function loadFilesInDirectory(){

			var directory = "/assets/img" + $("#imageSelectorModalDropdownSelected").text();
			console.log("directory: " + directory);

			$.ajax({
				//This will retrieve the contents of the folder if the folder is configured as 'browsable'
				url: directory,
				success: function (data) {
					//List all .png file names in the page
					$(data).find("a:contains(" + ".png" + ")").each(function () {
						var filename = this.href.replace(window.location.host, "").replace("http://", "");
						$(".imageSelectorModalImages").append("<img src='" + dir + filename + "'>");
					});

				}
			});
		}

	}

};