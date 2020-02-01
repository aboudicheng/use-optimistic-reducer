import React from "react";
import { render } from "react-dom";
import useOptimisticReducer from "use-optimistic-reducer";

const initialState = { count: 0 };

function reducer(state, action) {
  switch (action.type) {
    case "increment":
      return { count: state.count + 1 };
    case "decrement":
      return { count: state.count - 1 };
    case "double-increment":
      return { count: state.count + 2 };
    case "double-decrement":
      return { count: state.count - 2 };
    default:
      return state;
  }
}

function App() {
  // Define your reducer the same way you would for React.useReducer()
  const [state, dispatch] = useOptimisticReducer(reducer, initialState);

  // optimistic actions
  const doubleIncAction = {
    type: "double-increment",
    optimistic: {
      callback: function () {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            console.log("This is a callback from double-increment");
            resolve();
          }, 3000);
        });
      },
      fallbackAction: function () {
        alert("Failed!");
        return { type: "double-decrement" };
      }
    }
  };

  const doubleDecAction = {
    type: "double-decrement",
    optimistic: {
      callback: function () {
        return new Promise(resolve => {
          setTimeout(() => {
            console.log("This is a callback from double-decrement");
            resolve();
          }, 3000);
        });
      },
      fallbackAction: function () {
        alert("Failed!");
        return { type: "double-increment" };
      }
    }
  };

  return (
    <>
      Count: {state.count}
      <button onClick={() => dispatch({ type: "decrement" })}>-</button>
      <button onClick={() => dispatch({ type: "increment" })}>+</button>
      <button onClick={() => dispatch(doubleIncAction)}>++</button>
      <button onClick={() => dispatch(doubleDecAction)}>--</button>
    </>
  );
}

render(<App />, document.getElementById("root"));
