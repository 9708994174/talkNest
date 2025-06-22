const { createServer } = require("http")
const { parse } = require("url")
const next = require("next")
const { SocketManager } = require("./lib/socket-server")

const dev = process.env.NODE_ENV !== "production"
const hostname = process.env.HOSTNAME || "localhost"
const port = Number.parseInt(process.env.PORT || "3000", 10)
const socketPort = Number.parseInt(process.env.SOCKET_PORT || "3001", 10)

// Initialize Next.js
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  // Create HTTP server for Next.js
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error("Error occurred handling", req.url, err)
      res.statusCode = 500
      res.end("internal server error")
    }
  })

  // Start Next.js server
  server.listen(port, (err) => {
    if (err) throw err
    console.log(`> Next.js ready on http://${hostname}:${port}`)
  })

  // Create separate HTTP server for Socket.IO
  const socketServer = createServer()

  // Initialize Socket.IO
  const socketManager = new SocketManager(socketServer)

  // Start Socket.IO server
  socketServer.listen(socketPort, (err) => {
    if (err) throw err
    console.log(`> Socket.IO ready on http://${hostname}:${socketPort}`)
  })
})
