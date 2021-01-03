const axios = require('axios');
const halo_api = "www.haloapi.com"
const api_key = process.env.HALO_API_KEY;

axios.defaults.headers = {
       'Content-Type': 'application/json',
       'Ocp-Apim-Subscription-Key': api_key
   }

function getCompanyInfo(company_id) {
	// TODO

}

// Get Company Object based on a Gamertag
export function getCompany(player) {
	axios.get(`${halo_api}/profile/h5/profiles/${player}/appearance`)
	.then(response => {
	console.log(response);
	})
	.catch(error => {
	console.log(error);
	})
}
