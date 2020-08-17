import { useState, useEffect, useReducer, useCallback } from 'react';
import { Scheduler, Awaited, Optimistic, Reducer, ReducerState, Dispatch, ReducerAction } from './types';

function useOptimisticReducer<R extends Reducer<any, any>>(
  reducer: R,
  initializerArg: ReducerState<R>
): [ReducerState<R>, Dispatch<ReducerAction<R>>] {
  const [scheduler, setScheduler] = useState<Scheduler>({});
  const [awaited, setAwaited] = useState<Awaited>({ key: null });

  const [state, dispatch] = useReducer(reducer, initializerArg);

  useEffect(() => {
    runCallback();
  }, [scheduler]);

  useEffect(() => {
    if (awaited.key) {
      nextSchedule(awaited.key);
    }
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
            isCompleted: !nextQueue.length
          }
        };
      });
    },
    [scheduler]
  );

  async function runCallback() {
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

        try {
          await optimistic.queue[0].callback();
          setAwaited({ key });
        }
        catch (e) {
          // Retrieve previous state
          const { prevState } = scheduler[key];

          // Execute fallback if provided
          const { fallback } = scheduler[key].queue[0];

          if (typeof fallback !== 'undefined') {
            fallback(prevState);
          }

          // Reset scheduler
          setScheduler((prev) => {
            return {
              ...prev,
              [key]: {
                queue: [],
                isFetching: false,
                isCompleted: true,
                prevState: {}
              }
            };
          });
        }
      }
    }
  }

  function customDispatch(action: ReducerAction<R>): void {
    // Update the UI first
    dispatch(action);

    // If action is dispatched optimistically
    const optimistic: Optimistic = action.optimistic;
    let currentScheduler = scheduler;

    if (typeof optimistic === 'object') {
			/**
       * If a specific queue is included within the optimistic object,
       * the actions will be executed in a separate queue.
       * If no queue is specified, the action type will be used by default.
       */
      const key: string = optimistic.queue ?? action.type;

      // Schedule callback
      if (key in scheduler) {
        // Append action into the existing queue
        currentScheduler = {
          ...currentScheduler,
          [key]: {
            ...currentScheduler[key],
            queue: [...currentScheduler[key].queue, optimistic],
            isCompleted: false,
            prevState: state
          }
        };
      }
      else {
        // Add action to a new queue
        currentScheduler = {
          ...currentScheduler,
          [key]: {
            queue: [optimistic],
            isFetching: false,
            isCompleted: false,
            prevState: state
          }
        };
      }
      setScheduler(currentScheduler);
    }
  }

  return [state, customDispatch];
}

export default useOptimisticReducer;
