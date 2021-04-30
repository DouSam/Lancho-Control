const fs = require('fs');
const Comanda = require("../models/comanda")
const Empresa = require("../models/empresa")
const https = require('https');
const winston = require('../packages/winston.js');
//1
async function enviaCFe(id,xml){
        fs.writeFile(`${process.cwd()}\\SAT\\notasParaEnvio\\${id}.xml`, xml, function (erro) {
            if (erro) {
                winston.log("error", `erro CFeEmiter.js->1\n${erro}`)
            } else {
                winston.log("info", `Nota ${id} salva com sucesso.`)
            }
        });
}

/**
 * 
 * @param {string} ncm 
 * @param {string} nome 
 * @param {string} uc 
 * @param {string} val 
 * @param {string} cean 
 * @returns array [xml,valNac,valest,valMun,font]
 */
function GetTax(ncm,nome,uc,val,cean){
    return new Promise((reply,reject)=>{
        var hostname = `https://apidoni.ibpt.org.br/api/v1/produtos?token=6vvK5kZXaK5rROBSKOOTDk8LkHd490kXM6EcTn0qmYi_IsaBfSpWuOK6ObmX3prt&cnpj=34437082000158&codigo=${ncm}&uf=SP&ex=0&descricao=${nome}&unidadeMedida=${uc}&valor=${val}&gtin=${cean}`;
        console.log(hostname)
        https.request(hostname, res => {
            var retorno = "";
            var dt = "";
            res.on('data', d => {
                dt += d;
            })

            res.on('end',()=>{    
                console.log(dt);
                dt = JSON.parse(dt)
                retorno = (dt.ValorTributoNacional + dt.ValorTributoEstadual + dt.ValorTributoMunicipal).toFixed(2).toString();
                reply([retorno,dt.ValorTributoNacional,dt.ValorTributoEstadual,dt.ValorTributoMunicipal]);
            })
        }).end();

    });
}

