/**
 * this is a socket
 */
export interface Socket {
  on: (eventName: string, callback: () => any) => any | void;
  send: (payload) => any | void;
}

export interface WebsocketServer {
  on: (eventName: string, callback: (socket: Socket) => any) => any | void;
}
