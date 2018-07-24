// Main.js

let pageSettings = {

	// Various page settings for the Javascript to respond better dynamically.

	paralaxVelocity : 0.5,

	splashPageSet : false,
	documentReady : false,
	loginTriggeredBeforeDocumentReady : false,

	imageSizeCache : {
		cache : {},
		queue : {}
	},

	// Index page slides
	// An issue occurs when the slides within tabs are hidden and have to load iFrames from Flickr and Twitch.
	// Therefore, we load them once when the tabs are actually activated.
	didLoadSlides : {
		slide_2 : false,
		slide_3 : false,
	},
};


// Default splash photo headers
const splashImageDefaults = {

	"Default" : "Default.png",

	"Team.html" : "Team2017.jpg",
	"FIRST.html" : "FIRST.jpg",
	"Robot.html" : "Robot2017.jpg",
	"Sponsors.html" : "Teamwork.jpg",
	"Contact.html" : "Mentor.jpg",

};

//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////


$(document).ready(function(){

	pageSettings.documentReady = true;

	prepareSplashImage();
	scaleSize();


});

// Call different threads depending on what page we're on
$(window).on("load", function(){

	const pageIndex = getPageIndex();

	configureNavbar(pageIndex);

	if ((pageIndex == "") || (pageIndex == "index.html")){
		handleSliders(pageIndex);
	} else if (pageIndex == "Team.html"){
		handleTeamPage(pageIndex);
	} else if (pageIndex == "Robots.html"){
		handleRobotsPage(pageIndex);
	} else if (pageIndex == "Resources.html"){
		handleResourcesPage(pageIndex);
	} else if ((pageIndex == "SignIn.html") || (pageIndex == "SignUp.html") || (pageIndex == "Verify.html")) {
		handleLoginPage(pageIndex);
		checkLocation();
	} else if ((pageIndex == "Account.html") || (pageIndex == "WebsiteManager.html")){
		// handleAccountPage(pageIndex);
		checkLocation();
	} else if (pageIndex == "Contact.html"){
		handleContactsPage();
	}

	handleNewsfeedContainer();

	scaleSize();
})


$(window).bind("resize", scaleSize);
$(window).bind("scroll", scrollUpdate);


//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////

function ajaxResponseToJSON(response){
	var data;
	try {
		data = JSON.parse(response);
	} catch (e) {
		data = {status: 404, message: "Invalid response from server.\n" + response}
	}
	
	if (!("status" in data)){
		data.status = 404;
		data.message = "Invalid JSON response from Server\n" + response;
		console.alert(data.message);
	}

	if (!("message" in data)){
		if (data.status == 200){
			data.message = "success";
		} else {
			data.message = "No message provided with error of status code " + data.status;
		}
	}
	
	return data;
}


function getPageIndex(){
	
	// When updating the .htaccess file to remove the .html append, we have to correct in the Javascript for functions that request and compare the page name.

	var pageIndex = window.location.pathname.split("/").pop();
	if ((pageIndex.endsWith(".html")) || (pageIndex == "")){
		return pageIndex;
	} else {
		return pageIndex + ".html";
	}

	// https://stackoverflow.com/questions/16919526/how-to-link-to-pages-without-the-html-extension
}

function prepareSplashImage(pageIndex){

	// Loads the header splash image depending on what page we're on.

	pageIndex = (pageIndex != null) ? pageIndex : getPageIndex();

	let image;

	if (pageIndex in splashImageDefaults){
		image = splashImageDefaults[pageIndex];
	} else {
		image = splashImageDefaults.Default;
	}

	var imageFile = "url(\"assets/img/SplashHeaders/" + image + "\")";

	if (window.location.href.indexOf("192.168") != -1){
		console.log("Detected Developer Preview, loading images from altered directory.");
		imageFile = "url(\"/SplashHeaders/" + image + "\")";
	}

	$(".paralax").css("background-image", imageFile);

	pageSettings.splashPageSet = true;
}


function configureNavbar(pageIndex){

	// Sets up the navbar, highlighting which page we're page we're currently on and adding event to certain buttons.

	pageIndex = (pageIndex != null) ? pageIndex : getPageIndex();

	if (pageIndex == "Blog.html" || pageIndex == "SocialMedia.html"){
		$("#MediaBlogNavButton").addClass("active");
	} else if (pageIndex == "Projects.html" || pageIndex == "Calendar.html" || pageIndex == "Resources.html"){
		$("#CommunityResourcesNavButton").addClass("active");
	} else if (pageIndex == "Sponsors.html" || pageIndex == "OurSponsors.html"){
		$("#SponsorsNavButton").addClass("active");
	} else if (pageIndex == "Contact.html"){
		$("#ContactNavButton").addClass("active");
	} else if ((pageIndex == "SignIn.html") || (pageIndex == "SignUp.html") || (pageIndex == "Verify.html") || (pageIndex == "Account.html") || (pageIndex == "WebsiteManager.html")){
		$("#TeamResourcesNavButton").addClass("active");
	} else {
		$("#IndexNavButton").addClass("active");
	}

	$(".NavButton").hover(function(){
		if ($(document).scrollTop() > 50){
			$(this).css("color", "#1E6C93")
		} else {
			$(this).css("color", "#000000")
		}
	}, function(){
		if ($(document).scrollTop() > 50){
			$(this).css("color", "#FFFFFF")
		} else {
			$(this).css("color", "#DDDDDD")
		}
	});

	// Redirection to the Flickr website
	$("#FlickrModalTrigger").click(function(){
		$("#FlickrModal").modal('show');
	});

	// Are we logged in?
	$.ajax({
		type: "POST",
		url: "assets/php/getSession.php",
		data: '{request : "getSession"}',
		success: function(response) {

			var data = ajaxResponseToJSON(response);

			if (data.status == 200){
				// User is signed in
				$("#navbar-account-btn").html("My Account <i class=\"glyphicon glyphicon-user socialMediaIcon\"></i>");
				$("#footer-account-btn").html($("#navbar-account-btn").html());
				$(".access-account-btn").click(function(){
					window.location = "http://www.team5599.com/Account.html";
				})
			} else {

				// User is not signed in
				$("#navbar-account-btn").html("Sign In <i class=\"glyphicon glyphicon-log-in socialMediaIcon\"></i>");
				$("#footer-account-btn").html($("#navbar-account-btn").html());
				$(".access-account-btn").click(function(){
					window.location = "http://www.team5599.com/SignIn.html";
				})

			}

		},
		error : function(){
			// Error occured, could not contact server. Take to SignIn page and let's try that again.
			console.alert("Could not connect to server. Account button will redirect to Sign In page.");
			$(".access-account-btn").click(function(){
				window.location = "http://www.team5599.com/SignIn.html";
			})
		}
	});

}

//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////

function httpGetAsync(theUrl, callback) {

	// Make HTTP calls

	const xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function() { 
		if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
			callback(xmlHttp.responseText);
		}
	}
	xmlHttp.open("GET", theUrl, true); // true for asynchronous 
	xmlHttp.send(null);

}

