# Localhost development

## Generate SSL certificates

```shell
openssl req -x509 -newkey rsa:4096 -keyout cert/key.pem -out cert/cert.pem -days 365 -nodes -subj '/CN=localhost'
```
