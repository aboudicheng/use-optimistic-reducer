# use-optimistic-reducer
[![npm version](https://badge.fury.io/js/use-optimistic-reducer.svg)](https://badge.fury.io/js/use-optimistic-reducer) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) ![npm bundle size](https://img.shields.io/bundlephobia/minzip/use-optimistic-reducer) ![David](https://img.shields.io/david/aboudicheng/use-optimistic-reducer)

React reducer hook for handling optimistic UI updates and race-conditions.

## Installation
With npm:

```
$ npm install use-optimistic-reducer
```

With yarn:

```
$ yarn add use-optimistic-reducer
```


## How It Works
Internally, `useOptimisticReducer` uses the `React.useReducer()` hook to handle its state. You can use `useOptimisticReducer` to update the state by dispatching an action.

Whenever you need to make an optimistic UI update, you simply need to add another property named as `optimistic` inside your action object.

By default, **a queue is formed whenever a new action is being dispatched.** If an action of the same type is dispatched, this action's callback will be put into the queue and wait until all the previous callbacks to be executed.

**If you wish to put your callbacks onto a separate queue, you may define a string as the identifier for the queue.**

An example of an optimistic action object would look like this:

```javascript
const action = {
  type: "ADD_TODO",
  payload: {},
  optimistic: {
    callback: async () => {},
    fallback: (prevState) => {}, // (Optional)
    queue: "" // (Optional)
  }
}
``` 

## The `optimistic` property

| Name                      | Required | Default | Type | Description |
| ------------------------- | -------- | ------- | ---- | ------------|
| callback | yes |  | Function | Callback function that will be called in the background. It should be an asynchronous function. |
| fallback | no | | Function(prevState) | Fallback function that will be called when `callback` throws an error. `prevState` is the previous state before the error occurred. |
| queue | no | action.type | string | Identifier that will be used to execute callbacks on separate queues |

## Example Usage

[Live Demo](https://codesandbox.io/s/use-optimistic-reducer-example-qh7zy)
```javascript
import React from "react";
import useOptimisticReducer from "use-optimistic-reducer";

const initialState = { count: 0 };

function reducer(state, action) {
  switch (action.type) {
    case "reset":
      return action.payload;
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
      callback: () => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            console.log("This is a callback from double-increment");
            resolve();
          }, 3000);
        });
      },
      fallback: (prevState) => {
        alert("Failed!");
        dispatch({ type: "reset", payload: prevState });
      },
      queue: "double"
    }
  };

  const doubleDecAction = {
    type: "double-decrement",
    optimistic: {
      callback: () => {
        return new Promise(resolve => {
          setTimeout(() => {
            console.log("This is a callback from double-decrement");
            resolve();
          }, 3000);
        });
      },
      fallback: (prevState) => {
        alert("Failed!");
        dispatch({ type: "reset", payload: prevState });
      },
      queue: "double"
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