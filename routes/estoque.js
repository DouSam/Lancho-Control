const express = require("express");
const router = express.Router({ mergeParams: true });
const Produto = require("../models/produto")

router.get('/',(req,res)=>{
    req.query.pg = req.query.pg ? req.query.pg : 0;
    Produto.find({}).skip(req.query.pg * 15).limit(15).exec((err,produtos)=>{
        if(err){
            console.log('estoque.js 1\n', err)
        }else{
            res.render('./estoque/estoque',{produtos:produtos,pagina:req.query.pg})
        }
    })
})

module.exports = router;