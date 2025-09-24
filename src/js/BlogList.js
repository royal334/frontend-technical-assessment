/**
 * Blog List Component (partial implementation)
 * Candidates must complete: sorting, filtering, search, robust error handling, and caching.
 */
export class BlogList {
    constructor(container) {
        this.container = container;
        this.listContainer = container.querySelector('.blog-list-content');
        this.loadingIndicator = container.querySelector('.loading-indicator');
        this.errorContainer = container.querySelector('.error-container');

        this.sortSelect = container.querySelector('.sort-select');
        this.filterSelect = container.querySelector('.filter-select');
        this.searchInput = container.querySelector('.search-input');

        this.apiUrl = 'https://frontend-blog-lyart.vercel.app/blogsData.json';
        this.items = [];
        this.filteredItems = [];
        this.page = 1;
        this.perPage = 10;

        // Cache storage
        this.cache = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes

        // Current state
        this.currentSort = '';
        this.currentFilter = '';
        this.currentSearch = '';

        // Bind handlers
        this.onSortChange = this.onSortChange.bind(this);
        this.onFilterChange = this.onFilterChange.bind(this);
        this.onSearchInput = this.onSearchInput.bind(this);
    }

    async init() {
        try {
            this.showLoading();
            await this.fetchData();
            this.setupEventListeners();
            this.render();
        } catch (err) {
            this.showError(err);
        } finally {
            this.hideLoading();
        }
    }

    async fetchData() {
        try {
            // Check cache first
            const cachedData = this.cache.get(this.apiUrl);
            if (cachedData && Date.now() - cachedData.timestamp < this.cacheExpiry) {
                this.items = cachedData.data;
                this.filteredItems = [...cachedData.data];
                return;
            }

            // Fetch with retry logic
            let retries = 3;
            let lastError;

            while (retries > 0) {
                try {
                    const res = await fetch(this.apiUrl);
                    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                    const data = await res.json();
                    
                    if (!Array.isArray(data)) throw new Error('Unexpected API response');
                    
                    // Store in cache
                    this.cache.set(this.apiUrl, {
                        data,
                        timestamp: Date.now()
                    });

                    this.items = data;
                    this.filteredItems = [...data];
                    return;
                } catch (error) {
                    lastError = error;
                    retries--;
                    if (retries > 0) {
                        await new Promise(resolve => setTimeout(resolve, 1000 * (3 - retries)));
                    }
                }
            }
            
            throw lastError;
        } catch (error) {
            throw new Error(`Failed to fetch blogs: ${error.message}`);
        }
    }

    setupEventListeners() {
        this.sortSelect?.addEventListener('change', this.onSortChange);
        this.filterSelect?.addEventListener('change', this.onFilterChange);
        let t;
        this.searchInput?.addEventListener('input', (e) => {
            clearTimeout(t);
            t = setTimeout(() => this.onSearchInput(e), 250);
        });
    }

    render() {
        const end = this.page * this.perPage;
        const slice = this.filteredItems.slice(0, end);
        this.listContainer.innerHTML = slice.map(item => `
            <article class=\"blog-item\">\n                <img src=\"${item.image}\" alt=\"\" class=\"blog-image\" />\n                <div class=\"blog-content\">\n                    <h3 class=\"blog-title\">${item.title}</h3>\n                    <div class=\"blog-meta\">\n                        <span class=\"blog-author\">${item.author}</span>\n                        <time class=\"blog-date\">${new Date(item.published_date).toLocaleDateString()}</time>\n                        <span class=\"blog-reading-time\">${item.reading_time}</span>\n                    </div>\n                    <p class=\"blog-excerpt\">${item.content}</p>\n                    <div class=\"blog-tags\">${(item.tags || []).map(t => `<span class=\"tag\">${t}</span>`).join('')}</div>\n                </div>\n            </article>
        `).join('');

        if (slice.length === 0) {
            this.listContainer.innerHTML = '<p class="no-results">No blogs found</p>';
        }
    }

    onSortChange(e) {
        const by = e.target.value;
        this.currentSort = by;
        
        if (by) {
            this.filteredItems.sort((a, b) => {
                switch (by) {
                    case 'date':
                        return new Date(b.published_date) - new Date(a.published_date);
                    case 'reading_time':
                        return parseInt(b.reading_time) - parseInt(a.reading_time);
                    case 'category':
                        return a.category.localeCompare(b.category);
                    default:
                        return 0;
                }
            });
        }
        
        this.page = 1;
        this.render();
    }

    onFilterChange(e) {
        const val = e.target.value;
        this.currentFilter = val;
        
        if (val) {
            this.filteredItems = this.items.filter(item => {
                return item.category === val || (item.tags && item.tags.includes(val));
            });
        } else {
            this.filteredItems = [...this.items];
        }

        // Reapply current search if exists
        if (this.currentSearch) {
            this.filteredItems = this.filteredItems.filter(item =>
                item.title.toLowerCase().includes(this.currentSearch)
            );
        }

        // Reapply current sort if exists
        if (this.currentSort) {
            this.onSortChange({ target: { value: this.currentSort } });
        }
        
        this.page = 1;
        this.render();
    }

    onSearchInput(e) {
        const q = (e.target.value || '').toLowerCase();
        this.currentSearch = q;
        
        if (q) {
            this.filteredItems = this.items.filter(item =>
                item.title.toLowerCase().includes(q)
            );
            
            // Reapply current filter if exists
            if (this.currentFilter) {
                this.filteredItems = this.filteredItems.filter(item =>
                    item.category === this.currentFilter || 
                    (item.tags && item.tags.includes(this.currentFilter))
                );
            }
            
            // Reapply current sort if exists
            if (this.currentSort) {
                this.onSortChange({ target: { value: this.currentSort } });
            }
        } else {
            this.filteredItems = [...this.items];
            
            // Reapply current filter if exists
            if (this.currentFilter) {
                this.onFilterChange({ target: { value: this.currentFilter } });
            }
        }
        
        this.page = 1;
        this.render();
    }

    showLoading() {
        this.loadingIndicator?.classList.remove('hidden');
    }
    hideLoading() {
        this.loadingIndicator?.classList.add('hidden');
    }
    showError(err) {
        if (!this.errorContainer) return;
        this.errorContainer.classList.remove('hidden');
        this.errorContainer.textContent = `Error: ${err.message}`;
    }
}

