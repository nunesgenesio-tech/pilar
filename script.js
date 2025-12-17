// ===========================================
// 1. DADOS DE CADA EMPRESA
// ===========================================

// Defina aqui os templates de texto, logos e dados de assinatura para cada empresa
const DADOS_EMPRESAS = {
    nadia: {
        nome_completo: "NADIA RURAL LTDA",
        nome_curto: "NadiaRural",
        logo_esq: "assets/nadia/logo-esq.png", // Ajuste os nomes dos arquivos
        logo_dir: "assets/nadia/logo-dir.png", // Ajuste os nomes dos arquivos
        diretor: "ELIAS YUSUF NETO",
        texto_base: `
            <p>
                <strong>NADIA RURAL LTDA</strong>, pessoa jurídica de Direito Privado, inscrita no CNPJ sob nº 01.542.004/0001-64, sediada Avenida Getúlio Vargas, 1892 - Entroncamento, Imperatriz - MA, 65.913-473, por seu Diretor Administrativo <strong>ELIAS YUSUF NETO</strong>, brasileiro, empresário, casado, portador do CPF.: 614.758.073-68, com endereço profissional mencionado acima, vem por meio desta, <strong>NOTIFICAR</strong>:
            </p>

            <p>
                <strong id="print-nome">{{Nome}}</strong>, inscrito (a) no CPF/CNPJ sob o nº <strong id="print-cnpj">{{CNPJ}}</strong> para pagamento de débito em aberto, totalizando o importe de <strong id="print-valor">{{Valor}}</strong>.
            </p>

            <p>
                Se porventura os pagamentos supramencionados tenham sido realizados, por gentileza envie os comprovantes para o whatsapp <strong>(94) 9 8137-0253 - Ávila Silva</strong>, e desconsidere esta notificação.
            </p>

            <p>
                Caso os valores acima estejam realmente em aberto e considerando que já fora dada a oportunidade para pagamento espontâneo, a <strong>NOTIFICANTE</strong> com o intuito de solucionar este imbróglio de forma amigável oferece oportunidade de acordar a referida dívida, objetivando a quitação do referido débito.
            </p>

            <p>
                Havendo interesse em negociar junto a empresa, se manifeste em um prazo de <strong>03 (três) dias úteis</strong> a partir do recebimento desta, para formalização do acordo.
            </p>

            <p>
                Não ocorrendo manifestação ou esta seja contrária a avença, ou ainda haja recusa no recebimento desta, tomaremos de imediato as medidas judiciais cabíveis.
            </p>

            <p>
                Cientes de vossa compreensão, estamos à disposição.
            </p>
        `
    },
    inter: {
        nome_completo: "INTER SERVIÇOS FINANCEIROS LTDA",
        nome_curto: "Inter",
        logo_esq: "assets/inter/logo-esq.png",
        logo_dir: "assets/inter/logo-dir.png",
        diretor: "DIRETOR INTERN ENGENHARIA",
        texto_base: `
            <p>
                <strong>INTER SERVIÇOS FINANCEIROS LTDA</strong>, pessoa jurídica de Direito Privado, inscrita no CNPJ sob nº XX.XXX.XXX/XXXX-XX, com sede em São Paulo/SP, por meio de sua Assessoria Jurídica, vem por meio desta, <strong>NOTIFICAR</strong>:
            </p>

            <p>
                <strong id="print-nome">{{Nome}}</strong>, inscrito (a) no CPF/CNPJ sob o nº <strong id="print-cnpj">{{CNPJ}}</strong> para pagamento de débito em aberto referente aos serviços contratados, totalizando o importe de <strong id="print-valor">{{Valor}}</strong>.
            </p>
            
            <p>
                Informamos que, para regularização do débito, a Assessoria Jurídica está à disposição para negociação pelo WhatsApp (XX) X XXXX-XXXX em horário comercial.
            </p>

            <p>
                O não pagamento ou manifestação de interesse em acordo no prazo de <strong>03 (três) dias úteis</strong> após o recebimento desta, resultará na propositura de Ação Judicial para cobrança e execução do título.
            </p>
            
            <p>
                Cientes de vossa compreensão, estamos à disposição.
            </p>
        `
    },
    agrominas: {
        nome_completo: "AGROMINAS S/A",
        nome_curto: "Agrominas",
        logo_esq: "assets/agrominas/logo-esq.png",
        logo_dir: "assets/agrominas/logo-dir.png",
        diretor: "DIRETOR GERAL AGROMINAS",
        texto_base: `
            <p>
                <strong>AGROMINAS S/A</strong>, empresa do setor agropecuário, inscrita no CNPJ sob nº YY.YYY.YYY/YYYY-YY, com sede em Minas Gerais/MG, por sua representante legal, vem por meio desta, <strong>NOTIFICAR</strong>:
            </p>

            <p>
                <strong id="print-nome">{{Nome}}</strong>, inscrito (a) no CPF/CNPJ sob o nº <strong id="print-cnpj">{{CNPJ}}</strong> para pagamento de saldo devedor de insumos agrícolas, totalizando o importe de <strong id="print-valor">{{Valor}}</strong>.
            </p>
            
            <p>
                Solicitamos que, no prazo de <strong>03 (três) dias úteis</strong>, o notificado entre em contato com o setor de cobrança (Telefone: XXXX-XXXX) para a quitação amigável do débito.
            </p>
            
            <p>
                A falta de manifestação ou recusa em negociar implicará a imediata adoção de medidas judiciais, incluindo protesto e execução.
            </p>

            <p>
                Cientes de vossa compreensão, estamos à disposição.
            </p>
        `
    }
};

