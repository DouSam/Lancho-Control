var mongoose = require("mongoose");

var CompraSchema = new mongoose.Schema({
    produtos: [{
        produto: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Produto"
        },
        qtd: Number
    }],
    valT: Number,
    dataC: Date,
    obs : String
});


module.exports = mongoose.model("Compra", CompraSchema);