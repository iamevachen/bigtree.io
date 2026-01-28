import { store } from './store.js';


const formatDate = (isoString) => {
    const d = new Date(isoString);
    return `${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
};


export const renderDashboard = (container) => {
    const stats = store.getStats();
    const userStats = store.getUserStats(store.state.currentUser.id);
    const isAdmin = store.state.currentUser.role === 'admin';

    const html = `
        <div class="space-y-8 animate-fade-in">
            <!-- Header -->
            <div class="flex justify-between items-end">
                <div>
                    <h2 class="text-2xl font-bold text-gray-900">数据概览</h2>
                    <p class="text-gray-500 text-sm mt-1">
                        ${isAdmin ? '全营数据监控中' : '加油，向爆文冲刺！'}
                    </p>
                </div>
                ${!isAdmin ? `
                <div class="text-right">
                    <p class="text-xs text-gray-400">我的爆文率</p>
                    <p class="text-2xl font-bold text-xhs-red">${userStats.viralRate}%</p>
                </div>` : ''}
            </div>

            <!-- Stats Cards -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-soft">
                    <div class="flex items-center gap-2 mb-2">
                        <div class="p-1.5 bg-blue-50 text-blue-500 rounded-lg"><i data-lucide="file-text" class="w-4 h-4"></i></div>
                        <span class="text-xs font-medium text-gray-500">本周笔记</span>
                    </div>
                    <p class="text-2xl font-bold">${isAdmin ? stats.totalPosts : userStats.postCount}</p>
                </div>
                <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-soft">
                    <div class="flex items-center gap-2 mb-2">
                        <div class="p-1.5 bg-red-50 text-xhs-red rounded-lg"><i data-lucide="flame" class="w-4 h-4"></i></div>
                        <span class="text-xs font-medium text-gray-500">爆文数量</span>
                    </div>
                    <p class="text-2xl font-bold">${isAdmin ? stats.viralPosts : userStats.viralCount}</p>
                </div>
                <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-soft col-span-2 md:col-span-2">
                     <div class="flex items-center gap-2 mb-2">
                        <div class="p-1.5 bg-green-50 text-green-500 rounded-lg"><i data-lucide="eye" class="w-4 h-4"></i></div>
                        <span class="text-xs font-medium text-gray-500">总阅读量</span>
                    </div>
                    <p class="text-2xl font-bold">${(isAdmin ? stats.totalReads : userStats.posts.reduce((a,b)=>a+b.reads,0)).toLocaleString()}</p>
                </div>
            </div>

            <!-- Chart Section -->
            <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-soft">
                <h3 class="font-bold text-gray-800 mb-4">流量趋势 (本周)</h3>
                <div class="h-64">
                    <canvas id="trendChart"></canvas>
                </div>
            </div>

            <!-- Leaderboard (Admin Only or Self Rank) -->
            <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-soft">
                 <h3 class="font-bold text-gray-800 mb-4">🏆 爆文榜单 Top 5</h3>
                 <div class="space-y-4">
                    ${stats.topPosts.map((post, idx) => `
                        <div class="flex items-center gap-4 border-b border-gray-50 last:border-0 pb-3 last:pb-0">
                            <span class="text-lg font-bold text-gray-300 w-6">#${idx+1}</span>
                            <img src="${post.cover}" class="w-12 h-12 rounded-lg object-cover bg-gray-200">
                            <div class="flex-1 min-w-0">
                                <h4 class="text-sm font-medium text-gray-900 truncate">${post.title}</h4>
                                <div class="flex items-center gap-2 mt-1">
                                    <span class="text-xs text-gray-500">${post.userName}</span>
                                    <span class="text-xs bg-red-50 text-xhs-red px-1.5 rounded flex items-center gap-0.5">
                                        <i data-lucide="eye" class="w-3 h-3"></i> ${post.reads > 10000 ? (post.reads/10000).toFixed(1)+'w' : post.reads}
                                    </span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                 </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    

    setTimeout(() => initChart('trendChart'), 0);
};


export const renderWall = (container) => {
    const posts = store.state.posts.filter(p => p.status === 'viral');
    
    const html = `
        <div class="space-y-6">
            <div class="text-center py-6">
                <h2 class="text-3xl font-bold text-gray-900 tracking-tight">🔥 爆文展示墙</h2>
                <p class="text-gray-500 mt-2">只有达到阈值（阅读>1000）的优质内容才会出现在这里</p>
            </div>
            
            <div class="masonry-grid">
                ${posts.map(post => `
                    <div class="masonry-item bg-white rounded-xl overflow-hidden shadow-float hover-lift group cursor-pointer" onclick="window.app.editPost('${post.id}')">
                        <div class="relative">
                            <img src="${post.cover}" class="w-full h-auto object-cover">
                            <div class="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                <i data-lucide="eye" class="w-3 h-3"></i> ${post.reads}
                            </div>
                        </div>
                        <div class="p-4">
                            <h3 class="font-bold text-gray-900 text-sm leading-snug mb-2 line-clamp-2">${post.title}</h3>
                            <div class="flex justify-between items-center mt-3">
                                <div class="flex items-center gap-2">
                                    <img src="${post.userAvatar}" class="w-5 h-5 rounded-full">
                                    <span class="text-xs text-gray-500 truncate max-w-[80px]">${post.userName}</span>
                                </div>
                                <div class="flex gap-2 text-gray-400">
                                    <div class="flex items-center gap-0.5 text-xs"><i data-lucide="heart" class="w-3 h-3"></i> ${post.likes}</div>
                                </div>
                            </div>
                            ${post.review ? `
                            <div class="mt-3 bg-gray-50 p-2 rounded text-xs text-gray-600 border-l-2 border-xhs-red">
                                "${post.review}"
                            </div>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
            ${posts.length === 0 ? '<div class="text-center text-gray-400 py-10">暂无爆文，加油！</div>' : ''}
        </div>
    `;
    container.innerHTML = html;
};


export const renderTable = (container) => {
    const posts = store.state.posts;
    const isMobile = window.innerWidth < 768;

    if (isMobile) {

        const html = `
            <div class="space-y-4 pb-20">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="font-bold text-xl">数据明细</h2>
                    <button onclick="window.app.openPostModal()" class="text-sm bg-gray-900 text-white px-3 py-1.5 rounded-lg">新增</button>
                </div>
                ${posts.map(post => `
                    <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm" onclick="window.app.editPost('${post.id}')">
                        <div class="flex gap-3">
                            <div class="w-16 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                                <img src="${post.cover}" class="w-full h-full object-cover">
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="flex justify-between items-start">
                                    <h4 class="text-sm font-bold text-gray-900 truncate pr-2">${post.title}</h4>
                                    ${post.status === 'viral' ? '<span class="text-[10px] bg-red-100 text-red-600 px-1.5 rounded">爆</span>' : ''}
                                </div>
                                <p class="text-xs text-gray-400 mt-1">${formatDate(post.publishDate)}</p>
                                <div class="grid grid-cols-4 gap-2 mt-3 text-center">
                                    <div class="bg-gray-50 rounded py-1">
                                        <p class="text-[10px] text-gray-400">阅读</p>
                                        <p class="text-xs font-bold text-gray-800">${post.reads}</p>
                                    </div>
                                    <div class="bg-gray-50 rounded py-1">
                                        <p class="text-[10px] text-gray-400">点赞</p>
                                        <p class="text-xs font-bold text-gray-800">${post.likes}</p>
                                    </div>
                                    <div class="bg-gray-50 rounded py-1">
                                        <p class="text-[10px] text-gray-400">评论</p>
                                        <p class="text-xs font-bold text-gray-800">${post.comments}</p>
                                    </div>
                                    <div class="bg-gray-50 rounded py-1">
                                        <p class="text-[10px] text-gray-400">收藏</p>
                                        <p class="text-xs font-bold text-gray-800">${post.collects}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        container.innerHTML = html;
    } else {

        const html = `
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div class="flex justify-between p-4 border-b border-gray-100 bg-gray-50">
                    <div class="flex gap-2">
                        <button class="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50">导出Excel</button>
                        <select class="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm outline-none">
                            <option>所有类型</option>
                            <option>Flowith实操</option>
                            <option>听课笔记</option>
                        </select>
                    </div>
                    <button onclick="window.app.openPostModal()" class="px-4 py-1.5 bg-xhs-red text-white text-sm font-medium rounded-lg hover:bg-red-600 flex items-center gap-2">
                        <i data-lucide="plus" class="w-4 h-4"></i> 新增笔记
                    </button>
                </div>
                <div class="overflow-x-auto max-h-[80vh]">
                    <table class="w-full text-left border-collapse data-table">
                        <thead class="text-xs text-gray-500 uppercase">
                            <tr>
                                <th class="px-6 py-3 font-medium">学员</th>
                                <th class="px-6 py-3 font-medium">标题/链接</th>
                                <th class="px-6 py-3 font-medium">发布时间</th>
                                <th class="px-6 py-3 font-medium">数据 (阅/赞/藏/评)</th>
                                <th class="px-6 py-3 font-medium">状态</th>
                                <th class="px-6 py-3 font-medium text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100 text-sm">
                            ${posts.map(post => `
                                <tr class="hover:bg-gray-50 transition-colors group">
                                    <td class="px-6 py-4">
                                        <div class="flex items-center gap-2">
                                            <img src="${post.userAvatar}" class="w-8 h-8 rounded-full">
                                            <span class="font-medium text-gray-900">${post.userName}</span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 max-w-[200px]">
                                        <div class="truncate font-medium text-gray-900">${post.title}</div>
                                        <a href="${post.link}" target="_blank" class="text-blue-500 text-xs hover:underline flex items-center gap-1">
                                            查看链接 <i data-lucide="external-link" class="w-3 h-3"></i>
                                        </a>
                                    </td>
                                    <td class="px-6 py-4 text-gray-500">
                                        ${formatDate(post.publishDate)}
                                        ${new Date() - new Date(post.publishDate) > 86400000 && post.reads === 0 ? 
                                            '<span class="ml-2 w-2 h-2 rounded-full bg-red-500 inline-block" title="待更新"></span>' : ''}
                                    </td>
                                    <td class="px-6 py-4">
                                        <div class="flex gap-3 font-mono text-gray-600">
                                            <span title="阅读">👀 ${post.reads}</span>
                                            <span title="点赞">❤️ ${post.likes}</span>
                                            <span title="收藏">⭐ ${post.collects}</span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4">
                                        ${post.status === 'viral' ? 
                                            '<span class="bg-red-100 text-xhs-red px-2 py-1 rounded-full text-xs font-bold">爆款</span>' : 
                                            '<span class="text-gray-400 text-xs">常规</span>'}
                                    </td>
                                    <td class="px-6 py-4 text-right">
                                        <button onclick="window.app.editPost('${post.id}')" class="text-gray-400 hover:text-xhs-red">
                                            <i data-lucide="edit-3" class="w-4 h-4"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        container.innerHTML = html;
    }
};

const initChart = (canvasId) => {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: '每日总阅读量',
                data: [1200, 1900, 3000, 2500, 5000, 8000, 12000],
                borderColor: '#FF2442',
                backgroundColor: 'rgba(255, 36, 66, 0.05)',
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true, grid: { borderDash: [2, 4] } },
                x: { grid: { display: false } }
            }
        }
    });
};
