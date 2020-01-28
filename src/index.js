import { useState, useEffect, useReducer, useCallback } from "react";

function useOptimisticReducer() {
  const [scheduler, setScheduler] = useState({});
  const [awaited, setAwaited] = useState(null);

  const [state, dispatch] = useReducer(...arguments);

  useEffect(() => {
    runCallback();
  }, [scheduler]);

  useEffect(() => {
    if (awaited) nextSchedule(awaited.key);
  }, [awaited]);

  const nextSchedule = useCallback(
    key => {
      const nextQueue = scheduler[key].queue.slice(1);

      setScheduler(prev => {
        return {
          ...prev,
          [key]: {
            ...prev[key],
            queue: nextQueue,
            isFetching: false,
            isCompleted: nextQueue.length ? false : true
          }
        };
      });
    },
    [scheduler]
  );

  function runCallback() {
    for (let key in scheduler) {
      const optimistic = scheduler[key];
      // If queue is waiting to be called
      if (!optimistic.isCompleted && !optimistic.isFetching) {
        // Start fetching
        setScheduler(prev => {
          return {
            ...prev,
            [key]: {
              ...prev[key],
              isFetching: true
            }
          };
        });

        optimistic.queue[0]
          .callback()
          .then(() => {
            setAwaited({ key });
          })
          .catch(e => {
            const action = scheduler[key].fallbackAction();
            // if an action is returned
            if (action.type) {
              dispatch(action);
            }
            setScheduler(prev => {
              return {
                ...prev,
                [key]: {
                  queue: [],
                  isFetching: false,
                  isCompleted: true
                }
              };
            });
          });
      }
    }
  }

  function customDispatch(action) {
    // Update the UI first
    dispatch(action);

    const { optimistic, fallbackAction } = action;
    let currentScheduler = scheduler;

    // If action is dispatched optimistically
    if (typeof optimistic === "object") {
      // Schedule callback
      if (action.type in scheduler) {
        // Append action into the existing queue
        currentScheduler = {
          ...currentScheduler,
          [action.type]: {
            ...currentScheduler[action.type],
            queue: [...currentScheduler[action.type].queue, optimistic],
            isCompleted: false
          }
        };
      } else {
        // Add action to a new queue
        currentScheduler = {
          ...currentScheduler,
          [action.type]: {
            queue: [optimistic],
            fallbackAction,
            isFetching: false,
            isCompleted: false
          }
        };
      }
      setScheduler(currentScheduler);
    }
  }

  return [state, customDispatch];
}

export default useOptimisticReducer;