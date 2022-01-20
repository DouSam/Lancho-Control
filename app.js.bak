var express    = require("express"),
    app        = express(),
    bodyParser = require('body-parser'),
    mongoose   = require("mongoose"),
    methodOverride = require("method-override"),
    flash      = require("connect-flash"),
    winston = require('./packages/winston.js'),
    RateLimit = require('express-rate-limit');

var http = require('http').createServer(app);
var io   = require('socket.io')(http)

mongoose.connect("mongodb://127.0.0.1:27017/demonstra", { useNewUrlParser: true, useFindAndModify: false });
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride('_method'));
app.locals.moment = require('moment');

app.use(require("express-session")({
    secret: 'a',
    resave: false,
    saveUninitialized: false
}));

app.use(flash());

app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

var limiter = new RateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 60
});

// apply rate limiter to all requests
app.use(limiter);

var Cliente = require("./models/cliente"),
    Mesa    = require("./models/mesa"),
    Produto = require("./models/produto"),
    Comanda = require("./models/comanda"),
    Compra  = require("./models/compra"),
    Error  = require("./models/error")
//Rotas
var mesasRotas = require("./routes/mesas"),
    clientesRotas = require("./routes/cliente"),
    produtosRotas = require("./routes/produto"),
    comprasRotas  = require("./routes/compra"),
    vendasRotas   = require("./routes/venda"),
    estoqueRotas  = require("./routes/estoque"),
    empresaRotas  = require("./routes/empresa"),
    imprimeRotas  = require("./routes/imprimeCfe"),
    mdPagamRotas  = require("./routes/mdPagamento")

//Usando as rotas
app.use("/mesas", mesasRotas)
app.use("/clientes", clientesRotas)
app.use("/produtos", produtosRotas)
app.use("/compras", comprasRotas)
app.use("/vendas", vendasRotas)
app.use("/estoque", estoqueRotas)
app.use("/empresa", empresaRotas)
app.use("/mdPagamento", mdPagamRotas)
app.use("/imprimeCfe", imprimeRotas)

//Recebndo conexões do server
io.on('connection', (socket) => {
    socket.on("busca clientes",(nome)=>{
        Cliente.find({ "nome": { $regex: '.*' + nome.nome + '.*' } }, (err, clientes) => {
            if (err) {
                winston.log("error", `erro app.js->1\n${err}`)
            } else {
                winston.log("info", `Retornando clientes(consulta mesa). Nome: ${nome.nome}`)
                socket.emit("retorna clientes", clientes)
            }
        })
    })

    socket.on('limpa mesa',(id)=>{
        Mesa.findByIdAndUpdate(id,{status:'livre'},(err)=>{
            if(err){
                winston.log("error", `erro app.js 2\n${err}`)
            }else{
                winston.log("info", `Limpando mesa ${id}`)
                socket.emit('atualiza mesa')
            }
        })
    })

    socket.on('busca total venda',(produtos)=>{
        produtos.forEach((produto)=>{
            Produto.findById(produto.produto,(err,produtoE)=>{
                if(err){
                    winston.log("error", `erro app.js->3\n${err}`)
                }else{
                    winston.log("info", `Somando total venda, enviando valor produto: ${produtoE._id} valorU: ${produtoE.val} qtd: ${produto.qtd}`)
                    socket.emit('soma total venda', (produto.qtd * produtoE.val) + parseInt(produto.adc))
                }
            })
        })
    })

    socket.on('exclui produto mesa',(dados)=>{
        Comanda.findOneAndUpdate({ num: dados.num }, { $pull: { 'produtos': { _id: dados.produto } } },{new:true},(err,com)=>{
            if(err){
                winston.log("error", `erro app.js->4\n${err}`)
            }else{
                winston.log("info", `Excluindo produto comanda: ${com._id} produto:${dados.produto}`)
                socket.emit('atualiza mesa')
            }
        })
    })

})

app.get("/",(req,res)=>{
    Comanda.find({delivery:true,entregue:false}).sort('data').populate('cliente').exec((err,comandas)=>{
        if(err){
            winston.log("error", `erro app.js->5\n${err}`)
        }else{
            Error.find({alertado:false},(err,erros)=>{
                if(err){
                    winston.log("error", `erro app.js->5.1\n${err}`)
                }else{
                    winston.log("info", `Renderizando página principal com ${comandas.length} comandas e ${erros.length} erros.`)
                    res.render("home",{comandas:comandas,erros:erros})
                }
            })
        }
    })
})

app.get('/fluxo-caixa',(req,res)=>{
    const agg = [
        {
            '$match': {
                'dataPg': {
                    '$gte': new Date(req.query.dtIni),
                    '$lt': new Date(req.query.dtFim)
                }
            }
        }, {
            '$group': {
                '_id': {
                    '$dateToString': {
                        'format': '%Y-%m-%d',
                        'date': '$dataPg'
                    }
                },
                'totalV': {
                    '$sum': '$valT'
                }
            }
        }, {
            '$sort': {
                '_id': 1
            }
        }
    ];
    const agg2 = [
        {
            '$match': {
                'dataPg': {
                    '$gte': new Date(req.query.dtIni),
                    '$lt': new Date(req.query.dtFim)
                }
            }
        }, {
            '$group': {
                '_id': {
                    '$dateToString': {
                        'format': '%Y-%m-%d',
                        'date': '$dataC'
                    }
                },
                'totalC': {
                    '$sum': '$valT'
                }
            }
        }, {
            '$sort': {
                '_id': 1
            }
        }
    ];
    Comanda.aggregate(agg,(err,comandas)=>{
        if(err){
            winston.log("error", `erro app.js->6\n${err}`)
        }else{
            Compra.aggregate(agg2,(err,compras)=>{
                if(err){
                    winston.log("error", `erro app.js->6.1\n${err}`)
                }else{
                    winston.log("info", `Renderizando fluxo-caixa, datas ${req.query.dtIni} -> ${req.query.dtFim}. Valor entrada ${comandas} Valor Saída ${compras}`)
                    res.render('fluxo-caixa', { comandas: comandas,compras:compras})
                }
            })
        }
    })
})

http.listen(27015, () => {
    winston.log("info","listening on 27015")
});