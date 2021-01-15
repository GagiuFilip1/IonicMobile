import React from 'react';
import {IonCol, IonGrid, IonImg, IonItem, IonLabel, IonRow} from '@ionic/react';
import { ItemProps } from './ItemProps';
import {base64FromPath} from "@ionic/react-hooks/filesystem";

interface ItemPropsExt extends ItemProps {
  onEdit: (_id?: string) => void;
}

const Item: React.FC<ItemPropsExt> = ({ _id, text,breed, photos,lat,lng, onEdit }) => {
  return (
    <IonItem onClick={() => onEdit(_id)}>
        <IonLabel>{text}</IonLabel>
        <IonLabel>{breed}</IonLabel>
        <IonGrid>
            <IonRow>
                {photos.map((photo, index) => (
                    <IonCol size="6" key={index}>
                        <IonImg src={photo.webviewPath}/>
                    </IonCol>
                ))}
            </IonRow>
        </IonGrid>
        <IonLabel>{lat}</IonLabel>
        <IonLabel>{lng}</IonLabel>
    </IonItem>
  );
};

export default Item;
