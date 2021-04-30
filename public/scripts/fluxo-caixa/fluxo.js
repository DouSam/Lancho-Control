const tabela = document.getElementById('tabela')
const btnPesquisar = document.getElementById('btnPesquisar')
const dtIni = document.getElementById('dtIni')
const dtFim = document.getElementById('dtFim')
const corpotabela = document.getElementById('corpoTabela')

btnPesquisar.addEventListener('click',function (ev){
    corpotabela.innerHTML = ''
    if (dtIni.value == '' && dtFim.value ==''){
        alert("PREENCHA CORRETAMENTE AS DATAS!")
    }
})