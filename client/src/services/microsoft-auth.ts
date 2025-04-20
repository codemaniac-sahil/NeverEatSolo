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

export function getMsalInstance(): PublicClientApplication {
  if (!msalInstance) {
    msalInstance = new PublicClientApplication(msalConfig);
  }
  return msalInstance;
}

/**
 * Handle the redirect response from Microsoft authentication
 */
export async function handleRedirectResponse(): Promise<AuthenticationResult | null> {
  const instance = getMsalInstance();
  
  try {
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
  const instance = getMsalInstance();
  
  try {
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
export function getActiveAccount(): AccountInfo | null {
  const instance = getMsalInstance();
  const accounts = instance.getAllAccounts();
  
  if (accounts.length === 0) {
    return null;
  }
  
  return accounts[0];
}

/**
 * Acquire token silently, or redirect if interaction is required
 */
export async function acquireTokenSilent(request: SilentRequest): Promise<AuthenticationResult | null> {
  const instance = getMsalInstance();
  
  try {
    // Try to acquire token silently
    return await instance.acquireTokenSilent(request);
  } catch (error) {
    // If interaction is required, redirect to login
    if (error instanceof InteractionRequiredAuthError) {
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
  const account = getActiveAccount();
  
  if (!account) {
    return null;
  }
  
  try {
    const silentRequest = {
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
  const instance = getMsalInstance();
  const account = getActiveAccount();
  
  if (account) {
    await instance.logoutRedirect({
      account
    });
  }
}