import React, { useContext, useState } from 'react';
import { Redirect } from 'react-router-dom';
import { RouteComponentProps } from 'react-router';
import { IonButton,IonAlert, IonContent, IonHeader, IonInput, IonLoading, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { AuthContext } from './AuthProvider';
import { getLogger } from '../core';
import { useAppState } from '../useAppState';
import { useNetwork } from '../useNetwork';
import { useBackgroundTask } from '../useBackgroundTask';

const log = getLogger('Login');

interface LoginState {
    username?: string;
    password?: string;
}

export const Login: React.FC<RouteComponentProps> = ({ history }) => {
    const { isAuthenticated, isAuthenticating, login, authenticationError } = useContext(AuthContext);
    const [state, setState] = useState<LoginState>({});
    const [showAlert1, setShowAlert1] = useState(false);
    const { username, password } = state;
    const { appState } = useAppState();
    const { networkStatus } = useNetwork();
    useBackgroundTask(() => new Promise(resolve => {
        console.log('My Background Task');
        resolve();
    }));
    const handleLogin = () => {
        log('handleLogin...');
        login?.(username, password);
    };
    log('render');
    if (isAuthenticated) {
        console.log("IT IS AUTHEN")
        return <Redirect to={{ pathname: '/' }} />
    }
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Login</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
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

                <IonInput
                    placeholder="Username"
                    value={username}
                    onIonChange={e => setState({
                        ...state,
                        username: e.detail.value || ''
                    })}/>
                <IonInput
                    placeholder="Password"
                    value={password}
                    onIonChange={e => setState({
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

