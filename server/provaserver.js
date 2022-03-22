var crypto = require('crypto');
var hash = crypto.createHash('md5').update('hey').digest('hex');
console.log(hash);
