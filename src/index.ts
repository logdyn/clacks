import RoutingController from "./routing";
import { Socket, WebsocketServer } from "./socketTypes";

interface InitOptions<R, S, U, H> {
    websocketServer: WebsocketServer<S>;
    getUserId?: (request: R) => U;
    getSocketUserId?: (socket: Socket<S>) => U;
    getHttpSessionId?: (request: R) => H;
    getSocketHttpSessionId?: (socket: Socket<S>) => H;
}

type DefaultRequest<R> = R & { user: { id: any }, session: { id: any } };

type DefaultSocket<S, R> = Socket<S & { request: R }>;

/**
 * Clacks API entry point. A new instance must be constructed, and provided with a configuration object.
 *
 * This options object must define the websocket server, and can define methods for getting the following:
 *
 * - getUserId(request: R) => U
 * - getSocketUserId: (socket: Socket<S>) => U
 * - getHttpSessionId: (request: R) => H
 * - getSocketHttpSessionId: (socket: Socket<S>) => H
 *
 * Where the types R, S, U, H refer to respectively:
 * - the request object
 * - the socket object
 * - the user name/identifier object
 * - the httpSession ID
 */
export default class Clacks<R, S, U, H> {

    private readonly controller: RoutingController<S, U, H>;

    private readonly getUserId: (request: R) => U;
    private readonly getHttpSessionId: (request: R) => H;

    private currentUserId: U | null = null;
    private currentHttpSessionId: H | null = null;

    constructor(options: InitOptions<R, S, U, H>) {

        // Set default 'getUserId' method if none defined
        // getUserId will only be falsy if undefined
        if (!options.getUserId) {
            options.getUserId = (req: DefaultRequest<R>) => req.user.id;
        }

        if (!options.getHttpSessionId) {
            options.getHttpSessionId = (req: DefaultRequest<R>) => req.session.id;
        }

        this.getUserId = options.getUserId;
        this.getHttpSessionId = options.getHttpSessionId;

        if (!options.getSocketUserId) {
            options.getSocketUserId = (socket: DefaultSocket<S, R>) => options.getUserId(socket.request);
        }

        if (!options.getSocketHttpSessionId) {
            options.getSocketHttpSessionId = (socket: DefaultSocket<S, R>) => options.getHttpSessionId(socket.request);
        }

        this.controller = new RoutingController(options.getSocketUserId, options.getSocketHttpSessionId);

        // Set up socket on connection, removal on disconnect
        options.websocketServer.on("connection", (socket) => {
            this.controller.addWebsocket(socket);
            socket.on("disconnect", () => this.controller.removeWebsocket(socket)); // * socket.io implementation
            socket.on("close", () => this.controller.removeWebsocket(socket)); // * ws implementation
        });
    }

    public getMiddleware(): (request: R, response: any, next: () => any) => void {
        return (req: R, res, next: () => any) => {
            this.currentUserId = this.getUserId(req);
            this.currentHttpSessionId = this.getHttpSessionId(req);
            next();
            this.currentUserId = null;
            this.currentHttpSessionId = null;
        };
    }

    public send(payload: any, order: any): void {
        // TODO stuff
    }

    public sendUser(payload: any, userId = this.currentUserId): void {
        this.controller.sendToUserId(payload, userId);
    }

    public sendSession(payload: any, sessionId = this.currentHttpSessionId, userId?: U): void {
        if (typeof userId === "undefined" &&
            this.controller.userHasSession(this.currentUserId, sessionId)) {
            userId = this.currentUserId;
        }
        this.controller.sendToHttpSession(payload, sessionId, userId);
    }

    public sendAll(payload: any): void {
        this.controller.sendToAll(payload);
    }
}
