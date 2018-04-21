var express = require('express');
var router = express.Router();
var control = require('../Controllers/MQTTController');
var request = require('request');

/**
 * Used to give information to the user about the results of their attempts to do things
 */
var modified = false;
var deleted = false;

/**
 * renders the main temperature control page
 */
router.get('/', function(req, res, next) {
    control.getTemp(function (temp){
        res.render('index' , {"temp":temp});
    })
});

/**
 * Updates the temp
 */
router.post('/', function(req,res,next){
    control.updateTemp(req.body);
    res.redirect('/');
})

/**
 * loads the page that allows the creation, modification and deletion of settings
 */
router.get('/settings/create', function (req,res,next){
    control.getControls(function (controls){
        if (controls.length == 0) //if there are no controls
            res.render('settings', {"controls":controls, "modified":modified, "deleted": deleted});
        for (var i =0;i <controls.length; i ++){ // get all controls
            controls[i].index = i; //add an index for modification/deletion
            if (i == controls.length -1){
                res.render('settings', {"controls":controls, "modified":modified, "deleted": deleted});
                modified = false;
                deleted = false;
            }
        }
    });
});

/**
 * Loads up the update page (prepopulates values for the user
 */
router.get('/settings/update/:id', function (req,res,next){
    control.getControls(function (controls){
        var tempControls = controls;
        if (controls.length == 0)
            res.render('settings', {"controls":controls, "modified":modified, "deleted": deleted, "mainControl": tempControls[req.params.id]});
        for (var i =0;i <controls.length; i ++){
            tempControls[i].index = i; //add an index for modification and deletion
            if (i == controls.length -1){
                res.render('settings', {"controls":controls, "modified":modified, "deleted": deleted, "mainControl": tempControls[req.params.id]});
                modified = false;
                deleted = false;
            }
        }
    });
});

/**
 * pushes the vars to the mqtt server after updating them
 */
router.post('/settings/update/:id', function (req,res,next){
    control.getControls(function (controls){
        var fullJson = controls; //get the new json
        req.body.temp = parseInt(req.body.temp);
        fullJson.splice(req.params.id, 1); //remove the old json
        fullJson.push(req.body); //push it to the array
        control.publish(fullJson); //publish the array
        modified = true;
        res.redirect('/settings/create');
    });
})

/**
 * redirects to the delete post
 */
router.get('/settings/delete/:id', function (req,res,next){
    request.post('http://localhost:3001/settings/delete/' + req.params.id);
    res.redirect('/settings/create')
    deleted = true;
});

/**
 * deletes the specified index from the controls array
 */
router.post('/settings/delete/:id', function(req,res,next){
    control.getControls(function (controls){
        var fullJson = controls;
        fullJson.splice(req.params.id,1); //delete the old json
         control.publish(fullJson); //publish
         res.redirect('/settings/create');
    });
})

/**
 * creates a new index in the controls array
 */
router.post('/settings/create', function(req,res,next){
    control.getControls(function (controls){
        var fullJson = controls;
        req.body.temp = parseInt(req.body.temp);
        fullJson.push(req.body); //add new json to the array
        control.publish(fullJson); //publish it
        res.redirect('/settings/create');
    });
});


module.exports = router;
