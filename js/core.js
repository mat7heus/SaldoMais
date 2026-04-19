// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const MESES = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
];

const PDF_COLORS = {
  BG:     [11,  11,  12 ],
  BG2:    [18,  18,  24 ],
  CARD:   [26,  26,  32 ],
  BORDER: [42,  42,  52 ],
  ACCENT: [245, 158, 11 ],
  TEXT:   [245, 245, 245],
  MUTED:  [161, 161, 170],
  OK:     [34,  197, 94 ],
  DANGER: [239, 68,  68 ],
  WARN:   [251, 146, 60 ],
};

// ─── DOM ELEMENTS ────────────────────────────────────────────────────────────

const orcamentoInput   = document.getElementById("orcamentoInput");
const salvarOrcamento  = document.getElementById("salvarOrcamento");
const limparMes        = document.getElementById("limparMes");
const desc             = document.getElementById("desc");
const valorInput       = document.getElementById("valorInput");
const categoriaSelect  = document.getElementById("categoriaSelect");
const addLancamento    = document.getElementById("addLancamento");
const listaLancamentos = document.getElementById("listaLancamentos");
const listaCategorias  = document.getElementById("listaCategorias");
const categoriasStatus = document.getElementById("categoriasStatus");
const grafico          = document.getElementById("grafico");

// ─── STORAGE ─────────────────────────────────────────────────────────────────

const STORAGE = {
  categorias:  "saldomain_categorias",
  orcamentos:  "saldomain_orcamentos",
  lancamentos: "saldomain_lancamentos"
};

const get = key => JSON.parse(localStorage.getItem(key)) || [];
const set = (key, val) => localStorage.setItem(key, JSON.stringify(val));

// ─── DATE ────────────────────────────────────────────────────────────────────

function atualizarDataMes(){
  const mesAtualText = document.getElementById("mesAtualText");
  if(!mesAtualText) return;
  const d = new Date();
  mesAtualText.textContent = `${MESES[d.getMonth()]} de ${d.getFullYear()}`;
}

// ─── NOTIFICATIONS ───────────────────────────────────────────────────────────

function notificar(msg, type) {
  const toast = document.getElementById("notificationToast");
  if(!toast) return;

  if(!type) {
    const m = msg.toLowerCase();
    if(m.includes('sucesso') || m.includes('salvo') || m.includes('criado') || m.includes('removido') || m.includes('atualizado') || m.includes('limpado') || m.includes('perfeito'))
      type = 'success';
    else if(m.includes('erro') || m.includes('limite excedido') || m.includes('inválid') || m.includes('já existe'))
      type = 'error';
    else if(m.includes('deve ser') || m.includes('defina') || m.includes('primeiro') || m.includes('digite') || m.includes('atenção') || m.includes('total deve'))
      type = 'warn';
    else type = 'info';
  }

  toast.textContent = msg;
  toast.className = 'notification-toast toast-' + type;
  void toast.offsetWidth;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 3200);
}

// ─── FORMATTING ──────────────────────────────────────────────────────────────

function formatarMoeda(valor){
  if(typeof valor !== "number") valor = Number(valor);
  return new Intl.NumberFormat("pt-BR", {
    style: "currency", currency: "BRL",
    minimumFractionDigits: 2, maximumFractionDigits: 2
  }).format(valor);
}

function desformatarMoeda(texto){
  if(typeof texto !== "string") texto = String(texto);
  return Number(texto.replace(/[^\d,-]/g, "").replace(",", "."));
}

// ─── LOADING ─────────────────────────────────────────────────────────────────

function mostrarLoading(){
  const loading = document.getElementById("loading");
  if(!loading) return;
  loading.classList.add("show");
  setTimeout(ocultarLoading, 1500);
}

function ocultarLoading(){
  document.getElementById("loading")?.classList.remove("show");
}

function withLoadingDelay(fn, delay = 100){
  mostrarLoading();
  setTimeout(fn, delay);
}

// ─── MODALS (PROMISE-BASED) ───────────────────────────────────────────────────

