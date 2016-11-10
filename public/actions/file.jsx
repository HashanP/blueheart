var updateFile = function(path, data) {
  return {
    type: "UPDATE_FILE",
    path,
    data
  };
};

export { updateFile };
