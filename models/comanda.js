var mongoose = require("mongoose");

var ComandaSchema = new mongoose.Schema({
    produtos: [{
        produto : {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Produto"
        },
        qtd : Number,
        adc : Number
    }],
    fechada : Boolean,
    valT : Number,
    data : Date,
    delivery : Boolean,
    entregue : Boolean,
    dataPg : Date,
    num : Number,
    valE : Number,
    modoPg: String,
    cliente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cliente"
    },
    obs : String,
    cpf: String,
    nfe: String,
    dataEmitida: Number
});


module.exports = mongoose.model("Comanda", ComandaSchema);