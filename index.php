<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200">
	<link rel="stylesheet" href="sweWindow.css">
	<script defer src="sweWindow.js"></script>
	<title>SWE-Window</title>
</head>
<body>
	<div id="screen-ctrl" class="row">
		<button id="screenResize">Resize</button>
		<button id="showWinById">show winById</button>
		<button id="focus" target='xxx', action="focus">focus</button>
		<button id="maximize" target='xxx', action="maximize">maximize</button>
		<button id="minimize" target='xxx', action="minimize">minimize</button>
		<button id="close" target='xxx', action="close">close</button>
		<button id="newwwindow7" target='xxx', action="close">new window 7</button>
	</div>
	<div id="screen" class="sweScreen">
<?php require("window_content_1.html"); ?>
<?php require("window_content_2.html"); ?>
<?php require("window_frame_3.html"); ?>
<?php require("window_content_4.html"); ?>
<?php require("window_frame_6.html"); ?>
	</div>
	<script>
		var screen;
		window.addEventListener('load', function () {
			screen = document.querySelector("#screen");

			if (screen) {
				const screenCtrl = document.querySelector("#screen-ctrl");
				const btns = screenCtrl.querySelectorAll("button");

				if (btns.length > 0) {
					btns.forEach((btn)=>{
						btn.addEventListener("pointerdown", (e) => {
							console.log("btn",btn);
							console.log("id",btn.id);
							if (btn.id==="screenResize") {
								testScreenResize();
								return;
							}
							else if (btn.id === "showWinById") {
								screen.sweScreen.showWinById();
							}
							else if (btn.id==="newwwindow7") {
								newwwindow7();
								return;
							}
							const target = btn.getAttribute("target");
							const action = btn.getAttribute("action");
							if (!target || !action) return;
							screen.sweScreen.ctrlWin(target, action);
						});
					});
				}
			}
		});

		testScreenResize = () => {
			console.log("testScreenResize");
			if (screen.sweScreen.scNode.getAttribute("shrink")) {
				screen.sweScreen.scNode.style.setProperty("--width-padding", "200px");
				screen.sweScreen.scNode.removeAttribute("shrink");
			}
			else {
				screen.sweScreen.scNode.style.setProperty("--width-padding", "1000px");
				screen.sweScreen.scNode.setAttribute("shrink", true);
			}
		}

		newwwindow7 = () => {
			console.log("newwwindow7");

			screen.sweScreen.createWindow({
				windowId: "newwwindow7",
				windowTitle: "Fire TV Stickのリモコンがない！",
				rect: { width: 611, height: 600 },
				type: "article",
				focus: true,
				idDup: "replace",
				startStatus: "normal",
				flags: {
					resizable: true,
					movable: true,
					closable: true,
					minimizable: true,
					maximizable: true
				},
				content: {kind:"url", value:"window_content_7.html"},
				onReady: null,
				onClose: null,
			});
		}
	</script>
</body>
</html> 
