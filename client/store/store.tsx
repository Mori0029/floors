import React, { useReducer, createContext, useContext, ReactNode } from "react";

import { upsertArray } from "../utils/array";

import { StoreModel, PartialStoreModel } from "./models";

import { defaultSettings } from "./defaultSettings";

import { repairStore } from "./repairStore";

export type ActionModel = StoreActionModel | HistoryActionModel;

interface StoreActionModel extends Partial<PartialStoreModel> {
  readonly type: ActionType.Reset | ActionType.Upsert;
}

interface HistoryActionModel {
  readonly type: ActionType.Undo | ActionType.Redo;
}

export enum ActionType {
  Reset,
  Upsert,
  Undo,
  Redo,
}

export interface StoreContext extends StoreModel, HistoryContext {
  reset: (partial: PartialStoreModel) => void;
  upsert: (partial: PartialStoreModel) => void;
}

interface HistoryContext {
  /** set store to last snapshot */
  undo: () => void;
  /** number of undos */
  undos: number;
  /** sets store to undone last snapshot */
  redo: () => void;
  /** number of redos */
  redos: number;
}

interface HistoryModel<T> {
  past: T[];
  present: T;
  future: T[];
}

const StoreContext = createContext<StoreContext>(null);

export function useStore(): StoreContext {
  return useContext(StoreContext);
}

export function StoreProvider(props: { children: ReactNode | ReactNode[]; initial?: PartialStoreModel }): JSX.Element {
  const [history, dispatch] = useReducer(historyReducer, props.initial, init);

  const contextValue: StoreContext = {
    ...history.present,
    reset(partial: PartialStoreModel = {}) {
      dispatch({ ...partial, type: ActionType.Reset });
    },
    upsert(partial: PartialStoreModel = {}) {
      dispatch({ ...partial, type: ActionType.Upsert });
    },
    undo() {
      dispatch({ type: ActionType.Undo });
    },
    redo() {
      dispatch({ type: ActionType.Redo });
    },
    undos: history.past.length,
    redos: history.future.length,
  };

  return <StoreContext.Provider value={contextValue}>{props.children}</StoreContext.Provider>;
}

function init(store: Partial<PartialStoreModel> = {}): HistoryModel<StoreModel> {
  return { past: [], present: repairStore(store), future: [] };
}

const maxHistorySteps = 50;

function historyReducer<Model extends StoreModel>(history: HistoryModel<Model>, action: ActionModel) {
  // console.debug("[history]", ActionType[action.type]);

  switch (action.type) {
    case ActionType.Undo: {
      const [present, ...past] = history.past;
      if (present) {
        const future = [history.present, ...history.future].slice(0, maxHistorySteps);
        return { future, past, present };
      } else {
        return history;
      }
    }

    case ActionType.Redo: {
      const [present, ...future] = history.future;
      if (present) {
        const past = [history.present, ...history.past].slice(0, maxHistorySteps);
        return { future, past, present };
      } else {
        return history;
      }
    }

    case ActionType.Reset: {
      const past = [] as Model[];
      const future = [] as Model[];
      const present = storeReducer(history.present, action);
      return { past, future, present };
    }

    default: {
      const past = [history.present, ...history.past];
      const future = [] as Model[];
      const present = storeReducer(history.present, action);
      return { past, future, present };
    }
  }
}

function storeReducer(store: StoreModel, action: ActionModel) {
  // console.debug("[store]", ActionType[action.type]);

  switch (action.type) {
    case ActionType.Reset: {
      const elements = upsertArray([], action.elements);
      const slots = upsertArray([], action.slots);
      const pallets = upsertArray([], action.pallets);
      const settings = { ...defaultSettings, ...action.settings };
      return repairStore({ elements, slots, pallets, settings });
    }

    case ActionType.Upsert: {
      const elements = upsertArray(store.elements, action.elements);
      const slots = upsertArray(store.slots, action.slots);
      const pallets = upsertArray(store.pallets, action.pallets);
      const settings = { ...store.settings, ...action.settings };
      return repairStore({ elements, slots, pallets, settings });
    }

    default:
      // console.warn("[store]", "action unknown:", action);
      return store;
  }
}
