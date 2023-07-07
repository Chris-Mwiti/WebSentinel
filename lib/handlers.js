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

	// Retrive the token from the headers
	const token = typeof(reqData.headers.token) == 'string' ? reqData.headers.token : false;
	console.log(token);

	// Verification of user
	handlers._tokens.verifyToken(token,phone,(isUserValid) => {
		if(!isUserValid) return callback(403, {"Error": "Forbidden"});
		_data.read('users',phone,(err,data) => {
			if(err) return  callback(404,{"Error":"User not found"});
			delete data.password;
			callback(200,data);
		})
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

	// Retrive the token from the headers
	const token = typeof(reqData.headers.token) == 'string' ? reqData.headers.token : false;

	// Verification of user
	handlers._tokens.verifyToken(token,phone,(isUserValid) => {
		if(!isUserValid) return callback(403, {"Error": "Forbidden"});

		// Proceed with the changes
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
	})

}

handlers._users.delete = (reqData,callback) => {

	const phone  = typeof(reqData.query.phone) == 'string' && reqData.query.phone.trim().length == 10 ? reqData.query.phone : false
	// Retrive the token from the headers
	const token = typeof(reqData.headers.token) == 'string' ? reqData.headers.token : false;

	// Verification of user
	handlers._tokens.verifyToken(token,phone,(isUserValid) => {
		if(!isUserValid) return callback(403, {"Error": "Forbidden"});

		// Proceed with deletion
		if(!phone) return callback(400,{"Error": "Missing fields"});
		_data.read('users',phone,(err,data) => {
			if(err) return  callback(404,{"Error":"User not found"});
			_data.delete('users',phone,(err) => {
				if(!err) return callback(200);
				callback(500,{'Error': "Server side error"});
			})
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

// Verify the token provided
handlers._tokens.verifyToken = (tokenId,phonenumber,callback) => {
	
	if(!tokenId || !phonenumber) return callback(false);

	_data.read('tokens', tokenId, (err,data) => {
		if(err && !data) return callback(false);
		// Check if the token is valid
		if(data.expiresIn > Date.now() && data.phone == phonenumber){
			callback(true)
		}else{
			callback(false)
		}
	})
}



// Checks
handlers.checks = function(reqData,callback){
	const acceptedMethods = ['post','get','put','delete'];
	if(acceptedMethods.indexOf(reqData.method) == -1) return callback(405);
	handlers._checks[reqData.method](reqData,callback)
}

handlers._checks={}

// Post
handlers._checks.post = (reqData,callback) => {
	const {protocol, statusCodes, url, timeOut, method} = reqData.body;
	const requiredMethods = ['get','post','put', 'delete'];
	const incomingProtocol = typeof(protocol) == 'string' && ['http', 'https'].includes(protocol) ? protocol : false
	const incomingUrl = typeof(url) == 'string' && url.trim().length > 0 ?  url : false;
	const incomingMethods = typeof(method) == 'string' && requiredMethods.includes(method) ? method : false;
	const incomingTimeOut = typeof(timeOut) == 'number' && timeOut % 1 == 0 && timeOut >= 0 && timeOut <= 5 ? timeOut : false;
	const incomingStatusCode = typeof(statusCodes) == 'object' && statusCodes instanceof Array ? statusCodes : false;


	if (incomingProtocol && incomingUrl && incomingMethods && incomingTimeOut && incomingStatusCode){
		const token = typeof(reqData.headers.token) == 'string' ? reqData.headers.token : false;

		if(!token) return callback(403, {"Error": "Forbidden"});

		_data.read('tokens', token, (err, token) => {
			if(err || !token) return callback(403, {"ERROR": "Invalid token"});
			const { phone } = token
			
			_data.read('users', phone, (err,user) => {
				if(err || !user) return callback(403, {"ERROR": "Forbidden"});

				const checks =  typeof(user.checks) == 'object' && user.checks instanceof Array ? user.checks : [];

				if(checks.length < 5){
					const checkId = helpers.generateToken(20);

					const checkObj = {
						id: checkId,
						phone: user.phone,
						protocol: incomingProtocol,
						url: incomingUrl,
						statusCodes: incomingStatusCode,
						timeOut: incomingTimeOut,
						method: incomingMethods
					}

					_data.create('checks', checkId, checkObj, (err) => {
						if(err) return callback(500, {"Message": "Server side error"});
						
						// Update user data with the check
						user.checks = checks;
						user.checks.push(checkId);
						_data.update('users', phone, user, (err) => {
							if(err) return callback(500, {"ERROR": "Server side error"});

							return callback(200,checkObj);
						})
					})

				}else return callback(400, {"ERROR": "You have reached your maximum no of checks"})
			} )
		})
	}else{
		return callback(400, {"Error": "Invalid inputs"});
	}
}

handlers._checks.get = (reqData, callback) => {
	const {id} = reqData.query
	const checkQuery =  typeof(id) == 'string' && id.trim().length == 20 ?  id : false

	if(!checkQuery) return callback(400, {"ERROR": "Missing fields"});

	_data.read('checks', checkQuery, (err,check) => {
		const { phone } = check;
		
		if(!phone) return callback(404);
		
		// Verification of user
		const token = typeof(reqData.headers.token) == 'string' ? reqData.headers.token : false;
		handlers._tokens.verifyToken(token,phone,(isUserValid) => {
			if(!isUserValid) return callback(403, {"Error": "Forbidden"});
			
			return callback(200,check)
		})		
	})


	
}

module.exports = handlers;