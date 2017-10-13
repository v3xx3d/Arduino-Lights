"use strict";

var pixel = require("node-pixel");
var five = require("johnny-five");
var express = require("express");
var app = express();
var port = 4099;

var board = new five.Board();
var strip = null;

var animation = null;
var fps = 10;

board.on("ready", function() {

    strip = new pixel.Strip({
        board: this,
        controller: "FIRMATA",
        strips: [ {pin: 6, length: 50, color_order: 1}, ], // this is preferred form for definition
        gamma: 2.8
    });

    strip.on("ready", function() {
        console.log("Strip ready, let's go");
        // icicle();
        strip.off();
        // raindropFade();
        icicle();
    });

});

app.use('/', express.static(__dirname));

app.get('/solid/:color', function(req,res){
    clearInterval(animation);

    var color = getColor(req.params.color);
    console.log(color);

    strip.color( color );
    strip.show();

    res.send({ status: 'ok' });
});

app.get('/solid/:color/pixel/:num', function(req,res){
    clearInterval(animation);

    var color = getColor(req.params.color);
    console.log(color);

    if( req.params.num === "even" ){
        for( var i = 0; i < strip.length; i = i+2 ){
            strip.pixel( i ).color( color );
        }
    } else if( req.params.num == "odd" ){
        for( var i = 1; i < strip.length; i = i+2 ){
            strip.pixel( i ).color( color );
        }
    } else {
        strip.pixel( req.params.num ).color( color );
    }


    strip.show();
    res.send({ status: 'ok' });
});

app.listen(port, function () {
    console.log('Example app listening on port ' + port + '!')
})

function getColor(c){
    var color = c;

    if( c.indexOf('-') !== -1 ){
        var split = color.split('-');
        var r = split[0];
        var g = split[1];
        var b = split[2];

        color = 'rgb(' + r + ',' + g + ',' + b +')';
    } else {
        color = '#' + color;
    }

    return color;
}

function adjustLed(n){
    var count = strip.length;

    if( n < 0 ){
        n = count + n;
    }

    return n;
}

function raindropFade(color){
    var c = { r: 0, g: 205, b: 196 };
    var tracker = [];
    var inc = 20;

    for( var i = 0; i < strip.length; i++ ){
        var rand_s = Math.floor(Math.random() * inc) + 1;
        var rand_a = Math.round(Math.random()) === 0 ? true : false;

        tracker.push({ r: c.r, g: c.g, b: c.b, asc: true, step: rand_s });
    }

    setInterval( function(){
        for( var j = 0; j < strip.length; j++ ){
            var step = tracker[j].step;

            var rv = tracker[j].r = c.r - Math.floor((c.r/(inc)) * step);
            var gv = tracker[j].g = c.g - Math.floor((c.g/(inc)) * step);
            var bv = tracker[j].b = c.b - Math.floor((c.b/(inc)) * step);

            if( j == 1 ){
                console.log(rv + ',' + gv + ',' + bv);
            }

            strip.pixel(j).color([rv,gv,bv]);

            if( step === inc ){
                tracker[j].asc = false;
                tracker[j].step--;
            } else if ( step === 0 ){
                tracker[j].asc = true;
                tracker[j].step++;
            } else if( tracker[j].asc == true ){
                tracker[j].step++;
            } else {
                tracker[j].step--;
            }
        }
        strip.show();
    }, 1000/fps);

    console.log(strip.pixel(3).color());

}

function icicle(length){
    var lead = 0;
    var length = length || 20;

    animation = setInterval(function(){
        strip.pixel(lead).color('rgb(0,0,255)');
        for( var i = 1; i <= length; i++ ){
            var c = 255 - Math.floor((255/(length-1)) * i);
            strip.pixel(adjustLed(lead-i)).color('rgb(0,0,' + c + ')');
        }
        strip.pixel(adjustLed(lead-(length+1))).color('rgb(0,0,0)');
        strip.show();
        lead++;
        if( lead === strip.length-1 ){
            lead = 0;
        }
    }, 1000/fps);
}
