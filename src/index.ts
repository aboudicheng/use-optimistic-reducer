import { useState, useEffect, useReducer, useCallback } from "react";
import {
  IScheduler,
  IAwaited,
  Reducer,
  ReducerState,
  Dispatch,
  ReducerAction
} from './types';

function useOptimisticReducer<R extends Reducer<any, any>, I>(
  reducer: R,
  initializerArg: I & ReducerState<R>
): [ReducerState<R>, Dispatch<ReducerAction<R>>] {
  const [scheduler, setScheduler] = useState<IScheduler>({});
  const [awaited, setAwaited] = useState<IAwaited>({ key: null });

  const [state, dispatch] = useReducer(reducer, initializerArg);

  useEffect(() => {
    runCallback();
  }, [scheduler]);

  useEffect(() => {
    if (awaited.key) nextSchedule(awaited.key);
  }, [awaited]);

  const nextSchedule = useCallback(
    (key: string) => {
      const nextQueue = scheduler[key].queue.slice(1);

      setScheduler((prev) => {
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

  function runCallback(): void {
    for (let key in scheduler) {
      const optimistic = scheduler[key];
      // If queue is waiting to be called
      if (!optimistic.isCompleted && !optimistic.isFetching) {
        // Start fetching
        setScheduler((prev) => {
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
          .catch(() => {
            const action = scheduler[key].queue[0].fallbackAction();
            // if an action is returned
            if (typeof action === 'object') {
              dispatch(action);
            }
            setScheduler((prev) => {
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

  function customDispatch(action: ReducerAction<R>): void {
    // Update the UI first
    dispatch(action);

    // If action is dispatched optimistically
    const { optimistic } = action;
    let currentScheduler = scheduler;

    if (typeof optimistic === "object") {
      /**
       * If a specific queue is included within the optimistic object,
       * the actions will be executed in a separate queue.
       * If no queue is specified, the action type will be used by default.
       */
      const key: string = optimistic.queue ? optimistic.queue : action.type;
      // Schedule callback
      if (key in scheduler) {
        // Append action into the existing queue
        currentScheduler = {
          ...currentScheduler,
          [key]: {
            ...currentScheduler[key],
            queue: [...currentScheduler[key].queue, optimistic],
            isCompleted: false
          }
        };
      } else {
        // Add action to a new queue
        currentScheduler = {
          ...currentScheduler,
          [key]: {
            queue: [optimistic],
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