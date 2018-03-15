window.onload = function () {

	// Executes when complete page is fully loaded, including all frames, objects and images

	var pageIndex = window.location.pathname.split("/").pop();

	if (pageIndex == "WebsiteManager.html"){

		console.log("LOADING WEBSITE MANAGER");

		sortable(".webmasterRobotPanel", {
			forcePlaceholderSize: true,
			placeholderClass: 'placeholderClass'
		});


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
					$(data).find("a:contains(" + ".jpg" + ")").each(function () {
						var filename = this.href.replace(window.location.host, "").replace("http://", "");
						$(".imageSelectorModalImages").append("<img src='" + dir + filename + "'>");
					});
				}
			});
		}



	}

};