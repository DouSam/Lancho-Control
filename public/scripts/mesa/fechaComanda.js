const valE = document.getElementById('valE')
const troco = document.getElementById('troco')
const total = document.getElementById('total').innerText.replace('R$','')
const btFecha = document.getElementById('btFechaComanda')

valE.addEventListener('change',function(ev){
    troco.value = valE.value - total
})

btFecha.addEventListener("click",function(){
    setTimeout(function () {
        window.location = "http://localhost:27015/imprimir/" + window.location.href.split('/')[4];
    }, 2000)
})