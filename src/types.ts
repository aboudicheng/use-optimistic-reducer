export interface IOptimistic {
  callback: Function,
  fallbackAction: Function,
  queue?: string
}

export interface IScheduler {
  [key: string]: {
    queue: IOptimistic[],
    isFetching: boolean,
    isCompleted: boolean
  }
}

export interface IAwaited {
  key?: string | null
}

export type Dispatch<A> = (value: A) => void;
export type Reducer<S, A> = (prevState: S, action: A) => S;
export type ReducerState<R extends Reducer<any, any>> = R extends Reducer<infer S, any> ? S : never;
export type ReducerAction<R extends Reducer<any, any>> = R extends Reducer<any, infer A> ? A : never;