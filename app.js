"use strict";

var Path = require("path");
var Cylon = require("cylon");
var ws = require("nodejs-websocket");

var windowed = true;

process.argv.forEach(function (val, index, array) {
  if (val === "--no-window") {
    windowed = false;
  }

  if (val === "--help") {
    console.log("Usage: node " + Path.basename(process.argv[1]) + " [--no-window] [--help]");
    process.exit(1);
  }
});


var EventedArray = function(handler) {
   this.stack = [];
   this.mutationHandler = handler || function() {};
   this.setHandler = function(f) {
      this.mutationHandler = f;
   };
   this.callHandler = function() {
      if(typeof this.mutationHandler === 'function') {
         this.mutationHandler();
      }
   };
   this.push = function(obj) {
      this.stack.push(obj);
      this.callHandler();
   };
   this.pop = function() {
      return this.stack.pop();
   };
   this.getArray = function() {
      return this.stack;
   }
   this.clearArray = function() {
     return this.stack = [];
   }
}

var messageReceivedQueue = new EventedArray();

var clearMessageReceivedQueue = function() {
  messageReceivedQueue.clearArray();
}
var server = ws.createServer(function (conn) {
    if (server.connections.length == 1) {
      clearMessageReceivedQueue();
    }

    messageReceivedQueue.setHandler(function(){
      var recentMessage = messageReceivedQueue.pop();
      if (recentMessage)
        var message = { "facesDected": recentMessage.length,
                        "faceDetails": recentMessage
                      };
      server.connections.forEach(function (conn) {
        conn.sendText(JSON.stringify(message));
      })
    });

    conn.on("close", function (code, reason) {
      if (server.connections.length == 0) {
        clearMessageReceivedQueue();
      }
    })
}).listen(8001)

Cylon.robot({
  connections: {
    opencv: { adaptor: "opencv" }
  },

  devices: {
    window: { driver: "window" },
    camera: {
      driver: "camera",
      camera: 0,
      haarcascade: __dirname + "/haarcascade_frontalface_alt.xml"
    }
  },

  faces: undefined,

  work: function(my) {
    // We setup our face detection when the camera is ready to
    // display images, we use `once` instead of `on` to make sure
    // other event listeners are only registered once.
    my.camera.once("cameraReady", function() {
      console.log("The camera is ready!");

      // We add a listener for the facesDetected event
      // here, we will get (err, image/frame, faces) params back in
      // the listener function that we pass.
      // The faces param is an array conaining any face detected
      // in the frame (im).
      my.camera.on("facesDetected", function(err, im, faces) {
        if (err) { console.log(err); }

        // We loop through the faces and manipulate the image
        // to display a square in the coordinates for the detected
        // faces.

        if( this.faces === undefined ) {
          // setup
          this.faces = faces;
        }

        var persistentFaces = [];
        var matchedAnyFace = false;

        // console.log("faces count: " + faces.length);
        var self = this;

        faces.forEach( function(face, index, array) {
          var matchedMultipleFrames = false;

          for (var i = 0; i < self.faces.length; i++) {
            var otherFace = self.faces[i];

            if (otherFace.matchCount === undefined) {
              otherFace.matchCount = 0;
            }

            if (Math.abs(otherFace.x - face.x) < 100 && Math.abs(otherFace.y - face.y) < 100) {
              otherFace.matchCount++;
              matchedAnyFace = true;

              // console.log("face matchCount: " + otherFace.matchCount);
              if (otherFace.matchCount > 2) {
                matchedMultipleFrames = true;

                persistentFaces.push(otherFace);
              }

              break;
            }
          }
          var color = [0, 255, 0];

          if (matchedMultipleFrames === true) {
            color = [255,0,0];
          }

          if (windowed === true) {
            im.rectangle(
              [face.x, face.y],
              [face.width, face.height],
              color,
              2
            );
          }

        }); // forEach

        if (matchedAnyFace === false) {
          // reset faces array

          // console.log("reset");
          this.faces = faces;
        }

        messageReceivedQueue.push(persistentFaces);

        // The second to last param is the color of the rectangle
        // as an rgb array e.g. [r,g,b].
        // Once the image has been updated with rectangles around
        // the faces detected, we display it in our window.
        if (windowed === true) {
          my.window.show(im, 40);
        }

        // After displaying the updated image we trigger another
        // frame read to ensure the fastest processing possible.
        // We could also use an interval to try and get a set
        // amount of processed frames per second, see below.
        my.camera.readFrame();
      });

      // We listen for frameReady event, when triggered
      // we start the face detection passing the frame
      // that we just got from the camera feed.
      my.camera.on("frameReady", function(err, im) {
        if (err) { console.log(err); }
        my.camera.detectFaces(im);
      });

      my.camera.readFrame();
    });
  }
}).start();
