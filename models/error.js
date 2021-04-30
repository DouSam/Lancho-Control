var mongoose = require("mongoose");

var ErrorSchema = new mongoose.Schema({
    msg: String,
    venda: String,
    alertado: Boolean
});


module.exports = mongoose.model("Error", ErrorSchema);