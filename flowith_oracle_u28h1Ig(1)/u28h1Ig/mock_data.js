export const MOCK_USERS = [
    { id: 'u1', name: 'Admin', role: 'admin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin' },
    { id: 'u2', name: '小红薯_007', role: 'member', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=u2' },
    { id: 'u3', name: 'AIGC探索者', role: 'member', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=u3' },
    { id: 'u4', name: '美妆大拿', role: 'member', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=u4' },
    { id: 'u5', name: '知识博主_李', role: 'member', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=u5' },
    { id: 'u6', name: '摄影师Jack', role: 'member', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=u6' },
];

const TITLES = [
    "3分钟学会AI绘画，保姆级教程！",
    "小红书涨粉的5个底层逻辑（纯干货）",
    "Flowith实操：如何用AI写出爆款文案？",
    "听课笔记：大V是怎么做选题的",
    "避坑指南：新手做号最容易犯的10个错",
    "月入过万的副业推荐，亲测有效",
    "职场人必备的3款效率工具",
    "沉浸式学习 vlogs 01"
];

const COVERS = [
    "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=500&fit=crop",
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=500&fit=crop",
    "https://images.unsplash.com/photo-1542206395-9feb3edaa68d?w=400&h=500&fit=crop",
    "https://images.unsplash.com/photo-1512314889357-e157c22f938d?w=400&h=500&fit=crop"
];

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export const generateMockPosts = () => {
    let posts = [];

    for (let i = 0; i < 40; i++) {
        const user = MOCK_USERS[randomInt(1, MOCK_USERS.length - 1)];
        const isViral = Math.random() > 0.8;
        const reads = isViral ? randomInt(2000, 50000) : randomInt(50, 800);
        

        const date = new Date();
        date.setDate(date.getDate() - randomInt(0, 14));

        posts.push({
            id: 'p' + i,
            userId: user.id,
            userName: user.name,
            userAvatar: user.avatar,
            title: TITLES[randomInt(0, TITLES.length - 1)],
            link: 'http://xhslink.com/mock' + i,
            publishDate: date.toISOString(),
            type: ['flowith', 'lecture', 'other'][randomInt(0, 2)],
            reads: reads,
            likes: Math.floor(reads * 0.1),
            collects: Math.floor(reads * 0.05),
            comments: Math.floor(reads * 0.01),
            cover: COVERS[randomInt(0, COVERS.length - 1)],
            review: isViral ? "标题情绪价值拉满，封面用了对比色。" : "",
            status: isViral ? 'viral' : 'normal',
            lastUpdated: date.toISOString()
        });
    }
    return posts;
};
