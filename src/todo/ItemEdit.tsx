import React, { useContext, useEffect, useState } from 'react';
import {
  IonButton,
  IonButtons,
  IonContent, IonFab,
  IonHeader,
  IonInput, IonLabel,
  IonLoading,
  IonPage,
  IonTitle,
  IonToolbar,
  IonFabButton, IonIcon, IonGrid, IonRow, IonCol, IonImg
} from '@ionic/react';
import { getLogger } from '../core';
import { ItemContext } from './ItemProvider';
import { RouteComponentProps } from 'react-router';
import { ItemProps } from './ItemProps';
import {useNetwork} from "../useNetwork";
import {useBackgroundTask} from "../useBackgroundTask";
import {usePhotoGallery} from "./usePhotoGallery";
import {camera} from "ionicons/icons";
import {Photo} from "./usePhotoGallery";
import {MyMap} from "../MyMap";
import {useMyLocation} from "../useMyLocation";
const log = getLogger('ItemEdit');


interface ItemEditProps extends RouteComponentProps<{
  id?: string,
  photos?: any,
}> {}

const ItemEdit: React.FC<ItemEditProps> = ({ history, match }) => {
  const { items, saving, savingError, saveItem,tempPhotos,photos, saveTempPhotos, takePhoto, deletePhoto } = useContext(ItemContext);
  const [text, setText] = useState('');
  const [breed, setBreed] = useState('');
  const [itemLat, setLat] = useState(0);
  const [itemLng, setLng] = useState(0);
  const [item, setItem] = useState<ItemProps>();
  const myLocation = useMyLocation();
  const { latitude: lat, longitude: lng } = myLocation.state.position?.coords || {};
  console.log(item?.lat,item?.lng)

  useBackgroundTask(() => new Promise(resolve => {
    console.log('My Background Task');
    resolve();
  }));

  useEffect(() => {

      if(item?.lat) setLat(item.lat);
      else{
        // @ts-ignore
        setLat(lat)}
      if(item?.lng) setLng(item.lng);
      else{
        // @ts-ignore
        setLng(lng)}

  }, [lat,lng]);

  useEffect(() => {
    log('useEffect');
    const routeId = match.params.id || '';
    const item = items?.find(it => it._id === routeId);
    setItem(item);
    if (item) {
      setText(item.text);
      setBreed(item.breed);
      if(item?.lat) setLat(item.lat);
      else{
        // @ts-ignore
        setLat(lat)}
      if(item?.lng) setLng(item.lng);
      else{
        // @ts-ignore
        setLng(lng)}
    }
  }, [match.params.id, items]);
  const handleSave = () => {
    if(item){
      console.log({item, tempPhotos});
      const copyItem = {...item};
      if(item.photos){
        copyItem.photos = [...item.photos,...tempPhotos];
        console.log('yes copyItem.photos');
        console.log(copyItem.photos);
      }
      else{
        console.log('copyItem.photos');
        console.log(copyItem.photos);
        copyItem.photos =tempPhotos;
      }
      copyItem.text=text;
      copyItem.breed = breed;
      copyItem.lat = itemLat;
      copyItem.lng = itemLng;
      console.log({copyItem});
      saveItem && saveItem(copyItem).then(() => {saveTempPhotos(); history.push('/items')});
    }
    else{
      const copyItem = {text, breed, photos:tempPhotos, lat:itemLat, lng:itemLng};
      saveItem && saveItem(copyItem).then(() => {saveTempPhotos(); history.push('/items')});
    }
  };
  log('render');

  function logLocation(source: string) {
    return (e: any) =>{
      console.log(source, e, e.latLng.lat(), e.latLng.lng());
      setLat(e.latLng.lat());
      setLng(e.latLng.lng());
    }
  }

  function logPropsLocation(source: string) {
    return (e: any) =>{
      console.log(source, e, e.latLng.lat(), e.latLng.lng());
      myLocation.updateLocation('current',{timestamp:Number(e.domEvent.timeStamp),coords: {
          latitude: e.latLng.lat(),
          longitude: e.latLng.lng(),accuracy:1}})
    }
  }

  function handleMapClick(source: string) {
    return (e: any) =>{
      console.log(source, e, e.latLng.lat(), e.latLng.lng());
    }
  }

    return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Edit</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleSave}>
              Save
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonLabel>description</IonLabel>
        <IonInput value={text} onIonChange={e => setText(e.detail.value || '')} />
        <IonLabel>breed</IonLabel>
        <IonInput value={breed} onIonChange={e => setBreed(e.detail.value || '')} />
        <IonGrid>
          <IonRow>
            {item?.photos&&item?.photos.map((photo: any, index: any) => (
                <IonCol size="6" key={index}>
                  <IonImg src={photo.webviewPath}/>
                </IonCol>
            ))}
            {tempPhotos.map((photo: any, index: any) => (
                <IonCol size="6" key={index}>
                  <IonImg src={photo.webviewPath}/>
                </IonCol>
            ))}
          </IonRow>
        </IonGrid>
        <div>My Location is</div>
        <div>latitude: {itemLat}</div>
        <div>longitude: {itemLng}</div>
        {itemLat && itemLng && <MyMap
            lat={itemLat}
            lng={itemLng}
            onMapClick={logLocation('onMap')}
            onMarkerClick={logLocation('click')}
        />
        }
        <IonFab vertical="bottom" horizontal="center" slot="fixed">
          <IonFabButton onClick={() => takePhoto()}>
            <IonIcon icon={camera}/>
          </IonFabButton>
        </IonFab>
        <IonLoading isOpen={saving} />
        {savingError && (
          <div>{savingError.message || 'Failed to save item'}</div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ItemEdit;
