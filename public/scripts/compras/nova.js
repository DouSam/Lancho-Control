const btAdc = document.getElementById('btAdc')
const produto = document.getElementById('produto').innerHTML

btAdc.addEventListener("click",function(ev){
    let div = document.createElement('div')
    div.classList += " row"
    div.innerHTML += produto
    document.getElementById('produtos').appendChild(div)
})