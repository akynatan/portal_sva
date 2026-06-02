/* eslint-disable no-alert */
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiPencil } from 'react-icons/hi';
import { FiPlusCircle, FiTrash } from 'react-icons/fi';

import MenuHeader from '../../components/MenuHeader';
import Button from '../../components/Button';
import api from '../../services/api';
import { useToast } from '../../hooks/toast';
import { Pop } from '../../types/Pop';
import { Container, Content, HeaderPage } from './styles';

const Pops: React.FC = () => {
  const [isFetching, setIsFetching] = useState(true);
  const [pops, setPops] = useState<Pop[]>([]);
  const { addToast } = useToast();

  const loadPops = useCallback(() => {
    setIsFetching(true);

    api
      .get('/pops')
      .then(res => {
        setPops(res.data);
      })
      .finally(() => {
        setIsFetching(false);
      });
  }, []);

  useEffect(() => {
    loadPops();
  }, [loadPops]);

  const handleDelete = useCallback(
    async (pop: Pop) => {
      const confirmed = window.confirm(`Deseja remover o POP "${pop.host}"?`);

      if (!confirmed) {
        return;
      }

      try {
        await api.delete(`/pops/${pop.id}`);
        addToast({
          type: 'success',
          title: 'POP removido!',
          description: 'POP removido com sucesso.',
        });
        loadPops();
      } catch (err: any) {
        addToast({
          type: 'error',
          title: 'Erro ao remover POP',
          description: err.response?.data?.message,
        });
      }
    },
    [addToast, loadPops],
  );

  return (
    <Container>
      <MenuHeader />

      <Content>
        <HeaderPage>
          <div>
            <h1>Lista de POPs</h1>
            <hr />
          </div>
          <Link to="pops/add">
            <Button type="button">Adicionar POP</Button>
            <FiPlusCircle />
          </Link>
        </HeaderPage>

        <table>
          <thead>
            <tr className="table100-head">
              <th>Host</th>
              <th>ID Pop</th>
              <th> </th>
            </tr>
          </thead>
          <tbody>
            {pops.map(pop => (
              <tr key={pop.id}>
                <td className="column2">{pop.host}</td>
                <td className="column1">{pop.idPop}</td>
                <td className="column1">
                  <Link
                    style={{
                      textDecoration: 'none',
                      fontWeight: 600,
                      color: '#ff9000',
                    }}
                    to={`pop/${pop.id}`}
                    title="Editar POP"
                  >
                    <HiPencil />
                  </Link>
                  <FiTrash
                    title="Remover POP"
                    onClick={() => handleDelete(pop)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {isFetching && <p className="fetching">Carregando...</p>}
      </Content>
    </Container>
  );
};

export default Pops;
