/* config file */
global.config = require('./config.json');

/* express stuff */
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

// Declare an instance of express
const app = express();
const port = 3000;

app.use(bodyParser());
app.use(cors());

// Path joins the current directory name with views (aka current directory + views)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('index');
});

app.listen(port, function() {
  console.log('we are gucci');
});

/* twilio stuff */
const twilio = require('twilio');
const client = new twilio(config.twilioSid, config.twilioToken);

// client.messages.create({
//     body: 'hello world',
//     to: config.receiverNumber,  // Text this number
//     from: config.senderNumber // From a valid Twilio number
// })
// .then((message) => console.log(message.sid))
// .done();

/* firebase stuff */
const firebase = require("firebase");
const fbSettings = {
  apiKey: config.firebaseKey,
  authDomain: config.firebaseAuth,
  databaseURL:config.firebaseDB,
  storageBucket: config.firebaseSB,
};
firebase.initializeApp(fbSettings);

const databaseRef = firebase.database().ref();

/*//When a user submits a form, create a new page
app.post('/submit', urlencodedParser, function(req, res){
  var nom = req.body.nom;
    /* save nom to database */
  /*databaseRef.set ({
    uuid: {
      link: 'test'
    }
  });

  res.redirect('http://myDomain/' + nom);
});*/

// Add to the database
databaseRef.set({
  "testurl": {
    "link": 'fakeaudio'
  }
});

// Iterate through the database and convert each link into a web page
databaseRef.once("value")
  .then(function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      // key will be "ada" the first time and "alan" the second time
      var key = childSnapshot.key;
      app.get(`/${key}`, function(request, response) {
        response.render('test');
      });
      // childData will be the actual contents of the child
      var childData = childSnapshot.val();
  });
});

function createNewPage() {

}
