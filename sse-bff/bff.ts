
import cors from 'cors';
import express, { Express, Request, Response } from 'express';

const dotenv = require('dotenv');
dotenv.config();
const app: Express = express();
const port = 90;
const allowedOrigins = ['http://localhost:3000'];

export const options: cors.CorsOptions = {
    origin: allowedOrigins
};
console.log('alo')
// Get the message and store it 
const handleReceiveMessage = (event: any) => {
    const eventData = JSON.parse(event.data);
    const data = { ...eventData };
    console.log({ data })
};
const eventSource = new EventSource("http://localhost:80/subscribe");
const subscribe = () => {
    eventSource.addEventListener("message", handleReceiveMessage);
    return () => {
        // Remove event listener and close the connection
        eventSource.removeEventListener("message", handleReceiveMessage);
        eventSource.close()
    }
}

// BFF
// API
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors(options))

app.get('/', (req: Request, res: Response) => {
    console.log('get')
    res.send("SSE BFF Server");
    // res.send(subscribe)
    console.log(subscribe)
});

app.listen(port, () => {
    console.log(`⚡️[server]: SSE BFF Server is running at http://localhost:${port}`);
});