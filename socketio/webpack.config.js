let webpack = require('webpack');
let path = require('path');

let srcPath  = path.join(__dirname, '/');
let distPath = path.join(__dirname, '/dist');

module.exports = {
    watch : false,
    cache: true,
    devtool: '#cheap-module-eval-source-map',
    context: srcPath,
    entry: {
        app: './clientTS.js'
    },
    output: {
        path: distPath,
        filename: '[name].bundle.js'
    },
    resolve: {
        modules: ['node_modules']
    },
    plugins: [new webpack.NoEmitOnErrorsPlugin()]
};