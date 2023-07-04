/* DEPENDANCIES */
const _data = require('./data');
const helpers = require('./helpers');

// Define the handlers that handle requests according to specified path
var handlers = {}

/* NEW HANDLER DEFINATION */

// Ping handler
handlers.ping = function(reqData, callback){
	callback(200)
}

/* NEW HANDLER DEFINATION */

// 404 handler
handlers.notFound = function(reqData,callback){
	callback(404)
}

/* NEW HANDLER DEFINATION */

// Users handlers
handlers.users = function(reqData,callback){
	const acceptedMethods = ['post','get','put','delete'];
	if(acceptedMethods.indexOf(reqData.method) == -1) return callback(405);
	handlers._users[reqData.method](reqData,callback)
}


// Sub handlers for users
handlers._users={}


// Required data:firstname,email,phonenumber,lastname,tosAgreement
// Optional data: none

handlers._users.post = (reqData,callback) => {
	// Check that the reqData is not an empty field and is a string
	const firstName = typeof(reqData.body.firstname) == "string" && reqData.body.firstname.trim().length > 0 ? reqData.body.firstname : "";
	const lastName = typeof(reqData.body.lastname) == "string" && reqData.body.lastname.trim().length > 0 ? reqData.body.lastname : "";
	const password = typeof(reqData.body.password) == "string" && reqData.body.password.trim().length > 0 ? reqData.body.password : "";
	const email = typeof(reqData.body.email) == "string" && reqData.body.email.trim().length > 0 && reqData.body.email.includes('@') ? reqData.body.email : "";
	const phone = typeof(reqData.body.phone) == "string" && reqData.body.phone.trim().length == 10 ? reqData.body.phone : "";
	const tosAgreement = typeof(reqData.body.tosAgreement) == "boolean" && reqData.body.tosAgreement ? reqData.body.tosAgreement : false;
	console.log(firstName,lastName,password,email,phone,tosAgreement);
	// @TODO: "update the logic to search file data in a list of arrays"
	if(firstName && lastName && phone && tosAgreement && password && email){
		_data.read('users',phone,(err) =>{
			if(!err) return callback(400,{"Error":"User already exists"});
			const hashedPassword = helpers.hash(password);

			if(hashedPassword){
				const userObject = {
					"firstname": firstName,
					"lastname": lastName,
					"email": email,
					"phone": phone,
					"tosAgreement": tosAgreement,
					"password": hashedPassword
				}
				_data.create('users',phone,userObject,(err) => {
					if(err) return callback(500,{"Error": "There was an error while creating the user"});
					callback(201)
				})
			}else{
				callback(500, {"Error": "Error while hashing user password"})
			}

		})
	}else{
		callback(401,{"Error": "Invalid inputs"})
	}

}

handlers._users.get = (reqData,callback) => {
	const phone  = typeof(reqData.query.phone) == 'string' && reqData.query.phone.trim().length == 10 ? reqData.query.phone : false
	if(!phone) return callback(400,{"Error": "Missing fields"});
	_data.read('users',phone,(err,data) => {
		if(err) return  callback(404,{"Error":"User not found"});
		delete data.password;
		callback(200,data);
	})
}

handlers._users.put= (reqData,callback) => {
	const queryPhone  = typeof(reqData.query.phone) == 'string' && reqData.query.phone.trim().length == 10 ? reqData.query.phone : false
	if(!queryPhone) return callback(400,{"Error": "Missing Fields"});
	// Check that the reqData is not an empty field and is a string
	const firstName = typeof(reqData.body.firstname) == "string" && reqData.body.firstname.trim().length > 0 ? reqData.body.firstname : "";
	const lastName = typeof(reqData.body.lastname) == "string" && reqData.body.lastname.trim().length > 0 ? reqData.body.lastname : "";
	const password = typeof(reqData.body.password) == "string" && reqData.body.password.trim().length > 0 ? reqData.body.password : "";
	const email = typeof(reqData.body.email) == "string" && reqData.body.email.trim().length > 0 && reqData.body.email.includes('@') ? reqData.body.email : "";
	const phone = typeof(reqData.body.phone) == "string" && reqData.body.phone.trim().length == 10 ? reqData.body.phone : "";
	const tosAgreement = typeof(reqData.body.tosAgreement) == "boolean" && reqData.body.tosAgreement ? reqData.body.tosAgreement : false;


	if(firstName || lastName || email || password){
		const hashedPassword = helpers.hash(password)
		const updatedData = {
			firstname: firstName,
			lastname: lastName,
			email: email,
			phone: queryPhone,
			password: hashedPassword,
			tosAgreement: true,
		}
		_data.update('users', queryPhone, updatedData, (err) => {
			if(!err) return callback(200,{"Message": `You have successfully updated ${queryPhone}`});
			callback(500, {"Error": "Error while updating user"});
		})
	}
	else{
		callback(400, {"Error": "Missing Fields"})
	}
	
}

