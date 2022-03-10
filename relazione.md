# <p style="text-align:center">Byce </p>
___________
<div style="font-size: 16px">
    <p style="font-size: 20px"> Progetto di Internet Of Things di Alberto Morini (141986) </p>
    <b>Anno accademico:</b> 2021/2022

</div>


## Indice
1. lol

## Byce, a battery logger.
Il progetto si suddivide in due parti: Byce e il server.

Byce è un'app, progettata con l'obiettivo di rilevare il livello della batteria dei dispositivi Android e in seguito, inviare i dati al server.
L'applicazione può essere estesa anche al sistema operativo iOS, poiché è stata sviluppata attraverso Apache Cordova, quindi non si tratta di un'app nativa bensì ibrida.
--Per l'esame si è provveduto a realizzare solamente per la piattaforma Android.

Il server è rappresentato da qualsiasi personal computer in grado di eseguire il linguaggio NodeJS e ospitare un database MySQL.
L'obiettivo è quindi quello di rimanere in ascolto delle informazioni ricevute dai vari telefoni/tablet, memorizzare i dati nella base di dati e poi rappresentarli attraverso il software Grafana.

### Study case:
L'idea è nata da una necessità: un ristorante che utilizza dei tablet per ordinare il cibo e sfogliare il menù.
---Continuando questo esempio, alla fine del servizio un cameriere deve controllare tutti i tablet per controllare quali di questi deve essere ricaricato. Con questa soluzione, in pochi secondi può ottenere una panoramica dello stato di tutti i devices connessi alla sua rete.
L'applicazione però può essere anche usata per scopi personali, ad esempio ricevere una notifica quando il device ha raggiunto la capacità massima oppure se è stato collegato alla corrente.

## L'app / byce

### Struttura generale

L'applicazione deve ottenere la percentuale di carica e comunicare con il server.

Identificate le necessità principali, abbiamo bisogno che il dispositivo sia riconoscibile, in altre parole il server deve sapere chi ha mandato tali dati. Per tale obiettivo vi sono due soluzioni: utilizzare il MAC address oppure sfruttare il nome del dispositivo (eg. "Alby's iPhone/Samsung S5/Tablet21"). Quest'ultima idea è la soluzione ottimale, poiché poiché non necessita l'implementazione di un registro associativo tra MAC address e un'ulteriore nome; inoltre molti dispositivi (se pensiamo a quelli personali) hanno già un nome personalizzato e quindi riconoscibile dall'utente.

Il cambiamento dello stato di carica consiste nella variazione della percentuale o nella variazione dell'alimentazione da corrente (collegato/scollegato). Ad ogni cambiamento, l'applicazione scatena un evento il quale sarà ascoltato da un'apposita funzione che si occuperà quindi di rilevare i dati precedentemente elencati, calcolare un timestamp e in seguito inviare una POST request al server in ascolto.

In fine, l'app deve poter continuare la sua esecuzione anche in background.


### Cordova Apache
Cordova è un framework Javascript sviluppato da Nitobi (acquisita poi da Apache).
Per eseguire Cordova è necessario aver già installato NodeJS e NPM.
Quindi `$ sudo npm install -g cordova` (utilizziamo il comando sudo poiché alcuni sistemi richiedono i requisiti amministratore).
Al fine di implementare tutte le funzionalità richieste occorre installare dei plugin aggiuntivi:
* cordova-plugin-battery-status -> si interfaccia con la batteria del device
* cordova-plugin-device-name -> ottiene il nome del dispositivo
* cordova-plugin-background-mode -> permette l'esecuzione in background
* cordova-plugin-advanced-http -> consente l'invio di POST request via HTTP

#### Il motore

Il cuore dell'applicazione è rappresentato principalmente da 3 file:
* www/index.html -> l'interfaccia grafica
* www/js/index.js -> le funzioni che vogliono eseguire
* config.xml -> file di configurazione generica, quindi il nome dell'app e altre informazioni

all'interno del file Javascript, è necessario dichiarare l'ascoltatore
```javascript
document.addEventListener('deviceready', onDeviceReady, false);
```
il quale andrà a chiamare la funzione definita (onDeviceReady in questo caso) non appena l'applicazione sarà in esecuzione.


### Android

