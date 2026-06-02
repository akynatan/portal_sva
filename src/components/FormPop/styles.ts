import styled from 'styled-components';

export const FormGroup = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 40px;
  flex-wrap: wrap;

  @media screen and (max-width: 992px) {
    justify-content: center;
  }
`;

export const FormGroupBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;
