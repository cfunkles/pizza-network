var express = require('express');
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var mongodb = require('mongodb');
var ObjectID = require("mongodb").ObjectId;
var secrets = require("./secrets.js");

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
	secret: secrets.secret,
	resave: false,
	saveUninitialized: true
}));

// Register a new user
app.post('/api/register', function(req, res){
	// Check to see if username already exists
	db.collection('users').find({
		username: req.body.username
	}, function(err, data){
		if(err){
			return console.log(err);
		}
		if(data){
			return console.log("Sorry, this username already exists! Try a new one.");
		}
		// If username does not exist, add user to db
		db.collection('users').insertOne({
			username: req.body.username,
			password: req.body.password //todo: hash this
		}, function(err, data){
			if(err){
				console.log(err);
				res.status(500);
				res.send('Error adding new user');
				return;
			}
			res.send(data);

		});
	});
});

// Post to login
app.post('/api/login', function(req, res){
	db.collection('users').findOne({
		username: req.body.username,
		password: req.body.password
	}, function(err, data){
		if(data === null){
			res.send('error');
			return;
		}
		req.session.user = {
			_id: data._id,
			username: data.username
		};
		res.send('success');
	});
});


//Create new pizza place

//List all pizza places

//Filter pizza places

//Chats












//Files to be served out of static public folder
app.use(express.static('public'));

//404 boilerplate
app.use(function(req, res, next) {
	res.status(404);
	res.send("File Not Found! No pizza in sight!");
});

//500 boilerplate
app.use(function(err, req, res, next) {
	console.log(err);
	res.status(500);
	res.send("Internal Server Error! Pizza got burned.");
	res.send(err);
});


//start listening after we've connected to the db
function startListening() {
	app.listen(8080, function() {
		console.log("Sever started at http://localhost:8080 Grab a slice!");
	});
}