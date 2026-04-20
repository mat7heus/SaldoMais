// ─── RECEITAS ─────────────────────────────────────────────────────────────────

const TIPOS_RECEITA = {
  salario:    { label: 'Salário',    cor: '#22c55e' },
  freelance:  { label: 'Freelance',  cor: '#3b82f6' },
  rendimento: { label: 'Rendimento', cor: '#8b5cf6' },
  outro:      { label: 'Outro',      cor: '#a1a1aa' },
};

function totalReceitasMes() {
  return get(STORAGE.receitas)
    .filter(r => r.mes_referencia === mesAtual())
    .reduce((s, r) => s + r.valor, 0);
}

function receitasDoMes() {
  return get(STORAGE.receitas)
    .filter(r => r.mes_referencia === mesAtual())
    .sort((a, b) => b.data.localeCompare(a.data) || b.id - a.id);
}

function sincronizarOrcamentoComReceitas() {
  const total = totalReceitasMes();
  if (total <= 0) return;

  const mesRef = mesAtual();
  const lista  = get(STORAGE.orcamentos);
  const idx    = lista.findIndex(o => o.mes_referencia === mesRef);

  if (idx === -1) lista.push({ id: Date.now(), mes_referencia: mesRef, valor_total: total });
  else            lista[idx].valor_total = total;

  set(STORAGE.orcamentos, lista);
  renderOrcamentoInput();
}

function adicionarReceita() {
  const descInput = document.getElementById('receitaDesc');
  const valorEl   = document.getElementById('receitaValor');
  const tipoEl    = document.getElementById('receitaTipo');
  const dataEl    = document.getElementById('receitaData');

  const descricao = descInput?.value.trim();
  const valor     = desformatarMoeda(valorEl?.value || '');
  const tipo      = tipoEl?.value || 'outro';
  const data      = dataEl?.value || new Date().toISOString().split('T')[0];

  if (!descricao) { notificar('Digite uma descrição', 'warn'); return; }
  if (!valor || valor <= 0) { notificar('Digite um valor válido', 'warn'); return; }

  const receitas = get(STORAGE.receitas);
  receitas.push({ id: Date.now(), descricao, valor, tipo, data, mes_referencia: mesAtual() });
  set(STORAGE.receitas, receitas);

  if (descInput) descInput.value = '';
  if (valorEl)   valorEl.value   = '';
  if (dataEl)    dataEl.value    = new Date().toISOString().split('T')[0];

  sincronizarOrcamentoComReceitas();
  aplicarGastosFixos();
  renderComplete();
  notificar('Receita adicionada com sucesso!', 'success');
}

async function deletarReceita(id) {
  const ok = await confirmar('Remover esta receita? O orçamento do mês será recalculado.');
  if (!ok) return;

  set(STORAGE.receitas, get(STORAGE.receitas).filter(r => r.id !== id));
  sincronizarOrcamentoComReceitas();
  renderComplete();
  notificar('Receita removida', 'success');
}

function renderReceitas() {
  const lista  = document.getElementById('listaReceitas');
  const resumo = document.getElementById('receitasResumo');
  if (!lista) return;

  const receitas = receitasDoMes();
  const total    = receitas.reduce((s, r) => s + r.valor, 0);

  if (resumo) {
    resumo.innerHTML = `
      <div class="receitas-resumo-card">
        <div class="receitas-resumo-left">
          <span class="receitas-resumo-label">Total de Receitas — ${MESES[new Date().getMonth()]}</span>
          <span class="receitas-resumo-valor" id="rv-total">R$ 0,00</span>
          <span class="receitas-resumo-hint">
            ${receitas.length} ${receitas.length === 1 ? 'entrada registrada' : 'entradas registradas'}
            · orçamento calculado automaticamente
          </span>
        </div>
        <div class="receitas-resumo-icon"><i data-lucide="trending-up" size="36"></i></div>
      </div>`;
    animarValor(document.getElementById('rv-total'), total);
    if (window.lucide) lucide.createIcons({ nodes: [resumo] });
  }

  if (receitas.length === 0) {
    lista.innerHTML = `
      <div class="lancamentos-empty">
        <div class="lancamentos-empty-icon"><i data-lucide="trending-up" size="40"></i></div>
        <p class="lancamentos-empty-title">Nenhuma receita registrada</p>
        <p class="lancamentos-empty-desc">Registre seu salário, freelances e rendimentos. O orçamento do mês será calculado automaticamente.</p>
      </div>`;
    if (window.lucide) lucide.createIcons();
    return;
  }

  lista.innerHTML = receitas.map(r => {
    const tipo      = TIPOS_RECEITA[r.tipo] || TIPOS_RECEITA.outro;
    const [, m, d]  = r.data.split('-');
    return `
      <div class="receita-item">
        <div class="receita-tipo-dot" style="background:${tipo.cor};"></div>
        <div class="lancamento-info">
          <div class="lancamento-descricao">${r.descricao}</div>
          <div class="lancamento-categoria">
            <span class="receita-tipo-badge" style="color:${tipo.cor};background:${tipo.cor}1a;">${tipo.label}</span>
            <span class="lancamento-date">· ${d}/${m}</span>
          </div>
        </div>
        <div class="receita-valor">${formatarMoeda(r.valor)}</div>
        <div class="lancamento-actions">
          <button data-action="deletar-receita" data-id="${r.id}" class="lancamento-delete" title="Remover">
            <i data-lucide="trash-2" size="13"></i>
          </button>
        </div>
      </div>`;
  }).join('');

  if (window.lucide) lucide.createIcons();
}
