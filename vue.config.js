const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
    // publicPath: './',
    lintOnSave: false,
    transpileDependencies: true,
    devServer: {
        port: 8000,
        proxy: {
            '/api': {
                // 此处的写法，目的是为了 将 /api 替换成 https://www.baidu.com/
                target: 'http://www.weather.com.cn/',
                // 允许跨域
                changeOrigin: true,
                ws: true,
                pathRewrite: {
                    '^/api': ''
                }
            }
        }
    },
})
