/**
 * Admin View - Simple admin panel for managing localities
 */

class AdminView {
    constructor(container) {
        this.container = container;
        this.isAuthenticated = false;
    }

    async render() {
        // Check authentication
        this.isAuthenticated = localStorage.getItem('tvm_admin_auth') === 'true';

        if (!this.isAuthenticated) {
            this.renderLogin();
        } else {
            await this.renderAdmin();
        }
    }

    renderLogin() {
        this.container.innerHTML = `
      <div class="container" style="max-width: 500px;">
        <div class="card text-center fade-in">
          <h2 style="margin-bottom: 1.5rem;">🔐 Admin Login</h2>
          <input 
            type="password" 
            id="admin-password" 
            placeholder="Enter admin password"
            style="width: 100%; padding: 1rem; background: rgba(255,255,255,0.05); border: 1px solid var(--border); border-radius: 0.5rem; color: var(--text-primary); margin-bottom: 1rem; font-size: 1rem;"
          />
          <button class="btn btn-primary" id="login-btn">Login</button>
          <p class="text-muted mt-2" style="font-size: 0.875rem;">
            Default password: admin123
          </p>
        </div>
      </div>
    `;

        document.getElementById('login-btn').addEventListener('click', () => {
            const password = document.getElementById('admin-password').value;
            if (password === 'admin123') {
                localStorage.setItem('tvm_admin_auth', 'true');
                this.render();
            } else {
                alert('Invalid password');
            }
        });
    }

    async renderAdmin() {
        const localitiesData = await dataManager.loadLocalities();

        this.container.innerHTML = `
      <div class="container">
        <div class="fade-in" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
          <h2 class="rankings-title" style="margin: 0;">⚙️ Admin Panel</h2>
          <button class="btn btn-secondary" id="logout-btn">Logout</button>
        </div>

        <div class="card fade-in">
          <h3 style="margin-bottom: 1.5rem;">Manage Localities</h3>
          
          <div style="margin-bottom: 2rem;">
            <button class="btn btn-primary" id="add-locality-btn">
              + Add New Locality
            </button>
          </div>

          <div id="localities-list">
            ${localitiesData.entries.map(loc => this.renderLocalityItem(loc)).join('')}
          </div>
        </div>

        <div class="card mt-2 fade-in">
          <h3>Quick Actions</h3>
          <div style="display: flex; gap: 1rem; margin-top: 1rem; flex-wrap: wrap;">
            <button class="btn btn-secondary" onclick="alert('Export feature coming soon!')">
              📥 Export Data (JSON)
            </button>
            <button class="btn btn-secondary" onclick="alert('Import feature coming soon!')">
              📤 Import Data
            </button>
            <button class="btn btn-secondary" id="clear-cache-btn">
              🗑️ Clear Cache
            </button>
          </div>
        </div>
      </div>
    `;

        this.attachAdminListeners();
    }

    renderLocalityItem(locality) {
        return `
      <div style="padding: 1rem; background: rgba(255,255,255,0.03); border-radius: 0.5rem; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h4 style="margin-bottom: 0.25rem;">${locality.name}</h4>
          <p class="text-muted" style="font-size: 0.875rem;">${locality.description.substring(0, 80)}...</p>
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn btn-secondary" style="padding: 0.5rem 1rem;" onclick="alert('Edit feature coming in next update!')">
            Edit
          </button>
          <button class="btn btn-secondary" style="padding: 0.5rem 1rem; background: rgba(244, 63, 94, 0.1); border-color: rgba(244, 63, 94, 0.3);" onclick="alert('Delete feature coming soon!')">
            Delete
          </button>
        </div>
      </div>
    `;
    }

    attachAdminListeners() {
        document.getElementById('logout-btn').addEventListener('click', () => {
            localStorage.removeItem('tvm_admin_auth');
            this.render();
        });

        document.getElementById('add-locality-btn').addEventListener('click', () => {
            alert('Add locality form coming in next update!\nFor now, you can edit data/localities.json directly.');
        });

        document.getElementById('clear-cache-btn').addEventListener('click', () => {
            dataManager.clearCache();
            alert('Cache cleared! Refresh the page to reload data.');
        });
    }
}
