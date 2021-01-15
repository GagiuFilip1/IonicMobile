import React, {useCallback, useContext, useEffect, useReducer, useState} from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../core';
import { ItemProps } from './ItemProps';
import { createItem, getItems, newWebSocket, updateItem } from './itemApi';
import { AuthContext } from '../auth';
import {useNetwork} from "../useNetwork";
import {useBackgroundTask} from "../useBackgroundTask";

const log = getLogger('ItemProvider');

type SaveItemFn = (item: ItemProps) => Promise<any>;

export interface ItemsState {
  items?: ItemProps[],
  fetching: boolean,
  fetchingError?: Error | null,
  saving: boolean,
  savingError?: Error | null,
  saveItem?: SaveItemFn,
  unsavedData?: ItemProps[],
  clearUnsavedData?: any
}

interface ActionProps {
  type: string,
  payload?: any,
}

const initialState: ItemsState = {
  fetching: false,
  saving: false,
  unsavedData: []
};

const FETCH_ITEMS_STARTED = 'FETCH_ITEMS_STARTED';
const FETCH_ITEMS_SUCCEEDED = 'FETCH_ITEMS_SUCCEEDED';
const FETCH_ITEMS_FAILED = 'FETCH_ITEMS_FAILED';
const SAVE_ITEM_STARTED = 'SAVE_ITEM_STARTED';
const SAVE_ITEM_SUCCEEDED = 'SAVE_ITEM_SUCCEEDED';
const SAVE_ITEM_FAILED = 'SAVE_ITEM_FAILED';
const SAVE_UNPROCESSED_ITEM = 'SAVE_UNPROCESSED_ITEM';
const CLEAN_UNPROCESSED_ITEMS = 'CLEAN_UNPROCESSED_ITEMS';

const reducer: (state: ItemsState, action: ActionProps) => ItemsState =
  (state, { type, payload }) => {
    switch (type) {
      case FETCH_ITEMS_STARTED:
        return { ...state, fetching: true, fetchingError: null };
      case FETCH_ITEMS_SUCCEEDED:
        return { ...state, items: payload.items, fetching: false };
      case FETCH_ITEMS_FAILED:
        return { ...state, fetchingError: payload.error, fetching: false };
      case SAVE_ITEM_STARTED:
        return { ...state, savingError: null, saving: true };
      /*case PROCESS_UNSAVED_DATA:
        let itemsList = [...(state.items || [])];
        let unprocessedItemsList = [...(state.unsavedData || [])];
        itemsList = [itemsList, unprocessedItemsList];
        return { ...state, items:itemsList, saving: false };*/
      case SAVE_ITEM_SUCCEEDED:
        const items = [...(state.items || [])];
        const item = payload.item;
        const index = items.findIndex(it => it._id === item._id);
        if (index === -1) {
          items.splice(0, 0, item);
        } else {
          items[index] = item;
        }
        return { ...state, items, saving: false };
      case CLEAN_UNPROCESSED_ITEMS:
        return { ...state, unsavedData:[], saving: false };
      case SAVE_ITEM_FAILED:
        return { ...state, savingError: payload.error, saving: false };
      case SAVE_UNPROCESSED_ITEM:
        let unsavedData = [...(state.unsavedData || [])];
        unsavedData.push(payload.item);
        console.log('SAVE_UNPROCESSED_ITEM');
        console.log({unsavedData});
        return { ...state, unsavedData, saving: false };
      default:
        return state;
    }
  };

export const ItemContext = React.createContext<ItemsState>(initialState);

interface ItemProviderProps {
  children: PropTypes.ReactNodeLike,
}

