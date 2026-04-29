// ─── CARTEIRA DE INVESTIMENTOS ────────────────────────────────────────────────

const CARTEIRA_STORAGE = {
  carteiras: 'saldomain_carteiras',
  ativa:     'saldomain_carteira_ativa',
  historico: 'saldomain_historico_aportes',
};

const CATALOGO = [
  { id: 'ts',     nome: 'Tesouro Selic',             classe: 'Renda Fixa'     },
  { id: 'ti',     nome: 'Tesouro IPCA+',              classe: 'Renda Fixa'     },
  { id: 'tp',     nome: 'Tesouro Prefixado',          classe: 'Renda Fixa'     },
  { id: 'tr',     nome: 'Tesouro Renda+',             classe: 'Renda Fixa'     },
  { id: 'te',     nome: 'Tesouro Educa+',             classe: 'Renda Fixa'     },
  { id: 'cdb',    nome: 'CDB',                        classe: 'Renda Fixa'     },
  { id: 'rdb',    nome: 'RDB',                        classe: 'Renda Fixa'     },
  { id: 'lci',    nome: 'LCI',                        classe: 'Renda Fixa'     },
  { id: 'lca',    nome: 'LCA',                        classe: 'Renda Fixa'     },
  { id: 'cri',    nome: 'CRI',                        classe: 'Renda Fixa'     },
  { id: 'cra',    nome: 'CRA',                        classe: 'Renda Fixa'     },
  { id: 'deb',    nome: 'Debêntures',                 classe: 'Renda Fixa'     },
  { id: 'debi',   nome: 'Debêntures Incentivadas',    classe: 'Renda Fixa'     },
  { id: 'poup',   nome: 'Poupança',                   classe: 'Renda Fixa'     },
  { id: 'acoes',  nome: 'Ações (B3)',                 classe: 'Renda Variável' },
  { id: 'bdr',    nome: 'BDR',                        classe: 'Renda Variável' },
  { id: 'fii',    nome: 'FII',                        classe: 'Renda Variável' },
  { id: 'etfn',   nome: 'ETF Nacional',               classe: 'Renda Variável' },
  { id: 'etfi',   nome: 'ETF Internacional',          classe: 'Renda Variável' },
  { id: 'facoes', nome: 'Fundos de Ações',            classe: 'Renda Variável' },
  { id: 'fmm',    nome: 'Fundo Multimercado',         classe: 'Fundos'         },
  { id: 'fcam',   nome: 'Fundo Cambial',              classe: 'Fundos'         },
  { id: 'frf',    nome: 'Fundo de Renda Fixa',        classe: 'Fundos'         },
  { id: 'fip',    nome: 'FIP',                        classe: 'Fundos'         },
  { id: 'pgbl',   nome: 'PGBL',                       classe: 'Previdência'    },
  { id: 'vgbl',   nome: 'VGBL',                       classe: 'Previdência'    },
  { id: 'btc',    nome: 'Bitcoin (BTC)',               classe: 'Criptomoedas'   },
  { id: 'eth',    nome: 'Ethereum (ETH)',              classe: 'Criptomoedas'   },
  { id: 'alt',    nome: 'Altcoins',                   classe: 'Criptomoedas'   },
  { id: 'stable', nome: 'Stablecoins',                classe: 'Criptomoedas'   },
];

const CLASSE_CORES = {
  'Renda Fixa':     '#f59e0b',
  'Renda Variável': '#3b82f6',
  'Fundos':         '#a855f7',
  'Previdência':    '#22c55e',
  'Criptomoedas':   '#ef4444',
};

const TAXA_ANUAL_CLASSE = {
  'Renda Fixa':     0.12,
  'Renda Variável': 0.10,
  'Fundos':         0.09,
  'Previdência':    0.08,
  'Criptomoedas':   0.20,
};

const MINIMOS = {
  ts: 30,   ti: 30,   tp: 30,  tr: 30,  te: 30,
  cdb: 500, rdb: 500,
  lci: 1000, lca: 1000, cri: 1000, cra: 1000, deb: 1000, debi: 1000,
  fii: 10, acoes: 10, etfn: 10, etfi: 10, bdr: 10, facoes: 10,
  fmm: 100, fcam: 100, frf: 100, fip: 100,
  pgbl: 50, vgbl: 50,
  btc: 50, eth: 50, alt: 50, stable: 50,
  poup: 1,
};

