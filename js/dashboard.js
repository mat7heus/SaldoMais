// ─── DASHBOARD ───────────────────────────────────────────────────────────────

function renderDashboard(){
  const o = orcamentoAtual();
  if(!o || o.valor_total <= 0){
    const resumoGeral = document.getElementById("resumoGeral");
    if(resumoGeral){
      resumoGeral.innerHTML = `
        <div class="dashboard-empty-state">
          <div class="dashboard-empty-icon"><i data-lucide="wallet" size="44"></i></div>
          <p class="dashboard-empty-title">Nenhum orçamento definido</p>
          <p class="dashboard-empty-desc">Digite um valor acima e clique em "Salvar Orçamento" para começar a controlar seus gastos</p>
        </div>`;
      if(window.lucide) lucide.createIcons();
    }
    return;
  }

  const cats = get(STORAGE.categorias);
  const lanc = get(STORAGE.lancamentos).filter(l => l.id_orcamento === o.id);

  renderResumoGeral(cats, lanc, o);

  categoriasStatus.innerHTML = cats.map(c => {
    const gasto          = lanc.filter(l => l.id_categoria === c.id).reduce((s, l) => s + l.valor, 0);
    const limite         = o.valor_total * c.percentual / 100;
    const percentualGasto = (gasto / limite) * 100;
    const cor = percentualGasto > 100 ? "#ef4444" : percentualGasto > 80 ? "#fb923c" : "#22c55e";
    return `
      <div class="categoria-status">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
          <span style="font-weight:500;">${c.nome}</span>
          <span style="color:var(--muted);font-size:12px;">${formatarMoeda(gasto)} / ${formatarMoeda(limite)}</span>
        </div>
        <div class="barra">
          <div class="barra-fill" style="width:${Math.min(percentualGasto,100)}%;background:${cor};"></div>
        </div>
      </div>`;
  }).join("");

  renderGrafico(cats, lanc, o);
  if(window.lucide) lucide.createIcons();
}

function renderResumoGeral(cats, lanc, o){
  const resumoGeral = document.getElementById("resumoGeral");
  if(!resumoGeral) return;

  const totalGasto      = lanc.reduce((s, l) => s + l.valor, 0);
  const totalRestante   = o.valor_total - totalGasto;
  const percentualUsado = (totalGasto / o.valor_total) * 100;

  let categoriasAlert = 0;
  cats.forEach(c => {
    const gasto  = lanc.filter(l => l.id_categoria === c.id).reduce((s, l) => s + l.valor, 0);
    const limite = o.valor_total * c.percentual / 100;
    if(gasto > limite) categoriasAlert++;
  });

  resumoGeral.innerHTML = `
    <div class="stat-card">
      <span class="stat-label">Total Disponível</span>
      <span class="stat-value">${formatarMoeda(o.valor_total)}</span>
      <span class="stat-subtitle">Seu orçamento do mês</span>
    </div>
    <div class="stat-card">
      <span class="stat-label">Total Gasto</span>
      <span class="stat-value">${formatarMoeda(totalGasto)}</span>
      <div class="stat-bar">
        <div class="stat-bar-fill" style="width:${Math.min(percentualUsado,100)}%"></div>
      </div>
      <span class="stat-subtitle">${percentualUsado.toFixed(1)}% do orçamento</span>
    </div>
    <div class="stat-card" style="border-color:${totalRestante>0?'rgba(34,197,94,0.3)':'rgba(239,68,68,0.3)'};background:${totalRestante>0?'rgba(34,197,94,0.06)':'rgba(239,68,68,0.06)'};">
      <span class="stat-label">Disponível</span>
      <span class="stat-value" style="color:${totalRestante>0?'var(--ok)':'var(--danger)'}">
        ${formatarMoeda(totalRestante)}
      </span>
      <span class="stat-subtitle">${totalRestante>0?'Ainda pode gastar':'Orçamento ultrapassado'}</span>
    </div>
    ${categoriasAlert > 0 ? `
      <div class="stat-card" style="border-color:#fb923c40;background:rgba(251,146,60,0.1);">
        <span class="stat-label">Atenção</span>
        <span class="stat-value" style="color:var(--warn);">${categoriasAlert}</span>
        <span class="stat-subtitle">categoria(s) com limite ultrapassado</span>
      </div>` : ''}`;
}

function renderGrafico(cats, lanc, o){
  try {
    if(!cats || !cats.length) return console.warn("Sem categorias");
    const labels    = cats.map(c => c.nome);
    const gastos    = cats.map(c => lanc.filter(l => l.id_categoria === c.id).reduce((s, l) => s + l.valor, 0));
    const cores     = cats.map(c => c.cor_hex);
    const totalGasto = gastos.reduce((a, b) => a + b, 0);
    const percentuais = totalGasto > 0
      ? gastos.map(g => (g / totalGasto) * 100)
      : cats.map(() => 100 / cats.length);

    if(!grafico) return console.error("Canvas não encontrado");
    const ctx = grafico.getContext("2d");
    if(!ctx)   return console.error("Contexto 2D não disponível");

    if(window.graficoChart instanceof Chart) window.graficoChart.destroy();

    const legendaEl = document.getElementById('grafico-legenda');
    if(legendaEl){
      legendaEl.innerHTML = labels.map((label, i) => `
        <div class="grafico-legenda-item">
          <span class="grafico-legenda-cor" style="background:${cores[i]};"></span>
          <span>${label}</span>
        </div>`).join('');
    }

    window.graficoChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels,
        datasets: [{ data: percentuais, backgroundColor: cores, borderColor: "rgba(255,255,255,0.1)", borderWidth: 2, spacing: 2 }]
      },
      options: {
        responsive: true, maintainAspectRatio: true,
        layout: { padding: 0 },
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            backgroundColor: "rgba(0,0,0,0.9)", titleColor: "#f5f5f5", bodyColor: "#f5f5f5",
            borderColor: "rgba(255,255,255,0.3)", borderWidth: 1, padding: 12, displayColors: true,
            callbacks: { label: ctx => `${ctx.label}: ${(ctx.parsed || 0).toFixed(1)}%` }
          }
        }
      }
    });
  } catch (error) {
    console.error("Erro ao renderizar gráfico:", error);
  }
}
