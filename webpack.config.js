module.exports = {
  entry: "./public/main.jsx",
  output: {
    path: __dirname,
    filename: "/public/main.js"
  },
  module: {
    loaders: [
      {
        test: /\.jsx$/,
        exclude: /(node_modules)/,
        loader: "babel", // 'babel-loader' is also a valid name to reference
        query: {
          presets: ["react", "es2015"]
        }
      }
    ]
  }
};
