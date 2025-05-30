const mongoose = require('mongoose')
const dbConfig = require('./dbconfig')

const uri = "mongodb+srv://MoussF:mohamed2001@cluster0.rde6y.mongodb.net/cinema_api?retryWrites=true&w=majority";

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(
            uri,)
        console.log(`MongoDB Connected: ${conn.connection.host}`)
    }
    catch (err) {
        console.log(err)
        process.exit(1)
    }
}

module.exports = connectDB