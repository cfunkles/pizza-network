var express = require('express');
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var mongodb = require('mongodb');
var ObjectID = require("mongodb").ObjectId;

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


// Authentication
app.get('/api/authentication', function(req, res){
	if(!req.session.user){
		res.send("error");
	}
});

// Register a new user
app.post('/api/register', function(req, res){
	// Check to see if username already exists
	db.collection('users').findOne({
		username: req.body.username
	}, function(err, data){
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
	}
	// If so, add new pizza place
	db.collection('places').insertOne({
		name: req.body.name,
		address: req.body.address,
		city: req.body.city,
		state: req.body.state,
		zip: req.body.zip,
		phone: req.body.phone,
		url: req.body.url,
		newYork: req.body.newYork,
		deepDish: req.body.deepDish,
		brickOven: req.body.brickOven,
		authentic: req.body.authentic,
		delivery: req.body.delivery,
		kids: req.body.kids,
		upVotes: parseInt(req.body.upVotes),
		downVotes: parseInt(req.body.downVotes),
		score: parseInt(req.body.score),
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

// Up Vote Handler
app.post('/api/upvote', function(req, res) {
	db.collection('places').update({_id: ObjectID(req.body._id)}, {$inc: {upVotes: 1, score: 1}}, function(err, result) {
		if (err) {
			console.log(err);
		}
		res.send(result);
	});
});

// Down Vote Handler
app.post('/api/downvote', function(req, res) {
	db.collection('places').update({_id: ObjectID(req.body._id)}, {$inc: {downVotes: -1, score: -1}}, function(err, result) {
		if (err) {
			console.log(err);
		}
		res.send(result);
	});	
});

// Get request for all pizza places
app.get('/api/getPizzerias', function(req, res) {
	db.collection('places').find({}).toArray(function(err, docs) {
		if(err){
			console.log(err);
			res.status(500);
			res.send('error');
			return;
		}
		res.send(docs);
	});
});

// Chats
app.post('/api/newChats', function(req, res){
	// Check to see if user is logged in
	if(!req.session.user){
		res.status(403);
		res.send('forbidden');
		return;
	}
	// Insert chat
	db.collection('chats').insertOne({
		timestamp: Date.now(),
		message: req.body.message,
		type: req.body.type,
		submitter: req.session.user._id,
		username: req.session.user.username //is this secure??
	});
	res.send("success");

});

app.get('/api/getChats', function(req, res){
	// Check to see if user is logged in
	if(!req.session.user){
		res.status(403);
		res.send('forbidden');
		return;
	}
	// Find all chats
	db.collection('chats').find({}).toArray(function(err, docs){
		if(err){
			return console.log(err);
		}
		res.send(docs);
	});
});

// Files to be served out of static public folder
app.use(express.static('public'));

// 404 boilerplate
app.use(function(req, res, next) {
	res.status(404);
	res.send("File Not Found! No pizza in sight!");
});

// 500 boilerplate
app.use(function(err, req, res, next) {
	console.log(err);
	res.status(500);
	res.send("Internal Server Error! Pizza got burned.");
	res.send(err);
});


// Start listening after we've connected to the db
function startListening() {
	app.listen(8080, function() {
		console.log("Sever started at http://localhost:8080 Grab a slice!");
	});
}