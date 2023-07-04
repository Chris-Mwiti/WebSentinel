// Require fs and path to write the data file

const fs = require('fs');
const path = require('path');
const helpers = require('./helpers');

// Container to hold the properties and methods used by the data
const lib = {}

// Current path of the file
lib.baseDir = path.join(__dirname,'/../.data/')

// Method to create data 
lib.create = (dir,file,data,callback) => {
	const fileName = lib.baseDir+dir+'/'+file+'.json';
	fs.open(fileName,'wx',(err,fileDescriptor) =>{
		if(!err && fileDescriptor){
			// Convert data into a string
			const stringData = JSON.stringify(data)
			// Write Data to the file
			fs.writeFile(fileDescriptor,stringData,(err) =>{
				if(!err){
					fs.close(fileDescriptor,(err) => {
						if(!err) return callback(false)
							callback(`Error while closing the file: ${fileName}`);
					})
				}
				else{
					callback(`Error while writing to the file: ${fileName}`);
				}

			})
		}
		else{
			callback(`Error while opening the file ${fileName} the file might already exist`);
		}
	})
}

// Reading file data
lib.read = (dir,file,callback) => {
	const fileName = lib.baseDir+dir+'/'+file+'.json';
	fs.readFile(fileName,'utf8',(err,data) => {
		if(!err && data){
			const parsedData = JSON.parse(data);
			 return callback(false,parsedData);
		}
		callback(err,data)
	})
}

// Updating file data
lib.update = (dir,file,data,callback) => {
	const fileName = lib.baseDir+dir+'/'+file+'.json';
	fs.open(fileName,'r+',(err,fileDescriptor) => {
		if(!err){
			const stringData = JSON.stringify(data)
			fs.ftruncate(fileDescriptor,(err) => {
				if(!err){
					fs.writeFile(fileDescriptor,stringData,(err) =>{
						if(!err){
							fs.close(fileDescriptor,(err) => {
								if(!err) return callback(false)
									callback(`There was an error while closing the file ${fileName}`)
							})
						}else{
							callback(`There was an error while writing to the file: ${fileName}`)
						}
					})
				}
				else{
					callback(`There was an error while truncating the file: ${fileName}`)
				}
			})	
		}
		else{
			callback("The was an error while opening the file")
		}
	})
}

// Deleting a file
lib.delete = (dir,file,callback) => {
	const fileName = lib.baseDir+dir+'/'+file+'.json';
	fs.unlink(fileName,(err) => {
		if(!err) return callback(false)
			callback(`Error while deleting the file ${fileName}`);
	})
}

// Adding new data to an existing file
lib.add = (dir,file,data,callback) => {
	const fileName = lib.baseDir+dir+'/'+file+'.json';
	// Pull data from the exsiting file and parse it into an object
	const existingData = fs.readFileSync(fileName,'utf8');
	const jsonData = JSON.parse(existingData);
	// Add the data to the array
	jsonData.push(data);
	const updatedData = JSON.stringify(jsonData);
	fs.writeFileSync(fileName,updatedData,'utf8');

	callback("Data has been added successfully");
}

module.exports = lib 