import React from 'react';
import { Link } from 'react-router-dom';

import MenuHeader from '../../components/MenuHeader';
import { useAuth } from '../../hooks/auth';
import { Container, Content, Menu, MenuItem } from './styles';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <Container>
      <MenuHeader />

      <Content>
        <Menu>
          <Link to="/clients">
            <MenuItem>Clientes</MenuItem>
          </Link>
          {user?.role === 'admin' && (
            <Link to="/pops">
              <MenuItem>POPs</MenuItem>
            </Link>
          )}
        </Menu>
      </Content>
    </Container>
  );
};

export default Dashboard;
