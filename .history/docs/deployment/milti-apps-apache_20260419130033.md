First, create the following files in the /etc/apache2/sites-available directory:

/etc/apache2/sites-available
- main.conf
- app1.conf
- tt-league.conf

main.conf:
```code
<VirtualHost *:80>
    ServerName 82.223.121.211

    Include /etc/apache2/sites-available/tt-league.conf
    Include /etc/apache2/sites-available/app1.conf

</VirtualHost>
```

app1.conf
```code
Alias /app1 /var/www/app1
<Directory /var/www/app1>
    Options -Indexes
    AllowOverride None
    Require all granted
    FallbackResource /app1/index.html
</Directory>
```

tt-league.conf:
```code
DocumentRoot /var/www/tt-league
<Directory /var/www/tt-league>
    Options -Indexes
    AllowOverride None
    Require all granted
    FallbackResource /index.html
</Directory>

# Exclude /trosfood from the SPA fallback
<Location /trosfood>
    FallbackResource disabled
</Location>

ProxyPreserveHost On
ProxyPass /api/ http://127.0.0.1:8080/api/
ProxyPassReverse /api/ http://127.0.0.1:8080/api/
ProxyPass /graphql http://127.0.0.1:8080/graphql
ProxyPassReverse /graphql http://127.0.0.1:8080/graphql
```

Then, enable the sites:
```bash
sudo a2ensite main.conf
sudo a2ensite app1.conf
sudo a2ensite tt-league.conf
```

Then, restart Apache:
```bash
sudo systemctl restart apache2
```