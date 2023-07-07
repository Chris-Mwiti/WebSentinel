/*Dependancies of the server

*/
// Config library
const config = require('./lib/config');
// Require http in order to create an http server
const http = require('http')
// Require https module in order to create an https server
const https = require('https')
// Require fs to read files
const fs = require('fs')
//Require the url to parse the incoming url
const url = require('url')
// Require libraries
const _data = require('./lib/data');
// Require handlers from the library
const handlers = require('./lib/handlers');
// Require handlers as a dependancy
const helpers = require('./lib/helpers')


// Require StringDecode to decode payloads into utf-8 format
const StringDecoder = require('string_decoder').StringDecoder

// Instantiate the httpServer
const httpServer = http.createServer((req,res) => {
	unifiedServer(req,res)
})
// Listens to a certain port
httpServer.listen(config.httpPort, () => console.log(`The server is running on port ${config.httpPort} in ${config.envName} mode`))


// HTTPS SERVER OPTIONS
const httpsOptions = {
	"key": fs.readFileSync('./HTTPS/key.pem'),
	"cert": fs.readFileSync('./HTTPS/cert.pem')
}
// Instantiate an https server
const httpsServer = https.createServer(httpsOptions,(req,res) => {
	unifiedServer(req,res)
})
// Listen to a certain port
httpsServer.listen(config.httpsPort, () => console.log(`The server is runing on port ${config.httpsPort}`))

// Unified server
const unifiedServer = (req,res) => {
	// Parse the url
	const parsedUrl = url.parse(req.url,true);
	// Get th path from the parsedUrl
	const path = parsedUrl.pathname;
	// Trim the path to remove unwanted characters
	const trimmedPath = path.replace(/^\/+|\/+$/g,"")

	// Get urlQuerys as an object
	const queryUrlObject = parsedUrl.query;

	// gets user request method
	const method = req.method.toLowerCase()

	// get user request headers
	const headers = req.headers;

	// Decode the incoming payloads from the request
	const decoder = new StringDecoder('utf-8')
	// Stores the decoded payload
	var buffer = ""
	req.on('data', (data) => {
		buffer += decoder.write(data)
	})
	// After decoding the message send a respond to the user
	req.on('end', () => {
			buffer += decoder.end()
			const chosenHandler = typeof(router[trimmedPath]) !== "undefined" ? router[trimmedPath] : handlers.notFound

			// url request information
			const reqData = {
				path: trimmedPath,
				method: method,
				query: queryUrlObject,
				headers: headers,
				body: helpers.parseJson(buffer)
			}

			chosenHandler(reqData,function(statusCode,payload){
				// Check if the status code is a number
				statusCode = typeof(statusCode) == "number" ? statusCode : 400

				// Check if a payload is an object
				payload = typeof(payload) == "object" ? payload : {}

				// convert payload into a string
				const stringPayload = JSON.stringify(payload)


				// Response values
				res.setHeader("Content-Type", "application/json")
				res.writeHead(statusCode)
				res.end(stringPayload)

			})
		}
	)	

}

// Define the router
const router = {
	'ping': handlers.ping,
	'users': handlers.users,
	'tokens': handlers.tokens,
	'checks': handlers.checks
}

