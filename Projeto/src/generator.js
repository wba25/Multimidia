// Variaveis globais
var isLogged = false;
var credentials = null;

function initApp() {
    //checkLogin();

    hideAllcontents();
    $("#inicial").show();
    $("#playlist-title").html("Playlist "+playlist.name);

    showIF("#login-form",!isLogged);
    showIF("#verPlaylists",isLogged);

    $("#login").on().on('click', function() {
        login();
    });

    $("#showPlaylistsBtn").on('click', function() {
        $("#inicial").hide();
        $("#listagem").show();
        show_all_playerlists();
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

    $("#btn-voltar").on('click', function() {
        hideAllcontents();
        $("#listagem").show();
    });

    /*
    for(let i = 0; i < playlists.length; i++) {
        $("#playlist_"+i).on('click', function() {
            console.log("clikou!");
            show_playlist(i);
        });
    }
    */
}

function show_playlist(id) {
    hideAllcontents();
    $("#showPlaylist").show();
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

        $("#playlist-content").empty();
        $("#playlist-content").append("<ol class>");


        console.log(itens);

        for(let i = 0; i<itens.length; i++) {
            $("#playlist-content").append('<li>' +
                '<iframe src="https://open.spotify.com/embed?uri=' + itens[i].uri + '" width="300" height="80" frameborder="0" allowtransparency="true"></iframe>' +
                '</li>');
        }

        $("#playlist-content").append("</ol>");

        //$("#teste-content").text(data);
    }

    var url = 'https://api.spotify.com/v1/me/top/tracks';
    var params = {
        limit:playlist.limit
    };
    callSpotify(url, params).then(processTopArtits, processColaboracaoError);
}

function show_all_playerlists() {
    let div_playlists = $(".list-playlists");
    div_playlists.empty();
    console.log("opa");
    for(let i = 0; i < playlists.length; i++) {
        if(i%4 === 0) {
            div_playlists.append('<div class="row">');
        }
        if(playlists[i].finished) {
            div_playlists.append('<div class="col-md-3 playlist finalizada">' +
                '<p>' + playlists[i].name + '</p>' +
                '<button class="btn" id="playlist_'+ i +'"><i class="fa fa-users" aria-hidden="true"></i> colaborar </button>' +
                '</div>');
        } else {
            div_playlists.append('<div class="col-md-3 playlist">' +
                '<p>' + playlists[i].name + '</p>' +
                '<button class="btn" id="playlist_'+ i +'" onclick="show_playlist('+playlists[i].id+');"><i class="fa fa-users" aria-hidden="true"></i> colaborar </button>' +
                '</div>');
        }
        if(i !== 0 && i%4 === 0) {
            div_playlists.append('</div>');
        }
    }
    div_playlists.append('</div>');
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
        $("#inicial").show();
        isLogged = true;
        //$("#listagem").show();
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
                    $("#inicial").show();
                    isLogged = true;
                    //$("#listagem").show();
                },
                function() {
                    error("Can't get user info");
                }
            );
        } else {
            // otherwise, got to spotify to get auth
            //$("#login-form").show();
            isLogged = false;
        }
    }

    showIF("#login-form",!isLogged);
    showIF("#verPlaylists",isLogged);
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