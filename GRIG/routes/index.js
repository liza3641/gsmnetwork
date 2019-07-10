var express = require('express');
var router = express.Router();
var session = require('express-session');
var jd = require('../steamList.json');
const axios = require('axios');
const cheerio = require('cheerio');
const url = require('url');
let fs = require('fs');

var model = require('../models/loginDAO');
var Gmodel = require('../models/gameDAO');
const MongoStore = require('connect-mongo')(session);

router.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ url: 'mongodb://localhost/LoginUsers',
  collection: "sessions"
 })
}));

/* GET home page. */
router.get('/', function(req, res, next) {
    if(!req.session.name){
        req.session.name = null;
      }
  res.render('list', {title: 'GRIG',username: req.session.name, jdata: jd});
});

/* GET login page. */
router.get('/login', function(req, res, next) {
  res.render('login', { title: 'GRIG', username: req.session.name});
});


/* POST login page. */
router.post('/login', function(req, res, next) {
    if(req.body.name && req.body.email && req.body.password){
        model.UserList({query:{email: req.body.email},
        callback: function(docs){
            if(!docs){
                model.insertUser(req.body);
              res.render('login', { title: 'GRIG', username: req.session.name});
            }else{
                res.render('regierr', { title: 'GRIG', username: req.session.name});
            }
        }
        })
     }else{
        res.render('error');
     }
  });

  router.post('/check', function(req, res, next) {
    model.UserList({query:{email: req.body.email2},
    callback: function(docs){
        if(!docs){
            res.render('logerr', { title: 'GRIG', username: null, logerr: 0});
        }else{
            if(docs.email == req.body.email2 && docs.password == req.body.password2){
                req.session.name = docs.name;
                res.render('list', {title: 'GRIG', username: req.session.name, jdata: jd});
            }else{
                res.render('logerr', { title: 'GRIG', username: req.session.name, logerr: 1});
            }
        }
    }

    })
});

router.get('/logout', (req,res,next)=>{
    req.session.destroy((err)=>{
        if(err){
            console.log(err);
        }else{
            res.redirect('/');
        }
    });
})

router.get('/game/:id', (req,res,next)=>{
    res.render('game1', {title: 'GRIG',username: req.session.name, jdata: jd, GID: req.params.id});
})

router.get('/steam', function(req, res, next) {
    axios.get('https://store.steampowered.com/search/?filter=topsellers&tags=492&category1=998')
    .then((response) => {
        if(response.status === 200) {
            const html = response.data;
            const $ = cheerio.load(html); 
            let steamList = [];
            $('.search_result_row').each(function(i, elem) {                
                let Myurl = url.parse($(this).attr('href'));
                let myurlarray=Myurl.pathname.split('/');
                steamList[i] = {
                    title: $(this).find('div.responsive_search_name_combined div.ellipsis span.title').text(),
                    url: Myurl.href,
                    image: "https://steamcdn-a.akamaihd.net/steam/apps/"+myurlarray[2]+"/header.jpg",
                    price: $(this).find('div.search_price').text(),
                    id: i
                }      
            });
            const steamListTrimmed = steamList.filter(n => n != undefined )
            fs.writeFile('steamList.json', 
                          JSON.stringify(steamListTrimmed, null, 4), 
                          (err)=> console.log('File successfully written!'))
    }
}, (error) => console.log(error) )
res.redirect('/');
});

module.exports = router;