function checkLocation(){

	// Alert the user that they are on a school device, and remind them to sign out!

	//
	// TO DO:
	//
	// * Automate sign out if using a school computer when the session ends. (Maybe a timed event? Save the new Date() when the user last loaded a page/signed in?)
	// * Move API Key somewhere more secure. Entire function needs to be moved to an AJAX PHP request.
	//

	const httpQuery = "http://api.ipstack.com/check?access_key=63741f25a6939301049094a1c7be1010";
	const schoolIP = "165.155.213.225";

	httpGetAsync(httpQuery, function(response){
		var jsonResponse = JSON.parse(response);
		if (jsonResponse && ("ip" in jsonResponse)){
			var detectedIP = jsonResponse.ip;
			if (schoolIP == detectedIP){
				console.log("Visitor is using a school computer");
				$("#SchoolDeviceModal").modal('show');
			}
		}
	});

	// Check if location is based from the school's IP
	// Or if the zipcode is the school's
}

function scrollToElement(element){

	// Neat method to animate scrolling to an element.
	console.log("Scrolling to " + element);

	var offset = $(element).offset();
	offset.left -= 20;
	offset.top -= 30;

	$('html, body').animate({
		scrollTop: offset.top,
		scrollLeft: offset.left
	});
}

var updateQueryStringParam = function (key, value) {

	// Add parameters to the omnibox url.

	var baseUrl = [location.protocol, '//', location.host, location.pathname].join(''),
		urlQueryString = document.location.search,
		newParam = key + '=' + value,
		params = '?' + newParam;

	// If the "search" string exists, then build params from it
	if (urlQueryString) {
		var updateRegex = new RegExp('([\?&])' + key + '[^&]*');
		var removeRegex = new RegExp('([\?&])' + key + '=[^&;]+[&;]?');

		if( typeof value == 'undefined' || value == null || value == '' ) { // Remove param if value is empty
			params = urlQueryString.replace(removeRegex, "$1");
			params = params.replace( /[&;]$/, "" );

		} else if (urlQueryString.match(updateRegex) !== null) { // If param exists already, update it
			params = urlQueryString.replace(updateRegex, "$1" + newParam);

		} else { // Otherwise, add it to end of query string
			params = urlQueryString + '&' + newParam;
		}
	}

	// no parameter was set so we don't need the question mark
	params = params == '?' ? '' : params;

	window.history.replaceState({}, "", baseUrl + params);
};


function getUrlParam(param, customUrl){
	// Read a parameter from the omnibox url.
	return getAllUrlParams(customUrl)[param];
}

function getAllUrlParams(url) {

	// Get all parameters in the omnibox url.

	// get query string from url (optional) or window
	var queryString = url ? url.split('?')[1] : window.location.search.slice(1);

	// we'll store the parameters here
	var obj = {};

	// if query string exists
	if (queryString) {

	// stuff after # is not part of query string, so get rid of it
		queryString = queryString.split('#')[0];

		// split our query string into its component parts
		var arr = queryString.split('&');

		for (var i=0; i<arr.length; i++) {
			// separate the keys and the values
			var a = arr[i].split('=');

			// in case params look like: list[]=thing1&list[]=thing2
			var paramNum = undefined;
			var paramName = a[0].replace(/\[\d*\]/, function(v) {
				paramNum = v.slice(1,-1);
				return '';
			});

			// set parameter value (use 'true' if empty)
			var paramValue = typeof(a[1])==='undefined' ? true : a[1];

			// (optional) keep case consistent
			paramName = paramName.toLowerCase();
			paramValue = paramValue.toLowerCase();

			// if parameter name already exists
			if (obj[paramName]) {
				// convert value to array (if still string)
				if (typeof obj[paramName] === 'string') {
					obj[paramName] = [obj[paramName]];
				}
				// if no array index number specified...
				if (typeof paramNum === 'undefined') {
					// put the value on the end of the array
					obj[paramName].push(paramValue);
				}
				// if array index number specified...
				else {
					// put the value at that index number
					obj[paramName][paramNum] = paramValue;
				}
			}
			// if param name doesn't exist yet, set it
			else {
				obj[paramName] = paramValue;
			}
		}
	}

  return obj;
}

//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////

// Specific Page Handling

function handleSliders(){

	// Sliders on the index page.
	// Dynamically inject HTML for Flickr and Twitch
	// Prevents weird scaling when the tab is hidden and Twitch's annoying auto-play.

	$("#slide-2-btn").click(function(){
		if (pageSettings.didLoadSlides.slide_2 == true) { return };
		if ($(window).width() > $(window).height()){
			$("#tab-2-content").html('<a data-flickr-embed="true" data-context="true"  href="https://www.flickr.com/photos/142731277@N02/40039093382/" title="35.jpg"><img src="https://farm5.staticflickr.com/4769/40039093382_a11e2e5b28_b.jpg" width="auto" height="100%" alt="35.jpg"></a><script async src="//embedr.flickr.com/assets/client-code.js" charset="utf-8"></script>');
		} else {
			$("#tab-2-content").html('<a data-flickr-embed="true" data-context="true"  href="https://www.flickr.com/photos/142731277@N02/40039093382/" title="35.jpg"><img src="https://farm5.staticflickr.com/4769/40039093382_a11e2e5b28_b.jpg" width="100%" height="auto" padding-top="10px" alt="35.jpg"></a><script async src="//embedr.flickr.com/assets/client-code.js" charset="utf-8"></script>');
		}
		pageSettings.didLoadSlides.slide_2 = true;
	})

	$("#slide-3-btn").click(function(){
		if (pageSettings.didLoadSlides.slide_3 == true) { return };
		var twitch_plug = $("#tab-3-content-twitch-highlight");
		if (twitch_plug){
			$("#tab-3-content-twitch-highlight").html('<iframe src="https://clips.twitch.tv/embed?clip=WiseSparklyWatercressWutFace&autoplay=false" frameborder="0" allowfullscreen="true" autoplay="false" height="500px" width="100%"></iframe>');
		}
		pageSettings.didLoadSlides.slide_3 = true;
	})

}

function handleNewsfeedContainer(){

	// Subscribing to the email newsleeter on various pages. (Index, Social Media, and Contact)

	$("#newsletter-subscribe-btn").click(function(){
		alert("Thank you for showing interest in the BNCHS Robotics Team! Sadly, our Newsletter system is currently under development. Please come back at a later date and try again!");
	})

}

function handleAccountPage(pageIndex){

	// Manage the User's Account page

	pageIndex = (pageIndex != null) ? pageIndex : getPageIndex();

	$("#account-loading").removeClass("VisibilityHiddenAbsolute");
	$("#account-page").addClass("VisibilityHiddenAbsolute");

	$.ajax({
		type: "POST",
		url: "assets/php/getSession.php",
		data: '{request : "getSession"}',
		success: function(response) {
			var data = ajaxResponseToJSON(response);

			if (data.status == 200){
				// User is signed in
				$("#account-loading").addClass("VisibilityHiddenAbsolute");
				$("#account-page").removeClass("VisibilityHiddenAbsolute");
			} else {
				// User is not signed in
				console.alert("User is not signed in. Redirecting . . .");
				window.location = "http://www.team5599.com/SignIn.html";
			}

		},
		error : function(){
			console.alert("Could not authenticate over server. User is not considered signed in.");
		}
	});

	$("#accountPage-userTitle").text("Logged in as FIRSTNAME-LASTNAME");
	// $("#facebookLoginInformationPhotoActual")

	$("#accountPage-signOut").click(function(){

		$.ajax({
			type: "POST",
			url: "assets/php/getSession.php",
			data: '{request : "log_out"}',
			success: function(response) {
				var data = ajaxResponseToJSON(response);

				if (data.status == 200){
					// User is signed out
					console.log("You have been signed out.");
					window.location = "http://www.team5599.com/SignIn.html";
				} else {
					alert("Something went wrong signing you out.\n" + data.message);
					window.location = "http://www.team5599.com/SignIn.html";
				}
			},
			error : function(){
				console.alert("Could not authenticate over server. User is not able to log out.");
				window.location = "http://www.team5599.com/SignIn.html";
			}
		});

	})

}

