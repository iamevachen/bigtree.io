import { MOCK_USERS, generateMockPosts } from './mock_data.js';

class Store {
    constructor() {
        this.state = {
            currentUser: null,
            posts: [],
            config: {
                viralThreshold: 1000 // Reads > 1000 = Viral
            }
        };
        this.listeners = [];
        this.init();
    }

    init() {

        const savedPosts = localStorage.getItem('xhs_posts');
        if (savedPosts) {
            this.state.posts = JSON.parse(savedPosts);
        } else {
            this.state.posts = generateMockPosts();
            this.save();
        }
    }

    save() {
        localStorage.setItem('xhs_posts', JSON.stringify(this.state.posts));
        this.notify();
    }

    subscribe(listener) {
        this.listeners.push(listener);
    }

    notify() {
        this.listeners.forEach(cb => cb(this.state));
    }

    login(role) {

        if (role === 'admin') {
            this.state.currentUser = MOCK_USERS[0];
        } else {
            this.state.currentUser = MOCK_USERS[1]; // Log in as "小红薯_007"
        }
        return this.state.currentUser;
    }

    addPost(postData) {
        const newPost = {
            id: 'p' + Date.now(),
            userId: this.state.currentUser.id,
            userName: this.state.currentUser.name,
            userAvatar: this.state.currentUser.avatar,
            reads: 0,
            likes: 0,
            collects: 0,
            comments: 0,
            status: 'normal',
            lastUpdated: new Date().toISOString(),
            cover: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=500&fit=crop', // Default placeholder
            ...postData
        };
        this.state.posts.unshift(newPost);
        this.checkViralStatus(newPost);
        this.save();
    }

    updatePost(id, data) {
        const index = this.state.posts.findIndex(p => p.id === id);
        if (index !== -1) {
            this.state.posts[index] = { ...this.state.posts[index], ...data, lastUpdated: new Date().toISOString() };
            this.checkViralStatus(this.state.posts[index]);
            this.save();
        }
    }

    checkViralStatus(post) {

        if (post.reads >= this.state.config.viralThreshold || 
           (post.likes + post.collects) >= (this.state.config.viralThreshold / 10)) {
            post.status = 'viral';
        } else {
            post.status = 'normal';
        }
    }

    getStats() {

        const totalPosts = this.state.posts.length;
        const viralPosts = this.state.posts.filter(p => p.status === 'viral').length;
        const totalReads = this.state.posts.reduce((acc, curr) => acc + (curr.reads || 0), 0);
        

        const topPosts = [...this.state.posts].sort((a,b) => b.reads - a.reads).slice(0, 5);

        return { totalPosts, viralPosts, totalReads, topPosts };
    }

    getUserStats(userId) {
        const userPosts = this.state.posts.filter(p => p.userId === userId);
        const viralCount = userPosts.filter(p => p.status === 'viral').length;
        const viralRate = userPosts.length ? Math.round((viralCount / userPosts.length) * 100) : 0;
        return { 
            postCount: userPosts.length, 
            viralCount, 
            viralRate,
            posts: userPosts 
        };
    }
}

export const store = new Store();
