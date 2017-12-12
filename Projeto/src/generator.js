// Variaveis globais
var isLogged = false;
var credentials = null;

function initApp() {
    //checkLogin();

    hideAllcontents();
    $("#inicial").show();

    showIF("#login-form",!isLogged);
    showIF("#verPlaylists",isLogged);

    $("#login").on().on('click', function() {
        login();
    });

    $("#verPlaylists").on('click', function() {
        $("#inicial").hide();
        $("#listagem").show();
    });

    $("#sair").on('click', function() {
        logout();
    });

    $("#criar").on('click', function() {
        createPlaylist();
    });

    $("#cancelar").on('click', function() {
        hideAllcontents();
        $("#listagem").show();
    });

    $("#colaborar").on('click', function() {
        addColaboracao();
    });
}

function hideAllcontents() {
    $("#listagem").hide();
    $("#showPlaylist").hide();
    $("#createPlaylist").hide();
    $("#inicial").hide();
}


function addColaboracao() {
    function processColaboracaoError() {
        console.log("Não foi possivel pegar os artistas tops");
        //console.log(credentials.token);
        error("Não foi possivel pegar os artistas tops");
    }

    function processTopArtits(data) {
        //console.log(data.items);

        console.log(credentials.user_id);
        var itens = data.items;

        $("#teste-content").empty();
        $("#teste-content").append("<ul>");


        console.log(itens);

        for(let i = 0; i<itens.length; i++) {
            $("#teste-content").append("<li><a href="+ itens[i].external_urls.spotify +">"+ itens[i].name+"</a></li>");
        }

        $("#teste-content").append("</ul>");

        //$("#teste-content").text(data);
    }

    var url = 'https://api.spotify.com/v1/me/top/artists';
    var params = {
        limit:10
    };
    callSpotify(url, params).then(processTopArtits, processColaboracaoError);
}

function createPlaylist() {
    hideAllcontents();
    $("#createPlaylist").show();
    // TODO criar playlist
}

function logout() {
    // TODO logout
    hideAllcontents();
    $("#inicial").show();
}

function login() {
    var client_id = '73b2df5bfdb1444ab0186e0a165aca81';
    //var redirect_uri = 'http://localhost:4200/index.html';
    var redirect_uri = 'http://localhost:4200/index.html';
    var scopes = 'user-top-read';//playlist-modify-public';

    var url = 'https://accounts.spotify.com/authorize?client_id=' + client_id +
        '&response_type=token' +
        '&scope=' + encodeURIComponent(scopes) +
        '&redirect_uri=' + encodeURIComponent(redirect_uri);

    console.log(url);

    document.location = url;
}

function getTime() {
    return Math.round(new Date().getTime() / 1000);
}

function performAuthDance() {
    // if we already have a token and it hasn't expired, use it,
    if ('credentials' in localStorage) {
        credentials = JSON.parse(localStorage.credentials);
    }

    if (credentials && credentials.expires > getTime()) {
        hideAllcontents();
        $("#listagem").show();
    } else {
        // we have a token as a hash parameter in the url
        // so parse hash
        var hash = location.hash.replace(/#/g, '');
        var all = hash.split('&');
        var args = {};

        all.forEach(function(keyvalue) {
            var idx = keyvalue.indexOf('=');
            var key = keyvalue.substring(0, idx);
            var val = keyvalue.substring(idx + 1);
            args[key] = val;
        });

        if (typeof(args['access_token']) != 'undefined') {
            var g_access_token = args['access_token'];
            var expiresAt = getTime() + 3600;

            if (typeof(args['expires_in']) != 'undefined') {
                var expires = parseInt(args['expires_in']);
                expiresAt = expires + getTime();
            }

            credentials = {
                token:g_access_token,
                expires:expiresAt
            }

            callSpotify('https://api.spotify.com/v1/me').then(
                function(user) {
                    credentials.user_id = user.id;
                    localStorage['credentials'] = JSON.stringify(credentials);
                    location.hash = '';
                    hideAllcontents();
                    $("#listagem").show();
                },
                function() {
                    error("Can't get user info");
                }
            );
        } else {
            // otherwise, got to spotify to get auth
            $("#login-form").show();
        }
    }
}

function showIF(seletor, condicao) {
    if(condicao){
        $(seletor).show();
    }
    else {
        $(seletor).hide();
    }
}

function callSpotify(url, data) {
    return $.ajax(url, {
        dataType: 'json',
        data: data,
        headers: {
            'Authorization': 'Bearer ' + credentials.token
        }
    });
}

function error(s) {
    $("#erro").text(s);
}

$(document).ready(
    function() {
        initApp();
        performAuthDance();
    }
);