function handleLoginPage(pageIndex){

	// Handle signing in, signing up, verifying, and forgetting your password. Parts of this might need to be moved to separate files or at least functions.

	console.log("Handling - " + pageIndex);

	if (pageIndex == "SignUp.html"){

		$("#account-create").click(function(e) {
			e.preventDefault();
			console.log("Signing Up . . .");
			$("#account-create").prop("disabled",true);
			$("#error").text("");
			$.ajax({
				type: "POST",
				url: "assets/php/Register.php",
				data: $(".form").serialize(),
				success: function(response) {

					var data = ajaxResponseToJSON(response);

					if (data.status == 200){
						console.log("Successfully created user account!"); // PHP will automatically redirect
						window.location = "http://www.team5599.com/Verify.html?request=notify";
					} else {
						$("#account-create").prop("disabled",false);
						$("#error").text(data.message);
						scrollToElement("#error");
					}
	
				},
				error : function(){
					$("#account-create").prop("disabled",false);
					$("#error").text("There was an issue connecting to the database. Please try again. If this issue persists, contact webmaster@team5599.com and try again at a later time.");
					scrollToElement("#error");
				}
			});
		});

	} else if (pageIndex == "SignIn.html"){

		$("#account-sign-in").click(function(e) {
			e.preventDefault();

			console.log($("#input-username").val() + " USERNAME");

			if ($("#input-username").val().replace(/ /g, "") == ""){
				// No username
				$("#error").text("Please enter a username and password");
				$("#input-username").focus();
				return;
			} else if ($("#input-password").val().replace(/ /g, "") == ""){
				// No password
				$("#error").text("Please enter a username and password");
				$("#input-password").focus();
				return;

			}

			console.log("Signing In . . .");

			$("#account-sign-in").prop("disabled",true);
			$("#error").text("");

			$.ajax({
				type: "POST",
				url: "assets/php/SignIn.php",
				data: $(".form").serialize(),
				success: function(response) {

					var data = ajaxResponseToJSON(response);

					if (data.status == 200){
						console.log("Successful Sign In!\nServer should redirect to Accounts page momentarily."); // PHP will automatically redirect
					} else {
						$("#account-sign-in").prop("disabled",false);
						$("#error").text(data.message);
						scrollToElement("#error");
					}

				},
				error : function(){
					$("#account-sign-in").prop("disabled",false);
					$("#error").text("An error has occured. The database may be down. Please try again or check back at a later time.");
					scrollToElement("#error");
				}
			});
		});

		// Facebook Login

		// Discord Login
	} else if (pageIndex == "Verify.html"){

		var requestType = getUrlParam("request");

		console.log("Request type - " + requestType);

		if ((requestType == "verify") || (requestType == "notify")){

			$("#form-activate").removeClass("VisibilityHidden");

			if (requestType == "notify"){

				console.log("Notifying user . . .");

				$.ajax({
					type: "POST",
					url: "assets/php/Verify.php",
					data: {request : "notify"},
					success: function(response) {

						var data = ajaxResponseToJSON(response);

						if (data.status == 200){
							$("#error_activate").text("Success! You will be redirected momentarily to your Account page.");
						} else {
							$("#error_activate").text(data.message);
						}

					},
					error : function(){
						$("#error_activate").text("Unable to connect to server. Please try again, or contact webmaster@team5599.com if the issue persists.");
					}

				});
				
			} else {

				console.log("Verifying user . . .");

				var requestOSIS = getUrlParam("osis");
				var requestKey = getUrlParam("key");

				$.ajax({
					type: "POST",
					url: "assets/php/Verify.php",
					data: {request : "verify", osis: requestOSIS, key : requestKey},
					success: function(response) {

						var data = ajaxResponseToJSON(response);

						if (data.status == 200){
							$("#error_activate").text("Your account has been successfully verified!");
							$("#activate-go-to-dashboard").removeClass("VisibilityHiddenAbsolute");
						} else {
							console.alert("Failure: " + data.message);
							$("#error_activate").text(data.message);
						}
						
					},
					error: function (xhr, status) {
						$("#error_activate").text("Unable to connect to server. Please try again, or contact webmaster@team5599.com if the issue persists.");
					}

				});

			}

		} else if (requestType == "forgot"){

			$("#form-forgot").removeClass("VisibilityHidden");

			$("#form-forgot-button").click(function(){

				console.log("Sending reset request to server . . .");

				$("#form-forgot-button").prop("disabled", true);
				$("#error_forgot").addClass("VisibilityHiddenAbsolute");

				$.ajax({
					type: "POST",
					url: "assets/php/Verify.php",
					data: "request=forgot&" + $("#form-forgot").serialize(),
					success: function(response) {

						var data = ajaxResponseToJSON(response);

						if (data.status == 200){
							var email = data.message;
							$("#form-forgot").addClass("VisibilityHidden");
							$("#form-activate").removeClass("VisibilityHidden");
							$("#error_activate").text("An email has been sent to " + email + " with instructions on how to reset your password.");
						} else {
							$("#error_forgot").removeClass("VisibilityHiddenAbsolute");
							$("#error_forgot").text(data.message);
							$("#form-forgot-button").prop("disabled", false);
						}
						
					}

				});

			})

		} else if (requestType == "reset"){

			$("#form-reset").removeClass("VisibilityHidden");

			var osis = getUrlParam("osis");
			$("reset-p-text").text("Enter a new password for the account " + osis);

			$("#form-reset-button").click(function(){

				$("#form-reset-button").prop("disabled", true);
				$("#error_reset").addClass("VisibilityHiddenAbsolute");

				$.ajax({
					type: "POST",
					url: "assets/php/Verify.php",
					data: "request=reset&" + $("#form-reset").serialize(),
					success: function(response) {

						var data = ajaxResponseToJSON(response);

						if (data.status == 200){
							$("#form-reset").addClass("VisibilityHidden");
							$("#form-activate").removeClass("VisibilityHidden");
							$("#error_activate").text("Your email was successfully reset.");
							$("#activate-go-to-dashboard").removeClass("VisibilityHiddenAbsolute");
						} else {
							$("#error_reset").removeClass("VisibilityHiddenAbsolute");
							$("#error_reset").text(data.response);
							$("#form-reset-button").prop("disabled", false);
						}
						
					}

				});

			})



		}
	}

	// Go to Dashboard button
	$("#activate-go-to-dashboard").click(function(){

		$.ajax({
			type: "POST",
			url: "assets/php/getSession.php",
			data: '{request:"getSession"}',
			success: function(response) {

				var data = ajaxResponseToJSON(response)

				if (data.status == 200){
					window.location = "http://www.team5599.com/Account.html";
				} else {
					window.location = "http://www.team5599.com/SignIn.html";
				}
			},
			error : function(){
				console.alert("Could not authenticate over server. User is not considered signed in.");
				window.location = "http://www.team5599.com/SignIn.html";
			}

		});

	})

}

