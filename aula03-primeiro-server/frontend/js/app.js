const URL_API = 'http://localhost:3000/pacientes';
const pacientes = [];

const formulario =
	document.getElementById('form-paciente') ||
	document.getElementById('formPaciente');

const tabela =
	document.getElementById('tabela-pacientes') ||
	document.getElementById('tabelaPacientes');

const mensagemCarregando =
	document.getElementById('carregando') ||
	document.getElementById('mensagemCarregando');

const totalTabela = document.getElementById('totalTabela');
const totalAPI = document.getElementById('totalAPI');
const botaoRecarregar = document.getElementById('botaoRecarregar');
const mensagemFormulario = document.getElementById('mensagemFormulario');

let carregando = false;

// Adiciona um paciente à lista local.
function adicionarPaciente(nome, email, nascimento) {
	pacientes.push({ nome, email, nascimento });
}

// Formata a data para dia/mês/ano.
function formatarData(dataISO) {
	const [ano, mes, dia] = dataISO.split('-');
	return `${dia}/${mes}/${ano}`;
}

// Cria uma célula da tabela.
function criarCelula(texto) {
	const celula = document.createElement('td');
	celula.textContent = texto;
	return celula;
}

// Atualiza a tabela.
function renderizarTabela() {
	tabela.replaceChildren();

	pacientes.forEach((paciente) => {
		const linha = document.createElement('tr');

		linha.append(
			criarCelula(paciente.nome),
			criarCelula(paciente.email),
			criarCelula(formatarData(paciente.nascimento))
		);

		tabela.appendChild(linha);
	});

	if (totalTabela) {
		totalTabela.textContent = pacientes.length;
	}
}

// Consulta a API e verifica erros HTTP.
async function buscarJSON(url) {
	const resposta = await fetch(url);

	if (!resposta.ok) {
		throw new Error(`Erro HTTP: ${resposta.status}`);
	}

	return resposta.json();
}

// Carrega os pacientes do backend.
async function carregarPacientesIniciais() {
	if (carregando) return;

	carregando = true;

	const botaoCadastrar = formulario.querySelector(
		'button[type="submit"], input[type="submit"]'
	);

	if (botaoCadastrar) botaoCadastrar.disabled = true;
	if (botaoRecarregar) botaoRecarregar.disabled = true;

	mensagemCarregando.hidden = false;
	mensagemCarregando.style.display = 'block';
	mensagemCarregando.classList.remove('erro');
	mensagemCarregando.textContent = 'Carregando pacientes...';

	if (mensagemFormulario) {
		mensagemFormulario.textContent = '';
	}

	pacientes.length = 0;
	renderizarTabela();

	if (totalAPI) totalAPI.textContent = '—';

	try {
		const dados = await buscarJSON(URL_API);

		dados.forEach((paciente) => {
			adicionarPaciente(
				paciente.nome,
				paciente.email,
				paciente.nascimento
			);
		});

		renderizarTabela();
		mensagemCarregando.style.display = 'none';

		// Consulta o total quando esse indicador existe no HTML.
		if (totalAPI) {
			try {
				const resumo = await buscarJSON(`${URL_API}/total`);
				totalAPI.textContent = resumo.total;
			} catch (erro) {
				totalAPI.textContent = 'Indisponível';
				console.error('Erro ao consultar o total:', erro);
			}
		}
	} catch (erro) {
		console.error('Não foi possível carregar os pacientes:', erro);

		mensagemCarregando.classList.add('erro');
		mensagemCarregando.textContent =
			'Erro ao carregar pacientes. O servidor está rodando? ' +
			'Inicie o backend e atualize a página.';
	} finally {
		carregando = false;

		if (botaoCadastrar) botaoCadastrar.disabled = false;
		if (botaoRecarregar) botaoRecarregar.disabled = false;
	}
}

// Cadastro na tabela do navegador.
formulario.addEventListener('submit', (event) => {
	event.preventDefault();

	if (carregando || !formulario.reportValidity()) return;

	const nome = document.getElementById('nome').value.trim();
	const email = document.getElementById('email').value.trim();
	const nascimento = document.getElementById('nascimento').value;

	if (!nome || !email || !nascimento) {
		alert('Preencha todos os campos.');
		return;
	}

	adicionarPaciente(nome, email, nascimento);
	renderizarTabela();
	formulario.reset();

	document.getElementById('nome').focus();

	if (mensagemFormulario) {
		mensagemFormulario.textContent =
			'Paciente adicionado nesta sessão. Ao recarregar, ' +
			'a tabela volta aos dados do backend.';
	}
});

// Botão opcional para buscar novamente os dados da API.
if (botaoRecarregar) {
	botaoRecarregar.addEventListener(
		'click',
		carregarPacientesIniciais
	);
}

// Inicialização.
carregarPacientesIniciais();