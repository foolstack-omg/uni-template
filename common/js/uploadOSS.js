const base64 = require('base64.js');//Base64,hmac,sha1,crypto相关算法
require('hmac.js');
require('sha1.js');
const Crypto = require('crypto.js');

/**
 * 上传文件到阿里云oss
 * @param env
 * @param filePath
 * @param fileName
 * @param successc
 * @param failc
 */
const upload = function (env, filePath, fileName, successc, failc) {
    if (!filePath || filePath.length < 9) {
        wx.showModal({
            title: '图片错误',
            content: '请重试',
            showCancel: false,
        })
        return;
    }

    //图片名字 可以自行定义
    let aliyunFileKey = ''
    if(fileName) {
        aliyunFileKey = env.dir + '/' + fileName;
    } else {
        aliyunFileKey = env.dir + '/' + new Date().getTime() + Math.floor(Math.random() * 999) + '.png';
    }


    const aliyunServerURL = env.uploadImageUrl;//OSS地址，需要https
    const accessid = env.OSSAccessKeyId;
    const policyBase64 = getPolicyBase64(env);
    const signature = getSignature(policyBase64, env);//获取签名

    wx.showLoading({title: '正在上传', mask: true})
    wx.uploadFile({
        url: aliyunServerURL,//开发者服务器 url
        filePath: filePath,//要上传文件资源的路径
        name: 'file',//必须填file
        formData: {
            'key': aliyunFileKey,
            'policy': policyBase64,
            'OSSAccessKeyId': accessid,
            'signature': signature,
            'success_action_status': '200',
        },
        success: function (res) {
            console.log('[Upload Success]', aliyunServerURL+ '/' + aliyunFileKey)
            if (res.statusCode != 200) {
                failc(res)
                return;
            }
            successc( aliyunServerURL+ '/' + aliyunFileKey);
        },
        fail: function (err) {
            err.wxaddinfo = aliyunServerURL;
            failc(err);
        },
        complete: function () {
            wx.hideLoading()
        }
    })
}

const getPolicyBase64 = function (env) {
    let date = new Date();
    date.setHours(date.getHours() + env.timeout);
    let srcT = date.toISOString();
    const policyText = {
        "expiration": srcT, //设置该Policy的失效时间，超过这个失效时间之后，就没有办法通过这个policy上传文件了
        "conditions": [
            ["content-length-range", 0, 50 * 1024 * 1024] // 设置上传文件的大小限制,50mb
        ]
    };

    return base64.encode(JSON.stringify(policyText));
}

const getSignature = function (policyBase64,env) {
    const accesskey = env.AccessKeySecret;

    const bytes = Crypto.HMAC(Crypto.SHA1, policyBase64, accesskey, {
        asBytes: true
    });
    return Crypto.util.bytesToBase64(bytes);
}

module.exports = upload;
