// ─── CATEGORIES SETUP ────────────────────────────────────────────────────────

function criarCategorias(){
  if(get(STORAGE.categorias).length) return;
  const cores = ["#f59e0b","#22c55e","#ef4444","#3b82f6","#a855f7","#f97316"];
  const base  = [
    ["Custos fixos",30], ["Conforto",5], ["Metas",11],
    ["Prazeres",24], ["Liberdade financeira",25], ["Conhecimento",5]
  ];
  set(STORAGE.categorias, base.map((c, i) => ({
    id: Date.now() + i, nome: c[0], percentual: c[1], cor_hex: cores[i]
  })));
}

// ─── RENDER ──────────────────────────────────────────────────────────────────

function renderCategorias(){
  const cats           = get(STORAGE.categorias);
  const totalPercentual = cats.reduce((sum, c) => sum + c.percentual, 0);

  let html = `
    <div class="categorias-editor">
      <div class="editor-header">
        <h4>Ajuste os Percentuais do Seu Orçamento</h4>
        <p class="editor-subtitle">Distribua o seu orçamento entre as categorias</p>
      </div>`;

  html += cats.map(c => `
    <div class="categoria-editor-item">
      <div class="categoria-editor-header">
        <div class="categoria-info">
          <div style="width:32px;height:32px;background:${c.cor_hex};border-radius:10px;"></div>
          <div>
            <div class="categoria-nome">${c.nome}</div>
            <div class="categoria-subtitulo">Ajuste o percentual desta categoria</div>
          </div>
        </div>
      </div>
      <div class="categoria-editor-controls">
        <div class="slider-container">
          <input type="range" min="0" max="100" value="${c.percentual}"
            class="percentual-slider" data-cat-id="${c.id}" data-action="percentual-slider">
        </div>
        <div class="input-output">
          <input type="number" min="0" max="100" value="${c.percentual}"
            class="percentual-input" data-cat-id="${c.id}" data-action="percentual-input">
          <span class="percentual-unit">%</span>
        </div>
      </div>
      <div class="slider-info">
        <span class="slider-label" id="preview-${c.id}">${c.percentual}%</span>
      </div>
    </div>`).join("");

  html += `
    <div class="editor-footer">
      <div class="total-info">
        <span class="total-label">Total Distribuído:</span>
        <span class="total-value" id="totalPercentual">${totalPercentual}%</span>
      </div>
      ${totalPercentual !== 100
        ? `<div class="total-warning" style="display:flex;align-items:center;justify-content:center;gap:8px;"><i data-lucide="alert-triangle" size="16"></i> O total deve ser 100% para funcionar corretamente</div>`
        : `<div class="total-success" style="display:flex;align-items:center;justify-content:center;gap:8px;"><i data-lucide="check-circle-2" size="16"></i> Distribuição completa e balanceada</div>`}
      <button data-action="salvar-percentuais" class="btn-salvar-percentuais" style="display:flex;align-items:center;justify-content:center;gap:8px;">
        <i data-lucide="save" size="18"></i> Salvar Percentuais
      </button>
    </div>
  </div>`;

  listaCategorias.innerHTML = html;
  if(window.lucide) lucide.createIcons();
}

function renderCategoriasLista(){
  const cats                = get(STORAGE.categorias);
  const categoriasListaEditor = document.getElementById("categoriasListaEditor");
  if(!categoriasListaEditor) return;

  if(cats.length === 0){
    categoriasListaEditor.innerHTML = `<div class="categoria-item-editor empty-state" style="color:var(--muted);">Nenhuma categoria ainda</div>`;
    return;
  }

  const totalPercentual = cats.reduce((sum, c) => sum + c.percentual, 0);

  let html = `
    <div class="categorias-percentuais">
      <div class="percentuais-header"><p>Ajuste o percentual de cada categoria:</p></div>`;

  html += cats.map(c => `
    <div class="categoria-percentual-item">
      <div class="categoria-percentual-header">
        <div style="width:24px;height:24px;background:${c.cor_hex};border-radius:6px;"></div>
        <div class="categoria-percentual-nome">${c.nome}</div>
      </div>
      <div class="categoria-percentual-controls">
        <input type="range" min="0" max="100" value="${c.percentual}"
          class="percentual-slider" data-cat-id="${c.id}" data-action="percentual-slider">
        <div class="percentual-input-group">
          <input type="number" min="0" max="100" value="${c.percentual}"
            class="percentual-input" data-cat-id="${c.id}" data-action="percentual-input">
          <span class="percentual-unit">%</span>
        </div>
      </div>
    </div>`).join("");

  html += `
    <div class="percentuais-footer">
      <div class="total-info">
        <span>Total Distribuído:</span>
        <span class="total-percentual" id="totalPercentualCategorias">${totalPercentual}%</span>
      </div>
      ${totalPercentual !== 100
        ? `<div class="total-warning" style="display:flex;align-items:center;justify-content:center;gap:8px;"><i data-lucide="alert-triangle" size="16"></i> O total deve ser 100%</div>`
        : `<div class="total-success" style="display:flex;align-items:center;justify-content:center;gap:8px;"><i data-lucide="check-circle-2" size="16"></i> Distribuição perfeita!</div>`}
      <button data-action="salvar-percentuais-categorias" class="btn-salvar-percentuais" style="display:flex;align-items:center;justify-content:center;gap:8px;">
        <i data-lucide="save" size="18"></i> Salvar Percentuais
      </button>
    </div>
    <div class="categorias-existentes"><h5>Suas Categorias:</h5>`;

  html += cats.map(c => `
    <div class="categoria-item-editor">
      <div class="categoria-item-color" style="background:${c.cor_hex};"></div>
      <div class="categoria-item-content">
        <div class="categoria-item-nome">${c.nome}</div>
        <div class="categoria-item-info">Percentual: ${c.percentual}%</div>
      </div>
      <div class="categoria-item-actions">
        <button data-action="editar-categoria" data-id="${c.id}" class="btn-editar-cat" style="display:flex;align-items:center;gap:4px;">
          <i data-lucide="edit-3" size="12"></i> Editar
        </button>
        <button data-action="deletar-categoria" data-id="${c.id}" class="btn-deletar-cat" style="display:flex;align-items:center;gap:4px;">
          <i data-lucide="trash-2" size="12"></i> Remover
        </button>
      </div>
    </div>`).join("");

  html += `</div></div>`;
  categoriasListaEditor.innerHTML = html;
  if(window.lucide) lucide.createIcons();
}

