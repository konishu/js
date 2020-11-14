/*
function　doCalcBl2xy(B,L)　は、国土地理院長の承認を得て、同院の技術資料Ｈ１－Ｎｏ．２「測地成果２０００のための座標変換ソフトウェア TKY2JGD 」の計算ルーチンを利用し作成したものです。（承認番号　国地企調第３７０号　平成２４年３月７日） この部分の著作権は国土地理院にあります。無断で改変しないでください。
  世界測地系（測地成果 2000 、または　測地成 2011）専用です。旧日本測地系では正しい位置に表示されません。また、地震等による地殻変動が生じた地域等で、必要としている精度を確保できない場合があることをご了承ください。
*/
function doCalcBl2xy(B, L) {
    // Ver.1.3  1999/10/19  (C) Mikio TOBITA 飛田幹男，国土地理院
    // 緯度,経度(deg)を平面直角座標X,Y0に換算します。
    // 「精密測地網一次基準点測量計算式」を導入し多くの項を採用。
    //  EP    : 楕円体のパラメータ入り構造体
    //  X     : 平面直角座標値，原点での北向き成分(meter)
    //  Y0    : 平面直角座標値，原点での東向き成分(meter) yahoomap　api　コンストラクタＹとの混同防止
    // Ellip12=1: Bessel楕円体
    // Ellip12=2: GRS80楕円体

    var EP2a = 6378137;
    var EP2f1 = 298.257222101;
    var EP2namec = "GRS-80";
    var EP2f = 1 / EP2f1;
    var EP2e = (2 * EP2f1 - 1) / EP2f1 / EP2f1;


    var Kei, M0;   //系番号，基準子午線の縮尺係数 ex.0.9999(X,Y0), 0.9996(UTM)
    var cB1, cL1; //原点の緯度，経度。c = combo box
    var B1, L1;     //原点の緯度，経度。基本的にradian
    var rad2deg = 57.2957795130823;    /*'ラジアンを度にするため掛ける数*/
    var deg2rad = 1.74532925199433E-02;/*'度をラジアンにするため掛ける数*/
    var D, AM, S, SN, SNS;
    //求められる平面直角座標X,Y0
    var Gamma;               //=γ 子午線収差角。radian
    var Gammadeg;            //真北方向角。deg
    var MMM;                 //縮尺係数

    //この計算は変換の第３段階なので緯度経度入力値のﾁｪｯｸは不要

    //基準子午線の縮尺係数
    M0 = 0.9999;

    //入力
    //GRS80楕円体なら   J:JGD2000

    //degからradianへ換算
    B = B * deg2rad //'変換したい緯度(rad);
    L = L * deg2rad //'変換したい経度(rad);

    //'コンボボックスから座標系，座標系原点緯度，経度(in DMS format)の読み取り

    Kei = document.getElementById('zkei').value;
    //平面直角座標系原点の設定 in dddmmss.ss
    if (Kei == 1) {
        cB1 = 330000;
        cL1 = 1293000;
    } else if (Kei == 2) {
        cB1 = 330000;
        cL1 = 1310000;
    } else if (Kei == 3) {
        cB1 = 360000;
        cL1 = 1321000;
    } else if (Kei == 4) {
        cB1 = 330000;
        cL1 = 1333000;
    } else if (Kei == 5) {
        cB1 = 360000;
        cL1 = 1342000;
    } else if (Kei == 6) {
        cB1 = 360000;
        cL1 = 1360000;
    } else if (Kei == 7) {
        cB1 = 360000;
        cL1 = 1371000;
    } else if (Kei == 8) {
        cB1 = 360000;
        cL1 = 1383000;
    } else if (Kei == 9) {
        cB1 = 360000;
        cL1 = 1395000;
    } else if (Kei == 10) {
        cB1 = 400000;
        cL1 = 1405000;
    } else if (Kei == 11) {
        cB1 = 440000;
        cL1 = 1401500;
    } else if (Kei == 12) {
        cB1 = 440000;
        cL1 = 1421500;
    } else if (Kei == 13) {
        cB1 = 440000;
        cL1 = 1441500;
    } else if (Kei == 14) {
        cB1 = 260000;
        cL1 = 1420000;
    } else if (Kei == 15) {
        cB1 = 260000;
        cL1 = 1273000;
    } else if (Kei == 16) {
        cB1 = 260000;
        cL1 = 1240000;
    } else if (Kei == 17) {
        cB1 = 260000;
        cL1 = 1310000;
    } else if (Kei == 18) {
        cB1 = 200000;
        cL1 = 1360000;
    } else if (Kei == 19) {
        cB1 = 260000;
        cL1 = 1540000;
    };



    deg = dms2deg(cB1);
    B1 = deg * deg2rad;
    deg = dms2deg(cL1);
    L1 = deg * deg2rad;
    //alert("B1=" + B1 +"    L1=" + L1);


    //'本計算 EP(1)はBessel楕円体，EP(2)はGRS-80楕円体;
    //'True：楕円体，座標系に関わる変数の計算を行う;


    // Ver.1.3  1999/10/19  (C) Mikio TOBITA 飛田幹男，国土地理院
    // 緯度,経度を平面直角座標X,Y0に換算します。called by doCalcBl2xy,doCalcBl2xyFile
    // 「精密測地網一次基準点測量計算式」を導入し多くの項を採用。
    //入力
    //  B,L   : 求点の緯度、経度(radian)
    //  B1,L1 : 座標系原点の緯度、経度(radian)
    //'  M0    : 基準子午線の縮尺係数 ex.0.9999(X,Y0), 0.9996(UTM)
    //  EP    : 楕円体のパラメータ入り構造体
    //'出力
    //'  X     : 平面直角座標値，原点での北向き成分(meter)
    //'  Y0     : 平面直角座標値，原点での東向き成分(meter)
    //'  Gamma : 子午線収差角(radian),これのマイナスが真北方向角
    //'  MMM   : 縮尺係数


    var dL, DL2, DL4, DL6
    var AEE, CEE, Ep2
    var AJ, BJ, CJ, DJ, EJ
    var FJ, GJ, HJ, IJ
    var S0 //  '赤道から座標系原点までの子午線長の計算
    var S //      '赤道から求点までの子午線長の計算
    var COS2
    var Eta2phi, Mphi, Nphi //  'phi(=B)の関数
    var T, T2, T4, T6
    var e2, e4, e6, e8, e10
    var e12, e14, e16

    dL = L - L1    //'Δλ

    var EPsa = EP2a;
    var EPsf1 = EP2f1;
    var EPsf = EP2f;
    var EPse = EP2e;
    var EPsnamec = EP2namec;

    e2 = EPse;
    e4 = e2 * e2;
    e6 = e4 * e2;
    e8 = e4 * e4;
    e10 = e8 * e2;
    e12 = e8 * e4;
    e14 = e8 * e6;
    e16 = e8 * e8;






    //'定数項
    AEE = EPsa * (1 - EPse);     //'a(1-e2)
    CEE = EPsa / Math.sqrt(1 - EPse);  //'C=a*sqr(1+e'2)=a/sqr(1-e2)
    Ep2 = EPse / (1 - EPse);      //'e'2 (e prime 2) Eta2phiを計算するため

    //'「緯度を与えて赤道からの子午線弧長を求める計算」のための９つの係数を求める。
    //'「精密測地網一次基準点測量計算式」P55,P56より。係数チェック済み1999/10/19。
    AJ = 4927697775 / 7516192768 * e16;
    AJ = AJ + 19324305 / 29360128 * e14;
    AJ = AJ + 693693 / 1048576 * e12;
    AJ = AJ + 43659 / 65536 * e10;
    AJ = AJ + 11025 / 16384 * e8;
    AJ = AJ + 175 / 256 * e6;
    AJ = AJ + 45 / 64 * e4;
    AJ = AJ + 3 / 4 * e2;
    AJ = AJ + 1;
    BJ = 547521975 / 469762048 * e16;
    BJ = BJ + 135270135 / 117440512 * e14;
    BJ = BJ + 297297 / 262144 * e12;
    BJ = BJ + 72765 / 65536 * e10;
    BJ = BJ + 2205 / 2048 * e8;
    BJ = BJ + 525 / 512 * e6;
    BJ = BJ + 15 / 16 * e4;
    BJ = BJ + 3 / 4 * e2;
    CJ = 766530765 / 939524096 * e16;

    CJ = CJ + 45090045 / 58720256 * e14;
    CJ = CJ + 1486485 / 2097152 * e12;
    CJ = CJ + 10395 / 16384 * e10;
    CJ = CJ + 2205 / 4096 * e8;
    CJ = CJ + 105 / 256 * e6;
    CJ = CJ + 15 / 64 * e4;
    DJ = 209053845 / 469762048 * e16;
    DJ = DJ + 45090045 / 117440512 * e14;
    DJ = DJ + 165165 / 524288 * e12;
    DJ = DJ + 31185 / 131072 * e10;
    DJ = DJ + 315 / 2048 * e8;
    DJ = DJ + 35 / 512 * e6;
    EJ = 348423075 / 1879048192 * e16;
    EJ = EJ + 4099095 / 29360128 * e14;
    EJ = EJ + 99099 / 1048576 * e12;
    EJ = EJ + 3465 / 65536 * e10;
    EJ = EJ + 315 / 16384 * e8;
    FJ = 26801775 / 469762048 * e16;
    FJ = FJ + 4099095 / 117440512 * e14;
    FJ = FJ + 9009 / 524288 * e12;
    FJ = FJ + 693 / 131072 * e10;
    GJ = 11486475 / 939524096 * e16;
    GJ = GJ + 315315 / 58720256 * e14;
    GJ = GJ + 3003 / 2097152 * e12;
    HJ = 765765 / 469762048 * e16;
    HJ = HJ + 45045 / 117440512 * e14;
    IJ = 765765 / 7516192768 * e16;

    //'赤道から座標系原点までの子午線長S0の計算
    SS = MeridS(B1, AEE, AJ, BJ, CJ, DJ, EJ, FJ, GJ, HJ, IJ);
    S0 = SS;




    //'何度も使う式を変数に代入
    T = Math.tan(B);
    T2 = T * T;
    T4 = T2 * T2;
    T6 = T4 * T2;
    COS2 = Math.cos(B) * Math.cos(B);
    Eta2phi = Ep2 * COS2;                // '=η1*η1
    Mphi = CEE / Math.sqrt(Math.pow((1 + Eta2phi), 3));//'「精密測地網一次基準点測量計算式」P52のM(phi)
    Nphi = CEE / Math.sqrt(1 + Eta2phi); //      '「精密測地網一次基準点測量計算式」P52のN(phi)
    DL2 = dL * dL;
    DL4 = DL2 * DL2;
    DL6 = DL4 * DL2;

    //'赤道から求点までの子午線長Sの計算
    SS = MeridS(B, AEE, AJ, BJ, CJ, DJ, EJ, FJ, GJ, HJ, IJ);
    S = SS;

    // 'Ｘ，Ｙの計算 in meter                                   
    //'「精密測地網一次基準点測量計算式」P52,53のx,yを求める式より
    X = -(-1385 + 3111 * T2 - 543 * T4 + T6) * DL6 * Math.pow(COS2, 3) / 40320;
    X = X - (-61 + 58 * T2 - T4 - 270 * Eta2phi + 330 * T2 * Eta2phi) * DL4 * Math.pow(COS2, 2) / 720;
    X = X + (5 - T2 + 9 * Eta2phi + 4 * Eta2phi * Eta2phi) * DL2 * COS2 / 24;
    X = X + 1 / 2;
    X = X * Nphi * COS2 * T * DL2;
    X = X + S - S0;
    Xout = X * M0;

    Y0 = -(-61 + 479 * T2 - 179 * T4 + T6) * DL6 * Math.pow(COS2, 3) / 5040;
    Y0 = Y0 - (-5 + 18 * T2 - T4 - 14 * Eta2phi + 58 * T2 * Eta2phi) * DL4 * Math.pow(COS2, 2) / 120;
    Y0 = Y0 - (-1 + T2 - Eta2phi) * DL2 * COS2 / 6;
    Y0 = Y0 + 1;
    Y0 = Y0 * Nphi * Math.cos(B) * dL;
    Yout = Y0 * M0;

    //'子午線収差角　これのマイナスが真北方向角(rad)
    //'「精密測地網一次基準点測量計算式」P53のγを求める式より
    Gamma = COS2 * COS2 * (2 - T2) * Math.pow(dL, 4) / 15;
    Gamma = Gamma + COS2 * (1 + 3 * Eta2phi + 2 * Math.pow(Eta2phi, 2)) * Math.pow(dL, 2) / 3;
    Gamma = Gamma + 1;
    Gamma = Gamma * Math.cos(B) * T * dL;

    //'縮尺係数の計算 「精密測地網一次基準点測量計算式」P51のmを求める式より
    MMM = Math.pow(Y0, 4) / (24 * Mphi * Mphi * Nphi * Nphi * Math.pow(M0, 4));
    MMM = MMM + Y0 * Y0 / (2 * Mphi * Nphi * Math.pow(M0, 2));
    MMM = MMM + 1;
    MMM = MMM * M0;



    //'Ｘ，Ｙの計算 in meter


    // '子午線収差角Gamma(rad)から，真北方向角(degree)へ
    Gammadeg = -(Gamma * rad2deg);

    return Xout, Yout;

};



