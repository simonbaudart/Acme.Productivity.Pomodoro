import { Action, Reducer } from 'redux';
import { AppThunkAction } from './index';
import { Security } from '../utils/Security';
import { history } from '../index';
import { AjaxService } from '../services/AjaxService';

// State linked to the store
export interface UserState
{
    username: string | null;
    isConnected: boolean;
}

// Interface for all actions
export interface UserAuthentication
{
    type: 'USER_AUTHENTICATION',
    username: string,
    password: string
}

export interface UserAuthenticated
{
    type: 'USER_AUTHENTICATED',
    username: string,
}

export interface UserAuthenticationFailed
{
    type: 'USER_AUTHENTICATION_FAILED'
}

export interface UserDisconnected
{
    type: 'USER_DISCONNECTED',
}

// Group all known actions
export type KnownAction = UserAuthentication | UserAuthenticated | UserAuthenticationFailed | UserDisconnected;

// Export the actions to be used in components.
export const actionCreators = {
    login: (username: string, password: string): AppThunkAction<KnownAction> => (dispatch) =>
    {
        AjaxService.post<{}, {}>("/api/authenticate", {
            username,
            password
        }).then(() => {
            dispatch({
                type: 'USER_AUTHENTICATED',
                username: username
            });
            history.push('/');
        }).catch(() => {
            dispatch({
                type: 'USER_AUTHENTICATION_FAILED'
            });
        });
    },
    logout: (): AppThunkAction<KnownAction> => (dispatch) =>
    {
        Security.logout();
        history.push('/login');
        dispatch({type: 'USER_DISCONNECTED'});
    },
    recoverSession: (): AppThunkAction<KnownAction> => (dispatch) =>
    {
        if (Security.isLogged())
        {
            dispatch({
                type: 'USER_AUTHENTICATED',
                username: 'TODO',
            });
        }
        else
        {
            Security.logout();
            history.push('/login');
            dispatch({type: 'USER_DISCONNECTED'});
        }
    },
};

// Default state and reducer to change the state when action is done
const unloadedState: UserState = {username: null, isConnected: false};

export const reducer: Reducer<UserState> = (state: UserState | undefined, incomingAction: Action): UserState =>
{
    if (state === undefined)
    {
        return unloadedState;
    }

    const action = incomingAction as KnownAction;

    switch (action.type)
    {
        case 'USER_AUTHENTICATED':
            return {
                username: action.username,
                isConnected: true,
            };
        case 'USER_DISCONNECTED':
            return unloadedState;
    }

    return state;
};