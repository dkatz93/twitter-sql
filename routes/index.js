'use strict';
var express = require('express');
var router = express.Router();
var tweetBank = require('../tweetBank');

var client = require('../db')

module.exports = function makeRouterWithSockets (io) {

  // a reusable function
  function respondWithAllTweets (req, res, next){
    // console.log('client', client)

    client.query('SELECT * FROM tweets JOIN users ON users.id = tweets.userid', function(err, data){
      // console.log(data);
      res.render('index', {
        title: 'Twitter.js',
        tweets: data.rows,
        showForm: true
       });
    }) // tweetBank.list();

  }

  // here we basically treat the root view and tweets view as identical
  router.get('/', respondWithAllTweets);
  router.get('/tweets', respondWithAllTweets);
  
  router.get('/tweets/:id', function(req, res, next){
    client.query(
      `SELECT * FROM tweets WHERE id = ${req.params.id}`, function(err,data){
        res.render('index', {
          title: 'Twitter.js',
          tweets: data.rows // an array of only one element ;-)
    });
  });
});
  // single-user page
  router.get('/users/:name', function(req, res, next){
    client.query(
      `SELECT * FROM tweets 
      JOIN users ON users.id = tweets.userid 
      WHERE users.name = $1`, [req.params.name], function(err,data){
        // console.log(data)
        res.render('index', {
          title: 'Twitter.js',
          tweets: data.rows,
          showForm: true
          // username: req.params.name
        });
      })   //tweetBank.find({ name: req.params.username });
  });

  // single-tweet page


  // create a new tweet
  router.post('/tweets', function(req, res, next){
    client.query('SELECT * FROM users WHERE name = $1', [req.body.name], function(err, data){
      if(data.rows[0]){
       client.query('INSERT INTO tweets (userid, content) VALUES ($1, $2)', [data.rows[0].id, req.body.content], function(err,data){
       })
     } else {
      client.query('INSERT INTO users (name, pictureurl) VALUES ($1, $2)', [req.body.name, 'http://i.imgur.com/MItGWVS.jpg'], function(err,data){
       })
      client.query('SELECT * FROM users WHERE name = $1', [req.body.name], function(err, data){
          client.query('INSERT INTO tweets (userid, content) VALUES ($1, $2)', [data.rows[0].id, req.body.content], function(err,data){
        })
      })

     }
     res.redirect('/');

    })
    
    
  });

  // // replaced this hard-coded route with general static routing in app.js
  // router.get('/stylesheets/style.css', function(req, res, next){
  //   res.sendFile('/stylesheets/style.css', { root: __dirname + '/../public/' });
  // });

  return router;
}
