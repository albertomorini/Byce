# Byce, a battery logger.

Byce is my experimental thesis for my Bachelor's Degree at University of Udin.
This project provide a platform to monitor the battery level of Androids devices connected to a network.


## Architecture

This solution is made by two submodules: the app mobile and the server.
The mobile app will retrieve the related info, and next share the data with the server(.js) via HTTPS messages.
On the server side we can find 'server.js' which is the code developed thus to receive data and store it into a database; an other function is the authentication of the devices which sees the server checks the password provided in each https message with an existing one (created by the end-user on the first start up).

Actually, Byce works on a LAN (Local Area Network), isn't hosted on a public server.

### Development
The mobile app is created with <a href="https://cordova.apache.org/">Apache Cordova</a>, a JavaScript framework that allows to build mobile apps for Android and iOS.
> Has been created just an apk for Android, iOS will follows in future.

Server's code is made with JavaScript and executed by <a href="https://nodejs.org/en/">NodeJS</a>, but, isn't the only technology! There are other self-hosted software used to provide a full solution, in order:

1. <a href="https://www.mysql.com/">MySQL</a> for create the database

2. <a href="https://grafana.com/grafana/">Grafana Visualisation</a> used to create the infographics of data retrieved.

## Cybersecurity
