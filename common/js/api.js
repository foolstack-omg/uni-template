import util from './util'
import log from './log'
import store from '../../store/index.js'
let host = null

if(process.env.NODE_ENV === 'development') {
	host = 'http://laravel-template.test'
} else {
	host = 'http://laravel-template.ergou.live'
}

console.log('[ENV]', process.env.NODE_ENV)
console.log('[HOST]', host)


const request = async (options, showLoading = false) => {
    let finalOptions = JSON.parse(JSON.stringify(options)) // 深复制

    // 简化开发，如果传入字符串则转换成 对象
    if (typeof finalOptions === 'string') {
        finalOptions = {
            url: finalOptions
        }
    }
    // 显示加载中
    if (showLoading) {
        uni.showLoading({title: '加载中...', mask: true})
    }
    // 拼接请求地址
    finalOptions.url = host + '/api/' + finalOptions.url
    // 调用小程序的 request 方法
    let response = null
	let error = null
    try{
        [error, response] = await uni.request(finalOptions)
		if(error){
			throw error
		}
		
        if (response.statusCode === 500) {
            uni.showModal({
                title: '提示',
                content: '服务器错误，请联系管理员或重试'
            })
        }

    } catch (e) {
        log.error({
            type: 'requestError',
            options: finalOptions,
            error: e
        })
        let jsonE = JSON.stringify(e)
        uni.showModal({
            content: `Error: ${jsonE}`,
            showCancel: false
        })
    }
    if (showLoading) {
        // 隐藏加载中
        uni.hideLoading()
    }

    return response
}

// 登录
const login = async (params = {}) => {
	let app = getApp()
   
    // 接口请求 weapp/authorizations
    let authResponse = await request({
        url: 'authorizations/login',
        data: params,
        method: 'POST'
    }, true)

    // 登录成功，记录 token 信息
    if (authResponse.data.status === 1) {
        return await loginCallback(authResponse)
    } else {
        return authResponse
    }
}

// 为您小程序登录
const weappLogin = async (params = {}) => {
	let app = getApp()
	// code 只能使用一次，所以每次单独调用
	let [errorLogin, loginData] = await uni.login()
	if(errorLogin) {
		console.log('登录失败')
		return false
	}
	
	// 参数中增加code
	params.code = loginData.code
	
	let [errorSetting, settingData] = await uni.getSetting()
	if(errorSetting) {
		console.log('配置获取失败')
		return false
	}
	
	console.log('setting data')
	console.log(settingData)
	if (!settingData.authSetting['scope.userInfo']) {
	    console.log('用户没有授权')
	    console.log(settingData.authSetting['scope.userInfo'])
	    return false
	} else {
	    console.log('用户已授权')
	    console.log(settingData.authSetting['scope.userInfo'])
	
	    let [errorUserInfo, userInfoData] = await uni.getUserInfo()
	    if(errorUserInfo) {
	    	return false
	    }
	    console.log(userInfoData)
	    let userInfo = userInfoData.userInfo
	    params.name = userInfo.nickName
	    params.avatar_url = userInfo.avatarUrl
	    params.gender = userInfo.gender
	    params.country = userInfo.country
	    params.city = userInfo.city
	    params.province = userInfo.province
	}
	
	// 接口请求 weapp/authorizations
	let authResponse = await request({
	    url: 'weapp/authorizations',
	    data: params,
	    method: 'POST'
	}, true)
	
	// 登录成功，记录 token 信息
	if (authResponse.data.status === 1) {
	    return await loginCallback(authResponse)
	} else {
	    return authResponse
	}
}

// 登录成功后回调
const loginCallback = async (response) => {
	let app = getApp()
	uni.setStorageSync('access_token', response.data.data.access_token)
	uni.setStorageSync('access_token_expired_at', response.data.data.expired_at * 1000)
	let authResponse = await authRequest({
	    url: 'user'
	}, true)
	if (authResponse.data.status === 1) {
		await app.setUserInfo(authResponse.data.data)
	    return authResponse
	} else {
	    return authResponse
	}
}

// 刷新 Token
const refreshToken = async (accessToken) => {
    // 请求刷新接口
    let refreshResponse = await request({
        url: 'authorizations/update',
        method: 'POST',
        header: {
            'Authorization': 'Bearer ' + accessToken
        }
    })

    // 刷新成功状态码为 200
    if (refreshResponse.data.status === 1) {
        // 将 Token 及过期时间保存在 storage 中
        uni.setStorageSync('access_token', refreshResponse.data.data.access_token)
        uni.setStorageSync('access_token_expired_at', refreshResponse.data.data.expired_at * 1000)
    }

    return refreshResponse
}

// 获取 Token
const getToken = async (options) => {
    // 从缓存中取出 Token
    let accessToken = uni.getStorageSync('access_token')
    let expiredAt = uni.getStorageSync('access_token_expired_at')

    // 如果 token 过期了，则调用刷新方法
    if (accessToken && new Date().getTime() > expiredAt) {
        let refreshResponse = await refreshToken(accessToken)

        // 刷新成功
        if (refreshResponse.data.status === 1) {
            accessToken = refreshResponse.data.data.access_token
        } else {
			// 刷新Token失败
            return false
            
        }
    }

    return accessToken
}

// 带身份认证的请求
const authRequest = async (options, showLoading = false) => {
    if (typeof options === 'string') {
        options = {
            url: options
        }
    }
    // 获取Token
    let accessToken = await getToken()
	
	if(!accessToken) {
		// 授权失败
		return false
	}

    // 将 Token 设置在 header 中
    let header = options.header || {}
    header.Authorization = 'Bearer ' + accessToken
    options.header = header

    let response = await request(options, showLoading)

    if (response.data.status === 0 && response.data.status_code === 401) {
		// 授权失败
        return false
    }
    return response
}

//  退出登录
const logout = async (params = {}) => {
    let accessToken = getToken()
	if(accessToken) {
		// 调用删除 Token 接口，让 Token 失效
		await request({
		    url: 'authorizations/destroy',
		    method: 'POST',
		    header: {
		        'Authorization': 'Bearer ' + accessToken
		    }
		}, false)
	}
    
}

const uploadFile = async (options = {}) => {
    // 拼接url
    options.url = host + '/api/' + options.url
    // let header = options.header || {}
    // // 将 token 设置在 header 中
    // header.Authorization = 'Bearer ' + accessToken
    // options.header = header

    let [error, response] = await uni.uploadFile(options)
	if(error) {
		throw error
	}
    if(response.statusCode === 200) {
        response.data = JSON.parse(response.data)
    }

    return response
}

export default {
    request, login, weappLogin, authRequest, logout, uploadFile
}