// ─── STORAGE HELPERS ─────────────────────────────────────────────────────────

function cGet(key) {
  try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; }
}
function cSet(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}
function carteiraGetCarteiras()      { return cGet(CARTEIRA_STORAGE.carteiras); }
function carteiraSetCarteiras(list)  { cSet(CARTEIRA_STORAGE.carteiras, list); }
function carteiraGetAtiva()          { return localStorage.getItem(CARTEIRA_STORAGE.ativa) || null; }
function carteiraSetAtiva(id)        { localStorage.setItem(CARTEIRA_STORAGE.ativa, id); }
function carteiraGetHistorico()      { return cGet(CARTEIRA_STORAGE.historico); }

function carteiraGetAtual() {
  const carteiras = carteiraGetCarteiras();
  const ativa = carteiraGetAtiva();
  return carteiras.find(c => c.id === ativa) || carteiras[0] || null;
}

// ─── INIT ─────────────────────────────────────────────────────────────────────

function initCarteira() {
  const carteiras = carteiraGetCarteiras();
  if (!carteiras.length) {
    const nova = { id: Date.now().toString(), nome: 'Minha Carteira', ativos: {} };
    carteiraSetCarteiras([nova]);
    carteiraSetAtiva(nova.id);
  } else if (!carteiraGetAtiva()) {
    carteiraSetAtiva(carteiras[0].id);
  }

  carteiraRenderSelect();
  carteiraRenderAtivos();
  carteiraRenderPerfil();
  carteiraRenderConcentracao();
  setupCarteiraTabs();
  setupCarteiraButtons();
  setupCarteiraInputModal();
  setupCarteiraNavHook();
  setupCarteiraShortcut();
}

// ─── TABS ─────────────────────────────────────────────────────────────────────

function setupCarteiraTabs() {
  document.querySelectorAll('.carteira-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.carteira-tab').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.carteira-tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('carteira-tab-' + btn.dataset.tab)?.classList.add('active');
      if (btn.dataset.tab === 'historico') carteiraRenderHistorico();
    });
  });
}

// ─── NAV HOOK ────────────────────────────────────────────────────────────────

function setupCarteiraNavHook() {
  const btn = document.querySelector('.nav-btn[data-screen="carteira"]');
  if (!btn) return;
  btn.addEventListener('click', () => {
    // Render charts when screen becomes visible
    setTimeout(() => {
      carteiraRenderDonut();
      carteiraRenderSunburst();
    }, 50);
  });
}

// ─── SELECT DE CARTEIRAS ──────────────────────────────────────────────────────

function carteiraRenderSelect() {
  const sel = document.getElementById('carteiraSelect');
  if (!sel) return;
  const carteiras = carteiraGetCarteiras();
  const ativa = carteiraGetAtiva();
  sel.innerHTML = carteiras.map(c =>
    `<option value="${c.id}"${c.id === ativa ? ' selected' : ''}>${c.nome}</option>`
  ).join('');
  sel.onchange = () => {
    carteiraSetAtiva(sel.value);
    carteiraRenderAtivos();
    carteiraRenderPerfil();
    carteiraRenderConcentracao();
    carteiraRenderDonut();
    carteiraRenderSunburst();
  };
}

// ─── BUTTONS ─────────────────────────────────────────────────────────────────

function setupCarteiraButtons() {
  document.getElementById('btnNovaCarteira')?.addEventListener('click', carteiraNovaHandler);
  document.getElementById('btnRenomearCarteira')?.addEventListener('click', carteiraRenomearHandler);
  document.getElementById('btnDeletarCarteira')?.addEventListener('click', carteiraDeletarHandler);
  document.getElementById('btnSalvarCarteira')?.addEventListener('click', carteiraSalvarHandler);
  document.getElementById('btnCalcularAporte')?.addEventListener('click', carteiraCalcularAporte);
  document.getElementById('btnExportarCSV')?.addEventListener('click', carteiraExportarCSV);
  document.getElementById('btnSimular')?.addEventListener('click', carteiraSimular);
  document.getElementById('simPrazo')?.addEventListener('blur', e => {
    const v = parseInt(e.target.value, 10);
    if (v > 50)  e.target.value = 50;
    if (v < 1)   e.target.value = 1;
  });
  document.getElementById('btnLimparHistorico')?.addEventListener('click', carteiraLimparHistorico);
}

