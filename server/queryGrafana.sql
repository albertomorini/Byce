
-- query get current battery
SELECT battery FROM Dataset d1 WHERE d1.name="AlbyAndroid" ORDER BY d1.data DESC, d1.tempo DESC LIMIT 1;

SELECT battery FROM Dataset d1 WHERE d1.name="S88plus" ORDER BY d1.data DESC, d1.tempo DESC LIMIT 1;

-- query get current state of charging
SELECT incharge as "AlbyAndroid" FROM Dataset d1 WHERE d1.name="AlbyAndroid" ORDER BY d1.data DESC, d1.tempo DESC LIMIT 1;

SELECT incharge as "S88plus" FROM Dataset d1 WHERE d1.name="S88plus" ORDER BY d1.data DESC, d1.tempo DESC LIMIT 1;


-- battery + timing, 1 panel for each device
SELECT battery, tempo FROM Dataset d1 WHERE d1.name="AlbyAndroid" ORDER BY d1.data DESC, d1.tempo DESC LIMIT 1;

SELECT battery, tempo FROM Dataset d1 WHERE d1.name="S88plus" ORDER BY d1.data DESC, d1.tempo DESC LIMIT 1;


-- daily bar graph
SELECT battery, tempo FROM Dataset d1 WHERE d1.data=CURRENT_DATE AND d1.name="AlbyAndroid";

SELECT battery, tempo FROM Dataset d1 WHERE d1.data=CURRENT_DATE AND d1.name="S88plus";
