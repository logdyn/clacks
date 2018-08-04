let RoutingController = require('../lib/routing');

describe('Test RoutingController', () => {
    describe('Constructor', () => {
            test('Construction values', () => {
                let controller = new RoutingController((socket) => 'userId',
                    (socket) => 'httpSessionId');

                expect(controller.getUserId()).toBe('userId');
                expect(controller.getHttpSessionId()).toBe('httpSessionId');
            });

            test('Positive validation construction', () => {
                expect(() => {
                    new RoutingController(
                        (socket) => 'userId',
                        (socket) => 'httpSessionId');
                }).not.toThrowError();
            });

            test('invalid userId method in construction', () => {
                expect(() => {
                    new RoutingController(
                        () => 'userId',
                        (socket) => 'httpSessionId');
                }).toThrowError(/^getUserId/);
            });

            test('invalid HttpSession method in construction', () => {
                expect(() => {
                    new RoutingController(
                        (socket) => 'userId',
                        () => 'httpSessionId');
                }).toThrowError(/^getHttpSessionId/);
            });

            test('both invalid methods in construction', () => {
                expect(() => {
                    new RoutingController(
                        () => 'userId',
                        () => 'httpSessionId');
                }).toThrowError(/^getUserId/);
            });
        }),
        describe('Adding a websocket', () => {
            describe('Websocket validation', () => {
                    test('Doesn\'t allow for null websocket', () => {
                        let controller = new RoutingController(
                            (socket) => 'userId',
                            (socket) => 'httpSessionId');
                        expect(() => controller.addWebsocket()).toThrowError(/^Socket/);
                    });

                    test('Websocket must have on() function', () => {
                        let controller = new RoutingController(
                            (socket) => 'userId',
                            (socket) => 'httpSessionId');
                        expect(() => controller.addWebsocket({
                            send: () => {}
                        })).toThrowError(/^Socket/);
                    });

                    test('Websocket must have send() function', () => {
                        let controller = new RoutingController(
                            (socket) => 'userId',
                            (socket) => 'httpSessionId');
                        expect(() => controller.addWebsocket({
                            on: () => {}
                        })).toThrowError(/^Socket/);
                    });
                }),
                describe('Method functionality', () => {
                    test('add new websocket', () => {
                        const userIdFunc = jest.fn((socket) => 'userId');
                        const httpSessionIdFunc = jest.fn((socket) => 'httpSessionId');
                        let controller = new RoutingController(
                            userIdFunc,
                            httpSessionIdFunc);
                        const socket = {
                            on: () => {},
                            send: () => {}
                        };
                        expect(() => controller.addWebsocket(socket)).not.toThrow();
                        expect(userIdFunc).toHaveReturnedTimes(1);
                        expect(httpSessionIdFunc).toHaveReturnedTimes(1);

                        expect(controller).toHaveProperty('userMap');
                        const httpMap = controller.userMap.get('userId');
                        expect(httpMap).toBeDefined();
                        const websockets = httpMap.get('httpSessionId');
                        expect(websockets).toContain(socket);
                    });
                    test('add existing websocket', () => {
                        const userIdFunc = jest.fn((socket) => 'userId');
                        const httpSessionIdFunc = jest.fn((socket) => 'httpSessionId');
                        let controller = new RoutingController(
                            userIdFunc,
                            httpSessionIdFunc);
                        const socket1 = {
                            on: () => {},
                            send: () => {}
                        };
                        const socket2 = {
                            on: () => {},
                            send: () => {}
                        };
                        controller.addWebsocket(socket1);

                        expect(() => controller.addWebsocket(socket2)).not.toThrow();
                        expect(userIdFunc).toHaveReturnedTimes(2);
                        expect(httpSessionIdFunc).toHaveReturnedTimes(2);

                        expect(controller).toHaveProperty('userMap');
                        const httpMap = controller.userMap.get('userId');
                        expect(httpMap).toBeDefined();
                        const websockets = httpMap.get('httpSessionId');
                        expect(websockets).toEqual(expect.arrayContaining([socket1, socket2]));
                    });
                });
        });
});