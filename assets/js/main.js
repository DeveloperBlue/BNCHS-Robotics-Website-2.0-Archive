
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
		handleSliders();
	} else if (pageIndex == "Team.html"){
		handleTeamPage();
	} else if (pageIndex == "Robots.html"){
		handleRobotsPage();
	} else if ((pageIndex == "SignIn.html") || (pageIndex == "SignUp.html") || (pageIndex == "Account.html") || (pageIndex == "WebsiteManager.html")){
		checkLocation();
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
	} else if (pageIndex == "Projects.html" || pageIndex == "Calendar.html" || pageIndex == "AdminPanel.html"){
		$("#CommunityResourcesNavButton").addClass("active");
	} else if (pageIndex == "Sponsors.html" || pageIndex == "OurSponsors.html"){
		$("#SponsorsNavButton").addClass("active");
	} else if (pageIndex == "ContactUs.html"){
		$("#ContactNavButton").addClass("active");
	} else if ((pageIndex == "SignIn.html") || (pageIndex == "SignUp.html") || (pageIndex == "Forgot.html") || (pageIndex == "Feed.html") || (pageIndex == "WebsiteManager.html")){
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

			var noDataMessage = $("<p></p>").text("\tSorry, we don't have any data for that year!");
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

			console.log("H: " + height);
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

		$('.splashContent').css("height", splashContentHeight + "px");
		$('.splashContentHalf').css("height", (splashContentHeight/2) + "px");
		$('.paralax').css('padding-top', paralaxPadding+"%");
		$('.paralaxHalf').css('padding-top', (paralaxPadding/2)+"%");
		
		var splashContentHeaderLogoPush = Math.round((splashContentHeight*2/3) - ($('.splashContentHeader').height())/2);
		var splashContentHeaderLogoPushHalf = Math.round(((splashContentHeight/2)*2/3) - ($('.splashContentHeader').height())/2);
		$('.splashContentHeader').css('top', splashContentHeaderLogoPush + "px");
		$('.splashContentHeaderHalf').css('top', splashContentHeaderLogoPushHalf + "px");

		scrollUpdate();
	}
}
