const MongoClient = require('mongodb').MongoClient;
//const config = require('./config').mongo_config;
let _db;

class MongoDBConnection {
    async  connectToServer() {
        try {
            _db = await MongoClient.connect(process.env.MONGODB_URL, { useNewUrlParser: true });
        } catch (error) {
            throw error;
        }
    }

    getDb() {
        return _db;
    }
}
module.exports = new MongoDBConnection();
