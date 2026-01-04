/* eslint-disable no-alert */
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { FiArrowRight, FiTrash, FiRotateCcw } from 'react-icons/fi';
import MenuHeader from '../../components/MenuHeader';
import {
  Container,
  Content,
  HeaderPage,
  ClientInfo,
  ContentPage,
  SubscriptionContainer,
  Subscription,
} from './styles';
import api from '../../services/api';
import { Client } from '../../types/Client';
import { Log } from '../../types/Log';
import InputSample from '../../components/InputSample';
import { useToast } from '../../hooks/toast';
import { productKeys } from '../../constants/productKeys';
import { useAuth } from '../../hooks/auth';
import { User } from '../../types';

type UserType = {
  [key: string]: User;
};

const Clients: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [isFetching, setIsFetching] = useState(false);
  const [documentFilter, setDocumentFilter] = useState('');
  const [client, setClient] = useState<Client | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [isFetchingLogs, setIsFetchingLogs] = useState(false);
  const [users, setUsers] = useState<UserType>({});

  useEffect(() => {
    api.get(`/users`).then(res => {
      const usersResponse: User[] = res.data || [];

      const allUsers: UserType = {};
      usersResponse.forEach(usr => {
        allUsers[usr.id] = usr;
      });
      setUsers(allUsers);
    });
  }, []);

  function loadLogs(clientId: string): void {
    setIsFetchingLogs(true);
    api
      .get(`/logs/${clientId}`)
      .then(res => {
        setLogs(res.data);
      })
      .finally(() => {
        setIsFetchingLogs(false);
      });
  }

  useEffect(() => {
    if (client) {
      setIsFetchingLogs(true);
      api
        .get(`/logs/${client.id}`)
        .then(res => {
          setLogs(res.data);
        })
        .finally(() => {
          setIsFetchingLogs(false);
        });
    } else {
      setIsFetchingLogs(false);
      setLogs([]);
    }
  }, [client]);

  const productsAvailables = useMemo(() => {
    if (client) {
      return Object.entries(productKeys)
        .filter(([productKey]) => {
          const hasSubscription = client.subscriptions?.find(
            subscription => productKey === subscription.productKey,
          );

          if (hasSubscription && hasSubscription.active) {
            return false;
          }

          return true;
        })
        .map(([productKey, product]) => ({
          productKey,
          productName: product?.name,
          productSva: product?.sva,
        }));
    }

    return Object.entries(productKeys).map(([productKey, product]) => ({
      productKey,
      productName: product?.name,
      productSva: product?.sva,
    }));
  }, [client]);

  const productsAssociates = useMemo(() => {
    if (client) {
      const clientSubscriptionsActive =
        client.subscriptions?.filter(subscription => subscription.active) || [];
      const clientSubscriptions = clientSubscriptionsActive?.map(
        subscription => {
          const productKey = productKeys[subscription.productKey];

          return {
            ...subscription,
            productName: productKey?.name,
            sva: productKey?.sva,
          };
        },
      );

      return clientSubscriptions;
    }

    return [];
  }, [client]);

  const reload = useCallback(() => {
    if (documentFilter === '') {
      return;
    }

    if (documentFilter.length === 11 || documentFilter.length === 14) {
      setClient(null);
      setIsFetching(true);
      api
        .get(`/clients/${documentFilter}`)
        .then(res => {
          setClient(res.data);
        })
        .finally(() => {
          setIsFetching(false);
        });
    } else {
      setClient(null);
    }
  }, [documentFilter]);

  const createSubscription = useCallback(
    async product => {
      try {
        setIsFetching(true);
        let verifyPermissionInHub = true;
        if (user.role === 'admin') {
          verifyPermissionInHub = window.confirm(
            'Você é um admin! Deseja que essa assinatura valide se esse cliente tem permissão ao SVA no hubsoft?',
          );
        }

        await api.post(`/${product?.productSva}/subscription`, {
          clientId: client?.id,
          productKey: product?.productKey,
          verifyPermissionInHub,
        });
        reload();
      } catch (err: any) {
        setIsFetching(false);
        client?.id && loadLogs(client.id);
        addToast({
          type: 'error',
          title: 'Erro na assinatura',
          description: err.response?.data?.message,
        });
      }
    },
    [addToast, client, reload, user.role],
  );

  const syncronizeClient = useCallback(async () => {
    try {
      setIsFetching(true);

      await api.post(`clients/${client?.id}/syncronize`, null, {
        headers: {
          'Content-Type': 'text/plain',
        },
      });
      reload();
    } catch (err: any) {
      setIsFetching(false);
      client?.id && loadLogs(client.id);
      addToast({
        type: 'error',
        title: 'Erro na assinatura',
        description: err.response?.data?.message,
      });
    }
  }, [addToast, client, reload]);

  useEffect(() => {
    reload();
  }, [reload]);

  function formatDateToBrazilian(dateString: Date): string {
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }

  const removeSubscription = useCallback(
    async subscription => {
      try {
        await api.delete(
          `/${subscription.sva}/subscription/${subscription.id}`,
        );
        reload();
      } catch (err: any) {
        setIsFetching(false);
        addToast({
          type: 'error',
          title: 'Erro ao remover assinatura',
          description: err.response?.data?.message,
        });
      }
    },
    [addToast, reload],
  );

  function renderLog(log: Log): any {
    const {
      action,
      success,
      productKey,
      verifyPermissionInHub,
      reason,
    } = log.detail;
    const product = productKeys[productKey];
    const date = formatDateToBrazilian(log.createdAt);
    const successText = success ? 'SUCESSO' : 'ERRO';
    let verifyPermissionInHubText = verifyPermissionInHub ? 'Sim' : 'Não';
    verifyPermissionInHubText = `Verificou Permissão no Hub:${verifyPermissionInHubText}`;
    const reasonText =
      typeof reason === 'string' ? reason : JSON.stringify(reason);
    const userName = users[log.userId]?.name;

    const typesLogs = {
      subscription: () => {
        return (
          <p key={log.id}>
            {date} - ASSINATURA - {userName} - {product?.name} - {successText} -{' '}
            {verifyPermissionInHubText}{' '}
            {reasonText ? ` - Motivo do erro:${reasonText}` : ''}
          </p>
        );
      },
      unsubscription: () => {
        return (
          <p key={log.id}>
            {date} - CANCELAMENTO - {userName} - {product?.name} - {successText}{' '}
            - {reasonText ? ` - Motivo do erro:${reasonText}` : ''}
          </p>
        );
      },
      create_client: () => {
        return (
          <p key={log.id}>
            {date} - CADASTRO CLIENTE - {userName}
          </p>
        );
      },
      syncronized_client: () => {
        return (
          <p key={log.id}>
            {date} - SINCRONIZADO - {userName}
          </p>
        );
      },
      inative_subscription: () => {
        return (
          <p key={log.id}>
            {date} - INATIVADO -{userName} - {product?.name}
          </p>
        );
      },
      reactive_subscription: () => {
        return (
          <p key={log.id}>
            {date} - REATIVADO - {userName} - {product?.name}
          </p>
        );
      },
    };

    return typesLogs[action] ? typesLogs[action]() : '';
  }

  return (
    <Container>
      <MenuHeader />

      <Content>
        <ContentPage>
          <div
            style={{
              display: 'flex',
              gap: 24,
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: 8,
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                }}
              >
                CPF/CNPJ:
              </span>
              <InputSample
                name="lead_name"
                containerStyle={{ width: 300, height: 20 }}
                onChange={e => setDocumentFilter(e.target.value)}
              />
            </div>
          </div>

          {client && (
            <>
              <ClientInfo>
                <h3
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignSelf: 'flex-start',
                    gap: 12,
                    cursor: 'pointer',
                  }}
                >
                  Nome: {client.name}
                  <FiRotateCcw
                    style={{ width: 24, height: 24, color: '#ff9000' }}
                    onClick={syncronizeClient}
                  />
                </h3>
                <h3>Documento: {client.document}</h3>
                <p>Email primario: {client.clientHubSoft?.email_principal}</p>
                <p>
                  Telefone primario: {client.clientHubSoft?.telefone_primario}
                </p>
                <p>
                  Telefone secundario:{' '}
                  {client.clientHubSoft?.telefone_secundario}
                </p>
                {client.clientHubSoft?.servicos.map(servico => (
                  <p>
                    {servico.nome} - {servico.status}
                  </p>
                ))}
              </ClientInfo>

              <HeaderPage>
                <div>
                  <h1>Assinaturas</h1>
                  <hr />
                </div>
              </HeaderPage>

              <SubscriptionContainer>
                <Subscription>
                  <table>
                    <thead>
                      <tr className="table100-head">
                        <th>Disponíveis</th>
                        <th> </th>
                      </tr>
                    </thead>
                    <tbody>
                      {productsAvailables?.map(productsAvailable => {
                        return (
                          <tr key={productsAvailable.productKey}>
                            <td className="column2">
                              {productsAvailable.productName}
                            </td>
                            <td className="column1">
                              <FiArrowRight
                                onClick={() => {
                                  createSubscription(productsAvailable);
                                }}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </Subscription>
                <Subscription>
                  <table>
                    <thead>
                      <tr className="table100-head">
                        <th>Associados</th>
                        <th>Data de ativacao</th>
                        <th> </th>
                      </tr>
                    </thead>
                    <tbody>
                      {productsAssociates?.map(subscription => {
                        return (
                          <tr key={subscription.id}>
                            <td className="column2">
                              {subscription.productName}
                            </td>
                            <td className="column2">
                              {formatDateToBrazilian(subscription.updatedAt)}
                            </td>
                            <td className="column1">
                              <FiTrash
                                onClick={() => {
                                  removeSubscription(subscription);
                                }}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </Subscription>
              </SubscriptionContainer>

              <div>
                <h1>Logs</h1>
                <hr />
                {logs.length > 0 && (
                  <>
                    {logs?.map(log => {
                      return renderLog(log);
                    })}
                  </>
                )}

                {isFetchingLogs && (
                  <p className="fetching">Carregando logs...</p>
                )}

                {!isFetchingLogs && logs.length === 0 && (
                  <p className="fetching">Nenhum log</p>
                )}
              </div>
            </>
          )}

          {isFetching && <p className="fetching">Carregando...</p>}
        </ContentPage>
      </Content>
    </Container>
  );
};

export default Clients;
