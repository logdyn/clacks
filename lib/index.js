let userId, httpSessionId = null;

let clearIdentifiers = function() {
    userId = httpSessionId = null;
}

module.exports = {
    init: function(getUserId, getHttpSessionId) {
        return function(req, res, next) {
            userId = getUserId();
            httpSessionId = getHttpSessionId() || req.session.id;
            next();
            clearIdentifiers();
        }
    },
    send: function(payload) {
        //? routing.getWebsocket(userId || httpSessionId)
    }
}