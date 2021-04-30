var mongoose = require("mongoose");

var CFeSchema = new mongoose.Schema({
    comanda: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comanda"
    },
    chave: String,
    timestamp: String
});


module.exports = mongoose.model("CFe", CFeSchema);