function setupModals(){
  // Confirm modal
  const modal  = document.getElementById("confirmModal");
  const btnYes = document.getElementById("confirmYes");
  const btnNo  = document.getElementById("confirmNo");
  if(btnYes) btnYes.addEventListener("click", () => modal._resolve?.(true));
  if(btnNo)  btnNo.addEventListener("click",  () => modal._resolve?.(false));

  // Edit category modal
  const editModal  = document.getElementById("editarCategoriaModal");
  const confirmBtn = document.getElementById("editarCategoriaConfirm");
  const cancelBtn  = document.getElementById("editarCategoriaCancel");
  const input      = document.getElementById("editarCategoriaInput");

  if(confirmBtn) confirmBtn.addEventListener("click", () => editModal._resolve?.(true));
  if(cancelBtn)  cancelBtn.addEventListener("click",  () => editModal._resolve?.(false));
  if(input){
    input.addEventListener("keypress", e => { if(e.key === "Enter")  confirmBtn?.click(); });
    input.addEventListener("keydown",  e => { if(e.key === "Escape") cancelBtn?.click(); });
  }

  // Edit lancamento modal
  const editLancModal   = document.getElementById("editarLancamentoModal");
  const editLancConfirm = document.getElementById("editarLancamentoConfirm");
  const editLancCancel  = document.getElementById("editarLancamentoCancel");
  const editLancDesc    = document.getElementById("editLancDesc");
  if(editLancConfirm) editLancConfirm.addEventListener("click", () => editLancModal._resolve?.(true));
  if(editLancCancel)  editLancCancel.addEventListener("click",  () => editLancModal._resolve?.(false));
  if(editLancDesc){
    editLancDesc.addEventListener("keydown", e => { if(e.key === "Escape") editLancCancel?.click(); });
  }
}

function confirmar(msg){
  return new Promise(resolve => {
    const modal = document.getElementById("confirmModal");
    const msgEl = document.getElementById("confirmMessage");
    if(!modal || !msgEl) return resolve(false);
    msgEl.textContent = msg;
    modal._resolve = result => {
      modal.classList.remove("show");
      modal._resolve = null;
      resolve(result);
    };
    modal.classList.add("show");
  });
}

function editarLancamento(id){
  return new Promise(resolve => {
    const modal   = document.getElementById("editarLancamentoModal");
    const descEl  = document.getElementById("editLancDesc");
    const valorEl = document.getElementById("editLancValor");
    const dataEl  = document.getElementById("editLancData");
    const catEl   = document.getElementById("editLancCategoria");
    if(!modal) return resolve(null);

    const lanc = get(STORAGE.lancamentos).find(l => l.id === id);
    if(!lanc) return resolve(null);

    const cats = get(STORAGE.categorias);
    catEl.innerHTML = cats.map(c => `<option value="${c.id}">${c.nome}</option>`).join("");

    descEl.value  = lanc.descricao;
    valorEl.value = formatarMoeda(lanc.valor);
    dataEl.value  = lanc.data || new Date().toISOString().split('T')[0];
    catEl.value   = String(lanc.id_categoria);

    modal.classList.add("show");
    if(window.lucide) lucide.createIcons({ nodes: [modal] });
    descEl.focus();

    modal._resolve = confirmado => {
      modal.classList.remove("show");
      modal._resolve = null;
      if(!confirmado) return resolve(null);
      const valor     = desformatarMoeda(valorEl.value);
      const descricao = descEl.value.trim();
      if(!descricao || !valor || valor <= 0) return resolve(null);
      resolve({ descricao, valor, data: dataEl.value, id_categoria: Number(catEl.value) });
    };
  });
}

function editarCategoriaNome(nomeAtual){
  return new Promise(resolve => {
    const modal  = document.getElementById("editarCategoriaModal");
    const input  = document.getElementById("editarCategoriaInput");
    const titulo = document.getElementById("editarCategoriaTitulo");
    if(!modal || !input || !titulo) return resolve(null);
    titulo.textContent = `Editar: ${nomeAtual}`;
    input.value = nomeAtual;
    modal.classList.add("show");
    input.focus();
    input.select();
    modal._resolve = confirmado => {
      modal.classList.remove("show");
      modal._resolve = null;
      resolve(confirmado ? input.value.trim() || null : null);
    };
  });
}

// ─── NAVIGATION ──────────────────────────────────────────────────────────────

function navegar(){
  document.querySelectorAll("[data-screen]").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll("[data-screen]").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(btn.dataset.screen).classList.add("active");
      if(btn.dataset.screen === "dashboard")    renderDashboard();
      if(btn.dataset.screen === "categorias")  renderCategoriasLista();
      if(btn.dataset.screen === "gastos-fixos") renderGastosFixos();
    };
  });
}
