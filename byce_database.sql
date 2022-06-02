CREATE DATABASE BYCE;
CONNECT BYCE;

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


--GRAFANA QUERY

-- ACTUAL
SELECT BAT_LEVEL, NAME_DEVICE FROM DATALOG DL1
INNER JOIN DEVICES D ON D.UID = DL1.UID
WHERE DL1.LOG_DATE=CURRENT_DATE AND NOT EXISTS (SELECT * FROM DATALOG DL2 WHERE
    DL1.UID=DL2.UID AND
     DL1.LOG_DATE=DL2.LOG_DATE AND DL1.LOG_TIME<DL2.LOG_TIME)
GROUP BY BAT_LEVEL, NAME_DEVICE;


-- IN_CHARGE

SELECT DL1.IN_CHARGE, DL1.LOG_TIME, D.NAME_DEVICE FROM DATALOG DL1
INNER JOIN DEVICES D ON DL1.UID=D.UID
WHERE DL1.LOG_DATE=CURRENT_DATE AND
NOT EXISTS(SELECT * FROM DATALOG DL2 WHERE
DL1.LOG_TIME<DL2.LOG_TIME AND
DL1.UID=DL2.UID AND
DL1.LOG_DATE=DL2.LOG_DATE);


-- TEMPORALE ODIERNO INTERATTIVO
SELECT UNIX_TIMESTAMP(LOG_TIME) AS time_sec, BAT_LEVEL AS value, NAME_DEVICE
FROM DATALOG DL1
INNER JOIN DEVICES D1 ON D1.UID=DL1.UID
WHERE DL1.LOG_DATE=CURRENT_DATE
GROUP BY time_sec, value, NAME_DEVICE
ORDER BY time_sec, value, NAME_DEVICE;

--Tabella DEVICES
SELECT * FROM DEVICES;

-- HEATMAP AlbyAndroid


SELECT UNIX_TIMESTAMP(LOG_TIME) AS time_sec, BAT_LEVEL AS value
FROM DATALOG DL1
INNER JOIN DEVICES D ON D.UID = DL1.UID
WHERE NAME_DEVICE='AlbyAndroid'
GROUP BY time_sec, value
ORDER BY time_sec, value
