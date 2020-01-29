import useOptimisticReducer from '../index';
import { renderHook, act } from '@testing-library/react-hooks'

const initialState = { count: 0 };

function reducer(state: any, action: any) {
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

describe('useOptimisticState', () => {
  test('returns correct initial state', () => {
    const { result } = renderHook(() => useOptimisticReducer(reducer, initialState));

    const [state, dispatch] = result.current;

    expect(state).toEqual(initialState);
    expect(typeof dispatch).toBe('function');
  });

  test('returns correct state after dispatching action', () => {
    const { result } = renderHook(() => useOptimisticReducer(reducer, initialState));

    act(() => {
      result.current[1]({ type: 'increment' });
    });

    expect(result.current[0].count).toBe(1);
  });

  test('returns correct state after dispatching optimistic action', () => {
    const { result } = renderHook(() => useOptimisticReducer(reducer, initialState));
    act(() => {
      result.current[1]({
        type: 'increment',
        optimistic: {
          callback: async () => {
            return new Promise((resolve) => {
              setTimeout(() => {
                resolve();
              }, 0);
            });
          },
          fallbackAction: () => {
            return { type: 'decrement' };
          }
        }
      });
    });
    expect(result.current[0].count).toBe(1);
  });

  // test('returns correct state after fallback', async () => {
  //   const { result, waitForNextUpdate } = renderHook(() => useOptimisticReducer(reducer, initialState));
  //   const isResolved = renderHook(() => useState(false));

  //   await act(async () => {
  //     result.current[1]({
  //       type: 'increment',
  //       optimistic: {
  //         callback: () => {
  //           return new Promise((resolve, reject) => {
  //             isResolved.result.current[1](true);
  //             reject();
  //           });
  //         },
  //         fallbackAction: () => {
  //           result.current[1]({ type: 'decrement' });
  //         }
  //       }
  //     });
  //     await isResolved.waitForNextUpdate();
  //   })

  //   expect(result.current[0].count).toBe(0);
  // });
});