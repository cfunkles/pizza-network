var express = require('express');
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var mongodb = require('mongodb');
var ObjectID = require("mongodb").ObjectId;

var db;

mongodb.MongoClient.connect('mongodb://localhost', function(err, database) {
	if (err) {
		console.log(err);
		return;
	}
	console.log("Connected to Database. Baking pizza...");
	db = database;
	startListening();
});

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));


app.use(expressSession({
	secret: 'keyboard cat',
	resave: false,
	saveUninitialized: true
}));













app.use(express.static('public'));

app.use(function(req, res, next) {
	res.status(404);
	res.send("File Not Found! No pizza in sight!");
});

app.use(function(err, req, res, next) {
	console.log(err);
	res.status(500);
	res.send("Internal Server Error! Pizza got burned.");
	res.send(err);
});

function startListening() {
	app.listen(8080, function() {
		console.log("Sever started at http://localhost:8080 Grab a slice!");
	});
}