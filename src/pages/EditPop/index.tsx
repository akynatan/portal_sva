import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import api from '../../services/api';
import FormPop from '../../components/FormPop';
import GoBack from '../../components/GoBack';
import MenuHeader from '../../components/MenuHeader';
import { Pop } from '../../types';
import { Container, ContentPage, Content } from './styles';

const EditPop: React.FC = () => {
  const [pop, setPop] = useState<Pop | null>(null);
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    api.get(`/pops/${id}`).then(response => {
      setPop(response.data);
    });
  }, [id]);

  return (
    <Container>
      <MenuHeader />

      <ContentPage>
        <Content>
          <GoBack />

          <h1>Editar POP</h1>

          {pop && (
            <FormPop
              initialData={{
                host: pop.host,
                idPop: pop.idPop.toString(),
              }}
              url={`/pops/${id}`}
              method="edit"
            />
          )}
        </Content>
      </ContentPage>
    </Container>
  );
};

export default EditPop;
