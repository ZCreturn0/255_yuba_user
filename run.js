const request = require('request');
const mysql = require('mysql');

const config = require('./db.json');

const connection = mysql.createConnection(config);
connection.connect();

// 查询帖子列表
const POSTS_URL = 'https://yuba.douyu.com/wbapi/web/group/postlist';
// 回帖
const COMMENTS_URL = 'https://yuba.douyu.com/wbapi/web/post/comments';
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

// 帖子里的回复
async function getPostComments(post_id, page) {
    return new Promise((resolve, reject) => {
        request({
            url: `${COMMENTS_URL}/${post_id}`,
            method: 'GET',
            qs: {
                group_id: GROUP_ID,
                page,
                sort: 2
            }
        }, (err, response, body) => {
            if (err) {
                reject(err);
            } else {
                let json = JSON.parse(body);
                resolve(json);
            }
        });
    });
}

async function go() {
    for (let i=1; i<=2; i++) {
        let posts = await getPagePost(i);
        for (let post of posts.data) {
            // console.log(post.post_id, post.title, post.nickname, post.safe_uid);
            console.log(post.title, post.nickname);
            let comments = await getPostComments(post.post_id, 1);
            for (let comment of comments.data) {
                // console.log(comment);
                console.log('---->', comment.content, comment.nick_name);
            }
        }
        console.log('---------------------');
    }
}

go();