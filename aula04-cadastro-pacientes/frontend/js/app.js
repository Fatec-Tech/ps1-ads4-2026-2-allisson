// No deploy, substitua pela URL do seu backend no Render, terminando em /pacientes.
const URL_API = 'http://localhost:3000/pacientes';

const formulario = document.getElementById('form-paciente');
const tabela = document.getElementById('tabela-pacientes');
const mensagem = document.getElementById('mensagem');
const carregando = document.getElementById('carregando');
const listaVazia = document.getElementById('lista-vazia');
const campoId = document.getElementById('id');
const campoNome = document.getElementById('nome');
const campoEmail = document.getElementById('email');
const campoNascimento = document.getElementById('nascimento');
const botaoSalvar = document.getElementById('btn-salvar');
const botaoCancelar = document.getElementById('btn-cancelar');
const tituloFormulario = document.getElementById('titulo-formulario');

function mostrarMensagem(texto, tipo = 'erro') {
  mensagem.replaceChildren();
  const alerta = document.createElement('p');
  alerta.className = `alerta ${tipo}`;
  alerta.textContent = texto;
  mensagem.appendChild(alerta);
}

function celula(texto) {
  const td = document.createElement('td');
  td.textContent = texto;
  return td;
}

function formatarData(data) {
  if (!data) return '';
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
}

function renderizarTabela(pacientes) {
  tabela.replaceChildren();
  listaVazia.classList.toggle('oculto', pacientes.length !== 0);

  for (const paciente of pacientes) {
    const linha = document.createElement('tr');
    linha.append(celula(paciente.nome), celula(paciente.email), celula(formatarData(paciente.nascimento)));

    const colunaAcoes = document.createElement('td');
    const acoes = document.createElement('div');
    acoes.className = 'acoes-linha';
    const editar = document.createElement('button');
    editar.type = 'button';
    editar.className = 'secundario';
    editar.textContent = 'Editar';
    editar.addEventListener('click', () => iniciarEdicao(paciente));
    const excluir = document.createElement('button');
    excluir.type = 'button';
    excluir.className = 'perigo';
    excluir.textContent = 'Excluir';
    excluir.addEventListener('click', () => excluirPaciente(paciente.id));
    acoes.append(editar, excluir);
    colunaAcoes.appendChild(acoes);
    linha.appendChild(colunaAcoes);
    tabela.appendChild(linha);
  }
}

async function listarPacientes() {
  carregando.classList.remove('oculto');
  try {
    const resposta = await fetch(URL_API);
    if (!resposta.ok) throw new Error(`Falha ao listar (HTTP ${resposta.status}).`);
    renderizarTabela(await resposta.json());
  } catch (erro) {
    mostrarMensagem(`${erro.message} Verifique se a API está em execução e se URL_API está correta.`);
  } finally {
    carregando.classList.add('oculto');
  }
}

function iniciarEdicao(paciente) {
  campoId.value = paciente.id;
  campoNome.value = paciente.nome;
  campoEmail.value = paciente.email;
  campoNascimento.value = paciente.nascimento;
  botaoSalvar.textContent = 'Salvar alterações';
  botaoCancelar.classList.remove('oculto');
  tituloFormulario.textContent = 'Editar paciente';
  campoNome.focus();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function limparFormulario() {
  formulario.reset();
  campoId.value = '';
  botaoSalvar.textContent = 'Cadastrar paciente';
  botaoCancelar.classList.add('oculto');
  tituloFormulario.textContent = 'Novo paciente';
}

async function excluirPaciente(id) {
  if (!window.confirm('Deseja realmente excluir este paciente?')) return;
  try {
    const resposta = await fetch(`${URL_API}/${id}`, { method: 'DELETE' });
    if (!resposta.ok) {
      const erro = await resposta.json().catch(() => ({}));
      throw new Error(erro.erro || `Falha ao excluir (HTTP ${resposta.status}).`);
    }
    mostrarMensagem('Paciente excluído com sucesso.', 'sucesso');
    await listarPacientes();
  } catch (erro) {
    mostrarMensagem(erro.message);
  }
}

formulario.addEventListener('submit', async (event) => {
  event.preventDefault();
  const id = campoId.value;
  const dados = { nome: campoNome.value.trim(), email: campoEmail.value.trim(), nascimento: campoNascimento.value };
  try {
    const resposta = await fetch(id ? `${URL_API}/${id}` : URL_API, {
      method: id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });
    if (!resposta.ok) {
      const erro = await resposta.json().catch(() => ({}));
      throw new Error(erro.erro || `Falha ao salvar (HTTP ${resposta.status}).`);
    }
    mostrarMensagem(id ? 'Paciente atualizado com sucesso.' : 'Paciente cadastrado com sucesso.', 'sucesso');
    limparFormulario();
    await listarPacientes();
  } catch (erro) {
    mostrarMensagem(erro.message);
  }
});

botaoCancelar.addEventListener('click', limparFormulario);
document.getElementById('btn-atualizar-lista').addEventListener('click', listarPacientes);
listarPacientes();
