import React, { useState } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { Container, Header, Content } from "rsuite";
import 'rsuite/dist/styles/rsuite-default.css';
import "./index.css";

import NavHeader from "./components/Header";
import MainLayout from "./components/MainLayout";

function App() {

  const [country, setCountry] = useState(
    window.localStorage.getItem("country") || "BE"
  );

  const saveCountry = (c) => {
    setCountry(c);
    window.localStorage.setItem("country", c);
  };

  return (
    <Container>
      <Header>
        <NavHeader country={country} saveCountry={saveCountry} />
      </Header>
      <Content>
        <Router>
          <Switch>
            <Route path="/" component={MainLayout}></Route>
          </Switch>
        </Router>
      </Content>
    </Container>
  );
}

export default App;
