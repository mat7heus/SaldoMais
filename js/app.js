// ─── PLATFORM ────────────────────────────────────────────────────────────────

const isMac = navigator.platform.startsWith('Mac');
const modKey = isMac ? '⌥' : 'Alt+';

function atualizarAtalhos() {
  if (!isMac) return;
  document.querySelectorAll('.nav-shortcut').forEach(el => {
    el.textContent = el.textContent.replace('Alt+', '⌥');
  });
  document.querySelectorAll('[title]').forEach(el => {
    el.title = el.title.replace(/Alt\+/g, '⌥');
  });
}

// ─── RENDER ORCHESTRATION ────────────────────────────────────────────────────

function renderAll(){
  try {
    renderSelect();
    renderLancamentos();
    renderOrcamentoInput();
    renderCategorias();
    renderCategoriasLista();
    renderReceitas();
  } catch (error) {
    if (window.lucide) lucide.createIcons();
    console.error("Erro ao renderizar elementos:", error);
  }
}

function renderComplete(){
  renderAll();
  renderDashboard();
}

// ─── BUTTONS ─────────────────────────────────────────────────────────────────

function setupButtons(){
  if(limparMes)       limparMes.addEventListener("click", resetarMes);
  if(salvarOrcamento) salvarOrcamento.addEventListener("click", salvarOrcamentoHandler);
  if(addLancamento)   addLancamento.addEventListener("click", adicionarLancamento);

  document.getElementById("btnExportPdf")
    ?.addEventListener("click", exportarPDF);
  document.getElementById("btnExportBackup")
    ?.addEventListener("click", exportarBackup);
  document.getElementById("inputImportBackup")
    ?.addEventListener("change", importarBackup);
  document.getElementById("btnAdicionarCategoria")
    ?.addEventListener("click", adicionarNovaCategoria);
  document.getElementById("btnAdicionarGastoFixo")
    ?.addEventListener("click", adicionarGastoFixo);
  document.getElementById("btnAdicionarReceita")
    ?.addEventListener("click", adicionarReceita);
  setupCurrencyMask(document.getElementById("receitaValor"));
  // Category hint: update when category or value changes
  categoriaSelect?.addEventListener("change", atualizarCatHint);
  valorInput?.addEventListener("input", atualizarCatHint);

  setupCurrencyMask(orcamentoInput);
  setupCurrencyMask(valorInput);
}

function setupCurrencyMask(el){
  if(!el) return;
  el.addEventListener("input", e => {
    const digits = e.target.value.replace(/[^\d]/g, "").slice(0, 11);
    e.target.value = digits ? formatarMoeda(Number(digits) / 100) : "";
  });
}

// ─── EVENT DELEGATION ────────────────────────────────────────────────────────

function setupEventDelegation(){
  // Lançamentos: deletar e editar
  listaLancamentos?.addEventListener("click", e => {
    const delBtn = e.target.closest("[data-action='deletar-lancamento']");
    if(delBtn){ deletarLancamento(Number(delBtn.dataset.id)); return; }
    const editBtn = e.target.closest("[data-action='editar-lancamento']");
    if(editBtn) editarLancamentoHandler(Number(editBtn.dataset.id));
  });

  // Gastos fixos: deletar
  document.getElementById("listaGastosFixos")?.addEventListener("click", e => {
    const delBtn = e.target.closest("[data-action='deletar-gasto-fixo']");
    if(delBtn) deletarGastoFixo(Number(delBtn.dataset.id));
  });

  // Receitas: deletar
  document.getElementById("listaReceitas")?.addEventListener("click", e => {
    const delBtn = e.target.closest("[data-action='deletar-receita']");
    if(delBtn) deletarReceita(Number(delBtn.dataset.id));
  });

  // Categorias lista editor (screen categorias)
  const editor = document.getElementById("categoriasListaEditor");
  if(editor){
    editor.addEventListener("click", e => {
      if(e.target.closest("[data-action='salvar-percentuais-categorias']")){
        salvarPercentuaisEm(editor); return;
      }
      const editBtn = e.target.closest("[data-action='editar-categoria']");
      if(editBtn){ abrirEditorCategoria(Number(editBtn.dataset.id)); return; }
      const delBtn = e.target.closest("[data-action='deletar-categoria']");
      if(delBtn){ deletarCategoriaConfirm(Number(delBtn.dataset.id)); }
    });
    editor.addEventListener("input", e => {
      const el = e.target.closest("[data-action='percentual-slider'],[data-action='percentual-input']");
      if(el) atualizarPercentual(Number(el.dataset.catId), el.value, editor);
    });
  }

  // Lista categorias (screen configuracoes)
  if(listaCategorias){
    listaCategorias.addEventListener("click", e => {
      if(e.target.closest("[data-action='salvar-percentuais']"))
        salvarPercentuaisEm(listaCategorias);
    });
    listaCategorias.addEventListener("input", e => {
      const el = e.target.closest("[data-action='percentual-slider'],[data-action='percentual-input']");
      if(el) atualizarPercentual(Number(el.dataset.catId), el.value, listaCategorias);
    });
  }
}

