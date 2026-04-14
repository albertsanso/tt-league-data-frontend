
# Build React app locally
```bash
npm run build
```
This will create a `dist` directory with the built app.
- dist/index.html
- dist/assets/*

# Deploy React app to production
Copy the build output to the production server to ```/var/www/tt-league```

# Enable required Apache modules
```bash
sudo a2enmod rewrite
sudo a2enmod proxy_wss
```

and add a WebSocket proxy to the config file (If needed)
```apache
RewriteEngine On
RewriteCond %{HTTP:Upgrade} websocket [NC]
RewriteCond %{HTTP:Connection} upgrade [NC]
RewriteRule ^/graphql(.*)$ ws://127.0.0.1:8080/graphql$1 [P,L]
```

# Restart Apache
```bash
sudo systemctl restart apache2
```

# Place the config file for the app in ```/etc/apache2/sites-available/tt-league.conf```
```apache
<VirtualHost *:80>
    ServerName tt-league.example.com
    ServerAdmin webmaster@example.com
    DocumentRoot /var/www/tt-league
    <Directory /var/www/tt-league>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

        # Reverse proxy: forward /api/* and /graphql requests to your backend
    ProxyPreserveHost On
    ProxyPass /api/ http://127.0.0.1:8080/api/
    ProxyPassReverse /api/ http://127.0.0.1:8080/api/

    ProxyPass /graphql/ http://127.0.0.1:8080/graphql/
    ProxyPassReverse /graphql/ http://127.0.0.1:8080/graphql/
</VirtualHost>
```

Then enable the config file

```bash
sudo a2ensite tt-league.conf

sudo a2dissite 000-default   # remove the default if you don't need it
```

# Restart Apache
```bash
sudo systemctl reload apache2
```

# Test the app
```bash