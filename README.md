# peekatchu

## Install

First install OpenCV. If you're on a Mac we recommend using (Homebrew)[http://brew.sh]:

`brew install homebrew/science/opencv`

*(you may fist need to `brew install pkg-config`)*

then install the rest of the npm modules:

`npm install`

## Run

`npm start`

To run without the window that shows video feedback:

`node app.js --no-window`

## Camera Options

Cylon doesn't allow for manipulation of camera resolution or frame rate. You can use `ffmpeg` to manipulate the camera options *after* launch.

####To Install ffmpeg on a Mac using Homebrew

`brew install ffmpeg`

then

`ffmpeg -f avfoundation -video_device_index 1 -video_size "432x240" -framerate 30 -pixel_format 0rgb -i ""`
