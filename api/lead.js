export default async function handler(req, res) {
  // Permite CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { nome, whatsapp } = req.body || {};

  if (!nome || !whatsapp) {
    return res.status(400).json({ error: 'Nome e WhatsApp são obrigatórios' });
  }

  const token = process.env.GITHUB_TOKEN;
  const repo  = 'myxin1/metodo-pagina-achadinho';
  const now   = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

  try {
    const response = await fetch(`https://api.github.com/repos/${repo}/issues`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'metodo-pagina-achadinho'
      },
      body: JSON.stringify({
        title: `🧲 Lead: ${nome} — ${whatsapp}`,
        body: `## Novo Lead Capturado\n\n**Nome:** ${nome}\n**WhatsApp:** ${whatsapp}\n**Data:** ${now}`,
        labels: ['lead']
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('GitHub API error:', err);
      return res.status(500).json({ error: 'Erro ao salvar lead' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno' });
  }
}
