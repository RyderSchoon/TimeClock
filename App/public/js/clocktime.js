

$(document).ready(function() {
	var socket = io();
	console.log(socket);
	console.log("ready");
	document.getElementById("clock").focus();
	$("#clock").change(function() {
		console.log("change!!!");
		socket.emit("clock time", $("#clock").val());
	});
	
	socket.on("clocktimeresponse", function(data){
		console.log(data);
	});
});