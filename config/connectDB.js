const env = process.env.NODE_ENV || 'development';
const config = require('./config')[env];

const { MongoClient } = require('mongodb');

const databaseName = "also";
const uri = `mongodb+srv://${config.db_user}:${config.db_pass}@cluster0-zpn4z.mongodb.net?retryWrites=true&w=majority`
// const uri = `mongodb+srv://koko:<password>@cluster0-zpn4z.mongodb.net/<dbname>?retryWrites=true&w=majority`
// const collectionName = "cubesList"


async function connectDB() {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    const connect = await client.connect()
    const db = connect.db(config.db_name);
    return { connect, db}
}


module.exports = connectDB
