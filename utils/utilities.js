let fs = require("fs")
let { PATREON_API } = require("../config.json")
let axios = require("axios")
let qs = require("qs");

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

exports.checkPremium = async function(interaction, allowed){
	let file = JSON.parse(fs.readFileSync(__dirname + '/../premium.json').toString("utf8"));
	let userId = interaction.user.id;
	let premium = file[`premium-${userId}`] == undefined ? 0 : JSON.parse(file[`premium-${userId}`]);
	console.log(premium)
	let result = premium == undefined || premium.premium == false ? 0 : premium.type;
	if(result == allowed || result == 3){
		return true;
	}
	return false
}


exports.checkPremium = async function(userId){
	var config = {
	method: 'get',
	url: 'https://api.patreon.com/oauth2/v2/campaigns/9748539/members?include=currently_entitled_tiers,user&fields%5Btier%5D=title&fields%5Buser%5D=social_connections',
	headers: { 
		'Authorization': 'Bearer rv3rHgN-aB4iRit30Fqvlkax3D_gqZJWX4MGkgoACvQ', 
		'Cookie': '__cf_bm=qTYBQHleBVRoEkpTAn9aWT8VTUmdrEKWgf.XWWLnxng-1671217685-0-AZu3bm4rT1gANdHKqzZciRIn63Ad06xej2jd1c+PqOsuvQNpqQsEVrtweC1P0+pzS9hlPggDnMvAfCXovJPG1bR4z6une2h+YQ6WV2jRw8YE; patreon_device_id=bbc8956b-1b54-481d-8285-ed7046e4b9f6'
	}
	};
	let users
	let data = await axios(config)
	data = data.data
	let userTempDatas = data.data
	for(i in userTempDatas){
		let tempTierData = data.data[i].relationships.currently_entitled_tiers.data[0].id
		let tempUserData = data.data[i].relationships.user.data.id
		let tpTierData = data.included
		let tierName;
		let tier = {
			"ProjectDelta Server": [],
			"ProjectDelta User": [],
			"ProjectDelta Plus": []
		}
		for(j in tpTierData){
			if(tpTierData[j].type == "tier" && tpTierData[j].id == tempTierData){
				tierName = tpTierData[j].attributes.title
				tier[tpTierData[j].attributes.title] = []
			}
		}
		for(k in tpTierData){
			if(tpTierData[k].type == "user" && tpTierData[k].id == tempUserData){
				let temp = tier[tierName]
				temp.push(tpTierData[k].attributes.social_connections.discord.user_id)
				tier[tpTierData[j].attributes.title] = temp
			}
		}

		
		if(tier["ProjectDelta Server"].includes(userId.id)){
			console.log("hi")
			return 1
		}else if(tier["ProjectDelta User"].includes(userId.id)){
			return 2
		}if(tier["ProjectDelta Plus"].includes(userId.id)){
			return 3
		}else{
			return 0
		}
	}
}