function setupCarteiraInputModal() {
  const modal      = document.getElementById('carteiraInputModal');
  const confirmBtn = document.getElementById('carteiraInputConfirm');
  const cancelBtn  = document.getElementById('carteiraInputCancel');
  const input      = document.getElementById('carteiraInputNome');
  if (confirmBtn) confirmBtn.addEventListener('click', () => modal._resolve?.(true));
  if (cancelBtn)  cancelBtn.addEventListener('click',  () => modal._resolve?.(false));
  if (input) {
    input.addEventListener('keypress', e => { if (e.key === 'Enter')  confirmBtn?.click(); });
    input.addEventListener('keydown',  e => { if (e.key === 'Escape') cancelBtn?.click(); });
  }
}

function pedirNomeCarteira(titulo, valorInicial = '') {
  return new Promise(resolve => {
    const modal    = document.getElementById('carteiraInputModal');
    const input    = document.getElementById('carteiraInputNome');
    const tituloEl = document.getElementById('carteiraInputTitulo');
    if (!modal || !input || !tituloEl) return resolve(null);
    tituloEl.textContent = titulo;
    input.value = valorInicial;
    modal.classList.add('show');
    if (window.lucide) lucide.createIcons({ nodes: [modal] });
    input.focus();
    if (valorInicial) input.select();
    modal._resolve = confirmado => {
      modal.classList.remove('show');
      modal._resolve = null;
      resolve(confirmado ? input.value.trim() || null : null);
    };
  });
}

async function carteiraNovaHandler() {
  const nome = await pedirNomeCarteira('Nova Carteira');
  if (!nome) return;
  const carteiras = carteiraGetCarteiras();
  const nova = { id: Date.now().toString(), nome, ativos: {} };
  carteiras.push(nova);
  carteiraSetCarteiras(carteiras);
  carteiraSetAtiva(nova.id);
  carteiraRenderSelect();
  carteiraRenderAtivos();
  carteiraRenderPerfil();
  carteiraRenderConcentracao();
  carteiraRenderDonut();
  carteiraRenderSunburst();
  notificar('Carteira criada com sucesso!', 'success');
}

async function carteiraRenomearHandler() {
  const atual = carteiraGetAtual();
  if (!atual) return;
  const nome = await pedirNomeCarteira('Renomear Carteira', atual.nome);
  if (!nome || nome === atual.nome) return;
  const carteiras = carteiraGetCarteiras();
  const idx = carteiras.findIndex(c => c.id === atual.id);
  if (idx === -1) return;
  carteiras[idx].nome = nome.trim();
  carteiraSetCarteiras(carteiras);
  carteiraRenderSelect();
  notificar('Carteira renomeada!', 'success');
}

async function carteiraDeletarHandler() {
  const carteiras = carteiraGetCarteiras();
  if (carteiras.length <= 1) {
    notificar('Você precisa ter ao menos uma carteira.', 'warn');
    return;
  }
  const atual = carteiraGetAtual();
  if (!atual) return;
  const ok = await confirmar(`Excluir a carteira "${atual.nome}"? Esta ação não pode ser desfeita.`);
  if (!ok) return;
  const novas = carteiras.filter(c => c.id !== atual.id);
  carteiraSetCarteiras(novas);
  carteiraSetAtiva(novas[0].id);
  carteiraRenderSelect();
  carteiraRenderAtivos();
  carteiraRenderPerfil();
  carteiraRenderConcentracao();
  carteiraRenderDonut();
  carteiraRenderSunburst();
  notificar('Carteira excluída.', 'success');
}

// ─── ABA ESTRUTURA — LISTA DE ATIVOS ─────────────────────────────────────────

