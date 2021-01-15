import React, { useContext, useState,useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { RouteComponentProps } from 'react-router';
import {
    IonButton,
    IonAlert,
    IonContent,
    IonHeader,
    IonInput,
    IonLoading,
    IonPage,
    IonTitle,
    IonToolbar,
    IonModal,
    createAnimation, CreateAnimation
} from '@ionic/react';
import { AuthContext } from './AuthProvider';
import { getLogger } from '../core';
import { useAppState } from '../useAppState';
import { useNetwork } from '../useNetwork';
import { useBackgroundTask } from '../useBackgroundTask';
import AnimationDemo from "./AnimationDemo";

const log = getLogger('Login');

interface LoginState {
    username?: string;
    password?: string;
}

export const Login: React.FC<RouteComponentProps> = ({ history }) => {
    const { isAuthenticated, isAuthenticating, login, authenticationError } = useContext(AuthContext);
    const [state, setState] = useState<LoginState>({});
    const [showAlert1, setShowAlert1] = useState(false);
    const [showValidationError, setShowValidationError] = useState(false);
    const { username, password } = state;
    const { appState } = useAppState();
    const { networkStatus } = useNetwork();
    useBackgroundTask(() => new Promise(resolve => {
        console.log('My Background Task');
        resolve();
    }));

    const handleLogin = () => {
        log('handleLogin...');
        console.log({username,password});
        if(!username || !password) {setShowValidationError(true);}
        else{
            setShowValidationError(false);
            login?.(username, password);
        }
    };
    log('render');
    if (isAuthenticated) {
        console.log("IT IS AUTHEN")
        return <Redirect to={{ pathname: '/' }} />
    }

    const enterAnimation = (baseEl: any) => {
        const backdropAnimation = createAnimation()
            .addElement(baseEl.querySelector('ion-backdrop')!)
            .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

        const wrapperAnimation = createAnimation()
            .addElement(baseEl.querySelector('.modal-wrapper')!)
            .keyframes([
                { offset: 0, opacity: '0', transform: 'scale(0)' },
                { offset: 1, opacity: '0.99', transform: 'scale(1)' }
            ]);

        return createAnimation()
            .addElement(baseEl)
            .easing('ease-out')
            .duration(500)
            .addAnimation([backdropAnimation, wrapperAnimation]);
    }

    const leaveAnimation = (baseEl: any) => {
        return enterAnimation(baseEl).direction('reverse');
    }

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Login</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonButton onClick={() => setShowAlert1(true)} expand="block">Show Network status</IonButton>
                <IonModal isOpen={showAlert1} enterAnimation={enterAnimation} leaveAnimation={leaveAnimation}>
                    {appState.isActive?<p>App is active.</p>:<p>App is not active.</p>}
                    {networkStatus.connected?<p>Network status: Connected to {networkStatus.connectionType}</p>:<p>Not connected to a network.</p>}
                    <IonButton onClick={() => setShowAlert1(false)}>Close Modal</IonButton>
                </IonModal>
                <div>App state is {JSON.stringify(appState)}</div>
                <div>Network status is {JSON.stringify(networkStatus)}</div>

                {showValidationError && <AnimationDemo allMandatory="all fields are mandatory" usernameMandatory={username?"checked":"enter username"} passwordMandatory={password?"checked":"enter password"} />}
                <IonInput
                    placeholder="Username"
                    value={username}
                    onIonChange={(e: any) => setState({
                        ...state,
                        username: e.detail.value || ''
                    })}/>
                <IonInput
                    placeholder="Password"
                    value={password}
                    onIonChange={(e: any) => setState({
                        ...state,
                        password: e.detail.value || ''
                    })}/>
                <IonLoading isOpen={isAuthenticating}/>
                {authenticationError && (
                    <div>{authenticationError.message || 'Failed to authenticate'}</div>
                )}
                <IonButton onClick={handleLogin}>Login</IonButton>
            </IonContent>
        </IonPage>
    );
};

