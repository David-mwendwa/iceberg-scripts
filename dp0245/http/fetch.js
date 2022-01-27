async function fetchPage({canonicalURL, requestURL, requestOptions, headers}) {
    if (!requestOptions) requestOptions = {method: "GET", headers};
    if (!canonicalURL) canonicalURL = requestURL;
    if (!requestURL) requestURL = canonicalURL;
    return await fetchWithCookies(requestURL, requestOptions)
        .then(response => {
            return {
                canonicalURL,
                request: Object.assign({URL: requestURL}, requestOptions),
                response
            };
        });
}

const home = async function ({argument, canonicalURL, headers}) {
        let customHeaders = {
		    "authority": "dre.pt",
		    "cache-control": "max-age=0",
		    "sec-ch-ua": "\" Not;A Brand\";v=\"99\", \"Google Chrome\";v=\"97\", \"Chromium\";v=\"97\"",
		    "sec-ch-ua-mobile": "?0",
		    "sec-ch-ua-platform": "\"Windows\"",
		    "upgrade-insecure-requests": "1",
		    "sec-fetch-site": "same-origin",
		    "sec-fetch-mode": "navigate",
		    "sec-fetch-user": "?1",
		    "sec-fetch-dest": "document",
		    "Accept-Encoding": "gzip, deflate, br"
		};
        let _headers = Object.assign(customHeaders, headers);
        
        let method = "GET";
        let requestOptions = {method, headers: _headers};
        let requestURL = 'https://dre.pt/dre/pesquisa';
        let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions}); 		
        return responsePage;
    };

const getSession_GUID = async function ({canonicalURL, headers}) {
        let customHeaders = {
		    "authority": "dre.pt",
		    "sec-ch-ua": "\" Not;A Brand\";v=\"99\", \"Google Chrome\";v=\"97\", \"Chromium\";v=\"97\"",
		    "x-csrftoken": "T6C+9iB49TLra4jEsMeSckDMNhQ=",
		    "sec-ch-ua-mobile": "?0",
		    "content-type": "application/json; charset=UTF-8",
		    "sec-ch-ua-platform": "\"Windows\"",
		    "origin": "https://dre.pt",
		    "sec-fetch-site": "same-origin",
		    "sec-fetch-mode": "cors",
		    "sec-fetch-dest": "empty",
		    "referer": "https://dre.pt/dre/pesquisa",
		    "Accept-Encoding": "gzip, deflate, br"
		};
        let _headers = Object.assign(customHeaders, headers);
        let data = {
          "versionInfo": {
              "moduleVersion": "J0SQ28jaURKC0vhrWDBYQQ",
              "apiVersion": "16JkNkp+dY8+vgSR4_BaPA"
          },
          "viewName": "*",
          "inputParameters": {}
		};
		let body = JSON.stringify(data);
        let method = "POST";
        let requestOptions = {method, body, headers: _headers};
        let requestURL = 'https://dre.pt/dre/screenservices/DRE/ActionGenerateGuid_SA';
        let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
  		let dataObj = await responsePage.response.text(); 		
  		let obj = JSON.parse(dataObj)
        let session_GUID = obj['data']['Guid']
        if (session_GUID) setSharedVariable('session_GUID', session_GUID);
        return session_GUID
 };