function carteiraRenderAtivos() {
  const container = document.getElementById('carteiraAtivosLista');
  if (!container) return;
  const atual = carteiraGetAtual();
  const ativos = atual?.ativos || {};
  const classes = [...new Set(CATALOGO.map(a => a.classe))];

  container.innerHTML = classes.map(classe => {
    const ativosClasse = CATALOGO.filter(a => a.classe === classe);
    const cor = CLASSE_CORES[classe] || '#888';
    return `
      <div class="carteira-classe-grupo">
        <div class="carteira-classe-header">
          <span class="carteira-classe-dot" style="background:${cor}"></span>
          ${classe}
        </div>
        ${ativosClasse.map(ativo => {
          const checked = ativos[ativo.id] !== undefined;
          const pct = ativos[ativo.id] ?? 0;
          return `
            <div class="carteira-ativo-row" data-ativo-id="${ativo.id}">
              <label class="carteira-ativo-label">
                <input type="checkbox" class="carteira-ativo-check" data-id="${ativo.id}"${checked ? ' checked' : ''}>
                <span>${ativo.nome}</span>
              </label>
              <div class="carteira-ativo-pct-group${checked ? '' : ' hidden'}">
                <input type="number" class="carteira-ativo-pct" data-id="${ativo.id}"
                  min="0" max="100" step="0.1" value="${pct}">
                <span class="percentual-unit">%</span>
              </div>
            </div>`;
        }).join('')}
      </div>`;
  }).join('');

  container.querySelectorAll('.carteira-ativo-check').forEach(cb => {
    cb.addEventListener('change', () => {
      const row = cb.closest('.carteira-ativo-row');
      const pctGroup = row.querySelector('.carteira-ativo-pct-group');
      pctGroup.classList.toggle('hidden', !cb.checked);
      if (!cb.checked) row.querySelector('.carteira-ativo-pct').value = 0;
      carteiraAtualizarTotal();
    });
  });

  container.querySelectorAll('.carteira-ativo-pct').forEach(inp => {
    inp.addEventListener('input', carteiraAtualizarTotal);
  });

  carteiraAtualizarTotal();
}

function carteiraAtualizarTotal() {
  let total = 0;
  document.querySelectorAll('.carteira-ativo-check:checked').forEach(cb => {
    const pctEl = document.querySelector(`.carteira-ativo-pct[data-id="${cb.dataset.id}"]`);
    total += parseFloat(pctEl?.value || 0);
  });
  total = Math.round(total * 10) / 10;

  const badge = document.getElementById('carteiraTotalBadge');
  const btn   = document.getElementById('btnSalvarCarteira');
  if (badge) {
    badge.textContent = `Total: ${total}%`;
    badge.className = 'carteira-total-badge ' + (total === 100 ? 'ok' : 'error');
  }
  if (btn) btn.disabled = total !== 100;
}

function carteiraSalvarHandler() {
  const carteiras = carteiraGetCarteiras();
  const ativa = carteiraGetAtiva();
  const idx = carteiras.findIndex(c => c.id === ativa);
  if (idx === -1) return;

  const ativos = {};
  document.querySelectorAll('.carteira-ativo-check:checked').forEach(cb => {
    const pct = parseFloat(
      document.querySelector(`.carteira-ativo-pct[data-id="${cb.dataset.id}"]`)?.value || 0
    );
    ativos[cb.dataset.id] = pct;
  });

  carteiras[idx].ativos = ativos;
  carteiraSetCarteiras(carteiras);
  carteiraRenderPerfil();
  carteiraRenderConcentracao();
  carteiraRenderDonut();
  carteiraRenderSunburst();
  notificar('Carteira salva com sucesso!', 'success');
}

// ─── BADGE DE PERFIL ─────────────────────────────────────────────────────────