handlers._users.delete = (reqData,callback) => {
	const phone  = typeof(reqData.query.phone) == 'string' && reqData.query.phone.trim().length == 10 ? reqData.query.phone : false
	if(!phone) return callback(400,{"Error": "Missing fields"});
	_data.read('users',phone,(err,data) => {
		if(err) return  callback(404,{"Error":"User not found"});
		_data.delete('users',phone,(err) => {
			if(!err) return callback(200);
			callback(500,{'Error': "Server side error"});
		})
	})
	
}

/* NEW HANDLER DEFINATION */

// Token handler
handlers.tokens = function(reqData,callback){
	const acceptedMethods = ['post','get','put','delete'];
	if(acceptedMethods.indexOf(reqData.method) == -1) return callback(405);
	handlers._tokens[reqData.method](reqData,callback)
}


// Sub handlers for tokens
handlers._tokens={}


// Tokens -post
handlers._tokens.post = (reqData,callback) => {
	const phone = typeof(reqData.body.phone) == "string" && reqData.body.phone.trim().length == 10 ? reqData.body.phone : "";
	const password = typeof(reqData.body.password) == "string" && reqData.body.password.trim().length > 0 ? reqData.body.password : "";
	
	if (password && phone){
		_data.read('users',phone,(err,userData) => {
			if(!err && userData) {
				// Hash the inputed password and compare it to the stored password
				const hashedPassword = helpers.hash(password);
				const storedPwd = userData.password;
				if(hashedPassword == storedPwd){
					// Generate a new token with an expiration date
					const tokenId = helpers.generateToken(20);
					console.log(tokenId);
					const expiresIn = Date.now() + 1000 * 60 * 60;

					// Container to hold up the generated token
					const token = {
						tokenId: tokenId,
						phone: phone,
						expiresIn: expiresIn
					}

					// Store the token 
					_data.create('tokens',tokenId,token,(err) => {
						if(err) return callback(500, {'Error': 'Could not create the token'});
						callback(200,token)
					})
				}else{
					callback(400,{"Error": "Password does not match"})
				}
			}
			else{
				callback(400,{'Error': "User does not exist"})
			}
		})
	}else{
		callback(400, {'Error': 'Missing Fields'});
	}

	

}

// Tokens -get
handlers._tokens.get = (reqData,callback) => {
	const id = typeof(reqData.query.id) == 'string' && reqData.query.id.trim().length == 20 ? reqData.query.id : false;
	console.log(id);
	if(!id) return callback(400, {'Error': 'Missing Fields'});
	_data.read('tokens',id,(err,tokenData) => {
		if(err && !tokenData) return callback(404);
		callback(200,tokenData)
	})
}

// Tokens -put
handlers._tokens.put = (reqData,callback) => {
	const id = typeof(reqData.body.id) == 'string' && reqData.body.id.trim().length == 20 ? reqData.body.id : false
	const extend = typeof(reqData.body.extends) == 'boolean' && reqData.body.extends ? true : false

	if(!id && !extend) return callback(400,{"Error": "Invalid input"});

	_data.read('tokens',id,(err,tokenData) => {
		if(err && !tokenData) return callback(400,{"Error" : "Invalid token"});
		if(tokenData.expiresIn < Date.now()) return callback(400, {"Error": "Token has already expired"});
		tokenData.expiresIn = Date.now() + 1000 * 60 * 60;
		_data.update('tokens',id,tokenData,(err) => {
			if(err) return callback(500, {"Error": "Server error"});
			callback(200)
		})
	})

}

// Tokens -delete
handlers._tokens.delete = (reqData,callback) => {
	const id  = typeof(reqData.query.id) == 'string' && reqData.query.id.trim().length == 20 ? reqData.query.id : false
	if(!id) return callback(400,{"Error": "Missing fields"});
	_data.read('tokens',id,(err,data) => {
		if(err) return  callback(404,{"Error":"Token not found"});
		_data.delete('tokens',id,(err) => {
			if(!err) return callback(200);
			callback(500,{'Error': "Server side error"});
		})
	})


}

module.exports = handlers;