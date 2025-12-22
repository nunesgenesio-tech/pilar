// ===========================================
// 1. DADOS DAS EMPRESAS
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
            <p>Caso os valores estejam realmente em aberto, a <strong>NOTIFICANTE</strong> oferece oportunidade de acordar a referida dívida. Havendo interesse, se manifeste em um prazo de <strong>03 (três) dias úteis</strong>.</p>`
    },
    inter: {
        nome_curto: "Inter",
        logo_esq: "assets/inter/logo-esq.png",
        logo_dir: "assets/inter/logo-dir.png",
        ...DADOS_ASSINATURA_UNIFICADA,
        texto_base: `
            <p><strong>INTER SERVIÇOS FINANCEIROS LTDA</strong>, inscrita no CNPJ sob nº XX.XXX.XXX/XXXX-XX, por meio de sua Assessoria Jurídica, vem por meio desta, <strong>NOTIFICAR</strong>:</p>
            <p><strong>{{Nome}}</strong>, inscrito (a) no CPF/CNPJ sob o nº <strong>{{CNPJ}}</strong> para pagamento de débito no importe de <strong>{{Valor}}</strong>.</p>`
    },
    agrominas: {
        nome_curto: "Agrominas",
        logo_esq: "assets/agrominas/logo-esq.png",
        logo_dir: "assets/agrominas/logo-dir.png",
        ...DADOS_ASSINATURA_UNIFICADA,
        texto_base: `
            <p><strong>AGROMINAS LTDA</strong>, vem por meio desta, <strong>NOTIFICAR</strong>:</p>
            <p><strong>{{Nome}}</strong>, portador do CPF/CNPJ <strong>{{CNPJ}}</strong> sobre o débito de <strong>{{Valor}}</strong>.</p>`
    }
};

let empresaAtiva = null;

// ===========================================
// 2. FUNÇÕES DE INTERFACE
// ===========================================

function selecionarEmpresa(chave) {
    empresaAtiva = chave;
    
    // Mostra a área de dados
    document.getElementById('area-dados').style.display = 'block';

    // Destaca o botão selecionado
    document.querySelectorAll('.btn-empresa').forEach(btn => btn.classList.remove('active'));
    document.getElementById('btn-' + chave).classList.add('active');

    // Se a tabela manual estiver vazia, adiciona uma linha
    if (document.getElementById('corpo-tabela-manual').children.length === 0) {
        adicionarLinhaManual();
    }
}

function adicionarLinhaManual() {
    const tbody = document.getElementById('corpo-tabela-manual');
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td><input type="text" class="input-tabela c-nome" placeholder="Nome"></td>
        <td><input type="text" class="input-tabela c-cpf" placeholder="CPF/CNPJ"></td>
        <td><input type="text" class="input-tabela c-valor" placeholder="R$ 0,00"></td>
        <td><button class="btn btn-danger btn-sm" onclick="this.closest('tr').remove()">x</button></td>
    `;
    tbody.appendChild(tr);
}

// ===========================================
// 3. GERAÇÃO DE PDF E ZIP
// ===========================================

async function iniciarGeracao() {
    if (!empresaAtiva) return alert("Selecione uma empresa!");

    const dadosEmpresa = DADOS_EMPRESAS[empresaAtiva];
    const listaFinal = [];

    // Verifica qual aba está ativa (Excel ou Manual)
    const isManual = document.getElementById('tab-manual-btn').classList.contains('active');

    if (isManual) {
        document.querySelectorAll('#corpo-tabela-manual tr').forEach(tr => {
            const nome = tr.querySelector('.c-nome').value;
            if (nome) {
                listaFinal.push({
                    nome: nome,
                    cpf: tr.querySelector('.c-cpf').value,
                    valor: tr.querySelector('.c-valor').value
                });
            }
        });
    } else {
        const raw = document.getElementById('inputData').value.trim();
        raw.split('\n').forEach(linha => {
            const col = linha.split('\t');
            if (col[0]) {
                listaFinal.push({ nome: col[0], cpf: col[1] || "", valor: col[2] || "" });
            }
        });
    }

    if (listaFinal.length === 0) return alert("Nenhum dado encontrado!");

    const zip = new JSZip();
    const btn = document.getElementById('btnGerar');
    btn.disabled = true;

    for (let i = 0; i < listaFinal.length; i++) {
        const pessoa = listaFinal[i];
        document.getElementById('status').innerText = `Gerando ${i+1} de ${listaFinal.length}...`;

        // Preenche o template
        document.getElementById('logo-print-esq').src = dadosEmpresa.logo_esq;
        document.getElementById('logo-print-dir').src = dadosEmpresa.logo_dir;
        document.getElementById('assinatura-img').src = dadosEmpresa.assinatura_img;
        document.getElementById('assinatura-nome-advogado').innerText = dadosEmpresa.assinatura_nome;
        document.getElementById('assinatura-oab').innerText = dadosEmpresa.assinatura_oab;
        document.getElementById('print-data').innerText = "Imperatriz - MA, " + new Date().toLocaleDateString();

        let texto = dadosEmpresa.texto_base
            .replace("{{Nome}}", pessoa.nome)
            .replace("{{CNPJ}}", pessoa.cpf)
            .replace("{{Valor}}", pessoa.valor);
        
        document.getElementById('template-texto').innerHTML = texto;

        // Converte para PDF Blob
        const elemento = document.getElementById('documento-modelo');
        const pdfBlob = await html2pdf().from(elemento).set({ margin: 10 }).output('blob');
        
        zip.file(`${pessoa.nome.replace(/\s/g, '_')}.pdf`, pdfBlob);
    }

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `Notificacoes_${dadosEmpresa.nome_curto}.zip`);
    
    btn.disabled = false;
    document.getElementById('status').innerText = "Concluído!";
}
