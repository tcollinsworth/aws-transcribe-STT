keytool -import -noprompt -trustcacerts \
-alias localhost \
-file /home/FIXME/https-cert/server.crt \
-keystore /home/FIXME/java/jdk/jre/lib/security/cacerts \
-storepass changeit
