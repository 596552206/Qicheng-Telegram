function Telegram() {
    var net = require('net');
    var PORT = 2436;
    var HOST = '192.168.31.207';
    var server;
    var isRunning=false;
    var identifyCode;
    var intervalID;
    var HashTable = require("./hashTable");
    var userSockets = new HashTable();
    var waitingQueue = new HashTable();

    this.run = function () {
        console.log("收到启动命令\r");
        console.log("--正在注册事件\r");
        server = net.createServer(function(socket){
            console.log(socket.remoteAddress + ':' + socket.remotePort+">>已连接到server");
            //socket.write('Server<<链接成功，\r----服务器地址:'+HOST+":"+PORT+"\r----当前客户机地址:"+socket.remoteAddress + ':' + socket.remotePort+"\r");
            socket.write("{\"action\":\"text\",\"data\":\"链接到Telegram服务器成功\"}"+"\r");
            socket.on('data', function(data){
                //console.log('服务端：收到客户端数据，内容为:'+ data.toString());
                solve(data,socket);
                // 给客户端返回数据
            });
            socket.on('error',function (e) {
                console.log("遇到错误"+e.stack);
            });
            socket.on('close', function(){
                userSockets.remove(userSockets.getKey(socket));
                console.log(socket.remoteAddress + ':' + socket.remotePort+">>断开连接\r");
            });

        });

        console.log("--事件注册完毕\r");
        console.log("--正在启动监听\r");
        server.listen(PORT, HOST, function(){
            console.log('Server<<开始监听'+PORT+"端口\r");
            identifyCode = new Date().getTime();
            intervalID = setInterval(function () {
                retry();
                console.log("TELEGRAM状态：Running；唯一识别码："+identifyCode+";已运行时间："+((new Date().getTime())-identifyCode)+"毫秒；注册数："+userSockets.getSize()+"。\r")
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
            userSockets.getAllValues().forEach(function (value) {
                value.write("{\"action\":\"text\",\"data\":\"Telegram服务器主动断开\"}"+"\r");
                value.destroy();
            });
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
    this.getRegisteredNum = function () {
        return userSockets.getSize();
    }

    retry = function () {
        console.log(+waitingQueue.getSize()+"为用户在等待尝试");
        if (waitingQueue.getSize() != 0){
            waitingQueue.getAllKeys().forEach(function (id) {
                if (userSockets.containKey(id) == true){
                    console.log("重新向"+id+"发送信息:"+waitingQueue.getValue(id).msg+"\r");
                    (userSockets.getValue(id)).write(waitingQueue.getValue(id).msg+"\r");
                    waitingQueue.remove(id);
                    console.log("重新向"+id+"发送信息成功");
                    return true;
                }else {
                    if(waitingQueue.getValue(id).time >= 9){
                        console.log("信息发送失败,用户"+id+"不在集中,已终止重试。"+"\r");
                        waitingQueue.remove(id);
                        return "信息发送失败,用户"+id+"不在集中，已终止重试。";
                    }else {
                        waitingQueue.getValue(id).time++;
                        console.log("信息发送失败,用户"+id+"不在集中,尝试数("+waitingQueue.getValue(id).time+"/10)。"+"\r");
                        return "信息发送失败,用户"+id+"不在集中，尝试数++。";
                    }
                }
            })
        }
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
                case 'heart':
                    console.log("Server收到"+data.data+"的心跳包");
                    socket.write("alive\r");
                    break;
                case 'register':
                    register(data.data,socket);
                    break;
                case 'unregister':
                    if(socket)unregister(data.data,socket);
                    break;
                case 'notify':
                    console.log('Server<<notified');
                    socket.write("notified\r");//TODO:notice预留给推送服务。
                    break;
                case 'premier':
                    console.log('Server<<被premier链接');
                    socket.write("connected to Premier");
                    break;
                case '2s':
                    resl = say2Id(data.data.u,data.data.m);
                    if(resl == true){
                        socket.write("成功\r");
                    }else{
                        socket.write(resl+"\r");
                    }
                    break;
                case '2g':
                    resl = say2Ids(data.data.us,data.data.m);
                    if(resl == true){
                        socket.write("成功\r");
                    }else{
                        socket.write(resl+"\r");
                    }
                    break;
                default:
                    socket.write("unknown\r");
                    break;
            }
        }catch (e){
            socket.write("{\"action\":\"text\",\"data\":\"数据解析错误\"}"+"\r");
        }
    }

    register = function (id,socket) {
        if(userSockets.containKey(id)){
            socket.write("{\"action\":\"text\",\"data\":\"注册失败，已注册\"}"+"\r");
        }else {
            userSockets.add(id,socket);
            console.log('Server<<已将'+socket.remoteAddress + ':' + socket.remotePort+"注册入集"+"\r");
            socket.write("{\"action\":\"text\",\"data\":\"注册成功\"}"+"\r"+"\r");
            say2Id(id,"{\"action\":\"text\",\"data\":\"已入集\"}"+"\r");
        }
    }

    unregister = function (id,socket) {
        if (userSockets.containKey(id)) {
            socket.write("{\"action\":\"text\",\"data\":\"已退出集\"}"+"\r");
            userSockets.remove(id);
        }
        console.log('Server<<已将'+socket.remoteAddress + ':' + socket.remotePort+"退出集"+"\r");

    }

    say2Id = function (id,msg) {//此处的msg需要修饰
        //console.log("当前有"+userSockets.getSize()+"位用户在集"+"\r");
        //console.log("识别码:"+identifyCode+"\r");
        if (userSockets.containKey(id)){
            console.log("向"+id+"发送信息:"+msg+"\r");
            userSockets.getValue(id).write(msg+"\r");
            return true;
        }else {
            waitingQueue.add(id,{'time':0,'msg':msg});//ID为等待充实用户的userid，VALUE为已重试次数和消息；
            console.log("信息发送失败,用户"+id+"不在集中,已加入等待队列。"+"\r");
            return "信息发送失败,用户"+id+"不在集中，已加入等待队列。";
        }
    }

    say2Ids = function (ids,msg) {//此处的msg要修饰
        console.log("向"+ids.length+"位用户发送信息"+"\r");
        var errNum = 0;
        for (x in ids){
            resl = say2Id(ids[x],msg);
            if(resl !== true)errNum++;
        }
        if(errNum == 0 ){
            return true;
        }else {
            return "操作结束，应发"+ids.length+"条，实发"+(ids.length-errNum)+"条，成功率"+(1-errNum/ids.length)+"";
        }
    }
}


module.exports =  Telegram;