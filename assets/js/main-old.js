

var facebookPageId = "495373137323994";
var paralaxVelocity = 0.5;

var imageSizeCacheQueue = {};
var imageSizeCache = {};

var splashPageSet = false;
var documentReady = false;
var loginTriggeredBeforeDocumentReady = false;

///////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////

$(document).ready(function() {

	documentReady = true;
	if (loginTriggeredBeforeDocumentReady){
		checkLoginStatus();
	}

	prepareSplashImage();
	scaleSize();

});

$(window).on("load", function() {
	// Executes when complete page is fully loaded, including all frames, objects and images

	var pageIndex = window.location.pathname.split("/").pop();

	configureNavbar(pageIndex);

	if (pageIndex == "Team.html"){
		handleTeamPage();
	} else if (pageIndex == "Robots.html"){
		// handleRobotsPage();
	} else if ((pageIndex == "AdminPanel.html") || (pageIndex == "Login.html")){
		checkLocation();
	}

	scaleSize();

});

$(window).bind('resize', scaleSize);
$(window).bind('scroll', scrollUpdate);


///////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////


function prepareSplashImage(pageIndex){

	var pageIndex = pageIndex;
	if (pageIndex == null){
		pageIndex = window.location.pathname.split("/").pop();
	}

	var pageSplashImage = "";

	if (pageIndex == "Team.html"){
		pageSplashImage = "Team2017.jpg";
	} else if (pageIndex == "FIRST.html"){
        pageSplashImage = "FIRST.jpg";
    } else if (pageIndex == "Robot.html"){
        pageSplashImage = "Robot2017.jpg";
    } else if (pageIndex == "Sponsors.html"){
        pageSplashImage = "Teamwork.jpg";
    } else if (pageIndex == "Contact.html"){
        pageSplashImage = "Mentor.jpg";
	} else {
		pageSplashImage = "Default.png"; 
	}

	$(".paralax").css('background-image', 'url("assets/img/SplashHeaders/'+pageSplashImage+'")');

	splashPageSet = true;

}



