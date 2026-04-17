// ELEMENTOS (AGORA CORRETOS)
const orcamentoInput = document.getElementById("orcamentoInput");
const salvarOrcamento = document.getElementById("salvarOrcamento");
const limparMes = document.getElementById("limparMes");

const desc = document.getElementById("desc");
const valorInput = document.getElementById("valorInput");
const categoriaSelect = document.getElementById("categoriaSelect");
const addLancamento = document.getElementById("addLancamento");

const listaLancamentos = document.getElementById("listaLancamentos");
const listaCategorias = document.getElementById("listaCategorias");
const categoriasStatus = document.getElementById("categoriasStatus");
const grafico = document.getElementById("grafico");

// STORAGE
const STORAGE = {
  categorias: "saldomain_categorias",
  orcamentos: "saldomain_orcamentos",
  lancamentos: "saldomain_lancamentos"
};

const get = key => JSON.parse(localStorage.getItem(key)) || [];
const set = (key, val) => localStorage.setItem(key, JSON.stringify(val));

// INIT
init();

function init(){
  try {
    mostrarLoading();
    criarCategorias();
    setupConfirmModal();
    setupEditarCategoriaModal();
    setupButtons();
    navegar();
    setupMobileMenu();
    atualizarDataMes();
    renderAll();
    renderDashboard();
  } catch (error) {
    if (window.lucide) lucide.createIcons();
    console.error("Erro na inicialização:", error);
  }
}

function atualizarDataMes(){
  const mesAtualText = document.getElementById("mesAtualText");
  if(!mesAtualText) return;
  
  const d = new Date();
  const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", 
                 "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  
  mesAtualText.textContent = `${meses[d.getMonth()]} de ${d.getFullYear()}`;
}

function setupButtons(){
  if(limparMes){
    limparMes.onclick=resetarMes;
  }
  
  if(orcamentoInput){
    orcamentoInput.addEventListener("input",(e)=>{
      const textoAtual=e.target.value.replace(/[^\d]/g,"").slice(0,11);
      e.target.value=textoAtual ? formatarMoeda(Number(textoAtual)/100) : "";
    });
  }

  if(valorInput){
    valorInput.addEventListener("input",(e)=>{
      const textoAtual=e.target.value.replace(/[^\d]/g,"").slice(0,11);
      e.target.value=textoAtual ? formatarMoeda(Number(textoAtual)/100) : "";
    });
  }
}

// MENU MOBILE
function setupMobileMenu() {
  const hamburger = document.getElementById('hamburgerBtn');
  const sidebar   = document.querySelector('.sidebar');
  const overlay   = document.getElementById('sidebarOverlay');
  if (!hamburger || !sidebar || !overlay) return;

  function abrirMenu() {
    sidebar.classList.add('open');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function fecharMenu() {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', abrirMenu);
  overlay.addEventListener('click', fecharMenu);

  // Fecha o menu ao clicar em qualquer item de navegação no mobile
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (window.innerWidth <= 768) fecharMenu();
    });
  });
}

// NOTIFICAÇÕES
function notificar(msg){
  const toast=document.getElementById("notificationToast");
  if(!toast) return;

  toast.textContent=msg;
  toast.classList.add("show");
  setTimeout(()=>{
    toast.classList.remove("show");
  },2500);
}

// MOSTRAR RESULTADO DE CALCULADORA (com fade-in)
function mostrarResultado(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = '';       // limpa inline display:none do HTML
  el.classList.remove('show', 'hiding');
  void el.offsetWidth;         // força reflow para reiniciar animação
  el.classList.add('show');

  if (!el.querySelector('.calc-result-header')) {
    const header = document.createElement('div');
    header.className = 'calc-result-header';
    header.innerHTML = `
      <span class="calc-result-title">
        <i data-lucide="check-circle-2" size="13"></i>
        Resultado
      </span>
      <button class="calc-result-close" title="Fechar resultado" aria-label="Fechar resultado">
        <i data-lucide="x" size="13"></i>
        Fechar
      </button>
    `;
    header.querySelector('.calc-result-close').onclick = function() {
      el.classList.add('hiding');
      setTimeout(function() {
        el.classList.remove('show', 'hiding');
        el.style.display = 'none';
      }, 200);
    };
    el.prepend(header);
  }
}

// FORMATAÇÃO DE MOEDA
function formatarMoeda(valor){
  if(typeof valor!=="number") valor=Number(valor);
  return new Intl.NumberFormat("pt-BR",{
    style:"currency",
    currency:"BRL",
    minimumFractionDigits:2,
    maximumFractionDigits:2
  }).format(valor);
}

function desformatarMoeda(texto){
  if(typeof texto!=="string") texto=String(texto);
  return Number(texto.replace(/[^\d,-]/g,"").replace(",","."));
}

let confirmarCallback=null;

function setupConfirmModal(){
  const modal=document.getElementById("confirmModal");
  const btnYes=document.getElementById("confirmYes");
  const btnNo=document.getElementById("confirmNo");
  
  if(!btnYes || !btnNo) return;
  
  btnYes.onclick=()=>{
    if(confirmarCallback) confirmarCallback(true);
    modal.classList.remove("show");
  };
  
  btnNo.onclick=()=>{
    if(confirmarCallback) confirmarCallback(false);
    modal.classList.remove("show");
  };
}

function exigirConfirmacao(msg, callback){
  const modal=document.getElementById("confirmModal");
  const msgEl=document.getElementById("confirmMessage");
  
  if(!modal || !msgEl) return callback(false);
  
  msgEl.textContent=msg;
  confirmarCallback=callback;
  modal.classList.add("show");
}

// EDITAR CATEGORIA MODAL
let editarCategoriaCallback = null;
let editarCategoriaId = null;
let editarCategoriaNomeAtual = null;

function setupEditarCategoriaModal(){
  const modal = document.getElementById("editarCategoriaModal");
  const confirm = document.getElementById("editarCategoriaConfirm");
  const cancel = document.getElementById("editarCategoriaCancel");
  const input = document.getElementById("editarCategoriaInput");
  
  if(!confirm || !cancel || !input) return;
  
  confirm.onclick = () => {
    if(editarCategoriaCallback) editarCategoriaCallback(true);
    modal.classList.remove("show");
  };
  
  cancel.onclick = () => {
    if(editarCategoriaCallback) editarCategoriaCallback(false);
    modal.classList.remove("show");
  };
  
  // Permitir Enter para confirmar
  input.addEventListener("keypress", (e) => {
    if(e.key === "Enter") {
      confirm.click();
    }
  });
  
  // Permitir Escape para cancelar
  input.addEventListener("keydown", (e) => {
    if(e.key === "Escape") {
      cancel.click();
    }
  });
}

function abrirEditarCategoriaModal(catId, nomeAtual){
  const modal = document.getElementById("editarCategoriaModal");
  const input = document.getElementById("editarCategoriaInput");
  const titulo = document.getElementById("editarCategoriaTitulo");
  
  if(!modal || !input || !titulo) return;
  
  editarCategoriaId = catId;
  editarCategoriaNomeAtual = nomeAtual;
  
  titulo.textContent = `Editar: ${nomeAtual}`;
  input.value = nomeAtual;
  
  modal.classList.add("show");
  input.focus();
  input.select();
  
  editarCategoriaCallback = (confirmado) => {
    if(!confirmado) return;
    
    const novoNome = input.value.trim();
    
    if(!novoNome) {
      notificar("❌ O nome não pode estar vazio");
      return;
    }
    
    if(novoNome.toLowerCase() === editarCategoriaNomeAtual.toLowerCase()) {
      notificar("ℹ️ O nome é igual ao anterior");
      return;
    }
    
    const cats = get(STORAGE.categorias);
    
    if(cats.some(c => c.id !== catId && c.nome.toLowerCase() === novoNome.toLowerCase())) {
      notificar("❌ Já existe uma categoria com este nome");
      return;
    }
    
    const cat = cats.find(c => c.id === catId);
    if(cat) {
      cat.nome = novoNome;
      mostrarLoading();
      setTimeout(() => {
        set(STORAGE.categorias, cats);
        renderAll();
        renderCategoriasLista();
        renderDashboard();
        notificar("✅ Categoria atualizada com sucesso!");
      }, 100);
    }
  };
}

