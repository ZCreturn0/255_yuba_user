/**
 * @description 鱼吧图片下载
 */

const request = require('request');
const fs = require('fs');

// 总页数
const TOTAL_PAGE = 1979;
// const mysql = require('mysql');

// const config = require('./db.json');

// const connection = mysql.createConnection(config);
// connection.connect();

// 查询帖子列表
const POSTS_URL = 'https://yuba.douyu.com/wbapi/web/group/postlist';
// 回帖
const COMMENTS_URL = 'https://yuba.douyu.com/wbapi/web/post/comments';
const GROUP_ID = 765880;

// 上次程序停止时的帖子 id
const LAST_COMMENT_ID = '';

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
            fs.createWriteStream(`./images8/${filename}`)
            .on('finish', (err) => {
                resolve(err);
            })
        );
    });
}

async function sleep(ms) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
}

async function go() {
    let currentDownload = 0;
    let canStart = false;
    for (let i = 1966; i <= TOTAL_PAGE; i++) {
        console.log('page:', i);
        // 获取对应页码的帖子
        let posts = await getPagePost(i);
        let postNum = 0;
        let pageNum = 0;
        for (let post of posts.data) {
            console.log(post.post_id);
            if (post.post_id == LAST_COMMENT_ID) {
                canStart = true;
            }
            if (canStart) {
                let postDownload = 0;
                // 查看帖子是否包含图片
                if (post.imglist.length) {
                    let index = 1;
                    for (let image of post.imglist) {
                        let reg = /\.([0-9a-z]+)(?:[\?#]|$)/i;
                        let imageUrl = image.url;
                        console.log('post image:', imageUrl);
                        // 扩展名
                        let suffix = imageUrl.match(reg)[1];
                        let filename = `${post.post_id}_${index}.${suffix}`;
                        index++;
                        await downloadImage(imageUrl, filename);
                        postDownload++;
                        pageNum++;
                    }
                    console.log(post.post_id, 'downloaded', postDownload);
                    currentDownload += postDownload;
                    console.log('currentDownload:', currentDownload);
                }
                let page = 1;
                // 帖子的评论
                let comments = await getPostComments(post.post_id, page);
                async function downloadCommentsImage(comments) {
                    let commentDownload = 0;
                    for (let comment of comments.data) {
                        let urlReg = /url=\"([^\'\"]*)\"/i;
                        let urls = comment.content.match(urlReg);
                        let index = 1;
                        if (urls && urls.length) {
                            let imgUrl = urls[1];
                            let reg = /\.([0-9a-z]+)(?:[\?#]|$)/i;
                            let suffix = imgUrl.match(reg) && imgUrl.match(reg)[1];
                            let filename = `${post.post_id}_${comment.floor}_${index}.${suffix}`;
                            if (~imgUrl.indexOf('img.douyucdn.cn')) {
                                console.log('------------> reply image:', `page: ${page}`, imgUrl);
                                await downloadImage(imgUrl, filename);
                                commentDownload++;
                                pageNum++;
                            }
                        }
                    }
                    console.log(post.post_id, 'comments downloaded', commentDownload);
                    currentDownload += commentDownload;
                    console.log('currentDownload:', currentDownload);
                    await sleep(1000);
                }
                await downloadCommentsImage(comments);
                while (page < comments.page_total) {
                    page++;
                    comments = await getPostComments(post.post_id, page);
                    await downloadCommentsImage(comments);
                }
                postNum++;
                console.log('page:', i, ',', 'post:', postNum);
            }
        }
        console.log('page download:', pageNum);
    }
}

go();