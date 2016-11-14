var uuid = require('node-uuid');            //UUID unique identifier ID generator

module.exports = {
    createUUID: function () {
        //Creates a unique job id based on UUID.v4 standard
        uuid4 = uuid.v4();
        id = uuid4.replace(/-/g,'');
        return id;
    }
};
