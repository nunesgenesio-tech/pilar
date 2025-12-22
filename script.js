// DADOS DE CONFIGURAÇÃO UNIFICADA
const DADOS_ASSINATURA = {
    assinatura_img: "assets/nadia/assinatura-n.png", 
    assinatura_nome: "GENÉSIO QUEIROGA",
    assinatura_oab: "OAB/PA 19.107-B",
};

const DADOS_EMPRESAS = {
    nadia: {
        nome_curto: "NadiaRural",
        logo_esq: "assets/nadia/logo-esq.png", 
        logo_dir: "assets/nadia/logo-dir.png", 
        texto_base: `
            <p><strong>NADIA RURAL LTDA</strong>, pessoa jurídica de Direito Privado, inscrita no CNPJ sob nº 01.542.004/0001-64, sediada Avenida Getúlio Vargas, 1892, Imperatriz - MA, por seu Diretor Administrativo <strong>ELIAS YUSUF NETO</strong>, vem por meio desta, <strong>NOTIFICAR</strong>:</p>
            <p><strong>{{Nome}}</strong>, inscrito(a) no CPF/CNPJ sob o nº <strong>{{CNPJ}}</strong> para pagamento de débito em aberto no importe de <strong>{{Valor}}</strong>.</p>
            <p>Se o pagamento já foi realizado, envie o comprovante para (94) 9 8137-0253 e desconsidere esta notificação. Caso contrário, manifeste-se em até 03 dias úteis para formalização de acordo amigável.</p>
            <p>A falta de manifestação resultará na adoção de medidas judiciais cabíveis.</p>`
    },
    inter: {
        nome_curto: "Inter",
        logo_esq: "assets/inter/logo-esq.png",
        logo_dir: "assets/inter/logo-dir.png",
        texto_base: `
            <p><strong>INTER SERVIÇOS FINANCEIROS LTDA</strong>, inscrita no CNPJ sob nº XX.XXX.XXX/XXXX-XX, por meio de sua Assessoria Jurídica, vem por meio desta, <strong>NOTIFICAR</strong>:</p>
            <p><strong>{{Nome}}</strong>, inscrito(a) no CPF/CNPJ sob o nº <strong>{{CNPJ}}</strong> para quitação de débito totalizando <strong>{{Valor}}</strong>.</p>
            <p>A regularização pode ser tratada via WhatsApp em horário comercial. O prazo para resposta é de 03 dias úteis antes do envio do processo para esfera judicial.</p>`
    },
    agrominas: {
        nome_curto: "Agrominas",
        logo_esq: "assets/agrominas/logo-esq.png",
        logo_dir: "assets/agrominas/logo-dir.png",
        texto_base: `
            <p><strong>AGROMINAS S/A</strong>, inscrita no CNPJ sob nº YY.YYY.YYY/YYYY-YY, por sua representante legal, vem por meio desta, <strong>NOTIFICAR</strong>:</p>
            <p><strong>{{Nome}}</strong>, inscrito(a) no CPF/CNPJ sob o nº <strong>{{CNPJ}}</strong> referente ao saldo devedor de insumos no valor de <strong>{{Valor}}</strong>.</p>
            <p>Solicitamos contato imediato no prazo de 03 dias úteis. A omissão implicará na execução judicial do título e protesto em cartório.</p>`
    }
};

let EMPRESA_SELECIONADA = null;
let modoEntrada = 'colar';

// INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', () => {
    adicionarLinhaManual();
    const tabs = document.querySelectorAll('button[data-bs-toggle="pill"]');
    tabs.forEach(tab => {
        tab.addEventListener('shown.bs.tab', (e) => {
            modoEntrada = e.target.id === 'aba-colar-tab' ? 'colar' : 'manual';
        });
    });
});

