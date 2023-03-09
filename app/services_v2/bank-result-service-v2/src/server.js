const express = require('express');
const cors = require('cors');
const app = express();

const RESULT_SERVICE_PORT = process.env.RESULT_SERVICE_PORT || 8085;

app.set('trust proxy', true);
app.use(cors());
app.use(express.json());

var server = app.listen(RESULT_SERVICE_PORT, '0.0.0.0', () => console.log(`Listening on ${RESULT_SERVICE_PORT}`));

function simpleResponse(request, response) {
  var success = request.body.success;
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
  if (success) {
    messages.push(`Good results!`);
    response.status(200).json({ data: data, message: messages, errors:errors });
  } else {
    
    response.status(400).json({ data: data, message: messages, errors:errors});
  }
}

function notauth(request, response) {
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
  response.status(401).json({  data: data, message: messages, errors:errors });
}

app.post('/result-notauth/', notauth);
app.post('/result-login/', simpleResponse);
app.post('/result-logout/', simpleResponse);
app.post('/result-withdraw/', simpleResponse);
app.post('/result-check-account/', simpleResponse);


app.get('/aaa/', simpleResponse);


app.get('/', function (request, response) {
  response.send("bank-result-service alive")
})