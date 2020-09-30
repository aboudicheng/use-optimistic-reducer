import { useState, useEffect, useReducer, useCallback } from 'react';
import {
  Scheduler,
  Awaited,
  Optimistic,
  Reducer,
  ReducerState,
  Dispatch,
  ReducerAction,
} from './types';
import { useImmer } from 'use-immer';

function useOptimisticReducer<R extends Reducer<any, any>>(
  reducer: R,
  initializerArg: ReducerState<R>
): [ReducerState<R>, Dispatch<ReducerAction<R>>] {
  const [awaited, setAwaited] = useState<Awaited>({ key: null });
  const [scheduler, setScheduler] = useImmer<Scheduler>({});

  const [state, dispatch] = useReducer(reducer, initializerArg);

  useEffect(() => {
    (async () => {
      for (const key in scheduler) {
        const optimistic = scheduler[key];
        // If queue is waiting to be called
        if (!optimistic.isCompleted && !optimistic.isFetching) {
          // Start fetching
          setScheduler((draft) => {
            draft[key] = {
              ...draft[key],
              isFetching: true,
            };
          });

          try {
            await optimistic.queue[0].callback();
            setAwaited({ key });
          } catch (e) {
            // Retrieve previous state
            const { prevState } = scheduler[key];

            // Execute fallback if provided
            const { fallback } = scheduler[key].queue[0];

            if (typeof fallback !== 'undefined') {
              fallback(prevState);
            }

            // Reset scheduler
            setScheduler((draft) => {
              draft[key] = {
                queue: [],
                isFetching: false,
                isCompleted: true,
                prevState: {},
              };
            });
          }
        }
      }
    })();
  }, [scheduler]);

  useEffect(() => {
    if (awaited.key) {
      nextSchedule(awaited.key);
    }
  }, [awaited]);

  const nextSchedule = useCallback(
    (key: string) => {
      const nextQueue = scheduler[key].queue.slice(1);

      setScheduler((draft) => {
        draft[key] = {
          ...draft[key],
          queue: nextQueue,
          isFetching: false,
          isCompleted: !nextQueue.length,
        };
      });
    },
    [scheduler]
  );

  function customDispatch(action: ReducerAction<R>): void {
    // Update the UI first
    dispatch(action);

    // If action is dispatched optimistically
    const optimistic: Optimistic = action.optimistic;

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
        setScheduler((draft) => {
          draft[key] = {
            ...draft[key],
            queue: [...draft[key].queue, optimistic],
            isCompleted: false,
            prevState: state,
          };
        });
      } else {
        // Add action to a new queue
        setScheduler((draft) => {
          draft[key] = {
            queue: [optimistic],
            isFetching: false,
            isCompleted: false,
            prevState: state,
          };
        });
      }
    }
  }

  return [state, customDispatch];
}

export default useOptimisticReducer;