function handleContactsPage(){

	// Dyanmically loads contact objects from the SQL server

	console.log("Loading Contacts . . .");

	function buildContacts(contactsObject){

		var contactContainer = $("#contactInfoList");

		contactContainer.empty();

		if ((contactsObject != null) && (Object.keys(contactsObject).length > 0)){

			contactsObject = Object.values(contactsObject);

			// Sort table
			contactsObject.sort(function(a, b){
				return a.order > b.order;
			})

			for (contact in contactsObject){

				var contactItem = contactsObject[contact];

				var contactBox = $("#contactInfoDiv-Template").clone();

				$(contactBox).children("#name").html("<strong>" + contactItem.name + "</strong>");
				$(contactBox).children("#contact").text(contactItem.contact);

				$(contactBox).attr("id", contactItem.contact);

				$(contactBox).appendTo(contactContainer);

			}

		} else {
			$("#contactInfoList").append("<p>An error has occured. Consider refreshing the page?</p>");
		}
	}

	var defaultContactData = {
		"0" : {
			name : "General Info & Marketing",
			order : 0,
			contact : "Sentinels@team5599.com"
		},
		"1" : {
			name : "Danielle Louie - Director of Marketing",
			order : 1,
			contact : "DLouie@team5599.com"
		},
		"2" : {
			name : "Bernard Haggerty - Lead Coach",
			order : 2,
			contact : "BHaggerty@team5599.com"
		},
		"3" : {
			name : "Michael Rooplall - Webmaster",
			order : 3,
			contact : "MRooplall@team5599.com"
		}
	}

	$.ajax({
		type: "POST",
		url: "assets/php/getPageData.php",
		data: {request : "contactData"},
		success: function(response) {

			var data = ajaxResponseToJSON(response);

			if (data.status == 200){
				buildContacts(JSON.parse(data.message));
			} else {
				console.alert("Database parse failure.\n" + response);
				buildContacts(defaultContactData);
				$("#contactInfoList").append("<p>You are viewing a cached version of the contacts page, last updated in July, 2018. If you continue to see this message, please contact webmaster@team5599.com.<p>");

			}
			

		},

		error : function(e){
			console.log("An error occured when fetching the ajax request. Loading default data.");

			buildContacts(defaultContactData);

			$("#contactInfoList").append("<p>You are viewing a cached version of the contacts page, last updated in July, 2018. If you continue to see this message, please contact webmaster@team5599.com.<p>");

		}
	});

}

