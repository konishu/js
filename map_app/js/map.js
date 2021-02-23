var map;
var oMarkers = [];

// let map;
// 中心を変えたいならここをいじる
function initMap() {
    // var mapcenter = { lat: 35.0305, lng: 135.7846 };//農学研究科総合館
    var mapcenter = { lat: 34.73554, lng: 135.840465 };//木津農場
    map = new google.maps.Map(document.getElementById('map'), {
        center: mapcenter,
        zoom: 20,
        mapTypeId: "satellite",
    });

    // This event listener will call addMarker() when the map is clicked.
    map.addListener('click', function (event) {
        addMarker(event.latLng);
    });
    map.setTilt(0);

}

// function initMap() {
//   map = new google.maps.Map(document.getElementById("map"), {
//     center: { lat: 35.0305, lng: 135.7846 },
//     zoom: 18,
//     mapTypeId: "satellite",
//   });
//   // This event listener will call addMarker() when the map is clicked.
//   map.addListener('click', function (event) {
//     addMarker(event.latLng);
//   });
//   map.setTilt(0);
// }

// Adds a marker to the map and push to the array.
function addMarker(location) {
    var marker = new google.maps.Marker({
        position: location,
        map: map
    });
    oMarkers.push(marker);
}

// Sets the map on all markers in the array.
function setMapOnAll(map) {
    for (var i = 0; i < oMarkers.length; i++) {
        oMarkers[i].setMap(map);
    }
}
// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
    setMapOnAll(null);
}

// Shows any markers currently in the array.
function showMarkers() {
    setMapOnAll(map);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
    clearMarkers();
    oMarkers = [];
}
//static map を作成
var latG = []; var lngG = [];
var xG = []; yG = [];
function Gstaticmap() {
    var clat, clng
    clat = map.getCenter().lat();
    clng = map.getCenter().lng();
    var htmltxt = '<html>平面直角座標系 ' + $("#zkei").val() + '系 <br>';
    if (oMarkers.length == 0) {
        var urL = 'https://maps.googleapis.com/maps/api/staticmap?' +
            'center=' + clat + ',' + clng + '&' +
            'zoom=' + map.getZoom() + '&' +
            'size=' + '640x640' + '&' +
            'scale=2' + '&' +
            'maptype=satellite' + '&';
        //urL += 'sensor=false';
        urL += '&key=AIzaSyAS43w4wzGlY2nTWfnfwTp8rJKNsOuz5qc';

    } else {
        //showfitMap(oMarkers);
        //var setzoom=map.getZoom()
        //map.setZoom(setzoom)
        //static map のurl作成
        var urL = 'https://maps.googleapis.com/maps/api/staticmap?' +
            'center=' + clat + ',' + clng + '&' +
            'zoom=' + map.getZoom() + '&' +
            'size=' + '640x640' + '&' +
            'scale=2' + '&' +
            'maptype=satellite' + '&';

        for (var i = 0; i < oMarkers.length; i++) {
            var i_ = i + 1;
            urL += 'markers=color:yellow%7Clabel:' + i_ + '|' + oMarkers[i].getPosition().lat() + ',' + oMarkers[i].getPosition().lng() + '&';
        };
        //urL += 'sensor=false';
        urL += '&key=AIzaSyAS43w4wzGlY2nTWfnfwTp8rJKNsOuz5qc';

        for (var k = 0; k < oMarkers.length; k++) {
            latG[k] = oMarkers[k].getPosition().lat();
            lngG[k] = oMarkers[k].getPosition().lng();
            doCalcBl2xy(latG[k], lngG[k]);
            xG[k] = new Number(Xout).toFixed(3);
            yG[k] = new Number(Yout).toFixed(3);
            htmltxt += 'マーカー' + k + ' X=' + xG[k] + '(' + latG[k] + ')' + ' Y=' + yG[k] + '(' + lngG[k] + ')' + '<br><br>';
        };


    };
    var zoom = map.getZoom();//取得した画像のズームレベル
    const imgXpx = imgYpx = 640  // imgXpx,imgYpx;取得した画像のピクセルサイズ, x座標方向,y座標方向
    //clat,clng;取得した画像の中心経緯度
    //Google Static Mapsで取得した画像の4辺の経緯度情報を取得する

    img_min_lng = (180 / Math.pow(2, zoom + 7)) * ((imgXpx / 2) * -1) + clng;
    img_min_lat = (180 / Math.PI) * Math.asin(Math.tanh((Math.PI / Math.pow(2, zoom + 7)) * ((imgYpx / 2) * -1) + meaAtanh(Math.sin((Math.PI / 180) * clat))));
    img_max_lng = (180 / Math.pow(2, zoom + 7)) * (imgXpx / 2) + clng;
    img_max_lat = (180 / Math.PI) * Math.asin(Math.tanh((Math.PI / Math.pow(2, zoom + 7)) * (imgYpx / 2) + meaAtanh(Math.sin((Math.PI / 180) * clat))));
    doCalcBl2xy(img_min_lat, img_min_lng);
    img_min_X = new Number(Xout).toFixed(3);
    img_min_Y = new Number(Yout).toFixed(3);
    doCalcBl2xy(img_max_lat, img_max_lng);
    img_max_X = new Number(Xout).toFixed(3);
    img_max_Y = new Number(Yout).toFixed(3);

    function meaAtanh(x) {
        return 0.5 * Math.log((1.0 + x) / (1.0 - x));
    }

    htmltxt += '左下X =' + img_min_X + '  左下Y =' + img_min_Y + '<br>';
    htmltxt += '右上X =' + img_max_X + '  右上Y =' + img_max_Y + '<br>';
    htmltxt += '<input type="button" id="btnsim" value="simファイル作成" onclick="opener.cutsimG()" /><br><br>';
    //表示用html作成
    htmltxt += '<image src = "' + urL + '">';
    htmltxt += '</html>';
    var Winimage = window.open('sample.html', '   ', 'width=500,height=500,menubar=yes,toolbar=yes,scrollbars=yes,dependent=yes');
    // var Winimage = window.open('Winimage.html', '   ', 'width=500,height=500,menubar=yes,toolbar=yes,scrollbars=yes,dependent=yes');
    Winimage.document.open();
    Winimage.document.write(htmltxt);
    Winimage.document.close();
    Winimage.focus()
    //Winimage.location.href = urL



};

