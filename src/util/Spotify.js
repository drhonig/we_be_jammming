let accessToken;

const Spotify = {
    
    getAccessToken() {
        if (accessToken) {
            return accessToken;
        }

        const urlAccessToken = window.location.href.match(/access_token=([^&]*)/);
        const urlExpiresIn = window.location.href.match(/expires_in=([^&]*)/);

        if (urlAccessToken && urlExpiresIn) {
            accessToken = urlAccessToken[1];
            let expiresIn = urlExpiresIn[1];
            window.setTimeout(() => accessToken = '', expiresIn * 1000);
            window.history.pushState('Access Token', null, '/');
            return accessToken;
        } else {
            const accessURL = `https://accounts.spotify.com/authorize?client_id=${process.env.REACT_APP_CLIENT_ID}&response_type=token&scope=playlist-modify-public&redirect_uri=${process.env.REACT_APP_REDIRECT_URI}`;
            window.location = accessURL;
        }
    },

    search(term) {
        const accessToken = Spotify.getAccessToken();
        return fetch(
            `https://api.spotify.com/v1/search?type=track&q=${term}`, 
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        ).then(
            response => {
                if (response.ok) {
                    return response.json();
                } else {
                    console.log('API request failed');
                }
            }
        ).then(
            jsonResponse => {
                if(!jsonResponse.tracks) {
                    return [];
                }
                return jsonResponse.tracks.items.map(track => ({
                    id: track.id,
                    name: track.name,
                    artist: track.artists[0].name,
                    album: track.album.name,
                    URI: track.uri
                }));
            }
        );
    },

    savePlaylist(playlistName, trackURIs) {
        if (!playlistName || (trackURIs.length === 0)) {
            return;
        }
        const accessToken = Spotify.getAccessToken();
        let headers = {
            Authorization: `Bearer ${accessToken}`
        };
        let userID;


        return fetch('https://api.spotify.com/v1/me',{
            headers: headers
        }).then(
            response => {
                if (response.ok) {
                    return response.json();
                }
        }).then(
            jsonResponse => {
                userID = jsonResponse.id;

                return fetch(`https://api.spotify.com/v1/users/${userID}/playlists`, {
                    headers: headers,
                    method: 'POST',
                    body: JSON.stringify({ name: playlistName })
                }).then(
                    response => {
                        if (response.ok) {
                            return response.json();
                        } else {
                            console.log('API request failed');
                        }
                    }
                ).then(
                    jsonResponse => {
                        const playlistID = jsonResponse.id;
                        console.log("playlist created response", jsonResponse);
                        console.log("tracks", trackURIs);
                        console.log("JSON tracks", JSON.stringify({ uris: trackURIs }));


                        return fetch(`https://api.spotify.com/v1/playlists/${playlistID}/tracks`, {
                            headers: headers,
                            method: 'POST', 
                            body: JSON.stringify({ uris: trackURIs })
                        });
                    }
                );
            }
        );
    }
}


export default Spotify;