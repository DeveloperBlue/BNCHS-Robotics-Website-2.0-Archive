<?php

// Register.php

require 'db.php';
session_start();

$_SESSION["email"] = $mysqli->escape_string($_POST["email"]);
$_SESSION["OSIS"] = intval($mysqli->escape_string($_POST["OSIS"]));

// Escale variables to protect against SQL injections

$email = $mysqli->escape_string($_POST["email"]);

$password = $mysqli->escape_string($_POST["password"]);
$password_re = $mysqli->escape_string($_POST["password-re"]);
$activation_key = $mysqli->escape_string( md5 ( rand(0, 1000)));

$first_name = $mysqli->escape_string($_POST["firstname"]);
$last_name = $mysqli->escape_string($_POST["lastname"]);

$OSIS = intval($mysqli->escape_string($_POST["OSIS"]));
$OSIS_re = intval($mysqli->escape_string($_POST["OSIS-re"]));

$email_lower = strtolower($email);



$result = $mysqli->query("SELECT * FROM users WHERE osis= '$OSIS' OR email= '$email_lower' LIMIT 1") or die();
$existing_user = mysqli_fetch_assoc($result);

$email = filter_var($email, FILTER_SANITIZE_EMAIL);

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
	echo '{"status": 400, "message":"Invalid email address. Please check the email address you have entered. ' . $email . '"}';
	die();
}

if ($password !== $password_re){
	echo '{"status": 400, "message":"Password mismatch. Please check the passwords you have entered."}';
	die();
}

$password = password_hash($password, PASSWORD_BCRYPT);

if (strlen($OSIS) != 9){
	echo '{"status": 400, "message":"Invalid Student ID. Please double check the Student ID you have entered."}';
	die();
}

if ($OSIS !== $OSIS_re){
	echo '{"status": 400, "message":"Student ID mismatch. Please check that you have entered your Student ID correctly twice"}';
	die();
}

