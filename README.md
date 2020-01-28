# use-optimistic-reducer
React reducer hook for handling optimistic UI updates and race-conditions.

## Installation
`$ npm install use-optimistic-reducer`

## How It Works
Internally, `useOptimisticReducer` uses the `React.useReducer()` hook to handle its state. You can use `useOptimisticReducer` to update the state by sending an action using `dispatch`.
<br>
Whenever you need to make an optimistic UI update, you simply need to add another property named as `optimistic` inside your action object.
<br>
An example of an optimistic action object would look like this:

```javascript
const action = {
  type: "ADD_TODO",
  payload: {},
  optimistic: {
    // Callback function that will be called in the background. It should be an async function
    callback: async function () {
    },
    // Fallback function that will be called when callback throws and error. You may optionally return an action that will be dispatched immediately.
    fallbackAction: function () {
    }
  }
}
``` 

## Example Usage
```javascript
import React from "react";
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
      callback: async function () {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            console.log("This is a callback from double-increment");
            resolve();
          }, 3000);
        });
      }
    },
    fallbackAction: function () {
      alert("Failed!");
      return { type: "double-decrement" };
    }
  };

  const doubleDecAction = {
    type: "double-decrement",
    optimistic: {
      callback: async function () {
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
```