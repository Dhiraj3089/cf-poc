const express = require('express');
const dotenv = require('dotenv');
dotenv.config({ path: __dirname + '/.env' });
const app = express();
const cfenv = require("cfenv");
const mongoClient = require('./db/mongo_connection');

// const path = require('path');
const routes = require('./routes/index');
const cors = require('cors');

const appEnv = cfenv.getAppEnv();
if (appEnv.getService('cf-mongo-poc')) {
    process.env.MONGODB_URL = appEnv.getServiceURL('cf-mongo-poc')
}
const port = appEnv.port || 3000;

global.appRootDirectory = __dirname;

app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));


app.use('/api', routes);
// app.get('/*', function (req, res, next) {
//     res.sendFile(path.join(global.appRootDirectory, 'public/index.html'));
// });
mongoClient.connectToServer().then(() => {
    console.log("Connected to MongoDB");
    app.listen(port, () => console.log(`app listening on port ${port}!`))
}).catch(error => {
    console.log(error);
})
