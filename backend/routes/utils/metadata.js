const axios = require('../../utils/axios-helper');
const halo_api = "https://www.haloapi.com";
const static_things = require('./statics/achilles_commendations');

const getCustomMetadata = async () => {
	// TODO: Placeholder for custom metadata we may add
};

// Return formatted JSON object from Halo API with Commendation names as keys
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
	let response = await axios.get(`${halo_api}/metadata/h5/metadata/company-commendations`)
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

// Return formatted JSON object from Halo API with id as keys
// Ex:	   "6fd87bf0-a3c8-47f6-af0a-6523fafdf75d": {
//	        "type": "Progressive",
//	        "name": "Phaeton Gunship Gunner ",
//	        "description": "Kill enemy Spartans with a Phaeton Gunship",
//	        "iconImageUrl": "https://content.halocdn.com/media/Default/games/halo-5-guardians/commendation-icons/commendations_array098-937bc98009384a34b097573b4b80f509.png",
//	        "levels": [
//	            {
//	                "reward": {
//	                    "xp": 100,
//	                    "requisitionPacks": [],
//	                    "id": "be0d2a2d-ee4e-4554-8894-8d23ded1e4a3",
//	                    "contentId": "be0d2a2d-ee4e-4554-8894-8d23ded1e4a3"
//	                },
//	                "threshold": 5,
//	                "id": "052ba3ef-f9de-4233-8f86-499dd38a3a20",
//	                "contentId": "052ba3ef-f9de-4233-8f86-499dd38a3a20"
//	            },
//		...
const getSpartanCommMeta = async () => {
	let response = await axios.get(`${halo_api}/metadata/h5/metadata/commendations`)
	.then (res => {
		return res.data;
	})
	.catch( error => {
		return error;
	})
	let formatted_dict = {};
	response.forEach( (commendation) => {
		formatted_dict[commendation.id] = commendation;
	})

	return formatted_dict;
}

// Return formatted JSON object from Halo API with id as keys
// Ex: 		    "1638349322": {
//       		 "name": "Carrier Protected",
//       		 "description": "Save your Oddball carrier by killing his attacker",
//       		 "classification": "Oddball",
//       		 "difficulty": 0,
//       		 "spriteLocation": {
//       		     "spriteSheetUri": "https://content.halocdn.com/media/Default/games/halo-5-guardians/sprites/medals_10-26-17-1ed917479dd14818b09ef10e29ff60b1.png",
//       		     "left": 518,
//       		     "top": 148,
//       		     "width": 74,
//       		     "height": 74,
//       		     "spriteWidth": 2048,
//       		     "spriteHeight": 1024
//       		 },
//       		 "id": "1638349322",
//       		 "contentId": "84f70f06-8336-4323-9fc3-b914139b8c7a"
const getSpartanMedalMeta = async () => {
        let response = await axios.get(`${halo_api}/metadata/h5/metadata/medals`)
        .then (res => {
                return res.data;
        })
        .catch( error => {
                return error;
        })
        let formatted_dict = {};
        response.forEach( (commendation) => {
                formatted_dict[commendation.id] = commendation;
        })

        return formatted_dict;
}

module.exports = { getCompCommMeta,getSpartanCommMeta,getSpartanMedalMeta };