function handleRobotsPage(){

	// Dynamically load Robot data from the SQL server

	var defaultRobotData = [
		{
			title	: "Pied Piper",
			season 	: "2015",
			type 	: "FRC",

			image 	: "",
			description : ["Pied Piper was Team 5599's robot for the 2015 season, FIRST Recycle Rush. Pied Piper was capable of lifting and manuevering totes and garbage bins. The robot was named by the team's captain, Tanoy Sarkar.", "This robot helped the team win the Rookie Inspiration Award at the New York City Regional Competition and the Future Glory Award at the Brunswick Eruption Off-season competition."],

			revealVideos 	: ["https://www.youtube.com/watch?v=_-0VbFqoipo", "https://www.youtube.com/watch?v=Aj1VBVc-rHo"],

			competitionRecordings : {
				"NYC Regional - Rookie Inspiration Award" : "",
				"Brunswick Eruption - Future Glory Award" : "https://www.youtube.com/playlist?list=PLPPk4cjYYdMYIkI-JpK00zzL8NadVlk37"
			},

			CADiFrame : "",
			blueAllianceAPI : ""
		},
		{
			title	: "The Hound",
			season 	: "2016",
			type 	: "FRC",

			image 	: "",
			description : ["The Hound was Team 5599's robot for the 2016 season, FIRST Stronghold. The Hound was capable of doing all the defenses excluding the Sally Port and Drawbridge. It was also able to shoot the high goal and low goal. It's pneumatic wheels allowed for great off-terrain manueverability, the sound of it's shooting motors was ferocious, and it's pneumatic arm could punch through sheetrock. The robot was named by the team as a whole."],

			revealVideos 	: ["https://www.youtube.com/watch?v=oVSD8OBbLaM", "https://www.youtube.com/watch?v=PdjCbOFEjpI", "https://www.youtube.com/watch?v=VqOKzoHJDjA"],
			
			competitionRecordings : {
				"NYC Regional" : "https://www.youtube.com/playlist?list=PLPPk4cjYYdMbhEKMK7wOO8dr-A-fEgFII"
			},

			CADiFrame : "",
			blueAllianceAPI : ""
		},
		{
			title	: "HAL 5700",
			season 	: "2017",
			type 	: "FRC",

			image 	: "",
			description : ["HAL 5700 was Team 5599's robot for the 2017 season, FIRST STEAMworks. HAL 5700 was capable of receiving gears, placing them on the airships, using the return, and scaling the airship. It's omniwheels and design allowed it to manuever easily across fuel-filled fields. The robot was named by the team's lead coach, Bernard Haggerty.", "The team was a leading alliance and finalist at the Hudson Valley Rally off-season competition. The alliance placed 2nd, and consisted of Yonker's High School (Team 5123) and Carmel High School (Team 5943)."],

			revealVideos 	: ["https://www.youtube.com/watch?v=1CLYCoHTwPQ", "https://www.youtube.com/watch?v=EMiNmJW7enI"],
			
			competitionRecordings : {
				"NYC Regional" : "https://www.youtube.com/playlist?list=PLPPk4cjYYdMaGIvnHV1J-kzymZlSUV--n",
				"Hudson Valley Regional" : "https://www.youtube.com/playlist?list=PLPPk4cjYYdMYkxCTT5Rdrfobd3MyVrCml",
				"Hudson Valley Rally" : ""
			},

			CADiFrame : "",
			blueAllianceAPI : ""
		},
		{
			title	: "Quick Silver",
			season 	: "2018",
			type 	: "FRC",

			image 	: "",
			description : ["Quick Silver was Team 5599's robot for the 2018 season, FIRST Power Up! Quick Silver was capable of easily intaking power cubes, and efficiently placing them in the scale, even on it's highest and furthest points, and switches. The robot was named by the team.", "The team played in the quarter-finals during the NYC Regional Competition on an alliance with Brooklyn Technical High School (Team 334) and Long Island City High School (Team 2579)."],

			revealVideos 	: ["https://www.youtube.com/watch?v=sBPAlijR4mw"],
			
			competitionRecordings : {
				"NYC Regional" : "https://www.youtube.com/playlist?list=PLPPk4cjYYdMYKYeob_AxzjBBfbnAJboeP",
				"SBPLI Long Island Regional #2" : "https://www.youtube.com/playlist?list=PLPPk4cjYYdMbWWo66G_gRg1ucFTC-ZKlv",
			},

			CADiFrame : "",
			blueAllianceAPI : ""
		},
		{
			title	: "Barbara",
			season 	: "2018",
			type 	: "SeaPerch",

			revealVideos : ["https://www.youtube.com/watch?v=gl3SZgLjoD0", "https://www.youtube.com/watch?v=jiGpZYibsYI"],

			competitionRecordings : {
				"SeaPerch 2018" : ""
			},

			image 	: "",
			description : ["Barabara was the BNCHS Robotics Team's robot for the 2017 SeaPerch underwater robotics competition. She placed 3rd in the team's first season."],

		},
	];

	function buildRobots(localData){

		// Sort table
		localData.sort(function(a, b){
			return a.season < b.season;
		})

		$("#robot-buttons").empty();

		for (robot in localData){

			var robotData = localData[robot];
			var typeColor = ((robotData.type == "FRC") ? "info" : "danger");
		
			var buttonHTML = "<button id=\"" + robotData.type + "_" + robotData.title + "\" class=\"btn btn-" + typeColor + " RobotDisplayButton\" type=\"button\">" + robotData.title + "<span class=\"label label-" + typeColor + " RobotDisplayLabel\">" + robotData.type + " " + robotData.season + "</span></button>";
		
			$("#robot-buttons").append(buttonHTML);

		}

		function loadRobotData(id, setParameters){

			var data;

			for (robot in localData){
				if (localData[robot].type + "_" + localData[robot].title == id){
					data = localData[robot];
					break;
				}
			}

			if (data == null){
				alert("An error has occured - no robot with that type and title was found. '" + id + "'");
				return;
			}

			if (setParameters){
				updateQueryStringParam("type", data.type);
				updateQueryStringParam("season", data.season);
			}

			$("#robot-title").text(data.title);
			$("#robot-year").text(data.season);

			$("#robot-description").empty();
			for (description in data.description){
				$("#robot-description").append("<p>\t" + data.description[description] + "</p>");
			}

			$("#robot-reveal-video-main").empty();

			if ("revealVideos" in data){

				if (data.revealVideos.length == 0){

					$("#robot-reveal-video-main").append("<p class=\"text-center\">Sorry, there's no reveal video data for this year!</p>");

				} else if (data.revealVideos.length == 1){

					var videoHTML = "<div class=\"youtube-player-bg\"><iframe allowfullscreen frameborder=\"0\" src=\"https://www.youtube.com/embed/" + data.revealVideos[0].split("=")[1] + "?showinfo=0&amp;rel=0\" width=\"100%\" class=\"robot-reveal-video\"></iframe></div>";
					$("#robot-reveal-video-main").append(videoHTML)

				} else {

					var buildCarouselHTML_prepend = '<div data-ride="carousel" data-interval="false" data-wrap="false" data-pause="false" class="carousel slide" id="robot-reveal-videos-carousel"> <div role="listbox" class="carousel-inner" id="robot-reveal-slides">';
					var buildCarouselHTML_postpend = '</div> <div><a href="#robot-reveal-videos-carousel" role="button" data-slide="prev" class="left carousel-control"><i class="glyphicon glyphicon-chevron-left"></i><span class="sr-only">Previous</span></a><a href="#robot-reveal-videos-carousel" role="button" data-slide="next" class="right carousel-control"><i class="glyphicon glyphicon-chevron-right"></i><span class="sr-only">Next</span></a></div> </div>'
					
					var buildCarouselHTML_content = "";

					for (videoHead in data.revealVideos){

						var slideHTML = "<div class=\"item " + ((buildCarouselHTML_content == "") ? "active " : "") + "youtube-player-bg\"><iframe allowfullscreen frameborder=\"0\" src=\"https://www.youtube.com/embed/" + data.revealVideos[videoHead].split("=")[1] + "?showinfo=0&amp;rel=0\" width=\"100%\" class=\"robot-reveal-video\"></iframe></div>";
						buildCarouselHTML_content = buildCarouselHTML_content + " " + slideHTML;

					}

					$("#robot-reveal-video-main").append(buildCarouselHTML_prepend + buildCarouselHTML_content + buildCarouselHTML_postpend);

				}

				$("#robot-info-reveal-main").removeClass("VisibilityHiddenAbsolute");
			} else {
				$("#robot-info-reveal-main").addClass("VisibilityHiddenAbsolute");
			}
		

			$("#match-playlist").empty();

			var typeColor = ((data.type == "FRC") ? "info" : "danger");

			for (competition in data.competitionRecordings){

				var buttonHTML = "";

				if (data.competitionRecordings[competition] != ""){
					
					buttonHTML = "<a class=\"btn btn-" + typeColor + " match-playlist-item\" role=\"button\" href=\"" + data.competitionRecordings[competition] + "\">" + competition + "<i class=\"fa fa-film match-playlist-item-hasVideo\"></i></a>";
				
				} else {

					buttonHTML = "<p class=\"match-playlist-item-isFake btn-color-" + typeColor + "\">" + competition + "</p>"
					// buttonHTML = "<button class=\"btn btn-" + typeColor + " match-playlist-item\" type=\"button\">" + competition + "</button>";
				}

				$("#match-playlist").append(buttonHTML);
			}
		}

		$("#robot-buttons").children().each(function(){
			$(this).click(function(){

				var id = $(this).attr("id");
				loadRobotData(id, true);
				scrollToElement("#robot-info-main");

			})
		})

		var robotLoadQuery = localData[0].type + "_" + localData[0].title;

		var robotData_season = getUrlParam("season");
		var robotData_type = getUrlParam("type");

		if ((robotData_season != null) && (robotData_type != null)) {
			for (robot in localData){
				if ((localData[robot].type.toLowerCase() == robotData_type) && (localData[robot].season == robotData_season)){
					robotLoadQuery = localData[robot].type + "_" + localData[robot].title;
					break;
				}
			}
		}

		loadRobotData(robotLoadQuery);

	}

	$.ajax({
		type: "POST",
		url: "assets/php/getPageData.php",
		data: {request : "robotData"},
		success: function(response) {

			var data = ajaxResponseToJSON(response);

			if (data.status == 200){
				buildRobots(JSON.parse(data.message));
			} else {
				console.alert("Database parse failure.\n" + response);
				buildRobots(defaultRobotData);
				$("#robot-buttons").append("<p class=\"text-center\" style=\"margin-top:20px\">An error occured when loading the Robots page. A cached version of this page is currently being displayed and is at risk of being not up to date.</p>");

			}			

		},

		error : function(e){
			console.log("An error occured when fetching the ajax request. Loading default data.");

			buildRobots(defaultRobotData);
			$("#robot-buttons").append("<p class=\"text-center\" style=\"margin-top:20px\">An error occured when loading the Robots page. A cached version of this page is currently being displayed and is at risk of being not up to date.</p>");
		}
	});

}


