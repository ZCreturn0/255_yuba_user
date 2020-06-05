const request = require('request');
const fs = require('fs');
// const mysql = require('mysql');

// const config = require('./db.json');

// const connection = mysql.createConnection(config);
// connection.connect();

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

// 下载图片
async function downloadImage(url, filename) {
    return new Promise((resolve, reject) => {
        request({url})
        .pipe(
            fs.createWriteStream(`./images/${filename}`)
            .on('finish', (err) => {
                resolve(err);
            })
        );
    });
}

async function go() {
    for (let i=1; i<=2; i++) {
        let posts = await getPagePost(i);
        for (let post of posts.data) {
            // console.log(post.post_id, post.title, post.nickname, post.safe_uid);
            console.log(post.post_id);
            if (post.imglist.length) {
                let index = 1;
                for (let image of post.imglist) {
                    let reg = /\.([0-9a-z]+)(?:[\?#]|$)/i;
                    let imageUrl = image.url;
                    console.log(imageUrl, 'to download');
                    let suffix = imageUrl.match(reg)[1];
                    let filename = `${post.post_id}_${index}.${suffix}`;
                    index++;
                    await downloadImage(imageUrl, filename);
                }
            }
            // let comments = await getPostComments(post.post_id, 1);
            // for (let comment of comments.data) {
            //     // console.log(comment);
            //     // console.log('---->', comment.content, comment.nick_name);
            // }
        }
    }
}

go();