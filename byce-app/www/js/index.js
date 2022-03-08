document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    console = document.getElementById("console"); //div to add info via UI
    cordova.plugins.backgroundMode.enable();
    cordova.plugins.backgroundMode.disableWebViewOptimizations();
    cordova.plugins.backgroundMode.disableBatteryOptimizations();


    //when the user get off the app (eg click home button), this method starts
    cordova.plugins.backgroundMode.on('enable', ()=>{

        function logStatusObject(status){
            console.innerHTML += `<p>level: ${status.level} || charging: ${status.isPlugged}</p>`;
            console.innerHTML += "<hr/>";
            let d = new Date();

            cordova.plugin.http.setDataSerializer('json'); //important: default is string, this set content/type=json
            //send info to server via post, my server has a static IP: 10.0.0.3, and the service is active on port 8124
            cordova.plugin.http.post('http://10.0.0.3:8124', {
                "batteryLevel": `${status.level}`,
                "inCharge": `${status.isPlugged}`,
                "name": cordova.plugins.deviceName.name,
                "date": d.getFullYear()+"/"+d.getMonth()+"/"+d.getDate(),
                "time": d.getHours()+":"+d.getMinutes()
            }, {
              Authorization: 'OAuth2: token'
            }, function(response) {
              console.log(response.status);
            }, function(response) {
                console.log(response.error);
            });
        }
        window.addEventListener("batterystatus", logStatusObject, false);


        //In Android 9+, when an app is on background for more than 5min the OS kills it, so we need to take back to foreground (and next return to background)
        setInterval(()=>{
            cordova.plugins.backgroundMode.unlock(); //is like moveToForeground, but works even if the phone is locked
            cordova.plugins.backgroundMode.moveToBackground();
        }, 240000); //4min

    });
}