function handleTeamPage() {

	// Dynamically load Team Data from the SQL Database

	// Loads following cached data when database fails to load
	var defaultPeopleData = {
		"000000" : {
			name : "Hansen Pan",
			yearJoined : "2016",
			yearGraduated : "2018",
			headshot : "",
			titles : {
				"Captain" : {
					title : "Captain",
					startYear : "2017",
					endYear : "2018"
				},
				"Head of Mechanics" : {
					title : "Head of Mechanics",
					startYear : "2017",
					endYear : "2018"
				}
			}
		},
		"000001" : {
			name : "Danielle Louie",
			yearJoined : "2016",
			yearGraduated : "2019",
			headshot : "",
			titles : {
				"Vice Captain" : {
					title : "Captain",
					startYear : "2017",
					endYear : "present"
				},
				"Director of Marketing" : {
					title : "Director of Marketing",
					startYear : "2017",
					endYear : "present"
				}
			}
		},
		"000002" : {
			name : "Nazifa Prapti",
			yearJoined : "2017",
			yearGraduated : "2020",
			headshot : "",
			titles : {
				"Co-Head of Electronics" : {
					title : "Co-Head of Electronics",
					startYear : "2017",
					endYear : "present"
				}
			}
		},
		"000003" : {
			name : "Max Menes",
			yearJoined : "2015",
			yearGraduated : "2019",
			headshot : "",
			titles : {
				"Co-Head of Electronics" : {
					title : "Co-Head of Electronics",
					startYear : "2017",
					endYear : "present"
				}
			}
		},
		"000004" : {
			name : "Jeff Chan",
			yearJoined : "2017",
			yearGraduated : "2019",
			headshot : "",
			titles : {
				"Co-Head of Programming" : {
					title : "Co-Head of Programming",
					startYear : "2017",
					endYear : "present"
				}
			}
		},
		"000005" : {
			name : "Ananta Sharma",
			yearJoined : "2017",
			yearGraduated : "2020",
			headshot : "",
			titles : {
				"Co-Head of Programming" : {
					title : "Co-Head of Programming",
					startYear : "2017",
					endYear : "present"
				}
			}
		},
		"000006" : {
			name : "Andrew \"Happy\" Lin",
			yearJoined : "2017",
			yearGraduated : "2020",
			headshot : "",
			titles : {
				"Board Member" : {
					title : "Board Member",
					startYear : "2017",
					endYear : "present"
				}
			}
		},
		"000007" : {
			name : "Tanoy Sarkar",
			yearJoined : "2014",
			yearGraduated : "2016",
			headshot : "",
			titles : {
				"Founder" : {
					title : "Founder",
					startYear : "2014",
					endYear : "present"
				},
				"Captain" : {
					title : "Captain",
					startYear : "2014",
					endYear : "2016"
				},
				"Mentor" : {
					title : "Mentor",
					startYear : "2016",
					endYear : "present"
				},
			}
		},
		"000008" : {
			name : "Kelin Qu",
			yearJoined : "2014",
			yearGraduated : "2017",
			headshot : "",
			titles : {
				"Captain" : {
					title : "Captain",
					startYear : "2017",
					endYear : "2018"
				},
				"Head of Electronics" : {
					title : "Haed of Electronics",
					startYear : "2014",
					endYear : "2017"
				},
				"Head of Pneumatics" : {
					title : "Haed of Electronics",
					startYear : "2014",
					endYear : "2017"
				},
				"Mentor" : {
					title : "Mentor",
					startYear : "2017",
					endYear : "present"
				},
			}
		},
		"000009" : {
			name : "Michael Rooplall",
			yearJoined : "2016",
			yearGraduated : "2017",
			headshot : "",
			titles : {
				"Head of Programming" : {
					title : "Haed of Programming",
					startYear : "2016",
					endYear : "2017"
				},
				"Webmaster" : {
					title : "Webmaster",
					startYear : "2016",
					endYear : "present"
				},
				"Mentor" : {
					title : "Mentor",
					startYear : "2017",
					endYear : "present"
				},
			}
		}
	}

	var peopleCache = {};

	function convertYear(yearGiven){
		if (yearGiven.toLowerCase() == "present"){
			return new Date().getFullYear();
		}
		return yearGiven;
	}

	function loadTeamHistory(year){

		if (getUrlParam("viewType") == "alumni"){
			console.log("Loading Alumni Data for the " + year + " Season");
		} else {
			console.log("Loading Leadership Data for the " + year + " Season");
		}

		function getRelevantPeopleForYear(year, callback){

			if (peopleCache[year] != null){
				callback(peopleCache[year]);
			} else {

				$.ajax({
					type: "POST",
					url: "assets/php/getPageData.php",
					data: {request : "getPeopleData"},
					success: function(response) {

						var data = ajaxResponseToJSON(response);
						if (data.status == 200){
							callback(sortRelevantPeople(year, JSON.parse(data.message)));
						} else {
							console.alert("Database parse failure.\n" + response);
							callback(sortRelevantPeople(year, defaultPeopleData), true);
						}
						
					},
					error : function(){
						console.log("An error occured when fetching team data.");
						callback(sortRelevantPeople(year, defaultPeopleData), true);
					}
				});
			}

		}

		function sortRelevantPeople(year, collectionOfPeople){

			var data = {
				leadership : [],
				roster : {},
				mentors : []
			}

			for (personID in collectionOfPeople){
				var personData = collectionOfPeople[personID];
				if ((convertYear(personData.yearJoined) <= year) && (convertYear(personData.yearGraduated) >= year)){
					

					var relevantTitles = [];

					for (titleID in personData.titles){
						if ((convertYear(personData.titles[titleID].startYear) <= year) && (convertYear(personData.titles[titleID].endYear) >= year)){
							relevantTitles.push(personData.titles[titleID]);
						}
					}

					personData.relevantTitles = relevantTitles;

					data.leadership.push(personData);

				} else {
					for (titleID in personData.titles){
						var titleData = personData.titles[titleID];
						if ( ((titleData.title.toLowerCase().includes("mentor")) || (titleData.title.toLowerCase().includes("coach"))) && (convertYear(titleData.startYear) <= year) && (convertYear(titleData.endYear) >= year) ) {
							personData.relevantTitles = [personData.titles[titleID]];
							data.mentors.push(personData);
							break;
						}
					}
				}
			}

			peopleCache[year] = data;
			return data;

		}

		// Use javascript sorting algorithim to compare person object with unique hash codes to a different draggable "orderable" list.

		getRelevantPeopleForYear(year, function(teamData, isDatabaseError){

			var personDisplayObject = $("#PersonDisplayBox_Template");

			$("#TeamHistoryBox").empty();
			$("#TeamHistoryList").empty();
			$("#TeamHistoryBox_Mentors").empty();


			if (("leadership" in teamData) && (teamData.leadership.length > 0)){

				// Sort the table

				for (index in teamData.leadership){

					var personBox = personDisplayObject.clone();

					var personBoxContent = $(personBox).children("#PersonDisplayContent");
					var personBoxLinks = $(personBox).children("#PersonDisplayLinks");

					var titleText = []; // Join with <br>

					for (titleIndex in teamData.leadership[index].relevantTitles){
						titleText.push(teamData.leadership[index].relevantTitles[titleIndex].title + " (" + teamData.leadership[index].relevantTitles[titleIndex].startYear + "-" + teamData.leadership[index].relevantTitles[titleIndex].endYear + ")");
					}

					$(personBoxContent).children("#PersonDisplayName").text(teamData.leadership[index].name);
					$(personBoxContent).children("#PersonDisplayTitles").html(titleText.join("<br>"));
					$(personBoxContent).children("#PersonDisplayInfo").text(teamData.leadership[index].yearJoined + "-" + teamData.leadership[index].yearGraduated);

					$(personBox).attr("id", "PersonDisplayBox_"+index);

					$(personBox).appendTo($("#TeamHistoryBox"));

				}

			} else {
				$("#TeamHistoryBox").append("<p class=\"text-center\">Sorry, we don't have any leadership data for that time period.</p>");
			}


			if (("roster" in teamData) && (Object.keys(teamData.roster).length > 0)){

				for (memberIndex in teamData.roster.members){
					var memberName = teamData.roster.members[memberIndex];
					if (teamData.roster.flipFirstName){
						memberName = memberName.split(" ").reverse().join(" ");
					}
					$("#TeamHistoryList").append("<p class=\"text-center team-member no-select\">" + memberName + "</p>");
				}

			} else {
				$("#TeamHistoryList").append("<p class=\"text-center\">Sorry, we don't have any attendance data for that time period.</p>");
			}

			if (("mentors" in teamData) && (teamData.mentors.length > 0)){

				for (index in teamData.mentors){

					var personBox = personDisplayObject.clone();

					var personBoxContent = $(personBox).children("#PersonDisplayContent");
					var personBoxLinks = $(personBox).children("#PersonDisplayLinks");

					var titleText;

					for (titleIndex in teamData.mentors[index].relevantTitles){
						titleText.push(teamData.mentors[index].relevantTitles[titleIndex].title + " (" + teamData.mentors[index].relevantTitles[titleIndex].startYear + "-" + teamData.mentors[index].relevantTitles[titleIndex].endYear + ")");
					}

					$(personBoxContent).children("#PersonDisplayName").text(teamData.mentors[index].name);
					$(personBoxContent).children("#PersonDisplayTitles").html(titleText.join("<br>"));
					$(personBoxContent).children("#PersonDisplayInfo").text(teamData.mentors[index]);

					$(personBox).attr("id", "PersonDisplayBox_" + teamData.mentors[index].name);

					$(personBox).appendTo($("#TeamHistoryBox_Mentors"));

				}

			} else {
				$("#TeamHistoryBox_Mentors").append("<p class=\"text-center\">Sorry, we don't have any mentor data for that time period.</p>");
			}

			if (isDatabaseError){
				$("#TeamHistoryBox").prepend("<h5 class=\"text-center\" style=\"margin-bottom:40px;color:#000;\">If this issue persists, please contant webmaster@team5599.com</h5>");
				$("#TeamHistoryBox").prepend("<h4 class=\"text-center\" style=\"margin-bottom:10px;color:red;\">An error occured with the database. You are viewing cached content, so information may not be accurate. Please try again or check back at a later time.</h4>");
			}

		});

	}

	// Set up the years

	$("#teamHistorySelector").empty();

	var dateObject = new Date();

	var queryYear = getUrlParam("year");
	if (queryYear == null){
		queryYear = dateObject.getFullYear();
	}

	var baseObject = document.createElement("optgroup");
	baseObject.label = "History";
	$(baseObject).appendTo($("#teamHistorySelector"));

	for (var year = dateObject.getFullYear(); year >= 2015; year--){
		$(baseObject).append($("<option></option>").val(year).html("Season " + year));
	}

	$("#teamHistorySelector").val(queryYear);

	// Handle

	if (getUrlParam("viewType") == "alumni"){
		$("#toggleTeamPageButton").prop("value", "Our Leadership");
	} else {
		$("#toggleTeamPageButton").prop("value", "Our Alumni");
	}

	$("#toggleTeamPageButton").click(function(){
		var selectedYear = $("#teamHistorySelector").val();
		if (getUrlParam("viewType") == "alumni"){
			updateQueryStringParam("viewType","leadership");
			$("#toggleTeamPageButton").text("Our Alumni");
			loadTeamHistory(selectedYear);
		} else {
			updateQueryStringParam("viewType","alumni");
			$("#toggleTeamPageButton").text("Our Leadership");
			loadTeamHistory(selectedYear);
		}
	});

	$("#teamHistorySelector").change(function(data){
		var selectedYear = $("#teamHistorySelector").val();
		updateQueryStringParam("year", selectedYear);
		loadTeamHistory(selectedYear);
	});

	loadTeamHistory($("#teamHistorySelector").val());

}

