import { Socket } from "./socketTypes";

export default class RoutingController<S, U, H> {

    private readonly getUserId: (socket: Socket<S>) => U;
    private readonly getHttpSessionId: (socket: Socket<S>) => H;
    private userMap: Map<U, Map<H, Array<Socket<S>>>>;

    constructor(getUserId: (socket: Socket<S>) => U, getHttpSessionId: (socket: Socket<S>) => H) {
        this.userMap = new Map();
        this.getUserId = getUserId;
        this.getHttpSessionId = getHttpSessionId;
    }

    public addWebsocket(socket: Socket<S>): void {

        const userId = this.getUserId(socket);
        const httpSessionId = this.getHttpSessionId(socket);

        let httpSessionMap = this.userMap.get(userId);
        if (typeof httpSessionMap === "undefined") {
            httpSessionMap = new Map();
            this.userMap.set(userId, httpSessionMap);
        }
        let websockets = httpSessionMap.get(httpSessionId);
        if (typeof websockets === "undefined") {
            websockets = [];
            httpSessionMap.set(httpSessionId, websockets);
        }
        websockets.push(socket);
    }

    public removeWebsocket(socket: Socket<S>): boolean {

        const userId = this.getUserId(socket);
        const httpSessionId = this.getHttpSessionId(socket);

        const httpSessionMap = this.userMap.get(userId);
        if (typeof httpSessionMap === "undefined") {
            return false;
        }
        const websockets = httpSessionMap.get(httpSessionId);
        if (websockets.length === 1 && websockets[0] === socket) {
            httpSessionMap.delete(httpSessionId);
            if (httpSessionMap.size === 0) {
                this.userMap.delete(userId);
            }
        } else {
            httpSessionMap.set(httpSessionId, websockets.filter((ws: Socket<S>) => ws !== socket));
        }
        return true;
    }

    public userHasSession(username: U, httpSessionId: H): boolean {
        const httpSessionMap = this.userMap.get(username);
        if (typeof httpSessionMap === "undefined") {
            return false;
        }
        const websockets = httpSessionMap.get(httpSessionId);
        if (typeof websockets === "undefined" || websockets.length === 0) {
            return false;
        }
        return true;
    }

    public sendToUserId(payload: any, username: U): void {
        const httpSessionMap = this.userMap.get(username);

        if (typeof httpSessionMap === "undefined") {
            return;
        }
        httpSessionMap.forEach((websockets: Array<Socket<S>>) => {
            websockets.forEach((ws: Socket<S>) => ws.send(payload));
        });
    }

    public sendToHttpSession(payload: any, httpSessionId: H, username?: U) {
        let wsArray: Array<Socket<S>> = [];
        if (typeof username === "undefined") {
            this.userMap.forEach((httpMap) => {
                if (httpMap.has(httpSessionId)) {
                    // Spread operator for typing purposes
                    wsArray.push(...httpMap.get(httpSessionId));
                }
            });
        } else {
            wsArray = this.userMap.get(username).get(httpSessionId);
        }
        wsArray.forEach((ws) => ws.send(payload));
    }

    public sendToAll(payload: any) {
        this.userMap.forEach((httpSessionMap) => {
            httpSessionMap.forEach((wsArray) => {
                wsArray.forEach((ws) => ws.send(payload));
            });
        });
    }
}
