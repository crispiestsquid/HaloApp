const axios = require('axios');
const achillesCommendations = require('./statics/achilles_commendations');
const company_metadata = require('./metadata/halo_company_comm_metadata.json');
const halo_api = "https://www.haloapi.com";
const api_key = require('../../config').haloApiKey;

axios.defaults.headers = {
	'Content-Type': 'application/json',
	'Ocp-Apim-Subscription-Key': api_key
};

axiosRetry(axios, {
   retries: 3, // number of retries
   retryDelay: (retryCount) => {
     console.log(`retry attempt: ${retryCount}`);
     return retryCount * 10000; // time interval between retries
   },
   retryCondition: (error) => {
     // if retry condition is not specified, by default idempotent requests are retried
     return error.response.status === 503;
   },
});

const getCustomComm = async () => {
	// TODO: Placeholder for custom commendations we may add
};

const getCustomMetadata = async () => {
	// TODO: Placeholder for custom metadata we may add
};

// Return list of games in the past week
const getPlayerGames = async (player,increment=0,validGames=[]) => {
	let response = await axios.get(`${halo_api}/stats/h5/players/${player}/matches?modes=arena,warzone&include-times=true&start=${increment}`)
        .then (res => {
                return res.data;
        })
        .catch( error => {
		console.log("error")
                return error;
        });


	// Filter only games that occurred within previous week
	let counter = 0;
	for (i = 0; i < response.Results.length; i++){
		candidate = response.Results[i]
		let d = new Date();
		let sevenDaysAgo = d.setDate(d.getDate() - 7);
		sevenDaysAgo = new Date(sevenDaysAgo).toISOString();
		if (new Date(candidate.MatchCompletedDate.ISO8601Date) > new Date(sevenDaysAgo)){
			console.log(new Date(candidate.MatchCompletedDate.ISO8601Date))
			validGames.push(candidate);
			counter++;
		}
	}
	// Can only grab 25 games at a time; Keep checking until all valid games are examined (i.e. less than 25 are returned)
	if (counter == 25){
		return getPlayerGames(player,increment+25,validGames);
	} else {
		return validGames;
	}
}

const getPlayerContribs = async (players) => {
	let playerJson = {};
	for (i = 0; i < players.length; i++){
		let player = players[i].Player.Gamertag;
		let playerGames = await getPlayerGames(player);
	}

}

// Get Progress to Achilles
const getAchillesProg = async (commendations, milestone = 'helmet') => {
	let requiredCommendations = [];
	let nameIdMap = {};
	let offset = 1;

	if (milestone != 'helmet'){
		offset = 3;
	}

	// filter only to relevant Achilles commendations
	for (i = 0; i < achillesCommendations.length; i++) {
		let achillesComm = achillesCommendations[i];
		// Our metadata uses names as keys; this is to keep track of id -> name mappings; used later
		nameIdMap[company_metadata[achillesComm]['id']] = achillesComm;
		requiredCommendations.push(commendations['ProgressiveCommendations'].filter(item => item.Id == company_metadata[achillesComm]['id'])[0]);
	}

	// Separate completed commendations and still needed
	let completedCommendations = [];
	let neededCommendations = [];
	for (i = 0; i < requiredCommendations.length; i++) {
		let comm = requiredCommendations[i];
		let commName = nameIdMap[comm.Id];
		let achillesComm = company_metadata[commName];
		// Curate our returned data somewhat; Ignore levels of commendations
		let data = {
			"Name": commName,
			"Progress": comm.Progress,
			"Id": comm.Id,
			"Threshold": achillesComm.levels[achillesComm.levels.length - offset].threshold
		}
		if (data.Progress < data.Threshold) {
			neededCommendations.push(data);
		} else {
			completedCommendations.push(data);
		}
	};
	console.log(neededCommendations.length);
	return {'neededCommendations': neededCommendations, 'completedCommendations': completedCommendations};
};

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
	return response;
};

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
};

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
};

module.exports = { getCompany, getCompanyInfo, getCompanyComm, getAchillesProg, getPlayerContribs };
