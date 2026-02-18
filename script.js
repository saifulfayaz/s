// Configuration
const LINKS_JSON_URL = 'links.json'; // Path to your links file

// State
let linksData = [];

// DOM elements
const linksContainer = document.getElementById('linksContainer');
const searchInput = document.getElementById('searchInput');
const themeToggle = document.getElementById('themeToggle');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchLinks();
    setupTheme();
    searchInput.addEventListener('input', filterLinks);
});

// Fetch links from JSON
function fetchLinks() {
    fetch(LINKS_JSON_URL)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load links');
            }
            return response.json();
        })
        .then(data => {
            linksData = data;
            renderLinks(linksData);
        })
        .catch(error => {
            console.error('Error loading links:', error);
            linksContainer.innerHTML = `<div class="no-links-message">Failed to load links. Please check the console.</div>`;
        });
}

// Render links grouped by category
function renderLinks(links) {
    if (!links || links.length === 0) {
        linksContainer.innerHTML = `<div class="no-links-message">No links found. Add some to links.json!</div>`;
        return;
    }

    // Group links by category
    const grouped = {};
    links.forEach(link => {
        const category = link.category || 'Uncategorized';
        if (!grouped[category]) {
            grouped[category] = [];
        }
        grouped[category].push(link);
    });

    // Sort categories alphabetically
    const sortedCategories = Object.keys(grouped).sort();

    // Build HTML
    let html = '';
    sortedCategories.forEach(category => {
        html += `<div class="category-section"><h2 class="category-title">${escapeHtml(category)}</h2><div class="links-grid">`;
        grouped[category].forEach(link => {
            html += createCardHtml(link);
        });
        html += `</div></div>`;
    });

    linksContainer.innerHTML = html;
}

// Create HTML for a single card
function createCardHtml(link) {
    const title = escapeHtml(link.title || 'Untitled');
    const description = escapeHtml(link.description || '');
    const url = escapeHtml(link.url || '#');
    let iconHtml = `<i class="fas fa-link"></i>`;
    if (link.icon) {
        iconHtml = `<i class="${escapeHtml(link.icon)}"></i>`;
    }
    return `
        <div class="link-card">
            <div class="card-header">
                ${iconHtml}
                <h3>${title}</h3>
            </div>
            ${description ? `<p class="link-description">${description}</p>` : ''}
            <div class="card-footer">
                <a href="${url}" class="link-button" target="_blank" rel="noopener noreferrer">
                    Visit <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        </div>
    `;
}

// Simple escape to prevent XSS
function escapeHtml(unsafe) {
    return unsafe.replace(/[&<>"]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        if (m === '"') return '&quot;';
        return m;
    });
}

// Filter links based on search input
function filterLinks() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    if (!searchTerm) {
        renderLinks(linksData);
        return;
    }

    const filtered = linksData.filter(link => {
        return link.title.toLowerCase().includes(searchTerm) ||
               (link.description && link.description.toLowerCase().includes(searchTerm)) ||
               (link.category && link.category.toLowerCase().includes(searchTerm));
    });
    renderLinks(filtered);
}

// Theme handling
function setupTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
}