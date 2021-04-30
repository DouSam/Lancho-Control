var mongoose = require("mongoose");

var ClienteSchema = new mongoose.Schema({
    nome: String,
    endereco: String,
    numero: String,
    bairro: String,
    complemento: String,
    cidade: String,
    celular1: String,
    celular2: String,
    telefone: String,
    cpf: String,
    email: String,
    observacao: String
});


module.exports = mongoose.model("Cliente", ClienteSchema);