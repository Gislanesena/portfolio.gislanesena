const DADOS_PERFIL_SENA = {
  identidade: {
    nome: "Gislane Sena",
    titulo: "Desenvolvedora Full Stack · Piloto de Código · Fundadora do BuildXP",
    formatura: "Dezembro de 2026",
    email: "gislane.sena@icloud.com",
    github: "https://github.com/Gislanesena",
    linkedin: "https://linkedin.com/in/gislanesena",
    proposito:
      "Entrei na tecnologia porque ela democratiza acesso de verdade — ensino, saúde e oportunidade. Entro na pista com curiosidade e sigo acelerando em direção ao que ainda não sei."
  },
  atuacaoELideranca: [
    "Fundadora do BuildXP (plataforma open source de aprendizado em tech com terminal de treino e sistema de XP)",
    "Coordenadora de Projeto e Tech Lead na Banca da Ciência da USP (projeto de extensão que leva divulgação científica a escolas públicas)",
    "Gerente de Projeto e Líder de Desenvolvimento na WoHackers (sistema de gestão de hackathon para comunidade de mulheres em tech)",
    "Líder de Desenvolvimento na Connect Byte (sistema de gestão de hackathon com AWS)"
  ],
  habilidades: {
    linguagensEWeb: ["C#", ".NET", "Java (formação Oracle University)", "Python", "Node.js", "C", "HTML", "CSS", "JavaScript"],
    bancoDeDados: ["PostgreSQL", "SQL Server", "DBeaver"],
    infraECloud: ["Docker", "AWS", "Git & GitHub", "SDK", "ClickUp"],
    gestao: ["Scrum", "Kanban", "PDCA", "Liderança Técnica"],
    segurancaEPrivacidade: [
      "Princípios de Segurança da Informação",
      "Criptografia simétrica e assimétrica (AES, RSA, Diffie-Hellman)",
      "Vulnerabilidades, ameaças e ataques",
      "LGPD, privacidade e tratamento de dados pessoais",
      "Fundamentos de redes, IPv4 e IPv6"
    ]
  },
  projetos: [
    "BuildXP: Plataforma open source com terminal de treino, sistema de XP e conteúdo prático (buildxpdev.com.br).",
    "SatVantage: Projeto desenvolvido e validado em hackathon.",
    "AxiomCode: Ambiente acolhedor para calouros de TI com foco em reduzir evasão nos cursos.",
    "Clínicas Populares: API REST para clínicas do SUS com prontuário eletrônico, fila inteligente e Machine Learning para prever tempo de espera e risco de falta.",
    "Sala de Crise: Simulador interativo de resposta a incidentes com 11 salas de cibersegurança e análise de sistemas envolvendo decisões sob pressão e LGPD/ANPD."
  ],
  interessesPessoais: [
    "Leitura compulsiva (fantasia, aventura, heróis e ficção)",
    "Pintura em aquarela",
    "Treino diário de matemática por conta própria",
    "Universo Marvel (fã do Homem de Ferro)"
  ]
};

async function obterModeloChatGroq(apiKey) {
  try {
    const res = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` }
    });
    if (!res.ok) return "llama-3.1-8b-instant";

    const data = await res.json();
    const ids = (data?.data || [])
      .map((m) => m.id)
      .filter(
        (id) =>
          !id.includes("whisper") &&
          !id.includes("guard") &&
          !id.includes("tts") &&
          !id.includes("embed") &&
          !id.includes("orpheus") &&
          !id.includes("canopylabs") &&
          !id.includes("playai")
      );

    const preferidos = [
      "llama-3.1-8b-instant",
      "meta-llama/llama-4-scout-17b-16e-instruct",
      "meta-llama/llama-4-maverick-17b-128e-instruct",
      "openai/gpt-oss-120b",
      "qwen/qwen3-32b"
    ];

    for (const p of preferidos) {
      if (ids.includes(p)) return p;
    }
    return ids[0] || "llama-3.1-8b-instant";
  } catch {
    return "llama-3.1-8b-instant";
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ resposta_terminal: "Método não permitido." });
  }

  try {
    const { mensagem } = req.body || {};
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        resposta_terminal: "[ERRO]: GROQ_API_KEY não configurada no servidor."
      });
    }

    const modeloEscolhido = await obterModeloChatGroq(apiKey);

    const systemPrompt = `
Você é a própria Gislane Sena conversando diretamente no "Team Radio" do seu portfólio (sena.dev).

BLOQUEIO ESTRITO DE ESCOPO:
- Você SÓ pode responder perguntas sobre VOCÊ (Gislane Sena), sua trajetória, liderança, projetos, habilidades técnicas e interesses registrados em DADOS_PERFIL_SENA.
- Se perguntarem sobre qualquer assunto externo (receitas, piadas, tarefas genéricas de código, política, etc.), recuse de forma leve e em primeira pessoa em no máximo 2 linhas, redirecionando a conversa para o seu portfólio.

REGRAS DE CONVERSA:
1. PRIMEIRA PESSOA SEMPRE ("eu", "meus projetos"). Nunca fale na terceira pessoa.
2. SEGUNDA PESSOA COM O VISITANTE ("você").
3. FIDELIDADE AOS DADOS: Use apenas as informações reais de DADOS_PERFIL_SENA.
4. IDIOMA DINÂMICO: Responda no mesmo idioma da pergunta (Português ou Inglês).
5. RESPOSTA CONCISA: Responda em 1 ou 2 parágrafos curtos e diretos (4 a 6 linhas no máximo), com naturalidade e leve toque da temática de corrida/tecnologia sem exageros.

DADOS REAIS:
${JSON.stringify(DADOS_PERFIL_SENA)}
    `;

    const respostaGroq = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modeloEscolhido,
        temperature: 0.15,
        max_tokens: 450,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: mensagem }
        ]
      })
    });

    const data = await respostaGroq.json();

    if (!respostaGroq.ok) {
      return res.status(500).json({
        resposta_terminal: `[ERRO GROQ ${respostaGroq.status}]: ${data?.error?.message || "Falha na API"}`
      });
    }

    const textoFinal = (data?.choices?.[0]?.message?.content || "").trim();
    return res.status(200).json({
      resposta_terminal: textoFinal || "Sem resposta do box agora."
    });
  } catch (err) {
    return res.status(500).json({
      resposta_terminal: "[ERRO DE SISTEMA]: Falha interna ao consultar o rádio."
    });
  }
}