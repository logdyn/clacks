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
            }).not.toThrow();
        });
        test('invalid userId method in construction', () => {
            expect(() => {
                new RoutingController(
                    () => 'userId',
                    (socket) => 'httpSessionId');
            }).toThrow(/^getUserId/);
        });
        test('invalid HttpSession method in construction', () => {
            expect(() => {
                new RoutingController(
                    (socket) => 'userId',
                    () => 'httpSessionId');
            }).toThrow(/^getHttpSessionId/);
        });
    });
});