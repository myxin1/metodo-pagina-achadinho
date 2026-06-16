const REPO      = 'myxin1/metodo-pagina-achadinho';
const FILE_PATH = 'Projetos/Mirian/config.json';
const USUARIO   = 'Miriam';
const SENHA     = '1234@abc';

// Aceita qualquer link de convite de grupo do WhatsApp
const WA_REGEX = /^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]{10,}/;

function ghHeaders(token) {
  return {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
    'User-Agent': 'achadinhos-imperdiveis'
  };
}

async function getFile(token) {
  const r = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`,
    { headers: ghHeaders(token) }
  );
  if (!r.ok) return null;
  const data = await r.json();
  const content = JSON.parse(Buffer.from(data.content, 'base64').toString('utf-8'));
  return { link: content.link, sha: data.sha };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const token = process.env.GITHUB_TOKEN;
  if (!token) return res.status(500).json({ error: 'Token não configurado no servidor.' });

  // GET — retorna o link atual
  if (req.method === 'GET') {
    const file = await getFile(token);
    if (!file) return res.status(500).json({ error: 'Erro ao ler configuração.' });
    return res.status(200).json({ link: file.link });
  }

  // POST — check-auth ou update
  if (req.method === 'POST') {
    const { action, username, password, link } = req.body || {};

    if (username !== USUARIO || password !== SENHA) {
      return res.status(401).json({ error: 'Usuário ou senha incorretos.' });
    }

    if (action === 'check-auth') {
      return res.status(200).json({ valid: true });
    }

    if (action === 'update') {
      if (!link || link.trim() === '') {
        return res.status(400).json({ error: 'O campo não pode ficar vazio.' });
      }
      if (!WA_REGEX.test(link.trim())) {
        return res.status(400).json({ error: 'Use um link de grupo do WhatsApp (chat.whatsapp.com/...).' });
      }

      const newLink = link.trim();

      // Busca SHA atual para o PUT
      const current = await getFile(token);

      const encoded = Buffer.from(JSON.stringify({ link: newLink }, null, 2)).toString('base64');
      const body = {
        message: 'Update: link do grupo WhatsApp (Mirian)',
        content: encoded
      };
      if (current) body.sha = current.sha;

      const putRes = await fetch(
        `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`,
        { method: 'PUT', headers: ghHeaders(token), body: JSON.stringify(body) }
      );

      if (!putRes.ok) {
        const err = await putRes.text();
        console.error('GitHub API error:', err);
        return res.status(500).json({ error: 'Erro ao salvar no GitHub.' });
      }

      return res.status(200).json({ success: true });
    }

    return res.status(400).json({ error: 'Ação inválida.' });
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}
