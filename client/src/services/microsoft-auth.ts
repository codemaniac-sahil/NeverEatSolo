import { PublicClientApplication, AuthenticationResult, AccountInfo, InteractionRequiredAuthError, SilentRequest } from '@azure/msal-browser';

// MSAL configuration
const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID || '',
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: window.location.origin + '/auth',
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  }
};

// Request scopes
const loginRequest = {
  scopes: ['openid', 'profile', 'email', 'User.Read', 'Calendars.ReadWrite']
};

// Calendar-specific scopes for when we need them
const calendarRequest = {
  scopes: ['Calendars.ReadWrite']
};

// Initialize MSAL client
let msalInstance: PublicClientApplication | null = null;
let msalInitialized = false;

export async function getMsalInstance(): Promise<PublicClientApplication> {
  if (!msalInstance) {
    msalInstance = new PublicClientApplication(msalConfig);
  }
  
  if (!msalInitialized) {
    await msalInstance.initialize();
    msalInitialized = true;
  }
  
  return msalInstance;
}

/**
 * Handle the redirect response from Microsoft authentication
 */
export async function handleRedirectResponse(): Promise<AuthenticationResult | null> {
  try {
    const instance = await getMsalInstance();
    
    // Handle redirect response if any
    const response = await instance.handleRedirectPromise();
    return response;
  } catch (error) {
    console.error('Error handling redirect:', error);
    return null;
  }
}

/**
 * Initiate login with Microsoft
 */
export async function loginWithMicrosoft(): Promise<void> {
  try {
    const instance = await getMsalInstance();
    
    // Log in with redirect
    await instance.loginRedirect(loginRequest);
  } catch (error) {
    console.error('Error logging in with Microsoft:', error);
    throw error;
  }
}

/**
 * Get active account
 */
export async function getActiveAccount(): Promise<AccountInfo | null> {
  try {
    const instance = await getMsalInstance();
    const accounts = instance.getAllAccounts();
    
    if (accounts.length === 0) {
      return null;
    }
    
    return accounts[0];
  } catch (error) {
    console.error('Error getting active account:', error);
    return null;
  }
}

/**
 * Acquire token silently, or redirect if interaction is required
 */
export async function acquireTokenSilent(request: SilentRequest): Promise<AuthenticationResult | null> {
  try {
    const instance = await getMsalInstance();
    
    // Try to acquire token silently
    return await instance.acquireTokenSilent(request);
  } catch (error) {
    // If interaction is required, redirect to login
    if (error instanceof InteractionRequiredAuthError) {
      const instance = await getMsalInstance();
      instance.acquireTokenRedirect(request);
      // This will never return as it redirects the page
      return null;
    }
    throw error;
  }
}

/**
 * Get access token for Microsoft Graph API
 */
export async function getAccessToken(): Promise<string | null> {
  try {
    const account = await getActiveAccount();
    
    if (!account) {
      return null;
    }
    
    // Ensure account is not a Promise
    if (account instanceof Promise) {
      return null;
    }
    
    const silentRequest: SilentRequest = {
      ...calendarRequest,
      account
    };
    
    const response = await acquireTokenSilent(silentRequest);
    return response?.accessToken || null;
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
}

/**
 * Get user information from Microsoft account
 */
export async function getUserInfo(): Promise<{
  id: string;
  displayName: string;
  email?: string;
} | null> {
  const token = await getAccessToken();
  
  if (!token) {
    return null;
  }
  
  try {
    const response = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to get user info');
    }
    
    const data = await response.json();
    
    return {
      id: data.id,
      displayName: data.displayName,
      email: data.mail || data.userPrincipalName
    };
  } catch (error) {
    console.error('Error getting Microsoft user info:', error);
    return null;
  }
}

/**
 * Logout from Microsoft
 */
export async function logoutFromMicrosoft(): Promise<void> {
  try {
    const instance = await getMsalInstance();
    const account = await getActiveAccount();
    
    if (account && !(account instanceof Promise)) {
      await instance.logoutRedirect({
        account
      });
    }
  } catch (error) {
    console.error('Error logging out from Microsoft:', error);
  }
}