const axios = require('axios');
const fs = require('fs');
const halo_api = "https://www.haloapi.com";
const api_key = process.env.HALO_API_KEY;
const metadata_path = `${__dirname}/metadata/halo_company_comm_metadata.json`;

axios.defaults.headers = {
	'Content-Type': 'application/json',
	'Ocp-Apim-Subscription-Key': api_key
}

const getCustomComm = async () => {
	// TODO: Placeholder for custom commendations we may add
}

const getCustomMetadata = async () => {
	// TODO: Placeholder for custom metadata we may add
}

// Get Progress to Achilles Helmet
const getHelmetProg = async (commendations) => { 
	let company_metadata = require(metadata_path);
	//let helmet_id = company_metadata["The sum is greater than the parts"].id;
	let requiredCommendations = company_metadata.filter(item => );
	let required_comms = (commendations["ProgressiveCommendations"]).filter(item => item.CompletedLevels.length < 5);
	let completed_comms = (commendations["ProgressiveCommendations"]).filter(item => item.CompletedLevels.length == 5);
	console.log(required_comms.length);
	console.log(completed_comms.length);

}

// Get progress to Achilles Armor
const getArmorProg = async (commendations) => { 
	// Check for Metadata
}

// Get Company Commendation Progress based on gamertag or Company ID 
const getCompanyComm = async (gamertag, company_id = null) => {
	if (!company_id) {
		let data = await getCompany(gamertag);
		company_id = data.Company.Id;
	}
	let response = await axios.get(`${halo_api}/stats/h5/companies/${company_id}/commendations`)
	.then (res => {
		return res.data;
	})
	.catch( error => {
		return error;
	});
	return response
}

// Get Company Information based on a Gamertag or Company ID
const getCompanyInfo = async (gamertag, company_id = null) => {
	if (!company_id) {
		let data = await getCompany(gamertag);
		company_id = data.Company.Id;
	}
	let response = await axios.get(`${halo_api}/stats/h5/companies/${company_id}`)
	.then(res => {
		return res.data;
	})
	.catch(error => {
		return error;
	});
	return response;
}

// Get Company Object based on a Gamertag
const getCompany = async gamertag => {
	let response = await axios.get(`${halo_api}/profile/h5/profiles/${gamertag}/appearance`)
	.then(res => {
		return res.data;
	})
	.catch(error => {
		return error;
	});
	return response;
}

module.exports = { getCompany, getCompanyInfo, getCompanyComm, getHelmetProg };
