export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { issueNumber } = req.body || {};
  if (!issueNumber) return res.status(400).json({ error: 'issueNumber obrigatório' });

  const token = process.env.GITHUB_TOKEN;
  const repo  = 'myxin1/metodo-pagina-achadinho';

  try {
    const response = await fetch(`https://api.github.com/repos/${repo}/issues/${issueNumber}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'metodo-pagina-achadinho'
      },
      body: JSON.stringify({ state: 'closed' })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('GitHub API error:', err);
      return res.status(500).json({ error: 'Erro ao excluir lead' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno' });
  }
}
