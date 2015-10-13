var express=require('express');
var multer  = require('multer');
var mongoose = require('mongoose');
var connection = mongoose.createConnection('mongodb://localhost/details');
var dbService = require('./dbService')(connection);
var fs = require('fs');

var app=express();
app.use(express.static('public'));

connection.once('open',function () {

	app.post('/updatePic',multer({dest:'./uploads'}).single('photo'),function (request,response) {
		dbService.writeFileToDb({
			readStream:fs.createReadStream(request.file.path),
			fileName:request.file.originalname,
			collection:'photos'
		})
		.then(function (objectId) {
			response.send(objectId);
		},function (error) {
			response.status(500).send(error);
		}).finally(function () {
			fs.unlink(request.file.path);
		});
	});

	app.get('/getPic',function (request,response) {
		dbService.readFileFromDb({
			objectId:request.query.fileId,
			writeStream:response,
			collection:'photos'
		})
		.then(function (objectId) {
			response.end();
		},function (error) {
			response.status(500).send(error);
		});
	});

	app.listen(8000,function () {
		console.log('server listening at port 8000');
	});

});