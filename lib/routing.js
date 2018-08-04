const identifierFunctionIsValid = function(func) {
    return typeof func === 'function' && func.length > 0;
}

const socketIsValid = function(socket) {
    return typeof socket !== 'undefined' && typeof socket.on === 'function' && typeof socket.send === 'function';
}

module.exports = class RoutingController {
    constructor(getUserId, getHttpSessionId) {
        if (!identifierFunctionIsValid(getUserId)) {
            throw new Error("getUserId must be a function, and must take a websocket as a parameter");
        }

        if (!identifierFunctionIsValid(getHttpSessionId)) {
            throw new Error("getHttpSessionId must be a function, and must take a websocket as a parameter");
        }

        this.userMap = new Map();
        this.getUserId = getUserId;
        this.getHttpSessionId = getHttpSessionId;
    }

    addWebsocket(socket) {
        if (!socketIsValid(socket)) {
            throw new Error('Socket parameter must be defined and have the following methods: on, send');
        }

        let userId = this.getUserId(socket);
        let httpSessionId = this.getHttpSessionId(socket);

        let httpSessionMap = this.userMap.get(userId);
        if (typeof httpSessionMap === 'undefined') {
            httpSessionMap = new Map();
            this.userMap.set(userId, httpSessionMap);
        }
        let websockets = httpSessionMap.get(httpSessionId);
        if (typeof websockets === 'undefined') {
            websockets = [];
            httpSessionMap.set(httpSessionId, websockets);
        }
        websockets.push(socket);
    }
};