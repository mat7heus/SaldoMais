// ─── BUDGET ──────────────────────────────────────────────────────────────────

function mesAtual(){
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
}

function orcamentoAtual(){
  return get(STORAGE.orcamentos).find(o => o.mes_referencia === mesAtual());
}

function salvarOrcamentoHandler(){
  try {
    const valor = desformatarMoeda(orcamentoInput.value.trim());
    if(!valor || valor <= 0){ notificar("Digite um valor válido"); return; }

    let lista   = get(STORAGE.orcamentos);
    const mesRef = mesAtual();
    const oIdx   = lista.findIndex(o => o.mes_referencia === mesRef);

    if(oIdx === -1) lista.push({ id: Date.now(), mes_referencia: mesRef, valor_total: valor });
    else            lista[oIdx].valor_total = valor;

    withLoadingDelay(() => {
      set(STORAGE.orcamentos, lista);
      orcamentoInput.value = formatarMoeda(valor);
      renderComplete();
    });
  } catch (error) {
    console.error("Erro ao salvar orçamento:", error);
    notificar("Erro ao salvar orçamento");
  }
}

// ─── TRANSACTIONS ─────────────────────────────────────────────────────────────

function adicionarLancamento(){
  const o = orcamentoAtual();
  if(!o){ notificar("Defina orçamento primeiro"); return; }

  const valor     = desformatarMoeda(valorInput.value);
  const descricao = desc.value.trim();
  const cat       = Number(categoriaSelect.value);

  if(!descricao){ notificar("Digite uma descrição"); return; }
  if(!valor || valor <= 0){ notificar("Digite um valor válido"); return; }

  const cats = get(STORAGE.categorias);
  const c    = cats.find(x => x.id === cat);
  const teto = o.valor_total * c.percentual / 100;
  const lanc = get(STORAGE.lancamentos);
  const total = lanc
    .filter(l => l.id_categoria === cat && l.id_orcamento === o.id)
    .reduce((s, l) => s + l.valor, 0);

  if(total + valor > teto){ notificar("Limite excedido nesta categoria"); return; }

  lanc.push({ id: Date.now(), id_orcamento: o.id, id_categoria: cat, valor, descricao });

  withLoadingDelay(() => {
    set(STORAGE.lancamentos, lanc);
    desc.value = "";
    valorInput.value = "";
    renderComplete();
  });
}

async function deletarLancamento(id){
  const ok = await confirmar("Deseja deletar este lançamento?");
  if(!ok) return;
  withLoadingDelay(() => {
    set(STORAGE.lancamentos, get(STORAGE.lancamentos).filter(l => l.id !== id));
    renderComplete();
  });
}

async function resetarMes(){
  const ok = await confirmar("Tem certeza que deseja limpar este mês? Todos os lançamentos serão removidos.");
  if(!ok) return;

  const o = orcamentoAtual();
  if(!o){ notificar("Nenhum orçamento para limpar"); return; }

  withLoadingDelay(() => {
    set(STORAGE.lancamentos, get(STORAGE.lancamentos).filter(l => l.id_orcamento !== o.id));
    const lista = get(STORAGE.orcamentos);
    const idx   = lista.findIndex(x => x.id === o.id);
    if(idx >= 0){ lista[idx].valor_total = 0; set(STORAGE.orcamentos, lista); }
    renderComplete();
    notificar("Mês limpado com sucesso");
  });
}

// ─── RENDER ──────────────────────────────────────────────────────────────────

function renderSelect(){
  categoriaSelect.innerHTML = get(STORAGE.categorias)
    .map(c => `<option value="${c.id}">${c.nome}</option>`).join("");
}

function renderOrcamentoInput(){
  const o = orcamentoAtual();
  orcamentoInput.value = o ? formatarMoeda(o.valor_total) : "";
}

function renderLancamentos(){
  const o = orcamentoAtual();
  if(!o){
    listaLancamentos.innerHTML = `
      <div class="lancamentos-empty">
        <div class="lancamentos-empty-icon"><i data-lucide="wallet" size="40"></i></div>
        <p class="lancamentos-empty-title">Orçamento não definido</p>
        <p class="lancamentos-empty-desc">Vá ao Dashboard e defina o orçamento do mês primeiro</p>
      </div>`;
    if(window.lucide) lucide.createIcons();
    return;
  }

  const lancamentos = get(STORAGE.lancamentos).filter(l => l.id_orcamento === o.id);
  const cats        = get(STORAGE.categorias);

  if(lancamentos.length === 0){
    listaLancamentos.innerHTML = `
      <div class="lancamentos-empty">
        <div class="lancamentos-empty-icon"><i data-lucide="receipt" size="40"></i></div>
        <p class="lancamentos-empty-title">Nenhuma despesa registrada</p>
        <p class="lancamentos-empty-desc">Use o formulário acima para adicionar seu primeiro lançamento</p>
      </div>`;
    if(window.lucide) lucide.createIcons();
    return;
  }

  listaLancamentos.innerHTML = lancamentos.map(l => {
    const cat = cats.find(c => c.id === l.id_categoria);
    return `
      <div class="lancamento-item">
        <div class="lancamento-info">
          <div class="lancamento-descricao">${l.descricao}</div>
          <div class="lancamento-categoria">${cat ? cat.nome : 'Sem categoria'}</div>
        </div>
        <div class="lancamento-valor">${formatarMoeda(l.valor)}</div>
        <button data-action="deletar-lancamento" data-id="${l.id}" class="lancamento-delete">
          <i data-lucide="trash-2" size="14"></i>
        </button>
      </div>`;
  }).join("");
  if(window.lucide) lucide.createIcons();
}
