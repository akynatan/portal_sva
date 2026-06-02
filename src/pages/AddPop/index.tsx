import React from 'react';

import FormPop from '../../components/FormPop';
import GoBack from '../../components/GoBack';
import MenuHeader from '../../components/MenuHeader';
import { Container, Content, ContentPage } from './styles';

const AddPop: React.FC = () => {
  return (
    <Container>
      <MenuHeader />

      <ContentPage>
        <Content>
          <GoBack />

          <h1>Novo POP</h1>

          <FormPop url="/pops" method="add" />
        </Content>
      </ContentPage>
    </Container>
  );
};

export default AddPop;
