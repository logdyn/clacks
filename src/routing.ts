/**
 * this is a socket
 */
export interface Socket {
    on: (eventName: string, callback: () => any) => any,
    send: (payload) => any
}

export class RoutingController<U,H> {

    private readonly getUserId: (socket: Socket) => U;
    private readonly getHttpSessionId: (socket: Socket) => H;
    private userMap: Map<U, Map<H, Socket[]>>;

    constructor(getUserId: (socket: Socket) => U, getHttpSessionId: (socket: Socket) => H) {
        this.userMap = new Map();
        this.getUserId = getUserId;
        this.getHttpSessionId = getHttpSessionId;
    }

    addWebsocket(socket: Socket): void {

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

    removeWebsocket(socket: Socket): boolean {

        let userId = this.getUserId(socket);
        let httpSessionId = this.getHttpSessionId(socket);

        let httpSessionMap = this.userMap.get(userId);
        if (typeof httpSessionMap === 'undefined') {
            return false;
        }
        let websockets = httpSessionMap.get(httpSessionId);
        if (websockets.length === 1 && websockets[0] === socket) {
            httpSessionMap.delete(httpSessionId);
            if (httpSessionMap.size === 0) {
                this.userMap.delete(userId);
            }
        } else {
            httpSessionMap.set(httpSessionId, websockets.filter((ws: Socket) => ws != socket));
        }
        return true;
    }

    userHasSession(username: U, httpSessionId: H): boolean {
        let httpSessionMap = this.userMap.get(username);
        if (typeof httpSessionMap == 'undefined') {
            return false;
        }
        let websockets = httpSessionMap.get(httpSessionId);
        if (typeof websockets == 'undefined' || websockets.length === 0) {
            return false;
        }
        return true;
    }

    sendToUserId(payload: any, username: U): void {
        let httpSessionMap = this.userMap.get(username);

        if (typeof httpSessionMap === 'undefined') {
            return;
        }
        httpSessionMap.forEach((websockets: Socket[]) => {
            websockets.forEach((ws: Socket) => ws.send(payload));
        });
    }

    sendToHttpSession(payload: any, httpSessionId: H, username?: U) {
        let wsArray = [];
        if (typeof username === 'undefined') {
            this.userMap.forEach((httpMap) => {
                if (httpMap.has(httpSessionId)) {
                    wsArray.push(httpMap.get(httpSessionId));
                }
            });
        } else {
            wsArray = this.userMap.get(username).get(httpSessionId);
        }
        wsArray.forEach(ws => ws.send(payload));
    }

    sendToAll(payload: any) {
        this.userMap.forEach(httpSessionMap => {
            httpSessionMap.forEach(wsArray => {
                wsArray.forEach(ws => ws.send(payload));
            });
        });
    }
}
