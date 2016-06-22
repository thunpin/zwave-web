var nodes = {};
var commands = [];
var bodyParser = require('body-parser');

var lock = false;

function parseResult(result) {
    return {
        class_id: result.class_id,
        index: result.index,
        instance: result.instance,
        type: result.type,
        genre: result.genre,
        label: result.label,
        units: result.units,
        read_only: result.read_only,
        write_only: result.write_only,
        is_polled: result.is_polled,
        min: result.min,
        max: result.max,
        value: result.value,
    };
}

module.exports = function(app) {
    app.use(bodyParser.json()); // support json encoded bodies
    app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

    app.get('/reset', function(req, res) {
        
    });

    app.get('/nodes', function(req, res) {
        var result = [];

        for (var key in nodes) {
            var node = nodes[key];
            var value = {
                id: node.id,
                manufacturerid: node.manufacturerid,
                producttype: node.producttype,
                name: node.name,
                ready: node.ready
            };
            result.push(value);
        }

        res.send(result);
    });

    app.get('/nodes/length', function(req, res) {
        res.send({
            length: nodes.length
        });
    });

    app.get('/node/:nodeid', function(req, res) {
        nodeid = req.params.nodeid;
        if (nodes[nodeid]) {
            var node = nodes[nodeid];
            var value = {
                id: node.id,
                manufacturerid: node.manufacturerid,
                producttype: node.producttype,
                name: node.name,
                ready: node.ready
            };
            res.send(value);
        } else {
            res.send({error: "ops!"});
        }
    });

    app.get('/node/:nodeid/status', function(req, res) {
        nodeid = req.params.nodeid;
        if (nodes[nodeid]) {
            node = nodes[nodeid];

            var result = [];
            for (var status in nodes[nodeid].classes) {
                for (var key in nodes[nodeid].classes[status]) {
                    var st = nodes[nodeid].classes[status][key];
                    result.push(parseResult(st));
                }
            }

            res.send(result);
        } else {
            res.send({error: "ops!"});
        }
    });

    app.get('/node/:nodeid/status/:status', function(req, res) {
        nodeid = req.params.nodeid;
        status = req.params.status;
        if (nodes[nodeid] && nodes[nodeid].classes[status]) {
            node = nodes[nodeid];
            var result = [];
            for (var key in nodes[nodeid].classes[status]) {
                var st = nodes[nodeid].classes[status][key];
                result.push(parseResult(st));
            }
            res.send(result);
        } else {
            res.send({error:"ops!"});
        }
    });

    app.get('/node/:nodeid/status/:status/:index', function(req, res) {
        nodeid = req.params.nodeid;
        status = req.params.status;
        index = req.params.index;
        if (nodes[nodeid] &&
            nodes[nodeid].classes[status] &&
            nodes[nodeid].classes[status][index]) {

            node = nodes[nodeid];
            res.send(parseResult(nodes[nodeid].classes[status][index]));
        } else {
            res.send({error: "ops!"});
        }
    });

    app.get('/node/:nodeid/rename/:name', function(req, res) {
        commands.push({
            type: 'rename',
            value: {nodeid: req.params.nodeid, name: req.params.name}
        });

        res.send({result:"stored"});
    });

    // change to post
    app.get('/node/:nodeid/command/:command/:index/:instance/:value', function(req, res) {
        if (value == 'false') {
            value = false;
        } else if (value == 'true') {
            value = true;
        }

        commands.push({
            type: 'cmd',
            value: {
                nodeid: req.params.nodeid,
                command: req.params.command,
                index: req.params.index,
                instance: req.params.instance,
                value: req.params.value
            }
        });

        res.send({result:"stored"});
    });

    app.get('/commands', function(req, res) {
        res.send(commands);
    });

    app.get('/commands/read', function(req, res) {
        res.send(commands);
        commands = [];
    });

    app.post('/node/clear', function(req, res) {
        nodes = [];
        res.send({status: "ok"});
    });

    app.post('/node/all', function(req, res) {
        nodeid = req.params.nodeid;
        _nodes = req.body.nodes;
        
        for (var key in _nodes) {
            _nodes[key].classes = {};    
        }
        nodes = _nodes;

        res.send({status: "ok"});
    });

    app.post('/node/:nodeid', function(req, res) {
        nodeid = req.params.nodeid;
        node = req.body.node;
        node.classes = {};

        nodes[nodeid] = node;

        res.send({status: "ok"});
    });

    app.post('/node/:nodeid/command/:command', function(req, res) {
        nodeid = req.params.nodeid;
        command = req.params.command;
        value = req.body.value;

        if (nodes[nodeid]) {
            if (!nodes[nodeid].classes[command]) {
                nodes[nodeid].classes[command] = {};
            }

            nodes[nodeid].classes[command][value.index] = value;

            res.send({status: "ok"});
        } else {
            res.send({status: "fail"});
        }
    });
};