function handleResourcesPage(pageIndex){

	// Resources page

	// Copy HEX, RGB, and CMYK values on-click.

	$(".colorDisplayButton").click(function(){

		var $temp = $("<input>");
		$("body").append($temp);
		$temp.val($(this).text()).select();
		document.execCommand("copy");
		$temp.remove();

		alert("Coppied " + $(this).text() + " to clipboard.");
	})
}

//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////


function scrollUpdate(){ 

	// When the user scrolls, this is spammed and adjusts the position/color of the navbar and paralax displays.

	var pos = $(window).scrollTop();
	var navbarTransparency;

	if ($(window).width() > 992) {
		navbarTransparency = pos / 50;
	} else {
		navbarTransparency = 1.0;
	}

	$('.navbar').css('background-color', 'rgba(33,33,33,' + navbarTransparency + ')');
	$('.NavButton').css('background-color', 'rgba(33,33,33,' + navbarTransparency + ')');
	
	// Paralax Effect

	if ($(window).width() > 770) {
		$('.paralax').each(function() { 
			var $element = $(this);
			// subtract some from the height b/c of the padding
			var height = $element.height()-18;
			$(this).css('backgroundPosition', '50% ' + Math.round((height - pos) * pageSettings.paralaxVelocity) + 'px'); 
		});
	}

};

