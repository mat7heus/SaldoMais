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
    if(!valor || valor <= 0){ notificar("Digite um valor válido", 'warn'); return; }

    let lista   = get(STORAGE.orcamentos);
    const mesRef = mesAtual();
    const oIdx   = lista.findIndex(o => o.mes_referencia === mesRef);

    if(oIdx === -1) lista.push({ id: Date.now(), mes_referencia: mesRef, valor_total: valor });
    else            lista[oIdx].valor_total = valor;

    set(STORAGE.orcamentos, lista);
    orcamentoInput.value = formatarMoeda(valor);
    aplicarGastosFixos();
    renderComplete();
  } catch (error) {
    console.error("Erro ao salvar orçamento:", error);
    notificar("Erro ao salvar orçamento", 'error');
  }
}

// ─── TRANSACTIONS ─────────────────────────────────────────────────────────────

function adicionarLancamento(){
  const o = orcamentoAtual();
  if(!o){ notificar("Defina orçamento primeiro", 'warn'); return; }

  const valor     = desformatarMoeda(valorInput.value);
  const descricao = desc.value.trim();
  const cat       = Number(categoriaSelect.value);
  const dataInput = document.getElementById("dataInput");
  const data      = dataInput?.value || new Date().toISOString().split('T')[0];

  if(!descricao){ notificar("Digite uma descrição", 'warn'); return; }
  if(!valor || valor <= 0){ notificar("Digite um valor válido", 'warn'); return; }

  const cats = get(STORAGE.categorias);
  const c    = cats.find(x => x.id === cat);
  const teto = o.valor_total * c.percentual / 100;
  const lanc = get(STORAGE.lancamentos);
  const total = lanc
    .filter(l => l.id_categoria === cat && l.id_orcamento === o.id)
    .reduce((s, l) => s + l.valor, 0);

  const excedeu       = total + valor > teto;
  const valorExcedido = excedeu ? (total + valor) - teto : 0;

  lanc.push({ id: Date.now(), id_orcamento: o.id, id_categoria: cat, valor, descricao, data });
  set(STORAGE.lancamentos, lanc);

  desc.value = "";
  valorInput.value = "";
  if(dataInput) dataInput.value = new Date().toISOString().split('T')[0];

  atualizarCatHint();
  renderComplete();

  if(excedeu) mostrarAvisoExcesso(c.nome, valorExcedido);
}

async function deletarLancamento(id){
  const ok = await confirmar("Deseja deletar este lançamento?");
  if(!ok) return;
  set(STORAGE.lancamentos, get(STORAGE.lancamentos).filter(l => l.id !== id));
  atualizarCatHint();
  renderComplete();
}

async function editarLancamentoHandler(id){
  const editado = await editarLancamento(id);
  if(!editado) return;

  const o = orcamentoAtual();
  if(!o) return;

  const lancs = get(STORAGE.lancamentos);
  const idx   = lancs.findIndex(l => l.id === id);
  if(idx === -1) return;

  const c    = get(STORAGE.categorias).find(x => x.id === editado.id_categoria);
  if(!c){ notificar("Categoria não encontrada", 'error'); return; }

  const teto  = o.valor_total * c.percentual / 100;
  const gasto = lancs
    .filter(l => l.id_categoria === editado.id_categoria && l.id_orcamento === o.id && l.id !== id)
    .reduce((s, l) => s + l.valor, 0);

  const excedeuEdicao = gasto + editado.valor > teto;
  const excessoEdicao = excedeuEdicao ? (gasto + editado.valor) - teto : 0;

  lancs[idx] = { ...lancs[idx], ...editado };
  set(STORAGE.lancamentos, lancs);

  atualizarCatHint();
  renderComplete();
  notificar("Lançamento atualizado com sucesso!", 'success');
  if(excedeuEdicao) mostrarAvisoExcesso(c.nome, excessoEdicao);
}

async function resetarMes(){
  const ok = await confirmar("Tem certeza que deseja limpar este mês? Todos os lançamentos serão removidos.");
  if(!ok) return;

  const o = orcamentoAtual();
  if(!o){ notificar("Nenhum orçamento para limpar", 'warn'); return; }

  set(STORAGE.lancamentos, get(STORAGE.lancamentos).filter(l => l.id_orcamento !== o.id));
  const lista = get(STORAGE.orcamentos);
  const idx   = lista.findIndex(x => x.id === o.id);
  if(idx >= 0){ lista[idx].valor_total = 0; set(STORAGE.orcamentos, lista); }

  sincronizarOrcamentoComReceitas();
  atualizarCatHint();
  renderComplete();
  notificar("Mês limpado com sucesso", 'success');
}

// ─── AVISO DE EXCESSO ────────────────────────────────────────────────────────