if ($existing_user){

	$confirmed = $user['active'];
	$confirmed_email = $user['email'];

	if (intval($user['osis']) === intval($osis)){
		if ($confirmed == 0){
			echo '{"status": 400, "message": "An account with this Student ID already exists.  Check your email ' . $confirmed_email . ' to activate your account."}';
		} else {
			echo '{"status": 400, "message": "An account with this Student ID already exists."}';
		}
		
		die();
	}

	if (strtolower($user['email']) === $email_lower){
		if ($confirmed == 0){
			echo '{"status": 400, "message": "An account with this email address already exists. Check your email ' . $confirmed_email . ' to activate your account. You may need to look in your spam folder."}';
		} else {
			echo '{"status": 400, "message": "An account with this Student ID already exists."}';
		}
		die();
	}
} else {

	$sql_query = "INSERT INTO users (email, osis, password, first_name, last_name, active, activation_key, facebook_auth, discord_auth)"
		. "VALUES ('$email_lower', '$OSIS', '$password', '$first_name', '$last_name', 0, '$activation_key', 0, 0 )";

	if ($mysqli->query($sql_query)){

		$_SESSION['logged_in'] = true;
		$_SESSION['active'] = 0;
		// echo "A confirmation email has been sent to ".$email.", please verify your account by clicking the link in the message.";

		// Send confirmation message link (verify.php)

		$to = $email;
		$from = 'accounts@team5599.com';
		$subject = "Account Verification - Cardozo Robotics - Team 5599 - The Sentinels";

		$headers  = 'MIME-Version: 1.0' . "\r\n";
		$headers .= 'Content-type: text/html; charset=iso-8859-1' . "\r\n";
		$headers .= 'From: '.$from."\r\n".
   					'Reply-To: '.$from."\r\n" .
   					'X-Mailer: PHP/' . phpversion();

		$activation_url = 'http://www.team5599.com/Verify.html?request=verify&osis='.$OSIS.'&key='.$activation_key;

		$message_body = '
		<!DOCTYPE html>
		<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
		<head>
		    <meta charset="utf-8"> <!-- utf-8 works for most cases -->
		    <meta name="viewport" content="width=device-width"> <!-- Forcing initial-scale shouldn\'t be necessary -->
		    <meta http-equiv="X-UA-Compatible" content="IE=edge"> <!-- Use the latest (edge) version of IE rendering engine -->
		    <meta name="x-apple-disable-message-reformatting">  <!-- Disable auto-scale in iOS 10 Mail entirely -->
		    <title>Activate Your Account</title> <!-- The title tag shows in email notifications, like Android 4.4. -->

		    <!-- Web Font / @font-face : BEGIN -->
		    <!-- NOTE: If web fonts are not required, lines 10 - 27 can be safely removed. -->

		    <!-- Desktop Outlook chokes on web font references and defaults to Times New Roman, so we force a safe fallback font. -->
		    <!--[if mso]>
		        <style>
		            * {
		                font-family: sans-serif !important;
		            }
		        </style>
		    <![endif]-->

		    <!-- All other clients get the webfont reference; some will render the font and others will silently fail to the fallbacks. More on that here: http://stylecampaign.com/blog/2015/02/webfont-support-in-email/ -->
		    <!--[if !mso]><!-->
		    <!--<![endif]-->

		    <!-- Web Font / @font-face : END -->

		    <!-- CSS Reset : BEGIN -->
		    <style>

		        /* What it does: Remove spaces around the email design added by some email clients. */
		        /* Beware: It can remove the padding / margin and add a background color to the compose a reply window. */
		        html,
		        body {
		            margin: 0 auto !important;
		            padding: 0 !important;
		            height: 100% !important;
		            width: 100% !important;
		        }

		        /* What it does: Stops email clients resizing small text. */
		        * {
		            -ms-text-size-adjust: 100%;
		            -webkit-text-size-adjust: 100%;
		        }

		        /* What it does: Centers email on Android 4.4 */
		        div[style*="margin: 16px 0"] {
		            margin: 0 !important;
		        }

		        /* What it does: Stops Outlook from adding extra spacing to tables. */
		        table,
		        td {
		            mso-table-lspace: 0pt !important;
		            mso-table-rspace: 0pt !important;
		        }

		        /* What it does: Fixes webkit padding issue. Fix for Yahoo mail table alignment bug. Applies table-layout to the first 2 tables then removes for anything nested deeper. */
		        table {
		            border-spacing: 0 !important;
		            border-collapse: collapse !important;
		            table-layout: fixed !important;
		            margin: 0 auto !important;
		        }
		        table table table {
		            table-layout: auto;
		        }

		        /* What it does: Prevents Windows 10 Mail from underlining links despite inline CSS. Styles for underlined links should be inline. */
		        a {
		            text-decoration: none;
		        }

		        /* What it does: Uses a better rendering method when resizing images in IE. */
		        img {
		            -ms-interpolation-mode:bicubic;
		        }

		        /* What it does: A work-around for email clients meddling in triggered links. */
		        *[x-apple-data-detectors],  /* iOS */
		        .unstyle-auto-detected-links *,
		        .aBn {
		            border-bottom: 0 !important;
		            cursor: default !important;
		            color: inherit !important;
		            text-decoration: none !important;
		            font-size: inherit !important;
		            font-family: inherit !important;
		            font-weight: inherit !important;
		            line-height: inherit !important;
		        }

		        /* What it does: Prevents Gmail from displaying a download button on large, non-linked images. */
		        .a6S {
		           display: none !important;
		           opacity: 0.01 !important;
		       }
		       /* If the above doesn\'t work, add a .g-img class to any image in question. */
		       img.g-img + div {
		           display: none !important;
		       }

		        /* What it does: Removes right gutter in Gmail iOS app: https://github.com/TedGoas/Cerberus/issues/89  */
		        /* Create one of these media queries for each additional viewport size you\'d like to fix */

		        /* iPhone 4, 4S, 5, 5S, 5C, and 5SE */
		        @media only screen and (min-device-width: 320px) and (max-device-width: 374px) {
		            .email-container {
		                min-width: 320px !important;
		            }
		        }
		        /* iPhone 6, 6S, 7, 8, and X */
		        @media only screen and (min-device-width: 375px) and (max-device-width: 413px) {
		            .email-container {
		                min-width: 375px !important;
		            }
		        }
		        /* iPhone 6+, 7+, and 8+ */
		        @media only screen and (min-device-width: 414px) {
		            .email-container {
		                min-width: 414px !important;
		            }
		        }

		    </style>
		    <!-- CSS Reset : END -->
			<!-- Reset list spacing because Outlook ignores much of our inline CSS. -->
			<!--[if mso]>
			<style type="text/css">
				ul,
				ol {
					margin: 0 !important;
				}
				li {
					margin-left: 30px !important;
				}
				li.list-item-first {
					margin-top: 0 !important;
				}
				li.list-item-last {
					margin-bottom: 10px !important;
				}
			</style>
			<![endif]-->

		    <!-- Progressive Enhancements : BEGIN -->
		    <style>

		        /* What it does: Hover styles for buttons */
		        .button-td,
		        .button-a {
		            transition: all 100ms ease-in;
		        }
			    .button-td-primary:hover,
			    .button-a-primary:hover {
			        background: #555555 !important;
			        border-color: #555555 !important;
			    }

		        /* Media Queries */
		        @media screen and (max-width: 600px) {

		            .email-container {
		                width: 100% !important;
		                margin: auto !important;
		            }

		            /* What it does: Forces elements to resize to the full width of their container. Useful for resizing images beyond their max-width. */
		            .fluid {
		                max-width: 100% !important;
		                height: auto !important;
		                margin-left: auto !important;
		                margin-right: auto !important;
		            }

		            /* What it does: Forces table cells into full-width rows. */
		            .stack-column,
		            .stack-column-center {
		                display: block !important;
		                width: 100% !important;
		                max-width: 100% !important;
		                direction: ltr !important;
		            }
		            /* And center justify these ones. */
		            .stack-column-center {
		                text-align: center !important;
		            }

		            /* What it does: Generic utility class for centering. Useful for images, buttons, and nested tables. */
		            .center-on-narrow {
		                text-align: center !important;
		                display: block !important;
		                margin-left: auto !important;
		                margin-right: auto !important;
		                float: none !important;
		            }
		            table.center-on-narrow {
		                display: inline-block !important;
		            }

		            /* What it does: Adjust typography on small screens to improve readability */
		            .email-container p {
		                font-size: 17px !important;
		            }
		        }

		    </style>
		    <!-- Progressive Enhancements : END -->

		    <!-- What it does: Makes background images in 72ppi Outlook render at correct size. -->
		    <!--[if gte mso 9]>
		    <xml>
		        <o:OfficeDocumentSettings>
		            <o:AllowPNG/>
		            <o:PixelsPerInch>96</o:PixelsPerInch>
		        </o:OfficeDocumentSettings>
		    </xml>
		    <![endif]-->

		</head>
		<!--
			The email background color (#222222) is defined in three places:
			1. body tag: for most email clients
			2. center tag: for Gmail and Inbox mobile apps and web versions of Gmail, GSuite, Inbox, Yahoo, AOL, Libero, Comcast, freenet, Mail.ru, Orange.fr
			3. mso conditional: For Windows 10 Mail
		-->
		<body width="100%" style="margin: 0; padding: 0 !important; mso-line-height-rule: exactly; background-color: #1E6C93;">    <center style="width: 100%; background-color: #1E6C93;">
		    <!--[if mso | IE]>
		    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #222222;">
		    <tr>
		    <td>
		    <![endif]-->

		        <!-- Visually Hidden Preheader Text : BEGIN -->
		        <div style="display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif;">
		            Activate your account for www.team5599.com! Welcome to the BNCHS Sentinels!
		        </div>
		        <!-- Visually Hidden Preheader Text : END -->

		        <!-- Create white space after the desired preview text so email clients don’t pull other distracting text into the inbox preview. Extend as necessary. -->
		        <!-- Preview Text Spacing Hack : BEGIN -->
		        <div style="display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif;">
			        &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
		        </div>
		        <!-- Preview Text Spacing Hack : END -->

		        <!-- Email Body : BEGIN -->
		        <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto;" class="email-container">
			        <!-- Email Header : BEGIN -->
		            <tr>
		                <td style="padding: 20px 0; text-align: center">
		                    <img src="https://i.imgur.com/VGEf0V7.png" width="140" height="140" alt="alt_text" border="0" style="height: auto; background: #dddddd; font-family: sans-serif; font-size: 15px; line-height: 15px; color: #555555;">
		                </td>
		            </tr>
			        <!-- Email Header : END -->

		            <!-- Hero Image, Flush : BEGIN -->
		            <tr>
		                <td style="background-color: #ffffff;">
		                    <img src="https://i.imgur.com/kyQa0kT.jpg" width="600" height="" alt="alt_text" border="0" style="width: 100%; max-width: 600px; height: auto; background: #dddddd; font-family: sans-serif; font-size: 15px; line-height: 15px; color: #555555; margin: auto;" class="g-img">
		                </td>
		            </tr>
		            <!-- Hero Image, Flush : END -->

		            <!-- 1 Column Text + Button : BEGIN -->
		            <tr>
		                <td style="background-color: #ffffff;">
		                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
		                        <tr>
		                            <td style="padding: 20px; font-family: sans-serif; font-size: 15px; line-height: 20px; color: #555555;">
		                                <h1 style="margin: 0 0 10px; text-align: center; font-size: 25px; line-height: 30px; color: #333333; font-weight: normal;">Activate Your Account</h1>
		                                <br>

		                                <h3 style="margin: 0 0 10px; font-size: 20px; line-height: 30px; color: #333333; font-weight: normal;">Hello ' . $first_name . ',</h3>
		                                
		                                <p style="margin: 0 0 10px;">Thank you for creating an account at www.team5599.com.</p>
		                                <p style="margin: 0 0 10px;">This account with grant you access to useful information you may need throughout the season and for your duration on the team.</p>
		                                <br>
		                                <p style="margin: 0 0 10px;">Please continue reading to activate your account.</p>
		                                <br>
		                                <p style="margin: 0 0 10px;">This includes:</p>
		                                <ul style="padding: 0; margin: 0; list-style-type: disc;">
											<li style="margin:0 0 10px 20px;">Tracking your attendance</li>
											<li style="margin:0 0 10px 20px;">Access to our Discord Server</li>
											<li style="margin:0 0 10px 20px;">Google+ Calendar</li>
											<li style="margin:0 0 10px 20px;">Dropbox and GitHub Access</li>
											<li style="margin:0 0 10px 20px;">SolidWorks Keys</li>
											<li style="margin:0 0 10px 20px;">Access to hundreds of other resources</li>
										</ul>
										<br><br>
										 <p style="margin: 0 0 10px; text-align: center">Click the link below to activate your account.</p>
		                            </td>
		                        </tr>
		                        <tr>
		                            <td style="padding: 0 20px 20px;">
		                                <!-- Button : BEGIN -->
		                                <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: auto;">
		                                    <tr>
		                                        <td class="button-td button-td-primary" style="border-radius: 4px; background: #222222;">
													<a class="button-a button-a-primary" href="' . $activation_url . '" style="background: #1E6C93; border: 1px solid #164e6a; font-family: sans-serif; font-size: 15px; line-height: 15px; text-decoration: none; padding: 13px 17px; color: #ffffff; display: block; border-radius: 2px; box-shadow: inset 0px -1px 0px rgba(255,255,255,.3);">Activate My Account</a>
												</td>
		                                    </tr>
		                                </table>
		                                <!-- Button : END -->
		                            </td>
		                        </tr>

		                    </table>
		                </td>
		            </tr>
		            <!-- 1 Column Text + Button : END -->

			        <!-- 1 Column Text : BEGIN -->
			        <tr>
			            <td style="background-color: #ffffff;">
			                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
			                    <tr>
			                        <td style="padding: 20px; text-align: center; font-family: sans-serif; font-size: 15px; line-height: 20px; color: #555555;">
			                            If the button fails to work, you can copy and paste the following URL into your browser.
			                            <br>
			                            <a style="color: #FF6A00;" href="' . $activation_url . '">' . $activation_url . '</a>
			                        </td>
			                    </tr>
			                </table>
			            </td>
			        </tr>
			        <!-- 1 Column Text : END -->

			    </table>
			    <!-- Email Body : END -->

			    <!-- Email Footer : BEGIN -->
		        <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto;" class="email-container">
			        <tr>
			            <td style="padding: 20px; font-family: sans-serif; font-size: 12px; line-height: 15px; text-align: center; color: #888888;">
			                <webversion style="color: #cccccc; text-decoration: underline; font-weight: bold;">View as a Web Page</webversion>
			                <br><br>
			                The BNCHS Robotics Team<br><span class="unstyle-auto-detected-links">57-00 223rd St, Bayside, NY 11364<br>Sentinels@team5599.com</span>
			                <br><br>
			                <unsubscribe style="color: #888888; text-decoration: underline;">unsubscribe</unsubscribe>
			            </td>
			        </tr>
			    </table>
			    <!-- Email Footer : END -->

			    <!-- Full Bleed Background Section : BEGIN -->
			    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #FF6A00;">
			        <tr>
			            <td valign="top">
			                <div style="max-width: 600px; margin: auto;" class="email-container">
			                    <!--[if mso]>
			                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" align="center">
			                    <tr>
			                    <td>
			                    <![endif]-->
			                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
			                        <tr>
			                            <td style="padding: 20px; text-align: left; font-family: sans-serif; font-size: 15px; line-height: 20px; color: #ffffff;">
			                                <p style="margin: 0;">The Benjamin N. Cardozo High School Robotics Team - The Sentinels - FRC 5599</p>
			                            </td>
			                        </tr>
			                    </table>
			                    <!--[if mso]>
			                    </td>
			                    </tr>
			                    </table>
			                    <![endif]-->
			                </div>
			            </td>
			        </tr>
			    </table>
			    <!-- Full Bleed Background Section : END -->

		    <!--[if mso | IE]>
		    </td>
		    </tr>
		    </table>
		    <![endif]-->
		    </center>
		</body>
		</html>
		';

		if (mail( $to, $subject, $message_body, $headers)){
			
			echo '{"status": 200}';
			//header("Location: http://www.team5599.com/Verify.html?request=notify");

			die();

		} else {
			

			echo '{"status:" 400, "message": "An error occured when sending the activation email. Please try again."}';
			die();
		}

		

	} else {

		echo '{"status": 400, "message": "You fucked up."}';
		// echo '{"status": 400, "message":"An error has occured (' . sql_query . ') ' . mysqli_error($mysqli) . '"}';
		die();

	}

	mysqli_close($mysqli);
}

?>