function cutsimG() {
    //simファイル作成 google用
    var datasima = "", k, kk;
    datasima += "marker," + "latitude," + "longnitude," + "\n";
    for (k = 0; k < oMarkers.length; k++) {
        kk = k + 1
        datasima += kk + "," + xG[k] + "," + yG[k] + ",," + "\n";
    };
    if (!kk) { kk = 0 };
    // kk += 1
    // datasima += "A01," + kk + ",DL," + img_min_X + "," + img_min_Y + ",," + "\n";
    // kk += 1
    // datasima += "A01," + kk + ",UR," + img_max_X + "," + img_max_Y + ",," + "\n";
    // datasima += "A99,";
    //Blobにテキストを追加する
    var blob = new Blob([datasima]);
    saveAs(blob, "描画したマーカーの座標値.csv")
};
// function cutsimG() {
//     //simファイル作成 google用
//     var datasima = "", k, kk;
//     datasima += "G00,03,," + "\n";
//     datasima += "Z00,," + "\n";
//     datasima += "Z01,0," + "\n";
//     datasima += "A00," + "\n";
//     for (k = 0; k < oMarkers.length; k++) {
//         kk = k + 1
//         datasima += "A01," + kk + "," + k + "," + xG[k] + "," + yG[k] + ",," + "\n";
//     };
//     if (!kk) { kk = 0 };
//     kk += 1
//     datasima += "A01," + kk + ",DL," + img_min_X + "," + img_min_Y + ",," + "\n";
//     kk += 1
//     datasima += "A01," + kk + ",UR," + img_max_X + "," + img_max_Y + ",," + "\n";
//     datasima += "A99,";
//     //Blobにテキストを追加する
//     var blob = new Blob([datasima]);
//     saveAs(blob, "描画したマーカーの座標値.csv")
// };

function showfitMap(Markers) {
    var ll1;
    var latlngs1 = [];
    // 境界の設定	
    var bounds1 = new google.maps.LatLngBounds();

    for (i = 0; i < Markers.length; i++) {
        if (Markers[i].visible == true) {
            ll1 = new google.maps.LatLng(Markers[i].getPosition().lat(), Markers[i].getPosition().lng());
            latlngs1.push(ll1);
            bounds1.extend(ll1);
        };
    };
    map.fitBounds(bounds1);
};
