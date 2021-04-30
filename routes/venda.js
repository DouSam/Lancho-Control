const express = require("express");
const router = express.Router({ mergeParams: true });
const Comanda = require("../models/comanda")
const Produto = require("../models/produto")
const Error = require("../models/error")
const MdPagamento = require("../models/mdPagamento")
var enviaNota = require("../packages/CFeEmiter")
const winston = require('../packages/winston.js');

//Listando todas as vendas
router.get("", (req, res) => {
    if(req.query.error != undefined){
        Error.findByIdAndUpdate(req.query.error,{alertado:true}).exec((err)=>{
            if(err)
            {
                console.log(err)
            }
        })
    }
    var dtHoje = new Date()
    var dtIni = req.query.dtIni != undefined ? req.query.dtIni : new Date(0, 1);
    var dtFim = req.query.dtFim != undefined ? req.query.dtFim : new Date(dtHoje.setFullYear(dtHoje.getFullYear() + 10));
    req.query.pg = req.query.pg ? req.query.pg : 0;
    Comanda.find({ data: { $gte: dtIni, $lte: dtFim } }).populate("cliente").sort('-data').skip(req.query.pg * 7).limit(7).exec((err, comandas) => {
        if (err) {
            console.log("venda.js err 1");
        } else {
            res.render("../views/venda/vendas", { comandas: comandas,pagina:req.query.pg });
        }
    })
})

//Exibindo contas dos clientes
router.get('/contas', (req, res) => {
    var nomeF = req.query.nome ? req.query.nome : "";
    Comanda.find({ fechada: false }).populate('cliente').exec((err, comandas) => {
        if (err) {
            console.log("venda.js err 5\n", err)
        } else {
            console.log(nomeF)
            res.render('../views/venda/contas', { comandas: comandas, nomeF:nomeF })
        }
    })
})

//Realizando o pagamento da conta
router.put('/:id/conta', (req,res)=>{
    var obj = {
        fechada:true,
        dataPg: Date.now(),
        modoPg : req.body.modoPg,
        valE: req.body.valE
    }
    Comanda.findByIdAndUpdate(req.params.id,obj,(err)=>{
        if(err){
            console.log(err)
        }else{
            res.redirect('/vendas/contas')
        }
    })
})

//Nova venda
router.get("/novo", (req, res) => {
    Comanda.countDocuments().exec((err, num) => {
        if (err) {
            console.log(err)
        } else {
            //Formulario de preenchimento nova venda
            Produto.find({}, (err, produtos) => {
                if (err) {
                    console.log("venda.js err 2.1\n", err)
                } else {
                    MdPagamento.find({},(err,modos)=>{
                        if(err){
                            console.log("venda.js 2.2\n",err)
                        }else{
                            res.render("../views/venda/nova", { produtos: produtos, num: num, modos:modos })
                        }
                    })
                }
            })
        }
    })
})

//Listando uma venda especifica
router.get("/:id", (req, res) => {
    Comanda.findById(req.params.id).populate('produtos.produto cliente').exec((err, comanda) => {
        if (err) {
            console.log("venda.js err 2")
        } else {
            res.render("../views/venda/venda", { comanda: comanda })
        }
    })
})

//Criando a nova venda
router.post("/", (req, res) => {
    req.body.produtos = []
    if (Array.isArray(req.body.qtd)){
        req.body.produto.forEach((produto, i) => {
            Produto.findByIdAndUpdate(produto, { $inc: { qtdEst: -req.body.qtd[i] } }, (err) => {
                if (err) {
                    console.log("venda.js err 3.1", err)
                }
            })
            let objProduto = {
                produto: produto,
                qtd: req.body.qtd[i],
                adc: req.body.adc[i]
            }
            req.body.produtos.push(objProduto)
        })
    }else{
        req.body.produtos = [
            {
                produto: req.body.produto,
                qtd: req.body.qtd,
                adc: req.body.adc
            }
        ]
        Produto.findByIdAndUpdate(req.body.produto, { $inc: { qtdEst: -req.body.qtd } }, (err) => {
            if (err) {
                console.log("venda.js err 3.2",err)
            }
        })
    }
    var vendaUnc = req.body.cliente == 'null' ? true:false
    req.body.fechada = req.body.modoPg == 'conta' ? false : true
    req.body.data = Date.now()
    req.body.dataPg = new Date(1)
    req.body.delivery = req.body.delivery = 'on' ? true : false 
    req.body.entregue = (req.body.delivery && !vendaUnc ) ? false : true
    req.body.cliente = req.body.cliente == 'null' ? null : req.body.cliente;
    Comanda.create(req.body, (err,comanda) => {
        if (err) {
            console.log("venda.js err 3")
        } else {
            if (req.body.cfe == "sim") {
                enviaNota(comanda._id)
                res.redirect(`/`)
            } else {
                res.redirect(`/`)
            }
        }
    })
})

//Deletando um deletando uma venda
router.get("/:id/delete", (req, res) => {
    Comanda.findByIdAndDelete(req.params.id, (err, comanda) => {
        if (err) {
            console.log("venda.js err 4")
        } else {
            comanda.produtos.forEach((produto) => {
                Produto.findByIdAndUpdate(produto.produto, { $inc: { qtdEst: produto.qtd } }, (err) => {
                    if (err) {
                        console.log("venda.js err 4.1")
                    }
                })
            })
            res.redirect("/vendas")
        }
    })
})

//Marcando venda como entregada
router.get('/:id/entregue',(req,res)=>{
    Comanda.findByIdAndUpdate(req.params.id,{entregue : true},(err)=>{
        if(err){
            console.log('venda.js err 5\n',err)
        }else{
            res.redirect('/')
        }
    })
})

//Emitindo nota da venda
router.get('/:id/emitir',(req,res)=>{
    enviaNota(req.params.id)
    res.redirect("/")
})

//Salvando NFE na comanda
router.get('/:id/salvaNota',(req,res)=>{
    winston.log("info", `Salvando nota ${req.params.id} no banco de dados.`)
    const update = {
        nfe : req.query.cfe,
        dataEmitida: parseInt(req.query.time)
    }
    Comanda.findByIdAndUpdate(req.params.id.replace(".xml",""),update,{new:true},(err,comanda)=>{
        if(err){
            winston.log("error", `venda.s err 6 ${err}`)
        }else{
            winston.log("info", `Nota salva com sucesso. ${comanda._id}`)
            res.send(comanda)
        }
    })
})

//Criando erro para alertar que a nota não foi salva corretamente
router.get('/:id/erroNota',(req,res)=>{
    Error.create({
        venda:req.params.id,
        alertado:false,
        msg:req.query.msg
    },(err)=>{
        if(err){
            console.log(err)
        }else{
            res.send("ok")
        }
    })
})

module.exports = router;