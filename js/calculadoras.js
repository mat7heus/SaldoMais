// ─── CALC RESULT DISPLAY ─────────────────────────────────────────────────────

function mostrarResultado(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = '';
  el.classList.remove('show', 'hiding');
  void el.offsetWidth;
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

// ─── PURE MATH FUNCTIONS ─────────────────────────────────────────────────────

function parseBRCalc(str) {
  if (!str) return 0;
  str = String(str).trim().replace(/\s/g, '');
  if (str.includes(',')) {
    if (str.includes('.') && str.lastIndexOf('.') < str.lastIndexOf(','))
      str = str.replace(/\./g, '').replace(',', '.');
    else
      str = str.replace(',', '.');
  }
  return parseFloat(str.replace(/[^\d.\-]/g, '')) || 0;
}

function calcJurosCompostos(capital, aporte, taxaAnual, periodo){
  const taxa = Math.pow(1 + taxaAnual, 1/12) - 1;
  let saldo = capital, totalInvestido = capital;
  const linhas = [];
  for(let m = 1; m <= periodo; m++){
    const jurosMes = saldo * taxa;
    saldo = saldo * (1 + taxa) + aporte;
    totalInvestido += aporte;
    linhas.push({ mes: m, aporte, jurosMes, montante: saldo });
  }
  return { saldo, totalInvestido, totalJuros: saldo - totalInvestido, linhas };
}

function calcCDBCDI(valor, taxaCDI, percentual, prazo){
  const taxaEfetiva = (taxaCDI * percentual / 100) / 100;
  const taxaDiaria  = Math.pow(1 + taxaEfetiva, 1/252) - 1;
  const rendBruto   = valor * (Math.pow(1 + taxaDiaria, prazo) - 1);
  let aliquota;
  if     (prazo <= 180) aliquota = 0.225;
  else if(prazo <= 360) aliquota = 0.20;
  else if(prazo <= 720) aliquota = 0.175;
  else                  aliquota = 0.15;
  const ir       = rendBruto * aliquota;
  const valorLiq = valor + rendBruto - ir;
  return { rendBruto, ir, valorLiq, aliquota };
}

function calcAporteMeta(meta, prazo, taxaMensal){
  const fator        = Math.pow(1 + taxaMensal, prazo);
  const pmt          = meta * taxaMensal / (fator - 1);
  const totalAportado = pmt * prazo;
  return { pmt, totalAportado, totalJuros: meta - totalAportado };
}

function calcDividendYield(patrimonio, yieldAnual){
  const rendaAnual  = patrimonio * (yieldAnual / 100);
  const rendaMensal = rendaAnual / 12;
  return { rendaAnual, rendaMensal };
}

function calcFinanciamentoPrice(pv, taxaMensal, n){
  const parcela    = pv * taxaMensal / (1 - Math.pow(1 + taxaMensal, -n));
  const totalPago  = parcela * n;
  const totalJuros = totalPago - pv;
  const linhas     = [];
  let saldo = pv;
  for(let i = 1; i <= n; i++){
    const juros = saldo * taxaMensal;
    const amort = parcela - juros;
    saldo = Math.max(0, saldo - amort);
    linhas.push({ parcela: i, prestacao: parcela, amort, juros, saldo });
  }
  return { parcela, totalPago, totalJuros, linhas };
}

function calcRotativoCartao(divida, taxaMensal, pagamento){
  const jurosPrimeiro = divida * taxaMensal;
  if(pagamento <= jurosPrimeiro) return { impossivel: true, jurosPrimeiro };
  let saldo = divida, totalPago = 0, totalJuros = 0, meses = 0;
  const linhas = [], MAX = 1200;
  while(saldo > 0.005 && meses < MAX){
    meses++;
    const juros     = saldo * taxaMensal;
    const pag       = Math.min(pagamento, saldo + juros);
    const novoSaldo = Math.max(0, saldo + juros - pag);
    totalPago += pag; totalJuros += juros;
    if(linhas.length < 24) linhas.push({ mes: meses, saldo, juros, pag, novoSaldo });
    saldo = novoSaldo;
  }
  return { meses, totalPago, totalJuros, linhas, maxAtingido: meses >= MAX };
}

function calcAVistaVsParcelado(avista, parcelaValor, nParcelas, taxaMensal){
  const pvParcelas     = parcelaValor * (1 - Math.pow(1 + taxaMensal, -nParcelas)) / taxaMensal;
  const totalParcelado = parcelaValor * nParcelas;
  const parceladoMelhor = pvParcelas < avista;
  return { pvParcelas, totalParcelado, parceladoMelhor, diferenca: Math.abs(pvParcelas - avista) };
}

function calcQuitarDivida(saldo, taxaDivida, parcelas, desconto, disponivel, taxaInvest){
  const saldoDesconto = saldo * (1 - desconto / 100);
  const pmtOriginal   = saldo * taxaDivida / (1 - Math.pow(1 + taxaDivida, -parcelas));
  const totalOriginal = pmtOriginal * parcelas;
  const rendimentoPerdido = disponivel * (Math.pow(1 + taxaInvest, parcelas) - 1);
  let economia, cenario, infoCenario;
  if(disponivel >= saldoDesconto){
    cenario     = 'A';
    economia    = totalOriginal - saldoDesconto;
    infoCenario = 'Quitação total possível';
  } else {
    cenario     = 'B';
    const novoSaldo    = saldoDesconto - disponivel;
    const pmtNovo      = novoSaldo * taxaDivida / (1 - Math.pow(1 + taxaDivida, -parcelas));
    const totalNovo    = pmtNovo * parcelas;
    economia    = totalOriginal - (disponivel + totalNovo);
    infoCenario = `Quitação parcial — novo saldo de ${formatarMoeda(novoSaldo)} em ${parcelas} parcelas`;
  }
  return {
    saldoDesconto, economia, rendimentoPerdido, cenario, infoCenario,
    diferenca: Math.abs(economia - rendimentoPerdido),
    quitarMelhor: economia > rendimentoPerdido
  };
}

// ─── CALCULADORAS — UI ────────────────────────────────────────────────────────

function calcularJurosCompostos() {
  const capital   = parseBRCalc(document.getElementById('jc-capital').value);
  const aporte    = parseBRCalc(document.getElementById('jc-aporte').value) || 0;
  const taxaAnual = parseBRCalc(document.getElementById('jc-taxa').value) / 100;
  const periodo   = parseInt(document.getElementById('jc-periodo').value) || 0;

  if(capital   <= 0) { notificar('Digite um capital inicial válido'); return; }
  if(taxaAnual <= 0) { notificar('Digite uma taxa de juros válida');  return; }
  if(periodo   <  1) { notificar('Digite um período válido (mín. 1 mês)'); return; }

  const r = calcJurosCompostos(capital, aporte, taxaAnual, periodo);

  document.getElementById('jc-cards').innerHTML = `
    <div class="calc-stat">
      <span class="calc-stat-label">Montante Final</span>
      <span class="calc-stat-value">${formatarMoeda(r.saldo)}</span>
    </div>
    <div class="calc-stat">
      <span class="calc-stat-label">Total Investido</span>
      <span class="calc-stat-value">${formatarMoeda(r.totalInvestido)}</span>
    </div>
    <div class="calc-stat">
      <span class="calc-stat-label">Total em Juros</span>
      <span class="calc-stat-value" style="color:var(--accent)">${formatarMoeda(r.totalJuros)}</span>
    </div>`;

  document.getElementById('jc-tabela').innerHTML = `
    <thead><tr><th>Mês</th><th>Aporte</th><th>Juros do Mês</th><th>Montante Acum.</th></tr></thead>
    <tbody>${r.linhas.map(l => `
      <tr>
        <td>${l.mes}</td>
        <td>${formatarMoeda(l.aporte)}</td>
        <td>${formatarMoeda(l.jurosMes)}</td>
        <td>${formatarMoeda(l.montante)}</td>
      </tr>`).join('')}
    </tbody>`;

  mostrarResultado('jc-resultado');
  if(window.lucide) lucide.createIcons();
}

function calcularCDBCDI() {
  const valor      = parseBRCalc(document.getElementById('cdi-valor').value);
  const taxaCDI    = parseBRCalc(document.getElementById('cdi-taxa').value);
  const percentual = parseBRCalc(document.getElementById('cdi-percentual').value);
  const prazo      = parseInt(document.getElementById('cdi-prazo').value) || 0;

  if(valor      <= 0) { notificar('Digite um valor investido válido');    return; }
  if(taxaCDI    <= 0) { notificar('Digite a taxa do CDI válida');         return; }
  if(percentual <= 0) { notificar('Digite o percentual do CDI válido');   return; }
  if(prazo      <  1) { notificar('Digite um prazo válido (mín. 1 dia)'); return; }

  const r = calcCDBCDI(valor, taxaCDI, percentual, prazo);

  document.getElementById('cdi-cards').innerHTML = `
    <div class="calc-stat">
      <span class="calc-stat-label">Rendimento Bruto</span>
      <span class="calc-stat-value">${formatarMoeda(r.rendBruto)}</span>
    </div>
    <div class="calc-stat">
      <span class="calc-stat-label">IR Descontado (${(r.aliquota*100).toFixed(1)}%)</span>
      <span class="calc-stat-value" style="color:var(--danger)">${formatarMoeda(r.ir)}</span>
    </div>
    <div class="calc-stat">
      <span class="calc-stat-label">Valor Líquido Final</span>
      <span class="calc-stat-value" style="color:var(--ok)">${formatarMoeda(r.valorLiq)}</span>
    </div>`;

  document.getElementById('cdi-ir-info').innerHTML = `
    <div class="calc-alert calc-alert-ok" style="margin-top:12px;">
      <i data-lucide="info" size="16"></i>
      IR de ${(r.aliquota*100).toFixed(1)}% aplicado (${prazo} dias).
      Tabela: ≤180d → 22,5% | ≤360d → 20% | ≤720d → 17,5% | &gt;720d → 15%
    </div>`;

  mostrarResultado('cdi-resultado');
  if(window.lucide) lucide.createIcons();
}

function calcularAporteMeta() {
  const meta  = parseBRCalc(document.getElementById('meta-valor').value);
  const prazo = parseInt(document.getElementById('meta-prazo').value) || 0;
  const taxa  = parseBRCalc(document.getElementById('meta-taxa').value) / 100;

  if(meta  <= 0) { notificar('Digite um valor de meta válido');       return; }
  if(prazo <  1) { notificar('Digite um prazo válido (mín. 1 mês)'); return; }
  if(taxa  <= 0) { notificar('Digite uma taxa de juros válida');      return; }

  const r = calcAporteMeta(meta, prazo, taxa);

  document.getElementById('meta-cards').innerHTML = `
    <div class="calc-stat">
      <span class="calc-stat-label">Aporte Mensal Necessário</span>
      <span class="calc-stat-value" style="color:var(--accent)">${formatarMoeda(r.pmt)}</span>
    </div>
    <div class="calc-stat">
      <span class="calc-stat-label">Total Aportado</span>
      <span class="calc-stat-value">${formatarMoeda(r.totalAportado)}</span>
    </div>
    <div class="calc-stat">
      <span class="calc-stat-label">Gerado em Juros</span>
      <span class="calc-stat-value" style="color:var(--ok)">${formatarMoeda(r.totalJuros)}</span>
    </div>`;

  mostrarResultado('meta-resultado');
  if(window.lucide) lucide.createIcons();
}

function calcularDividendYield() {
  const patrimonio = parseBRCalc(document.getElementById('dy-patrimonio').value);
  const yieldAnual = parseBRCalc(document.getElementById('dy-yield').value);

  if(patrimonio <= 0) { notificar('Digite um patrimônio válido');     return; }
  if(yieldAnual <= 0) { notificar('Digite um dividend yield válido'); return; }

  const r = calcDividendYield(patrimonio, yieldAnual);

  document.getElementById('dy-cards').innerHTML = `
    <div class="calc-stat">
      <span class="calc-stat-label">Renda Mensal Estimada</span>
      <span class="calc-stat-value" style="color:var(--accent)">${formatarMoeda(r.rendaMensal)}</span>
    </div>
    <div class="calc-stat">
      <span class="calc-stat-label">Renda Anual Estimada</span>
      <span class="calc-stat-value">${formatarMoeda(r.rendaAnual)}</span>
    </div>`;

  mostrarResultado('dy-resultado');
  if(window.lucide) lucide.createIcons();
}

function calcularFinanciamentoPrice() {
  const pv   = parseBRCalc(document.getElementById('price-valor').value);
  const taxa = parseBRCalc(document.getElementById('price-taxa').value) / 100;
  const n    = parseInt(document.getElementById('price-parcelas').value) || 0;

  if(pv   <= 0) { notificar('Digite um valor financiado válido');    return; }
  if(taxa <= 0) { notificar('Digite uma taxa de juros válida');       return; }
  if(n    <  1) { notificar('Digite o número de parcelas (mín. 1)'); return; }

  const r = calcFinanciamentoPrice(pv, taxa, n);

  document.getElementById('price-cards').innerHTML = `
    <div class="calc-stat">
      <span class="calc-stat-label">Valor da Parcela</span>
      <span class="calc-stat-value">${formatarMoeda(r.parcela)}</span>
    </div>
    <div class="calc-stat">
      <span class="calc-stat-label">Total Pago</span>
      <span class="calc-stat-value">${formatarMoeda(r.totalPago)}</span>
    </div>
    <div class="calc-stat">
      <span class="calc-stat-label">Total de Juros</span>
      <span class="calc-stat-value" style="color:var(--danger)">${formatarMoeda(r.totalJuros)}</span>
    </div>`;

  document.getElementById('price-tabela').innerHTML = `
    <thead><tr><th>Parcela</th><th>Prestação</th><th>Amortização</th><th>Juros</th><th>Saldo Dev.</th></tr></thead>
    <tbody>${r.linhas.map(l => `
      <tr>
        <td>${l.parcela}</td>
        <td>${formatarMoeda(l.prestacao)}</td>
        <td>${formatarMoeda(l.amort)}</td>
        <td>${formatarMoeda(l.juros)}</td>
        <td>${formatarMoeda(l.saldo)}</td>
      </tr>`).join('')}
    </tbody>`;

  mostrarResultado('price-resultado');
  if(window.lucide) lucide.createIcons();
}

function calcularRotativoCartao() {
  const divida    = parseBRCalc(document.getElementById('rot-divida').value);
  const taxa      = parseBRCalc(document.getElementById('rot-taxa').value) / 100;
  const pagamento = parseBRCalc(document.getElementById('rot-minimo').value);

  if(divida    <= 0) { notificar('Digite uma dívida válida');                   return; }
  if(taxa      <= 0) { notificar('Digite uma taxa de juros válida');             return; }
  if(pagamento <= 0) { notificar('Digite um valor de pagamento mensal válido'); return; }

  const r = calcRotativoCartao(divida, taxa, pagamento);

  if(r.impossivel){
    document.getElementById('rot-alerta').innerHTML = `
      <div class="calc-alert calc-alert-danger">
        <i data-lucide="alert-triangle" size="16"></i>
        Seu pagamento (${formatarMoeda(pagamento)}) é menor ou igual aos juros do 1º mês
        (${formatarMoeda(r.jurosPrimeiro)}). A dívida nunca será quitada!
      </div>`;
    document.getElementById('rot-cards').innerHTML  = '';
    document.getElementById('rot-tabela').innerHTML = '';
    mostrarResultado('rot-resultado');
    if(window.lucide) lucide.createIcons();
    return;
  }

  document.getElementById('rot-alerta').innerHTML = '';
  document.getElementById('rot-cards').innerHTML  = `
    <div class="calc-stat">
      <span class="calc-stat-label">Meses para Quitar</span>
      <span class="calc-stat-value">${r.maxAtingido ? '&gt; 1200' : r.meses}</span>
    </div>
    <div class="calc-stat">
      <span class="calc-stat-label">Total Pago</span>
      <span class="calc-stat-value">${formatarMoeda(r.totalPago)}</span>
    </div>
    <div class="calc-stat">
      <span class="calc-stat-label">Total em Juros</span>
      <span class="calc-stat-value" style="color:var(--danger)">${formatarMoeda(r.totalJuros)}</span>
    </div>`;

  document.getElementById('rot-tabela').innerHTML = `
    <thead><tr><th>Mês</th><th>Saldo Dev.</th><th>Juros</th><th>Pagamento</th><th>Novo Saldo</th></tr></thead>
    <tbody>${r.linhas.map(l => `
      <tr>
        <td>${l.mes}</td>
        <td>${formatarMoeda(l.saldo)}</td>
        <td>${formatarMoeda(l.juros)}</td>
        <td>${formatarMoeda(l.pag)}</td>
        <td>${formatarMoeda(l.novoSaldo)}</td>
      </tr>`).join('')}
    </tbody>`;

  mostrarResultado('rot-resultado');
  if(window.lucide) lucide.createIcons();
}

function calcularAVistaVsParcelado() {
  const avista       = parseBRCalc(document.getElementById('avp-vista').value);
  const parcelaValor = parseBRCalc(document.getElementById('avp-parcelas-valor').value);
  const nParcelas    = parseInt(document.getElementById('avp-n-parcelas').value) || 0;
  const taxa         = parseBRCalc(document.getElementById('avp-rendimento').value) / 100;

  if(avista       <= 0) { notificar('Digite o preço à vista válido');              return; }
  if(parcelaValor <= 0) { notificar('Digite o valor de cada parcela válido');      return; }
  if(nParcelas    <  2) { notificar('Digite o número de parcelas (mín. 2)');       return; }
  if(taxa         <= 0) { notificar('Digite a taxa mensal do investimento válida'); return; }

  const r = calcAVistaVsParcelado(avista, parcelaValor, nParcelas, taxa);

  document.getElementById('avp-conclusao').innerHTML = r.parceladoMelhor ? `
    <div class="calc-alert calc-alert-ok">
      <i data-lucide="trending-up" size="16"></i>
      <strong>Parcelado é mais vantajoso</strong> — diferença de ${formatarMoeda(r.diferenca)} em valor presente.
    </div>
    <div class="calc-conclusion">
      O valor presente das ${nParcelas} parcelas (${formatarMoeda(r.pvParcelas)}) é menor que o
      preço à vista (${formatarMoeda(avista)}). Parcelando, você mantém o capital investido
      a ${(taxa*100).toFixed(2)}% ao mês — o rendimento compensa o custo total de ${formatarMoeda(r.totalParcelado)}.
    </div>` : `
    <div class="calc-alert calc-alert-danger">
      <i data-lucide="trending-down" size="16"></i>
      <strong>À vista é mais vantajoso</strong> — economia de ${formatarMoeda(r.diferenca)} em valor presente.
    </div>
    <div class="calc-conclusion">
      O valor presente das ${nParcelas} parcelas (${formatarMoeda(r.pvParcelas)}) supera o
      preço à vista (${formatarMoeda(avista)}). Mesmo investindo o dinheiro a
      ${(taxa*100).toFixed(2)}% ao mês, as parcelas custam mais. Pagar à vista economiza ${formatarMoeda(r.diferenca)}.
    </div>`;

  mostrarResultado('avp-resultado');
  if(window.lucide) lucide.createIcons();
}

function calcularQuitarDivida() {
  const saldo      = parseBRCalc(document.getElementById('qd-saldo').value);
  const taxaDivida = parseBRCalc(document.getElementById('qd-taxa-divida').value) / 100;
  const parcelas   = parseInt(document.getElementById('qd-parcelas').value) || 0;
  const desconto   = parseBRCalc(document.getElementById('qd-desconto').value) || 0;
  const disponivel = parseBRCalc(document.getElementById('qd-disponivel').value);
  const taxaInvest = parseBRCalc(document.getElementById('qd-taxa-invest').value) / 100;

  if(saldo      <= 0) { notificar('Digite o saldo devedor válido');                return; }
  if(taxaDivida <= 0) { notificar('Digite a taxa de juros da dívida válida');      return; }
  if(parcelas   <  1) { notificar('Digite o número de parcelas restantes');        return; }
  if(disponivel <= 0) { notificar('Digite o valor disponível para quitar válido'); return; }
  if(taxaInvest <= 0) { notificar('Digite a taxa mensal do investimento válida');  return; }

  const r = calcQuitarDivida(saldo, taxaDivida, parcelas, desconto, disponivel, taxaInvest);

  document.getElementById('qd-cards').innerHTML = `
    <div class="calc-stat">
      <span class="calc-stat-label">Saldo com Desconto</span>
      <span class="calc-stat-value">${formatarMoeda(r.saldoDesconto)}</span>
    </div>
    <div class="calc-stat">
      <span class="calc-stat-label">Economia ao Quitar</span>
      <span class="calc-stat-value" style="color:var(--ok)">${formatarMoeda(r.economia)}</span>
    </div>
    <div class="calc-stat">
      <span class="calc-stat-label">Rendimento Investido</span>
      <span class="calc-stat-value" style="color:var(--accent)">${formatarMoeda(r.rendimentoPerdido)}</span>
    </div>
    <div class="calc-stat">
      <span class="calc-stat-label">Diferença</span>
      <span class="calc-stat-value">${formatarMoeda(r.diferenca)}</span>
    </div>`;

  document.getElementById('qd-cenario').innerHTML = `
    <div style="font-size:12px;color:var(--muted);margin-bottom:12px;padding:8px 12px;background:rgba(255,255,255,0.03);border-radius:8px;border:1px solid var(--border);">
      <strong>Cenário ${r.cenario}:</strong> ${r.infoCenario}
    </div>`;

  document.getElementById('qd-recomendacao').innerHTML = r.quitarMelhor ? `
    <div class="calc-alert calc-alert-ok">
      <i data-lucide="check-circle" size="16"></i>
      <div>
        <strong>Quite a dívida e economize ${formatarMoeda(r.diferenca)}</strong><br>
        <span style="font-weight:400;font-size:12px;">A economia de ${formatarMoeda(r.economia)} supera o rendimento de ${formatarMoeda(r.rendimentoPerdido)} que o dinheiro geraria investido.</span>
      </div>
    </div>` : `
    <div class="calc-alert calc-alert-danger">
      <i data-lucide="x-circle" size="16"></i>
      <div>
        <strong>Mantenha investido e ganhe ${formatarMoeda(r.diferenca)} a mais</strong><br>
        <span style="font-weight:400;font-size:12px;">O rendimento de ${formatarMoeda(r.rendimentoPerdido)} supera a economia de ${formatarMoeda(r.economia)} obtida quitando agora.</span>
      </div>
    </div>`;

  mostrarResultado('qd-resultado');
  if(window.lucide) lucide.createIcons();
}

// ─── KEYBOARD SHORTCUTS ──────────────────────────────────────────────────────

// Enter nos inputs das calculadoras dispara o cálculo correspondente
document.addEventListener('keydown', function(e) {
  if (e.key !== 'Enter' || !e.target.matches('input, select')) return;
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
    if (card.querySelector('#' + inputId)) { e.preventDefault(); fn(); return; }
  }
});
