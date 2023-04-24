import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const dotenv = require('dotenv');

dotenv.config();


const app: Express = express();
const port = 80;
const allowedOrigins = ['http://localhost:3000', 'http://localhost:90'];

const options: cors.CorsOptions = {
  origin: allowedOrigins
};

// Types
interface ClientInterface {
  id: number,
  res: any
}

// functions

const removeClient = (id: number, clients: ClientInterface[]) => {
  const index = clients.findIndex(client => client.id === id)
  clients.splice(index, 1)
  console.log(`Client disconnected: ${id}`)
  return clients
}

// SSE Implementation

//Store connected clients
const clients: ClientInterface[] = [];

const addSubscriber = (_req: Request, res: Response) => {
  const headers = {
    //Set necessary headers to stablish a stream of events
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
  }
  res.writeHead(200, headers)

  // Add a new client that just connected
  const id = Date.now();
  // Store the id and the whole response object
  const client: ClientInterface = {
    id, res
  }
  clients.push(client)
  console.log(`Client connected: ${id}`)


  //Remove the client from the subscribers when the connection is closed
  _req.on("close", () => {
    clients.forEach((client) => {
      (client.id !== id) ?? removeClient(id, clients)
    })
  })
}

//Send a message to each subscriber
const notifySubscribers = (message: string) => {
  clients.forEach((client: ClientInterface) => {
    // The two \n\n means that the message will be sent
    client.res.write(`data: ${JSON.stringify(message)}\n\n`)
  })
}

// Add a new message and send it to all subscribed clients
const addMessage = (_req: Request, res: Response) => {
  const message = _req.body

  // Return the message as a response for the "/message" call 
  res.json(message)
  return notifySubscribers(message)
}

//Get a number of the clients subscribed
const getSubscribers = (_req: Request, res: Response) => {
  return res.json(clients.length)
}

// API
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors(options))

app.get('/', (req: Request, res: Response) => {
  res.send("SSE API Server");
});

app.listen(port, () => {
  console.log(`⚡️[server]: SSE API Server is running at http://localhost:${port}`);
});
app.get("/subscribe", addSubscriber);
app.post("/message", addMessage);
app.get("/status", getSubscribers)