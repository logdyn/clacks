const identifierFunctionIsValid = function(func) {
    return typeof func === 'function' && func.length > 0;
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
        let userId = this.getUserId(socket);
        let httpSessionId = this.getHttpSessionId(socket);

        let httpSessionMap = userMap.get(userId);
        if (typeof httpSessionMap === 'undefined') {
            httpSessionMap = new Map();
            userMap.set(userId, httpSessionMap);
        }
        let websockets = httpSessionMap.get(httpSessionId);
        if (typeof websockets === 'undefined') {
            websockets = [];
            httpSessionMap.set(httpSessionId, websockets);
        }
        websockets.push(socket);
    }
};