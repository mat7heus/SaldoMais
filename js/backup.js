// ─── BACKUP ───────────────────────────────────────────────────────────────────

function exportarBackup() {
  const data = {
    _versao: 2,
    _exportado_em: new Date().toISOString(),
    categorias:  get(STORAGE.categorias),
    orcamentos:  get(STORAGE.orcamentos),
    lancamentos: get(STORAGE.lancamentos),
    receitas:    get(STORAGE.receitas),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), {
    href: url,
    download: `SaldoMais-backup-${new Date().toISOString().slice(0, 10)}.json`
  });
  a.click();
  URL.revokeObjectURL(url);
  notificar('Backup exportado com sucesso!');
}

function importarBackup(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(ev) {
    try {
      const data = JSON.parse(ev.target.result);
      if (!data.categorias || !data.orcamentos || !data.lancamentos) {
        notificar('Arquivo inválido — formato não reconhecido'); return;
      }
      set(STORAGE.categorias,  data.categorias);
      set(STORAGE.orcamentos,  data.orcamentos);
      set(STORAGE.lancamentos, data.lancamentos);
      if(data.receitas) set(STORAGE.receitas, data.receitas);
      renderComplete();
      notificar('Backup restaurado com sucesso!');
    } catch (_) {
      notificar('Erro ao ler o arquivo. Verifique se é um backup válido.');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}
