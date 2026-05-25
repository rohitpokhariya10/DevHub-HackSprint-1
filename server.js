// require("dotenv").config();
const app = require("./src/app");
const connecToDb = require("./src/config/db");


let PORT = 3000 || 8000;
app.listen(PORT , ()=>{
    console.log(`Server is running on port ${PORT}`);
})

connecToDb();