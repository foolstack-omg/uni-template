const log = wx.getRealtimeLogManager ? wx.getRealtimeLogManager() : null
const debug = (...args) => {
    if (!log) return
    log.debug(...args)
}
const info = (...args) => {
    if (!log) return
    log.info(...args)
}
const warn = (...args) => {
    if (!log) return
    log.warn(...args)
}
const error = (...args) => {
    if (!log) return
    log.error(...args)
}
const setFilterMsg = (msg) => { // 从基础库2.7.3开始支持
    if (!log || !log.setFilterMsg) return
    if (typeof msg !== 'string') return
    log.setFilterMsg(msg)
}
const addFilterMsg = (msg) => { // 从基础库2.8.1开始支持
    if (!log || !log.addFilterMsg) return
    if (typeof msg !== 'string') return
    log.addFilterMsg(msg)
}

export default {
    debug, info, warn, error, setFilterMsg, addFilterMsg
}
