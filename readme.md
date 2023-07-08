# Byce, a battery logger.

Byce is my experimental thesis for my Bachelor Degree at <a href="https://www.uniud.it/it/didattica/corsi/area-scientifica/scienze-matematiche-informatiche-multimediali-fisiche/laurea/internet-of-things-big-data-web/corso/internet-of-things-big-data-web">University of Udin</a> (class L-31).

This project provide a platform to monitor the battery level of Androids devices connected to a network; this solution is self hosted so works only on LAN (for now).

## Architecture

This solution is made by two submodules: the app mobile and the server.

The **mobile app** will retrieve the related info, and next share the data with the server(.js) via HTTPS messages.

On the **server** side we can find 'server.js' which is the code developed thus to receive data and store it into a MySql database; an other function is the authentication of the devices which sees the server checks the password provided in each https message with an existing one (created by the end-user on the first start up).


### Development
The mobile app is created with <a href="https://cordova.apache.org/">Apache Cordova</a>, a JavaScript framework that allows to build hybrid apps for Android and iOS.
At this moment has been created only the apk for Android, iOS will follows in future.

![ByceGUI](./+img/byceGUI.png)
> Example of Byce's interface (startup, wrong password, correct password)

Server's code is made with JavaScript and executed by <a href="https://nodejs.org/en/">NodeJS</a>, but, isn't the only technology! There are other self-hosted software used to provide a full solution, in order:

1. <a href="https://www.mysql.com/">MySQL</a> for create the database

2. <a href="https://grafana.com/grafana/">Grafana Visualisation</a> used to create the infographics of data retrieved.

![grafana](./+img/grafanaShot.png)
> A screenshot of the Grafana's dashboard (there's the configuration file of it -> server/grafana_export.json)

### Database
Two tables: 'DEVICES' storing the information about the devices and 'DATALOG' containing the data retrieved by smartphones or tablet.
> There's a file with all the database query used (db/table creation and grafana query) -> server/byce_DB_QueryGrafana.sql

```sql
CREATE TABLE DEVICES(
    UID VARCHAR(128) PRIMARY KEY,
    NAME_DEVICE VARCHAR(128),
    MODEL VARCHAR(128),
    OS_VERSION VARCHAR(128)
);

CREATE TABLE DATALOG(
    UID VARCHAR(128) NOT NULL,
    LOG_DATE DATE NOT NULL,
    LOG_TIME TIME NOT NULL,
    BAT_LEVEL INTEGER NOT NULL,
    IN_CHARGE BOOLEAN NOT NULL,
    PRIMARY KEY (UID, LOG_DATE, LOG_TIME, IN_CHARGE),
    FOREIGN KEY(UID) REFERENCES DEVICES(UID)
);
```

## Cybersecurity
Data received by server must belongs to devices known by the end-user, so every message have to be authenticated with a password.
The password picked by the user on the first start-up is hashed via MD5 and stored into a file.
So, at every message received, server will hash (MD5) the password provided in the HTTPS packet and will compare the digest with the one stored into the file; then, server will repley with a boolean value used by the app to give a feedback to the end user.


In way to keep the communication secret just to server and client, it's used the HTTPS protocol, which create an end-to-end channel between two peers (server and the mobile device).
For an HTTPS server is required a X.509 Certificate, which can confirm the idenity. 
In way to avoid the process of get a Certificate by a Certification Authority, has been adopted a self-signed certified. This solution allows the MITM (Man In The Middle) attack, which is a compromise allowed only for this thesis, on another scenario is strongly suggested to have a real certificate.

*There are two version of the app, one is the previous version which hasn't any measurement of cybersecurity and use HTTP protocol, the second one is the final version with HTTPS.*

Here a screenshot of an encrypted packet analysed with Wireshark:
![WiresharkHTTPS](./+img/SniffingPacchettoCifrato.png)

## Future extensions

The platform can be extended to future develoments, for example:

1) create the iOS app.
2) retrieve more information, like CPU usage, free and used memory etc.
3) WAN scenario: with a pubblic Byce server which recive data from different users.
4) Data analysis in way to create a Business Intelligence, thus to give a user a valuation of the cost of charging or find out faulty devices.