var net = require('net');
var PORT = 2436;
var HOST = '127.0.0.1';

var userSockets = require("./hashTable");

// tcp服务端
var server = net.createServer(function(socket){

    console.log(socket.remoteAddress + ':' + socket.remotePort+">>已连接到server");
    socket.write('Server<<链接成功，\r服务器地址:'+HOST+":"+PORT+"\r当前客户机地址:"+socket.remoteAddress + ':' + socket.remotePort+"\r");


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
server.listen(PORT, HOST, function(){
    console.log('Server<<开始监听'+PORT+"端口");
});

function solve(data,socket) {
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
                unregister(data.data);
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
        socket.write("Server>>格式错误\r");
    }



}

//将socket注册进集；
function register(id,socket) {
    if(userSockets.containKey(id)){
        socket.write("Server>>注册失败，此用户已注册");
    }else {
        userSockets.add(id,socket);
        console.log('Server<<已将'+socket.remoteAddress + ':' + socket.remotePort+"注册入集");
        socket.write("Server>>注册成功");
        say2Id(id,"hahahahahahaha")
    }
}

//将某id的socket退出集
function unregister(id) {
    if (userSockets.containKey(id))userSockets.remove(id);
    console.log('Server<<已将'+socket.remoteAddress + ':' + socket.remotePort+"退出集");
    socket.write("Server>>成功退出");
}

function say2Id(id,msg) {
    if (userSockets.containKey(id)){
        console.log("向"+id+"发送信息:"+msg);
        userSockets.getValue(id).write(msg);
    }else {
        console.log("信息发送失败");
    }
}

//像多个用户发送信息，第一个参数为用户列表实例
function say2Ids(ids,msg) {
    console.log("向"+ids.getIdsArray().length+"位用户发送信息");
    for (x in ids.getIdsArray()){
        say2Id(ids.getIdsArray()[x],msg);
    }
}
//用户列表类
function Ids() {
    var ids = new Array();

    this.add = function (id) {
        if(!this.exist(id)){
            ids.push(id);
        }
    }
    this.join = function (arr) {
        for (x in arr){
            this.add(arr[x]);
        }
    }
    this.delete = function (id) {
        delete ids[id];
    }
    this.clear = function () {
        ids.splice(0,ids.length);
    }

    this.exist = function(id){
        return (id in ids);
    }
    this.getIdsArray = function () {
        return ids;
    }
}

//心跳打印相关信息
/*
var tempIds = new Ids();
    server.getConnections(function (error,counts) {
        setInterval(function () {
            console.log("=====当前连接数:"+counts);
    });
    console.log("=====当前链接集:"+userSockets.getSize());

    tempIds.clear();
    tempIds.join(userSockets.getAllKeys());
    //say2Ids(tempIds,new Date().getTime()+"")

},1000);
*/
