var express = require('express');
var router = express.Router();
const cors = require("cors");
const base64 = require("image-to-base64");
const axios = require("axios")
const https = require("https");
const apiStory = "https://sssinstagram.com/api/ig/story"
const apiHighlight = "https://sssinstagram.com/api/ig/highlightStories/highlight:"
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

//
// router.get("/p", async (req, res) => {
//     try {
//         const {urlBase} = req.query;
//         const postId = extractInstagramCode(urlBase);
//         console.log(postId)
//         // const urlDone = `${cleanedURL}?__a=1&__d=dis`;
//         const url = `https://www.instagram.com/p/${postId}/?__a=1&__d=dis`;
//         console.log(url)
//         const {data} = await axios({
//             url,
//             headers: {
//                 cookie: 'ig_did=65BDE266-DDB3-4D2B-9280-784944416026; datr=9SSAZtgqp2fMrg0qncC-MVG0; ig_nrcb=1; dpr=1.25; ps_l=1; ps_n=1; mid=ZsipxQALAAHTAMWuhieghxHl4Psg; fbm_124024574287414=base_domain=.instagram.com; shbid="2287\\05429617151073\\0541756564794:01f7ce76c14d38d3fdab601234fdb17a7b8f13ba6c942ec089771e09f1abd841ff40b937"; shbts="1725028794\\05429617151073\\0541756564794:01f74e3b75bcfd50157364bfcc22df3c730d60664497d80ea4f84a6ab18f9665ab15dc66"; ig_direct_region_hint="PRN\\05429617151073\\0541756564846:01f748272b05f2036b16e131ec91f6e4e209be38fcd1ff48854bc860565ca34dbce9caf9"; fbsr_124024574287414=9TrCCJL0yOimwLPfw-1G_5Gumi75xp5pknXDS3lezIQ.eyJ1c2VyX2lkIjoiMTAwMDE1Nzk5MTEwNjk1IiwiY29kZSI6IkFRQW5oLWxBZndlcGsxV2REc1JITDNkcVF2cXhUTWVHNmxBV1IwOTc2Wl9sakthQ0wzdi1HakpWSDZfU2JyaFJ3ZE9uOXV4SkJHakotRHhnOE9pQmd1Q1JmSldicFZQUnJWMEIzelNzQzRqYV9EQTFoam9CR0ZpM0NTN2xNdG13c0JkQWhnNXFhZmxmZzhadEdqREN4Z0p1emlZN3lyNXM5X1ZpN0YyMFFhRkxaajV6bU5YbVFSekphc2FmY1dPRjdsV1JOUkhHV0VQb1JkM2hwZFBWMjBHUXBTQnRoaTBIXzJtWUoyUmRFRFM2bDd4STJCdGJYQUVSc1F3bzd5UVdpeEZXYmVZOFFIUXZuek9qOEd4Y1RqUzJHVzhCczhiWUp2c09TaGhkRGRYSG82d3JtWW9lOWF3QVpHUndlMjBqUUszNXVCT3BhVGpFLVhOSW45dy03eHVfIiwib2F1dGhfdG9rZW4iOiJFQUFCd3pMaXhuallCT3o3dWNIeUxZUzZvbFFBWXByajFydlBzeVVCbDd2Z0djWHJhODFGYUpaQXEyTTZJbllKSlpCaWxQUHR4YW9OU3QzMmI2Snc2VWJid0FmN1pDMW52Mld5UEhsTGtYUWZqSTRVeG44WkJDUXJYYVJieFFzZXBKVmVVUTZaQmxrRlRuWkNrOVhyeUFaQ0ZaQk1OVU02eEVaQlVaQ1pDNHVwRWZsY2IwWkFlUFc4SVgwaVdkSlBPYzdaQzA2TmdPcWlRWkQiLCJhbGdvcml0aG0iOiJITUFDLVNIQTI1NiIsImlzc3VlZF9hdCI6MTcyNTAyOTcxOH0; csrftoken=lsAeYWCVWQrEP7wjQ7wZJ2wtDgsCY7Es; ds_user_id=29617151073; sessionid=29617151073%3A8gOaQ0tJDyusw7%3A17%3AAYdVvu8fO8Xj3TyCuJFPhjCUBoRibtTTNoOIZ7U8SA; fbsr_124024574287414=9TrCCJL0yOimwLPfw-1G_5Gumi75xp5pknXDS3lezIQ.eyJ1c2VyX2lkIjoiMTAwMDE1Nzk5MTEwNjk1IiwiY29kZSI6IkFRQW5oLWxBZndlcGsxV2REc1JITDNkcVF2cXhUTWVHNmxBV1IwOTc2Wl9sakthQ0wzdi1HakpWSDZfU2JyaFJ3ZE9uOXV4SkJHakotRHhnOE9pQmd1Q1JmSldicFZQUnJWMEIzelNzQzRqYV9EQTFoam9CR0ZpM0NTN2xNdG13c0JkQWhnNXFhZmxmZzhadEdqREN4Z0p1emlZN3lyNXM5X1ZpN0YyMFFhRkxaajV6bU5YbVFSekphc2FmY1dPRjdsV1JOUkhHV0VQb1JkM2hwZFBWMjBHUXBTQnRoaTBIXzJtWUoyUmRFRFM2bDd4STJCdGJYQUVSc1F3bzd5UVdpeEZXYmVZOFFIUXZuek9qOEd4Y1RqUzJHVzhCczhiWUp2c09TaGhkRGRYSG82d3JtWW9lOWF3QVpHUndlMjBqUUszNXVCT3BhVGpFLVhOSW45dy03eHVfIiwib2F1dGhfdG9rZW4iOiJFQUFCd3pMaXhuallCT3o3dWNIeUxZUzZvbFFBWXByajFydlBzeVVCbDd2Z0djWHJhODFGYUpaQXEyTTZJbllKSlpCaWxQUHR4YW9OU3QzMmI2Snc2VWJid0FmN1pDMW52Mld5UEhsTGtYUWZqSTRVeG44WkJDUXJYYVJieFFzZXBKVmVVUTZaQmxrRlRuWkNrOVhyeUFaQ0ZaQk1OVU02eEVaQlVaQ1pDNHVwRWZsY2IwWkFlUFc4SVgwaVdkSlBPYzdaQzA2TmdPcWlRWkQiLCJhbGdvcml0aG0iOiJITUFDLVNIQTI1NiIsImlzc3VlZF9hdCI6MTcyNTAyOTcxOH0; wd=754x695; rur="EAG\\05429617151073\\0541756565780:01f75049ecfa7ef9c8c8f18ac1ea0c2a9790d459cfcfa7a82868be638a4e03963af1d5c9"',
//             },
//         });
//         // res.status(200).json(data)
//
//         const jsonData = async () => ({
//             id: data?.items[0]?.id,
//             caption: data?.items[0]?.caption?.text,
//             shortcode: data?.items[0]?.code,
//             likes:
//                 data?.items[0]?.edge_media_preview_like?.count ||
//                 data?.items[0]?.like_count,
//             comments:
//                 data?.items[0]?.edge_media_to_parent_comment?.count ||
//                 data?.items[0]?.comment_count,
//             isVideo: data?.items[0]?.video_versions ? true : false,
//             timestamp: data?.items[0]?.taken_at,
//             duration: data?.items[0]?.video_duration,
//             hasAudio: data?.items[0]?.has_audio,
//             views: data?.items[0]?.view_count,
//             plays: data?.items[0]?.play_count,
//             thumbnail: data?.items[0]?.carousel_media
//                 ? await imgUrlToBase64(
//                     data?.items[0]?.carousel_media[0]?.image_versions2?.candidates[0]
//                         ?.url
//                 )
//                 : await imgUrlToBase64(
//                     data?.items[0]?.image_versions2?.candidates[0]?.url
//                 ),
//             isCarousel: data?.items[0]?.carousel_media ? true : false,
//             carouselCount: data?.items[0]?.carousel_media_count,
//             singleMedia: data?.items[0]?.carousel_media
//                 ? null
//                 : {
//                     thumbnail: await imgUrlToBase64(
//                         data?.items[0]?.image_versions2?.candidates[0]?.url
//                     ),
//                     isVideo: data?.items[0]?.video_versions ? true : false,
//                     duration: data?.items[0]?.video_duration,
//                     hasAudio: data?.items[0]?.has_audio,
//                     resources: data?.items[0]?.image_versions2?.candidates?.map(
//                         (item) => ({
//                             src: item.url,
//                             width: item.width,
//                             height: item.height,
//                         })
//                     ),
//                     videoResources: data?.items[0]?.video_versions
//                         ? data?.items[0]?.video_versions?.map((item) => ({
//                             src: item.url,
//                             width: item.width,
//                             height: item.height,
//                         }))
//                         : null,
//                 },
//             carouselMedia: data?.items[0]?.carousel_media
//                 ? await Promise.all(
//                     data?.items[0]?.carousel_media?.map(async (item) => ({
//                         id: item?.id,
//                         thumbnail: await imgUrlToBase64(
//                             item?.image_versions2?.candidates[0]?.url
//                         ),
//                         isVideo: item?.video_versions ? true : false,
//                         duration: item?.video_versions ? item?.video_duration : null,
//                         resources: item?.image_versions2?.candidates?.map((item) => ({
//                             src: item.url,
//                             width: item.width,
//                             height: item.height,
//                         })),
//                         videoResources: item?.video_versions
//                             ? item?.video_versions?.map((item) => ({
//                                 src: item.url,
//                                 width: item.width,
//                                 height: item.height,
//                             }))
//                             : null,
//                     }))
//                 )
//                 : null,
//             user: {
//                 id: data?.items[0]?.user?.id,
//                 username: data?.items[0]?.user?.username,
//                 fullName: data?.items[0]?.user?.full_name,
//                 isVerified: data?.items[0]?.user?.is_verified,
//                 isPrivate: data?.items[0]?.user?.is_private,
//                 profilePic: await imgUrlToBase64(data?.items[0]?.user?.profile_pic_url),
//             },
//         });
//         res.status(200).json(await jsonData());
//     } catch (error) {
//         console.log(error.message);
//         res.status(500).json({
//             error: true,
//             message: error.message,
//         });
//     } finally {
//         console.log("done");
//     }
// });
const NodeCache = require('node-cache');
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
            // Handle other cases
            const postId = extractInstagramCode(urlBase);
            console.log(postId)
            // const urlDone = `${cleanedURL}?__a=1&__d=dis`;
            const url = `https://www.instagram.com/p/${postId}/?__a=1&__d=dis`;
            console.log(url)
            const {data} = await axios({
                url,
                headers: {
                    cookie: 'ig_did=65BDE266-DDB3-4D2B-9280-784944416026; datr=9SSAZtgqp2fMrg0qncC-MVG0; ig_nrcb=1; dpr=1.25; ps_l=1; ps_n=1; mid=ZsipxQALAAHTAMWuhieghxHl4Psg; fbm_124024574287414=base_domain=.instagram.com; shbid="2287\\05429617151073\\0541756564794:01f7ce76c14d38d3fdab601234fdb17a7b8f13ba6c942ec089771e09f1abd841ff40b937"; shbts="1725028794\\05429617151073\\0541756564794:01f74e3b75bcfd50157364bfcc22df3c730d60664497d80ea4f84a6ab18f9665ab15dc66"; ig_direct_region_hint="PRN\\05429617151073\\0541756564846:01f748272b05f2036b16e131ec91f6e4e209be38fcd1ff48854bc860565ca34dbce9caf9"; fbsr_124024574287414=9TrCCJL0yOimwLPfw-1G_5Gumi75xp5pknXDS3lezIQ.eyJ1c2VyX2lkIjoiMTAwMDE1Nzk5MTEwNjk1IiwiY29kZSI6IkFRQW5oLWxBZndlcGsxV2REc1JITDNkcVF2cXhUTWVHNmxBV1IwOTc2Wl9sakthQ0wzdi1HakpWSDZfU2JyaFJ3ZE9uOXV4SkJHakotRHhnOE9pQmd1Q1JmSldicFZQUnJWMEIzelNzQzRqYV9EQTFoam9CR0ZpM0NTN2xNdG13c0JkQWhnNXFhZmxmZzhadEdqREN4Z0p1emlZN3lyNXM5X1ZpN0YyMFFhRkxaajV6bU5YbVFSekphc2FmY1dPRjdsV1JOUkhHV0VQb1JkM2hwZFBWMjBHUXBTQnRoaTBIXzJtWUoyUmRFRFM2bDd4STJCdGJYQUVSc1F3bzd5UVdpeEZXYmVZOFFIUXZuek9qOEd4Y1RqUzJHVzhCczhiWUp2c09TaGhkRGRYSG82d3JtWW9lOWF3QVpHUndlMjBqUUszNXVCT3BhVGpFLVhOSW45dy03eHVfIiwib2F1dGhfdG9rZW4iOiJFQUFCd3pMaXhuallCT3o3dWNIeUxZUzZvbFFBWXByajFydlBzeVVCbDd2Z0djWHJhODFGYUpaQXEyTTZJbllKSlpCaWxQUHR4YW9OU3QzMmI2Snc2VWJid0FmN1pDMW52Mld5UEhsTGtYUWZqSTRVeG44WkJDUXJYYVJieFFzZXBKVmVVUTZaQmxrRlRuWkNrOVhyeUFaQ0ZaQk1OVU02eEVaQlVaQ1pDNHVwRWZsY2IwWkFlUFc4SVgwaVdkSlBPYzdaQzA2TmdPcWlRWkQiLCJhbGdvcml0aG0iOiJITUFDLVNIQTI1NiIsImlzc3VlZF9hdCI6MTcyNTAyOTcxOH0; csrftoken=lsAeYWCVWQrEP7wjQ7wZJ2wtDgsCY7Es; ds_user_id=29617151073; sessionid=29617151073%3A8gOaQ0tJDyusw7%3A17%3AAYdVvu8fO8Xj3TyCuJFPhjCUBoRibtTTNoOIZ7U8SA; fbsr_124024574287414=9TrCCJL0yOimwLPfw-1G_5Gumi75xp5pknXDS3lezIQ.eyJ1c2VyX2lkIjoiMTAwMDE1Nzk5MTEwNjk1IiwiY29kZSI6IkFRQW5oLWxBZndlcGsxV2REc1JITDNkcVF2cXhUTWVHNmxBV1IwOTc2Wl9sakthQ0wzdi1HakpWSDZfU2JyaFJ3ZE9uOXV4SkJHakotRHhnOE9pQmd1Q1JmSldicFZQUnJWMEIzelNzQzRqYV9EQTFoam9CR0ZpM0NTN2xNdG13c0JkQWhnNXFhZmxmZzhadEdqREN4Z0p1emlZN3lyNXM5X1ZpN0YyMFFhRkxaajV6bU5YbVFSekphc2FmY1dPRjdsV1JOUkhHV0VQb1JkM2hwZFBWMjBHUXBTQnRoaTBIXzJtWUoyUmRFRFM2bDd4STJCdGJYQUVSc1F3bzd5UVdpeEZXYmVZOFFIUXZuek9qOEd4Y1RqUzJHVzhCczhiWUp2c09TaGhkRGRYSG82d3JtWW9lOWF3QVpHUndlMjBqUUszNXVCT3BhVGpFLVhOSW45dy03eHVfIiwib2F1dGhfdG9rZW4iOiJFQUFCd3pMaXhuallCT3o3dWNIeUxZUzZvbFFBWXByajFydlBzeVVCbDd2Z0djWHJhODFGYUpaQXEyTTZJbllKSlpCaWxQUHR4YW9OU3QzMmI2Snc2VWJid0FmN1pDMW52Mld5UEhsTGtYUWZqSTRVeG44WkJDUXJYYVJieFFzZXBKVmVVUTZaQmxrRlRuWkNrOVhyeUFaQ0ZaQk1OVU02eEVaQlVaQ1pDNHVwRWZsY2IwWkFlUFc4SVgwaVdkSlBPYzdaQzA2TmdPcWlRWkQiLCJhbGdvcml0aG0iOiJITUFDLVNIQTI1NiIsImlzc3VlZF9hdCI6MTcyNTAyOTcxOH0; wd=754x695; rur="EAG\\05429617151073\\0541756565780:01f75049ecfa7ef9c8c8f18ac1ea0c2a9790d459cfcfa7a82868be638a4e03963af1d5c9"',
                },
            });
            // res.status(200).json(data)

            const jsonData = async () => ({
                id: data?.items[0]?.id,
                caption: data?.items[0]?.caption?.text,
                shortcode: data?.items[0]?.code,
                likes:
                    data?.items[0]?.edge_media_preview_like?.count ||
                    data?.items[0]?.like_count,
                comments:
                    data?.items[0]?.edge_media_to_parent_comment?.count ||
                    data?.items[0]?.comment_count,
                isVideo: data?.items[0]?.video_versions ? true : false,
                timestamp: data?.items[0]?.taken_at,
                duration: data?.items[0]?.video_duration,
                hasAudio: data?.items[0]?.has_audio,
                views: data?.items[0]?.view_count,
                plays: data?.items[0]?.play_count,
                thumbnail: data?.items[0]?.carousel_media
                    ? await imgUrlToBase64(
                        data?.items[0]?.carousel_media[0]?.image_versions2?.candidates[0]
                            ?.url
                    )
                    : await imgUrlToBase64(
                        data?.items[0]?.image_versions2?.candidates[0]?.url
                    ),
                isCarousel: data?.items[0]?.carousel_media ? true : false,
                carouselCount: data?.items[0]?.carousel_media_count,
                singleMedia: data?.items[0]?.carousel_media
                    ? null
                    : {
                        thumbnail: await imgUrlToBase64(
                            data?.items[0]?.image_versions2?.candidates[0]?.url
                        ),
                        isVideo: data?.items[0]?.video_versions ? true : false,
                        duration: data?.items[0]?.video_duration,
                        hasAudio: data?.items[0]?.has_audio,
                        resources: data?.items[0]?.image_versions2?.candidates?.map(
                            (item) => ({
                                src: item.url,
                                width: item.width,
                                height: item.height,
                            })
                        ),
                        videoResources: data?.items[0]?.video_versions
                            ? data?.items[0]?.video_versions?.map((item) => ({
                                src: item.url,
                                width: item.width,
                                height: item.height,
                            }))
                            : null,
                    },
                carouselMedia: data?.items[0]?.carousel_media
                    ? await Promise.all(
                        data?.items[0]?.carousel_media?.map(async (item) => ({
                            id: item?.id,
                            thumbnail: await imgUrlToBase64(
                                item?.image_versions2?.candidates[0]?.url
                            ),
                            isVideo: item?.video_versions ? true : false,
                            duration: item?.video_versions ? item?.video_duration : null,
                            resources: item?.image_versions2?.candidates?.map((item) => ({
                                src: item.url,
                                width: item.width,
                                height: item.height,
                            })),
                            videoResources: item?.video_versions
                                ? item?.video_versions?.map((item) => ({
                                    src: item.url,
                                    width: item.width,
                                    height: item.height,
                                }))
                                : null,
                        }))
                    )
                    : null,
                user: {
                    id: data?.items[0]?.user?.id,
                    username: data?.items[0]?.user?.username,
                    fullName: data?.items[0]?.user?.full_name,
                    isVerified: data?.items[0]?.user?.is_verified,
                    isPrivate: data?.items[0]?.user?.is_private,
                    profilePic: await imgUrlToBase64(data?.items[0]?.user?.profile_pic_url),
                },
            });
            res.status(200).json({
                result: {
                    type: "post",
                    media: await jsonData()
                }
            });


        }
    } catch (e) {
        console.log(e)
        res.status(500).json({
            status: 500,
            msg: "Internal Server Error"
        })
    }
})


module.exports = router;
