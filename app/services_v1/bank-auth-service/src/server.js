const express = require('express');
const app = express();
const redis = require('redis');
const connectRedis = require('connect-redis');
const Sequelize = require('sequelize')
const session = require('express-session');
const cors = require('cors');
const fetch = require('node-fetch');


const AUTH_SERVICE_PORT = process.env.AUTH_SERVICE_PORT || 8081;
const RECEPTION_SERVICE_PORT = process.env.RECEPTION_SERVICE_PORT || 8083;
const RECEPTION_SERVICE_HOSTNAME  = process.env.RECEPTION_SERVICE_HOSTNAME || "bank-reception-service" || "bank-reception";
const RESULT_SERVICE_HOSTNAME = process.env.RESULT_SERVICE_HOSTNAME || "bank-result-service" || "bank-results";
const RESULT_SERVICE_PORT = process.env.RESULT_SERVICE_PORT || 8085;
const REQUEST_PROCESSIN_SERVICE_PORT = process.env.REQUEST_PROCESSIN_SERVICE_PORT || 8084;
const REQUEST_PROCESSIN_SERVICE_HOST = process.env.REQUEST_PROCESSIN_SERVICE_HOST || "bank-request-processing-service" || "bank-request-processing";
const MYSQL_USERNAME = process.env.MYSQL_USERNAME || 'root';
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || 'admin';
const MYSQL_PORT = process.env.MYSQL_PORT || '3306';
const MYSQL_DB_NAME = process.env.MYSQL_DB_NAME || 'bankapp';
const MYSQL_HOST_NAME = process.env.MYSQL_HOST_NAME || 'bank-mysql-server' || 'bank-mysql';
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const REDIS_HOST = process.env.REDIS_HOST || 'bank-redis-server' || 'bank-redis'


var server = app.listen(AUTH_SERVICE_PORT, () => console.log(`Listening on ${AUTH_SERVICE_PORT}`));

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

const sequelize = new Sequelize(MYSQL_DB_NAME, MYSQL_USERNAME, MYSQL_PASSWORD, {
    dialect: 'mysql',
    host: MYSQL_HOST_NAME,
    port: MYSQL_PORT,
    define: {
        timestamps: false
    }
});

const Cards = sequelize.define('cards', {
    card_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    card_number: Sequelize.INTEGER,
    card_pin: Sequelize.INTEGER,
    card_money: Sequelize.INTEGER
})

sequelize.sync().then(() => {
    console.log(`Database & tables created!`)
})

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
      cards: "result-cards",
      login: "result-login",
      logout: "result-logout",
      notauth: "result-notauth",
    }
  }


app.use(cors());
app.use(express.json());
app.use(sessionParser);

function setSession(request, loggedin, cardId, cardNumber) {
    request.session.loggedin = loggedin;
    request.session.cardId = cardId;
    request.session.cardNumber = cardNumber;
}

function destroySession(request) {
    request.session.destroy();
}

async function logout(request, response) {
    destroySession(request)
    try {
        const res = await fetch(`${resultService.name}/${resultService.endpoints.logout}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ success: true, messages: [], data: {} })
        })
        const responseData = await res.json();
        response.status(res.status).send(responseData);
    } catch (e) {
        response.status(400).send();
    }
}

async function checkSessions(request, response, next) {
    if (request.session.loggedin) {
        next();
    } else {
        try {
            const res = await fetch(`${resultService.name}/${resultService.endpoints.notauth}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
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

async function login(request, response) {
    var card_number = request.body.card_number;
    var card_pin = request.body.card_pin;
    if (card_number && card_pin) {
        try {
            var cards = await Cards.findAll({ where: { card_number: card_number, card_pin: card_pin } })
            if (cards.length >= 1) {
                setSession(request, true, cards[0].card_id, cards[0].card_pin)
                const res = await fetch(`${resultService.name}/${resultService.endpoints.login}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ success: true, messages: [], data: { card_id: cards[0].card_id, card_number: cards[0].card_number } })
                })
                const responseData = await res.json();
                response.status(res.status).send(responseData);
            } else {
                const res = await fetch(`${resultService.name}/${resultService.endpoints.login}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ success: false, messages: [], data: {}, errors: ["Card number or PIN not correct"] })
                })
                const responseData = await res.json();
                response.status(res.status).send(responseData);
            }
        } catch (e) {
            console.log(e)
            try {
                const res = await fetch(`${resultService.name}/${resultService.endpoints.login}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ success: false, messages: [], data: {}, errors: [e] })
                })
                const responseData = await res.json();
                response.status(res.status).send(responseData);
            } catch (e) {
                console.log(e)
                response.status(400).send();
            }
        }
    } else {
        try {
            const res = await fetch(`${resultService.name}/${resultService.endpoints.login}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ success: false, messages: [], data: {}, errors: ["No Card number or PIN"] })
            })
            const responseData = await res.json();
            response.status(res.status).send(responseData);
        } catch (e) {
            response.status(400).send();
        }
    }
}

app.get('/', function (request, response) {
    response.send("bank-auth-service alive")
})

app.post('/login/', [login]);

app.get('/logout/', [checkSessions, logout]);

