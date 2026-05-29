require("dotenv").config();
const app = require("./src/app");
const connecToDb = require("./src/config/db");


// Bootstraps the HTTP server and opens the MongoDB connection for the API process.
let PORT = 3000 || 8000;
app.listen(PORT , ()=>{
    console.log(`Server is running on port ${PORT}`);
})

connecToDb();
