function Premier() {


//1.导入http模块
    var http = require('http');
    var net = require('net')
    var crypto = require('crypto');

    var PORT = 2437;
    var HOST = '192.168.31.207';
    var isRunning = false;

//2.创建服务器
    var premier;
    var client;

    this.run = function () {
//3.添加响应事件
        premier = http.createServer();
        premier.on('request', function (req, res) {
            console.log(req.method);
            if (req.method === "POST") {
                var data = "";
                req.on("data", function (chunk) {
                    data += chunk;
                });
                req.on('end', function () {
                    data = decodeURI(data);
                    data = JSON.parse(data);
                    console.log(data)
                    resolve(data.opt, data.d, data.t, data.tk, res);
                    //res.end("RECEIVED");
                });
            }
        });


//4.监听端口号
        premier.listen(PORT, function () {
            console.log('Telegram总理服务器');
        });


//client 与telegram链接
        client = net.createConnection({port: 2436, host: HOST}, function () {
            console.log('premier已链接到telegram');
            client.write('{"action":"premier","data":""}');
            isRunning = true;
        });
        client.on('data', function (data) {
            console.log(data.toString());
        });
        client.on('error', function (e) {
            console.log('premier与telegram的链接发生错误');
        });
        client.on('end', function () {
            console.log('premier已与telegram断开');
        });
    };

    this.stop = function () {
        console.log("接到挂起命令\r");
        if(isRunning){
            console.log("--当前正在运行(Premier-Telegram)\r");
            premier.close();

            client.destroy();
            isRunning = false;
            console.log("--已停止(Premier-Telegram)服务器\r");
        }
    };

    this.getStatus = function () {
        return isRunning?"running":"stopped";
    };

    function resolve(opt, d, t, tk, res) {
        console.log("当前操作:" + opt);
        var r_TK = md5(opt+t+JSON.stringify(d));
        console.log("正确TOKEN:为"+r_TK);
        if (tk == r_TK) { //token的合法性判断:alp=opt+t+JSON(d);tk = md5(alp)
            switch (opt) {
                case "2s":
                    send2Single(d.m, d.u, res);
                    break;
                case "2g":
                    send2Users(d.m, d.u, res);
                    break;
                default:
                    res.end("操作非法");
            }
        } else {
            res.end("参数错误");
        }
    };

    function send2Single(m, u, res) {
        console.log("正在尝试发送给" + u);
        var q = {"action": "2s", "data": {"m":'{"action":"state","data":'+m+'}', "u": u}};
        q = JSON.stringify(q);
        console.log(q);
        client.write(q);
        res.end("已受理");

    };

    function send2Users(m, us, res) {
        console.log("正在尝试发送给" + us);
        var q = {"action": "2g", "data": {"m":'{"action":"state","data":'+m+'}', "us": us}};
        q = JSON.stringify(q);
        console.log(q);
        client.write(q);
        res.end("已受理");
    };

    var md5 = function(str){
        var crypto_md5 = crypto.createHash('md5');
        crypto_md5.update(str, 'utf8'); // 加入编码
        return crypto_md5.digest('hex');
    }
}
module.exports = Premier;