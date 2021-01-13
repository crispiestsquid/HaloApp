const axios = require('../../utils/axios-helper');
const halo_api = "https://www.haloapi.com";
const static_things = require('./statics/achilles_commendations');
const playerImageUtils = require('./playerImage');
const metadataUtils = require('./metadata');

const getCustomComm = async () => {
	// TODO: Placeholder for custom commendations we may add
};

// Return list of games in the past week
const getPlayerGames = async (player,increment=0,validGames=[]) => {
	let response = await axios.get(`${halo_api}/stats/h5/players/${player}/matches?modes=arena,warzone&include-times=true&start=${increment}`)
        .then (res => {
                return res.data;
        })
        .catch( error => {
                return error;
        });

	// Filter only games that occurred within previous week
	let counter = 0;
	for (j = 0; j < response.Results.length; j++){
		candidate = response.Results[j]
		let d = new Date();
		let sevenDaysAgo = d.setDate(d.getDate() - 7);
		sevenDaysAgo = new Date(sevenDaysAgo).toISOString();
		if (new Date(candidate.MatchCompletedDate.ISO8601Date) > new Date(sevenDaysAgo)){
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

// Return match results 
const getMatchResults = async (game) => {
	if (game.Id.GameMode == 1) {
		return await axios.get(`${halo_api}/stats/h5/arena/matches/${game.Id.MatchId}`)
		.then (res => {
			return res.data;
		})
		.catch(error => {
			return error
		})
	} else if (game.Id.GameMode == 4) {
		return await axios.get(`${halo_api}/stats/h5/warzone/matches/${game.Id.MatchId}`)
		.then (res => {
			return res.data;
		})
		.catch(error => {
			return error;
		})
	
	} else {
		return "error"
	}
}

// Return JSON object of how much contribution a player has made in a game towards achilles commendations
const getGameContribs = async (game,player) => {
	let matchResults = await getMatchResults(game);
	matchResults = matchResults.PlayerStats;
	// Filter results to just target player
	let playerResults = matchResults.reduce((total,currentPlayer) => {
		if (currentPlayer.Player.Gamertag == player) {
			return currentPlayer;
		};
		return total
	});

	// Initialize dictionary
	let localAchilles = {}
	static_things.achillesCommendations.forEach((item) => { localAchilles[item] = 0});

	// Get achilles contribution by medals
	playerResults["MedalAwards"].forEach((medal) => {
		if (medal.MedalId in static_things.achillesMedals){
			localAchilles[static_things.achillesMedals[medal.MedalId]] += medal['Count'];
		}
	});

	// Get achilles contribution by stats
	for (let key in static_things.achillesStats){
		localAchilles[static_things.achillesStats[key]] += playerResults[key]
	};

	//// Get achilles contribution by commendations
	playerResults["ProgressiveCommendationDeltas"].forEach((delta) => {
		if (delta.Id in static_things.achillesCommDeltas){
			localAchilles[static_things.achillesCommDeltas[delta.Id]] += delta["Progress"] - delta["PreviousProgress"];
		}
	});
	
	return localAchilles;
}

// Return JSON object of player contributions
const getPlayerContribs = async (players) => {
	let playerJson = {};
	for (i = 0; i < players.length; i++){
		let player = players[i].Player.Gamertag;
		let playerGames = await getPlayerGames(player);
		playerJson[player] = {'Games': playerGames};
		playerJson[player]['Contributions'] = {};
		// initialize playerContributions dictionary
		static_things.achillesCommendations.forEach((item) => { playerJson[player]['Contributions'][item] = 0});
		gameCalls = []
		playerGames.forEach(game => { 
			gameCalls.push(getGameContribs(game,player));
		});

		await Promise.allSettled(gameCalls)
		.then(results => {
			results.forEach((result) => {
				if (result.status === "fulfilled"){
					for (let key in result.value){
						playerJson[player]['Contributions'][key] += result["value"][key];
					}
				}
			})
		});
	}
	return playerJson;
}

// Get Progress to Achilles
const getAchillesProg = async (commendations, database, milestone = 'helmet') => {
	let requiredCommendations = [];
	let nameIdMap = {};
	let offset = 1;

	if (milestone != 'helmet'){
		offset = 3;
	}

	let totalAchillesMeta = await metadataUtils.getCompCommMeta(database);
	// filter only to relevant Achilles commendations
	for (i = 0; i < static_things.achillesCommendations.length; i++) {
		let achillesCommName = static_things.achillesCommendations[i];
		let ourMeta = totalAchillesMeta.filter(medal => medal.name == achillesCommName)[0]
		requiredCommendations.push(commendations['ProgressiveCommendations'].filter(item => item.Id == ourMeta['id'])[0]);
	}

	// Separate completed commendations and still needed
	let completedCommendations = [];
	let neededCommendations = [];
	for (i = 0; i < requiredCommendations.length; i++) {
		let comm = requiredCommendations[i];
		let achillesComm = totalAchillesMeta.filter(medal => medal.id == comm.Id)[0]
		console.log(achillesComm)
		// Curate our returned data somewhat; Ignore levels of commendations
		let data = {
			"Name": achillesComm.name,
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
	.then(async res => {
		let gamertags = [];
		res.data.Members.forEach(member => {
			gamertags.push(member.Player.Gamertag);
		});
		console.log('Gamertags', gamertags);
        let emblemUrls = await playerImageUtils.getMultipleEmblems(gamertags);
		console.log(emblemUrls);
		let membersWithEmblems = res.data.Members.map(member => {
			let url = emblemUrls.filter(obj => obj.gamertag === member.Player.Gamertag)[0].emblemUrl;
			return {
				...member,
				Player: {
					...member.Player,
					EmblemUrl: url
				}
			}
		});
		let newData = {
			...res.data,
			Members: membersWithEmblems
		};
		return newData;
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
