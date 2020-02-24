<template>
	<view style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh;">
	    <view class="custom-black" style="font-size: 150rpx;">404</view>
	    <view class="custom-grey" style="font-size: 50rpx;">您访问的页面不存在</view>
	    <view style="margin: 50rpx; border-top: 1px solid #eee; text-align: center; width: 250rpx;">
	        
	    </view>
	</view>
</template>

<script>
	
	export default {
		components: {
			
		},
		methods: {
			back() {
				uni.navigateBack()
			}
		}
	}
</script>

<style>
</style>
