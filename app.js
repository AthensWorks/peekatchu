'use strict'

const ws = require('nodejs-websocket')
const Hapi = require('hapi')
const inert = require('inert')
const Webpack = require('webpack')
const WebpackPlugin = require('hapi-webpack-plugin')

const path = require('path')
const fs = require('fs')

const argv =
  require('yargs')
    .usage('Usage: $0 [--no-window] [--help]')
    .help('help')
    .boolean('window')
    .default('window', true)
    .argv

const EventedArray = require('./server/evented-array')
const robot = require('./server/robot')

const messageReceivedQueue = new EventedArray()

const wsServer = ws.createServer(conn => {
  const clearMessageReceivedQueue = () => {
    messageReceivedQueue.clearArray()
  }

  let lastMessage = JSON.stringify(null)

  if (wsServer.connections.length === 1) {
    clearMessageReceivedQueue()
  }

  messageReceivedQueue.setHandler(() => {
    const recentMessage = messageReceivedQueue.pop()
    if (recentMessage) {
      const message = JSON.stringify({
        faces: recentMessage
      })

      if (message !== lastMessage) {
        lastMessage = message
        wsServer.connections.forEach((conn) => {
          conn.sendText(message)
        })
      }
    }
  })

  conn.on('error', err => console.log(err))

  conn.on('close', (code, reason) => {
    if (wsServer.connections.length === 0) {
      clearMessageReceivedQueue()
    }
  })
}).listen('8001')


const httpServer = new Hapi.Server({
  connections: {
    routes: {
      files: {
        relativeTo: path.join(__dirname, 'public')
      }
    }
  }
})

httpServer.connection({ port: '8080' })

httpServer.register(inert, new Function)
httpServer.register({
  register: WebpackPlugin,
  options: {
    compiler: new Webpack({
      entry: path.join(__dirname, 'client/index.js'),
      output: {
        path: '/'
      },
      loaders: [
        {
          test: /\.js$/,
          include: [ path.join(__dirname, 'client') ],
          loader: 'babel'
        }
      ]
    }),
    assets: {
      publicPath: '/assets/'
    }
  }
})

httpServer.route({
  method: 'GET',
  path: '/{param*}',
  handler: {
    directory: {
      path: path.join(__dirname, 'public'),
      redirectToSlash: true,
      index: true,
    }
  }
})

httpServer.start(err => {
  if (err) throw err

  console.log(`Server running at ${httpServer.info.uri}`)
})

robot(argv.window, messageReceivedQueue).start()
