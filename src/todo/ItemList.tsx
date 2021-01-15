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
import {useBackgroundTask} from "../useBackgroundTask";
import {createItem, updateItem} from "./itemApi";
import {useNetwork} from "../useNetwork";
import {Photo, usePhotoGallery} from "./usePhotoGallery";

const log = getLogger('ItemList');

const ItemList: React.FC<RouteComponentProps> = ({ history }) => {
  const [filter, setFilter] = useState<string | undefined>(undefined);
  const { items, fetching, fetchingError, unsavedData, clearUnsavedData, saveItem,photos, deletePhoto,fetchItems } = useContext(ItemContext);
  const [filteredItems, setFilteredItems] = useState<ItemProps[]| undefined>([]);
  const [searchValue, setSearchValue] = useState<string>('');
  const { storage } = useContext(AuthContext);
  let storageItems: any[] = [];
  const [photoToDelete, setPhotoToDelete] = useState<Photo>();
  const { networkStatus } = useNetwork();
  const [disableInfiniteScroll, setDisableInfiniteScroll] = useState<boolean>(false);

  useBackgroundTask(() => new Promise(async resolve => {
    console.log(networkStatus.connected)
    if(networkStatus.connected){
      console.log({unsavedData});

      unsavedData?.map(async (item) => {
        if (saveItem) {
          await saveItem(item)
        }
      });
      clearUnsavedData();
      console.log({unsavedData});
      console.log('My Background Task');
      resolve();
    }
  }));


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

  function getPhotos(itemPhotos: Photo[]) {
    return itemPhotos? itemPhotos : [];
  }

  async function searchNext($event: CustomEvent<void>) {
    console.log("hei from scroll");
    fetchItems(false);
    ($event.target as HTMLIonInfiniteScrollElement).complete();
  }


  console.log(filteredItems);

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
                  .map(({ _id, text,breed, photos, lat, lng }) => <Item key={_id} _id={_id} text={text}  onEdit={id => history.push(`/item/${id}`)} breed={breed} photos={getPhotos(photos)} lat={lat||'lat not set'} lng={lng||'lng not set'}/>)}
            </IonList>
            :
            <IonList>
              {items && items
                  .filter(({ _id, text }) => text.indexOf(searchValue) >= 0)
                  .map(({ _id, text,breed, photos, lat, lng }) => <Item key={_id} _id={_id} text={text}  onEdit={id => history.push(`/item/${id}`)} breed={breed} photos={getPhotos(photos)} lat={lat||'lat not set'} lng={lng||'lng not set'}/>)}
            </IonList>
        }

        {fetchingError && (
          <div>{fetchingError.message || 'Failed to fetch items'}</div>
        )}

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
            <IonFabButton onClick={() => history.push('/item')}>
            <IonIcon icon={add}/>
          </IonFabButton>
        </IonFab>
        <IonActionSheet
            isOpen={!!photoToDelete}
            buttons={[{
              text: 'Delete',
              role: 'destructive',
              icon: trash,
              handler: () => {
                if (photoToDelete) {
                  deletePhoto(photoToDelete);
                  setPhotoToDelete(undefined);
                }
              }
            }, {
              text: 'Cancel',
              icon: close,
              role: 'cancel'
            }]}
            onDidDismiss={() => setPhotoToDelete(undefined)}
        />
        <IonInfiniteScroll threshold="100px" disabled={disableInfiniteScroll}
                           onIonInfinite={(e: CustomEvent<void>) => searchNext(e)}>
          <IonInfiniteScrollContent
              loadingText="Loading more good doggos...">
          </IonInfiniteScrollContent>
        </IonInfiniteScroll>
      </IonContent>
    </IonPage>
  );
};

export default ItemList;
