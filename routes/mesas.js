const express = require("express");
const router = express.Router({ mergeParams: true });
const Mesa = require("../models/mesa")
const Comanda = require("../models/comanda")
const Produto = require("../models/produto")
const mdPagamento = require("../models/mdPagamento")
var enviaNota = require("../packages/CFeEmiter");

//Nova mesa
router.get("/novo", (req, res) => {
    //Formulario de preenchimento nova mesa
    res.render("../views/mesas/nova")
})
//Criando a nova mesa
router.post("/", (req,res)=>{
    req.body.status = "livre";
    Mesa.create(req.body,(err)=>{
        if(err){
            console.log("mesas.js err 1")
        }else{
            res.redirect("/mesas")
        }
    })
})
//Listando todas as mesas
router.get("", (req,res)=>{
    Mesa.find({}).populate("cliente").sort('numero').exec((err,mesas)=>{
        if(err){
            console.log("mesas.js err 2");
        }else{
            res.render("../views/mesas/mesas",{mesas:mesas});
        }
    })
})

//Listando uma mesa especifica
router.get("/:id",(req,res)=>{
    Mesa.findById(req.params.id).populate({path:'comanda',populate:{path:'produtos.produto'}}).populate('cliente').exec((err,mesa)=>{
        if(err){
            console.log("mesas.js err 3")
        }else{
            res.render("../views/mesas/mesa", { mesa: mesa})
        }
    })
})

//Update da mesa para inserir o cliente
router.put("/:id",(req,res)=>{
    if(req.body.op == 'adcP'){
        var objProduto = {
            produto : req.body.produto,
            qtd : req.body.qtd,
            adc : req.body.adc
        }
        Comanda.findByIdAndUpdate(req.body.comanda,{$push:{produtos:objProduto}},(err,comanda)=>{
            if(err){
                console.log("mesas.js err 4")
            }else{
                Produto.findOneAndUpdate({_id:req.body.produto,qtdEst : {$ne:null}},{$inc:{qtdEst:-objProduto.qtd}},{new:true},(err,produto)=>{
                    if(err){
                        console.log('mesas.js err 4.1\n',err)
                    }else{
                        if(produto && (produto.ctrEst && (produto.qtdEst < produto.altEst))){
                            req.flash("error", "Alerta de estoque acionado, por favor verificar produto: " + produto.nome);
                        }
                        res.redirect(`/mesas/${req.params.id}`)
                    }
                })
            }
        })
    }else{
        Comanda.countDocuments().exec((err,num)=>{
            if(err){
                console.log(err)
            }else{
                var comanda = {
                    data: Date.now(),
                    num: num + 1
                }
                Comanda.create(comanda, (err, comanda) => {
                    if (err) {
                        console.log("mesas.js err 4.1\n", err)
                    } else {
                        var mesa = {
                            comanda: comanda,
                            status: 'ocupada',
                            cliente: req.body.id == 'null' ? null : req.body.id
                        }
                        Mesa.findByIdAndUpdate(req.params.id, mesa, (err, mesa) => {
                            if (err) {
                                console.log("mesas.js err 5")
                            } else {
                                res.redirect(`/mesas/${req.params.id}`)
                            }
                        })
                    }
                })
            }
        })
    }
})

//Form para adicionar produto
router.get("/:id/adicionarProduto",(req,res)=>{
    Mesa.findById(req.params.id,(err,mesa)=>{
        if(err){
            console.log("mesas.js err 6")
        }else{
            Produto.find({}).sort({nome:'desc'}).exec((err, produtos) => {
                if (err) {
                    console.log("mesas.js err 6")
                } else {
                    res.render("../views/mesas/adcProduto", { mesa: req.params.id, produtos: produtos, comanda:mesa.comanda })
                }
            })
        }
    })
})

//Fechar comanda
router.get('/:id/fecharComanda',(req,res)=>{
    Mesa.findById(req.params.id).populate({ path: 'comanda', populate: { path: 'produtos.produto' } }).populate('cliente').exec((err, mesa) => {
        if (err) {
            console.log("mesas.js err 7")
        } else {
            mdPagamento.find({},(err,metodos)=>{
                if(err){
                    console.log("mesas.js err 7.1")
                }else{
                    res.render("../views/mesas/fechaComanda", { mesa: mesa,metodos:metodos })
                }
            })
        }
    })
})

//Fechando a comanda
router.put('/:id/fecharComanda', async (req, res) => {
    Mesa.findByIdAndUpdate(req.params.id, { cliente: null, comanda: null, status: 'suja' }, async (err, mesa) => {
        if (err) {
            console.log("mesas.js err 8 ", err)
        } else {
            var fechada = req.body.modoPg == 'conta' ? false:true;
            var dataPg = req.body.modoPg == 'conta' ? new Date(1) : Date.now();        
            Comanda.findByIdAndUpdate(mesa.comanda, {
                fechada: fechada,
                dataPg: dataPg,
                modoPg: req.body.modoPg,
                valE: req.body.valE,
                delivery: false,
                cliente:mesa.cliente,
                valT : req.body.valT,
                cpf: req.body.cpf
            }, async (err,comanda)=>{
                if(err){
                    console.log("mesas.js err 9",err)
                }else{
                    console.log(comanda)
                    if(req.body.cfe == "sim"){
                        await enviaNota(comanda._id)
                        res.redirect(`/`)
                    }else{
                        res.redirect(`/`)
                    }
                }
            })
        }
    })
})

//Deletar mesa
router.delete('/:id',(req,res)=>{
    Mesa.findByIdAndDelete(req.params.id,(err)=>{
        if(err){
            console.log('mesas.js err 10\n', err)
        }else{
            res.redirect('/mesas')
        }
    })
})

module.exports = router;