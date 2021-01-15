import React, {useContext, useEffect, useState} from 'react';
import { RouteComponentProps } from 'react-router';
import {
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonList, IonLoading,
  IonPage,
  IonSelectOption,
  IonTitle,
  IonToolbar,
  IonInfiniteScroll,
  IonInfiniteScrollContent, IonSelect, IonSearchbar, useIonViewWillEnter, IonActionSheet
} from '@ionic/react';
import {add, closeOutline, close,logOut, trash} from 'ionicons/icons';
import Item from './Item';
import { getLogger } from '../core';
import { ItemContext } from './ItemProvider';
import {AuthContext} from "../auth";
import {ItemProps} from "./ItemProps";
const log = getLogger('ItemList');

const ItemList: React.FC<RouteComponentProps> = ({ history }) => {
  const [filter, setFilter] = useState<string | undefined>(undefined);
  const { items, fetching, fetchingError } = useContext(ItemContext);
  const [filteredItems, setFilteredItems] = useState<ItemProps[]| undefined>(items);
  const [searchValue, setSearchValue] = useState<string>('');
  const { storage } = useContext(AuthContext);
  let storageItems: any[] = [];


  useEffect(() => {
    if(items){
      console.log(items);
      setFilteredItems(items);}
    else
      storage.get({ key: 'items' }).then(res =>{
        console.log(res?.value)
        storageItems = JSON.parse(res?.value);
        setFilteredItems(storageItems);
      })
  }, [items]);


  log('render');
  const { logout } = useContext(AuthContext);


  const handleLogout = () => {
    log('handleLogout...');
    logout?.();
  };


  const disableFilter = () => {
    setFilteredItems([]);
  };

  useEffect(() => {
    const data1: ItemProps[] = []
    items?.map(({ ...item})=> {if(item.breed === filter) data1.push(item) });
    setFilteredItems(data1);
  }, [filter]);


  return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Item List</IonTitle>
            <IonFabButton onClick={handleLogout}>
              <IonIcon icon={logOut}/>
            </IonFabButton>
          </IonToolbar>
        </IonHeader>
        <IonContent>

          <IonLoading isOpen={fetching} message="Fetching items"/>
          <IonSelect value={filter} placeholder="Select smthg" onIonChange={e => setFilter(e.detail.value)}>
            {items && items?.map(({ _id, breed }) => <IonSelectOption key={_id} value={breed}>{breed}</IonSelectOption>)}
          </IonSelect>
          <IonFabButton onClick={disableFilter}>
            <IonIcon icon={closeOutline}/>
          </IonFabButton>

          <IonSearchbar
              value={searchValue}
              debounce={1000}
              onIonChange={e => setSearchValue(e.detail.value!)}>
          </IonSearchbar>

          {filteredItems && filteredItems?.length>0 ?
              <IonList>
                {filteredItems && filteredItems
                    .filter(({ _id, text }) => text.indexOf(searchValue) >= 0)
                    .map(({ _id, text,breed }) => <Item key={_id} _id={_id} text={text}  onEdit={id => history.push(`/item/${id}`)} breed={breed}  />)}
              </IonList>
              :
              <IonList>
                {items && items
                    .filter(({ _id, text }) => text.indexOf(searchValue) >= 0)
                    .map(({ _id, text,breed  }) => <Item key={_id} _id={_id} text={text}  onEdit={id => history.push(`/item/${id}`)} breed={breed} />)}
              </IonList>
          }

          {fetchingError && (
              <div>{fetchingError.message || 'Failed to fetch items'}</div>
          )}

        {items && <IonFab vertical="bottom" horizontal="end" slot="fixed">
            <IonFabButton onClick={() => history.push('/item')}>
            <IonIcon icon={add}/>
          </IonFabButton>
        </IonFab>}
      </IonContent>
    </IonPage>
  );
};

export default ItemList;
