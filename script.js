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
        texto_base: `
            <p><strong>NADIA RURAL LTDA</strong>, inscrita no CNPJ sob nº 01.542.004/0001-64, sediada Avenida Getúlio Vargas, 1892, por seu Diretor Administrativo <strong>ELIAS YUSUF NETO</strong>, vem por meio desta, <strong>NOTIFICAR</strong>:</p>
            <p><strong>{{Nome}}</strong>, inscrito no CPF/CNPJ sob o nº <strong>{{CNPJ}}</strong> para pagamento de débito em aberto, totalizando o importe de <strong>{{Valor}}</strong>.</p>
            <p>Se já realizou o pagamento, envie o comprovante para (94) 9 8137-0253. Caso contrário, manifeste-se em até 03 dias úteis para evitar medidas judiciais.</p>`
    },
    inter: {
        nome_curto: "Inter",
        logo_esq: "assets/inter/logo-esq.png",
        logo_dir: "assets/inter/logo-dir.png",
        ...DADOS_ASSINATURA_UNIFICADA,
        texto_base: `
            <p><strong>INTER SERVIÇOS FINANCEIROS LTDA</strong>, por meio de sua Assessoria Jurídica, vem por meio desta, <strong>NOTIFICAR</strong>:</p>
            <p><strong>{{Nome}}</strong>, portador do CPF/CNPJ <strong>{{CNPJ}}</strong> para regularização de débito no valor de <strong>{{Valor}}</strong>.</p>
            <p>O não pagamento no prazo de 03 dias úteis resultará na propositura de Ação Judicial de cobrança.</p>`
    },
    agrominas: {
        nome_curto: "Agrominas",
        logo_esq: "assets/agrominas/logo-esq.png",
        logo_dir: "assets/agrominas/logo-dir.png",
        ...DADOS_ASSINATURA_UNIFICADA,
        texto_base: `
            <p><strong>AGROMINAS S/A</strong>, por sua representante legal, vem por meio desta, <strong>NOTIFICAR</strong>:</p>
            <p><strong>{{Nome}}</strong>, CPF/CNPJ <strong>{{CNPJ}}</strong> para quitação de saldo devedor de insumos no valor de <strong>{{Valor}}</strong>.</p>
            <p>Solicitamos contato imediato para evitar protesto e execução judicial.</p>`
    }
};

let EMPRESA_SELECIONADA = null;
let MODO_ENTRADA = 'excel';

function selecionarEmpresa(id) {
    EMPRESA_SELECIONADA = id;
    document.getElementById('area-dados').style.display = 'block';
    document.getElementById('alerta-selecao').style.display = 'none';
    document.querySelectorAll('.btn-empresa').forEach(b => b.classList.toggle('active', b.dataset.empresa === id));
    
    const d = DADOS_EMPRESAS[id];
    document.getElementById('logo-print-esq').src = d.logo_esq;
    document.getElementById('logo-print-dir').src = d.logo_dir;
    document.getElementById('template-texto').innerHTML = d.texto_base;
    document.getElementById('assinatura-nome-advogado').innerText = d.assinatura_nome;
    document.getElementById('assinatura-oab').innerText = d.assinatura_oab;
    document.getElementById('assinatura-img').src = d.assinatura_img;
}

function alternarModo(m) {
    MODO_ENTRADA = m;
    document.getElementById('modo-excel').style.display = m === 'excel' ? 'block' : 'none';
    document.getElementById('modo-tela').style.display = m === 'tela' ? 'block' : 'none';
    document.getElementById('tab-excel').classList.toggle('active', m === 'excel');
    document.getElementById('tab-tela').classList.toggle('active', m === 'tela');
}

function adicionarLinha() {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td><input type="text" class="input-nome"></td><td><input type="text" class="input-cnpj"></td><td><input type="text" class="input-valor"></td><td><button class="btn-remove" onclick="removerLinha(this)">×</button></td>`;
    document.getElementById('tabela-corpo').appendChild(tr);
}

function removerLinha(btn) { btn.closest('tr').remove(); }

async function iniciarGeracao() {
    const dados = coletarDados();
    if (dados.length === 0) return alert("Insira os dados primeiro.");

    const btn = document.getElementById('btnGerar');
    const status = document.getElementById('status');
    btn.disabled = true; btn.innerText = "Processando...";
    configurarData();

    try {
        const zip = new JSZip();
        const pasta = zip.folder("Notificacoes");
        const originalHTML = document.getElementById('template-texto').innerHTML;

        for (const item of dados) {
            status.innerText = `Gerando: ${item.nome}...`;
            let preenchido = originalHTML.replace('{{Nome}}', item.nome).replace('{{CNPJ}}', item.cnpj).replace('{{Valor}}', item.valor);
            document.getElementById('template-texto').innerHTML = preenchido;
            
            const pdfBlob = await html2pdf().set({ margin: 15, filename: 'doc.pdf', html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a4' } }).from(document.getElementById('documento-modelo')).output('blob');
            pasta.file(`${item.nome.replace(/\s/g, '_')}.pdf`, pdfBlob);
        }

        const content = await zip.generateAsync({type:"blob"});
        saveAs(content, `Notificacoes_${DADOS_EMPRESAS[EMPRESA_SELECIONADA].nome_curto}.zip`);
        status.innerText = "Concluído com sucesso!";
        btn.disabled = false; btn.innerText = "Gerar Novamente";
        document.getElementById('template-texto').innerHTML = originalHTML;
    } catch (e) { alert("Erro: " + e.message); btn.disabled = false; }
}

function coletarDados() {
    let list = [];
    if (MODO_ENTRADA === 'excel') {
        document.getElementById('inputDataExcel').value.trim().split('\n').forEach(l => {
            const c = l.split('\t');
            if (c.length >= 3) list.push({ nome: c[0].trim(), cnpj: c[1].trim(), valor: c[2].trim() });
        });
    } else {
        document.querySelectorAll('#tabela-corpo tr').forEach(tr => {
            const n = tr.querySelector('.input-nome').value;
            const c = tr.querySelector('.input-cnpj').value;
            const v = tr.querySelector('.input-valor').value;
            if (n && c && v) list.push({ nome: n, cnpj: c, valor: v });
        });
    }
    return list;
}

function configurarData() {
    document.getElementById('print-data').innerText = "Marabá, " + new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
}
