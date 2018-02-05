console.log('Starting Emergence...');

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


const dbName = "prismatica";

MongoClient.connect('mongodb://localhost:27017', (err, database) => {
  if (err) return console.log(err)
  const db = database.db(dbName);


  app.get('/', (req, res) => {
    // do something here
    res.sendFile(__dirname + '/index.html')
    // Note: __dirname is directory that contains the JavaScript source code. Try logging it and see what you get!
    // Mine was '/Users/zellwk/Projects/demo-repos/crud-express-mongo' for this app.
  })

  //Get API data
  app.post('/api/get/', (req, res) => {
     // Determine query type
     // If query == Get Tasks
     if (req.body.collection == "TASK") {
        // Get tasks for agentId
        const collection = db.collection('TASK');
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
   //TASK Agent
   app.post('/api/task/', (req, res) => {
     const collection = db.collection('TASK');
     collection.save(req.body, (err, result) => {
       if (err) return console.log(err)
    })
     res.send({});
   })

  //Set API data
  app.post('/api/update/', (req, res) => {
    const collection = db.collection('C2');
    collection.save(req.body, (err, result) => {
      if (err) return console.log(err)
   })
    res.send({});
  })



  //Add junk to db
  app.post('/stockdata', (req, res) => {

  })

  //DBMS
function logEvent(message) {
  var logEntry = JSON.parse(message)
  arrayOfObjects.push({
    msg: message
  })
  console.log(logEntry);
  db.collection('eventlog').save(logEntry, (err, result) => {
    if (err) return console.log(err)
    //console.log('logged')

  })
}

app.listen(29001, () => {
  console.log('listening on 29001')
})

})
