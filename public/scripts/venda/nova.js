const inputName = document.getElementById("inputName")
const select = document.getElementById("select")
const btAdc = document.getElementById('btAdc')
const btnCalcular = document.getElementById('btnCalcular')
const btnSemcliente = document.getElementById("btnSemcliente")
const produto = document.getElementById('produto').innerHTML
const btnPesquisar = document.getElementById("btnPesquisar")
const valE = document.getElementById('valE')
const troco = document.getElementById('troco')
const valorTotal = document.getElementById('valT')

var socket = io();

btAdc.addEventListener("click", function (ev) {
    let div = document.createElement('div')
    div.classList += " row"
    div.innerHTML += produto
    document.getElementById('produtos').appendChild(div)
})

btnCalcular.addEventListener('click', function(ev){
    var produtos = [];
    document.getElementsByName('produto').forEach((produto,i) => {
        let obj = {
            produto : produto.value,
            qtd: document.getElementsByName('qtd')[i].value,
            adc: document.getElementsByName('adc')[i].value
        }
        produtos.push(obj)
    })
    valorTotal.value = '0'
    socket.emit('busca total venda', produtos)
})

try {
    btnPesquisar.addEventListener("click", function (ev) {
        socket.emit("busca clientes", { nome: inputName.value })
    })
} catch (error) { }

socket.on("retorna clientes", function (clientes) {
    select.innerHTML = `<option value="0">Selecione um cliente</option>`
    clientes.forEach(function (cliente) {
        select.innerHTML = select.innerHTML + `<option value="${cliente._id}">${cliente.nome}</option>`
    })
    select.hidden = false
})

socket.on('soma total venda', function (valor){
    valorTotal.value = parseInt(valorTotal.value) + valor
})

valE.addEventListener('change', function (ev) {
    troco.value = valE.value - parseInt(valorTotal.value)
})

btnSemcliente.addEventListener("click", function (ev) {
    select.innerHTML = `<option value="null"></option>`;
    inputName.disabled = true
    inputName.value = 'VENDA SEM CLIENTE!!'
    document.getElementById("modoPg").remove(2)
})