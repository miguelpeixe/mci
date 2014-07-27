# Visualização da Cultura Independente

Projeto de visualização de eventos cadastrados no [Mapas Culturais](https://github.com/hacklabr/mapasculturais).

Criado para o Mês da Cultura Independente.

---

## Pré-requisitos

 - npm 1.4.x
 - node 0.10.x

## Instalação

Clone a aplicação:

```
$ git clone https://github.com/miguelpeixe/mci.git
```

Instale digitando:

```
$ npm install
```

Rode o servidor digitando:

```
$ npm start
```

Agora acesse: [http://localhost:8000](http://localhost:8000)

## Configuração

### Configuração básica

Para alterar a URL da api (padrão é `http://mapasculturais.hacklab.com.br/api`) ou o ID do projeto a ser visualizado altere as seguintes variáveis de ambiente:

```
$ export MCI_API_URL=<NOVA URL>
$ export MCI_PROJECT_ID=<NOVO ID>
```

E rode novamente:

```
$ npm start
```

Você pode também alterar as variáveis com um arquivo `.env`, seguindo o [exemplo](https://github.com/miguelpeixe/mci/blob/master/.env.example)

### Configurando o "Na rede"

Na rede é um sistema para indexar conteúdo multimídia publicados no YouTube, Instagram e Flickr.

Primeiro, você deve definir as chaves de API:

#### Instagram [(obtenha sua chave aqui)](http://instagram.com/developer/)

```
$ export MCI_INSTAGRAM_CLIENT_ID=<CHAVE>
```

#### Flickr [(obtenha sua chave aqui)](https://www.flickr.com/services/api/misc.api_keys.html)

```
$ export MCI_FLICKR_API_KEY=<CHAVE>
```

Agora podemos definir a hashtag:
```
$ export MCI_HASHTAG=<SUA BUSCA>
```

Para concluir as alterações, reinicie o servidor.