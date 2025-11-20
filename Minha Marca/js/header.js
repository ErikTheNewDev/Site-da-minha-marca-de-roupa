let ultimoScroll = 0;
const header = document.querySelector("header");

// altera opacidade do fundo conforme rolagem
window.addEventListener("scroll", () => {
    let scrollAtual = window.pageYOffset;

    // efeito de escurecer quando rola
    header.style.background = `rgba(0,0,0,${Math.min(scrollAtual / 300, 0.9)})`;

    // some ao descer
    if (scrollAtual > ultimoScroll && scrollAtual > 120) {
        header.classList.add("header-hidden");
    } 
    // aparece ao subir
    else {
        header.classList.remove("header-hidden");
    }

    ultimoScroll = scrollAtual;
});
function adicionarCarrinho(nome, preco, img) {
    let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

    carrinho.push({
        nome,
        preco,
        img,
        quantidade: 1
    });

    localStorage.setItem("carrinho", JSON.stringify(carrinho));

    alert("Produto adicionado ao carrinho!");
}
