// ===========================================
// 1. CONFIGURAÇÕES E DADOS DAS EMPRESAS
// ===========================================

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
            <p><strong>NADIA RURAL LTDA</strong>, pessoa jurídica de Direito Privado, inscrita no CNPJ sob nº 01.542.004/0001-64, sediada Avenida Getúlio Vargas, 1892 - Entroncamento, Imperatriz - MA, 65.913-473, por seu Diretor Administrativo <strong>ELIAS YUSUF NETO</strong>, brasileiro, empresário, casado, portador do CPF.: 614.758.073-68, com endereço profissional mencionado acima, vem por meio desta, <strong>NOTIFICAR</strong>:</p>
            <p><strong>{{Nome}}</strong>, inscrito (a) no CPF/CNPJ sob o nº <strong>{{CNPJ}}</strong> para pagamento de débito em aberto, totalizando o importe de <strong>{{Valor}}</strong>.</p>
            <p>Se porventura os pagamentos supramencionados tenham sido realizados, por gentileza envie os comprovantes para o whatsapp <strong>(94) 9 8137-0253 - Ávila Silva</strong>, e desconsidere esta notificação.</p>
            <p>Caso os valores esteja realmente em aberto, a <strong>NOTIFICANTE</strong> oferece oportunidade de acordar a referida dívida. Havendo interesse, se manifeste em um prazo de <strong>03 (três) dias úteis</strong>.</p>
            <p>Não ocorrendo manifestação, tomaremos de imediato as medidas judiciais cabíveis.</p>`
    },
    inter: {
        nome_curto: "Inter",
        logo_esq: "assets/inter/logo-esq.png",
        logo_dir: "assets/inter/logo-dir.png",
        ...DADOS_ASSINATURA_UNIFICADA,
        texto_base: `
            <p><strong>INTER SERVIÇOS FINANCEIROS LTDA</strong>, inscrita no CNPJ sob nº XX.XXX.XXX/XXXX-XX, por meio de sua Assessoria Jurídica, vem por meio desta, <strong>NOTIFICAR</strong>:</p>
            <p><strong>{{Nome}}</strong>, inscrito (a) no CPF/CNPJ sob o nº <strong>{{CNPJ}}</strong> para pagamento de débito no importe de <strong>{{Valor}}</strong>.</p>
            <p>O prazo para regularização é de <strong>03 (três) dias úteis</strong> antes do envio para a esfera judicial.</p>`
    },
    agrominas: {
        nome_curto: "Agrominas",
        logo_esq: "assets/agrominas/logo-esq.png",
        logo_dir: "assets/agrominas/logo-dir.png",
        ...DADOS_ASSINATURA_UNIFICADA,
        texto_base: `
            <p><strong>AGROMINAS LTDA</strong>, vem por meio desta, <strong>NOTIFICAR</strong>:</p>
            <p><strong>{{Nome}}</strong>, portador do CPF/CNPJ <strong>{{CNPJ}}</strong> sobre o débito de <strong>{{Valor}}</strong>.</p>
            <p>Solicitamos o contato urgente para regularização.</p>`
    }
};

// ===========================================
// 2. VARIÁVEIS GLOBAIS E SELEÇÃO
// ===========================================

let empresaSelecionadaKey = null;

function selecionarEmpresa(chave) {
    empresaSelecionadaKey = chave;
    
    // Atualiza visual dos botões
    document.querySelectorAll('.btn-empresa').forEach(btn => {
        btn.classList.remove('active');
        if(btn.getAttribute('data-empresa') === chave) {
            btn.classList.add('active');
        }
    });

    // Mostra área de dados
    document.getElementById('area-dados').style.display = 'block';
    
    // Adiciona uma linha inicial se a tabela estiver vazia
    const tbody = document.getElementById('corpo-tabela-manual');
    if (tbody.children.length === 0) {
        adicionarLinhaManual();
    }
}

// ===========================================
// 3. LÓGICA DA TABELA MANUAL
// ===========================================

function adicionarLinhaManual() {
    const tbody = document.getElementById('corpo-tabela-manual');
    const tr = document.createElement('tr');

    tr.innerHTML = `
        <td><input type="text" class="input-tabela campo-nome" placeholder="Ex: João da Silva"></td>
        <td><input type="text" class="input-tabela campo-cpf" placeholder="000.000.000-00"></td>
        <td><input type="text" class="input-tabela campo-valor" placeholder="R$ 0,00" onkeyup="formatarMoedaInput(this)"></td>
        <td class="text-center">
            <button class="btn btn-outline-danger btn-sm" onclick="removerLinha(this)" title="Remover linha">&times;</button>
        </td>
    `;
    
    tbody.appendChild(tr);
}

function removerLinha(botao) {
    const linha = botao.closest('tr');
    linha.remove();
}

// Máscara simples para moeda visual
function formatarMoedaInput(elemento) {
    let valor = elemento.value.replace(/\D/g, "");
    valor = (valor / 100).toFixed(2) + "";
    valor = valor.replace(".", ",");
    valor = valor.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
    elemento.value = "R$ " + valor;
}

// ===========================================
// 4. PROCESSAMENTO E GERAÇÃO
// ===========================================

async function iniciarGeracao() {
    if (!empresaSelecionadaKey) {
        alert("Por favor, selecione uma empresa primeiro.");
        return;
    }

    const btn = document.getElementById('btnGerar');
    const status = document.getElementById('status');
    const dadosEmpresa = DADOS_EMPRESAS[empresaSelecionadaKey];

    // Verifica qual aba está ativa para saber de onde pegar os dados
    const abaAtiva = document.querySelector('.nav-link.active').id;
    let listaNotificados = [];

    if (abaAtiva === 'tab-colar') {
        // Pega do Textarea
        const textoInput = document.getElementById('inputData').value.trim();
        if (!textoInput) { alert("Cole os dados ou use a tabela manual."); return; }
        
        const linhas = textoInput.split('\n');
        listaNotificados = linhas.map(linha => {
            const cols = linha.split(/\t/); // Divide por TAB
            if (cols.length >= 3) {
                return { nome: cols[0].trim(), cpf: cols[1].trim(), valor: cols[2].trim() };
            }
            return null;
        }).filter(item => item !== null);

    } else {
        // Pega da Tabela Manual
        const linhasTabela = document.querySelectorAll('#corpo-tabela-manual tr');
        linhasTabela.forEach(tr => {
            const nome = tr.querySelector('.campo-nome').value.trim();
            const cpf = tr.querySelector('.campo-cpf').value.trim();
            const valor = tr.querySelector('.campo-valor').value.trim();

            if (nome && cpf) { // Só adiciona se tiver pelo menos nome e CPF
                listaNotificados.push({ nome, cpf, valor });
            }
        });
    }

    if (listaNotificados.length === 0) {
        alert("Nenhum dado válido encontrado para gerar.");
        return;
    }

    // Prepara UI
    btn.disabled = true;
    btn.innerText = "Gerando PDFs...";
    status.innerText = `Processando 0 de ${listaNotificados.length}...`;

    const zip = new JSZip();
    const dataHoje = getDataPorExtenso();

    // Loop de geração
    for (let i = 0; i < listaNotificados.length; i++) {
        const item = listaNotificados[i];
        
        // Atualiza o Template HTML (invisível)
        document.getElementById('logo-print-esq').src = dadosEmpresa.logo_esq;
        document.getElementById('logo-print-dir').src = dadosEmpresa.logo_dir;
        
        // Substituição das variáveis no texto
        let textoFinal = dadosEmpresa.texto_base
            .replace(/{{Nome}}/g, item.nome)
            .replace(/{{CNPJ}}/g, item.cpf)
            .replace(/{{Valor}}/g, item.valor);

        document.getElementById('template-texto').innerHTML = textoFinal;
        document.getElementById('print-data').innerText = `Imperatriz - MA, ${dataHoje}`;
        
        document.getElementById('assinatura-img').src = dadosEmpresa.assinatura_img;
        document.getElementById('assinatura-nome-advogado').innerText = dadosEmpresa.assinatura_nome;
        document.getElementById('assinatura-oab').innerText = dadosEmpresa.assinatura_oab;

        // Gera o PDF
        const elemento = document.getElementById('documento-modelo');
        const opt = {
            margin:       10,
            filename:     `${item.nome}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // Usa html2pdf para gerar o blob
        const pdfBlob = await html2pdf().set(opt).from(elemento).output('blob');
        
        // Adiciona ao ZIP
        zip.file(`${item.nome.replace(/[^a-z0-9]/gi, '_')}.pdf`, pdfBlob);
        
        status.innerText = `Gerado: ${i + 1} de ${listaNotificados.length}`;
    }

    // Finaliza e baixa
    status.innerText = "Compactando e baixando...";
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `Notificacoes_${dadosEmpresa.nome_curto}.zip`);

    // Reseta UI
    btn.disabled = false;
    btn.innerText = "Gerar PDFs e Baixar ZIP";
    status.innerText = "Concluído!";
}

// ===========================================
// 5. UTILITÁRIOS
// ===========================================

function getDataPorExtenso() {
    const data = new Date();
    const dia = String(data.getDate()).padStart(2, '0');
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const mes = meses[data.getMonth()];
    const ano = data.getFullYear();
    return `${dia} de ${mes} de ${ano}`;
}
