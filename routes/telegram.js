var express = require('express');
var Telegram = require("/Users/mile/IdeaProjects/NodeLearningProject/public/javascripts/Telegram.js");
var router = express.Router();
var telegram = new Telegram();

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log("当前状态："+telegram.getStatus());
    if(telegram.getStatus() == "running"){
        res.render('telegram', { title: 'Telegram控制台',status:"running",connectionsNumber:2,registeredNumber:1});
    }else {
        res.render('telegram', { title: 'Telegram控制台',status:"stopped",connectionsNumber:2,registeredNumber:1});
    }

});

router.get('/stop',function (req,res,next) {
    console.log("点击了挂起，当前唯一识别码："+telegram.getIdentifycode());
    telegram.stop();
    res.send('stop');
});

router.get('/run',function (req,res,next) {
    console.log("点击了运行,当前唯一识别码："+telegram.getIdentifycode());
    telegram.run();
    res.send("run");

});

module.exports = router;
