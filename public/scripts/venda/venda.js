const troco = document.getElementById('troco')
const valorTotal = document.getElementById('valorTotal').innerText.split('R$')[1]

valE.addEventListener('change', function (ev) {
    troco.value = valE.value - parseInt(valorTotal)
})