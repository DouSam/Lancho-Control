const express = require("express");
const router = express.Router({ mergeParams: true });
const Compra = require("../models/compra")
const Produto = require("../models/produto")
const winston = require('../packages/winston.js');

//Nova compra
router.get("/novo", (req, res) => {
    Produto.find({},(err,produtos)=>{
        if(err){
            console.log("compra.js err 0")
        }else{
            //Formulario de preenchimento nova compra
            res.render("../views/compra/nova",{produtos:produtos})
        }
    })
})
//Criando a nova compra
router.post("/", (req, res) => {
    req.body.produtos = []
    if (Array.isArray(req.body.qtd)){
        req.body.produto.forEach((produto,i)=>{
            Produto.findByIdAndUpdate(produto, { $inc: { qtdEst: req.body.qtd[i] } }, (err) => {
                if (err) {
                    console.log("compra.js err 0.1", err)
                }
            })
            let objProduto = {
                produto : produto,
                qtd : req.body.qtd[i]
            }
            req.body.produtos.push(objProduto)
        })
    }else{
        req.body.produtos = [
            {
                produto: req.body.produto,
                qtd:req.body.qtd
            }
        ]
        Produto.findByIdAndUpdate(req.body.produto,{$inc:{qtdEst: req.body.qtd }},(err)=>{
            if(err){
                console.log("compra.js err 0.2\n",err)
            }
        })
    }
    Compra.create(req.body, (err) => {
        if (err) {
            console.log("compra.js err 1\n",err)
        } else {
            res.redirect("/compras")
        }
    })
})
//Listando todas as compras
router.get("", (req, res) => {
    var dtHoje = new Date()
    var dtIni = req.query.dtIni != undefined? req.query.dtIni : new Date(0,1);
    var dtFim = req.query.dtFim != undefined? req.query.dtFim : new Date(dtHoje.setFullYear(dtHoje.getFullYear() + 10));
    req.query.pg = req.query.pg ? req.query.pg : 0;
    Compra.find({ dataC: { $gte: dtIni, $lte: dtFim } }).skip(req.query.pg * 7).limit(7).exec((err, compras) => {
        if (err) {
            console.log("compra.js err 2");
        } else {
            res.render("../views/compra/compras", { compras: compras, pagina : req.query.pg });
        }
    })
})
//Buscando uma compra especifica
router.get("/:id", (req, res) => {
    Compra.findById(req.params.id).populate('produtos.produto').exec((err, compra) => {
        if (err) {
            console.log("compra.js err 3")
        } else {
            res.render("../views/compra/compra", { compra: compra })
        }
    })
})
//Deletando um deletando uma compra
router.get("/:id/delete", (req, res) => {
    Compra.findByIdAndDelete(req.params.id, (err,compra) => {
        if (err) {
            console.log("compra.js err 4")
        } else {
            compra.produtos.forEach((produto)=>{
                Produto.findByIdAndUpdate(produto.produto,{$inc : {qtdEst: -produto.qtd}},(err)=>{
                    if(err){
                        console.log("compra.js err 4.1")
                    }
                })
            })
            res.redirect("/compras")
        }
    })
})

module.exports = router;