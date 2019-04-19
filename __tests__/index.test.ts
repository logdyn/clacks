import Clacks from "../src/index";

describe("Test Clacks API", () => {
  describe("Creating Clacks instance", () => {
    it("Constructor", () => {

      interface Request {
        httpSessionId: string;
        id: string;
      }

      interface Socket {
        on: (eventName: string, callback: () => any) => { return; };
        send: (payload: any) => { return; };
      }

      const options = {
        websocketServer: {
          on: (eventName: string, callback: (socket) => {}) => { return; },
        },
      };

      const clacks = new Clacks<Request, Socket, string, string>(options);

      expect(clacks).toHaveProperty("getUserId");
      expect(clacks).toHaveProperty("getHttpSessionId");

    });

  });
});
