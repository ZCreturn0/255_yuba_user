const request = require('request');

// 查询帖子列表
const POSTS_URL = 'https://yuba.douyu.com/wbapi/web/group/postlist';
const GROUP_ID = 765880;

// 获取对应页码的帖子信息
async function getPagePost(page) {
    return new Promise((resolve, reject) => {
        request({
            url: `${POSTS_URL}`,
            method: 'GET',
            qs: {
                group_id: GROUP_ID,
                page,
                sort: 2
            }
        }, (err, response, body) => {
            if (err) {
                reject(err);
            }
            else {
                let json = JSON.parse(body);
                resolve(json);
            }
        });
    });
}

async function go() {
    for (let i=1; i<=10; i++) {
        let json = await getPagePost(i);
        for (let post of json.data) {
            console.log(post.post_id, post.title, post.nickname, post.safe_uid);
        }
        console.log('---------------------');
    }
}

go();