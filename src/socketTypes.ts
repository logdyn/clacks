/**
 * this is a socket
 */
export type Socket<S> = S & {
  on: (eventName: string, callback: () => any) => any | void;
  send: (payload) => any | void;
};

export interface WebsocketServer<S> {
  on: (eventName: string, callback: (socket: Socket<S>) => any) => any | void;
}
