<script>
	import api from '@/common/js/api'
	import log from '@/common/js/log'
	
	export default {
		async onLaunch() {
			let app = getApp()
			console.log('App Launch')

			let that = this
			
			
			// #ifdef MP
			// 检查版本更新
			const updateManager = uni.getUpdateManager()
	
			updateManager.onCheckForUpdate(function (res) {
				// 请求完新版本信息的回调
				console.log('[HasUpdate]', res.hasUpdate)
				updateManager.onUpdateReady(function () {
					that.$scope.globalData.updateReady = true
					if(that.updateReadyCallback) {
						that.updateReadyCallback()
					}
					uni.showModal({
						title: '更新提示',
						content: '新版本已经准备好，是否重启应用？',
						success(res) {
							if (res.confirm) {
								// 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
								updateManager.applyUpdate()
							}
						}
					})
				})
			})
	
			updateManager.onUpdateFailed(function () {
				uni.showModal({
					title: '更新提示',
					content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~',
					showCancel: false,
					success(res) {
	
					}
				})
			})
		
			// #endif
		},
		onShow: function(options) {
			console.log('App Show')
			console.log("[onShow] :", options)
			this.$scope.globalData.options = options
	
			
		},
		onError(error){
			log.error({
				type: 'onError',
				error: error
			})
		},
		onPageNotFound(res) {
			uni.navigateTo({
				url: '/pages/errors/404/404'
			})
		},
		onHide: function() {
			console.log('App Hide')
		},
		methods: {
			// 检查更新登录态
			async login() {
				try{
					let [error, res] = await uni.checkSession()
					if(error) throw error
				}catch (e) {
					let [error, res] = await uni.login()
				
					if(this.loginCallback) {
						this.loginCallback(response)
					}
				}
				
			},
			// 判断是否授权了用户信息获取权限
			async isScopeUserInfo() {
				let [error, settingData] = await uni.getSetting()
				if (!settingData.authSetting['scope.userInfo']) {
					return false
				} else {
					return true
				}
			},
			// 获取用户信息
			async logout() {
				await api.logout()
				uni.clearStorage()
				uni.reLaunch({
					url: '/pages/login'
				})
				
			},
			async getUserInfo() {
				if( getApp().globalData.userInfo !== null) {
					return getApp().globalData.userInfo
				}
				let user = uni.getStorageSync('user')
				getApp().globalData.userInfo = user ? user : null
				return getApp().globalData.userInfo
			},
			async setUserInfo(user) {
				getApp().globalData.userInfo = user
				uni.setStorageSync('user', user)
			},
		
		},
		

		globalData: {
			userInfo: null,
			
		}
		
	}
</script>

<style lang="scss">
	@import './components/xuanyu/index.scss';
</style>
<style>
	@import './common/css/uni.css';
	
	
	.background{
	  background: #f8f8f9;
	}
	.text-ellipsis {
	  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
	}
	.text-ellipsis2{
		-webkit-line-clamp:2
	}
	.text-ellipsis3{
		-webkit-line-clamp:3
	}
	.text-ellipsis2,.text-ellipsis3{
		overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-box-orient:vertical
	}

</style>
