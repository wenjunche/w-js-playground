# HTTPS stuff

## Create server certificate
1. openssl req -x509 -days 365 -nodes -sha256 -newkey rsa:4096 -keyout server-key.pem -out server-crt.pem

## Create client certificate
1. openssl req -x509 -days 365 -nodes -sha256 -newkey rsa:4096 -keyout client-key.pem -out client-crt.pem

2. curl -v -k -E client-crt.pem --key client-key.pem  https://localhost:8443

## Import client certifcate to Windows (Windows 10)
1. openssl pkcs12 -export -nodes -inkey client-key.pem -in client-crt.pem -out client-crt.p12 -passout pass:testclient

2. open p12 in File Explorer

3. verify in Manage User Certificate->Personal->Certificates

## Resources
1. https://github.com/bmancini55/node-tls/