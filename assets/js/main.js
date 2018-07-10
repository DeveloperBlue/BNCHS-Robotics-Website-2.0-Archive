
// const facebookPageId = "495373137323994";

let pageSettings = {

	paralaxVelocity : 0.5,

	splashPageSet : false,
	documentReady : false,
	loginTriggeredBeforeDocumentReady : false,

	imageSizeCache : {
		cache : {},
		queue : {}
	},

	didLoadSlides : {
		slide_2 : false,
		slide_3 : false,
	},
};

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

$(window).on("load", function(){

	const pageIndex = getPageIndex();

	configureNavbar(pageIndex);

	if ((pageIndex == "") || (pageIndex == "index.html")){
		handleSliders(pageIndex);
	} else if (pageIndex == "Team.html"){
		handleTeamPage(pageIndex);
	} else if (pageIndex == "Robots.html"){
		handleRobotsPage(pageIndex);
	} else if ((pageIndex == "SignIn.html") || (pageIndex == "SignUp.html")) {
		handleLoginPage(pageIndex);
		checkLocation();
	} else if ((pageIndex == "Account.html") || (pageIndex == "WebsiteManager.html")){
		handleAccountPage(pageIndex);
		checkLocation();
	} else if (pageIndex == "Contact.html"){
		handleContactsPage();
	}

	scaleSize();
})

$(window).bind("resize", scaleSize);
$(window).bind("scroll", scrollUpdate);


//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////

function getPageIndex(){
	return window.location.pathname.split("/").pop();
}

