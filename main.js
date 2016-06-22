var express = require('express');
var tools = require('./tools');
var routers = require('./routers');

app = express();
app.set('port', (process.env.PORT || 5000));
routers(app);

app.listen(app.get('port'), function() {
    tools.logTitle('zwave-web REST listening on port ' + app.get('port'));
});
