export type Optimistic = {
  callback: () => Promise<any>;
  fallback?: (prevState: any) => void;
  queue?: string;
};

export type Scheduler = {
  [key: string]: {
    queue: Optimistic[];
    isFetching: boolean;
    isCompleted: boolean;
    prevState: any;
  };
};

export type Awaited = {
  key?: string | null;
};

export type Dispatch<A> = (value: A) => void;
export type Reducer<S, A> = (prevState: S, action: A) => S;
export type ReducerState<R extends Reducer<any, any>> = R extends Reducer<infer S, any> ? S : never;
export type ReducerAction<R extends Reducer<any, any>> = R extends Reducer<any, infer A>
  ? A & { optimistic?: Optimistic }
  : never;
