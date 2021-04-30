var mongoose = require("mongoose");

var MdPagamentoSchema = new mongoose.Schema({
    nome: String,
    cod: String
});


module.exports = mongoose.model("MdPagamento", MdPagamentoSchema);