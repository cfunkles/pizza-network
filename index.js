var express = require('express');
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var mongodb = require('mongodb');
var ObjectID = require("mongodb").ObjectId;
//bring file back to work
//var secrets = require("./secrets.js");

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

// Register a new user
app.post('/api/register', function(req, res){
	// Check to see if username already exists
	db.collection('users').findOne({
		username: req.body.username
	}, function(err, data){
		console.log(data);
		if(err){
			console.log(err);
			return;
		}
		if(data !== null){
			res.send('exists');
			return;
		}
		// If username does not exist, add user to db
		db.collection('users').insertOne({
			username: req.body.username,
			password: req.body.password //todo: hash this
		}, function(err, data){
			if(err){
				console.log(err);
				res.status(500);
				res.send('error');
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
		// Associate this cookie (session) with this user (object)
		req.session.user = {
			_id: data._id,
			username: data.username
		};
		res.send('success');
	});
});


//Create new pizza place

app.post('/api/newPlace', function(req, res){
	// Check if user is logged in
	if(!req.session.user){
		res.status(403);
		res.send('forbidden');
		return;
	}
	// If so, add new pizza place
	db.collection('places').insertOne({
		name: req.body.name,
		address: req.body.address,
		city: req.body.city,
		state: req.body.state,
		phone: req.body.phone,
		url: req.body.url,
		type: req.body.type,
		delivery: req.body.delivery,
		kidFriendly: req.body.kidFriendly,
		pizzaLikes: parseInt(req.body.pizzaLikes),
		pizzaDislikes: parseInt(req.body.pizzaDislikes),
		submitter: req.session.user._id
	}, function(err, data){
		if(err){
			console.log(err);
			res.status(500);
			res.send('error');
			return;
		}
		res.send(data);
	});
});

// Top Ten List
app.get('/api/topTen', function(req, res){
	
});

// List all pizza places

// Filter pizza places


// Chats












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