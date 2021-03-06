const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

require('dotenv').config()

const { MongoClient } = require("mongodb");
const url = process.env.DB_URL;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => { // redirect to /1
  res.redirect('/1');
})

app.get('/:id', (req, res) => { //regular id: 1-5
  if(Number(req.path.slice(1)) < 1 || Number(req.path.slice(1)) > 5) return res.end();
    MongoClient.connect(url, function(err, data) {
        if (err) throw err;
        const db = data.db("smartbees");
        db.collection("carts").find({}).toArray(function(err, resultsArr) {
          if (err) throw err;
          data.close();
          const arrToSend = resultsArr.filter(cart => cart.id === Number(req.path.slice(1)));
          res.json(arrToSend);
        });
      });

  });


app.post('/users', (req, res) => { //for checking to existing user
  const user = req.body;
  MongoClient.connect(url, function(err, data) {
    if (err) throw err;
    const db = data.db("smartbees");
    db.collection("users").findOne({user: user.username}, function(err, result) {
      if (err) throw err;
      data.close();
      if(result && (result.password === user.password)) {
        res.json(result);
      } else res.json({response: 'user or password not found'})
    });
  });

})

app.post('/discounts', (req, res) => { //to check is discount code is existing and active

  const code = req.body.code;

  MongoClient.connect(url, function(err, data) {
    if (err) throw err;
    const db = data.db("smartbees");
    db.collection("discounts").findOne({code: code}, function(err, result) {
      if (err) throw err;
      data.close();
      if(result && result.isActive) {
        res.json(result);
      } else res.json({response: 'code not found or is not active'})
    });
  });

});

app.post('/orders', (req, res) => { //to validate and add order to db
    const form = req.body;
    const patternText = new RegExp('^[A-Z][a-zżźćńółęąśŻŹĆĄŚĘŁÓŃ]{2,50}$');
    const patternAddress = new RegExp('^[A-Za-z0-9żźćńółęąśŻŹĆĄŚĘŁÓŃ \/]{2,99}$');
    const patternEmail = new RegExp('^[A-Za-z0-9._]{2,}@[a-z]{1,}[.][a-z]{1,}$');
    const patternPostalCode = new RegExp('^[0-9]{2}[-][0-9]{3}$');
    const patternPhoneNumber = new RegExp('^[0-9]{9}$');

    const user = form.user;
    const order = form.order;

   if(patternText.test(user.name) && patternText.test(user.surname) && patternText.test(user.city) && patternEmail.test(user.email) && patternAddress.test(user.address) && patternPostalCode.test(user.postalCode) && patternPhoneNumber.test(user.phoneNumber) && order.deliveryMethod && order.paymentMethod) {
     
      MongoClient.connect(url, function(err, data) {
        if (err) throw err;
        const db = data.db("smartbees");
        db.collection("orders").insertOne({form}, function(err, result) {
          if (err) throw err;
          data.close();
          if(result) {
            res.json(result);
          } else res.json({response: 'data incorrect'})
        });
      });


   } else res.json({response: 'data incorrect'});

})
  
  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  })