// ─── CATEGORY MANAGEMENT ─────────────────────────────────────────────────────

function adicionarNovaCategoria(){
  const nomeInput = document.getElementById("novaCategoriaNome");
  const corInput  = document.getElementById("novaCategoriaCor");
  if(!nomeInput || !corInput) return;

  const nome = nomeInput.value.trim();
  const cor  = corInput.value;

  if(!nome){ notificar("Digite um nome para a categoria"); return; }

  const cats = get(STORAGE.categorias);
  if(cats.some(c => c.nome.toLowerCase() === nome.toLowerCase())){
    notificar("Já existe uma categoria com este nome");
    return;
  }

  cats.push({ id: Date.now(), nome, percentual: 0, cor_hex: cor });
  withLoadingDelay(() => {
    set(STORAGE.categorias, cats);
    nomeInput.value = "";
    corInput.value  = "#f59e0b";
    renderComplete();
    notificar("✅ Categoria criada com sucesso!");
  });
}

async function abrirEditorCategoria(catId){
  const cats = get(STORAGE.categorias);
  const cat  = cats.find(c => c.id === catId);
  if(!cat) return;

  const novoNome = await editarCategoriaNome(cat.nome);
  if(novoNome === null) return;

  if(novoNome.toLowerCase() === cat.nome.toLowerCase()){
    notificar("ℹ️ O nome é igual ao anterior");
    return;
  }
  if(cats.some(c => c.id !== catId && c.nome.toLowerCase() === novoNome.toLowerCase())){
    notificar("❌ Já existe uma categoria com este nome");
    return;
  }

  cat.nome = novoNome;
  withLoadingDelay(() => {
    set(STORAGE.categorias, cats);
    renderComplete();
    notificar("✅ Categoria atualizada com sucesso!");
  });
}

async function deletarCategoriaConfirm(catId){
  const ok = await confirmar("Tem certeza que deseja remover esta categoria?\nTodos os lançamentos desta categoria serão removidos.");
  if(!ok) return;
  deletarCategoria(catId);
}

function deletarCategoria(catId){
  withLoadingDelay(() => {
    set(STORAGE.categorias,  get(STORAGE.categorias).filter(c => c.id !== catId));
    set(STORAGE.lancamentos, get(STORAGE.lancamentos).filter(l => l.id_categoria !== catId));
    renderComplete();
    notificar("✅ Categoria removida!");
  });
}

// ─── PERCENTAGE SLIDERS ───────────────────────────────────────────────────────

/**
 * Atualiza slider + input numérico + preview de texto + total do container.
 * container: elemento DOM pai onde buscar os inputs e o total.
 */
function atualizarPercentual(catId, valor, container){
  valor = Math.max(0, Math.min(100, parseInt(valor) || 0));
  const scope = container || document;

  scope.querySelectorAll(`[data-cat-id="${catId}"]`).forEach(el => { el.value = valor; });

  const preview = document.getElementById(`preview-${catId}`);
  if(preview) preview.textContent = valor + '%';

  let total = 0;
  scope.querySelectorAll('.percentual-slider').forEach(s => { total += parseInt(s.value) || 0; });

  const totalEl = scope.querySelector('[id^="totalPercentual"]');
  if(totalEl){
    totalEl.textContent  = total + '%';
    totalEl.style.color  = total === 100 ? 'var(--ok)' : total > 100 ? 'var(--danger)' : 'var(--warn)';
  }
}

function salvarPercentuaisEm(container){
  const cats    = get(STORAGE.categorias);
  const sliders = container.querySelectorAll('.percentual-slider');

  let total = 0;
  const novosCats = Array.from(sliders).map(slider => {
    const catId = parseInt(slider.dataset.catId);
    const valor = parseInt(slider.value) || 0;
    total += valor;
    return { ...cats.find(c => c.id === catId), percentual: valor };
  });

  if(total !== 100){
    notificar('⚠️ O total deve ser 100%! Atual: ' + total + '%');
    return;
  }

  withLoadingDelay(() => {
    set(STORAGE.categorias, novosCats);
    notificar('✅ Percentuais salvos com sucesso!');
    renderAll();
    renderCategoriasLista();
  }, 500);
}
