/*Create and export different environments
*
*/

// Environments container
const environments = {}

// Default environment
environments.staging = {
	"httpPort": 3000,
	"httpsPort": 3002,
	"hashSecret": "absdef",
	"envName": "staging"
}

// Staging environment
environments.production = {
	"httpPort": 5000,
	"httpsPort": 5002,
	"hashSecret": "absdefe",
	"envName": "production"
}

// Check current environment inputed by the user in the command-line
const currEnv = typeof(process.env.NODE_ENV) == "string" ? process.env.NODE_ENV.toLowerCase() : "";

// Check if the currEnv is among the environments defined if not default to staging environment
const envToBeExported = typeof(environments[currEnv]) == "object" ? environments[currEnv] : environments.staging;


// Export the environment
module.exports = envToBeExported;