function prepareSplashImage(pageIndex){

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

	pageIndex = (pageIndex != null) ? pageIndex : getPageIndex();

	if (pageIndex == "Blog.html" || pageIndex == "SocialMedia.html"){
		$("#MediaBlogNavButton").addClass("active");
	} else if (pageIndex == "Projects.html" || pageIndex == "Calendar.html" || pageIndex == "Documents.html"){
		$("#CommunityResourcesNavButton").addClass("active");
	} else if (pageIndex == "Sponsors.html" || pageIndex == "OurSponsors.html"){
		$("#SponsorsNavButton").addClass("active");
	} else if (pageIndex == "ContactUs.html"){
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

	$("#FlickrModalTrigger").click(function(){
		$("#FlickrModal").modal('show');
	});

	$.ajax({
		type: "POST",
		url: "assets/php/getSession.php",
		data: "request=getSession",
		success: function(response) {
			console.log("Session: " + response);
			if (response === false) {
				// User is not signed in
				$("#navbar-account-btn").html("Sign In <i class=\"glyphicon glyphicon-log-in socialMediaIcon\"></i>");
				$("#footer-account-btn").html($("#navbar-account-btn").html());
				$(".access-account-btn").click(function(){
					window.location = "http://www.team5599.com/SignIn.html";
				})
			} else {
				// User is signed in
				$("#navbar-account-btn").html("My Account <i class=\"glyphicon glyphicon-user socialMediaIcon\"></i>");
				$("#footer-account-btn").html($("#navbar-account-btn").html());
				$(".access-account-btn").click(function(){
					window.location = "http://www.team5599.com/Account.html";
				})
			}
		}
	});

}

//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////

function httpGetAsync(theUrl, callback) {
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function() { 
		if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
			callback(xmlHttp.responseText);
		}
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

function scrollToElement(element){
	console.log("Scrolling to " + element);

	var offset = $(element).offset();
	offset.left -= 20;
	offset.top -= 20;

	$('html, body').animate({
		scrollTop: offset.top,
		scrollLeft: offset.left
	});
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

//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////


function handleSliders(){

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
		$("#tab-3-content").html('<iframe src="https://clips.twitch.tv/embed?clip=WiseSparklyWatercressWutFace" frameborder="0" allowfullscreen="true" autoplay="false" height="100%" width="100%"></iframe>');
		pageSettings.didLoadSlides.slide_3 = true;
	})

}

function handleAccountPage(pageIndex){

	pageIndex = (pageIndex != null) ? pageIndex : getPageIndex();

	$("#account-loading").removeClass("VisibilityHiddenAbsolute");
	$("#account-page").addClass("VisibilityHiddenAbsolute");

	$.ajax({
		type: "POST",
		url: "assets/php/getSession.php",
		data: "request=getSession",
		success: function(response) {
			console.log("Session: " + response);
			if (response === false) {
				// User is not signed in
				window.location = "http://www.team5599.com/SignIn.html";
			} else {
				// User is signed in
				$("#account-loading").addClass("VisibilityHiddenAbsolute");
				$("#account-page").removeClass("VisibilityHiddenAbsolute");
			}
		}
	});

	$("#accountPage-userTitle").text("Logged in as FIRSTNAME-LASTNAME");
	// $("#facebookLoginInformationPhotoActual")

	$("#accountPage-signOut").click(function(){
		console.log("You have been signed out.");
	})

}

function handleLoginPage(pageIndex){

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
					if (response === "success") {
						console.log("Success!"); // PHP will automatically redirect
					} else {
						$("#account-create").prop("disabled",false);
						$("#error").text(response);
						scrollToElement("#error");
					}
				}
			});
		});

	} else if (pageIndex == "SignIn.html"){

		$("#account-sign-in").click(function(e) {
			e.preventDefault();
			console.log("Signing In . . .");
			$("#account-sign-in").prop("disabled",true);
			$("#error").text("");
			$.ajax({
				type: "POST",
				url: "assets/php/SignIn.php",
				data: $(".form").serialize(),
				success: function(response) {
					if (response === "success") {
						console.log("Success!"); // PHP will automatically redirect
					} else {
						$("#account-sign-in").prop("disabled",false);
						$("#error").text(response);
						scrollToElement("#error");
					}
				}
			});
		});

		// Facebook Login

		// Discord Login
	} else if (pageIndex == "Verify.html"){

		var requestType = getUrlParam("request");

		if ((requestType == "verify") || (requestType == "notify")){

			$("#form-activate").removeClass("visibilityHidden");

			if (requestType == "notify"){

				console.log("Notifying user . . .");

				$.ajax({
					type: "POST",
					url: "assets/php/Verify.php",
					data: "request=notify",
					success: function(response) {
						$("#error_activate").text(response);
					}

				});
				
			} else {

				console.log("Verifying user . . .");

				$.ajax({
					type: "POST",
					url: "assets/php/Verify.php",
					data: "request=verify",
					success: function(response) {
						if (response == "success"){
							$("#error_activate").text("Your account has been successfully verified!");
							$("#activate-go-to-dashboard").removeClass("VisibilityHiddenAbsolute");
						} else {
							$("#error_activate").text(response);
						}
						
					}

				});

			}

		} else if (requestType == "forgot"){

			$("#form-forgot").removeClass("visibilityHidden");

			$("#form-forgot-button").click(function(){

				console.log("Sending reset request to server . . .");

				$("#form-forgot-button").prop("disabled", true);
				$("#error_forgot").addClass("VisibilityHiddenAbsolute");

				$.ajax({
					type: "POST",
					url: "assets/php/Verify.php",
					data: "request=forgot&" + $("#form-forgot").serialize(),
					success: function(response) {
						if (response.startsWith("success-")){
							var email = response.replace("success-", "");
							$("#form-forgot").addClass("visibilityHidden");
							$("#form-activate").removeClass("visibilityHidden");
							$("#error_activate").text("An email has been sent to " + email + " with instructions on how to reset your password.");
						} else {
							$("#error_forgot").removeClass("VisibilityHiddenAbsolute");
							$("#error_forgot").text(response);
							$("#form-forgot-button").prop("disabled", false);
						}
						
					}

				});

			})

		} else if (requestType == "reset"){

			$("#form-reset").removeClass("visibilityHidden");

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
						if (response == "success"){
							$("#form-reset").addClass("visibilityHidden");
							$("#form-activate").removeClass("visibilityHidden");
							$("#error_activate").text("Your email was successfully reset.");
							$("#activate-go-to-dashboard").removeClass("VisibilityHiddenAbsolute");
						} else {
							$("#error_reset").removeClass("VisibilityHiddenAbsolute");
							$("#error_reset").text(response);
							$("#form-reset-button").prop("disabled", false);
						}
						
					}

				});

			})



		}
	}

	$("#activate-go-to-dashboard").click(function(){

		$.ajax({
			type: "POST",
			url: "assets/php/getSession.php",
			data: "request=getSession",
			success: function(response) {
				if (response != false){
					window.location = "http://www.team5599.com/Account.html";
				} else {
					window.location = "http://www.team5599.com/SignIn.html";
				}
			}

		});

	})

}

