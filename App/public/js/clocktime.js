$(document).ready(function() {
	var socket = io();
	console.log(socket);
	console.log("ready");
	reloadClockedIn();
	
	document.getElementById("clock").focus();
	$("#clock").change(function() {
		socket.emit("clockTime", $("#clock").val());
	});
	
	socket.on("clockTimeResponse", function(data){
		console.log(data);
		reloadClockedIn();
	});
	
	socket.on("getClockedInResponse", function(responses){
		var text = "";
		if(responses != undefined){
			console.log("response: " + responses);
			for(i = 0; i < responses.length; i++){
				text+="<span>" + responses[i].StartTime + " " + responses[i].FirstName + "</span><br>";
			}
			document.getElementById("clockedIn").innerHTML = text;
		}
	});
	
	function reloadClockedIn(){
		socket.emit("getClockedIn");
	}
});

