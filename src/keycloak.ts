import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://localhost:8080',

  realm: 'pipeline',

  clientId: 'pipeline-api',
});

export default keycloak;