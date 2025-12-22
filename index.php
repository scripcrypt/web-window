<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200">
	<link rel="stylesheet" href="sweWindow.css">
	<script defer src="sweWindow.js"></script>
	<script defer src="test-sweWindow.js"></script>
	<title>SWE-Window</title>
</head>
<body>
	<div id="screen-ctrl" style="margin-left: 5px;">
		<button id="screenResize">Resize</button>
		<button id="showWinById">show winById</button>
		<button id="focus" target='xxx', action="focus">focus</button>
		<button id="maximize" target='xxx', action="maximize">maximize</button>
		<button id="minimize" target='xxx', action="minimize">minimize</button>
		<button id="close" target='xxx', action="close">close</button>
		<button id="newwwindow7" target='xxx', action="close">new window 7</button>
		<br>
		<input id="windowId" style="width:150px;">
		<button action="windowFocus">focus</button>
		<button action="windowmaximize">maximize</button>
		<button action="windowminimize">minimize</button>
		<button action="windowclose">close</button>
		<button action="newwindow15">new window 15</button>
	</div>
	<div id="screen" class="sweScreen">
<?php require("window_content_1.html"); ?>
<?php require("window_content_2.html"); ?>
<?php require("window_frame_3.html"); ?>
<?php require("window_content_4.html"); ?>
<?php require("window_frame_6.html"); ?>
	</div>
	<script>
		window.addEventListener('load', function () {

			const screens = document.querySelectorAll(".sweScreen");

			if (screens.length > 0) {
				screens.forEach(ssr => {
					console.log("ssr", ssr);
					ssr.sweScreens = new sweScreen(ssr, { onFocus: focusWindow });
				});
			}

		});
	</script>
</body>
</html> 
