'use strict'

const ws = require('nodejs-websocket')
const Hapi = require('hapi')
const Inert = require('inert')

const path = require('path')
const fs = require('fs')

const argv =
  require('yargs')
    .usage('Usage: $0 [--no-window] [--help]')
    .help('help')
    .boolean('window')
    .default('window', true)
    .argv

const EventedArray = require('./src/evented-array')
const robot = require('./src/robot')

const messageReceivedQueue = new EventedArray()

const clearMessageReceivedQueue = () => {
  messageReceivedQueue.clearArray()
}

const wsServer = ws.createServer(conn => {
  if (wsServer.connections.length === 1) {
    clearMessageReceivedQueue()
  }

  messageReceivedQueue.setHandler(() => {
    const recentMessage = messageReceivedQueue.pop()
    if (recentMessage) {
      const message = {
        facesDected: recentMessage.length,
        faceDetails: recentMessage
      }
      wsServer.connections.forEach((conn) => {
        conn.sendText(JSON.stringify(message))
      })
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

httpServer.register(Inert, new Function)

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
