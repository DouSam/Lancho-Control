const express = require("express");
const router = express.Router({ mergeParams: true });
const Produto = require("../models/produto")

//Novo produto
router.get("/novo", (req, res) => {
    //Formulario de preenchimento novo produto
    res.render("../views/produto/novo")
})

router.get("/listar", (req, res) => {
    Produto.find({}, (err, produtos) => {
        if (err) {
            console.log(err)
        } else {
            res.render("../views/produto/listar", { produtos: produtos })
        }
    })
})

//Criando o novo produto
router.post("/", (req, res) => {
    req.body.ctrEst = req.body.ctrEst ? true : false;
    Produto.find({}).countDocuments((err,qtd)=>{
        req.body.cod = qtd;
        Produto.create(req.body, (err) => {
            if (err) {
                console.log("produto.js err 1", err)
            } else {
                res.redirect("/produtos")
            }
        })
    })
})
//Listando todos os produtos
router.get("", (req, res) => {
    req.query.nome = req.query.nome ? req.query.nome : "";
    req.query.pg = req.query.pg ? req.query.pg : 0;
    Produto.find({ "nome": { $regex: '.*' + req.query.nome + '.*' } }).skip(req.query.pg * 7).limit(7).exec((err, produtos) => {
        if (err) {
            console.log("produto.js err 2");
        } else {
            res.render("../views/produto/produtos", { produtos: produtos, pagina:req.query.pg });
        }
    })
})
//Buscando um produto em especifico
router.get("/:id", (req, res) => {
    Produto.findById(req.params.id, (err, produto) => {
        if (err) {
            console.log("produto.js err 3")
        } else {
            res.render("../views/produto/produto", { produto: produto })
        }
    })
})
//Deletando um produto
router.get("/:id/delete", (req, res) => {
    Produto.findByIdAndDelete(req.params.id, (err) => {
        if (err) {
            console.log("produto.js err 4")
        } else {
            res.redirect("/produtos")
        }
    })
})
//Form para editar produto
router.get("/:id/edit", (req, res) => {
    Produto.findById(req.params.id, (err, produto) => {
        if (err) {
            console.log("produto.js err 5")
        } else {
            res.render("../views/produto/edit", { produto: produto })
        }
    })
})
//Editando o produto do form anterior
router.put("/:id", (req, res) => {
    req.body.ctrEst = req.body.ctrEst == undefined ? false : true
    console.log(req.body)
    Produto.findByIdAndUpdate(req.params.id, req.body, (err) => {
        if (err) {
            console.log("produto.js err 6")
        } else {
            res.redirect(`/produtos/${req.params.id}`)
        }
    })
})



module.exports = router;