//Função para enviar a nota ao 
async function enviaNota(idComanda){
    winston.log("info", `Montando xml da nota ${idComanda}`)
    //Buscando comanda e empresa
    try
    {
        var comanda = await Comanda.findById(idComanda).populate('produtos.produto');
        var empresa = await Empresa.findOne({});
        comanda = await comanda.toObject();
        empresa = await empresa.toObject();

        var xml = `<?xml version="1.0" encoding="UTF-8"?>`;
        xml += `<CFe><infCFe versaoDadosEnt="0.08"><ide><CNPJ>39298113000150</CNPJ><signAC>Q2GYTMB5nxmV2X2C/qzry4hBU9P5mSnOSgzGkF97Ek9HlMFansW7WOGljUt8N6CerwtYixzvMObUOd4BWmyez+o8mGQquG/XPZH7yd3qDDWYYmBfEritl0tqQJc4Hq8Z4kKfwLrErCumBhNfY6QPX3LjnyebZ8h9x7V4ikiv3RHgNb3iHtazBrSLc68niZqHmImRfjobucOVSYNDubzfjCPrOKiHO/TC69ZpqWmfSUnAChY2bNTc7X9UbhNa4OM8P15XUsKi+a3Ir204lIooVEM4vMe5Q4GIJZBeOGOaNWhuZUNoPdrSl9dvpVQ2GWWPqwVH2ZSgv6/ClkO67YT2KA==</signAC><numeroCaixa>001</numeroCaixa></ide>`;
        xml += `<emit><CNPJ>${empresa.cnpj}</CNPJ><IE>${empresa.ie}</IE>`;
        if (empresa.im.length != 0) {
            xml += '<IM>' + emppresa.im + '</IM>';
        }
        xml += '<indRatISSQN>' + empresa.indRatISSQN + '</indRatISSQN></emit>';
        if (comanda.cpf.length != 0) {
            xml = xml + '<dest><CPF>' + comanda.cpf + '</CPF></dest>';
        } else {
            xml = xml + '<dest></dest>';
        }
        var impostoNacional = 0;
        var impostoEstadual = 0;
        var impostoMunicipal = 0;
        var i = 0;
        for(produto of comanda.produtos)
        {
            if(produto.produto == null){
                return;
            }
            xml = xml + '<det nItem="' + (i + 1) + '">';
            xml = xml + '<prod>';
            xml = xml + '<cProd>' + produto.produto.cod + '</cProd>';
            /*if (produto.produto.cean != null) {
                xml = xml + '<cEAN>' + produto.produto.cean + '</cEAN>';
            }*/
            xml = xml + '<xProd>' + produto.produto.nome + '</xProd>';
            if (produto.produto.ncm.length != 0) {
                xml = xml + '<NCM>' + produto.produto.ncm + '</NCM>';
            }
            if (produto.produto.cest.length != 0) {
                xml = xml + '<CEST>' + produto.produto.cest + '</CEST>';
            }
            xml = xml + '<CFOP>' + produto.produto.cfop + '</CFOP>';
            xml = xml + '<uCom>' + produto.produto.unidadeComercial + '</uCom>';
            xml = xml + '<qCom>' + produto.qtd.toFixed(4) + '</qCom>';
            xml = xml + '<vUnCom>' + produto.produto.val.toFixed(2) + '</vUnCom>';
            xml = xml + '<indRegra>A</indRegra>';
            if(produto.adc != null){
                xml = xml + '<vOutro>' + produto.adc.toFixed(2) + '</vOutro>'
            }
            xml = xml + '</prod><imposto>';
            xml = xml + '<vItem12741>';
            var dadosProduto = await GetTax(produto.produto.ncm,produto.produto.nome,produto.produto.unidadeComercial,produto.produto.val,produto.produto.cean,idComanda)
            xml += dadosProduto[0]
            xml = xml + '</vItem12741>';
            impostoNacional += dadosProduto[1];
            impostoEstadual += dadosProduto[2];
            impostoMunicipal += dadosProduto[3];
            
            if (produto.produto.icms.length != 0) {
                var icms = produto.produto.icms;
                xml = xml + '<ICMS>';
                if (icms == '00' || icms == '20' || icms == '90') {
                    xml = xml + '<ICMS00>';
                    xml = xml + '<Orig>' + produto.produto.origem + '</Orig>';
                    xml = xml + '<CST>' + icms + '</CST>';
                    xml = xml + '<plCMS>' + produto.produto.alicotaEfe.toFixed(2) + '<plCMS>';
                    xml = xml + '</ICMS00>';
                } else if (icms == '40' || icms == '41' || icms == '60') {
                    xml = xml + '<ICMS40>';
                    xml = xml + '<Orig>' + produto.produto.origem + '</Orig>';
                    xml = xml + '<CST>' + icms + '</CST>';
                    xml = xml + '</ICMS40>';
                } else if (icms == '900') {
                    xml = xml + '<ICMSSN900>';
                    xml = xml + '<Orig>' + produto.produto.origem + '</Orig>';
                    xml = xml + '<CSOSN>' + icms + '</CSOSN>';
                    xml = xml + '<plCMS>' + produto.produto.alicotaEfe.toFixed(2) + '<plCMS>';
                    xml = xml + '</ICMSSN900>';
                } else {
                    xml = xml + '<ICMSSN102>';
                    xml = xml + '<Orig>' + produto.produto.origem + '</Orig>';
                    xml = xml + '<CSOSN>' + icms + '</CSOSN>';
                    xml = xml + '</ICMSSN102>';
                }
                xml = xml + '</ICMS>';
            }
            var pis = produto.produto.pis;
            xml = xml + '<PIS>';
            //Falta implementar outros PIS
            if (pis == '01' || pis == '02' || pis == '05') {
                xml = xml + '<PISAliq>';
                xml = xml + '<CST>' + pis + '</CST>';
                xml = xml + '<vBC>' + produto.produto.valorBPis.toFixed(2) + '</vBC>';
                xml = xml + '<pPis>' + produto.produto.valorBPis + '</pPis>';
                xml = xml + '</PISAliq>';
            } else if (pis == '49') {
                xml = xml + '<PISSN>';
                xml = xml + '<CST>' + pis + '</CST>';
                xml = xml + '</PISSN>';
            }
            xml = xml + '</PIS>';
            var cofins = produto.produto.cofins;
            xml = xml + '<COFINS>';
            xml = xml + '<COFINSSN>';
            xml = xml + '<CST>' + cofins + '</CST>';
            xml = xml + '</COFINSSN>';
            xml = xml + '</COFINS>';
            //Falta implementar ISSQN
            xml = xml + '</imposto>';
            xml = xml + '</det>';
            i++;
        }
        xml = xml + '<total><vCFeLei12741>vTotalImpo</vCFeLei12741></total>';
        xml = xml + '<pgto><MP>';
        if (comanda.modoPg == 'dinheiro') {
            xml = xml + '<cMP>01</cMP>';
        } else if(comanda.modoPg == '99'){
            xml = xml + '<cMP>99</cMP>'
        } else {
            xml = xml + '<cMP>' + comanda.modoPg.split('.')[0] + '</cMP>';
        }
        xml = xml + '<vMP>' + comanda.valE.toFixed(2) + '</vMP>';
        if (comanda.modoPg != 'dinheiro' && comanda.modoPg != '99') {
            xml = xml + '<cAdmC>' + comanda.modoPg.split('.')[1] + '</cAdmC>';
        }
        xml = xml + '</MP></pgto><infAdic><infCpl>Tributos Incidentes Lei Federal 12.741/12\nFederal |vFed|, Estadual |vEst|, Municipal |vMun| \nFonte: IBPT/empresometro.com.br 5oi7eW</infCpl></infAdic></infCFe></CFe>';
        xml = xml.replace('vTotalImpo', (impostoNacional + impostoEstadual + impostoMunicipal).toFixed(2).toString());
        xml = xml.replace('|vFed|', (impostoNacional).toFixed(2).toString());
        xml = xml.replace('|vEst|', (impostoEstadual).toFixed(2).toString());
        xml = xml.replace('|vMun|', (impostoMunicipal).toFixed(2).toString());
        winston.log("info", `Salvando xml na pasta, id: ${idComanda} valores impostos ${impostoNacional} ${impostoEstadual} ${impostoMunicipal}`)
        await enviaCFe(comanda._id,xml);
    }
    catch(err)
    {
        winston.log("error", `erro CFeEmiter.js->3\n${err}`);
    }
}

module.exports = enviaNota;