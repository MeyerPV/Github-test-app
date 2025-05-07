import { useUnit } from 'effector-react';
import { useEffect } from 'react';
import {
  $tokenInput,
  $currentToken,
  $tokenStatusMessage,
  $isTokenManagerExpanded,
  tokenInputChanged,
  saveTokenClicked,
  useExistingTokenClicked,
  clearSavedTokenClicked,
  appMounted,
  toggleTokenManagerExpansion
} from '../model/token.store';
import { Input } from '../../../shared/ui/Input';
import { Button } from '../../../shared/ui/Button';

export const TokenManager = () => {
  const [
    tokenInput,
    currentToken,
    tokenStatusMessage,
    isExpanded,
    handleInputChange,
    handleSaveToken,
    handleUseExisting,
    handleClearToken,
    mount,
    toggleExpansion
  ] = useUnit([
    $tokenInput,
    $currentToken,
    $tokenStatusMessage,
    $isTokenManagerExpanded,
    tokenInputChanged,
    saveTokenClicked,
    useExistingTokenClicked,
    clearSavedTokenClicked,
    appMounted,
    toggleTokenManagerExpansion
  ]);

  useEffect(() => {
    mount(); // Call on component mount to check initial token status
  }, [mount]);

  return (
    <div className="p-4 border border-slate-200 rounded-lg shadow-sm bg-white my-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-slate-700">GitHub Token Management</h3>
        <Button onClick={() => toggleExpansion()} variant="ghost" size="sm">
          {isExpanded ? 'Hide Settings' : (currentToken ? 'Change Token' : 'Setup Token')}
        </Button>
      </div>
      
      <div className="mb-2">
        <p className="text-sm text-slate-600 mb-1">Status: <span className="font-medium">{tokenStatusMessage}</span></p>
        {currentToken && !isExpanded && (
          <p className="text-xs text-slate-500 break-all">Active token (partial): {currentToken.substring(0, 7)}...{currentToken.substring(currentToken.length - 4)}</p>
        )}
      </div>

      {isExpanded && (
        <>
          {currentToken && (
             <p className="text-xs text-slate-500 break-all mb-3">Currently active token (partial): {currentToken.substring(0, 7)}...{currentToken.substring(currentToken.length - 4)}</p>
          )}
          <div className="mb-3">
            <label htmlFor="githubTokenInput" className="block text-sm font-medium text-slate-700 mb-1">
              Enter New GitHub Token:
            </label>
            <Input 
              id="githubTokenInput"
              type="password" 
              placeholder="ghp_YourTokenHere"
              value={tokenInput}
              onChange={(e) => handleInputChange(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => handleSaveToken()} disabled={!tokenInput.trim()}>
              Save & Use New Token
            </Button>
            <Button onClick={() => handleUseExisting()} variant="secondary">
              Use Existing/Default Token
            </Button>
            {localStorage.getItem('github_token') && (
                <Button onClick={() => handleClearToken()} variant="outline" className="text-red-600 border-red-300 hover:bg-red-50 focus:ring-red-400">
                    Clear Saved Token & Use Default
                </Button>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-3">
            Note: After saving or clearing a token, a page reload might be required for all changes to fully take effect across the application.
          </p>
        </>
      )}
    </div>
  );
}; 