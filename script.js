// Dados das Empresas [Mantidos do seu código original]
const DADOS_ASSINATURA_UNIFICADA = {
    assinatura_img: "assets/nadia/assinatura-n.png",
    assinatura_nome: "GENÉSIO QUEIROGA",
    assinatura_oab: "OAB/PA 19.107-B",
};

const DADOS_EMPRESAS = {
    nadia: {
        nome_curto: "NadiaRural",
        logo_esq: "assets/nadia/logo-esq.png",
        logo_dir: "assets/nadia/logo-dir.png",
        ...DADOS_ASSINATURA_UNIFICADA,
        texto_base: `<p><strong>NADIA RURAL LTDA</strong>... [Texto omitido para brevidade]</p>`
    },
    inter: {
        nome_curto: "Inter",
        logo_esq: "assets/inter/logo-esq.png",
        logo_dir: "assets/inter/logo-dir.png",
        ...DADOS_ASSINATURA_UNIFICADA,
        texto_base: `<p><strong>INTER SERVIÇOS FINANCEIROS LTDA</strong>... [Texto omitido]</p>`
    },
    agrominas: {
        nome_curto: "Agrominas",
        logo_esq: "assets/agrominas/logo-esq.png",
        logo_dir: "assets/agrominas/logo-dir.png",
        ...DADOS_ASSINATURA_UNIFICADA,
        texto_base: `<p><strong>AGROMINAS S/A</strong>... [Texto omitido]</p>`
    }
};

let EMPRESA_SELECIONADA = null;
let MODO_ENTRADA = 'excel'; // 'excel' ou 'tela'

// --- FUNÇÕES DE INTERFACE ---

function selecionarEmpresa(empresa) {
    EMPRESA_SELECIONADA = empresa;
    document.getElementById('area-dados').style.display = 'block';
    document.getElementById('alerta-selecao').style.display = 'none';

    document.querySelectorAll('.btn-empresa').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.empresa === empresa) btn.classList.add('active');
    });

    carregarTemplate(DADOS_EMPRESAS[empresa]);
}

function alternarModo(modo) {
    MODO_ENTRADA = modo;
    document.getElementById('modo-excel').style.display = modo === 'excel' ? 'block' : 'none';
    document.getElementById('modo-tela').style.display = modo === 'tela' ? 'block' : 'none';
    
    document.getElementById('tab-excel').classList.toggle('active', modo === 'excel');
    document.getElementById('tab-tela').classList.toggle('active', modo === 'tela');
}

function carregarTemplate(dados) {
    document.getElementById('logo-print-esq').src = dados.logo_esq;
    document.getElementById('logo-print-dir').src = dados.logo_dir;
    document.getElementById('template-texto').innerHTML = dados.texto_base;
    document.getElementById('assinatura-nome-advogado').innerText = dados.assinatura_nome;
    document.getElementById('assinatura-oab').innerText = dados.assinatura_oab;
    const imgAssinatura = document.getElementById('assinatura-img');
    imgAssinatura.src = dados.assinatura_img || '';
    imgAssinatura.style.display = dados.assinatura_img ? 'block' : 'none';
}

// --- FUNÇÕES DA TABELA (MODO TELA) ---

function adicionarLinha() {
    const tbody = document.getElementById('tabela-corpo');
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td><input type="text" class="input-nome"></td>
        <td><input type="text" class="input-cnpj"></td>
        <td><input type="text" class="input-valor"></td>
        <td><button class="btn-remove" onclick="removerLinha(this)">×</button></td>
    `;
    tbody.appendChild(tr);
}

function removerLinha(btn) {
    const row = btn.parentNode.parentNode;
    if (document.querySelectorAll('#tabela-corpo tr').length > 1) {
        row.remove();
    }
}

// --- GERAÇÃO DOS PDFs ---

async function iniciarGeracao() {
    if (!EMPRESA_SELECIONADA) return alert("Selecione uma empresa.");

    const dadosProcessados = coletarDados();
    if (dadosProcessados.length === 0) return alert("Insira ao menos uma linha de dados.");

    const btn = document.getElementById('btnGerar');
    const status = document.getElementById('status');
    const dadosEmpresa = DADOS_EMPRESAS[EMPRESA_SELECIONADA];

    btn.disabled = true;
    btn.innerText = "Processando...";
    configurarData();

    try {
        const zip = new JSZip();
        const pasta = zip.folder(`Notificacoes_${dadosEmpresa.nome_curto}`);
        const templateTextoOriginal = document.getElementById('template-texto').innerHTML;
        const elemento = document.getElementById('documento-modelo');

        const opt = {
            margin: 15,
            filename: 'notificacao.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        for (const item of dadosProcessados) {
            status.innerText = `Gerando: ${item.nome}...`;
            status.className = "mt-3 text-center text-primary fw-bold";

            let htmlPreenchido = templateTextoOriginal
                .replace('{{Nome}}', item.nome)
                .replace('{{CNPJ}}', item.cnpj)
                .replace('{{Valor}}', item.valor);

            document.getElementById('template-texto').innerHTML = htmlPreenchido;
            const pdfBlob = await html2pdf().set(opt).from(elemento).output('blob');
            pasta.file(`Notificacao_${item.nome.replace(/[^a-z0-9]/gi, '_')}.pdf`, pdfBlob);
        }

        const content = await zip.generateAsync({type:"blob"});
        saveAs(content, `Notificacoes_${dadosEmpresa.nome_curto}.zip`);
        
        status.innerText = "Download concluído com sucesso!";
        status.className = "mt-3 text-center text-success fw-bold";
        btn.innerText = "Gerar Novamente";
        btn.disabled = false;
        document.getElementById('template-texto').innerHTML = templateTextoOriginal;

    } catch (erro) {
        console.error(erro);
        status.innerText = "Erro ao gerar arquivos.";
        status.className = "mt-3 text-center text-danger fw-bold";
        btn.disabled = false;
    }
}

function coletarDados() {
    let lista = [];
    if (MODO_ENTRADA === 'excel') {
        const raw = document.getElementById('inputDataExcel').value.trim();
        if (!raw) return [];
        raw.split('\n').forEach((linha, i) => {
            const cols = linha.split('\t');
            if (cols.length >= 3 && cols[0].toUpperCase() !== "NOME") {
                lista.push({ nome: cols[0].trim(), cnpj: cols[1].trim(), valor: cols[2].trim() });
            }
        });
    } else {
        document.querySelectorAll('#tabela-corpo tr').forEach(tr => {
            const nome = tr.querySelector('.input-nome').value.trim();
            const cnpj = tr.querySelector('.input-cnpj').value.trim();
            const valor = tr.querySelector('.input-valor').value.trim();
            if (nome && cnpj && valor) {
                lista.push({ nome, cnpj, valor });
            }
        });
    }
    return lista;
}

function configurarData() {
    const hoje = new Date();
    const dataFormatada = hoje.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById('print-data').innerText = `Marabá, ${dataFormatada}`;
}

window.onload = configurarData;
