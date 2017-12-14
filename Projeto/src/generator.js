// Variaveis globais
var isLogged = false;
var credentials = null;
var itens = null;
var current_playlist = null;

function initApp() {
    //checkLogin();

    hideAllcontents();
    $("#inicial").show();

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

        current_playlist["limit"] =  playlists[current_playlist.id].song_limit;

        console.log(current_playlist);

        addColaboracao();
    });

    $("#btn-voltar").on('click', function() {
        hideAllcontents();
        $("#listagem").show();
    });

    $("#submit-btn").on('click', function() {
        let input_name = $('#playlist-name');
        let input_description = $('#playlist-description');
        let input_song_limit = $('#song_limit');
        let input_max_collaborations = $('#max_collaborations');
        if(input_name.val() !== '' && input_description.val() !== '' && input_song_limit.val() !== '' && input_max_collaborations.val() !== '') {
            console.log("Creating playlist");
            getTopMusicFromCurrentUser();
        }
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

function show_playlist(index) {
    let playlist_id = getPlaylistIdByIndex(index);

    hideAllcontents();
    $("#showPlaylist").show();
    $("#playlist-title").html("Playlist " + playlists[playlist_id].name);

    //current_playlist

    set_current_playlist(playlists[playlist_id].id_owner, playlist_id, playlists[playlist_id].limit);
}

function getPlaylistIdByIndex(index) {
    let playlist_id = '';
    let i = 0;
    for (let p_id in playlists) {
        if(i === index){
            playlist_id = p_id;
        }
        i++;
    }
    return playlist_id;
}

function hideAllcontents() {
    $("#listagem").hide();
    $("#showPlaylist").hide();
    $("#createPlaylist").hide();
    $("#inicial").hide();
}

function set_current_playlist(user_id, playlist_id, limit) {
    function processGetCurrentPlaylistErro() {
        console.log("Não foi possivel pegar a playlist atual");
        //console.log(credentials.token);
        error("Não foi possivel pegar a playlist atual");
    }

    function processGetCurrentPlaylist(data) {
        //console.log(data);
        //(data.items);
        current_playlist = data;
        current_playlist["limit"] = limit;
        console.log(current_playlist.tracks.items);
        show_current_playlist(current_playlist.tracks.items, true);
    }

    var url = 'https://api.spotify.com/v1/users/'+ user_id +'/playlists/' + playlist_id;
    var params = {};
    callSpotify(url, params).then(processGetCurrentPlaylist, processGetCurrentPlaylistErro);
}

function show_current_playlist(tracks, intrack) {
    let itens = tracks;


    $("#playlist-content").empty();
    $("#playlist-content").append("<ol class>");

    for(let i = 0; i<itens.length; i++) {
        let uri = '';
        if(intrack) {
            uri = itens[i].track.uri;
        }
        else{
            uri = itens[i].uri;
        }
        $("#playlist-content").append('<li>' +
            '<iframe src="https://open.spotify.com/embed?uri=' + uri + '" width="300" height="80" frameborder="0" allowtransparency="true"></iframe>' +
            '</li>');
    }

    $("#playlist-content").append("</ol>");
}


function getTopMusicFromCurrentUser() {

    function processColaboracaoError() {
        console.log("Não foi possivel pegar os artistas tops");
        //console.log(credentials.token);
        error("Não foi possivel pegar os artistas tops");
    }

    function processTopArtits(data) {
        //console.log(data);
        itens = data.items;

        //console.log(itens);
        savePlaylist($("#playlist-name").val(), $("#playlist-description").val());
    }

    var url = 'https://api.spotify.com/v1/me/top/tracks';
    var params = {
        limit: $("#song_limit").val()
    };

    callSpotify(url, params).then(processTopArtits, processColaboracaoError);
}

function addColaboracao() {
    function processColaboracaoError() {
        console.log("Não foi possivel pegar os artistas tops");
        //console.log(credentials.token);
        error("Não foi possivel pegar os artistas tops");
    }

    function getMatchTracks(current_playlist_tracks, colaborate_playlist_tracks) {
        let return_array = [];
        let aux_colaborate_playlist_tracks = colaborate_playlist_tracks;
        let aux_current_playlist_tracks = current_playlist_tracks;

        for(let i = 0; i < current_playlist_tracks.length; i++) {
            for(let j = 0; j < colaborate_playlist_tracks.length; j++){
                if(current_playlist_tracks[i].id === colaborate_playlist_tracks[j].id){
                    return_array.push(colaborate_playlist_tracks[j]);

                    aux_colaborate_playlist_tracks = aux_colaborate_playlist_tracks.filter(item => item.id !== colaborate_playlist_tracks[j].id);
                    aux_current_playlist_tracks = aux_current_playlist_tracks.filter(item => item.id !== colaborate_playlist_tracks[j].id);
                }
            }
        }

        colaborate_playlist_tracks = aux_colaborate_playlist_tracks;
        current_playlist_tracks = aux_current_playlist_tracks;
        return return_array;
    }

    function fillNewPlaylist(new_playlist_tracks, current_playlist_tracks, colaborate_playlist_tracks, number) {
        let mostPops = sortTracksByPop(current_playlist_tracks.concat(colaborate_playlist_tracks));

        let j = 0;
        for(let i = mostPops.length-1; j<number; i--){
            new_playlist_tracks.push(mostPops[i]);
            j++;
        }

        console.log(new_playlist_tracks);
    }

    function sortTracksByPop(tracks) {
        return quickSort(tracks,0,tracks.length-1);
    }

    function processTopArtits(data) {
        //console.log(data.items);
        itens = data.items;
        let current_playlist_tracks = [];
        let colaborate_playlist_tracks = data.items;
        let new_playlist_tracks;


        for(let i = 0;i<current_playlist.tracks.items.length;i++) {
            current_playlist_tracks[i] = current_playlist.tracks.items[i].track;
        }

        console.log(current_playlist_tracks);
        console.log(colaborate_playlist_tracks);

        // Testa se removeu
        new_playlist_tracks = getMatchTracks(current_playlist_tracks,colaborate_playlist_tracks);

        console.log(new_playlist_tracks.length+" matchs entre a sua música e a playlist");

        fillNewPlaylist(new_playlist_tracks, current_playlist_tracks, colaborate_playlist_tracks, current_playlist.limit - new_playlist_tracks.length);

        //show_current_playlist(data.items, false);

        let tids = [];

        /*
        var uniqueTracks = [];
        $.each(new_playlist_tracks, function(i, el){
            if($.inArray(el, uniqueTracks) === -1) uniqueTracks.push(el);
        });
        console.log(uniqueTracks);
        */

        for(let j = 0; j < new_playlist_tracks.length ;j++){
            tids[j] = new_playlist_tracks[j].uri;
        }

        replaceTidsToPlaylist(current_playlist, tids);
    }

    let url = 'https://api.spotify.com/v1/me/top/tracks';
    let params = {
        limit: current_playlist.limit
    };
    callSpotify(url, params).then(processTopArtits, processColaboracaoError);
}

function quickSort(arr, left, right){
    var len = arr.length,
        pivot,
        partitionIndex;


    if(left < right){
        pivot = right;
        partitionIndex = partition(arr, pivot, left, right);

        //sort left and right
        quickSort(arr, left, partitionIndex - 1);
        quickSort(arr, partitionIndex + 1, right);
    }
    return arr;
}

function partition(arr, pivot, left, right){
    var pivotValue = arr[pivot].popularity,
        partitionIndex = left;

    for(var i = left; i < right; i++){
        if(arr[i].popularity < pivotValue){
            swap(arr, i, partitionIndex);
            partitionIndex++;
        }
    }
    swap(arr, right, partitionIndex);
    return partitionIndex;
}

function swap(arr, i, j){
    var temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
}

function show_all_playerlists() {
    let div_playlists = $(".list-playlists");
    div_playlists.empty();

    //console.log(playlists);

    let i = 0;
    for (let playlist_id in playlists) {
        console.log(playlists[playlist_id]);
        if(i%4 === 0) {
            div_playlists.append('<div class="row">');
        }
        if(playlists[playlist_id].finished) {
            div_playlists.append('<div class="col-md-3 playlist finalizada">' +
                '<p>' + playlists[playlist_id].name + '</p>' +
                '<button class="btn" id="playlist_'+ i +'"><i class="fa fa-users" aria-hidden="true"></i> colaborar </button>' +
                '</div>');
        } else {
            div_playlists.append('<div class="col-md-3 playlist">' +
                '<p><a href="' + playlists[playlist_id].uri + '" target="_blank">' + playlists[playlist_id].name + '</a></p>' +
                '<button class="btn" id="playlist_'+ i +'" onclick="show_playlist('+i+');"><i class="fa fa-users" aria-hidden="true"></i> colaborar </button>' +
                '</div>');
        }
        if(i !== 0 && i%4 === 0) {
            div_playlists.append('</div>');
        }
        i++;
    }
    div_playlists.append('</div>');
}

function createPlaylist() {
    hideAllcontents();
    $("#createPlaylist").show();
}

function savePlaylist(title, descricao) {
    if(itens === null) {
        console.log("Sem musicas para salvar na playlist");
        return;
    }


    let tids = [];

    for(let i = 0; i <= itens.length ;i++){
        if(itens[i] !== undefined) {
            console.log(itens[i]);
            tids.push(itens[i].uri);
        }
    }

    let url = "https://api.spotify.com/v1/users/" + credentials.user_id + "/playlists";
    let json = { name: title, description: descricao};

    postSpotify(url, json, function(ok, playlist) {
        if (ok) {
            saveTidsToPlaylist(playlist, tids);
        } else {
            console.log("Can't create the new playlist");
        }
    });
}

function saveTidsToPlaylist(playlist, tids) {
    let url = "https://api.spotify.com/v1/users/" + playlist.owner.id + "/playlists/" + playlist.id + '/tracks';

    postSpotify(url, {uris: tids}, function(ok, data) {
        if (ok) {
            console.log('Playlist salva: '+ playlist.uri);

            let data = {
                id: playlist.id,
                name : playlist.name,
                id_owner : playlist.owner.id,
                uri: playlist.uri,
                song_limit : $('#song_limit').val(),
                collaborations : 0,
                max_collaborations : $('#max_collaborations').val(),
                finished : false
            };

            $.ajax({
                type : 'POST',
                url  : 'src/bd_communication.php',
                data : data,
                success :  function(response) {
                    console.log(response);
                    hideAllcontents();
                    $("#listagem").show();
                    show_all_playerlists();
                }
            });

        } else {
            console.log("Deu problema para salvar a playlist");
        }
    });
}

function replaceTidsToPlaylist(playlist, tids) {
    console.log(playlist);
    console.log(tids);
    let url = "https://api.spotify.com/v1/users/" + playlist.owner.id + "/playlists/" + playlist.id + '/tracks';

    putSpotify(url, {uris: tids}, function(ok, data) {
        if (ok) {
            console.log('Playlist atualizada: '+ playlist.uri);
            set_current_playlist(current_playlist.owner.id,current_playlist.id,current_playlist.limit);
        } else {
            console.log("Deu problema para salvar a playlist");
        }
    });
}

function logout() {
    // TODO logout
    hideAllcontents();
    $("#inicial").show();
}

function login() {
    var client_id = '73b2df5bfdb1444ab0186e0a165aca81';
    //var redirect_uri = 'http://localhost:4200/index.php';
    var redirect_uri = 'http://localhost:4200/index.html';
    var scopes = 'user-top-read playlist-modify-public';//playlist-modify-public';

    var url = 'https://accounts.spotify.com/authorize?client_id=' + client_id +
        '&response_type=token' +
        '&scope=' + encodeURIComponent(scopes) +
        '&redirect_uri=' + encodeURIComponent(redirect_uri);

    document.location = url;
}

function getTime() {
    return Math.round(new Date().getTime() / 1000);
}

function postSpotify(url, json, callback) {
    $.ajax(url, {
        type: "POST",
        data: JSON.stringify(json),
        dataType: 'json',
        headers: {
            'Authorization': 'Bearer ' + credentials.token,
            'Content-Type': 'application/json'
        },
        success: function(r) {
            callback(true, r);
        },
        error: function(r) {
            // 2XX status codes are good, but some have no
            // response data which triggers the error handler
            // convert it to goodness.
            if (r.status >= 200 && r.status < 300) {
                callback(true, r);
            } else {
                callback(false, r);
            }
        }
    });
}

function putSpotify(url, json, callback) {
    $.ajax(url, {
        type: "PUT",
        data: JSON.stringify(json),
        dataType: 'json',
        headers: {
            'Authorization': 'Bearer ' + credentials.token,
            'Content-Type': 'application/json'
        },
        success: function(r) {
            callback(true, r);
        },
        error: function(r) {
            // 2XX status codes are good, but some have no
            // response data which triggers the error handler
            // convert it to goodness.
            if (r.status >= 200 && r.status < 300) {
                callback(true, r);
            } else {
                callback(false, r);
            }
        }
    });
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