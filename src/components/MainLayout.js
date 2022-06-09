import React, { Component } from "react";
import GraphStore from '@graphy/memory.dataset.fast';
import RDFetch from '../workers/RDFetch.worker';
import Utils from '../utils/Utils';
import { Container, Table } from "rsuite";
import { BASE_URI } from "../utils/NameSpaces";

import {
    ERA_ONTOLOGY,
    ERA_TYPES,
} from '../config/config';

class MainLayout extends Component {
    constructor(props) {
        super(props);
        this.state = {
            country: "BE",
            data: []
        };
        this.graphStore = GraphStore();
    }

    async componentDidMount() {
        await this.fetchInitData();
        setInterval(() => this.readLDES(), 5000);
    }

    componentDidUpdate() {
        const { country } = this.state;
        const storedCountry = window.localStorage.getItem("country") || "BE";

        if (country !== storedCountry) {
            this.setState({ country: storedCountry }, () => {
                this.readLDES();
            });
        }
    }


    fetchInitData = async () => {
        await Promise.all([
            this.fetchVocabulary(),
            this.fetchTypes(),
            this.readLDES()
        ]);
    }

    fetchVocabulary = () => {
        return new Promise((resolve, reject) => {
            const rdfetcht = new RDFetch();
            rdfetcht.addEventListener("message", (e) => {
                if (e.data === "done") {
                    rdfetcht.terminate();
                    resolve();
                } else {
                    this.graphStore.add(Utils.rebuildQuad(e.data));
                }
            });
            rdfetcht.postMessage({ url: ERA_ONTOLOGY });
        });
    };

    fetchTypes = () => {
        return new Promise((resolve, reject) => {
            const rdfetcht = new RDFetch();
            rdfetcht.addEventListener("message", (e) => {
                if (e.data === "done") {
                    rdfetcht.terminate();
                    resolve();
                } else {
                    this.graphStore.add(Utils.rebuildQuad(e.data));
                }
            });
            rdfetcht.postMessage({ url: ERA_TYPES });
        });
    };

    readLDES = async () => {
        const res = await fetch(`http://localhost:8080/rinf-ldes/${this.state.country}`);
        const data = await res.json();
        const members = data.members.map(d => {
            d['dct:isVersionOf'] = BASE_URI + d['dct:isVersionOf'].split('era:')[1];
            if(d['era:gaugingProfile']) d['era:gaugingProfile'] = d['era:gaugingProfile']['@id'];
            return d;
        }).reverse();
        console.log(members)
        this.setState({ data: [...members] });
    }

    render() {
        const { data } = this.state;
        return (
            <div className="show-fake-browser sidebar-page">
                <Container>
                <Table height={800} data={data}>
                    <Table.Column width={700} align="center" fixed>
                        <Table.HeaderCell>URI</Table.HeaderCell>
                        <Table.Cell dataKey="dct:isVersionOf" />
                    </Table.Column>
                    <Table.Column width={100} align="center" fixed>
                        <Table.HeaderCell><a href="http://data.europa.eu/949/trackId">Track ID</a></Table.HeaderCell>
                        <Table.Cell dataKey="era:trackId" />
                    </Table.Column>
                    <Table.Column width={200} align="center" fixed>
                        <Table.HeaderCell><a href="http://data.europa.eu/949/maximumPermittedSpeed">Maximum permitted speed</a></Table.HeaderCell>
                        <Table.Cell dataKey="era:maximumPermittedSpeed" />
                    </Table.Column>
                    <Table.Column width={300} align="center" fixed>
                        <Table.HeaderCell><a href="http://data.europa.eu/949/gaugingProfile">Gauging Profile</a></Table.HeaderCell>
                        <Table.Cell dataKey="era:gaugingProfile" />
                    </Table.Column>
                    <Table.Column width={300} align="center" fixed>
                        <Table.HeaderCell><a href="http://data.europa.eu/949/cantDeficiency">Cant Deficiency</a></Table.HeaderCell>
                        <Table.Cell dataKey="era:cantDeficiency" />
                    </Table.Column>
                    <Table.Column width={300} align="center" fixed>
                        <Table.HeaderCell>Last Modified</Table.HeaderCell>
                        <Table.Cell dataKey="dct:modified" />
                    </Table.Column>
                </Table>
            </Container>
            </div>
        );
    }
}

export default MainLayout;
