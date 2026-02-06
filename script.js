// ==================== CONFIGURACIÓN ====================
// IMPORTANTE: Reemplazar con la URL de tu Google Apps Script Web App
const API_URL = 'https://script.google.com/macros/s/AKfycbxr-_2uupQNFvqt_Qo9usC1ju0HVff0K7rYIwajpWpKtDMusTAtH4OAPQ9zd2BFzr7KLg/exec';

// ==================== ESTADO DE LA APLICACIÓN ====================
let articles = [];
let currentArticleId = null;

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    // Cargar artículos desde la API
    await loadArticles();
    
    // Event listeners
    document.getElementById('back-button').addEventListener('click', showMainView);
    
    // Manejar navegación con URL hash
    window.addEventListener('hashchange', handleRouting);
    handleRouting();
}

// ==================== CARGA DE DATOS ====================
async function loadArticles() {
    try {
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error('Error al cargar los artículos');
        }
        
        const data = await response.json();
        articles = data.articles || [];
        
        // Actualizar fecha de última actualización
        if (data.lastUpdate) {
            const date = new Date(data.lastUpdate);
            document.getElementById('last-update').textContent = formatDate(date);
        }
        
        // Limitar a 6 artículos en la vista principal
        const displayArticles = articles.slice(0, 6);
        renderArticlesGrid(displayArticles);
        
    } catch (error) {
        console.error('Error:', error);
        showError('No se pudieron cargar los artículos. Por favor, intenta más tarde.');
    }
}

// ==================== RENDERIZADO ====================
function renderArticlesGrid(articlesToShow) {
    const grid = document.getElementById('articles-grid');
    grid.innerHTML = '';
    
    if (articlesToShow.length === 0) {
        grid.innerHTML = '<p class="error-message">No hay artículos disponibles.</p>';
        return;
    }
    
    articlesToShow.forEach(article => {
        const card = createArticleCard(article);
        grid.appendChild(card);
    });
}

function createArticleCard(article) {
    const card = document.createElement('div');
    card.className = 'article-card';
    card.onclick = () => showArticle(article.id);
    
    const date = new Date(article.date);
    
    card.innerHTML = `
        <img 
            src="${article.image}" 
            alt="${escapeHtml(article.title)}" 
            class="article-card-image"
            onerror="this.src='https://via.placeholder.com/800x400?text=Sin+Imagen'"
        >
        <div class="article-card-content">
            <h2 class="article-card-title">${escapeHtml(article.title)}</h2>
            <p class="article-card-date">${formatDate(date)}</p>
            <p class="article-card-summary">${escapeHtml(article.summary)}</p>
            <a href="#article-${article.id}" class="article-card-link">
                Leer más →
            </a>
        </div>
    `;
    
    return card;
}

function renderArticle(article) {
    const date = new Date(article.date);
    
    document.getElementById('article-image').src = article.image;
    document.getElementById('article-image').alt = article.title;
    document.getElementById('article-title').textContent = article.title;
    document.getElementById('article-date').textContent = formatDate(date);
    document.getElementById('article-text').textContent = article.content;
}

// ==================== NAVEGACIÓN ====================
function handleRouting() {
    const hash = window.location.hash;
    
    if (hash.startsWith('#article-')) {
        const articleId = parseInt(hash.replace('#article-', ''));
        showArticle(articleId);
    } else {
        showMainView();
    }
}

function showArticle(articleId) {
    const article = articles.find(a => a.id === articleId);
    
    if (!article) {
        console.error('Artículo no encontrado');
        showMainView();
        return;
    }
    
    currentArticleId = articleId;
    renderArticle(article);
    
    // Cambiar vista
    document.getElementById('main-view').classList.add('hidden');
    document.getElementById('article-view').classList.remove('hidden');
    
    // Scroll al inicio
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Actualizar URL
    if (window.location.hash !== `#article-${articleId}`) {
        window.location.hash = `#article-${articleId}`;
    }
}

function showMainView() {
    currentArticleId = null;
    
    // Cambiar vista
    document.getElementById('main-view').classList.remove('hidden');
    document.getElementById('article-view').classList.add('hidden');
    
    // Scroll al inicio
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Limpiar hash
    if (window.location.hash) {
        history.pushState('', document.title, window.location.pathname + window.location.search);
    }
}

// ==================== UTILIDADES ====================
function formatDate(date) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('es-ES', options);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showError(message) {
    const grid = document.getElementById('articles-grid');
    grid.innerHTML = `<p class="error-message">${escapeHtml(message)}</p>`;
}

// ==================== DATOS DE EJEMPLO (para testing sin API) ====================
// Descomentar esta función y llamarla desde initApp() para testear sin el backend
function loadMockArticles() {
    articles = [
        {
            id: 1,
            title: "Primera Noticia de Ejemplo",
            content: "Este es el contenido completo de la primera noticia. Aquí iría todo el texto del artículo que proviene del Google Doc.\n\nPuede tener múltiples párrafos y contenido extenso para mostrar cómo se ve el artículo completo.",
            summary: "Este es el contenido completo de la primera noticia. Aquí iría todo el texto del artículo que proviene del Google Doc. Puede tener múltiples párrafos y contenido...",
            date: new Date().toISOString(),
            image: "https://via.placeholder.com/800x400?text=Noticia+1"
        },
        {
            id: 2,
            title: "Segunda Noticia de Ejemplo",
            content: "Contenido de la segunda noticia con información relevante.",
            summary: "Contenido de la segunda noticia con información relevante y datos importantes para el lector...",
            date: new Date(Date.now() - 86400000).toISOString(),
            image: "https://via.placeholder.com/800x400?text=Noticia+2"
        },
        {
            id: 3,
            title: "Tercera Noticia de Ejemplo",
            content: "Más contenido interesante para la tercera publicación.",
            summary: "Más contenido interesante para la tercera publicación con detalles adicionales sobre el tema...",
            date: new Date(Date.now() - 172800000).toISOString(),
            image: "https://via.placeholder.com/800x400?text=Noticia+3"
        }
    ];
    
    renderArticlesGrid(articles.slice(0, 6));
    document.getElementById('last-update').textContent = formatDate(new Date());
}