function getBackgroundImageSize(el){

	// Crazy stuff that loads the paralax splash headers

	var imageUrl = $(el).css('background-image').match(/^url\(["']?(.+?)["']?\)$/);
	var dfd = new $.Deferred();

	if (imageUrl[1] != null) {

		console.log("Searching cache for Size of '" + imageUrl[1] + "'");

		if (pageSettings.imageSizeCache.cache.hasOwnProperty(imageUrl[1])){

			console.log("Found Image Size in cache: (" + pageSettings.imageSizeCache.cache[imageUrl[1]].height + ", " + pageSettings.imageSizeCache.cache[imageUrl[1]].width + ")");

			dfd.resolve;

		} else {

			if (pageSettings.imageSizeCache.queue.hasOwnProperty(imageUrl[1])){
				console.log("Image in loading queue, rejecting new loading sequence.");
				dfd.reject();
			}

			console.log("Starting load for Size of " + imageUrl[1]);
				
			var image = new Image();
			image.onload = dfd.resolve;
			image.onerror = dfd.reject;
			image.src = imageUrl[1];

			pageSettings.imageSizeCache.queue[imageUrl[1]] = image;

		}
		
	} else {
		dfd.reject();
	}

	return dfd.then(function() {
		pageSettings.imageSizeCache.cache[imageUrl[1]] = { width: this.width, height: this.height }
		return pageSettings.imageSizeCache.cache[imageUrl[1]];
	});

}


function scaleSize(){

	// Scales the page depending on mobile, tablet, normal, and wide displays.

	if (pageSettings.splashPageSet == false){
		return console.log("Splash Page Image not set yet.");
	}

	// Scaling that does not require waiting for the paralax image to load

	var windowWidth = $(window).width();
	var windowHeight = $(window).height();

	var navbarHeight;
	
	var titleHeadingPadding;
	var contentPadding;
	var splashContentHeight;

	var divBluePadding;
	var divBlueHeight;

	var paralaxPadding;

	var personDisplayBoxWidth;

	var useMobileFontSizes = false;

	if (windowWidth > 992) {  

		console.log("Using desktop format");

		titleHeadingPadding = 40;
		contentPadding = 180;
		divBluePadding = 60;
		divBlueHeight = 100;

		if (windowWidth > 1200){
			contentPadding = (windowWidth - 1200)/2;
		}

		$('.SplashHeaderLogo').removeClass("SplashHeaderLogo-mobile");
		$('.about_btn').removeClass("about_btn-mobile");
		$('.robot-type-grid-out').removeClass("robot-type-grid-out-mobile");
		
		personDisplayBoxWidth = ($(".teamHistoryBox").innerWidth()/2)-21;
		useMobileFontSizes = false;

	} else {

		console.log("Using mobile format");

		titleHeadingPadding = 10;
		contentPadding = 20;
		divBluePadding = 20;
		divBlueHeight = "auto";

		$('.SplashHeaderLogo').addClass("SplashHeaderLogo-mobile");
		$('.about_btn').addClass("about_btn-mobile");
		$('.robot-type-grid-out').addClass("robot-type-grid-out-mobile");
		
		
		personDisplayBoxWidth = $(".teamHistoryBox").innerWidth()-20;
		useMobileFontSizes = true;
	}

	if (windowWidth <= 1200){
		$('.sponsor-container').removeClass("sponsor-container-mobile");
		$('.SponsorLogo').addClass("SponsorLogo-mobile");
		$('.SponsorContainerInner').addClass("SponsorContainerInner-mobile");
	} else {
		$('.sponsor-container').addClass("sponsor-container-mobile");
		$('.SponsorLogo').removeClass("SponsorLogo-mobile");
		$('.SponsorContainerInner').removeClass("SponsorContainerInner-mobile");
	}

	
	if (windowWidth < 770){
		//$('.navbar').removeClass("navbar-fixed-top");
		//$('.navbar').addClass("navbar-static-top");
		$('.splashContentHeader').addClass("splashContent-pushMobile");
		$('.navbar-nav').addClass("navbar-mobile");
		$('.MicroLogo').addClass("MicroLogo-sm");
		$('.MicroLogo').removeClass("MicroLogo");
	} else {
		$('.navbar').addClass("navbar-fixed-top");
		$('.navbar').removeClass("navbar-static-top");
		$('.navbar-nav').removeClass("navbar-mobile");
	}


	if ($(".navbar-toggle").is(":visible")){
		navbarHeight = 40;
	} else {
		navbarHeight = 60;
	}

	$('.navbar').css('height', navbarHeight + "px");
	$('.sectionContainer').css('padding-left', contentPadding + "px");
	$('.sectionContainer').css('padding-right', contentPadding + "px");

	$('.divBlue').css('padding-right', divBluePadding + "px");
	$('.divBlue').css('padding-left', divBluePadding + "px");
	$('.divBlue').css('height', ((divBlueHeight == "auto") ? "auto" : divBlueHeight + "px"));

	$('.TitleHeading').css('margin-left', titleHeadingPadding + "px");
	$('.TitleHeading').css('margin-right', titleHeadingPadding + "px");
	$('.TitleHeadingSmall').css('margin-left', titleHeadingPadding + "px");
	$('.TitleHeadingSmall').css('margin-right', titleHeadingPadding + "px");

	$('.PersonDisplayBox').css('width', personDisplayBoxWidth + "px");

	if (useMobileFontSizes == true){
		$(".TitleHeading").addClass("TitleHeadingMobileSmall");
		$(".LogoFull").css("float", "none");
		$(".LogoFull").css("margin-right", "0px");
	} else {
		$(".TitleHeading").removeClass("TitleHeadingMobileSmall");
		$(".LogoFull").css("float", "left");
		$(".LogoFull").css("margin-right", "30px");
	}

	if (windowWidth > windowHeight) {
		$('.dropdown').hover(function(){
			$(this).addClass('open')
		}, function(){
			$(this).removeClass('open')
		});
	}


	// Paralax image scaling

	if ($(".paralax").length == 0){
		console.log("No Splash Image");
		continueScale();
	} else {

		getBackgroundImageSize(jQuery('.paralax'))
			.then(function(size) {

			if (size == null){
				return;
			}

			console.log('Paralax Splash Image size is', size.width, size.height);

			if (size.width == 64 && size.height == 64){

				splashImageWidth = 1920;
				splashImageHeight = 1080;

				continueScale(1920, 1080);

			} else {

				splashImageWidth = size.width;
				splashImageHeight = size.height;

				continueScale(size.width, size.height);
			}
			

		})
		.fail(function() {
			console.log('Could not get size because could not load image');
		});

	}

	function continueScale(splashImageWidth, splashImageHeight){

		if (windowWidth > 992) {  

			splashContentHeight = Math.round($(window).width() * .35);
			if (splashContentHeight > splashImageHeight){
				splashContentHeight = splashImageHeight;
			}

		} else {

			if (windowWidth < splashImageWidth){
				splashContentHeight = splashImageHeight * (windowWidth/splashImageWidth) - 21;
			} else {
				splashContentHeight = 300;
			}
			
		}

		paralaxPadding = splashImageHeight / splashImageWidth * splashContentHeight;

		// $('.splashContent').css("height", splashContentHeight + "px");
		// $('.splashContentHalf').css("height", (splashContentHeight/2) + "px");

		$(".splashContent").animate({height:splashContentHeight + 'px'}, 400);
		$(".splashContentHalf").animate({height: (splashContentHeight/2) + 'px'}, 400);

		$('.paralax').css('padding-top', paralaxPadding+"%");
		$('.paralaxHalf').css('padding-top', (paralaxPadding/2)+"%");
		
		var splashContentHeaderLogoPush = Math.round((splashContentHeight*2/3) - ($('.splashContentHeader').height())/2);
		var splashContentHeaderLogoPushHalf = Math.round(((splashContentHeight/2)*2/3) - ($('.splashContentHeader').height())/2);

		$('.splashContentHeader').css('top', splashContentHeaderLogoPush + "px");
		$('.splashContentHeaderHalf').css('top', splashContentHeaderLogoPushHalf + "px");	

		scrollUpdate();

	}
}

/////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
// #
// # Michael Rooplall | DeveloperBlue 2018 Copyright
// # Benjamin N. Cardozo High School Robotics Team | FRC Team 5599 - The Sentinels
// # 
// # Cheers to months in the making, learned HTML, CSS, JavaScript, SQL, and many valuable website, frameworks, databases, and security tips.
// # 
// # Website 			: www.team5599.com
// # Developer 			: https://github.com/DeveloperBlue
// #					: https://twitter.com/MichaelRooplall
// # Commercial Contact : Webmaster@team5599.com
// #
////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////