function MeridS(Phi, AEE, AJ, BJ, CJ, DJ, EJ, FJ, GJ, HJ, IJ) {
    //' Ver.1.3  1999/10/19  (C) Mikio TOBITA 飛田幹男，国土地理院
    //' 赤道から緯度Phiまでの子午線弧長を計算します。
    //'「精密測地網一次基準点測量計算式」P55より
    var SS = IJ / 16 * Math.sin(16 * Phi);
    SS = SS - HJ / 14 * Math.sin(14 * Phi);
    SS = SS + GJ / 12 * Math.sin(12 * Phi);
    SS = SS - FJ / 10 * Math.sin(10 * Phi);
    SS = SS + EJ / 8 * Math.sin(8 * Phi);
    SS = SS - DJ / 6 * Math.sin(6 * Phi);
    SS = SS + CJ / 4 * Math.sin(4 * Phi);
    SS = SS - BJ / 2 * Math.sin(2 * Phi);
    SS = SS + AJ * Phi;
    SS = AEE * SS;
    return SS;
};
function dms2deg(DMS) {
    //' Ver.2.4  1998/8/3  (C) Mikio TOBITA 飛田幹男，国土地理院
    //' DMS(DDDMMSS.SSS)をdegreeにする。
    //' 入力　DMS   : 緯度,経度 ±DDDMMSS.SSSSSSSSSS
    //' 出力　SN    : 符号　" ","-"
    //'        D    : DDD
    //'       AM    : MM
    //'        S    : SS.SSSSSSSSSSSSS
    //'       deg   : Degree
    var DMStemp, AMS;
    SN = Math.abs(DMS) / DMS;

    //' N88BASICの場合,小さな数を足さないと、1000.つまり10'を入力したとき、9'99.99"
    //' が入力されたと解釈されてしまい、40秒のずれが生じてしまう。
    //' Quick BASICとVisual Basicでは大丈夫。以上，1991,1992年
    //' しかし、1992/9/29の調査によると，QBでも、90100.を入力すると、分の計算で，
    //' 0.010と解釈してほしいところ，0.00999999999...と解釈されることから，
    //' 以下のように、小さい数を加える。このこれより大きくても小さくてもなかなか
    //' うまくいかい。この問題は，100.の場合は起こらない。　飛田幹男 >>Ver.2.1
    //' また，7/18/1993 TRN93作成時に、334000. を入力するとだめ。そこで、Ver.2.2.
    DMStemp = Math.abs(DMS / 10000) + 0.0000000000001;
    D = Math.floor(DMStemp);
    AMS = (DMStemp - D) * 100;
    AM = Math.floor(AMS);
    S = (AMS - AM) * 100;
    var deg = (D + (AM + S / 60) / 60) * SN;
    return deg;
};

//計算結果確認用
function deg2dms(deg) {
    //' Ver.1.4  1999/6/18 (C) Mikio TOBITA 飛田幹男，国土地理院
    //' degreeをDMS(DDDMMSS.SSS)にする。
    //' このサブプログラムは，秒の小数点以下「５桁」の場合に「60.00000」秒にならないようになっている。
    // deg(度)を符号SNSとD,AM,Sにする。
    //' 入力　deg   : 緯度、経度(arcsec)
    //' 出力　SNS   : 符号　" ","-"
    //'        D    : DDD
    //       AM    : MM
    //'        S    : SS.SSSSSSSSSSSSS
    var SNN = Math.abs(deg) / deg;
    if (SNN < 0) {
        var SNS = "-";
    } else {
        var SNS = " ";
    };
    var adeg = Math.abs(deg) + 0.00000000001;
    var D = Math.floor(adeg);
    var AMS = (adeg - D) * 60;
    var AM = Math.floor(AMS);
    var S = (AMS - AM) * 60;

    //alert( D + "-" + AM + "-" +  S)
};