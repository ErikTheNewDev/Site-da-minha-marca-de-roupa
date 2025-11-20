// js/carousel-auto.js
// Carrossel contínuo, lento e infinito + zoom central robusto.
// Ajuste SPEED e ZOOM_DISTANCE abaixo se quiser.

(function () {
  const SPEED_PX_PER_FRAME = 0.28; // 0.2 = mais lento, 0.5 = mais rápido
  const ZOOM_DISTANCE = 160;       // alcance para considerar "central"

  document.addEventListener("DOMContentLoaded", () => {
    const carrossel = document.querySelector(".carrossel");
    if (!carrossel) {
      console.warn("carousel-auto.js: .carrossel não encontrada — nada a fazer.");
      return;
    }

    // evita conflito: remova eventuais scripts antigos que mexam no mesmo carrossel
    // (garantido pelo usuário: não carregar outros scripts de autoplay)

    // pega itens originais (antes de clonar)
    let origItems = Array.from(carrossel.querySelectorAll(".item"));
    if (origItems.length === 0) {
      console.warn("carousel-auto.js: nenhum .item encontrado dentro de .carrossel.");
      return;
    }

    // lê o gap do container (em px)
    function getGap() {
      const style = window.getComputedStyle(carrossel);
      const gap = style.getPropertyValue("gap") || style.getPropertyValue("grid-gap");
      return gap ? parseFloat(gap) : 0;
    }

    // copia originais para clones (antes e depois)
    const clonesBefore = origItems.map(it => it.cloneNode(true));
    const clonesAfter = origItems.map(it => it.cloneNode(true));
    clonesAfter.forEach(c => carrossel.appendChild(c));
    clonesBefore.reverse().forEach(c => carrossel.insertBefore(c, carrossel.firstChild));

    // lista de todos itens (originais + clones)
    let allItems = Array.from(carrossel.querySelectorAll(".item"));

    // calcula largura total dos originais (somando offsetWidth + gap)
    function getOriginalsWidth() {
      const gap = getGap();
      return origItems.reduce((s, el, i) => s + el.offsetWidth + (i === origItems.length -1 ? 0 : gap), 0);
    }

    // posiciona scroll no bloco original (pulando os clones no inicio)
    function setInitialScroll() {
      const originalsWidth = getOriginalsWidth();
      carrossel.scrollLeft = originalsWidth;
    }

    // atualiza lista dinamicamente (se precisar)
    function refreshItems() {
      origItems = Array.from(carrossel.querySelectorAll(".item")).slice( (allItems.length/3) | 0, (allItems.length/3) | 0 + origItems.length ); // best-effort
      allItems = Array.from(carrossel.querySelectorAll(".item"));
    }

    // função que atualiza qual item é central (zoom)
    function atualizarCentro() {
      if (!carrossel) return;
      const centro = carrossel.scrollLeft + carrossel.offsetWidth / 2;
      allItems.forEach(item => {
        const itemCentro = item.offsetLeft + item.offsetWidth / 2;
        const distancia = Math.abs(centro - itemCentro);
        item.classList.toggle("central", distancia < ZOOM_DISTANCE);
      });
    }

    // movimento contínuo via RAF
    let rafId = null;
    let running = true;

    function autoStep() {
      if (!running) return;
      carrossel.scrollLeft += SPEED_PX_PER_FRAME;

      // wrap-around: quando atingir perto do final, rola de volta diminuindo por originals width
      const visible = carrossel.offsetWidth;
      const scrollRightEdge = carrossel.scrollLeft + visible;
      // se nos aproximamos do final absoluto, resetamos subtraindo a largura dos originais
      if (scrollRightEdge >= carrossel.scrollWidth - 1) {
        const originalsWidth = getOriginalsWidth();
        carrossel.scrollLeft -= originalsWidth;
      }

      // se por alguma razão scrollLeft muito pequeno (ao mover para esquerda), ajusta
      if (carrossel.scrollLeft <= 0) {
        const originalsWidth = getOriginalsWidth();
        carrossel.scrollLeft += originalsWidth;
      }

      // atualiza zoom (leve)
      atualizarCentro();

      rafId = requestAnimationFrame(autoStep);
    }

    function start() {
      if (rafId) cancelAnimationFrame(rafId);
      running = true;
      rafId = requestAnimationFrame(autoStep);
    }
    function stop() {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    }

    // inicia posição e animação depois do layout
    requestAnimationFrame(() => {
      // refresh items and compute widths
      allItems = Array.from(carrossel.querySelectorAll(".item"));
      setInitialScroll();
      atualizarCentro();
      start();
    });

    // pausa/resume com hover e touch
    carrossel.addEventListener("mouseenter", stop);
    carrossel.addEventListener("mouseleave", start);
    carrossel.addEventListener("touchstart", stop, {passive: true});
    carrossel.addEventListener("touchend", start);

    // setas (se existirem)
    const setaEsq = document.querySelector(".seta-esq");
    const setaDir = document.querySelector(".seta-dir");
    if (setaEsq) {
      setaEsq.addEventListener("mouseenter", stop);
      setaEsq.addEventListener("mouseleave", start);
      setaEsq.addEventListener("click", () => {
        const step = (origItems[0].offsetWidth || 300) + getGap();
        carrossel.scrollBy({ left: -step, behavior: "smooth" });
      });
    }
    if (setaDir) {
      setaDir.addEventListener("mouseenter", stop);
      setaDir.addEventListener("mouseleave", start);
      setaDir.addEventListener("click", () => {
        const step = (origItems[0].offsetWidth || 300) + getGap();
        carrossel.scrollBy({ left: step, behavior: "smooth" });
      });
    }

    // Recalcula no resize (debounced)
    let resizeTimer = null;
    window.addEventListener("resize", () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        allItems = Array.from(carrossel.querySelectorAll(".item"));
        setInitialScroll();
        atualizarCentro();
      }, 180);
    });

    // clique manual no item: pausa por 2s para usuário interagir
    carrossel.addEventListener("click", (e) => {
      stop();
      setTimeout(start, 2000);
    });
  });
})(); 
