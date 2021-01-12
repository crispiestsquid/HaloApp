const axios = require('../../utils/axios-helper');
const halo_api = "https://www.haloapi.com";
const static_things = require('./statics/achilles_commendations');

const getCustomMetadata = async () => {
	// TODO: Placeholder for custom metadata we may add
};

// Return Formatted JSON object from Halo API with Commendation names as keys
// Ex:     "4 Little Spartans went out to play": {
//    		    "category": {
//    		        "contentId": "1e319878-93c1-41b0-b7bc-8219fe1e319f",
//    		        "iconImageUrl": null,
//    		        "id": "1e319878-93c1-41b0-b7bc-8219fe1e319f",
//    		        "name": "Game Mode",
//    		        "order": 3
//    		    },
//    		    "contentId": "6eb5140f-7243-4b5d-91da-1b24dbdc3324",
//    		    "description": "Win a match in any Breakout game type in matchmaking",
//    		    "iconImageUrl": "https://content.halocdn.com/media/Default/games/halo-5-guardians/spartan-company-commendation-icons/039-c9e2aab753594c678c7254133af1508e.png",
//    		    "id": "6eb5140f-7243-4b5d-91da-1b24dbdc3324",
//    		    ...
const getCompCommMeta = async () => {
	let response = await axios.get(`${halo_api}/metadata/h5/metadata/campaign-missions`)
	.then (res => {
		return res.data;
	})
	.catch( error => {
		return error;
	})
	let formatted_dict = {};
	response.forEach( (commendation) => {
		formatted_dict[commendation.name] = commendation;
	})
	return formatted_dict;
}

module.exports = { getCompCommMeta };
