const botaoDelete = document.getElementById("deletar")

botaoDelete.addEventListener("click", function (ev) {
    var opcao = prompt("Digite excluir para deletar o produto do sistema")
    if (opcao != 'excluir') {
        ev.preventDefault();
    }
})