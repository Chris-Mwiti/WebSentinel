// Dependancies
const crypto = require('crypto');
const config = require('./config');


// Helpers Container
const helpers = {};

// Hashing password helper
helpers.hash = (password) =>{
	if(typeof(password) !== "string") return false
		const hashedPassword = crypto.createHmac('sha256',config.hashSecret).update(password).digest('hex')
	return hashedPassword;
}

// Converts json to an object
helpers.parseJson = (str) => {
	try{
		const obj = JSON.parse(str)
		return obj
	}catch (err){
		return {}
	}
}

// Convert obj into json
helpers.stringfyJson = (obj) => {
	try{
		const json = JSON.stringify(obj);
		return json;
	}catch(err){
		return false
	}
}

helpers.generateToken = (chars) => {
	// Check if chars is a number and length is greater than zero
	chars = typeof(chars) == 'number' && chars > 0 ? chars : false
	if(!chars) return false;

	// Possible Characters
	const possibleCharcters = 'abcdefghijklmnopqrstuvwxyz1234567890'

	let tokenId = ''

	// Loop to generate random character
	for ( i=1; i <= chars; i++){
		var randomChar = possibleCharcters.charAt(Math.floor(Math.random() * possibleCharcters.length));
		tokenId += randomChar;
	}

	return tokenId;


}

module.exports = helpers 