import { RouterConfig, WithApollo } from './providers';

export const App = () => {
  return (
    <WithApollo>
      <RouterConfig />
    </WithApollo>
  );
}; 