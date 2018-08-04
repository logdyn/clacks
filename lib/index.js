let userId, httpSessionId = null;

let clearIdentifiers = function() {
    userId = httpSessionId = null;
}

module.exports = {
    init: function(options) {
        return function(req, res, next) {
            userId = options && options.getUserId ? options.getUserId(req) : req.user.id;
            httpSessionId = options && options.getHttpSessionId ? options.getHttpSessionId(req) : req.session.id;
            next();
            clearIdentifiers();
        }
    },
    getUserId: function() { return userId },
    getHttpSessionId: function() { return httpSessionId },
    send: function(payload) {
        //? routing.getWebsocket(userId || httpSessionId)
    }
}
