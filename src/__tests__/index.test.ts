import useOptimisticReducer from '../index';
import { renderHook } from '@testing-library/react-hooks'

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

test('returns correct state', () => {
  const { result } = renderHook(() => useOptimisticReducer(reducer, initialState));

  const [state, dispatch] = result.current;
  
  expect(state).toEqual(initialState);
});