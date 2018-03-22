var path = require('path');
var webpack = require('webpack');
var workbox = require('workbox-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var AotPlugin = require('@ngtools/webpack').AngularCompilerPlugin;
var commonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
var providePlugin = webpack.ProvidePlugin;

module.exports = {
    entry: {
        'app': path.join(__dirname,'./src/client/main.ts'),
        'vendor': path.join(__dirname,'./src/client/vendor.ts'),
    },
    output: {
        filename: '[name].min.js',
        path: path.join(__dirname, 'dist/client')
    },
    resolve: {
        extensions: ['.ts', '.js', '.json']
    },
    module: {
        rules: [
            {
                test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
                loader: '@ngtools/webpack'
            },
            {
                test: /\.scss$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'raw-loader'
                    }, 
                    {
                        loader:'sass-loader',
                        options: {
                            outputStyle: 'compressed'
                        }
                    }
                ]
            },
            { 
                test: /\.(html|css)$/, 
                loader: 'raw-loader'
            },
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            chunksSortMode: 'dependency',
            filename: path.join(__dirname, './dist/client/index.html'),
            template: path.join(__dirname, './src/client/index.html'),
            inject: 'body',
            hash: true,
            // favicon: path.join(__dirname, './src/client/favicon.ico')
        }),
        new AotPlugin({
            tsConfigPath: path.join(__dirname, './src/client/tsconfig.json'),
            mainPath: path.join(__dirname, './src/client/main.ts'),
            typeChecking: false,
        }),
        new providePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.$': 'jquery',
            'window.jQuery': 'jquery',
            'window.jquery': 'jquery',
            'window.Tether': 'tether',
            'Tether': 'tether',
        }),
        new commonsChunkPlugin({
            name: 'common',
            minChunks: 2,
            chunks: ['app', 'vendor']
        }),
        new workbox.GenerateSW({
            swDest: 'sw.js',
            clientsClaim: true,
            skipWaiting: true
        })
    ]
};