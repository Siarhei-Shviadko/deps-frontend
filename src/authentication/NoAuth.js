
import { ENV } from '@/utils/env'
import { navigationMap } from '@/utils/navigationMap'
import { sessionStorageWrapper } from '@/utils/sessionStorageWrapper'

const DefaultUserData = {
  access_token: 'access_token',
  expires_at: Number.MAX_SAFE_INTEGER,
  profile: {
    email: 'system_user@system.com',
    preferred_username: 'systemUser',
    given_name: 'System',
    family_name: 'User',
    groups: ['System'],
  },
}

const USER_STORE_KEY = `${ENV.AUTH_TYPE}.user`

class NoAuth {
  get #user () {
    const userData = JSON.parse(sessionStorageWrapper.getItem(USER_STORE_KEY))
    return userData?.expires_at > Math.round(Date.now() / 1000) ? userData : null
  }

  isAuthenticated = () => !!this.#user

  getAccessToken = () => this.#user?.access_token

  signIn = () => {
    window.location.replace(`${window.location.origin}${navigationMap.auth.signInCallback()}`)
  }

  signOut = async () => {
    sessionStorageWrapper.removeItem(USER_STORE_KEY)
    window.location.replace(window.location.origin)
  }

  signInSilentCallback = () => {}

  signInRedirectCallback = () => {
    sessionStorageWrapper.setItem(USER_STORE_KEY, JSON.stringify(DefaultUserData))
    return DefaultUserData
  }
}

export {
  NoAuth,
}
