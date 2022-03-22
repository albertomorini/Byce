document.addEventListener('deviceready', onDeviceReady, false);



function askPSW(){
    document.getElementById("pswInput").innerHTML='<input type="password" name="psw" id="psw"><input type="submit" onclick="verifica()">'

}

function verifica(){
    psw = document.getElementById("psw").value;
    //md5 con psw, javascript fai ispeziona e vedi il "ciao"
    if(psw=="ciao"){
        //store psw
        document.getElementById("pswInput").innerHTML='<h1>Okay!</h1>'
    }else{
        document.getElementById("pswInput").innerHTML='<h2>Password sbagliata</h2><br><input type="password" name="psw" id="psw"><input type="submit" onclick="verifica()">'
    }
}




function onDeviceReady() {
    askPSW()
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


            cordova.plugin.http.setServerTrustMode('nocheck', function() {
              console.innerHTML += 'success!';
            }, function() {
              console.innerHTML += 'error :(';
            });

            cordova.plugin.http.setDataSerializer('json'); //important: default is string, this set content/type=json
            //send info to server via post, my server has a static IP: 10.0.0.3, and the service is active on port 8124
            cordova.plugin.http.post('https://10.0.0.3:8124', {
                "batteryLevel": `${status.level}`,
                "inCharge": `${status.isPlugged}`,
                "name": cordova.plugins.deviceName.name,
                "date": d.getFullYear()+"/"+(d.getMonth()+1)+"/"+d.getDate(), //getMonth+1, because it's start from 0
                "time": d.getHours()+":"+d.getMinutes()+":"+d.getSeconds()
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
