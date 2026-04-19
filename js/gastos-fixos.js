// ─── GASTOS FIXOS ─────────────────────────────────────────────────────────────

STORAGE.gastosFixos = 'saldomain_gastos_fixos';

// ─── RENDER ──────────────────────────────────────────────────────────────────

function renderGastosFixos() {
  const fixos = get(STORAGE.gastosFixos);
  const cats  = get(STORAGE.categorias);

  const selectEl = document.getElementById('gfCategoriaSelect');
  if (selectEl) {
    selectEl.innerHTML = cats.map(c => `<option value="${c.id}">${c.nome}</option>`).join('');
  }

  const lista = document.getElementById('listaGastosFixos');
  if (!lista) return;

  if (fixos.length === 0) {
    lista.innerHTML = `
      <div class="lancamentos-empty">
        <div class="lancamentos-empty-icon"><i data-lucide="repeat" size="40"></i></div>
        <p class="lancamentos-empty-title">Nenhum gasto fixo cadastrado</p>
        <p class="lancamentos-empty-desc">Adicione despesas recorrentes e elas serão inseridas automaticamente no seu orçamento mensal</p>
      </div>`;
    if (window.lucide) lucide.createIcons();
    return;
  }

  const totalFixos = fixos.reduce((s, f) => s + f.valor, 0);

  lista.innerHTML = fixos.map(f => {
    const cat     = cats.find(c => c.id === f.id_categoria);
    const cor     = cat ? cat.cor_hex : '#a1a1aa';
    const catNome = cat ? cat.nome : 'Sem categoria';
    return `
      <div class="lancamento-item">
        <div class="lancamento-cat-dot" style="background:${cor};"></div>
        <div class="lancamento-info">
          <div class="lancamento-descricao">${f.nome}</div>
          <div class="lancamento-categoria">${catNome}</div>
        </div>
        <div class="lancamento-valor">${formatarMoeda(f.valor)}</div>
        <div class="lancamento-actions">
          <button data-action="deletar-gasto-fixo" data-id="${f.id}" class="lancamento-delete" title="Remover gasto fixo">
            <i data-lucide="trash-2" size="13"></i>
          </button>
        </div>
      </div>`;
  }).join('') + `
    <div class="gf-total-row">
      <span class="gf-total-label">Total fixo mensal</span>
      <span class="gf-total-valor">${formatarMoeda(totalFixos)}</span>
    </div>`;

  if (window.lucide) lucide.createIcons();
}

// ─── ADD ──────────────────────────────────────────────────────────────────────

function adicionarGastoFixo() {
  const nomeEl  = document.getElementById('gfNome');
  const valorEl = document.getElementById('gfValor');
  const catEl   = document.getElementById('gfCategoriaSelect');
  if (!nomeEl || !valorEl || !catEl) return;

  const nome         = nomeEl.value.trim();
  const valor        = desformatarMoeda(valorEl.value);
  const id_categoria = Number(catEl.value);

  if (!nome)               { notificar('Digite um nome para o gasto fixo', 'warn'); return; }
  if (!valor || valor <= 0){ notificar('Digite um valor válido', 'warn'); return; }

  const fixos = get(STORAGE.gastosFixos);
  fixos.push({ id: Date.now(), nome, valor, id_categoria });
  set(STORAGE.gastosFixos, fixos);

  nomeEl.value  = '';
  valorEl.value = '';

  renderGastosFixos();
  notificar('Gasto fixo cadastrado! Será aplicado no próximo orçamento.', 'success');
}

// ─── DELETE ───────────────────────────────────────────────────────────────────

async function deletarGastoFixo(id) {
  const ok = await confirmar('Deseja remover este gasto fixo? Ele não será mais inserido automaticamente.');
  if (!ok) return;
  set(STORAGE.gastosFixos, get(STORAGE.gastosFixos).filter(f => f.id !== id));
  renderGastosFixos();
  notificar('Gasto fixo removido', 'success');
}

// ─── AUTO-APPLY ───────────────────────────────────────────────────────────────

function aplicarGastosFixos() {
  const o = orcamentoAtual();
  if (!o || o.valor_total <= 0) return;

  const fixos = get(STORAGE.gastosFixos);
  if (fixos.length === 0) return;

  const lancs  = get(STORAGE.lancamentos);
  const hoje   = new Date();
  const dataRef = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-01`;

  let i = 0;
  let alterou = false;

  fixos.forEach(f => {
    const jaAplicado = lancs.some(l => l.id_orcamento === o.id && l.id_gasto_fixo === f.id);
    if (!jaAplicado) {
      lancs.push({
        id:           Date.now() + i++,
        id_orcamento: o.id,
        id_categoria: f.id_categoria,
        valor:        f.valor,
        descricao:    f.nome,
        data:         dataRef,
        origem:       'fixo',
        id_gasto_fixo: f.id
      });
      alterou = true;
    }
  });

  if (alterou) {
    set(STORAGE.lancamentos, lancs);
    notificar('Gastos fixos aplicados automaticamente!', 'info');
  }
}
