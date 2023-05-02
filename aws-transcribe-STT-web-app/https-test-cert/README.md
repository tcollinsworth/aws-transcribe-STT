Ubuntu 14.04 LTS+

https://medium.freecodecamp.org/how-to-get-https-working-on-your-local-development-environment-in-5-minutes-7af615770eec

# NOT FIPS error:060800C8:digital envelope routines:EVP_DigestInit_ex:disabled for FIPS
# openssl genrsa -des3 -out rootCA.key 2048
# below works on FIPS enabled Ubuntu 18.04
openssl genpkey -algorithm RSA -out rootCA.key -pkeyopt rsa_keygen_bits:2048
passphrase changeit
openssl req -x509 -new -nodes -key rootCA.key -sha256 -days 1024 -out rootCA.pem

Install in ubuntu - this may not actually be necessary, possibly only install in chrome browser
$ sudo cp rootCA.pem /usr/local/share/ca-certificates/
$ sudo update-ca-certificates

Import CA cert in browser
chrome://settings
find Manage certificates
Under Privacy and security -> Security -> Manage certificates
OR chrome://settings/certificates
Authorities : Import
select the rootCA.pem and import, check the trust checkbox

create file server.csr.cnf
#=======================
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn

[dn]
C=US
ST=New York
L=Rochester
O=TroyCollinsworth
OU=test
emailAddress=troycollinsworth@gmail.com
CN = localhost
#=======================

create file v3.ext
#=======================
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
#=======================

openssl req -new -sha256 -nodes -out server.csr -newkey rsa:2048 -keyout server.key -config <( cat server.csr.cnf )

openssl x509 -req -in server.csr -CA rootCA.pem -CAkey rootCA.key -CAcreateserial -out server.crt -days 500 -sha256 -extfile v3.ext

rootCA password is changeit

Update node express config to use new key and crt files
https://timonweb.com/posts/running-expressjs-server-over-https/
const httpsServer = https.createServer({
  key: fs.readFileSync('/home/.../https-cert/server.key'),
  cert: fs.readFileSync('/home/.../https-cert/server.crt'),
  ...
