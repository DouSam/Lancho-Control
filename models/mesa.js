var mongoose = require("mongoose");

var MesaSchema = new mongoose.Schema({
    cliente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cliente"
    },
    comanda: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comanda"
    },
    referencia: String,
    numero : Number,
    status : String
});


module.exports = mongoose.model("Mesa", MesaSchema);