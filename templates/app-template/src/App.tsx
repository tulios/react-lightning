import { FocusGroup } from '@plexinc/react-lightning';
import { Outlet } from 'react-router-dom';
import { Nav } from './components/Nav';

export const App = () => {
  return (
    <FocusGroup>
      <Nav />
      <Outlet />
    </FocusGroup>
  );
};