const searchByDate = async function ({date, canonicalURL, headers}) {
  		await home({headers});
  		await getSession_GUID({canonicalURL, headers})
        let customHeaders = {
		    "authority": "dre.pt",
		    "sec-ch-ua": "\" Not;A Brand\";v=\"99\", \"Google Chrome\";v=\"97\", \"Chromium\";v=\"97\"",
		    "x-csrftoken": "T6C+9iB49TLra4jEsMeSckDMNhQ=",
		    "sec-ch-ua-mobile": "?0",
		    "content-type": "application/json; charset=UTF-8",
		    "sec-ch-ua-platform": "\"Windows\"",
		    "origin": "https://dre.pt",
		    "sec-fetch-site": "same-origin",
		    "sec-fetch-mode": "cors",
		    "sec-fetch-dest": "empty",
		    "referer": "https://dre.pt/dre/pesquisa",
		    "Accept-Encoding": "gzip, deflate, br"
		};
        let _headers = Object.assign(customHeaders, headers);
        let data = {
    "versionInfo": {
        "moduleVersion": "J0SQ28jaURKC0vhrWDBYQQ",
        "apiVersion": "a_w_qsCJwFTYMI5sjvgalQ"
    },
    "viewName": "Pesquisas.PesquisaResultado",
    "screenData": {
        "variables": {
            "FiltrosDePesquisa": {
                "tipoConteudo": {
                    "List": [
                        "DiarioRepublica"
                    ]
                },
                "serie": {
                    "List": [],
                    "EmptyListItem": ""
                },
                "numero": "",
                "ano": "0",
                "suplemento": "0",
                "dataPublicacao": "",
                "dataPublicacaoDe": `${date}`,
                "dataPublicacaoAte": `${date}`,
                "parte": "",
                "apendice": "",
                "fasciculo": "",
                "tipo": {
                    "List": [],
                    "EmptyListItem": ""
                },
                "emissor": {
                    "List": [],
                    "EmptyListItem": ""
                },
                "texto": "",
                "sumario": "",
                "entidadeProponente": {
                    "List": [],
                    "EmptyListItem": ""
                },
                "numeroDR": "",
                "paginaInicial": "0",
                "paginaFinal": "0",
                "dataAssinatura": "",
                "dataDistribuicao": "",
                "entidadePrincipal": {
                    "List": [],
                    "EmptyListItem": ""
                },
                "entidadeEmitente": {
                    "List": [],
                    "EmptyListItem": ""
                },
                "docType": "",
                "proferido": "",
                "processo": "",
                "assunto": "",
                "recorrente": "",
                "recorrido": "",
                "relator": "",
                "empresa": "",
                "concelho": "",
                "nif": "",
                "anuncio": "",
                "numeroDoc": "",
                "DataAssinaturaDe": "1900-01-01",
                "DataAssinaturaAte": "1900-01-01",
                "DataDistribuicaoDe": "1900-01-01",
                "DataDistribuicaoAte": "1900-01-01",
                "semestre": ""
            },
            "ResultadosPorPaginaId": 1,
            "NumeroDeResultadosPorPagina": 25,
            "StartIndex": 0,
            "OcultarRevogados": false,
            "DestaqueExcertos": false,
            "TipoOrdenacaoId": 2,
            "Pesquisa": {
                "List": [],
                "EmptyListItem": ""
            },
            "Texto": "",
            "ResultadosElastic": {
                "Took": "8",
                "Timed_out": false,
                "shards": {
                    "Total": "3",
                    "Successful": "3",
                    "Skipped": "0",
                    "Failed": "0"
                },
                "Hits": {
                    "Total": {
                        "Value": "0",
                        "Relation": "eq"
                    },
                    "Max_score": "0",
                    "Hits": {
                        "List": [],
                        "EmptyListItem": {
                            "index": "",
                            "type": "",
                            "id": "",
                            "score": "0",
                            "source": {
                                "NumeroInt": "0",
                                "DataPublicacaoAJ": "1900-01-01",
                                "DocType": "",
                                "Visibility": "",
                                "Conteudo": false,
                                "Vigencia": "",
                                "Title_bst_10k": "",
                                "TextoEntradaVigor": "",
                                "Type": "",
                                "TipoAssociacao": {
                                    "List": [],
                                    "EmptyListItem": ""
                                },
                                "NumeroFonte": "",
                                "Descritor": {
                                    "List": [],
                                    "EmptyListItem": ""
                                },
                                "Emissor": "",
                                "Ano": "",
                                "Paginas": "",
                                "TipoAJ": "",
                                "SerieNR": "",
                                "Suplemento": "",
                                "OrdemDR": "",
                                "Texto": "",
                                "ConteudoId": "0",
                                "EntidadePrincipal": "",
                                "DataPublicacao": "1900-01-01",
                                "EntidadeEmitente": "",
                                "DataDistribuicao": "1900-01-01",
                                "PaginaFinal": "0",
                                "Numero": "",
                                "FileId": "0",
                                "AjPublica": false,
                                "TipoConteudo": "",
                                "Tratamento": false,
                                "EntidadeResponsavel": "",
                                "NumeroAJ": "",
                                "DbId": "0",
                                "Nota": {
                                    "List": [],
                                    "EmptyListItem": ""
                                },
                                "Thesaurus_descritor_eq": "",
                                "DataAssinatura": "1900-01-01",
                                "Thesaurus_descritor_np": {
                                    "List": [],
                                    "EmptyListItem": ""
                                },
                                "WhenSearchable": "",
                                "Id": "",
                                "Fragmentado": false,
                                "Title": "",
                                "Ordem": "0",
                                "ConteudoTitle": "",
                                "ClassName": "",
                                "NumeroDR": "",
                                "DataEntradaVigor": "1900-01-01T00:00:00",
                                "PaginaInicial": "0",
                                "Acronimo": "",
                                "TextoAssociacao": "",
                                "Serie": "",
                                "CreationDate": "1900-01-01T00:00:00",
                                "Descritor_texto": "",
                                "ResumoAJ": "",
                                "Sumario": "",
                                "Regional": false,
                                "Views": "0",
                                "Fonte": "",
                                "Tipo": "",
                                "ModificationDate": "1900-01-01T00:00:00",
                                "Thesaurus_descritor": {
                                    "List": [],
                                    "EmptyListItem": ""
                                },
                                "EmissorEN": "",
                                "Parte": "",
                                "TipoEN": "",
                                "TextoNota": "",
                                "resumo": "",
                                "resumoEN": "",
                                "Designacao": "",
                                "ConsolidacaoType": "",
                                "DiplomaBase": "",
                                "concelho": "",
                                "empresa": "",
                                "assunto": "",
                                "consolidacaoEstado": "",
                                "IsSelected": false
                            },
                            "Highlight": {
                                "Title": {
                                    "List": [],
                                    "EmptyListItem": ""
                                },
                                "Sumario": {
                                    "List": [],
                                    "EmptyListItem": ""
                                },
                                "Designacao": {
                                    "List": [],
                                    "EmptyListItem": ""
                                },
                                "Texto": {
                                    "List": [],
                                    "EmptyListItem": ""
                                }
                            }
                        }
                    }
                },
                "aggregations": {
                    "SerieAgg": {
                        "doc_count_error_upper_bound": "0",
                        "sum_other_doc_count": "0",
                        "buckets": {
                            "List": [],
                            "EmptyListItem": {
                                "key": "",
                                "doc_count": "0",
                                "key_as_string": "",
                                "isActive": false
                            }
                        }
                    },
                    "TipoAtoAgg": {
                        "doc_count_error_upper_bound": "0",
                        "sum_other_doc_count": "0",
                        "buckets": {
                            "List": [],
                            "EmptyListItem": {
                                "key": "",
                                "doc_count": "0",
                                "key_as_string": "",
                                "isActive": false
                            }
                        }
                    },
                    "TipoConteudoAgg": {
                        "doc_count_error_upper_bound": "0",
                        "sum_other_doc_count": "0",
                        "buckets": {
                            "List": [],
                            "EmptyListItem": {
                                "key": "",
                                "doc_count": "0",
                                "key_as_string": "",
                                "isActive": false
                            }
                        }
                    },
                    "EntidadeEmitenteAgg": {
                        "doc_count_error_upper_bound": "0",
                        "sum_other_doc_count": "0",
                        "buckets": {
                            "List": [],
                            "EmptyListItem": {
                                "key": "",
                                "doc_count": "0",
                                "key_as_string": "",
                                "isActive": false
                            }
                        }
                    },
                    "EntidadeProponenteAgg": {
                        "doc_count_error_upper_bound": "0",
                        "sum_other_doc_count": "0",
                        "buckets": {
                            "List": [],
                            "EmptyListItem": {
                                "key": "",
                                "doc_count": "0",
                                "key_as_string": "",
                                "isActive": false
                            }
                        }
                    },
                    "EntidadePrincipalAgg": {
                        "doc_count_error_upper_bound": "0",
                        "sum_other_doc_count": "0",
                        "buckets": {
                            "List": [],
                            "EmptyListItem": {
                                "key": "",
                                "doc_count": "0",
                                "key_as_string": "",
                                "isActive": false
                            }
                        }
                    },
                    "TipoConteudoAggOutros": {
                        "doc_count_error_upper_bound": "0",
                        "sum_other_doc_count": "0",
                        "buckets": {
                            "List": [],
                            "EmptyListItem": {
                                "key": "",
                                "doc_count": "0",
                                "key_as_string": "",
                                "isActive": false
                            }
                        }
                    },
                    "EmissorAgg": {
                        "doc_count_error_upper_bound": "0",
                        "sum_other_doc_count": "0",
                        "buckets": {
                            "List": [],
                            "EmptyListItem": {
                                "key": "",
                                "doc_count": "0",
                                "key_as_string": "",
                                "isActive": false
                            }
                        }
                    },
                    "CalendarioAgg": {
                        "doc_count_error_upper_bound": "0",
                        "sum_other_doc_count": "0",
                        "buckets": {
                            "List": [],
                            "EmptyListItem": {
                                "key": "",
                                "doc_count": "0",
                                "key_as_string": "",
                                "isActive": false
                            }
                        }
                    },
                    "JurisprudenciaAgg": {
                        "doc_count_error_upper_bound": "0",
                        "sum_other_doc_count": "0",
                        "buckets": {
                            "List": [],
                            "EmptyListItem": {
                                "key": "",
                                "doc_count": "0",
                                "key_as_string": "",
                                "isActive": false
                            }
                        }
                    },
                    "JurisAggs": {
                        "buckets": {
                            "List": [],
                            "EmptyListItem": {
                                "key": "",
                                "doc_count": "0",
                                "key_as_string": "",
                                "isActive": false
                            }
                        }
                    }
                }
            },
            "ResultadosElasticParaPisco": {
                "Took": "0",
                "Timed_out": false,
                "shards": {
                    "Total": "0",
                    "Successful": "0",
                    "Skipped": "0",
                    "Failed": "0"
                },
                "Hits": {
                    "Total": {
                        "Value": "0",
                        "Relation": ""
                    },
                    "Max_score": "0",
                    "Hits": {
                        "List": [],
                        "EmptyListItem": {
                            "index": "",
                            "type": "",
                            "id": "",
                            "score": "0",
                            "source": {
                                "NumeroInt": "0",
                                "DataPublicacaoAJ": "1900-01-01",
                                "DocType": "",
                                "Visibility": "",
                                "Conteudo": false,
                                "Vigencia": "",
                                "Title_bst_10k": "",
                                "TextoEntradaVigor": "",
                                "Type": "",
                                "TipoAssociacao": {
                                    "List": [],
                                    "EmptyListItem": ""
                                },
                                "NumeroFonte": "",
                                "Descritor": {
                                    "List": [],
                                    "EmptyListItem": ""
                                },
                                "Emissor": "",
                                "Ano": "",
                                "Paginas": "",
                                "TipoAJ": "",
                                "SerieNR": "",
                                "Suplemento": "",
                                "OrdemDR": "",
                                "Texto": "",
                                "ConteudoId": "0",
                                "EntidadePrincipal": "",
                                "DataPublicacao": "1900-01-01",
                                "EntidadeEmitente": "",
                                "DataDistribuicao": "1900-01-01",
                                "PaginaFinal": "0",
                                "Numero": "",
                                "FileId": "0",
                                "AjPublica": false,
                                "TipoConteudo": "",
                                "Tratamento": false,
                                "EntidadeResponsavel": "",
                                "NumeroAJ": "",
                                "DbId": "0",
                                "Nota": {
                                    "List": [],
                                    "EmptyListItem": ""
                                },
                                "Thesaurus_descritor_eq": "",
                                "DataAssinatura": "1900-01-01",
                                "Thesaurus_descritor_np": {
                                    "List": [],
                                    "EmptyListItem": ""
                                },
                                "WhenSearchable": "",
                                "Id": "",
                                "Fragmentado": false,
                                "Title": "",
                                "Ordem": "0",
                                "ConteudoTitle": "",
                                "ClassName": "",
                                "NumeroDR": "",
                                "DataEntradaVigor": "1900-01-01T00:00:00",
                                "PaginaInicial": "0",
                                "Acronimo": "",
                                "TextoAssociacao": "",
                                "Serie": "",
                                "CreationDate": "1900-01-01T00:00:00",
                                "Descritor_texto": "",
                                "ResumoAJ": "",
                                "Sumario": "",
                                "Regional": false,
                                "Views": "0",
                                "Fonte": "",
                                "Tipo": "",
                                "ModificationDate": "1900-01-01T00:00:00",
                                "Thesaurus_descritor": {
                                    "List": [],
                                    "EmptyListItem": ""
                                },
                                "EmissorEN": "",
                                "Parte": "",
                                "TipoEN": "",
                                "TextoNota": "",
                                "resumo": "",
                                "resumoEN": "",
                                "Designacao": "",
                                "ConsolidacaoType": "",
                                "DiplomaBase": "",
                                "concelho": "",
                                "empresa": "",
                                "assunto": "",
                                "consolidacaoEstado": "",
                                "IsSelected": false
                            },
                            "Highlight": {
                                "Title": {
                                    "List": [],
                                    "EmptyListItem": ""
                                },
                                "Sumario": {
                                    "List": [],
                                    "EmptyListItem": ""
                                },
                                "Designacao": {
                                    "List": [],
                                    "EmptyListItem": ""
                                },
                                "Texto": {
                                    "List": [],
                                    "EmptyListItem": ""
                                }
                            }
                        }
                    }
                },
                "aggregations": {
                    "SerieAgg": {
                        "doc_count_error_upper_bound": "0",
                        "sum_other_doc_count": "0",
                        "buckets": {
                            "List": [],
                            "EmptyListItem": {
                                "key": "",
                                "doc_count": "0",
                                "key_as_string": "",
                                "isActive": false
                            }
                        }
                    },
                    "TipoAtoAgg": {
                        "doc_count_error_upper_bound": "0",
                        "sum_other_doc_count": "0",
                        "buckets": {
                            "List": [],
                            "EmptyListItem": {
                                "key": "",
                                "doc_count": "0",
                                "key_as_string": "",
                                "isActive": false
                            }
                        }
                    },
                    "TipoConteudoAgg": {
                        "doc_count_error_upper_bound": "0",
                        "sum_other_doc_count": "0",
                        "buckets": {
                            "List": [],
                            "EmptyListItem": {
                                "key": "",
                                "doc_count": "0",
                                "key_as_string": "",
                                "isActive": false
                            }
                        }
                    },
                    "EntidadeEmitenteAgg": {
                        "doc_count_error_upper_bound": "0",
                        "sum_other_doc_count": "0",
                        "buckets": {
                            "List": [],
                            "EmptyListItem": {
                                "key": "",
                                "doc_count": "0",
                                "key_as_string": "",
                                "isActive": false
                            }
                        }
                    },
                    "EntidadeProponenteAgg": {
                        "doc_count_error_upper_bound": "0",
                        "sum_other_doc_count": "0",
                        "buckets": {
                            "List": [],
                            "EmptyListItem": {
                                "key": "",
                                "doc_count": "0",
                                "key_as_string": "",
                                "isActive": false
                            }
                        }
                    },
                    "EntidadePrincipalAgg": {
                        "doc_count_error_upper_bound": "0",
                        "sum_other_doc_count": "0",
                        "buckets": {
                            "List": [],
                            "EmptyListItem": {
                                "key": "",
                                "doc_count": "0",
                                "key_as_string": "",
                                "isActive": false
                            }
                        }
                    },
                    "TipoConteudoAggOutros": {
                        "doc_count_error_upper_bound": "0",
                        "sum_other_doc_count": "0",
                        "buckets": {
                            "List": [],
                            "EmptyListItem": {
                                "key": "",
                                "doc_count": "0",
                                "key_as_string": "",
                                "isActive": false
                            }
                        }
                    },
                    "EmissorAgg": {
                        "doc_count_error_upper_bound": "0",
                        "sum_other_doc_count": "0",
                        "buckets": {
                            "List": [],
                            "EmptyListItem": {
                                "key": "",
                                "doc_count": "0",
                                "key_as_string": "",
                                "isActive": false
                            }
                        }
                    },
                    "CalendarioAgg": {
                        "doc_count_error_upper_bound": "0",
                        "sum_other_doc_count": "0",
                        "buckets": {
                            "List": [],
                            "EmptyListItem": {
                                "key": "",
                                "doc_count": "0",
                                "key_as_string": "",
                                "isActive": false
                            }
                        }
                    },
                    "JurisprudenciaAgg": {
                        "doc_count_error_upper_bound": "0",
                        "sum_other_doc_count": "0",
                        "buckets": {
                            "List": [],
                            "EmptyListItem": {
                                "key": "",
                                "doc_count": "0",
                                "key_as_string": "",
                                "isActive": false
                            }
                        }
                    },
                    "JurisAggs": {
                        "buckets": {
                            "List": [],
                            "EmptyListItem": {
                                "key": "",
                                "doc_count": "0",
                                "key_as_string": "",
                                "isActive": false
                            }
                        }
                    }
                }
            },
            "Ordenacoes": {
                "List": [
                    {
                        "Field": "dataPublicacao",
                        "Order": "desc"
                    },
                    {
                        "Field": "numeroDR.keyword",
                        "Order": "desc"
                    },
                    {
                        "Field": "serieNR",
                        "Order": "asc"
                    },
                    {
                        "Field": "suplemento",
                        "Order": "asc"
                    },
                    {
                        "Field": "apendice.keyword",
                        "Order": "asc"
                    }
                ]
            },
            "IsTipoAtoOpen": false,
            "IsSerieOpen": false,
            "IsTipoConteudoOpen": false,
            "IsEntidadeEmitenteOpen": false,
            "IsEntidadeProponenteOpen": false,
            "ListaFiltrosEscolhidosParaQuery": {
                "List": [],
                "EmptyListItem": ""
            },
            "CountRenderEcra": 0,
            "Listas": {
                "DocTypeList": {
                    "List": [],
                    "EmptyListItem": {
                        "key": "",
                        "doc_count": "0",
                        "key_as_string": "",
                        "isActive": false
                    }
                },
                "EntidadeEmitenteList": {
                    "List": [],
                    "EmptyListItem": {
                        "key": "",
                        "doc_count": "0",
                        "key_as_string": "",
                        "isActive": false
                    }
                },
                "EntidadeProponenteList": {
                    "List": [],
                    "EmptyListItem": {
                        "key": "",
                        "doc_count": "0",
                        "key_as_string": "",
                        "isActive": false
                    }
                },
                "SerieList": {
                    "List": [],
                    "EmptyListItem": {
                        "key": "",
                        "doc_count": "0",
                        "key_as_string": "",
                        "isActive": false
                    }
                },
                "TipoAtoList": {
                    "List": [],
                    "EmptyListItem": {
                        "key": "",
                        "doc_count": "0",
                        "key_as_string": "",
                        "isActive": false
                    }
                },
                "TipoConteudoList": {
                    "List": [],
                    "EmptyListItem": {
                        "key": "",
                        "doc_count": "0",
                        "key_as_string": "",
                        "isActive": false
                    }
                }
            },
            "IsPesquisaGuardada": false,
            "ListaFiltros": {
                "List": [],
                "EmptyListItem": {
                    "Area": "",
                    "Value": ""
                }
            },
            "ItemSelecionado": "",
            "MensagemResultadoGuardado": "",
            "MensagemResultOK": false,
            "MensagemErro": "",
            "IsRended": true,
            "PesquisaAvancadaFiltros": "eyJ0aXBvQ29udGV1ZG8iOlsiRGlhcmlvUmVwdWJsaWNhIl0sInNlcmllIjpbXSwiZGF0YVB1YmxpY2FjYW9EZSI6IjIwMjAtMDItMjIiLCJkYXRhUHVibGljYWNhb0F0ZSI6IjIwMjAtMDItMjIiLCJ0aXBvIjpbXSwiZW1pc3NvciI6W10sImVudGlkYWRlUHJvcG9uZW50ZSI6W10sImVudGlkYWRlUHJpbmNpcGFsIjpbXSwiZW50aWRhZGVFbWl0ZW50ZSI6W119",
            "PesquisaSimplesFiltro": "",
            "EmissorJurisprudencia": "",
            "PesquisaAvancadaBools": "{\"DiarioRepublica\":true}",
            "ComesFromHistorico": false,
            "PesquisaHasDataFetched": true,
            "exportExcel": false,
            "MaxRecords": 10,
            "exportTipo": "",
            "exportDoc": false,
            "exportPDF": false,
            "FiltrosPesquisaErro": {
                "IsActive": false,
                "Erro": ""
            },
            "MaxRecordsConteudo": 10,
            "MaxRecordsEntidadeEmitente": 10,
            "MaxRecordsEntidadeProponente": 10,
            "MaxRecordsAto": 10
        }
    },
    "clientVariables": {
        "NewUser": "https://dre.pt/dre/utilizador/registar",
        "PesquisaAvancada": "https://dre.pt/dre/pesquisa-avancada",
        "NIC": "",
        "UtilizadorPortalIdOld": "0",
        "Login": "https://dre.pt/dre/utilizador/entrar",
        "TotalResultados": 0,
        "Search": false,
        "DicionarioJuridicoId": "0",
        "FullHTMLURL_EN": "https://dre.pt/dre/en",
        "Name": "",
        "ShowResult": false,
        "EntityId_Filter": 0,
        "BookId_Filter": 0,
        "Email": "",
        "StartIndex": 0,
        "paginaJson": "",
        "Pesquisa": "",
        "CookiePath": "/dre/",
        "DataInicial_Filter": "1900-01-01",
        "DiarioRepublicaId": "",
        "Query_Filter": "",
        "UtilizadorPortalId": "0",
        "t": "",
        "Session_GUID": getSharedVariable("session_GUID"),
        "ActoLegislativoId_Filter": 0,
        "FullHTMLURL": "https://dre.pt/dre/home",
        "TipoDeUtilizador": "",
        "DataFinal_Filter": "1900-01-01",
        "GUID": "82201234-2f17-4903-bced-b8fea67d0b75",
        "IsColecaoLegislacaoFilter": true
    }
};
let body = JSON.stringify(data);
        let method = "POST";
        let requestOptions = {method, body, headers: _headers};
        let requestURL = 'https://dre.pt/dre/screenservices/DRE/Pesquisas/PesquisaResultado/DataActionGetPesquisas';
        let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
  		let dataObj = await responsePage.response.text(); 		
  		let obj = JSON.parse(dataObj)
        let json = JSON.stringify(obj['data'])
        json = json.replace(/\\[rn]|\\/g, '').replace(/,"sort":\[.+?]/g, '')
  		let resArr = /hits":(\[.+?])/.exec(json)
        resArr = resArr && `{"data":${resArr[1]}}`
        responsePage.response = new fetch.Response(resArr, responsePage.response);
        responsePage.response.headers.set('content-type', 'application/json');
        return responsePage;
    };


