// ===========================================
// 1. DADOS E CONFIGURAÇÃO
// ===========================================

const DADOS_ASSINATURA_UNIFICADA = {
    assinatura_img: "assets/nadia/assinatura-n.png", 
    assinatura_nome: "GENÉSIO QUEIROGA",
    assinatura_oab: "OAB/PA 19.107-B",
}

const DADOS_EMPRESAS = {
    nadia: {
        nome_curto: "NadiaRural",
        logo_esq: "assets/nadia/logo-esq.png", 
        logo_dir: "assets/nadia/logo-dir.png", 
        ...DADOS_ASSINATURA_UNIFICADA,
        texto_base: `
            <p><strong>NADIA RURAL LTDA</strong>, inscrita no CNPJ sob nº 01.542.004/0001-64, por seu Diretor Administrativo <strong>ELIAS YUSUF NETO</strong>, vem por meio desta, <strong>NOTIFICAR</strong>:</p>
            <p><strong>{{Nome}}</strong>, inscrito(a) no CPF/CNPJ sob o nº <strong>{{CNPJ}}</strong> para pagamento de débito no importe de <strong>{{Valor}}</strong>.</p>
            <p>Manifeste-se em até 03 dias úteis para formalização de acordo amigável.</p>`
    },
    inter: {
        nome_curto: "Inter",
        logo_esq: "assets/inter/logo-esq.png",
        logo_dir: "assets/inter/logo-dir.png",
        ...DADOS_ASSINATURA_UNIFICADA,
        texto_base: `<p><strong>INTER SERVIÇOS FINANCEIROS LTDA</strong> vem por meio desta, <strong>NOTIFICAR</strong>:</p>
            <p><strong>{{Nome}}</strong>, portador do CPF/CNPJ nº <strong>{{CNPJ}}</strong> para pagamento do valor de <strong>{{Valor}}</strong>.</p>`
    },
    agrominas: {
        nome_curto: "Agrominas",
        logo_esq: "assets/agrominas/logo-esq.png",
        logo_dir: "assets/agrominas/logo-dir.png",
        ...DADOS_ASSINATURA_UNIFICADA,
        texto_base: `<p><strong>AGROMINAS S/A</strong> vem por meio desta, <strong>NOTIFICAR</strong>:</p>
            <p><strong>{{Nome}}</strong>, portador do CPF/CNPJ nº <strong>{{CNPJ}}</strong> para quitação de <strong>{{Valor}}</strong>.</p>`
    }
};

let EMPRESA_SELECIONADA = null;

// ===========================================
// 2. FUNÇÕES DE INTERFACE
// ===========================================

function adicionarLinhaManual() {
    const corpo = document.getElementById('corpo-tabela-manual');
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td><input type="text" placeholder="Nome do Cliente" class="input-nome"></td>
        <td><input type="text" placeholder="CPF/CNPJ" class="input-doc"></td>
        <td><input type="text" placeholder="R$ 0,00" class="input-valor"></td>
        <td class="text-center"><span class="btn-remove" onclick="this.parentElement.parentElement.remove()">✕</span></td>
    `;
    corpo.appendChild(tr);
}

function selecionarEmpresa(empresa) {
    EMPRESA_SELECIONADA = empresa;
    document.getElementById('area-dados').style.display = 'block';
    document.getElementById('alerta-selecao').style.display = 'none';
    document.querySelectorAll('.btn-empresa').forEach(btn => btn.classList.toggle('active', btn.dataset.empresa === empresa));
    carregarTemplate(DADOS_EMPRESAS[empresa]);
}

function carregarTemplate(dados) {
    document.getElementById('logo-print-esq').src = dados.logo_esq;
    document.getElementById('logo-print-dir').src = dados.logo_dir;
    document.getElementById('template-texto').innerHTML = dados.texto_base;
    document.getElementById('assinatura-nome-advogado').innerText = dados.assinatura_nome;
    document.getElementById('assinatura-oab').innerText = dados.assinatura_oab;
    document.getElementById('assinatura-img').src = dados.assinatura_img;
}

function configurarData() {
    const hoje = new Date();
    const dataFormatada = hoje.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById('print-data').innerText = `Marabá, ${dataFormatada}`;
}

// ===========================================
// 3. LÓGICA DE COLETA E GERAÇÃO
// ===========================================

async function iniciarGeracao() {
    if (!EMPRESA_SELECIONADA) return alert("Selecione uma empresa!");

    const btn = document.getElementById('btnGerar');
    const status = document.getElementById('status');
    const abaAtiva = document.querySelector('#dadosTab .active').id;
    
    let dadosParaProcessar = [];

    // Coleta os dados dependendo da aba ativa
    if (abaAtiva === 'colar-tab') {
        const raw = document.getElementById('inputData').value.trim();
        if (!raw) return alert("Cole os dados!");
        raw.split('\n').forEach((linha, i) => {
            const cols = linha.split('\t');
            if (i === 0 && cols[0].toUpperCase() === "NOME") return;
            if (cols.length >= 3) dadosParaProcessar.push({ nome: cols[0], doc: cols[1], valor: cols[2] });
        });
    } else {
        const linhasTabela = document.querySelectorAll('#corpo-tabela-manual tr');
        linhasTabela.forEach(tr => {
            const nome = tr.querySelector('.input-nome').value.trim();
            const doc = tr.querySelector('.input-doc').value.trim();
            const valor = tr.querySelector('.input-valor').value.trim();
            if (nome && doc && valor) dadosParaProcessar.push({ nome, doc, valor });
        });
    }

    if (dadosParaProcessar.length === 0) return alert("Nenhum dado válido encontrado.");

    configurarData();
    btn.disabled = true;
    btn.innerText = "Processando...";

    try {
        const zip = new JSZip();
        const dadosEmpresa = DADOS_EMPRESAS[EMPRESA_SELECIONADA];
        const pasta = zip.folder(`Notificacoes_${dadosEmpresa.nome_curto}`);
        const templateTextoOriginal = document.getElementById('template-texto').innerHTML;
        const elemento = document.getElementById('documento-modelo');

        for (const item of dadosParaProcessar) {
            status.innerText = `Gerando: ${item.nome}...`;
            
            document.getElementById('template-texto').innerHTML = templateTextoOriginal
                .replace('{{Nome}}', item.nome)
                .replace('{{CNPJ}}', item.doc)
                .replace('{{Valor}}', item.valor);

            const opt = {
                margin: 15,
                filename: 'arquivo.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            const pdfBlob = await html2pdf().set(opt).from(elemento).output('blob');
            pasta.file(`Notificacao_${item.nome.replace(/[^a-z0-9]/gi, '_')}.pdf`, pdfBlob);
        }

        const content = await zip.generateAsync({type:"blob"});
        saveAs(content, `Notificacoes_${dadosEmpresa.nome_curto}.zip`);
        
        status.innerText = "Sucesso! Download iniciado.";
        document.getElementById('template-texto').innerHTML = templateTextoOriginal;
    } catch (err) {
        alert("Erro: " + err.message);
    } finally {
        btn.disabled = false;
        btn.innerText = "Gerar PDFs e Baixar ZIP";
    }
}

// Inicia com uma linha manual pronta
window.onload = () => {
    configurarData();
    adicionarLinhaManual();
};
