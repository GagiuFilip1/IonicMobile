// @ts-ignore
import React, { useState } from 'react';
// @ts-ignore
import { IonButton,IonAlert, } from '@ionic/react';
// @ts-ignore
import { useAppState } from './useAppState';
// @ts-ignore
import { useNetwork } from './useNetwork';
// @ts-ignore
import { useBackgroundTask } from './useBackgroundTask';

export const AppState = () => {
    const { appState } = useAppState();
    const { networkStatus } = useNetwork();
    const [showAlert1, setShowAlert1] = useState(false);
    useBackgroundTask(() => new Promise(resolve => {
        console.log('My Background Task');
        resolve();
    }));
    return (
        <>
        <IonButton onClick={() => setShowAlert1(true)} expand="block">Show Alert 1</IonButton>
                <IonAlert
                    isOpen={showAlert1}
                    onDidDismiss={() => setShowAlert1(false)}
                    header={'App state & Network status'}
                    message={ `App state is  ${JSON.stringify(appState)}.Network status is ${JSON.stringify(networkStatus)} `}
                    buttons={['OK']}
                />
                <div>App state is {JSON.stringify(appState)}</div>
                <div>Network status is {JSON.stringify(networkStatus)}</div>

               </>
    );
};
