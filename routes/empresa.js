const express = require("express");
const router = express.Router({ mergeParams: true });
const Empresa = require("../models/empresa")

router.get('/', (req, res) => {
    Empresa.find({},(err, empresa) => {
        if (err) {
            console.log('empresa.js 1\n', err)
        } else {
            if(empresa.length == 0){
                Empresa.create({cnpj:0},(err,empresa)=>{
                    if(err){
                        console.log('empresa.js 2\n',err)
                    }else{
                        res.render('./empresa/empresa', { empresa: empresa })
                    }
                })
            }
            res.render('./empresa/empresa', { empresa: empresa[0]})
        }
    })
})

router.put('/',(req,res)=>{
    req.body.ultNfe = parseInt(req.body.ultNfe);
    Empresa.findOneAndUpdate({},req.body,(err)=>{
        if(err){
            console.log('empresa.js 3\n',err)
        }else{
            res.redirect('/empresa')
        }
    })
})

module.exports = router;