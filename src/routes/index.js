import React from 'react';
import ProLayout from '@ant-design/pro-layout';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';

export default function AuthRoutes(){
  <Router>
    <ProLayout
      title="Mental Health Dashboard"
      menuDataRender={() => menuData}
      menuItemRender={(item, dom) => <Link to={item.path}>{dom}</Link>}
    >
      <Switch>
        {/* Define your routes here */}
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/companies/manage" component={ManageCompanies} />
        <Route path="/companies/roi-metrics" component={ROIMetrics} />
        <Route path="/employees/manage" component={ManageEmployees} />
        <Route path="/employees/assessments" component={Assessments} />
        <Route path="/therapists" component={Therapists} />
        <Route path="/workshops/folders" component={WorkshopFolders} />
        <Route path="/workshops/schedules" component={Schedules} />
        <Route path="/notifications" component={Notifications} />
        <Route path="/analytics" component={Analytics} />
      </Switch>
    </ProLayout>
  </Router>
};

