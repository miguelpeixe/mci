# Visualização da Cultura Independente

Visualização de eventos cadastrados no [Mapas Culturais](https://github.com/hacklabr/mapasculturais), desenvolvido para a plataforma [SP Cultura](http://spcultura.prefeitura.sp.gov.br/) da [Secretaria Municipal de Cultura de São Paulo](http://www.prefeitura.sp.gov.br/cidade/secretarias/cultura/).

Projeto desenvolvido para o [Mês da Cultura Independente](http://culturaindependente.org/).

---

## Recursos

 - Visualização de eventos a partir de um projeto
 - Interface adaptada a partir de geolocalização
 - Filtros por data, linguagem, espaço e busca textual
 - [Sistema *Na rede*](#configurando-o-na-rede) indexa participação multimídia nas redes sociais
 - [Notícias conectadas](#configurando-as-not%C3%ADcias) a um blog WordPress, com busca e suporte a imagem destacada

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

Para alterar a URL da api (padrão é `http://spcultura.prefeitura.sp.gov.br/api`) ou o ID do projeto a ser visualizado altere as seguintes variáveis de ambiente:

```
$ export MCI_API_URL=<NOVA URL>
$ export MCI_PROJECT_ID=<NOVO ID>
```

E rode novamente:

```
$ npm start
```

Você pode também alterar as variáveis com um arquivo `.env`, seguindo o [exemplo](.env.example)

### Configurando o *Na rede*

*Na rede* é um sistema para indexar conteúdo multimídia publicados no **YouTube**, **Instagram** e **Flickr**.

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

### Configurando as notícias

Você deve instalar e ativar o plugin [WP REST API](https://wordpress.org/plugins/json-rest-api/) para que o sistema possa fazer requisições à base de dados do seu WordPress.

Agora definimos a url do blog:
```
$ export MCI_WP_URL=http://exemplo.com/wordpress
```

Reinicie o servidor.

## Deploy

Em breve.