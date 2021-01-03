const axios = require('axios');
const halo_api = "https://www.haloapi.com"
const api_key = process.env.HALO_API_KEY;

axios.defaults.headers = {
       'Content-Type': 'application/json',
       'Ocp-Apim-Subscription-Key': api_key
   }

const getCompanyInfo = async player => {
    let data = await getCompany(player);
    let company_id = data.Company.Id;
    let response = await axios.get(`${halo_api}/stats/h5/companies/${company_id}`)
	.then(res => {
	    return res.data;
	})
	.catch( error => {
	    return error;
	})
    return response;
}

// Get Company Object based on a Gamertag
const getCompany = async player => {
    let response = await axios.get(`${halo_api}/profile/h5/profiles/${player}/appearance`)
	.then(res => {
	    return res.data;
	})
	.catch(error => {
	    return error;
	})
    return response;
}

module.exports = { getCompany,getCompanyInfo }
