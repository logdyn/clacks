import RoutingController from "./routing";
import { Socket, WebsocketServer } from "./socketTypes";

/** @type {RoutingController} routingController */
let routingController: RoutingController<any, any>;

let currentUserId: any = null;
let currentHttpSessionId: any = null;

interface InitOptions<R> {
    websocketServer: WebsocketServer;
    getUserId?: (request: R) => any;
    getSocketUserId?: (socket: Socket) => any;
    getHttpSessionId?: (request: R) => any;
    getSocketHttpSessionId?: (socket: Socket) => any;
}

interface DefaultSocket<R> extends Socket {
    request: R;
}

type DefaultRequest<R> = R & { user: { id: any }, session: { id: any } };

export function init<R>(options: InitOptions<R>): (req: R, res: any, next: () => any) => void {

    // Set default 'getUserId' method if none defined
    // getUserId will only be falsy if undefined
    if (!options.getUserId) {
        options.getUserId = (req: DefaultRequest<R>) => req.user.id;
    }

    if (!options.getHttpSessionId) {
        options.getHttpSessionId = (req: DefaultRequest<R>) => req.session.id;
    }

    if (!options.getSocketUserId) {
        options.getSocketUserId = (socket: DefaultSocket<R>) => options.getUserId(socket.request);
    }

    if (!options.getSocketHttpSessionId) {
        options.getSocketHttpSessionId = (socket: DefaultSocket<R>) => options.getHttpSessionId(socket.request);
    }

    routingController = new RoutingController(options.getSocketUserId, options.getSocketHttpSessionId);

    // Set up socket on connection, removal on disconnect
    options.websocketServer.on("connection", (socket) => {
        routingController.addWebsocket(socket);
        socket.on("disconnect", () => routingController.removeWebsocket(socket)); // * socket.io implementation
        socket.on("close", () => routingController.removeWebsocket(socket)); // * ws implementation
    });

    return (req: R, res, next: () => any) => {
        currentUserId = options.getUserId(req);
        currentHttpSessionId = options.getHttpSessionId(req);
        next();
        currentUserId = null;
        currentHttpSessionId = null;
    };
}

export function send(payload: any, order: any): void {
    // TODO stuff
}

export function sendUser(payload: any, userId = currentUserId): void {
    routingController.sendToUserId(payload, userId);
}

export function sendSession(payload: any, sessionId = currentHttpSessionId, userId?: any): void {
    if (typeof userId === "undefined" && routingController.userHasSession(currentUserId, sessionId)) {
        userId = currentUserId;
    }
    routingController.sendToHttpSession(payload, sessionId, userId);
}

export function sendAll(payload: any): void {
    routingController.sendToAll(payload);
}