const getActionLinks = async function ({numero, ano, dbId, canonicalURL, headers}) {
  		//throw(`${numero}, ${ano}, ${dbId}`)
        let customHeaders = {
		    "authority": "dre.pt",
		    "sec-ch-ua": "\" Not;A Brand\";v=\"99\", \"Google Chrome\";v=\"97\", \"Chromium\";v=\"97\"",
		    "x-csrftoken": "T6C+9iB49TLra4jEsMeSckDMNhQ=",
		    "sec-ch-ua-mobile": "?0",
		    "content-type": "application/json; charset=UTF-8",
		    "sec-ch-ua-platform": "\"Windows\"",
		    "origin": "https://dre.pt",
		    "sec-fetch-site": "same-origin",
		    "sec-fetch-mode": "cors",
		    "sec-fetch-dest": "empty",
		    //"referer": "https://dre.pt/dre/detalhe/diario-republica/142-2021-168184693",
          	"referer": `${canonicalURL}`,
		    "Accept-Encoding": "gzip, deflate, br"
		};
        let _headers = Object.assign(customHeaders, headers);
        let data = {
    "versionInfo": {
        "moduleVersion": "J0SQ28jaURKC0vhrWDBYQQ",
        "apiVersion": "wRt2tqIBDHyWftRYqEaNfg"
    },
    "viewName": "Legislacao_Conteudos.Conteudo_Detalhe",
    "screenData": {
        "variables": {
            "MaxRecords": 20,
            "DetalheConteudo2": {
                "List": [],
                "EmptyListItem": {
                    "Titulo": "",
                    "Emissor": "",
                    "Sumario": "",
                    "DiplomaLegisId": "0",
                    "ContratoPublicoId": "0",
                    "TipoDiploma": "",
                    "Numero": "",
                    "Isnoindex": false,
                    "ResumoEN": ""
                }
            },
            "ParteIdAux": "0",
            "IsFinished": false,
            "DiplomaIds": {
                "List": [],
                "EmptyListItem": "0"
            },
            "DiarioId": `${dbId}`,
            "_diarioIdInDataFetchStatus": 1,
            "ParteId": "0",
            "_parteIdInDataFetchStatus": 1,
            "IsSerieI": true,
            "_isSerieIInDataFetchStatus": 1
        }
    },
    "clientVariables": {
        "NewUser": "https://dre.pt/dre/utilizador/registar",
        "PesquisaAvancada": "https://dre.pt/dre/pesquisa-avancada",
        "NIC": "",
        "UtilizadorPortalIdOld": "0",
        "Login": "https://dre.pt/dre/utilizador/entrar",
        "TotalResultados": 0,
        "Search": false,
        "DicionarioJuridicoId": "0",
        "FullHTMLURL_EN": "https://dre.pt/dre/en",
        "Name": "",
        "ShowResult": false,
        "EntityId_Filter": 0,
        "BookId_Filter": 0,
        "Email": "",
        "StartIndex": 0,
        "paginaJson": "",
        "Pesquisa": "",
        "CookiePath": "/dre/",
        "DataInicial_Filter": "1900-01-01",
        "DiarioRepublicaId": `${dbId}`,
        "Query_Filter": "",
        "UtilizadorPortalId": "0",
        "t": "",
        "Session_GUID": getSharedVariable("session_GUID"),
        "ActoLegislativoId_Filter": 0,
        "FullHTMLURL": "https://dre.pt/dre/home",
        "TipoDeUtilizador": "",
        "DataFinal_Filter": "1900-01-01",
        "GUID": "4fe781fb-3e46-42e9-89f5-38613c898679",
        "IsColecaoLegislacaoFilter": true
    }
};
let body = JSON.stringify(data);
        let method = "POST";
        let requestOptions = {method, body, headers: _headers};
        let requestURL = 'https://dre.pt/dre/screenservices/DRE/Legislacao_Conteudos/ListaDiplomas/DataActionGetDados';
        let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
        return responsePage;
    };


