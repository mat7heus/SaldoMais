// ─── PDF HELPERS ──────────────────────────────────────────────────────────────

function pdfHelpers(doc){
  return {
    bg:     c => doc.setFillColor(...c),
    pen:    (c, w = 0.3) => { doc.setDrawColor(...c); doc.setLineWidth(w); },
    color:  c => doc.setTextColor(...c),
    bold:   s => { doc.setFont('helvetica', 'bold');   doc.setFontSize(s); },
    normal: s => { doc.setFont('helvetica', 'normal'); doc.setFontSize(s); },
    rrect(x, y, w, h, r, fill, stroke){
      if(fill)   this.bg(fill);
      if(stroke) this.pen(stroke);
      doc.roundedRect(x, y, w, h, r, r, fill && stroke ? 'FD' : fill ? 'F' : 'D');
    },
    hexToRgb: h => [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)],
  };
}

async function pdfCabecalho(doc, { W, M, o }){
  const { BG2, ACCENT, TEXT, MUTED } = PDF_COLORS;
  const h = pdfHelpers(doc);
  h.bg(BG2); doc.rect(0, 0, W, 46, 'F');
  h.bg(ACCENT); doc.rect(0, 0, W, 2.5, 'F');

  let textX = M;
  try {
    const resp = await fetch('https://i.imgur.com/gNzlTGO.png');
    const blob = await resp.blob();
    const b64  = await new Promise(res => {
      const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(blob);
    });
    doc.addImage(b64, 'PNG', M, 10, 22, 22);
    textX = M + 27;
  } catch (_) {}

  h.bold(20); h.color(ACCENT);
  doc.text('SaldoMais', textX, 22);
  h.normal(8); h.color(MUTED);
  doc.text('Gastos claros, decisões inteligentes.', textX, 30);

  const [year, month] = o.mes_referencia.split('-');
  h.bold(10); h.color(TEXT);
  doc.text('Relatório Mensal', W - M, 20, { align: 'right' });
  h.normal(9); h.color(MUTED);
  doc.text(`${MESES[+month - 1]} de ${year}`, W - M, 29, { align: 'right' });
}

function pdfCardsResumo(doc, { W, M, CW, o, totalGasto, totalRestante, pct, y }){
  const { CARD, BORDER, TEXT, MUTED, OK, DANGER, WARN } = PDF_COLORS;
  const h = pdfHelpers(doc);
  const cW = (CW - 8) / 3, cH = 28;

  [
    { label: 'Orçamento Total', value: formatarMoeda(o.valor_total), c: TEXT },
    { label: 'Total Gasto',     value: formatarMoeda(totalGasto),    c: WARN },
    { label: totalRestante >= 0 ? 'Disponível' : 'Excedido',
      value: formatarMoeda(Math.abs(totalRestante)), c: totalRestante >= 0 ? OK : DANGER },
  ].forEach((s, i) => {
    const cx = M + i * (cW + 4);
    h.rrect(cx, y, cW, cH, 3, CARD, BORDER);
    h.normal(8); h.color(MUTED); doc.text(s.label, cx + cW/2, y + 9,  { align: 'center' });
    h.bold(12);  h.color(s.c);   doc.text(s.value, cx + cW/2, y + 21, { align: 'center' });
  });
  y += cH + 10;

  h.normal(8); h.color(MUTED);
  doc.text(`Utilizado: ${(pct*100).toFixed(1)}%`, M, y);
  doc.text(`${formatarMoeda(totalGasto)} de ${formatarMoeda(o.valor_total)}`, W - M, y, { align: 'right' });
  y += 4;

  h.bg(CARD); doc.roundedRect(M, y, CW, 4.5, 2, 2, 'F');
  if(pct > 0.005){
    const fillW  = CW * pct;
    const barClr = pct > 0.9 ? DANGER : pct > 0.7 ? WARN : OK;
    h.bg(barClr);
    doc.roundedRect(M, y, fillW, 4.5, Math.min(2, fillW/2), Math.min(2, fillW/2), 'F');
  }
  return y + 13;
}

