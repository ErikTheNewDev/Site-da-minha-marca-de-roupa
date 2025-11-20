function carregarCarrinho() {
    let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
    const container = document.getElementById("carrinho-itens");
    const totalEl = document.getElementById("total");

    container.innerHTML = "";

    let total = 0;

    carrinho.forEach((item, index) => {
        total += item.preco * item.quantidade;

        container.innerHTML += `
            <div class="item-carrinho">
                <div class="item-info">
                    <img src="${item.img}">
                    <h3>${item.nome}</h3>
                </div>

                <div class="quantidade">
                    <button onclick="alterarQt(${index}, -1)">-</button>
                    <span>${item.quantidade}</span>
                    <button onclick="alterarQt(${index}, 1)">+</button>
                </div>

                <span class="btn-remover" onclick="remover(${index})">Remover</span>
            </div>
        `;
    });

    totalEl.textContent = `R$ ${total.toFixed(2)}`;
}

function alterarQt(index, delta) {
    let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
    carrinho[index].quantidade += delta;

    if (carrinho[index].quantidade <= 0) carrinho[index].quantidade = 1;

    localStorage.setItem("carrinho", JSON.stringify(carrinho));
    carregarCarrinho();
}

function remover(index) {
    let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
    carrinho.splice(index, 1);
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
    carregarCarrinho();
}
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

window.onload = carregarCarrinho;
