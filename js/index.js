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
    criarCategorias();
    setupConfirmModal();
    setupButtons();
    navegar();
    atualizarDataMes();
    renderAll();
    renderDashboard();
  } catch (error) {
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
      const textoAtual=e.target.value.replace(/[^\d]/g,"");
      if(textoAtual){
        const numero=Number(textoAtual)/100;
        e.target.value=formatarMoeda(numero);
      }
    });
  }
  
  if(valorInput){
    valorInput.addEventListener("input",(e)=>{
      const textoAtual=e.target.value.replace(/[^\d]/g,"");
      if(textoAtual){
        const numero=Number(textoAtual)/100;
        e.target.value=formatarMoeda(numero);
      }
    });
  }
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

    set(STORAGE.orcamentos,lista);
    orcamentoInput.value=formatarMoeda(valor);
    mostrarLoading();
    renderAll();
    renderDashboard();
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
    loading.classList.remove("show");
  },1500);
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

  set(STORAGE.lancamentos,lanc);
  desc.value="";
  valorInput.value="";
  mostrarLoading();
  renderAll();
  renderDashboard();
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
        <div class="total-warning">⚠️ O total deve ser 100% para funcionar corretamente</div>
      ` : `
        <div class="total-success">✅ Distribuição completa e balanceada</div>
      `}
      <button onclick="salvarPercentuais()" class="btn-salvar-percentuais">💾 Salvar Percentuais</button>
    </div>
  </div>
  `;
  
  listaCategorias.innerHTML = html;
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
  
  set(STORAGE.categorias, novosCats);
  mostrarLoading();
  setTimeout(() => {
    notificar('✅ Percentuais salvos com sucesso!');
    renderCategorias();
  }, 500);
}

function renderLancamentos(){
  const o=orcamentoAtual();
  if(!o) return;

  const lancamentos=get(STORAGE.lancamentos)
    .filter(l=>l.id_orcamento===o.id);

  const cats = get(STORAGE.categorias);

  if(lancamentos.length === 0){
    listaLancamentos.innerHTML = '<div style="text-align:center;padding:30px;color:var(--muted);"><p>Nenhuma despesa registrada ainda</p></div>';
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
        <button onclick="deletarLancamento(${l.id})" class="lancamento-delete">❌</button>
      </div>
    `}).join("");
}

function renderDashboard(){
  const o=orcamentoAtual();
  if(!o || o.valor_total<=0) return;

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
      <span class="stat-label">💰 Total Disponível</span>
      <span class="stat-value">${formatarMoeda(o.valor_total)}</span>
      <span class="stat-subtitle">Seu orçamento do mês</span>
    </div>

    <div class="stat-card">
      <span class="stat-label">💸 Total Gasto</span>
      <span class="stat-value">${formatarMoeda(totalGasto)}</span>
      <div class="stat-bar">
        <div class="stat-bar-fill" style="width:${Math.min(percentualUsado, 100)}%"></div>
      </div>
      <span class="stat-subtitle">${percentualUsado.toFixed(1)}% do orçamento</span>
    </div>

    <div class="stat-card">
      <span class="stat-label">🎯 Disponível</span>
      <span class="stat-value" style="color:${totalRestante > 0 ? 'var(--ok)' : 'var(--danger)'}">
        ${formatarMoeda(totalRestante)}
      </span>
      <span class="stat-subtitle">${totalRestante > 0 ? 'Ainda pode gastar' : 'Orçamento ultrapassado'}</span>
    </div>

    ${categoriasAlert > 0 ? `
      <div class="stat-card" style="border-color:#fb923c40;background:rgba(251, 146, 60, 0.1);">
        <span class="stat-label">⚠️  Atenção</span>
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
            labels:{
              color:"#f5f5f5",
              font:{size:12},
              padding:15
            },
            position:"bottom"
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

    const lanc=get(STORAGE.lancamentos).filter(l=>l.id!==id);
    set(STORAGE.lancamentos,lanc);
    mostrarLoading();
    renderAll();
    renderDashboard();
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

    set(STORAGE.lancamentos,
      get(STORAGE.lancamentos).filter(l=>l.id_orcamento!==o.id)
    );

    let lista=get(STORAGE.orcamentos);
    const idx=lista.findIndex(x=>x.id===o.id);
    if(idx>=0){
      lista[idx].valor_total=0;
      set(STORAGE.orcamentos,lista);
    }

    mostrarLoading();
    renderAll();
    renderDashboard();
    notificar("Mês limpado com sucesso");
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
        <div class="total-warning">⚠️ O total deve ser 100%</div>
      ` : `
        <div class="total-success">✅ Distribuição perfeita!</div>
      `}
      <button onclick="salvarPercentuaisCategorias()" class="btn-salvar-percentuais">💾 Salvar Percentuais</button>
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
        <button onclick="abrirEditorCategoria(${c.id})" class="btn-editar-cat">✏️ Editar</button>
        <button onclick="deletarCategoriaConfirm(${c.id})" class="btn-deletar-cat">🗑️ Remover</button>
      </div>
    </div>
  `).join("");
  
  html += `
    </div>
  </div>
  `;
  
  categoriasListaEditor.innerHTML = html;
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
  
  set(STORAGE.categorias, cats);
  nomeInput.value = "";
  corInput.value = "#f59e0b";
  
  mostrarLoading();
  renderAll();
  renderCategoriasLista();
  renderDashboard();
  notificar("✅ Categoria criada com sucesso!");
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
  
  set(STORAGE.categorias, novosCats);
  mostrarLoading();
  setTimeout(() => {
    notificar('✅ Percentuais salvos com sucesso!');
    renderAll();
    renderCategoriasLista();
  }, 500);
}

function abrirEditorCategoria(catId){
  const cats = get(STORAGE.categorias);
  const cat = cats.find(c => c.id === catId);
  
  if(!cat) return;
  
  const novoNome = prompt(`Editar nome da categoria:\n\nNome atual: ${cat.nome}`, cat.nome);
  
  if(novoNome === null) return; // Cancelado
  
  const nomeAtualizado = novoNome.trim();
  
  if(!nomeAtualizado) {
    notificar("O nome não pode estar vazio");
    return;
  }
  
  if(nomeAtualizado.toLowerCase() === cat.nome.toLowerCase()) {
    return; // Sem mudanças
  }
  
  // Verificar se já existe categoria com esse nome
  if(cats.some(c => c.id !== catId && c.nome.toLowerCase() === nomeAtualizado.toLowerCase())) {
    notificar("Já existe uma categoria com este nome");
    return;
  }
  
  cat.nome = nomeAtualizado;
  set(STORAGE.categorias, cats);
  
  renderAll();
  renderCategoriasLista();
  renderDashboard();
  notificar("✅ Categoria atualizada!");
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
  
  set(STORAGE.categorias, cats);
  set(STORAGE.lancamentos, lanc);
  
  mostrarLoading();
  renderAll();
  renderCategoriasLista();
  renderDashboard();
  notificar("✅ Categoria removida!");
}