const axios = require('../../utils/axios-helper');
const halo_api = "https://www.haloapi.com";
const static_things = require('./statics/achilles_commendations');
const playerImageUtils = require('./playerImage');
const metadataUtils = require('./metadata');

const getCustomComm = async () => {
	// TODO: Placeholder for custom commendations we may add
};

// Return list of games in the past week
const getPlayerGames = async (player,cutoff,increment=0,validGames=[]) => {
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
		if (new Date(candidate.MatchCompletedDate.ISO8601Date).toISOString() > new Date(cutoff).toISOString()){
			validGames.push(candidate);
			counter++;
		}
	}
	// Can only grab 25 games at a time; Keep checking until all valid games are examined (i.e. less than 25 are returned)
	if (counter == 25){
		return getPlayerGames(player,cutoff,increment+25,validGames);
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
const getPlayerContribs = async (companyInfo, database) => {
	let company = companyInfo['Name'];
	let players = companyInfo['Members'];
	await clearGames(company,database);
	let collectionName = "companyHistory"+company;
	let collection = database.collection(collectionName);
	let playerJson = {};
	for (i = 65; i < players.length; i++){
		let player = players[i].Player.Gamertag;
		console.log(player)
		// Check for existing games by player in our db
		let cursor = await collection.find({'gamertag':player})
		let existingGames = cursor.toArray();
		console.log("Existing Games: "+existingGames.length)
		let d = new Date();
		// Default cutoff time to 7 days ago
		let timeAfter = d.setDate(d.getDate() - 7);
		if (existingGames.length > 0){
			let mostRecentGame = existingGames.sort((a,b) => (Date(a.ISO8601Date).toISOString() > Date(b.ISO8601Date).toISOString()) ? 1:-1)[existingGames.length-1];
			// Update time to most recent game
			timeAfter = Date(mostRecentGame.ISO8601Date).toISOString();
		}

		// Get player games after timeAfter; insert into db
		let playerGames = await getPlayerGames(player,timeAfter);
		console.log("New games: "+playerGames.length);
		playerGames.forEach(async (game) => { 
			let playerDoc = {};
			playerDoc['gamertag'] = player
			playerDoc['ISO8601Date'] = Date(game.MatchCompletedDate.ISO8601Date)
			playerDoc['gameId'] = game.Id.MatchId;
			playerDoc['contributions'] = await getGameContribs(game,player);
			await collection.insertOne(playerDoc);
			console.log("inserted")
		});

		// Get contributions from our db
                cursor = await collection.find({'gamertag':player})
                existingGames = cursor.toArray();
		playerJson[player] = {'Contributions':{}};
		static_things.achillesCommendations.forEach((item) => { playerJson[player]['Contributions'][item] = 0});
		if (existingGames.length > 0){
			existingGames.forEach((game) => {
				for (let key in game['contributions'].value){ 
					playerJson[player]['Contributions'][key] += game['contributions'][key];
				}
			})
		} 
	}
	console.log(playerJson)

	return playerJson;
}

// Remove games over a week old from collection
const clearGames = async (company,database) => {
	let d = new Date();
	let collectionName = "companyHistory"+company;
	let collection = database.collection(collectionName);
	let sevenDaysAgo = d.setDate(d.getDate() - 7);
	let query = {'ISO8601Date':{$lte:sevenDaysAgo}};
	await collection.deleteMany(query);
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
	return response.data
//	.then(async res => {
//		let gamertags = [];
//		res.data.Members.forEach(member => {
//			gamertags.push(member.Player.Gamertag);
//		});
//		console.log('Gamertags', gamertags);
//        let emblemUrls = await playerImageUtils.getMultipleEmblems(gamertags);
//		console.log(emblemUrls);
//		let membersWithEmblems = res.data.Members.map(member => {
//			let url = emblemUrls.filter(obj => obj.gamertag === member.Player.Gamertag)[0].emblemUrl;
//			return {
//				...member,
//				Player: {
//					...member.Player,
//					EmblemUrl: url
//				}
//			}
//		});
//		let newData = {
//			...res.data,
//			Members: membersWithEmblems
//		};
//		return newData;
//	})
//	.catch(error => {
//		return error;
//	});
//	return response;
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
