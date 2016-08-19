"use strict";

// require ("math");

var Cylon = require("cylon");

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
        im.resize(im.width()*.5, im.height()*.5)

        if( this.faces === undefined ) {
          // setup
          this.faces = faces;
        }

        var persistentFaces = [];
        var matchedAnyFace = false;

        // console.log("faces count: " + faces.length);

        for (var i = 0; i < faces.length; i++) {
          var face = faces[i];
          var matchedMultipleFrames = false;

          for (var c = 0; c < this.faces.length; c++) {
            var otherFace = this.faces[c];

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

          im.rectangle(
            [face.x*.5, face.y*.5],
            [face.width*.5, face.height*.5],
            color,
            2
          );

        }

        if (matchedAnyFace === false) {
          // reset faces array

          // console.log("reset");
          this.faces = faces;
        }

        // The second to last param is the color of the rectangle
        // as an rgb array e.g. [r,g,b].
        // Once the image has been updated with rectangles around
        // the faces detected, we display it in our window.
        my.window.show(im, 40);

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
