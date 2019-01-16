const path = require('path')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const ManifestPlugin = require('webpack-manifest-plugin')
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');

module.exports = (env, argv) => {
    const isProduction = argv.mode === 'production'
    return {
        context: __dirname,
        entry: {
            charts: "./js/charts.entry.ts",
            admin: "./js/admin.entry.ts",
            owid: "./theme/js/owid.entry.ts"
        },
        optimization: {
            splitChunks: {
                cacheGroups: {
                    commons: {
                        name: "commons",
                        chunks: "all",
                        minChunks: 2
                    }
                }
            }
        },
        output: {
            path: path.join(__dirname, "dist/webpack"),
            // Seems to be an occasional bug with [chunkhash] causing charts js file to load wrong thing from commons
            // So using build hash for now
            filename: (isProduction ? "[name].bundle.[hash].js" : "[name].js")
        },
          resolve: {
            extensions: [".ts", ".tsx", ".js", ".css"],
            modules: [
                path.join(__dirname, "node_modules"),
            ],
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    loader: "ts-loader",
                    options: {
                        transpileOnly: true,
                        configFile: path.join(__dirname, "tsconfig.client.json")
                    }
                },
                {
                    test: /\.css$/,
                    loader: ExtractTextPlugin.extract({ fallback: 'style-loader', use: ['css-loader?modules&importLoaders=1&localIdentName=[local]'] })
                },
                {
                    test: /\.scss$/,
                    loader: ExtractTextPlugin.extract({ fallback: 'style-loader', use: ['css-loader?modules&importLoaders=1&localIdentName=[local]', 'sass-loader'] })
                },
                {
                    test: /\.(jpe?g|gif|png|eot|woff|ttf|svg|woff2)$/,
                    loader: 'url-loader?limit=10000'
                }
            ],
        },
        plugins: [
            // This plugin extracts css files required in the entry points
            // into a separate CSS bundle for download
            new ExtractTextPlugin(isProduction ? '[name].bundle.[hash].css' : '[name].css'),

            // This plugin writes a hard disk cache that is reused between webpack-dev-server processes
            // so that it's a lot faster to start up
            new HardSourceWebpackPlugin(),

            // Writes manifest.json which production code reads to know paths to asset files
            new ManifestPlugin(),
        ],
        devServer: {
            host: 'localhost',
            port: 8090,
            contentBase: 'public',
            disableHostCheck: true,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
                "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
            }
        },    
    }
}
