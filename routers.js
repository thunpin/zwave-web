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

    app.get('/', function(req, res) {
        var result = '/reset <br> -- TODO';
        result += '/nodes <br> -- list all nodes';
        result += '/nodes/length <br> -- list the number of nodes';
        result += '/node/:nodeid <br> -- get node info by ID';
        result += '/node/:nodeid/status <br> -- get all node status commands';
        result += '/node/:nodeid/status/:status <br> -- get a node status command';
        result += '/node/:nodeid/status/:status/:index <br> -- get a node status command info';
        result += '/node/:nodeid/rename/:name <br> -- rename a node [TODO must be implemented in cliente side]';
        result += '/node/:nodeid/command/:command/:index/:instance/:value <br> -- execute a command';
        res.send(result);
    });

    // to implements
    app.get('/reset', function(req, res) {
        
    });

    // list all nodes
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

    // get the number of nodes
    app.get('/nodes/length', function(req, res) {
        res.send({
            length: nodes.length
        });
    });

    // get the node info by your ID
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

    // get the node status commands
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

    // get a node status command
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

    // get a node status of a command
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

    // rename a node
    app.get('/node/:nodeid/rename/:name', function(req, res) {
        commands.push({
            type: 'rename',
            value: {nodeid: req.params.nodeid, name: req.params.name}
        });

        res.send({result:"stored"});
    });

    // TODO change to post
    // send a command
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

    // list all commands stored to be executed
    app.get('/commands', function(req, res) {
        res.send(commands);
    });

    // list all commands stored to be executed and clear all
    app.get('/commands/read', function(req, res) {
        res.send(commands);
        commands = [];
    });

    // clear the node list (only server)
    app.post('/node/clear', function(req, res) {
        nodes = [];
        res.send({status: "ok"});
    });

    // store all nodes.
    // this command replace the previous nodes
    app.post('/node/all', function(req, res) {
        nodeid = req.params.nodeid;
        _nodes = req.body.nodes;
        
        for (var key in _nodes) {
            _nodes[key].classes = {};    
        }
        nodes = _nodes;

        res.send({status: "ok"});
    });

    // store a node by your ID
    // this command replace the previous node
    app.post('/node/:nodeid', function(req, res) {
        nodeid = req.params.nodeid;
        node = req.body.node;
        node.classes = {};

        nodes[nodeid] = node;

        res.send({status: "ok"});
    });

    // store a node command
    // this command replace the previous node command
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