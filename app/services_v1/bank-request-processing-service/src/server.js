const express = require('express');
const app = express();
const fetch = require('node-fetch');
const cors = require('cors');
const Sequelize = require('sequelize')

const RESULT_SERVICE_HOSTNAME = process.env.RESULT_SERVICE_HOSTNAME || "bank-result-service" || "bank-results";
const RESULT_SERVICE_PORT = process.env.RESULT_SERVICE_PORT || 8085;
const REQUEST_PROCESSIN_SERVICE_PORT = process.env.REQUEST_PROCESSIN_SERVICE_PORT || 8084;
const MYSQL_USERNAME = process.env.MYSQL_USERNAME || 'root';
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || 'admin';
const MYSQL_PORT = process.env.MYSQL_PORT || '3306';
const MYSQL_DB_NAME = process.env.MYSQL_DB_NAME || 'bankapp';
const MYSQL_HOST_NAME = process.env.MYSQL_HOST_NAME || 'bank-mysql-server' || 'bank-mysql';

app.use(cors());
app.use(express.json());
app.set('trust proxy', true);

var server = app.listen(REQUEST_PROCESSIN_SERVICE_PORT, () => console.log(`Listening on ${REQUEST_PROCESSIN_SERVICE_PORT}`));

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
  if (withdraw_am) {
    try {
      var cards = await Cards.findAll({ where: { card_id: card_id} })
      //TODO
      var card_money = cards[0].card_money;
      cards[0].card_money = card_money - withdraw_am;
      await cards[0].save();
      const res = await fetch(`${resultService.name}/${resultService.endpoints.withdraw}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-card-id': request.get('x-card-id')
        },
        body: JSON.stringify({ success: true, messages: messages, data: cards[0].card_money, errors: errors })
      })
      const responseData = await res.json();
      response.status(res.status).send(responseData)
    } catch (e) {
      response.status(400).send();
    }
  } else {
    try {
      errors.push("Please contact with administrator")
      const res = await fetch(`${resultService.name}/${resultService.endpoints.withdraw}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': request.get('x-user-id')
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
  response.send("bank-request-processing-service alive")
})
app.post('/withdraw/', [withdraw]);




