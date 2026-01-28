import { store } from './store.js';
import { renderDashboard, renderWall, renderTable } from './ui.js';

class App {
    constructor() {
        this.container = document.getElementById('content-area');
        this.currentHash = '';
        this.activePostId = null;
        

        window.app = this;
        

        window.addEventListener('hashchange', () => this.handleRoute());
        

        store.subscribe(() => this.handleRoute());
        

        this.bindFileUpload();
    }

    login(role) {
        const user = store.login(role);
        document.getElementById('login-modal').classList.add('opacity-0', 'pointer-events-none');
        document.getElementById('app-container').classList.remove('hidden');
        

        document.getElementById('user-name-display').innerText = user.name;
        document.getElementById('user-role-display').innerText = role === 'admin' ? '管理员' : '训练营成员';


        if (!window.location.hash) {
            window.location.hash = '#dashboard';
        } else {
            this.handleRoute();
        }
    }

    handleRoute() {
        const hash = window.location.hash || '#dashboard';
        this.currentHash = hash;
        

        document.querySelectorAll('.nav-item, .mobile-nav-item').forEach(el => {
            el.classList.remove('active');
            if (el.getAttribute('href') === hash) el.classList.add('active');
        });


        if (hash === '#dashboard') renderDashboard(this.container);
        else if (hash === '#wall') renderWall(this.container);
        else if (hash === '#table') renderTable(this.container);
        

        lucide.createIcons();
    }


    openPostModal(isEdit = false) {
        const modal = document.getElementById('post-modal');
        modal.classList.remove('hidden');

        setTimeout(() => modal.classList.add('modal-active'), 10);
        
        const form = document.getElementById('post-form');
        form.reset();

        const title = document.getElementById('modal-title');
        const updateSection = document.getElementById('data-update-section');

        if (isEdit && this.activePostId) {
            title.innerText = "更新数据 / 上传凭证";
            updateSection.classList.remove('hidden');
            

            const post = store.state.posts.find(p => p.id === this.activePostId);
            if (post) {
                form.querySelector('[name="title"]').value = post.title;

                const dateVal = new Date(post.publishDate);
                dateVal.setMinutes(dateVal.getMinutes() - dateVal.getTimezoneOffset());
                form.querySelector('[name="publishDate"]').value = dateVal.toISOString().slice(0, 16);
                
                form.querySelector('[name="reads"]').value = post.reads;
                form.querySelector('[name="likes"]').value = post.likes;
                form.querySelector('[name="collects"]').value = post.collects;
                form.querySelector('[name="comments"]').value = post.comments;
                form.querySelector('[name="review"]').value = post.review || '';
                

                const radio = form.querySelector(`input[name="type"][value="${post.type}"]`);
                if(radio) radio.checked = true;


                if (post.cover) {
                    const preview = document.getElementById('file-preview');
                    preview.style.backgroundImage = `url(${post.cover})`;
                    preview.classList.remove('hidden');
                    document.getElementById('file-placeholder').classList.add('hidden');
                }
            }
        } else {
            title.innerText = "录入新笔记";



            updateSection.classList.remove('hidden'); // Simplified for this demo
            this.activePostId = null;
            document.getElementById('file-preview').classList.add('hidden');
            document.getElementById('file-placeholder').classList.remove('hidden');
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('modal-active');
        setTimeout(() => modal.classList.add('hidden'), 300);
    }

    editPost(id) {
        this.activePostId = id;
        this.openPostModal(true);
    }


    parseLink() {
        const input = document.getElementById('smart-link');
        const url = input.value;
        if (url.includes('xiaohongshu.com') || url.includes('xhslink')) {

            document.querySelector('[name="title"]').value = "自动解析：这是一个模拟的小红书标题";
            

            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            document.querySelector('[name="publishDate"]').value = now.toISOString().slice(0, 16);
            
            this.showToast("解析成功");
        } else {
            this.showToast("链接格式无效 (模拟: 需含xiaohongshu)");
        }
    }

    bindFileUpload() {
        const input = document.getElementById('file-input');
        const preview = document.getElementById('file-preview');
        const placeholder = document.getElementById('file-placeholder');

        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    preview.style.backgroundImage = `url(${e.target.result})`;
                    preview.classList.remove('hidden');
                    placeholder.classList.add('hidden');
                };
                reader.readAsDataURL(file);
            }
        });


        document.getElementById('post-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            

            ['reads', 'likes', 'collects', 'comments'].forEach(k => {
                data[k] = parseInt(data[k]) || 0;
            });


            const previewStyle = document.getElementById('file-preview').style.backgroundImage;
            if (previewStyle) {
                data.cover = previewStyle.slice(5, -2);
            }

            if (this.activePostId) {
                store.updatePost(this.activePostId, data);
                this.showToast("更新成功");
            } else {
                store.addPost(data);
                this.showToast("发布录入成功");
            }
            this.closeModal('post-modal');
        });
    }

    showToast(msg) {
        const toast = document.getElementById('toast');
        document.getElementById('toast-msg').innerText = msg;
        toast.classList.remove('opacity-0', 'translate-y-[-20px]');
        setTimeout(() => {
            toast.classList.add('opacity-0', 'translate-y-[-20px]');
        }, 3000);
    }
}


document.getElementById('mobile-menu-btn').addEventListener('click', () => {
    alert("Mobile Sidebar Menu would open here. Using bottom nav for main navigation.");
});


new App();