const getContent = async function ({tipo, numero, ano, dbId, canonicalURL, headers}) {
  		//throw(`${tipo} ${numero}, ${ano}, ${dbId}`)
        let customHeaders = {
		    "authority": "dre.pt",
		    "sec-ch-ua": "\" Not;A Brand\";v=\"99\", \"Google Chrome\";v=\"97\", \"Chromium\";v=\"97\"",
		    "x-csrftoken": "T6C+9iB49TLra4jEsMeSckDMNhQ=",
		    "sec-ch-ua-mobile": "?0",
		    "content-type": "application/json; charset=UTF-8",
		    "sec-ch-ua-platform": "\"Windows\"",
		    "origin": "https://dre.pt",
		    "sec-fetch-site": "same-origin",
		    "sec-fetch-mode": "cors",
		    "sec-fetch-dest": "empty",
		    "referer": "https://dre.pt/dre/detalhe/diario-republica/140-2021-167924773",
		    "Accept-Encoding": "gzip, deflate, br"
		};
        let _headers = Object.assign(customHeaders, headers);
        let data = {
    "versionInfo": {
        "moduleVersion": "J0SQ28jaURKC0vhrWDBYQQ",
        "apiVersion": "Sh+eV3mQGzFJUsvIX_HFKg"
    },
    "viewName": "Legislacao_Conteudos.Conteudo_Detalhe",
    "screenData": {
        "variables": {
            "JurisprudenciaVar": false,
            "ParteIdAux": "0",
            "Resultados_Jurisprudencia": {
                "Took": "0",
                "Timed_out": false,
                "shards": {
                    "Total": "0",
                    "Successful": "0",
                    "Skipped": "0",
                    "Failed": "0"
                },
                "Hits": {
                    "Total": {
                        "Value": "0",
                        "Relation": ""
                    },
                    "Max_score": "0",
                    "Hits": {
                        "List": [],
                        "EmptyListItem": {
                            "index": "",
                            "type": "",
                            "id": "",
                            "score": "0",
                            "source": {
                                "NumeroInt": "0",
                                "DataPublicacaoAJ": "1900-01-01",
                                "DocType": "",
                                "Visibility": "",
                                "Conteudo": false,
                                "Vigencia": "",
                                "Title_bst_10k": "",
                                "TextoEntradaVigor": "",
                                "Type": "",
                                "TipoAssociacao": {
                                    "List": [],
                                    "EmptyListItem": ""
                                },
                                "NumeroFonte": "",
                                "Descritor": {
                                    "List": [],
                                    "EmptyListItem": ""
                                },
                                "Emissor": "",
                                "Ano": "",
                                "Paginas": "",
                                "TipoAJ": "",
                                "SerieNR": "",
                                "Suplemento": "",
                                "OrdemDR": "",
                                "Texto": "",
                                "ConteudoId": "0",
                                "EntidadePrincipal": "",
                                "DataPublicacao": "1900-01-01",
                                "EntidadeEmitente": "",
                                "DataDistribuicao": "1900-01-01",
                                "PaginaFinal": "0",
                                "Numero": "",
                                "FileId": "0",
                                "AjPublica": false,
                                "TipoConteudo": "",
                                "Tratamento": false,
                                "EntidadeResponsavel": "",
                                "NumeroAJ": "",
                                "DbId": "0",
                                "Nota": {
                                    "List": [],
                                    "EmptyListItem": ""
                                },
                                "Thesaurus_descritor_eq": "",
                                "DataAssinatura": "1900-01-01",
                                "Thesaurus_descritor_np": {
                                    "List": [],
                                    "EmptyListItem": ""
                                },
                                "WhenSearchable": "",
                                "Id": "",
                                "Fragmentado": false,
                                "Title": "",
                                "Ordem": "0",
                                "ConteudoTitle": "",
                                "ClassName": "",
                                "NumeroDR": "",
                                "DataEntradaVigor": "1900-01-01T00:00:00",
                                "PaginaInicial": "0",
                                "Acronimo": "",
                                "TextoAssociacao": "",
                                "Serie": "",
                                "CreationDate": "1900-01-01T00:00:00",
                                "Descritor_texto": "",
                                "ResumoAJ": "",
                                "Sumario": "",
                                "Regional": false,
                                "Views": "0",
                                "Fonte": "",
                                "Tipo": "",
                                "ModificationDate": "1900-01-01T00:00:00",
                                "Thesaurus_descritor": {
                                    "List": [],
                                    "EmptyListItem": ""
                                },
                                "EmissorEN": "",
                                "Parte": "",
                                "TipoEN": "",
                                "TextoNota": "",
                                "resumo": "",
                                "resumoEN": "",
                                "Designacao": "",
                                "ConsolidacaoType": "",
                                "DiplomaBase": "",
                                "concelho": "",
                                "empresa": "",
                                "assunto": "",
                                "consolidacaoEstado": "",
                                "IsSelected": false
                            },
                            "Highlight": {
                                "Title": {
                                    "List": [],
                                    "EmptyListItem": ""
                                },
                                "Sumario": {
                                    "List": [],
                                    "EmptyListItem": ""
                                },
                                "Designacao": {
                                    "List": [],
                                    "EmptyListItem": ""
                                },
                                "Texto": {
                                    "List": [],
                                    "EmptyListItem": ""
                                }
                            }
                        }
                    }
                },
                "aggregations": {
                    "SerieAgg": {
                        "doc_count_error_upper_bound": "0",
                        "sum_other_doc_count": "0",
                        "buckets": {
                            "List": [],
                            "EmptyListItem": {
                                "key": "",
                                "doc_count": "0",
                                "key_as_string": "",
                                "isActive": false
                            }
                        }
                    },
                    "TipoAtoAgg": {
                        "doc_count_error_upper_bound": "0",
                        "sum_other_doc_count": "0",
                        "buckets": {
                            "List": [],
                            "EmptyListItem": {
                                "key": "",
                                "doc_count": "0",
                                "key_as_string": "",
                                "isActive": false
                            }
                        }
                    },
                    "TipoConteudoAgg": {
                        "doc_count_error_upper_bound": "0",
                        "sum_other_doc_count": "0",
                        "buckets": {
                            "List": [],
                            "EmptyListItem": {
                                "key": "",
                                "doc_count": "0",
                                "key_as_string": "",
                                "isActive": false
                            }
                        }
                    },
                    "EntidadeEmitenteAgg": {
                        "doc_count_error_upper_bound": "0",
                        "sum_other_doc_count": "0",
                        "buckets": {
                            "List": [],
                            "EmptyListItem": {
                                "key": "",
                                "doc_count": "0",
                                "key_as_string": "",
                                "isActive": false
                            }
                        }
                    },
                    "EntidadeProponenteAgg": {
                        "doc_count_error_upper_bound": "0",
                        "sum_other_doc_count": "0",
                        "buckets": {
                            "List": [],
                            "EmptyListItem": {
                                "key": "",
                                "doc_count": "0",
                                "key_as_string": "",
                                "isActive": false
                            }
                        }
                    },
                    "EntidadePrincipalAgg": {
                        "doc_count_error_upper_bound": "0",
                        "sum_other_doc_count": "0",
                        "buckets": {
                            "List": [],
                            "EmptyListItem": {
                                "key": "",
                                "doc_count": "0",
                                "key_as_string": "",
                                "isActive": false
                            }
                        }
                    },
                    "TipoConteudoAggOutros": {
                        "doc_count_error_upper_bound": "0",
                        "sum_other_doc_count": "0",
                        "buckets": {
                            "List": [],
                            "EmptyListItem": {
                                "key": "",
                                "doc_count": "0",
                                "key_as_string": "",
                                "isActive": false
                            }
                        }
                    },
                    "EmissorAgg": {
                        "doc_count_error_upper_bound": "0",
                        "sum_other_doc_count": "0",
                        "buckets": {
                            "List": [],
                            "EmptyListItem": {
                                "key": "",
                                "doc_count": "0",
                                "key_as_string": "",
                                "isActive": false
                            }
                        }
                    },
                    "CalendarioAgg": {
                        "doc_count_error_upper_bound": "0",
                        "sum_other_doc_count": "0",
                        "buckets": {
                            "List": [],
                            "EmptyListItem": {
                                "key": "",
                                "doc_count": "0",
                                "key_as_string": "",
                                "isActive": false
                            }
                        }
                    },
                    "JurisprudenciaAgg": {
                        "doc_count_error_upper_bound": "0",
                        "sum_other_doc_count": "0",
                        "buckets": {
                            "List": [],
                            "EmptyListItem": {
                                "key": "",
                                "doc_count": "0",
                                "key_as_string": "",
                                "isActive": false
                            }
                        }
                    },
                    "JurisAggs": {
                        "buckets": {
                            "List": [],
                            "EmptyListItem": {
                                "key": "",
                                "doc_count": "0",
                                "key_as_string": "",
                                "isActive": false
                            }
                        }
                    }
                }
            },
            "DetalheConteudoElastic": {
                "Took": "0",
                "Timed_out": false,
                "shards": {
                    "Total": "0",
                    "Successful": "0",
                    "Skipped": "0",
                    "Failed": "0"
                },
                "Hits": {
                    "Total": {
                        "Value": "0",
                        "Relation": ""
                    },
                    "Max_score": "0",
                    "Hits": {
                        "List": [],
                        "EmptyListItem": {
                            "index": "",
                            "type": "",
                            "id": "",
                            "score": "0",
                            "source": {
                                "NumeroInt": "0",
                                "DataPublicacaoAJ": "1900-01-01",
                                "DocType": "",
                                "Visibility": "",
                                "Conteudo": false,
                                "Vigencia": "",
                                "Title_bst_10k": "",
                                "TextoEntradaVigor": "",
                                "Type": "",
                                "TipoAssociacao": {
                                    "List": [],
                                    "EmptyListItem": ""
                                },
                                "NumeroFonte": "",
                                "Descritor": {
                                    "List": [],
                                    "EmptyListItem": ""
                                },
                                "Emissor": "",
                                "Ano": "",
                                "Paginas": "",
                                "TipoAJ": "",
                                "SerieNR": "",
                                "Suplemento": "",
                                "OrdemDR": "",
                                "Texto": "",
                                "ConteudoId": "0",
                                "EntidadePrincipal": "",
                                "DataPublicacao": "1900-01-01",
                                "EntidadeEmitente": "",
                                "DataDistribuicao": "1900-01-01",
                                "PaginaFinal": "0",
                                "Numero": "",
                                "FileId": "0",
                                "AjPublica": false,
                                "TipoConteudo": "",
                                "Tratamento": false,
                                "EntidadeResponsavel": "",
                                "NumeroAJ": "",
                                "DbId": "0",
                                "Nota": {
                                    "List": [],
                                    "EmptyListItem": ""
                                },
                                "Thesaurus_descritor_eq": "",
                                "DataAssinatura": "1900-01-01",
                                "Thesaurus_descritor_np": {
                                    "List": [],
                                    "EmptyListItem": ""
                                },
                                "WhenSearchable": "",
                                "Id": "",
                                "Fragmentado": false,
                                "Title": "",
                                "Ordem": "0",
                                "ConteudoTitle": "",
                                "ClassName": "",
                                "NumeroDR": "",
                                "DataEntradaVigor": "1900-01-01T00:00:00",
                                "PaginaInicial": "0",
                                "Acronimo": "",
                                "TextoAssociacao": "",
                                "Serie": "",
                                "CreationDate": "1900-01-01T00:00:00",
                                "Descritor_texto": "",
                                "ResumoAJ": "",
                                "Sumario": "",
                                "Regional": false,
                                "Views": "0",
                                "Fonte": "",
                                "Tipo": "",
                                "ModificationDate": "1900-01-01T00:00:00",
                                "Thesaurus_descritor": {
                                    "List": [],
                                    "EmptyListItem": ""
                                },
                                "EmissorEN": "",
                                "Parte": "",
                                "TipoEN": "",
                                "TextoNota": "",
                                "resumo": "",
                                "resumoEN": "",
                                "Designacao": "",
                                "ConsolidacaoType": "",
                                "DiplomaBase": "",
                                "concelho": "",
                                "empresa": "",
                                "assunto": "",
                                "consolidacaoEstado": "",
                                "IsSelected": false
                            },
                            "Highlight": {
                                "Title": {
                                    "List": [],
                                    "EmptyListItem": ""
                                },
                                "Sumario": {
                                    "List": [],
                                    "EmptyListItem": ""
                                },
                                "Designacao": {
                                    "List": [],
                                    "EmptyListItem": ""
                                },
                                "Texto": {
                                    "List": [],
                                    "EmptyListItem": ""
                                }
                            }
                        }
                    }
                },
                "aggregations": {
                    "SerieAgg": {
                        "doc_count_error_upper_bound": "0",
                        "sum_other_doc_count": "0",
                        "buckets": {
                            "List": [],
                            "EmptyListItem": {
                                "key": "",
                                "doc_count": "0",
                                "key_as_string": "",
                                "isActive": false
                            }
                        }
                    },
                    "TipoAtoAgg": {
                        "doc_count_error_upper_bound": "0",
                        "sum_other_doc_count": "0",
                        "buckets": {
                            "List": [],
                            "EmptyListItem": {
                                "key": "",
                                "doc_count": "0",
                                "key_as_string": "",
                                "isActive": false
                            }
                        }
                    },
                    "TipoConteudoAgg": {
                        "doc_count_error_upper_bound": "0",
                        "sum_other_doc_count": "0",
                        "buckets": {
                            "List": [],
                            "EmptyListItem": {
                                "key": "",
                                "doc_count": "0",
                                "key_as_string": "",
                                "isActive": false
                            }
                        }
                    },
                    "EntidadeEmitenteAgg": {
                        "doc_count_error_upper_bound": "0",
                        "sum_other_doc_count": "0",
                        "buckets": {
                            "List": [],
                            "EmptyListItem": {
                                "key": "",
                                "doc_count": "0",
                                "key_as_string": "",
                                "isActive": false
                            }
                        }
                    },
                    "EntidadeProponenteAgg": {
                        "doc_count_error_upper_bound": "0",
                        "sum_other_doc_count": "0",
                        "buckets": {
                            "List": [],
                            "EmptyListItem": {
                                "key": "",
                                "doc_count": "0",
                                "key_as_string": "",
                                "isActive": false
                            }
                        }
                    },
                    "EntidadePrincipalAgg": {
                        "doc_count_error_upper_bound": "0",
                        "sum_other_doc_count": "0",
                        "buckets": {
                            "List": [],
                            "EmptyListItem": {
                                "key": "",
                                "doc_count": "0",
                                "key_as_string": "",
                                "isActive": false
                            }
                        }
                    },
                    "TipoConteudoAggOutros": {
                        "doc_count_error_upper_bound": "0",
                        "sum_other_doc_count": "0",
                        "buckets": {
                            "List": [],
                            "EmptyListItem": {
                                "key": "",
                                "doc_count": "0",
                                "key_as_string": "",
                                "isActive": false
                            }
                        }
                    },
                    "EmissorAgg": {
                        "doc_count_error_upper_bound": "0",
                        "sum_other_doc_count": "0",
                        "buckets": {
                            "List": [],
                            "EmptyListItem": {
                                "key": "",
                                "doc_count": "0",
                                "key_as_string": "",
                                "isActive": false
                            }
                        }
                    },
                    "CalendarioAgg": {
                        "doc_count_error_upper_bound": "0",
                        "sum_other_doc_count": "0",
                        "buckets": {
                            "List": [],
                            "EmptyListItem": {
                                "key": "",
                                "doc_count": "0",
                                "key_as_string": "",
                                "isActive": false
                            }
                        }
                    },
                    "JurisprudenciaAgg": {
                        "doc_count_error_upper_bound": "0",
                        "sum_other_doc_count": "0",
                        "buckets": {
                            "List": [],
                            "EmptyListItem": {
                                "key": "",
                                "doc_count": "0",
                                "key_as_string": "",
                                "isActive": false
                            }
                        }
                    },
                    "JurisAggs": {
                        "buckets": {
                            "List": [],
                            "EmptyListItem": {
                                "key": "",
                                "doc_count": "0",
                                "key_as_string": "",
                                "isActive": false
                            }
                        }
                    }
                }
            },
            "IsAdicionadoFavs": false,
            "IsRemovidoFavs": false,
            "IsRended": false,
            "DiarioRepId": "0",
            "DipLegisId": `${dbId}`,
            "DipDGOId": "0",
            "DipRegTrabId": "0",
            "DipLegacorId": "0",
            "DipDGAPId": "0",
            "ActSocId": "0",
            "AcSTADipId": "0",
            "ContPubId": "0",
            "DiplExtId": "0",
            "ShowResumoEN": false,
            "ShowResumoPT": false,
            "ConteudoId1": `${dbId}`,
            "ParteId": "0",
            "Pesquisa": "",
            "Comes1": "Home",
            "HasLegCons": false,
            "DiplomaFragId": "0",
            "IndexPT": 0,
            "Numero": `${numero}`,
            "Year": parseInt(ano),
            "length": 0,
            "Tipo1": `${tipo}`,
            "_tipo1InDataFetchStatus": 1,
            "Key": `${numero}-${ano}-${dbId}`,
            "_keyInDataFetchStatus": 1
        }
    },
    "clientVariables": {
        "NewUser": "https://dre.pt/dre/utilizador/registar",
        "PesquisaAvancada": "https://dre.pt/dre/pesquisa-avancada",
        "NIC": "",
        "UtilizadorPortalIdOld": "0",
        "Login": "https://dre.pt/dre/utilizador/entrar",
        "TotalResultados": 0,
        "Search": false,
        "DicionarioJuridicoId": "0",
        "FullHTMLURL_EN": "https://dre.pt/dre/en",
        "Name": "",
        "ShowResult": false,
        "EntityId_Filter": 0,
        "BookId_Filter": 0,
        "Email": "",
        "StartIndex": 0,
        "paginaJson": "",
        "Pesquisa": "",
        "CookiePath": "/dre/",
        "DataInicial_Filter": "1900-01-01",
        "DiarioRepublicaId": `${dbId}`,
        "Query_Filter": "",
        "UtilizadorPortalId": "0",
        "t": "",
        "Session_GUID": getSharedVariable("session_GUID"),
        "ActoLegislativoId_Filter": 0,
        "FullHTMLURL": "https://dre.pt/dre/home",
        "TipoDeUtilizador": "",
        "DataFinal_Filter": "1900-01-01",
        "GUID": "b1e32ecc-3a6e-44e0-a02e-07c5f0a433a8",
        "IsColecaoLegislacaoFilter": true
    }
};
let body = JSON.stringify(data);
        let method = "POST";
        let requestOptions = {method, body, headers: _headers};
        let requestURL = 'https://dre.pt/dre/screenservices/DRE/Legislacao_Conteudos/Conteudo_Detalhe/DataActionGetConteudo2';
        let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
        return responsePage;
    };


