import RoutingController from "../src/routing";
import { Socket } from "../src/socketTypes";

describe("Test RoutingController", () => {
  describe("Adding a websocket", () => {
    it("Add new websocket", () => {
      const username = "userId";
      const httpSessionId = "httpSessionId";
      const userIdFunc = jest.fn((socket) => username);
      const httpSessionIdFunc = jest.fn((socket) => httpSessionId);

      const controller = new RoutingController(userIdFunc, httpSessionIdFunc);

      const mockSocket: Socket<any> = {
        on: jest.fn((eventName: string, callback: () => any) => true),
        send: jest.fn((payload: any) => true),
      };

      expect(() => controller.addWebsocket(mockSocket)).not.toThrow();
      expect(userIdFunc).toHaveReturnedTimes(1);
      expect(httpSessionIdFunc).toHaveReturnedTimes(1);

      expect(controller).toHaveProperty("userMap");
      expect(controller.userHasSession(username, httpSessionId));
    });
    it("Add existing websocket", () => {
      const userIdFunc = jest.fn((socket) => "userId");
      const httpSessionIdFunc = jest.fn((socket) => "httpSessionId");
      const controller = new RoutingController(userIdFunc, httpSessionIdFunc);

      const socket1: Socket<any> = {
        on: jest.fn((eventName: string, callback: () => any) => true),
        send: jest.fn((payload: any) => true),
      };
      const socket2: Socket<any> = {
        on: jest.fn((eventName: string, callback: () => any) => true),
        send: jest.fn((payload: any) => true),
      };

      controller.addWebsocket(socket1);

      expect(() => controller.addWebsocket(socket2)).not.toThrow();
      expect(userIdFunc).toHaveReturnedTimes(2);
      expect(httpSessionIdFunc).toHaveReturnedTimes(2);

      expect(controller).toHaveProperty("userMap");
    });
  });
  describe("Removing a websocket", () => {
    const userId = "userId";
    const httpSessionId = "httpSessionId";
    const userIdFunc = jest.fn((ws) => userId);
    const httpSessionIdFunc = jest.fn((ws) => httpSessionId);

    const mockSocket: Socket<any> = {
      on: jest.fn((eventName: string, callback: () => any) => true),
      send: jest.fn((payload: any) => true),
    };

    it("Single websocket", () => {
      const controller = new RoutingController(userIdFunc, httpSessionIdFunc);
      controller.addWebsocket(mockSocket);
      expect(controller.removeWebsocket(mockSocket)).toBe(true);
      expect(controller.userHasSession(userId, httpSessionId)).toBe(false);
    });
    test("One session, multiple websockets", () => {
      const getUserId = jest.fn((ws) => ws.id);
      const getHttpSessionId = jest.fn((ws) => ws.sessionId);
      const controller = new RoutingController(getUserId, getHttpSessionId);
      const firstSocket = {
        id: "user",
        on: jest.fn((eventName: string, callback: () => any) => true),
        send: jest.fn((payload: any) => true),
        sessionId: 1,
      };
      const secondSocket = {
        id: "user",
        on: jest.fn((eventName: string, callback: () => any) => true),
        send: jest.fn((payload: any) => true),
        sessionId: 1,
      };

      controller.addWebsocket(firstSocket);
      controller.addWebsocket(secondSocket);
      expect(controller.removeWebsocket(firstSocket)).toBeTruthy();
    });
    it("Undefined session map", () => {
      const controller = new RoutingController(userIdFunc, httpSessionIdFunc);
      expect(controller.removeWebsocket(mockSocket)).toBeFalsy();
    });
  });
  describe("Check if user has a session", () => {
    const userId = "userId";
    const httpSessionId = "httpSessionId";
    const userIdFunc = jest.fn((ws) => userId);
    const httpSessionIdFunc = jest.fn((ws) => httpSessionId);
    const controller = new RoutingController(userIdFunc, httpSessionIdFunc);
    const socket: Socket<any> = {
      on: jest.fn((eventName: string, callback: () => any) => true),
      send: jest.fn((payload: any) => true),
    };
    controller.addWebsocket(socket);

    it("User has session", () => {
      const result = controller.userHasSession(userId, httpSessionId);
      expect(result).toBeTruthy();
    });
    it("User doesn\'t have session", () => {
      const result = controller.userHasSession(userId, "new session id");
      expect(result).toBeFalsy();
    });
    it("User doesn\'t exist", () => {
      const result = controller.userHasSession("newUserId", httpSessionId);
      expect(result).toBeFalsy();
    });
  });
  describe("Sending Payload", () => {
    const userId = "userId";
    const httpSessionId = "httpSessionId";
    const userIdFunc = jest.fn((ws) => userId);
    const httpSessionIdFunc = jest.fn((ws) => httpSessionId);
    describe("Sending to user", () => {
      it("Sending to same socket", () => {
        const controller = new RoutingController(userIdFunc, httpSessionIdFunc);
        const socket: Socket<any> = {
          on: jest.fn((eventName: string, callback: () => any) => true),
          send: jest.fn((payload: any) => true),
        };
        controller.addWebsocket(socket);

        controller.sendToUserId("example", userId);

        expect(socket.send).toReturnTimes(1);
        expect(socket.send).lastCalledWith("example");
      });
      it("Sending to different socket", () => {
        const controller = new RoutingController(userIdFunc, httpSessionIdFunc);
        const socket: Socket<any> = {
          on: jest.fn((eventName: string, callback: () => any) => true),
          send: jest.fn((payload: any) => true),
        };
        controller.addWebsocket(socket);

        controller.sendToUserId("example", userId + "1");

        expect(socket.send).not.toBeCalled();
      });
    });
    describe("Sending to Http Session", () => {
      it("Sending to same socket", () => {
        const controller = new RoutingController(userIdFunc, httpSessionIdFunc);
        const socket: Socket<any> = {
          on: jest.fn((eventName: string, callback: () => any) => true),
          send: jest.fn((payload: any) => true),
        };
        controller.addWebsocket(socket);

        controller.sendToHttpSession("example", httpSessionId, userId);

        expect(socket.send).toReturnTimes(1);
        expect(socket.send).lastCalledWith("example");
      });
      it("Sending to same socket, no username", () => {
        const controller = new RoutingController(userIdFunc, httpSessionIdFunc);
        const socket: Socket<any> = {
          on: jest.fn((eventName: string, callback: () => any) => true),
          send: jest.fn((payload: any) => true),
        };
        controller.addWebsocket(socket);

        controller.sendToHttpSession("example", httpSessionId);

        expect(socket.send).toReturnTimes(1);
        expect(socket.send).lastCalledWith("example");
      });
      it("Sending to different socket", () => {
        const controller = new RoutingController(userIdFunc, httpSessionIdFunc);
        const socket: Socket<any> = {
          on: jest.fn((eventName: string, callback: () => any) => true),
          send: jest.fn((payload: any) => true),
        };
        controller.addWebsocket(socket);

        controller.sendToHttpSession("example", httpSessionId + "1");

        expect(socket.send).not.toBeCalled();
      });
    });
    describe("Sending to all", () => {
      it("Two mock sockets", () => {
        const controller = new RoutingController(userIdFunc, httpSessionIdFunc);
        const firstSocket: Socket<any> = {
          on: jest.fn((eventName: string, callback: () => any) => true),
          send: jest.fn((payload: any) => true),
        };
        const secondSocket: Socket<any> = {
          on: jest.fn((eventName: string, callback: () => any) => true),
          send: jest.fn((payload: any) => true),
        };
        controller.addWebsocket(firstSocket);
        controller.addWebsocket(secondSocket);

        controller.sendToAll("payload");

        expect(firstSocket.send).toReturnTimes(1);
        expect(firstSocket.send).lastCalledWith("payload");
        expect(secondSocket.send).toReturnTimes(1);
        expect(secondSocket.send).lastCalledWith("payload");
      });
    });
  });
});