function handleContactsPage(){

	console.log("Loading Contacts . . .");

	$.ajax({
		type: "POST",
		url: "assets/php/getPageData.php",
		data: "request=contactData",
		success: function(response) {
			console.log("Session: " + response);

			var contactsObject = JSON.parse(response);

			//
			var contactContainer = $("#contactInfoList");

			contactContainer.empty();

			for (contact in contactObject){

				var contactBox = $("#contactInfoDiv-Template").clone();

				$(contactBox).children("#name").html("<strong>"+contactObject[contact].name+"</strong>");
				$(contactBox).children("#contact").text(contactObject[contact].contact);

				$(contactBox).attr("id", contactObject[content].content);

				$(contactBox).appendTo(contactContainer);

			}
		}
	});


}

function handleRobotsPage(){


	var localData = [
		{
			title	: "Pied Piper",
			season 	: "2015",
			type 	: "FRC",

			image 	: "",
			description : ["Pied Piper was Team 5599's robot for the 2015 season, FIRST Recycle Rush. Pied Piper was capable of lifting and manuevering totes and garbage bins. The robot was named by the team's captain, Tanoy Sarkar.", "This robot helped the team win the Rookie Inspiration Award at the New York City Regional Competition and the Future Glory Award at the Brunswick Eruption Off-season competition."],

			revealVideos 	: ["https://www.youtube.com/watch?v=_-0VbFqoipo"],

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

			revealVideos 	: ["https://www.youtube.com/watch?v=oVSD8OBbLaM", "https://www.youtube.com/watch?v=PdjCbOFEjpI"],
			
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

			revealVideos 	: ["https://www.youtube.com/watch?v=1CLYCoHTwPQ"],
			
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

			revealVideos 	: [],
			
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

			competitionRecordings : {
				"SeaPerch 2018" : ""
			},

			image 	: "",
			description : ["Barabara was the BNCHS Robotics Team's robot for the 2017 SeaPerch underwater robotics competition. She placed 3rd in the team's first season."],

		},
	];

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

	function loadRobotData(id){

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

				var buildCarouselHTML_prepend = '<div data-ride="carousel" data-interval="false" data-pause="false" class="carousel slide" id="robot-reveal-videos-carousel"> <div role="listbox" class="carousel-inner" id="robot-reveal-slides">';
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
				buttonHTML = "<button class=\"btn btn-" + typeColor + " match-playlist-item\" type=\"button\">" + competition + "</button>";
			}

			$("#match-playlist").append(buttonHTML);
		}
	}

	$("#robot-buttons").children().each(function(){
		$(this).click(function(){

			var id = $(this).attr("id");
			loadRobotData(id);
			scrollToElement("#robot-info-main");

		})
	})

	loadRobotData(localData[0].type + "_" + localData[0].title);

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

					"Hansen Pan" : {
						"Titles" : ["Captain", "Head of Mechanics"],
						"Duration" : "2016-2018",
					},

					"Danielle Louie" : {
						"Titles" : ["Co-Captain", "Director of Marketing"],
						"Duration" : "2015-2018",
					},

					"Nazifa Prapti" : {
						"Titles" : ["Co-Head of Electronics"],
						"Duration" : "2016-2018",
					},

					"Max Menes" : {
						"Titles" : ["Co-Head of Eletronics"],
						"Duration" : "2014-2018",
					},

					"Jeff Chan" : {
						"Titles" : ["Co-Head of Programming"],
						"Duration" : "2016-2018",
					},

					"Ananta Sharma" : {
						"Titles" : ["Co-Head of Programming"],
						"Duration" : "2016-2018",
					},

					"Andrew Lin" : {
						"Titles" : ["Head of CAD", "Board Member"],
						"Duration" : "2016-2018",
					},

				},
				"Mentors" : {
					"Bernard Haggerty" : {
						"Titles" : ["Lead Mentor", "Coach"],
						"Duration" : "2014-present",
					},
					"Joseph Pugliese" : {
						"Titles" : ["Mentor"],
						"Duration" : "2014-present",
					},
					"Mr. C" : {
						"Titles" : ["Mentor"],
						"Duration" : "2016-present",
					},
					"Tanoy Sarkar" : {
						"Titles" : ["Founder", "Mentor"],
						"Duration" : "2017-present",
					},
					"Kelin Qu" : {
						"Titles" : ["Founder", "Mentor"],
						"Duration" : "2017-present",
					},
					"Michael Rooplall" : {
						"Titles" : ["Mentor", "Webmaster"],
						"Duration" : "2017-present",
					},
					"Jaime Baek" : {
						"Titles" : ["Mentor"],
						"Duration" : "2017-present",
					},
					"Jin Chai" : {
						"Titles" : ["Mentor"],
						"Duration" : "2017-present",
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
		$("#TeamHistoryList").empty();
		$("#TeamHistoryBox_Mentors").empty();

		if (leadershipJsonObject.hasOwnProperty(year)) {

			var leaders = leadershipJsonObject[year].Leadership;

			for (leaderName in leaders) {

				var personBox = personDisplayObject.clone();

				var personBoxContent = $(personBox).children("#PersonDisplayContent");
				var personBoxLinks = $(personBox).children("#PersonDisplayLinks");

				$(personBoxContent).children("#PersonDisplayName").text(leaderName);
				$(personBoxContent).children("#PersonDisplayTitles").html(leaders[leaderName].Titles.join("<br />"));
				$(personBoxContent).children("#PersonDisplayInfo").text(leaders[leaderName].Duration);

				$(personBox).attr("id", "PersonDisplayBox_"+leaderName);

				$(personBox).appendTo($("#TeamHistoryBox"));
				

			}

			var mentors = leadershipJsonObject[year].Mentors;

			for (mentorName in mentors){

				var personBox = personDisplayObject.clone();

				var personBoxContent = $(personBox).children("#PersonDisplayContent");
				var personBoxLinks = $(personBox).children("#PersonDisplayLinks");

				$(personBoxContent).children("#PersonDisplayName").text(mentorName);
				$(personBoxContent).children("#PersonDisplayTitles").html(mentors[mentorName].Titles.join("<br />"));
				$(personBoxContent).children("#PersonDisplayInfo").text(mentors[mentorName].Duration);

				$(personBox).attr("id", "PersonDisplayBox_"+mentorName);

				$(personBox).appendTo($("#TeamHistoryBox_Mentors"));
			}

		} else {
			console.log("We don't have any data for that year! Sorry!");

			var noDataMessage = $("<p class=\"text-center\"></p>").text("\tSorry, we don't have any data for that year!");
			$("#TeamHistoryBox").append(noDataMessage);

		}

		var population = ["Michael Rooplall", "Valerie Macias", "Kelin Qu", "Tanoy Sarkar", "Alice Shao", "Danielle Louie", "Hansen Pan", "Jin Chai", "Nazifa Prapti", "Jaime 'Lucius Mercier' Baek", "Jeff Chan", "Names to be pulled from Google Sheets attendance", "And sorted alphabetically"];

		// Populate with all our students
		for (member in population){
			$("#TeamHistoryList").append("<p class=\"team-member noselect\">" + population[member] + "</p>");
		}

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

//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////


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
			contentPadding = (windowWidth - 1200)/2
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
		$('.navbar').removeClass("navbar-fixed-top");
		$('.navbar').addClass("navbar-static-top");
		$('.navbar-nav').addClass("navbar-mobile");
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