function pdfSectionTitle(doc, { W, M, label, y }){
  const { TEXT, BORDER } = PDF_COLORS;
  const h = pdfHelpers(doc);
  h.bold(11); h.color(TEXT); doc.text(label, M, y);
  y += 3; h.pen(BORDER, 0.3); doc.line(M, y+1, W-M, y+1);
  return y + 7;
}

function pdfTabelaCategorias(doc, { M, CW, cats, lancs, o, y }){
  const { BG2, CARD, ACCENT, TEXT, MUTED, OK, DANGER, WARN } = PDF_COLORS;
  const h = pdfHelpers(doc);
  const cc = [M, M+64, M+92, M+122, M+151];

  h.bg(CARD); doc.rect(M, y, CW, 8, 'F');
  ['Categoria','Meta','Alocado','Gasto','Disponível'].forEach((col, i) => {
    h.bold(7.5); h.color(MUTED);
    doc.text(col, i === 0 ? cc[0]+7 : cc[i]+11, y+5.5, { align: i === 0 ? 'left' : 'center' });
  });
  y += 8;

  cats.forEach((cat, idx) => {
    const rH = 9;
    if(idx % 2 === 0){ h.bg(BG2); doc.rect(M, y, CW, rH, 'F'); }
    try { doc.setFillColor(...h.hexToRgb(cat.cor_hex || '#f59e0b')); } catch(_){ h.bg(ACCENT); }
    doc.circle(cc[0]+3.5, y+4.5, 1.8, 'F');

    const alocado    = o.valor_total * cat.percentual / 100;
    const gasto      = lancs.filter(l => l.id_categoria === cat.id).reduce((s, l) => s + l.valor, 0);
    const disponivel = alocado - gasto;

    h.normal(8.5); h.color(TEXT);        doc.text(cat.nome.slice(0,22),        cc[0]+8,  y+6);
    h.color(MUTED);                       doc.text(`${cat.percentual}%`,        cc[1]+11, y+6, { align:'center' });
    h.color(TEXT);                        doc.text(formatarMoeda(alocado),      cc[2]+11, y+6, { align:'center' });
    h.color(gasto > alocado ? DANGER : WARN); doc.text(formatarMoeda(gasto),   cc[3]+11, y+6, { align:'center' });
    h.color(disponivel >= 0 ? OK : DANGER);   doc.text(formatarMoeda(disponivel), cc[4]+11, y+6, { align:'center' });
    y += rH;
  });
  return y + 10;
}

