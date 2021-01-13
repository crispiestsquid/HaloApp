const axios = require('../../utils/axios-helper');
const halo_api = "https://www.haloapi.com";
const static_things = require('./statics/achilles_commendations');

const cComm = "companyCommendationMetadata";
const sComm = "spartanCommendationMetadata";
const sMeda = "spartanMedalMetadata";

const getCompCommMeta = async (database) => {
	const collection = database.collection(cComm)
	let cursor = await collection.find();
        if (await cursor.count() == 0) await setMeta(database,`${halo_api}/metadata/h5/metadata/company-commendations`,cComm)
	let docs = await database.collection(cComm).find({});
	let metadata = await docs.toArray();
	return metadata;
};

const getSpartanCommMeta = async (database) => {
	const collection = database.collection(sComm)
	let cursor = await collection.find();
        if (await cursor.count() == 0) await setMeta(database,`${halo_api}/metadata/h5/metadata/commendations`,sComm)
	let docs = await database.collection(cComm).find({});
	let metadata = await docs.toArray();
	return metadata;
};

const getSpartanMedalMeta = async (database) => {
	const collection = database.collection(sMeda)
	let cursor = await collection.find();
        if (await cursor.count() == 0) await setMeta(database,`${halo_api}/metadata/h5/metadata/medals`,sMeda)
	let docs = await database.collection(cComm).find({});
	let metadata = await docs.toArray();
	return metadata;
};

const setCustomMetadata = async () => {
	// TODO: Placeholder for custom metadata we may add
};

const setMeta = async (database,api_url,collection_name) => {
        // Wipe company commendation collection & re-init
	console.log("Setting metadata: "+collection_name+" using api_url: "+api_url)
	
	let response = await axios.get(api_url)
	.then (res => {
		console.log("Got metadata")
		return res.data;
	})
	.catch( error => {
		console.log("catch")
		return error;
	})
	try {
		await database.collection(collection_name).insertMany(response)
		console.log("Tried to insert metadata")
	}
	catch (e){ 
		console.log(e);
	}
};

module.exports = { getCompCommMeta,getSpartanCommMeta,getSpartanMedalMeta };
