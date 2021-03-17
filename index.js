const env = process.env.NODE_ENV || 'development';
const config = require('./config/config')[env];
const errorLog = require('./models/errorHandler')

// const fs = require('fs');
// const http = require('http');
// const https = require('https');
// const privateKey  = fs.readFileSync(__dirname + '/sslcert/key.pem', 'utf8');
// const certificate = fs.readFileSync(__dirname + '/sslcert/cert.pem', 'utf8');
// const credentials = {key: privateKey, cert: certificate};
// const httpServer = http.createServer(app);
// const httpsServer = https.createServer(credentials, app);
console.log('IVO')

const express = require('express');
const app = express()
const cors = require('cors');

const connectDB = require('./config/connectDB')
const stockRouter = require('./src/stock/routerStock');
const editRouter = require('./src/edit/routerEdit');

connectDB().then(() => {
    console.log('connected')

    app.use(cors({origin: process.env.EXR_CORS_ORIGIN || "http://localhost:3000"}));
    // app.use((req, res, next) => {
    //     res.header('Access-Control-Allow-Origin', '*');
    //     next();
    //   });
    // {origin: "http://localhost:3000", allowedHeaders: ['Content-Type', 'Auth']}

    app.use(express.json())
    // app.use(express.urlencoded({ extended: true }))

    // app.use(cookieParser())

    app.use('/api/stock', stockRouter);
    app.use('/api/edit', editRouter);
    app.use('*', (req, res, next) => res.send('<h1> Something went wrong. Try again. :thumbsup: </h1>'))

    app.use(function (err, req, res, next) {
        console.error(err.message);
        const { code, message } = err
        errorLog(message)
        res.status(code || 409).json(message);
        console.log('*'.repeat(90))
    });

    app.listen(process.env.PORT || 3333, () => console.log(`Listening on port ${config.port}! Now its up to you...`));

    // httpServer.listen(3333, console.log(`Listening on port ${config.port}! Now its up to you...`));
    // httpsServer.listen(4444, console.log(`Listening on port ${4444}! Now its up to you...`));
})
