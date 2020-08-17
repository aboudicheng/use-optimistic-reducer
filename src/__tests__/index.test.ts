import useOptimisticReducer from '../index';
import { renderHook, act } from '@testing-library/react-hooks'

const initialState = { count: 0 };

function reducer(state: any, action: any) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    case 'double-increment':
      return { count: state.count + 2 };
    case 'double-decrement':
      return { count: state.count - 2 };
    case 'reset':
      return { count: 0 };
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
          callback: async () => { }
        }
      });
    });

    expect(result.current[0].count).toBe(1);
  });

  test('correctly executes optimistic callback', () => {
    const { result } = renderHook(() => useOptimisticReducer(reducer, initialState));
    const [, dispatch] = result.current;

    act(() => {
      result.current[1]({
        type: 'increment',
        optimistic: {
          callback: async () => {
            dispatch({ type: 'increment' });
            dispatch({ type: 'increment' });
          }
        }
      });
    });

    expect(result.current[0].count).toBe(3);
  });

  test('returns correct state after fallback', () => {
    const { result } = renderHook(() => useOptimisticReducer(reducer, initialState));
    const [, dispatch] = result.current;

    act(() => {
      dispatch({
        type: 'increment',
        optimistic: {
          callback: async () => {
            throw 'Error';
          },
          fallback: (state: any) => {
            expect(state.count).toBe(0);
          }
        }
      });
    });

    expect(result.current[0].count).toBe(1);
  });
});