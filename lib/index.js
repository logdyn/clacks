const RoutingController = require('./routing');
let routingController;

let _userId, _httpSessionId = null;

module.exports = {
    init: function(options = {}) {

        // If no websocket server defined in options, assume options is itself the websocket server
        if (typeof options.websocketServer === 'undefined') {
            options = {websocketServer: options};
        }

        // Check whether the ws server has a valid 'on' method
        if (typeof options.websocketServer.on !== 'function') {
            throw Error('Clacks requires a websocket server');
        }

        // Set default 'getUserId' method if none defined
        if (typeof options.getUserId === 'undefined') {
            options.getUserId = (req) => typeof req.user === 'object' ? req.user.id : null;
        }

        // Set default 'getHttpSessionId' method if none defined
        if (typeof options.getHttpSessionId === 'undefined') {
            options.getHttpSessionId = (req) => typeof req.session === 'object' ? req.session.id : null;
        }

        routingController = new RoutingController(options.getUserId, options.getHttpSessionId);

        // Set up socket on connection, removal on disconnect
        options.websocketServer.on('connection', socket => {
            routingController.addWebsocket(socket);
            socket.on('disconnect', () => routingController.removeWebsocket(socket)) // * socket.io implementation
            socket.on('close', () => routingController.removeWebsocket(socket)) // * ws implementation
        })

        return function(req, res, next) {
            _userId = options.getUserId(req);
            _httpSessionId = options.getHttpSessionId(req);
            next();
            _userId = null;
            _httpSessionId = null;
        }
    },
    send: function(payload, order) {
        // TODO stuff
    },
    sendUser: function(payload, userId) {
        if (typeof userId == 'undefined') { userId = _userId; }
        routingController.sendToUserId(payload, userId);
    },
    sendSession: function(payload, sessionId, userId) {
        if (typeof sessionId === 'undefined') {
            userId = _userId;
            sessionId = _httpSessionId;
        } else if (typeof userId === 'undefined'
            && routingController.userHasSession(_userId, sessionId)) {
            userId = _userId;
        }
        routingController.sendToHttpSession(payload, sessionId, userId);
    },
    sendAll: function(payload) {
        routingController.sendToAll(payload);
    },
}