function carteiraRenderPerfil() {
  const el = document.getElementById('carteiraPerfil');
  if (!el) return;
  const atual = carteiraGetAtual();
  const ativos = atual?.ativos || {};

  let totalRF = 0, totalGeral = 0;
  Object.entries(ativos).forEach(([id, pct]) => {
    const ativo = CATALOGO.find(a => a.id === id);
    if (!ativo) return;
    totalGeral += pct;
    if (ativo.classe === 'Renda Fixa') totalRF += pct;
  });

  if (!totalGeral) { el.innerHTML = ''; return; }

  const rfPct = (totalRF / totalGeral) * 100;
  let perfil, classe, icone, desc;
  if (rfPct >= 70) {
    perfil = 'Conservador'; classe = 'perfil-conservador';
    icone  = 'shield';      desc   = 'Foco em preservação de capital';
  } else if (rfPct >= 40) {
    perfil = 'Moderado';    classe = 'perfil-moderado';
    icone  = 'activity';    desc   = 'Equilíbrio entre risco e retorno';
  } else {
    perfil = 'Arrojado';    classe = 'perfil-arrojado';
    icone  = 'zap';         desc   = 'Alto potencial de crescimento';
  }

  el.innerHTML = `
    <div class="carteira-perfil-card ${classe}">
      <div class="carteira-perfil-icon-wrap">
        <i data-lucide="${icone}" class="carteira-perfil-icon"></i>
      </div>
      <div class="carteira-perfil-body">
        <span class="carteira-perfil-nome">${perfil}</span>
        <span class="carteira-perfil-desc">${desc}</span>
      </div>
      <div class="carteira-perfil-rf">
        <span class="carteira-perfil-rf-label">Renda Fixa</span>
        <span class="carteira-perfil-rf-valor">${rfPct.toFixed(0)}%</span>
      </div>
    </div>`;
  if (window.lucide) lucide.createIcons({ nodes: [el] });
}

// ─── ALERTA DE CONCENTRAÇÃO ───────────────────────────────────────────────────

function carteiraRenderConcentracao() {
  const alertEl = document.getElementById('carteiraConcentracaoAlert');
  if (!alertEl) return;
  const atual = carteiraGetAtual();
  const ativos = atual?.ativos || {};

  const problemas = Object.entries(ativos).filter(([, pct]) => pct > 40);
  if (!problemas.length) { alertEl.style.display = 'none'; return; }

  const msgs = problemas.map(([id, pct]) => {
    const ativo = CATALOGO.find(a => a.id === id);
    return `<strong>${ativo?.nome || id}</strong> (${pct}%)`;
  }).join(', ');

  alertEl.innerHTML = `<i data-lucide="alert-triangle"></i>&nbsp; Concentração elevada em: ${msgs}. Considere diversificar.`;
  alertEl.style.display = 'flex';
  if (window.lucide) lucide.createIcons({ nodes: [alertEl] });
}

// ─── DONUT CHART ─────────────────────────────────────────────────────────────

let _carteiraDonutChart = null;