// ─── SIDEBAR COLLAPSE (desktop) ──────────────────────────────────────────────

function setupSidebarToggle() {
  const btn     = document.getElementById('sidebarCollapseBtn');
  const sidebar = document.querySelector('.sidebar');
  if (!btn || !sidebar) return;

  const STORAGE_KEY = 'saldomain_sidebar_collapsed';
  const collapsed   = localStorage.getItem(STORAGE_KEY) === 'true';

  function aplicarEstado(isCollapsed) {
    sidebar.classList.toggle('collapsed', isCollapsed);
    btn.title = isCollapsed ? `Expandir menu (${modKey}B)` : `Recolher menu (${modKey}B)`;
    localStorage.setItem(STORAGE_KEY, isCollapsed);
  }

  aplicarEstado(collapsed);

  btn.addEventListener('click', () => {
    aplicarEstado(!sidebar.classList.contains('collapsed'));
  });

  document.addEventListener('keydown', e => {
    if (e.altKey && e.code === 'KeyB') {
      e.preventDefault();
      aplicarEstado(!sidebar.classList.contains('collapsed'));
    }
  });
}

// ─── MOBILE MENU ─────────────────────────────────────────────────────────────

function setupMobileMenu() {
  const hamburger = document.getElementById('hamburgerBtn');
  const sidebar   = document.querySelector('.sidebar');
  const overlay   = document.getElementById('sidebarOverlay');
  if (!hamburger || !sidebar || !overlay) return;

  function abrirMenu() {
    // Garante que o container de scroll seja recalculado ao abrir no mobile
    sidebar.style.display = 'flex'; 
    sidebar.classList.add('open');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      sidebar.querySelector('.nav-btn.active')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }, 400);
  }

  function fecharMenu() {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', abrirMenu);
  overlay.addEventListener('click', fecharMenu);

  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (window.innerWidth <= 768) fecharMenu();
    });
  });
}

// ─── KEYBOARD SHORTCUTS ──────────────────────────────────────────────────────

// Máscara de moeda nos inputs .input-moeda
document.addEventListener('input', function(e) {
  if (!e.target.classList.contains('input-moeda')) return;
  const digits = e.target.value.replace(/[^\d]/g, '').slice(0, 11);
  e.target.value = digits ? (new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(Number(digits)/100)) : '';
});

// Alt/Option+1-4 para navegar entre telas
document.addEventListener('keydown', function(e) {
  if (!e.altKey) return;
  const codeMap = { 'Digit1': 'dashboard', 'Digit2': 'lancamentos', 'Digit3': 'categorias', 'Digit4': 'calculadoras', 'Digit5': 'gastos-fixos', 'Digit6': 'receitas' };
  const screen = codeMap[e.code];
  if (!screen) return;
  e.preventDefault();
  document.querySelector(`.nav-btn[data-screen="${screen}"]`)?.click();
});

// ─── INIT ────────────────────────────────────────────────────────────────────

function init(){
  try {
    mostrarLoading();
    criarCategorias();
    setupModals();
    setupButtons();
    setupEventDelegation();
    navegar();
    setupMobileMenu();
    setupSidebarToggle();
    atualizarDataMes();
    atualizarAtalhos();

    // Set today as default date in forms
    const hoje = new Date().toISOString().split('T')[0];
    const dataInput = document.getElementById("dataInput");
    if(dataInput) dataInput.value = hoje;
    const receitaData = document.getElementById("receitaData");
    if(receitaData) receitaData.value = hoje;

    sincronizarOrcamentoComReceitas();
    aplicarGastosFixos();
    renderComplete();
  } catch (error) {
    if (window.lucide) lucide.createIcons();
    console.error("Erro na inicialização:", error);
  }
}

init();
