// ─── DASHBOARD ───────────────────────────────────────────────────────────────

function animarValor(el, valorFinal){
  if(!el) return;
  const duracao = 650;
  const inicio  = Date.now();
  function tick(){
    const prog  = Math.min((Date.now() - inicio) / duracao, 1);
    const eased = 1 - Math.pow(1 - prog, 3);
    el.textContent = formatarMoeda(valorFinal * eased);
    if(prog < 1) requestAnimationFrame(tick);
    else el.textContent = formatarMoeda(valorFinal);
  }
  requestAnimationFrame(tick);
}

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
    const ulEl = document.getElementById("ultimosLancamentos");
    if(ulEl) ulEl.innerHTML = "";
    const pfEl = document.getElementById("projecaoFimMes");
    if(pfEl) pfEl.innerHTML = "";
    return;
  }

  const cats = get(STORAGE.categorias);
  const lanc = get(STORAGE.lancamentos).filter(l => l.id_orcamento === o.id);

  renderResumoGeral(cats, lanc, o);
  renderProjecaoFimMes(cats, lanc, o);

  categoriasStatus.innerHTML = cats.map(c => {
    const gasto           = lanc.filter(l => l.id_categoria === c.id).reduce((s, l) => s + l.valor, 0);
    const limite          = o.valor_total * c.percentual / 100;
    const pct             = Math.min((gasto / limite) * 100, 100);
    const over            = gasto > limite;
    const nearLimit       = !over && pct >= 80;
    const cor             = over ? "var(--danger)" : nearLimit ? "var(--warn)" : "var(--ok)";
    const badgeBg         = over ? "rgba(239,68,68,0.15)" : nearLimit ? "rgba(251,146,60,0.15)" : "rgba(34,197,94,0.12)";
    const pctDisplay      = over ? `${((gasto / limite)*100).toFixed(0)}%` : `${pct.toFixed(0)}%`;

    return `
      <div class="categoria-status">
        <div class="cat-status-header">
          <span class="cat-status-name" style="display:flex;align-items:center;gap:7px;">
            <span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${c.cor_hex};flex-shrink:0;"></span>
            ${c.nome}
          </span>
          <span class="cat-status-pct-badge" style="background:${badgeBg};color:${cor};">${pctDisplay}</span>
        </div>
        <div class="barra">
          <div class="barra-fill" style="width:${Math.min((gasto/limite)*100,100)}%;background:${cor};transition:width 0.6s cubic-bezier(0.34,1.56,0.64,1);"></div>
        </div>
        <div class="cat-status-amounts">${formatarMoeda(gasto)} <span style="opacity:0.5;">de</span> ${formatarMoeda(limite)}</div>
      </div>`;
  }).join("");

  renderGrafico(cats, lanc, o);
  renderUltimosLancamentos(cats, lanc);
  if(window.lucide) lucide.createIcons();
}

function renderUltimosLancamentos(cats, lanc){
  const el = document.getElementById("ultimosLancamentos");
  if(!el) return;

  const recentes = [...lanc]
    .sort((a, b) => b.data.localeCompare(a.data) || b.id - a.id)
    .slice(0, 5);

  const itens = recentes.length === 0
    ? `<div class="ultimos-lanc-empty"><i data-lucide="inbox" size="28"></i><span>Nenhum lançamento este mês</span></div>`
    : recentes.map(l => {
        const cat = cats.find(c => c.id === l.id_categoria);
        const [y, m, d] = l.data.split("-");
        return `
          <div class="ultimos-lanc-item">
            <span class="ultimos-lanc-dot" style="background:${cat ? cat.cor_hex : 'var(--muted)'}"></span>
            <div class="ultimos-lanc-info">
              <span class="ultimos-lanc-desc">${l.descricao}</span>
              <span class="ultimos-lanc-cat">${cat ? cat.nome : '—'}</span>
            </div>
            <div class="ultimos-lanc-right">
              <span class="ultimos-lanc-valor">${formatarMoeda(l.valor)}</span>
              <span class="ultimos-lanc-data">${d}/${m}</span>
            </div>
          </div>`;
      }).join("");

  el.innerHTML = `
    <div class="ultimos-lanc-card">
      <div class="ultimos-lanc-header">
        <span class="ultimos-lanc-title"><i data-lucide="clock" size="16"></i> Últimos Lançamentos</span>
        <button class="ultimos-lanc-ver-todos" id="btnVerTodosLanc">Ver todos <i data-lucide="arrow-right" size="13"></i></button>
      </div>
      ${itens}
    </div>`;

  document.getElementById("btnVerTodosLanc")
    ?.addEventListener("click", () => document.querySelector('.nav-btn[data-screen="lancamentos"]')?.click());
}

