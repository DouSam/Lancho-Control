var mongoose = require("mongoose");

var EmpresaSchema = new mongoose.Schema({
    cnpj: String,
    ie: String,
    im: String,
    indRatISSQN: String,
    icms: String,
    pis: String,
    cofins: String,
    origem: String,
    csosn: String,
    ultNfe: Number
});


module.exports = mongoose.model("Empresa", EmpresaSchema);