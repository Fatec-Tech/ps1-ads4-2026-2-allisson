const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Dados em memória: serão reiniciados quando o servidor reiniciar.
const pacientes = [
  { id: 1, nome: 'Maria Silva', email: 'maria.silva@email.com', nascimento: '1990-04-12' },
  { id: 2, nome: 'João Pereira', email: 'joao.pereira@email.com', nascimento: '1985-11-30' },
  { id: 3, nome: 'Ana Costa', email: 'ana.costa@email.com', nascimento: '2001-07-08' },
];
let proximoId = 4;

app.get('/', (_req, res) => {
  res.json({ mensagem: 'API de pacientes no ar', endpoint: '/pacientes' });
});

app.get('/pacientes', (_req, res) => {
  res.json(pacientes);
});

app.get('/pacientes/:id', (req, res) => {
  const id = Number(req.params.id);
  const paciente = pacientes.find((item) => item.id === id);
  if (!paciente) {
    return res.status(404).json({ erro: 'Paciente não encontrado' });
  }
  return res.json(paciente);
});

app.post('/pacientes', (req, res) => {
  const { nome, email, nascimento } = req.body ?? {};
  if (!nome || !email || !nascimento) {
    return res.status(400).json({ erro: 'Nome, e-mail e nascimento são obrigatórios' });
  }

  const novoPaciente = { id: proximoId++, nome, email, nascimento };
  pacientes.push(novoPaciente);
  return res.status(201).json(novoPaciente);
});

app.put('/pacientes/:id', (req, res) => {
  const id = Number(req.params.id);
  const paciente = pacientes.find((item) => item.id === id);
  if (!paciente) {
    return res.status(404).json({ erro: 'Paciente não encontrado' });
  }

  const { nome, email, nascimento } = req.body ?? {};
  if (!nome || !email || !nascimento) {
    return res.status(400).json({ erro: 'Nome, e-mail e nascimento são obrigatórios' });
  }

  Object.assign(paciente, { nome, email, nascimento });
  return res.json(paciente);
});

app.delete('/pacientes/:id', (req, res) => {
  const id = Number(req.params.id);
  const indice = pacientes.findIndex((item) => item.id === id);
  if (indice === -1) {
    return res.status(404).json({ erro: 'Paciente não encontrado' });
  }

  pacientes.splice(indice, 1);
  return res.status(204).send();
});

const porta = process.env.PORT || 3000;
app.listen(porta, () => {
  console.log(`Servidor rodando na porta ${porta}`);
});
