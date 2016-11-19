import { createStore, compose, combineReducers } from "redux";
import socket from "./socket.jsx";

var selectFile = function(path, data) {
  return {
    type: "SELECT_FILE",
    path,
    data
  };
};

var saveFile = function(path) {
  return {
    type: "SAVE_FILE",
    path
  };
};

var createFile = function(path) {
  return {
    type: "CREATE_FILE",
    path
  };
}

var createFolder = function(path) {
  return {
    type: "CREATE_FOLDER",
    path
  };
}

const reduceSelectFile = function(state, action) {
  const sub = function(s) {
    console.log(s, action);
    if(s.file) {
      console.log(s.path, action.path, s.path === action.path);
      if(JSON.stringify(s.path) === JSON.stringify(action.path)) {
        return {
          ...s,
          selected: true,
          data: s.edited ? s.data : action.data
        };
      } else {
        return {
          ...s,
          selected: false
        };
      }
    } else {
      return {
        ...s,
        children: s.children.map(sub)
      };
    }
  }

  console.log(state);

  return {
    activePath: state.activePath,
    active: state.active,
    files: sub(state.files),
    user: state.user
  }
}

const reduceUpdateFile = function(state, action) {
  const sub = function(s) {
    if(s.file) {
      if(JSON.stringify(s.path) === JSON.stringify(action.path)) {
        return {
          ...s,
          data: action.data,
          edited: true
        }
      } else {
        return s;
      }
    } else {
      return {
        ...s,
        children: s.children.map(sub)
      }
    }
  }

  console.log(state);

  return {
    ...state,
    files: sub(state.files)
  }
}

const reduceSaveFile = function(state, action) {
  const sub = function(s) {
    if(s.file) {
      if(JSON.stringify(s.path) === JSON.stringify(action.path)) {
        return {
          ...s,
          edited: false
        }
      } else {
        return s;
      }
    } else {
      return {
        ...s,
        children: s.children.map(sub)
      };
    }
  }

  console.log(state);

  return {
    ...state,
    files: sub(state.files)
  };
}

const reduceCreateFile = function(state, action) {
  var novaChild = {
    path: action.path.concat([action.name]),
    file: true,
    name: action.name,
    edited: false,
    selected: false
  };
  const sub = function(s) {
    if(!s.file) {
      if(JSON.stringify(s.path) === JSON.stringify(action.path)) {
        return {
          ...s,
          children: s.children.concat([novaChild])
        };
      } else {
        return {
          ...s,
          children: s.children.map(sub)
        };
      }
    } else {
      return s;
    }
  }

  console.log(state);

  return {
    ...state,
    files: sub(state.files)
  };
}

const reduceCreateFolder = function(state, action) {
  var novaChild = {
    path: action.path.concat([action.name]),
    file: false,
    name: action.name,
    expanded: false,
    children: []
  };
  const sub = function(s) {
    if(!s.file) {
      if(JSON.stringify(s.path) === JSON.stringify(action.path)) {
        return {
          ...s,
          children: s.children.concat([novaChild])
        };
      } else {
        return {
          ...s,
          children: s.children.map(sub)
        }
      }
    } else {
      return s;
    }
  }

  console.log(state);

  return {
    ...state,
    files: sub(state.files)
  };
}

const reduceRemoveFile = function(state, action) {
  const predicate = function(s) {
    return !s.file || JSON.stringify(s.path) !== JSON.stringify(action.path);
  }
  const sub = function(s) {
    if(s.file) {
      return s;
    } else {
      return {
        ...s,
        children: s.children.filter(predicate).map(sub)
      };
    }
  }

  return {
    ...state,
    files: sub(state.files)
  }
}

const reduceLogin = function(state, action) {
  return {
    ...state,
    user: action.user,
    files: action.files
  }
}

const reduceLogout = function(state, action) {
  return {
    ...state,
    user: ""
  };
}

const data = {
  files: [
    {
      file: false,
      name: "bob",
      path: ["bob"],
      open: true,
      expanded: true,
      children: [
        {
          file: true,
          name: "b.js",
          path: ["bob", "b.js"],
          edited: false,
          data: "Bobbi",
          selected: false
        }
      ]
    }
  ],
  active: false,
  activePath: true
};

var rootReducer = function(previousState, action) {
  if(previousState === undefined) {
    previousState = data;
  }
  console.log(previousState, action);
  if(action.type === "SELECT_FILE") {
    return reduceSelectFile(previousState, action);
  } else if(action.type === "UPDATE_FILE") {
    console.log("SUPER WHOOPS");
    return reduceUpdateFile(previousState, action);
  } else if(action.type === "SAVE_FILE") {
    console.log("SUPER WHOOPS");
    return reduceSaveFile(previousState, action);
  } else if(action.type === "LOGIN") {
    return reduceLogin(previousState, action);
  } else if(action.type === "LOGOUT") {
    return reduceLogout(previousState, action);
  } else if(action.type === "SELECT_FOLDER") {
    return reduceSelectFolder(previousState, action);
  } else if(action.type === "REMOVE_FILE") {
    return reduceRemoveFile(previousState, action);
  } else if(action.type === "CREATE_FILE") {
    return reduceCreateFile(previousState, action);
  } else if(action.type === "CREATE_FOLDER") {
    return reduceCreateFolder(previousState, action);
  }
};

var persist = function(previousState, action) {
  window.localStorage.setItem("data", JSON.stringify(previousState));
  return previousState;
};

const store = createStore(compose(persist, rootReducer), window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

socket.on("file", function(path, data) {
  store.dispatch(selectFile(path, data));
});

socket.on("save", function(path) {
  store.dispatch(saveFile(path));
});

socket.on("authSuccess", function(user, files) {
  store.dispatch({type: "LOGIN", user: user, files});
});

socket.on("logoutSuccess", function() {
  store.dispatch({type: "LOGOUT"});
});

socket.on("removeSuccess", function(path) {
  store.dispatch({type: "REMOVE_FILE", path});
});

socket.on("createFileSuccess", function(path, name) {
  store.dispatch({type: "CREATE_FILE", path, name});
});

socket.on("createFolderSuccess", function(path, name) {
  store.dispatch({type: "CREATE_FOLDER", path, name});
});

export default store;
