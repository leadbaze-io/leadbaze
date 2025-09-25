import React from 'react';

import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface ConnectionStatusProps {

  isConnected: boolean;

  isUpdating: boolean;

  lastUpdate: Date | null;

}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({

  isConnected,

  isUpdating,

  lastUpdate

}) => {

  return (

    <div className="fixed bottom-4 right-4 z-50">

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3">

        <div className="flex items-center gap-2 text-xs">

          {isUpdating ? (

            <>

              <RefreshCw className="w-3 h-3 text-blue-500 animate-spin" />

              <span className="text-blue-600 dark:text-blue-400">Atualizando...</span>

            </>

          ) : isConnected ? (

            <>

              <Wifi className="w-3 h-3 text-green-500" />

              <span className="text-green-600 dark:text-green-400">Tempo Real</span>

            </>

          ) : (

            <>

              <WifiOff className="w-3 h-3 text-yellow-500" />

              <span className="text-yellow-600 dark:text-yellow-400">Polling</span>

            </>

          )}

          {lastUpdate && (

            <span className="text-gray-500 dark:text-gray-400 ml-2">

              {lastUpdate.toLocaleTimeString()}

            </span>

          )}

        </div>

      </div>

    </div>

  );

};
