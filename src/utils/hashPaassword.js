const bcrypt = require("bcrypt");

const hashFunction = async (data) => {
    return await bcrypt.hash(data , 10);
};

const comparePassword = async (password , hashPassword)=>{
    return await bcrypt.compare(password , hashPassword);
};
module.exports = {hashFunction , comparePassword};