function carteiraRenderDonut() {
  const canvas = document.getElementById('carteiraDonutChart');
  if (!canvas) return;
  if (_carteiraDonutChart) { _carteiraDonutChart.destroy(); _carteiraDonutChart = null; }

  const atual = carteiraGetAtual();
  const ativos = atual?.ativos || {};
  if (!Object.keys(ativos).length) return;

  const porClasse = {};
  Object.entries(ativos).forEach(([id, pct]) => {
    const ativo = CATALOGO.find(a => a.id === id);
    if (!ativo || !pct) return;
    porClasse[ativo.classe] = (porClasse[ativo.classe] || 0) + pct;
  });

  const labels = Object.keys(porClasse);
  const data   = Object.values(porClasse);
  const colors = labels.map(l => CLASSE_CORES[l] || '#888');

  _carteiraDonutChart = new Chart(canvas.getContext('2d'), {
    type: 'doughnut',
    data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 0, hoverOffset: 8 }] },
    options: {
      responsive: true, maintainAspectRatio: false,
      cutout: '60%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#a1a1aa', font: { size: 11 }, boxWidth: 12, padding: 12 }
        },
        tooltip: {
          callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed.toFixed(1)}%` }
        }
      }
    }
  });
}

// ─── SUNBURST (ECharts) ───────────────────────────────────────────────────────

function carteiraRenderSunburst() {
  const el = document.getElementById('carteiraSunburst');
  if (!el) return;

  if (typeof echarts === 'undefined') {
    el.innerHTML = '<p style="text-align:center;color:var(--muted);padding:40px 0;font-size:13px;">ECharts não carregado.</p>';
    return;
  }

  const atual = carteiraGetAtual();
  const ativos = atual?.ativos || {};
  const entries = Object.entries(ativos).filter(([, pct]) => pct > 0);

  if (!entries.length) {
    el.innerHTML = '<p style="text-align:center;color:var(--muted);padding:40px 0;font-size:13px;">Salve a carteira para ver o gráfico.</p>';
    return;
  }

  const classes = {};
  entries.forEach(([id, pct]) => {
    const ativo = CATALOGO.find(a => a.id === id);
    if (!ativo) return;
    if (!classes[ativo.classe]) {
      classes[ativo.classe] = {
        name: ativo.classe,
        value: 0,
        itemStyle: { color: CLASSE_CORES[ativo.classe] },
        children: [],
      };
    }
    classes[ativo.classe].value += pct;
    classes[ativo.classe].children.push({
      name: ativo.nome,
      value: pct,
      itemStyle: { color: CLASSE_CORES[ativo.classe] + 'bb' },
    });
  });

  let chart = echarts.getInstanceByDom(el);
  if (chart) chart.dispose();
  chart = echarts.init(el, null, { renderer: 'canvas' });

  chart.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      backgroundColor: 'rgba(18,18,24,0.95)',
      borderColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1,
      textStyle: { color: '#f5f5f5', fontSize: 13 },
      formatter: params => {
        if (!params.value) return '';
        return `<b>${params.name}</b><br/>${params.value}%`;
      },
    },
    series: [{
      type: 'sunburst',
      data: Object.values(classes),
      center: ['50%', '50%'],
      radius: ['22%', '90%'],
      sort: null,
      nodeClick: false,
      emphasis: {
        focus: 'ancestor',
        itemStyle: { shadowBlur: 16, shadowColor: 'rgba(0,0,0,0.6)' },
      },
      itemStyle: {
        borderWidth: 3,
        borderColor: '#0b0b0c',
        borderRadius: 5,
      },
      label: { show: false },
      levels: [
        {},
        { r0: '22%', r: '55%', itemStyle: { borderWidth: 3, borderRadius: 6 } },
        { r0: '58%', r: '90%', itemStyle: { borderRadius: 4 } },
      ],
    }]
  });
}

// ─── ABA CALCULAR APORTE ─────────────────────────────────────────────────────

let _carteiraAporteChart = null;

function carteiraCalcularAporte() {
  const aporte = desformatarMoeda(document.getElementById('carteiraAporteValor')?.value || '');
  if (!aporte || aporte <= 0) { notificar('Digite um valor de aporte válido.', 'warn'); return; }

  const atual = carteiraGetAtual();
  const ativos = atual?.ativos || {};
  const entries = Object.entries(ativos).filter(([, pct]) => pct > 0);
  if (!entries.length) { notificar('Salve uma carteira com ativos antes de calcular.', 'warn'); return; }

  // Calcular em centavos (evita ponto flutuante)
  const aporteCents = Math.round(aporte * 100);
  let somaAlocado = 0;
  const distribuicao = entries.map(([id, pct]) => {
    const ativo = CATALOGO.find(a => a.id === id);
    const valorCents = Math.floor(aporteCents * pct / 100);
    somaAlocado += valorCents;
    return { id, nome: ativo?.nome || id, classe: ativo?.classe || '', pct, valorCents };
  });
  // Resíduo vai para o último item, garantindo que soma === aporte exato
  distribuicao[distribuicao.length - 1].valorCents += (aporteCents - somaAlocado);

  // Alerta de mínimo
  const abaixoMinimo = distribuicao.filter(d => {
    const min = MINIMOS[d.id] || 0;
    return d.valorCents > 0 && (d.valorCents / 100) < min;
  });
  const alertEl = document.getElementById('carteiraAporteAlertMinimo');
  if (alertEl) {
    if (abaixoMinimo.length) {
      const msgs = abaixoMinimo.map(d => `${d.nome} (mín. ${formatarMoeda(MINIMOS[d.id] || 0)})`).join(', ');
      alertEl.innerHTML = `<i data-lucide="alert-triangle"></i>&nbsp; <strong>Abaixo do mínimo:</strong> ${msgs}`;
      alertEl.style.display = 'flex';
      if (window.lucide) lucide.createIcons({ nodes: [alertEl] });
    } else {
      alertEl.style.display = 'none';
    }
  }

  // Tabela
  const tabela = document.getElementById('carteiraAporteTabela');
  if (tabela) {
    tabela.innerHTML = `
      <thead><tr>
        <th>Ativo</th><th>Classe</th>
        <th style="text-align:right;">%</th>
        <th style="text-align:right;">Valor (R$)</th>
      </tr></thead>
      <tbody>${distribuicao.map(d => `<tr>
        <td>${d.nome}</td>
        <td>${d.classe}</td>
        <td style="text-align:right;">${d.pct.toFixed(1)}%</td>
        <td style="text-align:right;">${formatarMoeda(d.valorCents / 100)}</td>
      </tr>`).join('')}</tbody>
      <tfoot><tr style="font-weight:700;">
        <td colspan="3">Total</td>
        <td style="text-align:right;">${formatarMoeda(aporte)}</td>
      </tr></tfoot>`;
  }

  // Gráfico de barras horizontal
  const canvas = document.getElementById('carteiraAporteChart');
  if (canvas) {
    if (_carteiraAporteChart) { _carteiraAporteChart.destroy(); _carteiraAporteChart = null; }
    _carteiraAporteChart = new Chart(canvas.getContext('2d'), {
      type: 'bar',
      data: {
        labels: distribuicao.map(d => d.nome),
        datasets: [{
          data: distribuicao.map(d => d.valorCents / 100),
          backgroundColor: distribuicao.map(d => CLASSE_CORES[d.classe] || '#888'),
          borderWidth: 0,
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => ' ' + formatarMoeda(ctx.parsed.x) } }
        },
        scales: {
          x: {
            ticks: { color: '#a1a1aa', callback: v => formatarMoeda(v) },
            grid: { color: 'rgba(255,255,255,0.06)' }
          },
          y: {
            ticks: { color: '#f5f5f5', font: { size: 11 } },
            grid: { display: false }
          }
        }
      }
    });
  }

  // Salvar no histórico (max 50)
  const historico = carteiraGetHistorico();
  historico.unshift({
    id: Date.now(),
    data: new Date().toLocaleDateString('pt-BR'),
    carteira: atual?.nome || '',
    valor: aporte,
    resumo: distribuicao.slice(0, 3).map(d => `${d.nome}: ${formatarMoeda(d.valorCents / 100)}`).join(' · '),
  });
  if (historico.length > 50) historico.splice(50);
  cSet(CARTEIRA_STORAGE.historico, historico);

  document.getElementById('carteiraAporteResult').style.display = 'block';
}

// ─── EXPORTAR CSV ────────────────────────────────────────────────────────────

function carteiraExportarCSV() {
  const tabela = document.getElementById('carteiraAporteTabela');
  if (!tabela) return;
  const rows = [['Ativo', 'Classe', 'Percentual', 'Valor (R$)']];
  tabela.querySelectorAll('tbody tr').forEach(tr => {
    const tds = [...tr.querySelectorAll('td')].map(td => td.textContent.trim());
    rows.push(tds);
  });
  const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'aporte.csv'; a.click();
  URL.revokeObjectURL(url);
}

// ─── ABA SIMULADOR ───────────────────────────────────────────────────────────

let _simChart = null;

function carteiraSimular() {
  const aporteMensal = desformatarMoeda(document.getElementById('simAporteMensal')?.value || '');
  const prazoAnos    = parseInt(document.getElementById('simPrazo')?.value || '0', 10);

  if (!aporteMensal || aporteMensal <= 0) { notificar('Digite um aporte mensal válido.', 'warn'); return; }
  if (!prazoAnos || prazoAnos < 1)        { notificar('Digite um prazo válido (mínimo 1 ano).', 'warn'); return; }
  const PRAZO_MAX = 50;
  if (prazoAnos > PRAZO_MAX) { notificar(`Prazo máximo permitido: ${PRAZO_MAX} anos.`, 'warn'); return; }

  const atual = carteiraGetAtual();
  const ativos = atual?.ativos || {};

  // Taxa anual ponderada pela carteira
  let totalPct = 0, taxaPonderada = 0;
  Object.entries(ativos).forEach(([id, pct]) => {
    const ativo = CATALOGO.find(a => a.id === id);
    if (!ativo) return;
    taxaPonderada += pct * (TAXA_ANUAL_CLASSE[ativo.classe] || 0.10);
    totalPct += pct;
  });
  const taxaAnual   = totalPct > 0 ? taxaPonderada / totalPct : 0.10;
  const taxaMensal  = Math.pow(1 + taxaAnual, 1 / 12) - 1;
  const meses       = prazoAnos * 12;

  // Projeção mês a mês
  const pontos = [];
  let patrimonio = 0;
  for (let m = 0; m <= meses; m++) {
    if (m % 12 === 0) pontos.push({ ano: m / 12, valor: patrimonio });
    patrimonio = patrimonio * (1 + taxaMensal) + aporteMensal;
  }
  const patrimonioFinal = pontos[pontos.length - 1].valor;
  const totalAportado   = aporteMensal * meses;

  // Cards
  const card = document.getElementById('simPatrimonioCard');
  if (card) {
    card.innerHTML = `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;">
      <div class="calc-stat">
        <div class="calc-stat-label">Patrimônio Estimado</div>
        <div class="calc-stat-value" style="color:var(--ok);">${formatarMoeda(patrimonioFinal)}</div>
      </div>
      <div class="calc-stat">
        <div class="calc-stat-label">Total Aportado</div>
        <div class="calc-stat-value">${formatarMoeda(totalAportado)}</div>
      </div>
      <div class="calc-stat">
        <div class="calc-stat-label">Rendimento Estimado</div>
        <div class="calc-stat-value" style="color:var(--accent);">${formatarMoeda(patrimonioFinal - totalAportado)}</div>
      </div>
    </div>`;
  }

  // Gráfico de área
  const canvas = document.getElementById('simChart');
  if (canvas) {
    if (_simChart) { _simChart.destroy(); _simChart = null; }
    _simChart = new Chart(canvas.getContext('2d'), {
      type: 'line',
      data: {
        labels: pontos.map(p => `Ano ${p.ano}`),
        datasets: [{
          label: 'Patrimônio',
          data: pontos.map(p => parseFloat(p.valor.toFixed(2))),
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245,158,11,0.10)',
          fill: true,
          tension: 0.35,
          pointRadius: pontos.length > 20 ? 0 : 3,
          pointBackgroundColor: '#f59e0b',
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => ' ' + formatarMoeda(ctx.parsed.y) } }
        },
        scales: {
          x: { ticks: { color: '#a1a1aa', font: { size: 11 } }, grid: { color: 'rgba(255,255,255,0.06)' } },
          y: {
            ticks: { color: '#a1a1aa', callback: v => formatarMoeda(v) },
            grid: { color: 'rgba(255,255,255,0.06)' }
          }
        }
      }
    });
  }

  document.getElementById('simResultado').style.display = 'block';
}

// ─── ABA HISTÓRICO ────────────────────────────────────────────────────────────

function carteiraRenderHistorico() {
  const container = document.getElementById('carteiraHistoricoLista');
  if (!container) return;
  const historico = carteiraGetHistorico();

  if (!historico.length) {
    container.innerHTML = `<div class="lancamentos-empty">
      <div class="lancamentos-empty-icon"><i data-lucide="clock" style="width:36px;height:36px;"></i></div>
      <p class="lancamentos-empty-title">Nenhum aporte calculado ainda</p>
      <p class="lancamentos-empty-desc">Use a aba "Calcular Aporte" para registrar o histórico.</p>
    </div>`;
    if (window.lucide) lucide.createIcons({ nodes: [container] });
    return;
  }

  container.innerHTML = historico.map(h => `
    <div class="carteira-historico-item">
      <div class="carteira-historico-header">
        <span class="carteira-historico-carteira">${h.carteira}</span>
        <span class="carteira-historico-data">${h.data}</span>
      </div>
      <div class="carteira-historico-valor">${formatarMoeda(h.valor)}</div>
      <div class="carteira-historico-resumo">${h.resumo}</div>
    </div>`).join('');
}

async function carteiraLimparHistorico() {
  const ok = await confirmar('Limpar todo o histórico de aportes? Esta ação não pode ser desfeita.');
  if (!ok) return;
  cSet(CARTEIRA_STORAGE.historico, []);
  carteiraRenderHistorico();
  notificar('Histórico limpo.', 'success');
}

// ─── SHORTCUT Alt+7 ──────────────────────────────────────────────────────────

function setupCarteiraShortcut() {
  document.addEventListener('keydown', e => {
    if (e.altKey && e.code === 'Digit7') {
      e.preventDefault();
      document.querySelector('.nav-btn[data-screen="carteira"]')?.click();
    }
  });
}

// ─── BOOTSTRAP ───────────────────────────────────────────────────────────────

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCarteira);
} else {
  initCarteira();
}
