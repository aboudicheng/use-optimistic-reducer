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

![flowchart](https://raw.githubusercontent.com/aboudicheng/use-optimistic-reducer/master/img/flowchart.png)

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
| fallback | no | | Function(prevState) | Fallback function that will be called when `callback` throws an error. `prevState` is the previous state before the error occurred, and it has the same type as the reducer state. |
| queue | no | action.type | string | Identifier that will be used to execute callbacks on separate queues |

## Example Usage

[Demo with Typescript](https://codesandbox.io/s/use-optimistic-reducer-ts-example-je350)
```tsx
import React from "react";
import useOptimisticReducer from "use-optimistic-reducer";

type StateProps = {
  reaction: string;
};

type Action =
  | { type: "SET_REACTION"; payload: string }
  | { type: "RESET_STATE"; payload: StateProps };

const reducer = (state: StateProps, action: Action) => {
  switch (action.type) {
    case "SET_REACTION":
      if (action.payload === state.reaction) {
        return { ...state, reaction: "" };
      }
      return { ...state, reaction: action.payload };
    case "RESET_STATE":
      return action.payload;
    default:
      return state;
  }
};

const apiCall = () => {
  return new Promise((res, rej) => {
    setTimeout(() => {
      console.log("Response from server");
      res();

      // reject promise to see execution of the fallback
      // rej();
    }, 1000);
  });
};

export default function App() {
  const [state, dispatch] = useOptimisticReducer(reducer, { reaction: "" });

  function handleClick(reaction: string) {
    dispatch({
      type: "SET_REACTION",
      payload: reaction,
      optimistic: {
        callback: apiCall,
        fallback: (prevState) => {
          // revert previous state in case the apiCall throws an exception
          dispatch({ type: "RESET_STATE", payload: prevState });
        },
        queue: "reaction"
      }
    });
  }

  return (
    <div>
      <h1>Reaction: {state.reaction.length ? state.reaction : "None"}</h1>
      <div>
        <button onClick={() => handleClick("Funny")}>
          <span role="img" aria-label="funny">
            😂
          </span>
          Funny
        </button>
        <button onClick={() => handleClick("Amazing")}>
          <span role="img" aria-label="amazing">
            😮
          </span>{" "}
          Amazing
        </button>
        <button onClick={() => handleClick("Sad")}>
          <span role="img" aria-label="sad">
            😢
          </span>{" "}
          Sad
        </button>
      </div>
    </div>
  );
}

```