function renderResumoGeral(cats, lanc, o){
  const resumoGeral = document.getElementById("resumoGeral");
  if(!resumoGeral) return;

  const totalGasto      = lanc.reduce((s, l) => s + l.valor, 0);
  const totalRestante   = o.valor_total - totalGasto;
  const percentualUsado = (totalGasto / o.valor_total) * 100;
  const qtdLancamentos  = lanc.length;

  const hoje        = new Date();
  const diasNoMes   = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();
  const limite30    = new Date(hoje); limite30.setDate(hoje.getDate() - 29);
  const limite30Str = limite30.toISOString().split('T')[0];
  const hojeStr     = hoje.toISOString().split('T')[0];
  const lancUlt30   = get(STORAGE.lancamentos).filter(l => l.data >= limite30Str && l.data <= hojeStr);
  const totalUlt30  = lancUlt30.reduce((s, l) => s + l.valor, 0);
  const mediaDiaria = totalUlt30 / 30;

  let categoriasAlert = 0;
  cats.forEach(c => {
    const gasto  = lanc.filter(l => l.id_categoria === c.id).reduce((s, l) => s + l.valor, 0);
    const limite = o.valor_total * c.percentual / 100;
    if(gasto > limite) categoriasAlert++;
  });

  resumoGeral.innerHTML = `
    <div class="stat-card">
      <span class="stat-label">Total Disponível</span>
      <span class="stat-value" id="sv-total">R$ 0,00</span>
      <span class="stat-subtitle">Orçamento do mês</span>
    </div>
    <div class="stat-card">
      <span class="stat-label">Total Gasto</span>
      <span class="stat-value" id="sv-gasto">R$ 0,00</span>
      <div class="stat-bar">
        <div class="stat-bar-fill" style="width:${Math.min(percentualUsado,100)}%"></div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span class="stat-subtitle">${percentualUsado.toFixed(1)}% utilizado</span>
        <span class="stat-count"><i data-lucide="receipt" size="11"></i> ${qtdLancamentos} ${qtdLancamentos === 1 ? 'lançamento' : 'lançamentos'}</span>
      </div>
    </div>
    <div class="stat-card" style="border-color:${totalRestante>0?'rgba(34,197,94,0.28)':'rgba(239,68,68,0.28)'};background:${totalRestante>0?'rgba(34,197,94,0.05)':'rgba(239,68,68,0.05)'};">
      <span class="stat-label">Disponível</span>
      <span class="stat-value" id="sv-rest" style="color:${totalRestante>0?'var(--ok)':'var(--danger)'}">R$ 0,00</span>
      <span class="stat-subtitle">${totalRestante>0?'Ainda pode gastar':'Orçamento ultrapassado'}</span>
    </div>
    <div class="stat-card">
      <span class="stat-label">Média de gastos diários</span>
      <span class="stat-value" id="sv-media">R$ 0,00</span>
      <span class="stat-subtitle">Média dos últimos 30 dias</span>
    </div>
    ${categoriasAlert > 0 ? `
      <div class="stat-card" style="border-color:rgba(251,146,60,0.3);background:rgba(251,146,60,0.07);">
        <span class="stat-label">Atenção</span>
        <span class="stat-value" style="color:var(--warn);">${categoriasAlert}</span>
        <span class="stat-subtitle">categoria${categoriasAlert>1?'s':''} com limite ultrapassado</span>
      </div>` : ''}`;

  animarValor(document.getElementById("sv-total"), o.valor_total);
  animarValor(document.getElementById("sv-gasto"), totalGasto);
  animarValor(document.getElementById("sv-rest"),  totalRestante);
  animarValor(document.getElementById("sv-media"),  mediaDiaria);
}

