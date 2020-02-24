<template>
	<view>
		<view class="x-cell-group">
			<view class="x-cell x-field">
				<view class="x-cell__title x-field__label"><span>手机号码</span></view>
				<view class="x-cell__value">
					<view class="x-field__body"><input type="text" @input="bindPhone" :value="phone" placeholder="请输入手机号码" class="x-field__control" /></view>
				</view>
			</view>
			<view class="x-cell x-field">
				<view class="x-cell__title x-field__label"><span>密码</span></view>
				<view class="x-cell__value">
					<view class="x-field__body"><input type="text" @input="bindPassword" :value="password" placeholder="请输入密码" class="x-field__control" /></view>
				</view>
			</view>
		</view>
		<view style="padding: 20rpx;">
			<button @click="login" class="x-button x-button--primary x-button--large">登录</button>
		</view>
		
	</view>
</template>

<script>
import api from '@/common/js/api.js';
import util from '@/common/js/util.js';
const app = getApp();
export default {
	components: {
		
	},
	data() {
		return {
			phone: '',
			password: '',
		};
	},
	methods: {
		async bindPhone(e) {
			this.phone = e.detail.value;
		},
		async bindPassword(e) {
			this.password = e.detail.value;
		},
		
		async login() {
			if(this.phone.length != 11) {
				uni.showToast({
					title: '请输入正确的手机号码',
					icon: 'none'
				})
				return
			}
			if(this.password.length === 0) {
				uni.showToast({
					title: '请输入登录密码',
					icon: 'none'
				})
				return
			}
			
			let response = await api.login({
				phone: this.phone,
				password: this.password,
				
			})
			
			if(response.data.status == 1) {
				uni.reLaunch({
					url: '/pages/index/index'
				})
			} else {
				uni.showToast({
					title: response.data.message,
					icon: 'none'
				})
			}
			
		}
	},
	onUnload() {}
};
</script>

<style></style>
