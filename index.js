const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const {google} = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const credits = require('./config');

const PORT = process.env.PORT || 3000;
const app = express();
app.use(bodyParser.json());

const myOAuth2Client = new OAuth2(
  credits.CLIENT_ID,
  credits.CLIENT_SECRET,
  credits.REDIRECT_URI
)

myOAuth2Client.setCredentials({refresh_token: credits.REFRESH_TOKEN});

const myAccessToken = myOAuth2Client.getAccessToken();

const transport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: credits.GMAIL_USER,
    clientId: credits.CLIENT_ID,
    clientSecret: credits.CLIENT_SECRET,
    refreshToken: credits.REFRESH_TOKEN,
    accessToken: myAccessToken
  }
})

// For verifying SMTP connection is working:
transport.verify((err, success) => {
  if (err) {
    console.log(err);
  } 
  else {
    console.log("Server is ready to take our messages!");
  }
});

// default endpoint:
app.get('/', (req, res) => {
  res.send({message: 'Default route in pizzeria contact form'})
});

app.post('/sendemail', (req, res) => {

  const mailOptions = {
    from: credits.GMAIL_USER,
    to: req.body.email,
    subject: 'Hello from test nodemailer email',
    text: 'TEST2, You received this email via nodemailer',
    html: '<p>TEST2, You received this email via nodemailer<p>'
  }
  transport.sendMail(mailOptions, (err, result) => {
    if(err) {
      res.send({message: err})
    }
    else {
      res.send({message: 'Email has been send, check your inbox'});
      transport.close();
    }
  })
})

app.listen(PORT, (req, res) => {
  console.log(`App listening on port ${PORT}`)
});