async function fetchURL({canonicalURL, headers}) {
    if (/https?:.*https?:/i.test(canonicalURL)) {
        console.error("Rejecting URL", canonicalURL, `returning [];`);
        return [];
    }
    const match = canonicalURL.match(/\?date=(\d{4}-\d{2}-\d{2})$/i);
  	const isActionLink = canonicalURL.match(/https:\/\/dre\.pt\/dre\/detalhe\/diario-republica\/(\d+)-(\d+)-(\d+)/)
    const isDataLink = canonicalURL.match(/https:\/\/dre.pt\/dre\/detalhe\/(.+)\/(\d+)-(\d+)-(\d+)/)
    if (match) {
        let date = match[1];
        return [await searchByDate({date, canonicalURL, headers})]
    } 
  	else if (isActionLink) {
      	let numero = isActionLink[1]
        let ano = isActionLink[2]
        let dbId = isActionLink[3]
        return [await getActionLinks({numero, ano, dbId, canonicalURL, headers})]      
    }
    else if (isDataLink) {
      	let tipo = isDataLink[1]
    	let numero = isDataLink[2]
        let ano = isDataLink[3]
        let dbId = isDataLink[4]
        return [await getContent({tipo, numero, ano, dbId, canonicalURL, headers})]  
    }
    else {
        return defaultFetchURL({canonicalURL, headers});
    }
}