// NAV
function navegar(){
  document.querySelectorAll("[data-screen]").forEach(btn=>{
    btn.onclick=()=>{
      // Remove active de todos os botões e screens
      document.querySelectorAll("[data-screen]").forEach(b=>b.classList.remove("active"));
      document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
      
      // Adiciona active ao botão e screen clicados
      btn.classList.add("active");
      document.getElementById(btn.dataset.screen).classList.add("active");
      
      if(btn.dataset.screen==="dashboard"){
        renderDashboard();
      }
      if(btn.dataset.screen==="categorias"){
        renderCategoriasLista();
      }
    };
  });
}

// CATEGORIAS
function criarCategorias(){
  if(get(STORAGE.categorias).length) return;

  const cores=["#f59e0b","#22c55e","#ef4444","#3b82f6","#a855f7","#f97316"];

  const base=[
    ["Custos fixos",30],
    ["Conforto",5],
    ["Metas",11],
    ["Prazeres",24],
    ["Liberdade financeira",25],
    ["Conhecimento",5]
  ];

  set(STORAGE.categorias,base.map((c,i)=>({
    id:Date.now()+i,
    nome:c[0],
    percentual:c[1],
    cor_hex:cores[i]
  })));
}

// ORÇAMENTO
function mesAtual(){
  const d=new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
}

function orcamentoAtual(){
  return get(STORAGE.orcamentos).find(o=>o.mes_referencia===mesAtual());
}

salvarOrcamento.onclick=()=>{
  try {
    const textoValor=orcamentoInput.value.trim();
    const valor=desformatarMoeda(textoValor);

    if(!valor || valor<=0) {
      notificar("Digite um valor válido");
      return;
    }

    let lista=get(STORAGE.orcamentos);
    const mesRef=mesAtual();
    let oIdx=lista.findIndex(o=>o.mes_referencia===mesRef);

    if(oIdx===-1){
      lista.push({id:Date.now(),mes_referencia:mesRef,valor_total:valor});
    }else{
      lista[oIdx].valor_total=valor;
    }

    mostrarLoading();
    setTimeout(() => {
      set(STORAGE.orcamentos,lista);
      orcamentoInput.value=formatarMoeda(valor);
      renderAll();
      renderDashboard();
    }, 100);
  } catch (error) {
    console.error("Erro ao salvar orçamento:", error);
    notificar("Erro ao salvar orçamento");
  }
};

function mostrarLoading(){
  const loading=document.getElementById("loading");
  if(!loading) return;
  
  loading.classList.add("show");
  setTimeout(()=>{
    ocultarLoading();
  },1500);
}

function ocultarLoading(){
  const loading=document.getElementById("loading");
  if(!loading) return;
  
  loading.classList.remove("show");
}

// LANÇAMENTO
addLancamento.onclick=()=>{
  const o=orcamentoAtual();
  if(!o) {
    notificar("Defina orçamento primeiro");
    return;
  }

  const valor=desformatarMoeda(valorInput.value);
  const descricao=desc.value.trim();
  const cat=Number(categoriaSelect.value);

  if(!descricao) {
    notificar("Digite uma descrição");
    return;
  }
  if(!valor || valor<=0) {
    notificar("Digite um valor válido");
    return;
  }

  const cats=get(STORAGE.categorias);
  const c=cats.find(x=>x.id===cat);

  const teto=o.valor_total*c.percentual/100;

  const lanc=get(STORAGE.lancamentos);

  const total=lanc
    .filter(l=>l.id_categoria===cat && l.id_orcamento===o.id)
    .reduce((s,l)=>s+l.valor,0);

  if(total+valor>teto) {
    notificar("Limite excedido nesta categoria");
    return;
  }

  lanc.push({
    id:Date.now(),
    id_orcamento:o.id,
    id_categoria:cat,
    valor,
    descricao:descricao
  });

  mostrarLoading();
  setTimeout(() => {
    set(STORAGE.lancamentos,lanc);
    desc.value="";
    valorInput.value="";
    renderAll();
    renderDashboard();
  }, 100);
};

// RENDER
function renderAll(){
  try {
    renderSelect();
    renderLancamentos();
    renderOrcamentoInput();
    renderCategorias();
    renderCategoriasLista();
  } catch (error) {
    if (window.lucide) lucide.createIcons();
    console.error("Erro ao renderizar elementos:", error);
  }
}

function renderSelect(){
  categoriaSelect.innerHTML=get(STORAGE.categorias)
    .map(c=>`<option value="${c.id}">${c.nome}</option>`).join("");
}

function renderOrcamentoInput(){
  const o=orcamentoAtual();
  if(o){
    orcamentoInput.value=formatarMoeda(o.valor_total);
  }else{
    orcamentoInput.value="";
  }
}

function renderCategorias(){
  const cats = get(STORAGE.categorias);
  const totalPercentual = cats.reduce((sum, c) => sum + c.percentual, 0);
  
  let html = `
    <div class="categorias-editor">
      <div class="editor-header">
        <h4>Ajuste os Percentuais do Seu Orçamento</h4>
        <p class="editor-subtitle">Distribua o seu orçamento entre as categorias</p>
      </div>
  `;
  
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
          <input 
            type="range" 
            min="0" 
            max="100" 
            value="${c.percentual}" 
            class="percentual-slider"
            data-cat-id="${c.id}"
            oninput="atualizarPercentualPreview(${c.id}, this.value)"
          >
        </div>
        
        <div class="input-output">
          <input 
            type="number" 
            min="0" 
            max="100" 
            value="${c.percentual}" 
            class="percentual-input"
            data-cat-id="${c.id}"
            oninput="atualizarPercentualInput(${c.id}, this.value)"
          >
          <span class="percentual-unit">%</span>
        </div>
      </div>
      
      <div class="slider-info">
        <span class="slider-label" id="preview-${c.id}">${c.percentual}%</span>
      </div>
    </div>
  `).join("");
  
  html += `
    <div class="editor-footer">
      <div class="total-info">
        <span class="total-label">Total Distribuído:</span>
        <span class="total-value" id="totalPercentual">${totalPercentual}%</span>
      </div>
      ${totalPercentual !== 100 ? `
        <div class="total-warning" style="display:flex;align-items:center;justify-content:center;gap:8px;"><i data-lucide="alert-triangle" size="16"></i> O total deve ser 100% para funcionar corretamente</div>
      ` : `
        <div class="total-success" style="display:flex;align-items:center;justify-content:center;gap:8px;"><i data-lucide="check-circle-2" size="16"></i> Distribuição completa e balanceada</div>
      `}
      <button onclick="salvarPercentuais()" class="btn-salvar-percentuais" style="display:flex;align-items:center;justify-content:center;gap:8px;"><i data-lucide="save" size="18"></i> Salvar Percentuais</button>
    </div>
  </div>
  `;
  
  listaCategorias.innerHTML = html;
  if (window.lucide) lucide.createIcons();
}

function atualizarPercentualPreview(catId, valor) {
  valor = Math.max(0, Math.min(100, parseInt(valor) || 0));
  
  // Atualizar slider
  const slider = document.querySelector(`[data-cat-id="${catId}"][type="range"]`);
  if(slider) slider.value = valor;
  
  // Atualizar input
  const input = document.querySelector(`[data-cat-id="${catId}"][type="number"]`);
  if(input) input.value = valor;
  
  // Atualizar preview
  const preview = document.getElementById(`preview-${catId}`);
  if(preview) preview.textContent = valor + '%';
  
  // Atualizar total
  atualizarTotalPercentual();
}

function atualizarPercentualInput(catId, valor) {
  valor = Math.max(0, Math.min(100, parseInt(valor) || 0));
  atualizarPercentualPreview(catId, valor);
}

function atualizarTotalPercentual() {
  let total = 0;
  const sliders = document.querySelectorAll('.percentual-slider');
  
  sliders.forEach(slider => {
    total += parseInt(slider.value) || 0;
  });
  
  const totalEl = document.getElementById('totalPercentual');
  if(totalEl) {
    totalEl.textContent = total + '%';
    totalEl.style.color = total === 100 ? 'var(--ok)' : total > 100 ? 'var(--danger)' : 'var(--warn)';
  }
}

function salvarPercentuais() {
  const cats = get(STORAGE.categorias);
  const sliders = document.querySelectorAll('.percentual-slider');
  
  let total = 0;
  const novosCats = Array.from(sliders).map(slider => {
    const catId = parseInt(slider.dataset.catId);
    const valor = parseInt(slider.value) || 0;
    total += valor;
    
    const cat = cats.find(c => c.id === catId);
    return { ...cat, percentual: valor };
  });
  
  if(total !== 100) {
    notificar('⚠️ O total deve ser 100%! Atual: ' + total + '%');
    return;
  }
  
  mostrarLoading();
  setTimeout(() => {
    set(STORAGE.categorias, novosCats);
    notificar('✅ Percentuais salvos com sucesso!');
    renderCategorias();
  }, 500);
}

function renderLancamentos(){
  const o=orcamentoAtual();
  if(!o) {
    listaLancamentos.innerHTML = `
      <div class="lancamentos-empty">
        <div class="lancamentos-empty-icon"><i data-lucide="wallet" size="40"></i></div>
        <p class="lancamentos-empty-title">Orçamento não definido</p>
        <p class="lancamentos-empty-desc">Vá ao Dashboard e defina o orçamento do mês primeiro</p>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  const lancamentos=get(STORAGE.lancamentos)
    .filter(l=>l.id_orcamento===o.id);

  const cats = get(STORAGE.categorias);

  if(lancamentos.length === 0){
    listaLancamentos.innerHTML = `
      <div class="lancamentos-empty">
        <div class="lancamentos-empty-icon"><i data-lucide="receipt" size="40"></i></div>
        <p class="lancamentos-empty-title">Nenhuma despesa registrada</p>
        <p class="lancamentos-empty-desc">Use o formulário acima para adicionar seu primeiro lançamento</p>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  listaLancamentos.innerHTML=lancamentos
    .map(l=>{
      const cat = cats.find(c => c.id === l.id_categoria);
      return `
      <div class="lancamento-item">
        <div class="lancamento-info">
          <div class="lancamento-descricao">${l.descricao}</div>
          <div class="lancamento-categoria">${cat ? cat.nome : 'Sem categoria'}</div>
        </div>
        <div class="lancamento-valor">${formatarMoeda(l.valor)}</div>
        <button onclick="deletarLancamento(${l.id})" class="lancamento-delete"><i data-lucide="trash-2" size="14"></i></button>
      </div>
    `}).join("");
  if (window.lucide) lucide.createIcons();
}

function renderDashboard(){
  const o=orcamentoAtual();
  if(!o || o.valor_total<=0) {
    const resumoGeral = document.getElementById("resumoGeral");
    if(resumoGeral) {
      resumoGeral.innerHTML = `
        <div class="dashboard-empty-state">
          <div class="dashboard-empty-icon"><i data-lucide="wallet" size="44"></i></div>
          <p class="dashboard-empty-title">Nenhum orçamento definido</p>
          <p class="dashboard-empty-desc">Digite um valor acima e clique em "Salvar Orçamento" para começar a controlar seus gastos</p>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
    }
    return;
  }

  const cats=get(STORAGE.categorias);
  const lanc=get(STORAGE.lancamentos).filter(l=>l.id_orcamento===o.id);

  // Renderizar resumo geral
  renderResumoGeral(cats, lanc, o);

  // Renderizar status das categorias
  categoriasStatus.innerHTML=cats.map(c=>{
    const gasto=lanc.filter(l=>l.id_categoria===c.id).reduce((s,l)=>s+l.valor,0);
    const limite=o.valor_total*c.percentual/100;
    const percentualGasto=(gasto/limite)*100;
    const cor=percentualGasto>100?"#ef4444":percentualGasto>80?"#fb923c":"#22c55e";

    return `
      <div class="categoria-status">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
          <span style="font-weight:500;">${c.nome}</span>
          <span style="color:var(--muted);font-size:12px;">${formatarMoeda(gasto)} / ${formatarMoeda(limite)}</span>
        </div>
        <div class="barra">
          <div class="barra-fill" style="width:${Math.min(percentualGasto,100)}%;background:${cor};"></div>
        </div>
      </div>
    `;
  }).join("");

  // Renderizar gráfico
  renderGrafico(cats,lanc,o);
  if (window.lucide) lucide.createIcons();
}