Per la piattaforma Android è necessario installare alcuni tool di sviluppo, i quali:
* Android studio `$ sudo snap install android-studio --classic`
* Gradle `$ sudo apt-get install gradle`
* Un device virtuale (il quale deve essere acceso), installabile tramite Android Studio

Eseguendo il comando `$ cordova requirements` si otterrà una lista dei requisiti e se questi siano soddisfatti o meno (molto probabilmente servirà una specifica versione di Android SDK ottenibile attraverso Android Studio)
In seguito, bisogna configurare Android SDK nel proprio terminale, al fine di tale scopo vi è una guida esaustiva al seguente link: https://ionicframework.com/docs/developing/android#configuring-command-line-tools

Per costruire l'apk è necessario aggiungere la piattaforma Android al progetto `$ cordova platform add android` e poi `$ cordova build` si occuperà di realizzare il pacchetto di installazione per ogni piattaforma aggiunta.

Vi è bisogno di apportare alcune modifiche al file AndroidManifest.xml dove si dichiara il comportamento e i permessi richiesti dall'app.
> E' stato incluso il file creato alla creazione dell'apk utilizzata, il file originale trova locazione dentro byce/platforms/android/app/src/


### Il pacchetto
Il pacchetto inviato è di Content/Type: JSON.
esempio di pacchetto/JSON
```JSON
{
    "batteryLevel": 89,
    "inCharge": true,
    "name": "AlbysAndroid",
    "date": "2022/03/09",
    "time": "23:01:46"
}
```
JSON rappresenta un enorme vantaggio, poiché i dati vengono manipolati attraverso un 'dizionario' Javascript, linguaggio sul quale si basa sia l'applicazione che il server (NodeJS).

Utilizziamo `cordova.plugin.http.setDataSerializer('json');` per indicare all'app di sfruttare tale codifica.


## Il server

### struttura generale
Il server si avvia attraverso il comando `node server/server.js` quindi inizializza una socket con indirizzo IP 10.0.0.3 e porta 8124.

Il processo alla ricezione di un messaggio estrapolerà le informazioni contenute, le serializzerà in un file con formato CSV (utile per il debug) e in seguito, instaurerà una connessione con il database MySQL dove processerà una query di inserimento.

Il server non è tenuto a rispondere ai client, anche perché i client non sono stati programmati per elaborare la ricezione di richieste. Ad ogni modo inviamo comunque un messaggio di conferma di ricezione (utile nel debug e in caso per sviluppi futuri).

### NodeJS
Node consente attraverso l'engine V8 di Chromium di eseguire script javascript al di fuori di un browser.
L'installazione può avvenire attraverso il gestore di pacchetti di Linux, quindi `$ sudo apt-get instal nodejs`

Il programma avvierà un server http in ascolto sulla porta 8124 all'indirizzo IP del computer sul quale avverrà l'esecuzione (per comodità si è ricorso all'utilizzo dell'IP statico 10.0.0.3).
Per implementare i vari obiettivi, è necessario importare alcuni moduli (librerie), installabili attraverso NPM (Node Package Manager) `$ npm install pacchetto`
una volta aggiunti i pacchetti richiesti, bisogna includerli nel file server.js
```javascript
var http = require('http'); //module for the creation of the server
var fs = require("fs"); //store a CSV with the messages recived, useful for debug
var mysql = require('mysql'); //module to connect with MySQL

```

verrà utilizzata la funzione `JSON.parse(pacchetto)` per convertire il messaggio JSON ricevuto in un 'dizionario' javascript.

### Il database
Il database è stato realizzato attraverso il sistema di gestione MySQL di Oracle.
Per l'installazione basta eseguire `$ sudo apt install mysql-server`
In seguito eseguiamo il login `$ mysql -h localhost -P 3306 -u root -p` e cambiamo la password di default dell'utente root (è possibile anche aggiungere un nuovo user nel caso lo si desideri)
```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'YourPsw'
```

La creazione del database avviene tramite le seguenti query:
```sql
CREATE DATABASE byce;
CONNECT byce;
--Creiamo la tabella 'Dataset' dove inseriremo i dati
create table Dataset(
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    battery INTEGER NOT NULL,
    incharge BOOLEAN NOT NULL,
    name VARCHAR(256) NOT NULL,
    data DATE NOT NULL,
    tempo TIME NOT NULL
);
```
