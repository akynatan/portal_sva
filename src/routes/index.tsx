import React from 'react';
import { Switch } from 'react-router-dom';

import Route from './Route';

import SignIn from '../pages/SignIn';
import AcceptInvite from '../pages/AcceptInvite';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';

import Profile from '../pages/Profile';
import Dashboard from '../pages/Dashboard';
import AddUser from '../pages/AddUser';
import Users from '../pages/Users';
import EditUser from '../pages/EditUser';
import { useAuth } from '../hooks/auth';
import Clients from '../pages/Clients';
import Pops from '../pages/Pops';
import AddPop from '../pages/AddPop';
import EditPop from '../pages/EditPop';

const Routes: React.FC = () => {
  const { user: userCurrent } = useAuth();

  return (
    <Switch>
      <Route path="/signin" component={SignIn} />
      {/* <Route path="/signup" component={SignUp} /> */}
      <Route path="/accept-invite" component={AcceptInvite} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />

      <Route path="/" exact component={Dashboard} isPrivate />
      <Route path="/profile" component={Profile} isPrivate />
      <Route path="/clients" component={Clients} isPrivate />
      {userCurrent?.role === 'admin' && (
        <>
          <Route path="/users" exact component={Users} isPrivate />
          <Route path="/users/add" component={AddUser} isPrivate />
          <Route path="/user/:id" component={EditUser} isPrivate />
          <Route path="/pops" exact component={Pops} isPrivate />
          <Route path="/pops/add" component={AddPop} isPrivate />
          <Route path="/pop/:id" component={EditPop} isPrivate />
        </>
      )}
    </Switch>
  );
};

export default Routes;
