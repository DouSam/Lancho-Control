const inputName = document.getElementById("inputName")
const select = document.getElementById("select")
const btnPesquisar = document.getElementById("btnPesquisar")
const btnSemcliente = document.getElementById("btnSemcliente")
const divCriar = document.getElementById("divCriar")
const btnLimpar = document.getElementById("btnLimpar")
const btnCriar = document.getElementById("btnCriar")
const imgs = document.getElementsByTagName('img')

var socket = io();

const id = document.URL.split('/')[4]

try {
    btnPesquisar.addEventListener("click", function (ev) {
        socket.emit("busca clientes", { nome: inputName.value })
    })
} catch (error) {}

socket.on("retorna clientes", function(clientes){
    select.innerHTML = `<option value="0">Selecione um cliente</option>`
    clientes.forEach(function (cliente) {
        select.innerHTML = select.innerHTML + `<option value="${cliente._id}">${cliente.nome}</option>`
    })
    divCriar.hidden = false
})

try {
    btnLimpar.addEventListener("click", function (ev) {
        socket.emit("limpa mesa", id)
    })
} catch (error) { }

socket.on("atualiza mesa", function (clientes) {
    location.reload()
})

try {
    btnSemcliente.addEventListener("click", function (ev) {
        select.value = 'null';
        btnCriar.click()
    })    
} catch (error) {
    
}

try {
    for (let i = 0; i < imgs.length; i++) {
        imgs[i].addEventListener("click",function(e){
            console.log(e)
            socket.emit("exclui produto mesa",{num:document.getElementById('numCom').textContent,produto:e.target.id})
        })
    }
} catch (error) {
    
}