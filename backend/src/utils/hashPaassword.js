const bcrypt = require("bcrypt");

// One-way hashing wrapper used for passwords and refresh tokens.
const hashFunction = async (data) => {
    return await bcrypt.hash(data , 10);
};

// Constant-time bcrypt comparison for login credential checks.
const comparePassword = async (password , hashPassword)=>{
    return await bcrypt.compare(password , hashPassword);
};
module.exports = {hashFunction , comparePassword};
