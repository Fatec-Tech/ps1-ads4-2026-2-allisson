const API_URL = 'https://pokeapi.co/api/v2/pokemon';

const pokemonGrid = document.getElementById('pokemonGrid');
const loading = document.getElementById('loading');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

const modalElement = document.getElementById('pokemonModal');
const modalTitle = document.getElementById('pokemonModalTitle');
const modalBody = document.getElementById('pokemonModalBody');

const pokemonModal = new bootstrap.Modal(modalElement);
const pokemonCache = new Map();

// Identifica a última solicitação de detalhes.
let modalRequest = 0;

// Busca por URL, nome ou ID.
async function fetchPokemonData(urlOrName) {
	const value = String(urlOrName).toLowerCase().trim();

	if (pokemonCache.has(value)) {
		return pokemonCache.get(value);
	}

	const url = value.startsWith(`${API_URL}/`)
		? value
		: `${API_URL}/${encodeURIComponent(value)}`;

	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(
			response.status === 404
				? 'Pokémon não encontrado.'
				: 'Não foi possível consultar a PokéAPI.'
		);
	}

	const pokemon = await response.json();

	pokemonCache.set(value, pokemon);
	pokemonCache.set(String(pokemon.id), pokemon);
	pokemonCache.set(pokemon.name, pokemon);

	return pokemon;
}

// Carrega os primeiros 20 Pokémon.
async function loadInitialPokemon(limit = 20) {
	showLoading(true);
	pokemonGrid.innerHTML = '';

	try {
		const response = await fetch(`${API_URL}?limit=${limit}`);

		if (!response.ok) {
			throw new Error('Erro ao carregar a lista de Pokémon.');
		}

		const data = await response.json();

		const pokemonList = await Promise.all(
			data.results.map((item) => fetchPokemonData(item.url))
		);

		pokemonList.forEach(renderPokemonCard);
	} catch (error) {
		showError('Erro ao carregar a lista. Confira sua conexão e tente novamente.');
		console.error(error);
	} finally {
		showLoading(false);
	}
}

// Cria o card de cada Pokémon.
function renderPokemonCard(pokemon) {
	const imageUrl =
		pokemon.sprites.other?.['official-artwork']?.front_default ||
		pokemon.sprites.front_default;

	const typesBadges = pokemon.types
		.map(
			(item) => `
				<span class="badge bg-secondary badge-type">
					${item.type.name}
				</span>
			`
		)
		.join('');

	const heightInMeters = (pokemon.height / 10).toFixed(1);
	const weightInKg = (pokemon.weight / 10).toFixed(1);

	const cardHTML = `
		<div class="col">
			<div
				class="card h-100 shadow-sm pokemon-card border-0"
				data-id="${pokemon.id}"
				role="button"
				tabindex="0"
				aria-label="Ver detalhes de ${pokemon.name}"
			>
				<div class="text-center p-3 bg-white rounded-top">
					${imageUrl
						? `
							<img
								src="${imageUrl}"
								class="card-img-top img-fluid"
								style="height: 160px; object-fit: contain;"
								alt="${pokemon.name}"
							>
						`
						: '<p class="text-muted">Imagem indisponível</p>'
					}
				</div>

				<div class="card-body">
					<div class="d-flex justify-content-between align-items-center mb-2">
						<h5 class="card-title text-capitalize fw-bold m-0">
							${pokemon.name}
						</h5>

						<small class="text-muted">
							#${String(pokemon.id).padStart(3, '0')}
						</small>
					</div>

					<div class="mb-3">${typesBadges}</div>

					<div class="row text-center border-top pt-2">
						<div class="col-6 border-end">
							<small class="text-muted d-block">Altura</small>
							<strong>${heightInMeters} m</strong>
						</div>

						<div class="col-6">
							<small class="text-muted d-block">Peso</small>
							<strong>${weightInKg} kg</strong>
						</div>
					</div>
				</div>
			</div>
		</div>
	`;

	pokemonGrid.insertAdjacentHTML('beforeend', cardHTML);
}

// Busca o Pokémon digitado.
async function handleSearch() {
	if (searchBtn.disabled) return;

	const query = searchInput.value.trim();

	if (!query) {
		await loadInitialPokemon();
		return;
	}

	showLoading(true);
	pokemonGrid.innerHTML = '';

	try {
		const pokemon = await fetchPokemonData(query);
		renderPokemonCard(pokemon);
	} catch (error) {
		showError(error.message);
		console.error(error);
	} finally {
		showLoading(false);
	}
}

// Controla o spinner e os campos de busca.
function showLoading(state) {
	loading.classList.toggle('d-none', !state);
	searchBtn.disabled = state;
	searchInput.disabled = state;
}

// Apresenta uma mensagem de erro.
function showError(message) {
	pokemonGrid.innerHTML = '';

	const container = document.createElement('div');
	container.className = 'col w-100';

	const alert = document.createElement('div');
	alert.className = 'alert alert-warning text-center';
	alert.setAttribute('role', 'alert');
	alert.textContent = message;

	container.appendChild(alert);
	pokemonGrid.appendChild(container);
}

