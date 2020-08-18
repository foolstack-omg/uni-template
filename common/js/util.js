const formatTime = (date, format = 'datetime') => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()

    switch (format) {
        case 'datetime':
            return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
        case 'datetime-no-sec':
            return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute].map(formatNumber).join(':')
        case 'date':
            return [year, month, day].map(formatNumber).join('/')
        default:
            throw `Format ${format} is not defined.`
    }

}

const formatNumber = n => {
    n = n.toString()
    return n[1] ? n : '0' + n
}

const base64ToString = base64 => {
    let arrayBuffer = wx.base64ToArrayBuffer(base64)
    let unit8Arr = new Uint8Array(arrayBuffer)
    let encodedString = String.fromCharCode.apply(null, unit8Arr)
    return decodeURIComponent(escape((encodedString)))
}

const formatBankCardNumber = number => {
    return number.replace(/(.{4})/g, "$1 ")
}

const controlDigitField = (name, value, that) => {
    if (value.length === 0) {
        that.setData({
            [name]: 0
        })
    } else {
        if ((/^\d*$/.test(value.toString()))) {
            that.setData({
                [name]: Number.parseFloat(value) + ''
            })
        } else {
            let regex = /^(\d*)(\.(\d){0,2})?$/
            if (!regex.test(value.toString())) {
                that.setData({
                    [name]: value.substring(0, value.indexOf('.') + 1) + value.substring(value.indexOf('.') + 1, value.indexOf('.') + 3).replace(/\./g, '')
                })
            } else {
                that.setData({
                    [name]: value
                })
            }
        }
    }
}

/*函数节流*/
function throttle(fn, interval) {
    var enterTime = 0;//触发的时间
    var gapTime = interval || 300 ;//间隔时间，如果interval不传，则默认300ms
    return function() {
        var context = this;
        var backTime = new Date();//第一次函数return即触发的时间
        if (backTime - enterTime > gapTime) {
            fn.apply(context,arguments);
            enterTime = backTime;//赋值给第一次触发的时间，这样就保存了第二次触发的时间
        }
    };
}

/*函数防抖*/
function debounce(fn, interval) {
    var timer;
    var gapTime = interval || 1000;//间隔时间，如果interval不传，则默认1000ms
    return function() {
        clearTimeout(timer);
        var context = this;
        var args = arguments;//保存此处的arguments，因为setTimeout是全局的，arguments不是防抖函数需要的。
        timer = setTimeout(function() {
            fn.apply(context,args);
        }, gapTime);
    };
}

const countDown = (remain_timestamp) => {
    let days = 0, hours = 0, minutes = 0, seconds = 0
    if(remain_timestamp > 0) {
        hours = Math.floor(remain_timestamp / 3600)
        remain_timestamp -= hours * 3600
        minutes = Math.floor(remain_timestamp / 60)
        remain_timestamp -= minutes * 60
        seconds = remain_timestamp
    }
    return {
        hours: hours,
        minutes: minutes,
        seconds: seconds
    }
}

const prefixZero = (num, n)  => {
    return (Array(n).join(0) + num).slice(-n);
}

function getQueryString(name)
{
   var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
   var r = window.location.search.substr(1).match(reg);
   if(r!=null)return unescape(r[2]); return null;
}

export default {
    formatTime, formatNumber, base64ToString, 
	formatBankCardNumber, throttle, debounce, controlDigitField,
	countDown, prefixZero, getQueryString
}
