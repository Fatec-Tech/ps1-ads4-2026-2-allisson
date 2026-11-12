const express = require('express');
const cors = require('cors');
const pool = require('./banco');

const app = express();

app.use(cors());
app.use(express.json());

const COLUNAS = 'id, nome, email, nascimento';

function dadosValidos(corpo) {
  const { nome, email, nascimento } = corpo ?? {};
  return Boolean(nome && email && nascimento);
}

function idValido(id) {
  return Number.isInteger(id) && id > 0;
}

function tratarErro(res, erro) {
  console.error(erro);

  if (erro.code === '23505') {
    return res.status(409).json({
      erro: 'Já existe um paciente com este e-mail',
    });
  }

  return res.status(500).json({ erro: 'Erro interno do servidor' });
}

app.get('/', (_req, res) => {
  res.json({ mensagem: 'API de pacientes no ar', endpoint: '/pacientes' });
});

// Lista todos os pacientes
app.get('/pacientes', async (_req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT ${COLUNAS} FROM pacientes ORDER BY id`
    );
    return res.json(resultado.rows);
  } catch (erro) {
    return tratarErro(res, erro);
  }
});

// Busca um paciente pelo ID
app.get('/pacientes/:id', async (req, res) => {
  const id = Number(req.params.id);

  if (!idValido(id)) {
    return res.status(400).json({ erro: 'ID inválido' });
  }

  try {
    const resultado = await pool.query(
      `SELECT ${COLUNAS} FROM pacientes WHERE id = $1`,
      [id]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({ erro: 'Paciente não encontrado' });
    }

    return res.json(resultado.rows[0]);
  } catch (erro) {
    return tratarErro(res, erro);
  }
});

// Cadastra um paciente
app.post('/pacientes', async (req, res) => {
  if (!dadosValidos(req.body)) {
    return res.status(400).json({
      erro: 'Nome, e-mail e nascimento são obrigatórios',
    });
  }

  const { nome, email, nascimento } = req.body;

  try {
    const resultado = await pool.query(
      `INSERT INTO pacientes (nome, email, nascimento)
       VALUES ($1, $2, $3)
       RETURNING ${COLUNAS}`,
      [nome, email, nascimento]
    );

    return res.status(201).json(resultado.rows[0]);
  } catch (erro) {
    return tratarErro(res, erro);
  }
});

// Atualiza um paciente
app.put('/pacientes/:id', async (req, res) => {
  const id = Number(req.params.id);

  if (!idValido(id)) {
    return res.status(400).json({ erro: 'ID inválido' });
  }

  if (!dadosValidos(req.body)) {
    return res.status(400).json({
      erro: 'Nome, e-mail e nascimento são obrigatórios',
    });
  }

  const { nome, email, nascimento } = req.body;

  try {
    const resultado = await pool.query(
      `UPDATE pacientes
       SET nome = $1, email = $2, nascimento = $3
       WHERE id = $4
       RETURNING ${COLUNAS}`,
      [nome, email, nascimento, id]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({ erro: 'Paciente não encontrado' });
    }

    return res.json(resultado.rows[0]);
  } catch (erro) {
    return tratarErro(res, erro);
  }
});

// Apaga um paciente
app.delete('/pacientes/:id', async (req, res) => {
  const id = Number(req.params.id);

  if (!idValido(id)) {
    return res.status(400).json({ erro: 'ID inválido' });
  }

  try {
    const resultado = await pool.query(
      'DELETE FROM pacientes WHERE id = $1',
      [id]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({ erro: 'Paciente não encontrado' });
    }

    return res.status(204).send();
  } catch (erro) {
    return tratarErro(res, erro);
  }
});

const porta = process.env.PORT || 3000;

app.listen(porta, () => {
  console.log(`Servidor rodando na porta ${porta}`);
});