// Abre e preenche o modal.
async function openPokemonModal(id) {
	const requestId = ++modalRequest;

	modalTitle.textContent = 'Carregando...';

	modalBody.innerHTML = `
		<div class="text-center py-4">
			<div class="spinner-border text-danger" role="status">
				<span class="visually-hidden">Carregando...</span>
			</div>
		</div>
	`;

	pokemonModal.show();

	try {
		const pokemon = await fetchPokemonData(id);

		if (requestId !== modalRequest) return;

		modalTitle.textContent =
			`#${String(pokemon.id).padStart(3, '0')} — ${pokemon.name}`;

		const imageUrl =
			pokemon.sprites.other?.['official-artwork']?.front_default ||
			pokemon.sprites.front_default;

		// Status base.
		const statNames = {
			hp: 'HP',
			attack: 'Ataque',
			defense: 'Defesa',
			speed: 'Velocidade'
		};

		const statsHTML = pokemon.stats
			.filter((item) => item.stat.name in statNames)
			.map((item) => {
				const value = item.base_stat;
				const percentage = Math.min((value / 255) * 100, 100);

				return `
					<div class="mb-3">
						<div class="d-flex justify-content-between mb-1">
							<span>${statNames[item.stat.name]}</span>
							<strong>${value}</strong>
						</div>

						<div
							class="progress"
							role="progressbar"
							aria-label="${statNames[item.stat.name]}"
							aria-valuenow="${value}"
							aria-valuemin="0"
							aria-valuemax="255"
						>
							<div
								class="progress-bar bg-danger"
								style="width: ${percentage}%"
							></div>
						</div>
					</div>
				`;
			})
			.join('');

		// Habilidades.
		const abilitiesHTML = pokemon.abilities
			.map(
				(item) => `
					<li class="text-capitalize">
						${item.ability.name.replaceAll('-', ' ')}
						${item.is_hidden ? '(oculta)' : ''}
					</li>
				`
			)
			.join('');

		// Som oficial.
		const cryURL = pokemon.cries?.latest || pokemon.cries?.legacy;

		const audioHTML = cryURL
			? `
				<audio controls preload="none" class="w-100" src="${cryURL}">
					Seu navegador não suporta áudio.
				</audio>
			`
			: '<p class="text-muted">Áudio indisponível.</p>';

		// Sprites normais e shiny.
		const sprites = [
			['Normal — frente', pokemon.sprites.front_default],
			['Normal — costas', pokemon.sprites.back_default],
			['Shiny — frente', pokemon.sprites.front_shiny],
			['Shiny — costas', pokemon.sprites.back_shiny]
		];

		const spritesHTML = sprites
			.map(
				([label, url]) => `
					<div class="col text-center">
						<p class="small mb-1">${label}</p>

						${url
							? `
								<img
									src="${url}"
									alt="${label}"
									width="96"
									height="96"
									class="img-fluid"
								>
							`
							: '<p class="small text-muted">Indisponível</p>'
						}
					</div>
				`
			)
			.join('');

		modalBody.innerHTML = `
			${imageUrl
				? `
					<div class="text-center mb-4">
						<img
							src="${imageUrl}"
							alt="${pokemon.name}"
							class="img-fluid"
							style="max-height: 180px;"
						>
					</div>
				`
				: ''
			}

			<h3 class="h5 mb-3">Status base</h3>
			${statsHTML}
			<p class="small text-muted">Escala das barras: 0 a 255.</p>

			<h3 class="h5 mt-4">Habilidades</h3>
			<ul>${abilitiesHTML}</ul>

			<h3 class="h5 mt-4">Som do Pokémon</h3>
			${audioHTML}

			<h3 class="h5 mt-4">Galeria de sprites</h3>
			<div class="row row-cols-2 row-cols-sm-4 g-3">
				${spritesHTML}
			</div>
		`;
	} catch (error) {
		if (requestId !== modalRequest) return;

		modalTitle.textContent = 'Erro ao carregar';
		modalBody.innerHTML = `
			<div class="alert alert-danger" role="alert">
				Não foi possível carregar os detalhes do Pokémon.
			</div>
		`;

		console.error(error);
	}
}

// Eventos de busca.
searchBtn.addEventListener('click', handleSearch);

searchInput.addEventListener('keydown', (event) => {
	if (event.key === 'Enter') {
		event.preventDefault();
		handleSearch();
	}
});

// Abre o modal ao clicar no card.
pokemonGrid.addEventListener('click', (event) => {
	const card = event.target.closest('.pokemon-card');

	if (card) {
		openPokemonModal(card.dataset.id);
	}
});

// Permite abrir o card pelo teclado.
pokemonGrid.addEventListener('keydown', (event) => {
	const card = event.target.closest('.pokemon-card');

	if (card && (event.key === 'Enter' || event.key === ' ')) {
		event.preventDefault();
		openPokemonModal(card.dataset.id);
	}
});

// Interrompe o áudio e invalida buscas pendentes ao fechar.
modalElement.addEventListener('hide.bs.modal', () => {
	modalRequest++;

	const audio = modalBody.querySelector('audio');

	if (audio) {
		audio.pause();
		audio.currentTime = 0;
	}
});

// Inicialização.
loadInitialPokemon();