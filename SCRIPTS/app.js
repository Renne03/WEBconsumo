const POSTS_URL = 'https://jsonplaceholder.typicode.com/posts';
const USERS_URL = 'https://jsonplaceholder.typicode.com/users';

// Referencias al DOM
const postsContainer = document.getElementById('posts-container');
const loadingSpinner = document.getElementById('loading-spinner');
const errorMessage = document.getElementById('error-message');
const searchInput = document.getElementById('search-input');

// Referencias al modal de publicaciones
const openModalBtn = document.getElementById('open-modal-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const postModal = document.getElementById('post-modal');
const newPostForm = document.getElementById('new-post-form');
const newTitleInput = document.getElementById('new-title');
const newBodyInput = document.getElementById('new-body');

// Referencias al modal del usuario
const userModal = document.getElementById('user-modal');
const closeUserModalBtn = document.getElementById('close-user-modal-btn');
const userDetails = document.getElementById('user-details');

let allPosts = [];
let allUsers = [];

/**
 * Cargar publicaciones y usuarios
 */
async function initApp() {

    showLoading(true);
    showError(false);

    try {

        const [postsResponse, usersResponse] = await Promise.all([
            fetch(POSTS_URL),
            fetch(USERS_URL)
        ]);

        if (!postsResponse.ok || !usersResponse.ok) {
            throw new Error('Error al conectar con el servidor.');
        }

        const posts = await postsResponse.json();
        const users = await usersResponse.json();

        allUsers = users;

        allPosts = posts.map(post => {

            const author = users.find(user => user.id === post.userId);

            return {
                ...post,
                authorName: author ? author.name : 'Usuario Desconocido',
                authorId: post.userId
            };

        });

        renderPosts(allPosts);

    } catch (error) {

        console.error('Hubo un problema:', error);
        showError(true);

    } finally {

        showLoading(false);

    }
}

/**
 * Mostrar publicaciones en pantalla
 */
function renderPosts(postsToRender) {

    if (postsToRender.length === 0) {

        postsContainer.innerHTML = `
            <p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">
                No se encontraron publicaciones.
            </p>
        `;

        return;
    }

    const postsHTML = postsToRender.map(post => `

        <article
            class="post-card"
            data-user-id="${post.authorId}"
        >

            <div>
                <h2 class="post-title">${post.title}</h2>

                <p class="post-body">${post.body}</p>
            </div>

            <button
                class="post-author"
                type="button"
                data-user-id="${post.authorId}"
            >
                ✍️ ${post.authorName}
            </button>

        </article>

    `).join('');

    postsContainer.innerHTML = postsHTML;
}

/**
 * Detectar clic en cualquier parte de una tarjeta
 */
postsContainer.addEventListener('click', (e) => {

    const card = e.target.closest('.post-card');

    if (card) {

        const userId = Number(card.dataset.userId);

        const user = allUsers.find(user => user.id === userId);

        if (user) {
            showUserDetails(user);
        }

    }

});

/**
 * Mostrar información del usuario
 */
function showUserDetails(user) {

    userDetails.innerHTML = `

        <h2 class="user-name">
            👤 ${user.name}
        </h2>

        <p class="user-username">
            @${user.username}
        </p>

        <div class="user-info">

            <p>
                <strong> CORREO</strong><br>
                <a href="mailto:${user.email}">
                    ${user.email}
                </a>
            </p>

            <p>
                <strong> TELÉFONO</strong><br>
                ${user.phone}
            </p>

            <p>
                <strong> SITIO WEB</strong><br>
                <a
                    href="https://${user.website}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    ${user.website}
                </a>
            </p>

            <p>
                <strong> DIRECCIÓN</strong><br>
                ${user.address.street}, ${user.address.suite}<br>
                ${user.address.city}, ${user.address.zipcode}
            </p>

            <p>
                <strong> EMPRESA</strong><br>
                ${user.company.name}<br>
                <em>${user.company.catchPhrase}</em><br>
                <span>${user.company.bs}</span>
            </p>

        </div>

    `;

    userModal.classList.remove('hidden');
}

/**
 * Cerrar ventana del usuario
 */
closeUserModalBtn.addEventListener('click', () => {

    userModal.classList.add('hidden');

});

userModal.addEventListener('click', (e) => {

    if (e.target === userModal) {
        userModal.classList.add('hidden');
    }

});

/**
 * Abrir ventana para crear publicaciones
 */
openModalBtn.addEventListener('click', () => {

    postModal.classList.remove('hidden');

    newTitleInput.focus();

});

/**
 * Cerrar ventana de publicaciones
 */
closeModalBtn.addEventListener('click', () => {

    postModal.classList.add('hidden');

});

window.addEventListener('click', (e) => {

    if (e.target === postModal) {
        postModal.classList.add('hidden');
    }

});

/**
 * Crear nueva publicación mediante POST
 */
newPostForm.addEventListener('submit', async (e) => {

    e.preventDefault();

    const title = newTitleInput.value.trim();
    const body = newBodyInput.value.trim();

    if (!title || !body) return;

    const newPostPayload = {
        title: title,
        body: body,
        userId: 1
    };

    try {

        const response = await fetch(POSTS_URL, {

            method: 'POST',

            body: JSON.stringify(newPostPayload),

            headers: {
                'Content-type': 'application/json; charset=UTF-8'
            }

        });

        if (!response.ok) {
            throw new Error('Error al registrar la publicación.');
        }

        const createdPost = await response.json();

        createdPost.authorName = 'Tú (Autor Actual)';
        createdPost.authorId = 1;

        allPosts.unshift(createdPost);

        renderPosts(allPosts);

        newPostForm.reset();

        postModal.classList.add('hidden');

        alert('¡Publicación creada exitosamente!');

    } catch (error) {

        console.error('Error al enviar POST:', error);

        alert('No se pudo crear la publicación. Inténtalo de nuevo.');

    }

});

/**
 * Buscador de publicaciones
 */
searchInput.addEventListener('input', (e) => {

    const searchTerm = e.target.value.toLowerCase().trim();

    const filteredPosts = allPosts.filter(post =>

        post.title.toLowerCase().includes(searchTerm) ||

        post.body.toLowerCase().includes(searchTerm)

    );

    renderPosts(filteredPosts);

});

/**
 * Mostrar u ocultar cargando
 */
function showLoading(isLoading) {

    if (isLoading) {
        loadingSpinner.classList.remove('hidden');
    } else {
        loadingSpinner.classList.add('hidden');
    }

}

/**
 * Mostrar u ocultar errores
 */
function showError(hasError) {

    if (hasError) {
        errorMessage.classList.remove('hidden');
    } else {
        errorMessage.classList.add('hidden');
    }

}

/**
 * Iniciar aplicación
 */
document.addEventListener('DOMContentLoaded', initApp);