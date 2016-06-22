var express = require('express');
var tools = require('./tools');
var routers = require('./routers');

app = express();
routers(app);

app.listen(5000, function() {
    tools.logTitle('zwave-web REST listening on port 5000!');
});
