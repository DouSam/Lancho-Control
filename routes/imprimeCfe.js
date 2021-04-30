const express = require("express");
const router = express.Router({ mergeParams: true });
const fs = require('fs');
const xml2js = require('xml2js')

router.get('/:chave', (req, res) => {
    fs.readFile(`${process.cwd()}\\SAT\\notasEnviadas\\${req.params.chave}.xml`,'ascii',(err,xml)=>{
        if(err){
            console.log(err)
        }else{
            var parser = new xml2js.Parser()
            parser.parseString(xml, function (err, result) {
                console.log(result.CFe.infCFe[0]['$'])
                res.render("../views/imprimeCfe", { result: result })
            });
        }
    })
})

module.exports = router;