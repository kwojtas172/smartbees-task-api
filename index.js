const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

const { MongoClient } = require("mongodb");
const url = 'mongodb+srv://smartbees:izpXyBZ2osn8psXT@cluster0.j1p6v.mongodb.net';

app.use(cors());

app.get('/:id', (req, res) => {
    MongoClient.connect(url, function(err, data) {
        if (err) throw err;
        const db = data.db("smartbees");
        db.collection("carts").find({}).toArray(function(err, resultsArr) {
          if (err) throw err;
          console.log(resultsArr);
          data.close();
          const arrToSend = resultsArr.filter(cart => cart.id === Number(req.path.slice(1)))
          console.log(req.path)
          res.json(arrToSend)
        });
      });

  })
  
  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  })