## Pulpman

Pulpman is an web based front end for pulp server with deployment pipeline in mind. It supports puppet and rpm repositories.

For example, a package is first uploaded/published to a dev repository and then deployed to qa and production etc. Pulpman gives you an web interface to facilitate this process.

The application is written with meteor, a javascript platform with react as UI. This is my first serious javascript based application.

It comes with authentication and authorization support through OpenID client interface and was tested with keycloak servers. Though not all aspects are configurable at the time.

On how to build and deploy the application, please refer meteor official documentation.


Some screenshots:

![Puppet modules](https://github.com/af6140/pulpman/blob/master/public/images/puppet_view.png "Puppet modules view")

![RPMs](https://github.com/af6140/pulpman/blob/master/public/images/rpm_view.png "RPMs view")


Enjoy!