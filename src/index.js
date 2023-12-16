import express from 'express';
import bodyParser from 'body-parser';
import * as asterisk from './controllers/asterisk.controllers.js';
import './controllers/events.controllers.js';
import Asterisk from './routes/asterisk.routes.js';

const app = express();
const port = 3000;

// Parse JSON bodies
app.use(bodyParser.json());

app.use("/api/v1/asterisk", Asterisk);

// Ruta GET
app.get('/', (req, res) => {
    res.send('Hello World!');
})

app.use(function (req, res, next) {
    //console.log("REQ => ",req);
    res.status(404).send('Sorry cant find that!');
});

app.listen(port, () => {
    console.log(`Servidor ejecutándose en http://localhost:${port}`);
});