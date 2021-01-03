const axios = require('axios');
const halo_api = "https://www.haloapi.com"
const api_key = require('../../config').haloApiKey;

axios.defaults.headers = {
	'Content-Type': 'application/json',
	'Ocp-Apim-Subscription-Key': api_key
}

// Get Company Information based on a Gamertag or Company ID
const getCompanyInfo = async (gamertag, company_id = null) => {
	if (!company_id) {
		let data = await getCompany(gamertag);
		company_id = await data.Company.Id;
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

module.exports = { getCompany, getCompanyInfo }