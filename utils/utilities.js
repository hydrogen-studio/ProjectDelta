exports.formatTime = function(d) {
	let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	let day = days[d.getDay()];
	let hr = d.getHours();
	let min = d.getMinutes();
	if (min < 10) {
		min = "0" + min;
	}
	let ampm = 'am';
	if( hr > 12 ) {
		hr -= 12;
		ampm = 'pm';
	}
	let date = d.getDate();
	let month = months[d.getMonth()];
	let year = d.getFullYear();
	return day + ', ' + hr + ':' + min + ampm + ', ' + month + ' ' + date + ', ' + year;
}

exports.checkPremium = function(interaction, client){
	return client.guilds.cache.get("1052444692672937984").roles.cache.get("1052664029107191842").members.has(interaction.user.id)
}