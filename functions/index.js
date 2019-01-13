/* twilio stuff */
const twilio = require('twilio');
const config = require('./config.json');
const client = new twilio(config.twilioSid, config.twilioToken);

const functions = require('firebase-functions');

exports.textMessage = functions.database.ref('/{podcast}')
    .onCreate(event => {
      const data = event._data;

      client.messages.create({
          body: 'Your new podcast is available at https://itsrainingcastsandpods.com/' + data.id,
          to: config.receiverNumber,  // Text this number
          from: config.senderNumber // From a valid Twilio number
      })
      .then((message) => console.log(message.sid))
      .done();
    });
