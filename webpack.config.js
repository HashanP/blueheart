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
          presets: ["es2015", "react", "stage-2"]
        }
      },
      {
	test: /\.json$/,
	exclude: /(node_modules)/,
	loader: "json"
      }
    ]
  }
};