let EMPRESA_SELECIONADA = null;

// ===========================================
// 2. FUNÇÕES DE INTERFACE E SELEÇÃO
// ===========================================

function selecionarEmpresa(empresa) {
    EMPRESA_SELECIONADA = empresa;
    const dados = DADOS_EMPRESAS[empresa];

    // Atualiza a interface
    document.getElementById('area-dados').style.display = 'block';
    document.getElementById('alerta-selecao').style.display = 'none';

    // Marca o botão como ativo
    document.querySelectorAll('.btn-empresa').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.empresa === empresa) {
            btn.classList.add('active');
        }
    });

    // Carrega o template oculto
    carregarTemplate(dados);
}

function carregarTemplate(dados) {
    // 1. Logos
    document.getElementById('logo-print-esq').src = dados.logo_esq;
    document.getElementById('logo-print-dir').src = dados.logo_dir;

    // 2. Texto base
    document.getElementById('template-texto').innerHTML = dados.texto_base;
    
    // 3. Assinatura
    document.getElementById('assinatura-nome-empresa').innerText = dados.nome_completo;
    document.getElementById('assinatura-nome-diretor').innerText = dados.diretor;
}


// ===========================================
// 3. FUNÇÕES DE GERAÇÃO (Ajustadas)
// ===========================================

function configurarData() {
    const hoje = new Date();
    const opcoes = { year: 'numeric', month: 'long', day: 'numeric' };
    const dataFormatada = hoje.toLocaleDateString('pt-BR', opcoes);
    document.getElementById('print-data').innerText = `Marabá, ${dataFormatada}`;
}

async function iniciarGeracao() {
    if (!EMPRESA_SELECIONADA) {
        alert("Por favor, selecione uma empresa antes de gerar os PDFs.");
        return;
    }

    const btn = document.getElementById('btnGerar');
    const status = document.getElementById('status');
    const inputData = document.getElementById('inputData').value.trim();
    const dadosEmpresa = DADOS_EMPRESAS[EMPRESA_SELECIONADA];

    if (!inputData) {
        alert("Cole os dados da planilha antes de gerar.");
        return;
    }

    configurarData();

    btn.disabled = true;
    btn.innerText = "Processando... aguarde";
    
    try {
        const linhas = inputData.split('\n');
        const zip = new JSZip();
        const pasta = zip.folder(`Notificacoes_${dadosEmpresa.nome_curto}`);
        let count = 0;

        const opt = {
            margin: 10,
            filename: 'arquivo.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        const elemento = document.getElementById('documento-modelo');
        const templateTextoOriginal = document.getElementById('template-texto').innerHTML;

        for (let i = 0; i < linhas.length; i++) {
            const linha = linhas[i].trim();
            if (!linha) continue;

            const colunas = linha.split('\t');
            
            if (i === 0 && colunas[0].toUpperCase() === "NOME") continue;

            if (colunas.length < 3) {
                console.warn(`Linha ${i+1} ignorada: dados incompletos.`);
                continue;
            }

            // Preenche os dados
            const nome = colunas[0].trim();
            const cnpj = colunas[1].trim();
            const valor = colunas[2].trim();

            status.innerText = `Gerando PDF para: ${nome} (${dadosEmpresa.nome_curto})...`;
            
            // Recria o template com os dados dinâmicos
            let htmlPreenchido = templateTextoOriginal
                .replace('{{Nome}}', nome)
                .replace('{{CNPJ}}', cnpj)
                .replace('{{Valor}}', valor);

            document.getElementById('template-texto').innerHTML = htmlPreenchido;

            // Gera o PDF
            const pdfBlob = await html2pdf().set(opt).from(elemento).output('blob');
            
            // Salva no ZIP
            const nomeArquivo = `Notificacao_${nome.replace(/[^a-z0-9]/gi, '_')}.pdf`;
            pasta.file(nomeArquivo, pdfBlob);
            
            count++;
        }

        if (count === 0) {
            alert("Nenhuma linha válida encontrada.");
            // Restaura o template para o texto original
            document.getElementById('template-texto').innerHTML = templateTextoOriginal;
            
            btn.disabled = false;
            btn.innerText = "Gerar PDFs e Baixar ZIP";
            status.innerText = "";
            return;
        }

        status.innerText = "Finalizando e compactando ZIP...";

        const content = await zip.generateAsync({type:"blob"});
        saveAs(content, `Notificacoes_${dadosEmpresa.nome_curto}.zip`);

        status.innerText = "Sucesso! Download iniciado.";
        btn.innerText = "Gerar Novamente";
        btn.disabled = false;
        
        // Restaura o template para o texto original após o loop
        document.getElementById('template-texto').innerHTML = templateTextoOriginal;

    } catch (erro) {
        console.error(erro);
        alert(`Ocorreu um erro. Verifique o console do navegador. Erro: ${erro.message}`);
        status.innerText = "Erro no processo.";
        btn.disabled = false;
        btn.innerText = "Tentar Novamente";
    }
}

// Inicializa a data ao carregar a página
window.onload = configurarData;