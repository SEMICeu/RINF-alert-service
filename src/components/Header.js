import React from "react";
import { Nav, Navbar, Dropdown, Icon } from "rsuite";
import eraLogoPath from "../img/era-logo-new.png";
import semicLogoPath from "../img/SEMIC_Community_Logo.png";
import { ERALogo } from "../styles/Styles";

const { Header, Body } = Navbar;

const countries = [
  "AT", "BE", "BG", "CH", "CZ",
  "DE", "DK", "EE", "EL", "ES",
  "FI", "FR", "HR", "HU", "IT",
  "LT", "LU", "LV", "NL", "NO",
  "PL", "PT", "RO", "SE", "SK",
  "UK"
];

export default function NavHeader({ country, saveCountry }) {
  return (
    <Navbar>
      <Header>
        <ERALogo src={eraLogoPath} className="logo" />
        <ERALogo src={semicLogoPath} className="logo" />
      </Header>
      <Body>
        <Nav pullRight>
          <Dropdown title={country} icon={<Icon icon="globe" />}>
            {countries.map((l) => (
              <Dropdown.Item key={l} onSelect={() => saveCountry(l)}>
                {l}
              </Dropdown.Item>
            ))}
          </Dropdown>
        </Nav>
      </Body>
    </Navbar>
  );
}
