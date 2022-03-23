document.addEventListener('deviceready', onDeviceReady, false);

var appAuthenticated = false; //flag controller if password is correct
var storedPassword = "" //the correct password, we need to include it in every message


/**
 * ask the server if the password is correct, the server  will return string "true" or "false"
 * WILL CHANGE THE VALUE OF 'appAuthenticated'
 * @param  {String} [IPAddress='10.0.0.3']     Server's IP address
 * @param  {String} [port='8127']             Server's port
 */
function checkPsw(IPAddress='10.0.0.3', port='8127'){
    let psw = document.getElementById("pswInput").value;
    if(psw!=""){
        cordova.plugin.http.setServerTrustMode('nocheck', function() {
          console.log("success, no check");
        }, function() {
          console.log("Error server trust mode");
        });

        cordova.plugin.http.setDataSerializer('json'); //important: default is string, this set content/type=json
        //send info to server via post, my server has a static IP: 10.0.0.3, and the service is active on port 8124
        cordova.plugin.http.post('https://'+IPAddress+':'+port,{
            "password":psw
        }, {
          Authorization: 'OAuth2: token'
        }, function(response) {
            if(response.data=="true"){
                document.getElementById("pswField").innerHTML='<h3>Password corretta</h3>'
                appAuthenticated=true;
                storedPassword = psw //save the correct password
            }else{
                document.getElementById("pswField").innerHTML='<h3>Password sbagliata</h3><input type="password" name="pswInput" id="pswInput"><input type="submit" onclick="checkPsw()">'
            }
        }, function(response) {
            //document.getElementById("pswField").innerHTML=response.error;
            console.log(response.error);
        });
    }
}

/**
 * Send the HTTPS request
 * @param  {dict/json} jsonInfo    the info we want to send
 * @param  {String} [IPAddress='10.0.0.3']    Server's IP address
 * @param  {String} [port='8124']      Server's port
 */
function sendData(jsonInfo, IPAddress='10.0.0.3', port='8124'){

    cordova.plugin.http.setServerTrustMode('nocheck', function() {
      console.log("success, no check");
    }, function() {
      console.log("Error server trust mode");
    });

    cordova.plugin.http.setDataSerializer('json'); //important: default is string, this set content/type=json
    //send info to server via post, my server has a static IP: 10.0.0.3, and the service is active on port 8124
    cordova.plugin.http.post('https://'+IPAddress+':'+port,jsonInfo, {
      Authorization: 'OAuth2: token'
    }, function(response) {
      console.log(response.status);
    }, function(response) {
        console.log(response.error);
    });
}

/**
 * main function, launch the program
 */
function onDeviceReady() {

    myConsole = document.getElementById("console"); //div to add info via UI
    cordova.plugins.backgroundMode.enable();
    cordova.plugins.backgroundMode.disableWebViewOptimizations();
    cordova.plugins.backgroundMode.disableBatteryOptimizations();

    //when the user get off the app (eg click home button), this method starts
    cordova.plugins.backgroundMode.on('enable', ()=>{

        function logStatusObject(status){

            myConsole.innerHTML += `<p>level: ${status.level} || charging: ${status.isPlugged}</p>`;
            myConsole.innerHTML += '<hr>'
            let d = new Date();

            if(appAuthenticated){
                let tmpJson = {
                    "password": storedPassword,
                    "batteryLevel": `${status.level}`,
                    "inCharge": `${status.isPlugged}`,
                    "name": cordova.plugins.deviceName.name,
                    "date": d.getFullYear()+"/"+(d.getMonth()+1)+"/"+d.getDate(), //getMonth+1, because it's start from 0
                    "time": d.getHours()+":"+d.getMinutes()+":"+d.getSeconds()
                };
                sendData(tmpJson);
            }
        }
        window.addEventListener("batterystatus", logStatusObject, false);


        //In Android 9+, when an app is on background for more than 5min the OS kills it, so we need to take back to foreground (and next return to background)
        setInterval(()=>{
            cordova.plugins.backgroundMode.unlock(); //is like moveToForeground, but works even if the phone is locked
            cordova.plugins.backgroundMode.moveToBackground();
        }, 240000); //4min

    });
}
