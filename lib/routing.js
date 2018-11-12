const identifierFunctionIsValid = function (func) {
    return typeof func === 'function' && func.length > 0;
}

const socketIsValid = function (socket) {
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

    removeWebsocket(socket) {
        if (!socketIsValid(socket)) {
            throw new Error('Socket parameter must be defined and have the following methods: on, send');
        }

        let userId = this.getUserId(socket);
        let httpSessionId = this.getHttpSessionId(socket);

        let httpSessionMap = this.userMap.get(userId);
        if (typeof httpSessionMap === 'undefined') {
            return false;
        }
        let websockets = httpSessionMap.get(httpSessionId);
        if (websockets.length == 1 && websockets[0] === socket) {
            httpSessionMap.delete(httpSessionId);
            if (httpSessionMap.size === 0) {
                this.userMap.delete(userId);
            }
        } else {
            httpSessionMap.set(httpSessionId, websockets.filter(ws => ws != socket));
        }
        return true;
    }

    userHasSession(username, httpSessionId) {
        let httpSessionMap = this.userMap.get(username)
        if (typeof httpSessionMap != 'undefined') {
            let websockets = httpSessionMap.get(httpSessionId);
            if (typeof websockets != 'undefined' && websockets.length) {
                return true;
            }
        }
        return false;
    }

    sendToUserId(payload, username) {
        let userHttpSessionMap = this.userMap.get(username);

        if (typeof userHttpSessionMap === 'undefined') {
            return;
        }
        userHttpSessionMap.forEach(wsArray => {
            wsArray.forEach(ws => ws.send(payload));
        });
    }

    sendToHttpSession(payload, httpSessionId, username) {
        let wsArray = [];
        if (typeof username === 'undefined') {
            this.userMap.forEach(httpMap => {
                if (httpMap.has(httpSessionId)) {
                    wsArray = httpMap.get(httpSessionId);
                }
            });
        } else {
            wsArray = this.userMap.get(username).get(httpSessionId);
        }
        wsArray.forEach(ws => ws.send(payload));
    }

    sendToAll(payload) {
        this.userMap.forEach(httpSessionMap => {
            httpSessionMap.forEach(wsArray => {
                wsArray.forEach(ws => ws.send(payload));
            });
        });
    }
};