function selecionarEmpresa(empresa) {
    EMPRESA_SELECIONADA = empresa;
    document.getElementById('area-dados').style.display = 'block';
    document.getElementById('alerta-selecao').style.display = 'none';
    document.querySelectorAll('.btn-empresa').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.empresa === empresa);
    });
    carregarTemplate(DADOS_EMPRESAS[empresa]);
}

function carregarTemplate(dados) {
    document.getElementById('logo-print-esq').src = dados.logo_esq;
    document.getElementById('logo-print-dir').src = dados.logo_dir;
    document.getElementById('template-texto').innerHTML = dados.texto_base;
    document.getElementById('assinatura-nome-advogado').innerText = DADOS_ASSINATURA.assinatura_nome;
    document.getElementById('assinatura-oab').innerText = DADOS_ASSINATURA.assinatura_oab;
    document.getElementById('assinatura-img').src = DADOS_ASSINATURA.assinatura_img;
}

function adicionarLinhaManual() {
    const tbody = document.getElementById('corpoTabelaManual');
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td><input type="text" class="form-control form-control-sm m-nome" placeholder="Nome"></td>
        <td><input type="text" class="form-control form-control-sm m-doc" placeholder="CPF/CNPJ"></td>
        <td><input type="text" class="form-control form-control-sm m-valor" placeholder="Valor"></td>
        <td><button class="btn btn-link text-danger p-0" onclick="this.parentElement.parentElement.remove()">✕</button></td>`;
    tbody.appendChild(tr);
}

function configurarData() {
    const hoje = new Date();
    const dataFormatada = hoje.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
    document.getElementById('print-data').innerText = `Marabá, ${dataFormatada}`;
}

async function iniciarGeracao() {
    if (!EMPRESA_SELECIONADA) return alert("Selecione uma empresa!");
    
    let lista = [];
    if (modoEntrada === 'colar') {
        const dadosStr = document.getElementById('inputData').value.trim();
        if (!dadosStr) return alert("Cole os dados do Excel!");
        lista = dadosStr.split('\n').map(l => {
            const c = l.split('\t');
            return { nome: c[0], doc: c[1], valor: c[2] };
        });
    } else {
        document.querySelectorAll('#corpoTabelaManual tr').forEach(tr => {
            const nome = tr.querySelector('.m-nome').value.trim();
            if (nome) lista.push({ nome, doc: tr.querySelector('.m-doc').value, valor: tr.querySelector('.m-valor').value });
        });
        if (lista.length === 0) return alert("Preencha a tabela!");
    }

    configurarData();
    const btn = document.getElementById('btnGerar');
    const status = document.getElementById('status');
    btn.disabled = true;

    try {
        const zip = new JSZip();
        const dadosEmpresa = DADOS_EMPRESAS[EMPRESA_SELECIONADA];
        const pasta = zip.folder(`Notificacoes_${dadosEmpresa.nome_curto}`);
        const templateOriginal = document.getElementById('template-texto').innerHTML;

        for (const pessoa of lista) {
            if (!pessoa.nome || pessoa.nome.toUpperCase() === "NOME") continue;
            status.innerText = `Gerando: ${pessoa.nome}...`;
            
            document.getElementById('template-texto').innerHTML = templateOriginal
                .replace('{{Nome}}', pessoa.nome).replace('{{CNPJ}}', pessoa.doc).replace('{{Valor}}', pessoa.valor);

            const opt = {
                margin: 15,
                filename: 'doc.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            const pdfBlob = await html2pdf().set(opt).from(document.getElementById('documento-modelo')).output('blob');
            pasta.file(`Notificacao_${pessoa.nome.replace(/\s/g, '_')}.pdf`, pdfBlob);
        }

        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, `Notificacoes_${dadosEmpresa.nome_curto}.zip`);
        status.innerText = "Download concluído com sucesso!";
    } catch (e) {
        alert("Erro na geração: " + e.message);
    } finally {
        btn.disabled = false;
        document.getElementById('template-texto').innerHTML = DADOS_EMPRESAS[EMPRESA_SELECIONADA].texto_base;
    }
}
