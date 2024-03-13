#!/usr/bin/env sh

MY_UID="$(id -u)"

if [ "${MY_UID}" -eq "0" ]; then

    UID=$(stat -c "%u" $(pwd))
    GID=$(stat -c "%g" $(pwd))

    if [ "$UID" -eq "0" ]; then
        npm run dev
    else
        addgroup typo3 --gid=$GID;
        adduser -h $(pwd) -D -G typo3 --uid=$UID typo3;

        echo "#!/usr/bin/env sh" > /usr/local/bin/invocation.sh
        echo >> /usr/local/bin/invocation.sh
        chmod a+x /usr/local/bin/invocation.sh
        
        su - typo3 -c "/usr/local/bin/invocation.sh"
    fi
else
    npm run dev
fi
        