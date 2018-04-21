var express = require('express');
var router = express.Router();
var control = require('../Controllers/APIController');

router.post('/temp/update', function (req,res,next){
  control.changeTemp(req.body);
  res.redirect('/');
});

router.post('/control/update', function (req,res,next){
  control.insertTempControls(req.body);
  res.redirect('/');
})

module.exports = router;