export const ItemProvider: React.FC<ItemProviderProps> = ({ children }) => {
  const { storage, tokenFound } = useContext(AuthContext);
  const [state, dispatch] = useReducer(reducer, initialState);
  const { items, fetching, fetchingError, saving, savingError, unsavedData} = state;
  const { networkStatus } = useNetwork();

  useBackgroundTask(() => new Promise(async resolve => {
    console.log(networkStatus.connected)
    if(networkStatus.connected){
      const res = await storage.get({ key: 'token' });
      console.log({unsavedData});

      unsavedData?.map(async (item) => {
        await (item._id ? updateItem(res?.value, item) : createItem(res?.value, item))
      });
      dispatch({ type: CLEAN_UNPROCESSED_ITEMS});
      console.log({unsavedData});
      console.log('My Background Task');
      resolve();
    }
  }));

  useEffect(getItemsEffect, [storage, tokenFound]);
  useEffect(wsEffect, [storage, tokenFound]);
  const saveItem = useCallback<SaveItemFn>(saveItemCallback, [storage, tokenFound]);
  const clearUnsavedData=()=>{
    dispatch({ type: CLEAN_UNPROCESSED_ITEMS});
  }
  const value = { items, fetching, fetchingError, saving, savingError, saveItem, storage, unsavedData,clearUnsavedData};
  log('returns');
  return (
    <ItemContext.Provider value={value}>
      {children}
    </ItemContext.Provider>
  );


  function getItemsEffect() {
    let canceled = false;
    console.log("hey from here")
    fetchItems();
    return () => {
      canceled = true;
    }

    async function fetchItems() {
        let res = await storage.get({ key: 'token' });
        console.log(res);
        if (!res?.value?.trim()) {
          return;
        }
        try {
          if(res?.value){
            log('fetchItems started');
            dispatch({ type: FETCH_ITEMS_STARTED });
            const items = await getItems(res?.value);
            console.log(items,JSON.stringify(items));
            log('fetchItems succeeded');
            if (!canceled) {
              console.log(items);
              await storage.set({
                key: 'items',
                value: JSON.stringify(items),
              });
              dispatch({ type: FETCH_ITEMS_SUCCEEDED, payload: { items } });
            }
          }
        } catch (error) {
          log('fetchItems failed');
          const itemsStorage = await storage.get({key: 'items'});
          if(itemsStorage === undefined) dispatch({ type: FETCH_ITEMS_SUCCEEDED, payload: []  });
          else{
            dispatch({ type: FETCH_ITEMS_SUCCEEDED, payload: { itemsStorage } });
          }
        }
    }
  }

  async function saveItemCallback(item: ItemProps) {
    try {
      console.log(networkStatus.connected)
      if(networkStatus.connected){
        log('saveItem started');
        dispatch({ type: SAVE_ITEM_STARTED });
        const res = await storage.get({ key: 'token' });
        const savedItem = await (item._id ? updateItem(res?.value, item) : createItem(res?.value, item));
        const items = await getItems(res?.value);
        console.log(items);
        await storage.set({
          key: 'items',
          value: JSON.stringify(items),
        });
        log('saveItem succeeded');
        dispatch({ type: SAVE_ITEM_SUCCEEDED, payload: { item: savedItem } });
      }
      else{
        const res = await storage.get({ key: 'items' });
        console.log({res});
        console.log({item});
        dispatch({ type: SAVE_UNPROCESSED_ITEM, payload: { item: item } });
      }
    } catch (error) {
      log('saveItem failed');
      const res = await storage.get({ key: 'items' });
      console.log({res});
      console.log({item});
      dispatch({ type: SAVE_UNPROCESSED_ITEM, payload: { item: item } });
    }
  }

  function wsEffect() {
    storage.get({ key: 'token' }).then((res=>{
      let canceled = false;
      log('wsEffect - connecting');
      let closeWebSocket: () => void;
      if (res?.value?.trim()) {
        closeWebSocket = newWebSocket(res?.value, message => {
          if (canceled) {
            return;
          }
          const { type, payload: item } = message;
          log(`ws message, item ${type}`);
          if (type === 'created' || type === 'updated') {
            dispatch({ type: SAVE_ITEM_SUCCEEDED, payload: { item } });
          }
        });
      }
      return () => {
        log('wsEffect - disconnecting');
        canceled = true;
        closeWebSocket?.();
      }
    }));
  }
};
