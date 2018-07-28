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

function p_shutdown() {
    $.ajax({ url: "telegram/pstop", context: document.body, success: function(rsl){
            location.reload();
            //alert(rsl);
        }});
}

function p_startup() {
    $.ajax({ url: "telegram/prun", context: document.body, success: function(rsl){
            if (rsl !== "ok"){
                alert(rsl);
            }else {
                location.reload();
                //alert(rsl);
            }
        }});
}
