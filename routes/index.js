var express = require('express');
var router = express.Router();
const cors = require("cors");
const base64 = require("image-to-base64");
const axios = require("axios")
const https = require("https");
const apiStory = "https://sssinstagram.com/api/ig/story"
const apiHighlight = "https://sssinstagram.com/api/ig/highlightStories/highlight:"
const apiPost = "https://apihut.in/api/download/videos";
const http = require('http');

/* GET home page. */
// router.get('/', function (req, res, next) {
//     res.render('index', {title: 'Express'});
// });
// utils
const imgUrlToBase64 = async (url) => {
    const res = await base64(url);
    return `data:image/jpeg;base64,${res}`;
};

function extractInstagramCode(url) {
    // Tạo đối tượng URL từ đường link
    let urlObj = new URL(url);

    // Lấy pathname từ URL (phần sau domain)
    let pathname = urlObj.pathname;

    // Tách các phần của đường dẫn thành mảng
    let pathSegments = pathname.split('/');

    // Phần code cần lấy thường nằm ở phần thứ 3 của đường dẫn (index 2)
    return pathSegments[2] || '';
}

const NodeCache = require('node-cache');
const url = require("node:url");
const {json} = require("express");
const test = require("node:test");
const imageCache = new NodeCache({stdTTL: 600, checkperiod: 120});

router.get('/proxy-image', async (req, res) => {
    try {
        const url = req.query.url;
        const cachedImage = imageCache.get(url);

        if (cachedImage) {
            res.setHeader('Content-Type', cachedImage.contentType);
            return res.send(cachedImage.data);
        }

        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            http2: true,  // Sử dụng HTTP/2 nếu có thể
            maxRedirects: 5,
            timeout: 5000,  // Đặt thời gian chờ để tối ưu hóa tốc độ
        });

        const buffer = Buffer.from(response.data, 'binary');
        imageCache.set(url, {data: buffer, contentType: response.headers['content-type']});

        res.setHeader('Content-Type', response.headers['content-type']);
        res.send(buffer);
    } catch (error) {
        console.error('Error fetching the image:', error);
        res.status(500).send('Error fetching the image');
    }
});

router.get('/download', async function (req, res, next) {
    try {

        const header = {
            'Accept': 'application/json, text/plain, */*',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            'Accept-Language': 'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5',
            'Priority': 'u=1, i',
            'Sec-CH-UA': '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
            'Sec-CH-UA-Mobile': '?0',
            'Sec-CH-UA-Platform': '"Windows"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
        };

        const {urlBase} = req.query
        console.log(urlBase)
        const parsedUrl = new URL(urlBase);
        const agent = new https.Agent({
            keepAlive: true,
            rejectUnauthorized: false, // Không khuyến khích dùng trong môi trường sản xuất
            secureOptions: require('constants').SSL_OP_LEGACY_SERVER_CONNECT
        });
        // Check if the URL starts with the specific base path
        if (parsedUrl.pathname.startsWith('/stories/highlights')) {
            // Handle highlights
            console.log("highlights")
            // Sử dụng regex để tìm dãy số
            const regex = /\/highlights\/(\d+)\//;
            const match = urlBase.match(regex);
            const number = match[1]
            console.log(number)

            const result = await axios.get(`${apiHighlight}${number}`, {
                headers: header,
                httpsAgent: agent
            })
            // console.log("result", result)
            console.log("result-data: ", result.data)
            console.log("result.data.result", result.data.result)
            let listMedia = []
            result.data.result.forEach((item) => {
                // console.log("item", item)
                console.log("item image-version2", item.image_versions2.candidates[0].url)
                console.log("item video-version", item.video_versions === undefined ? item.video_versions : item.video_versions[0].url)
                const listImageVersion = item.image_versions2.candidates[0].url
                const listVideoVersion = item.video_versions === undefined ? item.video_versions : item.video_versions[0].url

                const media = {
                    listImageVersion,
                    listVideoVersion
                }
                listMedia.push(media)

            })
            console.log(listMedia)


            res.status(200).json({
                result: {
                    type: "story",
                    media: listMedia
                }
            })

        } else if (parsedUrl.pathname.startsWith('/stories')) {

            // Handle general stories (excluding highlights)
            console.log("stories")
            const url = urlBase
            console.log(url)
            const result = await axios.get(apiStory, {
                headers: header,
                params: {url},
                httpsAgent: agent
            })
            console.log("result.data", result.data.result)
            let listMedia = []
            result.data.result.forEach((item) => {
                // console.log("item", item)
                console.log("item image-version2", item.image_versions2.candidates[0].url)
                console.log("item video-version", item.video_versions === undefined ? item.video_versions : item.video_versions[0].url)
                const listImageVersion = item.image_versions2.candidates[0].url
                const listVideoVersion = item.video_versions === undefined ? item.video_versions : item.video_versions[0].url

                const media = {
                    listImageVersion,
                    listVideoVersion
                }
                listMedia.push(media)

            })


            res.status(200).json({
                result: {
                    type: "story",
                    // media: result.data.result
                    media: listMedia
                }
            })

        } else {
            const { igdl } = require('ruhend-scraper')
             //https://instagram.com/xxxxxxx

            let response = await igdl(urlBase);
            console.log(response)

            console.log("Response:", response.data);
            const listMedia = []
            let listImageVersion = undefined
            let listVideoVersion = undefined
            let media = undefined
            const uniqueUrls = [...new Set(response.data.map(item => item.url))];
            console.log(uniqueUrls)
            uniqueUrls.forEach(item => {
                console.log("item", item)
                if (item.includes("https://d.rapidcdn.app/d?token=")) {
                    listVideoVersion = item
                } else {
                    listImageVersion = item
                }
                media = {
                    listImageVersion,
                    listVideoVersion
                }
                listMedia.push(media)
            })

            console.log(listMedia)
            res.status(200).json({
                result: {
                    type: "post",
                    media: listMedia
                }
            })



            // const listMedia = []
            // let listImageVersion = undefined
            // let listVideoVersion = undefined
            // if (Array.isArray(responseData) === false) {
            //     console.log(true)
            //     if (responseData.url[0].type === 'mp4') {
            //         listVideoVersion = responseData.url[0].url
            //         listImageVersion = responseData.thumb
            //     } else {
            //         listImageVersion = responseData.url[0].url
            //     }
            //     const media = {
            //         listImageVersion,
            //         listVideoVersion
            //     }
            //     listMedia.push(media)
            // } else {
            //     responseData.forEach((item) => {
            //         // console.log("item forEach: ", item)
            //         console.log("item forEach: ", item.url[0].type)
            //
            //
            //         if (item.url[0].type !== 'mp4') {
            //             console.log("item.url[0].url_image", item.url[0].url)
            //             listImageVersion = item.url[0].url
            //         } else {
            //             console.log("item.url[0].url_video", item.url[0].url)
            //             console.log("item.thumb", item.thumb)
            //             listVideoVersion = item.url[0].url
            //             listImageVersion = item.thumb
            //         }
            //         const media = {
            //             listImageVersion,
            //             listVideoVersion
            //         }
            //         listMedia.push(media)
            //     })
            // }
            //
            // console.log(listMedia)


            // res.status(200).json({
            //     result: {
            //         type: "post",
            //         media: listMedia
            //     }
            // })
        }
    } catch (e) {
        console.log(e)
        res.status(500).json({
            status: 500,
            msg: "Internal Server Error"
        })
    }
})


