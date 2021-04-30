const express = require("express");
const router = express.Router({ mergeParams: true });
const Cliente = require("../models/cliente")
const winston = require('../packages/winston.js');

//Novo cliente
router.get("/novo", (req, res) => {
    //Formulario de preenchimento novo cliente
    res.render("../views/cliente/novo")
    winston.log("info", `Exibindo formulario cliente novo`)
})
//Criando o novo cliente
router.post("/", (req, res) => {
    winston.log("info",`Criando novo cliente dados ${req.body}`)
    Cliente.create(req.body, (err,cliente) => {
        if (err) {
            winston.log("error", `cliente.js err 1 ${err}`)
        } else {
            winston.log("info", `Cliente criado ${cliente._id}`)
            res.redirect("/clientes")
        }
    })
})
//Listando todos os clientes
router.get("", (req, res) => {
    req.query.nome = req.query.nome ? req.query.nome : "";
    req.query.pg = req.query.pg ? req.query.pg : 0;
    Cliente.find({ "nome": { $regex: '.*' + req.query.nome + '.*' } }).skip(req.query.pg * 7).limit(7).exec((err, clientes) => {
        if (err) {
            winston.log("error", `cliente.js err 2 ${err}`)
        } else {
            winston.log("info", `Listando todos os clientes.`)
            res.render("../views/cliente/clientes", { clientes: clientes, pagina:req.query.pg });
        }
    })
})
//Buscando um cliente em especifico
router.get("/:id",(req,res)=>{
    Cliente.findById(req.params.id,(err,cliente)=>{
        if(err){
            winston.log("error", `cliente.js err 3 ${err}`)
        }else{
            winston.log("info", `Listando cliente ${cliente._id}`)
            res.render("../views/cliente/cliente",{cliente:cliente})
        }
    })
})
//Deletando um cliente
router.get("/:id/delete",(req,res)=>{
    winston.log("info", `Deletando cliente ${req.params.id}`)
    Cliente.findOneAndDelete(req.params.id,(err)=>{
        if(err){
            winston.log("error", `cliente.js err 4 ${err}`)
        }else{
            winston.log("info", `Cliente ${req.params.id} deletado com sucesso`)
            res.redirect("/clientes")
        }
    })
})
//Form para editar cliente
router.get("/:id/edit",(req,res)=>{
    Cliente.findById(req.params.id,(err,cliente)=>{
        if(err){
            winston.log("error", `cliente.js err 5 ${err}`)
        }else{
            winston.log("info", `Exibindo form para edição cliente ${cliente._id}`)
            res.render("../views/cliente/edit", {cliente:cliente})
        }
    })
})
//Editando o cliente do form anterior
router.put("/:id",(req,res)=>{
    winston.log("info", `Editando cliente ${req.params.id} dados ${req.body}`)
    Cliente.findByIdAndUpdate(req.params.id,req.body,(err)=>{
        if(err){
            winston.log("error", `cliente.js err 6 ${err}`)
        }else{
            winston.log("info", `Cliente ${req.params.id} editado com sucesso.`)
            res.redirect(`/clientes/${req.params.id}`)
        }
    })
})

module.exports = router;