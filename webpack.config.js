var path = require('path');
var webpack = require('webpack');
var workbox = require('workbox-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var HtmlWebpackExcludeAssetsPlugin = require('html-webpack-exclude-assets-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var uncss = require('postcss-uncss');
var autoprefixer = require('autoprefixer');
var cssnano = require('cssnano');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var CircularDependencyPlugin = require('circular-dependency-plugin');
var AotPlugin = require('@ngtools/webpack').AngularCompilerPlugin;
var commonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;

module.exports = {
    entry: {
        'app': path.join(__dirname,'./src/client/main.ts'),
        'vendor': path.join(__dirname,'./src/client/vendor.ts'),
        'styles': path.join(__dirname, './src/client/styles.scss')
    },
    output: {
        filename: '[name].min.js',
        path: path.join(__dirname, 'dist/client')
    },
    resolve: {
        extensions: ['.ts', '.js', '.json', '.scss', '.css']
    },
    module: {
        rules: [
            {
                test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
                loader: '@ngtools/webpack'
            },
            {
                test: /\.scss$/,
                include: [path.join(__dirname, './src/client/components')],
                use: [
                    {
                        loader: 'raw-loader'
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            ident: 'postcss',
                            plugins: function(loader){
                                return [
                                    uncss({html: [path.join(__dirname, './src/client/index.html'), path.join(__dirname, './src/client/**/*.html')]}),
                                    autoprefixer({remove: false, flexbox: true}),
                                    cssnano
                                ]
                            }
                        }
                    },
                    {
                        loader:'sass-loader'
                    }
                ]
            },
            {
                test: /\.scss$/,
                include: [path.join(__dirname, './node_modules'), path.join(__dirname, './src/client/styles'), path.join(__dirname, './src/client/styles.scss')],
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        {
                            loader: 'css-loader'
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                ident: 'postcss',
                                plugins: function(loader){
                                    return [
                                        uncss({html: [path.join(__dirname, './src/client/index.html'), path.join(__dirname, './src/client/**/*.html')]}),
                                        autoprefixer({remove: false, flexbox: true}),
                                        cssnano
                                    ]
                                }
                            }
                        },
                        {
                            loader:'sass-loader'
                        }
                    ]
                })
            },
            // fonts
            {
                test: /\.((ttf)|(woff(2?))|(eot)|(svg))/,
                loader: 'file-loader'
            },
            // images
            {
                test: /\.((jpg)|(png)|(gif)|(bmp)|(ico)|(svg))/,
                loader: 'file-loader',
                exclude: [path.join(__dirname, './src/client/assets')]
            },
            // templateUrl
            { 
                test: /\.html$/, 
                loader: 'raw-loader'
            },
        ]
    },
    plugins: [
        new HtmlWebpackExcludeAssetsPlugin(),
        new HtmlWebpackPlugin({
            filename: path.join(__dirname, './dist/client/index.html'),
            template: path.join(__dirname, './src/client/index.html'),
            inject: 'body',
            hash: true,
            excludeAssets: [/styles\..*js/i],
            chunksSortMode: function(a,b) {
                if (a.names[0] === 'common') {
                    return -1;
                }
                if (a.names[0] === 'app') {
                    return 1;
                }
                if (a.names[0] === 'vendor' && b.names[0] === 'app') {
                    return -1;
                } else {
                    return 1;
                }
            },
        }),
        new AotPlugin({
            tsConfigPath: path.join(__dirname, './src/client/tsconfig.json'),
            mainPath: path.join(__dirname, './src/client/main.ts'),
            typeChecking: false,
        }),
        new commonsChunkPlugin({
            name: 'common',
            minChunks: 2,
            async: false,
            children: false
        }),
        new ExtractTextPlugin({
            allChunks: true, 
            filename: 'styles.min.css'
        }),
        new CircularDependencyPlugin({
            exclude: /node_modules/,
            failOnError: true
        }),
        new CopyWebpackPlugin([
            {
                from: path.join(__dirname, './src/client/assets'),
                to: path.join(__dirname, './dist/client/assets')
            }
        ]),
        new workbox.GenerateSW({
            swDest: 'sw.js',
            clientsClaim: true,
            skipWaiting: true,
            include: [/assets/, /.*\.((html)|(css)|(jpg)|(png)|(svg)|(woff(2?))|(eot)|(ttf))/, /((common)|(vendor)|(app))\.min\.js/],
            exclude: [/manifest/],
            runtimeCaching: [{
                // Match any same-origin request that contains 'api'.
                urlPattern: /api/,
                // Apply a network-first strategy.
                handler: 'networkFirst',
                options: {
                  // Fall back to the cache after 10 seconds.
                  networkTimeoutSeconds: 10,
                  // Use a custom cache name for this route.
                  cacheName: 'api-cache',
                  // Configure custom cache expiration.
                  expiration: {
                    maxEntries: 10
                  },
                  // Configure which responses are considered cacheable.
                  cacheableResponse: {
                    statuses: [0, 200, 204]
                  }
                }
            }]
        })
    ]
};
