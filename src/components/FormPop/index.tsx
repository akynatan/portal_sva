import React, { useCallback, useRef } from 'react';
import { FiServer, FiHash } from 'react-icons/fi';
import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';
import * as Yup from 'yup';
import { useHistory } from 'react-router-dom';

import api from '../../services/api';
import { useToast } from '../../hooks/toast';
import getValidationErrors from '../../utils/getValidationErrors';
import Input from '../Input';
import Button from '../Button';

import { FormGroup, FormGroupBlock } from './styles';

interface PopFormData {
  host: string;
  idPop: string;
}

interface FormPopProps {
  initialData?: PopFormData;
  method: 'edit' | 'add';
  url: string;
}

const FormPop: React.FC<FormPopProps> = ({ initialData, method, url }) => {
  const { addToast } = useToast();
  const history = useHistory();
  const formRef = useRef<FormHandles>(null);

  const handleSubmit = useCallback(
    async (data: PopFormData) => {
      formRef.current?.setErrors({});

      try {
        const schema = Yup.object().shape({
          host: Yup.string().required('Host obrigatório'),
          idPop: Yup.number()
            .typeError('ID Pop deve ser um número')
            .required('ID Pop obrigatório')
            .integer('ID Pop deve ser um número inteiro')
            .positive('ID Pop deve ser maior que zero'),
        });

        await schema.validate(data, { abortEarly: false });

        const formData = {
          host: data.host,
          idPop: Number(data.idPop),
        };

        const methods = {
          edit: async () => api.put(url, formData),
          add: async () => api.post(url, formData),
        };

        const response = await methods[method]();

        if (response.data) {
          addToast({
            type: 'success',
            title: 'POP cadastrado/alterado!',
            description: 'POP cadastrado/alterado com sucesso!',
          });
        }

        history.push('/pops');
      } catch (err: any) {
        if (err instanceof Yup.ValidationError) {
          formRef.current?.setErrors(getValidationErrors(err));
          return;
        }

        addToast({
          type: 'error',
          title: 'Erro no cadastro/atualização!',
          description: err.response?.data?.message,
        });
      }
    },
    [addToast, url, method, history],
  );

  return (
    <Form initialData={initialData} ref={formRef} onSubmit={handleSubmit}>
      <FormGroup>
        <FormGroupBlock>
          <h2>Dados do POP:</h2>
          <Input name="host" icon={FiServer} placeholder="Host" />
          <Input
            name="idPop"
            icon={FiHash}
            type="number"
            placeholder="ID Pop (Hubsoft)"
          />
        </FormGroupBlock>
      </FormGroup>

      <div>
        <Button type="submit">
          {method === 'add' ? 'Cadastrar POP' : 'Atualizar POP'}
        </Button>
      </div>
    </Form>
  );
};

export default FormPop;
