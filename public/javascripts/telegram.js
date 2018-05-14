function Telegram() {
    var net = require('net');
    var PORT = 2436;
    var HOST = '127.0.0.1';
    var server;
    var isRunning=false;
    var identifyCode;
    var intervalID;
    var userSockets = require("./hashTable");


    this.run = function () {
        console.log("收到启动命令\r");
        console.log("--正在注册事件\r");
        server = net.createServer(function(socket){
            console.log(socket.remoteAddress + ':' + socket.remotePort+">>已连接到server");
            socket.write('Server<<链接成功，\r----服务器地址:'+HOST+":"+PORT+"\r----当前客户机地址:"+socket.remoteAddress + ':' + socket.remotePort+"\r");
            socket.on('data', function(data){
                //console.log('服务端：收到客户端数据，内容为:'+ data.toString());
                solve(data,socket);
                // 给客户端返回数据
            });
            socket.on('close', function(){
                userSockets.remove(userSockets.getKey(socket));
                console.log(socket.remoteAddress + ':' + socket.remotePort+">>断开连接");
            });
        });
        console.log("--事件注册完毕\r");
        console.log("--正在启动监听\r");
        server.listen(PORT, HOST, function(){
            console.log('Server<<开始监听'+PORT+"端口");
            identifyCode = new Date().getTime();
            intervalID = setInterval(function () {
                console.log("TELEGRAM状态：Running；唯一识别码："+identifyCode+";已运行时间："+((new Date().getTime())-identifyCode)+"毫秒；注册数："+userSockets.getSize()+"。")
            },1000);
        });
        console.log("--监听启动成功\r");
        isRunning = true;
        console.log("Server<<Running\r");
    }

    this.stop = function () {
        console.log("接到挂起命令\r");
        if(isRunning){
            console.log("--当前正在运行\r");
            server.close();
            isRunning = false;
            console.log("--已停止服务器\r");
            clearInterval(intervalID);
            console.log("--已停止心跳报文\r");
            console.log("Server<<STOPPED.\r");
        }
    }


    this.getStatus = function () {
        return isRunning?"running":"stopped";
    }

    this.getIdentifycode = function () {
        return identifyCode;
    }

    solve = function (data,socket) {
        if(typeof data != "string"){
            data = data.toString();
        }
        data = data.replace(/[\r\n]/g,"");//收到的data有换行符；
        try {
            data = JSON.parse(data);//转换为对象

            console.log(socket.remoteAddress + ':' + socket.remotePort+">>"+data);
            switch(data.action){
                case 'register':
                    register(data.data,socket);
                    break;
                case 'unregister':
                    if(socket)unregister(data.data,socket);
                    break;
                case 'notify':
                    console.log('Server<<notified');
                    socket.write("notified");
                    break;
                default:
                    socket.write("unknown");
                    break;
            }
        }catch (e){
            socket.write("Server>>数据解析错误，所收到数据为：\r"+"____ "+data+"\r"+"错误为："+e+"\r");
        }
    }

    register = function (id,socket) {
        if(userSockets.containKey(id)){
            socket.write("Server>>注册失败，此用户已注册");
        }else {
            userSockets.add(id,socket);
            console.log('Server<<已将'+socket.remoteAddress + ':' + socket.remotePort+"注册入集");
            socket.write("Server>>注册成功");
            say2Id(id,"您已以"+id+"的身份入集");
        }
    }

    unregister = function (id,socket) {
        if (userSockets.containKey(id)) {
            socket.write("Server>>成功退出");
            userSockets.remove(id);
        }
        console.log('Server<<已将'+socket.remoteAddress + ':' + socket.remotePort+"退出集");

    }

    say2Id = function (id,msg) {
        if (userSockets.containKey(id)){
            console.log("向"+id+"发送信息:"+msg);
            userSockets.getValue(id).write(msg);
        }else {
            console.log("信息发送失败");
        }
    }

    say2Ids = function (ids,msg) {
        console.log("向"+ids.getIdsArray().length+"位用户发送信息");
        for (x in ids.getIdsArray()){
            say2Id(ids.getIdsArray()[x],msg);
        }
    }
}
module.exports =  Telegram;