function renderProjecaoFimMes(cats, lanc, o){
  const el = document.getElementById("projecaoFimMes");
  if(!el) return;

  const hoje          = new Date();
  const diaAtual      = hoje.getDate();
  const diasNoMes     = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();
  const diasRestantes = diasNoMes - diaAtual;
  const totalGasto    = lanc.reduce((s, l) => s + l.valor, 0);

  if(!lanc.length){
    el.innerHTML = `
      <div class="projecao-card">
        <div class="projecao-header">
          <span class="projecao-title"><i data-lucide="trending-up" size="16"></i> Projeção de Fim de Mês</span>
        </div>
        <div class="projecao-empty">
          <i data-lucide="info" size="18"></i>
          Adicione lançamentos para ver a estimativa de saldo ao fim do mês.
        </div>
      </div>`;
    if(window.lucide) lucide.createIcons();
    return;
  }

  const mediaDiaria            = totalGasto / diaAtual;
  const gastoAdicionalEstimado = mediaDiaria * diasRestantes;
  const gastoTotalEstimado     = totalGasto + gastoAdicionalEstimado;
  const saldoProjetado         = o.valor_total - gastoTotalEstimado;

  const pctAtual     = Math.min((totalGasto / o.valor_total) * 100, 100);
  const pctProjetado = Math.min((gastoTotalEstimado / o.valor_total) * 100, 100);

  const positivo     = saldoProjetado >= 0;
  const cor          = positivo ? 'var(--ok)'                : 'var(--danger)';
  const corBorder    = positivo ? 'rgba(34,197,94,0.2)'      : 'rgba(239,68,68,0.2)';
  const corBarraProj = positivo ? 'rgba(34,197,94,0.45)'     : 'rgba(239,68,68,0.55)';
  const corTotal     = gastoTotalEstimado > o.valor_total    ? 'var(--danger)' : 'var(--text)';
  const statusText   = positivo ? 'Estimativa: vai sobrar'   : 'Estimativa: vai faltar';
  const labelDias    = diasRestantes > 0
    ? `${diasRestantes} dia${diasRestantes !== 1 ? 's' : ''} restante${diasRestantes !== 1 ? 's' : ''}`
    : 'Último dia do mês';

  el.innerHTML = `
    <div class="projecao-card" style="border-color:${corBorder};">
      <div class="projecao-header">
        <span class="projecao-title">
          <i data-lucide="trending-up" size="16"></i>
          Projeção de Fim de Mês
        </span>
        <span class="projecao-badge">
          <i data-lucide="calendar" size="12"></i>
          ${labelDias}
        </span>
      </div>

      <div class="projecao-body">
        <div class="projecao-saldo-block">
          <span class="projecao-saldo-label">Saldo estimado</span>
          <span class="projecao-saldo-value" id="pf-saldo" style="color:${cor};">R$ 0,00</span>
          <span class="projecao-saldo-status">${statusText}</span>
        </div>
        <div class="projecao-breakdown">
          <div class="projecao-row">
            <span class="projecao-row-label">Gasto até hoje</span>
            <span class="projecao-row-value" id="pf-atual">R$ 0,00</span>
          </div>
          <div class="projecao-row">
            <span class="projecao-row-label">+ Estimativa restante</span>
            <span class="projecao-row-value" id="pf-adicional">R$ 0,00</span>
          </div>
          <hr class="projecao-divider">
          <div class="projecao-total-row">
            <span class="projecao-row-label">= Total estimado</span>
            <span id="pf-total" style="color:${corTotal};">R$ 0,00</span>
          </div>
        </div>
      </div>

      <div class="projecao-barra-section">
        <div class="projecao-barra-label">
          <span>Atual ${pctAtual.toFixed(1)}%</span>
          <span>Projetado ${pctProjetado.toFixed(1)}% do orçamento</span>
        </div>
        <div class="projecao-barra-track">
          <div class="projecao-barra-projetada" style="width:${pctProjetado}%;background:${corBarraProj};"></div>
          <div class="projecao-barra-atual" style="width:${pctAtual}%;"></div>
        </div>
      </div>

      <div class="projecao-hint">
        Com base em <strong style="color:var(--text);">${diaAtual} dia${diaAtual !== 1 ? 's' : ''}</strong> de gastos neste mês &middot; Média de <strong style="color:var(--text);">${formatarMoeda(mediaDiaria)}/dia</strong>
      </div>
    </div>`;

  animarValor(document.getElementById("pf-saldo"),     saldoProjetado);
  animarValor(document.getElementById("pf-atual"),     totalGasto);
  animarValor(document.getElementById("pf-adicional"), gastoAdicionalEstimado);
  animarValor(document.getElementById("pf-total"),     gastoTotalEstimado);

  if(window.lucide) lucide.createIcons();
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
