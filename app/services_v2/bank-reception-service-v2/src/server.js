const express = require('express');
const app = express();
const fetch = require('node-fetch');
const cors = require('cors');
const { Op } = require("sequelize");
const Sequelize = require('sequelize')

const RECEPTION_SERVICE_PORT = process.env.RECEPTION_SERVICE_PORT || 8083;
const RESULT_SERVICE_HOSTNAME = process.env.RESULT_SERVICE_HOSTNAME || "bank-result-service" || "bank-results";
const RESULT_SERVICE_PORT = process.env.RESULT_SERVICE_PORT || 8085;
const REQUEST_PROCESSIN_SERVICE_PORT = process.env.REQUEST_PROCESSIN_SERVICE_PORT || 8084;
const REQUEST_PROCESSIN_SERVICE_HOST = process.env.REQUEST_PROCESSIN_SERVICE_HOST || "bank-request-processing-service" || "bank-request-processing";
const MYSQL_USERNAME = process.env.MYSQL_USERNAME || 'root';
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || 'admin';
const MYSQL_PORT = process.env.MYSQL_PORT || 3306;
const MYSQL_DB_NAME = process.env.MYSQL_DB_NAME || 'bankapp';
const MYSQL_HOST_NAME = process.env.MYSQL_HOST_NAME || 'bank-mysql-server' || 'bank-mysql';

app.use(cors());
app.use(express.json());
app.set('trust proxy', true);

var server = app.listen(RECEPTION_SERVICE_PORT, () => console.log(`Listening on ${RECEPTION_SERVICE_PORT}`));

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

resultService = {
  name: `http://${RESULT_SERVICE_HOSTNAME}:${RESULT_SERVICE_PORT}`,
  endpoints: {
    withdraw: "result-withdraw",
    checkaccount: "result-check-account",
  }
}
requestProcessingService = {
  name: `http://${REQUEST_PROCESSIN_SERVICE_HOST}:${REQUEST_PROCESSIN_SERVICE_PORT}`,
  endpoints: {
    withdraw: "withdraw",
    checkaccount: "check-account",
  }
}


async function withdraw(request, response) {
  var messages = request.body.messages;
  var errors = request.body.errors;
  var data = request.body.data;

  if (!data) {
    data = {}
  }
  if (!messages) {
    messages = []
  }
  if (!errors) {
    errors = []
  }

  var withdraw_am = data.withdraw_am;
  var card_id = request.get('x-card-id');
  try {
    var cards = await Cards.findAll({ where: { card_id: card_id} })
    if (cards.length >= 1) {
        try {
            if (cards[0].card_money >= withdraw_am) {
                // enough money on account
                messages.push("You have enough money to withdraw");
                const res = await fetch(`${requestProcessingService.name}/${requestProcessingService.endpoints.withdraw}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-card-id': request.get('x-card-id')
                },
                body: JSON.stringify({ success: true, messages: messages, data: data, errors: errors })
                })
                const responseData = await res.json();
                response.status(res.status).send(responseData);
            } else {
                errors.push("Not enough money to withdraw");
                const res = await fetch(`${resultService.name}/${resultService.endpoints.withdraw}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ success: false, messages: messages, data: {}, errors: errors })
                })
                const responseData = await res.json();
                response.status(res.status).send(responseData);
            }
        } catch (e) {
            response.status(400).send();
        }
    } else {
        errors.push("Card id not found")
        const res = await fetch(`${resultService.name}/${resultService.endpoints.withdraw}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ success: false, messages: [], data: {}, errors: errors })
        })
        const responseData = await res.json();
        response.status(res.status).send(responseData);
    }
  } catch (e) {
    try {
      errors.push(e)
      const res = await fetch(`${resultService.name}/${resultService.endpoints.withdraw}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-card-id': request.get('x-card-id')
        },
        body: JSON.stringify({ success: false, messages: messages, data: {}, errors: errors })
      })
      const responseData = await res.json();
      response.status(res.status).send(responseData);
    } catch (e) {
      response.status(400).send();
    }
  }
}


async function checkAccount(request, response) {
  var messages = request.body.messages;
  var errors = request.body.errors;
  var data = request.body.data;

  if (!data) {
    data = {}
  }
  if (!messages) {
    messages = []
  }
  if (!errors) {
    errors = []
  }

  var card_id = request.get('x-card-id');
  try {
    var cards = await Cards.findAll({ where: { card_id: card_id} })
    if (cards.length >= 1) {
      messages.push(`Account balance on card ${cards[0].card_number} for the day ${new Date().toISOString()} is ${cards[0].card_money}.`);
      const res = await fetch(`${resultService.name}/${resultService.endpoints.checkaccount}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-card-id': request.get('x-card-id')
        },
        body: JSON.stringify({ success: true, messages: messages, data: cards[0].card_money, errors: errors })
      })
      const responseData = await res.json();
      response.status(res.status).send(responseData);
    } else {
        const res = await fetch(`${resultService.name}/${resultService.endpoints.checkaccount}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ success: false, messages: [], data: {}, errors: ["Card id not found"] })
        })
        const responseData = await res.json();
        response.status(res.status).send(responseData);
    }
  } catch (e) {
    try {
      errors.push(e)
      const res = await fetch(`${resultService.name}/${resultService.endpoints.checkaccount}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-card-id': request.get('x-card-id')
        },
        body: JSON.stringify({ success: false, messages: messages, data: {}, errors: errors })
      })
      const responseData = await res.json();
      response.status(res.status).send(responseData);
    } catch (e) {
      response.status(400).send();
    }
  }
}

app.get('/', function (request, response) {
  response.send("bank-reception-service alive")
})

app.post('/check-account/', [checkAccount]);
app.post('/withdraw/', [withdraw]);




