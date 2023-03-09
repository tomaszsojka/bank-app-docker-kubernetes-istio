const express = require('express');
const app = express();
const redis = require('redis');
const connectRedis = require('connect-redis');
const session = require('express-session');
const cors = require('cors');
const fetch = require('node-fetch');

const ACCESS_SERVICE_PORT = process.env.ACCESS_SERVICE_PORT || 8080;
const RECEPTION_SERVICE_PORT = process.env.RECEPTION_SERVICE_PORT || 8083;
const RECEPTION_SERVICE_HOST = process.env.RECEPTION_SERVICE_HOST || "bank-reception-service" || "bank-reception";
const RESULT_SERVICE_HOSTNAME = process.env.RESULT_SERVICE_HOSTNAME || "bank-result-service" || "bank-results";
const RESULT_SERVICE_PORT = process.env.RESULT_SERVICE_PORT || 8085;
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const REDIS_HOST = process.env.REDIS_HOST || 'bank-redis-server' || 'bank-redis'

var server = app.listen(ACCESS_SERVICE_PORT, () => console.log(`Listening on ${ACCESS_SERVICE_PORT}`));

const RedisStore = connectRedis(session)

const redisClient = redis.createClient({
    url: `redis://${REDIS_HOST}:${REDIS_PORT}`,
    legacyMode: true
})

redisClient.connect().catch(console.error)

redisClient.on('error', function (err) {
    console.log('Could not establish a connection with redis. ' + err);
});

redisClient.on('connect', function (err) {
    console.log('Connected to redis successfully');
});

const sessionParser = session({
    store: new RedisStore({ client: redisClient }),
    secret: 'secret$%^134',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: false,
        maxAge: 1000 * 60 * 10
    }
})

resultService = {
    name: `http://${RESULT_SERVICE_HOSTNAME}:${RESULT_SERVICE_PORT}`,
    endpoints: {
        login: "result-login",
        logout: "result-logout",
        notauth: "result-notauth",
    }
}

receptionService = {
    name: `http://${RECEPTION_SERVICE_HOST}:${RECEPTION_SERVICE_PORT}`,
    endpoints: {
        withdraw: "withdraw",
        checkaccount: "check-account",
    }
}

app.use(cors());
app.use(express.json());
app.use(sessionParser);

async function checkSessions(request, response, next) {
    if (request.session.loggedin) {
        next();
    } else {
        try {
            const res = await fetch(`${resultService.name}/${resultService.endpoints.notauth}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-card-id': 0
                },
                body: JSON.stringify({ success: false, messages: [], data: {}, errors: [] })
            })
            const responseData = await res.json();
            response.status(res.status).send(responseData);
        } catch (e) {
            response.status(400).send();
        }
    }
}

async function checkAccount(request, response) {
    var data = request.body;
    try {
        var messages = [];
        messages.push(`User validated by access service, account ballance can be checked.`);
        const res = await fetch(`${receptionService.name}/${receptionService.endpoints.checkaccount}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-card-id': request.session.cardId
            },
            body: JSON.stringify({ data: data, messages: messages })
        })
        const responseData = await res.json();
        response.status(res.status).send(responseData);
    } catch (e) {
        response.status(400).send();
    }
}

async function withdraw(request, response) {
    var data = request.body;
    try {
        var messages = [];
        messages.push(`User validated by access service, withdrawal process can start.`);
        const res = await fetch(`${receptionService.name}/${receptionService.endpoints.withdraw}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-card-id': request.session.cardId
            },
            body: JSON.stringify({ data: data, messages: messages })
        })
        const responseData = await res.json();
        response.status(res.status).send(responseData);
    } catch (e) {
        response.status(400).send();
    }
}

app.get('/', function (request, response) {
    response.send("bank-access-service alive")
})
app.post('/check-account/', [checkSessions, checkAccount]);
app.post('/withdraw/', [checkSessions, withdraw]);

