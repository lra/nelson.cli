'use strict';

var http = require('http');
var HttpDispatcher = require('httpdispatcher');

function createAPI(node) {
    var dispatcher = new HttpDispatcher();
    dispatcher.onGet('/', function (req, res) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(getNodeStats(node), null, 4));
    });

    dispatcher.onGet('/peers', function (req, res) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(node.list.all(), null, 4));
    });

    dispatcher.onGet('/peer-stats', function (req, res) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(getSummary(node), null, 4));
    });

    var server = http.createServer(function (request, response) {
        // Set CORS headers
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.setHeader('Access-Control-Request-Method', '*');
        response.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
        response.setHeader('Access-Control-Allow-Headers', '*');
        if (request.method === 'OPTIONS') {
            response.writeHead(200);
            response.end();
            return;
        }

        try {
            dispatcher.dispatch(request, response);
        } catch (err) {
            console.log(err);
        }
    });
    server.listen(node.opts.apiPort, node.opts.apiHostname);
}

function getNodeStats(node) {
    var _node$opts = node.opts,
        cycleInterval = _node$opts.cycleInterval,
        epochInterval = _node$opts.epochInterval,
        beatInterval = _node$opts.beatInterval,
        dataPath = _node$opts.dataPath,
        port = _node$opts.port,
        apiPort = _node$opts.apiPort,
        IRIPort = _node$opts.IRIPort,
        TCPPort = _node$opts.TCPPort,
        UDPPort = _node$opts.UDPPort,
        isMaster = _node$opts.isMaster,
        temporary = _node$opts.temporary;
    var _node$heart = node.heart,
        lastCycle = _node$heart.lastCycle,
        lastEpoch = _node$heart.lastEpoch,
        personality = _node$heart.personality,
        currentCycle = _node$heart.currentCycle,
        currentEpoch = _node$heart.currentEpoch,
        startDate = _node$heart.startDate;

    var totalPeers = node.list.all().length;
    var isIRIHealthy = node.iri && node.iri.isHealthy;
    var connectedPeers = Array.from(node.sockets.keys()).filter(function (p) {
        return node.sockets.get(p).readyState === 1;
    }).map(function (p) {
        return p.data;
    });

    return {
        ready: node._ready,
        isIRIHealthy: isIRIHealthy,
        totalPeers: totalPeers,
        connectedPeers: connectedPeers,
        config: {
            cycleInterval: cycleInterval,
            epochInterval: epochInterval,
            beatInterval: beatInterval,
            dataPath: dataPath,
            port: port,
            apiPort: apiPort,
            IRIPort: IRIPort,
            TCPPort: TCPPort,
            UDPPort: UDPPort,
            isMaster: isMaster,
            temporary: temporary
        },
        heart: {
            lastCycle: lastCycle,
            lastEpoch: lastEpoch,
            personality: personality,
            currentCycle: currentCycle,
            currentEpoch: currentEpoch,
            startDate: startDate
        }
    };
}

function getSummary(node) {
    var now = new Date();
    var hour = 3600000;
    var hourAgo = new Date(now - hour);
    var fourAgo = new Date(now - hour * 4);
    var twelveAgo = new Date(now - hour * 12);
    var dayAgo = new Date(now - hour * 24);
    var weekAgo = new Date(now - hour * 24 * 7);
    return {
        newNodes: {
            hourAgo: node.list.all().filter(function (p) {
                return p.data.dateCreated >= hourAgo;
            }).length,
            fourAgo: node.list.all().filter(function (p) {
                return p.data.dateCreated >= fourAgo;
            }).length,
            twelveAgo: node.list.all().filter(function (p) {
                return p.data.dateCreated >= twelveAgo;
            }).length,
            dayAgo: node.list.all().filter(function (p) {
                return p.data.dateCreated >= dayAgo;
            }).length,
            weekAgo: node.list.all().filter(function (p) {
                return p.data.dateCreated >= weekAgo;
            }).length
        },
        activeNodes: {
            hourAgo: node.list.all().filter(function (p) {
                return p.data.dateLastConnected >= hourAgo;
            }).length,
            fourAgo: node.list.all().filter(function (p) {
                return p.data.dateLastConnected >= fourAgo;
            }).length,
            twelveAgo: node.list.all().filter(function (p) {
                return p.data.dateLastConnected >= twelveAgo;
            }).length,
            dayAgo: node.list.all().filter(function (p) {
                return p.data.dateLastConnected >= dayAgo;
            }).length,
            weekAgo: node.list.all().filter(function (p) {
                return p.data.dateLastConnected >= weekAgo;
            }).length
        }
    };
}

module.exports = {
    createAPI: createAPI,
    getNodeStats: getNodeStats
};