function renderResumoGeral(cats, lanc, o){
  const resumoGeral = document.getElementById("resumoGeral");
  if(!resumoGeral) return;

  const totalGasto = lanc.reduce((s, l) => s + l.valor, 0);
  const totalRestante = o.valor_total - totalGasto;
  const percentualUsado = (totalGasto / o.valor_total) * 100;
  
  // Contar categorias em alerta
  let categoriasAlert = 0;
  cats.forEach(c => {
    const gasto = lanc.filter(l => l.id_categoria === c.id).reduce((s, l) => s + l.valor, 0);
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
        <div class="stat-bar-fill" style="width:${Math.min(percentualUsado, 100)}%"></div>
      </div>
      <span class="stat-subtitle">${percentualUsado.toFixed(1)}% do orçamento</span>
    </div>

    <div class="stat-card" style="border-color:${totalRestante > 0 ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'};background:${totalRestante > 0 ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)'};">
      <span class="stat-label">Disponível</span>
      <span class="stat-value" style="color:${totalRestante > 0 ? 'var(--ok)' : 'var(--danger)'}">
        ${formatarMoeda(totalRestante)}
      </span>
      <span class="stat-subtitle">${totalRestante > 0 ? 'Ainda pode gastar' : 'Orçamento ultrapassado'}</span>
    </div>

    ${categoriasAlert > 0 ? `
      <div class="stat-card" style="border-color:#fb923c40;background:rgba(251, 146, 60, 0.1);">
        <span class="stat-label">Atenção</span>
        <span class="stat-value" style="color:var(--warn);">${categoriasAlert}</span>
        <span class="stat-subtitle">categoria(s) com limite ultrapassado</span>
      </div>
    ` : ''}
  `;
}

function renderGrafico(cats,lanc,o){
  try {
    if(!cats || !cats.length) return console.warn("Sem categorias");
    
    const labels=cats.map(c=>c.nome);
    const gastos=cats.map(c=>lanc.filter(l=>l.id_categoria===c.id).reduce((s,l)=>s+l.valor,0));
    const cores=cats.map(c=>c.cor_hex);

    const totalGasto=gastos.reduce((a,b)=>a+b,0);
    const percentuais=totalGasto>0 ? gastos.map(g=>(g/totalGasto)*100) : cats.map(()=>100/cats.length);

    if(!grafico) return console.error("Canvas não encontrado");
    
    const ctx=grafico.getContext("2d");
    if(!ctx) return console.error("Contexto 2D não disponível");
    
    if(window.graficoChart instanceof Chart) {
      window.graficoChart.destroy();
    }

    const legendaEl=document.getElementById('grafico-legenda');
    if(legendaEl){
      legendaEl.innerHTML=labels.map((label,i)=>`
        <div class="grafico-legenda-item">
          <span class="grafico-legenda-cor" style="background:${cores[i]};"></span>
          <span>${label}</span>
        </div>
      `).join('');
    }

    window.graficoChart=new Chart(ctx,{
      type:"doughnut",
      data:{
        labels:labels,
        datasets:[
          {
            data:percentuais,
            backgroundColor:cores,
            borderColor:"rgba(255,255,255,0.1)",
            borderWidth:2,
            spacing:2
          }
        ]
      },
      options:{
        responsive:true,
        maintainAspectRatio:true,
        layout:{
          padding:0
        },
        plugins:{
          legend:{
            display:false
          },
          tooltip:{
            enabled:true,
            backgroundColor:"rgba(0,0,0,0.9)",
            titleColor:"#f5f5f5",
            bodyColor:"#f5f5f5",
            borderColor:"rgba(255,255,255,0.3)",
            borderWidth:1,
            padding:12,
            displayColors:true,
            callbacks:{
              label:function(context){
                const valor=context.parsed || 0;
                return context.label + ": " + valor.toFixed(1) + "%";
              }
            }
          }
        }
      }
    });
  } catch (error) {
    console.error("Erro ao renderizar gráfico:", error);
  }
}

function deletarLancamento(id){
  exigirConfirmacao("Deseja deletar este lançamento?", (confirmado)=>{
    if(!confirmado) return;

    mostrarLoading();
    setTimeout(() => {
      const lanc=get(STORAGE.lancamentos).filter(l=>l.id!==id);
      set(STORAGE.lancamentos,lanc);
      renderAll();
      renderDashboard();
    }, 100);
  });
}

// RESET GLOBAL (necessário para botão funcionar)
function resetarMes(){
  exigirConfirmacao("Tem certeza que deseja limpar este mês? Todos os lançamentos serão removidos.", (confirmado)=>{
    if(!confirmado) return;

    const o=orcamentoAtual();
    if(!o) {
      notificar("Nenhum orçamento para limpar");
      return;
    }

    mostrarLoading();
    setTimeout(() => {
      set(STORAGE.lancamentos,
        get(STORAGE.lancamentos).filter(l=>l.id_orcamento!==o.id)
      );

      let lista=get(STORAGE.orcamentos);
      const idx=lista.findIndex(x=>x.id===o.id);
      if(idx>=0){
        lista[idx].valor_total=0;
        set(STORAGE.orcamentos,lista);
      }

      renderAll();
      renderDashboard();
      notificar("Mês limpado com sucesso");
    }, 100);
  });
}

// GERENCIAR CATEGORIAS
function renderCategoriasLista(){
  const cats = get(STORAGE.categorias);
  const categoriasListaEditor = document.getElementById("categoriasListaEditor");
  
  if(!categoriasListaEditor) return;
  
  if(cats.length === 0) {
    categoriasListaEditor.innerHTML = `<div class="categoria-item-editor empty-state" style="color: var(--muted);">Nenhuma categoria ainda</div>`;
    return;
  }

  const totalPercentual = cats.reduce((sum, c) => sum + c.percentual, 0);
  
  let html = `
    <div class="categorias-percentuais">
      <div class="percentuais-header">
        <p>Ajuste o percentual de cada categoria:</p>
      </div>
  `;
  
  html += cats.map(c => `
    <div class="categoria-percentual-item">
      <div class="categoria-percentual-header">
        <div style="width:24px;height:24px;background:${c.cor_hex};border-radius:6px;"></div>
        <div class="categoria-percentual-nome">${c.nome}</div>
      </div>
      
      <div class="categoria-percentual-controls">
        <input 
          type="range" 
          min="0" 
          max="100" 
          value="${c.percentual}" 
          class="percentual-slider"
          data-cat-id="${c.id}"
          oninput="atualizarPercentualCategoria(${c.id}, this.value)"
        >
        <div class="percentual-input-group">
          <input 
            type="number" 
            min="0" 
            max="100" 
            value="${c.percentual}" 
            class="percentual-input"
            data-cat-id="${c.id}"
            oninput="atualizarPercentualCategoria(${c.id}, this.value)"
          >
          <span class="percentual-unit">%</span>
        </div>
      </div>
    </div>
  `).join("");
  
  html += `
    <div class="percentuais-footer">
      <div class="total-info">
        <span>Total Distribuído:</span>
        <span class="total-percentual" id="totalPercentualCategorias">${totalPercentual}%</span>
      </div>
      ${totalPercentual !== 100 ? `
        <div class="total-warning" style="display:flex;align-items:center;justify-content:center;gap:8px;"><i data-lucide="alert-triangle" size="16"></i> O total deve ser 100%</div>
      ` : `
        <div class="total-success" style="display:flex;align-items:center;justify-content:center;gap:8px;"><i data-lucide="check-circle-2" size="16"></i> Distribuição perfeita!</div>
      `}
      <button onclick="salvarPercentuaisCategorias()" class="btn-salvar-percentuais" style="display:flex;align-items:center;justify-content:center;gap:8px;"><i data-lucide="save" size="18"></i> Salvar Percentuais</button>
    </div>
    
    <div class="categorias-existentes">
      <h5>Suas Categorias:</h5>
  `;
  
  html += cats.map(c => `
    <div class="categoria-item-editor">
      <div class="categoria-item-color" style="background: ${c.cor_hex};"></div>
      <div class="categoria-item-content">
        <div class="categoria-item-nome">${c.nome}</div>
        <div class="categoria-item-info">Percentual: ${c.percentual}%</div>
      </div>
      <div class="categoria-item-actions">
        <button onclick="abrirEditorCategoria(${c.id})" class="btn-editar-cat" style="display:flex;align-items:center;gap:4px;"><i data-lucide="edit-3" size="12"></i> Editar</button>
        <button onclick="deletarCategoriaConfirm(${c.id})" class="btn-deletar-cat" style="display:flex;align-items:center;gap:4px;"><i data-lucide="trash-2" size="12"></i> Remover</button>
      </div>
    </div>
  `).join("");
  
  html += `
    </div>
  </div>
  `;
  
  categoriasListaEditor.innerHTML = html;
  if (window.lucide) lucide.createIcons();
}

function adicionarNovaCategoria(){
  const nomeInput = document.getElementById("novaCategoriaNome");
  const corInput = document.getElementById("novaCategoriaCor");
  
  if(!nomeInput || !corInput) return;
  
  const nome = nomeInput.value.trim();
  const cor = corInput.value;
  
  if(!nome) {
    notificar("Digite um nome para a categoria");
    return;
  }
  
  const cats = get(STORAGE.categorias);
  
  // Verificar se já existe categoria com esse nome
  if(cats.some(c => c.nome.toLowerCase() === nome.toLowerCase())) {
    notificar("Já existe uma categoria com este nome");
    return;
  }
  
  cats.push({
    id: Date.now(),
    nome: nome,
    percentual: 0,
    cor_hex: cor
  });
  
  mostrarLoading();
  setTimeout(() => {
    set(STORAGE.categorias, cats);
    nomeInput.value = "";
    corInput.value = "#f59e0b";
    renderAll();
    renderCategoriasLista();
    renderDashboard();
    notificar("✅ Categoria criada com sucesso!");
  }, 100);
}

function atualizarPercentualCategoria(catId, valor) {
  valor = Math.max(0, Math.min(100, parseInt(valor) || 0));
  
  // Atualizar slider
  const slider = document.querySelector(`[data-cat-id="${catId}"][type="range"]`);
  if(slider) slider.value = valor;
  
  // Atualizar input
  const input = document.querySelector(`[data-cat-id="${catId}"][type="number"]`);
  if(input) input.value = valor;
  
  // Atualizar total
  atualizarTotalPercentualCategorias();
}

function atualizarTotalPercentualCategorias() {
  let total = 0;
  const categoriasListaEditor = document.getElementById("categoriasListaEditor");
  
  if(!categoriasListaEditor) return;
  
  const sliders = categoriasListaEditor.querySelectorAll('.percentual-slider');
  
  sliders.forEach(slider => {
    total += parseInt(slider.value) || 0;
  });
  
  const totalEl = document.getElementById('totalPercentualCategorias');
  if(totalEl) {
    totalEl.textContent = total + '%';
    totalEl.style.color = total === 100 ? '#22c55e' : total > 100 ? '#ef4444' : '#f59e0b';
  }
}

function salvarPercentuaisCategorias() {
  const cats = get(STORAGE.categorias);
  const categoriasListaEditor = document.getElementById("categoriasListaEditor");
  
  if(!categoriasListaEditor) return;
  
  const sliders = categoriasListaEditor.querySelectorAll('.percentual-slider');
  
  let total = 0;
  const novosCats = Array.from(sliders).map(slider => {
    const catId = parseInt(slider.dataset.catId);
    const valor = parseInt(slider.value) || 0;
    total += valor;
    
    const cat = cats.find(c => c.id === catId);
    return { ...cat, percentual: valor };
  });
  
  if(total !== 100) {
    notificar('⚠️ O total deve ser 100%! Atual: ' + total + '%');
    return;
  }
  
  mostrarLoading();
  setTimeout(() => {
    set(STORAGE.categorias, novosCats);
    notificar('✅ Percentuais salvos com sucesso!');
    renderAll();
    renderCategoriasLista();
  }, 500);
}

function abrirEditorCategoria(catId){
  const cats = get(STORAGE.categorias);
  const cat = cats.find(c => c.id === catId);
  
  if(!cat) return;
  
  abrirEditarCategoriaModal(catId, cat.nome);
}

function abrirEditorCor(catId, corAtual){
  const input = document.createElement("input");
  input.type = "color";
  input.value = corAtual;
  
  input.onchange = () => {
    const cats = get(STORAGE.categorias);
    const cat = cats.find(c => c.id === catId);
    
    if(cat) {
      cat.cor_hex = input.value;
      set(STORAGE.categorias, cats);
      renderCategoriasLista();
      renderDashboard();
    }
  };
  
  input.click();
}

function deletarCategoriaConfirm(catId){
  exigirConfirmacao("Tem certeza que deseja remover esta categoria?\nTodos os lançamentos desta categoria serão removidos.", (confirmado) => {
    if(!confirmado) return;
    
    deletarCategoria(catId);
  });
}

function deletarCategoria(catId){
  let cats = get(STORAGE.categorias);
  let lanc = get(STORAGE.lancamentos);

  // Remove a categoria
  cats = cats.filter(c => c.id !== catId);

  // Remove lançamentos da categoria
  lanc = lanc.filter(l => l.id_categoria !== catId);

  mostrarLoading();
  setTimeout(() => {
    set(STORAGE.categorias, cats);
    set(STORAGE.lancamentos, lanc);
    renderAll();
    renderCategoriasLista();
    renderDashboard();
    notificar("✅ Categoria removida!");
  }, 100);
}

// =====================
// CALCULADORAS
// =====================

function parseBRCalc(str) {
  if (!str) return 0;
  str = String(str).trim().replace(/\s/g, '');
  if (str.includes(',')) {
    if (str.includes('.') && str.lastIndexOf('.') < str.lastIndexOf(',')) {
      // Formato BR: 1.000,50 — remove pontos de milhar, troca vírgula por ponto
      str = str.replace(/\./g, '').replace(',', '.');
    } else {
      // Vírgula como decimal: 1,5
      str = str.replace(',', '.');
    }
  }
  return parseFloat(str.replace(/[^\d.\-]/g, '')) || 0;
}

function calcularJurosCompostos() {
  const capital   = parseBRCalc(document.getElementById('jc-capital').value);
  const aporte    = parseBRCalc(document.getElementById('jc-aporte').value) || 0;
  const taxaAnual = parseBRCalc(document.getElementById('jc-taxa').value) / 100;
  const periodo   = parseInt(document.getElementById('jc-periodo').value) || 0;

  if (capital   <= 0) { notificar('Digite um capital inicial válido'); return; }
  if (taxaAnual <= 0) { notificar('Digite uma taxa de juros válida');   return; }
  if (periodo   <  1) { notificar('Digite um período válido (mín. 1 mês)'); return; }

  // Conversão correta: taxa mensal equivalente à taxa anual
  const taxa = Math.pow(1 + taxaAnual, 1 / 12) - 1;

  let saldo = capital;
  let totalInvestido = capital;
  const linhas = [];

  for (let m = 1; m <= periodo; m++) {
    const jurosMes = saldo * taxa;
    saldo = saldo * (1 + taxa) + aporte;
    totalInvestido += aporte;
    linhas.push({ mes: m, aporte, jurosMes, montante: saldo });
  }

  const totalJuros = saldo - totalInvestido;

  document.getElementById('jc-cards').innerHTML = `
    <div class="calc-stat">
      <span class="calc-stat-label">Montante Final</span>
      <span class="calc-stat-value">${formatarMoeda(saldo)}</span>
    </div>
    <div class="calc-stat">
      <span class="calc-stat-label">Total Investido</span>
      <span class="calc-stat-value">${formatarMoeda(totalInvestido)}</span>
    </div>
    <div class="calc-stat">
      <span class="calc-stat-label">Total em Juros</span>
      <span class="calc-stat-value" style="color:var(--accent)">${formatarMoeda(totalJuros)}</span>
    </div>
  `;

  document.getElementById('jc-tabela').innerHTML = `
    <thead>
      <tr><th>Mês</th><th>Aporte</th><th>Juros do Mês</th><th>Montante Acum.</th></tr>
    </thead>
    <tbody>
      ${linhas.map(l => `
        <tr>
          <td>${l.mes}</td>
          <td>${formatarMoeda(l.aporte)}</td>
          <td>${formatarMoeda(l.jurosMes)}</td>
          <td>${formatarMoeda(l.montante)}</td>
        </tr>
      `).join('')}
    </tbody>
  `;

  mostrarResultado('jc-resultado');
  if (window.lucide) lucide.createIcons();
}

function calcularCDBCDI() {
  const valor      = parseBRCalc(document.getElementById('cdi-valor').value);
  const taxaCDI    = parseBRCalc(document.getElementById('cdi-taxa').value);
  const percentual = parseBRCalc(document.getElementById('cdi-percentual').value);
  const prazo      = parseInt(document.getElementById('cdi-prazo').value) || 0;

  if (valor      <= 0) { notificar('Digite um valor investido válido');    return; }
  if (taxaCDI    <= 0) { notificar('Digite a taxa do CDI válida');         return; }
  if (percentual <= 0) { notificar('Digite o percentual do CDI válido');   return; }
  if (prazo      <  1) { notificar('Digite um prazo válido (mín. 1 dia)'); return; }

  // Taxa efetiva anual do CDB = CDI_aa * (percentual / 100)
  const taxaEfetiva = (taxaCDI * percentual / 100) / 100;
  // Converter para taxa diária (convenção 252 dias úteis)
  const taxaDiaria  = Math.pow(1 + taxaEfetiva, 1 / 252) - 1;
  // Rendimento bruto sobre os dias corridos informados
  const rendBruto   = valor * (Math.pow(1 + taxaDiaria, prazo) - 1);

  // Tabela regressiva de IR
  let aliquota;
  if      (prazo <= 180) aliquota = 0.225;
  else if (prazo <= 360) aliquota = 0.20;
  else if (prazo <= 720) aliquota = 0.175;
  else                   aliquota = 0.15;

  const ir       = rendBruto * aliquota;
  const valorLiq = valor + rendBruto - ir;

  document.getElementById('cdi-cards').innerHTML = `
    <div class="calc-stat">
      <span class="calc-stat-label">Rendimento Bruto</span>
      <span class="calc-stat-value">${formatarMoeda(rendBruto)}</span>
    </div>
    <div class="calc-stat">
      <span class="calc-stat-label">IR Descontado (${(aliquota * 100).toFixed(1)}%)</span>
      <span class="calc-stat-value" style="color:var(--danger)">${formatarMoeda(ir)}</span>
    </div>
    <div class="calc-stat">
      <span class="calc-stat-label">Valor Líquido Final</span>
      <span class="calc-stat-value" style="color:var(--ok)">${formatarMoeda(valorLiq)}</span>
    </div>
  `;

  document.getElementById('cdi-ir-info').innerHTML = `
    <div class="calc-alert calc-alert-ok" style="margin-top:12px;">
      <i data-lucide="info" size="16"></i>
      IR de ${(aliquota * 100).toFixed(1)}% aplicado (${prazo} dias).
      Tabela: ≤180d → 22,5% | ≤360d → 20% | ≤720d → 17,5% | &gt;720d → 15%
    </div>
  `;

  mostrarResultado('cdi-resultado');
  if (window.lucide) lucide.createIcons();
}

function calcularAporteMeta() {
  const meta  = parseBRCalc(document.getElementById('meta-valor').value);
  const prazo = parseInt(document.getElementById('meta-prazo').value) || 0;
  const taxa  = parseBRCalc(document.getElementById('meta-taxa').value) / 100;

  if (meta  <= 0) { notificar('Digite um valor de meta válido');       return; }
  if (prazo <  1) { notificar('Digite um prazo válido (mín. 1 mês)'); return; }
  if (taxa  <= 0) { notificar('Digite uma taxa de juros válida');      return; }

  // PMT = FV × r / [(1+r)^n − 1]
  const fator        = Math.pow(1 + taxa, prazo);
  const pmt          = meta * taxa / (fator - 1);
  const totalAportado = pmt * prazo;
  const totalJuros   = meta - totalAportado;

  document.getElementById('meta-cards').innerHTML = `
    <div class="calc-stat">
      <span class="calc-stat-label">Aporte Mensal Necessário</span>
      <span class="calc-stat-value" style="color:var(--accent)">${formatarMoeda(pmt)}</span>
    </div>
    <div class="calc-stat">
      <span class="calc-stat-label">Total Aportado</span>
      <span class="calc-stat-value">${formatarMoeda(totalAportado)}</span>
    </div>
    <div class="calc-stat">
      <span class="calc-stat-label">Gerado em Juros</span>
      <span class="calc-stat-value" style="color:var(--ok)">${formatarMoeda(totalJuros)}</span>
    </div>
  `;

  mostrarResultado('meta-resultado');
  if (window.lucide) lucide.createIcons();
}

function calcularDividendYield() {
  const patrimonio = parseBRCalc(document.getElementById('dy-patrimonio').value);
  const yieldAnual = parseBRCalc(document.getElementById('dy-yield').value);

  if (patrimonio <= 0) { notificar('Digite um patrimônio válido');     return; }
  if (yieldAnual <= 0) { notificar('Digite um dividend yield válido'); return; }

  const rendaAnual  = patrimonio * (yieldAnual / 100);
  const rendaMensal = rendaAnual / 12;

  document.getElementById('dy-cards').innerHTML = `
    <div class="calc-stat">
      <span class="calc-stat-label">Renda Mensal Estimada</span>
      <span class="calc-stat-value" style="color:var(--accent)">${formatarMoeda(rendaMensal)}</span>
    </div>
    <div class="calc-stat">
      <span class="calc-stat-label">Renda Anual Estimada</span>
      <span class="calc-stat-value">${formatarMoeda(rendaAnual)}</span>
    </div>
  `;

  mostrarResultado('dy-resultado');
  if (window.lucide) lucide.createIcons();
}

function calcularFinanciamentoPrice() {
  const pv   = parseBRCalc(document.getElementById('price-valor').value);
  const taxa = parseBRCalc(document.getElementById('price-taxa').value) / 100;
  const n    = parseInt(document.getElementById('price-parcelas').value) || 0;

  if (pv   <= 0) { notificar('Digite um valor financiado válido');        return; }
  if (taxa <= 0) { notificar('Digite uma taxa de juros válida');           return; }
  if (n    <  1) { notificar('Digite o número de parcelas (mín. 1)');     return; }

  // Tabela Price: PMT = PV × r / [1 − (1+r)^(−n)]
  const parcela    = pv * taxa / (1 - Math.pow(1 + taxa, -n));
  const totalPago  = parcela * n;
  const totalJuros = totalPago - pv;

  document.getElementById('price-cards').innerHTML = `
    <div class="calc-stat">
      <span class="calc-stat-label">Valor da Parcela</span>
      <span class="calc-stat-value">${formatarMoeda(parcela)}</span>
    </div>
    <div class="calc-stat">
      <span class="calc-stat-label">Total Pago</span>
      <span class="calc-stat-value">${formatarMoeda(totalPago)}</span>
    </div>
    <div class="calc-stat">
      <span class="calc-stat-label">Total de Juros</span>
      <span class="calc-stat-value" style="color:var(--danger)">${formatarMoeda(totalJuros)}</span>
    </div>
  `;

  let saldo = pv;
  let rows  = '';
  for (let i = 1; i <= n; i++) {
    const juros = saldo * taxa;
    const amort = parcela - juros;
    saldo = Math.max(0, saldo - amort);
    rows += `<tr>
      <td>${i}</td>
      <td>${formatarMoeda(parcela)}</td>
      <td>${formatarMoeda(amort)}</td>
      <td>${formatarMoeda(juros)}</td>
      <td>${formatarMoeda(saldo)}</td>
    </tr>`;
  }

  document.getElementById('price-tabela').innerHTML = `
    <thead>
      <tr><th>Parcela</th><th>Prestação</th><th>Amortização</th><th>Juros</th><th>Saldo Dev.</th></tr>
    </thead>
    <tbody>${rows}</tbody>
  `;

  mostrarResultado('price-resultado');
  if (window.lucide) lucide.createIcons();
}

function calcularRotativoCartao() {
  const divida    = parseBRCalc(document.getElementById('rot-divida').value);
  const taxa      = parseBRCalc(document.getElementById('rot-taxa').value) / 100;
  const pagamento = parseBRCalc(document.getElementById('rot-minimo').value);

  if (divida    <= 0) { notificar('Digite uma dívida válida');                    return; }
  if (taxa      <= 0) { notificar('Digite uma taxa de juros válida');              return; }
  if (pagamento <= 0) { notificar('Digite um valor de pagamento mensal válido');  return; }

  const alertaEl    = document.getElementById('rot-alerta');
  const jurosPrimeiro = divida * taxa;

  if (pagamento <= jurosPrimeiro) {
    alertaEl.innerHTML = `
      <div class="calc-alert calc-alert-danger">
        <i data-lucide="alert-triangle" size="16"></i>
        Seu pagamento (${formatarMoeda(pagamento)}) é menor ou igual aos juros do 1º mês
        (${formatarMoeda(jurosPrimeiro)}). A dívida nunca será quitada!
      </div>
    `;
    document.getElementById('rot-cards').innerHTML   = '';
    document.getElementById('rot-tabela').innerHTML  = '';
    mostrarResultado('rot-resultado');
    if (window.lucide) lucide.createIcons();
    return;
  }

  alertaEl.innerHTML = '';

  let saldo      = divida;
  let totalPago  = 0;
  let totalJuros = 0;
  let meses      = 0;
  const linhas   = [];
  const MAX_MESES = 1200;

  while (saldo > 0.005 && meses < MAX_MESES) {
    meses++;
    const juros     = saldo * taxa;
    const pag       = Math.min(pagamento, saldo + juros);
    const novoSaldo = Math.max(0, saldo + juros - pag);
    totalPago  += pag;
    totalJuros += juros;
    if (linhas.length < 24) linhas.push({ mes: meses, saldo, juros, pag, novoSaldo });
    saldo = novoSaldo;
  }

  document.getElementById('rot-cards').innerHTML = `
    <div class="calc-stat">
      <span class="calc-stat-label">Meses para Quitar</span>
      <span class="calc-stat-value">${meses >= MAX_MESES ? '&gt; ' + MAX_MESES : meses}</span>
    </div>
    <div class="calc-stat">
      <span class="calc-stat-label">Total Pago</span>
      <span class="calc-stat-value">${formatarMoeda(totalPago)}</span>
    </div>
    <div class="calc-stat">
      <span class="calc-stat-label">Total em Juros</span>
      <span class="calc-stat-value" style="color:var(--danger)">${formatarMoeda(totalJuros)}</span>
    </div>
  `;

  document.getElementById('rot-tabela').innerHTML = `
    <thead>
      <tr><th>Mês</th><th>Saldo Dev.</th><th>Juros</th><th>Pagamento</th><th>Novo Saldo</th></tr>
    </thead>
    <tbody>
      ${linhas.map(l => `
        <tr>
          <td>${l.mes}</td>
          <td>${formatarMoeda(l.saldo)}</td>
          <td>${formatarMoeda(l.juros)}</td>
          <td>${formatarMoeda(l.pag)}</td>
          <td>${formatarMoeda(l.novoSaldo)}</td>
        </tr>
      `).join('')}
    </tbody>
  `;

  mostrarResultado('rot-resultado');
  if (window.lucide) lucide.createIcons();
}

function calcularAVistaVsParcelado() {
  const avista       = parseBRCalc(document.getElementById('avp-vista').value);
  const parcelaValor = parseBRCalc(document.getElementById('avp-parcelas-valor').value);
  const nParcelas    = parseInt(document.getElementById('avp-n-parcelas').value) || 0;
  const taxa         = parseBRCalc(document.getElementById('avp-rendimento').value) / 100;

  if (avista       <= 0) { notificar('Digite o preço à vista válido');                  return; }
  if (parcelaValor <= 0) { notificar('Digite o valor de cada parcela válido');           return; }
  if (nParcelas    <  2) { notificar('Digite o número de parcelas (mín. 2)');            return; }
  if (taxa         <= 0) { notificar('Digite a taxa mensal do investimento válida');     return; }

  // Valor presente das parcelas descontadas à taxa de rendimento do investidor
  // PV = PMT × [1 − (1+r)^(−n)] / r
  const pvParcelas     = parcelaValor * (1 - Math.pow(1 + taxa, -nParcelas)) / taxa;
  const totalParcelado = parcelaValor * nParcelas;
  const diferenca      = Math.abs(pvParcelas - avista);

  const conclusaoEl = document.getElementById('avp-conclusao');
  if (pvParcelas < avista) {
    conclusaoEl.innerHTML = `
      <div class="calc-alert calc-alert-ok">
        <i data-lucide="trending-up" size="16"></i>
        <strong>Parcelado é mais vantajoso</strong> — diferença de ${formatarMoeda(diferenca)} em valor presente.
      </div>
      <div class="calc-conclusion">
        O valor presente das ${nParcelas} parcelas (${formatarMoeda(pvParcelas)}) é menor que o
        preço à vista (${formatarMoeda(avista)}). Parcelando, você mantém o capital investido
        a ${(taxa * 100).toFixed(2)}% ao mês — o rendimento compensa o custo total de
        ${formatarMoeda(totalParcelado)}.
      </div>
    `;
  } else {
    conclusaoEl.innerHTML = `
      <div class="calc-alert calc-alert-danger">
        <i data-lucide="trending-down" size="16"></i>
        <strong>À vista é mais vantajoso</strong> — economia de ${formatarMoeda(diferenca)} em valor presente.
      </div>
      <div class="calc-conclusion">
        O valor presente das ${nParcelas} parcelas (${formatarMoeda(pvParcelas)}) supera o
        preço à vista (${formatarMoeda(avista)}). Mesmo investindo o dinheiro a
        ${(taxa * 100).toFixed(2)}% ao mês, as parcelas custam mais. Pagar à vista
        economiza ${formatarMoeda(diferenca)}.
      </div>
    `;
  }

  mostrarResultado('avp-resultado');
  if (window.lucide) lucide.createIcons();
}

function calcularQuitarDivida() {
  const saldo      = parseBRCalc(document.getElementById('qd-saldo').value);
  const taxaDivida = parseBRCalc(document.getElementById('qd-taxa-divida').value) / 100;
  const parcelas   = parseInt(document.getElementById('qd-parcelas').value) || 0;
  const desconto   = parseBRCalc(document.getElementById('qd-desconto').value) || 0;
  const disponivel = parseBRCalc(document.getElementById('qd-disponivel').value);
  const taxaInvest = parseBRCalc(document.getElementById('qd-taxa-invest').value) / 100;

  if (saldo      <= 0) { notificar('Digite o saldo devedor válido');                   return; }
  if (taxaDivida <= 0) { notificar('Digite a taxa de juros da dívida válida');         return; }
  if (parcelas   <  1) { notificar('Digite o número de parcelas restantes');           return; }
  if (disponivel <= 0) { notificar('Digite o valor disponível para quitar válido');    return; }
  if (taxaInvest <= 0) { notificar('Digite a taxa mensal do investimento válida');     return; }

  // Saldo após desconto de quitação antecipada
  const saldoDesconto = saldo * (1 - desconto / 100);

  // PMT original — total que ainda seria pago sem quitação antecipada
  const pmtOriginal   = saldo * taxaDivida / (1 - Math.pow(1 + taxaDivida, -parcelas));
  const totalOriginal = pmtOriginal * parcelas;

  // Rendimento perdido: quanto o dinheiro renderia investido pelo mesmo período
  const rendimentoPerdido = disponivel * (Math.pow(1 + taxaInvest, parcelas) - 1);

  let economia, cenario, infoCenario;

  if (disponivel >= saldoDesconto) {
    // Cenário A — Quitação total
    cenario     = 'A';
    economia    = totalOriginal - saldoDesconto;
    infoCenario = 'Quitação total possível';
  } else {
    // Cenário B — Quitação parcial: abate o disponível do saldo com desconto
    cenario = 'B';
    const novoSaldo        = saldoDesconto - disponivel;
    const pmtNovo          = novoSaldo * taxaDivida / (1 - Math.pow(1 + taxaDivida, -parcelas));
    const totalNovoParcelas = pmtNovo * parcelas;
    economia    = totalOriginal - (disponivel + totalNovoParcelas);
    infoCenario = `Quitação parcial — novo saldo de ${formatarMoeda(novoSaldo)} em ${parcelas} parcelas`;
  }

  const diferenca     = Math.abs(economia - rendimentoPerdido);
  const quitarMelhor  = economia > rendimentoPerdido;

  document.getElementById('qd-cards').innerHTML = `
    <div class="calc-stat">
      <span class="calc-stat-label">Saldo com Desconto</span>
      <span class="calc-stat-value">${formatarMoeda(saldoDesconto)}</span>
    </div>
    <div class="calc-stat">
      <span class="calc-stat-label">Economia ao Quitar</span>
      <span class="calc-stat-value" style="color:var(--ok)">${formatarMoeda(economia)}</span>
    </div>
    <div class="calc-stat">
      <span class="calc-stat-label">Rendimento Investido</span>
      <span class="calc-stat-value" style="color:var(--accent)">${formatarMoeda(rendimentoPerdido)}</span>
    </div>
    <div class="calc-stat">
      <span class="calc-stat-label">Diferença</span>
      <span class="calc-stat-value">${formatarMoeda(diferenca)}</span>
    </div>
  `;

  document.getElementById('qd-cenario').innerHTML = `
    <div style="font-size:12px;color:var(--muted);margin-bottom:12px;padding:8px 12px;background:rgba(255,255,255,0.03);border-radius:8px;border:1px solid var(--border);">
      <strong>Cenário ${cenario}:</strong> ${infoCenario}
    </div>
  `;

  document.getElementById('qd-recomendacao').innerHTML = quitarMelhor ? `
    <div class="calc-alert calc-alert-ok">
      <i data-lucide="check-circle" size="16"></i>
      <div>
        <strong>Quite a dívida e economize ${formatarMoeda(diferenca)}</strong><br>
        <span style="font-weight:400;font-size:12px;">A economia de ${formatarMoeda(economia)} supera o rendimento de ${formatarMoeda(rendimentoPerdido)} que o dinheiro geraria investido.</span>
      </div>
    </div>
  ` : `
    <div class="calc-alert calc-alert-danger">
      <i data-lucide="x-circle" size="16"></i>
      <div>
        <strong>Mantenha investido e ganhe ${formatarMoeda(diferenca)} a mais</strong><br>
        <span style="font-weight:400;font-size:12px;">O rendimento de ${formatarMoeda(rendimentoPerdido)} supera a economia de ${formatarMoeda(economia)} obtida quitando agora.</span>
      </div>
    </div>
  `;

  mostrarResultado('qd-resultado');
  if (window.lucide) lucide.createIcons();
}

// Máscara de moeda para inputs das calculadoras (máx. R$ 999.999.999,99)
document.addEventListener('input', function(e) {
  if (!e.target.classList.contains('input-moeda')) return;
  const digitos = e.target.value.replace(/[^\d]/g, '').slice(0, 11);
  e.target.value = digitos ? formatarMoeda(Number(digitos) / 100) : '';
});

// Enter nas calculadoras dispara o cálculo correspondente
document.addEventListener('keydown', function(e) {
  if (e.key !== 'Enter') return;
  if (!e.target.matches('input, select')) return;

  const card = e.target.closest('.calc-card');
  if (!card) return;

  const calcMap = [
    ['jc-capital',    calcularJurosCompostos],
    ['cdi-valor',     calcularCDBCDI],
    ['meta-valor',    calcularAporteMeta],
    ['dy-patrimonio', calcularDividendYield],
    ['price-valor',   calcularFinanciamentoPrice],
    ['rot-divida',    calcularRotativoCartao],
    ['avp-vista',     calcularAVistaVsParcelado],
    ['qd-saldo',      calcularQuitarDivida],
  ];

  for (const [inputId, fn] of calcMap) {
    if (card.querySelector('#' + inputId)) {
      e.preventDefault();
      fn();
      return;
    }
  }
});

// =====================
// EXPORTAR PDF
// =====================

async function exportarPDF() {
  const o = orcamentoAtual();
  if (!o || o.valor_total <= 0) {
    notificar('Defina um orçamento antes de exportar');
    return;
  }

  if (!window.jspdf) {
    notificar('Biblioteca de PDF ainda carregando, tente novamente');
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const W = 210, H = 297, M = 18, CW = 174;

  // ── paleta ──
  const BG     = [11,  11,  12 ];
  const BG2    = [18,  18,  24 ];
  const CARD   = [26,  26,  32 ];
  const BORDER = [42,  42,  52 ];
  const ACCENT = [245, 158, 11 ];
  const TEXT   = [245, 245, 245];
  const MUTED  = [161, 161, 170];
  const OK     = [34,  197, 94 ];
  const DANGER = [239, 68,  68 ];
  const WARN   = [251, 146, 60 ];

  // ── helpers ──
  const bg     = c => doc.setFillColor(...c);
  const pen    = (c, w = 0.3) => { doc.setDrawColor(...c); doc.setLineWidth(w); };
  const color  = c => doc.setTextColor(...c);
  const bold   = s => { doc.setFont('helvetica', 'bold');   doc.setFontSize(s); };
  const normal = s => { doc.setFont('helvetica', 'normal'); doc.setFontSize(s); };

  function rrect(x, y, w, h, r, fill, stroke) {
    if (fill)   bg(fill);
    if (stroke) pen(stroke);
    doc.roundedRect(x, y, w, h, r, r, fill && stroke ? 'FD' : fill ? 'F' : 'D');
  }

  // ── fundo da página ──
  bg(BG); doc.rect(0, 0, W, H, 'F');

  // ── cabeçalho ──
  bg(BG2); doc.rect(0, 0, W, 46, 'F');
  bg(ACCENT); doc.rect(0, 0, W, 2.5, 'F');

  // ── logo ──
  let textX = M;
  try {
    const resp = await fetch('https://i.imgur.com/gNzlTGO.png');
    const blob = await resp.blob();
    const b64  = await new Promise(res => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.readAsDataURL(blob);
    });
    doc.addImage(b64, 'PNG', M, 10, 22, 22);
    textX = M + 27;
  } catch (_) {}

  bold(20); color(ACCENT);
  doc.text('SaldoMais', textX, 22);
  normal(8); color(MUTED);
  doc.text('Gastos claros, decisões inteligentes.', textX, 30);

  // ── título do relatório (direita) ──
  const [year, month] = o.mes_referencia.split('-');
  const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                 'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  bold(10); color(TEXT);
  doc.text('Relatório Mensal', W - M, 20, { align: 'right' });
  normal(9); color(MUTED);
  doc.text(`${MESES[+month - 1]} de ${year}`, W - M, 29, { align: 'right' });

  let y = 56;

  // ── dados ──
  const cats  = get(STORAGE.categorias);
  const lancs = get(STORAGE.lancamentos).filter(l => l.id_orcamento === o.id);
  const totalGasto    = lancs.reduce((s, l) => s + l.valor, 0);
  const totalRestante = o.valor_total - totalGasto;
  const pct = o.valor_total > 0 ? Math.min(totalGasto / o.valor_total, 1) : 0;

  // ── 3 cards de resumo ──
  const cW = (CW - 8) / 3, cH = 28;
  [
    { label: 'Orçamento Total', value: formatarMoeda(o.valor_total), c: TEXT  },
    { label: 'Total Gasto',     value: formatarMoeda(totalGasto),    c: WARN  },
    { label: totalRestante >= 0 ? 'Disponível' : 'Excedido',
      value: formatarMoeda(Math.abs(totalRestante)),
      c: totalRestante >= 0 ? OK : DANGER },
  ].forEach((s, i) => {
    const cx = M + i * (cW + 4);
    rrect(cx, y, cW, cH, 3, CARD, BORDER);
    normal(8); color(MUTED);
    doc.text(s.label, cx + cW / 2, y + 9, { align: 'center' });
    bold(12); color(s.c);
    doc.text(s.value, cx + cW / 2, y + 21, { align: 'center' });
  });

  y += cH + 10;

  // ── barra de progresso ──
  normal(8); color(MUTED);
  doc.text(`Utilizado: ${(pct * 100).toFixed(1)}%`, M, y);
  doc.text(`${formatarMoeda(totalGasto)} de ${formatarMoeda(o.valor_total)}`, W - M, y, { align: 'right' });
  y += 4;

  bg(CARD); doc.roundedRect(M, y, CW, 4.5, 2, 2, 'F');
  if (pct > 0.005) {
    const fillW  = CW * pct;
    const barClr = pct > 0.9 ? DANGER : pct > 0.7 ? WARN : OK;
    bg(barClr);
    doc.roundedRect(M, y, fillW, 4.5, Math.min(2, fillW / 2), Math.min(2, fillW / 2), 'F');
  }
  y += 13;

  // ── título de seção ──
  function sectionTitle(label) {
    bold(11); color(TEXT);
    doc.text(label, M, y);
    y += 3; pen(BORDER, 0.3);
    doc.line(M, y + 1, W - M, y + 1);
    y += 7;
  }

  // ── tabela: categorias ──
  sectionTitle('Categorias');

  const cc = [M, M+64, M+92, M+122, M+151];
  bg(CARD); doc.rect(M, y, CW, 8, 'F');
  ['Categoria','Meta','Alocado','Gasto','Disponível'].forEach((h, i) => {
    bold(7.5); color(MUTED);
    doc.text(h, i === 0 ? cc[0] + 7 : cc[i] + 11, y + 5.5, { align: i === 0 ? 'left' : 'center' });
  });
  y += 8;

  cats.forEach((cat, idx) => {
    const rH = 9;
    if (idx % 2 === 0) { bg(BG2); doc.rect(M, y, CW, rH, 'F'); }

    try {
      const h = cat.cor_hex || '#f59e0b';
      doc.setFillColor(parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16));
    } catch (_) { bg(ACCENT); }
    doc.circle(cc[0] + 3.5, y + 4.5, 1.8, 'F');

    const alocado    = o.valor_total * cat.percentual / 100;
    const gasto      = lancs.filter(l => l.id_categoria === cat.id).reduce((s, l) => s + l.valor, 0);
    const disponivel = alocado - gasto;

    normal(8.5); color(TEXT);
    doc.text(cat.nome.slice(0, 22), cc[0] + 8, y + 6);
    color(MUTED);
    doc.text(`${cat.percentual}%`, cc[1] + 11, y + 6, { align: 'center' });
    color(TEXT);
    doc.text(formatarMoeda(alocado),    cc[2] + 11, y + 6, { align: 'center' });
    color(gasto > alocado ? DANGER : WARN);
    doc.text(formatarMoeda(gasto),      cc[3] + 11, y + 6, { align: 'center' });
    color(disponivel >= 0 ? OK : DANGER);
    doc.text(formatarMoeda(disponivel), cc[4] + 11, y + 6, { align: 'center' });

    y += rH;
  });

  y += 10;

  // ── tabela: lançamentos ──
  if (lancs.length > 0) {
    if (y > H - 70) {
      doc.addPage();
      bg(BG); doc.rect(0, 0, W, H, 'F');
      y = 20;
    }

    sectionTitle('Lançamentos');

    const tc = [M, M+88, M+143];
    bg(CARD); doc.rect(M, y, CW, 8, 'F');
    bold(7.5); color(MUTED);
    doc.text('Descrição', tc[0] + 7,    y + 5.5);
    doc.text('Categoria', tc[1] + 27.5, y + 5.5, { align: 'center' });
    doc.text('Valor',     tc[2] + 15.5, y + 5.5, { align: 'center' });
    y += 8;

    const lancsOrdenados = [...lancs].sort((a, b) => {
      const ca = cats.find(c => c.id === a.id_categoria)?.nome || '';
      const cb = cats.find(c => c.id === b.id_categoria)?.nome || '';
      return ca.localeCompare(cb);
    });

    lancsOrdenados.forEach((l, idx) => {
      if (y > H - 26) {
        doc.addPage();
        bg(BG); doc.rect(0, 0, W, H, 'F');
        y = 20;
      }
      const rH = 8;
      if (idx % 2 === 0) { bg(BG2); doc.rect(M, y, CW, rH, 'F'); }

      const cat = cats.find(c => c.id === l.id_categoria);
      try {
        const h = cat?.cor_hex || '#f59e0b';
        doc.setFillColor(parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16));
      } catch (_) { bg(ACCENT); }
      doc.circle(tc[0] + 3.5, y + 4, 1.6, 'F');

      normal(8); color(TEXT);
      doc.text(l.descricao.slice(0, 38), tc[0] + 7, y + 5.5);
      color(MUTED);
      doc.text((cat?.nome || '–').slice(0, 20), tc[1] + 27.5, y + 5.5, { align: 'center' });
      color(WARN);
      doc.text(formatarMoeda(l.valor), tc[2] + 15.5, y + 5.5, { align: 'center' });

      y += rH;
    });

    // ── linha de total ──
    if (y > H - 14) {
      doc.addPage();
      bg(BG); doc.rect(0, 0, W, H, 'F');
      y = 20;
    }
    bg(CARD); doc.rect(M, y, CW, 9, 'F');
    bold(8.5); color(MUTED);
    doc.text(`Total  ·  ${lancs.length} lançamento${lancs.length !== 1 ? 's' : ''}`, tc[0] + 7, y + 6);
    bold(9); color(WARN);
    doc.text(formatarMoeda(totalGasto), tc[2] + 15.5, y + 6, { align: 'center' });
    y += 9;
  }

  // ── rodapé em todas as páginas ──
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    bg(BG2); doc.rect(0, H - 15, W, 15, 'F');
    bg(ACCENT); doc.rect(0, H - 15, W, 0.5, 'F');
    normal(7); color(MUTED);
    doc.text('Gerado por SaldoMais · Gastos claros, decisões inteligentes.', M, H - 6);
    const now = new Date();
    doc.text(
      `Exportado em ${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}`,
      W - M, H - 6, { align: 'right' }
    );
  }

  doc.save(`SaldoMais-${o.mes_referencia}.pdf`);
  notificar('✅ Relatório exportado com sucesso!');
}
