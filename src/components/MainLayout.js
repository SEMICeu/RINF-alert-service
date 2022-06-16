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
            data: [],
            lastUpdateTime: new Date()
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
        try {
            const res = await fetch(`http://localhost:8080/rinf-ldes/${this.state.country}`);
            const data = await res.json();
            const lastUpdateTimes = [];
            console.log(this.state.lastUpdateTime.toISOString());
            const members = data.members.map(d => {
                d['dct:isVersionOf'] = BASE_URI + d['dct:isVersionOf'].split('era:')[1];
                if (d['era:gaugingProfile']) {
                    if (Array.isArray(d['era:gaugingProfile'])) {
                        d['era:gaugingProfile'] = BASE_URI + d['era:gaugingProfile'][0]['@id'].split('era:')[1];
                    } else {
                        d['era:gaugingProfile'] = BASE_URI + d['era:gaugingProfile']['@id'].split('era:')[1];
                    }
                };
                if(new Date(d['dct:modified']) >= this.state.lastUpdateTime) {
                    d.new = true;
                    lastUpdateTimes.push(new Date(d['dct:modified']));
                } else {
                    d.new = false;
                }

                return d;
            }).sort((a, b) => new Date(b['dct:modified']) - new Date(a['dct:modified']));

            if(lastUpdateTimes.length > 0) {
                const min = lastUpdateTimes.sort((a, b) => new Date(a['dct:modified']) - new Date(b['dct:modified']))[0];
                this.setState({ lastUpdateTime: min });
            }
            console.log(members)
            this.setState({ data: [...members] });
        } catch (err) {
            console.log(err);
            console.log(`Not data found for ${this.state.country}`);
            this.setState({ data: [] });
        }
    }

    render() {
        const { data } = this.state;
        return (
            <div className="show-fake-browser sidebar-page">
                <Container>
                    <Table height={800} data={data}>
                        <Table.Column width={700} align="center" fixed>
                            <Table.HeaderCell>URI</Table.HeaderCell>
                            <Table.Cell>
                                {rowData => {
                                    if(rowData.new) {
                                        return (
                                            <div style={{ backgroundColor: '#C9DFFE'}}>
                                                <a href={rowData['dct:isVersionOf']}>{rowData['dct:isVersionOf']}</a>
                                            </div>
                                        )
                                    } else {
                                        return <a href={rowData['dct:isVersionOf']}>{rowData['dct:isVersionOf']}</a>
                                    }
                                }}
                            </Table.Cell>
                        </Table.Column>
                        <Table.Column width={100} align="center" fixed>
                            <Table.HeaderCell><a href="http://data.europa.eu/949/trackId">Track ID</a></Table.HeaderCell>
                            <Table.Cell>
                                {rowData => {
                                    if(rowData.new) {
                                        return (<div style={{ backgroundColor: '#C9DFFE'}}>{rowData['era:trackId']}</div>)
                                    } else {
                                        return rowData['era:trackId']
                                    }
                                }}
                            </Table.Cell>
                        </Table.Column>
                        <Table.Column width={200} align="center" fixed>
                            <Table.HeaderCell><a href="http://data.europa.eu/949/maximumPermittedSpeed">Maximum permitted speed</a></Table.HeaderCell>
                            <Table.Cell>
                                {rowData => {
                                    if(rowData.new) {
                                        return (<div style={{ backgroundColor: '#C9DFFE'}}>{rowData['era:maximumPermittedSpeed']}</div>)
                                    } else {
                                        return rowData['era:maximumPermittedSpeed']
                                    }
                                }}
                            </Table.Cell>
                        </Table.Column>
                        <Table.Column width={400} align="center" fixed>
                            <Table.HeaderCell><a href="http://data.europa.eu/949/gaugingProfile">Gauging Profile</a></Table.HeaderCell>
                            <Table.Cell>
                                {rowData => {
                                    if(rowData.new) {
                                        return (
                                            <div style={{ backgroundColor: '#C9DFFE'}}>
                                                <a href={rowData['era:gaugingProfile']}>{rowData['era:gaugingProfile']}</a>
                                            </div>
                                        )
                                    } else {
                                        return <a href={rowData['era:gaugingProfile']}>{rowData['era:gaugingProfile']}</a>
                                    }
                                }}
                            </Table.Cell>
                        </Table.Column>
                        <Table.Column width={200} align="center" fixed>
                            <Table.HeaderCell><a href="http://data.europa.eu/949/cantDeficiency">Cant Deficiency</a></Table.HeaderCell>
                            <Table.Cell>
                                {rowData => {
                                    if(rowData.new) {
                                        return (<div style={{ backgroundColor: '#C9DFFE'}}>{rowData['era:cantDeficiency']}</div>)
                                    } else {
                                        return rowData['era:cantDeficiency']
                                    }
                                }}
                            </Table.Cell>
                        </Table.Column>
                        <Table.Column width={300} align="center" fixed>
                            <Table.HeaderCell>Last Modified</Table.HeaderCell>
                            <Table.Cell>
                                {rowData => {
                                    if(rowData.new) {
                                        return (<div style={{ backgroundColor: '#C9DFFE'}}>{rowData['dct:modified']}</div>)
                                    } else {
                                        return rowData['dct:modified']
                                    }
                                }}
                            </Table.Cell>
                        </Table.Column>
                    </Table>
                </Container>
            </div>
        );
    }
}

export default MainLayout;
