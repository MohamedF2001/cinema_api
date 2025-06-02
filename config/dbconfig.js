module.exports = {
    secret: 'yoursecret',
    database: 'mongodb://localhost:27017/ticket'
    //database: 'mongodb://localhost:27017/testCode',
}
// Note: The database URL should be updated to your actual MongoDB connection string.
// If you are using MongoDB Atlas, it would look like:
// mongodb+srv://<username>:<password>@cluster0.mongodb.net/<dbname>?retryWrites=true&w=majority