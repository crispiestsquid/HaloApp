const MongoClient = require( 'mongodb' ).MongoClient;
const url = "mongodb://localhost:27017/halodb";

function connect() {
	return MongoClient.connect(url).then(client => client.db())
}

module.exports = async function() { 
	let databases = await Promise.all([connect()]);
	return databases[0];
}
