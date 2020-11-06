import React from "react";
import { render } from "react-dom";
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

render(<App />, document.getElementById("root"));
