var mongoose = require("mongoose");

var ProdutoSchema = new mongoose.Schema({
    nome: String,
    ctrEst: Boolean,
    val: Number,
    qtdEst: Number,
    altEst: Number,
    cod: Number,
    cean: String,
    ncm : String,
    cest: String,
    unidadeComercial: String,
    cofins: String,
    cfop: String,
    icms: String,
    issqn: String,
    pis: String,
    pisst: String,
    cofinsst: String,
    origem: String,
    alicotaEfe: String,
    valorBPis: String,
    aliquotaPis: String
});


module.exports = mongoose.model("Produto", ProdutoSchema);