function mostrarAvisoExcesso(catNome, valorExcedido){
  const overlay = document.getElementById('avisoExcessoModal');
  const msgEl   = document.getElementById('avisoExcessoMsg');
  const btnOk   = document.getElementById('avisoExcessoOk');
  if(!overlay || !msgEl || !btnOk) return;

  msgEl.textContent = `A categoria "${catNome}" foi ultrapassada em ${formatarMoeda(valorExcedido)}. O lançamento foi salvo, mas fique atento ao seu orçamento.`;
  overlay.classList.add('show');
  if(window.lucide) lucide.createIcons({ nodes: [overlay] });

  const fechar = () => overlay.classList.remove('show');
  btnOk.onclick = fechar;
  overlay.onclick = e => { if(e.target === overlay) fechar(); };
}

// ─── CATEGORY BUDGET HINT ────────────────────────────────────────────────────

function atualizarCatHint(){
  const hint = document.getElementById("catHint");
  if(!hint) return;

  const o = orcamentoAtual();
  if(!o){ hint.innerHTML = ''; return; }

  const catId = Number(categoriaSelect?.value);
  if(!catId){ hint.innerHTML = ''; return; }

  const c = get(STORAGE.categorias).find(x => x.id === catId);
  if(!c){ hint.innerHTML = ''; return; }

  const teto  = o.valor_total * c.percentual / 100;
  const gasto = get(STORAGE.lancamentos)
    .filter(l => l.id_categoria === catId && l.id_orcamento === o.id)
    .reduce((s, l) => s + l.valor, 0);

  const rest = teto - gasto;
  const pct  = (gasto / teto) * 100;
  const cor  = rest <= 0 ? 'var(--danger)' : pct >= 80 ? 'var(--warn)' : 'var(--ok)';
  const icon = rest <= 0 ? 'x-circle' : pct >= 80 ? 'alert-triangle' : 'check-circle-2';

  hint.style.color = cor;
  hint.innerHTML   = rest <= 0
    ? `<i data-lucide="${icon}" size="13"></i> Limite esgotado nesta categoria`
    : `<i data-lucide="${icon}" size="13"></i> ${formatarMoeda(rest)} disponível`;

  if(window.lucide) lucide.createIcons({ nodes: [hint] });
}

// ─── RENDER ──────────────────────────────────────────────────────────────────

function renderSelect(){
  categoriaSelect.innerHTML = get(STORAGE.categorias)
    .map(c => `<option value="${c.id}">${c.nome}</option>`).join("");
  atualizarCatHint();
}

function renderOrcamentoInput(){
  const o           = orcamentoAtual();
  const hasReceitas = totalReceitasMes() > 0;

  orcamentoInput.value    = o ? formatarMoeda(o.valor_total) : "";
  orcamentoInput.readOnly = hasReceitas;
  orcamentoInput.style.opacity = hasReceitas ? '0.65' : '';
  orcamentoInput.style.cursor  = hasReceitas ? 'not-allowed' : '';

  const salvarBtn = document.getElementById('salvarOrcamento');
  if (salvarBtn) salvarBtn.style.display = hasReceitas ? 'none' : '';

  const helper = document.getElementById('orcamentoInputHelper');
  if (helper) {
    if (hasReceitas) {
      helper.innerHTML = '<i data-lucide="trending-up" size="13"></i> Calculado automaticamente com base nas receitas cadastradas';
      helper.style.color = 'var(--ok)';
      if (window.lucide) lucide.createIcons({ nodes: [helper] });
    } else {
      helper.textContent = 'Digite o valor total disponível para este mês';
      helper.style.color = '';
    }
  }
}

function formatarData(dataStr){
  if(!dataStr) return '';
  const [y, m, d] = dataStr.split('-');
  return `${d}/${m}/${y}`;
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

  const lancamentos = get(STORAGE.lancamentos)
    .filter(l => l.id_orcamento === o.id)
    .sort((a, b) => {
      const da = a.data || '';
      const db = b.data || '';
      return da > db ? -1 : da < db ? 1 : b.id - a.id;
    });

  const cats = get(STORAGE.categorias);

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
    const cat     = cats.find(c => c.id === l.id_categoria);
    const cor     = cat ? cat.cor_hex : '#a1a1aa';
    const catNome = cat ? cat.nome : 'Sem categoria';
    const dataStr = l.data ? formatarData(l.data) : '';

    return `
      <div class="lancamento-item">
        <div class="lancamento-cat-dot" style="background:${cor};"></div>
        <div class="lancamento-info">
          <div class="lancamento-descricao">${l.descricao}</div>
          <div class="lancamento-categoria">${catNome}${dataStr ? ` <span class="lancamento-date">· ${dataStr}</span>` : ''}</div>
        </div>
        <div class="lancamento-valor">${formatarMoeda(l.valor)}</div>
        <div class="lancamento-actions">
          <button data-action="editar-lancamento" data-id="${l.id}" class="lancamento-edit" title="Editar">
            <i data-lucide="pencil" size="13"></i>
          </button>
          <button data-action="deletar-lancamento" data-id="${l.id}" class="lancamento-delete" title="Deletar">
            <i data-lucide="trash-2" size="13"></i>
          </button>
        </div>
      </div>`;
  }).join("");

  if(window.lucide) lucide.createIcons();
}