function pdfTabelaLancamentos(doc, { W, H, M, CW, cats, lancs, totalGasto, y }){
  const { BG, BG2, CARD, ACCENT, TEXT, MUTED, WARN } = PDF_COLORS;
  const h = pdfHelpers(doc);

  const newPage = () => {
    doc.addPage(); h.bg(BG); doc.rect(0, 0, W, H, 'F'); return 20;
  };

  if(y > H - 70) y = newPage();
  y = pdfSectionTitle(doc, { W, M, label: 'Lançamentos', y });

  const tc = [M, M+88, M+143];
  h.bg(CARD); doc.rect(M, y, CW, 8, 'F');
  h.bold(7.5); h.color(MUTED);
  doc.text('Descrição', tc[0]+7,    y+5.5);
  doc.text('Categoria', tc[1]+27.5, y+5.5, { align: 'center' });
  doc.text('Valor',     tc[2]+15.5, y+5.5, { align: 'center' });
  y += 8;

  const ordenados = [...lancs].sort((a, b) => {
    const ca = cats.find(c => c.id === a.id_categoria)?.nome || '';
    const cb = cats.find(c => c.id === b.id_categoria)?.nome || '';
    return ca.localeCompare(cb);
  });

  ordenados.forEach((l, idx) => {
    if(y > H - 26) y = newPage();
    const rH = 8;
    if(idx % 2 === 0){ h.bg(BG2); doc.rect(M, y, CW, rH, 'F'); }
    const cat = cats.find(c => c.id === l.id_categoria);
    try { doc.setFillColor(...h.hexToRgb(cat?.cor_hex || '#f59e0b')); } catch(_){ h.bg(ACCENT); }
    doc.circle(tc[0]+3.5, y+4, 1.6, 'F');
    h.normal(8); h.color(TEXT);  doc.text(l.descricao.slice(0,38),           tc[0]+7,    y+5.5);
    h.color(MUTED);              doc.text((cat?.nome||'–').slice(0,20),      tc[1]+27.5, y+5.5, { align:'center' });
    h.color(WARN);               doc.text(formatarMoeda(l.valor),            tc[2]+15.5, y+5.5, { align:'center' });
    y += rH;
  });

  if(y > H - 14) y = newPage();
  h.bg(CARD); doc.rect(M, y, CW, 9, 'F');
  h.bold(8.5); h.color(MUTED);
  doc.text(`Total  ·  ${lancs.length} lançamento${lancs.length !== 1 ? 's' : ''}`, tc[0]+7, y+6);
  h.bold(9); h.color(WARN);
  doc.text(formatarMoeda(totalGasto), tc[2]+15.5, y+6, { align:'center' });
  return y + 9;
}

function pdfRodape(doc, { W, H, M }){
  const { BG2, ACCENT, MUTED } = PDF_COLORS;
  const h = pdfHelpers(doc);
  const totalPages = doc.internal.getNumberOfPages();
  for(let p = 1; p <= totalPages; p++){
    doc.setPage(p);
    h.bg(BG2); doc.rect(0, H-15, W, 15, 'F');
    h.bg(ACCENT); doc.rect(0, H-15, W, 0.5, 'F');
    h.normal(7); h.color(MUTED);
    doc.text('Gerado por SaldoMais · Gastos claros, decisões inteligentes.', M, H-6);
    const now = new Date();
    doc.text(
      `Exportado em ${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}`,
      W-M, H-6, { align: 'right' }
    );
  }
}

// ─── PDF EXPORT ───────────────────────────────────────────────────────────────

async function exportarPDF() {
  const o = orcamentoAtual();
  if(!o || o.valor_total <= 0){ notificar('Defina um orçamento antes de exportar'); return; }
  if(!window.jspdf){ notificar('Biblioteca de PDF ainda carregando, tente novamente'); return; }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210, H = 297, M = 18, CW = 174;
  const { BG } = PDF_COLORS;

  // Fundo da página
  doc.setFillColor(...BG); doc.rect(0, 0, W, H, 'F');

  await pdfCabecalho(doc, { W, M, o });
  let y = 56;

  const cats          = get(STORAGE.categorias);
  const lancs         = get(STORAGE.lancamentos).filter(l => l.id_orcamento === o.id);
  const totalGasto    = lancs.reduce((s, l) => s + l.valor, 0);
  const totalRestante = o.valor_total - totalGasto;
  const pct           = o.valor_total > 0 ? Math.min(totalGasto / o.valor_total, 1) : 0;

  y = pdfCardsResumo(doc, { W, M, CW, o, totalGasto, totalRestante, pct, y });
  y = pdfSectionTitle(doc, { W, M, label: 'Categorias', y });
  y = pdfTabelaCategorias(doc, { W, H, M, CW, cats, lancs, o, y });

  if(lancs.length > 0)
    pdfTabelaLancamentos(doc, { W, H, M, CW, cats, lancs, totalGasto, y });

  pdfRodape(doc, { W, H, M });
  doc.save(`SaldoMais-${o.mes_referencia}.pdf`);
  notificar('✅ Relatório exportado com sucesso!');
}
