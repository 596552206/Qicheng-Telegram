function shutdown() {
    $.ajax({ url: "telegram/stop", context: document.body, success: function(rsl){
            location.reload();
            //alert(rsl);
        }});
}

function startup() {
    $.ajax({ url: "telegram/run", context: document.body, success: function(rsl){
            location.reload();
            //alert(rsl);
        }});
}