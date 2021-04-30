const express = require("express");
const router = express.Router({ mergeParams: true });
const mdPagamento = require("../models/mdPagamento")

router.get('/', (req, res) => {
    mdPagamento.find({},(err, modos) => {
        if (err) {
            console.log('mdPagamento.js 1\n', err)
        } else {
            res.render('./mdPagamento/mdPagamento', { modos: modos})
        }
    })
})

router.get('/novo', (req, res) => {
    res.render('./mdPagamento/novo')
})

router.post('/',(req,res)=>{
    mdPagamento.create(req.body,(err)=>{
        if(err){
            console.log('mdPagamento.js 2\n', err);
        }else{
            res.redirect('/mdPagamento')
        }
    })
})

module.exports = router;