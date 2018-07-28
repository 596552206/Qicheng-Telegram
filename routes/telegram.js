var express = require('express');
var Telegram = require('../public/javascripts/telegram.js');
var Premier = require('../public/javascripts/Premier.js')
var router = express.Router();
var telegram = new Telegram();
var premier = new Premier();

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log("当前状态 ："+telegram.getStatus());
    res.render('telegram',{title:"Telegram控制台",status:telegram.getStatus(),p_status:"p_"+premier.getStatus(),registeredNumber:telegram.getRegisteredNum()});

});

router.get('/stop',function (req,res,next) {
    console.log("点击了挂起(当前状态："+telegram.getStatus()+")，当前唯一识别码："+telegram.getIdentifycode());
    telegram.stop();
    if(premier.getStatus() == "running")premier.stop();
    res.send('ok');
});

router.get('/run',function (req,res,next) {
    console.log("点击了运行(当前状态："+telegram.getStatus()+"),当前唯一识别码："+telegram.getIdentifycode());
    telegram.run();
    res.send("ok");

});

router.get('/pstop',function (req,res,next) {
    console.log("点击了挂起总理(当前状态："+premier.getStatus()+")");
    premier.stop();
    res.send('ok');
});

router.get('/prun',function (req,res,next) {
    if(telegram.getStatus() == "running") {
        console.log("点击了运行总理(当前状态：" + premier.getStatus() + ")");
        premier.run();
        res.send("ok");
    }else {
        res.send("Premier必须在Telegram启动后在运行。");
    }

});

module.exports = router;
