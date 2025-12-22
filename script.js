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
        logo_