// router.get('/download', async function (req, res, next) {
//     try {
//
//         const header = {
//             'Accept': 'application/json, text/plain, */*',
//             'Accept-Encoding': 'gzip, deflate, br, zstd',
//             'Accept-Language': 'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5',
//             'Priority': 'u=1, i',
//             'Sec-CH-UA': '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
//             'Sec-CH-UA-Mobile': '?0',
//             'Sec-CH-UA-Platform': '"Windows"',
//             'Sec-Fetch-Dest': 'empty',
//             'Sec-Fetch-Mode': 'cors',
//             'Sec-Fetch-Site': 'same-origin',
//             'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
//         };
//
//         const {urlBase} = req.query
//         console.log(urlBase)
//         const parsedUrl = new URL(urlBase);
//         const agent = new https.Agent({
//             keepAlive: true,
//             rejectUnauthorized: false, // Không khuyến khích dùng trong môi trường sản xuất
//             secureOptions: require('constants').SSL_OP_LEGACY_SERVER_CONNECT
//         });
//         // Check if the URL starts with the specific base path
//         if (parsedUrl.pathname.startsWith('/stories/highlights')) {
//             // Handle highlights
//             console.log("highlights")
//             // Sử dụng regex để tìm dãy số
//             const regex = /\/highlights\/(\d+)\//;
//             const match = urlBase.match(regex);
//             const number = match[1]
//             console.log(number)
//
//             const result = await axios.get(`${apiHighlight}${number}`, {
//                 headers: header,
//                 httpsAgent: agent
//             })
//             // console.log("result", result)
//             console.log("result-data: ", result.data)
//             console.log("result.data.result", result.data.result)
//             let listMedia = []
//             result.data.result.forEach((item) => {
//                 // console.log("item", item)
//                 console.log("item image-version2", item.image_versions2.candidates[0].url)
//                 console.log("item video-version", item.video_versions === undefined ? item.video_versions : item.video_versions[0].url)
//                 const listImageVersion = item.image_versions2.candidates[0].url
//                 const listVideoVersion = item.video_versions === undefined ? item.video_versions : item.video_versions[0].url
//
//                 const media = {
//                     listImageVersion,
//                     listVideoVersion
//                 }
//                 listMedia.push(media)
//
//             })
//             console.log(listMedia)
//
//
//             res.status(200).json({
//                 result: {
//                     type: "story",
//                     media: listMedia
//                 }
//             })
//
//         } else if (parsedUrl.pathname.startsWith('/stories')) {
//
//             // Handle general stories (excluding highlights)
//             console.log("stories")
//             const url = urlBase
//             const result = await axios.get(apiStory, {
//                 headers: header,
//                 params: {url},
//                 httpsAgent: agent
//             })
//             console.log("result.data", result.data.result)
//             let listMedia = []
//             result.data.result.forEach((item) => {
//                 // console.log("item", item)
//                 console.log("item image-version2", item.image_versions2.candidates[0].url)
//                 console.log("item video-version", item.video_versions === undefined ? item.video_versions : item.video_versions[0].url)
//                 const listImageVersion = item.image_versions2.candidates[0].url
//                 const listVideoVersion = item.video_versions === undefined ? item.video_versions : item.video_versions[0].url
//
//                 const media = {
//                     listImageVersion,
//                     listVideoVersion
//                 }
//                 listMedia.push(media)
//
//             })
//
//
//             res.status(200).json({
//                 result: {
//                     type: "story",
//                     // media: result.data.result
//                     media: listMedia
//                 }
//             })
//
//         } else {
//             // Handle other cases
//             const postId = extractInstagramCode(urlBase);
//             console.log(postId)
//             // const urlDone = `${cleanedURL}?__a=1&__d=dis`;
//             const url = `https://www.instagram.com/p/${postId}/?__a=1&__d=dis`;
//             console.log(url)
//             const {data} = await axios({
//                 url,
//             });
//             // res.status(200).json(data)
//
//             const jsonData = async () => ({
//                 id: data?.items[0]?.id,
//                 caption: data?.items[0]?.caption?.text,
//                 shortcode: data?.items[0]?.code,
//                 likes:
//                     data?.items[0]?.edge_media_preview_like?.count ||
//                     data?.items[0]?.like_count,
//                 comments:
//                     data?.items[0]?.edge_media_to_parent_comment?.count ||
//                     data?.items[0]?.comment_count,
//                 isVideo: data?.items[0]?.video_versions ? true : false,
//                 timestamp: data?.items[0]?.taken_at,
//                 duration: data?.items[0]?.video_duration,
//                 hasAudio: data?.items[0]?.has_audio,
//                 views: data?.items[0]?.view_count,
//                 plays: data?.items[0]?.play_count,
//                 thumbnail: data?.items[0]?.carousel_media
//                     ? await imgUrlToBase64(
//                         data?.items[0]?.carousel_media[0]?.image_versions2?.candidates[0]
//                             ?.url
//                     )
//                     : await imgUrlToBase64(
//                         data?.items[0]?.image_versions2?.candidates[0]?.url
//                     ),
//                 isCarousel: data?.items[0]?.carousel_media ? true : false,
//                 carouselCount: data?.items[0]?.carousel_media_count,
//                 singleMedia: data?.items[0]?.carousel_media
//                     ? null
//                     : {
//                         thumbnail: await imgUrlToBase64(
//                             data?.items[0]?.image_versions2?.candidates[0]?.url
//                         ),
//                         isVideo: data?.items[0]?.video_versions ? true : false,
//                         duration: data?.items[0]?.video_duration,
//                         hasAudio: data?.items[0]?.has_audio,
//                         resources: data?.items[0]?.image_versions2?.candidates?.map(
//                             (item) => ({
//                                 src: item.url,
//                                 width: item.width,
//                                 height: item.height,
//                             })
//                         ),
//                         videoResources: data?.items[0]?.video_versions
//                             ? data?.items[0]?.video_versions?.map((item) => ({
//                                 src: item.url,
//                                 width: item.width,
//                                 height: item.height,
//                             }))
//                             : null,
//                     },
//                 carouselMedia: data?.items[0]?.carousel_media
//                     ? await Promise.all(
//                         data?.items[0]?.carousel_media?.map(async (item) => ({
//                             id: item?.id,
//                             thumbnail: await imgUrlToBase64(
//                                 item?.image_versions2?.candidates[0]?.url
//                             ),
//                             isVideo: item?.video_versions ? true : false,
//                             duration: item?.video_versions ? item?.video_duration : null,
//                             resources: item?.image_versions2?.candidates?.map((item) => ({
//                                 src: item.url,
//                                 width: item.width,
//                                 height: item.height,
//                             })),
//                             videoResources: item?.video_versions
//                                 ? item?.video_versions?.map((item) => ({
//                                     src: item.url,
//                                     width: item.width,
//                                     height: item.height,
//                                 }))
//                                 : null,
//                         }))
//                     )
//                     : null,
//                 user: {
//                     id: data?.items[0]?.user?.id,
//                     username: data?.items[0]?.user?.username,
//                     fullName: data?.items[0]?.user?.full_name,
//                     isVerified: data?.items[0]?.user?.is_verified,
//                     isPrivate: data?.items[0]?.user?.is_private,
//                     profilePic: await imgUrlToBase64(data?.items[0]?.user?.profile_pic_url),
//                 },
//             });
//             res.status(200).json({
//                 result: {
//                     type: "post",
//                     media: await jsonData()
//                 }
//             });
//
//
//         }
//     } catch (e) {
//         console.log(e)
//         res.status(500).json({
//             status: 500,
//             msg: "Internal Server Error"
//         })
//     }
// })


module.exports = router;
