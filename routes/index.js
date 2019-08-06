var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/test', function(req, res, next) {
  res.render('index', { title: 'Test' });
});
router.post('/', function(req, res, next){
  const data = req.body;
  console.log(data);
  res.json(data);
  
})
module.exports = router;
