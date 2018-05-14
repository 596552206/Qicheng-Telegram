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
module.exports = Ids;