function configureNavbar(pageIndex){

	if (pageIndex == "Blog.html" || pageIndex == "SocialMedia.html"){
		$("#MediaBlogNavButton").addClass("active");
	} else if (pageIndex == "Projects.html" || pageIndex == "Calendar.html" || pageIndex == "AdminPanel.html"){
		$("#CommunityResourcesNavButton").addClass("active");
	} else if (pageIndex == "Sponsors.html" || pageIndex == "OurSponsors.html"){
		$("#SponsorsNavButton").addClass("active");
	} else if (pageIndex == "ContactUs.html"){
		$("#ContactNavButton").addClass("active");
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

	$("#FlickrModalTrigger").click(function(){
		$("#FlickrModal").modal('show');
	});

}

function httpGetAsync(theUrl, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

function checkLocation(){
	var httpQuery = "https://freegeoip.net/json/";
	var schoolIP = "165.155.213.225";

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

function loadFacebookDetails(){

	console.log("Getting Login Details for Style Blurb 2.0");

	FB.api("/me", function(response) {

		console.log("Loading details . . .");
		$("#facebookLoginInformationTitle").text("Logged in as " + response.name);
		$("#facebookLoginInformationPhotoActual").css("background-image", "url(http://graph.facebook.com/"+response.id+"/picture?type=normal)");
		//$("#facebookLoginInformationPhotoActual").src="http://graph.facebook.com/"+response.id+"/picture"
		$("#facebookLoginInformationWrongAccount").click(function(){
			facebookLogOut(true);
		});
	});

}

function facebookLogIn(){
	FB.login(function(response) {

		if (response.authResponse) {

			console.log("You have successfully logged in!");

			var pageIndex = window.location.pathname.split("/").pop();

            if (pageIndex == "AdminPanel.html"){
            	loadFacebookDetails();
                activateAdminPanel(response.authResponse.userID);
            } else if (pageIndex == "WebsiteManager.html"){
            	loadFacebookDetails();
            } else {
                window.location.href = "/AdminPanel.html";
            }

		} else {
			console.log("User cancelled login or did not fully authorize.");
			if ((pageIndex == "AdminPanel.html") || (pageIndex == "WebsiteManager.html")){
				window.location.href = "/Login.html";
			}
		}

	}, {scope: "manage_pages,publish_pages,user_managed_groups"} );
}

function facebookLogOut(relogin){
	FB.logout(function(){
		document.cookie = "fblo_138369146905135"+'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
		if (relogin == true){
			window.location.href = "/Login.html";
		} else {
			window.location.href = "/index.html";
		}
	});
}

function checkLoginStatus(){

	if (documentReady){
		console.log("Getting login status . . . ");
		FB.getLoginStatus(function(response){
			updateLoginStatus(response);
		});
	} else {
		loginTriggeredBeforeDocumentReady = true;
	}
	
}

function updateLoginStatus(alphaResponse){

	if (alphaResponse == null){
		console.log("Facebook API called but not loaded");
		return;
	}

	var pageIndex = window.location.pathname.split("/").pop();

	if (((pageIndex == "AdminPanel.html") || (pageIndex == "WebsiteManager.html")) && (alphaResponse.status !== "connected")){
		window.location.href = "/Login.html";
		return;
	}

	if (alphaResponse.status === "connected") {

		var uid = alphaResponse.authResponse.userID;
    	var accessToken = alphaResponse.authResponse.accessToken;

		console.log("You are logged in as <"+uid+">");

		$("#FooterLoginButton").text("Admin Panel");

		$("#LogInButton").click(function(){
			window.location.href = "/AdminPanel.html";
		});

		$("#FooterLoginButton").text("Log Out");

		$("#FooterLoginButton").click(function(){
			facebookLogOut();
		});

		var pageIndex = window.location.pathname.split("/").pop();

		if (pageIndex == "AdminPanel.html"){
			loadFacebookDetails();
			activateAdminPanel(uid);
		} else if (pageIndex == "WebsiteManager.html"){
            loadFacebookDetails();
		} else if (pageIndex == "Login.html"){
			window.location.href = "/AdminPanel.html";
		}

	} else if (alphaResponse.status === "not_authorized") {

		console.log("You are logged but have not authenticated the application");

	} else {

		console.log("You are not logged in. " + alphaResponse.status);

		$("#LogInButton").click(function(){
			window.location.href = "/Login.html";
		});

		$("#FooterLoginButton").click(function(){
			window.location.href = "/Login.html";
		});

		$("#FooterLoginButton").text("Login");

	}
}

function facebookReady(alphaResponse){

	console.log("Facebook SDK Ready");

	updateLoginStatus(alphaResponse);

	$("#LogOutButton").click(function(){
		facebookLogOut();
	});

	$("#fb-login-button").click(function(){
		// facebookLogIn();
	});

}

function activateAdminPanel(uid){

	console.log("Preparing Admin Panel . . .");

	FB.api("/"+facebookPageId+"?fields=access_token", function(betaResponse){

		if (betaResponse && !betaResponse.error && betaResponse.hasOwnProperty("access_token")){

			FB.api("/"+facebookPageId+"/roles/"+uid, function(charlieResponse){

				if (charlieResponse && !charlieResponse.error) {
					console.log("Role Results:\n" + JSON.stringify(charlieResponse));
					var role = charlieResponse.data[0].role;
                    
                    $("#facebookLoginInformationRole").text("Permission Status: " + role.toUpperCase());

					if (role == "Admin"){
						unlockAdministratorButtons();
					} else if (role == "Moderator"){
						unlockModeratorButtons();
					} else if (role == "Editor"){
						unlockEditorButtons();
					} else if (role == "Analyst"){
						unlockAnalystButtons();
					} else {
						console.log("Your role is invalid!");
					}

				} else {
					console.log("An error has occured: " + JSON.stringify(charlieResponse));
				}

			}, {access_token: betaResponse.access_token});


		} else {
			console.log("An error has occured: " + JSON.stringify(betaResponse));
		}

	})

	function unlockButton(button){
		var buttonElement = $(button);
		if (buttonElement){
			buttonElement.removeClass("disabled");
		}
	}

	function unlockAdministratorButtons(){
		console.log("Unlocking Administrator Buttons");
		unlockButton("#Panel_PostAnnouncement");
		unlockButton("#Panel_TrailerCam");
		unlockButton("#Panel_ActivityLog");
		unlockButton("#Panel_ManageWebsite");

		unlockModeratorButtons();
	}

	function unlockModeratorButtons(){

		console.log("Unlocking Moderator Buttons");

		unlockButton("#Panel_ManagePeople");
		unlockButton("#Panel_ManageRobots");

		unlockEditorButtons();
	}

	function unlockEditorButtons(){

		console.log("Unlocking Editor Buttons");

		unlockButton("#Panel_NewPost");
		unlockButton("#Panel_EditPosts");
		unlockButton("#Panel_EditCategories");

		unlockAnalystButtons();
	}


	function unlockAnalystButtons(){
		console.log("Unlocking Analyst Buttons");
		unlockButton("#Panel_FlickrSubmissions");
	}
}

function handleTeamPage() {

	function loadTeamHistory(year){

		if (getUrlParam("viewType") == "alumni"){
			console.log("Loading Alumni Data for the " + year + " Season");
		} else {
			console.log("Loading Leadership Data for the " + year + " Season");
		}
		

		var leadershipJsonObject = {

			"2018" : {
				"Leadership" : {

					"FirstName LastName" : {
						"Titles" : ["Captain", "Director"],
						"Duration" : "startYear-endYear",
						"AssignedOrder" : 0,
					},

					"FirstName VeryLongLongLastName2" : {
						"Titles" : ["A title"],
						"Duration" : "startYear-endYear",
						"AssignedOrder" : 0,
					},

					"FirstName LastName3" : {
						"Titles" : ["Captain", "Director"],
						"Duration" : "startYear-endYear",
						"AssignedOrder" : 0,
					},

					"FirstName LastName4" : {
						"Titles" : ["A title", "Another one"],
						"Duration" : "startYear-endYear",
						"AssignedOrder" : 0,
					}

				}
			}

		}

		/*
	
		var applicablePeoples = [];

		// Get Applicable People

		// Build cases for searching for mentors, when dates == "present", etc. Haggerty, etc.

		for (person in PersonObjects){
			if (lookingForAlumni && (PersonObjects[person].yearGraduating < queryYear)){
				applicablePeoples.push(PersonObjects[person]);
			} else if (!lookingForAlumni && queryYear >= PersonObjects[person].yearJoined && queryYear <= PersonObjects[person].yearGraduating) {
				applicablePeoples.push(PersonObjects[person]);
			}
		}

		// Use javascript sorting algorithim to compare person object with unique hash codes to a different draggable "orderable" list.

		*/

		var personDisplayObject = $("#PersonDisplayBox_Template");

		$("#TeamHistoryBox").empty();

		if (leadershipJsonObject.hasOwnProperty(year)) {

			var leaders = leadershipJsonObject[year].Leadership;

			for (leaderName in leaders) {

				console.log("Leader: " + leaderName);

				var personBox = personDisplayObject.clone();

				var personBoxContent = $(personBox).children("#PersonDisplayContent");
				var personBoxLinks = $(personBox).children("#PersonDisplayLinks");

				$(personBoxContent).children("#PersonDisplayName").text(leaderName);
				$(personBoxContent).children("#PersonDisplayTitles").html(leaders[leaderName].Titles.join("<br />"));
				$(personBoxContent).children("#PersonDisplayInfo").text(leaders[leaderName].Duration);

				$(personBox).attr("id", "PersonDisplayBox_"+leaderName);

				$(personBox).appendTo($("#TeamHistoryBox"));
				

			}

		} else {
			console.log("We don't have any data for that year! Sorry!");

			var noDataMessage = $("<p></p>").text("Sorry, we don't have any data for that year!");
			$("#TeamHistoryBox").append(noDataMessage);

		}
	}

	// Set up the years

	$("#teamHistorySelector").empty();

	var queryYear = getUrlParam("year");
	if (queryYear == null){
		var dateObject = new Date();
		queryYear = dateObject.getFullYear();
	}

	var baseObject = document.createElement("optgroup");
	baseObject.label = "History";
	$(baseObject).appendTo($("#teamHistorySelector"));

	for (var year = queryYear; year >= 2015; year--){
		$(baseObject).append($("<option></option>").val(year).html("Season " + year));
	}

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
			$("#toggleTeamPageButton").prop("value", "Our Leadership");
			loadTeamHistory(selectedYear);
		} else {
			updateQueryStringParam("viewType","alumni");
			$("#toggleTeamPageButton").prop("value", "Our Alumni");
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

var updateQueryStringParam = function (key, value) {

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
	return getAllUrlParams(customUrl)[param];
}

function getAllUrlParams(url) {

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

function scrollUpdate(){ 

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
	$('.paralax').each(function() { 
		var $element = $(this);
		// subtract some from the height b/c of the padding
		var height = $element.height()-18;
		$(this).css('backgroundPosition', '50% ' + Math.round((height - pos) * paralaxVelocity) + 'px'); 
	}); 

};


function getBackgroundImageSize(el) {

	var imageUrl = $(el).css('background-image').match(/^url\(["']?(.+?)["']?\)$/);
	var dfd = new $.Deferred();

	if (imageUrl[1] != null) {

		console.log("Searching cache for Size of '" + imageUrl[1] + "'");

		if (imageSizeCache.hasOwnProperty(imageUrl[1])){

			console.log("Found Image Size in cache: (" + imageSizeCache[imageUrl[1]].height + ", " + imageSizeCache[imageUrl[1]].width + ")");

			dfd.resolve;

		} else {

			if (imageSizeCacheQueue.hasOwnProperty(imageUrl[1])){
				console.log("Image in loading queue, rejecting new loading sequence.");
				dfd.reject();
			}

			console.log("Starting load for Size of " + imageUrl[1]);
				
			var image = new Image();
			image.onload = dfd.resolve;
			image.onerror = dfd.reject;
			image.src = imageUrl[1];

			imageSizeCacheQueue[imageUrl[1]] = image;

		}
		
	} else {
		dfd.reject();
	}

	return dfd.then(function() {
		imageSizeCache[imageUrl[1]] = { width: this.width, height: this.height }
		return imageSizeCache[imageUrl[1]];
	});
};


function scaleSize(){

	if (splashPageSet == false){
		return console.log("Splash Page Image not set yet.");
	}

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


			splashImageWidth = size.width;
			splashImageHeight = size.height;

			continueScale(size.width, size.height);
		

		})
		.fail(function() {
			console.log('Could not get size because could not load image');
		});

	}

	function continueScale(splashImageWidth, splashImageHeight){

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

			splashContentHeight = Math.round($(window).width() * .35);
			if (splashContentHeight > splashImageHeight){
				splashContentHeight = splashImageHeight;
			}

			if (windowWidth > 1200){
				contentPadding = (windowWidth - 1200)/2
			}

			personDisplayBoxWidth = ($(".teamHistoryBox").innerWidth()/2)-21;

			useMobileFontSizes = false;

		} else {

			console.log("Using mobile format");

			titleHeadingPadding = 10;
			contentPadding = 20;
			divBluePadding = 20;
			divBlueHeight = "auto";

			if (windowWidth < splashImageWidth){
				splashContentHeight = splashImageHeight * (windowWidth/splashImageWidth) - 21;
			} else {
				splashContentHeight = 300;
			}

			personDisplayBoxWidth = $(".teamHistoryBox").innerWidth()-20;
			useMobileFontSizes = true;
			
		}

		if ($(".navbar-toggle").is(":visible")){
			navbarHeight = 40;
		} else {
			navbarHeight = 60;
		}

		paralaxPadding = splashImageHeight / splashImageWidth * splashContentHeight;

		$('.navbar').css('height', navbarHeight + "px");
		$('.sectionContainer').css('padding-left', contentPadding + "px");
		$('.sectionContainer').css('padding-right', contentPadding + "px");
		$('.splashContent').css("height", splashContentHeight + "px");
		$('.splashContentHalf').css("height", (splashContentHeight/2) + "px");
		$('.divBlue').css('padding-right', divBluePadding + "px");
		$('.divBlue').css('padding-left', divBluePadding + "px");
		$('.divBlue').css('height', ((divBlueHeight == "auto") ? "auto" : divBlueHeight + "px"));
		$('.paralax').css('padding-top', paralaxPadding+"%");
		$('.paralaxHalf').css('padding-top', (paralaxPadding/2)+"%");
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

		var splashContentHeaderLogoPush = Math.round((splashContentHeight*2/3) - ($('.splashContentHeader').height())/2);
		var splashContentHeaderLogoPushHalf = Math.round(((splashContentHeight/2)*2/3) - ($('.splashContentHeader').height())/2);
		$('.splashContentHeader').css('top', splashContentHeaderLogoPush + "px");
		$('.splashContentHeaderHalf').css('top', splashContentHeaderLogoPushHalf + "px");

		if (windowWidth > windowHeight) {
			$('.dropdown').hover(function(){
				$(this).addClass('open')
			}, function(){
				$(this).removeClass('open')
			});
		}

		scrollUpdate();
	}
}


