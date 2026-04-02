var http = require('http');
var express = require("express");
var RED = require("node-red");
const path = require('path');
var morgan = require('morgan');
//var bodyParser = require("body-parser");

// Create an Express app
var app = express();

//Logging Middleware
app.use(morgan('dev'))

// Create a server
var server = http.createServer(app);

// Define the JSON parser as a default way 
// to consume and produce data through the 
// exposed APIs
//app.use(bodyParser.json());

// Create the settings object - see default settings.js file for other options
var settings = {
  httpAdminRoot:"/red",
  httpNodeRoot: "/api",
  userDir:".",
  editorTheme: {
    theme: "github-dark",
    codeEditor: {
      lib: "monaco",
      options: {
        wordWrap:true
      }
    }
  },
  flowFile:"flow_project.json",
  functionGlobalContext: { }    // enables global context
};

// Initialise the runtime with a server and settings
RED.init(server,settings);

// Serve the editor UI from /red
app.use(settings.httpAdminRoot,RED.httpAdmin);

// Serve the http nodes UI from /api
app.use(settings.httpNodeRoot,RED.httpNode);

server.listen(8000);

// Start the runtime
RED.start();